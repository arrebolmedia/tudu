/**
 * Protected Field Component
 * Componente que aplica permisos granulares a campos individuales
 */

'use client';

import { ReactNode } from 'react';
import { useFieldPermissions } from '@/hooks/useFieldPermissions';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Lock, Edit3 } from 'lucide-react';

interface ProtectedFieldProps {
  fieldId: string;
  children: ReactNode;
  showPermissionBadge?: boolean;
  fallback?: ReactNode;
  className?: string;
}

export function ProtectedField({ 
  fieldId, 
  children, 
  showPermissionBadge = false,
  fallback = null,
  className = ''
}: ProtectedFieldProps) {
  const { getFieldPermissions } = useFieldPermissions();
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

interface ProtectedInputProps {
  fieldId: string;
  children: ReactNode;
  className?: string;
}

export function ProtectedInput({ fieldId, children, className = '' }: ProtectedInputProps) {
  const { getFieldPermissions } = useFieldPermissions();
  const permissions = getFieldPermissions(fieldId);

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
          No tienes permisos para editar este campo
        </p>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

interface FieldPermissionIndicatorProps {
  fieldId: string;
  compact?: boolean;
}

export function FieldPermissionIndicator({ fieldId, compact = false }: FieldPermissionIndicatorProps) {
  const { getFieldPermissions } = useFieldPermissions();
  const permissions = getFieldPermissions(fieldId);

  if (compact) {
    return (
      <div className="flex gap-1">
        {permissions.canView && <Eye className="h-3 w-3 text-blue-500" />}
        {permissions.canEdit && <Edit3 className="h-3 w-3 text-green-500" />}
        {!permissions.canEdit && permissions.canView && <Lock className="h-3 w-3 text-gray-400" />}
      </div>
    );
  }

  return (
    <div className="flex gap-2 text-xs">
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