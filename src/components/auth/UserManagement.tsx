'use client';

/**
 * User Management Component
 * Interface for managing users, roles, and permissions
 */

import React, { useState, useEffect } from 'react';
import { 
  SystemRole, 
  UserWithAuth
} from '@/types/authorization';
import { useAuthorization, hasRole } from '@/hooks/useAuthorization';

interface UserManagementProps {
  className?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: {
    name: SystemRole;
    description: string;
  };
  teamId?: string;
  venueId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

interface NewUserForm {
  name: string;
  email: string;
  password: string;
  roleId: string;
  teamId?: string;
  venueId?: string;
}

const SYSTEM_ROLES: { name: SystemRole; description: string }[] = [
  { name: 'SuperAdmin', description: 'Administrador del sistema' },
  { name: 'Propietario', description: 'Propietario de la empresa' },
  { name: 'Gestor', description: 'Gerente de equipo' },
  { name: 'Vendedor', description: 'Ejecutivo de ventas' },
  { name: 'GerenteBanquetes', description: 'Coordinador de eventos' },
  { name: 'Coordinador', description: 'Coordinador de eventos asignados' },
  { name: 'Planner', description: 'Planificador de bodas' }
];

export function UserManagement({ className = '' }: UserManagementProps) {
  const { can, isLoading } = useAuthorization();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<NewUserForm>({
    name: '',
    email: '',
    password: '',
    roleId: '',
    teamId: '',
    venueId: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // In real implementation, would fetch from API
      // For now, show mock data
      const mockUsers: UserData[] = [
        {
          id: '1',
          name: 'Ana García',
          email: 'ana@arrebol.com',
          role: { name: 'Propietario', description: 'Propietario de la empresa' },
          isActive: true,
          lastLogin: new Date('2024-01-15T10:30:00'),
          createdAt: new Date('2023-01-01T00:00:00')
        },
        {
          id: '2',
          name: 'Carlos Mendoza',
          email: 'carlos@arrebol.com',
          role: { name: 'Gestor', description: 'Gerente de equipo' },
          teamId: 'team-1',
          isActive: true,
          lastLogin: new Date('2024-01-14T16:45:00'),
          createdAt: new Date('2023-03-15T00:00:00')
        },
        {
          id: '3',
          name: 'María López',
          email: 'maria@arrebol.com',
          role: { name: 'Vendedor', description: 'Ejecutivo de ventas' },
          teamId: 'team-1',
          isActive: true,
          lastLogin: new Date('2024-01-15T09:15:00'),
          createdAt: new Date('2023-06-01T00:00:00')
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      // In real implementation, would call API
      console.log('Creating user:', newUser);
      
      const createdUser: UserData = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: SYSTEM_ROLES.find(r => r.name === newUser.roleId) || SYSTEM_ROLES[3],
        teamId: newUser.teamId || undefined,
        venueId: newUser.venueId || undefined,
        isActive: true,
        createdAt: new Date()
      };

      setUsers(prev => [...prev, createdUser]);
      setIsCreating(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        roleId: '',
        teamId: '',
        venueId: ''
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, isActive: !user.isActive }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: SystemRole) => {
    try {
      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { 
                ...user, 
                role: SYSTEM_ROLES.find(r => r.name === newRole) || user.role
              }
            : user
        )
      );
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Nunca';
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRoleColor = (role: SystemRole) => {
    const colors: Record<SystemRole, string> = {
      SuperAdmin: 'bg-red-100 text-red-800',
      Propietario: 'bg-purple-100 text-purple-800',
      Gestor: 'bg-blue-100 text-blue-800',
      Vendedor: 'bg-green-100 text-green-800',
      GerenteBanquetes: 'bg-orange-100 text-orange-800',
      Coordinador: 'bg-blue-100 text-blue-800',
      Planner: 'bg-pink-100 text-pink-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Gestión de Usuarios
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Administre usuarios, roles y permisos del sistema
            </p>
          </div>
          
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>+</span>
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Create User Form */}
        {isCreating && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-4">Crear Nuevo Usuario</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Ana García"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ana@arrebol.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Temporal
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={newUser.roleId}
                  onChange={(e) => setNewUser(prev => ({ ...prev, roleId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar rol...</option>
                  {SYSTEM_ROLES.map(role => (
                    <option key={role.name} value={role.name}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                disabled={!newUser.name || !newUser.email || !newUser.password || !newUser.roleId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Rol
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Último Login
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    {editingUser === user.id ? (
                      <select
                        value={user.role.name}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value as SystemRole)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {SYSTEM_ROLES.map(role => (
                          <option key={role.name} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role.name)}`}>
                        {user.role.name}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(user.lastLogin)}
                  </td>
                  
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingUser === user.id ? (
                        <button
                          onClick={() => setEditingUser(null)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingUser(user.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Editar
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`text-sm ${
                          user.isActive 
                            ? 'text-red-600 hover:text-red-800' 
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {user.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay usuarios registrados
          </div>
        )}
      </div>
    </div>
  );
}