# Copilot Instructions - Gestor de Tareas

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Contexto del Proyecto

Este es un gestor de tareas web similar a Microsoft To Do, construido con:
- **Next.js 15** con App Router
- **TypeScript** para tipado estático
- **Prisma** como ORM para base de datos
- **Tailwind CSS** para estilos
- **Radix UI** para componentes base
- **Docker** para containerización

## Arquitectura y Patrones

### Estructura del Proyecto
```
src/
├── app/                 # App Router de Next.js
├── components/          # Componentes React reutilizables
│   ├── ui/             # Componentes UI base (Radix UI)
│   ├── forms/          # Formularios específicos
│   └── layout/         # Componentes de layout
├── lib/                # Utilidades y configuraciones
│   ├── prisma.ts       # Cliente de Prisma
│   ├── utils.ts        # Funciones utilitarias
│   └── validations.ts  # Esquemas de validación
├── types/              # Tipos TypeScript
└── hooks/              # Custom hooks de React
```

### Convenciones de Código

1. **Componentes**: Usar PascalCase para nombres de componentes
2. **Archivos**: Usar kebab-case para archivos y directorios
3. **Funciones**: Usar camelCase para funciones y variables
4. **Tipos**: Usar PascalCase con sufijo 'Type' si es necesario
5. **API Routes**: Seguir convenciones REST cuando sea posible

### Funcionalidades Principales

- ✅ CRUD completo de tareas
- ✅ Gestión de listas de tareas
- ✅ Fechas de vencimiento y recordatorios
- ✅ Prioridades (Alta, Media, Baja)
- ✅ Subtareas
- ✅ Filtros y búsqueda
- ✅ Interfaz responsive
- ✅ Persistencia con Prisma + PostgreSQL

### Modelo de Datos

El esquema de base de datos incluye:
- **Users**: Usuarios del sistema
- **Lists**: Listas de tareas personalizables
- **Tasks**: Tareas individuales con metadatos
- **Subtasks**: Subtareas anidadas
- **Tags**: Etiquetas para categorización

### Estilo y UI

- Usar **Tailwind CSS** para todos los estilos
- Componentes base de **Radix UI** para accesibilidad
- Seguir principios de **Microsoft Fluent Design**
- **Responsive design** mobile-first
- **Dark mode** opcional

### Mejores Prácticas

1. **Performance**: Usar Server Components cuando sea posible
2. **SEO**: Implementar metadata apropiada
3. **Accesibilidad**: Seguir WCAG 2.1 guidelines
4. **Testing**: Priorizar componentes críticos
5. **Error Handling**: Manejo robusto de errores en API routes
6. **Validation**: Validar datos tanto en cliente como servidor

### Docker y Deployment

- **Dockerfile** optimizado para producción
- **docker-compose.yml** para desarrollo local
- Variables de entorno bien organizadas
- Listo para deploy en Vercel o contenedores
