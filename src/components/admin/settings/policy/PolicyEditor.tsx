/**
 * Policy Editor
 * Editor YAML para políticas de autorización con validación en tiempo real
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, RefreshCw, AlertTriangle, CheckCircle, FileText, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/components/admin/settings/SettingsProvider';
import { useAdminSecurity } from '@/components/admin/security/AdminSecurityProvider';
import { generateDefaultPolicyYaml } from '@/lib/admin/utils';
import { type ValidatePolicyResponse } from '@/types/admin';

export function PolicyEditor() {
  const { 
    validatePolicy, 
    createPolicyVersion, 
    fetchPolicyVersions, 
    activePolicyVersion,
    isLoading 
  } = useSettings();
  
  const { executeWithReauth } = useAdminSecurity();
  
  const [yamlContent, setYamlContent] = useState('');
  const [validation, setValidation] = useState<ValidatePolicyResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  // Cargar política activa al montar
  useEffect(() => {
    if (activePolicyVersion) {
      setYamlContent(activePolicyVersion.rawYaml);
      setLastSavedContent(activePolicyVersion.rawYaml);
    } else {
      // Cargar política por defecto si no hay activa
      const defaultYaml = generateDefaultPolicyYaml();
      setYamlContent(defaultYaml);
      setLastSavedContent(defaultYaml);
    }
  }, [activePolicyVersion]);

  // Detectar cambios
  useEffect(() => {
    setHasChanges(yamlContent !== lastSavedContent);
  }, [yamlContent, lastSavedContent]);

  // Validación en tiempo real con debounce
  useEffect(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(async () => {
      if (yamlContent.trim()) {
        await validateYaml();
      }
    }, 1000);

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [yamlContent]);

  const validateYaml = async () => {
    if (!yamlContent.trim()) return;

    setIsValidating(true);
    try {
      const result = await validatePolicy({ rawYaml: yamlContent });
      setValidation(result);
    } catch (error) {
      console.error('Error validating YAML:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!yamlContent.trim()) return;

    // Validar antes de guardar
    await validateYaml();
    
    if (validation && !validation.isValid) {
      return; // No guardar si hay errores
    }

    const saveOperation = async () => {
      try {
        const version = `v${Date.now()}`;
        await createPolicyVersion({
          label: `Policy Update ${new Date().toLocaleString('es-ES')}`,
          rawYaml: yamlContent,
          description: 'Updated via policy editor'
        });

        setLastSavedContent(yamlContent);
        setHasChanges(false);
        
        // Recargar versiones
        await fetchPolicyVersions();
      } catch (error) {
        console.error('Error saving policy:', error);
      }
    };

    executeWithReauth(saveOperation);
  };

  const handleReset = () => {
    setYamlContent(lastSavedContent);
    setHasChanges(false);
  };

  const handleLoadDefault = () => {
    const defaultYaml = generateDefaultPolicyYaml();
    setYamlContent(defaultYaml);
  };

  const getValidationStatus = () => {
    if (isValidating) return { color: 'secondary', text: 'Validando...', icon: RefreshCw };
    if (!validation) return { color: 'outline', text: 'Sin validar', icon: FileText };
    if (validation.isValid) return { color: 'default', text: 'Válido', icon: CheckCircle };
    return { color: 'destructive', text: 'Errores', icon: AlertTriangle };
  };

  const status = getValidationStatus();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Editor de Políticas YAML</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Define las reglas de autorización del sistema
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.text}
              </Badge>
              
              {hasChanges && (
                <Badge variant="outline">
                  Cambios sin guardar
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || isLoading || (validation && !validation.isValid)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Política
            </Button>
            
            <Button 
              onClick={handleReset}
              variant="outline"
              disabled={!hasChanges || isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Descartar Cambios
            </Button>
            
            <Button 
              onClick={handleLoadDefault}
              variant="outline"
              disabled={isLoading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Cargar Plantilla
            </Button>
            
            <Button 
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Ocultar' : 'Vista Previa'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid con editor y validación */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor YAML */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Editor YAML</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={yamlContent}
                onChange={(e) => setYamlContent(e.target.value)}
                placeholder="Escribe tu política YAML aquí..."
                className="min-h-[600px] font-mono text-sm"
                disabled={isLoading}
              />
              
              <div className="text-xs text-gray-500">
                Líneas: {yamlContent.split('\n').length} | 
                Caracteres: {yamlContent.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel de validación y estadísticas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Validación y Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Estado de validación */}
              <div>
                <h4 className="font-medium mb-3">Estado de Validación</h4>
                <div className="flex items-center space-x-2 mb-3">
                  <StatusIcon className={`h-4 w-4 ${
                    status.color === 'default' ? 'text-green-600' :
                    status.color === 'destructive' ? 'text-red-600' :
                    'text-gray-500'
                  }`} />
                  <span className="text-sm">{status.text}</span>
                </div>
              </div>

              {/* Errores de validación */}
              {validation?.errors && validation.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-3">Errores</h4>
                  <div className="space-y-2">
                    {validation.errors.map((error, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="text-sm">
                          <span className="font-medium text-red-800">{error.field}:</span>
                          <span className="text-red-700 ml-2">{error.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advertencias */}
              {validation?.warnings && validation.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-amber-600 mb-3">Advertencias</h4>
                  <div className="space-y-2">
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className="bg-amber-50 border border-amber-200 rounded p-3">
                        <p className="text-sm text-amber-700">{warning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estadísticas */}
              {validation?.parsedRules && (
                <div>
                  <h4 className="font-medium mb-3">Estadísticas</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 rounded p-3">
                      <div className="font-medium text-blue-800">Roles</div>
                      <div className="text-blue-600 text-lg">{validation.parsedRules.roles}</div>
                    </div>
                    <div className="bg-green-50 rounded p-3">
                      <div className="font-medium text-green-800">Entidades</div>
                      <div className="text-green-600 text-lg">{validation.parsedRules.entities}</div>
                    </div>
                    <div className="bg-purple-50 rounded p-3">
                      <div className="font-medium text-purple-800">Acciones</div>
                      <div className="text-purple-600 text-lg">{validation.parsedRules.actions}</div>
                    </div>
                    <div className="bg-orange-50 rounded p-3">
                      <div className="font-medium text-orange-800">Reglas</div>
                      <div className="text-orange-600 text-lg">{validation.parsedRules.policyRules}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información de la política activa */}
              {activePolicyVersion && (
                <div>
                  <h4 className="font-medium mb-3">Política Activa</h4>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <div><strong>Versión:</strong> {activePolicyVersion.label}</div>
                    <div><strong>Creada:</strong> {new Date(activePolicyVersion.createdAt).toLocaleString('es-ES')}</div>
                    <div><strong>Autor:</strong> {activePolicyVersion.createdBy.name}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista previa (opcional) */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vista Previa de Política</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto">
              {yamlContent}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}