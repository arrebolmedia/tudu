'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface ActivityLogEntry {
  id: string
  clientId: string
  field: string
  oldValue: any
  newValue: any
  timestamp: Date
  formattedMessage: string
}

interface ActivityLogContextType {
  logs: ActivityLogEntry[]
  addLog: (clientId: string, field: string, oldValue: any, newValue: any, formattedMessage: string) => void
  getClientLogs: (clientId: string) => ActivityLogEntry[]
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined)

export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([
    // Datos de ejemplo para desarrollo - Cliente 1 (Ana García)
    {
      id: 'log1',
      clientId: '1',
      field: 'status',
      oldValue: 'lead',
      newValue: 'contacted',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      formattedMessage: 'Estado cambiado de Lead a Contactado'
    },
    {
      id: 'log2',
      clientId: '1',
      field: 'priority',
      oldValue: 'medium',
      newValue: 'high',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      formattedMessage: 'Prioridad cambiada de Media a Alta'
    },
    // Datos de ejemplo - Cliente 2 (Carlos Mendez)
    {
      id: 'log3',
      clientId: '2',
      field: 'area',
      oldValue: 'wedding',
      newValue: 'corporate',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      formattedMessage: 'Área cambiada de Bodas a Corporativo'
    }
  ])

  const addLog = useCallback((clientId: string, field: string, oldValue: any, newValue: any, formattedMessage: string) => {
    const newLog: ActivityLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      field,
      oldValue,
      newValue,
      timestamp: new Date(),
      formattedMessage
    }

    setLogs(prev => [newLog, ...prev])
    
    // Log para debug
    console.log('🎯 Activity Log Added:', {
      clientId,
      field,
      oldValue,
      newValue,
      formattedMessage,
      timestamp: newLog.timestamp
    })
  }, [])

  const getClientLogs = useCallback((clientId: string) => {
    return logs
      .filter(log => log.clientId === clientId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [logs])

  return (
    <ActivityLogContext.Provider value={{ logs, addLog, getClientLogs }}>
      {children}
    </ActivityLogContext.Provider>
  )
}

export function useActivityLog() {
  const context = useContext(ActivityLogContext)
  if (context === undefined) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider')
  }
  return context
}
