/**
 * API Endpoint: /api/admin/roles
 * Gestión de roles para SuperAdmin
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminAuditLog, handleAdminError, calculateOffset, createPaginationMeta } from '@/lib/admin/utils';
import { type AdminRole, type CreateRoleDto, type PatchRoleDto, type AdminApiResponse, SYSTEM_ROLES } from '@/types/admin';

const prisma = new PrismaClient();

// GET /api/admin/roles - Listar roles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que es SuperAdmin
    const userSession = session.user as any;
    if (userSession.role !== 'SuperAdmin') {
      return NextResponse.json({ success: false, message: 'Forbidden: SuperAdmin role required' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';

    const offset = calculateOffset(page, pageSize);

    // Para roles, vamos a simular con los roles del sistema
    // En una implementación real, tendrías una tabla Role
    const systemRoles = [
      {
        id: 'superadmin',
        name: 'SuperAdmin',
        description: 'System administrator with full access',
        isSystem: true
      },
      {
        id: 'propietario',
        name: 'Propietario',
        description: 'Business owner with venue-wide access',
        isSystem: true
      },
      {
        id: 'gestor',
        name: 'Gestor',
        description: 'Venue manager with team oversight',
        isSystem: true
      },
      {
        id: 'vendedor',
        name: 'Vendedor',
        description: 'Sales person with client management',
        isSystem: true
      },
      {
        id: 'gerente-banquetes',
        name: 'GerenteBanquetes',
        description: 'Banquet manager with wedding execution access',
        isSystem: true
      },
      {
        id: 'planner',
        name: 'Planner',
        description: 'Wedding planner with task coordination',
        isSystem: true
      }
    ];

    // Obtener conteo de usuarios por rol
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
      where: {
        isActive: true
      }
    });

    const userCountMap = userCounts.reduce((acc, item) => {
      acc[item.role] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Construir roles con conteo
    let roles = systemRoles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      usersCount: userCountMap[role.name] || 0,
      isSystem: role.isSystem,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as AdminRole));

    // Aplicar filtro de búsqueda
    if (search) {
      roles = roles.filter(role => 
        role.name.toLowerCase().includes(search.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Aplicar paginación
    const total = roles.length;
    const paginatedRoles = roles.slice(offset, offset + pageSize);
    const pagination = createPaginationMeta(page, pageSize, total);

    await createAdminAuditLog(
      userSession.id,
      'list',
      'Role',
      undefined,
      {
        ip: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: '/api/admin/roles',
        method: 'GET'
      }
    );

    const response: AdminApiResponse<{ roles: AdminRole[]; pagination: typeof pagination }> = {
      success: true,
      data: {
        roles: paginatedRoles,
        pagination
      }
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

// POST /api/admin/roles - Crear rol personalizado (futuro)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userSession = session.user as any;
    if (userSession.role !== 'SuperAdmin') {
      return NextResponse.json({ success: false, message: 'Forbidden: SuperAdmin role required' }, { status: 403 });
    }

    // Por ahora, no permitir crear roles personalizados
    // Esta funcionalidad se implementaría en el futuro
    return NextResponse.json(
      { success: false, message: 'Custom role creation not yet implemented' },
      { status: 501 }
    );

  } catch (error) {
    const errorInfo = handleAdminError(error);
    return NextResponse.json(
      { success: false, message: errorInfo.message, code: errorInfo.code },
      { status: errorInfo.statusCode }
    );
  }
}