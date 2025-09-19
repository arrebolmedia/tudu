'use client';

/**
 * Access Control Components
 * Reusable components for role-based access control
 */

import React, { ReactNode } from 'react';
import { 
  SystemRole, 
  EntityName, 
  ActionType,
  FieldMode
} from '@/types/authorization';
import { useAuthorization, hasRole, useAuthContext } from '@/hooks/useAuthorization';

// ===== ROLE-BASED ACCESS CONTROL =====

interface ProtectedComponentProps {
  roles?: SystemRole | SystemRole[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function ProtectedComponent({ roles, fallback = null, children }: ProtectedComponentProps) {
  const { user } = useAuthContext();
  
  if (!user) {
    return <>{fallback}</>;
  }

  if (roles && !hasRole(user, roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ===== ACTION-BASED ACCESS CONTROL =====

interface CanPerformProps {
  action: ActionType;
  entity: EntityName;
  resource?: any;
  fallback?: ReactNode;
  children: ReactNode;
}

export function CanPerform({ action, entity, resource, fallback = null, children }: CanPerformProps) {
  const { can } = useAuthorization();
  const [canPerform, setCanPerform] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    can(action, entity, resource).then(setCanPerform);
  }, [action, entity, resource, can]);

  if (canPerform === null) {
    // Loading state
    return <div className="animate-pulse bg-gray-200 rounded h-4"></div>;
  }

  if (!canPerform) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ===== FIELD-LEVEL ACCESS CONTROL =====

interface ProtectedFieldProps {
  entity: EntityName;
  field: string;
  mode?: FieldMode;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedField({ 
  entity, 
  field, 
  mode = 'read', 
  children, 
  fallback = null 
}: ProtectedFieldProps) {
  const { canAccess } = useAuthorization();

  if (!canAccess(field, entity, mode)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ===== CONDITIONAL INPUT FIELD =====

interface ConditionalInputProps {
  entity: EntityName;
  field: string;
  value: any;
  onChange?: (value: any) => void;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'email' | 'number' | 'password' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
}

export function ConditionalInput({ 
  entity, 
  field, 
  value, 
  onChange, 
  placeholder,
  className = '',
  type = 'text',
  options = []
}: ConditionalInputProps) {
  const { getFieldMode, maskPayload } = useAuthorization();
  const fieldMode = getFieldMode(field, entity);

  // Hidden fields don't render
  if (fieldMode === 'hidden') {
    return null;
  }

  // Masked fields show protected value
  if (fieldMode === 'mask') {
    const maskedValue = maskPayload(entity, { [field]: value })[field];
    return (
      <div className={`px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 ${className}`}>
        {maskedValue || '***'}
      </div>
    );
  }

  // Read-only fields
  if (fieldMode === 'read') {
    if (type === 'select' && options.length > 0) {
      const selectedOption = options.find(opt => opt.value === value);
      return (
        <div className={`px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 ${className}`}>
          {selectedOption?.label || value || '-'}
        </div>
      );
    }
    
    return (
      <div className={`px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 ${className}`}>
        {value || '-'}
      </div>
    );
  }

  // Editable fields
  const baseClassName = `w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`;

  if (type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`${baseClassName} resize-vertical`}
        rows={3}
      />
    );
  }

  if (type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className={baseClassName}
      >
        <option value="">{placeholder || 'Seleccionar...'}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={baseClassName}
    />
  );
}

// ===== ADMIN PANEL WRAPPER =====

interface AdminPanelProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function AdminPanel({ children, title, description }: AdminPanelProps) {
  return (
    <ProtectedComponent 
      roles={['SuperAdmin', 'Propietario']}
      fallback={
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Acceso Denegado
          </h3>
          <p className="text-red-600">
            No tienes permisos para acceder a esta sección administrativa.
          </p>
        </div>
      }
    >
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="text-gray-600 mt-2">{description}</p>
          )}
        </div>
      )}
      {children}
    </ProtectedComponent>
  );
}

// ===== ROLE BADGE =====

interface RoleBadgeProps {
  role: SystemRole;
  size?: 'sm' | 'md' | 'lg';
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const roleColors: Record<SystemRole, string> = {
    SuperAdmin: 'bg-red-100 text-red-800 border-red-200',
    Propietario: 'bg-purple-100 text-purple-800 border-purple-200',
    Gestor: 'bg-blue-100 text-blue-800 border-blue-200',
    Vendedor: 'bg-green-100 text-green-800 border-green-200',
    GerenteBanquetes: 'bg-orange-100 text-orange-800 border-orange-200',
    Coordinador: 'bg-blue-100 text-blue-800 border-blue-200',
    Planner: 'bg-pink-100 text-pink-800 border-pink-200'
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${sizeClasses[size]} 
      ${roleColors[role]}
    `}>
      {role}
    </span>
  );
}

// ===== PERMISSION INDICATOR =====

interface PermissionIndicatorProps {
  action: ActionType;
  entity: EntityName;
  resource?: any;
  showText?: boolean;
}

export function PermissionIndicator({ 
  action, 
  entity, 
  resource, 
  showText = false 
}: PermissionIndicatorProps) {
  const { can } = useAuthorization();
  const [canPerform, setCanPerform] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    can(action, entity, resource).then(setCanPerform);
  }, [action, entity, resource, can]);

  if (canPerform === null) {
    return <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>;
  }

  const color = canPerform ? 'text-green-500' : 'text-red-500';
  const icon = canPerform ? '✓' : '✗';

  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <span className="text-sm">{icon}</span>
      {showText && (
        <span className="text-xs">
          {canPerform ? 'Permitido' : 'Denegado'}
        </span>
      )}
    </div>
  );
}

// ===== LOADING WRAPPER =====

interface AuthLoadingWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthLoadingWrapper({ children, fallback }: AuthLoadingWrapperProps) {
  const { isLoading } = useAuthorization();

  if (isLoading) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}