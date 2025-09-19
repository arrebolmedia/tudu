/**
 * Change Role Dialog
 * Modal rápido para cambiar rol de usuario
 */

'use client';

import { useState } from 'react';
import { X, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Hook será pasado como prop

interface ChangeRoleDialogProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const roles = [
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Acceso completo al sistema',
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600'
  },
  {
    value: 'user',
    label: 'Usuario',
    description: 'Acceso limitado a funciones básicas',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600'
  },
  {
    value: 'guest',
    label: 'Invitado',
    description: 'Acceso de solo lectura',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    iconColor: 'text-gray-600'
  }
];

export function ChangeRoleDialog({ user, open, onClose, onSave }: ChangeRoleDialogProps) {
  const { refreshData } = useSimpleSettings();
  const [selectedRole, setSelectedRole] = useState(user?.role || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!user || selectedRole === user.role) {
      onClose();
      return;
    }
    
    setIsLoading(true);
    try {
      // Simular API call para cambiar rol
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Cambiando rol de usuario:', {
        userId: user.id,
        currentRole: user.role,
        newRole: selectedRole
      });
      
      // Refrescar datos
      await refreshData();
      onClose();
    } catch (error) {
      console.error('Error changing role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Cambiar Rol
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Cambiar rol para: <span className="font-medium">{user.name}</span>
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.value}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRole === role.value
                    ? `${role.color} border-2`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRole(role.value)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className={`w-5 h-5 ${selectedRole === role.value ? role.iconColor : 'text-gray-400'}`} />
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-gray-600">{role.description}</div>
                    </div>
                  </div>
                  {selectedRole === role.value && (
                    <Check className={`w-5 h-5 ${role.iconColor}`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || selectedRole === user.role}
            className="flex-1"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            {selectedRole === user.role ? 'Sin Cambios' : 'Cambiar Rol'}
          </Button>
        </div>
      </div>
    </div>
  );
}