'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { Comment } from '@/types'

interface CommentsContextType {
  comments: Comment[]
  currentUser: string
  addComment: (clientId: string, content: string, author?: string, isInternal?: boolean, isImportant?: boolean) => void
  getClientComments: (clientId: string) => Comment[]
  deleteComment: (commentId: string) => void
  updateComment: (commentId: string, content: string) => void
  toggleImportant: (commentId: string) => void
  canEditComment: (comment: Comment) => boolean
  canDeleteComment: (comment: Comment) => boolean
}

// Constantes para tiempo límite
const EDIT_TIME_LIMIT_HOURS = 24
const EDIT_TIME_LIMIT_MS = EDIT_TIME_LIMIT_HOURS * 60 * 60 * 1000 // 24 horas en milisegundos

// Función utilitaria para verificar si un comentario puede ser editado/eliminado
const isWithinTimeLimit = (timestamp: Date): boolean => {
  const now = new Date().getTime()
  const commentTime = timestamp.getTime()
  return (now - commentTime) <= EDIT_TIME_LIMIT_MS
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined)

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [commentCounter, setCommentCounter] = useState(0)
  const [currentUser] = useState('Anthony Cazares') // Usuario actual del sistema

  // Cargar comentarios desde localStorage al inicializar
  useEffect(() => {
    const savedComments = localStorage.getItem('crm-comments')
    const savedCounter = localStorage.getItem('crm-comments-counter')
    
    if (savedComments) {
      try {
        const parsedComments = JSON.parse(savedComments).map((comment: any) => ({
          ...comment,
          timestamp: new Date(comment.timestamp)
        }))
        setComments(parsedComments)
      } catch (error) {
        console.error('Error parsing saved comments:', error)
        // Si hay error, inicializar con datos de ejemplo
        initializeWithExampleData()
      }
    } else {
      // Si no hay datos guardados, inicializar con datos de ejemplo
      initializeWithExampleData()
    }
    
    if (savedCounter) {
      try {
        setCommentCounter(parseInt(savedCounter, 10))
      } catch (error) {
        console.error('Error parsing saved counter:', error)
      }
    }
  }, [])

  const initializeWithExampleData = () => {
    const exampleComments: Comment[] = [
      // Datos de ejemplo para desarrollo - Cliente 1 (Ana García)
      {
        id: 'comment1',
        clientId: '1',
        content: 'Cliente muy interesada en el paquete premium. Solicita cotización para 200 invitados.',
        author: 'Anthony Cazares',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        isInternal: false,
        isImportant: true
      },
      {
        id: 'comment2',
        clientId: '1',
        content: 'Recordar llamar mañana para confirmar disponibilidad de fecha.',
        author: 'Sebastián Ramírez',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
        isInternal: true,
        isImportant: false
      },
      // Datos de ejemplo - Cliente 2 (Carlos Mendez)
      {
        id: 'comment3',
        clientId: '2',
        content: 'Evento corporativo de fin de año. Presupuesto flexible.',
        author: 'Yarleny Colín',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        isInternal: false,
        isImportant: false
      }
    ]
    setComments(exampleComments)
  }

  const addComment = useCallback((
    clientId: string, 
    content: string, 
    author = currentUser, 
    isInternal = false, 
    isImportant = false
  ) => {
    if (!content.trim()) {
      console.log('🚫 Empty comment blocked')
      return
    }

    // SISTEMA ANTI-DUPLICACIÓN
    const now = Date.now()
    
    setComments(currentComments => {
      // Buscar duplicados recientes (mismo contenido en los últimos 5 segundos)
      const recentDuplicate = currentComments.find(comment => 
        comment.clientId === clientId &&
        comment.content.trim() === content.trim() &&
        (now - comment.timestamp.getTime()) < 5000 // 5 segundos
      )

      if (recentDuplicate) {
        console.log('🚫 Duplicate comment blocked:', content)
        return currentComments
      }

      // Crear nuevo comentario
      const newComment: Comment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clientId,
        content: content.trim(),
        author,
        timestamp: new Date(),
        isInternal,
        isImportant
      }

      console.log(`✅ Comment Added:`, content)
      return [newComment, ...currentComments]
    })

    // Incrementar contador
    setCommentCounter(prev => prev + 1)
  }, [currentUser])

  const getClientComments = useCallback((clientId: string) => {
    return comments
      .filter(comment => {
        // Filtrar por cliente
        if (comment.clientId !== clientId) return false
        
        // Si es comentario interno, solo mostrar si es del usuario actual
        if (comment.isInternal && comment.author !== currentUser) {
          return false
        }
        
        return true
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [comments, currentUser])

  // Funciones de validación para edición/eliminación
  const canEditComment = useCallback((comment: Comment): boolean => {
    // Solo el autor puede editar su comentario
    if (comment.author !== currentUser) {
      return false
    }
    
    // Verificar límite de tiempo (24 horas)
    return isWithinTimeLimit(comment.timestamp)
  }, [currentUser])

  const canDeleteComment = useCallback((comment: Comment): boolean => {
    // Solo el autor puede eliminar su comentario
    if (comment.author !== currentUser) {
      return false
    }
    
    // Verificar límite de tiempo (24 horas)
    return isWithinTimeLimit(comment.timestamp)
  }, [currentUser])

  const deleteComment = useCallback((commentId: string) => {
    const comment = comments.find(c => c.id === commentId)
    if (!comment) {
      console.log('🙅‍♂️ Comment not found for deletion')
      return
    }

    // Verificar si el usuario puede eliminar este comentario
    if (!canDeleteComment(comment)) {
      console.log('🙅‍♂️ Cannot delete comment: time limit exceeded or not author')
      return
    }

    setComments(currentComments => 
      currentComments.filter(comment => comment.id !== commentId)
    )
    console.log(`🗑️ Comment deleted: ${commentId}`)
  }, [comments, canDeleteComment])

  const updateComment = useCallback((commentId: string, content: string) => {
    if (!content.trim()) return

    const comment = comments.find(c => c.id === commentId)
    if (!comment) {
      console.log('🙅‍♂️ Comment not found for update')
      return
    }

    // Verificar si el usuario puede editar este comentario
    if (!canEditComment(comment)) {
      console.log('🙅‍♂️ Cannot edit comment: time limit exceeded or not author')
      return
    }

    setComments(currentComments =>
      currentComments.map(comment =>
        comment.id === commentId
          ? { ...comment, content: content.trim() }
          : comment
      )
    )
    console.log(`✏️ Comment updated: ${commentId}`)
  }, [comments, canEditComment])

  const toggleImportant = useCallback((commentId: string) => {
    setComments(currentComments =>
      currentComments.map(comment =>
        comment.id === commentId
          ? { ...comment, isImportant: !comment.isImportant }
          : comment
      )
    )
    console.log(`⭐ Comment importance toggled: ${commentId}`)
  }, [])

  // Guardar comentarios en localStorage cuando cambien
  useEffect(() => {
    if (comments.length > 0) {
      localStorage.setItem('crm-comments', JSON.stringify(comments))
    }
  }, [comments])

  // Guardar contador en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('crm-comments-counter', commentCounter.toString())
  }, [commentCounter])

  return (
    <CommentsContext.Provider value={{ 
      comments, 
      currentUser,
      addComment, 
      getClientComments, 
      deleteComment, 
      updateComment, 
      toggleImportant,
      canEditComment,
      canDeleteComment
    }}>
      {children}
    </CommentsContext.Provider>
  )
}

export function useComments() {
  const context = useContext(CommentsContext)
  if (context === undefined) {
    throw new Error('useComments must be used within a CommentsProvider')
  }
  return context
}