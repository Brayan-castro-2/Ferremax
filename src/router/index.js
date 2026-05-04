import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

// Views - lazy loaded
const LoginView        = () => import('@/views/LoginView.vue')
const CatalogoView     = () => import('@/views/CatalogoView.vue')
const CarritoView      = () => import('@/views/CarritoView.vue')
const DashboardView    = () => import('@/views/DashboardView.vue')
const MisPedidosView   = () => import('@/views/MisPedidosView.vue')
const AdminView        = () => import('@/views/roles/AdminView.vue')
const VendedorView     = () => import('@/views/roles/VendedorView.vue')
const BodegueroView    = () => import('@/views/roles/BodegueroView.vue')
const ContadorView     = () => import('@/views/roles/ContadorView.vue')
const NotFoundView     = () => import('@/views/NotFoundView.vue')

const routes = [
  {
    path: '/',
    redirect: '/catalogo'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true, title: 'Iniciar Sesión' }
  },
  {
    path: '/catalogo',
    name: 'Catalogo',
    component: CatalogoView,
    meta: { public: true, title: 'Catálogo de Productos' }
  },
  {
    path: '/carrito',
    name: 'Carrito',
    component: CarritoView,
    meta: { requiresAuth: true, roles: ['Cliente'], title: 'Mi Carrito' }
  },
  {
    path: '/mis-pedidos',
    name: 'MisPedidos',
    component: MisPedidosView,
    meta: { requiresAuth: true, roles: ['Cliente'], title: 'Mis Pedidos' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, title: 'Dashboard' }
  },
  // Panel Administrador
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true, roles: ['Administrador'], title: 'Panel Administrador' }
  },
  // Panel Vendedor
  {
    path: '/vendedor',
    name: 'Vendedor',
    component: VendedorView,
    meta: { requiresAuth: true, roles: ['Vendedor', 'Administrador'], title: 'Panel Vendedor' }
  },
  // Panel Bodeguero
  {
    path: '/bodeguero',
    name: 'Bodeguero',
    component: BodegueroView,
    meta: { requiresAuth: true, roles: ['Bodeguero', 'Administrador'], title: 'Panel Bodeguero' }
  },
  // Panel Contador
  {
    path: '/contador',
    name: 'Contador',
    component: ContadorView,
    meta: { requiresAuth: true, roles: ['Contador', 'Administrador'], title: 'Panel Contador' }
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { public: true, title: 'Página no encontrada' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Guard de navegación global
router.beforeEach((to, from, next) => {
  // Actualizar título de la página
  document.title = `${to.meta.title || 'FERREMAS'} | FERREMAS`

  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.rol

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router
