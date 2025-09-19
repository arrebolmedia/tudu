'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Globe, 
  Clock, 
  Camera,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  CreditCard,
  Crown,
  Download,
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Estado para la foto de perfil
  const [profileImage, setProfileImage] = useState<string | null>(null)
  
  // Estados para configuraciones
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    weeklyReport: true,
    timezone: 'America/Mexico_City',
    language: 'es'
  })
  
  // Estados para suscripción
  const [subscription, setSubscription] = useState({
    plan: 'pro', // 'free', 'pro', 'enterprise' - Cambiado a 'pro' para mostrar funcionalidades
    status: 'active',
    nextBilling: '2025-08-23',
    features: {
      maxTasks: 'unlimited',
      maxProjects: 10,
      cloudSync: true,
      advancedReports: true,
      prioritySupport: false,
      teamCollaboration: false
    }
  })

  // Datos de facturas simuladas
  const [invoices] = useState([
    {
      id: 'INV-2025-001',
      date: '2025-07-23',
      amount: '$9.99',
      status: 'paid',
      plan: 'Pro Monthly',
      downloadUrl: '#'
    },
    {
      id: 'INV-2025-002', 
      date: '2025-06-23',
      amount: '$9.99',
      status: 'paid',
      plan: 'Pro Monthly',
      downloadUrl: '#'
    },
    {
      id: 'INV-2025-003',
      date: '2025-05-23', 
      amount: '$9.99',
      status: 'paid',
      plan: 'Pro Monthly',
      downloadUrl: '#'
    }
  ])
  
  // Estados para UI
  const [activeTab, setActiveTab] = useState('personal')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Cargar datos del usuario
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }))
    }
    
    // Cargar imagen de perfil desde localStorage
    const savedImage = localStorage.getItem('profileImage')
    if (savedImage) {
      setProfileImage(savedImage)
    }
  }, [session])

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Manejar cambio de foto de perfil
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor selecciona un archivo de imagen válido')
        return
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('La imagen debe ser menor a 5MB')
        return
      }
      
      // Crear URL temporal para mostrar la imagen
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setProfileImage(imageUrl)
        // Guardar en localStorage
        localStorage.setItem('profileImage', imageUrl)
        setSuccessMessage('Imagen actualizada correctamente')
        setErrorMessage('')
      }
      reader.readAsDataURL(file)
    }
  }

  // Función para eliminar foto de perfil
  const handleRemoveImage = () => {
    setProfileImage(null)
    localStorage.removeItem('profileImage')
    setSuccessMessage('Imagen eliminada correctamente')
    // Limpiar el input de archivo
    const input = document.getElementById('profile-image-input') as HTMLInputElement
    if (input) input.value = ''
  }

  // Función para abrir el selector de archivos
  const handleCameraClick = () => {
    const input = document.getElementById('profile-image-input') as HTMLInputElement
    input?.click()
  }

  // Manejar cambios en configuraciones
  const handleSettingChange = (setting: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [setting]: value }))
  }

  // Guardar información personal
  const handleSavePersonalInfo = async () => {
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Aquí iría la llamada a la API para actualizar el perfil
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      
      // Actualizar la sesión
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          email: formData.email
        }
      })
      
      setSuccessMessage('Información personal actualizada correctamente')
    } catch (error) {
      setErrorMessage('Error al actualizar la información personal')
    } finally {
      setIsLoading(false)
    }
  }

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden')
      return
    }

    if (formData.newPassword.length < 8) {
      setErrorMessage('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Aquí iría la llamada a la API para cambiar contraseña
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      
      setSuccessMessage('Contraseña cambiada correctamente')
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      setErrorMessage('Error al cambiar la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar configuraciones
  const handleSaveSettings = async () => {
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Aquí iría la llamada a la API para guardar configuraciones
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      
      setSuccessMessage('Configuraciones guardadas correctamente')
    } catch (error) {
      setErrorMessage('Error al guardar las configuraciones')
    } finally {
      setIsLoading(false)
    }
  }

  // Función demo para cambiar plan
  const handlePlanChange = (newPlan: string) => {
    const features = {
      free: {
        maxTasks: '50',
        maxProjects: 3,
        cloudSync: false,
        advancedReports: false,
        prioritySupport: false,
        teamCollaboration: false
      },
      pro: {
        maxTasks: 'ilimitadas',
        maxProjects: 10,
        cloudSync: true,
        advancedReports: true,
        prioritySupport: false,
        teamCollaboration: false
      },
      enterprise: {
        maxTasks: 'ilimitadas',
        maxProjects: 'ilimitados',
        cloudSync: true,
        advancedReports: true,
        prioritySupport: true,
        teamCollaboration: true
      }
    }

    setSubscription(prev => ({
      ...prev,
      plan: newPlan,
      features: features[newPlan as keyof typeof features]
    }))
    
    setSuccessMessage(`¡Plan actualizado a ${newPlan === 'free' ? 'Gratuito' : newPlan === 'pro' ? 'Pro' : 'Enterprise'}!`)
  }

  const tabs = [
    { id: 'personal', label: 'Información Personal', icon: User },
    { id: 'security', label: 'Seguridad', icon: Lock },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    // { id: 'preferences', label: 'Preferencias', icon: Globe },
    // { id: 'subscription', label: 'Suscripción', icon: CreditCard }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y configuraciones</p>
        </div>

        {/* Mensajes */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Información Personal */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Información Personal</h2>
                
                {/* Avatar */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-arrebol-terracota-500 rounded-full flex items-center justify-center text-white font-bold text-2xl font-display overflow-hidden">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Foto de perfil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        session?.user?.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <button 
                      onClick={handleCameraClick}
                      className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                    {/* Input de archivo oculto */}
                    <input
                      id="profile-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Foto de perfil</h3>
                    <p className="text-sm text-gray-600">Haz clic en el ícono de cámara para cambiar tu foto</p>
                    <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, GIF (máx. 5MB)</p>
                    {profileImage && (
                      <button
                        onClick={handleRemoveImage}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar foto</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Formulario */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSavePersonalInfo}
                  disabled={isLoading}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            )}

            {/* Seguridad */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Seguridad</h2>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Importante:</strong> Al cambiar tu contraseña, cerraremos todas las sesiones activas excepto la actual.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña actual
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nueva contraseña (mín. 8 caracteres)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar nueva contraseña
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirma tu nueva contraseña"
                    />
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
              </div>
            )}

            {/* Notificaciones */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Notificaciones</h2>
                
                <div className="space-y-4">
                  {[
                    {
                      key: 'emailNotifications',
                      title: 'Notificaciones por email',
                      description: 'Recibe actualizaciones importantes por correo electrónico'
                    },
                    {
                      key: 'pushNotifications',
                      title: 'Notificaciones push',
                      description: 'Recibe notificaciones en tiempo real en tu dispositivo'
                    },
                    {
                      key: 'taskReminders',
                      title: 'Recordatorios de tareas',
                      description: 'Te recordaremos cuando tengas tareas pendientes'
                    },
                    {
                      key: 'weeklyReport',
                      title: 'Reporte semanal',
                      description: 'Recibe un resumen de tu productividad cada semana'
                    }
                  ].map((notification) => (
                    <div key={notification.key} className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-600">{notification.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings[notification.key as keyof typeof settings] as boolean}
                          onChange={(e) => handleSettingChange(notification.key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isLoading ? 'Guardando...' : 'Guardar preferencias'}
                </button>
              </div>
            )}

            {/* Preferencias - Comentado temporalmente */}
            {/* {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Preferencias</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Zona horaria
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                      <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                      <option value="America/New_York">Nueva York (GMT-5)</option>
                      <option value="Europe/Madrid">Madrid (GMT+1)</option>
                      <option value="Europe/London">Londres (GMT+0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Idioma
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isLoading ? 'Guardando...' : 'Guardar preferencias'}
                </button>
              </div>
            )} */}

            {/* Suscripción - Comentado temporalmente */}
            {/* {activeTab === 'subscription' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">Suscripción</h2>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full ${subscription.plan === 'free' ? 'bg-gray-100' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}>
                        {subscription.plan === 'free' ? (
                          <User className="w-6 h-6 text-gray-600" />
                        ) : (
                          <Crown className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          Plan {subscription.plan === 'free' ? 'Gratuito' : subscription.plan === 'pro' ? 'Pro' : 'Enterprise'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {subscription.plan === 'free' ? 'Funcionalidades básicas' : 'Acceso completo a todas las funciones'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {subscription.status === 'active' ? (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-1" />
                        )}
                        {subscription.status === 'active' ? 'Activo' : 'Inactivo'}
                      </div>
                      {subscription.plan !== 'free' && (
                        <p className="text-sm text-gray-600 mt-1">
                          Próxima facturación: {new Date(subscription.nextBilling).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-2 ${subscription.features.maxTasks ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm">{subscription.features.maxTasks} tareas máx.</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-2 ${subscription.features.maxProjects ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm">{subscription.features.maxProjects} proyectos máx.</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-2 ${subscription.features.cloudSync ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm">Sincronización en la nube</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-2 ${subscription.features.advancedReports ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm">Reportes avanzados</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-2 ${subscription.features.prioritySupport ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm">Soporte prioritario</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-2 ${subscription.features.teamCollaboration ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm">Colaboración en equipo</span>
                    </div>
                  </div>

                  {subscription.plan === 'free' && (
                    <div className="text-center">
                      <button 
                        onClick={() => handlePlanChange('pro')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                      >
                        <Crown className="w-5 h-5 inline mr-2" />
                        Actualizar a Pro
                      </button>
                    </div>
                  )}
                </div>

                {subscription.plan === 'free' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Planes Disponibles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-blue-200 rounded-xl p-6 relative bg-gradient-to-br from-blue-50 to-blue-100">
                        <div className="absolute top-4 right-4">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Más Popular
                          </span>
                        </div>
                        <div className="flex items-center mb-4">
                          <Crown className="w-8 h-8 text-blue-600 mr-3" />
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">Plan Pro</h4>
                            <p className="text-sm text-gray-600">Para usuarios avanzados</p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-gray-900">$9.99</span>
                          <span className="text-gray-600">/mes</span>
                        </div>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Tareas ilimitadas
                          </li>
                          <li className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            10 proyectos
                          </li>
                          <li className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Sincronización en la nube
                          </li>
                          <li className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Reportes avanzados
                          </li>
                        </ul>
                        <button 
                          onClick={() => handlePlanChange('pro')}
                          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Actualizar a Pro
                        </button>
                      </div>

                      <div className="border border-purple-200 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-purple-100">
                        <div className="flex items-center mb-4">
                          <Crown className="w-8 h-8 text-purple-600 mr-3" />
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">Plan Enterprise</h4>
                            <p className="text-sm text-gray-600">Para equipos y empresas</p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-gray-900">$29.99</span>
                          <span className="text-gray-600">/mes</span>
                        </div>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Todo de Pro
                          </li>
                          <li className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Proyectos ilimitados
                          </li>
                          <li className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Colaboración en equipo
                          </li>
                          <li className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Soporte prioritario
                          </li>
                        </ul>
                        <button 
                          onClick={() => handlePlanChange('enterprise')}
                          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Actualizar a Enterprise
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {subscription.plan !== 'free' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Historial de Facturas</h3>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Factura
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plan
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Monto
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acción
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((invoice) => (
                              <tr key={invoice.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {new Date(invoice.date).toLocaleDateString('es-ES')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {invoice.plan}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Pagado
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  <button className="flex items-center text-blue-600 hover:text-blue-800">
                                    <Download className="w-4 h-4 mr-1" />
                                    Descargar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {subscription.plan !== 'free' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Gestión de Suscripción</h3>
                    <div className="flex flex-wrap gap-4">
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Actualizar método de pago
                      </button>
                      <button className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                        <Crown className="w-4 h-4 mr-2" />
                        Cambiar plan
                      </button>
                      <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancelar suscripción
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      <strong>Nota:</strong> Los cambios en la suscripción se aplicarán en el próximo ciclo de facturación.
                    </p>
                  </div>
                )}
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  )
}
