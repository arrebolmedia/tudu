import Link from 'next/link'
import { TuduLogo } from '@/components/ui/tudu-logo'
import { CheckCircle } from 'lucide-react'

export default function VerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-arrebol-beige-100 to-arrebol-terracota-100 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="space-y-4">
          <TuduLogo className="justify-center" size="lg" />
          
          <div className="space-y-2">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Email verificado exitosamente!
            </h1>
            <p className="text-gray-600">
              Tu cuenta ha sido activada. Ya puedes iniciar sesión y comenzar a gestionar tus tareas.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="w-full bg-arrebol-terracota-500 hover:bg-arrebol-terracota-600 text-white font-medium py-3 px-4 rounded-lg inline-block transition-colors"
          >
            Iniciar Sesión
          </Link>
          
          <p className="text-sm text-gray-500">
            ¡Bienvenido a LA NORIA! Estamos emocionados de tenerte con nosotros.
          </p>
        </div>
      </div>
    </div>
  )
}
