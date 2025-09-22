import { ClientStatus, ClientPriority, ClientType, ClientArea, ClientChannel, ClientExecutive, ClientCoordinator } from '@/types'
import { 
  generateExecutiveOptions, 
  generateCoordinatorOptions, 
  getUserById,
  ROLE_COLORS 
} from '@/lib/user-management'

// Status
export const getStatusColor = (status: ClientStatus) => {
  switch (status) {
    case 'NUEVO_CONTACTO':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800 dark:text-yellow-400'
    case 'ASIGNADO':
      return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400'
    case 'RECORRIDO_PROGRAMADO':
      return 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800 dark:text-purple-400'
    case 'CLIENTE_CONTACTADO':
      return 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800 dark:text-orange-400'
    case 'CERRADO_VENTA':
      return 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800 dark:text-green-400'
    case 'CERRADO_SIN_EXITO':
      return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800 dark:text-gray-400'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800 dark:text-gray-400'
  }
}

export const getStatusLabel = (status: ClientStatus) => {
  switch (status) {
    case 'NUEVO_CONTACTO': return 'Nuevo Contacto'
    case 'ASIGNADO': return 'Asignado'
    case 'RECORRIDO_PROGRAMADO': return 'Recorrido Programado'
    case 'CLIENTE_CONTACTADO': return 'Cliente Contactado'
    case 'CERRADO_VENTA': return 'Cerrado - Venta'
    case 'CERRADO_SIN_EXITO': return 'Cerrado - Sin Éxito'
    default: return 'Sin definir'
  }
}

// Priority
export const getPriorityColor = (priority: ClientPriority) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800 dark:text-red-400'
    case 'NORMAL':
      return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400'
    case 'LOW':
      return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800 dark:text-gray-400'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800 dark:text-gray-400'
  }
}

export const getPriorityLabel = (priority: ClientPriority) => {
  switch (priority) {
    case 'HIGH': return 'Alta'
    case 'NORMAL': return 'Normal'
    case 'LOW': return 'Baja'
    default: return 'Sin definir'
  }
}

// Area
export const getAreaColor = (area: ClientArea) => {
  switch (area) {
    case 'CASANUEVA':
      return 'bg-green-25 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
    case 'CASA_MUNECAS':
      return 'bg-pink-25 text-pink-600 border-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800'
    case 'ATRIO':
      return 'bg-blue-25 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
    case 'CABANAS':
      return 'bg-amber-25 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
  }
}

export const getAreaLabel = (area: ClientArea) => {
  switch (area) {
    case 'CASANUEVA': return 'Casanueva'
    case 'CASA_MUNECAS': return 'Casa de Muñecas'
    case 'ATRIO': return 'Atrio'
    case 'CABANAS': return 'Cabaña'
    default: return 'Sin asignar'
  }
}

// Type
export const getTypeColor = (type: ClientType) => {
  switch (type) {
    case 'WEDDING':
      return 'bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800 dark:text-pink-400'
    case 'QUINCEANOS':
      return 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800 dark:text-purple-400'
    case 'BAUTIZO':
      return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400'
    case 'COMUNION':
      return 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800 dark:text-green-400'
    case 'CORPORATE':
      return 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800 dark:text-indigo-400'
    case 'OTHER':
      return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800 dark:text-gray-400'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800 dark:text-gray-400'
  }
}

export const getTypeLabel = (type: ClientType) => {
  switch (type) {
    case 'WEDDING': return 'Boda'
    case 'QUINCEANOS': return 'XV años'
    case 'BAUTIZO': return 'Bautizo'
    case 'COMUNION': return 'Primera Comunión'
    case 'CORPORATE': return 'Corporativo'
    case 'OTHER': return 'Otro'
    default: return 'Sin asignar'
  }
}

// Channel
export const getChannelColor = (channel: ClientChannel) => {
  switch (channel) {
    case 'INSTAGRAM':
      return 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200 dark:border-purple-800 dark:text-purple-400'
    case 'FACEBOOK':
      return 'bg-blue-600/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400'
    case 'WHATSAPP_SOCIAL':
      return 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800 dark:text-green-400'
    case 'EMAIL':
      return 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800 dark:text-red-400'
    case 'PHONE':
      return 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800 dark:text-indigo-400'
    case 'WALKING':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400'
    case 'REFERRAL':
      return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 dark:text-amber-400'
    case 'RECURRENT':
      return 'bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800 dark:text-teal-400'
    case 'BODAS_COM':
      return 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800 dark:text-rose-400'
    case 'HACIENDAS_BODAS_COM':
      return 'bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800 dark:text-pink-400'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800 dark:text-gray-400'
  }
}

