'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, UserPlus, Calendar, MapPin, User } from 'lucide-react'
import { Client, ClientArea, ClientExecutive } from '@/types'
import { cn } from '@/lib/utils'
import { CalendarPicker } from '@/components/ui/calendar-picker'
import { Z_INDEX_LAYERS, getZIndexClass } from '@/lib/z-index-layers'

// Tipos específicos para el modal
interface CreateClientData {
  name: string
  eventDate?: Date
  area?: ClientArea
  assignedTo?: ClientExecutive
}

interface CreateClientModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateClient: (data: CreateClientData) => void
}

// Opciones para áreas - EXACTOS del sistema existente
const areaOptions = [
  { value: 'CASANUEVA' as ClientArea, label: 'Casanueva' },
  { value: 'CASA_MUNECAS' as ClientArea, label: 'Casa de Muñecas' },
  { value: 'ATRIO' as ClientArea, label: 'Atrio' },
  { value: 'CABANAS' as ClientArea, label: 'Cabañas' }
]

// Opciones para ejecutivos - EXACTOS del sistema existente
const executiveOptions = [
  { value: 'YARLENY_COLIN', label: 'Yarleny Colín' },
  { value: 'JOSEFO_FLORES', label: 'Josefo Flores' },
  { value: 'SEBASTIAN_RAMIREZ', label: 'Sebastián Ramírez' }
]

