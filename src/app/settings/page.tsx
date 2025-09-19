/**
 * Settings Main Page
 * Página principal del panel de administración que redirige a Users
 */

import { redirect } from 'next/navigation';

export default function SettingsPage() {
  // Redirigir automáticamente a la pestaña Users
  redirect('/settings/users');
}