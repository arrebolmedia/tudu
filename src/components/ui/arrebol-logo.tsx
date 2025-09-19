'use client'

interface TuduLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function TuduLogo({ className = '', size = 'md' }: TuduLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl', 
    lg: 'w-16 h-16 text-3xl'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-xl bg-arrebol-terracota-500 flex items-center justify-center shadow-lg`}>
        <span className="text-white font-bold">📝</span>
      </div>
      <div className="flex flex-col">
        <span className={`font-bold text-gray-900 leading-tight ${textSizes[size]}`}>
          LA NORIA
        </span>
        <span className="text-xs text-gray-500 leading-tight">
          Gestión de Bodas y Eventos
        </span>
      </div>
    </div>
  )
}
