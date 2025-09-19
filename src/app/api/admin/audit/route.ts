/**
 * API Endpoint: /api/admin/audit
 * Gestión de audit logs para SuperAdmin
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminAuditLog, handleAdminError, calculateOffset, createPaginationMeta } from '@/lib/admin/utils';
import { type AdminAuditLog, type AuditLogFilters, type AuditLogResponse, type AdminApiResponse } from '@/types/admin';

const prisma = new PrismaClient();

// GET /api/admin/audit - Obtener audit logs
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

    const searchParams = request.nextUrl.searchParams;
    
    // Construir filtros
    const filters: AuditLogFilters = {
      userId: searchParams.get('userId') || undefined,
      entity: searchParams.get('entity') || undefined,
      action: searchParams.get('action') || undefined,
      allowed: searchParams.get('allowed') ? searchParams.get('allowed') === 'true' : undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '50'),
      search: searchParams.get('search') || undefined
    };

    const offset = calculateOffset(filters.page!, filters.pageSize!);

    // Construir where clause
    const where: any = {};
    
    if (filters.userId) {
      where.userId = filters.userId;
    }
    
    if (filters.entity) {
      where.entity = filters.entity;
    }
    
    if (filters.action) {
      where.action = filters.action;
    }
    
    if (filters.allowed !== undefined) {
      where.allowed = filters.allowed;
    }
    
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) {
        where.createdAt.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.createdAt.lte = new Date(filters.to);
      }
    }
    
    if (filters.search) {
      where.OR = [
        { userEmail: { contains: filters.search, mode: 'insensitive' } },
        { action: { contains: filters.search, mode: 'insensitive' } },
        { entity: { contains: filters.search, mode: 'insensitive' } },
        { reason: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // Obtener logs y total
    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: filters.pageSize!
      }),
      prisma.auditLog.count({ where })
    ]);

    const adminAuditLogs: AdminAuditLog[] = auditLogs.map(log => ({
      id: log.id,
      userId: log.userId || undefined,
      userEmail: log.user?.email || log.userEmail || undefined,
      userRole: log.userRole || undefined,
      entity: log.entity,
      entityId: log.entityId || undefined,
      action: log.action,
      field: log.field || undefined,
      allowed: log.allowed,
      reason: log.reason || undefined,
      diffBefore: log.diffBefore as Record<string, any> || undefined,
      diffAfter: log.diffAfter as Record<string, any> || undefined,
      ip: log.ip || undefined,
      userAgent: log.userAgent || undefined,
      endpoint: log.endpoint || undefined,
      method: log.method || undefined,
      createdAt: log.createdAt.toISOString()
    }));

    const pagination = createPaginationMeta(filters.page!, filters.pageSize!, total);

    const auditResponse: AuditLogResponse = {
      logs: adminAuditLogs,
      pagination,
      filters
    };

    // Log el acceso a audit logs
    await createAdminAuditLog(
      userSession.id,
      'list',
      'AuditLog',
      undefined,
      {
        ip: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: '/api/admin/audit',
        method: 'GET'
      }
    );

    const response: AdminApiResponse<AuditLogResponse> = {
      success: true,
      data: auditResponse
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

// DELETE /api/admin/audit - Purgar audit logs antiguos
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userSession = session.user as any;
    if (userSession.role !== 'SuperAdmin') {
      return NextResponse.json({ success: false, message: 'Forbidden: SuperAdmin role required' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const olderThan = searchParams.get('olderThan'); // ISO date string

    if (!olderThan) {
      return NextResponse.json(
        { success: false, message: 'olderThan parameter is required' },
        { status: 400 }
      );
    }

    const cutoffDate = new Date(olderThan);
    if (isNaN(cutoffDate.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Contar logs que serán eliminados
    const toDeleteCount = await prisma.auditLog.count({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    // Eliminar logs antiguos
    const deleteResult = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    await createAdminAuditLog(
      userSession.id,
      'purge',
      'AuditLog',
      undefined,
      {
        diffAfter: { 
          deletedCount: deleteResult.count, 
          cutoffDate: cutoffDate.toISOString() 
        },
        ip: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: '/api/admin/audit',
        method: 'DELETE'
      }
    );

    const response: AdminApiResponse<{ deletedCount: number }> = {
      success: true,
      data: { deletedCount: deleteResult.count },
      message: `Deleted ${deleteResult.count} audit log entries older than ${cutoffDate.toISOString()}`
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