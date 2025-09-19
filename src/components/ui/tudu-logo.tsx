'use client'

interface TuduLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function TuduLogo({ className = '', size = 'md' }: TuduLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }

  const textSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex flex-col text-left">
        <span className={`arrebol-logo text-arrebol-terracota-600 leading-tight ${textSizes[size]}`}>
          LA NORIA
        </span>
        {/* <span className="text-xs text-arrebol-terracota-500 leading-tight font-normal" style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}>
          Gestión de Bodas y Eventos
        </span> */}
      </div>
    </div>
  )
}
