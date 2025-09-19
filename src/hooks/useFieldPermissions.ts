/**
 * Field Permissions Hooks
 * Custom hooks para gestionar permisos granulares por campo
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  USER_FIELD_PERMISSIONS,
  hasFieldPermission,
  getVisibleFields,
  getEditableFields,
  type FieldPermission 
} from '@/lib/field-permissions';

// Tipo para el usuario actual (mock)
interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Hook para obtener permisos de campo
export function useFieldPermissions() {
  const [fieldPermissions, setFieldPermissions] = useState<FieldPermission[]>(USER_FIELD_PERMISSIONS);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Simular usuario actual (en producción vendría del contexto de autenticación)
  useEffect(() => {
    // Mock current user - en producción esto vendría del contexto de auth
    setCurrentUser({
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'SuperAdmin'
    });
  }, []);

  // Obtener permisos para un campo específico
  const getFieldPermissions = (fieldId: string) => {
    if (!currentUser) return { canView: false, canEdit: false, canDelete: false };

    return {
      canView: hasFieldPermission(fieldPermissions, fieldId, 'view', currentUser.role),
      canEdit: hasFieldPermission(fieldPermissions, fieldId, 'edit', currentUser.role),
      canDelete: hasFieldPermission(fieldPermissions, fieldId, 'delete', currentUser.role)
    };
  };

  // Obtener todos los campos visibles para el usuario actual
  const visibleFields = useMemo(() => {
    if (!currentUser) return [];
    return getVisibleFields(fieldPermissions, currentUser.role);
  }, [fieldPermissions, currentUser]);

  // Obtener todos los campos editables para el usuario actual
  const editableFields = useMemo(() => {
    if (!currentUser) return [];
    return getEditableFields(fieldPermissions, currentUser.role);
  }, [fieldPermissions, currentUser]);

  // Verificar si un campo es visible
  const isFieldVisible = (fieldId: string) => {
    return visibleFields.some(field => field.fieldId === fieldId);
  };

  // Verificar si un campo es editable
  const isFieldEditable = (fieldId: string) => {
    return editableFields.some(field => field.fieldId === fieldId);
  };

  // Guardar permisos actualizados
  const saveFieldPermissions = async (newPermissions: FieldPermission[]) => {
    try {
      // En producción aquí iría la llamada a la API
      console.log('💾 Guardando permisos:', newPermissions);
      setFieldPermissions(newPermissions);
      return { success: true };
    } catch (error) {
      console.error('Error guardando permisos:', error);
      return { success: false, error };
    }
  };

  return {
    fieldPermissions,
    currentUser,
    visibleFields,
    editableFields,
    getFieldPermissions,
    isFieldVisible,
    isFieldEditable,
    saveFieldPermissions
  };
}

// Hook para filtrar datos de usuario según permisos
export function useFilteredUserData(userData: any) {
  const { visibleFields, isFieldVisible } = useFieldPermissions();

  const filteredData = useMemo(() => {
    if (!userData || !visibleFields.length) return userData;

    // Si es un array de usuarios
    if (Array.isArray(userData)) {
      return userData.map(user => filterUserFields(user));
    }

    // Si es un solo usuario
    return filterUserFields(userData);
  }, [userData, visibleFields]);

  function filterUserFields(user: any) {
    const filtered: any = {};
    
    // Solo incluir campos que el usuario puede ver
    Object.keys(user || {}).forEach(key => {
      if (isFieldVisible(key)) {
        filtered[key] = user[key];
      }
    });

    return filtered;
  }

  return filteredData;
}

// Hook para formularios con permisos de campo
export function useFieldForm() {
  const { getFieldPermissions, isFieldEditable } = useFieldPermissions();

  // Verificar si un campo puede ser editado en un formulario
  const canEditField = (fieldId: string) => {
    const permissions = getFieldPermissions(fieldId);
    return permissions.canEdit && isFieldEditable(fieldId);
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
        errors.push(`Campo ${fieldId} no es visible para su rol`);
        return;
      }

      if (!config.editable && value !== undefined) {
        errors.push(`Campo ${fieldId} no es editable para su rol`);
        return;
      }

      validatedData[fieldId] = value;
    });

    return { data: validatedData, errors };
  };

  return {
    canEditField,
    getFieldConfig,
    validateFormData
  };
}