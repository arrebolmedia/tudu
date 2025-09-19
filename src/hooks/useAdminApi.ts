/**
 * Admin API Hook
 * Hook personalizado para interactuar con la API de administración
 */

'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  type AdminUser, 
  type AdminRole, 
  type PolicyVersion,
  type AdminAuditLog,
  type AdminDashboardStats,
  type DryRunRequest,
  type DryRunResponse,
  type ValidatePolicyRequest,
  type ValidatePolicyResponse,
  type CreateUserDto,
  type PatchUserDto,
  type CreatePolicyVersionDto,
  type AuditLogFilters,
  type AuditLogResponse,
  type AdminApiResponse
} from '@/types/admin';

interface AdminApiState {
  users: AdminUser[];
  roles: AdminRole[];
  crmEntities: any[]; // TODO: Define proper CRM entity types
  policyVersions: PolicyVersion[];
  activePolicyVersion: PolicyVersion | null;
  auditLogs: AdminAuditLog[];
  dashboardStats: AdminDashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAdminApiReturn extends AdminApiState {
  // Users
  fetchUsers: (params?: { page?: number; pageSize?: number; search?: string; role?: string; isActive?: boolean }) => Promise<{ users: AdminUser[]; pagination: any }>;
  createUser: (userData: CreateUserDto) => Promise<{ user: AdminUser; tempPassword: string }>;
  updateUser: (userId: string, updates: PatchUserDto) => Promise<AdminUser>;
  deleteUser: (userId: string) => Promise<any>;
  resetUserPassword: (userId: string) => Promise<{ tempPassword: string; userEmail: string }>;
  
  // Roles
  fetchRoles: (params?: { page?: number; pageSize?: number; search?: string }) => Promise<{ roles: AdminRole[]; pagination: any }>;
  
  // Policy
  fetchPolicyVersions: () => Promise<PolicyVersion[]>;
  createPolicyVersion: (policyData: CreatePolicyVersionDto) => Promise<PolicyVersion>;
  validatePolicy: (request: ValidatePolicyRequest) => Promise<ValidatePolicyResponse>;
  activatePolicyVersion: (versionId: string, password: string) => Promise<any>;
  
  // Dry Run
  executeDryRun: (request: DryRunRequest) => Promise<DryRunResponse>;
  runDryTest: (request: DryRunRequest) => Promise<DryRunResponse>; // Alias
  
  // Audit
  fetchAuditLogs: (filters?: AuditLogFilters) => Promise<AuditLogResponse>;
  exportAuditLogs: (filters?: AuditLogFilters) => Promise<void>;
  auditLogStats?: {
    total: number;
    errors: number;
    warnings: number;
    activeUsers: number;
  };
  purgeAuditLogs: (olderThan: string) => Promise<{ deletedCount: number }>;
  
  // Dashboard
  fetchDashboardStats: () => Promise<AdminDashboardStats>;
  
  // Re-auth
  reauth: (password: string) => Promise<{ token: string }>;
  
  // Utilities
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export function useAdminApi(): UseAdminApiReturn {
  const { data: session } = useSession();
  
  const [state, setState] = useState<AdminApiState>({
    users: [],
    roles: [],
    crmEntities: [],
    policyVersions: [],
    activePolicyVersion: null,
    auditLogs: [],
    dashboardStats: null,
    isLoading: false,
    error: null
  });

  const updateState = useCallback((updates: Partial<AdminApiState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<AdminApiResponse<T>>,
    onSuccess?: (data: T) => void
  ): Promise<T> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await apiCall();
      
      if (!response.success) {
        throw new Error(response.message || 'API call failed');
      }
      
      if (onSuccess && response.data) {
        onSuccess(response.data);
      }
      
      updateState({ isLoading: false });
      return response.data!;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateState({ isLoading: false, error: errorMessage });
      throw error;
    }
  }, [updateState]);

