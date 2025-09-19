'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Shield, Check } from 'lucide-react';

interface ChangeRoleDialogProps {
  user: {
    id: string;
    name: string;
    role: string;
  } | null;
  open: boolean;
  onClose: () => void;
  onSave: (userId: string, role: string) => void;
}

const ROLES = [
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Acceso completo al sistema y gestión de usuarios',
    color: 'text-red-600'
  },
  {
    value: 'user',
    label: 'Usuario',
    description: 'Acceso estándar a las funcionalidades principales',
    color: 'text-blue-600'
  },
  {
    value: 'guest',
    label: 'Invitado',
    description: 'Acceso limitado, solo lectura en la mayoría de casos',
    color: 'text-gray-600'
  }
];

export function ChangeRoleDialog({ user, open, onClose, onSave }: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || 'user');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !selectedRole) return;
    
    try {
      setIsLoading(true);
      console.log('Cambiando rol de', user.name, 'a', selectedRole);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave(user.id, selectedRole);
      onClose();
    } catch (error) {
      console.error('Error al cambiar rol:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentRole = () => {
    return ROLES.find(role => role.value === user?.role);
  };

  const getSelectedRole = () => {
    return ROLES.find(role => role.value === selectedRole);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Cambiar Rol de Usuario
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del usuario */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-muted-foreground">
              Rol actual: <span className={getCurrentRole()?.color}>{getCurrentRole()?.label}</span>
            </p>
          </div>

          {/* Selector de rol */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Nuevo rol</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col items-start">
                      <span className={`font-medium ${role.color}`}>
                        {role.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {role.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Previsualización del cambio */}
          {selectedRole && selectedRole !== user.role && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Check className="h-4 w-4" />
                <span>Se cambiará el rol a:</span>
              </div>
              <p className="mt-1 text-sm font-medium text-blue-900">
                {getSelectedRole()?.label}
              </p>
              <p className="text-xs text-blue-700">
                {getSelectedRole()?.description}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || selectedRole === user.role}
          >
            <Shield className="h-4 w-4 mr-2" />
            {isLoading ? 'Cambiando...' : 'Cambiar Rol'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}