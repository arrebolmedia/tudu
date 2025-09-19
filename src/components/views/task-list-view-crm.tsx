'use client'

import { Task, List, TaskStatus, Priority } from '@/types'
import { 
	Calendar, 
	Flag, 
	ChevronDown,
	ChevronUp,
	ChevronLeft,
	ChevronRight,
	Circle,
	Play,
	CheckCircle as CheckCircleIcon,
	CheckSquare,
	ListIcon,
	Hash,
	Edit3,
	Maximize2,
	Expand,
	AlignLeft,
	Home,
	Briefcase,
	Heart,
	Star,
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
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn, isToday, isTomorrow, isOverdue } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarPicker } from '@/components/ui/calendar-picker'
import { Z_INDEX_LAYERS } from '@/lib/z-index-layers'

// Icon map local definition
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

// Opciones para los campos de tareas
const PRIORITY_OPTIONS = [
	{ value: 'LOW', label: 'Baja', color: '#10b981' },
	{ value: 'NORMAL', label: 'Media', color: '#f59e0b' },
	{ value: 'HIGH', label: 'Alta', color: '#ef4444' }
] as const

const STATUS_OPTIONS = [
	{ value: 'PENDING', label: 'Pendiente', color: '#6b7280', icon: Circle },
	{ value: 'IN_PROGRESS', label: 'En Progreso', color: '#f59e0b', icon: Play },
	{ value: 'COMPLETED', label: 'Completada', color: '#10b981', icon: CheckCircleIcon }
] as const

interface TaskListViewCrmProps {
	tasks: Task[]
	lists: List[]
	onToggleComplete: (taskId: string, completed: boolean) => void
	onUpdateStatus: (taskId: string, status: TaskStatus) => void
	onUpdateTask: (taskId: string, updates: Partial<Task>) => void
	onEditTask: (task: Task) => void
	sortBy: string
	sortOrder: 'asc' | 'desc'
	onSort: (field: string) => void
}

// Funciones de utilidad
const getStatusColor = (status: TaskStatus) => {
	const option = STATUS_OPTIONS.find(opt => opt.value === status)
	return option?.color ? `text-[${option.color}]` : 'text-gray-600'
}

const getStatusLabel = (status: TaskStatus) => {
	const option = STATUS_OPTIONS.find(opt => opt.value === status)
	return option?.label || status
}

const getStatusIcon = (status: TaskStatus) => {
	const option = STATUS_OPTIONS.find(opt => opt.value === status)
	const IconComponent = option?.icon || Circle
	return <IconComponent className="w-3.5 h-3.5" />
}

const getPriorityColor = (priority: Priority) => {
	const option = PRIORITY_OPTIONS.find(opt => opt.value === priority)
	return option?.color ? `text-[${option.color}]` : 'text-gray-600'
}

const getPriorityLabel = (priority: Priority) => {
	const option = PRIORITY_OPTIONS.find(opt => opt.value === priority)
	return option?.label || priority
}

const formatDueDate = (date?: Date) => {
	if (!date) return 'Sin fecha'
	if (isToday(date)) return 'Hoy'
	if (isTomorrow(date)) return 'Mañana'
	return format(date, 'MMM d', { locale: es })
}

const getDueDateColor = (date?: Date) => {
	if (!date) return 'text-gray-400'
	if (isOverdue(date)) return 'text-red-600'
	if (isToday(date)) return 'text-arrebol-terracota-600'
	if (isTomorrow(date)) return 'text-orange-600'
	return 'text-gray-600'
}

