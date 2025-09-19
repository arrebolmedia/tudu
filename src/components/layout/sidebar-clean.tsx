'use client'

import { useState } from 'react'
import { 
  Plus, 
  List, 
  Calendar, 
  Star, 
  CheckSquare,
  Home,
  Search,
  Briefcase,
  Heart,
  Sparkles
} from 'lucide-react'

import { List as ListType } from '@/types'
import { cn } from '@/lib/utils'

interface SidebarProps {
  lists: ListType[]
  activeListId?: string
  onListSelect: (listId: string | undefined) => void
  onCreateList: () => void
  taskCounts: Record<string, number>
}

const iconMap = {
  list: List,
  home: Home,
  briefcase: Briefcase,
  heart: Heart,
  star: Star,
  calendar: Calendar,
  'shopping-cart': CheckSquare,
  book: CheckSquare,
  music: CheckSquare,
  camera: CheckSquare,
  coffee: CheckSquare,
  plane: CheckSquare
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
    color: '#ef4444'
  },
  {
    id: 'completed',
    title: 'Completadas',
    icon: CheckSquare,
    color: '#10b981'
  }
]

interface ListItemProps {
  listId: string
  title: string
  icon: any
  color?: string
  isActive: boolean
  count: number
  onClick: () => void
  isSmartList?: boolean
}

function ListItem({ 
  listId, 
  title, 
  icon: IconComponent, 
  color, 
  isActive, 
  count, 
  onClick,
  isSmartList = false 
}: ListItemProps) {
  
  return (
    <button
      onClick={onClick}
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
    </button>
  )
}

export function Sidebar({ lists, activeListId, onListSelect, onCreateList, taskCounts }: SidebarProps) {
  return (
    <div className="h-full w-64 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-arrebol-terracota-500 rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            LA NORIA
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
                  listId={smartList.id}
                  title={smartList.title}
                  icon={smartList.icon}
                  color={smartList.color}
                  isActive={activeListId === smartList.id}
                  count={taskCounts[smartList.id] || 0}
                  onClick={() => onListSelect(smartList.id)}
                  isSmartList={true}
                />
              ))}
            </div>
          </div>

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
              {lists.map((list) => {
                const IconComponent = iconMap[list.icon as keyof typeof iconMap] || List
                return (
                  <ListItem
                    key={list.id}
                    listId={list.id}
                    title={list.title}
                    icon={IconComponent}
                    color={list.color}
                    isActive={activeListId === list.id}
                    count={taskCounts[list.id] || 0}
                    onClick={() => onListSelect(list.id)}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
