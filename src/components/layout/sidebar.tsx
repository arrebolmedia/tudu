'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Plus, 
  List, 
  Calendar, 
  Star, 
  CheckSquare,
  Archive,
  Home,
  Search,
  Briefcase,
  Heart,
  Sparkles,
  ShoppingCart,
  Book,
  Music,
  Camera,
  Coffee,
  Plane,
  Gamepad2,
  Palette,
  Target,
  Bookmark,
  ChevronDown,
  Users,
  ClipboardList
} from 'lucide-react'

import { List as ListType } from '@/types'
import { cn } from '@/lib/utils'
import { ContextMenu } from '@/components/ui/context-menu'
import { DeleteListModal } from '@/components/ui/delete-list-modal'

interface SidebarProps {
  lists: ListType[]
  activeListId?: string
  onListSelect: (listId: string | undefined) => void
  onCreateList: () => void
  onDeleteList: (listId: string, moveTasksToListId?: string) => void
  onUpdateList?: (listId: string, updates: Partial<ListType>) => void
  taskCounts: Record<string, number>
  searchQuery: string
  onSearchChange: (query: string) => void
}

const iconMap = {
  list: List,
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

const smartLists = [
  {
    id: 'todas',
    title: 'Todas las tareas',
    icon: List,
    color: '#d87254'  // Terracota principal
  },
  {
    id: 'today',
    title: 'Hoy',
    icon: Calendar,
    color: '#c85a3a'  // Terracota 600
  },
  {
    id: 'important',
    title: 'Importantes',
    icon: Star,
    color: '#a8472f'  // Terracota 700
  },
  {
    id: 'completed',
    title: 'Completadas',
    icon: CheckSquare,
    color: '#e3cfaa'  // Beige 500
  },
  {
    id: 'archived',
    title: 'Archivadas',
    icon: Archive,
    color: '#d4b894'  // Beige 600
  }
]

interface ListItemProps {
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color?: string
  isActive: boolean
  count: number
  onClick: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  canDelete?: boolean
  isPinned?: boolean
}

function ListItem({ 
  title, 
  icon: IconComponent, 
  color, 
  isActive, 
  count, 
  onClick,
  onContextMenu,
  canDelete = true,
  isPinned = false
}: ListItemProps) {
  
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
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
            className="transition-colors duration-200"
            style={{ 
              color: isActive 
                ? (color || '#d87254')  // Color directo del smart list o terracota por defecto
                : '#b6905a'  // Beige 600 aproximado
            }}
          />
        </div>
        <span className="font-medium truncate text-sm">
          {title}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {isPinned && (
          <Bookmark 
            size={14} 
            className="text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 flex-shrink-0" 
          />
        )}
        
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

export function Sidebar({ 
  lists, 
  activeListId, 
  onListSelect, 
  onCreateList, 
  onDeleteList,
  onUpdateList,
  taskCounts, 
  searchQuery, 
  onSearchChange 
}: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  // Estados para el dropdown (deben ir antes del useEffect)
  const [activeModule, setActiveModule] = useState('TASKS')
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
  
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    listId: string
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    list: ListType
    taskCount: number
  } | null>(null)
  const [editingList, setEditingList] = useState<{
    id: string
    title: string
  } | null>(null)
  const [pinnedLists, setPinnedLists] = useState<Set<string>>(new Set())

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

  // Cargar listas fijadas desde localStorage al inicializar
  useEffect(() => {
    const savedPinnedLists = localStorage.getItem('pinnedLists')
    if (savedPinnedLists) {
      try {
        const parsed = JSON.parse(savedPinnedLists)
        setPinnedLists(new Set(parsed))
      } catch (error) {
        console.error('Error parsing pinned lists from localStorage:', error)
      }
    }
  }, [])

  // Guardar listas fijadas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('pinnedLists', JSON.stringify(Array.from(pinnedLists)))
  }, [pinnedLists])

  const handleContextMenu = (e: React.MouseEvent, listId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Debug: Verificar las coordenadas
    console.log('Context menu triggered:', {
      pageX: e.pageX,
      pageY: e.pageY,
      clientX: e.clientX,
      clientY: e.clientY,
      scrollX: window.pageXOffset,
      scrollY: window.pageYOffset,
      listId
    })
    
    // Usar pageX/pageY para considerar el scroll
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      listId
    })
  }

  const handlePinList = (listId: string) => {
    setPinnedLists(prev => {
      const newSet = new Set(prev)
      if (newSet.has(listId)) {
        newSet.delete(listId)
      } else {
        newSet.add(listId)
      }
      return newSet
    })
  }

  const handleEditList = (listId: string) => {
    const list = lists.find(l => l.id === listId)
    if (list) {
      setEditingList({ id: listId, title: list.title })
    }
  }

  const handleSaveEdit = (newTitle: string) => {
    if (editingList && newTitle.trim()) {
      if (onUpdateList) {
        onUpdateList(editingList.id, { title: newTitle.trim() })
      }
    }
    setEditingList(null)
  }

  const handleDeleteList = (listId: string) => {
    const list = lists.find(l => l.id === listId)
    if (!list) return

    const taskCount = taskCounts[listId] || 0
    setDeleteModal({ list, taskCount })
  }

  const confirmDeleteList = (moveTasksToListId?: string) => {
    if (!deleteModal) return
    
    onDeleteList(deleteModal.list.id, moveTasksToListId)
    setDeleteModal(null)
  }

  // Separar listas normales de "Tareas Rápidas"
  const normalLists = lists.filter(list => list.id !== 'quick-tasks')
  const quickTasksList = lists.find(list => list.id === 'quick-tasks')
  
  const modules = [
    { id: 'TASKS', name: 'TAREAS', icon: ClipboardList, available: true },
    { id: 'CRM', name: 'CRM', icon: Users, available: true },
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
            <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-arrebol-beige-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-[70]">
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
                    <span className="font-display font-semibold text-sm uppercase tracking-wide">
                      {module.name}
                    </span>
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
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-arrebol-beige-50 dark:bg-gray-800 border border-arrebol-beige-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-arrebol-terracota-400 focus:border-arrebol-terracota-400 text-arrebol-terracota-700 placeholder-arrebol-beige-400"
          />
        </div>
      </div>

      {/* Lists - Solo scroll vertical, NO horizontal */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-6 py-2">
          {/* Smart Lists */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Vistas inteligentes
            </h2>
            <div className="space-y-1">
              {smartLists.map((smartList) => (
                <ListItem
                  key={smartList.id}
                  title={smartList.title}
                  icon={smartList.icon}
                  color={smartList.color}
                  isActive={activeListId === smartList.id}
                  count={taskCounts[smartList.id] || 0}
                  onClick={() => onListSelect(smartList.id)}
                  isPinned={false}
                />
              ))}
            </div>
          </div>

          {/* MIS LISTAS - Custom User Lists */}
          {normalLists.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mis Listas
                </h2>
                <button
                  onClick={onCreateList}
                  className="p-1 hover:bg-arrebol-beige-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-arrebol-terracota-500 transition-colors"
                  title="Crear nueva lista"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-1">
                {normalLists.map((list) => (
                  <ListItem
                    key={list.id}
                    title={list.title}
                    icon={iconMap[list.icon as keyof typeof iconMap] || List}
                    color={list.color}
                    isActive={activeListId === list.id}
                    count={taskCounts[list.id] || 0}
                    onClick={() => onListSelect(list.id)}
                    onContextMenu={(e) => handleContextMenu(e, list.id)}
                    isPinned={pinnedLists.has(list.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tareas Rápidas - Separate section */}
          {quickTasksList && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Tareas Rápidas
              </h2>
              <div className="space-y-1">
                <ListItem
                  key={quickTasksList.id}
                  title={quickTasksList.title}
                  icon={iconMap[quickTasksList.icon as keyof typeof iconMap] || List}
                  color={quickTasksList.color}
                  isActive={activeListId === quickTasksList.id}
                  count={taskCounts[quickTasksList.id] || 0}
                  onClick={() => onListSelect(quickTasksList.id)}
                  isPinned={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          isOpen={true}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={() => handleDeleteList(contextMenu.listId)}
          onEdit={() => handleEditList(contextMenu.listId)}
          onPin={() => handlePinList(contextMenu.listId)}
          canDelete={contextMenu.listId !== 'quick-tasks'}
          canEdit={contextMenu.listId !== 'quick-tasks'}
          canPin={contextMenu.listId !== 'quick-tasks'}
          isPinned={pinnedLists.has(contextMenu.listId)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <DeleteListModal
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          onConfirm={confirmDeleteList}
          list={deleteModal.list}
          otherLists={lists.filter(l => l.id !== deleteModal.list.id)}
          taskCount={deleteModal.taskCount}
        />
      )}
    </div>
  )
}

export default Sidebar
