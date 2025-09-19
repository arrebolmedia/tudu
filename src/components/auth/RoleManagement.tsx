'use client';

/**
 * Role Management Component
 * Interface for managing user roles and permissions
 */

import React, { useState, useEffect } from 'react';
import { 
  SystemRole, 
  EntityName, 
  ActionType,
  FieldMode,
  UserWithAuth
} from '@/types/authorization';
import { useAuthorization } from '@/hooks/useAuthorization';

interface RoleManagementProps {
  className?: string;
}

interface RolePermissions {
  role: SystemRole;
  description: string;
  entities: {
    [entity in EntityName]: {
      [action in ActionType]: boolean;
    };
  };
}

const SYSTEM_ROLES: SystemRole[] = [
  'SuperAdmin',
  'Propietario', 
  'Gestor',
  'Vendedor',
  'GerenteBanquetes',
  'Planner'
];

const ENTITIES: EntityName[] = [
  'Client',
  'Wedding',
  'Vendor', 
  'Task',
  'Document',
  'Payment',
  'Comment',
  'User'
];

const ACTIONS: ActionType[] = [
  'create',
  'read', 
  'update',
  'delete',
  'export',
  'view_sensitive'
];

export function RoleManagement({ className = '' }: RoleManagementProps) {
  const { can, isLoading } = useAuthorization();
  const [selectedRole, setSelectedRole] = useState<SystemRole>('Vendedor');
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadRolePermissions();
  }, []);

  const loadRolePermissions = async () => {
    try {
      // In a real implementation, this would fetch from API
      // For now, we'll use default role definitions
      const defaultPermissions: RolePermissions[] = SYSTEM_ROLES.map(role => ({
        role,
        description: getRoleDescription(role),
        entities: getDefaultEntityPermissions(role)
      }));

      setRolePermissions(defaultPermissions);
    } catch (error) {
      console.error('Failed to load role permissions:', error);
    }
  };

  const handlePermissionChange = (
    role: SystemRole,
    entity: EntityName,
    action: ActionType,
    value: boolean
  ) => {
    setRolePermissions(prev =>
      prev.map(rp => 
        rp.role === role
          ? {
              ...rp,
              entities: {
                ...rp.entities,
                [entity]: {
                  ...rp.entities[entity],
                  [action]: value
                }
              }
            }
          : rp
      )
    );
  };

  const savePermissions = async () => {
    try {
      // In real implementation, would call API to save
      console.log('Saving permissions:', rolePermissions);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save permissions:', error);
    }
  };

  const selectedRoleData = rolePermissions.find(rp => rp.role === selectedRole);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Gestión de Roles y Permisos
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Configure los permisos para cada rol del sistema
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={savePermissions}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Guardar Cambios
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
              >
                Editar Permisos
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Role Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Rol
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as SystemRole)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {SYSTEM_ROLES.map(role => (
              <option key={role} value={role}>
                {role} - {getRoleDescription(role)}
              </option>
            ))}
          </select>
        </div>

        {/* Permissions Matrix */}
        {selectedRoleData && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {selectedRole}
              </h4>
              <p className="text-sm text-gray-600">
                {selectedRoleData.description}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      Entidad
                    </th>
                    {ACTIONS.map(action => (
                      <th key={action} className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ENTITIES.map(entity => (
                    <tr key={entity} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {entity}
                      </td>
                      {ACTIONS.map(action => {
                        const hasPermission = selectedRoleData.entities[entity]?.[action] || false;
                        return (
                          <td key={action} className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              disabled={!isEditing}
                              onChange={(e) => handlePermissionChange(
                                selectedRole,
                                entity,
                                action,
                                e.target.checked
                              )}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Role Hierarchy Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Jerarquía de Roles
          </h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>SuperAdmin:</strong> Acceso completo a todo el sistema</p>
            <p><strong>Propietario:</strong> Gestión completa de la empresa</p>
            <p><strong>Gestor:</strong> Administración de equipos y procesos</p>
            <p><strong>Vendedor:</strong> Gestión de clientes y ventas</p>
            <p><strong>GerenteBanquetes:</strong> Coordinación de eventos</p>
            <p><strong>Planner:</strong> Planificación de bodas</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== UTILITY FUNCTIONS =====

function getRoleDescription(role: SystemRole): string {
  const descriptions: Record<SystemRole, string> = {
    SuperAdmin: 'Administrador del sistema con acceso completo',
    Propietario: 'Propietario de la empresa con gestión total',
    Gestor: 'Gerente con administración de equipos',
    Vendedor: 'Ejecutivo de ventas y atención al cliente',
    GerenteBanquetes: 'Coordinador de eventos y banquetes',
    Planner: 'Planificador especializado en bodas'
  };
  return descriptions[role];
}

function getDefaultEntityPermissions(role: SystemRole): any {
  // Default permissions based on role hierarchy
  const basePermissions = ENTITIES.reduce((acc, entity) => {
    acc[entity] = ACTIONS.reduce((entityAcc, action) => {
      entityAcc[action] = false;
      return entityAcc;
    }, {} as any);
    return acc;
  }, {} as any);

  // Apply role-specific permissions
  switch (role) {
    case 'SuperAdmin':
      // SuperAdmin gets all permissions
      ENTITIES.forEach(entity => {
        ACTIONS.forEach(action => {
          basePermissions[entity][action] = true;
        });
      });
      break;

    case 'Propietario':
      // Propietario gets most permissions except system admin
      ENTITIES.forEach(entity => {
        ['create', 'read', 'update', 'delete', 'export'].forEach(action => {
          basePermissions[entity][action] = true;
        });
      });
      break;

    case 'Gestor':
      // Gestor gets management permissions
      ['Client', 'Wedding', 'Vendor', 'Task', 'Document'].forEach(entity => {
        ['create', 'read', 'update', 'export'].forEach(action => {
          basePermissions[entity][action] = true;
        });
      });
      break;

    case 'Vendedor':
      // Vendedor focuses on client management
      basePermissions.Client = { create: true, read: true, update: true, delete: false, export: false, view_sensitive: false };
      basePermissions.Wedding = { create: false, read: true, update: true, delete: false, export: false, view_sensitive: false };
      basePermissions.Task = { create: true, read: true, update: true, delete: false, export: false, view_sensitive: false };
      break;

    case 'GerenteBanquetes':
      // GerenteBanquetes focuses on events
      basePermissions.Wedding = { create: false, read: true, update: true, delete: false, export: false, view_sensitive: true };
      basePermissions.Vendor = { create: false, read: true, update: true, delete: false, export: false, view_sensitive: false };
      basePermissions.Task = { create: true, read: true, update: true, delete: false, export: false, view_sensitive: false };
      break;

    case 'Planner':
      // Planner focuses on wedding planning
      basePermissions.Wedding = { create: false, read: true, update: true, delete: false, export: false, view_sensitive: false };
      basePermissions.Task = { create: true, read: true, update: true, delete: false, export: false, view_sensitive: false };
      break;
  }

  return basePermissions;
}