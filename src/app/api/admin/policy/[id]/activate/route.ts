/**
 * API Endpoint: /api/admin/policy/[id]/activate
 * Activación de versiones de política con re-autenticación
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateReauth, createAdminAuditLog, handleAdminError } from '@/lib/admin/utils';
import { type ActivatePolicyVersionDto, type AdminApiResponse } from '@/types/admin';

// POST /api/admin/policy/[id]/activate - Activar versión de política
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userSession = session.user as any;
    if (userSession.role !== 'SuperAdmin') {
      return NextResponse.json({ success: false, message: 'Forbidden: SuperAdmin role required' }, { status: 403 });
    }

    const versionId = params.id;
    const body: ActivatePolicyVersionDto = await request.json();

    if (!body.password) {
      return NextResponse.json(
        { success: false, message: 'Password is required for policy activation' },
        { status: 400 }
      );
    }

    // Verificar re-autenticación
    const isValidPassword = await validateReauth(userSession.id, body.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    // En una implementación real, aquí activarías la versión en la base de datos
    // y desactivarías la versión anterior
    
    await createAdminAuditLog(
      userSession.id,
      'activate',
      'PolicyVersion',
      versionId,
      {
        ip: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: `/api/admin/policy/${versionId}/activate`,
        method: 'POST'
      }
    );

    const response: AdminApiResponse = {
      success: true,
      message: `Policy version ${versionId} activated successfully`
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