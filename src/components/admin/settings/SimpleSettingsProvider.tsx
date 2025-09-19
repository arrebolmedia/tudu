/**
 * Simplified Settings Provider
 * Context provider básico para el panel de administración
 */

'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Tipos simplificados para empezar
interface SimpleUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  lastLogin: Date | null;
  emailVerified: boolean;
}

interface SimpleSettingsContextValue {
  // Estados
  users: SimpleUser[];
  isLoading: boolean;
  error: string | null;

  // Métodos básicos
  fetchUsers: () => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const SimpleSettingsContext = createContext<SimpleSettingsContextValue | undefined>(undefined);

interface SimpleSettingsProviderProps {
  children: ReactNode;
}

export function SimpleSettingsProvider({ children }: SimpleSettingsProviderProps) {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener usuarios
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.error || 'Error al cargar usuarios');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para refrescar todos los datos
  const refreshData = async () => {
    await fetchUsers();
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  const value: SimpleSettingsContextValue = {
    users,
    isLoading,
    error,
    fetchUsers,
    refreshData,
    clearError
  };

  return (
    <SimpleSettingsContext.Provider value={value}>
      {children}
    </SimpleSettingsContext.Provider>
  );
}

export function useSimpleSettings() {
  const context = useContext(SimpleSettingsContext);
  if (context === undefined) {
    throw new Error('useSimpleSettings must be used within a SimpleSettingsProvider');
  }
  return context;
}