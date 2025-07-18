'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Calendar, Flag, X, Sparkles, List, Home, Briefcase, Heart, Star, ShoppingCart, Book, Music, Camera, Coffee, Plane, Gamepad2, Palette, Target } from 'lucide-react'
import { CreateTaskData, Priority, TaskStatus, List as ListType } from '@/types'
import { cn } from '@/lib/utils'
import { CalendarPicker } from './calendar-picker'

// Map de iconos para las listas
const iconMap = {
  list: List,
  home: Home,
  briefcase: Briefcase,
  heart: Heart,
  star: Star,
  calendar: Calendar,
  'shopping-cart': ShoppingCart,
  book: Book,
  music: Music,
  camera: Camera,
  coffee: Coffee,
  plane: Plane,
  gamepad2: Gamepad2,
  palette: Palette,
  target: Target
}

interface QuickTaskFabProps {
  onCreateTask: (data: CreateTaskData) => void
  lists: ListType[]
  activeListId?: string
}

const priorityOptions = [
  { value: 'LOW' as Priority, label: 'Baja', color: '#10b981' },
  { value: 'NORMAL' as Priority, label: 'Media', color: '#f59e0b' },
  { value: 'HIGH' as Priority, label: 'Alta', color: '#ef4444' },
]

export function QuickTaskFab({ onCreateTask, lists, activeListId }: QuickTaskFabProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedPriority, setSelectedPriority] = useState<Priority>('NORMAL')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('PENDING')
  const [selectedListId, setSelectedListId] = useState<string>('quick-tasks')
  
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  const handleClose = () => {
    setIsExpanded(false)
    setTitle('')
    setSelectedDate(new Date())
    setSelectedPriority('NORMAL')
    setSelectedStatus('PENDING')
    setSelectedListId('quick-tasks')
  }

  const handleSubmit = () => {
    if (!title.trim()) return

    onCreateTask({
      title: title.trim(),
      description: '',
      priority: selectedPriority,
      status: selectedStatus,
      dueDate: selectedDate,
      listId: selectedListId,
    })

    handleClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center transform hover:scale-105 relative group"
        >
          <div className="absolute -top-0.5 -right-0.5">
            <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
          </div>
          <Plus className="w-6 h-6 relative z-10" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div ref={containerRef} className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200/30 dark:border-gray-700/30 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nueva tarea</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-all duration-200"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Input principal */}
          <div className="mb-6">
            <input
              ref={inputRef}
              type="text"
              placeholder="¿Qué tienes que hacer?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full text-lg font-medium bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Textarea para notas */}
          <div className="mb-6">
            <textarea
              placeholder="Agregar notas..."
              className="w-full h-16 text-sm bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Controles organizados */}
          <div className="space-y-4">
            {/* Selector de lista */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <List className="w-4 h-4 inline mr-2" />
                Lista
              </label>
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
              >
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y prioridad en fila */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha de vencimiento
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Flag className="w-4 h-4 inline mr-2" />
                  Prioridad
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                  className="w-full px-4 py-3 bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/40 dark:bg-gray-800/40 border-t border-gray-200/30 dark:border-gray-700/30">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 rounded-xl transition-colors duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className={cn(
                "px-6 py-2 rounded-xl transition-all duration-200 font-medium relative group",
                title.trim()
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              )}
            >
              {title.trim() && (
                <div className="absolute -top-0.5 -right-0.5">
                  <Sparkles className="h-2 w-2 text-yellow-300 animate-pulse" />
                </div>
              )}
              <span className="relative z-10">Crear tarea</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickTaskFab
