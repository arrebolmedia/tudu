import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, generatePasswordResetEmailHTML } from '@/lib/email'
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

    // Generar URL de reset
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    // Enviar email
    const emailResult = await sendEmail({
      to: email,
      subject: 'Restablece tu contraseña - Tasks by Arrebol Weddings',
      html: generatePasswordResetEmailHTML(user.name || 'Usuario', resetUrl)
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Error al enviar el email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
    })

  } catch (error) {
    console.error('Error al solicitar reset de contraseña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
