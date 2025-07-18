'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarPickerProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onClose: () => void
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

export function CalendarPicker({ selectedDate, onDateSelect, onClose }: CalendarPickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate))
  
  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Primer día del mes
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  
  // Día de la semana que empieza el mes (0 = domingo)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  
  // Días del mes anterior para completar la primera semana
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()
  const prevMonthDays = []
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i)
  }
  
  // Días del mes actual
  const daysInMonth = lastDayOfMonth.getDate()
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  // Días del mes siguiente para completar la última semana
  const totalCells = prevMonthDays.length + currentMonthDays.length
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => i + 1)
  
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }
  
  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day)
    onDateSelect(selectedDate)
    onClose()
  }
  
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear
  }
  
  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === currentMonth && 
           selectedDate.getFullYear() === currentYear
  }
  
  const goToToday = () => {
    const today = new Date()
    onDateSelect(today)
    onClose()
  }

  const calendarContent = (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-2xl animate-in zoom-in-95 fade-in duration-200 w-full backdrop-blur-xl" style={{ width: '100%', minWidth: '450px', maxWidth: '750px', boxSizing: 'border-box' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      
      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1">
        {/* Días del mes anterior */}
        {prevMonthDays.map((day) => (
          <button
            key={`prev-${day}`}
            className="p-2 text-center text-sm text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            onClick={() => {
              const prevMonthDate = new Date(currentYear, currentMonth - 1, day)
              onDateSelect(prevMonthDate)
              onClose()
            }}
          >
            {day}
          </button>
        ))}
        
        {/* Días del mes actual */}
        {currentMonthDays.map((day) => (
          <button
            key={day}
            onClick={() => handleDateClick(day)}
            className={cn(
              "p-2 text-center text-sm rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
              isToday(day) && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold",
              isSelected(day) && "bg-blue-500 text-white hover:bg-blue-600 font-semibold",
              !isToday(day) && !isSelected(day) && "text-gray-900 dark:text-white"
            )}
          >
            {day}
          </button>
        ))}
        
        {/* Días del mes siguiente */}
        {nextMonthDays.map((day) => (
          <button
            key={`next-${day}`}
            className="p-2 text-center text-sm text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            onClick={() => {
              const nextMonthDate = new Date(currentYear, currentMonth + 1, day)
              onDateSelect(nextMonthDate)
              onClose()
            }}
          >
            {day}
          </button>
        ))}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
        >
          Cancelar
        </button>
        <button
          onClick={goToToday}
          className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
        >
          Hoy
        </button>
      </div>
    </div>
  )

  return (
    <div className="w-full" style={{ width: '100%', minWidth: '450px', maxWidth: '750px', boxSizing: 'border-box' }}>
      {calendarContent}
    </div>
  )
}
