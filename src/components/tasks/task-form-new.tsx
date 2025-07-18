'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, Flag, List, X, ArrowUp, Circle, Play, CheckCircle, Home, Briefcase, Heart, Star, ShoppingCart, Book, Music, Camera, Coffee, Plane, Gamepad2, Palette, Target } from 'lucide-react'

import { CreateTaskData, Priority, TaskStatus, List as ListType, PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn, getPriorityColor } from '@/lib/utils'
import { CalendarPicker } from '@/components/ui/calendar-picker'

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
  target: Target,
} as const

// Funciones para status icons y colors
const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'PENDING': return 'text-gray-600'
    case 'IN_PROGRESS': return 'text-yellow-600'
    case 'COMPLETED': return 'text-green-600'
    default: return 'text-gray-600'
  }
}

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case 'PENDING': return <Circle className="w-3.5 h-3.5" />
    case 'IN_PROGRESS': return <Play className="w-3.5 h-3.5" />
    case 'COMPLETED': return <CheckCircle className="w-3.5 h-3.5" />
    default: return <Circle className="w-3.5 h-3.5" />
  }
}

// Función para formatear la fecha
const formatDate = (date: Date) => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Hoy'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Mañana'
  } else {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTaskData) => void
  lists: ListType[]
  initialData?: Partial<CreateTaskData>
  isEditing?: boolean
}

export function TaskForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  lists, 
  initialData, 
  isEditing = false 
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [selectedPriority, setSelectedPriority] = useState<Priority>(initialData?.priority || 'Media')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('PENDING')
  const [selectedListId, setSelectedListId] = useState<string>(initialData?.listId || lists[0]?.id || '')
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialData?.dueDate || null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [openSelector, setOpenSelector] = useState<'priority' | 'status' | 'list' | null>(null)

  const calendarRef = useRef<HTMLDivElement>(null)
  
  // Manejar click fuera del calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalendar])

  const handleCreateTask = () => {
    if (!title.trim()) return
    
    const taskData: CreateTaskData = {
      title: title.trim(),
      description: description.trim(),
      priority: selectedPriority,
      dueDate: selectedDate,
      listId: selectedListId
    }

    onSubmit(taskData)
    onClose()
    
    // Reset form if not editing
    if (!isEditing) {
      setTitle('')
      setDescription('')
      setSelectedPriority('NORMAL')
      setSelectedStatus('PENDING')
      setSelectedListId(lists[0]?.id || '')
      setSelectedDate(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none shadow-none bg-transparent max-w-none w-auto">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative">
            <div 
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden"
              style={{ 
                width: '450px',
                maxWidth: '90vw'
              }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isEditing ? 'Editar tarea' : 'Nueva tarea'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Title Input */}
                <div>
                  <input
                    type="text"
                    placeholder="¿Qué tienes que hacer?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-lg font-semibold placeholder-gray-400 border-0 bg-transparent focus:outline-none focus:ring-0 px-0"
                    autoFocus
                  />
                </div>

                {/* Description Input */}
                <div>
                  <textarea
                    placeholder="Agregar notas..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-sm placeholder-gray-400 border-0 bg-transparent focus:outline-none focus:ring-0 px-0 resize-none"
                    rows={3}
                  />
                </div>

                {/* Selectors */}
                <div className="flex flex-wrap gap-2">
                  {/* Priority Selector */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setOpenSelector(openSelector === 'priority' ? null : 'priority')}
                      className={cn(
                        "apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700",
                        openSelector === 'priority' || selectedPriority === 'NORMAL'
                          ? "bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {PRIORITY_OPTIONS.find(opt => opt.value === selectedPriority)?.label || 'Media'}
                    </button>
                    
                    {openSelector === 'priority' && (
                      <div className="absolute top-full mt-1 left-0 task-dropdown rounded-lg z-50 min-w-32">
                        {PRIORITY_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedPriority(option.value as Priority)
                              setOpenSelector(null)
                            }}
                            className="task-dropdown-item"
                          >
                            <Flag className={cn("w-4 h-4", getPriorityColor(option.value as Priority))} />
                            <span className={cn("", getPriorityColor(option.value as Priority))}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Selector */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setOpenSelector(openSelector === 'status' ? null : 'status')}
                      className={cn(
                        "apple-tag px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700",
                        openSelector === 'status' || selectedStatus === 'PENDING'
                          ? "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      <span className={cn("", getStatusColor(selectedStatus))}>
                        {getStatusIcon(selectedStatus)}
                      </span>
                      {STATUS_OPTIONS.find(opt => opt.value === selectedStatus)?.label || 'Pendiente'}
                    </button>
                    
                    {openSelector === 'status' && (
                      <div className="absolute top-full mt-1 left-0 task-dropdown rounded-lg z-50 min-w-36">
                        {STATUS_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedStatus(option.value)
                              setOpenSelector(null)
                            }}
                            className="task-dropdown-item"
                          >
                            <span className={cn("", getStatusColor(option.value as TaskStatus))}>
                              {getStatusIcon(option.value as TaskStatus)}
                            </span>
                            <span className={cn("", getStatusColor(option.value as TaskStatus))}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* List Selector */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setOpenSelector(openSelector === 'list' ? null : 'list')}
                      className={cn(
                        "apple-tag px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700",
                        openSelector === 'list' || selectedListId
                          ? "bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {lists.find(list => list.id === selectedListId)?.title || 'Tareas Rápidas'}
                    </button>
                    
                    {openSelector === 'list' && (
                      <div className="absolute top-full mt-1 right-0 task-dropdown rounded-lg z-50 min-w-48">
                        {lists.map((list) => {
                          const IconComponent = iconMap[list.icon as keyof typeof iconMap] || List
                          return (
                            <button
                              key={list.id}
                              onClick={() => {
                                setSelectedListId(list.id)
                                setOpenSelector(null)
                              }}
                              className="task-dropdown-item"
                            >
                              <IconComponent className="w-4 h-4" style={{ color: list.color }} />
                              <span className="text-gray-700 dark:text-gray-300">{list.title}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Date Selector */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setShowCalendar(!showCalendar)}
                      className={cn(
                        "apple-tag px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700",
                        showCalendar || selectedDate
                          ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      <Calendar className="w-4 h-4" />
                      {selectedDate ? formatDate(selectedDate) : 'Fecha'}
                    </button>
                  </div>
                </div>

                {/* Help Text */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-semibold">
                    Ve a Configuración para activar Windows.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Presiona Enter para crear • Escape para cancelar
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!title.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <ArrowUp className="w-4 h-4" />
                  {isEditing ? 'Guardar cambios' : 'Crear tarea'}
                </button>
              </div>
            </div>

            {/* Calendar positioned above modal */}
            {showCalendar && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-[60]">
                <div ref={calendarRef} className="force-calendar-width">
                  <div style={{ width: '450px', maxWidth: '90vw' }}>
                    <div style={{ width: '100%', boxSizing: 'border-box' }}>
                      <CalendarPicker
                        selectedDate={selectedDate}
                        onDateSelect={(date) => {
                          setSelectedDate(date)
                          setShowCalendar(false)
                        }}
                        onClose={() => setShowCalendar(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
