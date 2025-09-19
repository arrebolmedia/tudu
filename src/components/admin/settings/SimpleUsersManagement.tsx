'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, UserPlus, AlertCircle } from 'lucide-react';
import { useSimpleSettings } from '@/hooks/useSimpleSettings';
import { EditUserDialog } from './dialogs/EditUserDialog';
import { ChangeRoleDialog } from './dialogs/ChangeRoleDialog';
import { UserActionsMenu } from './dialogs/UserActionsMenu';

export function SimpleUsersManagement() {
  const { users, isLoading, error, fetchUsers, clearError, executeUserAction } = useSimpleSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handler functions for user actions
  const handleEditUser = (user: any) => {
    console.log('📝 Handler: Editando usuario', user.name);
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleChangeRole = (user: any) => {
    console.log('🛡️ Handler: Cambiando rol de', user.name);
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const handleDeleteUser = async (user: any) => {
    console.log('🗑️ Handler: Intentando eliminar', user.name);
    if (confirm(`¿Estás seguro de que quieres eliminar a ${user.name}?`)) {
      try {
        console.log('✅ Confirmado: Eliminando usuario', user.id);
        await executeUserAction(user.id, 'deleteUser');
        console.log('✅ Usuario eliminado:', user.id);
      } catch (error) {
        console.error('Error eliminando usuario:', error);
      }
    } else {
      console.log('❌ Cancelado: No se elimina el usuario');
    }
  };

  const handleResetPassword = async (user: any) => {
    console.log('🔑 Handler: Reseteando contraseña para', user.email);
    if (confirm(`¿Enviar email de reseteo de contraseña a ${user.email}?`)) {
      try {
        console.log('✅ Confirmado: Enviando email de reseteo');
        await executeUserAction(user.id, 'resetPassword');
        console.log('✅ Email de reseteo enviado a:', user.email);
      } catch (error) {
        console.error('Error enviando email:', error);
      }
    } else {
      console.log('❌ Cancelado: No se envía email de reseteo');
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activar' : 'desactivar';
    console.log(`⚡ Handler: Intentando ${action} a`, user.name);
    
    if (confirm(`¿Quieres ${action} a ${user.name}?`)) {
      try {
        console.log(`✅ Confirmado: ${action} usuario`);
        await executeUserAction(user.id, 'toggleStatus', { status: newStatus });
        console.log('✅ Estado cambiado:', { userId: user.id, newStatus });
      } catch (error) {
        console.error('Error cambiando estado:', error);
      }
    } else {
      console.log(`❌ Cancelado: No se ${action} el usuario`);
    }
  };

  const handleSaveUser = async (userData: any) => {
    try {
      await executeUserAction(userData.id, 'updateUser', userData);
      console.log('✅ Usuario guardado:', userData);
      closeDialogs();
    } catch (error) {
      console.error('Error guardando usuario:', error);
    }
  };

  const handleSaveRole = async (userId: string, role: string) => {
    try {
      await executeUserAction(userId, 'changeRole', { role });
      console.log('✅ Rol cambiado:', { userId, role });
      closeDialogs();
    } catch (error) {
      console.error('Error cambiando rol:', error);
    }
  };

  const closeDialogs = () => {
    setSelectedUser(null);
    setShowEditDialog(false);
    setShowRoleDialog(false);
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user: any) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter((user: any) => user.status === 'active').length;
  const adminUsers = users.filter((user: any) => user.role === 'admin').length;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'user': return 'default';
      case 'guest': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar usuarios: {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={() => {
                clearError();
                fetchUsers();
              }}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{adminUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra usuarios, roles y permisos del sistema
              </CardDescription>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando usuarios...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Login</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback className="text-xs">
                                {getUserInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              {user.emailVerified && (
                                <div className="text-xs text-green-600">✓ Verificado</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(user.status)}>
                            {user.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca'}
                        </TableCell>
                        <TableCell className="text-right">
                          <UserActionsMenu
                            user={user}
                            onEdit={() => handleEditUser(user)}
                            onDelete={() => handleDeleteUser(user)}
                            onChangeRole={() => handleChangeRole(user)}
                            onResetPassword={() => handleResetPassword(user)}
                            onToggleStatus={() => handleToggleStatus(user)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EditUserDialog
        open={showEditDialog}
        onClose={closeDialogs}
        user={selectedUser}
        onSave={handleSaveUser}
      />

      <ChangeRoleDialog
        open={showRoleDialog}
        onClose={closeDialogs}
        user={selectedUser}
        onSave={handleSaveRole}
      />
    </div>
  );
}