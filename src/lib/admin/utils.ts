/**
 * Admin API Utilities
 * Funciones utilitarias para el panel de administración
 */

import { AuthorizationEngine, AuthContext } from '@/lib/authorization/engine';
import { type YamlPolicyStructure, type PolicyValidationError, type ParsedPolicyRules } from '@/types/admin';
import yaml from 'js-yaml';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ===== SECURITY UTILITIES =====

/**
 * Verifica que el usuario es SuperAdmin
 */
export function requireSuperAdmin(authContext: AuthContext): void {
  if (authContext.role !== 'SuperAdmin') {
    throw new Error('FORBIDDEN: SuperAdmin role required');
  }
}

/**
 * Genera token temporal para operaciones elevadas
 */
export function generateElevatedToken(userId: string): string {
  const payload = {
    userId,
    elevated: true,
    exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutos
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    algorithm: 'HS256'
  });
}

/**
 * Verifica token temporal elevado
 */
export function verifyElevatedToken(token: string): { userId: string } {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (!payload.elevated) {
      throw new Error('Token is not elevated');
    }
    
    return { userId: payload.userId };
  } catch (error) {
    throw new Error('Invalid or expired elevated token');
  }
}

/**
 * Valida contraseña para re-autenticación
 */
export async function validateReauth(userId: string, password: string): Promise<boolean> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user?.password) {
      return false;
    }

    return await bcrypt.compare(password, user.password);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Protección anti-lockout: Verifica que no se está bloqueando el último SuperAdmin
 */
