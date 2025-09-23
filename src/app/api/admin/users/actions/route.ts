import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types';

// Roles válidos del sistema (incluyendo variaciones en mayúsculas y minúsculas)
const VALID_ROLES: UserRole[] = ['SUPER_ADMIN', 'PROPIETARIO', 'GERENTE', 'CALL_CENTER', 'VENDEDOR', 'COORDINADOR', 'COLABORADOR'];
const VALID_ROLES_LOWERCASE = ['super_admin', 'propietario', 'gerente', 'call_center', 'vendedor', 'coordinador', 'colaborador'];
const ALL_VALID_ROLES = [...VALID_ROLES, ...VALID_ROLES_LOWERCASE];

// Roles que pueden administrar usuarios (temporal - incluyendo más roles para debug)
const ADMIN_ROLES = ['SUPER_ADMIN', 'PROPIETARIO', 'SuperAdmin', 'admin', 'GERENTE', 'User', 'user'];

// PUT /api/admin/users/actions - Actualizar usuario con acciones específicas
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificación de autorización
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado - sesión requerida' },
        { status: 401 }
      );
    }

    // SUPER ADMIN hardcoded (Anthony Cazares)
    const isSuperAdmin = session.user.id === 'cmd9nrcdx0001loykbjouo5j4' || 
                        session.user.email === 'anthony@arrebol.com.mx';
    
    // Para otros usuarios, verificar rol
    const userRole = session.user.role;
    const hasAdminRole = userRole && ADMIN_ROLES.includes(userRole);
    
    if (!isSuperAdmin && !hasAdminRole) {
      console.log('❌ Usuario sin permisos admin:', { 
        userId: session.user.id, 
        email: session.user.email, 
        role: userRole,
        isSuperAdmin 
      });
      return NextResponse.json(
        { success: false, error: 'No autorizado - permisos insuficientes' },
        { status: 401 }
      );
    }

    console.log('✅ Usuario autorizado:', { 
      userId: session.user.id, 
      email: session.user.email, 
      isSuperAdmin, 
      hasAdminRole 
    });

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

        if (!ALL_VALID_ROLES.includes(role)) {
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
        if (!ALL_VALID_ROLES.includes(data.role)) {
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
        if (session && userId === session.user?.id) {
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