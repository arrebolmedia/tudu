'use client'

import { Client, ClientStatus, ClientPriority, ClientType, ClientArea, ClientChannel, ClientExecutive } from '@/types'
import { 
	Calendar, 
	Flag, 
	Phone,
	Mail,
	Users,
	MapPin,
	User,
	Hash,
	ChevronDown,
	ChevronUp,
	ChevronLeft,
	ChevronRight,
	Circle,
	Play,
	CheckCircle as CheckCircleIcon,
	AlertCircle,
	Zap,
	Target,
	Heart,
	Building2,
	PartyPopper,
	Baby,
	GraduationCap,
	Briefcase,
	Camera,
	Edit3,
	Check,
	X,
	Maximize2,
	Expand,
	Crown,
	Archive,
	Trash2
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn, isToday, isTomorrow, isOverdue } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarPicker } from '@/components/ui/calendar-picker'
import { Z_INDEX_LAYERS } from '@/lib/z-index-layers'
import { 
	getStatusColor, getStatusLabel, 
	getPriorityColor, getPriorityLabel, 
	getAreaColor, getAreaLabel, 
	getTypeColor, getTypeLabel, 
	getChannelColor, getChannelLabel,
	getExecutiveColor, getExecutiveLabel,
	statusOptions, priorityOptions, areaOptions, typeOptions, channelOptions, executiveOptions
} from '@/lib/client-utils'

// Opciones para los campos CRM mantenidas para compatibilidad local
const CLIENT_STATUS_OPTIONS = [
	{ value: 'NUEVO_CONTACTO', label: 'Nuevo Contacto', color: '#8b5cf6', icon: Circle },
	{ value: 'ASIGNADO', label: 'Asignado', color: '#f59e0b', icon: Target },
	{ value: 'CLIENTE_CONTACTADO', label: 'Cliente Contactado', color: '#06b6d4', icon: Play },
	{ value: 'CERRADO_VENTA', label: 'Cerrado Venta', color: '#10b981', icon: CheckCircleIcon },
	{ value: 'CERRADO_SIN_EXITO', label: 'Cerrado Sin Éxito', color: '#ef4444', icon: AlertCircle }
] as const

const CLIENT_PRIORITY_OPTIONS = [
	{ value: 'LOW', label: 'Baja', color: '#6b7280' },
	{ value: 'NORMAL', label: 'Media', color: '#f59e0b' },
	{ value: 'HIGH', label: 'Alta', color: '#ef4444' }
] as const

const CLIENT_TYPE_OPTIONS = [
	{ value: 'WEDDING', label: 'Boda' },
	{ value: 'QUINCEANOS', label: 'XV Años' },
	{ value: 'BAUTIZO', label: 'Bautizo' },
	{ value: 'COMUNION', label: 'Comunión' },
	{ value: 'CORPORATE', label: 'Corporativo' },
	{ value: 'SOCIAL', label: 'Social' },
	{ value: 'OTHER', label: 'Otro' }
] as const

const CLIENT_AREA_OPTIONS = [
	{ value: 'CASANUEVA', label: 'Casanueva' },
	{ value: 'CASA_MUNECAS', label: 'Casa de Muñecas' },
	{ value: 'ATRIO', label: 'Atrio' },
	{ value: 'CABANAS', label: 'Cabañas' }
] as const

const CLIENT_CHANNEL_OPTIONS = [
	{ value: 'INSTAGRAM', label: 'Instagram' },
	{ value: 'FACEBOOK', label: 'Facebook' },
	{ value: 'WHATSAPP_SOCIAL', label: 'WhatsApp Social' },
	{ value: 'EMAIL', label: 'Email' },
	{ value: 'PHONE', label: 'Teléfono' },
	{ value: 'WALKING', label: 'Walk-in' },
	{ value: 'REFERRAL', label: 'Referido' },
	{ value: 'RECURRENT', label: 'Recurrente' },
	{ value: 'BODAS_COM', label: 'Bodas.com' },
	{ value: 'HACIENDAS_BODAS_COM', label: 'Haciendas Bodas.com' }
] as const

const CLIENT_EXECUTIVE_OPTIONS = [
	{ value: 'YARLENY_COLIN', label: 'Yarleny Colín' },
	{ value: 'JOSEFO_FLORES', label: 'Josefo Flores' },
	{ value: 'SEBASTIAN_RAMIREZ', label: 'Sebastián Ramírez' }
] as const

interface CrmListViewProps {
	clients: Client[]
	onUpdateClient: (clientId: string, updates: Partial<Client>) => void
	onOpenModal?: (client: Client) => void
	onDelete?: (clientId: string) => void
	onVip?: (clientId: string) => void
	onArchive?: (clientId: string) => void
	onCreateClient?: () => void
	sortBy: string
	sortOrder: 'asc' | 'desc'
	onSort: (field: string) => void
	// Props para manejar el borrador del placeholder
	isEditingPlaceholder?: boolean
	onPlaceholderKeyDown?: (e: React.KeyboardEvent) => void
	onPlaceholderBlur?: () => void
}

// Función para obtener el icono del estado
const getStatusIcon = (status: ClientStatus) => {
	const option = CLIENT_STATUS_OPTIONS.find(opt => opt.value === status)
	const IconComponent = option?.icon || Circle
	return <IconComponent className="w-3.5 h-3.5" />
}

// Función para formatear fechas
const formatEventDate = (date?: Date) => {
	if (!date) return 'Sin fecha'
	if (isToday(date)) return 'Hoy'
	if (isTomorrow(date)) return 'Mañana'
	return format(date, 'MMM d, yyyy', { locale: es })
}

// Función para obtener color de fecha
const getEventDateColor = (date?: Date) => {
	if (!date) return 'text-gray-400'
	if (isOverdue(date)) return 'text-red-600'
	if (isToday(date)) return 'text-arrebol-terracota-600'
	if (isTomorrow(date)) return 'text-orange-600'
	return 'text-gray-600'
}

