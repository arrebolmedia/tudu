import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import { sendPasswordResetEmail, generatePasswordResetEmailHTML } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Por seguridad, respondemos como si el usuario existiera
      return NextResponse.json({
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
      })
    }

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hora

    // Eliminar tokens anteriores del usuario
    await prisma.verificationToken.deleteMany({
      where: { 
        identifier: email,
        token: { startsWith: 'reset_' }
      }
    })

    // Crear nuevo token de reset
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: `reset_${resetToken}`,
        expires
      }
    })

    // Generar URL de reset (temporalmente no se usa)
    // const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    // TEMPORALMENTE DESHABILITADO: Envío de email hasta configurar SMTP
    // await sendPasswordResetEmail(email, user.name || 'Usuario', resetToken)

    return NextResponse.json({
      message: 'Función de restablecimiento de contraseña temporalmente deshabilitada. Contacta al administrador.'
    }, { status: 200 })

  } catch (error) {
    console.error('Error al solicitar reset de contraseña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