export function CreateClientModal({ isOpen, onClose, onCreateClient }: CreateClientModalProps) {
  const [formData, setFormData] = useState<CreateClientData>({
    name: '',
    eventDate: undefined,
    area: undefined,
    assignedTo: undefined
  })
  
  const [showAreaDropdown, setShowAreaDropdown] = useState(false)
  const [showExecutiveDropdown, setShowExecutiveDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  
  const nameInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const dateButtonRef = useRef<HTMLButtonElement>(null)
  const areaButtonRef = useRef<HTMLButtonElement>(null)
  const executiveButtonRef = useRef<HTMLButtonElement>(null)

  // Estado para posiciones de dropdowns
  const [dropdownPositions, setDropdownPositions] = useState({
    date: { top: 0, left: 0, width: 0 },
    area: { top: 0, left: 0, width: 0 },
    executive: { top: 0, left: 0, width: 0 }
  })

  // Calcular posición de dropdown
  const calculateDropdownPosition = (buttonRef: React.RefObject<HTMLButtonElement | null>) => {
    if (!buttonRef.current) return { top: 0, left: 0, width: 0 }
    
    const rect = buttonRef.current.getBoundingClientRect()
    return {
      top: rect.bottom + window.scrollY + 8, // 8px de margen
      left: rect.left + window.scrollX,
      width: rect.width
    }
  }

  // Actualizar posiciones cuando se abren los dropdowns
  useEffect(() => {
    if (showDatePicker && dateButtonRef.current) {
      setDropdownPositions(prev => ({
        ...prev,
        date: calculateDropdownPosition(dateButtonRef)
      }))
    }
  }, [showDatePicker])

  useEffect(() => {
    if (showAreaDropdown && areaButtonRef.current) {
      setDropdownPositions(prev => ({
        ...prev,
        area: calculateDropdownPosition(areaButtonRef)
      }))
    }
  }, [showAreaDropdown])

  useEffect(() => {
    if (showExecutiveDropdown && executiveButtonRef.current) {
      setDropdownPositions(prev => ({
        ...prev,
        executive: calculateDropdownPosition(executiveButtonRef)
      }))
    }
  }, [showExecutiveDropdown])

  // Focus en el input cuando se abre el modal
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [isOpen])

  // Cerrar con Escape y clic fuera
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Verificar si el clic es en un dropdown (portales)
      const isClickOnDropdownContent = target.closest('.dropdown-content')
      const isClickOnDropdownButton = target.closest('[data-dropdown]')
      
      // Si el clic es en contenido de dropdown, no hacer nada (permitir selección)
      if (isClickOnDropdownContent) {
        return
      }
      
      // Si el clic es dentro del modal pero no en botones de dropdown, cerrar dropdowns
      if (modalRef.current && modalRef.current.contains(target)) {
        if (!isClickOnDropdownButton) {
          setShowDatePicker(false)
          setShowAreaDropdown(false)
          setShowExecutiveDropdown(false)
        }
      }
      // Si el clic es completamente fuera del modal y no hay dropdowns, cerrar modal
      else if (modalRef.current && !modalRef.current.contains(target) && !isClickOnDropdownContent) {
        if (!showDatePicker && !showAreaDropdown && !showExecutiveDropdown) {
          handleClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, showDatePicker, showAreaDropdown, showExecutiveDropdown])

  const handleClose = () => {
    setFormData({
      name: '',
      eventDate: undefined,
      area: undefined,
      assignedTo: undefined
    })
    setShowAreaDropdown(false)
    setShowExecutiveDropdown(false)
    setShowDatePicker(false)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      nameInputRef.current?.focus()
      return
    }

    onCreateClient(formData)
    handleClose()
  }

  const handleInputChange = (field: keyof CreateClientData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center ${getZIndexClass('MODAL_BACKDROP')} p-4`}>
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden ${getZIndexClass('MODAL_CONTENT')}`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-arrebol-terracota-50 to-arrebol-terracota-100 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-arrebol-terracota-500 rounded-full flex items-center justify-center">
                <UserPlus size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo Cliente</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Crear cliente rápidamente</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre - Campo requerido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User size={16} className="inline mr-2" />
              Nombre del Cliente *
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: María González"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-arrebol-terracota-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Fecha del Evento */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Fecha del Evento
            </label>
            <button
              ref={dateButtonRef}
              type="button"
              data-dropdown="date"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-arrebol-terracota-500 transition-all"
            >
              {formData.eventDate 
                ? formData.eventDate.toLocaleDateString('es-ES')
                : 'Seleccionar fecha'
              }
            </button>
          </div>

          {/* Área */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin size={16} className="inline mr-2" />
              Área
            </label>
            <button
              ref={areaButtonRef}
              type="button"
              data-dropdown="area"
              onClick={() => setShowAreaDropdown(!showAreaDropdown)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-arrebol-terracota-500 transition-all"
            >
              {formData.area 
                ? areaOptions.find(a => a.value === formData.area)?.label || formData.area
                : 'Seleccionar área'
              }
            </button>
          </div>

          {/* Ejecutivo */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User size={16} className="inline mr-2" />
              Ejecutivo Asignado
            </label>
            <button
              ref={executiveButtonRef}
              type="button"
              data-dropdown="executive"
              onClick={() => setShowExecutiveDropdown(!showExecutiveDropdown)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-arrebol-terracota-500 transition-all"
            >
              {formData.assignedTo 
                ? executiveOptions.find(e => e.value === formData.assignedTo)?.label || formData.assignedTo
                : 'Seleccionar ejecutivo'
              }
            </button>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className="flex-1 px-4 py-3 bg-arrebol-terracota-500 hover:bg-arrebol-terracota-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              Crear Cliente
            </button>
          </div>
        </form>
      </div>

      {/* Portales para dropdowns - renderizados fuera del modal */}
      {showDatePicker && (
        <>
          {createPortal(
            <div 
              className={`fixed dropdown-content ${getZIndexClass('MODAL_CALENDAR')}`}
              style={{ 
                top: dropdownPositions.date.top,
                left: dropdownPositions.date.left,
                zIndex: 1040 
              }}
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                <CalendarPicker
                  selectedDate={formData.eventDate || new Date()}
                  onDateSelect={(date: Date) => {
                    handleInputChange('eventDate', date)
                    setShowDatePicker(false)
                  }}
                  onClose={() => setShowDatePicker(false)}
                />
              </div>
            </div>,
            document.body
          )}
        </>
      )}

      {showAreaDropdown && (
        <>
          {createPortal(
            <div 
              className={`fixed dropdown-content ${getZIndexClass('MODAL_CALENDAR')}`}
              style={{ 
                top: dropdownPositions.area.top,
                left: dropdownPositions.area.left,
                width: dropdownPositions.area.width,
                zIndex: 1040 
              }}
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {areaOptions.map((area) => (
                  <button
                    key={area.value}
                    type="button"
                    onClick={() => {
                      handleInputChange('area', area.value)
                      setShowAreaDropdown(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-arrebol-terracota-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </div>,
            document.body
          )}
        </>
      )}

      {showExecutiveDropdown && (
        <>
          {createPortal(
            <div 
              className={`fixed dropdown-content ${getZIndexClass('MODAL_CALENDAR')}`}
              style={{ 
                top: dropdownPositions.executive.top,
                left: dropdownPositions.executive.left,
                width: dropdownPositions.executive.width,
                zIndex: 1040 
              }}
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {executiveOptions.map((executive) => (
                  <button
                    key={executive.value}
                    type="button"
                    onClick={() => {
                      handleInputChange('assignedTo', executive.value)
                      setShowExecutiveDropdown(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-arrebol-terracota-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    {executive.label}
                  </button>
                ))}
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  )
}
