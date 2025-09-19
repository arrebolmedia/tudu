/**
 * API Endpoint: /api/admin/users/[id]/reset-password
 * Reset de contraseña para usuarios
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireSuperAdmin, createAdminAuditLog, handleAdminError } from '@/lib/admin/utils';
import { type ResetPasswordResponse, type AdminApiResponse } from '@/types/admin';
import crypto from 'crypto';

const prisma = new PrismaClient();

// POST /api/admin/users/[id]/reset-password - Reset password
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que es SuperAdmin (usando tipos básicos de session)
    const userSession = session.user as any; // Temporary cast until we fix session types
    if (userSession.role !== 'SuperAdmin') {
      return NextResponse.json({ success: false, message: 'Forbidden: SuperAdmin role required' }, { status: 403 });
    }

    const userId = params.id;

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Generar nueva contraseña temporal
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Actualizar contraseña en BD
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      }
    });

    // Crear token de reset (opcional, para flows más complejos)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const resetResponse: ResetPasswordResponse = {
      token: resetToken,
      expiresAt: expiresAt.toISOString(),
      message: 'Password reset successfully. User will receive temporary password.'
    };

    await createAdminAuditLog(
      userSession.id,
      'reset_password',
      'User',
      userId,
      {
        ip: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: `/api/admin/users/${userId}/reset-password`,
        method: 'POST'
      }
    );

    const response: AdminApiResponse<{ 
      resetInfo: ResetPasswordResponse; 
      tempPassword: string; 
      userEmail: string;
    }> = {
      success: true,
      data: {
        resetInfo: resetResponse,
        tempPassword,
        userEmail: user.email
      },
      message: 'Password reset successfully'
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