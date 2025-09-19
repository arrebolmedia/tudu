/**
 * User Protected Field Component
 * Componente que aplica permisos granulares por usuario específico
 */

'use client';

import { ReactNode } from 'react';
import { useUserFieldPermissions } from '@/hooks/useUserFieldPermissions';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Lock, Edit3, Trash2 } from 'lucide-react';

interface UserProtectedFieldProps {
  fieldId: string;
  children: ReactNode;
  targetUserId?: string;
  entityType?: 'user' | 'event';
  showPermissionBadge?: boolean;
  fallback?: ReactNode;
  className?: string;
}

export function UserProtectedField({ 
  fieldId, 
  children, 
  targetUserId,
  entityType = 'event',
  showPermissionBadge = false,
  fallback = null,
  className = ''
}: UserProtectedFieldProps) {
  const { getFieldPermissions } = useUserFieldPermissions(targetUserId);
  const permissions = getFieldPermissions(fieldId);

  // Si no puede ver el campo, mostrar fallback o nada
  if (!permissions.canView) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      
      {showPermissionBadge && (
        <div className="absolute top-0 right-0 flex gap-1">
          {permissions.canView && (
            <Badge variant="outline" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Badge>
          )}
          {permissions.canEdit && (
            <Badge variant="outline" className="text-xs">
              <Edit3 className="h-3 w-3 mr-1" />
              Editar
            </Badge>
          )}
          {permissions.canDelete && (
            <Badge variant="outline" className="text-xs">
              <Trash2 className="h-3 w-3 mr-1" />
              Eliminar
            </Badge>
          )}
          {!permissions.canEdit && permissions.canView && (
            <Badge variant="secondary" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Solo lectura
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

interface UserProtectedInputProps {
  fieldId: string;
  children: ReactNode;
  targetUserId?: string;
  entityType?: 'user' | 'event';
  className?: string;
}

export function UserProtectedInput({ 
  fieldId, 
  children, 
  targetUserId,
  entityType = 'event',
  className = '' 
}: UserProtectedInputProps) {
  const { getFieldPermissions, getUserInfo } = useUserFieldPermissions(targetUserId);
  const permissions = getFieldPermissions(fieldId);
  const userInfo = getUserInfo();

  // Si no puede ver el campo, no mostrar nada
  if (!permissions.canView) {
    return null;
  }

  // Si no puede editar, hacer readonly
  if (!permissions.canEdit) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          {children}
          <div className="absolute inset-0 bg-gray-100 opacity-50 rounded cursor-not-allowed" />
          <Lock className="absolute top-2 right-2 h-4 w-4 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {userInfo?.userName || 'Este usuario'} no tiene permisos para editar este campo
        </p>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

interface UserFieldPermissionIndicatorProps {
  fieldId: string;
  targetUserId?: string;
  entityType?: 'user' | 'event';
  compact?: boolean;
}

export function UserFieldPermissionIndicator({ 
  fieldId, 
  targetUserId,
  entityType = 'event',
  compact = false 
}: UserFieldPermissionIndicatorProps) {
  const { getFieldPermissions, getUserInfo } = useUserFieldPermissions(targetUserId);
  const permissions = getFieldPermissions(fieldId);
  const userInfo = getUserInfo();

  if (compact) {
    return (
      <div className="flex gap-1" title={`Permisos para: ${userInfo?.userName || 'Usuario'}`}>
        {permissions.canView && <Eye className="h-3 w-3 text-blue-500" />}
        {permissions.canEdit && <Edit3 className="h-3 w-3 text-green-500" />}
        {permissions.canDelete && <Trash2 className="h-3 w-3 text-red-500" />}
        {!permissions.canEdit && permissions.canView && <Lock className="h-3 w-3 text-gray-400" />}
      </div>
    );
  }

  return (
    <div className="flex gap-2 text-xs">
      <div className="text-xs text-muted-foreground mb-1">
        {userInfo?.userName || 'Usuario desconocido'}:
      </div>
      {permissions.canView && (
        <div className="flex items-center gap-1 text-blue-600">
          <Eye className="h-3 w-3" />
          <span>Visible</span>
        </div>
      )}
      {permissions.canEdit && (
        <div className="flex items-center gap-1 text-green-600">
          <Edit3 className="h-3 w-3" />
          <span>Editable</span>
        </div>
      )}
      {permissions.canDelete && (
        <div className="flex items-center gap-1 text-red-600">
          <Trash2 className="h-3 w-3" />
          <span>Eliminable</span>
        </div>
      )}
      {!permissions.canView && (
        <div className="flex items-center gap-1 text-gray-400">
          <EyeOff className="h-3 w-3" />
          <span>No visible</span>
        </div>
      )}
      {permissions.canView && !permissions.canEdit && (
        <div className="flex items-center gap-1 text-orange-600">
          <Lock className="h-3 w-3" />
          <span>Solo lectura</span>
        </div>
      )}
    </div>
  );
}

// Componente para mostrar un resumen de permisos de usuario
interface UserPermissionSummaryProps {
  targetUserId?: string;
  entityType?: 'user' | 'event';
  showDetails?: boolean;
}

export function UserPermissionSummary({ 
  targetUserId, 
  entityType = 'event',
  showDetails = false 
}: UserPermissionSummaryProps) {
  const { getVisibleFields, getEditableFields, getUserInfo } = useUserFieldPermissions(targetUserId);
  
  const visibleFields = getVisibleFields(entityType);
  const editableFields = getEditableFields(entityType);
  const userInfo = getUserInfo();

  if (!userInfo) {
    return (
      <div className="text-sm text-muted-foreground">
        Usuario no encontrado
      </div>
    );
  }

  const deleteCount = Object.values(userInfo.fieldPermissions)
    .filter(permission => permission.delete).length;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">
        Permisos de {userInfo.userName}
      </div>
      
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1 text-blue-600">
          <Eye className="h-3 w-3" />
          <span>{visibleFields.length} campos visibles</span>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <Edit3 className="h-3 w-3" />
          <span>{editableFields.length} campos editables</span>
        </div>
        <div className="flex items-center gap-1 text-red-600">
          <Trash2 className="h-3 w-3" />
          <span>{deleteCount} campos eliminables</span>
        </div>
      </div>

      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <div>
            <div className="font-medium text-blue-600 mb-1">Puede Ver:</div>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600">
              {visibleFields.map(field => (
                <li key={field.fieldId}>{field.fieldName}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="font-medium text-green-600 mb-1">Puede Editar:</div>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600">
              {editableFields.map(field => (
                <li key={field.fieldId}>{field.fieldName}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="font-medium text-red-600 mb-1">Puede Eliminar:</div>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600">
              {Object.entries(userInfo.fieldPermissions)
                .filter(([_, permission]) => permission.delete)
                .map(([fieldId, _]) => {
                  const allFields = [...visibleFields, ...editableFields];
                  const field = allFields.find(f => f.fieldId === fieldId);
                  return field ? <li key={fieldId}>{field.fieldName}</li> : null;
                })}
              {deleteCount === 0 && <li className="text-gray-400">Ninguno</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}