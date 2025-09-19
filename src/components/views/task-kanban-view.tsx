'use client'

import { Task, TaskStatus, Priority } from '@/types'
import { TaskItem } from '@/components/tasks/task-item'
import { Clock, ArrowRight, CheckCircle, Filter, SortAsc, Flag, Calendar } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import {
	DndContext,
	DragEndEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
	closestCenter,
	useDroppable
} from '@dnd-kit/core'
import {
	SortableContext,
	verticalListSortingStrategy
} from '@dnd-kit/sortable'
import {
	useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

interface TaskKanbanViewProps {
	tasks: Task[]
	onToggleComplete: (taskId: string, completed: boolean) => void
	onUpdateStatus: (taskId: string, status: TaskStatus) => void
	onUpdateTask: (taskId: string, updates: Partial<Task>) => void
	onDelete: (taskId: string) => void
	onArchive: (taskId: string) => void
	onRestore: (taskId: string) => void
	onCancelDeletion: (taskId: string) => void
}

type SortOption = 'status' | 'priority' | 'date'
type DateGrouping = 'today' | 'tomorrow' | 'later' | 'all'

// Definiciones de columnas por tipo de vista
const statusColumns = [
	{
		id: 'PENDING',
		title: 'Pendiente',
		icon: Clock,
		color: 'border-gray-300 bg-gray-50',
		headerColor: 'text-gray-700',
		filter: (task: Task) => task.status === 'PENDING'
	},
	{
		id: 'IN_PROGRESS',
		title: 'En Progreso',
		icon: ArrowRight,
		color: 'border-arrebol-terracota-300 bg-arrebol-terracota-50',
		headerColor: 'text-arrebol-terracota-700',
		filter: (task: Task) => task.status === 'IN_PROGRESS'
	},
	{
		id: 'COMPLETED',
		title: 'Completado',
		icon: CheckCircle,
		color: 'border-green-300 bg-green-50',
		headerColor: 'text-green-700',
		filter: (task: Task) => task.status === 'COMPLETED'
	}
]

const priorityColumns = [
	{
		id: 'HIGH',
		title: 'Alta Prioridad',
		icon: Flag,
		color: 'border-red-300 bg-red-50',
		headerColor: 'text-red-700',
		filter: (task: Task) => task.priority === 'HIGH'
	},
	{
		id: 'NORMAL',
		title: 'Prioridad Normal',
		icon: Flag,
		color: 'border-yellow-300 bg-yellow-50',
		headerColor: 'text-yellow-700',
		filter: (task: Task) => task.priority === 'NORMAL'
	},
	{
		id: 'LOW',
		title: 'Baja Prioridad',
		icon: Flag,
		color: 'border-green-300 bg-green-50',
		headerColor: 'text-green-700',
		filter: (task: Task) => task.priority === 'LOW'
	}
]

const dateColumns = [
	{
		id: 'today',
		title: 'Hoy',
		icon: Clock,
		color: 'border-red-300 bg-red-50',
		headerColor: 'text-red-700',
		filter: (task: Task) => {
			if (!task.dueDate) return false
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			const taskDate = new Date(task.dueDate)
			taskDate.setHours(0, 0, 0, 0)
			return taskDate.getTime() === today.getTime()
		}
	},
	{
		id: 'tomorrow',
		title: 'Mañana',
		icon: Calendar,
		color: 'border-orange-300 bg-orange-50',
		headerColor: 'text-orange-700',
		filter: (task: Task) => {
			if (!task.dueDate) return false
			const tomorrow = new Date()
			tomorrow.setDate(tomorrow.getDate() + 1)
			tomorrow.setHours(0, 0, 0, 0)
			const taskDate = new Date(task.dueDate)
			taskDate.setHours(0, 0, 0, 0)
			return taskDate.getTime() === tomorrow.getTime()
		}
	},
	{
		id: 'later',
		title: 'Más Adelante',
		icon: ArrowRight,
		color: 'border-arrebol-terracota-300 bg-arrebol-terracota-50',
		headerColor: 'text-arrebol-terracota-700',
		filter: (task: Task) => {
			if (!task.dueDate) return true // Sin fecha se considera "más adelante"
			const tomorrow = new Date()
			tomorrow.setDate(tomorrow.getDate() + 1)
			tomorrow.setHours(23, 59, 59, 999)
			const taskDate = new Date(task.dueDate)
			return taskDate.getTime() > tomorrow.getTime()
		}
	}
]

// Componente DroppableColumn para las áreas de drop
function DroppableColumn({ 
	column, 
	children,
	taskCount
}: { 
	column: { id: string; title: string; icon: any; color: string; headerColor: string }
	children: React.ReactNode
	taskCount: number
}) {
	const { setNodeRef, isOver } = useDroppable({
		id: column.id
	})

	const IconComponent = column.icon

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"flex flex-col rounded-lg border-2 min-h-0 transition-all duration-200",
				column.color,
				isOver && "ring-2 ring-blue-400 ring-opacity-50 border-blue-300 bg-blue-50 dark:bg-blue-900/20"
			)}
		>
			{/* Column Header */}
			<div className="p-4 border-b border-gray-200">
				<div className="flex items-center gap-3">
					<IconComponent size={20} className={column.headerColor} />
					<h3 className={`font-semibold ${column.headerColor}`}>
						{column.title}
					</h3>
					<span className="bg-white text-gray-600 text-sm px-2 py-1 rounded-full">
						{taskCount}
					</span>
				</div>
			</div>

			{/* Column Content */}
			<div className={cn(
				"flex-1 p-4 space-y-4 overflow-y-auto",
				"min-h-32",
				isOver && "bg-blue-25 dark:bg-blue-900/10"
			)}>
				{children}
			</div>
		</div>
	)
}

