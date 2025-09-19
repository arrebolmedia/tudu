/**
 * Simple Admin Users API Route
 * GET /api/admin/users - List users (simplified)
 * POST /api/admin/users - Create user (simplified)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// GET /api/admin/users - Simplified version
export async function GET(request: NextRequest) {
  try {
    // For now, skip session check to test the API
    // const session = await getServerSession();
    
    // if (!session?.user) {
    //   return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    // }

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
    // For now, skip session check to test the API
    // const session = await getServerSession();
    
    // if (!session?.user) {
    //   return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    // }

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