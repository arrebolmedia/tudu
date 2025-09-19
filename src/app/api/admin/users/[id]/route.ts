/**
 * API Endpoint: /api/admin/users/[id]
 * Operaciones específicas de usuario para SuperAdmin
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireSuperAdmin, preventSuperAdminLockout, createAdminAuditLog, handleAdminError } from '@/lib/admin/utils';
import { type AdminUser, type PatchUserDto, type ResetPasswordResponse, type AdminApiResponse } from '@/types/admin';

const prisma = new PrismaClient();

// GET /api/admin/users/[id] - Obtener usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    requireSuperAdmin({
      userId: session.user.id,
      role: session.user.role,
      venueId: session.user.venueId || '',
      teamId: session.user.teamId || ''
    });

    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        venueId: true,
        teamId: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const adminUser: AdminUser = {
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    await createAdminAuditLog(
      session.user.id,
      'read',
      'User',
      userId,
      {
        ip: request.ip,
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: `/api/admin/users/${userId}`,
        method: 'GET'
      }
    );

    const response: AdminApiResponse<AdminUser> = {
      success: true,
      data: adminUser
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

// PATCH /api/admin/users/[id] - Actualizar usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    requireSuperAdmin({
      userId: session.user.id,
      role: session.user.role,
      venueId: session.user.venueId || '',
      teamId: session.user.teamId || ''
    });

    const userId = params.id;
    const body: PatchUserDto = await request.json();

    // Obtener usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Protección anti-lockout
    await preventSuperAdminLockout(
      userId, 
      body.role, 
      body.isActive
    );

    // Validar role si se proporciona
    if (body.role) {
      const validRoles = ['SuperAdmin', 'Propietario', 'Gestor', 'Vendedor', 'GerenteBanquetes', 'Planner'];
      if (!validRoles.includes(body.role)) {
        return NextResponse.json(
          { success: false, message: 'Invalid role' },
          { status: 400 }
        );
      }
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.role && { role: body.role }),
        ...(body.isActive !== undefined && { isActive: body.isActive })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const adminUser: AdminUser = {
      id: updatedUser.id,
      name: updatedUser.name || '',
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      lastLoginAt: updatedUser.lastLoginAt?.toISOString(),
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString()
    };

    await createAdminAuditLog(
      session.user.id,
      'update',
      'User',
      userId,
      {
        diffBefore: currentUser,
        diffAfter: body,
        ip: request.ip,
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: `/api/admin/users/${userId}`,
        method: 'PATCH'
      }
    );

    const response: AdminApiResponse<AdminUser> = {
      success: true,
      data: adminUser,
      message: 'User updated successfully'
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

// DELETE /api/admin/users/[id] - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    requireSuperAdmin({
      userId: session.user.id,
      role: session.user.role,
      venueId: session.user.venueId || '',
      teamId: session.user.teamId || ''
    });

    const userId = params.id;

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Protección anti-lockout
    await preventSuperAdminLockout(userId, 'deleted', false);

    // Verificar si el usuario no está siendo eliminado por sí mismo
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete yourself' },
        { status: 400 }
      );
    }

    // Soft delete: marcar como inactivo en lugar de eliminar
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}` // Evitar conflictos de email
      }
    });

    await createAdminAuditLog(
      session.user.id,
      'delete',
      'User',
      userId,
      {
        diffBefore: user,
        ip: request.ip,
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: `/api/admin/users/${userId}`,
        method: 'DELETE'
      }
    );

    const response: AdminApiResponse = {
      success: true,
      message: 'User deleted successfully'
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