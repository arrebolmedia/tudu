'use client'

import { Heart, User, LogOut, Settings } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrebolWeddingsLogo } from '@/components/ui/arrebol-weddings-logo'

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
    <header className="sticky top-0 z-50 w-full border-b border-arrebol-beige-200 bg-arrebol-beige-50/90 backdrop-blur-xl">
      <div className="w-full py-4 px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <ArrebolWeddingsLogo size="md" showText={true} />
          </div>

            <div className="flex items-center space-x-4">
              {session ? (
                <div className="relative group">
                  <button className="flex items-center space-x-3 bg-arrebol-terracota-500 hover:bg-arrebol-terracota-600 text-white px-4 py-2 rounded-full transition-colors duration-200 shadow-lg font-display">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {session.user?.name?.charAt(0).toUpperCase() || session.user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium">{session.user?.name || session.user?.email}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2 shadow-xl backdrop-blur-xl">
                      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{session.user?.name || 'Usuario'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                      </div>
                      
                      <div className="py-1">
                        <button
                          onClick={handleProfileClick}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-arrebol-beige-100 dark:hover:bg-gray-800 transition-colors duration-200 text-sm"
                        >
                          <User className="w-4 h-4 text-arrebol-terracota-500" />
                          <span>Mi Perfil</span>
                        </button>
                        
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-arrebol-beige-100 dark:hover:bg-gray-800 transition-colors duration-200 text-sm">
                          <Settings className="w-4 h-4 text-arrebol-terracota-500" />
                          <span>Configuración</span>
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-100 dark:border-gray-800 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors duration-200 text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-arrebol-terracota-500"></div>
                  <span className="text-sm text-arrebol-beige-600">Cargando...</span>
                </div>
              )}
            </div>
          </div>
        </div>
    </header>
  )
}
