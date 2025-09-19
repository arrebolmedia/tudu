/**
 * Roles Management
 * Componente para gestión de roles del sistema
 */

'use client';

import { useEffect, useState } from 'react';
import { Shield, Users, Info, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/components/admin/settings/SettingsProvider';

const roleDescriptions = {
  SuperAdmin: {
    description: 'Administrador del sistema con acceso completo a todas las funciones.',
    permissions: [
      'Gestión completa de usuarios y roles',
      'Configuración de políticas de seguridad',
      'Acceso a audit logs y métricas',
      'Administración de venues y equipos',
      'Operaciones críticas del sistema'
    ],
    color: 'destructive' as const,
    icon: '🔑'
  },
  Propietario: {
    description: 'Dueño del negocio con acceso administrativo a su venue.',
    permissions: [
      'Gestión de su venue y equipos',
      'Acceso a reportes financieros',
      'Configuración de políticas del venue',
      'Supervisión de todas las operaciones',
      'Gestión de usuarios del venue'
    ],
    color: 'default' as const,
    icon: '👑'
  },
  Gestor: {
    description: 'Manager del venue con supervisión de equipos y operaciones.',
    permissions: [
      'Supervisión de equipos y vendedores',
      'Acceso a métricas y reportes',
      'Gestión de clientes y bodas',
      'Coordinación de recursos',
      'Aprobación de operaciones importantes'
    ],
    color: 'secondary' as const,
    icon: '👨‍💼'
  },
  Vendedor: {
    description: 'Representante de ventas con gestión de clientes y bodas.',
    permissions: [
      'Gestión de clientes asignados',
      'Creación y seguimiento de bodas',
      'Acceso a catálogos y precios',
      'Comunicación con clientes',
      'Reportes de ventas básicos'
    ],
    color: 'outline' as const,
    icon: '💼'
  },
  GerenteBanquetes: {
    description: 'Gerente de operaciones con enfoque en ejecución de eventos.',
    permissions: [
      'Coordinación de eventos y bodas',
      'Gestión de proveedores',
      'Supervisión de montajes',
      'Control de calidad',
      'Reportes operacionales'
    ],
    color: 'outline' as const,
    icon: '🍽️'
  },
  Planner: {
    description: 'Coordinador de bodas con gestión de tareas y cronogramas.',
    permissions: [
      'Planificación y coordinación de bodas',
      'Gestión de tareas y cronogramas',
      'Comunicación con novios y proveedores',
      'Seguimiento de avances',
      'Documentación de eventos'
    ],
    color: 'outline' as const,
    icon: '📋'
  }
};

export function RolesManagement() {
  const { roles, isLoading, error, fetchRoles, clearError } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const filteredRoles = roles.filter(role =>
    !searchTerm || 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={clearError} variant="outline">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Roles del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Buscar roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div className="text-sm text-gray-500">
              {roles.length} roles configurados
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información general */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-1">
                Roles y Permisos del Sistema
              </p>
              <p>
                Los roles definen los permisos de acceso y las funciones disponibles para cada usuario. 
                Cada rol tiene un conjunto específico de permisos que determinan qué acciones puede realizar 
                el usuario en el sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de roles */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => {
            const roleInfo = roleDescriptions[role.name as keyof typeof roleDescriptions];
            
            return (
              <Card key={role.id} className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{roleInfo?.icon || '👤'}</span>
                      <div>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={roleInfo?.color || 'outline'}>
                            {role.isSystem ? 'Sistema' : 'Personalizado'}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            {role.usersCount} usuarios
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Descripción */}
                    <p className="text-sm text-gray-600">
                      {roleInfo?.description || role.description || 'Sin descripción disponible'}
                    </p>
                    
                    {/* Permisos principales */}
                    {roleInfo?.permissions && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Permisos principales:
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {roleInfo.permissions.slice(0, 3).map((permission, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-600 mr-2">•</span>
                              {permission}
                            </li>
                          ))}
                          {roleInfo.permissions.length > 3 && (
                            <li className="text-gray-500 italic">
                              +{roleInfo.permissions.length - 3} permisos más...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {/* Advertencia para SuperAdmin */}
                    {role.name === 'SuperAdmin' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-red-700">
                            Rol crítico del sistema. Ten precaución al modificar usuarios con este rol.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredRoles.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron roles</p>
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Jerarquía de Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <Badge variant="destructive">SuperAdmin</Badge>
              <span className="text-gray-500">→</span>
              <Badge variant="default">Propietario</Badge>
              <span className="text-gray-500">→</span>
              <Badge variant="secondary">Gestor</Badge>
              <span className="text-gray-500">→</span>
              <Badge variant="outline">Vendedor, GerenteBanquetes, Planner</Badge>
            </div>
            <p className="text-gray-600 text-xs">
              Los roles de mayor jerarquía tienen acceso a las funciones de los roles inferiores, 
              además de sus permisos específicos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}