'use client'

import { useState } from 'react'
import { QuickTaskFab } from '@/components/ui/quick-task-fab'
import { Task, List } from '@/types'

export default function FabsTestPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeList, setActiveList] = useState('list-1')

  // Mock lists para testing
  const mockLists: List[] = [
    { id: 'list-1', name: 'Lista Principal', color: '#FF6B35', isDefault: true, position: 0, createdAt: new Date(), updatedAt: new Date() },
    { id: 'list-2', name: 'Trabajo', color: '#4ECDC4', isDefault: false, position: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 'list-3', name: 'Personal', color: '#45B7D1', isDefault: false, position: 2, createdAt: new Date(), updatedAt: new Date() }
  ]

  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'Nueva tarea',
      description: taskData.description || '',
      completed: false,
      status: taskData.status || 'PENDING',
      priority: taskData.priority || 'NORMAL',
      position: tasks.length,
      listId: activeList,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...taskData
    }
    setTasks(prev => [...prev, newTask])
    console.log('Nueva tarea creada:', newTask)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-arrebol-terracota mb-8 font-display">
          Testing FABs de Tareas Rápidas
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Estado actual</h2>
          <p className="text-gray-600 mb-2">Lista activa: {mockLists.find(l => l.id === activeList)?.name}</p>
          <p className="text-gray-600 mb-4">Tareas creadas: {tasks.length}</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cambiar lista activa:
            </label>
            <select 
              value={activeList} 
              onChange={(e) => setActiveList(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {mockLists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tareas creadas</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-500 italic">No hay tareas creadas aún</p>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="border border-gray-200 rounded p-3">
                  <h3 className="font-medium">{task.title}</h3>
                  {task.description && <p className="text-gray-600 text-sm">{task.description}</p>}
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {task.priority}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                      {mockLists.find(l => l.id === task.listId)?.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Renderizar FAB principal */}
      <QuickTaskFab 
        onCreateTask={handleCreateTask}
        lists={mockLists}
        activeListId={activeList}
      />
    </div>
  )
}
