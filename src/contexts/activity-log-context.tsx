'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

export interface ActivityLogEntry {
  id: string
  clientId: string
  field: string
  oldValue: any
  newValue: any
  timestamp: Date
  formattedMessage: string
  changedBy: string
}

interface ActivityLogContextType {
  logs: ActivityLogEntry[]
  addLog: (clientId: string, field: string, oldValue: any, newValue: any, formattedMessage: string, changedBy?: string) => void
  getClientLogs: (clientId: string) => ActivityLogEntry[]
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined)

export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])
  const [logCounter, setLogCounter] = useState(0)

  // Cargar datos desde localStorage al inicializar
  useEffect(() => {
    const savedLogs = localStorage.getItem('activity-logs')
    const savedCounter = localStorage.getItem('activity-log-counter')
    
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }))
        setLogs(parsedLogs)
      } catch (error) {
        console.error('Error parsing saved activity logs:', error)
        // Si hay error, inicializar con datos de ejemplo
        initializeWithExampleData()
      }
    } else {
      // Si no hay datos guardados, inicializar con datos de ejemplo
      initializeWithExampleData()
    }
    
    if (savedCounter) {
      try {
        setLogCounter(parseInt(savedCounter, 10))
      } catch (error) {
        console.error('Error parsing saved counter:', error)
      }
    }
  }, [])

  const initializeWithExampleData = () => {
    const exampleLogs: ActivityLogEntry[] = [
      // Datos de ejemplo para desarrollo - Cliente 1 (Ana García)
      {
        id: 'log1',
        clientId: '1',
        field: 'status',
        oldValue: 'lead',
        newValue: 'contacted',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        formattedMessage: 'Estado cambiado de Lead a Contactado',
        changedBy: 'Anthony Cazares'
      },
      {
        id: 'log2',
        clientId: '1',
        field: 'priority',
        oldValue: 'medium',
        newValue: 'high',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        formattedMessage: 'Prioridad cambiada de Media a Alta',
        changedBy: 'Sebastián Ramírez'
      },
      // Datos de ejemplo - Cliente 2 (Carlos Mendez)
      {
        id: 'log3',
        clientId: '2',
        field: 'area',
        oldValue: 'wedding',
        newValue: 'corporate',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        formattedMessage: 'Área cambiada de Bodas a Corporativo',
        changedBy: 'Yarleny Colín'
      }
    ]
    setLogs(exampleLogs)
  }

  const addLog = useCallback((clientId: string, field: string, oldValue: any, newValue: any, formattedMessage: string, changedBy = 'Anthony Cazares') => {
    // Solo registrar si el mensaje está en español (contiene "cambiado de")
    if (!formattedMessage.includes('cambiado de')) {
      return
    }

    // SISTEMA ANTI-DUPLICACIÓN ROBUSTO
    // Verificar si ya existe un log idéntico en los últimos 5 segundos
    const now = Date.now()
    
    setLogs(currentLogs => {
      // Buscar duplicados recientes
      const recentDuplicate = currentLogs.find(log => 
        log.clientId === clientId &&
        log.field === field &&
        log.formattedMessage === formattedMessage &&
        (now - log.timestamp.getTime()) < 5000 // 5 segundos
      )

      if (recentDuplicate) {
        console.log('🚫 Duplicate log blocked:', formattedMessage)
        return currentLogs // No agregar, devolver estado actual
      }

      // Si no hay duplicado, crear el nuevo log
      const newLog: ActivityLogEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clientId,
        field,
        oldValue,
        newValue,
        timestamp: new Date(),
        formattedMessage,
        changedBy
      }

      console.log(`✅ Activity Log Added:`, formattedMessage)
      return [newLog, ...currentLogs]
    })

    // Incrementar contador solo si se agregó un log
    setLogCounter(prev => prev + 1)
  }, []) // Sin dependencias para evitar re-creaciones

  const getClientLogs = useCallback((clientId: string) => {
    return logs
      .filter(log => log.clientId === clientId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [logs])

  // Guardar logs en localStorage cuando cambien
  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem('activity-logs', JSON.stringify(logs))
    }
  }, [logs])

  // Guardar contador en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('activity-log-counter', logCounter.toString())
  }, [logCounter])

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