import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/auth/RegisterView.vue')
const ForgotPasswordView = () => import('@/views/auth/ForgotPasswordView.vue')
const ResetPasswordView = () => import('@/views/auth/ResetPasswordView.vue')
const CatalogoView = () => import('@/views/CatalogoView.vue')
const CarritoView = () => import('@/views/CarritoView.vue')
const CheckoutView = () => import('@/views/CheckoutView.vue')
const ProductoDetailView = () => import('@/views/ProductoDetailView.vue')
const PedidoConfirmacionView = () => import('@/views/PedidoConfirmacionView.vue')
const MisPedidosView = () => import('@/views/MisPedidosView.vue')
const PedidoDetalleView = () => import('@/views/PedidoDetalleView.vue')
const PerfilView = () => import('@/views/PerfilView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const AdminView = () => import('@/views/roles/AdminView.vue')
const VendedorView = () => import('@/views/roles/VendedorView.vue')
const BodegueroView = () => import('@/views/roles/BodegueroView.vue')
const ContadorView = () => import('@/views/roles/ContadorView.vue')
const SucursalesView = () => import('@/views/SucursalesView.vue')
const StockSucursalView = () => import('@/views/StockSucursalView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

const routes = [
  { path: '/', name: 'Home', component: HomeView, meta: { public: true, title: 'Inicio' } },
  { path: '/login', name: 'Login', component: LoginView, meta: { public: true, guestOnly: true, title: 'Iniciar sesión' } },
  { path: '/registro', name: 'Register', component: RegisterView, meta: { public: true, guestOnly: true, title: 'Crear cuenta' } },
  { path: '/recuperar', name: 'ForgotPassword', component: ForgotPasswordView, meta: { public: true, guestOnly: true, title: 'Recuperar acceso' } },
  { path: '/restablecer', name: 'ResetPassword', component: ResetPasswordView, meta: { public: true, title: 'Nueva contraseña' } },
  { path: '/catalogo', name: 'Catalogo', component: CatalogoView, meta: { public: true, title: 'Catálogo' } },
  { path: '/producto/:id', name: 'ProductoDetail', component: ProductoDetailView, meta: { public: true, title: 'Producto' } },
  { path: '/carrito', name: 'Carrito', component: CarritoView, meta: { public: true, title: 'Carrito' } },
  { path: '/checkout', name: 'Checkout', component: CheckoutView, meta: { public: true, title: 'Checkout' } },
  { path: '/pedido-confirmacion', name: 'PedidoConfirmacion', component: PedidoConfirmacionView, meta: { requiresAuth: true, roles: ['Cliente'], title: 'Pedido confirmado' } },
  { path: '/mis-pedidos', name: 'MisPedidos', component: MisPedidosView, meta: { requiresAuth: true, roles: ['Cliente'], title: 'Mis pedidos' } },
  { path: '/pedido/:id', name: 'PedidoDetalle', component: PedidoDetalleView, meta: { requiresAuth: true, roles: ['Cliente'], title: 'Detalle del pedido' } },
  { path: '/cuenta', name: 'Perfil', component: PerfilView, meta: { requiresAuth: true, title: 'Mi cuenta' } },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true, title: 'Panel' } },
  { path: '/admin', name: 'Admin', component: AdminView, meta: { requiresAuth: true, roles: ['Administrador'], title: 'Administración' } },
  { path: '/vendedor', name: 'Vendedor', component: VendedorView, meta: { requiresAuth: true, roles: ['Vendedor', 'Administrador'], title: 'Ventas' } },
  { path: '/bodeguero', name: 'Bodeguero', component: BodegueroView, meta: { requiresAuth: true, roles: ['Bodeguero', 'Administrador'], title: 'Bodega' } },
  { path: '/contador', name: 'Contador', component: ContadorView, meta: { requiresAuth: true, roles: ['Contador', 'Administrador'], title: 'Finanzas' } },
  { path: '/sucursales', name: 'Sucursales', component: SucursalesView, meta: { public: true, title: 'Sucursales' } },
  { path: '/sucursales/:id/stock', name: 'StockSucursal', component: StockSucursalView, meta: { public: true, title: 'Stock por sucursal' } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView, meta: { public: true, title: 'No encontrado' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'FERREMAS'} | FERREMAS`

  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole

  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: 'Catalogo' })
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router
