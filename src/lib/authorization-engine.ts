/**
 * Authorization Engine
 * Núcleo del sistema de autorización RBAC/ABAC
 */

import { PrismaClient } from '@prisma/client';
import {
  SystemRole,
  EntityName,
  ActionType,
  ScopeType,
  AuthContext,
  AuthRequest,
  AuthResult,
  QueryFilter,
  PolicyRule,
  FieldRule,
  FieldMode,
  PolicyAttributes,
  UserWithAuth,
  AuditLogEntry,
  AuthorizationError,
  InsufficientPermissionsError,
  FieldAccessDeniedError,
  ScopeViolationError,
  ROLE_HIERARCHY
} from '@/types/authorization';

export class AuthorizationEngine {
  private prisma: PrismaClient;
  private policyCache: Map<string, PolicyRule[]> = new Map();
  private fieldRuleCache: Map<string, FieldRule[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // ===== MAIN AUTHORIZATION METHODS =====

  /**
   * Check if user can perform action on entity
   */
  async can(request: AuthRequest): Promise<AuthResult> {
    try {
      const { entity, action, resource, context } = request;
      const { user } = context;

      // Log the authorization attempt
      await this.logAccess(request, true, 'checking_authorization');

      // Get applicable policy rules
      const rules = await this.getPolicyRules(entity, action);
      
      if (rules.length === 0) {
        const result = { allowed: false, reason: 'no_policy_found' };
        await this.logAccess(request, false, result.reason);
        return result;
      }

      // Check each rule
      for (const rule of rules) {
        const ruleResult = await this.evaluateRule(rule, resource, user);
        
        if (ruleResult.allowed) {
          // If any rule allows, grant access
          await this.logAccess(request, true, 'policy_granted');
          return { allowed: true };
        }
      }

      // If no rule allows, deny access
      const result = { allowed: false, reason: 'policy_denied' };
      await this.logAccess(request, false, result.reason);
      return result;

    } catch (error) {
      console.error('Authorization check failed:', error);
      const result = { allowed: false, reason: 'authorization_error' };
      await this.logAccess(request, false, result.reason);
      return result;
    }
  }

  /**
   * Get field access mode for user role
   */
  async getFieldMode(entity: EntityName, field: string, userRole: SystemRole): Promise<FieldMode> {
    try {
      const fieldRules = await this.getFieldRules(entity, field);
      
      // Find rule that applies to this entity/field
      const rule = fieldRules.find(r => r.entity === entity && r.field === field);
      
      if (!rule) {
        // Default to 'edit' if no specific rule found
        return 'edit';
      }

      return rule.modes[userRole] || 'hidden';
    } catch (error) {
      console.error('Field mode check failed:', error);
      return 'hidden'; // Fail safe
    }
  }

  /**
   * Filter query based on user's scope permissions
   */
  async filterQuery(entity: EntityName, action: ActionType, baseQuery: any, user: UserWithAuth): Promise<QueryFilter> {
    try {
      const rules = await this.getPolicyRules(entity, action);
      
      if (rules.length === 0) {
        // No rules = no access
        return { where: { id: null } }; // Impossible condition
      }

      // Combine scope conditions with OR logic
      const scopeConditions: any[] = [];

      for (const rule of rules) {
        // Check if role is explicitly allowed
        if (rule.rolesAllow?.includes(user.role.name)) {
          // Full access for this rule
          return { where: baseQuery.where || {} };
        }

        // Check if role is explicitly denied
        if (rule.rolesDeny?.includes(user.role.name)) {
          continue; // Skip this rule
        }

        // Build scope conditions
        for (const scope of rule.scopes) {
          const condition = this.buildScopeCondition(scope, user, entity);
          if (condition) {
            scopeConditions.push(condition);
          }
        }
      }

      if (scopeConditions.length === 0) {
        return { where: { id: null } }; // No valid scopes
      }

      // Combine with base query
      const finalWhere = {
        ...baseQuery.where,
        OR: scopeConditions
      };

      return { where: finalWhere };

    } catch (error) {
      console.error('Query filtering failed:', error);
      return { where: { id: null } }; // Fail safe
    }
  }

  /**
   * Mask sensitive fields from payload
   */
  async maskPayload(entity: EntityName, payload: any, userRole: SystemRole): Promise<any> {
    try {
      const fieldRules = await this.getFieldRules(entity);
      const maskedPayload = { ...payload };

      for (const rule of fieldRules) {
        const mode = rule.modes[userRole];
        
        if (mode === 'hidden') {
          delete maskedPayload[rule.field];
        } else if (mode === 'mask') {
          maskedPayload[rule.field] = this.maskFieldValue(maskedPayload[rule.field], rule.field);
        }
      }

      return maskedPayload;
    } catch (error) {
      console.error('Payload masking failed:', error);
      return {}; // Fail safe
    }
  }

  // ===== POLICY RULE EVALUATION =====

  private async evaluateRule(rule: PolicyRule, resource: any, user: UserWithAuth): Promise<AuthResult> {
    // Check explicit role allows
    if (rule.rolesAllow?.includes(user.role.name)) {
      return { allowed: true, reason: 'role_explicitly_allowed' };
    }

    // Check explicit role denies
    if (rule.rolesDeny?.includes(user.role.name)) {
      return { allowed: false, reason: 'role_explicitly_denied' };
    }

    // Check scope permissions
    for (const scope of rule.scopes) {
      if (await this.checkScope(scope, resource, user)) {
        // Check ABAC attributes if any
        if (rule.attributes) {
          const attributeMatch = await this.checkAttributes(rule.attributes, resource, user);
          if (!attributeMatch) {
            continue; // Try next scope
          }
        }
        
        return { allowed: true, reason: `scope_granted_${scope}` };
      }
    }

    return { allowed: false, reason: 'scope_denied' };
  }

  private async checkScope(scope: ScopeType, resource: any, user: UserWithAuth): Promise<boolean> {
    switch (scope) {
      case 'global':
        // SuperAdmin and Propietario have global access
        return ['SuperAdmin', 'Propietario'].includes(user.role.name);

      case 'venue':
        // Access to records in same venue
        return !!(user.venueId && resource?.venueId === user.venueId);

      case 'team':
        // Access to records in same team
        return !!(user.teamId && resource?.teamId === user.teamId);

      case 'own':
        // Access to records owned by user
        return resource?.ownerId === user.id;

      case 'assigned':
        // Access to records assigned to user (generic)
        return resource?.assignedTo === user.id;

      case 'client_assigned':
        // Access to clients assigned as sales executive
        return resource?.salesExecId === user.id;

      case 'wedding_assigned':
        // Access to weddings assigned as coordinator or planner
        return resource?.coordinatorId === user.id || resource?.plannerId === user.id;

      default:
        return false;
    }
  }

  private async checkAttributes(attributes: PolicyAttributes, resource: any, user: UserWithAuth): Promise<boolean> {
    try {
      // Client status check
      if (attributes.clientStatus && resource?.status) {
        if (!attributes.clientStatus.includes(resource.status)) {
          return false;
        }
      }

      // Budget range checks
      if (attributes.weddingBudgetMin && resource?.budget) {
        if (resource.budget < attributes.weddingBudgetMin) {
          return false;
        }
      }

      if (attributes.weddingBudgetMax && resource?.budget) {
        if (resource.budget > attributes.weddingBudgetMax) {
          return false;
        }
      }

      // Time-based checks
      if (attributes.createdWithinDays && resource?.createdAt) {
        const daysDiff = (Date.now() - new Date(resource.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > attributes.createdWithinDays) {
          return false;
        }
      }

      // Dynamic attribute substitution
      if (attributes.venueId === '$CURRENT_VENUE') {
        if (resource?.venueId !== user.venueId) {
          return false;
        }
      }

      if (attributes.teamId === '$CURRENT_TEAM') {
        if (resource?.teamId !== user.teamId) {
          return false;
        }
      }

      if (attributes.ownerId === '$CURRENT_USER') {
        if (resource?.ownerId !== user.id) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Attribute check failed:', error);
      return false;
    }
  }

  // ===== SCOPE CONDITION BUILDERS =====

  private buildScopeCondition(scope: ScopeType, user: UserWithAuth, entity: EntityName): any {
    switch (scope) {
      case 'global':
        // No additional conditions needed for global access
        return {};

      case 'venue':
        return user.venueId ? { venueId: user.venueId } : null;

      case 'team':
        return user.teamId ? { teamId: user.teamId } : null;

      case 'own':
        return { ownerId: user.id };

      case 'assigned':
        return { assignedTo: user.id };

      case 'client_assigned':
        return entity === 'Client' ? { salesExecId: user.id } : null;

      case 'wedding_assigned':
        return entity === 'Wedding' ? {
          OR: [
            { coordinatorId: user.id },
            { plannerId: user.id }
          ]
        } : null;

      default:
        return null;
    }
  }

  // ===== CACHE MANAGEMENT =====

  private async getPolicyRules(entity: EntityName, action: ActionType): Promise<PolicyRule[]> {
    const cacheKey = `policy_${entity}_${action}`;
    
    // Check cache
    if (this.isCacheValid(cacheKey)) {
      return this.policyCache.get(cacheKey) || [];
    }

    // Fetch from database
    const activeVersion = await this.prisma.policyVersion.findFirst({
      where: { isActive: true },
      include: {
        rules: {
          where: {
            entity,
            action
          }
        }
      }
    });

    const rules = activeVersion?.rules || [];
    
    // Update cache
    this.policyCache.set(cacheKey, rules);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

    return rules;
  }

  private async getFieldRules(entity: EntityName, field?: string): Promise<FieldRule[]> {
    const cacheKey = `field_${entity}_${field || 'all'}`;
    
    // Check cache
    if (this.isCacheValid(cacheKey)) {
      return this.fieldRuleCache.get(cacheKey) || [];
    }

    // Fetch from database
    const activeVersion = await this.prisma.policyVersion.findFirst({
      where: { isActive: true },
      include: {
        fieldRules: {
          where: {
            entity,
            ...(field && { field })
          }
        }
      }
    });

    const rules = activeVersion?.fieldRules || [];
    
    // Update cache
    this.fieldRuleCache.set(cacheKey, rules);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

    return rules;
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  // ===== UTILITY METHODS =====

  private maskFieldValue(value: any, fieldName: string): any {
    if (!value) return value;

    switch (fieldName) {
      case 'email':
        return typeof value === 'string' ? value.replace(/(.{2}).*(@.*)/, '$1***$2') : value;
      
      case 'phone':
      case 'secondaryPhone':
        return typeof value === 'string' ? value.replace(/(.{3}).*(.{2})/, '$1***$2') : value;
      
      case 'budget':
        return typeof value === 'number' ? '***' : value;
      
      default:
        return '***';
    }
  }

  // ===== AUDIT LOGGING =====

  private async logAccess(request: AuthRequest, allowed: boolean, reason?: string): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: request.context.user.id,
          userEmail: request.context.user.email,
          userRole: request.context.user.role.name,
          entity: request.entity,
          entityId: request.resource?.id,
          action: request.action,
          allowed,
          reason,
          ip: request.context.ip,
          userAgent: request.context.userAgent,
          endpoint: request.context.endpoint,
          method: request.context.method
        }
      });
    } catch (error) {
      console.error('Failed to log access:', error);
      // Don't throw - logging failure shouldn't break authorization
    }
  }

  // ===== CACHE INVALIDATION =====

  public clearCache(): void {
    this.policyCache.clear();
    this.fieldRuleCache.clear();
    this.cacheExpiry.clear();
  }

  public clearPolicyCache(entity?: EntityName, action?: ActionType): void {
    if (entity && action) {
      const key = `policy_${entity}_${action}`;
      this.policyCache.delete(key);
      this.cacheExpiry.delete(key);
    } else {
      // Clear all policy cache
      for (const [key] of this.policyCache) {
        if (key.startsWith('policy_')) {
          this.policyCache.delete(key);
          this.cacheExpiry.delete(key);
        }
      }
    }
  }

  public clearFieldCache(entity?: EntityName): void {
    if (entity) {
      for (const [key] of this.fieldRuleCache) {
        if (key.startsWith(`field_${entity}_`)) {
          this.fieldRuleCache.delete(key);
          this.cacheExpiry.delete(key);
        }
      }
    } else {
      // Clear all field cache
      for (const [key] of this.fieldRuleCache) {
        if (key.startsWith('field_')) {
          this.fieldRuleCache.delete(key);
          this.cacheExpiry.delete(key);
        }
      }
    }
  }
}

// Export singleton instance
let authEngine: AuthorizationEngine | null = null;

export function getAuthorizationEngine(prisma: PrismaClient): AuthorizationEngine {
  if (!authEngine) {
    authEngine = new AuthorizationEngine(prisma);
  }
  return authEngine;
}