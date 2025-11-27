# Sistema de Gestión de Incidencias Hospitalarias

Sistema completo para la gestión, seguimiento y resolución de incidencias en entornos hospitalarios. Permite registrar, asignar, resolver y analizar incidencias con un enfoque en la eficiencia operativa y el cumplimiento de SLAs.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Roles y Permisos](#roles-y-permisos)
- [Funcionalidades Detalladas](#funcionalidades-detalladas)
- [API Endpoints](#api-endpoints)
- [Base de Datos](#base-de-datos)
- [Scripts Disponibles](#scripts-disponibles)
- [Despliegue](#despliegue)

---

## 🎯 Descripción General

Este sistema permite a los hospitales gestionar de manera eficiente todas las incidencias que ocurren en sus instalaciones, desde problemas técnicos hasta incidencias clínicas. El sistema facilita:

- **Registro centralizado** de todas las incidencias
- **Asignación automática** basada en áreas y responsabilidades
- **Seguimiento en tiempo real** del estado de cada incidencia
- **Cumplimiento de SLAs** con alertas de vencimiento
- **Análisis y reportes** para la toma de decisiones
- **Predicciones** basadas en datos históricos
- **Notificaciones** automáticas para usuarios relevantes

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- Autenticación basada en JWT (JSON Web Tokens)
- Contraseñas encriptadas con bcrypt
- Control de acceso basado en roles
- Sesiones seguras con tokens de expiración

### 📝 Gestión de Incidencias
- **Creación de incidencias** con información detallada:
  - Título y descripción
  - Área y servicio afectado
  - Tipo y subtipo de incidencia
  - Prioridad (P1-P4) con SLAs automáticos
  - Ubicación física (piso, habitación, cama)
  - Equipo médico afectado
  - Código de paciente (sin datos sensibles)
- **Códigos únicos** generados automáticamente (formato: `INC-YYYY-NNNN`)
- **Estados de incidencia**: Abierta → En Progreso → Resuelta → Cerrada
- **Asignación de responsables** por área o manual
- **Reasignación** de incidencias entre usuarios
- **Cambio de prioridad** dinámico
- **Resolución detallada** con:
  - Solución aplicada
  - Pasos seguidos
  - Recursos utilizados
  - Tiempo invertido
  - Validación por administradores

### 💬 Comunicación y Colaboración
- **Sistema de comentarios** en cada incidencia
- **Historial completo** (timeline) de todos los cambios
- **Notificaciones en tiempo real** para:
  - Asignaciones
  - Cambios de estado
  - Nuevos comentarios
  - Vencimientos de SLA
- **Archivos adjuntos** para evidencias y documentación

### 📊 Dashboard y Analíticas
- **KPIs en tiempo real**:
  - Total de incidencias
  - Incidencias abiertas
  - Incidencias resueltas
  - Tiempo promedio de resolución
- **Gráficos interactivos**:
  - Distribución por tipo de incidencia
  - Distribución por prioridad
  - Tendencias temporales
  - Incidencias por área
- **Filtros avanzados** por fecha, área, estado, prioridad
- **Exportación de reportes**

### 🤖 Predicciones y Análisis Predictivo
- **Predicciones de incidencias** basadas en datos históricos
- **Análisis por período**: mensual, trimestral, anual
- **Métricas de impacto**:
  - Personas afectadas estimadas
  - Pacientes afectados estimados
  - Costo estimado de resolución
  - Tiempo de atención perdido
  - Personal necesario
- **Algoritmo de promedio móvil** para cálculos

### 👥 Gestión de Usuarios y Áreas
- **Gestión completa de usuarios**:
  - Creación, edición y desactivación
  - Asignación de roles y áreas
  - Gestión de permisos
- **Gestión de áreas** del hospital:
  - Creación y configuración de áreas
  - Asignación de responsables
  - Códigos únicos por área
- **Gestión de servicios** dentro de áreas

### 📋 Catálogos Configurables
- **Tipos de incidencias** con categorías y colores
- **Subtipos** para mayor granularidad
- **Prioridades** configurables con:
  - Tiempo de respuesta (minutos)
  - Tiempo de resolución (horas)
  - Colores para UI
- **Activar/desactivar** elementos de catálogo

### 🔍 Búsqueda y Filtrado
- **Búsqueda avanzada** por:
  - Código de incidencia
  - Título o descripción
  - Área, tipo, prioridad
  - Estado
  - Fechas
- **Filtros combinados** para consultas complejas
- **Incidencias relacionadas** basadas en similitudes

### 📱 Interfaz de Usuario
- **Diseño moderno** con Tailwind CSS y shadcn/ui
- **Responsive** para dispositivos móviles y tablets
- **Tema claro/oscuro** (preparado)
- **Navegación intuitiva** con sidebar y breadcrumbs
- **Formularios validados** con React Hook Form y Zod
- **Feedback visual** con toasts y notificaciones

---

## 🏗️ Arquitectura del Sistema

El sistema sigue una arquitectura de **cliente-servidor** con separación clara entre frontend y backend:

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Vite
│   (Cliente)     │  └─ Interfaz de usuario
└────────┬────────┘
         │ HTTP/REST API
         │
┌────────▼────────┐
│   Backend       │  Node.js + Express
│   (Servidor)    │  └─ Lógica de negocio
└────────┬────────┘
         │
┌────────▼────────┐
│   Base de       │  MySQL/MariaDB
│   Datos         │  └─ Persistencia
└─────────────────┘
```

### Flujo de Datos

1. **Frontend** realiza peticiones HTTP al backend
2. **Backend** valida autenticación y permisos
3. **Backend** procesa la lógica de negocio
4. **Backend** consulta/actualiza la base de datos
5. **Backend** retorna respuesta JSON
6. **Frontend** actualiza la UI con los datos recibidos

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** (v18+) - Runtime de JavaScript
- **Express.js** (v5.1.0) - Framework web
- **MySQL2** (v3.15.3) - Cliente de base de datos
- **JWT** (jsonwebtoken v9.0.2) - Autenticación
- **bcrypt** (v6.0.0) - Encriptación de contraseñas
- **Multer** (v2.0.2) - Manejo de archivos
- **Axios** (v1.13.2) - Cliente HTTP para APIs externas
- **CORS** (v2.8.5) - Control de acceso CORS
- **dotenv** (v17.2.3) - Variables de entorno

### Frontend
- **React** (v18.3.1) - Biblioteca UI
- **TypeScript** (v5.8.3) - Tipado estático
- **Vite** (v5.4.19) - Build tool y dev server
- **React Router** (v6.30.1) - Enrutamiento
- **TanStack Query** (v5.83.0) - Gestión de estado del servidor
- **React Hook Form** (v7.61.1) - Formularios
- **Zod** (v3.25.76) - Validación de esquemas
- **Tailwind CSS** (v3.4.17) - Framework CSS
- **shadcn/ui** - Componentes UI
- **Recharts** (v2.15.4) - Gráficos
- **Lucide React** (v0.462.0) - Iconos
- **date-fns** (v3.6.0) - Manipulación de fechas

### Base de Datos
- **MySQL 8** o **MariaDB** compatible
- **UTF-8** (utf8mb4) para soporte completo de caracteres
- **InnoDB** como motor de almacenamiento

### Servicios Externos
- **RENIEC API** - Consulta de datos de identificación (opcional)

---

## 📁 Estructura del Proyecto

```
hospitalincidencias/
│
├── backend/                    # API REST Backend
│   ├── database/              # Scripts de base de datos
│   │   ├── bd.sql            # Esquema completo de BD
│   │   ├── migrations/       # Migraciones de BD
│   │   └── seed_datos_2025.sql  # Datos iniciales
│   │
│   ├── src/
│   │   ├── app.js            # Punto de entrada de Express
│   │   ├── auth.js           # Middleware de autenticación
│   │   ├── db.js             # Configuración de conexión MySQL
│   │   │
│   │   ├── controllers/      # Controladores (lógica de negocio)
│   │   │   ├── incidencias.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── usuarios.controller.js
│   │   │   ├── analiticas.controller.js
│   │   │   └── ...
│   │   │
│   │   ├── routes/           # Definición de rutas
│   │   │   ├── incidencias.routes.js
│   │   │   ├── auth.routes.js
│   │   │   └── ...
│   │   │
│   │   ├── services/         # Servicios especializados
│   │   │   ├── predicciones.service.js
│   │   │   └── reniec.service.js
│   │   │
│   │   ├── utils/            # Utilidades
│   │   │   ├── codigoIncidencia.js
│   │   │   ├── historial.js
│   │   │   └── notificaciones.js
│   │   │
│   │   ├── middleware/       # Middlewares personalizados
│   │   │   └── upload.js    # Manejo de archivos
│   │   │
│   │   └── scripts/         # Scripts de utilidad
│   │       ├── createAdmin.js
│   │       └── seedIncidencias.js
│   │
│   ├── uploads/              # Archivos subidos
│   ├── package.json
│   └── .env                  # Variables de entorno (no versionado)
│
├── frontend/                  # Aplicación React Frontend
│   ├── public/               # Archivos estáticos
│   │   ├── favicon.ico
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── main.tsx          # Punto de entrada React
│   │   ├── App.tsx           # Componente raíz
│   │   │
│   │   ├── pages/            # Páginas principales
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Incidencias.tsx
│   │   │   ├── CrearIncidencia.tsx
│   │   │   ├── IncidenciaDetalle.tsx
│   │   │   ├── MisIncidencias.tsx
│   │   │   ├── Notificaciones.tsx
│   │   │   ├── Reportes.tsx
│   │   │   ├── Perfil.tsx
│   │   │   └── admin/        # Páginas de administración
│   │   │       ├── Usuarios.tsx
│   │   │       ├── Areas.tsx
│   │   │       ├── TiposIncidencias.tsx
│   │   │       ├── Prioridades.tsx
│   │   │       ├── Analiticas.tsx
│   │   │       └── ...
│   │   │
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── layout/       # Layout y navegación
│   │   │   │   ├── AppSidebar.tsx
│   │   │   │   ├── AppTopbar.tsx
│   │   │   │   └── DashboardLayout.tsx
│   │   │   │
│   │   │   ├── incidencia/   # Componentes de incidencias
│   │   │   │   ├── Timeline.tsx
│   │   │   │   ├── FormularioResolucion.tsx
│   │   │   │   └── IncidenciasRelacionadas.tsx
│   │   │   │
│   │   │   ├── dashboard/    # Componentes del dashboard
│   │   │   │   └── KPICard.tsx
│   │   │   │
│   │   │   └── ui/           # Componentes UI (shadcn/ui)
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       └── ...
│   │   │
│   │   ├── services/         # Servicios de API
│   │   │   ├── auth.service.ts
│   │   │   ├── incidencias.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   └── ...
│   │   │
│   │   ├── contexts/         # Contextos React
│   │   │   └── AuthContext.tsx
│   │   │
│   │   ├── hooks/            # Hooks personalizados
│   │   │   └── use-toast.ts
│   │   │
│   │   └── lib/              # Utilidades
│   │       ├── api.ts        # Cliente HTTP configurado
│   │       └── utils.ts      # Funciones auxiliares
│   │
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── .env                  # Variables de entorno (no versionado)
│
└── README.md                  # Este archivo
```

---

## 📋 Requisitos Previos

Antes de instalar el sistema, asegúrate de tener:

- **Node.js** 18 o superior
  - Recomendado: Instalar con [nvm-windows](https://github.com/coreybutler/nvm-windows) para Windows
  - Verificar versión: `node --version`
- **MySQL** 8.0 o superior (o MariaDB compatible)
  - Servidor MySQL en ejecución
  - Usuario con permisos de creación de base de datos
- **Git** (opcional, para clonar el repositorio)
- **Editor de código** (VS Code recomendado)

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPO>
cd hospitalincidencias
```

### 2. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env  # Si existe, o crear manualmente
```

**Configurar `backend/.env`:**

```env
# Puerto del servidor
PORT=3000

# Base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_contraseña_mysql
DB_NAME=hospital_incidencias

# JWT Secret (cambiar por una clave segura)
JWT_SECRET=tu_clave_secreta_super_segura_aqui

# URLs públicas
PUBLIC_URL=http://localhost:3000
PUBLIC_URL_FRONT=http://localhost:5173

# RENIEC API (opcional)
TOKEN_API_DOCUMENT_MYDEVS=tu_token
KEY_API_DOCUMENT_MYDEVS=tu_key
```

### 3. Configurar la Base de Datos

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script de creación
source backend/database/bd.sql

# (Opcional) Ejecutar datos iniciales
source backend/database/seed_datos_2025.sql
```

### 4. Crear Usuario Administrador

```bash
cd backend
npm run create-admin
```

Este script te pedirá:
- Nombre del administrador
- Email
- Contraseña
- Tipo de administrador (ti o general)

### 5. Configurar el Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env  # Si existe, o crear manualmente
```

**Configurar `frontend/.env`:**

```env
VITE_API_URL=http://localhost:3000/
```

### 6. Iniciar los Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

El backend estará disponible en `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### 7. Verificar la Instalación

- **Backend Health Check**: `http://localhost:3000/api/health`
- **DB Health Check**: `http://localhost:3000/api/health/db`
- **Frontend**: Abrir `http://localhost:5173` en el navegador

---

## 👥 Roles y Permisos

El sistema define los siguientes roles con permisos específicos:

### 🔴 Administrador TI (`administrador` + `tipo_admin: 'ti'`)
- **Gestión completa de incidencias**:
  - Ver todas las incidencias
  - Asignar responsables
  - Reasignar incidencias
  - Resolver incidencias
  - Validar resoluciones
- **Gestión de usuarios técnicos**
- **Configuración de áreas y servicios**
- **Acceso a analíticas y reportes**

### 🟡 Administrador General (`administrador` + `tipo_admin: 'general'`)
- **Visualización de todas las incidencias**
- **Acceso completo a analíticas y reportes**
- **Gestión de usuarios generales**
- **Configuración de catálogos** (tipos, prioridades)
- **No puede resolver incidencias técnicas**

### 🟢 Médico (`rol: 'medico'`)
- **Crear incidencias**
- **Ver incidencias propias y del área**
- **Comentar en incidencias**
- **Ver dashboard con estadísticas del área**
- **No puede resolver incidencias**

### 🔵 Enfermero (`rol: 'enfermero'`)
- **Crear incidencias**
- **Ver incidencias propias y del área**
- **Comentar en incidencias**
- **Ver dashboard con estadísticas del área**
- **No puede resolver incidencias**

### 🟣 Técnico (`rol: 'tecnico'`)
- **Ver incidencias asignadas**
- **Resolver incidencias asignadas**
- **Comentar en incidencias**
- **Actualizar estado de incidencias asignadas**

### ⚪ Usuario (`rol: 'usuario'`)
- **Crear incidencias**
- **Ver incidencias propias**
- **Comentar en incidencias propias**
- **Acceso limitado al dashboard**

---

## 🔧 Funcionalidades Detalladas

### Gestión de Incidencias

#### Crear Incidencia
1. Acceder a "Crear Incidencia" desde el menú
2. Completar formulario:
   - **Título**: Descripción breve
   - **Descripción**: Detalles completos
   - **Área**: Área del hospital afectada
   - **Servicio** (opcional): Servicio específico
   - **Tipo**: Categoría de incidencia
   - **Subtipo** (opcional): Especificación adicional
   - **Prioridad**: P1 (Crítica) a P4 (Baja)
   - **Ubicación**: Piso, habitación, cama
   - **Equipo**: Equipo médico afectado
   - **Paciente** (opcional): Código de paciente
3. El sistema genera automáticamente:
   - Código único (ej: `INC-2025-0001`)
   - Fecha de vencimiento según SLA de prioridad
   - Asignación inicial (si aplica)

#### Ver Incidencias
- **Listado general**: Todas las incidencias (según permisos)
- **Mis incidencias**: Solo las creadas por el usuario
- **Filtros disponibles**:
  - Por área
  - Por estado (abierta, en_progreso, resuelta, cerrada)
  - Por prioridad
  - Por tipo
  - Por fecha
  - Búsqueda por texto

#### Detalle de Incidencia
Cada incidencia muestra:
- **Información completa**: Título, descripción, área, tipo, prioridad
- **Ubicación**: Piso, habitación, cama, equipo
- **Responsables**: Quien reportó y quien está asignado
- **Fechas**: Creación, actualización, vencimiento, resolución
- **Timeline**: Historial completo de cambios
- **Comentarios**: Conversación sobre la incidencia
- **Archivos adjuntos**: Evidencias y documentación
- **Incidencias relacionadas**: Similares o relacionadas
- **Estado del SLA**: Tiempo restante o vencido

#### Resolver Incidencia
Solo disponible para responsables asignados o administradores TI:
1. Acceder al detalle de la incidencia
2. Hacer clic en "Resolver"
3. Completar formulario de resolución:
   - **Solución aplicada**: Descripción de la solución
   - **Pasos seguidos**: Proceso detallado
   - **Recursos utilizados** (opcional): Materiales, herramientas
   - **Tiempo invertido**: En minutos
4. La incidencia cambia a estado "Resuelta"
5. El reportante puede validar la resolución

### Dashboard

El dashboard muestra métricas en tiempo real:

#### KPIs Principales
- **Total de incidencias**: Contador general
- **Incidencias abiertas**: Pendientes de resolver
- **Incidencias resueltas**: Completadas
- **Tiempo promedio**: Tiempo de resolución promedio

#### Gráficos
- **Distribución por tipo**: Gráfico de barras
- **Distribución por prioridad**: Gráfico circular
- **Tendencias temporales**: Línea de tiempo
- **Incidencias por área**: Comparativa

#### Filtros
- Período de tiempo (últimos 7, 30, 90 días, año)
- Por área
- Por tipo de incidencia

### Analíticas y Reportes

#### Predicciones
- **Predicciones mensuales**: Estimación del próximo mes
- **Predicciones trimestrales**: Estimación del próximo trimestre
- **Predicciones anuales**: Estimación del próximo año
- **Métricas de impacto**:
  - Personas afectadas estimadas
  - Pacientes afectados estimados
  - Costo estimado de resolución
  - Tiempo de atención perdido
  - Personal necesario

#### Reportes
- **Reportes por área**: Estadísticas por departamento
- **Reportes por tipo**: Análisis por categoría
- **Reportes de cumplimiento SLA**: Tiempos de resolución
- **Exportación**: Preparado para exportar a PDF/Excel

### Notificaciones

El sistema envía notificaciones automáticas para:
- **Asignación de incidencia**: Cuando se asigna una incidencia
- **Cambio de estado**: Cuando cambia el estado
- **Nuevos comentarios**: Cuando alguien comenta
- **Vencimiento de SLA**: Alertas de vencimiento próximo
- **Resolución**: Notificación al reportante

Las notificaciones se muestran en:
- **Badge en el menú**: Contador de no leídas
- **Página de notificaciones**: Lista completa
- **Toasts**: Notificaciones emergentes

### Gestión de Usuarios (Admin)

- **Crear usuarios**: Con rol y área asignada
- **Editar usuarios**: Modificar información y permisos
- **Desactivar usuarios**: Sin eliminar datos históricos
- **Asignar áreas**: Asignar usuarios a áreas
- **Gestionar responsables**: Asignar responsables de áreas

### Gestión de Áreas (Admin)

- **Crear áreas**: Con código único y nombre
- **Asignar responsable**: Usuario responsable del área
- **Gestionar servicios**: Servicios dentro de cada área
- **Activar/desactivar**: Control de áreas activas

### Catálogos (Admin)

#### Tipos de Incidencias
- **Crear tipos**: Con categoría, color e icono
- **Gestionar subtipos**: Especificaciones adicionales
- **Activar/desactivar**: Control de tipos disponibles

#### Prioridades
- **Configurar niveles**: P1, P2, P3, P4
- **Tiempos de respuesta**: En minutos
- **Tiempos de resolución**: En horas
- **Colores**: Para identificación visual

---

## 🌐 API Endpoints

### Autenticación

```
POST   /api/auth/login          # Iniciar sesión
POST   /api/auth/register       # Registrar nuevo usuario (si está habilitado)
GET    /api/auth/me             # Obtener usuario actual
POST   /api/auth/refresh        # Renovar token
POST   /api/auth/logout         # Cerrar sesión
```

### Incidencias

```
GET    /api/incidencias                    # Listar incidencias (con filtros)
GET    /api/incidencias/:codigo            # Obtener incidencia por código
POST   /api/incidencias                    # Crear nueva incidencia
PUT    /api/incidencias/:codigo            # Actualizar incidencia
PATCH  /api/incidencias/:codigo/estado     # Cambiar estado
PATCH  /api/incidencias/:codigo/prioridad  # Cambiar prioridad
PATCH  /api/incidencias/:codigo/reasignar  # Reasignar responsable
POST   /api/incidencias/:codigo/resolver   # Resolver incidencia
GET    /api/incidencias/mis-incidencias    # Incidencias del usuario
GET    /api/incidencias/:codigo/relacionadas # Incidencias relacionadas
GET    /api/incidencias/relacionadas       # Buscar incidencias relacionadas
```

### Comentarios

```
GET    /api/incidencias/:codigo/comentarios  # Listar comentarios
POST   /api/incidencias/:codigo/comentarios  # Crear comentario
PUT    /api/incidencias/:codigo/comentarios/:id  # Editar comentario
DELETE /api/incidencias/:codigo/comentarios/:id  # Eliminar comentario
```

### Archivos

```
GET    /api/incidencias/:codigo/archivos     # Listar archivos
POST   /api/incidencias/:codigo/archivos    # Subir archivo
GET    /api/incidencias/:codigo/archivos/:id # Descargar archivo
DELETE /api/incidencias/:codigo/archivos/:id # Eliminar archivo
```

### Historial

```
GET    /api/incidencias/:codigo/historial    # Obtener timeline/historial
```

### Dashboard

```
GET    /api/dashboard/estadisticas          # KPIs principales
GET    /api/dashboard/tendencias            # Tendencias temporales
GET    /api/dashboard/distribuciones/:tipo  # Distribuciones (tipo/prioridad)
```

### Catálogos

```
GET    /api/catalogos/areas                 # Listar áreas
GET    /api/catalogos/tipos                 # Listar tipos de incidencias
GET    /api/catalogos/prioridades           # Listar prioridades
GET    /api/catalogos/servicios             # Listar servicios por área
```

### Usuarios (Admin)

```
GET    /api/admin/usuarios                  # Listar usuarios
GET    /api/admin/usuarios/:id              # Obtener usuario
POST   /api/admin/usuarios                 # Crear usuario
PUT    /api/admin/usuarios/:id             # Actualizar usuario
DELETE /api/admin/usuarios/:id             # Eliminar usuario
```

### Áreas (Admin)

```
GET    /api/admin/areas                     # Listar áreas
POST   /api/admin/areas                    # Crear área
PUT    /api/admin/areas/:id                # Actualizar área
DELETE /api/admin/areas/:id                # Eliminar área
```

### Prioridades (Admin)

```
GET    /api/admin/prioridades               # Listar prioridades
POST   /api/admin/prioridades              # Crear prioridad
PUT    /api/admin/prioridades/:id          # Actualizar prioridad
DELETE /api/admin/prioridades/:id          # Eliminar prioridad
```

### Tipos (Admin)

```
GET    /api/admin/tipos                     # Listar tipos
POST   /api/admin/tipos                    # Crear tipo
PUT    /api/admin/tipos/:id                # Actualizar tipo
DELETE /api/admin/tipos/:id                # Eliminar tipo
```

### Notificaciones

```
GET    /api/notificaciones                  # Listar notificaciones
GET    /api/notificaciones/no-leidas        # Contar no leídas
PATCH  /api/notificaciones/:id/leer         # Marcar como leída
DELETE /api/notificaciones/:id             # Eliminar notificación
```

### Analíticas

```
GET    /api/analiticas/predicciones         # Obtener predicciones
GET    /api/analiticas/reportes            # Generar reportes
```

### Admin TI

```
GET    /api/admin-ti/asignaciones          # Gestión de asignaciones
POST   /api/admin-ti/asignar              # Asignar incidencia
GET    /api/admin-ti/estadisticas          # Estadísticas de asignaciones
```

### Health Checks

```
GET    /api/health                         # Estado del servidor
GET    /api/health/db                     # Estado de la base de datos
```

---

## 🗄️ Base de Datos

### Esquema Principal

#### Tablas Principales

**usuarios**
- Almacena información de usuarios del sistema
- Campos: id, nombre, email, password (hash), area_id, rol, tipo_admin, activo

**areas**
- Áreas y departamentos del hospital
- Campos: id, codigo, nombre, responsable_id, activo

**servicios**
- Servicios específicos dentro de áreas
- Campos: id, area_id, nombre, descripcion, activo

**prioridades**
- Niveles de prioridad con configuración de SLA
- Campos: id, nivel (P1-P4), nombre, color, tiempo_respuesta_minutos, tiempo_resolucion_horas

**tipos_incidencias**
- Tipos principales de incidencias
- Campos: id, nombre, categoria, color, icono

**subtipos_incidencias**
- Subtipos dentro de tipos
- Campos: id, tipo_incidencia_id, nombre, descripcion

**incidencias**
- Entidad principal del sistema
- Campos: id, codigo, titulo, descripcion, area_id, servicio_id, tipo_incidencia_id, subtipo_incidencia_id, prioridad_id, estado, reportado_por_id, responsable_id, piso, habitacion, cama, equipo, paciente_id, fecha_creacion, fecha_vencimiento, fecha_resolucion, fecha_cierre

**resoluciones_incidencias**
- Detalles de resolución de incidencias
- Campos: id, incidencia_id, solucion_aplicada, pasos_seguidos, recursos_utilizados, tiempo_invertido_minutos, resuelto_por_id, validado_por_id, fecha_resolucion, fecha_validacion

**comentarios_incidencias**
- Comentarios en incidencias
- Campos: id, incidencia_id, usuario_id, comentario, fecha_creacion

**archivos_incidencias**
- Archivos adjuntos a incidencias
- Campos: id, incidencia_id, usuario_id, nombre_archivo, ruta_archivo, tipo_archivo, tamano_bytes, fecha_subida

**historial_incidencias**
- Timeline/historial de cambios
- Campos: id, incidencia_id, tipo_evento, usuario_id, descripcion, estado_previo, estado_nuevo, fecha_evento

**notificaciones**
- Notificaciones para usuarios
- Campos: id, usuario_id, incidencia_id, tipo, titulo, mensaje, leida, fecha_creacion

**predicciones_incidencias**
- Predicciones basadas en datos históricos
- Campos: id, tipo_incidencia_id, area_id, periodo, fecha_prediccion, fecha_periodo_inicio, fecha_periodo_fin, probabilidad, personas_afectadas_estimadas, pacientes_afectados_estimados, departamento_predicho, metadatos

### Relaciones

- `usuarios.area_id` → `areas.id`
- `areas.responsable_id` → `usuarios.id`
- `servicios.area_id` → `areas.id`
- `incidencias.area_id` → `areas.id`
- `incidencias.reportado_por_id` → `usuarios.id`
- `incidencias.responsable_id` → `usuarios.id`
- `incidencias.tipo_incidencia_id` → `tipos_incidencias.id`
- `incidencias.prioridad_id` → `prioridades.id`
- `resoluciones_incidencias.incidencia_id` → `incidencias.id`
- `comentarios_incidencias.incidencia_id` → `incidencias.id`
- `archivos_incidencias.incidencia_id` → `incidencias.id`
- `historial_incidencias.incidencia_id` → `incidencias.id`
- `notificaciones.incidencia_id` → `incidencias.id`

### Índices

El esquema incluye índices optimizados para:
- Búsquedas por email, área, rol
- Filtros por estado, prioridad, tipo
- Consultas por fecha
- Búsquedas de texto

---

## 📜 Scripts Disponibles

### Backend

```bash
# Iniciar servidor en modo producción
npm start

# Crear usuario administrador
npm run create-admin

# Seed de datos de ejemplo (incidencias)
npm run seed-incidencias
```

### Frontend

```bash
# Servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de build de producción
npm run preview

# Linter
npm run lint
```

---

## 🚢 Despliegue

### Preparación para Producción

1. **Variables de entorno**:
   - Configurar `.env` con valores de producción
   - Cambiar `JWT_SECRET` por una clave segura
   - Configurar URLs públicas correctas

2. **Base de datos**:
   - Crear base de datos en servidor de producción
   - Ejecutar migraciones
   - Configurar backups automáticos

3. **Frontend**:
   ```bash
   cd frontend
   npm run build
   ```
   - Los archivos compilados estarán en `frontend/dist/`
   - Servir con Nginx, Apache o similar

4. **Backend**:
   - Usar PM2 o similar para mantener el proceso activo
   - Configurar reverse proxy (Nginx)
   - Configurar SSL/HTTPS

### Recomendaciones de Seguridad

- ✅ Usar HTTPS en producción
- ✅ Configurar CORS correctamente
- ✅ Validar todas las entradas
- ✅ Implementar rate limiting
- ✅ Configurar logs de seguridad
- ✅ Realizar backups regulares
- ✅ Mantener dependencias actualizadas

---

## 📝 Notas Adicionales

### Integración RENIEC

El sistema incluye integración opcional con la API de RENIEC para consulta de datos de identificación. Para habilitarla:

1. Configurar variables de entorno:
   ```env
   TOKEN_API_DOCUMENT_MYDEVS=tu_token
   KEY_API_DOCUMENT_MYDEVS=tu_key
   ```

2. El servicio está disponible en `backend/src/services/reniec.service.js`

### Códigos de Incidencia

Los códigos se generan automáticamente con el formato:
- `INC-YYYY-NNNN`
- Ejemplo: `INC-2025-0001`, `INC-2025-0002`

### SLAs por Prioridad

- **P1 (Crítica)**: 15 min respuesta, 2 horas resolución
- **P2 (Alta)**: 30 min respuesta, 4 horas resolución
- **P3 (Media)**: 120 min respuesta, 24 horas resolución
- **P4 (Baja)**: 240 min respuesta, 72 horas resolución

Estos valores son configurables desde la gestión de prioridades.