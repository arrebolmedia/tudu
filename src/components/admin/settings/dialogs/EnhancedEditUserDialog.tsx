/**
 * Enhanced Edit User Dialog with Field Permissions
 * Diálogo de edición con permisos granulares por campo
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Save, User, Mail, Shield, AlertCircle } from 'lucide-react';
import { ProtectedField, ProtectedInput, FieldPermissionIndicator } from '../ProtectedField';
import { useFieldForm } from '@/hooks/useFieldPermissions';

interface EnhancedEditUserDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    emailVerified: boolean;
    lastLogin?: string;
    createdAt?: string;
  } | null;
  open: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
}

export function EnhancedEditUserDialog({ user, open, onClose, onSave }: EnhancedEditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    emailVerified: false
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { canEditField, getFieldConfig, validateFormData } = useFieldForm();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'active',
        emailVerified: user.emailVerified || false
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setValidationErrors([]);
      
      // Validar datos según permisos
      const { data: validatedData, errors } = validateFormData(formData);
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      console.log('💾 Guardando usuario con permisos validados:', validatedData);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave({ ...validatedData, id: user.id });
      onClose();
    } catch (error) {
      console.error('❌ Error al guardar usuario:', error);
      setValidationErrors(['Error interno del servidor']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    // Verificar si el campo es editable antes de permitir cambios
    if (!canEditField(field)) {
      console.warn(`⚠️ Intento de editar campo protegido: ${field}`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Usuario - Permisos Aplicados
          </DialogTitle>
        </DialogHeader>

        {/* Errores de validación */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Errores de permisos:</span>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo Nombre */}
              <ProtectedField fieldId="name">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name">Nombre completo</Label>
                    <FieldPermissionIndicator fieldId="name" compact />
                  </div>
                  <ProtectedInput fieldId="name">
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nombre del usuario"
                      disabled={!getFieldConfig('name').editable}
                    />
                  </ProtectedInput>
                </div>
              </ProtectedField>

              {/* Campo Email */}
              <ProtectedField fieldId="email">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email">Email</Label>
                    <FieldPermissionIndicator fieldId="email" compact />
                  </div>
                  <ProtectedInput fieldId="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@ejemplo.com"
                        disabled={!getFieldConfig('email').editable}
                      />
                    </div>
                  </ProtectedInput>
                </div>
              </ProtectedField>
            </div>
          </div>

          {/* Rol y Estado */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Acceso y Permisos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo Rol */}
              <ProtectedField fieldId="role">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="role">Rol</Label>
                    <FieldPermissionIndicator fieldId="role" compact />
                  </div>
                  <ProtectedInput fieldId="role">
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleInputChange('role', value)}
                      disabled={!getFieldConfig('role').editable}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <SelectValue placeholder="Seleccionar rol" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SuperAdmin">
                          <div className="flex flex-col">
                            <span className="font-medium">Super Administrador</span>
                            <span className="text-xs text-muted-foreground">Acceso total al sistema</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Propietario">
                          <div className="flex flex-col">
                            <span className="font-medium">Propietario</span>
                            <span className="text-xs text-muted-foreground">Gestión completa del negocio</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Gestor">
                          <div className="flex flex-col">
                            <span className="font-medium">Gestor</span>
                            <span className="text-xs text-muted-foreground">Gestión operativa</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Vendedor">
                          <div className="flex flex-col">
                            <span className="font-medium">Vendedor</span>
                            <span className="text-xs text-muted-foreground">Gestión de ventas</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="GerenteBanquetes">
                          <div className="flex flex-col">
                            <span className="font-medium">Gerente Banquetes</span>
                            <span className="text-xs text-muted-foreground">Gestión de eventos</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Coordinador">
                          <div className="flex flex-col">
                            <span className="font-medium">Coordinador</span>
                            <span className="text-xs text-muted-foreground">Solo lectura de eventos asignados</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Planner">
                          <div className="flex flex-col">
                            <span className="font-medium">Planner</span>
                            <span className="text-xs text-muted-foreground">Planificación de bodas</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </ProtectedInput>
                </div>
              </ProtectedField>

              {/* Campo Estado */}
              <ProtectedField fieldId="status">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="status">Estado</Label>
                    <FieldPermissionIndicator fieldId="status" compact />
                  </div>
                  <ProtectedInput fieldId="status">
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                      disabled={!getFieldConfig('status').editable}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <Badge className="bg-green-100 text-green-800">Activo</Badge>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <Badge className="bg-red-100 text-red-800">Inactivo</Badge>
                        </SelectItem>
                        <SelectItem value="pending">
                          <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </ProtectedInput>
                </div>
              </ProtectedField>
            </div>

            {/* Campo Email Verificado */}
            <ProtectedField fieldId="emailVerified">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <Label htmlFor="emailVerified">Email verificado</Label>
                    <p className="text-sm text-muted-foreground">
                      Indica si el usuario ha verificado su dirección de email
                    </p>
                  </div>
                  <FieldPermissionIndicator fieldId="emailVerified" compact />
                </div>
                <ProtectedInput fieldId="emailVerified">
                  <Switch
                    id="emailVerified"
                    checked={formData.emailVerified}
                    onCheckedChange={(checked) => handleInputChange('emailVerified', checked)}
                    disabled={!getFieldConfig('emailVerified').editable}
                  />
                </ProtectedInput>
              </div>
            </ProtectedField>
          </div>

          {/* Información de solo lectura */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información del Sistema</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <ProtectedField fieldId="lastLogin" fallback={
                <div className="p-3 bg-gray-100 rounded">
                  <span>Último acceso: No visible</span>
                </div>
              }>
                <div className="p-3 bg-blue-50 rounded">
                  <span className="font-medium">Último acceso:</span>
                  <br />
                  {user.lastLogin || 'Nunca'}
                </div>
              </ProtectedField>

              <ProtectedField fieldId="createdAt" fallback={
                <div className="p-3 bg-gray-100 rounded">
                  <span>Fecha de registro: No visible</span>
                </div>
              }>
                <div className="p-3 bg-green-50 rounded">
                  <span className="font-medium">Fecha de registro:</span>
                  <br />
                  {user.createdAt || 'No disponible'}
                </div>
              </ProtectedField>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}