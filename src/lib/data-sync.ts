/**
 * Sistema de Migración y Validación de Datos
 * Asegura coherencia entre Configuración y CRM
 */

import { SYSTEM_USERS, getUserByName, addNewUser } from '@/lib/user-management'
import { USER_SPECIFIC_PERMISSIONS, UserFieldPermission } from '@/lib/user-field-permissions'
import { UserRole, SystemUser } from '@/types'

// Función para generar permisos iniciales desde SYSTEM_USERS
export const generatePermissionsFromSystemUsers = (): UserFieldPermission[] => {
  console.log('🔄 Generando permisos desde usuarios del sistema...')
  
  return SYSTEM_USERS.map(user => {
    // Permisos por defecto según el rol
    const getDefaultPermissions = (role: UserRole): { [fieldId: string]: { view: boolean; edit: boolean } } => {
      const basePermissions: { [fieldId: string]: { view: boolean; edit: boolean } } = {}
      
      switch (role) {
        case 'SUPER_ADMIN':
        case 'PROPIETARIO':
        case 'GERENTE':
        case 'CALL_CENTER':
          // Acceso completo a todos los campos
          Object.assign(basePermissions, {
            'name': { view: true, edit: true },
            'phone': { view: true, edit: true },
            'email': { view: true, edit: true },
            'eventDate': { view: true, edit: true },
            'status': { view: true, edit: true },
            'priority': { view: true, edit: true },
            'area': { view: true, edit: true },
            'type': { view: true, edit: true },
            'channel': { view: true, edit: true },
            'assignedExecutive': { view: true, edit: true },
            'notes': { view: true, edit: true },
            'role': { view: true, edit: true }
          })
          break

        case 'VENDEDOR':
          // Vendedores pueden editar campos de contacto y seguimiento
          Object.assign(basePermissions, {
            'name': { view: true, edit: false },
            'phone': { view: true, edit: true },
            'email': { view: true, edit: true },
            'eventDate': { view: true, edit: false },
            'status': { view: true, edit: true },
            'priority': { view: true, edit: true },
            'area': { view: true, edit: false },
            'type': { view: true, edit: false },
            'channel': { view: true, edit: false },
            'assignedExecutive': { view: false, edit: false },
            'notes': { view: true, edit: true },
            'role': { view: false, edit: false }
          })
          break

        case 'COORDINADOR':
          // Coordinadores pueden ver todo pero editar menos
          Object.assign(basePermissions, {
            'name': { view: true, edit: false },
            'phone': { view: true, edit: false },
            'email': { view: true, edit: false },
            'eventDate': { view: true, edit: true },
            'status': { view: true, edit: true },
            'priority': { view: true, edit: false },
            'area': { view: true, edit: true },
            'type': { view: true, edit: false },
            'channel': { view: true, edit: false },
            'assignedExecutive': { view: true, edit: false },
            'notes': { view: true, edit: true },
            'role': { view: false, edit: false }
          })
          break

        case 'COLABORADOR':
          // Colaboradores acceso muy limitado
          Object.assign(basePermissions, {
            'name': { view: true, edit: false },
            'phone': { view: false, edit: false },
            'email': { view: false, edit: false },
            'eventDate': { view: true, edit: false },
            'status': { view: true, edit: true },
            'priority': { view: false, edit: false },
            'area': { view: true, edit: false },
            'type': { view: true, edit: false },
            'channel': { view: false, edit: false },
            'assignedExecutive': { view: false, edit: false },
            'notes': { view: true, edit: false },
            'role': { view: false, edit: false }
          })
          break
      }
      
      return basePermissions
    }

    // Determinar si puede eliminar registros
    const canDelete = ['SUPER_ADMIN', 'PROPIETARIO', 'GERENTE', 'CALL_CENTER'].includes(user.role)

    return {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      canDeleteRecord: canDelete,
      fieldPermissions: getDefaultPermissions(user.role)
    }
  })
}

