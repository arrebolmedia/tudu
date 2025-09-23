/**
 * Sistema de Configuración de Permisos por Rol
 * Defines los permisos predeterminados que cada rol debe tener
 */

import { UserRole } from '@/types';
import { EVENT_FIELDS, USER_FIELDS } from '@/lib/user-field-permissions';

export interface RolePermissionConfig {
  role: UserRole;
  displayName: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'gray';
  canDelete: boolean;
  permissions: {
    [fieldId: string]: {
      view: boolean;
      edit: boolean;
    };
  };
}

// Configuración completa de permisos por rol
export const ROLE_PERMISSIONS_CONFIG: RolePermissionConfig[] = [
  {
    role: 'SUPER_ADMIN',
    displayName: 'Super Administrador',
    description: 'Acceso total al sistema, configuración y administración',
    icon: '🔧',
    color: 'red',
    canDelete: true,
    permissions: Object.fromEntries(
      [...EVENT_FIELDS, ...USER_FIELDS].map(field => [
        field.fieldId, 
        { view: true, edit: true }
      ])
    )
  },
  {
    role: 'PROPIETARIO',
    displayName: 'Propietario',
    description: 'Control total del negocio y operaciones',
    icon: '👑',
    color: 'purple',
    canDelete: true,
    permissions: Object.fromEntries(
      [...EVENT_FIELDS, ...USER_FIELDS].map(field => [
        field.fieldId, 
        { view: true, edit: true }
      ])
    )
  },
  {
    role: 'GERENTE',
    displayName: 'Gerente',
    description: 'Gestión completa de clientes y operaciones',
    icon: '📊',
    color: 'blue',
    canDelete: true,
    permissions: Object.fromEntries(
      [...EVENT_FIELDS, ...USER_FIELDS].map(field => [
        field.fieldId, 
        { view: true, edit: true }
      ])
    )
  },
  {
    role: 'CALL_CENTER',
    displayName: 'Call Center',
    description: 'Gestión de leads y primeros contactos',
    icon: '📞',
    color: 'green',
    canDelete: false,
    permissions: Object.fromEntries(
      [...EVENT_FIELDS, ...USER_FIELDS].map(field => [
        field.fieldId, 
        { 
          view: true, 
          edit: !['role', 'assignedExecutive', 'createdAt', 'updatedAt'].includes(field.fieldId)
        }
      ])
    )
  },
  {
    role: 'VENDEDOR',
    displayName: 'Vendedor',
    description: 'Gestión de clientes asignados y ventas',
    icon: '💼',
    color: 'indigo',
    canDelete: false,
    permissions: Object.fromEntries(
      [...EVENT_FIELDS, ...USER_FIELDS].map(field => {
        // Vendedores pueden ver casi todo pero editar selectivamente
        const canEdit = ![
          'role', 
          'assignedExecutive', 
          'createdAt', 
          'updatedAt',
          'email' // Solo pueden ver emails, no editarlos
        ].includes(field.fieldId);
        
        return [field.fieldId, { view: true, edit: canEdit }];
      })
    )
  },
  {
    role: 'COORDINADOR',
    displayName: 'Coordinador',
    description: 'Coordinación de eventos y seguimiento operativo',
    icon: '📅',
    color: 'yellow',
    canDelete: false,
    permissions: Object.fromEntries(
      [...EVENT_FIELDS, ...USER_FIELDS].map(field => {
        // Coordinadores ven todo pero editan solo campos operativos
        const canEdit = [
          'phone', 
          'notes', 
          'eventDate', 
          'status', 
          'priority',
          'area',
          'type'
        ].includes(field.fieldId);
        
        return [field.fieldId, { view: true, edit: canEdit }];
      })
    )
  },
  {
    role: 'COLABORADOR',
    displayName: 'Colaborador',
    description: 'Acceso limitado solo a información básica',
    icon: '👤',
    color: 'gray',
    canDelete: false,
    permissions: Object.fromEntries(
      [...EVENT_FIELDS, ...USER_FIELDS].map(field => {
        // Colaboradores solo ven información básica, no editan nada
        const canView = [
          'name', 
          'phone', 
          'eventDate', 
          'status', 
          'notes',
          'area',
          'priority'
        ].includes(field.fieldId);
        
        return [field.fieldId, { view: canView, edit: false }];
      })
    )
  }
];

// Función para obtener configuración de un rol específico
export const getRoleConfig = (role: UserRole): RolePermissionConfig | undefined => {
  return ROLE_PERMISSIONS_CONFIG.find(config => config.role === role);
};

// Función para obtener permisos de un rol para un campo específico
export const getRoleFieldPermission = (role: UserRole, fieldId: string): { view: boolean; edit: boolean } => {
  const config = getRoleConfig(role);
  return config?.permissions[fieldId] || { view: false, edit: false };
};

// Función para verificar si un rol puede eliminar registros
export const canRoleDelete = (role: UserRole): boolean => {
  const config = getRoleConfig(role);
  return config?.canDelete || false;
};

// Función para aplicar permisos predeterminados a un usuario
export const applyDefaultRolePermissions = (userId: string, role: UserRole): any => {
  const config = getRoleConfig(role);
  if (!config) return null;

  return {
    userId,
    userName: '', // Se completará con datos reales
    userEmail: '',
    userRole: role,
    canDelete: config.canDelete,
    permissions: config.permissions
  };
};

// Estadísticas de permisos por rol
export const getRolePermissionStats = () => {
  const allFields = [...EVENT_FIELDS, ...USER_FIELDS];
  
  return ROLE_PERMISSIONS_CONFIG.map(config => {
    const viewCount = Object.values(config.permissions).filter(p => p.view).length;
    const editCount = Object.values(config.permissions).filter(p => p.edit).length;
    const totalFields = allFields.length;
    
    return {
      role: config.role,
      displayName: config.displayName,
      icon: config.icon,
      color: config.color,
      canDelete: config.canDelete,
      stats: {
        viewCount,
        editCount,
        totalFields,
        viewPercentage: Math.round((viewCount / totalFields) * 100),
        editPercentage: Math.round((editCount / totalFields) * 100)
      }
    };
  });
};

// Función para exportar configuración actual
export const exportRolePermissions = (): string => {
  return JSON.stringify(ROLE_PERMISSIONS_CONFIG, null, 2);
};

// Función para importar configuración
export const importRolePermissions = (configJson: string): RolePermissionConfig[] => {
  try {
    return JSON.parse(configJson);
  } catch (error) {
    console.error('Error parsing role permissions config:', error);
    return ROLE_PERMISSIONS_CONFIG; // Devolver configuración por defecto
  }
};