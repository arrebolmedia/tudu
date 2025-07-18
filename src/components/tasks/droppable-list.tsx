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
        "p-4 rounded-xl border-2 border-dashed transition-all duration-200 min-h-32",
        isOver 
          ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20 shadow-lg" 
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      )}
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 px-2">
        {title} {tasks.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
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
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No hay tareas en esta lista</p>
              <p className="text-sm mt-1">Arrastra tareas aquí para organizarlas</p>
            </div>
          ) : (
            tasks.map((task) => {
              const isAnimating = animatingTasks.has(task.id)
              return (
                <div
                  key={task.id}
                  className={cn(
                    "transition-all duration-300",
                    isAnimating && "animate-pulse bg-yellow-100 dark:bg-yellow-900/20 rounded-xl"
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
