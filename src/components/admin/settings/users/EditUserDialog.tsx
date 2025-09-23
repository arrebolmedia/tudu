/**
 * Edit User Dialog
 * Dialog para editar usuarios existentes
 */

'use client';

import { useState, useEffect } from 'react';
import { Edit, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/components/admin/settings/SettingsProvider';
import { useAdminSecurity } from '@/components/admin/security/AdminSecurityProvider';
import { type AdminUser, type PatchUserDto } from '@/types/admin';
import { ROLE_LABELS } from '@/lib/user-management';
import { UserRole } from '@/types';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const { updateUser, isLoading } = useSettings();
  const { executeWithReauth } = useAdminSecurity();
  
  const [formData, setFormData] = useState<PatchUserDto>({
    name: '',
    role: '',
    isActive: true
  });
  
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Inicializar formulario cuando cambia el usuario
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        role: user.role,
        isActive: user.isActive
      });
      setError('');
      setHasChanges(false);
    }
  }, [user]);

  // Detectar cambios
  useEffect(() => {
    if (user) {
      const changed = 
        formData.name !== user.name ||
        formData.role !== user.role ||
        formData.isActive !== user.isActive;
      setHasChanges(changed);
    }
  }, [formData, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !hasChanges) return;

    setError('');

    // Validaciones
    if (!formData.name?.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.role) {
      setError('El rol es requerido');
      return;
    }

    // Preparar datos a actualizar (solo campos modificados)
    const updateData: PatchUserDto = {};
    
    if (formData.name !== user.name) {
      updateData.name = formData.name.trim();
    }
    
    if (formData.role !== user.role) {
      updateData.role = formData.role;
    }
    
    if (formData.isActive !== user.isActive) {
      updateData.isActive = formData.isActive;
    }

    // Si hay cambios críticos (rol o estado), requerir re-auth
    const isCriticalChange = updateData.role || updateData.isActive !== undefined;

    const executeUpdate = async () => {
      try {
        await updateUser(user.id, updateData);
        handleClose();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al actualizar usuario');
      }
    };

    if (isCriticalChange) {
      executeWithReauth(executeUpdate);
    } else {
      await executeUpdate();
    }
  };

  const handleClose = () => {
    setError('');
    setHasChanges(false);
    onOpenChange(false);
  };

  const isCurrentUserSuperAdmin = user?.role === 'SuperAdmin';
  const isDeactivatingSuperAdmin = isCurrentUserSuperAdmin && formData.isActive === false;
  const isChangingRoleFromSuperAdmin = isCurrentUserSuperAdmin && formData.role !== 'SuperAdmin';

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Editar Usuario</span>
          </DialogTitle>
          <DialogDescription>
            Modifica la información del usuario: {user.email}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Advertencia para SuperAdmin */}
          {(isDeactivatingSuperAdmin || isChangingRoleFromSuperAdmin) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Operación Crítica</p>
                  <p className="text-red-700 mt-1">
                    {isDeactivatingSuperAdmin && 'Desactivar un SuperAdmin puede bloquear el acceso al sistema.'}
                    {isChangingRoleFromSuperAdmin && 'Cambiar el rol de SuperAdmin puede limitar el acceso administrativo.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email (solo lectura) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre completo"
              disabled={isLoading}
            />
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="SUPER_ADMIN">{ROLE_LABELS.SUPER_ADMIN}</SelectItem>
                <SelectItem value="PROPIETARIO">{ROLE_LABELS.PROPIETARIO}</SelectItem>
                <SelectItem value="GERENTE">{ROLE_LABELS.GERENTE}</SelectItem>
                <SelectItem value="CALL_CENTER">{ROLE_LABELS.CALL_CENTER}</SelectItem>
                <SelectItem value="VENDEDOR">{ROLE_LABELS.VENDEDOR}</SelectItem>
                <SelectItem value="COORDINADOR">{ROLE_LABELS.COORDINADOR}</SelectItem>
                <SelectItem value="COLABORADOR">{ROLE_LABELS.COLABORADOR}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estado activo */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Usuario Activo</Label>
              <div className="text-sm text-gray-500">
                Los usuarios inactivos no pueden acceder al sistema
              </div>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              disabled={isLoading}
            />
          </div>

          {/* Información adicional */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="text-sm">
              <span className="font-medium">Creado:</span> {new Date(user.createdAt).toLocaleDateString('es-ES')}
            </div>
            <div className="text-sm">
              <span className="font-medium">Último acceso:</span> {
                user.lastLoginAt 
                  ? new Date(user.lastLoginAt).toLocaleDateString('es-ES')
                  : 'Nunca'
              }
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}