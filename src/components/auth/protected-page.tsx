'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedPageProps {
  children: React.ReactNode
}

export default function ProtectedPage({ children }: ProtectedPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Rutas públicas que NO requieren autenticación
  const publicPaths = [
    '/auth/signin',
    '/auth/signup', 
    '/auth/forgot-password',
    '/auth/verify-email'
  ]

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // 🚧 MODO DESARROLLO: Permitir acceso sin autenticación
  const isDevelopment = process.env.NODE_ENV === 'development'

  console.log('🔐 ProtectedPage - Status:', status, 'Session:', !!session, 'Path:', pathname, 'IsPublic:', isPublicPath, 'Dev Mode:', isDevelopment)

  useEffect(() => {
    console.log('🚀 ProtectedPage useEffect - Status:', status, 'IsPublic:', isPublicPath, 'Dev Mode:', isDevelopment)
    
    // Si está cargando, esperar
    if (status === 'loading') {
      console.log('⏳ ProtectedPage: Loading...')
      return
    }

    // Si no hay sesión y NO estamos en una ruta pública, redirigir a signin
    // 🚧 DESARROLLO: Saltear autenticación en modo desarrollo
    if (status === 'unauthenticated' && !isPublicPath && !isDevelopment) {
      console.log('🔴 ProtectedPage: No session on private route, redirecting to signin')
      router.push('/auth/signin')
      return
    }

    // Si hay sesión y estamos en una ruta pública, redirigir al dashboard
    if (status === 'authenticated' && isPublicPath) {
      console.log('🟢 ProtectedPage: Session found on public route, redirecting to dashboard')
      router.push('/')
      return
    }

    console.log('✅ ProtectedPage: Route access authorized')
  }, [status, router, isPublicPath, pathname, isDevelopment])

  // Mostrar loading mientras se verifica la sesión (solo si NO estamos en desarrollo)
  if (status === 'loading' && !isDevelopment) {
    console.log('⏳ ProtectedPage: Showing loading spinner')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-lg">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no hay sesión y NO estamos en una ruta pública, mostrar mensaje de redirección (solo si NO estamos en desarrollo)
  if (status === 'unauthenticated' && !isPublicPath && !isDevelopment) {
    console.log('🔴 ProtectedPage: Unauthenticated on private route, showing redirect message...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-red-600 text-lg font-semibold">⛔ Acceso no autorizado</p>
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  console.log('✅ ProtectedPage: Rendering content for path:', pathname)
  // En todos los demás casos, renderizar el contenido
  return <>{children}</>
}
