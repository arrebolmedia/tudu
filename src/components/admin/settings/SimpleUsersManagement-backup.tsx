/**
 * Simple Users Management Component
 * Componente simplificado para gestión de usuarios
 */

'use client';

import { useState } from 'react';
import { Search, Plus, MoreHorizontal, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleSettings } from './SimpleSettingsProvider';
import { EditUserDialog } from './EditUserDialog';
import { ChangeRoleDialog } from './ChangeRoleDialog';
import { UserActionsMenu } from './UserActionsMenu';

export function SimpleUsersManagement() {
  const { users, isLoading, error, fetchUsers, clearError } = useSimpleSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  // Handler functions for user actions
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleChangeRole = (user: any) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };

  const handleDeleteUser = (user: any) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${user.name}?`)) {
      console.log('Eliminando usuario:', user.id);
      // Aquí iría la llamada a la API para eliminar
      fetchUsers();
    }
  };

  const handleResetPassword = (user: any) => {
    if (confirm(`¿Enviar email de reseteo de contraseña a ${user.email}?`)) {
      console.log('Reseteando contraseña para:', user.id);
      // Aquí iría la llamada a la API para resetear contraseña
    }
  };

  const handleToggleStatus = (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activar' : 'desactivar';
    
    if (confirm(`¿Quieres ${action} a ${user.name}?`)) {
      console.log('Cambiando estado de usuario:', { userId: user.id, newStatus });
      // Aquí iría la llamada a la API para cambiar estado
      fetchUsers();
    }
  };

  const closeDialogs = () => {
    setSelectedUser(null);
    setShowEditDialog(false);
    setShowRoleDialog(false);
  };
      // Aquí iría la llamada a la API para resetear contraseña
    }
  };

  const handleToggleStatus = (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activar' : 'desactivar';
    
    if (confirm(`¿Quieres ${action} a ${user.name}?`)) {
      console.log('Cambiando estado de usuario:', { userId: user.id, newStatus });
      // Aquí iría la llamada a la API para cambiar estado
      fetchUsers();
    }
  };

  const closeDialogs = () => {
    setSelectedUser(null);
    setShowEditDialog(false);
    setShowRoleDialog(false);
  };

  // Filtrar usuarios basado en la búsqueda
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Función para obtener el color del badge según el rol
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'guest': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ Error: {error}</p>
          <div className="mt-2 flex gap-2">
            <Button onClick={clearError} variant="outline" size="sm">
              Limpiar Error
            </Button>
            <Button onClick={fetchUsers} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
          <p className="text-sm text-gray-600">
            {isLoading ? 'Cargando...' : `${filteredUsers.length} usuario${filteredUsers.length !== 1 ? 's' : ''} encontrado${filteredUsers.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar usuarios por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios disponibles'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                        <Badge className={getStatusBadgeColor(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                      {user.lastLogin && (
                        <span className="ml-4">
                          Último acceso: {new Date(user.lastLogin).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <UserActionsMenu
                      user={user}
                      onEdit={() => handleEditUser(user)}
                      onChangeRole={() => handleChangeRole(user)}
                      onDelete={() => handleDeleteUser(user)}
                      onResetPassword={() => handleResetPassword(user)}
                      onToggleStatus={() => handleToggleStatus(user)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer con estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</div>
              <div className="text-sm text-gray-600">Usuarios Activos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</div>
              <div className="text-sm text-gray-600">Administradores</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{users.filter(u => !u.emailVerified).length}</div>
              <div className="text-sm text-gray-600">Sin Verificar</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <EditUserDialog
        user={selectedUser}
        isOpen={showEditDialog}
        onClose={closeDialogs}
      />
      
      <ChangeRoleDialog
        user={selectedUser}
        isOpen={showRoleDialog}
        onClose={closeDialogs}
      />
    </div>
  );
}