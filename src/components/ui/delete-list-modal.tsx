'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { List } from '@/types'

interface DeleteListModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (moveTasksToListId?: string) => void
  list: List | null
  otherLists: List[]
  taskCount: number
}

export function DeleteListModal({
  isOpen,
  onClose,
  onConfirm,
  list,
  otherLists,
  taskCount
}: DeleteListModalProps) {
  const [selectedListId, setSelectedListId] = useState<string>('')
  const [deleteTasksToo, setDeleteTasksToo] = useState(false)

  if (!isOpen || !list) return null

  const handleConfirm = () => {
    if (taskCount === 0 || deleteTasksToo) {
      onConfirm() // Eliminar lista y tareas
    } else {
      onConfirm(selectedListId) // Mover tareas a otra lista
    }
  }

  const canConfirm = taskCount === 0 || deleteTasksToo || selectedListId

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Eliminar lista
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            ¿Estás seguro de que quieres eliminar la lista{' '}
            <span className="font-semibold" style={{ color: list.color }}>
              &quot;{list.title}&quot;
            </span>
            ?
          </p>

          {taskCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <p className="text-amber-800 dark:text-amber-200 text-sm font-medium mb-3">
                Esta lista contiene {taskCount} tarea{taskCount !== 1 ? 's' : ''}. ¿Qué quieres hacer?
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="taskAction"
                    checked={!deleteTasksToo}
                    onChange={() => setDeleteTasksToo(false)}
                    className="mr-3"
                  />
                  <span className="text-sm text-amber-800 dark:text-amber-200">
                    Mover tareas a otra lista
                  </span>
                </label>

                {!deleteTasksToo && (
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="ml-6 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">Selecciona una lista...</option>
                    {otherLists.map((otherList) => (
                      <option key={otherList.id} value={otherList.id}>
                        {otherList.title}
                      </option>
                    ))}
                  </select>
                )}

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="taskAction"
                    checked={deleteTasksToo}
                    onChange={() => setDeleteTasksToo(true)}
                    className="mr-3"
                  />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Eliminar también las tareas
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Eliminar lista
          </button>
        </div>
      </div>
    </div>
  )
}