// Componente SortableTask para drag and drop
function SortableTask({ 
	task, 
	onToggleComplete, 
	onUpdateStatus, 
	onUpdateTask, 
	onDelete, 
	onArchive, 
	onRestore, 
	onCancelDeletion,
	index 
}: {
	task: Task
	onToggleComplete: (taskId: string, completed: boolean) => void
	onUpdateStatus: (taskId: string, status: TaskStatus) => void
	onUpdateTask: (taskId: string, updates: Partial<Task>) => void
	onDelete: (taskId: string) => void
	onArchive: (taskId: string) => void
	onRestore: (taskId: string) => void
	onCancelDeletion: (taskId: string) => void
	index: number
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging
	} = useSortable({ 
		id: task.id,
		data: {
			type: 'task',
			task
		}
	})

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"apple-fade-in transition-all duration-200",
				isDragging && "opacity-50 rotate-2 scale-105 z-50"
			)}
			style={{ 
				animationDelay: `${index * 50}ms`,
				transform: CSS.Transform.toString(transform),
				transition,
			}}
		>
			<div 
				{...attributes}
				{...listeners}
				className={cn(
					"bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing",
					isDragging && "shadow-lg border-blue-300"
				)}
			>
				<TaskItem
					task={task}
					onToggleComplete={onToggleComplete}
					onUpdateStatus={onUpdateStatus}
					onUpdateTask={onUpdateTask}
					onDelete={onDelete}
					onArchive={onArchive}
					onRestore={onRestore}
					onCancelDeletion={onCancelDeletion}
					variant="compact"
				/>
			</div>
		</div>
	)
}

