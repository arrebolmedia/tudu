/**
 * User Field Permissions Hooks
 * Custom hooks para gestionar permisos granulares por usuario específico
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  USER_SPECIFIC_PERMISSIONS,
  USER_FIELDS,
  EVENT_FIELDS,
  getUserFieldPermissions,
  hasUserFieldPermission,
  getUserVisibleFields,
  getUserEditableFields,
  canUserDeleteRecord,
  type UserFieldPermission,
  type FieldDefinition,
  type PermissionAction 
} from '@/lib/user-field-permissions';

// Tipo para el usuario actual (mock)
interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Hook principal para gestionar permisos de usuario
export function useUserFieldPermissions(targetUserId?: string) {
  const [userPermissions, setUserPermissions] = useState<UserFieldPermission[]>(USER_SPECIFIC_PERMISSIONS);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Simular usuario actual (en producción vendría del contexto de autenticación)
  useEffect(() => {
    // Mock current user - en producción esto vendría del contexto de auth
    setCurrentUser({
      id: '1', // Josefo Flores por defecto
      name: 'Josefo Flores',
      email: 'josefo@example.com',
      role: 'Vendedor'
    });
  }, []);

  // El usuario objetivo (por defecto es el usuario actual)
  const userId = targetUserId || currentUser?.id || '1';

  // Obtener permisos para un campo específico
  const getFieldPermissions = (fieldId: string) => {
    return {
      canView: hasUserFieldPermission(userId, fieldId, 'view'),
      canEdit: hasUserFieldPermission(userId, fieldId, 'edit'),
      canDelete: canUserDeleteRecord(userId) // Este es para todo el registro
    };
  };

  // Obtener todos los campos visibles para el usuario
  const getVisibleFields = (entityType: 'user' | 'event' = 'event') => {
    return getUserVisibleFields(userId, entityType);
  };

  // Obtener todos los campos editables para el usuario
  const getEditableFields = (entityType: 'user' | 'event' = 'event') => {
    return getUserEditableFields(userId, entityType);
  };

  // Verificar si un campo es visible
  const isFieldVisible = (fieldId: string, entityType: 'user' | 'event' = 'event') => {
    const visibleFields = getVisibleFields(entityType);
    return visibleFields.some(field => field.fieldId === fieldId);
  };

  // Verificar si un campo es editable
  const isFieldEditable = (fieldId: string, entityType: 'user' | 'event' = 'event') => {
    const editableFields = getEditableFields(entityType);
    return editableFields.some(field => field.fieldId === fieldId);
  };

  // Obtener información del usuario
  const getUserInfo = () => {
    return getUserFieldPermissions(userId);
  };

  // Guardar permisos actualizados
  const saveUserPermissions = async (newPermissions: UserFieldPermission[]) => {
    try {
      console.log('💾 Guardando permisos de usuario:', newPermissions);
      setUserPermissions(newPermissions);
      return { success: true };
    } catch (error) {
      console.error('Error guardando permisos:', error);
      return { success: false, error };
    }
  };

  return {
    currentUser,
    userId,
    userPermissions,
    getFieldPermissions,
    getVisibleFields,
    getEditableFields,
    isFieldVisible,
    isFieldEditable,
    getUserInfo,
    saveUserPermissions
  };
}

// Hook para filtrar datos según permisos de usuario
export function useFilteredData(data: any, entityType: 'user' | 'event' = 'event', targetUserId?: string) {
  const { getVisibleFields, isFieldVisible } = useUserFieldPermissions(targetUserId);

  const filteredData = useMemo(() => {
    if (!data) return data;

    const visibleFields = getVisibleFields(entityType);
    if (!visibleFields.length) return data;

    // Si es un array
    if (Array.isArray(data)) {
      return data.map(item => filterFields(item));
    }

    // Si es un solo objeto
    return filterFields(data);
  }, [data, entityType, targetUserId]);

  function filterFields(item: any) {
    const filtered: any = {};
    
    // Solo incluir campos que el usuario puede ver
    Object.keys(item || {}).forEach(key => {
      if (isFieldVisible(key, entityType)) {
        filtered[key] = item[key];
      }
    });

    return filtered;
  }

  return filteredData;
}

// Hook para formularios con validación de permisos
export function useUserFieldForm(entityType: 'user' | 'event' = 'event', targetUserId?: string) {
  const { getFieldPermissions, isFieldEditable } = useUserFieldPermissions(targetUserId);

  // Verificar si un campo puede ser editado en un formulario
  const canEditField = (fieldId: string) => {
    const permissions = getFieldPermissions(fieldId);
    return permissions.canEdit && isFieldEditable(fieldId, entityType);
  };

  // Obtener configuración de campo para formularios
  const getFieldConfig = (fieldId: string) => {
    const permissions = getFieldPermissions(fieldId);
    
    return {
      visible: permissions.canView,
      editable: permissions.canEdit,
      deletable: permissions.canDelete,
      disabled: !permissions.canEdit,
      readOnly: !permissions.canEdit
    };
  };

  // Validar datos de formulario según permisos
  const validateFormData = (formData: Record<string, any>) => {
    const validatedData: Record<string, any> = {};
    const errors: string[] = [];

    Object.entries(formData).forEach(([fieldId, value]) => {
      const config = getFieldConfig(fieldId);
      
      if (!config.visible) {
        errors.push(`Campo ${fieldId} no es visible para este usuario`);
        return;
      }

      if (!config.editable && value !== undefined) {
        errors.push(`Campo ${fieldId} no es editable para este usuario`);
        return;
      }

      validatedData[fieldId] = value;
    });

    return { data: validatedData, errors };
  };

  // Obtener campos disponibles para el tipo de entidad
  const getAvailableFields = () => {
    return entityType === 'user' ? USER_FIELDS : EVENT_FIELDS;
  };

  return {
    canEditField,
    getFieldConfig,
    validateFormData,
    getAvailableFields
  };
}

// Hook para gestionar permisos de múltiples usuarios
export function useMultiUserPermissions() {
  const [allUserPermissions, setAllUserPermissions] = useState<UserFieldPermission[]>(USER_SPECIFIC_PERMISSIONS);

  // Obtener permisos de un usuario específico
  const getUserPermissions = (userId: string) => {
    return allUserPermissions.find(user => user.userId === userId);
  };

  // Actualizar permisos de un usuario
  const updateUserPermissions = (updatedUser: UserFieldPermission) => {
    setAllUserPermissions(prev => 
      prev.map(user => user.userId === updatedUser.userId ? updatedUser : user)
    );
  };

  // Agregar nuevo usuario
  const addUser = (newUser: UserFieldPermission) => {
    setAllUserPermissions(prev => [...prev, newUser]);
  };

  // Eliminar usuario
  const removeUser = (userId: string) => {
    setAllUserPermissions(prev => prev.filter(user => user.userId !== userId));
  };

  // Obtener estadísticas de permisos
  const getPermissionStats = () => {
    return allUserPermissions.map(user => {
      const allFields = [...USER_FIELDS, ...EVENT_FIELDS];
      let totalView = 0, totalEdit = 0;
      
      allFields.forEach(field => {
        const permissions = user.fieldPermissions[field.fieldId];
        if (permissions?.view) totalView++;
        if (permissions?.edit) totalEdit++;
      });
      
      return {
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        stats: { 
          view: totalView, 
          edit: totalEdit, 
          canDelete: user.canDeleteRecord 
        }
      };
    });
  };

  return {
    allUserPermissions,
    getUserPermissions,
    updateUserPermissions,
    addUser,
    removeUser,
    getPermissionStats
  };
}