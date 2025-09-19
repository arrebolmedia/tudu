import React from 'react';

interface ArrebolWeddingsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export function ArrebolWeddingsLogo({ 
  className = "", 
  size = "md", 
  showText = true 
}: ArrebolWeddingsLogoProps) {
  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl", 
    xl: "text-4xl"
  };

  const subtextSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base", 
    xl: "text-lg"
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Brand Text Only - No Icons */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`arrebol-logo text-arrebol-terracota-600 leading-tight ${textSizeClasses[size]}`}>
            LA NORIA
          </h1>
          {/* <p className={`font-sans text-arrebol-beige-700 font-light tracking-wide uppercase ${subtextSizeClasses[size]}`}>
            Gestión de Bodas y Eventos
          </p> */}
        </div>
      )}
    </div>
  );
}
