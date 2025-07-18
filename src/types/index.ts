// Tipos basados en el esquema de Prisma

export type Priority = 'LOW' | 'NORMAL' | 'HIGH'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface List {
  id: string
  title: string
  description?: string
  color: string
  icon: string
  position: number
  isDefault: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
  tasks?: Task[]
  _count?: {
    tasks: number
  }
}

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  status: TaskStatus
  priority: Priority
  dueDate?: Date
  reminderAt?: Date
  position: number
  listId: string
  archived?: boolean
  archivedAt?: Date
  markedForDeletion?: boolean
  deletionDate?: Date
  createdAt: Date
  updatedAt: Date
  list?: List
  subtasks?: Subtask[]
  tags?: TaskTag[]
  _count?: {
    subtasks: number
  }
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
  position: number
  taskId: string
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: Date
}

export interface TaskTag {
  id: string
  taskId: string
  tagId: string
  task?: Task
  tag?: Tag
}

// Tipos para formularios
export interface CreateTaskData {
  title: string
  description?: string
  priority: Priority
  status?: TaskStatus
  dueDate?: Date
  listId: string
}

export interface CreateListData {
  title: string
  description?: string
  color: string
  icon: string
}

export interface CreateSubtaskData {
  title: string
  taskId: string
}

// Tipos para filtros y búsqueda
export interface TaskFilters {
  completed?: boolean
  status?: TaskStatus
  priority?: Priority
  dueDate?: 'today' | 'tomorrow' | 'week' | 'overdue'
  listId?: string
  search?: string
}

// Tipos para respuestas de API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Constantes
export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Baja', color: 'gray' },
  { value: 'NORMAL', label: 'Media', color: 'green' },
  { value: 'HIGH', label: 'Alta', color: 'red' }
] as const

export const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente', color: '#6b7280', icon: '○' },
  { value: 'IN_PROGRESS', label: 'En Progreso', color: '#f59e0b', icon: '⏳' },
  { value: 'COMPLETED', label: 'Terminada', color: '#10b981', icon: '✓' }
] as const

export const LIST_ICONS = [
  'list', 'home', 'briefcase', 'heart', 'star', 'calendar',
  'shopping-cart', 'book', 'music', 'camera', 'coffee', 'plane'
] as const

export const LIST_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
] as const
