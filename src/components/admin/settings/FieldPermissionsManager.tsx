/**
 * Field Permissions Manager
 * Gestor de permisos granulares por campo
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, Edit3, Trash2, Shield, Settings, Save } from 'lucide-react';
import { USER_FIELD_PERMISSIONS, type FieldPermission } from '@/lib/field-permissions';

const AVAILABLE_ROLES = [
  'SuperAdmin',
  'Propietario', 
  'Gestor',
  'Vendedor',
  'GerenteBanquetes',
  'Coordinador',
  'Planner'
];

const ACTION_ICONS = {
  view: Eye,
  edit: Edit3,
  delete: Trash2
};

const ACTION_COLORS = {
  view: 'text-blue-600',
  edit: 'text-green-600',
  delete: 'text-red-600'
};

const ACTION_LABELS = {
  view: 'Ver',
  edit: 'Editar',
  delete: 'Eliminar'
};

export function FieldPermissionsManager() {
  const [permissions, setPermissions] = useState<FieldPermission[]>(USER_FIELD_PERMISSIONS);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Actualizar permisos de un campo específico
  const updateFieldPermission = (
    fieldId: string,
    action: 'view' | 'edit' | 'delete',
    role: string,
    hasPermission: boolean
  ) => {
    setPermissions(prev => prev.map(field => {
      if (field.fieldId === fieldId) {
        const newPermissions = { ...field.permissions };
        if (hasPermission) {
          if (!newPermissions[action].includes(role)) {
            newPermissions[action] = [...newPermissions[action], role];
          }
        } else {
          newPermissions[action] = newPermissions[action].filter(r => r !== role);
        }
        return { ...field, permissions: newPermissions };
      }
      return field;
    }));
    setHasChanges(true);
  };

  // Guardar cambios
  const saveChanges = async () => {
    try {
      console.log('💾 Guardando permisos de campo:', permissions);
      // Aquí iría la llamada a la API para guardar
      // await saveFieldPermissions(permissions);
      setHasChanges(false);
      alert('Permisos guardados correctamente');
    } catch (error) {
      console.error('Error guardando permisos:', error);
      alert('Error al guardar permisos');
    }
  };

  // Obtener estadísticas de permisos
  const getPermissionStats = (fieldId: string) => {
    const field = permissions.find(f => f.fieldId === fieldId);
    if (!field) return { view: 0, edit: 0, delete: 0 };
    
    return {
      view: field.permissions.view.length,
      edit: field.permissions.edit.length,
      delete: field.permissions.delete.length
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permisos Granulares por Campo
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configura qué roles pueden ver, editar o eliminar cada campo específico
              </p>
            </div>
            {hasChanges && (
              <Button onClick={saveChanges} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Guardar Cambios
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Vista de resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {permissions.map((field) => {
          const stats = getPermissionStats(field.fieldId);
          const isSelected = selectedField === field.fieldId;
          
          return (
            <Card 
              key={field.fieldId}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedField(isSelected ? null : field.fieldId)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  {field.fieldName}
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-blue-600">
                      <Eye className="h-3 w-3" />
                      <span>Ver</span>
                    </div>
                    <Badge variant="outline">{stats.view} roles</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <Edit3 className="h-3 w-3" />
                      <span>Editar</span>
                    </div>
                    <Badge variant="outline">{stats.edit} roles</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-red-600">
                      <Trash2 className="h-3 w-3" />
                      <span>Eliminar</span>
                    </div>
                    <Badge variant="outline">{stats.delete} roles</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Panel de configuración detallada */}
      {selectedField && (
        <Card>
          <CardHeader>
            <CardTitle>
              Configuración de Permisos: {permissions.find(f => f.fieldId === selectedField)?.fieldName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(['view', 'edit', 'delete'] as const).map((action) => {
                const Icon = ACTION_ICONS[action];
                const field = permissions.find(f => f.fieldId === selectedField);
                
                return (
                  <div key={action} className="space-y-3">
                    <div className={`flex items-center gap-2 ${ACTION_COLORS[action]}`}>
                      <Icon className="h-4 w-4" />
                      <Label className="text-sm font-medium">
                        {ACTION_LABELS[action]} Campo
                      </Label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
                      {AVAILABLE_ROLES.map((role) => {
                        const hasPermission = field?.permissions[action].includes(role) || false;
                        
                        return (
                          <div key={role} className="flex items-center space-x-2 p-2 rounded border">
                            <Switch
                              checked={hasPermission}
                              onCheckedChange={(checked) => 
                                updateFieldPermission(selectedField, action, role, checked)
                              }
                            />
                            <Label className="text-sm flex-1">{role}</Label>
                            {hasPermission && (
                              <Badge variant="secondary" className="text-xs">
                                ✓
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de ayuda */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>💡 Cómo usar:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Ver:</strong> El rol puede visualizar el campo</li>
              <li><strong>Editar:</strong> El rol puede modificar el valor del campo</li>
              <li><strong>Eliminar:</strong> El rol puede eliminar/limpiar el campo</li>
            </ul>
            <p className="mt-3">
              <strong>⚠️ Nota:</strong> Los permisos son jerárquicos. Si un rol no puede "ver" un campo, 
              tampoco podrá editarlo o eliminarlo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}