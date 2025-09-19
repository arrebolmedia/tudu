/**
 * Core Authorization Types
 * Sistema de autorización RBAC/ABAC para CRM de bodas
 */

// ===== ROLE & USER TYPES =====

export type SystemRole = 
  | 'SuperAdmin'
  | 'Propietario'
  | 'Gestor'
  | 'Vendedor'
  | 'GerenteBanquetes'
  | 'Coordinador'
  | 'Planner';export interface UserWithAuth {
  id: string;
  email: string;
  name?: string;
  roleId: string;
  role: {
    name: SystemRole;
    description?: string;
  };
  teamId?: string;
  venueId?: string;
  isActive: boolean;
}

// ===== POLICY SYSTEM TYPES =====

export type EntityName = 
  | 'Client'
  | 'Wedding' 
  | 'Vendor'
  | 'Task'
  | 'Document'
  | 'Payment'
  | 'Comment'
  | 'AuditLog'
  | 'User'
  | 'Team'
  | 'Venue';

export type ActionType = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'assign'
  | 'view_sensitive';

export type ScopeType = 
  | 'global'          // Access to all records
  | 'venue'           // Records in same venue
  | 'team'            // Records in same team
  | 'own'             // Records owned by user
  | 'assigned'        // Records assigned to user
  | 'client_assigned' // Clients assigned as sales exec
  | 'wedding_assigned'; // Weddings assigned as coordinator/planner

export interface PolicyRule {
  id: string;
  versionId: string;
  entity: EntityName;
  action: ActionType;
  scopes: ScopeType[];
  rolesAllow?: SystemRole[];  // Override: these roles can always perform action
  rolesDeny?: SystemRole[];   // Explicit deny for these roles
  attributes?: PolicyAttributes; // ABAC conditions
}

export interface PolicyAttributes {
  // Client-specific conditions
  clientStatus?: string[];
  clientPriority?: string[];
  
  // Wedding-specific conditions  
  weddingStatus?: string[];
  weddingBudgetMin?: number;
  weddingBudgetMax?: number;
  
  // Task-specific conditions
  taskStatus?: string[];
  taskPriority?: string[];
  
  // Time-based conditions
  createdWithinDays?: number;
  updatedWithinDays?: number;
  
  // Business logic conditions
  venueId?: string | '$CURRENT_VENUE';
  teamId?: string | '$CURRENT_TEAM';
  ownerId?: string | '$CURRENT_USER';
  
  // Custom conditions (JSON path expressions)
  customConditions?: Record<string, any>;
}

// ===== FIELD-LEVEL AUTHORIZATION =====

export type FieldMode = 
  | 'hidden'    // Field is not visible
  | 'read'      // Read-only access
  | 'edit'      // Full edit access
  | 'create'    // Can set on create only
  | 'mask';     // Show masked/partial value

export interface FieldRule {
  id: string;
  versionId: string;
  entity: EntityName;
  field: string;
  modes: Record<SystemRole, FieldMode>; // Role-based field access
}

// Client field examples
export type ClientField = 
  | 'firstName' | 'lastName' | 'email' | 'phone' | 'secondaryPhone'
  | 'address' | 'city' | 'state' | 'country'
  | 'budget' | 'source' | 'notes' | 'priority' | 'status' | 'tags'
  | 'salesExecId' | 'ownerId' | 'teamId' | 'venueId'
  | 'createdAt' | 'updatedAt' | 'lastContactAt';

// Wedding field examples  
export type WeddingField = 
  | 'brideName' | 'groomName' | 'weddingDate' | 'venue' | 'guestCount'
  | 'budget' | 'theme' | 'notes' | 'status' | 'stage' | 'progress'
  | 'coordinatorId' | 'plannerId' | 'ownerId' | 'teamId' | 'venueId'
  | 'createdAt' | 'updatedAt';

// ===== AUTHORIZATION ENGINE TYPES =====

export interface AuthContext {
  user: UserWithAuth;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
}

export interface AuthRequest {
  entity: EntityName;
  action: ActionType;
  resource?: any; // The actual record being accessed
  context: AuthContext;
}

export interface AuthResult {
  allowed: boolean;
  reason?: string;
  maskedFields?: string[];
  hiddenFields?: string[];
}

export interface QueryFilter {
  where?: Record<string, any>;
  select?: Record<string, any>;
}

// ===== AUDIT LOG TYPES =====

export interface AuditLogEntry {
  id: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  entity: EntityName;
  entityId?: string;
  action: ActionType;
  field?: string;
  allowed: boolean;
  reason?: string;
  diffBefore?: any;
  diffAfter?: any;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  createdAt: Date;
}

