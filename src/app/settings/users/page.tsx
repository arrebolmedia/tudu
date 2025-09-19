/**
 * Settings Users Page
 */

import { SimpleUsersManagement } from '@/components/admin/settings/SimpleUsersManagement';

export default function SettingsUsersPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
      <p className="text-gray-600 mb-6">Administra cuentas de usuario, roles y permisos</p>
      
      <SimpleUsersManagement />
    </div>
  );
}