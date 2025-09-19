'use client';

/**
 * Security Analytics Dashboard
 * Dashboard for security analysis and audit reports
 */

import React, { useState, useEffect } from 'react';
import { 
  EntityName, 
  ActionType, 
  SystemRole,
  AuditLogEntry
} from '@/types/authorization';

interface SecurityAnalyticsProps {
  className?: string;
}

interface SecurityMetrics {
  totalAccesses: number;
  deniedAccesses: number;
  deniedPercentage: number;
  topEntities: { entity: EntityName; count: number }[];
  topActions: { action: ActionType; count: number }[];
  userActivity: { userId: string; email: string; role: SystemRole; count: number }[];
  timelineData: { date: string; allowed: number; denied: number }[];
  riskEvents: AuditLogEntry[];
}

interface DateRange {
  start: string;
  end: string;
}

export function SecurityAnalytics({ className = '' }: SecurityAnalyticsProps) {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'risks' | 'trends'>('overview');

  useEffect(() => {
    loadSecurityMetrics();
  }, [dateRange]);

  const loadSecurityMetrics = async () => {
    setIsLoading(true);
    try {
      // Mock data for demonstration
      const mockMetrics: SecurityMetrics = {
        totalAccesses: 1247,
        deniedAccesses: 89,
        deniedPercentage: 7.1,
        topEntities: [
          { entity: 'Client', count: 456 },
          { entity: 'Wedding', count: 342 },
          { entity: 'Task', count: 234 },
          { entity: 'Vendor', count: 123 },
          { entity: 'Document', count: 92 }
        ],
        topActions: [
          { action: 'read', count: 678 },
          { action: 'update', count: 345 },
          { action: 'create', count: 156 },
          { action: 'delete', count: 45 },
          { action: 'export', count: 23 }
        ],
        userActivity: [
          { userId: 'user-1', email: 'ana@arrebol.com', role: 'Propietario', count: 234 },
          { userId: 'user-2', email: 'carlos@arrebol.com', role: 'Gestor', count: 189 },
          { userId: 'user-3', email: 'maria@arrebol.com', role: 'Vendedor', count: 156 },
          { userId: 'user-4', email: 'luis@arrebol.com', role: 'GerenteBanquetes', count: 134 },
          { userId: 'user-5', email: 'sofia@arrebol.com', role: 'Planner', count: 98 }
        ],
        timelineData: [
          { date: '2024-01-10', allowed: 145, denied: 12 },
          { date: '2024-01-11', allowed: 167, denied: 8 },
          { date: '2024-01-12', allowed: 134, denied: 15 },
          { date: '2024-01-13', allowed: 189, denied: 6 },
          { date: '2024-01-14', allowed: 178, denied: 11 },
          { date: '2024-01-15', allowed: 198, denied: 9 }
        ],
        riskEvents: [
          {
            id: 'risk-1',
            userId: 'user-suspicious',
            userEmail: 'test@suspicious.com',
            userRole: 'Vendedor',
            entity: 'Client',
            entityId: 'client-sensitive',
            action: 'view_sensitive',
            allowed: false,
            reason: 'insufficient_role',
            ip: '192.168.1.999',
            endpoint: '/api/clients/sensitive-data',
            method: 'GET',
            createdAt: new Date('2024-01-15T02:30:00')
          }
        ]
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load security metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (format: 'pdf' | 'excel') => {
    try {
      // In real implementation, would call API to generate report
      console.log(`Generating ${format} security report for ${dateRange.start} to ${dateRange.end}`);
      
      // Mock download
      const filename = `security-report-${dateRange.start}-to-${dateRange.end}.${format}`;
      alert(`Generando reporte: ${filename}`);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const getMetricCard = (title: string, value: string | number, trend?: 'up' | 'down', className = '') => (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {trend && (
          <div className={`text-sm ${trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
            {trend === 'up' ? '↗' : '↘'}
          </div>
        )}
      </div>
    </div>
  );

  if (!metrics) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Análisis de Seguridad
            </h2>
            <p className="text-gray-600">
              Dashboard de auditoría y métricas de seguridad
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Período:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded"
              />
              <span className="text-gray-500">a</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => generateReport('pdf')}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
              >
                PDF
              </button>
              <button
                onClick={() => generateReport('excel')}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
              >
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen' },
              { id: 'users', label: 'Actividad de Usuarios' },
              { id: 'risks', label: 'Eventos de Riesgo' },
              { id: 'trends', label: 'Tendencias' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {getMetricCard('Total de Accesos', metrics.totalAccesses.toLocaleString())}
            {getMetricCard('Accesos Denegados', metrics.deniedAccesses, 'up', 'border-red-200')}
            {getMetricCard('% Denegados', `${metrics.deniedPercentage}%`, 'up', 'border-red-200')}
            {getMetricCard('Tasa de Éxito', `${(100 - metrics.deniedPercentage).toFixed(1)}%`, 'down', 'border-green-200')}
          </div>

          {/* Top Entities and Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Entidades Más Accedidas
              </h3>
              <div className="space-y-3">
                {metrics.topEntities.map(item => (
                  <div key={item.entity} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.entity}</span>
                    <span className="text-sm text-gray-600">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Más Frecuentes
              </h3>
              <div className="space-y-3">
                {metrics.topActions.map(item => (
                  <div key={item.action} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.action}</span>
                    <span className="text-sm text-gray-600">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad por Usuario
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Rol</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Accesos</th>
                </tr>
              </thead>
              <tbody>
                {metrics.userActivity.map(user => (
                  <tr key={user.userId} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">{user.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.role}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{user.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Risk Events Tab */}
      {activeTab === 'risks' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Eventos de Riesgo Detectados
          </h3>
          {metrics.riskEvents.length > 0 ? (
            <div className="space-y-4">
              {metrics.riskEvents.map(event => (
                <div key={event.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-red-800">
                        Acceso Denegado Sospechoso
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        {event.userEmail} intentó {event.action} en {event.entity}
                      </p>
                      <p className="text-xs text-red-500 mt-2">
                        IP: {event.ip} | Fecha: {event.createdAt.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Riesgo Alto
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No se detectaron eventos de riesgo en el período seleccionado
            </p>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendencias de Acceso
          </h3>
          <div className="space-y-4">
            {metrics.timelineData.map(day => {
              const total = day.allowed + day.denied;
              const deniedPercentage = total > 0 ? (day.denied / total) * 100 : 0;
              
              return (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('es-ES', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Permitidos: {day.allowed}</span>
                      <span className="text-red-600">Denegados: {day.denied}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-l-full"
                        style={{ width: `${100 - deniedPercentage}%` }}
                      ></div>
                      {deniedPercentage > 0 && (
                        <div 
                          className="bg-red-500 h-2 rounded-r-full -mt-2"
                          style={{ width: `${deniedPercentage}%`, marginLeft: `${100 - deniedPercentage}%` }}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Cargando métricas...</p>
          </div>
        </div>
      )}
    </div>
  );
}