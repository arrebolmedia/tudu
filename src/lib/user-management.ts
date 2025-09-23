/**
 * Sistema de Gestión de Usuarios Centralizado
 * Maneja la sincronización entre Configuración y dropdowns CRM
 */

import { UserRole, SystemUser, DropdownOption } from '@/types'

// Base de datos de usuarios del sistema (simulada)
export const SYSTEM_USERS: SystemUser[] = [
  {
    id: 'cmd9nrcdx0001loykbjouo5j4',
    email: 'anthony@arrebol.com.mx',
    name: 'Anthony Cazares',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '1',
    email: 'yarleny.colin@arrebolweddings.com',
    name: 'Yarleny Colín',
    role: 'VENDEDOR',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    email: 'josefo.flores@arrebolweddings.com',
    name: 'Josefo Flores',
    role: 'VENDEDOR',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    email: 'sebastian.ramirez@arrebolweddings.com',
    name: 'Sebastián Ramírez',
    role: 'VENDEDOR',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '4',
    email: 'brenda@arrebolweddings.com',
    name: 'Brenda',
    role: 'COORDINADOR',
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '5',
    email: 'anetth@arrebolweddings.com',
    name: 'Anetth',
    role: 'COORDINADOR',
    isActive: true,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '6',
    email: 'andrea@arrebolweddings.com',
    name: 'Andrea',
    role: 'COORDINADOR',
    isActive: true,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '7',
    email: 'hugo@arrebolweddings.com',
    name: 'Hugo',
    role: 'COORDINADOR',
    isActive: true,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: '8',
    email: 'maria.gonzalez@arrebolweddings.com',
    name: 'María González',
    role: 'GERENTE',
    isActive: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: '9',
    email: 'admin@arrebolweddings.com',
    name: 'Anthony Cazares',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '10',
    email: 'diego.bernot@arrebolweddings.com',
    name: 'Diego Bernot',
    role: 'PROPIETARIO',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

// Mapeo de roles a etiquetas
export const ROLE_LABELS: Record<UserRole, string> = {
  'SUPER_ADMIN': 'Super Administrador',
  'PROPIETARIO': 'Propietario',
  'GERENTE': 'Gerente',
  'VENDEDOR': 'Vendedor',
  'COORDINADOR': 'Coordinador',
  'CALL_CENTER': 'Call Center',
  'COLABORADOR': 'Colaborador'
}

// Mapeo de roles a colores
export const ROLE_COLORS: Record<UserRole, string> = {
  'SUPER_ADMIN': 'bg-purple-100 text-purple-700 border-purple-300',
  'PROPIETARIO': 'bg-red-100 text-red-700 border-red-300',
  'GERENTE': 'bg-blue-100 text-blue-700 border-blue-300',
  'VENDEDOR': 'bg-green-100 text-green-700 border-green-300',
  'COORDINADOR': 'bg-orange-100 text-orange-700 border-orange-300',
  'CALL_CENTER': 'bg-cyan-100 text-cyan-700 border-cyan-300',
  'COLABORADOR': 'bg-gray-100 text-gray-700 border-gray-300'
}

// Funciones para obtener usuarios por rol
export const getUsersByRole = (role: UserRole): SystemUser[] => {
  return SYSTEM_USERS.filter(user => user.role === role && user.isActive)
}

export const getActiveExecutives = (): SystemUser[] => {
  return getUsersByRole('VENDEDOR')
}

export const getActiveCoordinators = (): SystemUser[] => {
  return getUsersByRole('COORDINADOR')
}

// Función para obtener usuarios adicionales del localStorage (agregados en gestión de permisos)
const getUsersFromPermissions = (): SystemUser[] => {
  if (typeof window === 'undefined') return [] // Para SSR
  
  try {
    const savedPermissions = localStorage.getItem('userFieldPermissions')
    if (!savedPermissions) return []
    
    const userPermissions = JSON.parse(savedPermissions)
    
    return userPermissions
      .filter((perm: any) => perm.userId.startsWith('new-')) // Solo usuarios nuevos
      .map((perm: any) => ({
        id: perm.userId,
        name: perm.userName,
        email: perm.userEmail,
        role: perm.userRole,
        isActive: true,
        phone: '',
        position: '',
        department: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as SystemUser))
  } catch (error) {
    console.error('Error leyendo usuarios de localStorage:', error)
    return []
  }
}

// Funciones que combinan usuarios del sistema + localStorage
const getAllActiveExecutives = (): SystemUser[] => {
  const systemExecutives = getActiveExecutives()
  const localExecutives = getUsersFromPermissions().filter(user => user.role === 'VENDEDOR')
  return [...systemExecutives, ...localExecutives]
}

const getAllActiveCoordinators = (): SystemUser[] => {
  const systemCoordinators = getActiveCoordinators()
  const localCoordinators = getUsersFromPermissions().filter(user => user.role === 'COORDINADOR')
  return [...systemCoordinators, ...localCoordinators]
}

// Funciones para generar opciones de dropdown dinámicamente (ACTUALIZADAS)
export const generateExecutiveOptions = (): DropdownOption[] => {
  return getAllActiveExecutives().map(user => ({
    value: user.id,
    label: user.name,
    userId: user.id,
    role: user.role
  }))
}

export const generateCoordinatorOptions = (): DropdownOption[] => {
  return getAllActiveCoordinators().map(user => ({
    value: user.id,
    label: user.name,
    userId: user.id,
    role: user.role
  }))
}

// Función para validar si un usuario existe
export const validateUserExists = (userId: string): boolean => {
  return SYSTEM_USERS.some(user => user.id === userId && user.isActive)
}

// Función para obtener usuario por ID
export const getUserById = (userId: string): SystemUser | undefined => {
  return SYSTEM_USERS.find(user => user.id === userId)
}

// Función para obtener usuario por nombre (para compatibilidad con datos existentes)
export const getUserByName = (name: string): SystemUser | undefined => {
  return SYSTEM_USERS.find(user => 
    user.name.toLowerCase() === name.toLowerCase() && user.isActive
  )
}

// Función para agregar nuevo usuario
export const addNewUser = (userData: Omit<SystemUser, 'id' | 'createdAt' | 'updatedAt'>): SystemUser => {
  const newUser: SystemUser = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  SYSTEM_USERS.push(newUser)
  return newUser
}

// Función para actualizar usuario
export const updateUser = (userId: string, updates: Partial<SystemUser>): SystemUser | null => {
  const userIndex = SYSTEM_USERS.findIndex(user => user.id === userId)
  if (userIndex === -1) return null
  
  SYSTEM_USERS[userIndex] = {
    ...SYSTEM_USERS[userIndex],
    ...updates,
    updatedAt: new Date()
  }
  
  return SYSTEM_USERS[userIndex]
}

// Función para desactivar usuario (soft delete)
export const deactivateUser = (userId: string): boolean => {
  const user = updateUser(userId, { isActive: false })
  return user !== null
}

// Función para migrar datos existentes (convierte nombres a IDs)
export const migrateExistingData = (executiveName?: string, coordinatorName?: string) => {
  const result: { executiveId?: string, coordinatorId?: string } = {}
  
  if (executiveName) {
    const executive = getUserByName(executiveName)
    if (executive) {
      result.executiveId = executive.id
    }
  }
  
  if (coordinatorName) {
    const coordinator = getUserByName(coordinatorName)
    if (coordinator) {
      result.coordinatorId = coordinator.id
    }
  }
  
  return result
}

// Funciones para compatibilidad con el sistema existente
export const getLegacyExecutiveValue = (userId: string): string => {
  const user = getUserById(userId)
  if (!user) return ''
  
  // Mapeo para compatibilidad con valores legacy
  const legacyMap: Record<string, string> = {
    'Yarleny Colín': 'YARLENY_COLIN',
    'Josefo Flores': 'JOSEFO_FLORES',
    'Sebastián Ramírez': 'SEBASTIAN_RAMIREZ'
  }
  
  return legacyMap[user.name] || user.name.toUpperCase().replace(/\s+/g, '_')
}

export const getLegacyCoordinatorValue = (userId: string): string => {
  const user = getUserById(userId)
  return user ? user.name.toUpperCase() : ''
}