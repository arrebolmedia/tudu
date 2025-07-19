import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificación requerido' },
        { status: 400 }
      )
    }

    // Buscar el token de verificación
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token de verificación inválido' },
        { status: 400 }
      )
    }

    // Verificar si el token ha expirado
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token }
      })
      return NextResponse.json(
        { error: 'Token de verificación expirado' },
        { status: 400 }
      )
    }

    // Verificar el usuario
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() }
    })

    // Eliminar el token usado
    await prisma.verificationToken.delete({
      where: { token }
    })

    // Redireccionar a la página de éxito
    return NextResponse.redirect(new URL('/auth/verified', request.url))

  } catch (error) {
    console.error('Error al verificar email:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
