'use client';

/**
 * Authorization Hooks
 * React hooks for client-side authorization checks
 */

import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { 
  SystemRole,
  EntityName, 
  ActionType, 
  FieldMode,
  UserWithAuth,
  UseAuthorizationReturn,
  AuthResult,
  QueryFilter
} from '@/types/authorization';

// ===== AUTHORIZATION CONTEXT =====

interface AuthorizationContextType {
  user: UserWithAuth | null;
  isLoading: boolean;
  error?: Error;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined);

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  // Initialize user from localStorage or API
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check for existing token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token and get user info
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        // Token invalid, remove it
        localStorage.removeItem('auth_token');
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
      setError(err instanceof Error ? err : new Error('Authentication failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(undefined);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const { token, user: userData } = await response.json();
        
        localStorage.setItem('auth_token', token);
        setUser(userData);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err : new Error('Login failed'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setError(undefined);
  };

  const refreshUser = async () => {
    await initializeAuth();
  };

  return (
    <AuthorizationContext.Provider value={{
      user,
      isLoading,
      error,
      login,
      logout,
      refreshUser
    }}>
      {children}
    </AuthorizationContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthorizationContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthorizationProvider');
  }
  return context;
}

// ===== AUTHORIZATION HOOK =====

export function useAuthorization(): UseAuthorizationReturn {
  const { user, isLoading, error } = useAuthContext();
  const [authCache, setAuthCache] = useState<Map<string, AuthResult>>(new Map());

  // Clear cache when user changes
  useEffect(() => {
    setAuthCache(new Map());
  }, [user?.id]);

  const can = useCallback(async (
    action: ActionType, 
    entity: EntityName, 
    resource?: any
  ): Promise<boolean> => {
    if (!user) return false;

    // Create cache key
    const cacheKey = `${action}_${entity}_${resource?.id || 'new'}`;
    
    // Check cache first
    const cached = authCache.get(cacheKey);
    if (cached) {
      return cached.allowed;
    }

    try {
      const response = await fetch('/api/auth/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          action,
          entity,
          resource
        })
      });

      if (response.ok) {
        const result: AuthResult = await response.json();
        
        // Cache result for 5 minutes
        setAuthCache(prev => new Map(prev.set(cacheKey, result)));
        setTimeout(() => {
          setAuthCache(prev => {
            const newCache = new Map(prev);
            newCache.delete(cacheKey);
            return newCache;
          });
        }, 5 * 60 * 1000);

        return result.allowed;
      }
      
      return false;
    } catch (err) {
      console.error('Authorization check failed:', err);
      return false;
    }
  }, [user, authCache]);

  const cannot = useCallback(async (
    action: ActionType, 
    entity: EntityName, 
    resource?: any
  ): Promise<boolean> => {
    return !(await can(action, entity, resource));
  }, [can]);

  const canAccess = useCallback((
    field: string, 
    entity: EntityName, 
    mode: FieldMode = 'read'
  ): boolean => {
    if (!user) return false;

    const fieldMode = getFieldMode(field, entity);
    
    switch (mode) {
      case 'read':
        return fieldMode !== 'hidden';
      case 'edit':
        return fieldMode === 'edit' || fieldMode === 'create';
      case 'create':
        return fieldMode === 'edit' || fieldMode === 'create';
      default:
        return false;
    }
  }, [user]);

  const getFieldMode = useCallback((
    field: string, 
    entity: EntityName
  ): FieldMode => {
    if (!user) return 'hidden';

    // This would ideally come from the server or be cached
    // For now, implement basic role-based field access
    return getRoleFieldMode(field, entity, user.role.name);
  }, [user]);

  const filterQuery = useCallback((
    entity: EntityName, 
    baseQuery: any
  ): QueryFilter => {
    if (!user) {
      return { where: { id: null } }; // No access
    }

    // Build scope-based query filters
    return buildQueryFilter(entity, baseQuery, user);
  }, [user]);

  const maskPayload = useCallback((
    entity: EntityName, 
    payload: any
  ): any => {
    if (!user) return {};

    const maskedPayload = { ...payload };
    
    // Apply field-level masking based on user role
    Object.keys(payload).forEach(field => {
      const mode = getFieldMode(field, entity);
      
      if (mode === 'hidden') {
        delete maskedPayload[field];
      } else if (mode === 'mask') {
        maskedPayload[field] = maskFieldValue(payload[field], field);
      }
    });

    return maskedPayload;
  }, [user, getFieldMode]);

  return {
    can,
    cannot,
    canAccess,
    getFieldMode,
    filterQuery,
    maskPayload,
    isLoading,
    error
  };
}

// ===== UTILITY FUNCTIONS =====

