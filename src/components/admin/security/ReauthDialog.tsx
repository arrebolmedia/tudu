/**
 * Reauth Dialog
 * Dialog de re-autenticación para operaciones elevadas
 */

'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
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
import { useAdminSecurity } from './AdminSecurityProvider';
import { useSettings } from '@/components/admin/settings/SettingsProvider';

export function ReauthDialog() {
  const { isReauthDialogOpen, closeReauthDialog, pendingAction } = useAdminSecurity();
  const { reauth } = useSettings();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('La contraseña es requerida');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validar contraseña
      await reauth(password);
      
      // Ejecutar acción pendiente
      if (pendingAction) {
        await pendingAction();
      }
      
      // Limpiar y cerrar
      setPassword('');
      closeReauthDialog();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    closeReauthDialog();
  };

  return (
    <Dialog open={isReauthDialogOpen} onOpenChange={() => handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-red-600" />
            <span>Confirmar Identidad</span>
          </DialogTitle>
          <DialogDescription>
            Para continuar con esta operación de seguridad, necesitas confirmar tu identidad 
            ingresando tu contraseña actual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Aviso de seguridad */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Operación Crítica</p>
                <p className="text-red-700 mt-1">
                  Esta acción puede afectar la seguridad del sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Campo de contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="pr-10"
                autoFocus
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
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
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verificando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}