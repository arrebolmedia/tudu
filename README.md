# Gestor de Tareas 📝

Un gestor de tareas moderno y completo inspirado en Microsoft To Do, construido con Next.js, Prisma y Docker.

## 🚀 Características

- **CRUD completo de tareas** - Crear, leer, actualizar y eliminar tareas
- **Gestión de listas** - Organiza tus tareas en listas personalizables
- **Prioridades** - Baja, Normal, Alta, Urgente
- **Fechas de vencimiento** - Programa tus tareas
- **Subtareas** - Divide tareas grandes en pasos más pequeños
- **Etiquetas** - Categoriza y filtra tus tareas
- **Interfaz moderna** - Diseño responsive inspirado en Microsoft Fluent
- **Base de datos robusta** - PostgreSQL con Prisma ORM

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 + React + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL + Prisma ORM
- **Containerización**: Docker + Docker Compose
- **Iconos**: Lucide React
- **Fechas**: date-fns + react-day-picker

## 📦 Instalación

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone <repo-url>
cd gestor-tareas

# Copiar variables de entorno
cp .env.example .env

# Levantar servicios con Docker
docker-compose up -d

# Ejecutar migraciones
docker-compose exec app npx prisma migrate dev

# Opcional: Sembrar datos de prueba
docker-compose exec app npx prisma db seed
```

### Opción 2: Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar PostgreSQL local
# Crear base de datos 'gestor_tareas'

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de BD

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint

# Base de datos
npx prisma generate  # Generar cliente Prisma
npx prisma migrate dev    # Crear y aplicar migración
npx prisma db push   # Aplicar cambios sin migración
npx prisma studio    # Interface web para la BD
npx prisma db seed   # Sembrar datos de prueba

# Docker
docker-compose up -d    # Levantar servicios
docker-compose down     # Detener servicios
docker-compose logs     # Ver logs
```

## 📁 Estructura del Proyecto

```
src/
├── app/                 # App Router de Next.js
│   ├── api/            # API Routes
│   ├── globals.css     # Estilos globales
│   └── page.tsx        # Página principal
├── components/          # Componentes React
│   ├── ui/             # Componentes UI base
│   ├── forms/          # Formularios
│   ├── layout/         # Layout components
│   └── tasks/          # Componentes específicos de tareas
├── lib/                # Utilidades y configuraciones
│   ├── prisma.ts       # Cliente de Prisma
│   └── utils.ts        # Funciones utilitarias
├── types/              # Tipos TypeScript
└── hooks/              # Custom hooks
prisma/
├── schema.prisma       # Esquema de base de datos
└── migrations/         # Historial de migraciones
```

## 🗄️ Modelo de Datos

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  lists     List[]
}

model List {
  id          String   @id @default(cuid())
  title       String
  color       String
  icon        String
  tasks       Task[]
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  completed   Boolean   @default(false)
  priority    Priority  @default(NORMAL)
  dueDate     DateTime?
  subtasks    Subtask[]
  tags        TaskTag[]
}
```

## 🌐 API Endpoints

```bash
# Listas
GET    /api/lists           # Obtener todas las listas
POST   /api/lists           # Crear nueva lista
PUT    /api/lists/[id]      # Actualizar lista
DELETE /api/lists/[id]      # Eliminar lista

# Tareas
GET    /api/tasks           # Obtener tareas (con filtros)
POST   /api/tasks           # Crear nueva tarea
PUT    /api/tasks/[id]      # Actualizar tarea
DELETE /api/tasks/[id]      # Eliminar tarea

# Subtareas
POST   /api/subtasks        # Crear subtarea
PUT    /api/subtasks/[id]   # Actualizar subtarea
DELETE /api/subtasks/[id]   # Eliminar subtarea
```

## 🎨 Personalización

### Colores de Listas
Los colores están definidos en `src/types/index.ts`:
```typescript
export const LIST_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
]
```

### Iconos de Listas
Iconos disponibles en `src/types/index.ts`:
```typescript
export const LIST_ICONS = [
  'list', 'home', 'briefcase', 'heart', 'star', 'calendar'
]
```

## 🚦 Estado del Proyecto

- [x] ✅ Configuración inicial (Next.js + Prisma + Docker)
- [x] ✅ Modelo de datos
- [x] ✅ Estructura de archivos
- [ ] 🔄 Componentes UI base
- [ ] 🔄 API Routes
- [ ] 🔄 Páginas principales
- [ ] 🔄 Autenticación (NextAuth.js)
- [ ] 🔄 Testing
- [ ] 🔄 Deploy

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

## 📞 Contacto

Tu Nombre - [@tutwitter](https://twitter.com/tutwitter) - email@ejemplo.com

Enlace del Proyecto: [https://github.com/tuusuario/gestor-tareas](https://github.com/tuusuario/gestor-tareas)
