/**
 * Delete User Dialog
 * Dialog de confirmación para eliminar usuarios
 */

'use client';

import { Trash2, AlertTriangle, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type AdminUser } from '@/types/admin';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onConfirm: () => void;
}

export function DeleteUserDialog({ 
  open, 
  onOpenChange, 
  user, 
  onConfirm 
}: DeleteUserDialogProps) {
  
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const isSuperAdmin = user?.role === 'SuperAdmin';

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            <span>Eliminar Usuario</span>
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El usuario será desactivado permanentemente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del usuario */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-200 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
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

          {/* Advertencia especial para SuperAdmin */}
          {isSuperAdmin && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Advertencia Crítica</p>
                  <p className="text-red-700 mt-1">
                    Estás a punto de eliminar un usuario con rol SuperAdmin. 
                    Asegúrate de que existan otros SuperAdmins activos para evitar 
                    quedar bloqueado del sistema.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información sobre la eliminación */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm">
              <p className="font-medium text-blue-800">¿Qué sucede al eliminar?</p>
              <ul className="text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>El usuario se marcará como inactivo</li>
                <li>No podrá acceder al sistema</li>
                <li>Sus datos históricos se conservan</li>
                <li>Se requiere re-autenticación por seguridad</li>
              </ul>
            </div>
          </div>

          {/* Confirmación */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Para confirmar, escribe el email del usuario que deseas eliminar:
            </p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-2 break-all">
              {user.email}
            </p>
          </div>
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
            variant="destructive"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar Usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}