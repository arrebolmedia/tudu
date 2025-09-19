'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Calendar, Flag, X, Sparkles, List, Home, Briefcase, Heart, Star, ShoppingCart, Book, Music, Camera, Coffee, Plane, Gamepad2, Palette, Target, Circle, Play, CheckCircle } from 'lucide-react'
import { CreateTaskData, Priority, TaskStatus, List as ListType } from '@/types'
import { cn } from '@/lib/utils'
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
}

const priorityOptions = [
  { value: 'LOW' as Priority, label: 'Baja', color: '#10b981' },
  { value: 'NORMAL' as Priority, label: 'Media', color: '#f59e0b' },
  { value: 'HIGH' as Priority, label: 'Alta', color: '#ef4444' },
]

const statusOptions = [
  { value: 'PENDING' as TaskStatus, label: 'Pendiente', color: 'text-gray-600' },
  { value: 'IN_PROGRESS' as TaskStatus, label: 'En progreso', color: 'text-yellow-600' },
  { value: 'COMPLETED' as TaskStatus, label: 'Terminada', color: 'text-green-600' },
]

// Funciones de utilidad
const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case 'PENDING': return <Circle className="w-3.5 h-3.5" />
    case 'IN_PROGRESS': return <Play className="w-3.5 h-3.5" />
    case 'COMPLETED': return <CheckCircle className="w-3.5 h-3.5" />
    default: return <Circle className="w-3.5 h-3.5" />
  }
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'PENDING': return 'text-gray-600'
    case 'IN_PROGRESS': return 'text-yellow-600'
    case 'COMPLETED': return 'text-green-600'
    default: return 'text-gray-600'
  }
}

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'LOW': return 'text-green-600'
    case 'NORMAL': return 'text-yellow-600'
    case 'HIGH': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

