'use client'

import { CheckSquare, Sparkles } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 dark:border-gray-700/50">
      <div className="flex w-full">
        {/* Contenedor del ancho del sidebar */}
        <div className="w-72 flex-shrink-0">
          {/* Espacio vacío que coincide con el sidebar */}
        </div>
        
        {/* Contenedor del ancho del área de tareas */}
        <div className="flex-1 py-4 px-8">
          <div className="flex justify-center items-center">
            {/* Logo centrado en el área de tareas */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                {/* Icono con efecto glassmorphism */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                {/* Pequeño efecto de brillo */}
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                </div>
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                  Tudú
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Tus pendientes en un solo lugar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
