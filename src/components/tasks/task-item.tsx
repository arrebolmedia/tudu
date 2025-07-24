'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Calendar, 
  Clock, 
  Star,
  MoreHorizontal,
  Edit3,
  Trash2,
  Plus,
  Flag,
  Check,
  X,
  Circle,
  Play,
  CheckCircle,
  CheckSquare,
  Archive,
  List as ListIcon,
  Home,
  Briefcase,
  Heart,
  ShoppingCart,
  Book,
  Music,
  Camera,
  Coffee,
  Plane,
  Gamepad2,
  Palette,
  Target
} from 'lucide-react'
import { CheckIcon } from '@heroicons/react/24/solid'
// Opciones adicionales de React Icons:
import { FaCheck } from 'react-icons/fa' // Font Awesome - más angular
import { BsCheck } from 'react-icons/bs' // Bootstrap - muy limpio
import { IoCheckmark } from 'react-icons/io5' // Ionic - redondeado
import { MdCheck } from 'react-icons/md' // Material Design - minimalista

import { Task, Priority, TaskStatus, STATUS_OPTIONS, PRIORITY_OPTIONS, List } from '@/types'
import { cn, getPriorityColor, getPriorityLabel, isToday, isTomorrow, isOverdue } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { CalendarPicker } from '@/components/ui/calendar-picker'
import { DeleteTaskModal } from '@/components/ui/delete-task-modal'

