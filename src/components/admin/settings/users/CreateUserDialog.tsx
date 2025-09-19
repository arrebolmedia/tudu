/**
 * Create User Dialog
 * Dialog para crear nuevos usuarios
 */

'use client';

import { useState } from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';
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
import { useSettings } from '@/components/admin/settings/SettingsProvider';
import { type CreateUserDto } from '@/types/admin';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const { createUser, isLoading } = useSettings();
  
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    role: '',
    tempPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [generatePassword, setGeneratePassword] = useState(true);
  const [error, setError] = useState('');
  const [createdUser, setCreatedUser] = useState<{ email: string; tempPassword: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!formData.role) {
      setError('El rol es requerido');
      return;
    }

    if (!generatePassword && !formData.tempPassword?.trim()) {
      setError('La contraseña temporal es requerida');
      return;
    }

    try {
      const userData: CreateUserDto = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        ...(generatePassword ? {} : { tempPassword: formData.tempPassword })
      };

      const result = await createUser(userData);
      
      // Mostrar información del usuario creado
      setCreatedUser({
        email: result.user.email,
        tempPassword: result.tempPassword
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear usuario');
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', role: '', tempPassword: '' });
    setError('');
    setCreatedUser(null);
    setGeneratePassword(true);
    onOpenChange(false);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, tempPassword: password }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Si el usuario fue creado, mostrar información
  if (createdUser) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Usuario Creado Exitosamente</DialogTitle>
            <DialogDescription>
              El usuario ha sido creado. Guarda esta información de acceso temporal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-green-800">Email</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value={createdUser.email} readOnly className="bg-white" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(createdUser.email)}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-green-800">Contraseña Temporal</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value={createdUser.tempPassword} readOnly className="bg-white font-mono" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(createdUser.tempPassword)}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Importante:</strong> Esta contraseña solo se muestra una vez. 
                El usuario deberá cambiarla en su primer acceso.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Crear Nuevo Usuario</span>
          </DialogTitle>
          <DialogDescription>
            Crea un nuevo usuario en el sistema con rol y contraseña temporal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: María García"
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Ej: maria@empresa.com"
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
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                <SelectItem value="Propietario">Propietario</SelectItem>
                <SelectItem value="Gestor">Gestor</SelectItem>
                <SelectItem value="Vendedor">Vendedor</SelectItem>
                <SelectItem value="GerenteBanquetes">Gerente Banquetes</SelectItem>
                <SelectItem value="Coordinador">Coordinador</SelectItem>
                <SelectItem value="Planner">Planner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña Temporal</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setGeneratePassword(!generatePassword)}
                disabled={isLoading}
              >
                {generatePassword ? 'Manual' : 'Auto'}
              </Button>
            </div>
            
            {generatePassword ? (
              <div className="bg-gray-50 border rounded-md p-3">
                <p className="text-sm text-gray-600">
                  Se generará automáticamente una contraseña segura
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.tempPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, tempPassword: e.target.value }))}
                    placeholder="Contraseña temporal"
                    className="pr-20"
                    disabled={isLoading}
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center space-x-1 pr-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateRandomPassword}
                  disabled={isLoading}
                >
                  Generar
                </Button>
              </div>
            )}
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}