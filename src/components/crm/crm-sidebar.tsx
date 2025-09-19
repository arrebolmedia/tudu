'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Search,
  Users,
  Calendar,
  Star,
  CheckCircle,
  Archive,
  Clock,
  AlertCircle,
  UserPlus,
  ChevronDown,
  ClipboardList,
  Building,
  Heart,
  Crown,
  Briefcase
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface ModuleItem {
  id: string
  name: string
  icon: any
  available: boolean
  subtitle?: string
}

interface CrmSidebarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  activeView?: string
  onViewSelect?: (viewId: string) => void
  clientCounts?: Record<string, number>
}

const smartViews = [
  {
    id: 'all',
    title: 'Todos los clientes',
    icon: Users,
    color: '#d87254'  // Terracota principal
  },
  {
    id: 'new',
    title: 'Nuevos contactos',
    icon: UserPlus,
    color: '#4ade80'  // Verde
  },
  {
    id: 'assigned',
    title: 'Asignados',
    icon: CheckCircle,
    color: '#3b82f6'  // Azul
  },
  {
    id: 'high-priority',
    title: 'Alta prioridad',
    icon: Star,
    color: '#f59e0b'  // Ámbar
  },
  {
    id: 'upcoming-events',
    title: 'Eventos próximos',
    icon: Calendar,
    color: '#8b5cf6'  // Púrpura
  },
  {
    id: 'weddings',
    title: 'Bodas',
    icon: Heart,
    color: '#ec4899'  // Rosa
  },
  {
    id: 'corporate',
    title: 'Corporativo',
    icon: Briefcase,
    color: '#6366f1'  // Índigo
  },
  {
    id: 'vip',
    title: 'Clientes VIP',
    icon: Crown,
    color: '#f59e0b'  // Dorado
  },
  {
    id: 'overdue',
    title: 'Sin asignar',
    icon: AlertCircle,
    color: '#ef4444'  // Rojo
  },
  {
    id: 'archived',
    title: 'Archivados',
    icon: Archive,
    color: '#6b7280'  // Gris
  }
]

interface ViewItemProps {
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color?: string
  isActive: boolean
  count: number
  onClick: () => void
}

function ViewItem({ 
  title, 
  icon: IconComponent, 
  color, 
  isActive, 
  count, 
  onClick
}: ViewItemProps) {
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-200 group',
        isActive 
          ? 'bg-arrebol-terracota/10 dark:bg-arrebol-terracota/20 text-arrebol-terracota dark:text-arrebol-terracota-light shadow-sm' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <IconComponent
            className="transition-colors duration-200 w-[18px] h-[18px]"
            style={{ 
              color: isActive 
                ? (color || '#d87254')  // Color directo de la vista o terracota por defecto
                : '#b6905a'  // Beige 600 aproximado
            }}
          />
        </div>
        <span className="font-medium truncate text-sm">
          {title}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {count > 0 && (
          <span className={cn(
            'text-xs px-2 py-1 rounded-full font-medium transition-colors duration-200',
            isActive 
              ? 'bg-arrebol-beige-200 dark:bg-arrebol-beige-700 text-arrebol-beige-800 dark:text-arrebol-beige-200'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
          )}>
            {count}
          </span>
        )}
      </div>
    </button>
  )
}

export function CrmSidebar({ 
  searchQuery, 
  onSearchChange,
  activeView = 'all',
  onViewSelect = () => {},
  clientCounts = {}
}: CrmSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeModule, setActiveModule] = useState('CRM')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Determinar módulo activo basado en la ruta actual
  useEffect(() => {
    if (pathname.startsWith('/crm')) {
      setActiveModule('CRM')
    } else if (pathname.startsWith('/planning')) {
      setActiveModule('PLANNING')
    } else {
      setActiveModule('TASKS')
    }
  }, [pathname])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])
  
  const modules: ModuleItem[] = [
    { id: 'CRM', name: 'CRM', icon: Users, available: true },
    { id: 'TASKS', name: 'TAREAS', icon: ClipboardList, available: false },
    { id: 'PLANNING', name: 'PLANNING', icon: Calendar, available: false }
  ]
  
  return (
    <div className="h-full w-72 flex flex-col bg-arrebol-beige-50/95 dark:bg-gray-900/95 backdrop-blur-sm overflow-x-hidden border-t border-arrebol-beige-200 dark:border-gray-700">
      {/* Header with Simple Dropdown - FIJO, sin desplazamiento horizontal pero permite dropdown */}
      <div className="px-6 pb-4 pt-3 border-b border-arrebol-beige-200 dark:border-gray-700 flex-shrink-0 relative z-10">
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full py-2 text-left hover:text-arrebol-terracota-600 dark:hover:text-arrebol-terracota-400 transition-colors duration-200"
          >
            <h1 className="font-display font-bold text-xl text-arrebol-terracota-600 dark:text-arrebol-terracota-400 uppercase tracking-wide">
              {modules.find(m => m.id === activeModule)?.name || activeModule}
            </h1>
            <ChevronDown 
              size={18} 
              className={`text-arrebol-terracota-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {/* Simple Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-arrebol-beige-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-[9999]">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    
                    if (module.available) {
                      setActiveModule(module.id)
                      
                      // Navegar inmediatamente
                      if (module.id === 'TASKS') {
                        router.push('/')
                      } else if (module.id === 'CRM') {
                        router.push('/crm')
                      } else if (module.id === 'PLANNING') {
                        router.push('/planning')
                      }
                    }
                    
                    // Cerrar dropdown después
                    setTimeout(() => setIsDropdownOpen(false), 50)
                  }}
                  disabled={!module.available}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-200 ${
                    module.available 
                      ? 'hover:bg-arrebol-beige-50 dark:hover:bg-gray-700 text-arrebol-terracota-700 dark:text-gray-100' 
                      : 'text-arrebol-beige-400 dark:text-gray-500 cursor-not-allowed'
                  } ${activeModule === module.id ? 'bg-arrebol-terracota-500 text-white' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <module.icon size={16} className={`${activeModule === module.id ? 'text-white' : 'text-arrebol-terracota-500'}`} />
                    <div className="flex flex-col">
                      <span className="font-display font-semibold text-sm uppercase tracking-wide">
                        {module.name}
                      </span>
                      {module.subtitle && (
                        <span className="text-xs text-arrebol-beige-500 dark:text-gray-400 lowercase">
                          {module.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                  {!module.available && (
                    <span className="text-xs bg-arrebol-beige-200 dark:bg-gray-600 text-arrebol-beige-600 dark:text-gray-400 px-2 py-1 rounded-full">
                      Próximamente
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search - FIJO, sin scroll horizontal */}
      <div className="px-6 py-4 flex-shrink-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-arrebol-beige-400" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-arrebol-beige-50 dark:bg-gray-800 border border-arrebol-beige-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-arrebol-terracota-400 focus:border-arrebol-terracota-400 text-arrebol-terracota-700 placeholder-arrebol-beige-400"
          />
        </div>
      </div>

      {/* Smart Views - Solo scroll vertical, NO horizontal */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-6 py-2">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Vistas inteligentes
            </h2>
            <div className="space-y-1">
              {smartViews.map((view) => (
                <ViewItem
                  key={view.id}
                  title={view.title}
                  icon={view.icon}
                  color={view.color}
                  isActive={activeView === view.id}
                  count={clientCounts[view.id] || 0}
                  onClick={() => onViewSelect(view.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrmSidebar
