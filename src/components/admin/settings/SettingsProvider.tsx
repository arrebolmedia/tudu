/**
 * Settings Provider
 * Context provider para el panel de administración
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { 
  type AdminUser, 
  type AdminRole, 
  type PolicyVersion,
  type AdminAuditLog,
  type AdminDashboardStats
} from '@/types/admin';

interface SettingsContextValue {
  // Estados
  users: AdminUser[];
  roles: AdminRole[];
  policyVersions: PolicyVersion[];
  activePolicyVersion: PolicyVersion | null;
  auditLogs: AdminAuditLog[];
  dashboardStats: AdminDashboardStats | null;
  isLoading: boolean;
  error: string | null;

  // API methods
  fetchUsers: ReturnType<typeof useAdminApi>['fetchUsers'];
  createUser: ReturnType<typeof useAdminApi>['createUser'];
  updateUser: ReturnType<typeof useAdminApi>['updateUser'];
  deleteUser: ReturnType<typeof useAdminApi>['deleteUser'];
  resetUserPassword: ReturnType<typeof useAdminApi>['resetUserPassword'];
  fetchRoles: ReturnType<typeof useAdminApi>['fetchRoles'];
  fetchPolicyVersions: ReturnType<typeof useAdminApi>['fetchPolicyVersions'];
  createPolicyVersion: ReturnType<typeof useAdminApi>['createPolicyVersion'];
  validatePolicy: ReturnType<typeof useAdminApi>['validatePolicy'];
  activatePolicyVersion: ReturnType<typeof useAdminApi>['activatePolicyVersion'];
  executeDryRun: ReturnType<typeof useAdminApi>['executeDryRun'];
  fetchAuditLogs: ReturnType<typeof useAdminApi>['fetchAuditLogs'];
  purgeAuditLogs: ReturnType<typeof useAdminApi>['purgeAuditLogs'];
  fetchDashboardStats: ReturnType<typeof useAdminApi>['fetchDashboardStats'];
  reauth: ReturnType<typeof useAdminApi>['reauth'];
  clearError: ReturnType<typeof useAdminApi>['clearError'];
  setLoading: ReturnType<typeof useAdminApi>['setLoading'];
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const adminApi = useAdminApi();

  const value: SettingsContextValue = {
    ...adminApi
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}