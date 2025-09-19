'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export default function TestModalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-arrebol-beige-light to-arrebol-beige p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-arrebol-terracota mb-4 font-montserrat">
            Prueba de Apple Modal
          </h1>
          <p className="text-arrebol-terracota/70 mb-6">
            Esta página demuestra el modal con estilo Apple que está definido en el CSS global.
          </p>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-arrebol-terracota hover:bg-arrebol-terracota-dark text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Abrir Modal Apple
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="apple-modal p-6">
            <h3 className="text-xl font-semibold text-arrebol-terracota mb-4 font-montserrat">
              Ejemplo de Apple Modal (Estático)
            </h3>
            <p className="text-gray-700 mb-4">
              Este es un ejemplo del modal con la clase <code className="bg-gray-100 px-2 py-1 rounded text-sm">apple-modal</code> aplicada.
            </p>
            <p className="text-gray-600 text-sm">
              Características:
            </p>
            <ul className="text-gray-600 text-sm mt-2 space-y-1">
              <li>• Background con blur</li>
              <li>• Borde redondeado de 20px</li>
              <li>• Sombra elegante</li>
              <li>• Soporte para modo oscuro</li>
            </ul>
          </div>

          <div className="apple-input p-4 border-0">
            <h3 className="text-xl font-semibold text-arrebol-terracota mb-4 font-montserrat">
              Ejemplo de Apple Input
            </h3>
            <input
              type="text"
              placeholder="Escribe algo aquí..."
              className="apple-input w-full p-3 text-gray-800 placeholder-gray-500"
            />
            <p className="text-gray-600 text-sm mt-2">
              Input con clase <code className="bg-gray-100 px-2 py-1 rounded text-sm">apple-input</code>
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-white/50 rounded-xl backdrop-blur-sm border border-arrebol-terracota/20">
          <h3 className="text-xl font-semibold text-arrebol-terracota mb-4 font-montserrat">
            Información del CSS
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>apple-modal:</strong> Modal con background blur, borde redondeado y sombra</p>
            <p><strong>apple-input:</strong> Input con efectos glass morphism</p>
            <p><strong>apple-transition:</strong> Transiciones suaves estilo Apple</p>
            <p><strong>glass:</strong> Efecto cristal con backdrop-filter</p>
          </div>
        </div>
      </div>

      {/* Modal flotante */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal */}
          <div className="apple-modal relative w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-arrebol-terracota font-montserrat">
                Modal Apple Flotante
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-arrebol-terracota/70 hover:text-arrebol-terracota rounded-lg hover:bg-arrebol-beige transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                Este es un modal flotante usando la clase <code className="bg-gray-100 px-2 py-1 rounded text-sm">apple-modal</code> del CSS global.
              </p>
              
              <input
                type="text"
                placeholder="Prueba el input aquí..."
                className="apple-input w-full p-3 text-gray-800 placeholder-gray-500"
                autoFocus
              />
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-arrebol-terracota hover:bg-arrebol-terracota-dark text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