// Función para formatear fecha
const formatDateLabel = (date: Date) => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Hoy'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Mañana'
  } else {
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

export function QuickTaskFab({ onCreateTask, lists, activeListId }: QuickTaskFabProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedPriority, setSelectedPriority] = useState<Priority>('NORMAL')
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('PENDING')
  const [selectedListId, setSelectedListId] = useState<string>('quick-tasks')
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showListDropdown, setShowListDropdown] = useState(false)
  
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

  // Efecto adicional para cerrar dropdowns individuales al hacer clic fuera
  useEffect(() => {
    const handleDropdownClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Si el clic no está dentro de ningún dropdown, cerrar todos
      if (!target.closest('.dropdown-container')) {
        setShowStatusDropdown(false)
        setShowPriorityDropdown(false)
        setShowDatePicker(false)
        setShowListDropdown(false)
      }
    }

    if (showStatusDropdown || showPriorityDropdown || showDatePicker || showListDropdown) {
      document.addEventListener('mousedown', handleDropdownClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleDropdownClickOutside)
    }
  }, [showStatusDropdown, showPriorityDropdown, showDatePicker, showListDropdown])

  const handleClose = () => {
    setIsExpanded(false)
    setTitle('')
    setSelectedDate(new Date())
    setSelectedPriority('NORMAL')
    setSelectedStatus('PENDING')
    setSelectedListId('quick-tasks')
    setShowPriorityDropdown(false)
    setShowStatusDropdown(false)
    setShowDatePicker(false)
    setShowListDropdown(false)
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

  return (
    <div className="fixed bottom-6 right-6 z-30" ref={containerRef}>
      {/* Modal horizontal encima del FAB */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 mb-2">
          <div className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-700 hover:shadow-lg hover:shadow-black/5 hover:border-gray-300 dark:hover:border-gray-600 task-item w-[640px]">
            {/* Contenido principal de la tarjeta */}
            <div className="flex items-start gap-4">
              {/* Sin checkbox */}
              
              <div className="flex-1 min-w-0">
                {/* Botón de cerrar en la esquina superior derecha */}
                <div className="flex justify-end mb-2">
                  <button
                    onClick={handleClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Input principal para el título */}
                <div className="mb-4">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="¿Qué tenemos que hacer?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="text-lg font-semibold bg-transparent border-none outline-none w-full text-gray-900 dark:text-white rounded px-1 -ml-1 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0"
                  />
                </div>

                {/* Campo de descripción */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Añadir descripción..."
                    className="text-base bg-transparent border-none outline-none w-full text-gray-600 dark:text-gray-400 rounded px-1 -ml-1 placeholder-gray-400 dark:placeholder-gray-500 italic focus:ring-0"
                  />
                </div>

                {/* Separador visual */}
                <div className="border-t border-gray-100 dark:border-gray-800 my-4"></div>
                
                {/* Metadatos - Botones de estado */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Estado dropdown */}
                  <div className="relative dropdown-container">
                    <button 
                      onClick={() => {
                        setShowStatusDropdown(!showStatusDropdown)
                        setShowPriorityDropdown(false)
                        setShowDatePicker(false)
                        setShowListDropdown(false)
                      }}
                      className={cn(
                        "apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                        getStatusColor(selectedStatus)
                      )}
                    >
                      <span className="flex items-center">
                        {getStatusIcon(selectedStatus)}
                      </span>
                      {statusOptions.find(opt => opt.value === selectedStatus)?.label || 'Pendiente'}
                    </button>
                    
                    {/* Status dropdown */}
                    {showStatusDropdown && (
                      <div className="absolute bottom-full mb-1 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-50 min-w-40">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedStatus(option.value)
                              setShowStatusDropdown(false)
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            <span className={cn("flex items-center", getStatusColor(option.value))}>
                              {getStatusIcon(option.value)}
                            </span>
                            <span className={cn("", getStatusColor(option.value))}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fecha selector con dropdown */}
                  <div className="relative dropdown-container">
                    <button 
                      onClick={() => {
                        setShowDatePicker(!showDatePicker)
                        setShowPriorityDropdown(false)
                        setShowStatusDropdown(false)
                        setShowListDropdown(false)
                      }}
                      className="apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700 text-orange-600 bg-orange-50 hover:bg-orange-100"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateLabel(selectedDate)}
                    </button>
                    
                    {/* Date picker dropdown */}
                    {showDatePicker && (
                      <div className="absolute bottom-full mb-1 right-0 z-50">
                        <CalendarPicker
                          selectedDate={selectedDate}
                          onDateSelect={(date) => {
                            setSelectedDate(date)
                            setShowDatePicker(false)
                          }}
                          onClose={() => setShowDatePicker(false)}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Prioridad dropdown - color verde para "Media" */}
                  <div className="relative dropdown-container">
                    <button 
                      onClick={() => {
                        setShowPriorityDropdown(!showPriorityDropdown)
                        setShowStatusDropdown(false)
                        setShowDatePicker(false)
                        setShowListDropdown(false)
                      }}
                      className={cn(
                        "apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                        getPriorityColor(selectedPriority)
                      )}
                    >
                      <Flag className={cn("w-3.5 h-3.5", getPriorityColor(selectedPriority))} />
                      {priorityOptions.find(opt => opt.value === selectedPriority)?.label || 'Media'}
                    </button>
                    
                    {/* Priority dropdown */}
                    {showPriorityDropdown && (
                      <div className="absolute bottom-full mb-1 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-50 min-w-32">
                        {priorityOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedPriority(option.value)
                              setShowPriorityDropdown(false)
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            <Flag className={cn("w-3.5 h-3.5", getPriorityColor(option.value))} />
                            <span className={cn("", getPriorityColor(option.value))}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lista dropdown */}
                  <div className="relative dropdown-container">
                    <button 
                      onClick={() => {
                        setShowListDropdown(!showListDropdown)
                        setShowPriorityDropdown(false)
                        setShowStatusDropdown(false)
                        setShowDatePicker(false)
                      }}
                      className="apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <List className="w-3.5 h-3.5" />
                      {lists.find(list => list.id === selectedListId)?.title || 'Lista'}
                    </button>
                    
                    {/* Lista dropdown */}
                    {showListDropdown && (
                      <div className="absolute bottom-full mb-1 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-50 min-w-48">
                        {lists.map((list) => {
                          const IconComponent = iconMap[list.icon as keyof typeof iconMap] || List
                          return (
                            <button
                              key={list.id}
                              onClick={() => {
                                setSelectedListId(list.id)
                                setShowListDropdown(false)
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                              <IconComponent 
                                className="w-3.5 h-3.5 text-arrebol-beige-600" 
                              />
                              <span className="text-gray-700 dark:text-gray-300">{list.title}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer con botones */}
                <div className="flex justify-end items-center gap-2 mt-6">
                  <button
                    onClick={handleClose}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!title.trim()}
                    className={cn(
                      "px-4 py-1.5 text-sm rounded-lg transition-colors font-medium",
                      title.trim()
                        ? "bg-gray-700 hover:bg-gray-800 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    Crear tarea
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsExpanded(true)}
        className="w-14 h-14 bg-gradient-to-br from-arrebol-terracota via-arrebol-terracota-dark to-arrebol-terracota-800 hover:from-arrebol-terracota-dark hover:via-arrebol-terracota-700 hover:to-arrebol-terracota-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center transform hover:scale-105 relative group"
      >
        <div className="absolute -top-0.5 -right-0.5">
          <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
        </div>
        <Plus className="w-6 h-6 relative z-10 text-transparent bg-gradient-to-br from-white via-yellow-100 to-arrebol-beige-200 bg-clip-text" />
      </button>
    </div>
  )
}

export default QuickTaskFab
