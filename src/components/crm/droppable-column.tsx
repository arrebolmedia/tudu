'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Client, ClientStatus } from '@/types'
import { SortableClientCard } from './sortable-client-card'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DroppableColumnProps {
  column: {
    id: string
    title: string
    color: string
    headerColor: string
    textColor: string
  }
  clients: Client[]
  onEditClient: (client: Client) => void
  isOver?: boolean
}

export function DroppableColumn({ 
  column, 
  clients, 
  onEditClient, 
  isOver = false 
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-80 rounded-lg border-2 transition-colors",
        isOver ? "border-arrebol-terracota border-solid bg-arrebol-terracota/5" : `border-dashed ${column.color}`
      )}
    >
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between p-4 rounded-t-lg",
        column.headerColor
      )}>
        <div className="flex items-center gap-2">
          <h2 className={cn("font-semibold text-sm", column.textColor)}>
            {column.title}
          </h2>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            column.textColor,
            "bg-white/50"
          )}>
            {clients.length}
          </span>
        </div>
        <button className={cn(
          "p-1 rounded hover:bg-white/50 transition-colors",
          column.textColor
        )}>
          <Plus size={16} />
        </button>
      </div>

      {/* Column Content */}
      <div className="p-4 min-h-96 max-h-96 overflow-y-auto custom-scrollbar">
        <SortableContext 
          items={clients.map(client => client.id)} 
          strategy={verticalListSortingStrategy}
        >
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-600 text-sm">
                No hay clientes en esta etapa
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map(client => (
                <SortableClientCard
                  key={client.id}
                  client={client}
                  onEditClient={onEditClient}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
