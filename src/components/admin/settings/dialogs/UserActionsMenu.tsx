/**
 * User Actions Menu
 * Menú desplegable con acciones para cada usuario
 */

'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Shield, Key, Ban, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserActionsMenuProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    emailVerified: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
  onChangeRole: () => void;
  onResetPassword: () => void;
  onToggleStatus: () => void;
}

export function UserActionsMenu({ 
  user, 
  onEdit, 
  onDelete, 
  onChangeRole, 
  onResetPassword, 
  onToggleStatus 
}: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void, actionName: string) => {
    console.log('🔄 Ejecutando acción:', actionName);
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          {/* Overlay para cerrar el menú */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menú desplegable */}
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-48">
            <div className="py-1">
              {/* Editar */}
              <button
                onClick={() => handleAction(onEdit, 'Editar Usuario')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="w-4 h-4" />
                Editar Usuario
              </button>

              {/* Cambiar Rol */}
              <button
                onClick={() => handleAction(onChangeRole, 'Cambiar Rol')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Shield className="w-4 h-4" />
                Cambiar Rol
              </button>

              {/* Resetear Contraseña */}
              <button
                onClick={() => handleAction(onResetPassword, 'Resetear Contraseña')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Key className="w-4 h-4" />
                Resetear Contraseña
              </button>

              <div className="border-t border-gray-100 my-1" />

              {/* Toggle Status */}
              <button
                onClick={() => handleAction(onToggleStatus, user.status === 'active' ? 'Desactivar Usuario' : 'Activar Usuario')}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 ${
                  user.status === 'active' ? 'text-orange-600' : 'text-green-600'
                }`}
              >
                {user.status === 'active' ? (
                  <>
                    <Ban className="w-4 h-4" />
                    Desactivar Usuario
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Activar Usuario
                  </>
                )}
              </button>

              <div className="border-t border-gray-100 my-1" />

              {/* Eliminar */}
              <button
                onClick={() => handleAction(onDelete, 'Eliminar Usuario')}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Usuario
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}