/**
 * JWT Authentication Utilities
 * Handle JWT token creation, verification and user session management
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m'; // 15 minutes
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d'; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  teamId?: string;
  venueId?: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// ===== TOKEN VERIFICATION =====

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'arrebol-weddings-crm',
      audience: 'arrebol-weddings-app'
    }) as JWTPayload;

    // For now, return decoded payload
    // In full implementation, would verify session exists
    return decoded;

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('JWT verification failed:', error.message);
    } else {
      console.error('Token verification error:', error);
    }
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Simple implementation for now - will be expanded with full JWT system
export async function generateSimpleToken(user: any): Promise<string> {
  const payload: Partial<JWTPayload> = {
    userId: user.id,
    email: user.email,
    role: user.role?.name || 'user'
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRY,
    issuer: 'arrebol-weddings-crm',
    audience: 'arrebol-weddings-app'
  });
}