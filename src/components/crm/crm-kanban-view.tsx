'use client'

import { Client, ClientStatus } from '@/types'
import { useState } from 'react'
import { Users, Plus, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import {
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const KANBAN_COLUMNS = [
  {
    id: 'NUEVO_CONTACTO',
    title: 'Nuevo Contacto',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-100',
    textColor: 'text-blue-700'
  },
  {
    id: 'ASIGNADO',
    title: 'Asignado',
    color: 'bg-purple-50 border-purple-200',
    headerColor: 'bg-purple-100',
    textColor: 'text-purple-700'
  },
  {
    id: 'CLIENTE_CONTACTADO',
    title: 'Contactado',
    color: 'bg-yellow-50 border-yellow-200',
    headerColor: 'bg-yellow-100',
    textColor: 'text-yellow-700'
  },
  {
    id: 'CERRADO_VENTA',
    title: 'Cerrado - Venta',
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-100',
    textColor: 'text-green-700'
  },
  {
    id: 'CERRADO_SIN_EXITO',
    title: 'Cerrado - Sin Éxito',
    color: 'bg-red-50 border-red-200',
    headerColor: 'bg-red-100',
    textColor: 'text-red-700'
  }
] as const

interface CrmKanbanViewProps {
  clients: Client[]
  onUpdateClient: (clientId: string, updates: Partial<Client>) => void
  onEditClient: (client: Client) => void
  // Props para manejar el borrador del placeholder
  isEditingPlaceholder?: boolean
  onPlaceholderKeyDown?: (e: React.KeyboardEvent) => void
  onPlaceholderBlur?: () => void
}

// Componente para renderizar las tarjetas de cliente
import { SortableClientCard } from './sortable-client-card'
import { DroppableColumn } from './droppable-column'

export default function CrmKanbanView({ 
  clients, 
  onUpdateClient, 
  onEditClient,
  isEditingPlaceholder,
  onPlaceholderKeyDown,
  onPlaceholderBlur
}: CrmKanbanViewProps) {
  const [activeClient, setActiveClient] = useState<Client | null>(null)

  // Configurar sensores para DnD Kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Agrupar clientes por estado
  const groupedClients = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = clients.filter(client => client.status === column.id)
    return acc
  }, {} as Record<string, Client[]>)

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const client = clients.find(c => c.id === active.id)
    setActiveClient(client || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) {
      setActiveClient(null)
      return
    }

    const clientId = active.id as string
    const newStatus = over.id as ClientStatus

    // Buscar el cliente activo
    const client = clients.find(c => c.id === clientId)
    
    if (client && client.status !== newStatus) {
      // Actualizar el status del cliente
      onUpdateClient(clientId, { status: newStatus })
    }

    setActiveClient(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="flex gap-6 p-6 min-w-max">
          {KANBAN_COLUMNS.map((column) => {
            const columnClients = groupedClients[column.id] || []
            
            return (
              <DroppableColumn
                key={column.id}
                column={column}
                clients={columnClients}
                onEditClient={onEditClient}
              />
            )
          })}
        </div>
      </div>

      {/* DragOverlay para mostrar el elemento siendo arrastrado */}
      <DragOverlay>
        {activeClient ? (
          <SortableClientCard
            client={activeClient}
            onEditClient={onEditClient}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}