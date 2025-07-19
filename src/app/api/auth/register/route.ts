import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validaciones básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario (temporalmente verificado automáticamente)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(), // Temporalmente verificado automáticamente
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    })

    // TEMPORALMENTE COMENTADO: Verificación por email hasta configurar SMTP
    /*
    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 86400000) // 24 horas

    // Guardar token de verificación
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires
      }
    })

    // Generar URL de verificación
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`

    // Enviar email de verificación
    await sendVerificationEmail(email, name, verificationToken)
    */

    return NextResponse.json({
      message: 'Usuario creado exitosamente. Ya puedes iniciar sesión.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error al registrar usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
