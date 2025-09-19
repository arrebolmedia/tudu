/**
 * User Field Permissions Manager
 * Gestor de permisos granulares por usuario específico
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit3, Trash2, User, Search, Save, Plus } from 'lucide-react';
import { 
  USER_SPECIFIC_PERMISSIONS,
  USER_FIELDS,
  EVENT_FIELDS,
  type UserFieldPermission,
  type FieldDefinition,
  type PermissionAction,
  updateUserFieldPermission,
  updateUserDeletePermission,
  addUserToPermissions,
  canUserDeleteRecord
} from '@/lib/user-field-permissions';

const ACTION_ICONS = {
  view: Eye,
  edit: Edit3
};

const ACTION_COLORS = {
  view: 'text-blue-600',
  edit: 'text-green-600'
};

const ACTION_LABELS = {
  view: 'Ver',
  edit: 'Editar'
};

export function UserFieldPermissionsManager() {
  const [userPermissions, setUserPermissions] = useState<UserFieldPermission[]>(USER_SPECIFIC_PERMISSIONS);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<'user' | 'event'>('event');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '' });

  // Filtrar usuarios por búsqueda
  const filteredUsers = userPermissions.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener campos según la entidad seleccionada
  const getCurrentFields = (): FieldDefinition[] => {
    return selectedEntity === 'user' ? USER_FIELDS : EVENT_FIELDS;
  };

  // Actualizar permisos de un usuario específico
  const updatePermission = (
    userId: string,
    fieldId: string,
    action: PermissionAction,
    hasPermission: boolean
  ) => {
    const updated = updateUserFieldPermission(userId, fieldId, action, hasPermission);
    setUserPermissions(updated);
    setHasChanges(true);
  };

  // Actualizar permiso de eliminar registro completo
  const updateDeletePermission = (userId: string, canDelete: boolean) => {
    const updated = updateUserDeletePermission(userId, canDelete);
    setUserPermissions(updated);
    setHasChanges(true);
  };

  // Agregar nuevo usuario
  const addNewUser = () => {
    if (!newUser.name || !newUser.email) return;
    
    const userId = `new-${Date.now()}`;
    const newUserPermission = addUserToPermissions(userId, newUser.name, newUser.email);
    
    setUserPermissions(prev => [...prev, newUserPermission]);
    setNewUser({ name: '', email: '' });
    setShowAddUser(false);
    setHasChanges(true);
  };

  // Guardar cambios
  const saveChanges = async () => {
    try {
      console.log('💾 Guardando permisos de usuarios:', userPermissions);
      // Aquí iría la llamada a la API para guardar
      setHasChanges(false);
      alert('Permisos guardados correctamente');
    } catch (error) {
      console.error('Error guardando permisos:', error);
      alert('Error al guardar permisos');
    }
  };

  // Obtener estadísticas de permisos por usuario
  const getUserStats = (userId: string) => {
    const user = userPermissions.find(u => u.userId === userId);
    if (!user) return { view: 0, edit: 0, canDelete: false };
    
    const fields = getCurrentFields();
    let view = 0, edit = 0;
    
    fields.forEach(field => {
      const permissions = user.fieldPermissions[field.fieldId];
      if (permissions?.view) view++;
      if (permissions?.edit) edit++;
    });
    
    return { view, edit, canDelete: user.canDeleteRecord };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Permisos Granulares por Usuario
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configura qué campos puede ver, editar o eliminar cada usuario específico
              </p>
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Button onClick={saveChanges} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setShowAddUser(!showAddUser)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Usuario
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Formulario para agregar usuario */}
        {showAddUser && (
          <CardContent className="border-t bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="newUserName">Nombre del Usuario</Label>
                <Input
                  id="newUserName"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Josefo Flores"
                />
              </div>
              <div>
                <Label htmlFor="newUserEmail">Email del Usuario</Label>
                <Input
                  id="newUserEmail"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="josefo@example.com"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addNewUser}>Agregar</Button>
                <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancelar</Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Controles */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Selector de entidad */}
        <div className="w-full md:w-48">
          <Select value={selectedEntity} onValueChange={(value: 'user' | 'event') => setSelectedEntity(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="event">📅 Campos de Eventos</SelectItem>
              <SelectItem value="user">👥 Campos de Usuarios</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => {
          const stats = getUserStats(user.userId);
          const isSelected = selectedUser === user.userId;
          
          return (
            <Card 
              key={user.userId}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedUser(isSelected ? null : user.userId)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div>
                    <div className="font-medium">{user.userName}</div>
                    <div className="text-xs text-muted-foreground">{user.userEmail}</div>
                  </div>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-blue-600">
                      <Eye className="h-3 w-3" />
                      <span>Ver</span>
                    </div>
                    <Badge variant="outline">{stats.view} campos</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <Edit3 className="h-3 w-3" />
                      <span>Editar</span>
                    </div>
                    <Badge variant="outline">{stats.edit} campos</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-red-600">
                      <Trash2 className="h-3 w-3" />
                      <span>Eliminar Registro</span>
                    </div>
                    <Badge variant={stats.canDelete ? "destructive" : "outline"}>
                      {stats.canDelete ? "Sí" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Panel de configuración detallada */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>
              Configuración de Permisos: {userPermissions.find(u => u.userId === selectedUser)?.userName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Entidad: {selectedEntity === 'event' ? 'Eventos/Bodas' : 'Usuarios'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Permiso de eliminar registro completo */}
              <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-800 flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Eliminar Registro Completo
                    </h4>
                    <p className="text-sm text-red-600 mt-1">
                      Permite eliminar registros completos de {selectedEntity === 'event' ? 'eventos/bodas' : 'usuarios'}
                    </p>
                  </div>
                  <Switch
                    checked={userPermissions.find(u => u.userId === selectedUser)?.canDeleteRecord || false}
                    onCheckedChange={(checked) => updateDeletePermission(selectedUser, checked)}
                  />
                </div>
              </div>

              {/* Permisos por campo */}
              <div className="space-y-4">
                <h4 className="font-medium">Permisos por Campo</h4>
                {getCurrentFields().map((field) => {
                  const user = userPermissions.find(u => u.userId === selectedUser);
                  const fieldPermissions = user?.fieldPermissions[field.fieldId] || {
                    view: false,
                    edit: false
                  };
                  
                  return (
                    <div key={field.fieldId} className="p-4 border rounded-lg space-y-4">
                      <div>
                        <h4 className="font-medium">{field.fieldName}</h4>
                        <p className="text-sm text-muted-foreground">{field.description}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {field.category}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(['view', 'edit'] as const).map((action) => {
                          const Icon = ACTION_ICONS[action];
                          
                          return (
                            <div key={action} className="flex items-center space-x-2 p-3 rounded border">
                              <Switch
                                checked={fieldPermissions[action]}
                                onCheckedChange={(checked) => 
                                  updatePermission(selectedUser, field.fieldId, action, checked)
                                }
                              />
                              <div className={`flex items-center gap-2 ${ACTION_COLORS[action]}`}>
                                <Icon className="h-4 w-4" />
                                <Label className="text-sm font-medium cursor-pointer">
                                  {ACTION_LABELS[action]}
                                </Label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ejemplo de permisos */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>💡 Ejemplo de configuración:</strong></p>
            <div className="bg-blue-50 p-3 rounded ml-4">
              <p><strong>Josefo Flores:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><span className="text-blue-600">👁️ Ver:</span> Canal, Área, Teléfono, Email, Fecha del Evento, Estado, Prioridad</li>
                <li><span className="text-green-600">✏️ Editar:</span> Teléfono, Email, Estado, Prioridad, Notas</li>
                <li><span className="text-red-600">🗑️ Eliminar Registro:</span> No puede eliminar registros completos</li>
              </ul>
            </div>
            <div className="bg-green-50 p-3 rounded ml-4 mt-2">
              <p><strong>María González:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><span className="text-blue-600">👁️ Ver:</span> Todos los campos</li>
                <li><span className="text-green-600">✏️ Editar:</span> Todos los campos</li>
                <li><span className="text-red-600">🗑️ Eliminar Registro:</span> Puede eliminar registros completos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}