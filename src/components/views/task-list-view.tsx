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
	if (isToday(date)) return 'text-blue-600'
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
	const containerRef = useRef<HTMLDivElement>(null)

	const toggleDropdown = (taskId: string, dropdownType: string) => {
		setOpenDropdowns(prev => ({
			...prev,
			[taskId]: prev[taskId] === dropdownType ? null : dropdownType
		}))
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

	// Cerrar dropdowns al hacer clic fuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				closeAllDropdowns()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])
	const SortHeader = ({ field, children }: { field: string, children: React.ReactNode }) => (
		<button
			onClick={() => onSort(field)}
			className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
		>
			{children}
			{sortBy === field && (
				sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
			)}
		</button>
	)

	return (
		<div ref={containerRef} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden max-w-none w-full">
			{/* Header */}
			<div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
				<div className="grid grid-cols-12 gap-6 items-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
					<div className="col-span-1"></div>
					<div className="col-span-4">
						<SortHeader field="title">Tarea</SortHeader>
					</div>
					<div className="col-span-2">
						<SortHeader field="priority">Prioridad</SortHeader>
					</div>
					<div className="col-span-2">
						<SortHeader field="status">Estado</SortHeader>
					</div>
					<div className="col-span-2">
						<SortHeader field="dueDate">Fecha</SortHeader>
					</div>
					<div className="col-span-1">Lista</div>
				</div>
			</div>

			{/* Rows */}
			<div className="divide-y divide-gray-200 dark:divide-gray-600">
				{tasks.map((task, index) => {
					return (
						<div
							key={`${task.id}-${task.position}-${task.updatedAt?.getTime()}`}
							className={`grid grid-cols-12 gap-6 items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors apple-fade-in ${
								task.completed ? 'opacity-60' : ''
							}`}
							style={{ 
								animationDelay: `${index * 25}ms`
							}}
						>
							{/* Checkbox */}
							<div className="col-span-1">
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
							<div className="col-span-4">
								<button
									onClick={() => onEditTask(task)}
									className="text-left w-full hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-1 -m-1 transition-colors"
								>
									<div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
										{task.title}
									</div>
									{task.description && (
										<div className="text-sm text-gray-500 dark:text-gray-400 truncate">
											{task.description}
										</div>
									)}
								</button>
							</div>

							{/* Priority */}
							<div className="col-span-2 relative">
								<button
									onClick={() => toggleDropdown(task.id, 'priority')}
									className={cn(
										"apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700 w-full",
										getPriorityColor(task.priority),
										task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
									)}
								>
									<Flag className={cn("w-3.5 h-3.5 flex-shrink-0", getPriorityColor(task.priority))} />
									{getPriorityLabel(task.priority)}
								</button>
								
								{openDropdowns[task.id] === 'priority' && (
									<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
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
							<div className="col-span-2 relative">
								<button
									onClick={() => toggleDropdown(task.id, 'status')}
									className={cn(
										"apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700 w-full",
										getStatusColor(task.status),
										task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
									)}
								>
									{getStatusIcon(task.status)}
									{getStatusLabel(task.status)}
								</button>
								
								{openDropdowns[task.id] === 'status' && (
									<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
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
							<div className="col-span-2 relative">
								<button
									onClick={() => toggleDropdown(task.id, 'date')}
									className={cn(
										"apple-priority px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 transition-colors duration-200 border border-gray-200 dark:border-gray-700 w-full",
										task.dueDate ? getDueDateColor(new Date(task.dueDate)) : "text-gray-400 dark:text-gray-500",
										task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
									)}
								>
									<Calendar className="w-3.5 h-3.5 flex-shrink-0" />
									{task.dueDate ? formatDueDate(new Date(task.dueDate)) : 'Sin fecha'}
								</button>
								
								{openDropdowns[task.id] === 'date' && (
									<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-3">
										<input
											type="date"
											value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
											onChange={(e) => {
												onUpdateTask(task.id, { 
													dueDate: e.target.value ? new Date(e.target.value) : undefined 
												})
												closeDropdown(task.id)
											}}
											className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
										/>
										{task.dueDate && (
											<button
												onClick={() => {
													onUpdateTask(task.id, { dueDate: undefined })
													closeDropdown(task.id)
												}}
												className="w-full mt-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
											>
												Quitar fecha
											</button>
										)}
									</div>
								)}
							</div>

							{/* List */}
							<div className="col-span-1 relative">
								<button
									onClick={() => toggleDropdown(task.id, 'list')}
									className={cn(
										"apple-tag px-2 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 w-full flex items-center justify-center border border-gray-200 dark:border-gray-700",
										"text-gray-600 dark:text-gray-400",
										task.completed ? "hover:bg-gray-25 dark:hover:bg-gray-800/25" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
									)}
									title={lists.find(l => l.id === task.listId)?.title || 'Tareas Rápidas'}
								>
									{(() => {
										const currentList = lists.find(l => l.id === task.listId)
										const IconComponent = currentList?.icon ? iconMap[currentList.icon as keyof typeof iconMap] || ListIcon : ListIcon
										return (
											<IconComponent 
												className="w-4 h-4" 
												style={currentList?.color ? { color: currentList.color } : {}}
											/>
										)
									})()}
								</button>
								
								{openDropdowns[task.id] === 'list' && (
									<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
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
														className="w-3 h-3 flex-shrink-0" 
														style={list.color ? { color: list.color } : {}}
													/>
													<span className="truncate">{list.title}</span>
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
	)
}