export const getChannelLabel = (channel: ClientChannel) => {
  switch (channel) {
    case 'INSTAGRAM': return 'Instagram'
    case 'FACEBOOK': return 'Facebook'
    case 'WHATSAPP_SOCIAL': return 'WhatsApp - FB/IG'
    case 'EMAIL': return 'Correo'
    case 'PHONE': return 'Llamada'
    case 'WALKING': return 'Walking'
    case 'REFERRAL': return 'Recomendación'
    case 'RECURRENT': return 'Recurrente'
    case 'BODAS_COM': return 'Bodas.com.mx'
    case 'HACIENDAS_BODAS_COM': return 'Haciendas - Bodas.com.mx'
    default: return 'Otro'
  }
}

// Executive
export const getExecutiveColor = (executiveId: string) => {
  const user = getUserById(executiveId)
  if (!user) return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800 dark:text-gray-400'
  
  // Usar colores específicos para cada ejecutivo por ID
  switch (executiveId) {
    case '1': // Yarleny Colín
      return 'bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800 dark:text-violet-400'
    case '2': // Josefo Flores
      return 'bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-800 dark:text-cyan-400'
    case '3': // Sebastián Ramírez
      return 'bg-lime-500/10 text-lime-600 border-lime-200 dark:border-lime-800 dark:text-lime-400'
    default:
      return 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800 dark:text-green-400'
  }
}

export const getExecutiveLabel = (executiveId: string) => {
  const user = getUserById(executiveId)
  return user ? user.name : 'Sin asignar'
}

// Coordinator functions
export const getCoordinatorColor = (coordinatorId: string) => {
  const user = getUserById(coordinatorId)
  if (!user) return 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800 dark:text-gray-400'
  
  // Usar colores específicos para cada coordinador por ID
  switch (coordinatorId) {
    case '4': // Brenda
      return 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800 dark:text-rose-400'
    case '5': // Anetth
      return 'bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-800 dark:text-sky-400'
    case '6': // Andrea
      return 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800 dark:text-purple-400'
    case '7': // Hugo
      return 'bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800 dark:text-teal-400'
    default:
      return 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800 dark:text-orange-400'
  }
}

export const getCoordinatorLabel = (coordinatorId: string) => {
  const user = getUserById(coordinatorId)
  return user ? user.name : 'Sin asignar'
}

// Options arrays
export const statusOptions: { value: ClientStatus; label: string }[] = [
  { value: 'NUEVO_CONTACTO', label: 'Nuevo Contacto' },
  { value: 'ASIGNADO', label: 'Asignado' },
  { value: 'RECORRIDO_PROGRAMADO', label: 'Recorrido Programado' },
  { value: 'CLIENTE_CONTACTADO', label: 'Cliente Contactado' },
  { value: 'CERRADO_VENTA', label: 'Cerrado - Venta' },
  { value: 'CERRADO_SIN_EXITO', label: 'Cerrado - Sin Éxito' },
]

export const priorityOptions: { value: ClientPriority; label: string }[] = [
  { value: 'HIGH', label: 'Alta' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'LOW', label: 'Baja' },
]

export const areaOptions: { value: ClientArea; label: string }[] = [
  { value: 'CASANUEVA', label: 'Casanueva' },
  { value: 'CASA_MUNECAS', label: 'Casa de Muñecas' },
  { value: 'ATRIO', label: 'Atrio' },
  { value: 'CABANAS', label: 'Cabaña' },
]

export const typeOptions: { value: ClientType; label: string }[] = [
  { value: 'WEDDING', label: 'Boda' },
  { value: 'QUINCEANOS', label: 'XV años' },
  { value: 'BAUTIZO', label: 'Bautizo' },
  { value: 'COMUNION', label: 'Primera Comunión' },
  { value: 'CORPORATE', label: 'Corporativo' },
  { value: 'OTHER', label: 'Otro' },
]

export const channelOptions: { value: ClientChannel; label: string }[] = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'WHATSAPP_SOCIAL', label: 'WhatsApp - FB/IG' },
  { value: 'EMAIL', label: 'Correo' },
  { value: 'PHONE', label: 'Llamada' },
  { value: 'WALKING', label: 'Walking' },
  { value: 'REFERRAL', label: 'Recomendación' },
  { value: 'RECURRENT', label: 'Recurrente' },
  { value: 'BODAS_COM', label: 'Bodas.com.mx' },
  { value: 'HACIENDAS_BODAS_COM', label: 'Haciendas - Bodas.com.mx' },
]

// Dynamic options arrays from user management system
export const executiveOptions = generateExecutiveOptions()
export const coordinatorOptions = generateCoordinatorOptions()

// Legacy support - mantener para compatibilidad
export const legacyExecutiveOptions: { value: ClientExecutive; label: string }[] = [
  { value: 'YARLENY_COLIN', label: 'Yarleny Colín' },
  { value: 'JOSEFO_FLORES', label: 'Josefo Flores' },
  { value: 'SEBASTIAN_RAMIREZ', label: 'Sebastián Ramírez' },
]

export const legacyCoordinatorOptions: { value: ClientCoordinator; label: string }[] = [
  { value: 'BRENDA', label: 'Brenda' },
  { value: 'ANETTH', label: 'Anetth' },
  { value: 'ANDREA', label: 'Andrea' },
  { value: 'HUGO', label: 'Hugo' },
]
