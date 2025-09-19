/**
 * User-Based Field Permissions System
 * Sistema de permisos granulares por campo basado en usuarios específicos
 */

// Definir los tipos de permisos disponibles
export type PermissionAction = 'view' | 'edit';

// Estructura de permisos por usuario y campo
export interface UserFieldPermission {
  userId: string;
  userName: string;
  userEmail: string;
  canDeleteRecord: boolean; // Permiso para eliminar todo el registro
  fieldPermissions: {
    [fieldId: string]: {
      view: boolean;
      edit: boolean;
    };
  };
}

// Definición de campos disponibles para diferentes entidades
export interface FieldDefinition {
  fieldId: string;
  fieldName: string;
  description: string;
  category: 'basic' | 'contact' | 'business' | 'system';
  entityType: 'user' | 'task' | 'event' | 'client';
}

// Campos disponibles para usuarios
export const USER_FIELDS: FieldDefinition[] = [
  { fieldId: 'name', fieldName: 'Nombre', description: 'Nombre completo del usuario', category: 'basic', entityType: 'user' },
  { fieldId: 'email', fieldName: 'Email', description: 'Dirección de correo electrónico', category: 'contact', entityType: 'user' },
  { fieldId: 'role', fieldName: 'Rol', description: 'Rol asignado al usuario', category: 'business', entityType: 'user' },
  { fieldId: 'status', fieldName: 'Estado', description: 'Estado activo/inactivo', category: 'business', entityType: 'user' },
  { fieldId: 'emailVerified', fieldName: 'Email Verificado', description: 'Estado de verificación del email', category: 'system', entityType: 'user' },
  { fieldId: 'lastLogin', fieldName: 'Último Acceso', description: 'Fecha del último acceso', category: 'system', entityType: 'user' },
  { fieldId: 'createdAt', fieldName: 'Fecha de Registro', description: 'Fecha de creación de la cuenta', category: 'system', entityType: 'user' }
];

// Campos para eventos/bodas (idénticos a los de las tarjetas)
export const EVENT_FIELDS: FieldDefinition[] = [
  { fieldId: 'name', fieldName: 'Nombre', description: 'Nombre del cliente/pareja', category: 'basic', entityType: 'event' },
  { fieldId: 'phone', fieldName: 'Teléfono', description: 'Número de teléfono de contacto', category: 'contact', entityType: 'event' },
  { fieldId: 'email', fieldName: 'Email', description: 'Dirección de correo electrónico', category: 'contact', entityType: 'event' },
  { fieldId: 'eventDate', fieldName: 'Fecha del Evento', description: 'Fecha programada para el evento', category: 'basic', entityType: 'event' },
  { fieldId: 'status', fieldName: 'Estado', description: 'Estado actual del evento', category: 'business', entityType: 'event' },
  { fieldId: 'priority', fieldName: 'Prioridad', description: 'Nivel de prioridad del evento', category: 'business', entityType: 'event' },
  { fieldId: 'area', fieldName: 'Área', description: 'Área donde se realizará el evento', category: 'business', entityType: 'event' },
  { fieldId: 'type', fieldName: 'Tipo de Evento', description: 'Tipo de evento (boda, compromiso, etc.)', category: 'business', entityType: 'event' },
  { fieldId: 'channel', fieldName: 'Canal', description: 'Canal de origen del evento', category: 'business', entityType: 'event' },
  { fieldId: 'assignedExecutive', fieldName: 'Ejecutivo Asignado', description: 'Ejecutivo responsable del evento', category: 'business', entityType: 'event' },
  { fieldId: 'notes', fieldName: 'Notas', description: 'Notas y comentarios adicionales', category: 'basic', entityType: 'event' }
];

