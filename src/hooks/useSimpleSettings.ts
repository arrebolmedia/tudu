'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

interface UseSimpleSettingsReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  clearError: () => void;
  executeUserAction: (userId: string, action: string, data?: any) => Promise<any>;
}

export function useSimpleSettings(): UseSimpleSettingsReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para ejecutar acciones de usuario
  const executeUserAction = useCallback(async (userId: string, action: string, data: any = {}) => {
    try {
      setError(null);
      
      const response = await fetch('/api/admin/users/actions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          action,
          data
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error en la operación');
      }
      
      console.log('✅ Acción ejecutada:', { action, result });
      
      // Recargar usuarios después de la acción
      await fetchUsers();
      
      return result;
    } catch (err) {
      console.error('Error ejecutando acción:', err);
      setError(err instanceof Error ? err.message : 'Error ejecutando acción');
      throw err;
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    clearError,
    executeUserAction
  };
}