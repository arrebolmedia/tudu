'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { TaskItem } from './task-item'
import { Task, TaskStatus } from '@/types'

interface SortableTaskItemProps {
  task: Task
  onToggleComplete: (taskId: string, completed: boolean) => void
  onUpdateStatus: (taskId: string, status: TaskStatus) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
  onArchive: (taskId: string) => void
  onRestore?: (taskId: string) => void
}

export function SortableTaskItem(props: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none relative flex items-center gap-3 ${isDragging ? 'dragging-item' : ''}`}
    >
      {/* Drag handle - siempre visible, centrado verticalmente */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing"
        title="Arrastra para reordenar"
      >
        <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200" />
      </div>
      
      {/* Task item sin modificaciones */}
      <div className="flex-1">
        <TaskItem {...props} />
      </div>
    </div>
  )
}
