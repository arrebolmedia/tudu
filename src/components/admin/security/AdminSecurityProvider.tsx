/**
 * Admin Security Provider
 * Provider para funciones de seguridad del panel de administración
 */

'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ReauthDialog } from './ReauthDialog';

interface AdminSecurityContextValue {
  isReauthDialogOpen: boolean;
  pendingAction: (() => Promise<void>) | null;
  openReauthDialog: (action: () => Promise<void>) => void;
  closeReauthDialog: () => void;
  executeWithReauth: (action: () => Promise<void>) => void;
}

const AdminSecurityContext = createContext<AdminSecurityContextValue | undefined>(undefined);

interface AdminSecurityProviderProps {
  children: ReactNode;
}

export function AdminSecurityProvider({ children }: AdminSecurityProviderProps) {
  const [isReauthDialogOpen, setIsReauthDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  const openReauthDialog = useCallback((action: () => Promise<void>) => {
    setPendingAction(() => action);
    setIsReauthDialogOpen(true);
  }, []);

  const closeReauthDialog = useCallback(() => {
    setIsReauthDialogOpen(false);
    setPendingAction(null);
  }, []);

  const executeWithReauth = useCallback((action: () => Promise<void>) => {
    openReauthDialog(action);
  }, [openReauthDialog]);

  const value: AdminSecurityContextValue = {
    isReauthDialogOpen,
    pendingAction,
    openReauthDialog,
    closeReauthDialog,
    executeWithReauth
  };

  return (
    <AdminSecurityContext.Provider value={value}>
      {children}
      <ReauthDialog />
    </AdminSecurityContext.Provider>
  );
}

export function useAdminSecurity() {
  const context = useContext(AdminSecurityContext);
  if (context === undefined) {
    throw new Error('useAdminSecurity must be used within an AdminSecurityProvider');
  }
  return context;
}