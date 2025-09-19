'use client';

/**
 * Audit Log Viewer Component
 * View and analyze security audit logs
 */

import React, { useState, useEffect } from 'react';
import { 
  EntityName, 
  ActionType, 
  AuditLogEntry,
  AuditQueryParams
} from '@/types/authorization';
import { useAuthorization } from '@/hooks/useAuthorization';

interface AuditLogViewerProps {
  className?: string;
}

interface AuditFilters {
  userId?: string;
  entity?: EntityName;
  action?: ActionType;
  allowed?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}

const ENTITIES: EntityName[] = [
  'Client', 'Wedding', 'Vendor', 'Task', 'Document', 'Payment', 'Comment', 'User'
];

const ACTIONS: ActionType[] = [
  'create', 'read', 'update', 'delete', 'export', 'view_sensitive'
];

export function AuditLogViewer({ className = '' }: AuditLogViewerProps) {
  const { can } = useAuthorization();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const itemsPerPage = 50;

  useEffect(() => {
    loadAuditLogs();
  }, [filters, currentPage]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      // Mock data for demonstration
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          userId: 'user-1',
          userEmail: 'ana@arrebol.com',
          userRole: 'Propietario',
          entity: 'Client',
          entityId: 'client-123',
          action: 'read',
          allowed: true,
          reason: 'scope_granted_global',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Chrome/120.0',
          endpoint: '/api/clients/client-123',
          method: 'GET',
          createdAt: new Date('2024-01-15T10:30:00')
        },
        {
          id: '2',
          userId: 'user-2',
          userEmail: 'carlos@arrebol.com',
          userRole: 'Vendedor',
          entity: 'Client',
          entityId: 'client-456',
          action: 'update',
          allowed: false,
          reason: 'insufficient_role',
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0 Chrome/120.0',
          endpoint: '/api/clients/client-456',
          method: 'PUT',
          createdAt: new Date('2024-01-15T09:15:00')
        },
        {
          id: '3',
          userId: 'user-3',
          userEmail: 'maria@arrebol.com',
          userRole: 'GerenteBanquetes',
          entity: 'Wedding',
          entityId: 'wedding-789',
          action: 'view_sensitive',
          allowed: true,
          reason: 'role_explicitly_allowed',
          field: 'budget',
          diffBefore: { budget: 50000 },
          diffAfter: { budget: 55000 },
          ip: '192.168.1.102',
          userAgent: 'Mozilla/5.0 Safari/120.0',
          endpoint: '/api/weddings/wedding-789',
          method: 'GET',
          createdAt: new Date('2024-01-14T16:45:00')
        }
      ];

      setLogs(mockLogs);
      setTotalPages(Math.ceil(mockLogs.length / itemsPerPage));
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AuditFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleExportLogs = async () => {
    try {
      // In real implementation, would call API to export logs
      const dataToExport = selectedLogs.length > 0
        ? logs.filter(log => selectedLogs.includes(log.id))
        : logs;

      const csvContent = generateCSV(dataToExport);
      downloadCSV(csvContent, `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  const generateCSV = (data: AuditLogEntry[]): string => {
    const headers = [
      'Fecha',
      'Usuario',
      'Email',
      'Rol',
      'Entidad',
      'Acción',
      'Permitido',
      'Razón',
      'IP',
      'Endpoint'
    ];

    const rows = data.map(log => [
      log.createdAt.toISOString(),
      log.userId || '',
      log.userEmail || '',
      log.userRole || '',
      log.entity,
      log.action,
      log.allowed ? 'Sí' : 'No',
      log.reason || '',
      log.ip || '',
      log.endpoint || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getStatusColor = (allowed: boolean) => {
    return allowed 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getActionColor = (action: ActionType) => {
    const colors: Record<ActionType, string> = {
      create: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      update: 'bg-yellow-100 text-yellow-800',
      delete: 'bg-red-100 text-red-800',
      export: 'bg-purple-100 text-purple-800',
      import: 'bg-indigo-100 text-indigo-800',
      assign: 'bg-green-100 text-green-800',
      view_sensitive: 'bg-orange-100 text-orange-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Logs de Auditoría
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Historial de acciones y verificaciones de seguridad
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportLogs}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
            >
              Exportar {selectedLogs.length > 0 ? `(${selectedLogs.length})` : 'Todo'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entidad
            </label>
            <select
              value={filters.entity || ''}
              onChange={(e) => handleFilterChange('entity', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              {ENTITIES.map(entity => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acción
            </label>
            <select
              value={filters.action || ''}
              onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              {ACTIONS.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.allowed === undefined ? '' : filters.allowed.toString()}
              onChange={(e) => handleFilterChange('allowed', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="true">Permitido</option>
              <option value="false">Denegado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Email, IP, endpoint..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedLogs.length === logs.length && logs.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLogs(logs.map(log => log.id));
                    } else {
                      setSelectedLogs([]);
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Acción
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Entidad
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Razón
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                IP
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLogs.includes(log.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLogs(prev => [...prev, log.id]);
                      } else {
                        setSelectedLogs(prev => prev.filter(id => id !== log.id));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </td>
                
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatDate(log.createdAt)}
                </td>
                
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {log.userEmail}
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.userRole}
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div>
                    {log.entity}
                    {log.entityId && (
                      <div className="text-xs text-gray-500">
                        ID: {log.entityId}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.allowed)}`}>
                    {log.allowed ? '✓ Permitido' : '✗ Denegado'}
                  </span>
                </td>
                
                <td className="px-4 py-3 text-sm text-gray-600">
                  {log.reason}
                </td>
                
                <td className="px-4 py-3 text-sm text-gray-600">
                  {log.ip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}