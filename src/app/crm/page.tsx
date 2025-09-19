'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Star,
  Grid3X3,
  Rows3,
  Columns3,
  User,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Building,
  Euro,
  Flag,
  Circle,
  CheckCircle,
  Search,
  RotateCcw
} from 'lucide-react'

import { Client, ClientStatus, ClientPriority, ClientArea, ClientChannel, ClientExecutive } from '@/types'
import { Header } from '@/components/layout/header'
import { CrmSidebar } from '@/components/crm/crm-sidebar'
import { EmptyListButton } from '@/components/ui/empty-list-button'
import { ClientCard } from '@/components/crm/client-card'
import { CrmListView } from '@/components/crm/crm-list-view'
// import CrmKanbanView from '@/components/crm/crm-kanban-view'
import { ClientDetailModal } from '@/components/crm/client-detail-modal'
import { CreateClientModal } from '@/components/crm/create-client-modal'
import { ActivityLogProvider, useActivityLog } from '@/contexts/activity-log-context'
import { CommentsProvider } from '@/contexts/comments-context'

type ViewMode = 'cards' | 'list' // | 'kanban'

// Clientes de ejemplo
const mockClients: Client[] = [
  {
    id: '1',
    name: 'María González',
    clientNumber: 'CL-2025-001',
    eventDate: new Date('2025-09-15'),
    phone: '+34 666 111 222',
    email: 'maria.gonzalez@email.com',
    type: 'WEDDING',
    area: 'CASANUEVA',
    status: 'ASIGNADO',
    channel: 'INSTAGRAM',
    createdAt: new Date('2025-01-15'),
    priority: 'HIGH',
    notes: 'Interesada en boda íntima en el campo. Busca algo único y personalizado.',
    assignedExecutive: 'YARLENY_COLIN',
    coordinator: 'ANDREA',
    guestCount: 80,
    archived: false,
    vip: false,
  },
  {
    id: '2',
    name: 'Carlos y Ana Rodríguez',
    clientNumber: 'CL-2025-002',
    eventDate: new Date('2025-10-22'),
    phone: '+34 677 333 444',
    email: 'carlos.ana@email.com',
    type: 'WEDDING',
    area: 'CASANUEVA',
    status: 'ASIGNADO',
    channel: 'REFERRAL',
    createdAt: new Date('2025-01-10'),
    priority: 'NORMAL',
    notes: 'Pareja muy organizada. Quieren una boda clásica con toque moderno. Ya tienen venue.',
    assignedExecutive: 'JOSEFO_FLORES',
    coordinator: 'BRENDA',
    guestCount: 120,
    archived: false,
    vip: false,
  },
  {
    id: '3',
    name: 'Isabel Martínez',
    clientNumber: 'CL-2024-045',
    eventDate: new Date('2025-11-05'),
    phone: '+34 688 555 666',
    email: 'isabel.martinez@empresa.com',
    type: 'CORPORATE',
    area: 'CASA_MUNECAS',
    status: 'CLIENTE_CONTACTADO',
    channel: 'EMAIL',
    createdAt: new Date('2024-12-20'),
    priority: 'HIGH',
    notes: 'Cliente VIP. Evento anual de la empresa. Buscan algo impresionante para 200 invitados.',
    assignedExecutive: 'SEBASTIAN_RAMIREZ',
    coordinator: 'HUGO',
    guestCount: 200,
    archived: false,
    vip: true,
  },
  {
    id: '4',
    name: 'Diego y Sofía Herrera',
    clientNumber: 'CL-2025-003',
    eventDate: new Date('2025-12-18'),
    phone: '+34 699 777 888',
    email: 'diego.sofia@email.com',
    type: 'WEDDING',
    area: 'ATRIO',
    status: 'ASIGNADO',
    channel: 'WHATSAPP_SOCIAL',
    createdAt: new Date('2025-01-20'),
    priority: 'NORMAL',
    notes: 'Boda de invierno. Les gusta el estilo minimalista y elegante.',
    assignedExecutive: 'YARLENY_COLIN',
    coordinator: 'ANETTH',
    guestCount: 95,
    archived: false,
    vip: false,
  },
  {
    id: '5',
    name: 'Carmen López',
    clientNumber: 'CL-2025-004',
    eventDate: new Date('2025-08-30'),
    phone: '+34 655 444 333',
    email: 'carmen.lopez@email.com',
    type: 'QUINCEANOS',
    area: 'CABANAS',
    status: 'ASIGNADO',
    channel: 'INSTAGRAM',
    createdAt: new Date('2025-01-25'),
    priority: 'LOW',
    notes: 'XV años con temática rústica. Buscan algo acogedor y familiar.',
    assignedExecutive: 'JOSEFO_FLORES',
    guestCount: 50,
    archived: false,
    vip: false,
  },
  {
    id: '6',
    name: 'Roberto y Elena García',
    clientNumber: 'CL-2025-005',
    eventDate: new Date('2025-09-15'),
    phone: '+34 611 222 333',
    email: 'roberto.elena@email.com',
    type: 'WEDDING',
    area: 'CASANUEVA',
    status: 'ASIGNADO',
    channel: 'REFERRAL',
    createdAt: new Date('2025-02-01'),
    priority: 'HIGH',
    notes: 'Boda de lujo. Cliente VIP con presupuesto alto. Quieren ceremonia al aire libre.',
    assignedExecutive: 'SEBASTIAN_RAMIREZ',
    guestCount: 150,
    archived: false,
    vip: true,
  },
  {
    id: '7',
    name: 'Tech Solutions S.A.',
    clientNumber: 'CL-2025-006',
    eventDate: new Date('2025-10-12'),
    phone: '+34 699 888 777',
    email: 'eventos@techsolutions.com',
    type: 'CORPORATE',
    area: 'ATRIO',
    status: 'CLIENTE_CONTACTADO',
    channel: 'EMAIL',
    createdAt: new Date('2025-02-05'),
    priority: 'NORMAL',
    notes: 'Evento corporativo anual. Necesitan catering y espacio para presentaciones.',
    assignedExecutive: 'YARLENY_COLIN',
    guestCount: 80,
    archived: false,
    vip: false,
  },
  {
    id: '8',
    name: 'Familia Rodríguez',
    clientNumber: 'CL-2025-007',
    eventDate: new Date('2025-11-20'),
    phone: '+34 677 555 444',
    email: 'familia.rodriguez@email.com',
    type: 'BAUTIZO',
    area: 'CASA_MUNECAS',
    status: 'ASIGNADO',
    channel: 'WHATSAPP_SOCIAL',
    createdAt: new Date('2025-02-10'),
    priority: 'LOW',
    notes: 'Bautizo íntimo. Buscan un ambiente familiar y acogedor para 40 personas.',
    assignedExecutive: 'JOSEFO_FLORES',
    guestCount: 40,
    archived: false,
    vip: false,
  },
  {
    id: '9',
    name: 'Miguel y Patricia Fernández',
    clientNumber: 'CL-2025-008',
    eventDate: new Date('2025-12-05'),
    phone: '+34 644 333 222',
    email: 'miguel.patricia@email.com',
    type: 'WEDDING',
    area: 'CABANAS',
    status: 'ASIGNADO',
    channel: 'BODAS_COM',
    createdAt: new Date('2025-02-15'),
    priority: 'HIGH',
    notes: 'Boda rústica en invierno. Les encanta el ambiente natural de las cabañas.',
    assignedExecutive: 'SEBASTIAN_RAMIREZ',
    guestCount: 110,
    archived: false,
    vip: false,
  },
  {
    id: '10',
    name: 'Club de Tenis Metropolitano',
    clientNumber: 'CL-2025-009',
    eventDate: new Date('2025-06-25'),
    phone: '+34 622 111 888',
    email: 'eventos@clubtenis.com',
    type: 'SOCIAL',
    area: 'ATRIO',
    status: 'CLIENTE_CONTACTADO',
    channel: 'PHONE',
    createdAt: new Date('2025-02-20'),
    priority: 'NORMAL',
    notes: 'Torneo anual del club. Necesitan almuerzo y ceremonia de premiación.',
    assignedExecutive: 'YARLENY_COLIN',
    guestCount: 60,
    archived: false,
    vip: false,
  },
  {
    id: '11',
    name: 'Valentina Castro',
    clientNumber: 'CL-2025-010',
    eventDate: new Date('2025-07-14'),
    phone: '+34 655 789 123',
    email: 'valentina.castro@email.com',
    type: 'QUINCEANOS',
    area: 'CASA_MUNECAS',
    status: 'ASIGNADO',
    channel: 'INSTAGRAM',
    createdAt: new Date('2025-03-01'),
    priority: 'NORMAL',
    notes: 'XV años con temática de princesa. Quiere algo mágico y memorable.',
    assignedExecutive: 'YARLENY_COLIN',
    guestCount: 75,
    archived: false,
    vip: false,
  },
  {
    id: '12',
    name: 'Alejandro y Lucía Morales',
    clientNumber: 'CL-2025-011',
    eventDate: new Date('2025-08-16'),
    phone: '+34 666 987 654',
    email: 'ale.lucia@email.com',
    type: 'WEDDING',
    area: 'CABANAS',
    status: 'CLIENTE_CONTACTADO',
    channel: 'REFERRAL',
    createdAt: new Date('2025-03-05'),
    priority: 'HIGH',
    notes: 'Boda bohemia al aire libre. Muy detallistas y con presupuesto considerable.',
    assignedExecutive: 'SEBASTIAN_RAMIREZ',
    guestCount: 140,
    archived: false,
    vip: false,
  },
  {
    id: '13',
    name: 'Banco Central',
    clientNumber: 'CL-2025-012',
    eventDate: new Date('2025-09-30'),
    phone: '+34 677 456 789',
    email: 'eventos@bancocentral.es',
    type: 'CORPORATE',
    area: 'ATRIO',
    status: 'ASIGNADO',
    channel: 'EMAIL',
    createdAt: new Date('2025-03-10'),
    priority: 'HIGH',
    notes: 'Cena de gala anual para directivos. Evento de alto nivel y protocolo.',
    assignedExecutive: 'SEBASTIAN_RAMIREZ',
    guestCount: 180,
    archived: false,
    vip: false,
  },
  {
    id: '14',
    name: 'Familia Jiménez',
    clientNumber: 'CL-2025-013',
    eventDate: new Date('2025-05-18'),
    phone: '+34 688 321 654',
    email: 'fam.jimenez@email.com',
    type: 'COMUNION',
    area: 'CASA_MUNECAS',
    status: 'ASIGNADO',
    channel: 'INSTAGRAM',
    createdAt: new Date('2025-03-15'),
    priority: 'LOW',
    notes: 'Primera comunión familiar. Buscan ambiente tradicional y elegante.',
    assignedExecutive: 'JOSEFO_FLORES',
    guestCount: 55,
    archived: false,
    vip: false,
  },
  {
    id: '15',
    name: 'Raúl y Carmen Vega',
    clientNumber: 'CL-2025-014',
    eventDate: new Date('2025-11-12'),
    phone: '+34 699 147 258',
    email: 'raul.carmen@email.com',
    type: 'WEDDING',
    area: 'CASANUEVA',
    status: 'CLIENTE_CONTACTADO',
    channel: 'BODAS_COM',
    createdAt: new Date('2025-03-20'),
    priority: 'NORMAL',
    notes: 'Boda otoñal. Les gusta el estilo vintage y los detalles únicos.',
    assignedExecutive: 'YARLENY_COLIN',
    guestCount: 105,
    archived: false,
    vip: false,
  },
  {
    id: '16',
    name: 'Startup Innovation Hub',
    clientNumber: 'CL-2025-015',
    eventDate: new Date('2025-04-22'),
    phone: '+34 611 852 963',
    email: 'events@innovationhub.com',
    type: 'CORPORATE',
    area: 'ATRIO',
    status: 'CLIENTE_CONTACTADO',
    channel: 'EMAIL',
    createdAt: new Date('2025-03-25'),
    priority: 'NORMAL',
    notes: 'Evento de networking para startups. Ambiente moderno y dinámico.',
    assignedExecutive: 'JOSEFO_FLORES',
    guestCount: 90,
    archived: false,
    vip: false,
  },
  {
    id: '17',
    name: 'Andrea Solís',
    clientNumber: 'CL-2025-016',
    eventDate: new Date('2025-06-07'),
    phone: '+34 622 741 963',
    email: 'andrea.solis@email.com',
    type: 'SOCIAL',
    area: 'CABANAS',
    status: 'ASIGNADO',
    channel: 'WHATSAPP_SOCIAL',
    createdAt: new Date('2025-04-01'),
    priority: 'LOW',
    notes: 'Fiesta de graduación universitaria. Quiere algo divertido y memorable.',
    assignedExecutive: 'YARLENY_COLIN',
    guestCount: 45,
    archived: false,
    vip: false,
  },
  {
    id: '18',
    name: 'Grupo Inmobiliario Premium',
    clientNumber: 'CL-2025-017',
    eventDate: new Date('2025-10-08'),
    phone: '+34 633 159 753',
    email: 'marketing@inmobiliariapremium.es',
    type: 'CORPORATE',
    area: 'CASA_MUNECAS',
    status: 'ASIGNADO',
    channel: 'PHONE',
    createdAt: new Date('2025-04-05'),
    priority: 'HIGH',
    notes: 'Presentación de nuevo desarrollo inmobiliario. Cliente VIP recurrente.',
    assignedExecutive: 'SEBASTIAN_RAMIREZ',
    guestCount: 120,
    archived: false,
    vip: true,
  },
  {
    id: '19',
    name: 'Fernando y Beatriz Luna',
    clientNumber: 'CL-2025-018',
    eventDate: new Date('2025-12-31'),
    phone: '+34 644 369 258',
    email: 'fer.bea@email.com',
    type: 'WEDDING',
    area: 'ATRIO',
    status: 'CLIENTE_CONTACTADO',
    channel: 'INSTAGRAM',
    createdAt: new Date('2025-04-10'),
    priority: 'HIGH',
    notes: 'Boda de fin de año. Quieren algo espectacular para despedir el año.',
    assignedExecutive: 'SEBASTIAN_RAMIREZ',
    guestCount: 160,
    archived: false,
    vip: false,
  },
  {
    id: '20',
    name: 'ONG Esperanza Verde',
    clientNumber: 'CL-2025-019',
    eventDate: new Date('2025-05-25'),
    phone: '+34 655 987 321',
    email: 'eventos@esperanzaverde.org',
    type: 'SOCIAL',
    area: 'CABANAS',
    status: 'ASIGNADO',
    channel: 'EMAIL',
    createdAt: new Date('2025-04-15'),
    priority: 'NORMAL',
    notes: 'Gala benéfica anual. Buscan algo elegante pero sostenible.',
    assignedExecutive: 'JOSEFO_FLORES',
    guestCount: 85,
    archived: false,
    vip: false,
  },
  {
    id: 'placeholder',
    name: '+ Agregar cliente...',
    clientNumber: '',
    email: '',
    phone: '',
    area: undefined,
    type: undefined,
    channel: undefined,
    status: 'NUEVO_CONTACTO',
    priority: 'NORMAL',
    eventDate: undefined,
    assignedExecutive: undefined,
    notes: '',
    guestCount: undefined,
    createdAt: new Date('2025-12-31'),
  },
]

