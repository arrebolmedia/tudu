/**
 * Simple Admin Users API Route
 * GET /api/admin/users - List users (simplified)
 * POST /api/admin/users - Create user (simplified)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/users - Simplified version
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    // Return mock data for now
    const mockUsers = [
      {
        id: '1',
        email: 'admin@arrebol.com.mx',
        name: 'Administrador',
        role: 'admin',
        status: 'active',
        createdAt: new Date('2025-01-01').toISOString(),
        lastLogin: new Date('2025-09-19').toISOString(),
        emailVerified: true
      },
      {
        id: '2', 
        email: 'demo@arrebol.com.mx',
        name: 'Usuario Demo',
        role: 'user',
        status: 'active',
        createdAt: new Date('2025-01-15').toISOString(),
        lastLogin: new Date('2025-09-18').toISOString(),
        emailVerified: true
      },
      {
        id: '3',
        email: 'guest@arrebol.com.mx', 
        name: 'Invitado',
        role: 'guest',
        status: 'inactive',
        createdAt: new Date('2025-02-01').toISOString(),
        lastLogin: null,
        emailVerified: false
      },
      {
        id: '4',
        email: 'coordinator@arrebol.com.mx', 
        name: 'Coordinador de Eventos',
        role: 'user',
        status: 'active',
        createdAt: new Date('2025-03-10').toISOString(),
        lastLogin: new Date('2025-09-17').toISOString(),
        emailVerified: true
      },
      {
        id: '5',
        email: 'designer@arrebol.com.mx', 
        name: 'Diseñador Floral',
        role: 'user',
        status: 'active',
        createdAt: new Date('2025-04-20').toISOString(),
        lastLogin: new Date('2025-09-16').toISOString(),
        emailVerified: true
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockUsers,
      total: mockUsers.length,
      message: 'Usuarios obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Simplified version
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, role = 'user' } = body;

    // Validation
    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Email y nombre son requeridos' },
        { status: 400 }
      );
    }

    // Return mock response for creation
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      emailVerified: false
    };

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'Usuario creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Obtener usuarios y total
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { name: 'asc' },
        skip: offset,
        take: pageSize
      }),
      prisma.user.count({ where })
    ]);

    const adminUsers: AdminUser[] = users.map(user => ({
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }));

    const pagination = createPaginationMeta(page, pageSize, total);

    await createAdminAuditLog(
      session.user.id,
      'list',
      'User',
      undefined,
      {
        ip: request.ip,
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: '/api/admin/users',
        method: 'GET'
      }
    );

    const response: AdminApiResponse<{ users: AdminUser[]; pagination: typeof pagination }> = {
      success: true,
      data: {
        users: adminUsers,
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

// POST /api/admin/users - Crear usuario
export async function POST(request: NextRequest) {
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

    const body: CreateUserDto = await request.json();

    // Validaciones
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    const validRoles = ['SuperAdmin', 'Propietario', 'Gestor', 'Vendedor', 'GerenteBanquetes', 'Planner'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    // Verificar email único
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      );
    }

    // Generar contraseña temporal
    const tempPassword = body.tempPassword || Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        password: hashedPassword,
        isActive: true,
        venueId: session.user.venueId // Heredar venue del admin
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
      'create',
      'User',
      user.id,
      {
        diffAfter: { name: body.name, email: body.email, role: body.role },
        ip: request.ip,
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: '/api/admin/users',
        method: 'POST'
      }
    );

    const response: AdminApiResponse<{ user: AdminUser; tempPassword: string }> = {
      success: true,
      data: {
        user: adminUser,
        tempPassword
      },
      message: 'User created successfully'
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