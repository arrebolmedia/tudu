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
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg`}>
          {/* Icono de check en cuadrado */}
          <svg className={`${iconSizes[size]} text-white`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"/>
            <path d="m9 11 3 3L22 4"/>
          </svg>
        </div>
        {/* Estrella/sparkle dorada en la esquina */}
        <div className="absolute -top-1 -right-1">
          <svg className="h-4 w-4 text-yellow-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            <path d="M20 3v4"/>
            <path d="M22 5h-4"/>
            <path d="M4 17v2"/>
            <path d="M5 18H3"/>
          </svg>
        </div>
      </div>
      <div className="flex flex-col text-left">
        <span className={`font-bold text-gray-900 leading-tight ${textSizes[size]}`}>
          Tudú
        </span>
        <span className="text-xs text-gray-500 leading-tight font-bold">
          Tus pendientes en un solo lugar
        </span>
      </div>
    </div>
  )
}
