/**
 * Settings Layout - With Navigation
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SimpleSettingsProvider } from '@/components/admin/settings/SimpleSettingsProvider';

const settingsNavigation = [
  { name: 'Users', href: '/settings/users', icon: '👥' },
  { name: 'Roles', href: '/settings/roles', icon: '🛡️' },
  { name: 'User Permissions', href: '/settings/field-permissions', icon: '�' },
  { name: 'Policy', href: '/settings/policy', icon: '📝' },
  { name: 'Versions', href: '/settings/versions', icon: '📚' },
  { name: 'DryRun', href: '/settings/dryrun', icon: '🧪' },
  { name: 'Audit', href: '/settings/audit', icon: '📊' }
];

export default function SettingsLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <SimpleSettingsProvider>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Settings Panel</h1>
          <p className="text-gray-600">Administración y configuración del sistema</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8">
          <nav className="flex space-x-8">
            {settingsNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-6">
          {children}
        </div>
      </div>
    </div>
    </SimpleSettingsProvider>
  );
}