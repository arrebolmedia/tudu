/**
 * Settings Policy Page
 */

export default function SettingsPolicyPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Editor de Políticas</h2>
      <p className="text-gray-600 mb-4">Edita las políticas de autorización del sistema</p>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800">✅ Página de políticas cargada correctamente</p>
        <p className="text-sm text-green-600 mt-2">Editor YAML será restaurado aquí</p>
      </div>
    </div>
  );
}