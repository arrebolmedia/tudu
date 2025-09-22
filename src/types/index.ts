// Tipos basados en el esquema de Prisma

export type Priority = 'LOW' | 'NORMAL' | 'HIGH'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

// Sistema de Roles Centralizado
export type UserRole = 'SUPER_ADMIN' | 'PROPIETARIO' | 'GERENTE' | 'VENDEDOR' | 'COORDINADOR' | 'CALL_CENTER' | 'COLABORADOR'

// CRM Types
export type ClientStatus = 'NUEVO_CONTACTO' | 'ASIGNADO' | 'RECORRIDO_PROGRAMADO' | 'CLIENTE_CONTACTADO' | 'CERRADO_VENTA' | 'CERRADO_SIN_EXITO'
export type ClientPriority = 'LOW' | 'NORMAL' | 'HIGH'
export type ClientType = 'WEDDING' | 'QUINCEANOS' | 'BAUTIZO' | 'COMUNION' | 'CORPORATE' | 'SOCIAL' | 'OTHER'
export type ClientArea = 'CASANUEVA' | 'CASA_MUNECAS' | 'ATRIO' | 'CABANAS'
export type ClientChannel = 'INSTAGRAM' | 'FACEBOOK' | 'WHATSAPP_SOCIAL' | 'EMAIL' | 'PHONE' | 'WALKING' | 'REFERRAL' | 'RECURRENT' | 'BODAS_COM' | 'HACIENDAS_BODAS_COM'

// Tipos dinámicos que se generan desde usuarios
export type ClientExecutive = string // Se generará dinámicamente desde usuarios con rol VENDEDOR
export type ClientCoordinator = string // Se generará dinámicamente desde usuarios con rol COORDINADOR
export type AssignedExecutive = 'MARIA_LOPEZ' | 'CARLOS_GARCIA' | 'ANA_MARTINEZ' | 'JUAN_RODRIGUEZ' | 'SOFIA_FERNANDEZ'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole // Rol del usuario en el sistema
  avatar?: string
  isActive: boolean // Estado activo/inactivo
  createdAt: Date
  updatedAt: Date
}

// Interface para usuarios del sistema centralizado
export interface SystemUser {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// Interface para opciones de dropdowns dinámicas
export interface DropdownOption {
  value: string
  label: string
  userId: string
  role: UserRole
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
  '#d87254', '#c85a3a', '#a8472f', '#e3cfaa', 
  '#d4b894', '#c4a27c', '#f5d5cd', '#edb9a8'
] as const

// CRM Types
export interface Client {
  id: string
  name: string                    // Nombre
  eventDate?: Date               // Fecha del evento
  phone?: string                 // Teléfono
  email?: string                 // Mail
  type?: ClientType              // Tipo de evento
  area?: ClientArea              // Área/Salón
  status: ClientStatus           // Status
  channel?: ClientChannel        // Canal
  createdAt: Date               // Fecha de creación
  priority: ClientPriority      // Prioridad
  notes?: string                // Notas
  assignedExecutive?: ClientExecutive  // Ejecutivo asignado
  coordinator?: ClientCoordinator      // Coordinador asignado
  guestCount?: number                // Número de invitados
  clientNumber?: string                // Número de cliente
  archived?: boolean             // Cliente archivado
  vip?: boolean                  // Cliente VIP
}

// Comments System
export interface Comment {
  id: string
  clientId: string
  content: string
  author: string
  timestamp: Date
  isInternal?: boolean           // Comentario interno vs visible al cliente
  isImportant?: boolean          // Comentario marcado como importante
}

export interface CreateClientData {
  name: string
  email?: string
  phone?: string
  company?: string
  status?: ClientStatus
  priority?: ClientPriority
  notes?: string
  budget?: number
  eventDate?: Date
  source?: string
  assigned?: string
  tags?: string[]
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: string
}

export interface ClientFilters {
  status?: ClientStatus
  priority?: ClientPriority
  assigned?: string
  source?: string
  search?: string
  dateRange?: {
    from?: Date
    to?: Date
  }
}

// Constantes para CRM
export const CLIENT_STATUS_OPTIONS = [
  { value: 'LEAD', label: 'Lead', color: '#8b5cf6', icon: '👀' },
  { value: 'PROSPECT', label: 'Prospecto', color: '#f59e0b', icon: '🎯' },
  { value: 'CLIENT', label: 'Cliente', color: '#10b981', icon: '✨' },
  { value: 'INACTIVE', label: 'Inactivo', color: '#6b7280', icon: '😴' }
] as const

export const CLIENT_PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Baja', color: 'gray' },
  { value: 'MEDIUM', label: 'Media', color: 'orange' },
  { value: 'HIGH', label: 'Alta', color: 'red' }
] as const
