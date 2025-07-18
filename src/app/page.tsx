'use client'

import { useState, useEffect } from 'react'
// Drag & drop imports removed - will be re-implemented from scratch
import { 
  CheckSquare, 
  Sparkles, 
  Calendar, 
  Star, 
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
  Target,
  Archive
} from 'lucide-react'

import { Task, List, CreateTaskData, TaskStatus, Priority } from '@/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { TaskItem } from '@/components/tasks/task-item'
// import { TaskForm } from '@/components/tasks/task-form'
import { QuickTaskFab } from '@/components/ui/quick-task-fab'
import { CreateListModal } from '@/components/lists/create-list-modal'
import { EmptyListButton } from '@/components/ui/empty-list-button'
import { ArchiveCompletedModal, ArchiveOption } from '@/components/ui/archive-completed-modal'

// Datos de ejemplo (después los conectaremos con la API)
const mockLists: List[] = [
	{
		id: '1',
		title: 'Personal',
		description: 'Tareas personales y del hogar',
		color: '#3b82f6',
		icon: 'home',
		position: 0,
		isDefault: true,
		userId: 'user1',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '2',
		title: 'Trabajo',
		description: 'Tareas del trabajo y proyectos',
		color: '#ef4444',
		icon: 'briefcase',
		position: 1,
		isDefault: false,
		userId: 'user1',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '3',
		title: 'Salud & Fitness',
		description: 'Ejercicio, citas médicas y bienestar',
		color: '#10b981',
		icon: 'heart',
		position: 2,
		isDefault: false,
		userId: 'user1',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '4',
		title: 'Aprendizaje',
		description: 'Libros, cursos y desarrollo personal',
		color: '#8b5cf6',
		icon: 'book',
		position: 3,
		isDefault: false,
		userId: 'user1',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 'quick-tasks',
		title: 'Tareas Rápidas',
		description: 'Lista por defecto para tareas creadas rápidamente',
		color: '#6366f1',
		icon: 'list',
		position: 999, // Siempre al final
		isDefault: true,
		userId: 'user1',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
]

const mockTasks: Task[] = [
	{
		id: '1',
		title: 'Revisar emails importantes',
		description: 'Responder emails del cliente y del equipo de marketing',
		completed: false,
		status: 'IN_PROGRESS',
		priority: 'HIGH',
		dueDate: new Date(),
		listId: '2',
		position: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '2',
		title: 'Preparar presentación para la reunión',
		description: 'Crear slides para la presentación del proyecto Q4',
		completed: false,
		status: 'PENDING',
		priority: 'HIGH',
		dueDate: new Date(),
		listId: '2',
		position: 1,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '3',
		title: 'Hacer la compra semanal',
		description: 'Comprar ingredientes para la cena de esta semana: pollo, verduras, arroz',
		completed: false,
		status: 'PENDING',
		priority: 'NORMAL',
		dueDate: new Date(Date.now() + 86400000), // Mañana
		listId: '1',
		position: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '4',
		title: 'Llamar al médico',
		description: 'Agendar cita para revisión anual',
		completed: true,
		status: 'COMPLETED',
		priority: 'LOW',
		listId: '1',
		position: 1,
		createdAt: new Date(Date.now() - 86400000),
		updatedAt: new Date(),
	},
	{
		id: '5',
		title: 'Ejercicio en el gimnasio',
		description: 'Rutina de piernas y cardio - 1 hora',
		completed: false,
		status: 'IN_PROGRESS',
		priority: 'NORMAL',
		dueDate: new Date(),
		listId: '1',
		position: 2,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '6',
		title: 'Revisar código del proyecto',
		description: 'Code review del pull request #45 y #47',
		completed: false,
		status: 'PENDING',
		priority: 'HIGH',
		dueDate: new Date(Date.now() + 86400000), // Mañana
		listId: '2',
		position: 2,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '7',
		title: 'Planificar vacaciones de verano',
		description: 'Investigar destinos, comparar precios y hacer reservas',
		completed: false,
		status: 'PENDING',
		priority: 'LOW',
		dueDate: new Date(Date.now() + 7 * 86400000), // En una semana
		listId: '1',
		position: 3,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '8',
		title: 'Actualizar CV y LinkedIn',
		description: 'Agregar nuevas habilidades y experiencias recientes',
		completed: false,
		status: 'IN_PROGRESS',
		priority: 'NORMAL',
		listId: '2',
		position: 3,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '9',
		title: 'Limpiar y organizar escritorio',
		description: 'Organizar cables, documentos y hacer limpieza general',
		completed: true,
		status: 'COMPLETED',
		priority: 'LOW',
		listId: '1',
		position: 4,
		createdAt: new Date(Date.now() - 172800000), // Hace 2 días
		updatedAt: new Date(),
	},
	{
		id: '10',
		title: 'Reunión con el equipo de desarrollo',
		description: 'Standup diario - revisar progreso y planificar sprint',
		completed: false,
		status: 'PENDING',
		priority: 'HIGH',
		dueDate: new Date(),
		listId: '2',
		position: 4,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '11',
		title: 'Leer libro de productividad',
		description: 'Continuar leyendo "Atomic Habits" - capítulos 5-7',
		completed: false,
		status: 'IN_PROGRESS',
		priority: 'LOW',
		listId: '1',
		position: 5,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '12',
		title: 'Configurar backup automático',
		description: 'Configurar sistema de backup para documentos importantes',
		completed: false,
		status: 'PENDING',
		priority: 'NORMAL',
		dueDate: new Date(Date.now() + 3 * 86400000), // En 3 días
		listId: '2',
		position: 5,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '13',
		title: 'Rutina de ejercicios matutina',
		description: 'Cardio 30 min + estiramientos',
		completed: false,
		status: 'IN_PROGRESS',
		priority: 'HIGH',
		dueDate: new Date(),
		listId: '3',
		position: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '14',
		title: 'Completar curso de React',
		description: 'Terminar módulos 8-10 del curso de React avanzado',
		completed: false,
		status: 'PENDING',
		priority: 'NORMAL',
		dueDate: new Date(Date.now() + 5 * 86400000), // En 5 días
		listId: '4',
		position: 0,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '15',
		title: 'Beber más agua',
		description: 'Meta: 8 vasos de agua al día',
		completed: false,
		status: 'PENDING',
		priority: 'LOW',
		listId: '3',
		position: 1,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: '16',
		title: 'Estudiar TypeScript avanzado',
		description: 'Practicar con tipos genéricos y utilidades',
		completed: true,
		status: 'COMPLETED',
		priority: 'NORMAL',
		listId: '4',
		position: 1,
		createdAt: new Date(Date.now() - 86400000),
		updatedAt: new Date(),
	},
]

// Funciones de persistencia local
const STORAGE_KEYS = {
	LISTS: 'gestor-tareas-lists',
	TASKS: 'gestor-tareas-tasks',
	ACTIVE_LIST: 'gestor-tareas-active-list'
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
	if (typeof window === 'undefined') return defaultValue
	
	try {
		const stored = localStorage.getItem(key)
		if (stored) {
			const parsed = JSON.parse(stored)
			// Convertir strings de fecha de vuelta a objetos Date
			if (Array.isArray(parsed)) {
				return parsed.map((item: Record<string, unknown>) => ({
					...item,
					createdAt: new Date(item.createdAt as string),
					updatedAt: new Date(item.updatedAt as string),
					...(item.dueDate && { dueDate: new Date(item.dueDate as string) }),
					...(item.reminderAt && { reminderAt: new Date(item.reminderAt as string) })
				})) as T
			}
			return parsed
		}
	} catch (error) {
		console.error(`Error loading ${key} from localStorage:`, error)
	}
	
	return defaultValue
}

function saveToStorage<T>(key: string, value: T): void {
	if (typeof window === 'undefined') return
	
	try {
		localStorage.setItem(key, JSON.stringify(value))
	} catch (error) {
		console.error(`Error saving ${key} to localStorage:`, error)
	}
}

export default function HomePage() {
	// Estados inicializados con valores por defecto (mismo en servidor y cliente)
	const [lists, setLists] = useState<List[]>(mockLists)
	const [tasks, setTasks] = useState<Task[]>(mockTasks)
	const [activeListId, setActiveListId] = useState<string | undefined>('all')
	const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
	const [openedFromButton, setOpenedFromButton] = useState(false)

	const handleCloseTaskForm = () => {
		setIsTaskFormOpen(false)
		setOpenedFromButton(false)
	}

	const handleToggleTaskForm = (isOpen: boolean) => {
		if (!isOpen) {
			setOpenedFromButton(false)
		}
		setIsTaskFormOpen(isOpen)
	}

	// Generar configuración inicial basada en el contexto actual
	const getInitialConfig = () => {
		const config: {
			priority?: Priority,
			date?: Date,
			listId?: string
		} = {}

		if (activeListId === 'today') {
			// Si estamos en "Hoy", configurar fecha de hoy
			config.date = new Date()
		} else if (activeListId === 'important') {
			// Si estamos en "Importantes", configurar prioridad alta
			config.priority = 'HIGH'
		} else if (activeListId && !['completed', 'archived'].includes(activeListId)) {
			// Si estamos en una lista específica, usar esa lista
			config.listId = activeListId
		}

		return config
	}
	const [editingTask, setEditingTask] = useState<Task | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false)
	const [isHydrated, setIsHydrated] = useState(false)
	const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
	// const [filters, setFilters] = useState<TaskFilters>({}) // Removed unused filters

	// Cargar datos de localStorage después de la hidratación
	useEffect(() => {
		// Cargar datos guardados
		const savedLists = loadFromStorage(STORAGE_KEYS.LISTS, mockLists)
		const savedTasks = loadFromStorage(STORAGE_KEYS.TASKS, mockTasks)
		const savedActiveList = loadFromStorage(STORAGE_KEYS.ACTIVE_LIST, 'all')

		// Asegurar que "Tareas Rápidas" siempre exista
		const ensureQuickTasksList = (lists: List[]) => {
			const quickTasksExists = lists.some(list => list.id === 'quick-tasks')
			if (!quickTasksExists) {
				const quickTasksList: List = {
					id: 'quick-tasks',
					title: 'Tareas Rápidas',
					description: 'Lista por defecto para tareas creadas rápidamente',
					color: '#6366f1',
					icon: 'list',
					position: 999,
					isDefault: true,
					userId: 'user1',
					createdAt: new Date(),
					updatedAt: new Date(),
				}
				return [...lists, quickTasksList]
			}
			return lists
		}

		const listsWithQuickTasks = ensureQuickTasksList(savedLists)

		setLists(listsWithQuickTasks)
		setTasks(savedTasks)
		setActiveListId(savedActiveList)
		setIsHydrated(true)
	}, [])

	// Guardar cambios en localStorage (solo después de hidratación)
	useEffect(() => {
		if (isHydrated) {
			saveToStorage(STORAGE_KEYS.LISTS, lists)
		}
	}, [lists, isHydrated])

	useEffect(() => {
		if (isHydrated) {
			saveToStorage(STORAGE_KEYS.TASKS, tasks)
		}
	}, [tasks, isHydrated])

	useEffect(() => {
		if (isHydrated) {
			saveToStorage(STORAGE_KEYS.ACTIVE_LIST, activeListId)
		}
	}, [activeListId, isHydrated])

	// Eliminar automáticamente las tareas marcadas para eliminación después de 3 días
	useEffect(() => {
		const checkExpiredTasks = () => {
			const now = new Date()
			setTasks(prev => 
				prev.filter(task => {
					if (task.markedForDeletion && task.deletionDate) {
						return now < task.deletionDate
					}
					return true
				})
			)
		}

		// Verificar cada hora
		const interval = setInterval(checkExpiredTasks, 60 * 60 * 1000)
		
		// Verificar inmediatamente al cargar
		checkExpiredTasks()

		return () => clearInterval(interval)
	}, [])

	// Drag & drop state removed - will be re-implemented from scratch

	// Filtrar tareas basado en la lista activa y filtros
	const filteredTasks = tasks.filter((task) => {
		// Filtro por lista
		if (activeListId && !['today', 'important', 'completed', 'archived'].includes(activeListId)) {
			if (task.listId !== activeListId) return false
		}

		// Filtros especiales
		if (activeListId === 'today') {
			if (!task.dueDate || task.archived) return false
			const today = new Date()
			const taskDate = new Date(task.dueDate)
			if (taskDate.toDateString() !== today.toDateString()) return false
		}

		if (activeListId === 'important') {
			if (task.priority === 'LOW' || task.priority === 'NORMAL' || task.archived) return false
		}

		if (activeListId === 'completed') {
			if (!task.completed || task.archived) return false
		}

		if (activeListId === 'archived') {
			if (!task.archived) return false
		}

		// Excluir tareas archivadas de listas normales
		if (activeListId && !['archived'].includes(activeListId)) {
			if (task.archived) return false
		}

		// Excluir tareas marcadas para eliminación de todas las vistas
		if (task.markedForDeletion) return false

		// Filtro por búsqueda
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			if (
				!task.title.toLowerCase().includes(query) &&
				!task.description?.toLowerCase().includes(query)
			) {
				return false
			}
		}

		return true
	})
	
	// Ordenar tareas: completadas al final, luego por posición
	.sort((a, b) => {
		// Primero por estado de completado
		if (a.completed !== b.completed) {
			return a.completed ? 1 : -1
		}
		// Luego por posición
		return (a.position || 0) - (b.position || 0)
	})

	// Calcular conteos para la sidebar
	const taskCounts = {
		today: tasks.filter((t) => {
			if (!t.dueDate || t.archived) return false
			const today = new Date()
			return new Date(t.dueDate).toDateString() === today.toDateString()
		}).length,
		important: tasks.filter((t) => t.priority === 'HIGH' && !t.archived).length,
		completed: tasks.filter((t) => t.completed && !t.archived).length,
		archived: tasks.filter((t) => t.archived).length,
		...lists.reduce((acc, list) => {
			acc[list.id] = tasks.filter((t) => t.listId === list.id && !t.completed && !t.archived).length
			return acc
		}, {} as Record<string, number>),
	}

	const handleCreateTask = (data: CreateTaskData) => {
		const newTask: Task = {
			id: Date.now().toString(),
			title: data.title,
			description: data.description,
			completed: false,
			status: data.status || 'PENDING',
			priority: data.priority,
			dueDate: data.dueDate,
			listId: data.listId,
			position: tasks.filter((t) => t.listId === data.listId).length,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		setTasks((prev) => [...prev, newTask])
	}

	const handleEditTaskSubmit = (data: CreateTaskData) => {
		if (!editingTask) return

		setTasks((prev) =>
			prev.map((task) =>
				task.id === editingTask.id ? { ...task, ...data, updatedAt: new Date() } : task
			)
		)
		setEditingTask(null)
	}

	const handleToggleComplete = (taskId: string, completed: boolean) => {
		// Simplemente actualizar el estado de la tarea
		setTasks((prev) =>
			prev.map((task) =>
				task.id === taskId ? { 
					...task, 
					completed, 
					status: (completed ? 'COMPLETED' : 'PENDING') as TaskStatus,
					updatedAt: new Date() 
				} : task
			)
		)
	}

	const handleUpdateStatus = (taskId: string, status: TaskStatus) => {
		// Simplemente actualizar el estado de la tarea
		setTasks((prev) =>
			prev.map((task) =>
				task.id === taskId ? { 
					...task, 
					status,
					completed: (status as TaskStatus) === 'COMPLETED',
					updatedAt: new Date() 
				} : task
			)
		)
	}

	const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
		setTasks((prev) =>
			prev.map((task) =>
				task.id === taskId ? { 
					...task, 
					...updates,
					updatedAt: new Date() 
				} : task
			)
		)
	}

	const handleDeleteTask = (taskId: string) => {
		setTasks((prev) => prev.filter((task) => task.id !== taskId))
	}

	const handleMoveTaskToList = (taskId: string, listId: string) => {
		setTasks((prev) =>
			prev.map((task) =>
				task.id === taskId ? {
					...task,
					listId,
					updatedAt: new Date()
				} : task
			)
		)
	}

	const handleDeleteList = (listId: string, moveTasksToListId?: string) => {
		// Si hay que mover tareas, las movemos primero
		if (moveTasksToListId) {
			setTasks((prev) =>
				prev.map((task) =>
					task.listId === listId ? {
						...task,
						listId: moveTasksToListId,
						updatedAt: new Date()
					} : task
				)
			)
		} else {
			// Si no, eliminamos las tareas de la lista
			setTasks((prev) => prev.filter((task) => task.listId !== listId))
		}

		// Eliminar la lista
		setLists((prev) => prev.filter((list) => list.id !== listId))

		// Si la lista activa era la que se eliminó, cambiar a "Tareas Rápidas"
		if (activeListId === listId) {
			setActiveListId('quick-tasks')
		}
	}

	const handleUpdateList = (listId: string, updates: Partial<List>) => {
		setLists((prev) =>
			prev.map((list) =>
				list.id === listId ? {
					...list,
					...updates,
					updatedAt: new Date()
				} : list
			)
		)
	}

	const handleEditTask = (task: Task) => {
		setEditingTask(task)
		setOpenedFromButton(true)
		setIsTaskFormOpen(true)
	}

	const handleArchiveCompleted = (option: ArchiveOption) => {
		// Obtener las tareas relevantes según la vista actual
		const relevantTasks = activeListId === 'archived' 
			? tasks.filter(task => task.archived)
			: tasks.filter(task => task.completed)
		
		switch (option) {
			case 'auto':
				// Implementar lógica de auto-archivo (por ahora simplemente marcar como archivadas)
				console.log('Configurando auto-archivo para tareas completadas')
				break
			case 'manual':
				// Mantener tareas completadas visibles
				console.log('Manteniendo tareas completadas visibles')
				break
			case 'delete':
				// Marcar tareas relevantes para eliminación en 3 días
				const deletionDate = new Date()
				deletionDate.setDate(deletionDate.getDate() + 3)
				
				setTasks(prev => 
					prev.map(task => {
						const shouldMark = activeListId === 'archived' 
							? task.archived 
							: task.completed
						
						return shouldMark 
							? { 
								...task, 
								markedForDeletion: true, 
								deletionDate: deletionDate,
								updatedAt: new Date() 
							}
							: task
					})
				)
				break
		}
	}

	const handleArchiveTask = (taskId: string) => {
		setTasks(prev => 
			prev.map(task => 
				task.id === taskId 
					? { ...task, archived: true, archivedAt: new Date(), updatedAt: new Date() }
					: task
			)
		)
	}

	const handleRestoreTask = (taskId: string) => {
		setTasks(prev => 
			prev.map(task => 
				task.id === taskId 
					? { ...task, archived: false, archivedAt: undefined, updatedAt: new Date() }
					: task
			)
		)
	}

	const handleCancelDeletion = (taskId: string) => {
		setTasks(prev => 
			prev.map(task => 
				task.id === taskId 
					? { ...task, markedForDeletion: false, deletionDate: undefined, updatedAt: new Date() }
					: task
			)
		)
	}

	const getActiveListTitle = () => {
		if (activeListId === 'all') return undefined
		if (activeListId === 'today') return 'Hoy'
		if (activeListId === 'important') return 'Importantes'
		if (activeListId === 'completed') return 'Completadas'
		if (activeListId === 'archived') return 'Archivadas'
		
		const list = lists.find(l => l.id === activeListId)
		return list?.title
	}

	const handleCreateTaskFromEmpty = () => {
		setOpenedFromButton(true)
		setIsTaskFormOpen(true)
	}

	// Drag & drop handlers removed - will be re-implemented from scratch

	// Mapeo de iconos
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

	// Función para obtener el nombre de la lista activa
	const getActiveListName = (): string => {
		if (!activeListId) return 'Todas las tareas'
		
		switch (activeListId) {
			case 'all':
				return 'Todas las tareas'
			case 'today':
				return 'Hoy'
			case 'important':
				return 'Importantes'
			case 'completed':
				return 'Completadas'
			case 'archived':
				return 'Archivadas'
			default:
				const list = lists.find(l => l.id === activeListId)
				return list ? list.title : 'Lista desconocida'
		}
	}

	// Función para obtener el icono de la lista activa
	const getActiveListIcon = () => {
		if (!activeListId) return ListIcon
		
		switch (activeListId) {
			case 'all':
				return ListIcon
			case 'today':
				return Calendar
			case 'important':
				return Star
			case 'completed':
				return CheckSquare
			case 'archived':
				return Archive
			default:
				const list = lists.find(l => l.id === activeListId)
				if (list) {
					return iconMap[list.icon as keyof typeof iconMap] || ListIcon
				}
				return ListIcon
		}
	}

	// Función para obtener el color de la lista activa
	const getActiveListColor = (): string => {
		if (!activeListId) return '#6366f1'
		
		switch (activeListId) {
			case 'all':
				return '#6366f1'
			case 'today':
				return '#3b82f6'
			case 'important':
				return '#ef4444'
			case 'completed':
				return '#10b981'
			case 'archived':
				return '#6b7280'
			default:
				const list = lists.find(l => l.id === activeListId)
				return list ? list.color : '#6366f1'
		}
	}

	const handleCreateList = () => {
		setIsCreateListModalOpen(true)
	}

	const handleCreateListSubmit = (data: { title: string; icon: string; color: string }) => {
		const newList: List = {
			id: Date.now().toString(),
			title: data.title,
			description: '',
			color: data.color,
			icon: data.icon,
			position: lists.length,
			isDefault: false,
			userId: 'user1',
			createdAt: new Date(),
			updatedAt: new Date(),
		}
		setLists(prev => [...prev, newList])
	}

	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
			{/* Header */}
			<Header />
			
			{/* Main Layout */}
			<div className="flex-1 flex gap-0">
				{/* Sidebar */}
				<div className="sidebar-container apple-sidebar apple-scroll">
					<Sidebar
						lists={lists}
						activeListId={activeListId}
						onListSelect={setActiveListId}
						onCreateList={handleCreateList}
						onDeleteList={handleDeleteList}
						onUpdateList={handleUpdateList}
						taskCounts={taskCounts}
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
					/>
				</div>

				{/* Main Content */}
				<div className="content-container flex-1 flex flex-col apple-fade-in">
					{/* List Header */}
					<div className="bg-transparent">
						<div className="pr-8 pt-8 pb-4 pl-0">
							<div className="flex items-center space-x-4 pl-8">
								{(() => {
									const IconComponent = getActiveListIcon()
									const color = getActiveListColor()
									return (									<div 
										className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
										style={{ backgroundColor: color }}
									>
										<IconComponent size={20} className="text-white" />
									</div>
									)
								})()}
								<div className="flex-1">
									<h1 className="text-xl font-bold text-gray-900 dark:text-white">
										{getActiveListName()}
									</h1>
									<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
										{filteredTasks.length === 0 
											? 'No hay tareas' 
											: `${filteredTasks.length} tarea${filteredTasks.length !== 1 ? 's' : ''}`
										}
										{searchQuery && ` · Filtrado por "${searchQuery}"`}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Tasks List */}
					<div className="flex-1 overflow-auto px-8 pb-8 pt-4 apple-scroll">
						{filteredTasks.length === 0 ? (
							<EmptyListButton 
								onClick={handleCreateTaskFromEmpty}
								listTitle={getActiveListTitle()}
								className="apple-fade-in"
							/>
						) : (
							<div className="max-w-4xl mx-auto">
								{/* Mostrar botón de gestionar si estamos en "Completadas" o "Archivadas" y hay tareas */}
								{(activeListId === 'completed' || activeListId === 'archived') && filteredTasks.length > 0 && (
									<div className="mb-6 flex justify-end">
										<button
											onClick={() => setIsArchiveModalOpen(true)}
											className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
										>
											<Archive className="w-4 h-4" />
											{activeListId === 'archived' ? 'Gestionar archivadas' : 'Gestionar completadas'}
										</button>
									</div>
								)}
								
								<div className="space-y-8">
									{filteredTasks.map((task, index) => (
										<div
											key={`${task.id}-${task.position}-${task.updatedAt?.getTime()}`}
											className="apple-fade-in"
											style={{ 
												animationDelay: `${index * 50}ms`,
												transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
											}}
										>
											<TaskItem
												task={task}
												onToggleComplete={handleToggleComplete}
												onUpdateStatus={handleUpdateStatus}
												onUpdateTask={handleUpdateTask}
												onDelete={handleDeleteTask}
												onArchive={handleArchiveTask}
												onRestore={handleRestoreTask}
												onCancelDeletion={handleCancelDeletion}
												onMoveToList={handleMoveTaskToList}
												onEdit={handleEditTask}
												lists={lists}
											/>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Task Form Modal - Temporarily commented out due to compilation errors */}
			{/* 
			<div className={isTaskFormOpen || !!editingTask ? 'apple-scale-in' : ''}>
				<TaskForm
					isOpen={isTaskFormOpen || !!editingTask}
					onClose={() => {
						setIsTaskFormOpen(false)
						setEditingTask(null)
					}}
					onSubmit={editingTask ? handleEditTaskSubmit : handleCreateTask}
					lists={lists}
					initialData={
						editingTask
							? {
									title: editingTask.title,
									description: editingTask.description,
									priority: editingTask.priority,
									dueDate: editingTask.dueDate,
									listId: editingTask.listId,
							  }
							: {
									listId:
										activeListId && !['today', 'important', 'completed', 'archived'].includes(activeListId)
											? activeListId
											: lists[0]?.id,
							  }
					}
					isEditing={!!editingTask}
				/>
			</div>
			*/}

			{/* Quick Task FAB */}
			<QuickTaskFab 
				onCreateTask={handleCreateTask}
				lists={lists}
				activeListId={activeListId}
				isOpen={isTaskFormOpen}
				onToggle={handleToggleTaskForm}
				openedFrom={openedFromButton ? 'button' : 'fab'}
				initialConfig={openedFromButton ? getInitialConfig() : undefined}
			/>

			{/* Create List Modal */}
			<CreateListModal
				isOpen={isCreateListModalOpen}
				onClose={() => setIsCreateListModalOpen(false)}
				onSubmit={handleCreateListSubmit}
			/>

			{/* Archive Completed Modal */}
			<ArchiveCompletedModal
				isOpen={isArchiveModalOpen}
				onClose={() => setIsArchiveModalOpen(false)}
				onConfirm={handleArchiveCompleted}
				completedTasks={activeListId === 'archived' 
					? tasks.filter(task => task.archived) 
					: tasks.filter(task => task.completed)
				}
				isArchivedView={activeListId === 'archived'}
			/>
		</div>
	)
}
