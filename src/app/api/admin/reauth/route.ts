/**
 * API Endpoint: /api/admin/reauth
 * Re-autenticación para operaciones elevadas
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateReauth, generateElevatedToken, createAdminAuditLog, handleAdminError } from '@/lib/admin/utils';
import { type ReauthRequest, type ReauthResponse, type AdminApiResponse } from '@/types/admin';

// POST /api/admin/reauth - Validar contraseña y generar token elevado
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

    const body: ReauthRequest = await request.json();

    if (!body.password) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    // Validar contraseña
    const isValidPassword = await validateReauth(userSession.id, body.password);
    
    if (!isValidPassword) {
      // Log intento fallido
      await createAdminAuditLog(
        userSession.id,
        'reauth_failed',
        'User',
        userSession.id,
        {
          ip: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || undefined,
          endpoint: '/api/admin/reauth',
          method: 'POST'
        }
      );

      const failedResponse: ReauthResponse = {
        success: false,
        message: 'Invalid password'
      };

      return NextResponse.json(failedResponse, { status: 401 });
    }

    // Generar token elevado
    const elevatedToken = generateElevatedToken(userSession.id);

    // Log re-autenticación exitosa
    await createAdminAuditLog(
      userSession.id,
      'reauth_success',
      'User',
      userSession.id,
      {
        ip: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: '/api/admin/reauth',
        method: 'POST'
      }
    );

    const successResponse: ReauthResponse = {
      success: true,
      message: 'Re-authentication successful',
      token: elevatedToken
    };

    const response: AdminApiResponse<ReauthResponse> = {
      success: true,
      data: successResponse,
      message: 'Re-authentication successful'
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