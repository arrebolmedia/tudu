'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { User, LogOut } from 'lucide-react'

export function LoginButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <Button variant="outline" disabled>
        Cargando...
      </Button>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <img
            src={session.user.image || '/default-avatar.png'}
            alt={session.user.name || 'Usuario'}
            className="w-8 h-8 rounded-full"
          />
          <span className="hidden sm:block">
            {session.user.name || session.user.email}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Salir</span>
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={() => signIn('google')}
      className="flex items-center gap-2"
    >
      <User className="w-4 h-4" />
      Iniciar Sesión con Google
    </Button>
  )
}