export function CrmListView({
	clients,
	onUpdateClient,
	onOpenModal,
	onDelete,
	onVip,
	onArchive,
	onCreateClient,
	sortBy,
	sortOrder,
	onSort,
	isEditingPlaceholder,
	onPlaceholderKeyDown,
	onPlaceholderBlur
}: CrmListViewProps) {
	const [openDropdowns, setOpenDropdowns] = useState<Record<string, string | null>>({})
	const [editingClientId, setEditingClientId] = useState<string | null>(null)
	const [editingField, setEditingField] = useState<string | null>(null)
	const [editingValue, setEditingValue] = useState('')
	const [showCalendar, setShowCalendar] = useState(false)
	const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 })
	const [dropdownPositions, setDropdownPositions] = useState<Record<string, { top: number; left: number }>>({})
	
	// Estados para el menú contextual
	const [contextMenu, setContextMenu] = useState<{
		show: boolean
		x: number
		y: number
		clientId: string
	} | null>(null)
	
	// Estado para detectar cuando se está arrastrando (scroll)
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null)
	const [isScrolling, setIsScrolling] = useState(false)
	
	const editingInputRef = useRef<HTMLInputElement>(null)
	
	const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
		// Cargar anchos guardados de localStorage
		if (typeof window !== 'undefined') {
			try {
				const saved = localStorage.getItem('crmListColumnWidths_v2')
				if (saved) {
					return JSON.parse(saved)
				}
			} catch (error) {
				console.error('Error loading column widths:', error)
			}
		}
		
		// Valores por defecto
		return {
			name: 200,
			phone: 150,
			email: 200,
			eventDate: 150,
			type: 130,
			area: 140,
			status: 170,
			priority: 110,
			channel: 170,
			executive: 160,
			guestCount: 120,
			notes: 250,
			createdAt: 130,
			actions: 110
		}
	})
	const [isResizing, setIsResizing] = useState<string | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const headerRef = useRef<HTMLDivElement>(null)
	const [scrollPosition, setScrollPosition] = useState(0)
	const [maxScroll, setMaxScroll] = useState(0)

	// Guardar anchos de columna en localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('crmListColumnWidths_v2', JSON.stringify(columnWidths))
			} catch (error) {
				console.error('Error saving column widths:', error)
			}
		}
	}, [columnWidths])

	// Manejar scroll personalizado
	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		const updateScrollInfo = () => {
			const scrollLeft = container.scrollLeft
			const scrollWidth = container.scrollWidth
			const clientWidth = container.clientWidth
			const maxScrollLeft = scrollWidth - clientWidth

			setScrollPosition(scrollLeft)
			setMaxScroll(maxScrollLeft)

			// Sincronizar scroll del header usando ref
			if (headerRef.current) {
				headerRef.current.scrollLeft = scrollLeft
			}
		}

		updateScrollInfo()
		container.addEventListener('scroll', updateScrollInfo)
		
		const resizeObserver = new ResizeObserver(updateScrollInfo)
		resizeObserver.observe(container)

		return () => {
			container.removeEventListener('scroll', updateScrollInfo)
			resizeObserver.disconnect()
		}
	}, [clients, columnWidths])

	const handleCustomScrollbarDrag = (e: React.MouseEvent) => {
		if (!containerRef.current) return

		const scrollbar = e.currentTarget as HTMLElement
		const scrollbarRect = scrollbar.getBoundingClientRect()
		const container = containerRef.current

		const startX = e.clientX
		const startScrollLeft = container.scrollLeft

		const handleMouseMove = (e: MouseEvent) => {
			const deltaX = e.clientX - startX
			const scrollbarWidth = scrollbarRect.width
			const scrollRatio = deltaX / scrollbarWidth
			const newScrollLeft = startScrollLeft + (scrollRatio * maxScroll)
			
			container.scrollLeft = Math.max(0, Math.min(maxScroll, newScrollLeft))
		}

		const handleMouseUp = () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}

		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
	}

	const toggleDropdown = (clientId: string, dropdownType: string, element?: HTMLElement) => {
		setOpenDropdowns(prev => {
			// Si el dropdown actual está abierto, lo cerramos
			if (prev[clientId] === dropdownType) {
				// Cancelar la edición cuando se cierra el dropdown
				if (editingClientId === clientId) {
					cancelEditing()
				}
				return {
					...prev,
					[clientId]: null
				}
			}
			
			// Si no, cerramos todos y abrimos solo el solicitado
			const newState: Record<string, string | null> = {}
			Object.keys(prev).forEach(key => {
				newState[key] = null
			})
			newState[clientId] = dropdownType 	
			
			// Calcular posición si tenemos el elemento
			if (element) {
				const position = getDropdownPosition(element)
				setDropdownPositions(prevPos => ({
					...prevPos,
					[`${clientId}-${dropdownType}`]: position
				}))
			}
			
			return newState
		})
	}

	const closeDropdown = (clientId: string) => {
		setOpenDropdowns(prev => ({
			...prev,
			[clientId]: null
		}))
	}

	const closeAllDropdowns = () => {
		// Cancelar la edición cuando se cierran todos los dropdowns
		if (editingClientId) {
			cancelEditing()
		}
		setOpenDropdowns({})
	}

	// Función helper para calcular posición de dropdown
	const getDropdownPosition = (element: HTMLElement) => {
		const rect = element.getBoundingClientRect()
		
		// Posición absoluta en el viewport (para position: fixed)
		let top = rect.bottom + window.scrollY
		let left = rect.left + window.scrollX
		
		// Ajustar si se sale por la derecha del viewport
		const dropdownWidth = 200 // ancho estimado del dropdown
		if (left + dropdownWidth > window.innerWidth + window.scrollX) {
			left = rect.right + window.scrollX - dropdownWidth
		}
		
		// Ajustar si se sale por abajo del viewport
		const dropdownHeight = 200 // altura estimada del dropdown
		if (rect.bottom + dropdownHeight > window.innerHeight + window.scrollY) {
			top = rect.top + window.scrollY - dropdownHeight
		}
		
		return { top: Math.max(0, top), left: Math.max(0, left) }
	}

	// Componente helper para renderizar dropdowns con Portal
	const DropdownPortal = ({ 
		children, 
		isOpen, 
		position 
	}: { 
		children: React.ReactNode
		isOpen: boolean
		position: { top: number; left: number } 
	}) => {
		if (!isOpen || typeof window === 'undefined') return null
		
		return createPortal(
			<div 
				className="absolute bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg w-48 max-h-48 overflow-y-auto backdrop-blur-sm"
				style={{
					position: 'fixed',
					top: position.top,
					left: position.left,
					zIndex: Z_INDEX_LAYERS.MODAL_CALENDAR
				}}
			>
				{children}
			</div>,
			document.body
		)
	}

	const startEditing = (client: Client, field: string) => {
		// Verificar si es placeholder
		if (client.name === '+ Agregar cliente...' || client.id === 'placeholder') {
			startEditingPlaceholder(client, field)
		} else {
			// Cliente normal
			setEditingClientId(client.id)
			setEditingField(field)
			
			// Obtener el valor actual del campo
			const currentValue = (client as any)[field]
			setEditingValue(currentValue ? String(currentValue) : '')
		}
	}

	const startEditingPlaceholder = (client: Client, field: string) => {
		// Para placeholder, siempre empezar con valor vacío
		setEditingClientId(client.id)
		setEditingField(field)
		setEditingValue('')
	}

	const saveEditing = () => {
		if (editingClientId && editingField) {
			let value: any = editingValue.trim()
			
			// Convertir el valor según el tipo de campo
			if (editingField === 'guestCount') {
				value = value ? parseInt(value, 10) : undefined
			}
			
			onUpdateClient(editingClientId, { [editingField]: value || undefined })
		}
		setEditingClientId(null)
		setEditingField(null)
		setEditingValue('')
	}

	const cancelEditing = () => {
		setEditingClientId(null)
		setEditingField(null)
		setEditingValue('')
	}

	const saveEditingOnBlur = () => {
		if (editingClientId && editingField && editingField === 'guestCount') {
			// Validar que sea un número válido para guestCount o vacío
			const trimmedValue = editingValue.trim()
			
			if (trimmedValue === '') {
				// Valor vacío es válido (sin invitados especificados)
				saveEditing()
			} else {
				const numValue = parseInt(trimmedValue, 10)
				if (!isNaN(numValue) && numValue >= 0) {
					// Si es válido, usar saveEditing normal
					saveEditing()
				} else {
					// Si no es válido, cancelar la edición
					cancelEditing()
				}
			}
		} else {
			// Para otros campos, usar saveEditing normal
			saveEditing()
		}
	}

	const cancelPlaceholderEditing = () => {
		// Para placeholder, solo cancelar sin crear cliente
		setEditingClientId(null)
		setEditingField(null)
		setEditingValue('')
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			saveEditing()
		} else if (e.key === 'Escape') {
			cancelEditing()
		}
	}

	const handleKeyDownPlaceholder = (e: React.KeyboardEvent) => {
		// Si tenemos el manejador del componente padre, usarlo
		if (onPlaceholderKeyDown) {
			onPlaceholderKeyDown(e)
		} else {
			// Comportamiento por defecto si no hay manejador
			if (e.key === 'Enter') {
				saveEditing()
			} else if (e.key === 'Escape') {
				cancelPlaceholderEditing()
			}
		}
	}

	const handleMouseDown = (column: string, e: React.MouseEvent) => {
		e.preventDefault()
		setIsResizing(column)
		
		const startX = e.clientX
		const startWidth = columnWidths[column]
		
		const handleMouseMove = (e: MouseEvent) => {
			const diff = e.clientX - startX
			const newWidth = Math.max(80, startWidth + diff)
			setColumnWidths((prev) => ({
				...prev,
				[column]: newWidth
			}))
		}
		
		const handleMouseUp = () => {
			setIsResizing(null)
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}
		
		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
	}

	// Cerrar dropdowns y edición al hacer clic fuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element
			
			// Si el calendario está abierto, verificar si el click es dentro del calendario
			if (showCalendar) {
				const calendarElement = document.querySelector('.fixed.z-\\[1000\\]')
				if (calendarElement && calendarElement.contains(target)) {
					// Click dentro del calendario, no hacer nada
					return
				}
				// Si el click es fuera del calendario pero el calendario está abierto,
				// solo cerrarlo si no es un click en el botón que abre el calendario
				const isCalendarButton = (target as Element).closest('[data-calendar-trigger="true"]')
				if (!isCalendarButton) {
					setShowCalendar(false)
					setEditingClientId(null)
					setEditingField(null)
					return
				}
			}
			
			// Si hay edición activa, verificar si el click es afuera del input
			if (editingClientId && editingField && editingInputRef.current) {
				if (!editingInputRef.current.contains(target as Node)) {
					// Click afuera del input de edición - guardar cambios
					saveEditingOnBlur()
				}
				return
			}
			
			// Si no hay edición activa, manejar dropdowns
			if (containerRef.current && !containerRef.current.contains(target as Node)) {
				closeAllDropdowns()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [editingClientId, editingField, editingValue, showCalendar])

	// Cerrar dropdowns al hacer scroll
	useEffect(() => {
		const handleScroll = () => {
			// Si hay dropdowns abiertos, cerrarlos al hacer scroll
			if (openDropdowns.status || openDropdowns.priority || openDropdowns.type || openDropdowns.area || openDropdowns.channel || openDropdowns.assignedExecutive) {
				closeAllDropdowns()
			}
		}

		const container = containerRef.current
		if (container) {
			container.addEventListener('scroll', handleScroll)
			return () => {
				container.removeEventListener('scroll', handleScroll)
			}
		}
	}, [openDropdowns])

	// Manejadores del menú contextual
	const handleContextMenu = (e: React.MouseEvent, clientId: string) => {
		e.preventDefault()
		e.stopPropagation()
		
		// No mostrar menú contextual para el placeholder
		const client = clients.find(c => c.id === clientId)
		if (client?.name === '+ Agregar cliente...') return
		
		setContextMenu({
			show: true,
			x: e.clientX,
			y: e.clientY,
			clientId
		})
	}

	const hideContextMenu = () => {
		setContextMenu(null)
	}

	const handleContextMenuAction = (action: string, clientId: string) => {
		const client = clients.find(c => c.id === clientId)
		if (!client) return

		switch (action) {
			case 'open':
				onOpenModal?.(client)
				break
			case 'vip':
				onVip?.(clientId)
				break
			case 'archive':
				onArchive?.(clientId)
				break
			case 'delete':
				onDelete?.(clientId)
				break
		}
		
		hideContextMenu()
	}

	// Cerrar menú contextual al hacer clic fuera
	useEffect(() => {
		const handleClickOutside = () => {
			if (contextMenu) {
				hideContextMenu()
			}
		}

		if (contextMenu) {
			document.addEventListener('click', handleClickOutside)
			return () => {
				document.removeEventListener('click', handleClickOutside)
			}
		}
	}, [contextMenu])

	// Detectar inicio y fin del arrastre para el scroll
	const handleScrollMouseDown = (e: React.MouseEvent) => {
		// Prevenir selección de texto desde el inicio
		e.preventDefault()
		setDragStart({ x: e.clientX, y: e.clientY })
	}

	const handleScrollMouseMove = (e: React.MouseEvent) => {
		if (dragStart && !isDragging) {
			const deltaX = Math.abs(e.clientX - dragStart.x)
			const deltaY = Math.abs(e.clientY - dragStart.y)
			
			// Si hay cualquier movimiento, prevenir selección
			if (deltaX > 2 || deltaY > 2) {
				e.preventDefault()
				
				// Si el movimiento horizontal es mayor, activar modo scroll
				if (deltaX > deltaY) {
					setIsDragging(true)
					setIsScrolling(true)
				}
			}
		}
	}

	const handleScrollMouseUp = () => {
		setIsDragging(false)
		setDragStart(null)
		setTimeout(() => setIsScrolling(false), 150) // Aumentar el delay
	}

	useEffect(() => {
		const handleGlobalMouseUp = () => {
			setIsDragging(false)
			setDragStart(null)
			setIsScrolling(false)
		}

		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (dragStart) {
				const deltaX = Math.abs(e.clientX - dragStart.x)
				const deltaY = Math.abs(e.clientY - dragStart.y)
				
				// Prevenir selección en cualquier movimiento durante el arrastre
				if (deltaX > 2 || deltaY > 2) {
					e.preventDefault()
					
					// Si el movimiento horizontal es dominante, activar scroll mode
					if (deltaX > deltaY && !isDragging) {
						setIsDragging(true)
						setIsScrolling(true)
					}
				}
			}
		}

		const handleSelectStart = (e: Event) => {
			// Prevenir completamente la selección si estamos en modo scroll
			if (isDragging || isScrolling || dragStart) {
				e.preventDefault()
				return false
			}
		}

		document.addEventListener('mouseup', handleGlobalMouseUp)
		document.addEventListener('mousemove', handleGlobalMouseMove)
		document.addEventListener('selectstart', handleSelectStart)
		
		return () => {
			document.removeEventListener('mouseup', handleGlobalMouseUp)
			document.removeEventListener('mousemove', handleGlobalMouseMove)
			document.removeEventListener('selectstart', handleSelectStart)
		}
	}, [dragStart, isDragging, isScrolling])

	const SortHeader = ({ field, children }: { field: string, children: React.ReactNode }) => (
		<button
			onClick={() => onSort(field)}
			className="flex items-center justify-start gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors w-full min-w-0"
		>
			<span className="truncate">{children}</span>
			{sortBy === field && (
				<div className="flex-shrink-0">
					{sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
				</div>
			)}
		</button>
	)

	const ResizableHeader = ({ 
		column, 
		children, 
		field, 
		style 
	}: { 
		column: string
		children: React.ReactNode
		field?: string
		style?: React.CSSProperties
	}) => (
		<div 
			className="relative flex items-center group h-full border-r border-gray-200 dark:border-gray-700 last:border-r-0 overflow-hidden"
			style={style}
		>
			<div className="flex-1 min-w-0 overflow-hidden px-3">
				{field ? (
					<SortHeader field={field}>{children}</SortHeader>
				) : (
					<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left w-full block truncate">
						{children}
					</span>
				)}
			</div>
			<div
				className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-10 flex items-center justify-center"
				onMouseDown={(e) => handleMouseDown(column, e)}
				title="Arrastrar para cambiar el ancho de la columna"
			>
				{/* Área de interacción invisible - el borde de la celda ya proporciona la línea visual */}
			</div>
		</div>
	)

	// Calcular el ancho total de todas las columnas
	const totalWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0)

	// Calcular el progreso de la barra de scroll
	const scrollProgress = maxScroll > 0 ? scrollPosition / maxScroll : 0
	const scrollbarThumbWidth = maxScroll > 0 ? Math.max(20, (containerRef.current?.clientWidth || 0) / totalWidth * 100) : 100

	return (
		<div className={`h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${isDragging ? 'select-none' : ''}`}>
			{/* Header - STICKY pero posicionado correctamente */}
			<div className="sticky top-0 z-40 flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" style={{ height: '41px' }}>
				<div 
					ref={headerRef}
					className="header-scroll-container overflow-hidden h-full"
					style={{ overflowX: 'hidden' }}
				>
					<div 
						className="flex bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-full"
						style={{ width: totalWidth }}
					>
						<ResizableHeader 
							column="name" 
							field="name" 
							style={{ width: columnWidths.name }}
						>
							Cliente
						</ResizableHeader>
						<ResizableHeader 
							column="phone" 
							field="phone" 
							style={{ width: columnWidths.phone }}
						>
							Teléfono
						</ResizableHeader>
						<ResizableHeader 
							column="email" 
							field="email" 
							style={{ width: columnWidths.email }}
						>
							Email
						</ResizableHeader>
						<ResizableHeader 
							column="eventDate" 
							field="eventDate" 
							style={{ width: columnWidths.eventDate }}
						>
							Fecha Evento
						</ResizableHeader>
						<ResizableHeader 
							column="type" 
							field="type" 
							style={{ width: columnWidths.type }}
						>
							Tipo
						</ResizableHeader>
						<ResizableHeader 
							column="area" 
							field="area" 
							style={{ width: columnWidths.area }}
						>
							Área
						</ResizableHeader>
						<ResizableHeader 
							column="status" 
							field="status" 
							style={{ width: columnWidths.status }}
						>
							Estado
						</ResizableHeader>
						<ResizableHeader 
							column="priority" 
							field="priority" 
							style={{ width: columnWidths.priority }}
						>
							Prioridad
						</ResizableHeader>
						<ResizableHeader 
							column="channel" 
							field="channel" 
							style={{ width: columnWidths.channel }}
						>
							Canal
						</ResizableHeader>
						<ResizableHeader 
							column="executive" 
							field="assignedExecutive" 
							style={{ width: columnWidths.executive }}
						>
							Ejecutivo
						</ResizableHeader>
						<ResizableHeader 
							column="guestCount" 
							field="guestCount" 
							style={{ width: columnWidths.guestCount }}
						>
							Invitados
						</ResizableHeader>
						<ResizableHeader 
							column="notes" 
							field="notes" 
							style={{ width: columnWidths.notes }}
						>
							Notas
						</ResizableHeader>
						<ResizableHeader 
							column="createdAt" 
							field="createdAt" 
							style={{ width: columnWidths.createdAt }}
						>
							Fecha Creación
						</ResizableHeader>

						<div className="flex items-center justify-center px-3 text-xs font-medium text-gray-500 dark:text-gray-400" style={{ width: columnWidths.actions }}>
							Acciones
						</div>
					</div>
				</div>
			</div>

			{/* Content - sin margen superior porque header es sticky */}
			<div 
				ref={containerRef}
				className={`content-scroll-container flex-1 overflow-auto min-h-0 ${dragStart || isDragging || isScrolling ? 'select-none cursor-grabbing' : 'select-text cursor-auto'}`}
				style={{ 
					marginBottom: '12px',
					userSelect: dragStart || isDragging || isScrolling ? 'none' : 'text',
					WebkitUserSelect: dragStart || isDragging || isScrolling ? 'none' : 'text'
				}}
				onMouseDown={handleScrollMouseDown}
				onMouseMove={handleScrollMouseMove}
				onMouseUp={handleScrollMouseUp}
			>
				<div style={{ width: totalWidth }}>
					{clients.length === 0 ? (
						<div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
							No hay clientes disponibles
						</div>
					) : (
						clients.map((client) => (
							<div 
								key={client.id}
								className="flex border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors h-12"
								style={{ width: totalWidth }}
								onContextMenu={(e) => handleContextMenu(e, client.id)}
							>
								{/* Nombre */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700 overflow-hidden" style={{ width: columnWidths.name }}>
									{editingClientId === client.id && editingField === 'name' ? (
										<div className="w-full">
											<input
												type="text"
												value={editingValue}
												onChange={(e) => setEditingValue(e.target.value)}
												onKeyDown={client.name === '+ Agregar cliente...' ? handleKeyDownPlaceholder : handleKeyDown}
												onBlur={client.name === '+ Agregar cliente...' && onPlaceholderBlur ? onPlaceholderBlur : saveEditingOnBlur}
												data-placeholder-input={client.name === '+ Agregar cliente...' ? "true" : "false"}
												className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-arrebol-terracota-500"
												autoFocus
											/>
										</div>
									) : (
										<button
											onClick={() => {
												if (client.name === '+ Agregar cliente...') {
													startEditingPlaceholder(client, 'name')
												} else {
													startEditing(client, 'name')
												}
											}}
											className="flex items-center gap-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-1 rounded group min-w-0"
										>
											<span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex-1">
												{client.name}
											</span>
											<Edit3 size={12} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />
										</button>
									)}
								</div>

								{/* Teléfono */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700 overflow-hidden" style={{ width: columnWidths.phone }}>
									{editingClientId === client.id && editingField === 'phone' ? (
										<div className="w-full">
											<input
												type="tel"
												value={editingValue}
												onChange={(e) => setEditingValue(e.target.value)}
												onKeyDown={client.name === '+ Agregar cliente...' ? handleKeyDownPlaceholder : handleKeyDown}
												onBlur={client.name === '+ Agregar cliente...' && onPlaceholderBlur ? onPlaceholderBlur : saveEditingOnBlur}
												data-placeholder-input={client.name === '+ Agregar cliente...' ? "true" : "false"}
												className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-arrebol-terracota-500"
												autoFocus
											/>
										</div>
									) : (
										<button
											onClick={() => startEditing(client, 'phone')}
											className="flex items-center gap-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-1 rounded group min-w-0"
										>
											{client.name !== '+ Agregar cliente...' && <Phone size={12} className="flex-shrink-0 text-gray-400" />}
											<span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
												{client.name === '+ Agregar cliente...' ? '' : (client.phone || 'Sin teléfono')}
											</span>
											{client.name !== '+ Agregar cliente...' && <Edit3 size={12} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />}
										</button>
									)}
								</div>

								{/* Email */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700 overflow-hidden" style={{ width: columnWidths.email }}>
									{editingClientId === client.id && editingField === 'email' ? (
										<div className="w-full">
											<input
												type="email"
												value={editingValue}
												onChange={(e) => setEditingValue(e.target.value)}
												onKeyDown={client.name === '+ Agregar cliente...' ? handleKeyDownPlaceholder : handleKeyDown}
												onBlur={client.name === '+ Agregar cliente...' && onPlaceholderBlur ? onPlaceholderBlur : saveEditingOnBlur}
												data-placeholder-input={client.name === '+ Agregar cliente...' ? "true" : "false"}
												className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-arrebol-terracota-500"
												autoFocus
											/>
										</div>
									) : (
										<button
											onClick={() => startEditing(client, 'email')}
											className="flex items-center gap-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-1 rounded group min-w-0"
										>
											{client.name !== '+ Agregar cliente...' && <Mail size={12} className="flex-shrink-0 text-gray-400" />}
											<span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
												{client.name === '+ Agregar cliente...' ? '' : (client.email || 'Sin email')}
											</span>
											{client.name !== '+ Agregar cliente...' && <Edit3 size={12} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />}
										</button>
									)}
								</div>

								{/* Fecha del Evento */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700" style={{ width: columnWidths.eventDate }}>
									<button
										data-calendar-trigger="true"
										onClick={(e) => {
											e.preventDefault()
											e.stopPropagation()
											const rect = e.currentTarget.getBoundingClientRect()
											setCalendarPosition({
												top: rect.bottom + 8,
												left: rect.left
											})
											setShowCalendar(true)
											setEditingClientId(client.id)
											setEditingField('eventDate')
										}}
										className="flex items-center gap-2 w-full min-w-0 hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-1 transition-colors group"
									>
										{client.name !== '+ Agregar cliente...' && <Calendar size={12} className="flex-shrink-0 text-gray-400" />}
										<span className={cn("text-sm truncate flex-1", client.name === '+ Agregar cliente...' ? 'text-gray-400' : getEventDateColor(client.eventDate))}>
											{client.name === '+ Agregar cliente...' ? '' : formatEventDate(client.eventDate)}
										</span>
									</button>
								</div>

								{/* Tipo de Evento */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700" style={{ width: columnWidths.type }}>
									{editingClientId === client.id && editingField === 'type' ? (
										<div className="w-full">
											<DropdownPortal
												isOpen={openDropdowns[client.id] === 'type'}
												position={dropdownPositions[`${client.id}-type`] || { top: 0, left: 0 }}
											>
												{CLIENT_TYPE_OPTIONS.map((option) => (
													<button
														key={option.value}
														onClick={() => {
															onUpdateClient(client.id, { type: option.value })
															setEditingClientId(null)
															setEditingField(null)
															setOpenDropdowns(prev => ({ ...prev, [client.id]: null }))
														}}
														className={cn(
															"w-full px-3 py-2 text-left text-sm flex items-center first:rounded-t-lg last:rounded-b-lg transition-colors",
															client.type === option.value 
																? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500" 
																: "hover:bg-gray-50 dark:hover:bg-gray-700"
														)}
													>
														<div className="flex items-center gap-2 w-full">
															<span className={cn(
																"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-1",
																getTypeColor(option.value)
															)}>
																{option.label}
															</span>
														</div>
													</button>
												))}
											</DropdownPortal>
										</div>
									) : (
										<button
											data-dropdown-trigger={`type-${client.id}`}
											onClick={(e) => {
												setEditingClientId(client.id)
												setEditingField('type')
												toggleDropdown(client.id, 'type', e.currentTarget)
											}}
											className="flex items-center gap-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-1 rounded group min-w-0"
										>
											{client.name === '+ Agregar cliente...' ? (
												<span className="text-sm text-gray-400">
													
												</span>
											) : (
												<span className={cn(
													"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
													getTypeColor(client.type || 'OTHER')
												)}>
													{getTypeLabel(client.type || 'OTHER')}
												</span>
											)}
											{client.name !== '+ Agregar cliente...' && <ChevronDown size={12} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />}
										</button>
									)}
								</div>

								{/* Área */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700" style={{ width: columnWidths.area }}>
									{editingClientId === client.id && editingField === 'area' ? (
										<div className="w-full">
											<DropdownPortal
												isOpen={openDropdowns[client.id] === 'area'}
												position={dropdownPositions[`${client.id}-area`] || { top: 0, left: 0 }}
											>
												{CLIENT_AREA_OPTIONS.map((option) => (
													<button
														key={option.value}
														onClick={() => {
															onUpdateClient(client.id, { area: option.value })
															setEditingClientId(null)
															setEditingField(null)
															setOpenDropdowns(prev => ({ ...prev, [client.id]: null }))
														}}
														className={cn(
															"w-full px-3 py-2 text-left text-sm flex items-center first:rounded-t-lg last:rounded-b-lg transition-colors",
															client.area === option.value 
																? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500" 
																: "hover:bg-gray-50 dark:hover:bg-gray-700"
														)}
													>
														<div className="flex items-center gap-2 w-full">
															<MapPin size={12} className="flex-shrink-0 text-gray-400" />
															<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
																getAreaColor(option.value)
															}`}>
																{option.label}
															</span>
														</div>
													</button>
												))}
											</DropdownPortal>
										</div>
									) : (
										<button
											data-dropdown-trigger={`area-${client.id}`}
											onClick={(e) => {
												setEditingClientId(client.id)
												setEditingField('area')
												toggleDropdown(client.id, 'area', e.currentTarget)
											}}
											className="flex items-center gap-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-1 rounded group min-w-0"
										>
											{client.name !== '+ Agregar cliente...' && <MapPin size={12} className="flex-shrink-0 text-gray-400" />}
											{client.name === '+ Agregar cliente...' ? (
												<span className="text-sm text-gray-400 px-2 py-1 flex-1">
													
												</span>
											) : (
												<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border truncate flex-1 justify-center ${
													client.area ? getAreaColor(client.area) : 'bg-gray-100 text-gray-700 border-gray-300'
												}`}>
													{client.area ? CLIENT_AREA_OPTIONS.find(opt => opt.value === client.area)?.label : 'Sin área'}
												</span>
											)}
											{client.name !== '+ Agregar cliente...' && <ChevronDown size={12} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />}
										</button>
									)}
								</div>

								{/* Estado */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700" style={{ width: columnWidths.status }}>
									{editingClientId === client.id && editingField === 'status' ? (
										<div className="w-full">
											<DropdownPortal
												isOpen={openDropdowns[client.id] === 'status'}
												position={dropdownPositions[`${client.id}-status`] || { top: 0, left: 0 }}
											>
												{CLIENT_STATUS_OPTIONS.map((option) => (
													<button
														key={option.value}
														onClick={() => {
															onUpdateClient(client.id, { status: option.value })
															setEditingClientId(null)
															setEditingField(null)
															setOpenDropdowns(prev => ({ ...prev, [client.id]: null }))
														}}
														className={cn(
															"w-full px-3 py-2 text-left text-sm flex items-center first:rounded-t-lg last:rounded-b-lg transition-colors",
															client.status === option.value 
																? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500" 
																: "hover:bg-gray-50 dark:hover:bg-gray-700"
														)}
													>
														<div className="flex items-center gap-2 w-full">
															<span className={cn(
																"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-full justify-center",
																getStatusColor(option.value)
															)}>
																{option.label}
															</span>
														</div>
													</button>
												))}
											</DropdownPortal>
										</div>
									) : (
										<button
											data-dropdown-trigger={`status-${client.id}`}
											onClick={(e) => {
												setEditingClientId(client.id)
												setEditingField('status')
												toggleDropdown(client.id, 'status', e.currentTarget)
											}}
											className="flex items-center gap-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-1 rounded group min-w-0"
										>
											{client.name === '+ Agregar cliente...' ? (
												<span className="text-sm text-gray-400">
													
												</span>
											) : (
												<span className={cn(
													"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
													getStatusColor(client.status)
												)}>
													{getStatusLabel(client.status)}
												</span>
											)}
											{client.name !== '+ Agregar cliente...' && <ChevronDown size={12} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />}
										</button>
									)}
								</div>

								{/* Prioridad */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700" style={{ width: columnWidths.priority }}>
									{editingClientId === client.id && editingField === 'priority' ? (
										<div className="w-full">
											<DropdownPortal
												isOpen={openDropdowns[client.id] === 'priority'}
												position={dropdownPositions[`${client.id}-priority`] || { top: 0, left: 0 }}
											>
												{CLIENT_PRIORITY_OPTIONS.map((option) => (
													<button
														key={option.value}
														onClick={() => {
															onUpdateClient(client.id, { priority: option.value })
															setEditingClientId(null)
															setEditingField(null)
															setOpenDropdowns(prev => ({ ...prev, [client.id]: null }))
														}}
														className={cn(
															"w-full px-3 py-2 text-left text-sm flex items-center first:rounded-t-lg last:rounded-b-lg transition-colors",
															client.priority === option.value 
																? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500" 
																: "hover:bg-gray-50 dark:hover:bg-gray-700"
														)}
													>
														<div className="flex items-center gap-2 w-full">
															<Flag size={12} className="flex-shrink-0 text-gray-400" />
															<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
																getPriorityColor(option.value)
															}`}>
																{option.label}
															</span>
														</div>
													</button>
												))}
											</DropdownPortal>
										</div>
									) : (
										<button
											data-dropdown-trigger={`priority-${client.id}`}
											onClick={(e) => {
												setEditingClientId(client.id)
												setEditingField('priority')
												toggleDropdown(client.id, 'priority', e.currentTarget)
											}}
											className="flex items-center gap-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-1 rounded group min-w-0"
										>
											{client.name === '+ Agregar cliente...' ? (
												<span className="text-sm text-gray-400">
													
												</span>
											) : (
												<span className={cn(
													"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
													getPriorityColor(client.priority)
												)}>
													{getPriorityLabel(client.priority)}
												</span>
											)}
											{client.name !== '+ Agregar cliente...' && <ChevronDown size={12} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />}
										</button>
									)}
								</div>

								{/* Canal */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700" style={{ width: columnWidths.channel }}>
									{editingClientId === client.id && editingField === 'channel' ? (
										<div className="w-full">
											<DropdownPortal
												isOpen={openDropdowns[client.id] === 'channel'}
												position={dropdownPositions[`${client.id}-channel`] || { top: 0, left: 0 }}
											>
												{channelOptions.map((option) => (
													<button
														key={option.value}
														onClick={() => {
															onUpdateClient(client.id, { channel: option.value })
															setEditingClientId(null)
															setEditingField(null)
															setOpenDropdowns(prev => ({ ...prev, [client.id]: null }))
														}}
														className={cn(
															"w-full px-3 py-2 text-left text-sm flex items-center first:rounded-t-lg last:rounded-b-lg transition-colors",
															client.channel === option.value 
																? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500" 
																: "hover:bg-gray-50 dark:hover:bg-gray-700"
														)}
													>
														<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border w-full justify-center ${
															getChannelColor(option.value)
														}`}>
															{option.label}
														</span>
													</button>
												))}
											</DropdownPortal>
										</div>
									) : (
										<button
											data-dropdown-trigger={`channel-${client.id}`}
											onClick={(e) => {
												setEditingClientId(client.id)
												setEditingField('channel')
												toggleDropdown(client.id, 'channel', e.currentTarget)
											}}
											className="flex items-center gap-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-1 rounded group min-w-0"
										>
											{client.name === '+ Agregar cliente...' ? (
												<span className="text-sm text-gray-400 px-2 py-1 flex-1">
													
												</span>
											) : (
												<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border truncate flex-1 justify-center ${
													client.channel ? getChannelColor(client.channel) : 'bg-gray-100 text-gray-700 border-gray-300'
												}`}>
													{client.channel ? channelOptions.find(opt => opt.value === client.channel)?.label : 'Sin canal'}
												</span>
											)}
											{client.name !== '+ Agregar cliente...' && <ChevronDown size={12} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />}
										</button>
									)}
								</div>

								{/* Ejecutivo Asignado */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700" style={{ width: columnWidths.executive }}>
									{editingClientId === client.id && editingField === 'assignedExecutive' ? (
										<div className="w-full">
											<DropdownPortal
												isOpen={openDropdowns[client.id] === 'assignedExecutive'}
												position={dropdownPositions[`${client.id}-assignedExecutive`] || { top: 0, left: 0 }}
											>
												{CLIENT_EXECUTIVE_OPTIONS.map((option) => (
													<button
														key={option.value}
														onClick={() => {
															onUpdateClient(client.id, { assignedExecutive: option.value })
															setEditingClientId(null)
															setEditingField(null)
															setOpenDropdowns(prev => ({ ...prev, [client.id]: null }))
														}}
														className={cn(
															"w-full px-3 py-2 text-left text-sm flex items-center first:rounded-t-lg last:rounded-b-lg transition-colors",
															client.assignedExecutive === option.value 
																? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500" 
																: "hover:bg-gray-50 dark:hover:bg-gray-700"
														)}
													>
														<div className="flex items-center gap-2 w-full">
															<User size={12} className="flex-shrink-0 text-gray-400" />
															<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
																getExecutiveColor(option.value)
															}`}>
																{option.label}
															</span>
														</div>
													</button>
												))}
											</DropdownPortal>
										</div>
									) : (
										<button
											data-dropdown-trigger={`executive-${client.id}`}
											onClick={(e) => {
												setEditingClientId(client.id)
												setEditingField('assignedExecutive')
												toggleDropdown(client.id, 'assignedExecutive', e.currentTarget)
											}}
											className="flex items-center gap-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-1 rounded group min-w-0"
										>
											{client.name !== '+ Agregar cliente...' && <User size={12} className="flex-shrink-0 text-gray-400" />}
											{client.name === '+ Agregar cliente...' ? (
												<span className="text-sm text-gray-400 px-2 py-1 flex-1">
													
												</span>
											) : (
												<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border truncate flex-1 justify-center ${
													client.assignedExecutive ? getExecutiveColor(client.assignedExecutive) : 'bg-gray-100 text-gray-700 border-gray-300'
												}`}>
													{client.assignedExecutive ? CLIENT_EXECUTIVE_OPTIONS.find(opt => opt.value === client.assignedExecutive)?.label : 'Sin asignar'}
												</span>
											)}
											{client.name !== '+ Agregar cliente...' && <ChevronDown size={12} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />}
										</button>
									)}
								</div>

								{/* Número de Invitados */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700 overflow-hidden" style={{ width: columnWidths.guestCount }}>
									{editingClientId === client.id && editingField === 'guestCount' ? (
										<input
											ref={editingInputRef}
											type="number"
											min="0"
											step="1"
											value={editingValue}
											onChange={(e) => setEditingValue(e.target.value)}
											onKeyDown={client.name === '+ Agregar cliente...' ? handleKeyDownPlaceholder : handleKeyDown}
											onBlur={client.name === '+ Agregar cliente...' && onPlaceholderBlur ? onPlaceholderBlur : saveEditingOnBlur}
											data-placeholder-input={client.name === '+ Agregar cliente...' ? "true" : "false"}
											className="w-full px-1 py-0.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-arrebol-terracota-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
											autoFocus
										/>
									) : (
										<button
											onClick={() => startEditing(client, 'guestCount')}
											className="flex items-center gap-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-1 rounded group min-w-0"
										>
											{client.name !== '+ Agregar cliente...' && <Users size={12} className="flex-shrink-0 text-gray-400" />}
											<span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
												{client.name === '+ Agregar cliente...' ? '' : (client.guestCount || 'No especificado')}
											</span>
											{client.name !== '+ Agregar cliente...' && <Edit3 size={12} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />}
										</button>
									)}
								</div>

								{/* Notas */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700 overflow-hidden" style={{ width: columnWidths.notes }}>
									{editingClientId === client.id && editingField === 'notes' ? (
										<input
											type="text"
											value={editingValue}
											onChange={(e) => setEditingValue(e.target.value)}
											onKeyDown={client.name === '+ Agregar cliente...' ? handleKeyDownPlaceholder : handleKeyDown}
											onBlur={client.name === '+ Agregar cliente...' && onPlaceholderBlur ? onPlaceholderBlur : saveEditing}
											data-placeholder-input={client.name === '+ Agregar cliente...' ? "true" : "false"}
											className="w-full px-1 py-0.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-arrebol-terracota-500"
											autoFocus
										/>
									) : (
										<button
											onClick={() => startEditing(client, 'notes')}
											className="flex items-center gap-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-1 rounded group min-w-0"
										>
											<span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
												{client.name === '+ Agregar cliente...' ? '' : (client.notes || 'Sin notas')}
											</span>
											{client.name !== '+ Agregar cliente...' && <Edit3 size={12} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />}
										</button>
									)}
								</div>

								{/* Fecha de Creación */}
								<div className="flex items-center px-3 border-r border-gray-200 dark:border-gray-700" style={{ width: columnWidths.createdAt }}>
									<span className="text-sm text-gray-500 dark:text-gray-400 truncate">
										{client.name === '+ Agregar cliente...' ? '' : format(client.createdAt, 'dd MMM yyyy', { locale: es })}
									</span>
								</div>

								{/* Acciones */}
								<div className="flex items-center justify-center gap-1 px-3" style={{ width: columnWidths.actions }}>
									{client.name !== '+ Agregar cliente...' && (
										<>
											<button
												onClick={() => onOpenModal?.(client)}
												className="p-1 text-gray-400 hover:text-arrebol-terracota hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
												title="Ver detalles"
											>
												<Expand size={14} />
											</button>
											<button
												onClick={() => onVip?.(client.id)}
												className={`p-1 transition-colors rounded ${
													client.vip 
														? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-900/20' 
														: 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-700'
												}`}
												title={client.vip ? "Quitar de VIP" : "Marcar como VIP"}
											>
												<Crown size={14} fill={client.vip ? "currentColor" : "none"} />
											</button>
											<button
												onClick={() => onArchive?.(client.id)}
												className={`p-1 transition-colors rounded ${
													client.archived 
														? 'text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
														: 'text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700'
												}`}
												title={client.archived ? "Restaurar cliente" : "Archivar cliente"}
											>
												<Archive size={14} />
											</button>
											<button
												onClick={() => onDelete?.(client.id)}
												className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
												title="Eliminar cliente"
											>
												<Trash2 size={14} />
											</button>
										</>
									)}
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Custom scrollbar with arrows - STICKY en la parte inferior */}
			<div className="sticky bottom-0 z-40 h-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center px-1 flex-shrink-0">
				{maxScroll > 0 ? (
					<>
						{/* Left Arrow */}
						<button
							className="z-10 w-4 h-4 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center justify-center transition-colors text-xs"
							onClick={() => {
								if (containerRef.current) {
									containerRef.current.scrollLeft = Math.max(0, containerRef.current.scrollLeft - 200)
								}
							}}
							disabled={scrollPosition <= 0}
						>
							<ChevronLeft size={8} className={`${scrollPosition <= 0 ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`} />
						</button>

						{/* Scrollbar Track */}
						<div className="flex-1 mx-1 relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded">
							<div
								className="absolute top-0 bottom-0 bg-arrebol-terracota-400 hover:bg-arrebol-terracota-500 rounded cursor-pointer transition-colors"
								style={{
									left: `${scrollProgress * (100 - scrollbarThumbWidth)}%`,
									width: `${scrollbarThumbWidth}%`
								}}
								onMouseDown={handleCustomScrollbarDrag}
							/>
						</div>

						{/* Right Arrow */}
						<button
							className="z-10 w-4 h-4 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center justify-center transition-colors text-xs"
							onClick={() => {
								if (containerRef.current) {
									containerRef.current.scrollLeft = Math.min(maxScroll, containerRef.current.scrollLeft + 200)
								}
							}}
							disabled={scrollPosition >= maxScroll}
						>
							<ChevronRight size={8} className={`${scrollPosition >= maxScroll ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`} />
						</button>
					</>
				) : (
					/* Placeholder when no horizontal scroll needed */
					<div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded mx-1" />
				)}
			</div>

			{/* Calendar Picker */}
			{showCalendar && editingClientId && editingField === 'eventDate' && typeof window !== 'undefined' && (
				<div 
					className="fixed inset-0 z-[999]" 
					onClick={(e) => {
						// Solo cerrar si el click es en el overlay, no en el contenido del calendario
						if (e.target === e.currentTarget) {
							setShowCalendar(false)
							setEditingClientId(null)
							setEditingField(null)
						}
					}}
				>
					<div 
						className="fixed z-[1000]"
						style={{ 
							top: Math.min(calendarPosition.top, window.innerHeight - 450),
							left: Math.min(calendarPosition.left, window.innerWidth - 450),
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<CalendarPicker
							selectedDate={clients.find(c => c.id === editingClientId)?.eventDate || new Date()}
							onDateSelect={(date) => {
								if (editingClientId) {
									const client = clients.find(c => c.id === editingClientId)
									if (client) {
										// Verificar si es placeholder
										const isPlaceholder = client.name === '+ Agregar cliente...' || client.id === 'placeholder'
										
										if (isPlaceholder && onPlaceholderKeyDown) {
											// Para placeholder, usar la lógica de borrador
											onUpdateClient(editingClientId, { eventDate: date })
										} else {
											// Para clientes normales, actualizar directamente
											onUpdateClient(editingClientId, { eventDate: date })
										}
									}
								}
								setShowCalendar(false)
								setEditingClientId(null)
								setEditingField(null)
							}}
							onClose={() => {
								setShowCalendar(false)
								setEditingClientId(null)
								setEditingField(null)
							}}
						/>
					</div>
				</div>
			)}

			{/* Barra de herramientas flotante - Oculta */}
			{false && (
				<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
					<div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-3">
						<span className="text-xs text-gray-500 dark:text-gray-400">
							{clients.length} cliente{clients.length !== 1 ? 's' : ''}
						</span>
						<div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
						<button
							onClick={() => {
								// Scroll to top
								if (containerRef.current) {
									containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
								}
							}}
							className="text-xs text-gray-600 dark:text-gray-300 hover:text-arrebol-terracota dark:hover:text-arrebol-terracota-light transition-colors"
						>
							↑ Inicio
						</button>
						<button
							onClick={() => {
								// Scroll to bottom
								if (containerRef.current) {
									containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
								}
							}}
							className="text-xs text-gray-600 dark:text-gray-300 hover:text-arrebol-terracota dark:hover:text-arrebol-terracota-light transition-colors"
						>
							↓ Final
						</button>
					</div>
				</div>
			)}

			{/* Menú Contextual */}
			{contextMenu && (
				<div
					className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px]"
					style={{
						left: contextMenu.x,
						top: contextMenu.y,
					}}
				>
					<button
						onClick={() => handleContextMenuAction('open', contextMenu.clientId)}
						className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<Maximize2 size={16} />
						Abrir detalles
					</button>
					
					{(() => {
						const client = clients.find(c => c.id === contextMenu.clientId)
						return client && (
							<button
								onClick={() => handleContextMenuAction('vip', contextMenu.clientId)}
								className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							>
								<Crown 
									size={16} 
									className={client.vip ? "text-amber-500 fill-current" : "text-gray-400"} 
								/>
								{client.vip ? 'Quitar VIP' : 'Marcar como VIP'}
							</button>
						)
					})()}
					
					<button
						onClick={() => handleContextMenuAction('archive', contextMenu.clientId)}
						className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<Archive size={16} />
						Archivar cliente
					</button>
					
					<div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
					
					<button
						onClick={() => handleContextMenuAction('delete', contextMenu.clientId)}
						className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
					>
						<Trash2 size={16} />
						Eliminar cliente
					</button>
				</div>
			)}
		</div>
	)
}