// Map de iconos para las listas
const iconMap = {
  list: ListIcon,
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

interface TaskItemProps {
  task: Task
  onToggleComplete: (taskId: string, completed: boolean) => void
  onUpdateStatus: (taskId: string, status: TaskStatus) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
  onArchive: (taskId: string) => void
  onRestore?: (taskId: string) => void
  onCancelDeletion?: (taskId: string) => void
  onMoveToList?: (taskId: string, listId: string) => void
  onEdit?: (task: Task) => void
  lists?: List[]
}

export function TaskItem({ 
  task, 
  onToggleComplete, 
  onUpdateStatus,
  onUpdateTask,
  onDelete,
  onArchive,
  onRestore,
  onCancelDeletion,
  onMoveToList,
  onEdit,
  lists = []
}: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const [showListPicker, setShowListPicker] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [titleValue, setTitleValue] = useState(task.title)
  const [descriptionValue, setDescriptionValue] = useState(task.description || '')
  const [datePickerPosition, setDatePickerPosition] = useState({ top: 0, left: 0, showAbove: false })
  const [priorityPickerPosition, setPriorityPickerPosition] = useState({ top: 0, left: 0, showAbove: false })
  const [statusPickerPosition, setStatusPickerPosition] = useState({ top: 0, left: 0, showAbove: false })
  const [listPickerPosition, setListPickerPosition] = useState({ top: 0, left: 0, showAbove: false })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const datePickerRef = useRef<HTMLDivElement>(null)
  const priorityPickerRef = useRef<HTMLDivElement>(null)
  const statusPickerRef = useRef<HTMLDivElement>(null)
  const listPickerRef = useRef<HTMLDivElement>(null)
  const dateButtonRef = useRef<HTMLButtonElement>(null)
  const priorityButtonRef = useRef<HTMLButtonElement>(null)
  const statusButtonRef = useRef<HTMLButtonElement>(null)
  const listButtonRef = useRef<HTMLButtonElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null)

  const handleMoveToList = (listId: string) => {
    onMoveToList?.(task.id, listId)
  }

  const handleEditTask = () => {
    onEdit?.(task)
  }

  // Cerrar pickers al hacer clic fuera y actualizar posición en scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
      if (priorityPickerRef.current && !priorityPickerRef.current.contains(event.target as Node)) {
        setShowPriorityPicker(false)
      }
      if (statusPickerRef.current && !statusPickerRef.current.contains(event.target as Node)) {
        setShowStatusPicker(false)
      }
      if (listPickerRef.current && !listPickerRef.current.contains(event.target as Node)) {
        setShowListPicker(false)
      }
    }

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Actualizar posición de los pickers durante el scroll
          if (showDatePicker && dateButtonRef.current) {
            const rect = dateButtonRef.current.getBoundingClientRect()
            // Cerrar si el botón está fuera de la vista
            if (rect.top < 50 || rect.bottom > window.innerHeight - 50) {
              setShowDatePicker(false)
            } else {
              const newPosition = calculatePosition(dateButtonRef)
              setDatePickerPosition(newPosition)
            }
          }
          if (showPriorityPicker && priorityButtonRef.current) {
            const rect = priorityButtonRef.current.getBoundingClientRect()
            // Cerrar si el botón está fuera de la vista
            if (rect.top < 50 || rect.bottom > window.innerHeight - 50) {
              setShowPriorityPicker(false)
            } else {
              const newPosition = calculatePosition(priorityButtonRef)
              setPriorityPickerPosition(newPosition)
            }
          }
          if (showStatusPicker && statusButtonRef.current) {
            const rect = statusButtonRef.current.getBoundingClientRect()
            // Cerrar si el botón está fuera de la vista
            if (rect.top < 50 || rect.bottom > window.innerHeight - 50) {
              setShowStatusPicker(false)
            } else {
              const newPosition = calculatePosition(statusButtonRef)
              setStatusPickerPosition(newPosition)
            }
          }
          if (showListPicker && listButtonRef.current) {
            const rect = listButtonRef.current.getBoundingClientRect()
            // Cerrar si el botón está fuera de la vista
            if (rect.top < 50 || rect.bottom > window.innerHeight - 50) {
              setShowListPicker(false)
            } else {
              const newPosition = calculatePosition(listButtonRef)
              setListPickerPosition(newPosition)
            }
          }
          ticking = false
        })
        ticking = true
      }
    }

    if (showDatePicker || showPriorityPicker || showStatusPicker || showListPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [showDatePicker, showPriorityPicker, showStatusPicker, showListPicker])

  // Focus en inputs cuando se activa la edición
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [editingTitle])

  useEffect(() => {
    if (editingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus()
      descriptionInputRef.current.select()
    }
  }, [editingDescription])

  // Calcular posición para portals
  const calculatePosition = (buttonRef: React.RefObject<HTMLButtonElement | null>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      // Si no hay suficiente espacio abajo, mostrar arriba
      const showAbove = spaceBelow < 300 && spaceAbove > 300
      
      return {
        top: showAbove 
          ? rect.top + window.scrollY - 8 
          : rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        showAbove
      }
    }
    return { top: 0, left: 0, showAbove: false }
  }

  const handleSaveTitle = () => {
    if (titleValue.trim()) {
      onUpdateTask(task.id, { title: titleValue.trim() })
    } else {
      setTitleValue(task.title)
    }
    setEditingTitle(false)
  }

  const handleSaveDescription = () => {
    onUpdateTask(task.id, { description: descriptionValue })
    setEditingDescription(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent, isTitle: boolean) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isTitle) {
        handleSaveTitle()
      } else {
        handleSaveDescription()
      }
    } else if (e.key === 'Escape') {
      if (isTitle) {
        setTitleValue(task.title)
        setEditingTitle(false)
      } else {
        setDescriptionValue(task.description || '')
        setEditingDescription(false)
      }
    }
  }

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return 'Hoy'
    if (isTomorrow(date)) return 'Mañana'
    return format(date, 'MMM d', { locale: es })
  }

  const getDueDateColor = (date: Date) => {
    if (isOverdue(date)) return 'text-red-600'
    if (isToday(date)) return 'text-blue-600'
    if (isTomorrow(date)) return 'text-orange-600'
    return 'text-gray-600'
  }

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

  const getStatusLabel = (status: TaskStatus) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status)
    return option?.label || status
  }

  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  return (
    <>
      <div 
        data-task-id={task.id}
        data-completed={task.completed}
        data-archived={task.archived}
        className={cn(
          "group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-700 hover:shadow-lg hover:shadow-black/5 hover:border-gray-300 dark:hover:border-gray-600 task-item",
          task.completed ? "opacity-75 bg-gray-50 dark:bg-gray-800/50" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/30",
          task.archived && "opacity-60 bg-gray-100 dark:bg-gray-800/70 border-gray-300 dark:border-gray-600"
        )}
      >
      {/* Tarea principal */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggleComplete(task.id, !task.completed)}
          className={cn(
            "mt-0.5 w-5 h-5 transition-all duration-500 group/checkbox relative transform active:scale-95",
            task.completed ? "hover:scale-102 animate-pulse" : "hover:scale-105"
          )}
        >
          {task.completed ? (
            <CheckSquare 
              className="w-5 h-5 animate-bounce" 
              style={{ color: '#10b981', animationDuration: '1s', animationIterationCount: '2' }}
            />
          ) : (
            <>
              {/* Contorno verde normal */}
              <div className={cn(
                "w-5 h-5 border-2 border-green-300 rounded-sm group-hover/checkbox:opacity-0 transition-all duration-300 dark:border-green-400"
              )} />
              {/* CheckSquare en hover */}
              <div className="absolute inset-0 opacity-0 group-hover/checkbox:opacity-100 transition-all duration-300 transform group-hover/checkbox:scale-105">
                <CheckSquare 
                  className="w-5 h-5" 
                  style={{ color: '#6ee7b7' }}
                />
              </div>
            </>
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          {/* Cabecera con título y acciones */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Badge de archivado */}
              {task.archived && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                    <Archive className="w-3 h-3" />
                    Archivada
                  </span>
                </div>
              )}

              {/* Badge de eliminación programada */}
              {task.markedForDeletion && task.deletionDate && (
                <div className="mb-2">
                  <div className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full">
                    <Trash2 className="w-3 h-3" />
                    <span>Se eliminará el {format(task.deletionDate, 'dd/MM/yyyy', { locale: es })}</span>
                    {onCancelDeletion && (
                      <button
                        onClick={() => onCancelDeletion(task.id)}
                        className="hover:bg-red-200 dark:hover:bg-red-800 rounded-full p-0.5 transition-colors"
                        title="Cancelar eliminación"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Título editable */}
              {editingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, true)}
                  onBlur={handleSaveTitle}
                  className="text-lg font-semibold bg-transparent border-none outline-none w-full text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 rounded px-1 -ml-1"
                />
              ) : (
                <h3 
                  className={cn(
                    "task-title text-lg font-semibold cursor-pointer transition-all duration-700",
                    task.completed
                      ? "line-through text-gray-500 dark:text-gray-600 hover:text-gray-400" 
                      : "text-gray-900 dark:text-white hover:text-blue-500"
                  )}
                  onClick={() => setEditingTitle(true)}
                >
                  {task.title}
                </h3>
              )}
            </div>
            
            {/* Acciones */}
            <div className={cn(
              "flex items-center gap-1 transition-opacity duration-200",
              task.completed ? "opacity-0 group-hover:opacity-60" : "opacity-0 group-hover:opacity-100"
            )}>
              <button
                onClick={() => {
                  const newPriority = task.priority === 'HIGH' ? 'NORMAL' : 'HIGH'
                  onUpdateTask(task.id, { priority: newPriority })
                }}
                className={cn(
                  "apple-button-icon p-2 rounded-lg transition-colors duration-200",
                  task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <Star 
                  className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    task.priority === 'HIGH' 
                      ? "text-amber-500 fill-amber-500" 
                      : "text-gray-300 hover:text-amber-400"
                  )} 
                />
              </button>
              <button
                onClick={() => task.archived && onRestore ? onRestore(task.id) : onArchive(task.id)}
                className={cn(
                  "apple-button-icon p-2 rounded-lg transition-colors duration-200",
                  task.completed ? "hover:bg-blue-25 dark:hover:bg-blue-900/10" : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
                )}
                title={task.archived ? "Restaurar tarea" : "Archivar tarea"}
              >
                <Archive className={cn(
                  "w-5 h-5",
                  task.archived ? "text-green-500" : "text-blue-500"
                )} />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className={cn(
                  "apple-button-icon p-2 rounded-lg transition-colors duration-200",
                  task.completed ? "hover:bg-red-25 dark:hover:bg-red-900/10" : "hover:bg-red-50 dark:hover:bg-red-900/20"
                )}
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>

          {/* Descripción */}
          <>
            <div className="h-3"></div> {/* Separador visual */}
            {editingDescription ? (
              <textarea
                ref={descriptionInputRef}
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, false)}
                onBlur={handleSaveDescription}
                className="text-base bg-transparent border-none outline-none w-full text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-blue-500 rounded px-1 -ml-1 resize-none"
                rows={2}
              />
            ) : (
              <p 
                className={cn(
                  "task-description text-base cursor-pointer transition-all duration-300",
                  task.completed
                    ? "line-through text-gray-400 dark:text-gray-600 hover:text-gray-350" 
                    : task.description 
                      ? "text-gray-600 dark:text-gray-400 hover:text-blue-500"
                      : "text-gray-400 dark:text-gray-500 hover:text-blue-400 italic"
                )}
                onClick={() => setEditingDescription(true)}
              >
                {task.description || 'Añadir descripción...'}
              </p>
            )}
          </>

          {/* Separador visual antes de metadatos */}
          <div className="border-t border-gray-100 dark:border-gray-800 my-4"></div>
          
          {/* Metadatos */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Estado de la tarea */}
            <div className="relative">
              <button
                ref={statusButtonRef}
                onClick={() => {
                  if (!showStatusPicker) {
                    setStatusPickerPosition(calculatePosition(statusButtonRef))
                  }
                  setShowStatusPicker(!showStatusPicker)
                  setShowDatePicker(false)
                  setShowPriorityPicker(false)
                  setShowListPicker(false)
                }}
                className={cn(
                  "apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700",
                  getStatusColor(task.status),
                  task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
              >
                <span className="flex items-center">
                  {getStatusIcon(task.status)}
                </span>
                {getStatusLabel(task.status)}
              </button>
            </div>

            {task.dueDate && (
              <div className="relative">
                <button
                  ref={dateButtonRef}
                  onClick={() => {
                    if (!showDatePicker) {
                      setDatePickerPosition(calculatePosition(dateButtonRef))
                    }
                    setShowDatePicker(!showDatePicker)
                    setShowPriorityPicker(false)
                    setShowStatusPicker(false)
                    setShowListPicker(false)
                  }}
                  className={cn(
                    "apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700",
                    getDueDateColor(new Date(task.dueDate)),
                    task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  {formatDueDate(new Date(task.dueDate))}
                </button>
              </div>
            )}
            
            <div className="relative">
              <button
                ref={priorityButtonRef}
                onClick={() => {
                  if (!showPriorityPicker) {
                    setPriorityPickerPosition(calculatePosition(priorityButtonRef))
                  }
                  setShowPriorityPicker(!showPriorityPicker)
                  setShowDatePicker(false)
                  setShowStatusPicker(false)
                  setShowListPicker(false)
                }}
                className={cn(
                  "apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700",
                  getPriorityColor(task.priority),
                  {
                    'apple-priority-high': task.priority === 'HIGH',
                    'apple-priority-medium': task.priority === 'LOW',
                  },
                  task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
              >
                <Flag className={cn("w-3.5 h-3.5 flex-shrink-0", getPriorityColor(task.priority))} />
                {getPriorityLabel(task.priority)}
              </button>
            </div>

            {/* Selector de lista */}
            {lists && lists.length > 0 && (
              <div className="relative">
                <button
                  ref={listButtonRef}
                  onClick={() => {
                    if (!showListPicker) {
                      setListPickerPosition(calculatePosition(listButtonRef))
                    }
                    setShowListPicker(!showListPicker)
                    setShowDatePicker(false)
                    setShowPriorityPicker(false)
                    setShowStatusPicker(false)
                  }}
                  className={cn(
                    "apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700",
                    "text-gray-600 dark:text-gray-400",
                    task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  {(() => {
                    const currentList = lists.find(l => l.id === task.listId)
                    const IconComponent = currentList?.icon ? iconMap[currentList.icon as keyof typeof iconMap] || ListIcon : ListIcon
                    return (
                      <IconComponent 
                        className="w-3.5 h-3.5 flex-shrink-0" 
                        style={currentList?.color ? { color: currentList.color } : {}}
                      />
                    )
                  })()}
                  {lists.find(l => l.id === task.listId)?.title || 'Tareas Rápidas'}
                </button>
              </div>
            )}
            
            {totalSubtasks > 0 && (
              <span className="apple-tag text-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {completedSubtasks}/{totalSubtasks} subtareas
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Subtareas */}
      {isExpanded && task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-4 ml-10 space-y-3 apple-fade-in">
          {task.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={subtask.completed}
                readOnly
                className="apple-checkbox apple-checkbox-small"
              />
              <span className={cn(
                "text-sm transition-all duration-200",
                subtask.completed 
                  ? "line-through text-gray-500 dark:text-gray-600" 
                  : "text-gray-700 dark:text-gray-300"
              )}>
                {subtask.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
    
      {/* Calendar Portal */}
      {showDatePicker && typeof window !== 'undefined' && createPortal(
        <div
          ref={datePickerRef}
          className={cn(
            "absolute z-[10001]",
            datePickerPosition.showAbove && "transform -translate-y-full"
          )}
          style={{
            top: `${datePickerPosition.top}px`,
            left: `${datePickerPosition.left}px`,
            transformOrigin: datePickerPosition.showAbove ? 'bottom center' : 'top center'
          }}
        >
          <CalendarPicker
            selectedDate={new Date(task.dueDate!)}
            onDateSelect={(date) => {
              onUpdateTask(task.id, { dueDate: date })
              setShowDatePicker(false)
            }}
            onClose={() => setShowDatePicker(false)}
          />
        </div>,
        document.body
      )}
      
      {/* Priority Picker Portal */}
      {showPriorityPicker && typeof window !== 'undefined' && createPortal(
        <div
          ref={priorityPickerRef}
          className="absolute z-[10001]"
          style={{
            top: `${priorityPickerPosition.top}px`,
            left: `${priorityPickerPosition.left}px`
          }}
        >
          <div
            className={cn(
              "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2 shadow-xl min-w-36 backdrop-blur-xl",
              priorityPickerPosition.showAbove && "transform -translate-y-full"
            )}
            style={{
              transformOrigin: priorityPickerPosition.showAbove ? 'bottom center' : 'top center'
            }}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onUpdateTask(task.id, { priority: option.value as Priority })
                  setShowPriorityPicker(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-sm",
                  task.priority === option.value && "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <Flag 
                  className={cn("w-4 h-4", getPriorityColor(option.value as Priority))}
                />
                <span className={cn("", getPriorityColor(option.value as Priority))}>{option.label}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
      
      {/* Status Picker Portal */}
      {showStatusPicker && typeof window !== 'undefined' && createPortal(
        <div
          ref={statusPickerRef}
          className="absolute z-[10001]"
          style={{
            top: `${statusPickerPosition.top}px`,
            left: `${statusPickerPosition.left}px`
          }}
        >
          <div
            className={cn(
              "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2 shadow-xl min-w-36 backdrop-blur-xl",
              statusPickerPosition.showAbove && "transform -translate-y-full"
            )}
            style={{
              transformOrigin: statusPickerPosition.showAbove ? 'bottom center' : 'top center'
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onUpdateStatus(task.id, option.value as TaskStatus)
                  setShowStatusPicker(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-sm",
                  task.status === option.value && "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <span className={cn("", getStatusColor(option.value as TaskStatus))}>
                  {getStatusIcon(option.value as TaskStatus)}
                </span>
                <span className={cn("", getStatusColor(option.value as TaskStatus))}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* List Picker Portal */}
      {showListPicker && typeof window !== 'undefined' && createPortal(
        <div
          ref={listPickerRef}
          className="absolute z-[10001]"
          style={{
            top: `${listPickerPosition.top}px`,
            left: `${listPickerPosition.left}px`
          }}
        >
          <div
            className={cn(
              "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2 shadow-xl min-w-48 backdrop-blur-xl",
              listPickerPosition.showAbove && "transform -translate-y-full"
            )}
            style={{
              transformOrigin: listPickerPosition.showAbove ? 'bottom center' : 'top center'
            }}
          >
            {lists.filter(list => !['all', 'today', 'important', 'completed'].includes(list.id)).map((list) => (
              <button
                key={list.id}
                onClick={() => {
                  if (onMoveToList) {
                    onMoveToList(task.id, list.id)
                  }
                  setShowListPicker(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-sm",
                  task.listId === list.id && "bg-gray-100 dark:bg-gray-800"
                )}
              >
                {(() => {
                  const IconComponent = iconMap[list.icon as keyof typeof iconMap] || ListIcon
                  return (
                    <IconComponent 
                      className="w-4 h-4" 
                      style={{ color: list.color }}
                    />
                  )
                })()}
                <span className="text-gray-700 dark:text-gray-300">{list.title}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Delete Task Modal */}
      {showDeleteModal && (
        <DeleteTaskModal
          isOpen={true}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => onDelete(task.id)}
          taskTitle={task.title}
        />
      )}
    </>
  )
}
