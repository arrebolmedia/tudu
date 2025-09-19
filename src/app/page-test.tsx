'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            LA NORIA
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sistema de gestión de bodas y eventos
          </p>
        </div>
      </div>
    </div>
  )
}
