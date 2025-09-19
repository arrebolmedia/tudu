/**
 * API Endpoint: /api/admin/policy/validate
 * Validación de políticas YAML
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validatePolicyYaml, createAdminAuditLog, handleAdminError } from '@/lib/admin/utils';
import { type ValidatePolicyRequest, type ValidatePolicyResponse, type AdminApiResponse } from '@/types/admin';

// POST /api/admin/policy/validate - Validar YAML de política
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

    const body: ValidatePolicyRequest = await request.json();

    if (!body.rawYaml) {
      return NextResponse.json(
        { success: false, message: 'rawYaml is required' },
        { status: 400 }
      );
    }

    // Validar YAML
    const validation = validatePolicyYaml(body.rawYaml);

    const validationResponse: ValidatePolicyResponse = {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      parsedRules: validation.parsedRules
    };

    await createAdminAuditLog(
      userSession.id,
      'validate',
      'PolicyVersion',
      undefined,
      {
        ip: (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: '/api/admin/policy/validate',
        method: 'POST'
      }
    );

    const response: AdminApiResponse<ValidatePolicyResponse> = {
      success: true,
      data: validationResponse,
      message: validation.isValid ? 'Policy is valid' : 'Policy has validation errors'
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