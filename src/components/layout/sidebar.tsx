'use client'

import { useState, useEffect } from 'react'
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
  Bookmark
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
    id: 'today',
    title: 'Hoy',
    icon: Calendar,
    color: '#3b82f6'
  },
  {
    id: 'important',
    title: 'Importantes',
    icon: Star,
    color: '#f59e0b'
  },
  {
    id: 'completed',
    title: 'Completadas',
    icon: CheckSquare,
    color: '#10b981'
  },
  {
    id: 'archived',
    title: 'Archivadas',
    icon: Archive,
    color: '#6b7280'
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
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <IconComponent
            size={18}
            className="transition-colors duration-200"
            style={color ? { color } : {}}
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
              ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
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
  
  return (
    <div className="h-full w-72 flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestor de Tareas
          </h1>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-2">
          {/* Smart Lists */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Listas inteligentes
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

          {/* Línea divisoria entre listas inteligentes y mis listas */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

          {/* Custom Lists */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mis listas
              </h2>
              <button
                onClick={onCreateList}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {normalLists
                .sort((a, b) => {
                  // Ordenar por fijadas primero, luego alfabéticamente
                  const aIsPinned = pinnedLists.has(a.id)
                  const bIsPinned = pinnedLists.has(b.id)
                  
                  if (aIsPinned && !bIsPinned) return -1
                  if (!aIsPinned && bIsPinned) return 1
                  
                  return a.title.localeCompare(b.title)
                })
                .map((list) => {
                const IconComponent = iconMap[list.icon as keyof typeof iconMap] || List
                
                // Si está en modo edición, mostrar input
                if (editingList && editingList.id === list.id) {
                  return (
                    <div key={list.id} className="px-3 py-2">
                      <input
                        type="text"
                        value={editingList.title}
                        onChange={(e) => setEditingList({...editingList, title: e.target.value})}
                        onBlur={() => handleSaveEdit(editingList.title)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(editingList.title)
                          } else if (e.key === 'Escape') {
                            setEditingList(null)
                          }
                        }}
                        className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  )
                }
                
                return (
                  <ListItem
                    key={list.id}
                    title={list.title}
                    icon={IconComponent}
                    color={list.color}
                    isActive={activeListId === list.id}
                    count={taskCounts[list.id] || 0}
                    onClick={() => onListSelect(list.id)}
                    onContextMenu={(e) => handleContextMenu(e, list.id)}
                    canDelete={!list.isDefault}
                    isPinned={pinnedLists.has(list.id)}
                  />
                )
              })}
              
              {/* Tareas Rápidas siempre al final */}
              {quickTasksList && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  <ListItem
                    key={quickTasksList.id}
                    title={quickTasksList.title}
                    icon={iconMap[quickTasksList.icon as keyof typeof iconMap] || List}
                    color={quickTasksList.color}
                    isActive={activeListId === quickTasksList.id}
                    count={taskCounts[quickTasksList.id] || 0}
                    onClick={() => onListSelect(quickTasksList.id)}
                    canDelete={false}
                    isPinned={false}
                  />
                </>
              )}
            </div>
          </div>
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
