'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/types'
import { SortableTaskItem } from './sortable-task-item'
import { cn } from '@/lib/utils'

interface DroppableListProps {
  listId: string
  title: string
  tasks: Task[]
  onToggleComplete: (taskId: string, completed: boolean) => void
  onUpdateStatus: (taskId: string, status: TaskStatus) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
  onArchive: (taskId: string) => void
  onRestore?: (taskId: string) => void
  animatingTasks: Set<string>
}

export function DroppableList({
  listId,
  title,
  tasks,
  onToggleComplete,
  onUpdateStatus,
  onUpdateTask,
  onDelete,
  onArchive,
  onRestore,
  animatingTasks
}: DroppableListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: listId,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-6 rounded-xl border-2 border-dashed transition-all duration-200 min-h-32",
        isOver 
          ? "border-arrebol-terracota-400 bg-arrebol-terracota-50 dark:bg-arrebol-terracota-950/20 shadow-lg" 
          : "border-arrebol-beige-300 dark:border-arrebol-beige-700 hover:border-arrebol-beige-400 dark:hover:border-arrebol-beige-600"
      )}
    >
      <h3 className="text-lg font-sans font-bold text-arrebol-terracota-700 dark:text-arrebol-beige-200 mb-4 px-2 uppercase tracking-wider">
        {title} {tasks.length > 0 && (
          <span className="ml-2 text-sm font-modern font-normal text-arrebol-beige-600 dark:text-arrebol-beige-400 lowercase tracking-normal">
            ({tasks.length})
          </span>
        )}
      </h3>
      
      <SortableContext 
        items={tasks.map(task => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-arrebol-beige-600 dark:text-arrebol-beige-400">
              <p className="font-elegant">No hay tareas en esta lista</p>
              <p className="text-sm mt-1 font-modern">Arrastra tareas aquí para organizarlas</p>
            </div>
          ) : (
            tasks.map((task) => {
              const isAnimating = animatingTasks.has(task.id)
              return (
                <div
                  key={task.id}
                  className={cn(
                    "transition-all duration-300",
                    isAnimating && "animate-pulse bg-arrebol-cream-100 dark:bg-arrebol-cream-900/20 rounded-xl"
                  )}
                >
                  <SortableTaskItem
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onUpdateStatus={onUpdateStatus}
                    onUpdateTask={onUpdateTask}
                    onDelete={onDelete}
                    onArchive={onArchive}
                    onRestore={onRestore}
                  />
                </div>
              )
            })
          )}
        </div>
      </SortableContext>
    </div>
  )
}
