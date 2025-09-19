/**
 * Admin API Types
 * Tipos para el panel de administración SuperAdmin
 */

// ===== ADMIN USER MANAGEMENT =====

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: string;
  tempPassword?: string;
}

export interface PatchUserDto {
  name?: string;
  role?: string;
  isActive?: boolean;
}

export interface ResetPasswordResponse {
  token: string;
  expiresAt: string;
  message: string;
}

// ===== ADMIN ROLE MANAGEMENT =====

export interface AdminRole {
  id: string;
  name: string;
  description?: string;
  usersCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface PatchRoleDto {
  name?: string;
  description?: string;
}

// ===== POLICY MANAGEMENT =====

export interface PolicyVersion {
  id: string;
  label: string;
  isActive: boolean;
  rawYaml: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  description?: string;
}

export interface ValidatePolicyRequest {
  rawYaml: string;
}

export interface ValidatePolicyResponse {
  isValid: boolean;
  errors: PolicyValidationError[];
  warnings: string[];
  parsedRules?: ParsedPolicyRules;
}

export interface PolicyValidationError {
  field: string;
  message: string;
  line?: number;
  column?: number;
}

export interface ParsedPolicyRules {
  roles: string[];
  entities: string[];
  actions: string[];
  scopes: string[];
  fieldRules: number;
  policyRules: number;
}

export interface CreatePolicyVersionDto {
  label: string;
  rawYaml: string;
  description?: string;
}

export interface ActivatePolicyVersionDto {
  password: string; // Re-authentication required
}

export interface RollbackPolicyVersionDto {
  password: string; // Re-authentication required
  targetVersionId: string;
}

// ===== DRY RUN TESTING =====

export interface DryRunRequest {
  userId?: string;
  role?: string;
  action: string;
  entity: string;
  recordId?: string;
  field?: string;
  mockData?: Record<string, any>; // Mock resource data for testing
}

export interface DryRunResponse {
  result: 'allow' | 'deny' | 'read' | 'hidden' | 'mask';
  reason: string;
  trace: DryRunTraceStep[];
  fieldMode?: string;
  maskedValue?: any;
}

export interface DryRunTraceStep {
  step: string;
  description: string;
  result: boolean;
  details?: Record<string, any>;
  timestamp: number;
}

// ===== AUDIT LOG MANAGEMENT =====

export interface AdminAuditLog {
  id: string;
  userId?: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  userEmail?: string;
  userRole?: string;
  entity: string;
  entityType: string;
  entityId?: string;
  action: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message?: string;
  field?: string;
  allowed: boolean;
  reason?: string;
  diffBefore?: Record<string, any>;
  diffAfter?: Record<string, any>;
  ipAddress?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  endpoint?: string;
  method?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: string;
  entity?: string;
  action?: string;
  allowed?: boolean;
  from?: string; // ISO date
  to?: string; // ISO date
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface AuditLogResponse {
  logs: AdminAuditLog[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: AuditLogFilters;
}

export interface AuditLogStats {
  total: number;
  errors: number;
  warnings: number;
  activeUsers: number;
}

// ===== TYPE ALIASES FOR COMPONENTS =====

export type AuditLog = AdminAuditLog;
export type AuditLogFilter = AuditLogFilters;
export type DryRunResult = DryRunResponse;
export type User = AdminUser;
export type CRMEntity = any; // TODO: Define proper CRM entity types

// ===== AUTHENTICATION & SECURITY =====

export interface ReauthRequest {
  password: string;
}

export interface ReauthResponse {
  success: boolean;
  message: string;
  token?: string; // Temporary elevated token
}

// ===== API RESPONSES =====

export interface AdminApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface AdminApiError {
  success: false;
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, any>;
}

// ===== DASHBOARD STATS =====

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  roles: {
    total: number;
    system: number;
    custom: number;
  };
  policy: {
    activeVersion: string;
    totalVersions: number;
    lastModified: string;
  };
  audit: {
    todayEvents: number;
    deniedToday: number;
    riskEvents: number;
  };
}

// ===== YAML POLICY STRUCTURE =====

export interface YamlPolicyStructure {
  version: string;
  metadata: {
    name: string;
    description?: string;
    author?: string;
  };
  roles: YamlRole[];
  entities: string[];
  actions: string[];
  scopes: string[];
  rules: YamlPolicyRule[];
  fieldRules: YamlFieldRule[];
}

export interface YamlRole {
  name: string;
  description?: string;
  inherits?: string[];
}

export interface YamlPolicyRule {
  entity: string;
  action: string;
  roles: {
    allow?: string[];
    deny?: string[];
  };
  scopes: string[];
  conditions?: Record<string, any>;
}

export interface YamlFieldRule {
  entity: string;
  field: string;
  modes: Record<string, 'hidden' | 'read' | 'edit' | 'create' | 'mask'>;
}

// ===== FRONTEND STATE TYPES =====

export interface AdminSettingsState {
  currentUser: AdminUser | null;
  users: AdminUser[];
  roles: AdminRole[];
  policyVersions: PolicyVersion[];
  activePolicyVersion: PolicyVersion | null;
  auditLogs: AdminAuditLog[];
  dashboardStats: AdminDashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

export interface AdminUIState {
  activeTab: 'users' | 'roles' | 'policy' | 'versions' | 'dryrun' | 'audit';
  selectedUsers: string[];
  selectedLogs: string[];
  isReauthDialogOpen: boolean;
  pendingAction: (() => Promise<void>) | null;
  notifications: AdminNotification[];
}

export interface AdminNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  autoClose?: boolean;
}

// ===== PAGINATION =====

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== VALIDATION SCHEMAS (for runtime checking) =====

export const VALID_ENTITIES = [
  'Client', 'Wedding', 'Vendor', 'Task', 'Document', 'Payment', 'Comment', 
  'User', 'Team', 'Venue', 'AuditLog'
] as const;

export const VALID_ACTIONS = [
  'create', 'read', 'update', 'delete', 'export', 'import', 'assign', 'view_sensitive'
] as const;

export const VALID_SCOPES = [
  'global', 'venue', 'team', 'own', 'assigned', 'client_assigned', 'wedding_assigned'
] as const;

export const VALID_FIELD_MODES = [
  'hidden', 'read', 'edit', 'create', 'mask'
] as const;

export const SYSTEM_ROLES = [
  'SuperAdmin', 'Propietario', 'Gestor', 'Vendedor', 'GerenteBanquetes', 'Coordinador', 'Planner'
] as const;

// Type guards
export function isValidEntity(entity: string): entity is typeof VALID_ENTITIES[number] {
  return VALID_ENTITIES.includes(entity as any);
}

export function isValidAction(action: string): action is typeof VALID_ACTIONS[number] {
  return VALID_ACTIONS.includes(action as any);
}

export function isValidScope(scope: string): scope is typeof VALID_SCOPES[number] {
  return VALID_SCOPES.includes(scope as any);
}

export function isSystemRole(role: string): role is typeof SYSTEM_ROLES[number] {
  return SYSTEM_ROLES.includes(role as any);
}