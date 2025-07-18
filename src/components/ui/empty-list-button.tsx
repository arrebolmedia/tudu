'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyListButtonProps {
  onClick: () => void
  listTitle?: string
  className?: string
}

export function EmptyListButton({ onClick, listTitle, className }: EmptyListButtonProps) {
  const isArchivedList = listTitle === 'Archivadas'
  
  return (
    <div className={cn("text-center py-20", className)}>
      <div className="text-6xl mb-6">{isArchivedList ? '📦' : '✨'}</div>
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        {isArchivedList ? 'No hay tareas archivadas' : `No hay tareas${listTitle ? ` en ${listTitle}` : ''}`}
      </h3>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        {isArchivedList
          ? 'Las tareas archivadas aparecerán aquí. Puedes archivar tareas usando el botón de archivo en cada tarea.'
          : listTitle 
            ? `Agrega la primera tarea a ${listTitle} para empezar a organizarte`
            : 'Crea tu primera tarea para empezar a organizarte'
        }
      </p>
      
      {!isArchivedList && (
        <button
          onClick={onClick}
          className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
        >
          <div className="relative z-10 flex items-center gap-3">
            <Plus className="w-5 h-5" />
            <span>Nueva tarea</span>
          </div>
          
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
      )}
    </div>
  )
}
