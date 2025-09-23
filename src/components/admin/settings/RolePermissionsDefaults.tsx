'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Shield, Info, Eye, Edit, Trash, Users, RefreshCw } from 'lucide-react';
import { UserRole } from '@/types';
import { EVENT_FIELDS, USER_FIELDS } from '@/lib/user-field-permissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ROLE_PERMISSIONS_CONFIG, 
  getRoleConfig, 
  getRolePermissionStats,
  exportRolePermissions 
} from '@/lib/role-permissions-config';

// Configuración de permisos predeterminados por rol
export interface RoleDefaultPermissions {
  role: UserRole;
  permissions: {
    [fieldId: string]: {
      view: boolean;
      edit: boolean;
    };
  };
  canDelete: boolean;
}

// Etiquetas para roles (usando configuración centralizada)
const ROLE_LABELS = Object.fromEntries(
  ROLE_PERMISSIONS_CONFIG.map(config => [
    config.role, 
    `${config.icon} ${config.displayName}`
  ])
);

// Configuración inicial de permisos por rol (ahora usa la configuración centralizada)
const getInitialRolePermissions = (): RoleDefaultPermissions[] => {
  return ROLE_PERMISSIONS_CONFIG.map(config => ({
    role: config.role,
    canDelete: config.canDelete,
    permissions: config.permissions
  }));
};

