/**
 * Policy Versions
 * Gestión de versiones históricas de políticas
 */

'use client';

import { useEffect, useState } from 'react';
import { History, Play, Eye, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSettings } from '@/components/admin/settings/SettingsProvider';
import { useAdminSecurity } from '@/components/admin/security/AdminSecurityProvider';
import { type PolicyVersion } from '@/types/admin';

export function PolicyVersions() {
  const { 
    policyVersions, 
    activePolicyVersion,
    isLoading, 
    error, 
    fetchPolicyVersions,
    activatePolicyVersion,
    clearError 
  } = useSettings();
  
  const { executeWithReauth } = useAdminSecurity();
  
  const [selectedVersion, setSelectedVersion] = useState<PolicyVersion | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);

  useEffect(() => {
    fetchPolicyVersions();
  }, [fetchPolicyVersions]);

  const handlePreview = (version: PolicyVersion) => {
    setSelectedVersion(version);
    setIsPreviewOpen(true);
  };

  const handleActivate = (version: PolicyVersion) => {
    setSelectedVersion(version);
    setIsActivateDialogOpen(true);
  };

  const confirmActivate = () => {
    if (!selectedVersion) return;
    
    executeWithReauth(async () => {
      // En una implementación real, se pasaría la contraseña validada
      await activatePolicyVersion(selectedVersion.id, '');
      setIsActivateDialogOpen(false);
      setSelectedVersion(null);
    });
  };

  const handleDownload = (version: PolicyVersion) => {
    const blob = new Blob([version.rawYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `policy-${version.label}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={clearError} variant="outline">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Versiones</CardTitle>
          <p className="text-sm text-gray-600">
            Gestiona las versiones históricas de las políticas de autorización
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {policyVersions.length} versiones disponibles
            </div>
            <Button onClick={() => fetchPolicyVersions()} variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información de la versión activa */}
      {activePolicyVersion && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Política Activa</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Versión:</strong> {activePolicyVersion.label}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Activada:</strong> {formatDate(activePolicyVersion.createdAt)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Autor:</strong> {activePolicyVersion.createdBy.name}
                </p>
                {activePolicyVersion.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {activePolicyVersion.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabla de versiones */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Versión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policyVersions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell>
                      <div className="font-medium">{version.label}</div>
                      <div className="text-sm text-gray-500">ID: {version.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={version.isActive ? 'default' : 'secondary'}>
                        {version.isActive ? 'Activa' : 'Histórica'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{version.createdBy.name}</div>
                        <div className="text-sm text-gray-500">{version.createdBy.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(version.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {version.description || 'Sin descripción'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(version)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(version)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        
                        {!version.isActive && (
                          <Button
                            size="sm"
                            onClick={() => handleActivate(version)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Activar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {policyVersions.length === 0 && !isLoading && (
            <div className="text-center p-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay versiones disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de vista previa */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vista Previa de Política</DialogTitle>
            <DialogDescription>
              {selectedVersion?.label} - {selectedVersion && formatDate(selectedVersion.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            <pre className="bg-gray-50 p-4 rounded text-xs font-mono whitespace-pre-wrap">
              {selectedVersion?.rawYaml}
            </pre>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de activación */}
      <Dialog open={isActivateDialogOpen} onOpenChange={setIsActivateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Activar Versión de Política</span>
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres activar esta versión? Esta acción afectará 
              inmediatamente las reglas de autorización del sistema.
            </DialogDescription>
          </DialogHeader>

          {selectedVersion && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div><strong>Versión:</strong> {selectedVersion.label}</div>
                <div><strong>Fecha:</strong> {formatDate(selectedVersion.createdAt)}</div>
                <div><strong>Autor:</strong> {selectedVersion.createdBy.name}</div>
                {selectedVersion.description && (
                  <div><strong>Descripción:</strong> {selectedVersion.description}</div>
                )}
              </div>
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              <strong>Importante:</strong> Se requiere re-autenticación para activar una política. 
              Todos los usuarios verán los cambios inmediatamente.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsActivateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmActivate}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Activar Política
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}