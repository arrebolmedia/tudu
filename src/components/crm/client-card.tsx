'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  Phone,
  Mail,
  Calendar,
  Flag,
  Circle,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Archive,
  Clock,
  Tag,
  ChevronDown,
  Check,
  X,
  Expand,
  Users
} from 'lucide-react'

import { Client, ClientStatus, ClientPriority, ClientType, ClientArea, ClientChannel, ClientExecutive, ClientCoordinator } from '@/types'
import { formatDate } from '@/lib/utils'
import { CalendarPicker } from '@/components/ui/calendar-picker'
import { Z_INDEX_LAYERS, getZIndexClass } from '@/lib/z-index-layers'
import {
  getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel, 
  getAreaColor, getAreaLabel, getTypeColor, getTypeLabel, getChannelColor, getChannelLabel,
  getExecutiveLabel, getExecutiveColor, getCoordinatorLabel, getCoordinatorColor,
  statusOptions, priorityOptions, areaOptions, typeOptions, channelOptions, executiveOptions, coordinatorOptions
} from '@/lib/client-utils'
import { useActivityLog } from '@/contexts/activity-log-context'

interface ClientCardProps {
  client: Client
  onUpdate?: (client: Client) => void
  onDelete?: (clientId: string) => void
  onArchive?: (clientId: string) => void
  onOpenModal?: (client: Client) => void
  disableLogging?: boolean
}

