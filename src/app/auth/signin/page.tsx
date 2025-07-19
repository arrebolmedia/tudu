import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { LoginButton } from '@/components/auth/login-button'

export default async function SignInPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Gestor de Tareas 📝
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión para gestionar tus tareas
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <LoginButton />
          </div>
          
          <div className="text-center text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
          </div>
        </div>
      </div>
    </div>
  )
}
