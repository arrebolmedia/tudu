'use client'

import { useState } from 'react'
import { 
  X, 
  List, 
  Home, 
  Briefcase, 
  Heart, 
  Star, 
  Calendar, 
  ShoppingCart,
  Book,
  Music,
  Camera,
  Coffee,
  Plane,
  Gamepad2,
  Palette,
  Target
} from 'lucide-react'

interface CreateListModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; icon: string; color: string }) => void
}

const iconOptions = [
  { icon: List, name: 'list', label: 'Lista' },
  { icon: Home, name: 'home', label: 'Casa' },
  { icon: Briefcase, name: 'briefcase', label: 'Trabajo' },
  { icon: Heart, name: 'heart', label: 'Salud' },
  { icon: Star, name: 'star', label: 'Favoritos' },
  { icon: Calendar, name: 'calendar', label: 'Calendario' },
  { icon: ShoppingCart, name: 'shopping-cart', label: 'Compras' },
  { icon: Book, name: 'book', label: 'Estudio' },
  { icon: Music, name: 'music', label: 'Música' },
  { icon: Camera, name: 'camera', label: 'Fotos' },
  { icon: Coffee, name: 'coffee', label: 'Café' },
  { icon: Plane, name: 'plane', label: 'Viajes' },
  { icon: Gamepad2, name: 'gamepad2', label: 'Juegos' },
  { icon: Palette, name: 'palette', label: 'Arte' },
  { icon: Target, name: 'target', label: 'Objetivos' }
]

const colorOptions = [
  '#d87254', // terracota principal
  '#c85a3a', // terracota 600
  '#a8472f', // terracota 700
  '#e3cfaa', // beige 500
  '#d4b894', // beige 600
  '#c4a27c', // beige 700
  '#f5d5cd', // terracota 200
  '#edb9a8', // terracota 300
  '#e39478', // terracota 400
  '#8b6f4a'  // beige 900
]

export function CreateListModal({ isOpen, onClose, onSubmit }: CreateListModalProps) {
  const [title, setTitle] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('list')
  const [selectedColor, setSelectedColor] = useState('#c2682a') // terracota como color por defecto

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        icon: selectedIcon,
        color: selectedColor
      })
      setTitle('')
      setSelectedIcon('list')
      setSelectedColor('#c2682a') // terracota
      onClose()
    }
  }

  const handleClose = () => {
    setTitle('')
    setSelectedIcon('list')
    setSelectedColor('#c2682a') // terracota
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-arrebol-beige-light dark:bg-gray-900 rounded-2xl shadow-2xl border border-arrebol-terracota/20 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-arrebol-terracota/20 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-arrebol-terracota dark:text-white font-montserrat">
            Crear nueva lista
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-arrebol-terracota/70 hover:text-arrebol-terracota dark:hover:text-gray-300 rounded-lg hover:bg-arrebol-beige dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre de la lista */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de la lista
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escribe el nombre de tu lista..."
              className="w-full px-4 py-3 border border-arrebol-beige-300 dark:border-arrebol-beige-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-arrebol-terracota focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Selección de icono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Elige un icono
            </label>
            <div className="grid grid-cols-5 gap-2">
              {iconOptions.map(({ icon: IconComponent, name, label }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedIcon === name
                      ? 'border-arrebol-terracota bg-arrebol-beige-50 dark:bg-arrebol-terracota-950/30'
                      : 'border-arrebol-beige-200 dark:border-arrebol-beige-700 hover:border-arrebol-beige-300 dark:hover:border-arrebol-beige-600'
                  }`}
                  title={label}
                >
                  <IconComponent 
                    size={20} 
                    className={selectedIcon === name ? 'text-arrebol-terracota dark:text-arrebol-terracota-light' : 'text-arrebol-beige-600 dark:text-arrebol-beige-400'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Selección de color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Elige un color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    selectedColor === color
                      ? 'border-gray-400 dark:border-gray-300 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-300'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Vista previa:</p>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: selectedColor }}
              >
                {(() => {
                  const IconComponent = iconOptions.find(opt => opt.name === selectedIcon)?.icon || List
                  return <IconComponent size={20} className="text-white" />
                })()}
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {title || 'Nombre de la lista'}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-3 bg-arrebol-terracota text-white rounded-lg hover:bg-arrebol-terracota-dark disabled:bg-arrebol-beige-300 dark:disabled:bg-arrebol-beige-700 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Crear lista
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