// Datos de ejemplo - Permisos específicos por usuario
export const USER_SPECIFIC_PERMISSIONS: UserFieldPermission[] = [
  {
    userId: '1',
    userName: 'Josefo Flores',
    userEmail: 'josefo@example.com',
    canDeleteRecord: false, // No puede eliminar registros completos
    fieldPermissions: {
      // Para eventos/bodas - permisos según las tarjetas reales
      'name': { view: true, edit: false },
      'phone': { view: true, edit: true },
      'email': { view: true, edit: true },
      'eventDate': { view: true, edit: false },
      'status': { view: true, edit: true },
      'priority': { view: true, edit: true },
      'area': { view: true, edit: false },
      'type': { view: true, edit: false },
      'channel': { view: true, edit: false },
      'assignedExecutive': { view: false, edit: false },
      'notes': { view: true, edit: true },
      // Para usuarios
      'role': { view: false, edit: false }
    }
  },
  {
    userId: '2',
    userName: 'María González',
    userEmail: 'maria@example.com',
    canDeleteRecord: true, // Puede eliminar registros completos
    fieldPermissions: {
      // Para eventos/bodas - permisos completos como supervisor
      'name': { view: true, edit: true },
      'phone': { view: true, edit: true },
      'email': { view: true, edit: true },
      'eventDate': { view: true, edit: true },
      'status': { view: true, edit: true },
      'priority': { view: true, edit: true },
      'area': { view: true, edit: true },
      'type': { view: true, edit: true },
      'channel': { view: true, edit: true },
      'assignedExecutive': { view: true, edit: true },
      'notes': { view: true, edit: true },
      // Para usuarios
      'role': { view: true, edit: false }
    }
  },
  {
    userId: '3',
    userName: 'Carlos Rodríguez',
    userEmail: 'carlos@example.com',
    canDeleteRecord: false, // No puede eliminar registros completos
    fieldPermissions: {
      // Para eventos/bodas - permisos muy limitados
      'name': { view: true, edit: false },
      'phone': { view: false, edit: false },
      'email': { view: false, edit: false },
      'eventDate': { view: true, edit: false },
      'status': { view: true, edit: true },
      'priority': { view: false, edit: false },
      'area': { view: true, edit: false },
      'type': { view: true, edit: false },
      'channel': { view: false, edit: false },
      'assignedExecutive': { view: false, edit: false },
      'notes': { view: true, edit: false },
      // Para usuarios
      'role': { view: false, edit: false }
    }
  },
  // COORDINADORES - Solo pueden ver, no editar nada
  {
    userId: '4',
    userName: 'Brenda',
    userEmail: 'brenda@example.com',
    canDeleteRecord: false, // No puede eliminar registros
    fieldPermissions: {
      // Para eventos/bodas - solo lectura de campos básicos
      'name': { view: true, edit: false },
      'phone': { view: true, edit: false },
      'email': { view: true, edit: false },
      'eventDate': { view: true, edit: false },
      'status': { view: true, edit: false },
      'priority': { view: true, edit: false },
      'area': { view: true, edit: false },
      'type': { view: true, edit: false },
      'channel': { view: true, edit: false },
      'assignedExecutive': { view: true, edit: false },
      'notes': { view: true, edit: false },
      // Para usuarios
      'role': { view: false, edit: false }
    }
  },
  {
    userId: '5',
    userName: 'Anetth',
    userEmail: 'anetth@example.com',
    canDeleteRecord: false, // No puede eliminar registros
    fieldPermissions: {
      // Para eventos/bodas - solo lectura de campos básicos
      'name': { view: true, edit: false },
      'phone': { view: true, edit: false },
      'email': { view: true, edit: false },
      'eventDate': { view: true, edit: false },
      'status': { view: true, edit: false },
      'priority': { view: true, edit: false },
      'area': { view: true, edit: false },
      'type': { view: true, edit: false },
      'channel': { view: true, edit: false },
      'assignedExecutive': { view: true, edit: false },
      'notes': { view: true, edit: false },
      // Para usuarios
      'role': { view: false, edit: false }
    }
  },
  {
    userId: '6',
    userName: 'Andrea',
    userEmail: 'andrea@example.com',
    canDeleteRecord: false, // No puede eliminar registros
    fieldPermissions: {
      // Para eventos/bodas - solo lectura de campos básicos
      'name': { view: true, edit: false },
      'phone': { view: true, edit: false },
      'email': { view: true, edit: false },
      'eventDate': { view: true, edit: false },
      'status': { view: true, edit: false },
      'priority': { view: true, edit: false },
      'area': { view: true, edit: false },
      'type': { view: true, edit: false },
      'channel': { view: true, edit: false },
      'assignedExecutive': { view: true, edit: false },
      'notes': { view: true, edit: false },
      // Para usuarios
      'role': { view: false, edit: false }
    }
  },
  {
    userId: '7',
    userName: 'Hugo',
    userEmail: 'hugo@example.com',
    canDeleteRecord: false, // No puede eliminar registros
    fieldPermissions: {
      // Para eventos/bodas - solo lectura de campos básicos
      'name': { view: true, edit: false },
      'phone': { view: true, edit: false },
      'email': { view: true, edit: false },
      'eventDate': { view: true, edit: false },
      'status': { view: true, edit: false },
      'priority': { view: true, edit: false },
      'area': { view: true, edit: false },
      'type': { view: true, edit: false },
      'channel': { view: true, edit: false },
      'assignedExecutive': { view: true, edit: false },
      'notes': { view: true, edit: false },
      // Para usuarios
      'role': { view: false, edit: false }
    }
  }
];

