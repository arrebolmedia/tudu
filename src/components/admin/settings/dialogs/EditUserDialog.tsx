'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X, Save, User, Mail, Shield } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/user-management';
import { UserRole } from '@/types';

interface EditUserDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    emailVerified: boolean;
  } | null;
  open: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
}

export function EditUserDialog({ user, open, onClose, onSave }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'COLABORADOR',
    status: 'active',
    emailVerified: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'COLABORADOR',
        status: user.status || 'active',
        emailVerified: user.emailVerified || false
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Llamar a la función onSave que viene del componente padre
      console.log('Guardando cambios:', formData);
      await onSave({ ...formData, id: user.id });
      onClose();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Usuario
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nombre del usuario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rol y Estado */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <SelectValue placeholder="Seleccionar rol" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="SUPER_ADMIN">
                      <div className="flex flex-col">
                        <span className="font-medium">{ROLE_LABELS.SUPER_ADMIN}</span>
                        <span className="text-xs text-muted-foreground">Acceso total al sistema</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PROPIETARIO">
                      <div className="flex flex-col">
                        <span className="font-medium">{ROLE_LABELS.PROPIETARIO}</span>
                        <span className="text-xs text-muted-foreground">Control completo del negocio</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="GERENTE">
                      <div className="flex flex-col">
                        <span className="font-medium">{ROLE_LABELS.GERENTE}</span>
                        <span className="text-xs text-muted-foreground">Gestión de equipos y procesos</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="CALL_CENTER">
                      <div className="flex flex-col">
                        <span className="font-medium">{ROLE_LABELS.CALL_CENTER}</span>
                        <span className="text-xs text-muted-foreground">Atención telefónica y soporte</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="VENDEDOR">
                      <div className="flex flex-col">
                        <span className="font-medium">{ROLE_LABELS.VENDEDOR}</span>
                        <span className="text-xs text-muted-foreground">Gestión de clientes y ventas</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="COORDINADOR">
                      <div className="flex flex-col">
                        <span className="font-medium">{ROLE_LABELS.COORDINADOR}</span>
                        <span className="text-xs text-muted-foreground">Coordinación de eventos</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="COLABORADOR">
                      <div className="flex flex-col">
                        <span className="font-medium">{ROLE_LABELS.COLABORADOR}</span>
                        <span className="text-xs text-muted-foreground">Acceso básico y limitado</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Verificación de email */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailVerified">Email verificado</Label>
              <Switch
                id="emailVerified"
                checked={formData.emailVerified}
                onCheckedChange={(checked) => handleInputChange('emailVerified', checked)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Los usuarios con email verificado tienen acceso completo
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}