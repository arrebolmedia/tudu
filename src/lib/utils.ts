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

// Utilidades para formateo de teléfono
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  
  // Remover todos los caracteres que no sean números
  const numbersOnly = phone.replace(/\D/g, '')
  
  // Si no hay números, retornar vacío
  if (!numbersOnly) return ''
  
  // Formatear según la longitud
  if (numbersOnly.length === 10) {
    // Formato: (XXX) XXX XXXX
    return `(${numbersOnly.slice(0, 3)}) ${numbersOnly.slice(3, 6)} ${numbersOnly.slice(6)}`
  } else if (numbersOnly.length === 11 && numbersOnly.startsWith('1')) {
    // Formato para números con código de país 1: +1 (XXX) XXX XXXX
    return `+1 (${numbersOnly.slice(1, 4)}) ${numbersOnly.slice(4, 7)} ${numbersOnly.slice(7)}`
  } else if (numbersOnly.length === 12 && numbersOnly.startsWith('52')) {
    // Formato para México: +52 (XX) XXXX XXXX
    return `+52 (${numbersOnly.slice(2, 4)}) ${numbersOnly.slice(4, 8)} ${numbersOnly.slice(8)}`
  } else if (numbersOnly.length >= 10) {
    // Para otros casos, usar formato genérico
    return `(${numbersOnly.slice(0, 3)}) ${numbersOnly.slice(3, 6)} ${numbersOnly.slice(6)}`
  }
  
  // Si es muy corto, devolver tal como está
  return numbersOnly
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
