/**
 * Settings DryRun Page
 */

export default function SettingsDryRunPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Simulación de Políticas</h2>
      <p className="text-gray-600 mb-4">Simula la ejecución de políticas sin aplicar cambios</p>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">✅ Página de simulación cargada correctamente</p>
        <p className="text-sm text-yellow-600 mt-2">Componente DryRunTester será restaurado aquí</p>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Test de Autorización - Settings',
  description: 'Simulación de operaciones de autorización'
};