export function TaskListViewCrm({
	tasks,
	lists,
	onToggleComplete,
	onUpdateStatus,
	onUpdateTask,
	onEditTask,
	sortBy,
	sortOrder,
	onSort
}: TaskListViewCrmProps) {
	const [openDropdowns, setOpenDropdowns] = useState<Record<string, string | null>>({})
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
	const [editingField, setEditingField] = useState<string | null>(null)
	const [editingTitle, setEditingTitle] = useState('')
	const [editingDescription, setEditingDescription] = useState('')

	const containerRef = useRef<HTMLDivElement>(null)
	const [scrollPosition, setScrollPosition] = useState(0)
	const [maxScroll, setMaxScroll] = useState(0)

	// Anchos de columnas con estado y persistencia en localStorage
	const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
		// Cargar anchos guardados de localStorage
		if (typeof window !== 'undefined') {
			try {
				const saved = localStorage.getItem('taskCrmColumnWidths_v1')
				if (saved) {
					return JSON.parse(saved)
				}
			} catch (error) {
				console.error('Error loading column widths:', error)
			}
		}
		
		// Valores por defecto
		return {
			checkbox: 60,
			title: 280,
			description: 220,
			priority: 120,
			status: 140,
			dueDate: 120,
			listId: 160
		}
	})

	// Guardar anchos en localStorage cuando cambien
	useEffect(() => {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('taskCrmColumnWidths_v1', JSON.stringify(columnWidths))
			} catch (error) {
				console.error('Error saving column widths:', error)
			}
		}
	}, [columnWidths])

	const totalWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0)

	// Variables para scrollbar personalizada
	const scrollProgress = maxScroll > 0 ? scrollPosition / maxScroll : 0
	const scrollbarThumbWidth = maxScroll > 0 ? Math.max(20, (containerRef.current?.clientWidth || 0) / totalWidth * 100) : 100

	// Función para alternar dropdowns
	const toggleDropdown = (taskId: string, dropdown: string) => {
		const currentKey = `${taskId}-${dropdown}`
		setOpenDropdowns(prev => ({
			...prev,
			[taskId]: prev[taskId] === dropdown ? null : dropdown
		}))
	}

	const closeDropdown = (taskId: string) => {
		setOpenDropdowns(prev => ({
			...prev,
			[taskId]: null
		}))
	}



	// Handle scroll
	useEffect(() => {
		const updateScrollPosition = () => {
			if (containerRef.current) {
				const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
				setScrollPosition(scrollLeft)
				setMaxScroll(Math.max(0, scrollWidth - clientWidth))
			}
		}

		const container = containerRef.current
		if (container) {
			container.addEventListener('scroll', updateScrollPosition)
			updateScrollPosition()
			
			return () => container.removeEventListener('scroll', updateScrollPosition)
		}
	}, [tasks])

	// Componente Portal para dropdowns
	const DropdownPortal = ({ children, taskId, field }: { children: React.ReactNode, taskId: string, field: string }) => {
		const [position, setPosition] = useState({ top: 0, left: 0 })

		const updatePosition = useCallback(() => {
			if (openDropdowns[taskId] === field) {
				const button = document.querySelector(`[data-dropdown="${taskId}-${field}"]`) as HTMLElement
				if (button && containerRef.current) {
					const buttonRect = button.getBoundingClientRect()
					const containerRect = containerRef.current.getBoundingClientRect()
					
					// Verificar si el botón está visible en el viewport del container
					const isVisible = buttonRect.left >= containerRect.left && 
									 buttonRect.right <= containerRect.right &&
									 buttonRect.top >= containerRect.top && 
									 buttonRect.bottom <= containerRect.bottom

					if (!isVisible) {
						// Si no está visible, cerrar el dropdown
						setOpenDropdowns(prev => ({ ...prev, [taskId]: null }))
						return
					}
					
					setPosition({
						top: buttonRect.bottom + 4,
						left: Math.max(10, Math.min(
							buttonRect.left,
							window.innerWidth - 280
						))
					})
				}
			}
		}, [openDropdowns, taskId, field])

		useEffect(() => {
			updatePosition()
		}, [updatePosition, scrollPosition])

		useEffect(() => {
			const container = containerRef.current
			if (container && openDropdowns[taskId] === field) {
				container.addEventListener('scroll', updatePosition)
				window.addEventListener('scroll', updatePosition)
				window.addEventListener('resize', updatePosition)
				
				return () => {
					container.removeEventListener('scroll', updatePosition)
					window.removeEventListener('scroll', updatePosition)
					window.removeEventListener('resize', updatePosition)
				}
			}
		}, [openDropdowns, taskId, field, updatePosition])

		if (openDropdowns[taskId] !== field) return null

		return createPortal(
			<div
				className="fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[200px] backdrop-blur-sm"
				style={{
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

	// Función para iniciar edición
	const startEditingTitle = (task: Task) => {
		setEditingTaskId(task.id)
		setEditingField('title')
		setEditingTitle(task.title)
	}

	const startEditingDescription = (task: Task) => {
		setEditingTaskId(task.id)
		setEditingField('description')
		setEditingDescription(task.description || '')
	}

	// Función para guardar edición
	const saveEditingTitle = () => {
		if (editingTaskId && editingTitle.trim()) {
			onUpdateTask(editingTaskId, { title: editingTitle.trim() })
		}
		setEditingTaskId(null)
		setEditingField(null)
		setEditingTitle('')
	}

	const saveEditingDescription = () => {
		if (editingTaskId) {
			onUpdateTask(editingTaskId, { description: editingDescription.trim() || undefined })
		}
		setEditingTaskId(null)
		setEditingField(null)
		setEditingDescription('')
	}

	// Handlers de teclado
	const handleTitleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			saveEditingTitle()
		} else if (e.key === 'Escape') {
			setEditingTaskId(null)
			setEditingField(null)
			setEditingTitle('')
		}
	}

	const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			saveEditingDescription()
		} else if (e.key === 'Escape') {
			setEditingTaskId(null)
			setEditingField(null)
			setEditingDescription('')
		}
	}



	// Función para el scroll personalizado
	const handleCustomScrollbarDrag = (e: React.MouseEvent) => {
		e.preventDefault()
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

	return (
		<div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
			{/* Header fijo - NO se mueve NUNCA */}
			<div className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg relative z-10 overflow-hidden">
				<div className="flex items-center h-12">
					<div style={{ width: columnWidths.checkbox, minWidth: columnWidths.checkbox }} className="px-3 flex items-center justify-center border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
						<Hash className="w-4 h-4 text-gray-400" />
					</div>
					<div style={{ width: columnWidths.title, minWidth: columnWidths.title }} className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
						<div className="px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
							TAREA
						</div>
					</div>
					<div style={{ width: columnWidths.description, minWidth: columnWidths.description }} className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
						<div className="px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
							DESCRIPCIÓN
						</div>
					</div>
					<div style={{ width: columnWidths.priority, minWidth: columnWidths.priority }} className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
						<div className="px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
							PRIORIDAD
						</div>
					</div>
					<div style={{ width: columnWidths.status, minWidth: columnWidths.status }} className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
						<div className="px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
							ESTADO
						</div>
					</div>
					<div style={{ width: columnWidths.dueDate, minWidth: columnWidths.dueDate }} className="flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
						<div className="px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
							FECHA
						</div>
					</div>
					<div style={{ width: columnWidths.listId, minWidth: columnWidths.listId }} className="flex-shrink-0">
						<div className="px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
							LISTA
						</div>
					</div>
				</div>
			</div>
			
			{/* Área de scroll - SOLO las tareas se mueven */}
			<div className="flex-1 relative overflow-hidden">
				<div 
					ref={containerRef}
					className="h-full overflow-x-auto overflow-y-auto scrollbar-hide"
					style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
				>
					<div style={{ minWidth: totalWidth }}>
						{tasks.map((task, index) => (
							<div
								key={task.id}
								className={cn(
									"flex items-center border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors h-12",
									task.completed ? 'opacity-60' : '',
									"apple-fade-in"
								)}
								style={{ 
									animationDelay: `${index * 25}ms`
								}}
							>
								{/* Checkbox */}
								<div style={{ width: columnWidths.checkbox, minWidth: columnWidths.checkbox }} className="px-3 flex items-center justify-center flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
									<button
										onClick={() => onToggleComplete(task.id, !task.completed)}
										className="flex items-center justify-center w-5 h-5 rounded border border-gray-300 dark:border-gray-600 hover:border-green-500 transition-colors"
									>
										{task.completed ? (
											<CheckSquare className="w-4 h-4 text-green-600" />
										) : (
											<div className="w-4 h-4"></div>
										)}
									</button>
								</div>

								{/* Title */}
								<div style={{ width: columnWidths.title, minWidth: columnWidths.title }} className="px-3 flex items-center flex-shrink-0 overflow-hidden border-r border-gray-200 dark:border-gray-700">
									{editingTaskId === task.id && editingField === 'title' ? (
										<input
											type="text"
											value={editingTitle}
											onChange={(e) => setEditingTitle(e.target.value)}
											onKeyDown={handleTitleKeyDown}
											onBlur={saveEditingTitle}
											className="w-full px-2 py-1 text-sm border border-arrebol-terracota-300 rounded focus:outline-none focus:ring-2 focus:ring-arrebol-terracota-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
											autoFocus
										/>
									) : (
										<button
											onClick={() => startEditingTitle(task)}
											className="text-left w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group py-2 min-w-0"
										>
											<div className={cn(
												"text-sm font-medium leading-relaxed truncate", 
												task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200'
											)}>
												{task.title}
											</div>
										</button>
									)}
								</div>

								{/* Description */}
								<div style={{ width: columnWidths.description, minWidth: columnWidths.description }} className="px-3 flex items-center flex-shrink-0 overflow-hidden border-r border-gray-200 dark:border-gray-700">
									{editingTaskId === task.id && editingField === 'description' ? (
										<input
											type="text"
											value={editingDescription}
											onChange={(e) => setEditingDescription(e.target.value)}
											onKeyDown={handleDescriptionKeyDown}
											onBlur={saveEditingDescription}
											className="w-full px-2 py-1 text-sm border border-arrebol-terracota-300 rounded focus:outline-none focus:ring-2 focus:ring-arrebol-terracota-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
											autoFocus
										/>
									) : (
										<button
											onClick={() => startEditingDescription(task)}
											className="text-left w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group py-2 min-w-0"
										>
											{task.description ? (
												<div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-gray-600 dark:group-hover:text-gray-200 truncate">
													{task.description}
												</div>
											) : (
												<div className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed italic group-hover:text-gray-500 dark:group-hover:text-gray-400 truncate">
													Agregar descripción...
												</div>
											)}
										</button>
									)}
								</div>

								{/* Priority */}
								<div style={{ width: columnWidths.priority, minWidth: columnWidths.priority }} className="px-3 relative flex items-center flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
									<div className="w-full overflow-hidden">
										<button
											data-dropdown={`${task.id}-priority`}
											onClick={() => toggleDropdown(task.id, 'priority')}
											className={cn(
												"apple-priority px-2 py-1.5 text-sm font-medium rounded-full flex items-center justify-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700 w-[110px] min-w-0",
												getPriorityColor(task.priority),
												task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
											)}
										>
											<Flag className={cn("w-3.5 h-3.5 flex-shrink-0", getPriorityColor(task.priority))} />
											<span className="truncate text-center">{getPriorityLabel(task.priority)}</span>
										</button>
									</div>
									
									<DropdownPortal taskId={task.id} field="priority">
										{PRIORITY_OPTIONS.map((option) => (
											<button
												key={option.value}
												onClick={() => {
													onUpdateTask(task.id, { priority: option.value })
													closeDropdown(task.id)
												}}
												className={cn(
													"w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg",
													task.priority === option.value 
														? "bg-arrebol-terracota-50 dark:bg-arrebol-terracota-900/30 border-l-2 border-arrebol-terracota-500 text-arrebol-terracota-700 dark:text-arrebol-terracota-300" 
														: "hover:bg-arrebol-terracota-25 dark:hover:bg-arrebol-terracota-900/20 hover:text-arrebol-terracota-600 dark:hover:text-arrebol-terracota-400"
												)}
											>
												<Flag className={cn("w-3.5 h-3.5", `text-[${option.color}]`)} />
												{option.label}
											</button>
										))}
									</DropdownPortal>
								</div>

								{/* Status */}
								<div style={{ width: columnWidths.status, minWidth: columnWidths.status }} className="px-3 relative flex items-center flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
									<div className="w-full overflow-hidden">
										<button
											data-dropdown={`${task.id}-status`}
											onClick={() => toggleDropdown(task.id, 'status')}
											className={cn(
												"apple-priority px-2 py-1.5 text-sm font-medium rounded-full flex items-center justify-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700 w-[130px] min-w-0",
												getStatusColor(task.status),
												task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
											)}
										>
											{getStatusIcon(task.status)}
											<span className="truncate text-center">{getStatusLabel(task.status)}</span>
										</button>
									</div>
									
									<DropdownPortal taskId={task.id} field="status">
										{STATUS_OPTIONS.map((option) => (
											<button
												key={option.value}
												onClick={() => {
													onUpdateStatus(task.id, option.value)
													closeDropdown(task.id)
												}}
												className={cn(
													"w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg",
													task.status === option.value 
														? "bg-arrebol-terracota-50 dark:bg-arrebol-terracota-900/30 border-l-2 border-arrebol-terracota-500 text-arrebol-terracota-700 dark:text-arrebol-terracota-300" 
														: "hover:bg-arrebol-terracota-25 dark:hover:bg-arrebol-terracota-900/20 hover:text-arrebol-terracota-600 dark:hover:text-arrebol-terracota-400"
												)}
											>
												{(() => {
													const IconComponent = option.icon
													return <IconComponent className="w-3.5 h-3.5" style={{ color: option.color }} />
												})()}
												{option.label}
											</button>
										))}
									</DropdownPortal>
								</div>

								{/* Due Date */}
								<div style={{ width: columnWidths.dueDate, minWidth: columnWidths.dueDate }} className="px-3 relative flex items-center flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
									<div className="w-full overflow-hidden">
										<button
											data-dropdown={`${task.id}-date`}
											onClick={() => toggleDropdown(task.id, 'date')}
											className={cn(
												"apple-priority px-2 py-1.5 text-sm font-medium rounded-full flex items-center justify-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700 w-[110px] min-w-0",
												task.dueDate ? getDueDateColor(new Date(task.dueDate)) : "text-gray-400 dark:text-gray-500",
												task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
											)}
										>
											<Calendar className="w-3.5 h-3.5 flex-shrink-0" />
											<span className="truncate text-center">{task.dueDate ? formatDueDate(new Date(task.dueDate)) : 'Sin fecha'}</span>
										</button>
									</div>
									
									<DropdownPortal taskId={task.id} field="date">
										<CalendarPicker
											selectedDate={task.dueDate ? new Date(task.dueDate) : new Date()}
											onDateSelect={(date) => {
												onUpdateTask(task.id, { dueDate: date })
												closeDropdown(task.id)
											}}
											onClose={() => closeDropdown(task.id)}
										/>
										{/* Removed "Quitar fecha" option */}
									</DropdownPortal>
								</div>

								{/* List */}
								<div style={{ width: columnWidths.listId, minWidth: columnWidths.listId }} className="px-3 relative flex items-center justify-center flex-shrink-0">
									<div className="w-full overflow-hidden flex justify-center">
										<button
											data-dropdown={`${task.id}-list`}
											onClick={() => toggleDropdown(task.id, 'list')}
											className={cn(
												"apple-tag px-2 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 flex items-center justify-center gap-1.5 border border-gray-200 dark:border-gray-700 w-[150px] min-w-0",
												"text-gray-600 dark:text-gray-400",
												task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
											)}
											title={lists.find(l => l.id === task.listId)?.title || 'Tareas Rápidas'}
										>
											{(() => {
												const currentList = lists.find(l => l.id === task.listId)
												const IconComponent = currentList?.icon ? iconMap[currentList.icon as keyof typeof iconMap] || ListIcon : ListIcon
												return (
													<>
														<IconComponent 
															className={cn(
																"w-3 h-3 flex-shrink-0",
																!currentList?.color && "text-arrebol-beige-600"
															)}
															style={currentList?.color ? { color: currentList.color } : {}}
														/>
														<span className={cn(
															"truncate text-xs",
															!currentList?.color && "text-arrebol-beige-600"
														)} style={currentList?.color ? { color: currentList.color } : {}}>
															{currentList?.title || 'Rápidas'}
														</span>
													</>
												)
											})()}
										</button>
									</div>
									
									<DropdownPortal taskId={task.id} field="list">
										{lists.map((list) => {
											const IconComponent = list.icon ? iconMap[list.icon as keyof typeof iconMap] || ListIcon : ListIcon
											return (
												<button
													key={list.id}
													onClick={() => {
														onUpdateTask(task.id, { listId: list.id })
														closeDropdown(task.id)
													}}
													className={cn(
														"w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors first:rounded-t-lg last:rounded-b-lg",
														task.listId === list.id 
															? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500" 
															: "hover:bg-gray-50 dark:hover:bg-gray-800"
													)}
												>
													<IconComponent 
														className={cn(
															"w-3 h-3 flex-shrink-0",
															!list.color && "text-arrebol-beige-600"
														)}
														style={list.color ? { color: list.color } : {}}
													/>
													<span className={cn(
														"truncate",
														!list.color && "text-arrebol-beige-600"
													)} style={list.color ? { color: list.color } : {}}>
														{list.title}
													</span>
												</button>
											)
										})}
									</DropdownPortal>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			
			{/* Barra de desplazamiento horizontal FLOTANTE - FIJA */}
			<div className="absolute bottom-2 left-2 right-2 z-50 h-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex items-center px-3">
				{maxScroll > 0 ? (
					<>
						{/* Left Arrow */}
						<button
							className="z-10 w-6 h-6 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
							onClick={() => {
								if (containerRef.current) {
									containerRef.current.scrollLeft = Math.max(0, containerRef.current.scrollLeft - 200)
								}
							}}
							disabled={scrollPosition <= 0}
						>
							<ChevronLeft size={12} className={`${scrollPosition <= 0 ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`} />
						</button>

						{/* Scrollbar Track */}
						<div className="flex-1 mx-2 relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
							<div
								className="absolute top-0 bottom-0 bg-arrebol-terracota-400 hover:bg-arrebol-terracota-500 rounded-full cursor-pointer transition-colors"
								style={{
									left: `${scrollProgress * (100 - scrollbarThumbWidth)}%`,
									width: `${scrollbarThumbWidth}%`
								}}
								onMouseDown={handleCustomScrollbarDrag}
							/>
						</div>

						{/* Right Arrow */}
						<button
							className="z-10 w-6 h-6 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
							onClick={() => {
								if (containerRef.current) {
									containerRef.current.scrollLeft = Math.min(maxScroll, containerRef.current.scrollLeft + 200)
								}
							}}
							disabled={scrollPosition >= maxScroll}
						>
							<ChevronRight size={12} className={`${scrollPosition >= maxScroll ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`} />
						</button>
					</>
				) : (
					/* Placeholder when no horizontal scroll needed */
					<div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-2" />
				)}
			</div>
		</div>
	)
}

export default TaskListViewCrm
