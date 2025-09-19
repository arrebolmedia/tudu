'use client'

import { getAreaColor, getAreaLabel, areaOptions } from '@/lib/client-utils'
import { ClientArea } from '@/types'

export default function TestColorsPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Test de Colores de Áreas</h1>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Usando getAreaColor directamente:</h2>
        {(['CASANUEVA', 'CASA_MUNECAS', 'ATRIO', 'CABANAS'] as ClientArea[]).map(area => (
          <div key={area} className="flex items-center space-x-4">
            <span className="w-32">{getAreaLabel(area)}:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAreaColor(area)}`}>
              {getAreaLabel(area)}
            </span>
            <span className="text-xs text-gray-500">{getAreaColor(area)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Usando areaOptions:</h2>
        {areaOptions.map(option => (
          <div key={option.value} className="flex items-center space-x-4">
            <span className="w-32">{option.label}:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAreaColor(option.value)}`}>
              {option.label}
            </span>
            <span className="text-xs text-gray-500">{getAreaColor(option.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
