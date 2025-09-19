/**
 * API Endpoint: /api/admin/dryrun
 * Testing de autorización con dry run
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminAuditLog, handleAdminError, executeDryRun } from '@/lib/admin/utils';
import { type DryRunRequest, type DryRunResponse, type AdminApiResponse } from '@/types/admin';
import { AuthorizationEngine } from '@/lib/authorization/engine';

// POST /api/admin/dryrun - Ejecutar prueba de autorización
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

    const body: DryRunRequest = await request.json();

    // Validaciones
    if (!body.action || !body.entity) {
      return NextResponse.json(
        { success: false, message: 'Action and entity are required' },
        { status: 400 }
      );
    }

    // Crear instancia del engine de autorización
    const authEngine = new AuthorizationEngine();

    // Ejecutar dry run
    const dryRunResult = await executeDryRun(authEngine, {
      userId: body.userId,
      role: body.role || 'Vendedor',
      action: body.action,
      entity: body.entity,
      recordId: body.recordId,
      field: body.field,
      mockData: body.mockData
    });

    await createAdminAuditLog(
      userSession.id,
      'dryrun',
      body.entity,
      body.recordId,
      {
        diffAfter: { 
          action: body.action, 
          entity: body.entity, 
          role: body.role,
          result: dryRunResult.result 
        },
        ip: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: '/api/admin/dryrun',
        method: 'POST'
      }
    );

    const response: AdminApiResponse<DryRunResponse> = {
      success: true,
      data: dryRunResult,
      message: 'Dry run executed successfully'
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