export async function preventSuperAdminLockout(
  targetUserId: string, 
  newRole?: string, 
  newIsActive?: boolean
): Promise<void> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Contar SuperAdmins activos
    const activeSuperAdmins = await prisma.user.count({
      where: {
        role: 'SuperAdmin',
        isActive: true,
        id: { not: targetUserId } // Excluir el usuario que se está modificando
      }
    });

    // Si es el último SuperAdmin y se va a desactivar o cambiar rol
    if (activeSuperAdmins === 0) {
      if (newIsActive === false) {
        throw new Error('LOCKOUT_PREVENTION: Cannot deactivate the last SuperAdmin');
      }
      if (newRole && newRole !== 'SuperAdmin') {
        throw new Error('LOCKOUT_PREVENTION: Cannot change role of the last SuperAdmin');
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

// ===== YAML POLICY VALIDATION =====

/**
 * Valida estructura YAML de policies
 */
export function validatePolicyYaml(yamlContent: string): {
  isValid: boolean;
  errors: PolicyValidationError[];
  warnings: string[];
  parsed?: YamlPolicyStructure;
  parsedRules?: ParsedPolicyRules;
} {
  const errors: PolicyValidationError[] = [];
  const warnings: string[] = [];

  try {
    // Parse YAML
    const parsed = yaml.load(yamlContent) as YamlPolicyStructure;

    if (!parsed || typeof parsed !== 'object') {
      errors.push({
        field: 'root',
        message: 'Invalid YAML structure'
      });
      return { isValid: false, errors, warnings };
    }

    // Validar estructura básica
    if (!parsed.version) {
      errors.push({
        field: 'version',
        message: 'Version field is required'
      });
    }

    if (!parsed.metadata?.name) {
      errors.push({
        field: 'metadata.name',
        message: 'Metadata name is required'
      });
    }

    if (!Array.isArray(parsed.roles)) {
      errors.push({
        field: 'roles',
        message: 'Roles must be an array'
      });
    } else {
      // Validar roles
      const systemRoles = ['SuperAdmin', 'Propietario', 'Gestor', 'Vendedor', 'GerenteBanquetes', 'Planner'];
      const definedRoles = parsed.roles.map(r => r.name);
      
      for (const systemRole of systemRoles) {
        if (!definedRoles.includes(systemRole)) {
          errors.push({
            field: 'roles',
            message: `System role '${systemRole}' must be defined`
          });
        }
      }

      // Validar herencia circular
      for (const role of parsed.roles) {
        if (role.inherits?.includes(role.name)) {
          errors.push({
            field: `roles.${role.name}`,
            message: 'Role cannot inherit from itself'
          });
        }
      }
    }

    if (!Array.isArray(parsed.entities)) {
      errors.push({
        field: 'entities',
        message: 'Entities must be an array'
      });
    } else {
      const validEntities = ['Client', 'Wedding', 'Vendor', 'Task', 'Document', 'Payment', 'Comment', 'User', 'Team', 'Venue', 'AuditLog'];
      for (const entity of parsed.entities) {
        if (!validEntities.includes(entity)) {
          warnings.push(`Entity '${entity}' is not a standard entity`);
        }
      }
    }

    if (!Array.isArray(parsed.actions)) {
      errors.push({
        field: 'actions',
        message: 'Actions must be an array'
      });
    }

    if (!Array.isArray(parsed.scopes)) {
      errors.push({
        field: 'scopes',
        message: 'Scopes must be an array'
      });
    }

    if (!Array.isArray(parsed.rules)) {
      errors.push({
        field: 'rules',
        message: 'Rules must be an array'
      });
    } else {
      // Validar reglas
      for (let i = 0; i < parsed.rules.length; i++) {
        const rule = parsed.rules[i];
        if (!rule.entity || !rule.action) {
          errors.push({
            field: `rules[${i}]`,
            message: 'Rule must have entity and action'
          });
        }
      }
    }

    if (!Array.isArray(parsed.fieldRules)) {
      errors.push({
        field: 'fieldRules',
        message: 'Field rules must be an array'
      });
    } else {
      // Validar field rules
      for (let i = 0; i < parsed.fieldRules.length; i++) {
        const rule = parsed.fieldRules[i];
        if (!rule.entity || !rule.field || !rule.modes) {
          errors.push({
            field: `fieldRules[${i}]`,
            message: 'Field rule must have entity, field, and modes'
          });
        }
      }
    }

    // Generar estadísticas si es válido
    let parsedRules: ParsedPolicyRules | undefined;
    if (errors.length === 0) {
      parsedRules = {
        roles: parsed.roles?.length || 0,
        entities: parsed.entities?.length || 0,
        actions: parsed.actions?.length || 0,
        scopes: parsed.scopes?.length || 0,
        fieldRules: parsed.fieldRules?.length || 0,
        policyRules: parsed.rules?.length || 0
      };
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      parsed: errors.length === 0 ? parsed : undefined,
      parsedRules
    };

  } catch (error) {
    errors.push({
      field: 'yaml',
      message: `YAML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });

    return { isValid: false, errors, warnings };
  }
}

/**
 * Genera YAML de política por defecto
 */
export function generateDefaultPolicyYaml(): string {
  const defaultPolicy: YamlPolicyStructure = {
    version: '1.0.0',
    metadata: {
      name: 'Default CRM Authorization Policy',
      description: 'Default authorization rules for wedding CRM system',
      author: 'System'
    },
    roles: [
      {
        name: 'SuperAdmin',
        description: 'System administrator with full access'
      },
      {
        name: 'Propietario',
        description: 'Business owner with venue-wide access'
      },
      {
        name: 'Gestor',
        description: 'Venue manager with team oversight',
        inherits: ['Vendedor']
      },
      {
        name: 'Vendedor',
        description: 'Sales person with client management'
      },
      {
        name: 'GerenteBanquetes',
        description: 'Banquet manager with wedding execution access'
      },
      {
        name: 'Planner',
        description: 'Wedding planner with task coordination'
      }
    ],
    entities: [
      'Client', 'Wedding', 'Vendor', 'Task', 'Document', 
      'Payment', 'Comment', 'User', 'Team', 'Venue', 'AuditLog'
    ],
    actions: [
      'create', 'read', 'update', 'delete', 'export', 
      'import', 'assign', 'view_sensitive'
    ],
    scopes: [
      'global', 'venue', 'team', 'own', 'assigned', 
      'client_assigned', 'wedding_assigned'
    ],
    rules: [
      {
        entity: 'Client',
        action: 'read',
        roles: { allow: ['SuperAdmin', 'Propietario', 'Gestor', 'Vendedor'] },
        scopes: ['venue', 'assigned']
      },
      {
        entity: 'Wedding',
        action: 'update',
        roles: { allow: ['SuperAdmin', 'Propietario', 'Gestor'] },
        scopes: ['venue']
      },
      {
        entity: 'User',
        action: 'create',
        roles: { allow: ['SuperAdmin', 'Propietario'] },
        scopes: ['venue']
      }
    ],
    fieldRules: [
      {
        entity: 'Client',
        field: 'email',
        modes: {
          SuperAdmin: 'edit',
          Propietario: 'edit',
          Gestor: 'edit',
          Vendedor: 'read',
          GerenteBanquetes: 'read',
          Planner: 'read'
        }
      },
      {
        entity: 'Payment',
        field: 'amount',
        modes: {
          SuperAdmin: 'edit',
          Propietario: 'read',
          Gestor: 'read',
          Vendedor: 'hidden',
          GerenteBanquetes: 'hidden',
          Planner: 'hidden'
        }
      }
    ]
  };

  return yaml.dump(defaultPolicy, {
    indent: 2,
    lineWidth: 120,
    noRefs: true
  });
}

// ===== DRY RUN UTILITIES =====

/**
 * Ejecuta dry run de autorización
 */
export async function executeDryRun(
  engine: AuthorizationEngine,
  request: {
    userId?: string;
    role?: string;
    action: string;
    entity: string;
    recordId?: string;
    field?: string;
    mockData?: Record<string, any>;
  }
): Promise<{
  result: 'allow' | 'deny' | 'read' | 'hidden' | 'mask';
  reason: string;
  trace: Array<{
    step: string;
    description: string;
    result: boolean;
    details?: Record<string, any>;
    timestamp: number;
  }>;
  fieldMode?: string;
  maskedValue?: any;
}> {
  const trace: Array<{
    step: string;
    description: string;
    result: boolean;
    details?: Record<string, any>;
    timestamp: number;
  }> = [];

  try {
    // Crear contexto mock
    const authContext = {
      userId: request.userId || 'dry-run-user',
      role: request.role || 'Vendedor',
      venueId: 'dry-run-venue',
      teamId: 'dry-run-team'
    };

    trace.push({
      step: 'context',
      description: 'Creating authorization context',
      result: true,
      details: authContext,
      timestamp: Date.now()
    });

    if (request.field) {
      // Test field access
      const fieldResult = await engine.checkFieldAccess(
        authContext,
        request.entity,
        request.field,
        request.mockData
      );

      trace.push({
        step: 'field_check',
        description: `Checking field access for ${request.entity}.${request.field}`,
        result: fieldResult.mode !== 'hidden',
        details: { mode: fieldResult.mode, value: fieldResult.value },
        timestamp: Date.now()
      });

      return {
        result: fieldResult.mode as any,
        reason: `Field ${request.field} access mode: ${fieldResult.mode}`,
        trace,
        fieldMode: fieldResult.mode,
        maskedValue: fieldResult.value
      };
    } else {
      // Test action access
      const actionResult = await engine.checkAccess(
        authContext,
        request.action,
        request.entity,
        request.mockData
      );

      trace.push({
        step: 'action_check',
        description: `Checking action access for ${request.action} on ${request.entity}`,
        result: actionResult.allowed,
        details: { 
          allowed: actionResult.allowed, 
          reason: actionResult.reason,
          scope: actionResult.scope 
        },
        timestamp: Date.now()
      });

      return {
        result: actionResult.allowed ? 'allow' : 'deny',
        reason: actionResult.reason,
        trace
      };
    }

  } catch (error) {
    trace.push({
      step: 'error',
      description: 'Error during dry run execution',
      result: false,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      timestamp: Date.now()
    });

    return {
      result: 'deny',
      reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      trace
    };
  }
}

// ===== PAGINATION UTILITIES =====

/**
 * Calcula offset para paginación
 */
export function calculateOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * Genera metadatos de paginación
 */
export function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number
) {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

// ===== AUDIT LOG UTILITIES =====

/**
 * Crea entrada de audit log para operaciones admin
 */
export async function createAdminAuditLog(
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: {
    diffBefore?: Record<string, any>;
    diffAfter?: Record<string, any>;
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
  }
): Promise<void> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        entity,
        entityId,
        action,
        allowed: true, // Admin actions are always allowed
        reason: `Admin action: ${action}`,
        diffBefore: details?.diffBefore,
        diffAfter: details?.diffAfter,
        ip: details?.ip,
        userAgent: details?.userAgent,
        endpoint: details?.endpoint,
        method: details?.method
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

// ===== ERROR HANDLING =====

export class AdminApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

export function handleAdminError(error: unknown): {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, any>;
} {
  if (error instanceof AdminApiError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'INTERNAL_ERROR',
      statusCode: 500
    };
  }

  return {
    message: 'Unknown error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  };
}