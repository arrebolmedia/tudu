/**
 * User Field Permissions Page
 * Página para gestionar permisos granulares por usuario específico
 */

import { UserFieldPermissionsManager } from '@/components/admin/settings/UserFieldPermissionsManager';

export default function UserFieldPermissionsPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <UserFieldPermissionsManager />
    </div>
  );
}