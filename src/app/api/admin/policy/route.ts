/**
 * API Endpoint: /api/admin/policy
 * Gestión de políticas YAML para SuperAdmin
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateReauth, createAdminAuditLog, handleAdminError, validatePolicyYaml, generateDefaultPolicyYaml } from '@/lib/admin/utils';
import { 
  type PolicyVersion, 
  type ValidatePolicyRequest, 
  type ValidatePolicyResponse,
  type CreatePolicyVersionDto,
  type ActivatePolicyVersionDto,
  type AdminApiResponse 
} from '@/types/admin';

const prisma = new PrismaClient();

// GET /api/admin/policy - Obtener versiones de política
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userSession = session.user as any;
    if (userSession.role !== 'SuperAdmin') {
      return NextResponse.json({ success: false, message: 'Forbidden: SuperAdmin role required' }, { status: 403 });
    }

    // Obtener versiones de política de la base de datos
    // Por ahora simulamos con datos mock hasta que se implemente la tabla PolicyVersion
    const mockPolicyVersions: PolicyVersion[] = [
      {
        id: 'v1.0.0',
        label: 'Default Policy v1.0.0',
        isActive: true,
        rawYaml: generateDefaultPolicyYaml(),
        createdBy: {
          id: userSession.id,
          name: userSession.name || 'System',
          email: userSession.email || 'system@system.com'
        },
        createdAt: new Date().toISOString(),
        description: 'Default authorization policy for wedding CRM'
      }
    ];

    await createAdminAuditLog(
      userSession.id,
      'list',
      'PolicyVersion',
      undefined,
      {
        ip: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: '/api/admin/policy',
        method: 'GET'
      }
    );

    const response: AdminApiResponse<PolicyVersion[]> = {
      success: true,
      data: mockPolicyVersions
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

// POST /api/admin/policy - Crear nueva versión de política
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

    const body: CreatePolicyVersionDto = await request.json();

    // Validaciones
    if (!body.label || !body.rawYaml) {
      return NextResponse.json(
        { success: false, message: 'Label and rawYaml are required' },
        { status: 400 }
      );
    }

    // Validar YAML
    const validation = validatePolicyYaml(body.rawYaml);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid policy YAML',
          errors: validation.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    // Crear nueva versión (simulado)
    const newVersion: PolicyVersion = {
      id: `v${Date.now()}`,
      label: body.label,
      isActive: false,
      rawYaml: body.rawYaml,
      createdBy: {
        id: userSession.id,
        name: userSession.name || 'Unknown',
        email: userSession.email || 'unknown@unknown.com'
      },
      createdAt: new Date().toISOString(),
      description: body.description
    };

    await createAdminAuditLog(
      userSession.id,
      'create',
      'PolicyVersion',
      newVersion.id,
      {
        diffAfter: { label: body.label, description: body.description },
        ip: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: '/api/admin/policy',
        method: 'POST'
      }
    );

    const response: AdminApiResponse<PolicyVersion> = {
      success: true,
      data: newVersion,
      message: 'Policy version created successfully'
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