/**
 * Dry Run Tester
 * Herramienta para probar políticas de autorización sin afectar el sistema
 */

'use client';

import { useState } from 'react';
import { Play, User, FileText, Eye, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useSettings } from '@/components/admin/settings/SettingsProvider';
import { type DryRunRequest, type DryRunResult, type User, type CRMEntity } from '@/types/admin';

export function DryRunTester() {
  const { 
    users, 
    crmEntities,
    runDryTest,
    isLoading,
    error,
    clearError 
  } = useSettings();

  const [request, setRequest] = useState<Partial<DryRunRequest>>({
    userId: '',
    entityType: '',
    entityId: '',
    action: '',
    context: {}
  });
  
  const [contextJson, setContextJson] = useState('{}');
  const [result, setResult] = useState<DryRunResult | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const handleRunTest = async () => {
    try {
      clearError();
      
      // Validar campos requeridos
      if (!request.userId || !request.entityType || !request.action) {
        throw new Error('Por favor completa todos los campos requeridos');
      }

      // Parsear contexto JSON
      let context = {};
      if (contextJson.trim()) {
        context = JSON.parse(contextJson);
      }

      const testRequest: DryRunRequest = {
        userId: request.userId!,
        entityType: request.entityType!,
        entityId: request.entityId || undefined,
        action: request.action!,
        context
      };

      const testResult = await runDryTest(testRequest);
      setResult(testResult);
    } catch (err) {
      console.error('Error en dry run test:', err);
    }
  };

  const handleClearTest = () => {
    setResult(null);
    setRequest({
      userId: '',
      entityType: '',
      entityId: '',
      action: '',
      context: {}
    });
    setContextJson('{}');
    setExpandedSteps(new Set());
  };

  const toggleStep = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  const handleExportResult = () => {
    if (!result) return;
    
    const exportData = {
      request,
      result,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dryrun-test-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const entityTypes = [
    'client', 'project', 'task', 'comment', 'attachment', 'invoice', 'report'
  ];

  const actions = [
    'create', 'read', 'update', 'delete', 'list', 'export', 'approve', 'assign'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Probador de Políticas</CardTitle>
          <p className="text-sm text-gray-600">
            Prueba las reglas de autorización sin afectar el sistema real
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de prueba */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurar Prueba</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Usuario */}
            <div className="space-y-2">
              <Label htmlFor="user">Usuario *</Label>
              <Select
                value={request.userId}
                onValueChange={(value) => setRequest({ ...request, userId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar usuario..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{user.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de entidad */}
            <div className="space-y-2">
              <Label htmlFor="entityType">Tipo de Entidad *</Label>
              <Select
                value={request.entityType}
                onValueChange={(value) => setRequest({ ...request, entityType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="capitalize">{type}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ID de entidad (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="entityId">ID de Entidad (opcional)</Label>
              <Input
                id="entityId"
                placeholder="ID específico de la entidad..."
                value={request.entityId || ''}
                onChange={(e) => setRequest({ ...request, entityId: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Deja vacío para probar permisos generales del tipo
              </p>
            </div>

            {/* Acción */}
            <div className="space-y-2">
              <Label htmlFor="action">Acción *</Label>
              <Select
                value={request.action}
                onValueChange={(value) => setRequest({ ...request, action: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar acción..." />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      <span className="capitalize">{action}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contexto adicional */}
            <div className="space-y-2">
              <Label htmlFor="context">Contexto Adicional (JSON)</Label>
              <Textarea
                id="context"
                placeholder='{"department": "sales", "priority": "high"}'
                value={contextJson}
                onChange={(e) => setContextJson(e.target.value)}
                rows={3}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Contexto adicional en formato JSON para la evaluación
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <Button 
                onClick={handleRunTest} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Ejecutar Prueba
              </Button>
              
              <Button 
                onClick={handleClearTest} 
                variant="outline"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Resultados</CardTitle>
              {result && (
                <Button 
                  onClick={handleExportResult} 
                  variant="outline" 
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                {/* Resultado principal */}
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2" 
                     style={{
                       backgroundColor: result.allowed ? '#f0fdf4' : '#fef2f2',
                       borderColor: result.allowed ? '#22c55e' : '#ef4444'
                     }}>
                  {result.allowed ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <X className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <h3 className="font-medium">
                      {result.allowed ? 'Acceso Permitido' : 'Acceso Denegado'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Duración: {result.executionTime}ms
                    </p>
                  </div>
                </div>

                {/* Razón */}
                {result.reason && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-1">Razón</h4>
                    <p className="text-sm text-blue-700">{result.reason}</p>
                  </div>
                )}

                {/* Políticas aplicadas */}
                {result.appliedPolicies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Políticas Aplicadas</h4>
                    <div className="space-y-1">
                      {result.appliedPolicies.map((policy, index) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {policy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Trace de evaluación */}
                <div>
                  <h4 className="font-medium mb-3">Trace de Evaluación</h4>
                  <div className="space-y-2">
                    {result.evaluationTrace.map((step, index) => (
                      <Collapsible key={index}>
                        <CollapsibleTrigger
                          onClick={() => toggleStep(index)}
                          className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              step.result === 'allow' ? 'bg-green-500' :
                              step.result === 'deny' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                            <span className="font-medium">{step.step}</span>
                            <Badge variant="outline" className="text-xs">
                              {step.result}
                            </Badge>
                          </div>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="px-3 py-2">
                          <div className="text-sm text-gray-600 space-y-2">
                            <div>
                              <strong>Política:</strong> {step.policy}
                            </div>
                            <div>
                              <strong>Tiempo:</strong> {step.duration}ms
                            </div>
                            {step.details && (
                              <div>
                                <strong>Detalles:</strong>
                                <pre className="mt-1 bg-gray-100 p-2 rounded text-xs font-mono whitespace-pre-wrap">
                                  {JSON.stringify(step.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>

                {/* Contexto de evaluación */}
                {Object.keys(result.evaluationContext).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Contexto de Evaluación</h4>
                    <pre className="bg-gray-50 p-3 rounded text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(result.evaluationContext, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Configura una prueba y haz clic en "Ejecutar Prueba" para ver los resultados
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}