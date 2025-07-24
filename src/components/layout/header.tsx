'use client'

import { CheckSquare, Sparkles, User, LogOut, Settings } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  console.log('Header render - Status:', status, 'Session:', !!session)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl">
      <div className="flex w-full">
        <div className="w-72 flex-shrink-0"></div>
        <div className="flex-1 py-4 px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Tudú
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  Tus pendientes en un solo lugar
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {session ? (
                <div className="relative group">
                  <button className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {session.user?.name?.charAt(0).toUpperCase() || session.user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium">{session.user?.name || session.user?.email}</span>
                  </button>
                  
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-2xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-semibold text-gray-900">Mi cuenta</p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                      </div>
                      <button 
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center"
                      >
                        <User className="mr-3 h-4 w-4 text-blue-500" />
                        Perfil
                      </button>
                      <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center">
                        <Settings className="mr-3 h-4 w-4 text-blue-500" />
                        Configuración
                      </button>
                      <div className="border-t my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-500 bg-red-50 px-3 py-1 rounded">
                  No hay sesión activa
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
