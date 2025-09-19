import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/admin/users/actions - Actualizar usuario con acciones específicas
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, action, data } = body;

    console.log('✅ PUT - Ejecutando acción:', { userId, action, data });

    let message = '';
    let result = {};

    switch (action) {
      case 'updateUser':
        const { name, email, role, status, emailVerified } = data;
        
        // Validaciones básicas
        if (!name || !email) {
          return NextResponse.json(
            { success: false, error: 'Nombre y email son requeridos' },
            { status: 400 }
          );
        }

        if (!['admin', 'user', 'guest'].includes(role)) {
          return NextResponse.json(
            { success: false, error: 'Rol inválido' },
            { status: 400 }
          );
        }

        result = {
          id: userId,
          name,
          email,
          role,
          status,
          emailVerified,
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        message = 'Usuario actualizado correctamente';
        break;

      case 'changeRole':
        if (!['admin', 'user', 'guest'].includes(data.role)) {
          return NextResponse.json(
            { success: false, error: 'Rol inválido' },
            { status: 400 }
          );
        }
        message = `Rol cambiado a ${data.role}`;
        result = { userId, newRole: data.role };
        break;
      
      case 'toggleStatus':
        if (!['active', 'inactive'].includes(data.status)) {
          return NextResponse.json(
            { success: false, error: 'Estado inválido' },
            { status: 400 }
          );
        }
        message = `Usuario ${data.status === 'active' ? 'activado' : 'desactivado'}`;
        result = { userId, newStatus: data.status };
        break;
      
      case 'resetPassword':
        message = 'Email de reseteo de contraseña enviado';
        result = { userId, emailSent: true };
        break;

      case 'deleteUser':
        // Prevenir auto-eliminación
        if (userId === session.user.id) {
          return NextResponse.json(
            { success: false, error: 'No puedes eliminarte a ti mismo' },
            { status: 400 }
          );
        }
        message = 'Usuario eliminado correctamente';
        result = { userId, deleted: true };
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message,
      action,
      result
    });

  } catch (error) {
    console.error('Error en acción de usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}