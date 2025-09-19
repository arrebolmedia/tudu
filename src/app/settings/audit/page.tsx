/**
 * Settings Audit Page
 */

export default function SettingsAuditPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>
      <p className="text-gray-600 mb-4">Monitorea y analiza la actividad del sistema</p>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">✅ Página de auditoría cargada correctamente</p>
        <p className="text-sm text-red-600 mt-2">Componente AuditLogsViewer será restaurado aquí</p>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Audit Logs - Settings',
  description: 'Monitoreo de actividad del sistema'
};