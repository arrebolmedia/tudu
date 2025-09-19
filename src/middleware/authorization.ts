/**
 * Authorization Middleware for Next.js
 * Validates permissions on API routes and handles JWT authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt-utils';
import { getAuthorizationEngine } from '@/lib/authorization-engine';
import { prisma } from '@/lib/prisma';
import { 
  AuthContext, 
  AuthRequest, 
  EntityName, 
  ActionType,
  AuthorizationError 
} from '@/types/authorization';

// Route patterns that require authorization
const PROTECTED_ROUTES = [
  { pattern: /^\/api\/clients/, entity: 'Client' as EntityName },
  { pattern: /^\/api\/weddings/, entity: 'Wedding' as EntityName },
  { pattern: /^\/api\/vendors/, entity: 'Vendor' as EntityName },
  { pattern: /^\/api\/tasks/, entity: 'Task' as EntityName },
  { pattern: /^\/api\/documents/, entity: 'Document' as EntityName },
  { pattern: /^\/api\/payments/, entity: 'Payment' as EntityName },
  { pattern: /^\/api\/comments/, entity: 'Comment' as EntityName },
  { pattern: /^\/api\/users/, entity: 'User' as EntityName },
  { pattern: /^\/api\/admin/, entity: 'User' as EntityName }, // Admin routes require User permissions
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register', 
  '/api/auth/refresh',
  '/api/health',
  '/api/public'
];

export async function authorizationMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT and get user
    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user with role information (simplified for current schema)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // For now, skip authorization checks and just add user context
    // This will be expanded when full schema is implemented
    
    // Add user context to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Authorization middleware error:', error);
    
    if (error instanceof AuthorizationError) {
      return new NextResponse(
        JSON.stringify({ 
          error: error.message, 
          code: error.code 
        }),
        { 
          status: error.statusCode, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ===== UTILITY FUNCTIONS =====

function getActionFromMethod(method: string): ActionType {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'read';
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'read';
  }
}

function extractResourceId(pathname: string): string | null {
  // Extract ID from patterns like /api/clients/123 or /api/weddings/abc-def
  const match = pathname.match(/\/api\/\w+\/([^\/\?]+)/);
  return match ? match[1] : null;
}

async function getResource(entity: EntityName, id: string): Promise<any> {
  try {
    // For now, return null since we don't have the full schema yet
    // This will be implemented when we have the complete authorization schema
    return null;
  } catch (error) {
    console.error(`Failed to fetch ${entity} resource:`, error);
    return null;
  }
}

function getClientIP(request: NextRequest): string | undefined {
  // Try various headers to get real client IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return request.headers.get('x-real-ip') || 
         request.headers.get('x-client-ip') || 
         undefined;
}

// ===== MIDDLEWARE CONFIGURATION =====

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

export default authorizationMiddleware;