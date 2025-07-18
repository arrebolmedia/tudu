'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Calendar, Flag, X, Sparkles, List, Home, Briefcase, Heart, Star, ShoppingCart, Book, Music, Camera, Coffee, Plane, Gamepad2, Palette, Target, ArrowUp, Circle, Play, CheckCircle } from 'lucide-react'
import { CreateTaskData, Priority, TaskStatus, List as ListType, PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/types'
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
  target: Target
}

interface QuickTaskFabProps {
  onCreateTask: (data: CreateTaskData) => void
  lists: ListType[]
  activeListId?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  openedFrom?: 'fab' | 'button' // Nueva prop para saber desde dónde se abre
  initialConfig?: {
    priority?: Priority
    date?: Date
    listId?: string
  }
}

const priorityOptions = PRIORITY_OPTIONS

const statusOptions = STATUS_OPTIONS

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

const dateOptions = [
  { value: 'today', label: 'Hoy', date: () => new Date() },
  { value: 'tomorrow', label: 'Mañana', date: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
  { value: 'week', label: 'Esta semana', date: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; } },
  { value: 'custom', label: 'Fecha personalizada', date: () => new Date() },
]

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
    // Formatear como "17 Jul" o "17 de julio"
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short'
    }
    return date.toLocaleDateString('es-ES', options)
  }
}

// Función para obtener el color de la fecha (igual que en task-item.tsx)
const getDueDateColor = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateToCheck = new Date(date)
  dateToCheck.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (dateToCheck < today) return 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
  if (dateToCheck.getTime() === today.getTime()) return 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
  if (dateToCheck.getTime() === tomorrow.getTime()) return 'bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700'
  return 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
}

export function QuickTaskFab({ onCreateTask, lists, activeListId, isOpen, onToggle, openedFrom = 'fab', initialConfig }: QuickTaskFabProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false)
  const isExpanded = isOpen !== undefined ? isOpen : internalIsExpanded
  const setIsExpanded = onToggle !== undefined ? onToggle : setInternalIsExpanded
  const [title, setTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedPriority, setSelectedPriority] = useState<Priority>('NORMAL')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('PENDING')
  const [selectedListId, setSelectedListId] = useState<string>('quick-tasks')

  // Aplicar configuración inicial cuando se abre el modal
  useEffect(() => {
    if (isExpanded && initialConfig) {
      if (initialConfig.priority) setSelectedPriority(initialConfig.priority)
      if (initialConfig.date) setSelectedDate(initialConfig.date)
      if (initialConfig.listId) setSelectedListId(initialConfig.listId)
    }
  }, [isExpanded, initialConfig])
  
  // Estados para controlar qué selector está abierto
  const [openSelector, setOpenSelector] = useState<'date' | 'priority' | 'status' | 'list' | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // No cerrar si el click fue en el calendario
      if (calendarRef.current && calendarRef.current.contains(event.target as Node)) {
        return
      }
      
      // También verificar por clase CSS como fallback
      const calendarElement = document.querySelector('.force-calendar-width')
      if (calendarElement && calendarElement.contains(event.target as Node)) {
        return
      }
      
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
    setOpenSelector(null)
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

  // Definir posicionamiento basado en desde dónde se abre
  const getModalPositionClasses = () => {
    if (openedFrom === 'button') {
      // Centro del contenedor de tareas
      return "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
    } else {
      // Posición original del FAB (esquina inferior derecha)
      return "fixed bottom-6 right-6 z-30"
    }
  }

  const getCalendarPositionClasses = () => {
    if (openedFrom === 'button') {
      // Posicionar calendario cerca del modal centrado
      return "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-50"
    } else {
      // Posición original del calendario
      return "fixed bottom-52 right-6 z-50"
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
    <>
      {/* Backdrop for button modal */}
      {openedFrom === 'button' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClose} />
      )}

      {/* Calendar Picker positioned fixed on screen */}
      {openSelector === 'date' && (
        <div className={getCalendarPositionClasses()} style={{ position: 'fixed' }} ref={calendarRef}>
          <div className="min-w-[450px] max-w-[750px]">
            <div 
              className="w-full force-calendar-width"
              style={{ 
                width: '100%',
                minWidth: '450px',
                maxWidth: '750px'
              }}
            >
              <CalendarPicker
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date)
                  setOpenSelector(null)
                }}
                onClose={() => setOpenSelector(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Expanded Card - Only show when expanded */}
      <div className={getModalPositionClasses()} style={{ position: 'fixed' }}>
        <div className="min-w-[450px] max-w-[750px] bg-white dark:bg-gray-800 rounded-lg shadow-xl p-0 relative">
          <div 
            ref={containerRef}
            className="w-full"
          >
            <div className="px-4 py-4 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            
            <input
              ref={inputRef}
              type="text"
              placeholder="¿Qué tienes que hacer?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full px-0 py-3 border-0 border-b border-gray-200 dark:border-gray-600 focus:ring-0 focus:border-gray-400 dark:focus:border-gray-500 dark:bg-transparent dark:text-white text-base bg-transparent outline-none placeholder-gray-600 dark:placeholder-gray-400 font-semibold"
            />

            {/* All selectors in one row */}
            <div className="flex items-center gap-2 mt-4">
              {/* Date Selector */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setOpenSelector(openSelector === 'date' ? null : 'date')}
                  className={cn(
                    "apple-tag px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border",
                    getDueDateColor(selectedDate)
                  )}
                >
                  {formatDate(selectedDate)}
                </button>
              </div>
              
              {/* Priority Selector */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setOpenSelector(openSelector === 'priority' ? null : 'priority')}
                  className={cn(
                    "apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700",
                    openSelector === 'priority' || selectedPriority !== 'NORMAL'
                      ? selectedPriority === 'HIGH' 
                        ? "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300"
                        : selectedPriority === 'LOW'
                        ? "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        : "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300"
                      : "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300"
                  )}
                >
                  {priorityOptions.find(opt => opt.value === selectedPriority)?.label || 'Media'}
                </button>
                
                {openSelector === 'priority' && (
                  <div className="absolute bottom-full mb-1 left-0 task-dropdown rounded-lg z-50 min-w-32">
                    {priorityOptions.map((option) => (
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
                  {statusOptions.find(opt => opt.value === selectedStatus)?.label || 'Pendiente'}
                </button>
                
                {openSelector === 'status' && (
                  <div className="absolute bottom-full mb-1 left-0 task-dropdown rounded-lg z-50 min-w-36">
                    {statusOptions.map((option) => (
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
                  <div className="absolute bottom-full mb-1 right-0 task-dropdown rounded-lg z-50 min-w-48">
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
              
              {/* Submit Button */}
              <button 
                onClick={handleSubmit}
                disabled={!title.trim()}
                className={cn(
                  "w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center flex-shrink-0 transform hover:scale-105",
                  title.trim()
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <ArrowUp className={cn(
                  "w-4 h-4 transition-colors duration-200",
                  title.trim() ? "text-white" : "text-gray-500 dark:text-gray-400"
                )} />
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              Presiona Enter para crear • Escape para cancelar
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default QuickTaskFab
