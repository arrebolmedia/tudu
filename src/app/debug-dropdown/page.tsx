'use client'

import { getAreaColor, getAreaLabel, areaOptions } from '@/lib/client-utils'
import { ClientArea } from '@/types'

export default function DebugDropdownPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug Dropdown Colors</h1>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test directo de getAreaColor:</h2>
        {(['CASANUEVA', 'CASA_MUNECAS', 'ATRIO', 'CABANAS'] as ClientArea[]).map(area => {
          const colorClasses = getAreaColor(area)
          console.log(`${area}: ${colorClasses}`)
          return (
            <div key={area} className="space-y-2">
              <p><strong>{area}</strong>: {colorClasses}</p>
              <div 
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${colorClasses}`}
              >
                {getAreaLabel(area)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test usando areaOptions:</h2>
        {areaOptions.map(option => {
          const colorClasses = getAreaColor(option.value)
          return (
            <div key={option.value} className="space-y-2">
              <p><strong>{option.value}</strong>: {colorClasses}</p>
              <div 
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${colorClasses}`}
              >
                {option.label}
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Simulando dropdown como en el modal:</h2>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 w-64">
          {areaOptions.map((option) => (
            <div key={option.value} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center first:rounded-t-lg last:rounded-b-lg transition-colors">
              <span 
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border w-full justify-center ${getAreaColor(option.value)}`}
              >
                {option.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
