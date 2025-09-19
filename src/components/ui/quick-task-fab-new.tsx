'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Calendar, Flag, X, Sparkles, Circle, Play, CheckCircle, List, Home, Briefcase, Heart, Star, ShoppingCart, Book, Music, Camera, Coffee, Plane, Gamepad2, Palette, Target } from 'lucide-react'
import { CreateTaskData, Priority, TaskStatus, STATUS_OPTIONS, List as ListType } from '@/types'
import { cn } from '@/lib/utils'
import { CalendarPicker } from './calendar-picker'

// Map de iconos para las listas
const iconMap = {
  'home': Home,
  'briefcase': Briefcase,
  'heart': Heart,
  'star': Star,
  'shopping-cart': ShoppingCart,
  'book': Book,
  'music': Music,
  'camera': Camera,
  'coffee': Coffee,
  'plane': Plane,
  'gamepad-2': Gamepad2,
  'palette': Palette,
  'target': Target,
  'list': List
}

interface QuickTaskFabProps {
  onCreateTask: (data: CreateTaskData) => void
  lists: ListType[]
}

const QuickTaskFab: React.FC<QuickTaskFabProps> = ({ onCreateTask, lists }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('PENDING')
  const [selectedListId, setSelectedListId] = useState(lists[0]?.id || 'default')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const [showListPicker, setShowListPicker] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const priorityOptions = [
    { value: 'high', label: 'Alta', color: 'text-red-500' },
    { value: 'medium', label: 'Media', color: 'text-yellow-500' },
    { value: 'low', label: 'Baja', color: 'text-green-500' }
  ]

  const statusOptions = [
    { value: 'PENDING', label: 'Pendiente', color: 'bg-red-500' },
    { value: 'IN_PROGRESS', label: 'En progreso', color: 'bg-yellow-500' },
    { value: 'COMPLETED', label: 'Completada', color: 'bg-green-500' }
  ]

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

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isExpanded])

  const handleClose = () => {
    setIsExpanded(false)
    setTitle('')
    setSelectedDate(new Date())
    setSelectedPriority('medium')
    setSelectedStatus('PENDING')
    setSelectedListId(lists[0]?.id || 'default')
    setShowDatePicker(false)
    setShowPriorityPicker(false)
    setShowStatusPicker(false)
    setShowListPicker(false)
  }

  const handleSubmit = () => {
    if (!title.trim()) return

    const taskData: CreateTaskData = {
      title: title.trim(),
      description: '',
      priority: selectedPriority,
      status: selectedStatus,
      dueDate: selectedDate.toISOString().split('T')[0],
      listId: selectedListId
    }

    onCreateTask(taskData)
    handleClose()
  }

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
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
          onClick={handleToggle}
          className="w-14 h-14 bg-arrebol-terracota-500 hover:bg-arrebol-terracota-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center transform hover:scale-105 relative group"
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
        <div className="px-6 py-4 border-b border-gray-200/30 dark:border-gray-700/30 bg-arrebol-beige-100/20">
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
                  ? "bg-arrebol-terracota-500 hover:bg-arrebol-terracota-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 font-display"
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