// Función para validar y sincronizar usuarios
export const validateAndSyncUsers = () => {
  const issues: string[] = []
  const fixes: string[] = []

  console.log('🔄 Iniciando validación y sincronización de usuarios...')

  // 1. Verificar que todos los usuarios de permisos existan en SYSTEM_USERS
  USER_SPECIFIC_PERMISSIONS.forEach(permUser => {
    const systemUser = SYSTEM_USERS.find(su => su.id === permUser.userId)
    
    if (!systemUser) {
      issues.push(`Usuario en permisos no existe en sistema: ${permUser.userName} (ID: ${permUser.userId})`)
      
      // Auto-fix: Agregar usuario al sistema
      const newUser: SystemUser = {
        id: permUser.userId,
        email: permUser.userEmail,
        name: permUser.userName,
        role: permUser.userRole,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      SYSTEM_USERS.push(newUser)
      fixes.push(`✅ Agregado ${permUser.userName} al sistema con rol ${permUser.userRole}`)
    } else {
      // Verificar que el rol coincida
      if (systemUser.role !== permUser.userRole) {
        issues.push(`Rol inconsistente para ${permUser.userName}: Sistema=${systemUser.role}, Permisos=${permUser.userRole}`)
        systemUser.role = permUser.userRole
        fixes.push(`✅ Sincronizado rol de ${permUser.userName} a ${permUser.userRole}`)
      }
    }
  })

  // 2. Verificar que todos los usuarios del sistema tengan permisos
  SYSTEM_USERS.forEach(systemUser => {
    const hasPermissions = USER_SPECIFIC_PERMISSIONS.find(pu => pu.userId === systemUser.id)
    
    if (!hasPermissions) {
      issues.push(`Usuario del sistema sin permisos configurados: ${systemUser.name} (ID: ${systemUser.id})`)
      // Nota: Los permisos se crearían cuando se acceda al UserFieldPermissionsManager
    }
  })

  console.log('📊 Resultados de validación:')
  console.log(`❌ Problemas encontrados: ${issues.length}`)
  console.log(`✅ Correcciones aplicadas: ${fixes.length}`)

  if (issues.length > 0) {
    console.log('🔍 Problemas detectados:')
    issues.forEach(issue => console.log(`  - ${issue}`))
  }

  if (fixes.length > 0) {
    console.log('🔧 Correcciones aplicadas:')
    fixes.forEach(fix => console.log(`  - ${fix}`))
  }

  return { issues, fixes }
}

// Función para migrar datos legacy a nuevos IDs
export const migrateLegacyData = () => {
  console.log('🔄 Iniciando migración de datos legacy...')
  
  // Mapeo de nombres legacy a nuevos IDs
  const legacyMapping = {
    // Ejecutivos
    'YARLENY_COLIN': '1',
    'JOSEFO_FLORES': '2', 
    'SEBASTIAN_RAMIREZ': '3',
    'Yarleny Colín': '1',
    'Josefo Flores': '2',
    'Sebastián Ramírez': '3',
    
    // Coordinadores
    'BRENDA': '4',
    'ANETTH': '5', 
    'ANDREA': '6',
    'HUGO': '7',
    'Brenda': '4',
    'Anetth': '5',
    'Andrea': '6',
    'Hugo': '7'
  }

  return legacyMapping
}

// Función para obtener usuario por valor legacy
export const getUserByLegacyValue = (legacyValue: string): SystemUser | undefined => {
  const mapping = migrateLegacyData()
  const userId = mapping[legacyValue as keyof typeof mapping]
  
  if (userId) {
    return SYSTEM_USERS.find(user => user.id === userId)
  }
  
  // Fallback: buscar por nombre
  return getUserByName(legacyValue)
}

// Función para validar integridad de dropdowns
export const validateDropdownIntegrity = () => {
  console.log('🔍 Validando integridad de dropdowns...')
  
  const activeExecutives = SYSTEM_USERS.filter(user => 
    user.role === 'VENDEDOR' && user.isActive
  )
  
  const activeCoordinators = SYSTEM_USERS.filter(user => 
    user.role === 'COORDINADOR' && user.isActive
  )

  console.log(`📈 Ejecutivos activos: ${activeExecutives.length}`)
  activeExecutives.forEach(exec => 
    console.log(`  - ${exec.name} (${exec.email})`)
  )

  console.log(`📋 Coordinadores activos: ${activeCoordinators.length}`)
  activeCoordinators.forEach(coord => 
    console.log(`  - ${coord.name} (${coord.email})`)
  )

  return {
    executives: activeExecutives,
    coordinators: activeCoordinators
  }
}

// Función principal de sincronización
export const syncUserData = () => {
  console.log('🚀 Iniciando sincronización completa de datos de usuario...')
  
  const validationResults = validateAndSyncUsers()
  const dropdownData = validateDropdownIntegrity()
  
  console.log('✅ Sincronización completada')
  
  return {
    validation: validationResults,
    dropdowns: dropdownData,
    timestamp: new Date().toISOString()
  }
}

// Auto-ejecutar sincronización al importar el módulo
if (typeof window !== 'undefined') {
  // Solo en el cliente
  setTimeout(() => {
    syncUserData()
  }, 1000)
}