// Componente interno que usa el contexto
function CRMPageContent() {
  const { addLog } = useActivityLog()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState('all')
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [isHydrated, setIsHydrated] = useState(false)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Estado para el cliente en borrador (cuando se está editando el placeholder)
  const [draftClient, setDraftClient] = useState<Partial<Client> | null>(null)
  const [isEditingPlaceholder, setIsEditingPlaceholder] = useState(false)
  
  // Estado para controlar cuando se está procesando un cambio desde Lista
  const [isProcessingListChange, setIsProcessingListChange] = useState(false)
  
  // Estado para el modal de crear cliente (FAB)
  const [showCreateClientModal, setShowCreateClientModal] = useState(false)

  // Función para normalizar clientes (agregar campos faltantes y aplicar validaciones)
  const normalizeClients = (clientsList: Client[]): Client[] => {
    return clientsList.map(client => {
      const normalizedClient = {
        ...client,
        archived: client.archived ?? false,
        vip: client.vip ?? false,
      }
      
      // EXCLUIR PLACEHOLDER de validaciones
      if (normalizedClient.name === '+ Agregar cliente...' || normalizedClient.id === 'placeholder') {
        return normalizedClient
      }
      
      // APLICAR VALIDACIÓN: Status-Ejecutivo (solo para clientes reales)
      // Si tiene ejecutivo asignado, no puede estar como NUEVO_CONTACTO
      if (normalizedClient.assignedExecutive && normalizedClient.status === 'NUEVO_CONTACTO') {
        normalizedClient.status = 'ASIGNADO'
      }
      // Si no tiene ejecutivo asignado y está como ASIGNADO, cambiar a NUEVO_CONTACTO
      if (!normalizedClient.assignedExecutive && normalizedClient.status === 'ASIGNADO') {
        normalizedClient.status = 'NUEVO_CONTACTO'
      }
      
      return normalizedClient
    })
  }

  // Función para asegurar que siempre hay un placeholder
  const ensurePlaceholder = (clientsList: Client[]): Client[] => {
    const hasPlaceholder = clientsList.some(c => c.name === '+ Agregar cliente...')
    if (!hasPlaceholder) {
      const placeholder: Client = {
        id: 'placeholder',
        name: '+ Agregar cliente...',
        clientNumber: '',
        email: '',
        phone: '',
        area: undefined,
        type: undefined,
        channel: undefined,
        status: 'NUEVO_CONTACTO',
        priority: 'NORMAL',
        eventDate: undefined,
        assignedExecutive: undefined,
        notes: '',
        guestCount: undefined,
        createdAt: new Date('2025-12-31'),
        archived: false,
        vip: false,
      }
      return [...clientsList, placeholder]
    }
    return clientsList
  }

  // Efecto para cargar datos del localStorage después de la hidratación
  useEffect(() => {
    const savedClients = localStorage.getItem('crm-clients')
    
    if (savedClients) {
      try {
        const parsedClients = JSON.parse(savedClients).map((client: any) => ({
          ...client,
          eventDate: client.eventDate ? new Date(client.eventDate) : undefined,
          createdAt: new Date(client.createdAt)
        }))
        const normalizedClients = normalizeClients(parsedClients)
        const finalClients = ensurePlaceholder(normalizedClients)
        
        // Auto-reset si hay menos clientes de los esperados (excluyendo placeholder)
        const realClients = finalClients.filter(c => c.name !== '+ Agregar cliente...')
        const expectedMinClients = 15 // Mínimo esperado de clientes reales
        
        if (realClients.length < expectedMinClients) {
          console.log(`🔄 Auto-reset: Solo ${realClients.length} clientes encontrados, esperados al menos ${expectedMinClients}`)
          handleResetData()
          return
        }
        
        setClients(finalClients)
      } catch (error) {
        console.error('Error parsing saved clients:', error)
        // Si hay error en parsing, hacer reset automático
        console.log('🔄 Auto-reset: Error en parsing de datos')
        handleResetData()
      }
    } else {
      // Si no hay datos guardados, usar los mock clients
      const finalMockClients = ensurePlaceholder(normalizeClients(mockClients))
      setClients(finalMockClients)
    }

    // Cargar vista guardada, o usar 'cards' como predeterminada
    const savedViewMode = localStorage.getItem('crm-view-mode')
    if (savedViewMode && ['cards', 'list'].includes(savedViewMode)) { // Removed 'kanban'
      setViewMode(savedViewMode as ViewMode)
    } else {
      // Si no hay vista guardada, usar 'list' como predeterminada y guardarla
      setViewMode('list')
      localStorage.setItem('crm-view-mode', 'list')
    }

    setIsHydrated(true)
  }, [])

  const handleUpdateClient = (updatedClient: Client, skipLogging = false, sourceComponent?: string) => {
    // Verificar si el cliente original era el placeholder
    const originalClient = clients.find(client => client.id === updatedClient.id)
    const isPlaceholder = originalClient?.name === '+ Agregar cliente...' || updatedClient.id === 'placeholder'
    
    if (isPlaceholder) {
      // Si es el placeholder, crear un nuevo cliente
      handleCreateClientFromPlaceholder(updatedClient)
      return
    }

    // NUEVA LÓGICA: Validación automática de relación status-ejecutivo
    let finalUpdatedClient = { ...updatedClient }
    
    // Si tiene ejecutivo asignado, no puede estar como NUEVO_CONTACTO
    if (finalUpdatedClient.assignedExecutive && finalUpdatedClient.status === 'NUEVO_CONTACTO') {
      finalUpdatedClient.status = 'ASIGNADO'
      console.log('🔄 Auto-corrección: Cliente con ejecutivo asignado cambiado a ASIGNADO')
    }
    
    // Si no tiene ejecutivo asignado y está como ASIGNADO, cambiar a NUEVO_CONTACTO
    if (!finalUpdatedClient.assignedExecutive && finalUpdatedClient.status === 'ASIGNADO') {
      finalUpdatedClient.status = 'NUEVO_CONTACTO'
      console.log('🔄 Auto-corrección: Cliente sin ejecutivo cambiado a NUEVO_CONTACTO')
    }

    const updatedClients = clients.map(client => 
      client.id === finalUpdatedClient.id ? finalUpdatedClient : client
    )
    setClients(updatedClients)

    // Registrar cambios en el contexto de actividad solo si no se especifica skipLogging
    if (originalClient && !skipLogging) {
      Object.keys(finalUpdatedClient).forEach(field => {
        const oldValue = originalClient[field as keyof Client]
        const newValue = finalUpdatedClient[field as keyof Client]
        if (oldValue !== newValue) {
          addLog(finalUpdatedClient.id, field, oldValue, newValue, `${field} cambiado de ${oldValue} a ${newValue}`)
        }
      })
    }

    // Guardar en localStorage solo después de la hidratación
    if (isHydrated) {
      localStorage.setItem('crm-clients', JSON.stringify(updatedClients))
    }
  }

  // Funciones wrapper para diferentes componentes
  const handleUpdateClientFromCard = (updatedClient: Client) => {
    // Actualizar selectedClient si es el mismo que se está editando
    if (selectedClient && selectedClient.id === updatedClient.id) {
      setSelectedClient(updatedClient)
    }
    handleUpdateClient(updatedClient, true, 'ClientCard') // skipLogging=true porque la card ya loguea
  }

  const handleUpdateClientFromModal = (updatedClient: Client) => {
    // Actualizar selectedClient ya que es el modal el que está editando
    setSelectedClient(updatedClient)
    handleUpdateClient(updatedClient, true, 'ClientDetailModal') // skipLogging=true porque el modal ya loguea
  }

  // const handleUpdateClientFromKanban = (updatedClient: Client) => {
  //   handleUpdateClient(updatedClient, true, 'KanbanView')
  // }

  // Función para limpiar y resetear datos
  const handleResetData = () => {
    localStorage.removeItem('crm-clients')
    localStorage.removeItem('crm-view-mode')
    const resetClients = ensurePlaceholder(normalizeClients(mockClients))
    setClients(resetClients)
    setViewMode('list')
    setActiveView('all')
    setSearchQuery('')
    console.log('🔄 Datos reseteados completamente:', resetClients.length, 'clientes')
  }

  // Función para actualizar cliente desde CrmListView (por el usuario)
  const handleUpdateClientFromList = (clientId: string, updates: Partial<Client>) => {
    const originalClient = clients.find(client => client.id === clientId)
    if (!originalClient) return

    // Si es el placeholder, manejar como borrador
    const isPlaceholder = originalClient.name === '+ Agregar cliente...' || clientId === 'placeholder'
    if (isPlaceholder) {
      // Activar modo borrador y almacenar los cambios temporalmente
      setIsEditingPlaceholder(true)
      setDraftClient(prevDraft => ({
        ...prevDraft,
        ...updates
      }))
      return
    }

    // Marcar que estamos procesando un cambio desde Lista
    setIsProcessingListChange(true)

    // Para cambios del usuario en la lista, SÍ necesitamos logging
    const updatedClient = { ...originalClient, ...updates }
    
    // Loguear manualmente cada cambio
    Object.keys(updates).forEach(field => {
      const oldValue = originalClient[field as keyof Client]
      const newValue = updates[field as keyof Client]
      if (oldValue !== newValue) {
        // Función para formatear valores según el tipo de campo
        const formatValueForLog = (fieldName: string, value: any): string => {
          if (!value) return 'Sin definir'
          
          switch (fieldName) {
            case 'eventDate':
              return value instanceof Date ? value.toLocaleDateString('es-ES') : 'Sin definir'
            case 'status':
              // Mapear valores del status a español
              const statusMap: Record<string, string> = {
                'NUEVO_CONTACTO': 'Nuevo Contacto',
                'CLIENTE_CONTACTADO': 'Cliente Contactado', 
                'ASIGNADO': 'Asignado',
                'PROPUESTA_ENVIADA': 'Propuesta Enviada',
                'NEGOCIACION': 'Negociación',
                'CONTRATO_FIRMADO': 'Contrato Firmado',
                'EVENTO_REALIZADO': 'Evento Realizado'
              }
              return statusMap[value] || value
            case 'priority':
              const priorityMap: Record<string, string> = {
                'LOW': 'Baja',
                'NORMAL': 'Normal', 
                'HIGH': 'Alta'
              }
              return priorityMap[value] || value
            case 'type':
              const typeMap: Record<string, string> = {
                'WEDDING': 'Boda',
                'QUINCEANOS': 'XV Años',
                'CORPORATE': 'Corporativo',
                'SOCIAL': 'Social',
                'BAUTIZO': 'Bautizo',
                'COMUNION': 'Comunión'
              }
              return typeMap[value] || value
            case 'area':
              const areaMap: Record<string, string> = {
                'CASANUEVA': 'Casa Nueva',
                'CASA_MUNECAS': 'Casa de las Muñecas',
                'ATRIO': 'Atrio',
                'CABANAS': 'Cabañas'
              }
              return areaMap[value] || value
            case 'assignedExecutive':
              const executiveMap: Record<string, string> = {
                'ANTHONY_CAZARES': 'Anthony Cazares',
                'SEBASTIAN_RAMIREZ': 'Sebastián Ramírez',
                'YARLENY_COLIN': 'Yarleny Colín',
                'JOSEFO_FLORES': 'Josefo Flores'
              }
              return executiveMap[value] || value
            case 'channel':
              const channelMap: Record<string, string> = {
                'INSTAGRAM': 'Instagram',
                'WHATSAPP_SOCIAL': 'WhatsApp Social',
                'REFERRAL': 'Referencia',
                'EMAIL': 'Email',
                'PHONE': 'Teléfono',
                'BODAS_COM': 'Bodas.com'
              }
              return channelMap[value] || value
            default:
              return String(value)
          }
        }

        // Crear nombre de campo en español
        const fieldDisplayNames: Record<string, string> = {
          'eventDate': 'Fecha del Evento',
          'status': 'Estado',
          'priority': 'Prioridad',
          'type': 'Tipo de Evento',
          'area': 'Área',
          'assignedExecutive': 'Ejecutivo Asignado',
          'channel': 'Canal',
          'name': 'Nombre',
          'email': 'Email',
          'phone': 'Teléfono',
          'notes': 'Notas',
          'guestCount': 'Número de Invitados'
        }

        const fieldDisplayName = fieldDisplayNames[field] || field
        const formattedOldValue = formatValueForLog(field, oldValue)
        const formattedNewValue = formatValueForLog(field, newValue)
        
        const formattedMessage = `${fieldDisplayName} cambiado de ${formattedOldValue} a ${formattedNewValue}`
        console.log(`📤 CRM List sending to addLog:`, formattedMessage)
        addLog(clientId, field, oldValue, newValue, formattedMessage)
      }
    })
    
    handleUpdateClient(updatedClient, true, 'ListView') // skipLogging=true porque ya logueamos arriba
    
    // Desmarcar después de un pequeño delay
    setTimeout(() => {
      setIsProcessingListChange(false)
    }, 100)
  }

  // Función para confirmar el borrador y crear el cliente
  const handleConfirmDraft = () => {
    if (draftClient && isEditingPlaceholder) {
      handleCreateClientFromPlaceholder(draftClient)
      setDraftClient(null)
      setIsEditingPlaceholder(false)
    }
  }

  // Función para cancelar el borrador
  const handleCancelDraft = () => {
    setDraftClient(null)
    setIsEditingPlaceholder(false)
  }

  // Función para manejar Enter en los campos del placeholder
  const handlePlaceholderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirmDraft()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelDraft()
    }
  }

  // Función para manejar cuando se hace clic fuera del placeholder
  const handlePlaceholderBlur = () => {
    // Usar setTimeout para permitir que otros campos reciban el foco
    setTimeout(() => {
      // Solo confirmar si no hay ningún campo del placeholder con foco
      const placeholderInputs = document.querySelectorAll('[data-placeholder-input="true"]')
      const hasFocus = Array.from(placeholderInputs).some(input => 
        input === document.activeElement
      )
      
      if (!hasFocus && isEditingPlaceholder && draftClient) {
        // Solo confirmar si hay datos significativos
        const hasSignificantData = draftClient.name || 
                                  draftClient.email || 
                                  draftClient.phone || 
                                  draftClient.notes ||
                                  draftClient.assignedExecutive ||
                                  draftClient.area
        
        if (hasSignificantData) {
          handleConfirmDraft()
        } else {
          handleCancelDraft()
        }
      }
    }, 100)
  }

  // Función para crear un nuevo cliente a partir del placeholder
  const handleCreateClientFromPlaceholder = (initialData: Partial<Client> | Client) => {
    // Generar nuevo ID único (buscar el ID más alto entre los clientes reales)
    const realClients = clients.filter(c => c.id !== 'placeholder' && c.name !== '+ Agregar cliente...')
    const maxId = Math.max(...realClients.map(c => parseInt(c.id) || 0))
    const newId = (maxId + 1).toString()
    
    // NUEVA LÓGICA: Determinar status inicial basado en ejecutivo asignado
    let initialStatus = initialData.status || 'NUEVO_CONTACTO'
    if (initialData.assignedExecutive && initialStatus === 'NUEVO_CONTACTO') {
      initialStatus = 'ASIGNADO'
      console.log('🔄 Nuevo cliente: Con ejecutivo asignado, status cambiado a ASIGNADO')
    }
    
    // Crear nuevo cliente con los datos iniciales
    const newClient: Client = {
      id: newId,
      name: (initialData.name && initialData.name !== '+ Agregar cliente...') ? initialData.name : 'Nuevo Cliente',
      clientNumber: `CL-2025-${String(parseInt(newId)).padStart(3, '0')}`,
      email: initialData.email || '',
      phone: initialData.phone || '',
      area: initialData.area || undefined,
      type: initialData.type || undefined,
      channel: initialData.channel || undefined,
      status: initialStatus,
      priority: initialData.priority || 'NORMAL',
      eventDate: initialData.eventDate || undefined,
      assignedExecutive: initialData.assignedExecutive || undefined,
      notes: initialData.notes || '',
      guestCount: initialData.guestCount || undefined,
      // Usar fecha actual para mantener orden cronológico natural
      createdAt: new Date(),
      archived: false,
      vip: false,
    }

    // Crear nuevo placeholder
    const newPlaceholder: Client = {
      id: 'placeholder',
      name: '+ Agregar cliente...',
      clientNumber: '',
      email: '',
      phone: '',
      area: undefined,
      type: undefined,
      channel: undefined,
      status: 'NUEVO_CONTACTO',
      priority: 'NORMAL',
      eventDate: undefined,
      assignedExecutive: undefined,
      notes: '',
      guestCount: undefined,
      createdAt: new Date('2025-12-31'),
      archived: false,
      vip: false,
    }

    // Crear nueva lista: clientes reales + nuevo cliente + placeholder
    // El nuevo cliente se coloca justo antes del placeholder (penúltima posición)
    const updatedClients = [...realClients, newClient, newPlaceholder]
    
    console.log('Creando cliente desde placeholder:', {
      newClientId: newClient.id,
      totalClients: updatedClients.length,
      hasPlaceholder: updatedClients.some(c => c.name === '+ Agregar cliente...'),
      lastClient: updatedClients[updatedClients.length - 1]?.name
    })
    
    setClients(updatedClients)
    
    // Registrar actividad
    addLog(newClient.id, 'create', '', newClient.name, `Cliente creado: ${newClient.name}`)

    // Guardar en localStorage solo después de la hidratación
    if (isHydrated) {
      localStorage.setItem('crm-clients', JSON.stringify(updatedClients))
    }
  }

  // Función para abrir modal simple
  const handleOpenModal = (client: Client) => {
    setSelectedClient(client)
    setShowDetailModal(true)
  }

  // Función para manejar ordenamiento
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Función auxiliar para filtrar el placeholder de los contadores
  const getClientsForCounting = () => {
    return clients.filter(client => client.name !== '+ Agregar cliente...')
  }

  // Función para filtrar clientes basado en búsqueda
  const getFilteredClients = () => {
    let filtered = clients

    // Filtrar por vista inteligente
    switch (activeView) {
      case 'new':
        filtered = filtered.filter(c => c.status === 'NUEVO_CONTACTO' && c.archived !== true)
        break
      case 'assigned':
        filtered = filtered.filter(c => c.status === 'ASIGNADO' && c.archived !== true)
        break
      case 'high-priority':
        filtered = filtered.filter(c => c.priority === 'HIGH' && c.archived !== true)
        break
      case 'upcoming-events':
        filtered = filtered.filter(c => {
          const eventDate = new Date(c.eventDate || '')
          const now = new Date()
          const thirtyDaysFromNow = new Date()
          thirtyDaysFromNow.setDate(now.getDate() + 30)
          return eventDate >= now && eventDate <= thirtyDaysFromNow && c.archived !== true
        })
        break
      case 'weddings':
        filtered = filtered.filter(c => c.type === 'WEDDING' && c.archived !== true)
        break
      case 'corporate':
        filtered = filtered.filter(c => c.type === 'CORPORATE' && c.archived !== true)
        break
      case 'vip':
        filtered = filtered.filter(c => c.vip === true && c.archived !== true)
        break
      case 'overdue':
        // Cambio: Mostrar clientes sin ejecutivo asignado
        filtered = filtered.filter(c => !c.assignedExecutive && c.archived !== true)
        break
      case 'archived':
        filtered = filtered.filter(c => c.archived === true)
        break
      case 'all':
      default:
        // Mostrar todos excepto archivados
        filtered = filtered.filter(c => c.archived !== true)
        break
    }

    // Filtrar por búsqueda si hay query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(client => {
        return (
          client.name.toLowerCase().includes(query) ||
          client.clientNumber?.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query) ||
          client.phone?.toLowerCase().includes(query) ||
          client.notes?.toLowerCase().includes(query) ||
          client.type?.toLowerCase().includes(query) ||
          client.area?.toLowerCase().includes(query) ||
          client.status?.toLowerCase().includes(query) ||
          client.channel?.toLowerCase().includes(query) ||
          client.assignedExecutive?.toLowerCase().includes(query)
        )
      })
    }

    return filtered
  }

  // Función para ordenar clientes
  const getSortedAndFilteredClients = () => {
    const filtered = getFilteredClients()
    
    // Si estamos editando el placeholder, combinar los datos del borrador
    const clientsWithDraft = filtered.map(client => {
      if (client.id === 'placeholder' && isEditingPlaceholder && draftClient) {
        return {
          ...client,
          ...draftClient,
          id: 'placeholder', // Mantener el ID del placeholder
        }
      }
      return client
    })
    
    const sorted = [...clientsWithDraft].sort((a, b) => {
      // El placeholder "+ Agregar cliente..." siempre va al final
      if (a.name === '+ Agregar cliente...' || a.id === 'placeholder') return 1
      if (b.name === '+ Agregar cliente...' || b.id === 'placeholder') return -1
      
      let aValue: any = a[sortBy as keyof Client]
      let bValue: any = b[sortBy as keyof Client]

      // Manejar fechas - para createdAt usar orden ascendente (antiguos primero)
      if (aValue instanceof Date && bValue instanceof Date) {
        if (sortBy === 'createdAt') {
          // Para fecha de creación, siempre ascendente (antiguos primero, nuevos antes del placeholder)
          return aValue.getTime() - bValue.getTime()
        } else {
          // Para otras fechas (eventDate), usar el orden configurado
          return sortOrder === 'asc' 
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime()
        }
      }

      // Manejar strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      // Manejar números
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Manejar valores null/undefined
      if (!aValue && !bValue) return 0
      if (!aValue) return sortOrder === 'asc' ? 1 : -1
      if (!bValue) return sortOrder === 'asc' ? -1 : 1

      // Convertir a string como fallback
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      return sortOrder === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })

    return sorted
  }

  const handleDeleteClient = (clientId: string) => {
    const updatedClients = clients.filter(client => client.id !== clientId)
    setClients(updatedClients)
    
    // Guardar en localStorage solo después de la hidratación
    if (isHydrated) {
      localStorage.setItem('crm-clients', JSON.stringify(updatedClients))
    }
  }

  // Función temporal para eliminar cliente por fecha de creación
  const deleteClientByCreatedDate = (targetDate: string) => {
    const clientToDelete = clients.find(client => {
      const createdDate = new Date(client.createdAt).toISOString().split('T')[0]
      return createdDate === targetDate
    })
    
    if (clientToDelete) {
      console.log('Cliente encontrado para eliminar:', clientToDelete.name, 'ID:', clientToDelete.id)
      handleDeleteClient(clientToDelete.id)
      return true
    } else {
      console.log('No se encontró cliente con fecha de creación:', targetDate)
      return false
    }
  }

  // Auto-eliminar cliente del 29 de diciembre al cargar
  // useEffect eliminado - estaba causando que los clientes desaparecieran automáticamente
  // useEffect(() => {
  //   if (isHydrated && clients.length > 0) {
  //     const clientToDelete = clients.find(client => {
  //       const createdDate = new Date(client.createdAt).toISOString().split('T')[0]
  //       return createdDate === '2025-12-29'
  //     })
  //     
  //     if (clientToDelete) {
  //       console.log('🗑️ Eliminando automáticamente cliente del 29 dic:', clientToDelete.name)
  //       const updatedClients = clients.filter(client => client.id !== clientToDelete.id)
  //       setClients(updatedClients)
  //       localStorage.setItem('crm-clients', JSON.stringify(updatedClients))
  //     }
  //   }
  // }, [isHydrated, clients])

  // Exponer funciones globalmente para uso en consola (solo en desarrollo)
  if (typeof window !== 'undefined') {
    (window as any).deleteClientByCreatedDate = deleteClientByCreatedDate;
    (window as any).resetCRMData = handleResetData;
    (window as any).getCRMData = () => {
      const saved = localStorage.getItem('crm-clients')
      return saved ? JSON.parse(saved) : null
    };
    (window as any).getCRMStats = () => {
      const realClients = clients.filter(c => c.name !== '+ Agregar cliente...')
      return {
        totalClients: realClients.length,
        expectedMin: 15,
        mockClientsTotal: mockClients.filter(c => c.name !== '+ Agregar cliente...').length,
        needsReset: realClients.length < 15
      }
    }
  }

  // Auto-reset programado (opcional - comentado por defecto)
  // useEffect(() => {
  //   // Auto-reset cada 24 horas si hay inconsistencias
  //   const interval = setInterval(() => {
  //     const realClients = clients.filter(c => c.name !== '+ Agregar cliente...')
  //     if (realClients.length < 15) {
  //       console.log('🔄 Auto-reset programado: Detectadas inconsistencias')
  //       handleResetData()
  //     }
  //   }, 24 * 60 * 60 * 1000) // 24 horas
  //   
  //   return () => clearInterval(interval)
  // }, [clients])

  const handleArchiveClient = (clientId: string) => {
    const clientToArchive = clients.find(client => client.id === clientId)
    if (clientToArchive) {
      const updatedClient = { ...clientToArchive, archived: !clientToArchive.archived }
      const updatedClients = clients.map(client => 
        client.id === clientId ? updatedClient : client
      )
      
      setClients(updatedClients)
      
      // Registrar actividad
      const action = updatedClient.archived ? 'archive' : 'unarchive'
      const message = updatedClient.archived ? 'Cliente archivado' : 'Cliente restaurado'
      addLog(clientId, action, '', clientToArchive.name, message)
      
      // Guardar en localStorage
      if (isHydrated) {
        localStorage.setItem('crm-clients', JSON.stringify(updatedClients))
      }
    }
  }

  const handleVipClient = (clientId: string) => {
    const clientToVip = clients.find(client => client.id === clientId)
    if (clientToVip) {
      const updatedClient = { ...clientToVip, vip: !clientToVip.vip }
      const updatedClients = clients.map(client => 
        client.id === clientId ? updatedClient : client
      )
      
      setClients(updatedClients)
      
      // Registrar actividad
      const action = updatedClient.vip ? 'vip' : 'unvip'
      const message = updatedClient.vip ? 'Cliente marcado como VIP' : 'Cliente desmarcado como VIP'
      addLog(clientId, action, '', clientToVip.name, message)
      
      // Guardar en localStorage
      if (isHydrated) {
        localStorage.setItem('crm-clients', JSON.stringify(updatedClients))
      }
    }
  }
  
  const getActiveViewName = () => {
    const viewNames: Record<string, string> = {
      all: 'Todos los clientes',
      new: 'Nuevos contactos',
      assigned: 'Asignados',
      'high-priority': 'Alta prioridad',
      'upcoming-events': 'Eventos próximos',
      weddings: 'Bodas',
      corporate: 'Corporativo',
      vip: 'Clientes VIP',
      overdue: 'Sin asignar',
      archived: 'Archivados'
    }
    return viewNames[activeView] || 'Todos los clientes'
  }

  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('crm-view-mode', mode)
  }

  const handleCreateClient = () => {
    // Abrir el modal de crear cliente
    setShowCreateClientModal(true)
  }

  // Nueva función para crear cliente desde el modal del FAB
  const handleCreateClientFromModal = (clientData: { name: string; eventDate?: Date; area?: ClientArea; assignedTo?: ClientExecutive }) => {
    const newClient: Client = {
      id: Date.now().toString(),
      name: clientData.name,
      clientNumber: `CL-${Date.now().toString().slice(-6)}`,
      email: '',
      phone: '',
      area: clientData.area,
      type: undefined,
      eventDate: clientData.eventDate,
      status: 'NUEVO_CONTACTO',
      priority: 'NORMAL', // Prioridad por defecto
      assignedExecutive: clientData.assignedTo,
      notes: '',
      createdAt: new Date(),
      guestCount: undefined,
      archived: false,
      vip: false,
    }

    // Agregar el cliente a la lista y mantener el placeholder
    setClients(prevClients => {
      const realClients = prevClients.filter(c => c.name !== '+ Agregar cliente...')
      const updatedClients = [...realClients, newClient]
      const finalClients = ensurePlaceholder(updatedClients)
      
      // Guardar en localStorage
      const clientsToSave = finalClients.filter(c => c.name !== '+ Agregar cliente...')
      localStorage.setItem('crm-clients', JSON.stringify(clientsToSave))
      
      return finalClients
    })

    // Log de actividad para el nuevo cliente
    addLog(
      newClient.id,
      'created',
      null,
      'Cliente creado',
      `Cliente creado desde FAB: ${newClient.name}`,
      'Sistema'
    )

    // Cerrar el modal
    setShowCreateClientModal(false)
    
    console.log('✅ Cliente creado exitosamente:', newClient.name)
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
      {/* Header - Fixed */}
      <div className="flex-shrink-0">
        <Header />
      </div>
      
      {/* Main Layout - Takes remaining height */}
      <div className="flex-1 flex gap-0">
        {/* Sidebar - Sticky within its container */}
        <div className="sidebar-container apple-sidebar apple-scroll">
          <CrmSidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeView={activeView}
            onViewSelect={setActiveView}
            clientCounts={{
              all: getClientsForCounting().filter(c => c.archived !== true).length,
              new: getClientsForCounting().filter(c => c.status === 'NUEVO_CONTACTO' && c.archived !== true).length,
              assigned: getClientsForCounting().filter(c => c.status === 'ASIGNADO' && c.archived !== true).length,
              'high-priority': getClientsForCounting().filter(c => c.priority === 'HIGH' && c.archived !== true).length,
              'upcoming-events': getClientsForCounting().filter(c => {
                const eventDate = new Date(c.eventDate || '')
                const now = new Date()
                const thirtyDaysFromNow = new Date()
                thirtyDaysFromNow.setDate(now.getDate() + 30)
                return eventDate >= now && eventDate <= thirtyDaysFromNow && c.archived !== true
              }).length,
              weddings: getClientsForCounting().filter(c => c.type === 'WEDDING' && c.archived !== true).length,
              corporate: getClientsForCounting().filter(c => c.type === 'CORPORATE' && c.archived !== true).length,
              vip: getClientsForCounting().filter(c => c.vip === true && c.archived !== true).length,
              overdue: getClientsForCounting().filter(c => !c.assignedExecutive && c.archived !== true).length,
              archived: getClientsForCounting().filter(c => c.archived === true).length
            }}
          />
        </div>

        {/* Main Content - Flex container with fixed header and scrollable content */}
        <div className="content-container flex-1 flex flex-col apple-fade-in ml-72">
          {/* CRM Header - Fixed within content area */}
          <div className="flex-shrink-0 bg-gradient-to-br from-gray-50/95 to-gray-100/95 dark:from-black/95 dark:to-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="pr-8 pt-8 pb-4 pl-0">
              <div className="flex items-center space-x-4 pl-8">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: '#d87254' }}
                >
                  <Users size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    CRM - {getActiveViewName()}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {getFilteredClients().filter(c => c.name !== '+ Agregar cliente...').length === 0 
                      ? 'No hay clientes' 
                      : `${getFilteredClients().filter(c => c.name !== '+ Agregar cliente...').length} cliente${getFilteredClients().filter(c => c.name !== '+ Agregar cliente...').length !== 1 ? 's' : ''}`
                    }
                    {searchQuery && ` · Filtrado por "${searchQuery}"`}
                  </p>
                </div>
                
                {/* View Mode Selector */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => changeViewMode('cards')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-arrebol-terracota text-white shadow-md border border-arrebol-terracota'
                        : 'text-arrebol-beige-600 dark:text-arrebol-beige-400 hover:text-arrebol-terracota dark:hover:text-arrebol-terracota-light hover:bg-white/50'
                    }`}
                  >
                    <Grid3X3 size={16} />
                    Tarjetas
                  </button>
                  <button
                    onClick={() => changeViewMode('list')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-arrebol-terracota text-white shadow-md border border-arrebol-terracota'
                        : 'text-arrebol-beige-600 dark:text-arrebol-beige-400 hover:text-arrebol-terracota dark:hover:text-arrebol-terracota-light hover:bg-white/50'
                    }`}
                  >
                    <Rows3 size={16} />
                    Lista
                  </button>
                  {/* Kanban View - Temporarily disabled
                  <button
                    onClick={() => changeViewMode('kanban')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'kanban'
                        ? 'bg-arrebol-terracota text-white shadow-sm'
                        : 'text-arrebol-beige-600 dark:text-arrebol-beige-400 hover:text-arrebol-terracota dark:hover:text-arrebol-terracota-light'
                    }`}
                  >
                    <Columns3 size={16} />
                    Kanban
                  </button>
                  */}
                  </div>

                  {/* Reset Data Button - Comentado para producción */}
                  {/* <button
                    onClick={handleResetData}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-red-500 hover:bg-red-600 text-white shadow-sm"
                    title="Resetear todos los datos"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button> */}
                </div>
              </div>
            </div>
          </div>

          {/* Clients Area - SIN SCROLL aquí, cada vista maneja su propio scroll */}
          <div className="flex-1 px-4 pt-4 flex justify-center">
            <div className="w-full max-w-screen-2xl">
            {!isHydrated ? (
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : getFilteredClients().filter(c => c.name !== '+ Agregar cliente...').length === 0 ? (
              <div className="max-w-7xl mx-auto px-4 text-center py-12">
                {searchQuery ? (
                  <div className="apple-fade-in">
                    <div className="text-gray-400 mb-4">
                      <Search size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No se encontraron clientes
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No hay clientes que coincidan con "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  <EmptyListButton 
                    onClick={handleCreateClient}
                    listTitle="clientes"
                    buttonText="Nuevo Cliente"
                    className="apple-fade-in"
                  />
                )}
              </div>
            ) : (
              <>
                {viewMode === 'cards' && (
                  <div className="h-[calc(100vh-200px)] overflow-y-auto apple-scroll flex justify-center">
                    <div className="w-full max-w-screen-2xl px-4 py-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr pb-6">
                        {getSortedAndFilteredClients().map(client => (
                          <ClientCard 
                            key={client.id} 
                            client={client}
                            onUpdate={handleUpdateClientFromCard}
                            onDelete={handleDeleteClient}
                            onArchive={handleArchiveClient}
                            onOpenModal={handleOpenModal}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {viewMode === 'list' && (
                  <div className="h-[calc(100vh-200px)] flex justify-center py-6">
                    <div className="w-full max-w-screen-2xl">
                      <CrmListView
                        clients={getSortedAndFilteredClients()}
                        onUpdateClient={handleUpdateClientFromList}
                        onOpenModal={handleOpenModal}
                        onDelete={handleDeleteClient}
                        onVip={handleVipClient}
                        onArchive={handleArchiveClient}
                        onCreateClient={handleCreateClient}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        // Props para manejar el borrador del placeholder
                        isEditingPlaceholder={isEditingPlaceholder}
                        onPlaceholderKeyDown={handlePlaceholderKeyDown}
                        onPlaceholderBlur={handlePlaceholderBlur}
                      />
                    </div>
                  </div>
                )}
                {/* Kanban View - Temporarily disabled */}
                {/*
                {viewMode === 'kanban' && (
                  <div className="h-[calc(100vh-200px)] overflow-y-auto apple-scroll flex justify-center">
                    <div className="w-full max-w-screen-2xl px-4 py-6">
                      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-full min-h-0 flex flex-col">
                        <CrmKanbanView
                          clients={getSortedAndFilteredClients()}
                          onUpdateClient={handleUpdateClientFromList}
                          onEditClient={handleEditClient}
                          // Props para manejar el borrador del placeholder
                          isEditingPlaceholder={isEditingPlaceholder}
                          onPlaceholderKeyDown={handlePlaceholderKeyDown}
                          onPlaceholderBlur={handlePlaceholderBlur}
                        />
                      </div>
                    </div>
                  </div>
                )}
                */}
              </>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* CRM FAB - Botón flotante para crear cliente */}
      <div className="fixed bottom-6 right-6 z-[40]">
        <button
          onClick={handleCreateClient}
          className="w-14 h-14 bg-gradient-to-br from-arrebol-terracota-500 via-arrebol-terracota-600 to-arrebol-terracota-700 hover:from-arrebol-terracota-600 hover:via-arrebol-terracota-700 hover:to-arrebol-terracota-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group border-2 border-white dark:border-gray-800"
        >
          <UserPlus size={24} className="group-hover:scale-110 transition-transform drop-shadow-sm" />
        </button>
      </div>

      {/* Modal simple de detalles */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedClient(null)
          }}
          onUpdate={handleUpdateClientFromModal}
        />
      )}

      {/* Modal de crear cliente (FAB) */}
      <CreateClientModal
        isOpen={showCreateClientModal}
        onClose={() => setShowCreateClientModal(false)}
        onCreateClient={handleCreateClientFromModal}
      />
    </div>
  )
}

// Componente principal que provee el contexto
export default function CRMPage() {
  return (
    <ActivityLogProvider>
      <CommentsProvider>
        <CRMPageContent />
      </CommentsProvider>
    </ActivityLogProvider>
  )
}
