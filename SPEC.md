# Clínica+ — Specification

## 1. Concept & Vision

**Clínica+** es un sistema de gestión de citas diseñado específicamente para clínicas pequeñas y medianas en Latinoamérica (con enfoque en Colombia). Combina la simplicidad de una agenda tradicional con la potencia de un sistema profesional, todo accesible desde el navegador sin necesidad de backend. El diferenciador clave: funciona offline vía localStorage, está pensado para el contexto colombiano (COP, horarios de Colombia), y prioriza la integración con WhatsApp como canal de comunicación principal.

**Audiencia:** Dueños de clínicas, spas, consultorios médicos y de bienestar en Colombia que necesitan digitalizar su agenda sin invertir en sistemas complejos o costosos.

---

## 2. Design Language

### Aesthetic Direction
Minimalismo clínico profesional. Inspirado en interfaces de sistemas médicos premium — limpio, espacioso, funcional. La sensación es de confianza y profesionalismo sin ser frío.

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Primary | Teal | `#0D9488` |
| Primary Dark | Teal 700 | `#0F766E` |
| Primary Light | Teal 50 | `#F0FDFA` |
| Background | Slate 50 | `#F8FAFC` |
| Surface | White | `#FFFFFF` |
| Text Primary | Slate 800 | `#1E293B` |
| Text Secondary | Slate 500 | `#64748B` |
| Border | Slate 200 | `#E2E8F0` |
| Success | Green 600 | `#16A34A` |
| Error | Red 500 | `#EF4444` |

