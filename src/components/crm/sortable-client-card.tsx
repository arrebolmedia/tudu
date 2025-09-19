'use client'

import { Client } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, Expand } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableClientCardProps {
  client: Client
  onEditClient: (client: Client) => void
  isDragging?: boolean
}

export function SortableClientCard({ 
  client, 
  onEditClient, 
  isDragging = false 
}: SortableClientCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({
    id: client.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Funciones locales simples para evitar problemas de importación
  const getAreaLabel = (area: string) => {
    switch (area) {
      case 'CASANUEVA': return 'Casanueva'
      case 'CASA_MUNECAS': return 'Casa de Muñecas'
      case 'ATRIO': return 'Atrio'
      case 'CABANAS': return 'Cabañas'
      default: return 'Sin asignar'
    }
  }

  const getExecutiveLabel = (executive: string) => {
    switch (executive) {
      case 'YARLENY_COLIN': return 'Yarleny Colín'
      case 'JOSEFO_FLORES': return 'Josefo Flores'
      case 'SEBASTIAN_RAMIREZ': return 'Sebastián Ramírez'
      default: return 'Sin asignar'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-3 cursor-pointer transition-all duration-200",
        "hover:border-arrebol-terracota/30 hover:shadow-md",
        "group relative",
        (isDragging || isSortableDragging) && "opacity-50 z-50 shadow-lg"
      )}
    >
      {/* Header con nombre y botón expandir */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate pr-2">
          {client.name}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEditClient(client)
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-400 hover:text-arrebol-terracota flex-shrink-0"
          title="Ver detalles completos"
        >
          <Expand size={12} />
        </button>
      </div>

      {/* Fecha del evento */}
      {client.eventDate && (
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
          <Calendar size={12} className="flex-shrink-0" />
          <span>{client.eventDate.toLocaleDateString('es-ES')}</span>
        </div>
      )}

      {/* Área y Ejecutivo */}
      <div className="space-y-2">
        {client.area && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Área:</span> {getAreaLabel(client.area)}
          </div>
        )}
        {client.assignedExecutive && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            <span className="font-medium">Ejecutivo:</span> {getExecutiveLabel(client.assignedExecutive)}
          </div>
        )}
      </div>
    </div>
  )
}
