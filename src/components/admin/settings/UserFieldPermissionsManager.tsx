/**
 * User Field Permissions Manager
 * Gestor de permisos granulares por usuario específico
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit3, Trash2, User, Search, Save, Plus, Shield } from 'lucide-react';
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
import { 
  ROLE_LABELS, 
  ROLE_COLORS
} from '@/lib/user-management';
import { syncUserData, generatePermissionsFromSystemUsers } from '@/lib/data-sync';
import { 
  getRoleConfig, 
  getRoleFieldPermission, 
  canRoleDelete,
  applyDefaultRolePermissions
} from '@/lib/role-permissions-config';
import { UserRole } from '@/types';

// Etiquetas de roles sin iconos para dropdowns limpios
const ROLE_LABELS_CLEAN: Record<UserRole, string> = {
  'SUPER_ADMIN': 'Super Administrador',
  'PROPIETARIO': 'Propietario', 
  'GERENTE': 'Gerente',
  'VENDEDOR': 'Vendedor',
  'COORDINADOR': 'Coordinador',
  'CALL_CENTER': 'Call Center',
  'COLABORADOR': 'Colaborador'
};

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
  // Usar usuarios del sistema centralizado
  const [userPermissions, setUserPermissions] = useState<UserFieldPermission[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<'user' | 'event'>('event');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'COLABORADOR' as UserRole });
  const [forceRender, setForceRender] = useState(0); // Para forzar re-renders

  // Ejecutar sincronización al montar el componente
  useEffect(() => {
    console.log('🔄 Inicializando sistema de permisos...')
    
    // Intentar cargar datos guardados primero
    const savedPermissions = localStorage.getItem('userFieldPermissions');
    
    if (savedPermissions) {
      try {
        const parsedPermissions = JSON.parse(savedPermissions);
        console.log('📥 Cargando permisos guardados desde localStorage:', parsedPermissions);
        setUserPermissions(parsedPermissions);
        console.log('✅ Datos cargados exitosamente desde localStorage');
        return; // ¡IMPORTANTE! No ejecutar sincronización si hay datos guardados
      } catch (error) {
        console.error('❌ Error cargando permisos guardados:', error);
      }
    }
    
    // Solo generar desde sistema si NO hay datos guardados
    console.log('📊 No hay datos guardados, generando desde usuarios del sistema...');
    const systemBasedPermissions = generatePermissionsFromSystemUsers();
    setUserPermissions(systemBasedPermissions);
    
    // Guardar los datos generados
    localStorage.setItem('userFieldPermissions', JSON.stringify(systemBasedPermissions));
    console.log('💾 Datos del sistema guardados en localStorage');
    
    const syncResult = syncUserData();
    console.log('📊 Resultado de sincronización:', syncResult);
  }, [])

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
    console.log(`🔧 Actualizando permiso ${action} para campo ${fieldId} del usuario ${userId}: ${hasPermission}`);
    
    setUserPermissions(prev => {
      const updated = prev.map(user => {
        if (user.userId === userId) {
          const newFieldPermissions = { ...user.fieldPermissions };
          
          if (!newFieldPermissions[fieldId]) {
            newFieldPermissions[fieldId] = { view: false, edit: false };
          }
          
          newFieldPermissions[fieldId] = {
            ...newFieldPermissions[fieldId],
            [action]: hasPermission
          };
          
          return { ...user, fieldPermissions: newFieldPermissions };
        }
        return user;
      });
      
      // Guardar automáticamente en localStorage
      localStorage.setItem('userFieldPermissions', JSON.stringify(updated));
      console.log(`💾 Permiso actualizado y guardado en localStorage`);
      
      return updated;
    });
    
    setHasChanges(true);
  };

  // Actualizar permiso de eliminar registro completo
  const updateDeletePermission = (userId: string, canDelete: boolean) => {
    console.log(`🗑️ Actualizando permiso de eliminar para usuario ${userId}: ${canDelete}`);
    
    setUserPermissions(prev => {
      const updated = prev.map(user => 
        user.userId === userId 
          ? { ...user, canDeleteRecord: canDelete }
          : user
      );
      
      // Guardar automáticamente en localStorage
      localStorage.setItem('userFieldPermissions', JSON.stringify(updated));
      console.log(`💾 Permiso de eliminar actualizado y guardado en localStorage`);
      
      return updated;
    });
    
    setHasChanges(true);
  };

  // Actualizar rol de usuario
  const updateUserRole = (userId: string, newRole: UserRole) => {
    console.log(`🔄 Actualizando rol de usuario ${userId} a ${newRole}`);
    
    setUserPermissions(prev => {
      const updated = prev.map(user => 
        user.userId === userId 
          ? { ...user, userRole: newRole, lastUpdated: Date.now() } // Agregar timestamp para forzar re-render
          : user
      );
      
      // Log para verificar que el cambio se aplicó
      const updatedUser = updated.find(u => u.userId === userId);
      console.log(`✅ Usuario actualizado:`, updatedUser);
      console.log(`🏷️ Nueva etiqueta debería ser: ${ROLE_LABELS_CLEAN[newRole]}`);
      
      // Guardar automáticamente en localStorage
      localStorage.setItem('userFieldPermissions', JSON.stringify(updated));
      console.log(`💾 Cambio de rol guardado automáticamente en localStorage`);
      
      return updated;
    });
    
    setHasChanges(true);
    
    // Forzar re-render inmediato
    setForceRender(prev => prev + 1);
    console.log(`🔄 Forzando re-render del componente`);
    
    // NO aplicar permisos automáticamente para evitar sobrescritura
    // Los permisos se pueden aplicar manualmente con el botón
    console.log(`⏸️ Rol actualizado sin aplicar permisos predeterminados automáticamente`);
  };

  // Aplicar permisos predeterminados según el rol
  const applyDefaultPermissionsForRole = (userId: string, role: UserRole) => {
    const fields = getCurrentFields();
    const roleConfig = getRoleConfig(role);
    
    if (!roleConfig) {
      console.warn(`No se encontró configuración para el rol: ${role}`);
      return;
    }

    // Aplicar permisos específicos del rol a cada campo
    fields.forEach(field => {
      const fieldPermission = roleConfig.permissions[field.fieldId];
      if (fieldPermission) {
        updatePermission(userId, field.fieldId, 'view', fieldPermission.view);
        updatePermission(userId, field.fieldId, 'edit', fieldPermission.edit);
      }
    });
    
    // Aplicar permiso de eliminar
    updateDeletePermission(userId, roleConfig.canDelete);
    
    console.log(`✅ Aplicados permisos predeterminados del rol ${role} para usuario ${userId}`);
  };

  // Agregar nuevo usuario
  const addNewUser = () => {
    if (!newUser.name || !newUser.email) return;
    
    const userId = `new-${Date.now()}`;
    const newUserPermission = addUserToPermissions(userId, newUser.name, newUser.email, newUser.role);
    
    setUserPermissions(prev => [...prev, newUserPermission]);
    setNewUser({ name: '', email: '', role: 'COLABORADOR' as UserRole });
    setShowAddUser(false);
    setHasChanges(true);
  };

  // Guardar cambios
  const saveChanges = async () => {
    try {
      console.log('💾 Guardando permisos de usuarios:', userPermissions);
      
      // Guardar en localStorage como persistencia temporal
      localStorage.setItem('userFieldPermissions', JSON.stringify(userPermissions));
      
      // TODO: Aquí iría la llamada a la API para guardar en base de datos
      // await fetch('/api/admin/user-permissions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userPermissions)
      // });
      
      setHasChanges(false);
      alert('Permisos guardados correctamente');
      console.log('✅ Permisos guardados en localStorage');
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
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Permisos Granulares por Usuario
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
              <div>
                <Label htmlFor="newUserRole">Rol del Usuario</Label>
                <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger id="newUserRole" className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="SUPER_ADMIN">{ROLE_LABELS_CLEAN.SUPER_ADMIN}</SelectItem>
                    <SelectItem value="PROPIETARIO">{ROLE_LABELS_CLEAN.PROPIETARIO}</SelectItem>
                    <SelectItem value="GERENTE">{ROLE_LABELS_CLEAN.GERENTE}</SelectItem>
                    <SelectItem value="CALL_CENTER">{ROLE_LABELS_CLEAN.CALL_CENTER}</SelectItem>
                    <SelectItem value="VENDEDOR">{ROLE_LABELS_CLEAN.VENDEDOR}</SelectItem>
                    <SelectItem value="COORDINADOR">{ROLE_LABELS_CLEAN.COORDINADOR}</SelectItem>
                    <SelectItem value="COLABORADOR">{ROLE_LABELS_CLEAN.COLABORADOR}</SelectItem>
                  </SelectContent>
                </Select>
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
              key={`${user.userId}-${user.userRole}-${(user as any).lastUpdated || 0}-${forceRender}`}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedUser(isSelected ? null : user.userId)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{user.userName}</div>
                    <div className="text-xs text-muted-foreground">{user.userEmail}</div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-1.5 py-0 mt-1 ${ROLE_COLORS[user.userRole] || 'bg-gray-100'}`}
                    >
                      <Shield className="h-2.5 w-2.5 mr-1" />
                      {ROLE_LABELS_CLEAN[user.userRole]}
                    </Badge>
                  </div>
                  <User className="h-3 w-3 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-blue-600">
                      <Eye className="h-2.5 w-2.5" />
                      <span>Ver</span>
                    </div>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">{stats.view}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-green-600">
                      <Edit3 className="h-2.5 w-2.5" />
                      <span>Editar</span>
                    </div>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">{stats.edit}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-red-600">
                      <Trash2 className="h-2.5 w-2.5" />
                      <span>Eliminar</span>
                    </div>
                    <Badge variant={stats.canDelete ? "destructive" : "outline"} className="text-xs px-1.5 py-0">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Configuración de Permisos: {userPermissions.find(u => u.userId === selectedUser)?.userName}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Entidad: {selectedEntity === 'event' ? 'Eventos/Bodas' : 'Usuarios'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Configuración de Rol */}
              <div className="p-3 border-2 border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800 flex items-center gap-2 text-sm">
                      <Shield className="h-3 w-3" />
                      Rol del Usuario
                    </h4>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Define el rol y permisos base del usuario en el sistema
                    </p>
                    {/* Información sobre impacto en CRM */}
                    {(() => {
                      const currentRole = userPermissions.find(u => u.userId === selectedUser)?.userRole;
                      if (currentRole === 'VENDEDOR') {
                        return (
                          <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-xs text-green-700">
                            💼 Este usuario aparece en los dropdowns de <strong>Ejecutivos</strong> del CRM
                          </div>
                        );
                      } else if (currentRole === 'COORDINADOR') {
                        return (
                          <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded text-xs text-orange-700">
                            📅 Este usuario aparece en los dropdowns de <strong>Coordinadores</strong> del CRM
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="ml-4">
                    <Select 
                      value={userPermissions.find(u => u.userId === selectedUser)?.userRole || 'COLABORADOR'} 
                      onValueChange={(value: UserRole) => updateUserRole(selectedUser, value)}
                    >
                      <SelectTrigger className="w-48 bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="SUPER_ADMIN">{ROLE_LABELS_CLEAN.SUPER_ADMIN}</SelectItem>
                        <SelectItem value="PROPIETARIO">{ROLE_LABELS_CLEAN.PROPIETARIO}</SelectItem>
                        <SelectItem value="GERENTE">{ROLE_LABELS_CLEAN.GERENTE}</SelectItem>
                        <SelectItem value="CALL_CENTER">{ROLE_LABELS_CLEAN.CALL_CENTER}</SelectItem>
                        <SelectItem value="VENDEDOR">{ROLE_LABELS_CLEAN.VENDEDOR}</SelectItem>
                        <SelectItem value="COORDINADOR">{ROLE_LABELS_CLEAN.COORDINADOR}</SelectItem>
                        <SelectItem value="COLABORADOR">{ROLE_LABELS_CLEAN.COLABORADOR}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Botón para aplicar permisos predeterminados */}
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentUser = userPermissions.find(u => u.userId === selectedUser);
                      if (currentUser) {
                        applyDefaultPermissionsForRole(selectedUser, currentUser.userRole);
                        // Mostrar confirmación
                        console.log(`✅ Permisos predeterminados aplicados para rol: ${currentUser.userRole}`);
                      }
                    }}
                    className="text-xs"
                  >
                    Aplicar Permisos Predeterminados del Rol
                  </Button>
                  <p className="text-xs text-blue-600 mt-1">
                    Configura automáticamente los permisos típicos para este rol
                  </p>
                </div>
              </div>

              {/* Información de roles */}
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-800 text-sm mb-2">Descripción de Roles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div><strong>🔧 Super Admin:</strong> Acceso total al sistema</div>
                  <div><strong>👑 Propietario:</strong> Control completo del negocio</div>
                  <div><strong>📋 Gerente:</strong> Gestión de equipos y procesos</div>
                  <div><strong>� Call Center:</strong> Atención telefónica y soporte</div>
                  <div><strong>�💼 Vendedor:</strong> Gestión de clientes y ventas</div>
                  <div><strong>📅 Coordinador:</strong> Coordinación de eventos</div>
                  <div><strong>👤 Colaborador:</strong> Acceso básico y limitado</div>
                </div>
              </div>

              {/* Permiso de eliminar registro completo */}
              <div className="p-3 border-2 border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-800 flex items-center gap-2 text-sm">
                      <Trash2 className="h-3 w-3" />
                      Eliminar Registro Completo
                    </h4>
                    <p className="text-xs text-red-600 mt-0.5">
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
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Permisos por Campo</h4>
                {getCurrentFields().map((field) => {
                  const user = userPermissions.find(u => u.userId === selectedUser);
                  const fieldPermissions = user?.fieldPermissions[field.fieldId] || {
                    view: false,
                    edit: false
                  };
                  
                  return (
                    <div key={field.fieldId} className="p-3 border rounded-lg space-y-2">
                      <div>
                        <h4 className="font-medium text-sm">{field.fieldName}</h4>
                        <p className="text-xs text-muted-foreground">{field.description}</p>
                        <Badge variant="secondary" className="mt-0.5 text-xs px-1.5 py-0">
                          {field.category}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {(['view', 'edit'] as const).map((action) => {
                          const Icon = ACTION_ICONS[action];
                          
                          return (
                            <div key={action} className="flex items-center space-x-2 p-2 rounded border">
                              <Switch
                                checked={fieldPermissions[action]}
                                onCheckedChange={(checked) => 
                                  updatePermission(selectedUser, field.fieldId, action, checked)
                                }
                                className="scale-75"
                              />
                              <div className={`flex items-center gap-1.5 ${ACTION_COLORS[action]}`}>
                                <Icon className="h-3 w-3" />
                                <Label className="text-xs font-medium cursor-pointer">
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