export function RolePermissionsDefaults() {
  const [rolePermissions, setRolePermissions] = useState<RoleDefaultPermissions[]>(getInitialRolePermissions());
  const [selectedRole, setSelectedRole] = useState<UserRole>('VENDEDOR');
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<'event' | 'user'>('event');

  // Filtrar campos según la entidad seleccionada
  const getCurrentFields = () => {
    return selectedEntity === 'event' ? EVENT_FIELDS : USER_FIELDS;
  };

  // Obtener permisos del rol seleccionado
  const getCurrentRolePermissions = () => {
    return rolePermissions.find(rp => rp.role === selectedRole);
  };

  // Actualizar permiso específico
  const updatePermission = (fieldId: string, action: 'view' | 'edit', value: boolean) => {
    setRolePermissions(prev => 
      prev.map(roleData => 
        roleData.role === selectedRole
          ? {
              ...roleData,
              permissions: {
                ...roleData.permissions,
                [fieldId]: {
                  ...roleData.permissions[fieldId],
                  [action]: value,
                  // Si se quita view, también quitar edit
                  ...(action === 'view' && !value ? { edit: false } : {}),
                  // Si se pone edit, también poner view
                  ...(action === 'edit' && value ? { view: true } : {})
                }
              }
            }
          : roleData
      )
    );
    setHasChanges(true);
  };

  // Actualizar permiso de eliminar
  const updateDeletePermission = (value: boolean) => {
    setRolePermissions(prev => 
      prev.map(roleData => 
        roleData.role === selectedRole
          ? { ...roleData, canDelete: value }
          : roleData
      )
    );
    setHasChanges(true);
  };

  // Aplicar permisos predeterminados a un rol
  const applyDefaults = (role: UserRole) => {
    const defaultConfig = getRoleConfig(role);
    
    if (defaultConfig) {
      setRolePermissions(prev => 
        prev.map(roleData => 
          roleData.role === role 
            ? {
                role: defaultConfig.role,
                canDelete: defaultConfig.canDelete,
                permissions: defaultConfig.permissions
              }
            : roleData
        )
      );
      setHasChanges(true);
    }
  };

  // Guardar cambios
  const saveChanges = async () => {
    try {
      console.log('💾 Guardando configuración de permisos por rol:', rolePermissions);
      
      // Aquí iría la llamada a la API para guardar en la base de datos
      // await saveRolePermissionsDefaults(rolePermissions);
      
      // Por ahora, guardar en localStorage como respaldo
      localStorage.setItem('rolePermissionsDefaults', JSON.stringify(rolePermissions));
      
      setHasChanges(false);
      alert('Configuración de permisos por rol guardada correctamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar la configuración');
    }
  };

  // Cargar configuración guardada
  useEffect(() => {
    const saved = localStorage.getItem('rolePermissionsDefaults');
    if (saved) {
      try {
        const parsedPermissions = JSON.parse(saved);
        setRolePermissions(parsedPermissions);
      } catch (error) {
        console.error('Error cargando configuración guardada:', error);
      }
    }
  }, []);

  const currentRole = getCurrentRolePermissions();
  const fields = getCurrentFields();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permisos Predeterminados por Rol
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configura los permisos base que tendrá cada rol al asignar usuarios
              </p>
            </div>
            {hasChanges && (
              <Button onClick={saveChanges} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Guardar Configuración
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Información */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>💡 Cómo funciona:</strong> Estos permisos se aplican automáticamente cuando asignas un rol a un usuario. 
          Después puedes personalizar permisos específicos en "User Permissions".
        </AlertDescription>
      </Alert>

      {/* Selector de rol */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Seleccionar Rol a Configurar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(ROLE_LABELS).map(([role, label]) => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRole(role as UserRole)}
                className="justify-start h-auto p-3"
              >
                <div className="text-left">
                  <div className="font-medium text-xs">{label}</div>
                </div>
              </Button>
            ))}
          </div>
          
          {/* Botón para restaurar valores predeterminados */}
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyDefaults(selectedRole)}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Restaurar Permisos Predeterminados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de permisos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Permisos para: {ROLE_LABELS[selectedRole]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedEntity} onValueChange={(value: string) => setSelectedEntity(value as 'event' | 'user')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="event">Campos de Eventos</TabsTrigger>
              <TabsTrigger value="user">Campos de Usuarios</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedEntity} className="mt-6">
              {/* Permiso de eliminar registros */}
              <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-900">Permiso de Eliminación</h4>
                    <p className="text-sm text-red-700">
                      Permite eliminar registros completos del sistema
                    </p>
                  </div>
                  <Switch
                    checked={currentRole?.canDelete || false}
                    onCheckedChange={updateDeletePermission}
                  />
                </div>
              </div>

              {/* Campos específicos */}
              <div className="space-y-4">
                <h4 className="font-medium">Permisos por Campo</h4>
                <div className="grid gap-3">
                  {fields.map((field) => {
                    const fieldPermissions = currentRole?.permissions[field.fieldId] || { view: false, edit: false };
                    
                    return (
                      <div key={field.fieldId} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h5 className="font-medium">{field.fieldName}</h5>
                            <p className="text-xs text-gray-600">{field.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {field.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={fieldPermissions.view}
                              onCheckedChange={(checked) => updatePermission(field.fieldId, 'view', checked)}
                            />
                            <Label className="flex items-center gap-1 text-sm">
                              <Eye className="h-3 w-3" />
                              Ver
                            </Label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={fieldPermissions.edit}
                              onCheckedChange={(checked) => updatePermission(field.fieldId, 'edit', checked)}
                              disabled={!fieldPermissions.view}
                            />
                            <Label className="flex items-center gap-1 text-sm">
                              <Edit className="h-3 w-3" />
                              Editar
                            </Label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resumen de permisos */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Permisos por Rol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rolePermissions.map((roleData) => {
              const eventPermissions = EVENT_FIELDS.map(field => roleData.permissions[field.fieldId]).filter(Boolean);
              const userPermissions = USER_FIELDS.map(field => roleData.permissions[field.fieldId]).filter(Boolean);
              
              const eventViewCount = eventPermissions.filter(p => p?.view).length;
              const eventEditCount = eventPermissions.filter(p => p?.edit).length;
              const userViewCount = userPermissions.filter(p => p?.view).length;
              const userEditCount = userPermissions.filter(p => p?.edit).length;
              
              return (
                <div key={roleData.role} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">{ROLE_LABELS[roleData.role]}</h4>
                  <div className="space-y-2 text-sm">
                    <div>📅 Eventos: {eventViewCount} ver, {eventEditCount} editar</div>
                    <div>👥 Usuarios: {userViewCount} ver, {userEditCount} editar</div>
                    <div className="flex items-center gap-2">
                      <Trash className="h-3 w-3" />
                      Eliminar: {roleData.canDelete ? '✅' : '❌'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}