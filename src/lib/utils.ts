import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utilidades para fechas
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}

export function isOverdue(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// Utilidades para prioridades
export function getPriorityColor(priority: 'LOW' | 'NORMAL' | 'HIGH'): string {
  switch (priority) {
    case 'LOW':
      return 'text-gray-600'
    case 'NORMAL':
      return 'text-green-600'
    case 'HIGH':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export function getPriorityLabel(priority: 'LOW' | 'NORMAL' | 'HIGH'): string {
  switch (priority) {
    case 'LOW':
      return 'Baja'
    case 'NORMAL':
      return 'Media'
    case 'HIGH':
      return 'Alta'
    default:
      return 'Media'
  }
}
