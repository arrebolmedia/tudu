/**
 * Reset Password Dialog
 * Dialog para resetear contraseña de usuarios
 */

'use client';

import { RotateCcw, Key, Copy, AlertTriangle } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { type AdminUser } from '@/types/admin';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onConfirm: () => void;
}

export function ResetPasswordDialog({ 
  open, 
  onOpenChange, 
  user, 
  onConfirm 
}: ResetPasswordDialogProps) {
  
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-orange-600">
            <RotateCcw className="h-5 w-5" />
            <span>Reset de Contraseña</span>
          </DialogTitle>
          <DialogDescription>
            Se generará una nueva contraseña temporal para el usuario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del usuario */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Key className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="mt-1">
                  <Badge variant={user.role === 'SuperAdmin' ? 'destructive' : 'default'}>
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Advertencias */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">Consideraciones de Seguridad</p>
                <ul className="text-orange-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Se invalidará la contraseña actual del usuario</li>
                  <li>El usuario deberá usar la nueva contraseña temporal</li>
                  <li>Se recomienda cambiar la contraseña en el primer acceso</li>
                  <li>Se requiere re-autenticación por seguridad</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Información del proceso */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm">
              <p className="font-medium text-blue-800">¿Qué sucede después?</p>
              <div className="text-blue-700 mt-2 space-y-1">
                <p>1. Se genera una contraseña temporal segura</p>
                <p>2. Se muestra la nueva contraseña (solo una vez)</p>
                <p>3. Debes comunicar la contraseña al usuario</p>
                <p>4. El usuario debe cambiarla en su próximo acceso</p>
              </div>
            </div>
          </div>

          {/* Estado del usuario */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Estado:</span>
              <div className="mt-1">
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-600">Último acceso:</span>
              <div className="mt-1 text-gray-900">
                {user.lastLoginAt 
                  ? new Date(user.lastLoginAt).toLocaleDateString('es-ES')
                  : 'Nunca'
                }
              </div>
            </div>
          </div>

          {user.role === 'SuperAdmin' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Usuario SuperAdmin</p>
                  <p className="text-red-700 mt-1">
                    Ten especial cuidado al resetear la contraseña de un SuperAdmin.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Resetear Contraseña
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}