function getRoleFieldMode(field: string, entity: EntityName, role: SystemRole): FieldMode {
  // Define field access rules per role
  const fieldRules: Record<EntityName, Record<string, Record<SystemRole, FieldMode>>> = {
    Client: {
      budget: {
        SuperAdmin: 'edit',
        Propietario: 'edit',
        Gestor: 'edit',
        Vendedor: 'read',
        GerenteBanquetes: 'hidden',
        Planner: 'hidden'
      },
      salesExecId: {
        SuperAdmin: 'edit',
        Propietario: 'edit',
        Gestor: 'edit',
        Vendedor: 'read',
        GerenteBanquetes: 'hidden',
        Planner: 'hidden'
      },
      notes: {
        SuperAdmin: 'edit',
        Propietario: 'edit',
        Gestor: 'edit',
        Vendedor: 'edit',
        GerenteBanquetes: 'read',
        Planner: 'read'
      }
    },
    Wedding: {
      budget: {
        SuperAdmin: 'edit',
        Propietario: 'edit',
        Gestor: 'edit',
        Vendedor: 'read',
        GerenteBanquetes: 'read',
        Planner: 'read'
      },
      coordinatorId: {
        SuperAdmin: 'edit',
        Propietario: 'edit',
        Gestor: 'edit',
        Vendedor: 'read',
        GerenteBanquetes: 'read',
        Planner: 'read'
      }
    },
    // Add more entities as needed
    Vendor: {},
    Task: {},
    Document: {},
    Payment: {},
    Comment: {},
    AuditLog: {},
    User: {},
    Team: {},
    Venue: {}
  };

  const entityRules = fieldRules[entity];
  const fieldRule = entityRules?.[field];
  
  if (fieldRule && fieldRule[role]) {
    return fieldRule[role];
  }

  // Default access based on role hierarchy
  if (['SuperAdmin', 'Propietario'].includes(role)) {
    return 'edit';
  } else if (['Gestor', 'Vendedor'].includes(role)) {
    return 'read';
  } else {
    return 'hidden';
  }
}

function buildQueryFilter(entity: EntityName, baseQuery: any, user: UserWithAuth): QueryFilter {
  const { role, teamId, venueId, id: userId } = user;
  
  // SuperAdmin and Propietario get global access
  if (['SuperAdmin', 'Propietario'].includes(role.name)) {
    return { where: baseQuery.where || {} };
  }

  // Build scope conditions based on role
  const scopeConditions: any[] = [];

  if (role.name === 'Gestor') {
    // Managers can see team and venue records
    if (teamId) scopeConditions.push({ teamId });
    if (venueId) scopeConditions.push({ venueId });
  } else if (role.name === 'Vendedor') {
    // Sales people see assigned clients and own records
    if (entity === 'Client') {
      scopeConditions.push(
        { salesExecId: userId },
        { ownerId: userId }
      );
    } else {
      scopeConditions.push({ ownerId: userId });
    }
  } else if (['GerenteBanquetes', 'Planner'].includes(role.name)) {
    // Specialized roles see assigned records
    if (entity === 'Wedding') {
      if (role.name === 'GerenteBanquetes') {
        scopeConditions.push({ coordinatorId: userId });
      } else {
        scopeConditions.push({ plannerId: userId });
      }
    } else {
      scopeConditions.push({ ownerId: userId });
    }
  }

  if (scopeConditions.length === 0) {
    return { where: { id: null } }; // No access
  }

  return {
    where: {
      ...baseQuery.where,
      OR: scopeConditions
    }
  };
}

function maskFieldValue(value: any, fieldName: string): any {
  if (!value) return value;

  switch (fieldName) {
    case 'email':
      return typeof value === 'string' ? value.replace(/(.{2}).*(@.*)/, '$1***$2') : value;
    
    case 'phone':
    case 'secondaryPhone':
      return typeof value === 'string' ? value.replace(/(.{3}).*(.{2})/, '$1***$2') : value;
    
    case 'budget':
      return '***';
    
    default:
      return '***';
  }
}

// ===== ROLE CHECKING UTILITIES =====

export function hasRole(user: UserWithAuth | null, roles: SystemRole | SystemRole[]): boolean {
  if (!user) return false;
  
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role.name);
}

export function isAdmin(user: UserWithAuth | null): boolean {
  return hasRole(user, ['SuperAdmin', 'Propietario']);
}

export function isManager(user: UserWithAuth | null): boolean {
  return hasRole(user, ['SuperAdmin', 'Propietario', 'Gestor']);
}

export function canManageUsers(user: UserWithAuth | null): boolean {
  return hasRole(user, ['SuperAdmin', 'Propietario']);
}

export function canViewSensitiveData(user: UserWithAuth | null): boolean {
  return hasRole(user, ['SuperAdmin', 'Propietario', 'Gestor']);
}