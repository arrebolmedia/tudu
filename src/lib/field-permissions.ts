/**
 * Field-Level Permissions System
 * Sistema de permisos granular a nivel de campo
 */

export interface FieldPermission {
  fieldId: string;
  fieldName: string;
  permissions: {
    view: string[]; // roles que pueden ver el campo
    edit: string[]; // roles que pueden editar el campo
    delete: string[]; // roles que pueden eliminar el campo
  };
}

export interface EntityPermissions {
  entityType: 'user' | 'task' | 'list' | 'project';
  fields: FieldPermission[];
}

// Definición de permisos por defecto para usuarios
export const USER_FIELD_PERMISSIONS: FieldPermission[] = [
  {
    fieldId: 'name',
    fieldName: 'Nombre',
    permissions: {
      view: ['SuperAdmin', 'Propietario', 'Gestor', 'Vendedor'],
      edit: ['SuperAdmin', 'Propietario'],
      delete: []
    }
  },
  {
    fieldId: 'email',
    fieldName: 'Email',
    permissions: {
      view: ['SuperAdmin', 'Propietario', 'Gestor'],
      edit: ['SuperAdmin', 'Propietario'],
      delete: []
    }
  },
  {
    fieldId: 'role',
    fieldName: 'Rol',
    permissions: {
      view: ['SuperAdmin', 'Propietario', 'Gestor'],
      edit: ['SuperAdmin'],
      delete: []
    }
  },
  {
    fieldId: 'status',
    fieldName: 'Estado',
    permissions: {
      view: ['SuperAdmin', 'Propietario', 'Gestor'],
      edit: ['SuperAdmin', 'Propietario'],
      delete: []
    }
  },
  {
    fieldId: 'emailVerified',
    fieldName: 'Email Verificado',
    permissions: {
      view: ['SuperAdmin', 'Propietario'],
      edit: ['SuperAdmin'],
      delete: []
    }
  },
  {
    fieldId: 'lastLogin',
    fieldName: 'Último Login',
    permissions: {
      view: ['SuperAdmin', 'Propietario', 'Gestor'],
      edit: [],
      delete: []
    }
  },
  {
    fieldId: 'createdAt',
    fieldName: 'Fecha de Creación',
    permissions: {
      view: ['SuperAdmin', 'Propietario'],
      edit: [],
      delete: []
    }
  }
];

// Función para verificar si un usuario tiene permiso específico sobre un campo
export function hasFieldPermission(
  userRole: string,
  fieldId: string,
  action: 'view' | 'edit' | 'delete',
  entityType: 'user' = 'user'
): boolean {
  let fieldPermissions: FieldPermission[];
  
  switch (entityType) {
    case 'user':
      fieldPermissions = USER_FIELD_PERMISSIONS;
      break;
    default:
      return false;
  }
  
  const field = fieldPermissions.find(f => f.fieldId === fieldId);
  if (!field) return false;
  
  return field.permissions[action].includes(userRole);
}

// Función para obtener campos visibles para un usuario
export function getVisibleFields(
  userRole: string,
  entityType: 'user' = 'user'
): string[] {
  let fieldPermissions: FieldPermission[];
  
  switch (entityType) {
    case 'user':
      fieldPermissions = USER_FIELD_PERMISSIONS;
      break;
    default:
      return [];
  }
  
  return fieldPermissions
    .filter(field => field.permissions.view.includes(userRole))
    .map(field => field.fieldId);
}

// Función para obtener campos editables para un usuario
export function getEditableFields(
  userRole: string,
  entityType: 'user' = 'user'
): string[] {
  let fieldPermissions: FieldPermission[];
  
  switch (entityType) {
    case 'user':
      fieldPermissions = USER_FIELD_PERMISSIONS;
      break;
    default:
      return [];
  }
  
  return fieldPermissions
    .filter(field => field.permissions.edit.includes(userRole))
    .map(field => field.fieldId);
}