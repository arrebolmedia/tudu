// Sistema de capas Z-Index consistente para toda la aplicación
// Este archivo define las capas de z-index para evitar conflictos de posicionamiento

export const Z_INDEX_LAYERS = {
  // Capas base - elementos de interfaz básicos
  BASE: 1,
  STICKY_HEADER: 10,
  DROPDOWN: 20,
  TOOLTIP: 30,
  
  // Capas de navegación y FAB
  FAB: 40,
  NAVIGATION: 50,
  
  // Capas de modales y overlays
  MODAL_BACKDROP: 1000,
  MODAL_CONTENT: 1010,
  
  // Capas de notificaciones y alertas
  TOAST: 2000,
  
  // Capas especiales para dropdowns dentro de modales
  MODAL_DROPDOWN_BACKDROP: 1020,
  MODAL_DROPDOWN_CONTENT: 1030,
  MODAL_CALENDAR: 1040,  // Específico para calendario en modales
  
  // Capa suprema para elementos críticos
  CRITICAL: 9999,
} as const;

// Utility functions para generar clases de Tailwind
export const getZIndexClass = (layer: keyof typeof Z_INDEX_LAYERS): string => {
  const value = Z_INDEX_LAYERS[layer];
  return `z-[${value}]`;
};

// Para debugging - muestra todos los z-index usados
export const debugZIndexLayers = () => {
  console.table(Z_INDEX_LAYERS);
};
