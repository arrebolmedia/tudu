'use client'

import { Task, TaskStatus, Priority, List, PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/types'
import { 
	CheckSquare, 
	Square, 
	Calendar, 
	Flag, 
	Clock,
	ArrowUpDown,
	ChevronDown,
	ChevronUp,
	Circle,
	Play,
	CheckCircle as CheckCircleIcon,
	List as ListIcon,
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
import { useState, useEffect, useRef } from 'react'
import { cn, getPriorityColor, getPriorityLabel, isToday, isTomorrow, isOverdue } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarPicker } from '@/components/ui/calendar-picker'

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

interface TaskListViewProps {
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

// Función para obtener el color del estado
const getStatusColor = (status: TaskStatus) => {
	switch (status) {
		case 'PENDING': return 'text-gray-600'
		case 'IN_PROGRESS': return 'text-yellow-600'
		case 'COMPLETED': return 'text-green-600'
		default: return 'text-gray-600'
	}
}

// Función para obtener el icono del estado
const getStatusIcon = (status: TaskStatus) => {
	switch (status) {
		case 'PENDING': return <Circle className="w-3.5 h-3.5" />
		case 'IN_PROGRESS': return <Play className="w-3.5 h-3.5" />
		case 'COMPLETED': return <CheckCircleIcon className="w-3.5 h-3.5" />
		default: return <Circle className="w-3.5 h-3.5" />
	}
}

// Función para obtener la etiqueta del estado
const getStatusLabel = (status: TaskStatus) => {
	const option = STATUS_OPTIONS.find(opt => opt.value === status)
	return option?.label || status
}

// Función para formatear fechas como en task-item
const formatDueDate = (date: Date) => {
	if (isToday(date)) return 'Hoy'
	if (isTomorrow(date)) return 'Mañana'
	return format(date, 'MMM d', { locale: es })
}

// Función para obtener color de fecha como en task-item  
const getDueDateColor = (date: Date) => {
	if (isOverdue(date)) return 'text-red-600'
	    if (isToday(date)) return 'text-arrebol-terracota-600'
	if (isTomorrow(date)) return 'text-orange-600'
	return 'text-gray-600'
}

export function TaskListView({
	tasks,
	lists,
	onToggleComplete,
	onUpdateStatus,
	onUpdateTask,
	onEditTask,
	sortBy,
	sortOrder,
	onSort
}: TaskListViewProps) {
	const [openDropdowns, setOpenDropdowns] = useState<Record<string, string | null>>({})
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
	const [editingField, setEditingField] = useState<'title' | 'description' | null>(null)
	const [editingTitle, setEditingTitle] = useState('')
	const [editingDescription, setEditingDescription] = useState('')
	const [columnWidths, setColumnWidths] = useState(() => {
		// Cargar anchos guardados de localStorage
		if (typeof window !== 'undefined') {
			try {
				const saved = localStorage.getItem('taskListColumnWidths')
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
			title: 250,
			description: 200,
			priority: 120,
			status: 120,
			date: 120,
			list: 80
		}
	})
	const [isResizing, setIsResizing] = useState<string | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const [scrollPosition, setScrollPosition] = useState(0)
	const [maxScroll, setMaxScroll] = useState(0)

	// Guardar anchos de columna en localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('taskListColumnWidths', JSON.stringify(columnWidths))
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
		}

		updateScrollInfo()
		container.addEventListener('scroll', updateScrollInfo)
		
		const resizeObserver = new ResizeObserver(updateScrollInfo)
		resizeObserver.observe(container)

		return () => {
			container.removeEventListener('scroll', updateScrollInfo)
			resizeObserver.disconnect()
		}
	}, [tasks, columnWidths])

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

	const toggleDropdown = (taskId: string, dropdownType: string) => {
		setOpenDropdowns(prev => {
			// Si el dropdown actual está abierto, lo cerramos
			if (prev[taskId] === dropdownType) {
				return {
					...prev,
					[taskId]: null
				}
			}
			
			// Si no, cerramos todos y abrimos solo el solicitado
			const newState: Record<string, string | null> = {}
			Object.keys(prev).forEach(key => {
				newState[key] = null
			})
			newState[taskId] = dropdownType 	
			
			return newState
		})
	}

	const closeDropdown = (taskId: string) => {
		setOpenDropdowns(prev => ({
			...prev,
			[taskId]: null
		}))
	}

	const closeAllDropdowns = () => {
		setOpenDropdowns({})
	}

	const startEditingTitle = (task: Task) => {
		setEditingTaskId(task.id)
		setEditingField('title')
		setEditingTitle(task.title)
	}

	const saveEditingTitle = () => {
		if (editingTaskId && editingTitle.trim()) {
			onUpdateTask(editingTaskId, { title: editingTitle.trim() })
		}
		setEditingTaskId(null)
		setEditingField(null)
		setEditingTitle('')
	}

	const cancelEditingTitle = () => {
		setEditingTaskId(null)
		setEditingField(null)
		setEditingTitle('')
	}

	const startEditingDescription = (task: Task) => {
		setEditingTaskId(task.id)
		setEditingField('description')
		setEditingDescription(task.description || '')
	}

	const saveEditingDescription = () => {
		if (editingTaskId) {
			onUpdateTask(editingTaskId, { description: editingDescription.trim() || undefined })
		}
		setEditingTaskId(null)
		setEditingField(null)
		setEditingDescription('')
	}

	const cancelEditingDescription = () => {
		setEditingTaskId(null)
		setEditingField(null)
		setEditingDescription('')
	}

	const handleTitleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			saveEditingTitle()
		} else if (e.key === 'Escape') {
			cancelEditingTitle()
		}
	}

	const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			saveEditingDescription()
		} else if (e.key === 'Escape') {
			cancelEditingDescription()
		}
	}

	const handleMouseDown = (column: string, e: React.MouseEvent) => {
		e.preventDefault()
		setIsResizing(column)
		
		const startX = e.clientX
		const startWidth = columnWidths[column as keyof typeof columnWidths]
		
		const handleMouseMove = (e: MouseEvent) => {
			const diff = e.clientX - startX
			const newWidth = Math.max(60, startWidth + diff)
			setColumnWidths((prev: typeof columnWidths) => ({
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
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				closeAllDropdowns()
				if (editingTaskId && editingField) {
					if (editingField === 'title') {
						saveEditingTitle()
					} else if (editingField === 'description') {
						saveEditingDescription()
					}
				}
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [editingTaskId, editingField])
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
			className="relative flex items-center group h-full last:border-r-0 overflow-hidden"
			style={style}
		>
			<div className="flex-1 min-w-0 overflow-hidden">
				{field ? (
					<SortHeader field={field}>{children}</SortHeader>
				) : (
					<span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left w-full block truncate">
						{children}
					</span>
				)}
			</div>
			<div
				className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-gray-300 dark:bg-gray-600 hover:bg-arrebol-terracota-400 dark:hover:bg-arrebol-terracota-500 transition-colors z-10"
				onMouseDown={(e) => handleMouseDown(column, e)}
				title="Arrastrar para cambiar el ancho de la columna"
			>
			</div>
		</div>
	)

	return (
		<div className="relative h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600">
			<div 
				ref={containerRef} 
				className="flex-1 overflow-y-auto"
				style={{ 
					overflowX: 'hidden', // Ocultar la barra nativa
					scrollbarWidth: 'none', // Firefox
					msOverflowStyle: 'none' // IE
				}}
			>
				<div className="min-w-max">
					<style jsx>{`
						.excel-row {
							position: relative;
						}
						.excel-row::after {
							content: '';
							position: absolute;
							left: 0;
							right: 0;
							bottom: 0;
							height: 0.5px;
							background-color: rgb(226 232 240);
							z-index: 2;
						}
						.dark .excel-row::after {
							background-color: rgb(100 116 139);
						}
						
						/* Ocultar barra de scroll nativa de webkit */
						div::-webkit-scrollbar {
							display: none;
						}
					`}</style>
				{/* Header */}
				<div className="excel-row bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
					<div className="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider h-10">
						<div style={{ width: columnWidths.checkbox, minWidth: columnWidths.checkbox }} className="px-3 flex items-center justify-center flex-shrink-0">
							<ResizableHeader column="checkbox">
								<span></span>
							</ResizableHeader>
						</div>
						<div style={{ width: columnWidths.title, minWidth: columnWidths.title }} className="px-3 flex-shrink-0">
							<ResizableHeader column="title" field="title">
								TAREA
							</ResizableHeader>
						</div>
						<div style={{ width: columnWidths.description, minWidth: columnWidths.description }} className="px-3 flex-shrink-0">
							<ResizableHeader column="description" field="description">
								DESCRIPCIÓN
							</ResizableHeader>
						</div>
						<div style={{ width: columnWidths.priority, minWidth: columnWidths.priority }} className="px-3 flex-shrink-0">
							<ResizableHeader column="priority" field="priority">
								PRIORIDAD
							</ResizableHeader>
						</div>
						<div style={{ width: columnWidths.status, minWidth: columnWidths.status }} className="px-3 flex-shrink-0">
							<ResizableHeader column="status" field="status">
								ESTADO
							</ResizableHeader>
						</div>
						<div style={{ width: columnWidths.date, minWidth: columnWidths.date }} className="px-3 flex-shrink-0">
							<ResizableHeader column="date" field="dueDate">
								FECHA
							</ResizableHeader>
						</div>
						<div style={{ width: columnWidths.list, minWidth: columnWidths.list }} className="px-3 flex-shrink-0">
							<ResizableHeader column="list" field="listId">
								LISTA
							</ResizableHeader>
						</div>
					</div>
				</div>

				{/* Rows */}
				<div className="overflow-hidden">
					{tasks.map((task, index) => {
						return (
							<div
								key={`${task.id}-${task.position}-${task.updatedAt?.getTime()}`}
								className={`excel-row flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors apple-fade-in h-10 ${
									task.completed ? 'opacity-60' : ''
								}`}
								style={{ 
									animationDelay: `${index * 25}ms`
								}}
							>
								{/* Checkbox */}
								<div style={{ width: columnWidths.checkbox, minWidth: columnWidths.checkbox }} className="px-3 flex items-center justify-center flex-shrink-0">
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
								<div style={{ width: columnWidths.title, minWidth: columnWidths.title }} className="px-3 flex items-center flex-shrink-0 overflow-hidden">
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
											<div className={`text-sm font-medium leading-relaxed truncate ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>
												{task.title}
											</div>
										</button>
									)}
								</div>

								{/* Description */}
								<div style={{ width: columnWidths.description, minWidth: columnWidths.description }} className="px-3 flex items-center flex-shrink-0 overflow-hidden">
									{editingTaskId === task.id && editingField === 'description' ? (
										<input
											type="text"
											value={editingDescription}
											onChange={(e) => setEditingDescription(e.target.value)}
											onKeyDown={handleDescriptionKeyDown}
											onBlur={saveEditingDescription}
											className="w-full px-2 py-1 text-sm border border-arrebol-terracota-300 rounded focus:outline-none focus:ring-2 focus:ring-arrebol-terracota-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
											placeholder="Agregar descripción..."
											autoFocus
										/>
									) : (
										<button
											onClick={() => startEditingDescription(task)}
											className="text-left w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group py-2 min-w-0"
										>
											{task.description ? (
												<div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 truncate">
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
								<div style={{ width: columnWidths.priority, minWidth: columnWidths.priority }} className="px-3 relative flex items-center flex-shrink-0">
									<div className="w-full overflow-hidden">
										<button
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
								
								{openDropdowns[task.id] === 'priority' && (
									<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[100] overflow-hidden">
										{PRIORITY_OPTIONS.map((option) => (
											<button
												key={option.value}
												onClick={() => {
													onUpdateTask(task.id, { priority: option.value })
													closeDropdown(task.id)
												}}
												className={cn(
													"w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
													getPriorityColor(option.value),
													task.priority === option.value ? "bg-gray-50 dark:bg-gray-800" : ""
												)}
											>
												<Flag className={cn("w-3.5 h-3.5", getPriorityColor(option.value))} />
												{option.label}
											</button>
										))}
									</div>
								)}
							</div>

							{/* Status */}
							<div style={{ width: columnWidths.status, minWidth: columnWidths.status }} className="px-3 relative flex items-center flex-shrink-0">
								<div className="w-full overflow-hidden">
									<button
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
								
								{openDropdowns[task.id] === 'status' && (
									<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[100] overflow-hidden">
										{STATUS_OPTIONS.map((option) => (
											<button
												key={option.value}
												onClick={() => {
													onUpdateStatus(task.id, option.value)
													closeDropdown(task.id)
												}}
												className={cn(
													"w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
													getStatusColor(option.value),
													task.status === option.value ? "bg-gray-50 dark:bg-gray-800" : ""
												)}
											>
												{(() => {
													switch (option.value) {
														case 'PENDING': return <Circle className="w-3.5 h-3.5" />
														case 'IN_PROGRESS': return <Play className="w-3.5 h-3.5" />
														case 'COMPLETED': return <CheckCircleIcon className="w-3.5 h-3.5" />
														default: return <Circle className="w-3.5 h-3.5" />
													}
												})()}
												{option.label}
											</button>
										))}
									</div>
								)}
							</div>

							{/* Due Date */}
							<div style={{ width: columnWidths.date, minWidth: columnWidths.date }} className="px-3 relative flex items-center flex-shrink-0">
								<div className="w-full overflow-hidden">
									<button
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
								
								{openDropdowns[task.id] === 'date' && (
									<div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[100] min-w-[420px] max-w-[450px]">
										<CalendarPicker
											selectedDate={task.dueDate ? new Date(task.dueDate) : new Date()}
											onDateSelect={(date) => {
												onUpdateTask(task.id, { dueDate: date })
												closeDropdown(task.id)
											}}
											onClose={() => closeDropdown(task.id)}
										/>
										{task.dueDate && (
											<div className="border-t border-gray-200 dark:border-gray-700 p-3">
												<button
													onClick={() => {
														onUpdateTask(task.id, { dueDate: undefined })
														closeDropdown(task.id)
													}}
													className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
												>
													Quitar fecha
												</button>
											</div>
										)}
									</div>
								)}
							</div>

							{/* List */}
							<div style={{ width: columnWidths.list, minWidth: columnWidths.list }} className="px-3 relative flex items-center justify-center flex-shrink-0">
								<div className="w-full overflow-hidden flex justify-center">
									<button
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
								
								{openDropdowns[task.id] === 'list' && (
									<div className="absolute bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[100] overflow-hidden min-w-[200px] max-w-[250px]" 
										style={{
											right: '0',
											top: 'auto',
											bottom: '100%',
											marginBottom: '4px'
										}}>
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
														"w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
														task.listId === list.id ? "bg-gray-50 dark:bg-gray-800" : ""
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
									</div>
								)}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	</div>
		
		{/* Barra de desplazamiento horizontal personalizada flotante */}
		{maxScroll > 0 && (
			<div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center px-2">
				<div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
					<div
						className="absolute h-2 bg-gray-400 dark:bg-gray-500 rounded-full cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-400 transition-colors"
						style={{
							left: maxScroll > 0 ? `${(scrollPosition / maxScroll) * 100}%` : '0%',
							width: maxScroll > 0 ? `${Math.max(10, (containerRef.current?.clientWidth || 0) / (containerRef.current?.scrollWidth || 1) * 100)}%` : '100%'
						}}
						onMouseDown={handleCustomScrollbarDrag}
					/>
				</div>
			</div>
		)}
		</div>
	)
}