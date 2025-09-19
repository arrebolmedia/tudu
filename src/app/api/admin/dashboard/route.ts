/**
 * API Endpoint: /api/admin/dashboard
 * Estadísticas del dashboard para SuperAdmin
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminAuditLog, handleAdminError } from '@/lib/admin/utils';
import { type AdminDashboardStats, type AdminApiResponse } from '@/types/admin';

const prisma = new PrismaClient();

// GET /api/admin/dashboard - Obtener estadísticas del dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userSession = session.user as any;
    if (userSession.role !== 'SuperAdmin') {
      return NextResponse.json({ success: false, message: 'Forbidden: SuperAdmin role required' }, { status: 403 });
    }

    // Obtener estadísticas de usuarios
    const [
      totalUsers,
      activeUsers,
      usersByRole,
      totalAuditLogs,
      todayAuditLogs,
      deniedToday,
      riskEvents
    ] = await Promise.all([
      // Total de usuarios
      prisma.user.count(),
      
      // Usuarios activos
      prisma.user.count({ where: { isActive: true } }),
      
      // Usuarios por rol
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
        where: { isActive: true }
      }),
      
      // Total de audit logs
      prisma.auditLog.count(),
      
      // Audit logs de hoy
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Accesos denegados hoy
      prisma.auditLog.count({
        where: {
          allowed: false,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Eventos de riesgo (múltiples fallos de autenticación)
      prisma.auditLog.count({
        where: {
          action: { in: ['reauth_failed', 'login_failed'] },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        }
      })
    ]);

    // Construir mapa de roles
    const roleMap = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Estadísticas de política (simulado)
    const policyStats = {
      activeVersion: 'v1.0.0',
      totalVersions: 1,
      lastModified: new Date().toISOString()
    };

    const dashboardStats: AdminDashboardStats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: roleMap
      },
      roles: {
        total: 6, // Roles del sistema
        system: 6,
        custom: 0
      },
      policy: policyStats,
      audit: {
        todayEvents: todayAuditLogs,
        deniedToday: deniedToday,
        riskEvents: riskEvents
      }
    };

    await createAdminAuditLog(
      userSession.id,
      'dashboard',
      'System',
      undefined,
      {
        ip: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: '/api/admin/dashboard',
        method: 'GET'
      }
    );

    const response: AdminApiResponse<AdminDashboardStats> = {
      success: true,
      data: dashboardStats
    };

    return NextResponse.json(response);

  } catch (error) {
    const errorInfo = handleAdminError(error);
    return NextResponse.json(
      { success: false, message: errorInfo.message, code: errorInfo.code },
      { status: errorInfo.statusCode }
    );
  }
}