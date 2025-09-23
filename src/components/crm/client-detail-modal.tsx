'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  X, Calendar, Phone, Mail, Users, FileText, Clock, ChevronDown, 
  MoreHorizontal, Archive, Trash2, Expand, Send, Star, MessageCircle,
  Trash, Edit, Check, AlertCircle
} from 'lucide-react'
import { Client, ClientStatus, ClientPriority, ClientType, ClientArea, ClientChannel, ClientExecutive, ClientCoordinator } from '@/types'
import { useActivityLog } from '@/contexts/activity-log-context'
import { useComments } from '@/contexts/comments-context'
import { formatPhoneNumber } from '@/lib/utils'
import { generateExecutiveOptions, generateCoordinatorOptions } from '@/lib/user-management'

interface ClientDetailModalProps {
  client: Client
  isOpen: boolean
  onClose: () => void
  onUpdate: (client: Client) => void
}

export function ClientDetailModal({ client, isOpen, onClose, onUpdate }: ClientDetailModalProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [activeTab, setActiveTab] = useState<'activity' | 'comments'>('activity')

  // Estados para comentarios
  const [newComment, setNewComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isImportant, setIsImportant] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState('')

  // Hooks para contextos
  const { getClientLogs, addLog } = useActivityLog()
  const { getClientComments, addComment, deleteComment, updateComment, toggleImportant, canEditComment, canDeleteComment } = useComments()

  // Refs para los dropdowns
  const statusRef = useRef<HTMLButtonElement>(null)
  const priorityRef = useRef<HTMLButtonElement>(null)
  const typeRef = useRef<HTMLButtonElement>(null)
  const areaRef = useRef<HTMLButtonElement>(null)
  const channelRef = useRef<HTMLButtonElement>(null)
  const executiveRef = useRef<HTMLButtonElement>(null)
  const coordinatorRef = useRef<HTMLButtonElement>(null)

  if (!isOpen) return null

  // Obtener datos del cliente específico
  const clientLogs = getClientLogs(client.id)
  const clientComments = getClientComments(client.id)

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Función para calcular posición del dropdown
  const calculateDropdownPosition = (buttonRef: React.RefObject<HTMLButtonElement | null>) => {
    if (!buttonRef.current) return { top: 0, left: 0 }
    
    const rect = buttonRef.current.getBoundingClientRect()
    return {
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX
    }
  }

  // Funciones helper para formatear fechas
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    })
  }

  // Función para formatear tiempo restante para editar
  const formatEditTimeRemaining = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const editTimeLimit = 24 * 60 * 60 * 1000 // 24 horas en ms
    const remainingMs = editTimeLimit - diffInMs
    
    if (remainingMs <= 0) return null
    
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60))
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (remainingHours > 0) {
      return `Editable por ${remainingHours}h ${remainingMinutes}m más`
    } else {
      return `Editable por ${remainingMinutes}m más`
    }
  }

  // Función para formatear tiempo relativo
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return 'Hace un momento'
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`
    if (diffInHours < 24) return `Hace ${diffInHours}h`
    if (diffInDays < 7) return `Hace ${diffInDays}d`
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Funciones para manejar comentarios
  const handleAddComment = () => {
    if (!newComment.trim()) return
    
    addComment(client.id, newComment, 'Anthony Cazares', isInternal, isImportant)
    setNewComment('')
    setIsInternal(false)
    setIsImportant(false)
  }

  const handleStartEdit = (commentId: string, currentText: string) => {
    setEditingComment(commentId)
    setEditCommentText(currentText)
  }

  const handleSaveEdit = () => {
    if (editingComment && editCommentText.trim()) {
      updateComment(editingComment, editCommentText)
      setEditingComment(null)
      setEditCommentText('')
    }
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditCommentText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editingComment) {
        handleSaveEdit()
      } else {
        handleAddComment()
      }
    }
  }

  // Opciones para dropdowns (usando los tipos correctos)
  const statusOptions = [
    { value: 'NUEVO_CONTACTO' as ClientStatus, label: 'Nuevo Contacto' },
    { value: 'ASIGNADO' as ClientStatus, label: 'Asignado' },
    { value: 'RECORRIDO_PROGRAMADO' as ClientStatus, label: 'Recorrido Programado' },
    { value: 'CLIENTE_CONTACTADO' as ClientStatus, label: 'Cliente Contactado' },
    { value: 'CERRADO_VENTA' as ClientStatus, label: 'Cerrado Venta' },
    { value: 'CERRADO_SIN_EXITO' as ClientStatus, label: 'Cerrado Sin Éxito' }
  ]

  const priorityOptions = [
    { value: 'HIGH' as ClientPriority, label: 'Alta' },
    { value: 'NORMAL' as ClientPriority, label: 'Media' },
    { value: 'LOW' as ClientPriority, label: 'Baja' }
  ]

  const typeOptions = [
    { value: 'WEDDING' as ClientType, label: 'Boda' },
    { value: 'CORPORATE' as ClientType, label: 'Corporativo' },
    { value: 'QUINCEANOS' as ClientType, label: 'Quinceaños' },
    { value: 'BAUTIZO' as ClientType, label: 'Bautizo' },
    { value: 'COMUNION' as ClientType, label: 'Comunión' },
    { value: 'SOCIAL' as ClientType, label: 'Social' },
    { value: 'OTHER' as ClientType, label: 'Otro' }
  ]

  const areaOptions = [
    { value: 'CASANUEVA' as ClientArea, label: 'Casanueva' },
    { value: 'CASA_MUNECAS' as ClientArea, label: 'Casa de Muñecas' },
    { value: 'ATRIO' as ClientArea, label: 'Atrio' },
    { value: 'CABANAS' as ClientArea, label: 'Cabañas' }
  ]

  const channelOptions = [
    { value: 'INSTAGRAM' as ClientChannel, label: 'Instagram' },
    { value: 'FACEBOOK' as ClientChannel, label: 'Facebook' },
    { value: 'WHATSAPP_SOCIAL' as ClientChannel, label: 'WhatsApp' },
    { value: 'EMAIL' as ClientChannel, label: 'Email' },
    { value: 'PHONE' as ClientChannel, label: 'Teléfono' },
    { value: 'WALKING' as ClientChannel, label: 'Visita' },
    { value: 'REFERRAL' as ClientChannel, label: 'Referido' },
    { value: 'RECURRENT' as ClientChannel, label: 'Recurrente' },
    { value: 'BODAS_COM' as ClientChannel, label: 'Bodas.com' },
    { value: 'HACIENDAS_BODAS_COM' as ClientChannel, label: 'Haciendas Bodas.com' }
  ]

  // Generar opciones dinámicamente desde el sistema de usuarios
  const executiveOptions = generateExecutiveOptions()
  const coordinatorOptions = generateCoordinatorOptions()

  // Funciones para obtener estilos de badges (actualizadas con tipos correctos)
  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case 'NUEVO_CONTACTO': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'ASIGNADO': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'RECORRIDO_PROGRAMADO': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'CLIENTE_CONTACTADO': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'CERRADO_VENTA': return 'bg-green-100 text-green-700 border-green-300'
      case 'CERRADO_SIN_EXITO': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getPriorityColor = (priority: ClientPriority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-300'
      case 'NORMAL': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'LOW': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getTypeColor = (type: ClientType) => {
    switch (type) {
      case 'WEDDING': return 'bg-pink-100 text-pink-700 border-pink-300'
      case 'CORPORATE': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'QUINCEANOS': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'BAUTIZO': return 'bg-indigo-100 text-indigo-700 border-indigo-300'
      case 'COMUNION': return 'bg-teal-100 text-teal-700 border-teal-300'
      case 'SOCIAL': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'OTHER': return 'bg-gray-100 text-gray-700 border-gray-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getAreaColor = (area: ClientArea) => {
    switch (area) {
      case 'CASANUEVA': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'CASA_MUNECAS': return 'bg-pink-100 text-pink-700 border-pink-300'
      case 'ATRIO': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'CABANAS': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getChannelColor = (channel: ClientChannel) => {
    switch (channel) {
      case 'INSTAGRAM': return 'bg-gradient-to-r from-purple-400 to-pink-400 text-white border-transparent'
      case 'FACEBOOK': return 'bg-blue-600 text-white border-transparent'
      case 'WHATSAPP_SOCIAL': return 'bg-green-600 text-white border-transparent'
      case 'EMAIL': return 'bg-cyan-100 text-cyan-700 border-cyan-300'
      case 'PHONE': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'WALKING': return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'REFERRAL': return 'bg-emerald-100 text-emerald-700 border-emerald-300'
      case 'RECURRENT': return 'bg-violet-100 text-violet-700 border-violet-300'
      case 'BODAS_COM': return 'bg-rose-100 text-rose-700 border-rose-300'
      case 'HACIENDAS_BODAS_COM': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getExecutiveColor = (executive: ClientExecutive) => {
    switch (executive) {
      case 'YARLENY_COLIN': return 'bg-green-100 text-green-700 border-green-300'
      case 'JOSEFO_FLORES': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'SEBASTIAN_RAMIREZ': return 'bg-purple-100 text-purple-700 border-purple-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  // Funciones para obtener labels
  const getStatusLabel = (status: ClientStatus) => statusOptions.find(opt => opt.value === status)?.label || status
  const getPriorityLabel = (priority: ClientPriority) => priorityOptions.find(opt => opt.value === priority)?.label || priority
  const getTypeLabel = (type: ClientType) => typeOptions.find(opt => opt.value === type)?.label || type
  const getAreaLabel = (area: ClientArea) => areaOptions.find(opt => opt.value === area)?.label || area
  const getChannelLabel = (channel: ClientChannel) => channelOptions.find(opt => opt.value === channel)?.label || channel
  const getExecutiveLabel = (executive: ClientExecutive) => executiveOptions.find(opt => opt.value === executive)?.label || executive

  const getCoordinatorColor = (coordinator: ClientCoordinator) => {
    switch (coordinator) {
      case 'BRENDA': return 'bg-rose-100 text-rose-700 border-rose-300'
      case 'ANETTH': return 'bg-sky-100 text-sky-700 border-sky-300'
      case 'ANDREA': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'HUGO': return 'bg-teal-100 text-teal-700 border-teal-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getCoordinatorLabel = (coordinator: ClientCoordinator) => coordinatorOptions.find(opt => opt.value === coordinator)?.label || coordinator

  // Funciones para manejo de edición y sincronización
  const handleFieldEdit = (fieldName: string, currentValue: string) => {
    setEditingField(fieldName)
    setTempValue(currentValue || '')
  }

  // Manejar teclas en campos editables
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleFieldSave(fieldName)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleFieldCancel()
    }
  }

  const handleFieldSave = (fieldName: string) => {
    let finalValue: any = tempValue
    
    if (fieldName === 'guestCount') {
      finalValue = tempValue ? parseInt(tempValue) : undefined
    }
    
    const updatedClient = { ...client, [fieldName]: finalValue }
    onUpdate(updatedClient)
    
    setEditingField(null)
    setTempValue('')
  }

  const handleFieldCancel = () => {
    setEditingField(null)
    setTempValue('')
  }

  const handleDropdownChange = (field: string, value: any) => {
    const oldValue = client[field as keyof Client]
    const updatedClient = { ...client, [field]: value }
    
    // Generar mensaje formateado para el log
    const getFieldLabel = (fieldName: string) => {
      switch (fieldName) {
        case 'status': return 'Estado'
        case 'priority': return 'Prioridad'
        case 'type': return 'Tipo'
        case 'area': return 'Área'
        case 'channel': return 'Canal'
        case 'assignedExecutive': return 'Ejecutivo Asignado'
        case 'coordinator': return 'Coordinador'
        default: return fieldName
      }
    }

    const getValueLabel = (fieldName: string, val: any) => {
      switch (fieldName) {
        case 'status':
          return statusOptions.find(opt => opt.value === val)?.label || val
        case 'priority':
          return priorityOptions.find(opt => opt.value === val)?.label || val
        case 'type':
          return typeOptions.find(opt => opt.value === val)?.label || val
        case 'area':
          return areaOptions.find(opt => opt.value === val)?.label || val
        case 'channel':
          return channelOptions.find(opt => opt.value === val)?.label || val
        case 'assignedExecutive':
          return executiveOptions.find(opt => opt.value === val)?.label || val
        case 'coordinator':
          return coordinatorOptions.find(opt => opt.value === val)?.label || val
        default:
          return val
      }
    }

    const fieldLabel = getFieldLabel(field)
    const oldValueLabel = getValueLabel(field, oldValue)
    const newValueLabel = getValueLabel(field, value)
    
    // Solo registrar si el valor realmente cambió
    if (oldValue !== value) {
      const formattedMessage = `${fieldLabel} cambiado de ${oldValueLabel} a ${newValueLabel}`
      
      // Registrar en el log de actividad
      addLog(
        client.id,
        field,
        oldValue,
        value,
        formattedMessage,
        'Anthony Cazares' // Usuario actual - aquí podrías usar un contexto de usuario
      )
    }
    
    onUpdate(updatedClient)
    setShowDropdown(null)
  }

  // Función para renderizar campos editables
  const renderEditableField = (fieldName: string, value: string, placeholder: string, type: string = 'input', className: string = '') => {
    if (editingField === fieldName) {
      if (type === 'textarea') {
        return (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, fieldName)}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none ${className}`}
            placeholder={placeholder}
            rows={3}
            autoFocus
            onFocus={(e) => e.target.select()}
            onBlur={() => handleFieldSave(fieldName)}
          />
        )
      } else {
        return (
          <input
            type={type === 'number' ? 'number' : 'text'}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, fieldName)}
            className={`w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
            placeholder={placeholder}
            autoFocus
            onFocus={(e) => e.target.select()}
            onBlur={() => handleFieldSave(fieldName)}
            min={type === 'number' ? "1" : undefined}
          />
        )
      }
    } else {
      return (
        <span
          onClick={() => handleFieldEdit(fieldName, value)}
          className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded px-1 py-0.5 transition-colors block w-full ${className} ${!value ? 'text-gray-400 italic' : ''}`}
        >
          {fieldName === 'phone' && value ? formatPhoneNumber(value) : (value || placeholder)}
        </span>
      )
    }
  }

  // Función para renderizar dropdowns editables
  const renderEditableDropdown = (field: string, value: any, options: any[], getLabel: (val: any) => string, getColor: (val: any) => string) => {
    const buttonRef = field === 'status' ? statusRef 
                    : field === 'priority' ? priorityRef
                    : field === 'type' ? typeRef 
                    : field === 'area' ? areaRef 
                    : field === 'channel' ? channelRef
                    : field === 'assignedExecutive' ? executiveRef 
                    : field === 'coordinator' ? coordinatorRef 
                    : undefined
    
    if (value) {
      return (
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation()
            const isOpen = showDropdown === field
            if (!isOpen && buttonRef) {
              const position = calculateDropdownPosition(buttonRef)
              setDropdownPosition(position)
            }
            setShowDropdown(isOpen ? null : field)
          }}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer hover:shadow-sm transition-all duration-200 ${getColor(value)}`}
        >
          <span className="mr-1">{getLabel(value)}</span>
          <ChevronDown size={10} className={`transition-transform ${showDropdown === field ? 'rotate-180' : ''}`} />
        </button>
      )
    } else {
      return (
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation()
            const isOpen = showDropdown === field
            if (!isOpen && buttonRef) {
              const position = calculateDropdownPosition(buttonRef)
              setDropdownPosition(position)
            }
            setShowDropdown(isOpen ? null : field)
          }}
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer bg-gray-100 text-gray-700 border-gray-300 hover:shadow-sm transition-all duration-200"
        >
          <span className="mr-1">+ {
            field === 'status' ? 'Estado' 
            : field === 'priority' ? 'Prioridad'
            : field === 'type' ? 'Tipo' 
            : field === 'area' ? 'Área' 
            : field === 'channel' ? 'Canal'
            : field === 'assignedExecutive' ? 'Ejecutivo'
            : field === 'coordinator' ? 'Coordinador'
            : 'Campo'
          }</span>
          <ChevronDown size={10} className={`transition-transform ${showDropdown === field ? 'rotate-180' : ''}`} />
        </button>
      )
    }
  }

  // Función para renderizar dropdowns de solo lectura (para los badges que ya tienen valor)
  const renderDropdown = (field: string, value: any, options: any[], getLabel: (val: any) => string, getColor: (val: any) => string) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getColor(value)}`}>
        {getLabel(value)}
      </span>
    )
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con X para cerrar */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Detalles del Cliente
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body - Two Columns 60%-40% */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Panel - 60% - Datos del cliente (copiados de la tarjeta) */}
          <div className="w-3/5 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            
            {/* Réplica exacta de la tarjeta */}
            <div className="bg-white dark:bg-gray-800 group">
              {/* Header (copiado de client-card) */}
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="flex items-start flex-1">
                  {/* Client Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {client.name}
                    </h3>
                    {client.eventDate && (
                      <div className="relative">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha del Evento</p>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5 flex items-center">
                          <Calendar size={14} className="mr-1 flex-shrink-0" />
                          {formatDate(client.eventDate)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags Row (con funcionalidad editable) */}
              <div className="px-6 pb-4">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">Información del Evento</p>
                
                {/* Two Column Layout for Event Information */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-3">
                    {/* Status Badge (editable) */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estado</p>
                      {renderEditableDropdown('status', client.status, statusOptions, getStatusLabel, getStatusColor)}
                    </div>
                    {/* Type Badge (editable) */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tipo de Evento</p>
                      {renderEditableDropdown('type', client.type, typeOptions, getTypeLabel, getTypeColor)}
                    </div>
                    {/* Executive Badge (editable) */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ejecutivo Asignado</p>
                      {renderEditableDropdown('assignedExecutive', client.assignedExecutive, executiveOptions, getExecutiveLabel, getExecutiveColor)}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    {/* Priority Badge (editable) */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prioridad</p>
                      {renderEditableDropdown('priority', client.priority, priorityOptions, getPriorityLabel, getPriorityColor)}
                    </div>
                    {/* Area Badge (editable) */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Área</p>
                      {renderEditableDropdown('area', client.area, areaOptions, getAreaLabel, getAreaColor)}
                    </div>
                    {/* Coordinator Badge (editable) */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Coordinador</p>
                      {renderEditableDropdown('coordinator', client.coordinator, coordinatorOptions, getCoordinatorLabel, getCoordinatorColor)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info (editable) */}
              <div className="px-6 pb-4 space-y-4 flex-1">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">Información de Contacto</p>
                
                {/* Email */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail size={14} className="mr-2 flex-shrink-0" />
                    <span className="flex-1 min-w-0">
                      {renderEditableField('email', client.email || '', 'email@ejemplo.com')}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone size={14} className="mr-2 flex-shrink-0" />
                    <span className="flex-1 min-w-0">
                      {renderEditableField('phone', client.phone || '', '+34 666 777 888')}
                    </span>
                  </div>
                </div>

                {/* Guest Count */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Número de Invitados</p>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users size={14} className="mr-2 flex-shrink-0" />
                    <span className="flex-1 min-w-0">
                      {renderEditableField('guestCount', client.guestCount?.toString() || '', 'Número de invitados', 'number')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes Preview (editable) */}
              <div className="px-6 pb-4">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">Notas y Comentarios</p>
                <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <FileText size={14} className="mr-2 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    {renderEditableField('notes', client.notes || '', 'Agregar notas...', 'textarea')}
                  </div>
                </div>
              </div>

              {/* Footer (copiado de client-card) */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Canal</p>
                      <div className="flex items-center">
                        {renderEditableDropdown('channel', client.channel, channelOptions, getChannelLabel, getChannelColor)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha de Creación</p>
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1 flex-shrink-0" />
                        <span>{formatDate(client.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - 40% - Tabs: Actividad y Comentarios */}
          <div className="w-2/5 flex flex-col bg-gray-50/80 dark:bg-gray-800/50">
            {/* Botones minimalistas de tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'activity'
                    ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white bg-white dark:bg-gray-700'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                REGISTRO DE ACTIVIDAD
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'comments'
                    ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white bg-white dark:bg-gray-700'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                COMENTARIOS
              </button>
            </div>

            {/* Contenido de los tabs */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {clientLogs.length > 0 ? (
                    clientLogs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {log.formattedMessage}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(log.timestamp)}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              por {log.changedBy}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No hay actividad registrada
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        Los cambios en este cliente aparecerán aquí
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="flex flex-col h-full">
                  {/* Lista de comentarios */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {clientComments.length > 0 ? (
                      clientComments.map((comment) => (
                        <div key={comment.id} className={`p-3 rounded-lg ${
                          comment.isInternal 
                            ? 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' 
                            : 'bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-2 flex-1">
                              {comment.isImportant && (
                                <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" />
                              )}
                              <MessageCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                comment.isInternal ? 'text-amber-600' : 'text-blue-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                {editingComment === comment.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      onKeyPress={handleKeyPress}
                                      className="w-full p-2 text-sm border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      rows={2}
                                      autoFocus
                                    />
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={handleSaveEdit}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                      >
                                        <Check size={12} className="mr-1" />
                                        Guardar
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                    {comment.content}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex flex-col space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatRelativeTime(comment.timestamp)}
                                      </span>
                                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {comment.author}
                                      </span>
                                      {comment.isInternal && (
                                        <>
                                          <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                            Privado
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    {canEditComment(comment) && formatEditTimeRemaining(comment.timestamp) && (
                                      <span className="text-xs text-green-600 dark:text-green-400">
                                        {formatEditTimeRemaining(comment.timestamp)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => toggleImportant(comment.id)}
                                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                        comment.isImportant ? 'text-yellow-500' : 'text-gray-400'
                                      }`}
                                      title={comment.isImportant ? 'Quitar importancia' : 'Marcar como importante'}
                                    >
                                      <Star size={12} fill={comment.isImportant ? 'currentColor' : 'none'} />
                                    </button>
                                    
                                    {canEditComment(comment) ? (
                                      <button
                                        onClick={() => handleStartEdit(comment.id, comment.content)}
                                        className="p-1 text-gray-400 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                        title="Editar comentario"
                                      >
                                        <Edit size={12} />
                                      </button>
                                    ) : (
                                      <button
                                        disabled
                                        className="p-1 text-gray-300 dark:text-gray-600 cursor-not-allowed rounded"
                                        title="No se puede editar (han pasado más de 24 horas)"
                                      >
                                        <Edit size={12} />
                                      </button>
                                    )}
                                    
                                    {canDeleteComment(comment) ? (
                                      <button
                                        onClick={() => deleteComment(comment.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                        title="Eliminar comentario"
                                      >
                                        <Trash size={12} />
                                      </button>
                                    ) : (
                                      <button
                                        disabled
                                        className="p-1 text-gray-300 dark:text-gray-600 cursor-not-allowed rounded"
                                        title="No se puede eliminar (han pasado más de 24 horas)"
                                      >
                                        <Trash size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No hay comentarios
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                          Agrega notas y observaciones sobre este cliente
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Formulario para agregar comentario */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe un comentario..."
                      className="w-full p-3 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      rows={2}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">Solo para mí</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">(privado)</span>
                        </label>
                        
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={isImportant}
                            onChange={(e) => setIsImportant(e.target.checked)}
                            className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">Importante</span>
                        </label>
                      </div>
                      
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={14} className="mr-2" />
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dropdowns con portales */}
        {showDropdown === 'status' && createPortal(
          <>
            <div 
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowDropdown(null)}
            />
            <div 
              className="fixed w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-[9999] py-1"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDropdownChange('status', option.value)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    client.status === option.value 
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

        {showDropdown === 'priority' && createPortal(
          <>
            <div 
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowDropdown(null)}
            />
            <div 
              className="fixed w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-[9999] py-1"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDropdownChange('priority', option.value)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    client.priority === option.value 
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

        {showDropdown === 'channel' && createPortal(
          <>
            <div 
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowDropdown(null)}
            />
            <div 
              className="fixed w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-[9999] py-1"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
              {channelOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDropdownChange('channel', option.value)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                    client.channel === option.value 
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

        {showDropdown === 'type' && createPortal(
          <>
            <div 
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowDropdown(null)}
            />
            <div 
              className="fixed w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-[9999] py-1"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDropdownChange('type', option.value)}
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

        {showDropdown === 'area' && createPortal(
          <>
            <div 
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowDropdown(null)}
            />
            <div 
              className="fixed w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-[9999] py-1"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
              {areaOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDropdownChange('area', option.value)}
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

        {showDropdown === 'assignedExecutive' && createPortal(
          <>
            <div 
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowDropdown(null)}
            />
            <div 
              className="fixed w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-[9999] py-1"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
              {executiveOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDropdownChange('assignedExecutive', option.value)}
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

        {showDropdown === 'coordinator' && createPortal(
          <>
            <div 
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowDropdown(null)}
            />
            <div 
              className="fixed w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-[9999] py-1"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left
              }}
            >
              {coordinatorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDropdownChange('coordinator', option.value)}
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
    </div>,
    document.body
  )
}