export function ClientCard({ 
  client,
  onUpdate,
  onDelete,
  onArchive,
  onOpenModal,
  disableLogging = false
}: ClientCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 })
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const { addLog } = useActivityLog()

  console.log('Contexto de actividad disponible:', addLog);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const dateButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<HTMLButtonElement>(null)
  const statusRef = useRef<HTMLButtonElement>(null)
  const priorityRef = useRef<HTMLButtonElement>(null)
  const typeRef = useRef<HTMLButtonElement>(null)
  const areaRef = useRef<HTMLButtonElement>(null)
  const executiveRef = useRef<HTMLButtonElement>(null)
  const coordinatorRef = useRef<HTMLButtonElement>(null)

  // Funciones de logging para registrar cambios desde las tarjetas
  const getFormattedDisplayValue = (fieldName: string, value: any): string => {
    if (!value) return 'Sin definir'
    
    switch (fieldName) {
      case 'status':
        return getStatusLabel(value)
      case 'priority':
        return getPriorityLabel(value)
      case 'area':
        return getAreaLabel(value)
      case 'type':
        return getTypeLabel(value)
      case 'channel':
        return getChannelLabel(value)
      case 'assignedExecutive':
        return getExecutiveLabel(value)
      case 'coordinator':
        return getCoordinatorLabel(value)
      case 'eventDate':
        return value instanceof Date ? value.toLocaleDateString('es-ES') : value
      case 'name':
        return value || 'Sin nombre'
      case 'phone':
        return value || 'Sin teléfono'
      case 'email':
        return value || 'Sin email'
      case 'notes':
        return value || 'Sin notas'
      default:
        return value?.toString() || 'Sin definir'
    }
  }

  const getFieldDisplayName = (fieldName: string): string => {
    switch (fieldName) {
      case 'name': return 'Nombre'
      case 'phone': return 'Teléfono'
      case 'email': return 'Email'
      case 'eventDate': return 'Fecha del Evento'
      case 'status': return 'Estado'
      case 'priority': return 'Prioridad'
      case 'area': return 'Área'
      case 'type': return 'Tipo de Evento'
      case 'channel': return 'Canal'
      case 'assignedExecutive': return 'Ejecutivo Asignado'
      case 'coordinator': return 'Coordinador'
      case 'notes': return 'Notas'
      default: return fieldName
    }
  }

  // Esta función enviará el log al contexto global
  const logChange = (fieldName: string, oldValue: any, newValue: any) => {
    console.log(`🔍 ClientCard logChange called:`, { fieldName, oldValue, newValue, disableLogging, clientName: client.name })
    
    if (oldValue === newValue || disableLogging) {
      console.log(`🚫 ClientCard logChange skipped:`, { reason: oldValue === newValue ? 'same values' : 'disabled logging' })
      return
    }

    const formattedOldValue = getFormattedDisplayValue(fieldName, oldValue)
    const formattedNewValue = getFormattedDisplayValue(fieldName, newValue)
    const fieldDisplayName = getFieldDisplayName(fieldName)
    
    // Crear mensaje formateado para el log global
    const formattedMessage = `${fieldDisplayName} cambiado de ${formattedOldValue} a ${formattedNewValue}`
    
    console.log(`📤 ClientCard sending to addLog:`, formattedMessage)
    
    // Enviar al contexto de actividad
    addLog(client.id, fieldName, oldValue, newValue, formattedMessage)
    
    // Log local para debugging
    console.log(`%c[REGISTRO DESDE TARJETA] ${formattedMessage}`, 'color: #10B981; font-weight: bold;')
  }

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select()
      }
    }
  }, [editingField])

  // Manejar click fuera de menús y tecla Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Cerrar calendario
      if (showCalendar && calendarRef.current && !calendarRef.current.contains(target)) {
        setShowCalendar(false)
      }
      
      // Cerrar menú de opciones
      if (showMenu && menuRef.current && !menuRef.current.contains(target)) {
        setShowMenu(false)
      }
      
      // Cerrar dropdowns - dar tiempo para que se procesen los clicks
      if (showDropdown) {
        const currentButtonRef = getDropdownRef(showDropdown)
        
        // Verificar si el click fue en el botón del dropdown actual
        if (currentButtonRef.current && currentButtonRef.current.contains(target)) {
          return // No cerrar si se hace click en el botón
        }
        
        // Verificar si el click fue en el dropdown
        if (dropdownRef.current && dropdownRef.current.contains(target)) {
          return // No cerrar si se hace click en el dropdown
        }
        
        // Usar setTimeout para dar prioridad a los clicks en las opciones
        setTimeout(() => {
          setShowDropdown(null)
        }, 10)
      }

      // Cerrar campo de edición
      if (editingField && inputRef.current && !inputRef.current.contains(target)) {
        setEditingField(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCalendar(false)
        setShowMenu(false)
        setShowDropdown(null)
        setEditingField(null)
      }
    }

    if (showCalendar || showMenu || showDropdown) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showCalendar, showMenu, showDropdown])

  const handleFieldEdit = (fieldName: string, currentValue: string) => {
    setEditingField(fieldName)
    setTempValue(currentValue || '')
  }

  const handleFieldSave = (fieldName: string) => (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = event.target.value
    const oldValue = client[fieldName as keyof Client]
    
    // Convertir a número si es guestCount
    let finalValue: any = newValue
    if (fieldName === 'guestCount') {
      finalValue = newValue ? parseInt(newValue) : undefined
    }
    
    if (oldValue === finalValue) return

    // Actualizar cliente
    const updatedClient = { ...client, [fieldName]: finalValue }
    onUpdate?.(updatedClient)

    // Registrar cambio en el log
    logChange(fieldName, oldValue, finalValue)

    // Cerrar edición
    setEditingField(null)
  }

  const handleFieldCancel = () => {
    setEditingField(null)
    setTempValue('')
  }

  const handleDropdownChange = (field: string, value: string) => {
    // Usar setTimeout para asegurar que el evento click se procese antes de cerrar
    setTimeout(() => {
      if (onUpdate) {
        const oldValue = (client as any)[field]
        
        // Registrar el cambio
        logChange(field, oldValue, value)
        
        const updatedClient = { ...client };
        (updatedClient as any)[field] = value
        onUpdate(updatedClient)
      }
      setShowDropdown(null)
    }, 0)
  }

  const handleDateChange = (date: Date) => {
    if (onUpdate) {
      const oldDate = client.eventDate
      
      // Registrar el cambio
      logChange('eventDate', oldDate, date)
      
      const updatedClient = { ...client, eventDate: date }
      onUpdate(updatedClient)
    }
    setShowCalendar(false)
  }

  const handleCalendarToggle = () => {
    if (!showCalendar && dateButtonRef.current) {
      const rect = dateButtonRef.current.getBoundingClientRect()
      setCalendarPosition({
        top: rect.bottom + 8,
        left: rect.left
      })
    }
    setShowCalendar(!showCalendar)
  }

  const handleChannelDropdownToggle = () => {
    const isOpen = showDropdown === 'channel'
    if (!isOpen && channelRef.current) {
      const rect = channelRef.current.getBoundingClientRect()
      const dropdownWidth = 160 // w-40 = 160px
      const maxDropdownHeight = 200 // Altura máxima con scroll
      
      let top = rect.bottom + 8
      let left = rect.left

      // Ajustar si se sale por la derecha
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16 // 16px de margen
      }

      // Ajustar si se sale por la izquierda
      if (left < 16) {
        left = 16
      }

      // Ajustar si se sale por abajo
      if (top + maxDropdownHeight > window.innerHeight) {
        top = rect.top - maxDropdownHeight - 8 // Mostrar arriba del botón
      }

      // Ajustar si se sale por arriba
      if (top < 16) {
        top = 16
      }

      setDropdownPosition({ top, left })
    }
    setShowDropdown(isOpen ? null : 'channel')
  }

  const getDropdownRef = (fieldName: string) => {
    switch (fieldName) {
      case 'channel': return channelRef
      case 'status': return statusRef
      case 'priority': return priorityRef
      case 'type': return typeRef
      case 'area': return areaRef
      case 'assignedExecutive': return executiveRef
      case 'coordinator': return coordinatorRef
      default: return statusRef
    }
  }

  const handleGenericDropdownToggle = (fieldName: string) => {
    const isOpen = showDropdown === fieldName
    const buttonRef = getDropdownRef(fieldName)

    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownWidth = 160 // w-40 = 160px
      const maxDropdownHeight = 200 // Altura máxima con scroll
      
      let top = rect.bottom + 8
      let left = rect.left

      // Ajustar si se sale por la derecha
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16 // 16px de margen
      }

      // Ajustar si se sale por la izquierda
      if (left < 16) {
        left = 16
      }

      // Ajustar si se sale por abajo
      if (top + maxDropdownHeight > window.innerHeight) {
        top = rect.top - maxDropdownHeight - 8 // Mostrar arriba del botón
      }

      // Ajustar si se sale por arriba
      if (top < 16) {
        top = 16
      }

      setDropdownPosition({ top, left })
    }
    setShowDropdown(isOpen ? null : fieldName)
  }

  const getPriorityIcon = (priority: ClientPriority) => {
    switch (priority) {
      case 'HIGH': return Flag
      case 'NORMAL': return Circle
      case 'LOW': return Circle
      default: return Circle
    }
  }

  const getExecutiveColor = (executive: ClientExecutive) => {
    switch (executive) {
      case 'YARLENY_COLIN':
        return 'bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800 dark:text-violet-400'
      case 'JOSEFO_FLORES':
        return 'bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-800 dark:text-cyan-400'
      case 'SEBASTIAN_RAMIREZ':
        return 'bg-lime-500/10 text-lime-600 border-lime-200 dark:border-lime-800 dark:text-lime-400'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800 dark:text-gray-400'
    }
  }

  const getExecutiveLabel = (executive: ClientExecutive) => {
    switch (executive) {
      case 'YARLENY_COLIN': return 'Yarleny Colín'
      case 'JOSEFO_FLORES': return 'Josefo Flores'
      case 'SEBASTIAN_RAMIREZ': return 'Sebastián Ramírez'
      default: return 'Sin asignar'
    }
  }

  const PriorityIcon = getPriorityIcon(client.priority)

  const executiveOptions: { value: ClientExecutive; label: string }[] = [
    { value: 'YARLENY_COLIN', label: 'Yarleny Colín' },
    { value: 'JOSEFO_FLORES', label: 'Josefo Flores' },
    { value: 'SEBASTIAN_RAMIREZ', label: 'Sebastián Ramírez' },
  ]

  const renderEditableField = (
    fieldName: string,
    value: string,
    placeholder: string,
    type: 'input' | 'textarea' = 'input',
    className: string = ''
  ) => {
    if (editingField === fieldName) {
      const Component = type === 'textarea' ? 'textarea' : 'input'
      return (
        <Component
          ref={inputRef as any}
          type={fieldName === 'phone' ? 'tel' : fieldName === 'guestCount' ? 'number' : 'text'}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleFieldSave(fieldName)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && type === 'input') {
              handleFieldSave(fieldName)
            } else if (e.key === 'Escape') {
              handleFieldCancel()
            }
          }}
          className={`bg-white dark:bg-gray-700 border border-arrebol-terracota/30 rounded px-2 py-1 text-sm w-full ${className}`}
          placeholder={placeholder}
        />
      )
    }

    return (
      <span
        onClick={(e) => {
          e.stopPropagation()
          handleFieldEdit(fieldName, value)
        }}
        className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded px-1 transition-colors block break-words ${className}`}
      >
        {value || placeholder}
      </span>
    )
  }

  const renderDropdown = (
    fieldName: string,
    currentValue: any,
    options: Array<{ value: any; label: string }>,
    getCurrentLabel: (value: any) => string,
    getCurrentColor?: (value: any) => string
  ) => {
    const isOpen = showDropdown === fieldName

    return (
      <div className="relative">
        <button
          ref={getDropdownRef(fieldName)}
          onClick={(e) => {
            e.stopPropagation()
            fieldName === 'channel' ? handleChannelDropdownToggle() : handleGenericDropdownToggle(fieldName)
          }}
          className={`
            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer
            hover:shadow-sm transition-all duration-200 max-w-full
            ${getCurrentColor ? getCurrentColor(currentValue) : 'bg-gray-100 text-gray-700 border-gray-300'}
          `}
        >
          <span className="mr-1 truncate">{getCurrentLabel(currentValue)}</span>
          <ChevronDown size={10} className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && createPortal(
          <>
            <div 
              className={`fixed inset-0 ${getZIndexClass('DROPDOWN')}`}
              onClick={() => setShowDropdown(null)}
            />
            <div 
              ref={dropdownRef}
              className={`fixed bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg ${getZIndexClass('DROPDOWN')} w-40 max-h-48 overflow-y-auto`}
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDropdownChange(fieldName, option.value)}
                onMouseDown={(e) => e.preventDefault()}
                className={`w-full px-3 py-2 text-left text-sm flex items-center first:rounded-t-lg last:rounded-b-lg transition-colors ${
                  currentValue === option.value 
                    ? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <span 
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border w-full justify-center ${
                    getCurrentColor ? getCurrentColor(option.value) : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
          </>,
          document.body
        )}
      </div>
    )
  }

  return (
    <div 
      className={`
        group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
        hover:border-arrebol-terracota/30 dark:hover:border-arrebol-terracota/30
        hover:shadow-lg dark:hover:shadow-2xl
        transition-all duration-200 ease-out overflow-hidden cursor-pointer
        flex flex-col h-full
        ${isHovered ? 'scale-[1.02] shadow-lg' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        // Solo abrir modal si no se está editando un campo
        if (!editingField && !showCalendar && !showDropdown && onOpenModal) {
          onOpenModal(client)
        }
      }}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex items-start flex-1">
          {/* Client Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
              {renderEditableField('name', client.name, 'Nombre del cliente', 'input', 'text-lg font-semibold break-words')}
            </h3>
            {client.eventDate && (
              <div className="relative">
                <button
                  ref={dateButtonRef}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCalendarToggle()
                  }}
                  className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 flex items-center hover:text-arrebol-terracota transition-colors cursor-pointer"
                >
                  <Calendar size={14} className="mr-1 flex-shrink-0" />
                  {formatDate(client.eventDate)}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="relative flex-shrink-0 flex items-center space-x-1">
          {/* Expand hint */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onOpenModal) {
                onOpenModal(client)
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-400 hover:text-arrebol-terracota"
            title="Ver detalles completos"
          >
            <Expand size={14} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <MoreHorizontal size={16} className="text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div 
                className={`fixed inset-0 ${getZIndexClass('DROPDOWN')}`}
                onClick={() => setShowMenu(false)}
              />
              <div 
                ref={menuRef}
                className={`absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg ${getZIndexClass('DROPDOWN')}`}
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      onArchive?.(client.id)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Archive size={14} />
                    <span>Archivar</span>
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={() => {
                      onDelete?.(client.id)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                  >
                    <Trash2 size={14} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tags Row */}
      <div className="px-6 pb-4">
        <div className="flex items-center flex-wrap gap-2">
          {/* Status Badge */}
          {renderDropdown('status', client.status, statusOptions, getStatusLabel, getStatusColor)}

          {/* Priority Badge */}
          {renderDropdown('priority', client.priority, priorityOptions, getPriorityLabel, getPriorityColor)}

          {/* Type Badge */}
          {client.type ? (
            renderDropdown('type', client.type, typeOptions, getTypeLabel, getTypeColor)
          ) : (
            <button
              ref={typeRef}
              onClick={(e) => {
                e.stopPropagation()
                const isOpen = showDropdown === 'type'
                if (!isOpen && typeRef.current) {
                  const rect = typeRef.current.getBoundingClientRect()
                  const dropdownWidth = 160
                  const maxDropdownHeight = 200
                  
                  let top = rect.bottom + 8
                  let left = rect.left

                  if (left + dropdownWidth > window.innerWidth) {
                    left = window.innerWidth - dropdownWidth - 16
                  }
                  if (left < 16) {
                    left = 16
                  }
                  if (top + maxDropdownHeight > window.innerHeight) {
                    top = rect.top - maxDropdownHeight - 8
                  }
                  if (top < 16) {
                    top = 16
                  }

                  setDropdownPosition({ top, left })
                }
                setShowDropdown(isOpen ? null : 'type')
              }}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer bg-gray-100 text-gray-700 border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <span className="mr-1">+ Tipo</span>
              <ChevronDown size={10} className={`transition-transform ${showDropdown === 'type' ? 'rotate-180' : ''}`} />
            </button>
          )}
          
          {/* Area Badge */}
          {client.area ? (
            renderDropdown('area', client.area, areaOptions, getAreaLabel, getAreaColor)
          ) : (
            <button
              ref={areaRef}
              onClick={(e) => {
                e.stopPropagation()
                const isOpen = showDropdown === 'area'
                if (!isOpen && areaRef.current) {
                  const rect = areaRef.current.getBoundingClientRect()
                  const dropdownWidth = 160
                  const maxDropdownHeight = 200
                  
                  let top = rect.bottom + 8
                  let left = rect.left

                  if (left + dropdownWidth > window.innerWidth) {
                    left = window.innerWidth - dropdownWidth - 16
                  }
                  if (left < 16) {
                    left = 16
                  }
                  if (top + maxDropdownHeight > window.innerHeight) {
                    top = rect.top - maxDropdownHeight - 8
                  }
                  if (top < 16) {
                    top = 16
                  }

                  setDropdownPosition({ top, left })
                }
                setShowDropdown(isOpen ? null : 'area')
              }}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer bg-gray-100 text-gray-700 border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <span className="mr-1">+ Área</span>
              <ChevronDown size={10} className={`transition-transform ${showDropdown === 'area' ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Executive Badge */}
          {client.assignedExecutive ? (
            renderDropdown('assignedExecutive', client.assignedExecutive, executiveOptions, getExecutiveLabel, getExecutiveColor)
          ) : (
            <button
              ref={executiveRef}
              onClick={(e) => {
                e.stopPropagation()
                const isOpen = showDropdown === 'assignedExecutive'
                if (!isOpen && executiveRef.current) {
                  const rect = executiveRef.current.getBoundingClientRect()
                  const dropdownWidth = 160
                  const maxDropdownHeight = 200
                  
                  let top = rect.bottom + 8
                  let left = rect.left

                  if (left + dropdownWidth > window.innerWidth) {
                    left = window.innerWidth - dropdownWidth - 16
                  }
                  if (left < 16) {
                    left = 16
                  }
                  if (top + maxDropdownHeight > window.innerHeight) {
                    top = rect.top - maxDropdownHeight - 8
                  }
                  if (top < 16) {
                    top = 16
                  }

                  setDropdownPosition({ top, left })
                }
                setShowDropdown(isOpen ? null : 'assignedExecutive')
              }}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer bg-gray-100 text-gray-700 border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <span className="mr-1">+ Ejecutivo</span>
              <ChevronDown size={10} className={`transition-transform ${showDropdown === 'assignedExecutive' ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Coordinator Badge */}
          {client.coordinator ? (
            <button
              ref={coordinatorRef}
              onClick={(e) => {
                e.stopPropagation()
                const isOpen = showDropdown === 'coordinator'
                if (!isOpen && coordinatorRef.current) {
                  const rect = coordinatorRef.current.getBoundingClientRect()
                  const dropdownWidth = 160
                  const maxDropdownHeight = 200
                  
                  let top = rect.bottom + 8
                  let left = rect.left

                  if (left + dropdownWidth > window.innerWidth) {
                    left = window.innerWidth - dropdownWidth - 16
                  }
                  if (left < 16) {
                    left = 16
                  }
                  if (top + maxDropdownHeight > window.innerHeight) {
                    top = rect.top - maxDropdownHeight - 8
                  }
                  if (top < 16) {
                    top = 16
                  }

                  setDropdownPosition({ top, left })
                }
                setShowDropdown(isOpen ? null : 'coordinator')
              }}
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer hover:shadow-sm transition-all duration-200 ${getCoordinatorColor(client.coordinator)}`}
            >
              <span className="mr-1 truncate">{getCoordinatorLabel(client.coordinator)}</span>
              <ChevronDown size={10} className={`transition-transform flex-shrink-0 ${showDropdown === 'coordinator' ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button
              ref={coordinatorRef}
              onClick={(e) => {
                e.stopPropagation()
                const isOpen = showDropdown === 'coordinator'
                if (!isOpen && coordinatorRef.current) {
                  const rect = coordinatorRef.current.getBoundingClientRect()
                  const dropdownWidth = 160
                  const maxDropdownHeight = 200
                  
                  let top = rect.bottom + 8
                  let left = rect.left

                  if (left + dropdownWidth > window.innerWidth) {
                    left = window.innerWidth - dropdownWidth - 16
                  }
                  if (left < 16) {
                    left = 16
                  }
                  if (top + maxDropdownHeight > window.innerHeight) {
                    top = rect.top - maxDropdownHeight - 8
                  }
                  if (top < 16) {
                    top = 16
                  }

                  setDropdownPosition({ top, left })
                }
                setShowDropdown(isOpen ? null : 'coordinator')
              }}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer bg-gray-100 text-gray-700 border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <span className="mr-1">+ Coordinador</span>
              <ChevronDown size={10} className={`transition-transform ${showDropdown === 'coordinator' ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
        
        {/* Dropdown para Type */}
        {showDropdown === 'type' && createPortal(
          <>
            <div 
              className={`fixed inset-0 ${getZIndexClass('DROPDOWN')}`}
              onClick={() => setShowDropdown(null)}
            />
            <div 
              className={`fixed w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg ${getZIndexClass('DROPDOWN')} py-1`}
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDropdownChange('type', option.value)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    client.type === option.value 
                      ? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500 text-gray-900 dark:text-white" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
        
        {/* Dropdown para Area */}
        {showDropdown === 'area' && createPortal(
          <>
            <div 
              className={`fixed inset-0 ${getZIndexClass('DROPDOWN')}`}
              onClick={() => setShowDropdown(null)}
            />
            <div 
              className={`fixed w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg ${getZIndexClass('DROPDOWN')} py-1`}
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
              {areaOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDropdownChange('area', option.value)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    client.area === option.value 
                      ? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500 text-gray-900 dark:text-white" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
        
        {/* Dropdown para Executive */}
        {showDropdown === 'assignedExecutive' && createPortal(
          <>
            <div 
              className={`fixed inset-0 ${getZIndexClass('DROPDOWN')}`}
              onClick={() => setShowDropdown(null)}
            />
            <div 
              className={`fixed w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg ${getZIndexClass('DROPDOWN')} py-1`}
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
              {executiveOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDropdownChange('assignedExecutive', option.value)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    client.assignedExecutive === option.value 
                      ? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500 text-gray-900 dark:text-white" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>,
          document.body
        )}

        {/* Dropdown para Coordinator */}
        {showDropdown === 'coordinator' && createPortal(
          <>
            <div 
              className={`fixed inset-0 ${getZIndexClass('DROPDOWN')}`}
              onClick={() => setShowDropdown(null)}
            />
            <div 
              className={`fixed w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg ${getZIndexClass('DROPDOWN')} py-1`}
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
              {coordinatorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDropdownChange('coordinator', option.value)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    client.coordinator === option.value 
                      ? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500 text-gray-900 dark:text-white" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
      </div>

      {/* Contact Info */}
      <div className="px-6 pb-4 space-y-2 flex-1">
        {(client.email || editingField === 'email') && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Mail size={14} className="mr-2 flex-shrink-0" />
            <span className="flex-1 min-w-0">
              {renderEditableField('email', client.email || '', 'email@ejemplo.com')}
            </span>
          </div>
        )}
        {(client.phone || editingField === 'phone') && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Phone size={14} className="mr-2 flex-shrink-0" />
            <span className="flex-1 min-w-0">
              {renderEditableField('phone', client.phone || '', '+34 666 777 888')}
            </span>
          </div>
        )}

        {/* Número de invitados */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Users size={14} className="mr-2 flex-shrink-0" />
          <span className="flex-1 min-w-0">
            {renderEditableField('guestCount', client.guestCount?.toString() || '', 'Número de invitados')}
          </span>
        </div>
      </div>

      {/* Notes Preview */}
      {(client.notes || editingField === 'notes') && (
        <div className="px-6 pb-4">
          <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
            <FileText size={14} className="mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              {renderEditableField('notes', client.notes || '', 'Agregar notas...', 'textarea', 'min-h-[60px] resize-none')}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-xl">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            {client.channel && (
              <div className="flex items-center">
                {renderDropdown('channel', client.channel, channelOptions, getChannelLabel, getChannelColor)}
              </div>
            )}
            <div className="flex items-center">
              <Clock size={12} className="mr-1 flex-shrink-0" />
              <span>{formatDate(client.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar rendered via portal to body */}
      {showCalendar && client.eventDate && typeof window !== 'undefined' && createPortal(
        <div 
          ref={calendarRef}
          className={`fixed ${getZIndexClass('DROPDOWN')} shadow-2xl`}
          style={{ 
            top: `${calendarPosition.top}px`,
            left: `${calendarPosition.left}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <CalendarPicker
            selectedDate={client.eventDate}
            onDateSelect={handleDateChange}
            onClose={() => setShowCalendar(false)}
          />
        </div>,
        document.body
      )}
    </div>
  )
}
