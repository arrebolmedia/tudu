/**
 * Settings Header
 * Header principal del panel de administración
 */

'use client';

import { useSession } from 'next-auth/react';
import { Bell, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function SettingsHeader() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const handleLogout = () => {
    // Implementar logout
    window.location.href = '/api/auth/signout';
  };

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Logo y título */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={handleBackToDashboard}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Volver al Dashboard
        </Button>
        
        <div className="h-8 w-px bg-gray-300" />
        
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-red-600" />
          <h1 className="text-xl font-semibold text-gray-900">
            Panel de Administración
          </h1>
          <Badge variant="destructive" className="text-xs">
            SuperAdmin
          </Badge>
        </div>
      </div>

      {/* Acciones del usuario */}
      <div className="flex items-center space-x-4">
        {/* Notificaciones */}
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>

        {/* Información del usuario */}
        <div className="flex items-center space-x-3 text-sm">
          <span className="text-gray-600">Conectado como:</span>
          <span className="font-medium text-gray-900">
            {user?.name || user?.email}
          </span>
        </div>

        {/* Menú del usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleBackToDashboard}>
              <User className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}