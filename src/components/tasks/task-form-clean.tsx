'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Flag, ArrowUp, Circle, Play, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CalendarPicker } from '@/components/ui/calendar-picker';
import { Task, PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/types';
import { formatDate } from '@/lib/utils';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Task;
}

export function TaskForm({ isOpen, onClose, onSubmit, initialData }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [dueDate, setDueDate] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setPriority(initialData.priority);
        setStatus(initialData.status);
        setDueDate(initialData.dueDate || '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStatus('pending');
        setDueDate('');
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      
      const target = event.target as HTMLElement;
      
      if (target.closest('.react-calendar')) {
        return;
      }
      
      if (modalRef.current && !modalRef.current.contains(target)) {
        setShowCalendar(false);
        setShowPriorityDropdown(false);
        setShowStatusDropdown(false);
      }
      
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(target)) {
        setShowPriorityDropdown(false);
      }
      
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDate || undefined,
      });
      onClose();
    }
  };

  const handleDateSelect = (date: string) => {
    setDueDate(date);
    setShowCalendar(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in_progress':
        return 'text-blue-500';
      case 'pending':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return Play;
      case 'pending':
        return Circle;
      default:
        return Circle;
    }
  };

  const modalStyle = {
    position: 'fixed' as const,
    bottom: '90px',
    right: '24px',
    width: '400px',
    maxWidth: 'calc(100vw - 48px)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    zIndex: 9999,
    padding: '24px',
    maxHeight: '70vh',
    overflowY: 'auto' as const,
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      style={modalStyle}
      className="animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {initialData ? 'Editar Tarea' : 'Nueva Tarea'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="space-y-6">
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

        <div>
          <textarea
            placeholder="Agregar notas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm placeholder-gray-400 border-0 bg-transparent focus:outline-none focus:ring-0 px-0 resize-none"
            rows={3}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative" ref={priorityDropdownRef}>
            <button
              onClick={() => {
                setShowPriorityDropdown(!showPriorityDropdown);
                setShowStatusDropdown(false);
                setShowCalendar(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Flag size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {PRIORITY_OPTIONS.find(p => p.value === priority)?.label}
              </span>
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`} />
            </button>
            
            {showPriorityDropdown && (
              <div 
                className="task-dropdown"
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '0',
                  marginBottom: '4px',
                  minWidth: '12rem',
                  zIndex: 10000
                }}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setPriority(option.value);
                      setShowPriorityDropdown(false);
                    }}
                    className="task-dropdown-item flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Flag size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      {option.label}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(option.value)}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowPriorityDropdown(false);
                setShowCalendar(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {(() => {
                const Icon = getStatusIcon(status);
                return <Icon size={16} className={getStatusColor(status)} />;
              })()}
              <span className="text-sm font-medium text-gray-700">
                {STATUS_OPTIONS.find(s => s.value === status)?.label}
              </span>
            </button>
            
            {showStatusDropdown && (
              <div 
                className="task-dropdown"
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '0',
                  marginBottom: '4px',
                  minWidth: '12rem',
                  zIndex: 10000
                }}
              >
                {STATUS_OPTIONS.map((option) => {
                  const Icon = getStatusIcon(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatus(option.value);
                        setShowStatusDropdown(false);
                      }}
                      className="task-dropdown-item flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Icon size={16} className={getStatusColor(option.value)} />
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowCalendar(!showCalendar);
                setShowPriorityDropdown(false);
                setShowStatusDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Calendar size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {dueDate ? formatDate(dueDate) : 'Sin fecha'}
              </span>
            </button>
          </div>
        </div>

        {showCalendar && (
          <div 
            className="relative"
            style={{
              position: 'absolute',
              bottom: '100%',
              right: '0',
              marginBottom: '16px',
              zIndex: 10001
            }}
          >
            <CalendarPicker
              selectedDate={dueDate}
              onDateSelect={handleDateSelect}
              className="shadow-lg border border-gray-200 rounded-lg bg-white"
            />
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span>{initialData ? 'Actualizar' : 'Crear'}</span>
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react'
import { Calendar, Flag, List, X, ArrowUp, Circle, Play, CheckCircle, Home, Briefcase, Heart, Star, ShoppingCart, Book, Music, Camera, Coffee, Plane, Gamepad2, Palette, Target } from 'lucide-react'

import { CreateTaskData, Priority, TaskStatus, List as ListType, PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn, getPriorityColor } from '@/lib/utils'
import { CalendarPicker } from '@/components/ui/calendar-picker'

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
      dueDate: selectedDate || undefined,
      listId: selectedListId
    }

    onSubmit(taskData)
    onClose()
    
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

              <div className="p-6 space-y-4">
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

                <div>
                  <textarea
                    placeholder="Agregar notas..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-sm placeholder-gray-400 border-0 bg-transparent focus:outline-none focus:ring-0 px-0 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
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
                      <div className="absolute bottom-full mb-1 left-0 task-dropdown rounded-lg z-50 min-w-32">
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
                      <div className="absolute bottom-full mb-1 left-0 task-dropdown rounded-lg z-50 min-w-36">
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

                <div className="text-center">
                  <p className="text-sm text-gray-500 font-semibold">
                    Ve a Configuración para activar Windows.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Presiona Enter para crear • Escape para cancelar
                  </p>
                </div>
              </div>

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