export function TaskKanbanView({
	tasks,
	onToggleComplete,
	onUpdateStatus,
	onUpdateTask,
	onDelete,
	onArchive,
	onRestore,
	onCancelDeletion
}: TaskKanbanViewProps) {
	const [activeTask, setActiveTask] = useState<Task | null>(null)
	const [sortOption, setSortOption] = useState<SortOption>('status')
	const [dateGrouping, setDateGrouping] = useState<DateGrouping>('all')
	const [showSortOptions, setShowSortOptions] = useState(false)

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8
			}
		})
	)

	// Función para obtener las columnas según el modo actual
	const getCurrentColumns = useMemo(() => {
		switch (sortOption) {
			case 'priority':
				return [...priorityColumns] // Crear copia nueva
			case 'date':
				return [...dateColumns] // Crear copia nueva
			case 'status':
			default:
				return [...statusColumns] // Crear copia nueva
		}
	}, [sortOption])

	// Función para ordenar tareas dentro de una columna
	const sortTasksInColumn = (tasks: Task[]): Task[] => {
		// Cuando las columnas definen la agrupación principal, el orden interno puede ser por fecha o manual
		return [...tasks].sort((a, b) => {
			// Primero por completadas (las completadas al final)
			if (a.completed !== b.completed) {
				return a.completed ? 1 : -1
			}
			
			// Luego por fecha de vencimiento
			if (a.dueDate && b.dueDate) {
				return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
			}
			if (a.dueDate && !b.dueDate) return -1
			if (!a.dueDate && b.dueDate) return 1
			
			// Finalmente por posición
			return (a.position || 0) - (b.position || 0)
		})
	}

	const getTasksForColumn = useMemo(() => {
		return (columnId: string) => {
			const column = getCurrentColumns.find(col => col.id === columnId)
			if (!column?.filter) return []
			
			const columnTasks = tasks.filter(column.filter)
			return sortTasksInColumn(columnTasks)
		}
	}, [getCurrentColumns, tasks])

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event
		const task = tasks.find(t => t.id === active.id)
		setActiveTask(task || null)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		setActiveTask(null)

		if (!over) return

		const activeTask = tasks.find(t => t.id === active.id)
		if (!activeTask) return

		// Obtener el ID de la columna de destino
		let targetColumnId: string | null = null

		// Primero verificar si se soltó directamente sobre una columna
		if (getCurrentColumns.some((col: any) => col.id === over.id)) {
			targetColumnId = over.id as string
		} else {
			// Si se soltó sobre otra tarea, buscar la columna contenedora
			const overTask = tasks.find(t => t.id === over.id)
			if (overTask) {
				// Encontrar en qué columna está la tarea de destino
				const targetColumn = getCurrentColumns.find((col: any) => col.filter(overTask))
				if (targetColumn) {
					targetColumnId = targetColumn.id
				}
			}
		}

		console.log('Drag end:', { activeTask: activeTask.title, targetColumnId, sortOption })

		if (!targetColumnId) return

		// Aplicar cambios según el tipo de vista
		switch (sortOption) {
			case 'status':
				// Solo cambiar status si es diferente
				if (targetColumnId !== activeTask.status) {
					onUpdateStatus(activeTask.id, targetColumnId as TaskStatus)
				}
				break
			
			case 'priority':
				// Cambiar prioridad
				if (targetColumnId !== activeTask.priority) {
					onUpdateTask(activeTask.id, { priority: targetColumnId as Priority })
				}
				break
			
			case 'date':
				// Cambiar fecha según la columna
				const today = new Date()
				const tomorrow = new Date()
				tomorrow.setDate(tomorrow.getDate() + 1)
				
				let newDate: Date | undefined
				
				switch (targetColumnId) {
					case 'today':
						newDate = today
						break
					case 'tomorrow':
						newDate = tomorrow
						break
					case 'later':
						// Si no tiene fecha, ponerle una fecha en el futuro
						if (!activeTask.dueDate) {
							const futureDate = new Date()
							futureDate.setDate(futureDate.getDate() + 7) // Una semana después
							newDate = futureDate
						}
						// Si ya tiene fecha futura, mantenerla
						break
				}
				
				if (newDate && (!activeTask.dueDate || newDate.getTime() !== new Date(activeTask.dueDate).getTime())) {
					onUpdateTask(activeTask.id, { dueDate: newDate })
				}
				break
		}
	}

	const handleDragOver = (event: DragOverEvent) => {
		// Lógica adicional si necesitamos feedback visual durante el drag
	}

	// Cerrar dropdown al hacer clic fuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (showSortOptions) {
				setShowSortOptions(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showSortOptions])

	return (
		<div className="h-full flex flex-col max-h-screen overflow-hidden">
			<style jsx>{`
				.droppable-column {
					min-height: 200px;
					max-height: calc(100vh - 200px);
					overflow-y: auto;
				}
				
				.dragging-over {
					background-color: #f0f9ff;
					border-color: #3b82f6;
				}
				
				.task-dragging {
					transform: rotate(5deg);
					box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
				}
			`}</style>
			
			{/* Toolbar de vista */}
			<div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border border-gray-200">
				<div className="flex items-center gap-4">
					<div className="relative">
						<button
							onClick={() => setShowSortOptions(!showSortOptions)}
							className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
						>
							<SortAsc size={16} />
							{sortOption === 'status' && 'Vista por Estado'}
							{sortOption === 'priority' && 'Vista por Prioridad'}
							{sortOption === 'date' && 'Vista por Fecha'}
						</button>
						
						{showSortOptions && (
							<div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
								<div className="p-2">
									<button
										onClick={() => {
											setSortOption('status')
											setShowSortOptions(false)
										}}
										className={cn(
											"w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
											sortOption === 'status' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
										)}
									>
										Vista por Estado
									</button>
									<button
										onClick={() => {
											setSortOption('priority')
											setShowSortOptions(false)
										}}
										className={cn(
											"w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
											sortOption === 'priority' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
										)}
									>
										Vista por Prioridad
									</button>
									<button
										onClick={() => {
											setSortOption('date')
											setShowSortOptions(false)
										}}
										className={cn(
											"w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
											sortOption === 'date' ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
										)}
									>
										Vista por Fecha
									</button>
								</div>
							</div>
						)}
					</div>

					<div className="text-sm text-gray-500">
						{sortOption === 'status' && 'Organiza tareas por su estado de progreso'}
						{sortOption === 'priority' && 'Organiza tareas por nivel de prioridad'}
						{sortOption === 'date' && 'Organiza tareas por fecha de vencimiento'}
					</div>
				</div>
			</div>

			{/* Kanban Board */}
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragOver={handleDragOver}
			>
				<div key={sortOption} className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
					{getCurrentColumns.map((column) => {
						const columnTasks = getTasksForColumn(column.id)

						return (
							<DroppableColumn 
								key={column.id} 
								column={column}
								taskCount={columnTasks.length}
							>
								<SortableContext 
									items={columnTasks.map(task => task.id)}
									strategy={verticalListSortingStrategy}
								>
									{columnTasks.map((task, index) => (
										<SortableTask
											key={task.id}
											task={task}
											onToggleComplete={onToggleComplete}
											onUpdateStatus={onUpdateStatus}
											onUpdateTask={onUpdateTask}
											onDelete={onDelete}
											onArchive={onArchive}
											onRestore={onRestore}
											onCancelDeletion={onCancelDeletion}
											index={index}
										/>
									))}

									{/* Empty State */}
									{columnTasks.length === 0 && (
										<div className="text-center py-8 text-gray-400">
											<column.icon size={32} className="mx-auto mb-2 opacity-50" />
											<p className="text-sm">No hay tareas</p>
											<p className="text-xs mt-2 opacity-75">Arrastra tareas aquí</p>
										</div>
									)}
								</SortableContext>
							</DroppableColumn>
						)
					})}
				</div>

				<DragOverlay dropAnimation={null}>
					{activeTask && (
						<div className="bg-white rounded-lg border border-blue-300 shadow-2xl rotate-3 opacity-95 transform scale-105">
							<TaskItem
								task={activeTask}
								onToggleComplete={onToggleComplete}
								onUpdateStatus={onUpdateStatus}
								onUpdateTask={onUpdateTask}
								onDelete={onDelete}
								onArchive={onArchive}
								onRestore={onRestore}
								onCancelDeletion={onCancelDeletion}
								variant="compact"
							/>
						</div>
					)}
				</DragOverlay>
			</DndContext>
		</div>
	)
}