  const makeApiRequest = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AdminApiResponse<T>> => {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }, []);

  // Users API
  const fetchUsers = useCallback(async (params?: { 
    page?: number; 
    pageSize?: number; 
    search?: string; 
    role?: string; 
    isActive?: boolean 
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    if (params?.isActive !== undefined) query.set('isActive', params.isActive.toString());

    return handleApiCall(
      () => makeApiRequest<{ users: AdminUser[]; pagination: any }>(`/api/admin/users?${query}`),
      (data) => updateState({ users: data.users })
    );
  }, [handleApiCall, makeApiRequest, updateState]);

  const createUser = useCallback(async (userData: CreateUserDto) => {
    return handleApiCall(
      () => makeApiRequest<{ user: AdminUser; tempPassword: string }>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
      (data) => updateState({ users: [...state.users, data.user] })
    );
  }, [handleApiCall, makeApiRequest, updateState, state.users]);

  const updateUser = useCallback(async (userId: string, updates: PatchUserDto) => {
    return handleApiCall(
      () => makeApiRequest<AdminUser>(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
      (updatedUser) => {
        updateState({
          users: state.users.map(user => 
            user.id === userId ? updatedUser : user
          )
        });
      }
    );
  }, [handleApiCall, makeApiRequest, updateState, state.users]);

  const deleteUser = useCallback(async (userId: string) => {
    return handleApiCall(
      () => makeApiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' }),
      () => {
        updateState({
          users: state.users.filter(user => user.id !== userId)
        });
      }
    );
  }, [handleApiCall, makeApiRequest, updateState, state.users]);

  const resetUserPassword = useCallback(async (userId: string) => {
    return handleApiCall(
      () => makeApiRequest<{ resetInfo: any; tempPassword: string; userEmail: string }>(
        `/api/admin/users/${userId}/reset-password`, 
        { method: 'POST' }
      )
    );
  }, [handleApiCall, makeApiRequest]);

  // Roles API
  const fetchRoles = useCallback(async (params?: { 
    page?: number; 
    pageSize?: number; 
    search?: string 
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params?.search) query.set('search', params.search);

    return handleApiCall(
      () => makeApiRequest<{ roles: AdminRole[]; pagination: any }>(`/api/admin/roles?${query}`),
      (data) => updateState({ roles: data.roles })
    );
  }, [handleApiCall, makeApiRequest, updateState]);

  // Policy API
  const fetchPolicyVersions = useCallback(async () => {
    return handleApiCall(
      () => makeApiRequest<PolicyVersion[]>('/api/admin/policy'),
      (versions) => {
        updateState({ 
          policyVersions: versions,
          activePolicyVersion: versions.find(v => v.isActive) || null
        });
      }
    );
  }, [handleApiCall, makeApiRequest, updateState]);

  const createPolicyVersion = useCallback(async (policyData: CreatePolicyVersionDto) => {
    return handleApiCall(
      () => makeApiRequest<PolicyVersion>('/api/admin/policy', {
        method: 'POST',
        body: JSON.stringify(policyData)
      }),
      (newVersion) => {
        updateState({
          policyVersions: [...state.policyVersions, newVersion]
        });
      }
    );
  }, [handleApiCall, makeApiRequest, updateState, state.policyVersions]);

  const validatePolicy = useCallback(async (request: ValidatePolicyRequest) => {
    return handleApiCall(
      () => makeApiRequest<ValidatePolicyResponse>('/api/admin/policy/validate', {
        method: 'POST',
        body: JSON.stringify(request)
      })
    );
  }, [handleApiCall, makeApiRequest]);

  const activatePolicyVersion = useCallback(async (versionId: string, password: string) => {
    return handleApiCall(
      () => makeApiRequest(`/api/admin/policy/${versionId}/activate`, {
        method: 'POST',
        body: JSON.stringify({ password })
      }),
      () => {
        updateState({
          policyVersions: state.policyVersions.map(v => ({
            ...v,
            isActive: v.id === versionId
          })),
          activePolicyVersion: state.policyVersions.find(v => v.id === versionId) || null
        });
      }
    );
  }, [handleApiCall, makeApiRequest, updateState, state.policyVersions]);

  // Dry Run API
  const executeDryRun = useCallback(async (request: DryRunRequest) => {
    return handleApiCall(
      () => makeApiRequest<DryRunResponse>('/api/admin/dryrun', {
        method: 'POST',
        body: JSON.stringify(request)
      })
    );
  }, [handleApiCall, makeApiRequest]);

  // Audit API
  const fetchAuditLogs = useCallback(async (filters?: AuditLogFilters) => {
    const query = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.set(key, value.toString());
        }
      });
    }

    return handleApiCall(
      () => makeApiRequest<AuditLogResponse>(`/api/admin/audit?${query}`),
      (data) => updateState({ auditLogs: data.logs })
    );
  }, [handleApiCall, makeApiRequest, updateState]);

  const purgeAuditLogs = useCallback(async (olderThan: string) => {
    return handleApiCall(
      () => makeApiRequest<{ deletedCount: number }>(`/api/admin/audit?olderThan=${olderThan}`, {
        method: 'DELETE'
      })
    );
  }, [handleApiCall, makeApiRequest]);

  // Additional audit functions
  const exportAuditLogs = useCallback(async (filters?: AuditLogFilters) => {
    const response = await fetch('/api/admin/audit/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters || {})
    });

    if (!response.ok) {
      throw new Error('Error al exportar logs de auditoría');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, []);

  // Dry run aliases
  const runDryTest = useCallback(async (request: DryRunRequest) => {
    return executeDryRun(request);
  }, [executeDryRun]);

  // Dashboard API
  const fetchDashboardStats = useCallback(async () => {
    return handleApiCall(
      () => makeApiRequest<AdminDashboardStats>('/api/admin/dashboard'),
      (stats) => updateState({ dashboardStats: stats })
    );
  }, [handleApiCall, makeApiRequest, updateState]);

  // Re-auth API
  const reauth = useCallback(async (password: string) => {
    return handleApiCall(
      () => makeApiRequest<{ success: boolean; token: string }>('/api/admin/reauth', {
        method: 'POST',
        body: JSON.stringify({ password })
      })
    );
  }, [handleApiCall, makeApiRequest]);

  // Utilities
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const setLoading = useCallback((loading: boolean) => {
    updateState({ isLoading: loading });
  }, [updateState]);

  return {
    ...state,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    fetchRoles,
    fetchPolicyVersions,
    createPolicyVersion,
    validatePolicy,
    activatePolicyVersion,
    executeDryRun,
    runDryTest,
    fetchAuditLogs,
    exportAuditLogs,
    auditLogStats: {
      total: state.auditLogs.length,
      errors: state.auditLogs.filter(log => log.level === 'ERROR').length,
      warnings: state.auditLogs.filter(log => log.level === 'WARN').length,
      activeUsers: new Set(state.auditLogs.map(log => log.userId)).size
    },
    purgeAuditLogs,
    fetchDashboardStats,
    reauth,
    clearError,
    setLoading
  };
}