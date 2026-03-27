# Clínica+ — Sistema de Agenda de Citas

![Clínica+](https://img.shields.io/badge/Cl%C3%ADnica+-Teal-0D9488?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=flat-square&logo=vercel)

> Sistema de agenda de citas para clínicas, spas y consultorios en Latinoamérica. Diseñado para el contexto colombiano con soporte offline.

## 🚀 Demo

**Producción:** https://clinic-plus.vercel.app

## ✨ Features

### Gestión de Servicios
- ✅ Crear, editar y eliminar servicios
- ✅ Nombre, duración (minutos) y precio (COP)
- ✅ 8 colores disponibles para identificación visual

### Gestión de Clientes
- ✅ Registro de clientes con nombre, teléfono y email
- ✅ Historial de citas por cliente
- ✅ Link directo a WhatsApp

### Agenda/Calendario
- ✅ Vista semanal con navegación
- ✅ Citas por hora con drag & drop
- ✅ Color por servicio
- ✅ Estados: confirmada, cancelada, completada

### Booking Público
- ✅ Link público para reservas (vista "Reservar")
- ✅ Wizard de 3 pasos: servicio → fecha/hora → datos
- ✅ Cálculo automático de disponibilidad

### Dashboard
- ✅ Ingresos del día, semana y mes
- ✅ Citas por período
- ✅ Servicios más populares
- ✅ Estadísticas rápidas

### Notificaciones (Mock)
- ✅ Preview del mensaje WhatsApp
- ✅ Confirmación y recordatorio de citas

## 🛠️ Tech Stack

| Tecnología | Uso |
|------------|-----|
| React 19 | Framework UI |
| Vite 8 | Build tool |
| Tailwind CSS 3 | Estilos |
| date-fns | Fechas (locale es-CO) |
| localStorage | Persistencia (sin backend) |
| Vercel | Hosting |

## 📁 Estructura del Proyecto

```
clinic-plus/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx          # Navegación lateral
│   │   ├── Calendar.jsx         # Vista semanal con drag & drop
│   │   ├── ServiceList.jsx      # CRUD de servicios
│   │   ├── ClientList.jsx       # CRUD de clientes
│   │   ├── BookingForm.jsx      # Formulario público de reservas
│   │   ├── Dashboard.jsx        # Estadísticas y métricas
│   │   └── AppointmentModal.jsx # Modal para crear/editar citas
│   ├── hooks/
│   │   ├── useLocalStorage.js   # Hook genérico para localStorage
│   │   └── useAppointments.js   # Hooks específicos por entidad
│   ├── utils/
│   │   ├── formatCurrency.js    # Formateo COP
│   │   └── generateId.js        # Generador de IDs
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## 💾 Datos (localStorage)

| Key | Descripción |
|-----|-------------|
| `clinic-services` | Array de servicios |
| `clinic-clients` | Array de clientes |
| `clinic-appointments` | Array de citas |
| `clinic-config` | Configuración general |

## 🚀 Deploy

```bash
# 1. Instalar dependencias
npm install

# 2. Desarrollo local
npm run dev

# 3. Build para producción
npm run build

# 4. Preview del build
npm run preview
```

El deploy a Vercel se hace automáticamente desde GitHub.

## 📱 URLs de Vistas

| Vista | Descripción |
|-------|-------------|
| `/` (dashboard) | Dashboard principal |
| `#calendar` | Agenda semanal |
| `#services` | Gestión de servicios |
| `#clients` | Gestión de clientes |
| `#booking` | Formulario público de reservas |

## 🎨 Design System

- **Primary:** Teal `#0D9488`
- **Background:** Slate `#F8FAFC`
- **Typography:** Inter (Google Fonts)
- **Border Radius:** 8px cards, 12px modals
- **Mobile-first:** Responsive grids

## 📋 Requisitos para Empezar

1. Crear servicios desde el panel "Servicios"
2. Registrar clientes desde "Clientes"
3. Agendar citas desde "Agenda"
4. Compartir link de "Reservar" con clientes

## 🔮 Roadmap

- [ ] Autenticación de usuarios
- [ ] Base de datos backend (Supabase/Firebase)
- [ ] Notificaciones reales por WhatsApp (API)
- [ ] App móvil (React Native)
- [ ] Reportes avanzados (PDF/Excel)
- [ ] Integración con pasarelas de pago

## 📄 Licencia

MIT © 2026 Clínica+

---

Built with ❤️ for Latinoamérica