### Typography
- **Font Family:** Inter (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700
- **Fallback:** system-ui, sans-serif

### Spatial System
- Base unit: 4px
- Common spacing: 8px, 12px, 16px, 24px, 32px, 48px
- Border radius: 8px (cards), 12px (modals), 9999px (pills)
- Shadows: Subtle, layered (shadow-sm, shadow-md)

### Motion Philosophy
- Transitions: 150ms ease for interactions, 200ms for page transitions
- Hover states: Subtle scale or shadow increase
- Modal: Fade in/out with slight scale

### Visual Assets
- Emoji icons for quick recognition (📅, 💆, 👥, 📊)
- Color-coded services for visual distinction in calendar
- No external icon library needed at MVP stage

---

## 3. Layout & Structure

### Page Structure
- **Sidebar** (fixed left, 256px): Navigation between main views
- **Main content area** (fluid): Shows active view
- **No topbar** — minimal chrome for maximum content space

### Views
1. **Dashboard** — Stats overview with revenue and appointment metrics
2. **Agenda** — Weekly calendar with time slots
3. **Servicios** — CRUD for services
4. **Clientes** — CRUD for clients with appointment history
5. **Reservar** — Public booking flow (3-step wizard)

### Responsive Strategy
- Mobile-first design
- Sidebar collapses on mobile (hamburger menu future enhancement)
- Calendar becomes scrollable horizontally on small screens
- Grid layouts adapt from 1 → 2 → 3 columns

---

## 4. Features & Interactions

### 4.1 Gestión de Servicios
- **Crear:** Modal/form with name, duration (min), price (COP), color picker
- **Editar:** Same form pre-populated
- **Eliminar:** Confirmation dialog
- **Colores:** 8 predefined colors for visual distinction
- **Validación:** Name required, duration 10-480 min, price ≥ 0

### 4.2 Gestión de Clientes
- **Campos:** Nombre, teléfono (WhatsApp), email
- **Historial:** Muestra cantidad de citas asociadas
- **WhatsApp link:** Genera link directo a wa.me con número
- **Validación:** Nombre requerido, teléfono formato libre

### 4.3 Agenda/Calendario
- **Vista:** Semanal, de lunes a domingo
- **Navegación:** Flechas para cambiar semana, botón "Hoy"
- **Slots:** Cada hora desde hora inicio hasta hora fin (configurable)
- **Click en slot:** Abre modal de nueva cita
- **Drag & drop:** Citas se pueden arrastrar entre slots
- **Color por servicio:** Cada cita muestra el color del servicio
- **Estados:** confirmed, cancelled, completed (visual distinction)
- **Click en cita existente:** Abre modal de edición

### 4.4 Booking Público (Reservar)
- **Paso 1:** Seleccionar servicio (grid de cards)
- **Paso 2:** Seleccionar fecha (calendario 14 días) y hora disponible
- **Paso 3:** Ingresar datos del cliente (nombre, teléfono, email)
- **Confirmación:** Pantalla de éxito con detalles de la cita
- **Disponibilidad:** Calcula slots disponibles restando citas existentes

### 4.5 Dashboard
- **Cards de stats:** Citas hoy/semana/mes con ingresos
- **Ingresos:** Día, semana, mes en COP formateado
- **Servicios populares:** Bar chart horizontal con top 5
- **Resumen rápido:** Tasa de ocupación, ticket promedio

### 4.6 Notificaciones (Mock)
- **Botones:** "Confirmar cita" y "Recordar cita" (WhatsApp)
- **Acción:** Abre wa.me con mensaje prellenado
- **Preview:** Muestra el texto del mensaje que se enviaría
- **Solo funciona si:** Cliente tiene teléfono registrado

---

## 5. Component Inventory

### Sidebar
- Logo/nombre de app en header
- 5 botones de navegación con emoji + texto
- Estado activo: bg-teal-600 text-white
- Hover: bg-slate-800 text-white

### ServiceList
- Grid responsive de cards de servicio
- Cada card: color dot, nombre, duración, precio
- Botones editar/eliminar en hover
- Formulario inline para crear/editar

### ClientList
- Grid responsive de cards de cliente
- Avatar con inicial
- Info de contacto con links (WhatsApp, email)
- Contador de citas

### Calendar
- Header con navegación de semana
- Grid 8 columnas (hora + 7 días)
- Slots interactivos con citas
- Citas draggeables con color de servicio
- Today highlight: bg-teal-50

### AppointmentModal
- Overlay oscuro
- Card centrada con max-height scroll
- Formulario de cita (servicio, cliente, fecha, hora, notas)
- Botones de acción: guardar, completar, cancelar, eliminar
- Sección de WhatsApp mock al final

### BookingForm
- Wizard de 3 pasos con indicadores
- Progress bar visual
- Paso 1: Grid de servicios
- Paso 2: Calendario de fechas + grid de horas
- Paso 3: Formulario de datos
- Pantalla de confirmación final

### Dashboard
- 4 summary cards en grid
- Bar chart para servicios populares
- Lista de stats adicionales

---

## 6. Technical Approach

### Framework
- **React 19** con Vite 8
- **Tailwind CSS 3** para estilos
- **date-fns** para manipulación de fechas (locale es)

### Data Storage
- **localStorage** como backend local
- Keys:
  - `clinic-services`: Array de servicios
  - `clinic-clients`: Array de clientes
  - `clinic-appointments`: Array de citas
  - `clinic-config`: Configuración general

### State Management
- Custom hooks (`useLocalStorage`, `useServices`, `useClients`, `useAppointments`, `useConfig`)
- React useState/useEffect
- No external state library needed for MVP

### Schemas

```typescript
// Service
{
  id: string,
  name: string,
  duration: number, // minutos
  price: number, // COP
  color: string, // tailwind class
  createdAt: number
}

// Client
{
  id: string,
  name: string,
  phone: string,
  email: string,
  createdAt: number
}

// Appointment
{
  id: string,
  clientId: string,
  serviceId: string,
  date: string, // "YYYY-MM-DD"
  time: string, // "HH:MM"
  duration: number,
  status: "confirmed" | "cancelled" | "completed",
  notes: string,
  createdAt: number
}

// Config
{
  clinicName: string,
  startHour: number, // 7
  endHour: number, // 19
  slotDuration: number // 30
}
```

### Deployment
- **Vercel** — Static site (SPA)
- `vercel.json` para configuración de routing
- Build command: `npm run build`
- Output: `dist/`

### File Structure
```
src/
  components/
    Sidebar.jsx
    Calendar.jsx
    ServiceList.jsx
    ClientList.jsx
    BookingForm.jsx
    Dashboard.jsx
    AppointmentModal.jsx
  hooks/
    useLocalStorage.js
    useAppointments.js
  utils/
    formatCurrency.js
    generateId.js
  App.jsx
  main.jsx
  index.css
```
