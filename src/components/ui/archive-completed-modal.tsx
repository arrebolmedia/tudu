'use client'

import { useState } from 'react'
import { Archive, Calendar, Trash2, CheckCircle, X } from 'lucide-react'
import { Task } from '@/types'
import { cn } from '@/lib/utils'

interface ArchiveCompletedModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (option: ArchiveOption) => void
  completedTasks: Task[]
  isArchivedView?: boolean
}

export type ArchiveOption = 'auto' | 'manual' | 'delete'

export function ArchiveCompletedModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  completedTasks,
  isArchivedView = false 
}: ArchiveCompletedModalProps) {
  const [selectedOption, setSelectedOption] = useState<ArchiveOption>('auto')

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(selectedOption)
    onClose()
  }

  const archiveOptions = [
    {
      id: 'auto' as ArchiveOption,
      icon: Archive,
      title: 'Archivar automáticamente',
      description: 'Las tareas completadas se archivan automáticamente después de 7 días',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'manual' as ArchiveOption,
      icon: CheckCircle,
      title: 'Archivar manualmente',
      description: 'Mantener las tareas completadas visibles hasta que las archives manualmente',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'delete' as ArchiveOption,
      icon: Trash2,
      title: 'Eliminar permanentemente',
      description: 'Marcar para eliminación en 3 días. Las tareas se eliminarán automáticamente después de este período',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Archive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isArchivedView ? 'Gestionar tareas archivadas' : 'Gestionar tareas completadas'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-4">
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Tienes {completedTasks.length} tarea{completedTasks.length !== 1 ? 's' : ''} {isArchivedView ? 'archivada' : 'completada'}{completedTasks.length !== 1 ? 's' : ''}. 
            ¿Cómo te gustaría manejarlas?
          </p>

          <div className="space-y-3">
            {archiveOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all duration-200 text-left",
                    selectedOption === option.id 
                      ? `${option.borderColor} ${option.bgColor}` 
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center mt-0.5",
                      selectedOption === option.id ? option.bgColor : "bg-gray-100 dark:bg-gray-800"
                    )}>
                      <Icon className={cn(
                        "w-4 h-4",
                        selectedOption === option.id ? option.color : "text-gray-500"
                      )} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