// Funciones de utilidad
export function getUserFieldPermissions(userId: string): UserFieldPermission | null {
  return USER_SPECIFIC_PERMISSIONS.find(user => user.userId === userId) || null;
}

export function hasUserFieldPermission(
  userId: string,
  fieldId: string,
  action: PermissionAction
): boolean {
  const userPermissions = getUserFieldPermissions(userId);
  if (!userPermissions) return false;
  
  const fieldPermission = userPermissions.fieldPermissions[fieldId];
  if (!fieldPermission) return false;
  
  return fieldPermission[action];
}

export function canUserDeleteRecord(userId: string): boolean {
  const userPermissions = getUserFieldPermissions(userId);
  return userPermissions?.canDeleteRecord || false;
}

export function getUserVisibleFields(userId: string, entityType: 'user' | 'event'): FieldDefinition[] {
  const allFields = entityType === 'user' ? USER_FIELDS : EVENT_FIELDS;
  const userPermissions = getUserFieldPermissions(userId);
  
  if (!userPermissions) return [];
  
  return allFields.filter(field => 
    userPermissions.fieldPermissions[field.fieldId]?.view === true
  );
}

export function getUserEditableFields(userId: string, entityType: 'user' | 'event'): FieldDefinition[] {
  const allFields = entityType === 'user' ? USER_FIELDS : EVENT_FIELDS;
  const userPermissions = getUserFieldPermissions(userId);
  
  if (!userPermissions) return [];
  
  return allFields.filter(field => 
    userPermissions.fieldPermissions[field.fieldId]?.edit === true
  );
}

export function updateUserFieldPermission(
  userId: string,
  fieldId: string,
  action: PermissionAction,
  hasPermission: boolean
): UserFieldPermission[] {
  const updatedPermissions = [...USER_SPECIFIC_PERMISSIONS];
  const userIndex = updatedPermissions.findIndex(user => user.userId === userId);
  
  if (userIndex === -1) return updatedPermissions;
  
  if (!updatedPermissions[userIndex].fieldPermissions[fieldId]) {
    updatedPermissions[userIndex].fieldPermissions[fieldId] = {
      view: false,
      edit: false
    };
  }
  
  updatedPermissions[userIndex].fieldPermissions[fieldId][action] = hasPermission;
  
  return updatedPermissions;
}

export function updateUserDeletePermission(
  userId: string,
  canDelete: boolean
): UserFieldPermission[] {
  const updatedPermissions = [...USER_SPECIFIC_PERMISSIONS];
  const userIndex = updatedPermissions.findIndex(user => user.userId === userId);
  
  if (userIndex === -1) return updatedPermissions;
  
  updatedPermissions[userIndex].canDeleteRecord = canDelete;
  
  return updatedPermissions;
}

export function addUserToPermissions(
  userId: string,
  userName: string,
  userEmail: string
): UserFieldPermission {
  const newUserPermission: UserFieldPermission = {
    userId,
    userName,
    userEmail,
    canDeleteRecord: false,
    fieldPermissions: {}
  };
  
  // Inicializar todos los campos con permisos mínimos
  [...USER_FIELDS, ...EVENT_FIELDS].forEach(field => {
    newUserPermission.fieldPermissions[field.fieldId] = {
      view: false,
      edit: false
    };
  });
  
  return newUserPermission;
}