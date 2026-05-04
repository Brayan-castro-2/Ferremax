# ⚙️ FERREMAS — Sistema E-Commerce de Ferretería

> Plataforma e-commerce para ferretería con gestión multi-rol, desarrollada en Vue 3 + Vite + Supabase.

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3 (Composition API) + Vite |
| Estado global | Pinia |
| Ruteo | Vue Router 4 |
| Base de datos | Supabase (PostgreSQL) |
| Despliegue | Vercel |

## 🏗️ Arquitectura

```
Capa de Presentación (Vue 3)
        ↕
Capa de Lógica de Negocio (Orquestadores)
        ↕
Capa de Datos (Supabase)
```

### Roles del Sistema

| Rol | Permisos |
|-----|---------|
| 👑 Administrador | Acceso total, gestión de usuarios |
| 💼 Vendedor | Gestión de pedidos y estados |
| 📦 Bodeguero | Control de inventario y stock |
| 💰 Contador | Excepciones financieras y reportes |
| 🛒 Cliente | Catálogo, carrito, mis pedidos |

## ⚡ Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo (mockup, sin Supabase)
npm run dev

# Build para producción
npm run build
```

## 🔑 Configuración de Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_APP_MODE=production
```

> En modo `mockup` (valor por defecto), el sistema funciona sin Supabase con datos simulados.

## 🧪 Usuarios de Prueba (Modo Mockup)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@ferremas.cl | 12345 | Administrador |
| vendedor@ferremas.cl | 12345 | Vendedor |
| bodeguero@ferremas.cl | 12345 | Bodeguero |
| contador@ferremas.cl | 12345 | Contador |
| cliente@ferremas.cl | 12345 | Cliente |

## 📁 Estructura del Proyecto

```
src/
├── assets/         # CSS global y design system
├── components/     # Componentes reutilizables (NavBar, ProductCard)
├── lib/            # Cliente Supabase
├── modelos/        # Definiciones de tipos (TiposDeDatos.js)
├── orquestadores/  # Lógica de negocio (OrquestadorDePedidos.js)
├── router/         # Configuración de rutas
├── servicios/      # Capa de datos Supabase (ServiciosSupabase.js)
├── stores/         # Stores Pinia (auth, carrito)
├── views/          # Vistas por rol
│   └── roles/      # Admin, Vendedor, Bodeguero, Contador
├── App.vue
└── main.js
```

## 📦 Reglas de Negocio Implementadas

- ✅ Descuento automático 10% para pedidos con más de 4 artículos
- ✅ Reserva lógica (Soft-Reservation) con TTL de 15 minutos
- ✅ Stock disponible como Única Fuente de Verdad
- ✅ Manejo de excepciones: Pago Rechazado / TTL Expirado
- ✅ Ciclo de vida del pedido: Pendiente → Pagado → Preparado → Despachado

## 🌐 Despliegue en Vercel

El proyecto incluye `vercel.json` para soporte de SPA routing.

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Configura las variables de entorno en Vercel Settings
3. Deploy automático en cada push a `main`

---

*Proyecto académico — Ingeniería en Informática*