export interface AuditQueryParams {
  userId?: string;
  entity?: EntityName;
  action?: ActionType;
  allowed?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// ===== AUTHORIZATION HOOK TYPES =====

export interface UseAuthorizationReturn {
  can: (action: ActionType, entity: EntityName, resource?: any) => Promise<boolean>;
  cannot: (action: ActionType, entity: EntityName, resource?: any) => Promise<boolean>;
  canAccess: (field: string, entity: EntityName, mode?: FieldMode) => boolean;
  getFieldMode: (field: string, entity: EntityName) => FieldMode;
  filterQuery: (entity: EntityName, baseQuery: any) => QueryFilter;
  maskPayload: (entity: EntityName, payload: any) => any;
  isLoading: boolean;
  error?: Error;
}

// ===== PERMISSION MATRIX TYPES =====

export interface PermissionMatrix {
  [entity: string]: {
    [action: string]: {
      [role: string]: {
        scopes: ScopeType[];
        allow?: boolean;
        deny?: boolean;
      };
    };
  };
}

// ===== UTILITY TYPES =====

export interface PolicyValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PolicyImportResult {
  success: boolean;
  version?: string;
  errors?: PolicyValidationError[];
  warnings?: string[];
}

export interface PolicyExportOptions {
  version?: string;
  includeInactive?: boolean;
  format?: 'yaml' | 'json';
}

// ===== ROLE HIERARCHY & INHERITANCE =====

export interface RoleHierarchy {
  role: SystemRole;
  inherits?: SystemRole[];
  grants?: Partial<Record<EntityName, ActionType[]>>;
}

// Standard role hierarchy for wedding CRM
export const ROLE_HIERARCHY: RoleHierarchy[] = [
  {
    role: 'SuperAdmin',
    grants: {
      Client: ['create', 'read', 'update', 'delete', 'export', 'import'],
      Wedding: ['create', 'read', 'update', 'delete', 'export', 'import'],
      Vendor: ['create', 'read', 'update', 'delete', 'export', 'import'],
      Task: ['create', 'read', 'update', 'delete'],
      User: ['create', 'read', 'update', 'delete'],
      AuditLog: ['read', 'export'],
    }
  },
  {
    role: 'Propietario',
    grants: {
      Client: ['create', 'read', 'update', 'delete', 'export'],
      Wedding: ['create', 'read', 'update', 'delete', 'export'],
      Vendor: ['create', 'read', 'update', 'delete'],
      Task: ['create', 'read', 'update', 'delete'],
      User: ['create', 'read', 'update'],
    }
  },
  {
    role: 'Gestor',
    grants: {
      Client: ['create', 'read', 'update', 'export'],
      Wedding: ['create', 'read', 'update', 'export'],
      Vendor: ['create', 'read', 'update'],
      Task: ['create', 'read', 'update', 'delete'],
    }
  },
  {
    role: 'Vendedor',
    grants: {
      Client: ['create', 'read', 'update'],
      Wedding: ['read', 'update'],
      Vendor: ['read'],
      Task: ['create', 'read', 'update'],
    }
  },
  {
    role: 'GerenteBanquetes',
    grants: {
      Client: ['read'],
      Wedding: ['read', 'update'],
      Vendor: ['read', 'update'],
      Task: ['create', 'read', 'update'],
    }
  },
  {
    role: 'Planner',
    grants: {
      Client: ['read'],
      Wedding: ['read', 'update'],
      Vendor: ['read'],
      Task: ['create', 'read', 'update'],
    }
  },
  {
    role: 'Coordinador',
    grants: {
      Client: ['read'], // Solo lectura de clientes asignados
      Wedding: ['read'], // Solo lectura de eventos asignados
      Vendor: ['read'], // Solo lectura de proveedores
      Task: ['read'], // Solo lectura de tareas
    }
  }
];

// ===== ERROR TYPES =====

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public code: string = 'AUTHORIZATION_ERROR',
    public statusCode: number = 403
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class InsufficientPermissionsError extends AuthorizationError {
  constructor(action: ActionType, entity: EntityName, userRole: SystemRole) {
    super(
      `Role '${userRole}' cannot perform '${action}' on '${entity}'`,
      'INSUFFICIENT_PERMISSIONS',
      403
    );
  }
}

export class FieldAccessDeniedError extends AuthorizationError {
  constructor(field: string, entity: EntityName, userRole: SystemRole) {
    super(
      `Role '${userRole}' cannot access field '${field}' on '${entity}'`,
      'FIELD_ACCESS_DENIED',
      403
    );
  }
}

export class ScopeViolationError extends AuthorizationError {
  constructor(scope: ScopeType, entity: EntityName) {
    super(
      `Access denied: insufficient scope '${scope}' for '${entity}'`,
      'SCOPE_VIOLATION',
      403
    );
  }
}