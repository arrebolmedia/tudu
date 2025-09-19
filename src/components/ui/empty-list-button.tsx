'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyListButtonProps {
  onClick: () => void
  listTitle?: string
  className?: string
  buttonText?: string // Nueva prop para personalizar el texto del botón
}

export function EmptyListButton({ onClick, listTitle, className, buttonText }: EmptyListButtonProps) {
  const isArchivedList = listTitle === 'Archivadas'
  const displayButtonText = buttonText || 'Nueva tarea' // Usar texto personalizado o por defecto
  
  return (
    <div className={cn("text-center py-20", className)}>
      <div className="text-6xl mb-6">{isArchivedList ? '📦' : '✨'}</div>
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
        {isArchivedList ? 'No hay tareas archivadas' : listTitle === 'clientes' ? 'No hay clientes' : `No hay tareas${listTitle ? ` en ${listTitle}` : ''}`}
      </h3>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        {isArchivedList
          ? 'Las tareas archivadas aparecerán aquí. Puedes archivar tareas usando el botón de archivo en cada tarea.'
          : listTitle === 'clientes'
            ? 'Agrega el primer cliente para empezar a gestionar tu CRM'
            : listTitle 
              ? `Agrega la primera tarea a ${listTitle} para empezar a organizarte`
              : 'Crea tu primera tarea para empezar a organizarte'
        }
      </p>
      
      {!isArchivedList && (
        <button
          onClick={onClick}
          className="group relative overflow-hidden bg-arrebol-terracota-500 hover:bg-arrebol-terracota-600 text-white px-8 py-4 rounded-xl font-display font-semibold uppercase tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
        >
          <div className="relative z-10 flex items-center gap-3">
            <Plus className="w-5 h-5" />
            <span>{displayButtonText}</span>
          </div>
          
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
      )}
    </div>
  )
}
