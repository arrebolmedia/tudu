/**
 * Settings Navigation
 * Navegación lateral del panel de administración
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Shield, 
  Code, 
  History, 
  Play, 
  Eye,
  AlertTriangle
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  description: string;
  badge?: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Usuarios',
    href: '/settings/users',
    icon: Users,
    description: 'Gestión de usuarios del sistema'
  },
  {
    name: 'Roles',
    href: '/settings/roles',
    icon: Shield,
    description: 'Configuración de roles'
  },
  {
    name: 'Políticas',
    href: '/settings/policy',
    icon: Code,
    description: 'Editor de políticas YAML'
  },
  {
    name: 'Versiones',
    href: '/settings/versions',
    icon: History,
    description: 'Histórico de políticas'
  },
  {
    name: 'Dry Run',
    href: '/settings/dryrun',
    icon: Play,
    description: 'Testing de autorización'
  },
  {
    name: 'Audit Logs',
    href: '/settings/audit',
    icon: Eye,
    description: 'Monitoreo de actividad'
  }
];

export function SettingsNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full">
      {/* Aviso de seguridad */}
      <div className="p-4 bg-red-50 border-b border-red-200">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-red-800">
              Zona de Administración
            </p>
            <p className="text-red-700 mt-1">
              Los cambios aquí afectan todo el sistema. Procede con precaución.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de navegación */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive
                        ? 'text-blue-700'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer de información */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          <div className="font-medium">Panel SuperAdmin</div>
          <div className="mt-1">
            Versión 1.0.0 • RBAC/ABAC
          </div>
        </div>
      </div>
    </nav>
  );
}