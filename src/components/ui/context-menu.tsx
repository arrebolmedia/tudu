'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Trash2, Edit3, Bookmark } from 'lucide-react'

interface ContextMenuProps {
  isOpen: boolean
  x: number
  y: number
  onClose: () => void
  onDelete: () => void
  onEdit?: () => void
  onPin?: () => void
  canDelete?: boolean
  canEdit?: boolean
  canPin?: boolean
  isPinned?: boolean
}

export function ContextMenu({ 
  isOpen, 
  x, 
  y, 
  onClose, 
  onDelete, 
  onEdit,
  onPin,
  canDelete = true,
  canEdit = true,
  canPin = true,
  isPinned = false
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Calcular posición segura que se mueva con el scroll
  const getPosition = () => {
    if (typeof window === 'undefined') {
      return { left: x, top: y }
    }
    
    const menuWidth = 200
    const menuHeight = 140
    
    // Usar pageX/pageY directamente para position: absolute
    let left = x
    let top = y
    
    // Debug: Verificar la conversión
    console.log('Menu position calculation:', {
      originalX: x,
      originalY: y,
      calculatedLeft: left,
      calculatedTop: top,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      scrollX: window.pageXOffset,
      scrollY: window.pageYOffset
    })
    
    // Ajustar si se sale por la derecha (considerando el scroll)
    if (left + menuWidth > window.innerWidth + window.pageXOffset) {
      left = left - menuWidth
    }
    
    // Ajustar si se sale por abajo (considerando el scroll)
    if (top + menuHeight > window.innerHeight + window.pageYOffset) {
      top = top - menuHeight
    }
    
    // Mantener dentro de los límites de la página
    left = Math.max(window.pageXOffset + 10, Math.min(left, window.innerWidth + window.pageXOffset - menuWidth - 10))
    top = Math.max(window.pageYOffset + 10, Math.min(top, window.innerHeight + window.pageYOffset - menuHeight - 10))
    
    console.log('Final position:', { left, top })
    
    return { left, top }
  }

  const position = getPosition()

  if (!isOpen) return null

  return createPortal(
    <>
      {/* Backdrop invisible para detectar clics fuera */}
      <div
        className="fixed inset-0 z-[99998]"
        onClick={onClose}
      />
      
      {/* Menú contextual */}
      <div
        ref={menuRef}
        className="absolute z-[99999] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]"
        style={{
          left: position.left,
          top: position.top,
        }}
      >
        {canPin && onPin && (
          <button
            onClick={() => {
              onPin()
              onClose()
            }}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Bookmark size={16} />
            {isPinned ? 'Desmarcar como favorita' : 'Marcar como favorita'}
          </button>
        )}
        
        {canEdit && onEdit && (
          <button
            onClick={() => {
              onEdit()
              onClose()
            }}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Edit3 size={16} />
            Renombrar lista
          </button>
        )}
        
        {canDelete && (
          <button
            onClick={() => {
              onDelete()
              onClose()
            }}
            className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Eliminar lista
          </button>
        )}
      </div>
    </>,
    document.body
  )
}
