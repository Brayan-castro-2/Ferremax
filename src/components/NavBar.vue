<template>
  <header class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container navbar-inner">
      <!-- Logo -->
      <router-link to="/catalogo" class="navbar-logo" id="nav-logo">
        <span class="logo-icon">⚙️</span>
        <span class="logo-text">FERRE<span class="text-primary">MAS</span></span>
      </router-link>

      <!-- Navegación central (desktop) -->
      <nav class="navbar-links hide-mobile" id="nav-links">
        <router-link to="/catalogo" class="nav-link" active-class="nav-link--active">Catálogo</router-link>
        <template v-if="auth.isAuthenticated">
          <router-link v-if="auth.userRole === 'Cliente'" to="/mis-pedidos" class="nav-link" active-class="nav-link--active">Mis Pedidos</router-link>
          <router-link v-if="auth.userRole === 'Administrador'" to="/admin" class="nav-link" active-class="nav-link--active">Admin</router-link>
          <router-link v-if="['Vendedor','Administrador'].includes(auth.userRole)" to="/vendedor" class="nav-link" active-class="nav-link--active">Ventas</router-link>
          <router-link v-if="['Bodeguero','Administrador'].includes(auth.userRole)" to="/bodeguero" class="nav-link" active-class="nav-link--active">Bodega</router-link>
          <router-link v-if="['Contador','Administrador'].includes(auth.userRole)" to="/contador" class="nav-link" active-class="nav-link--active">Finanzas</router-link>
        </template>
      </nav>

      <!-- Acciones derecha -->
      <div class="navbar-actions">
        <!-- Carrito (solo clientes) -->
        <router-link v-if="auth.userRole === 'Cliente' || !auth.isAuthenticated" to="/carrito" class="btn-icon" id="btn-carrito" title="Mi Carrito">
          🛒
          <span v-if="carrito.totalItems > 0" class="cart-badge">{{ carrito.totalItems }}</span>
        </router-link>

        <!-- Usuario autenticado -->
        <template v-if="auth.isAuthenticated">
          <div class="user-menu" @click="menuOpen = !menuOpen" id="user-menu-btn">
            <div class="user-avatar">{{ initials }}</div>
            <span class="hide-mobile">{{ auth.user.nombre }}</span>
            <span class="badge badge-primary hide-mobile">{{ auth.user.rol }}</span>
          </div>
          <div v-if="menuOpen" class="user-dropdown" id="user-dropdown">
            <button class="dropdown-item" @click="handleLogout" id="btn-logout">
              🚪 Cerrar Sesión
            </button>
          </div>
        </template>

        <!-- Sin sesión -->
        <router-link v-else to="/login" class="btn btn-primary btn-sm" id="btn-login-nav">
          Iniciar Sesión
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useCarritoStore } from '@/stores/carrito.js'

const auth    = useAuthStore()
const carrito = useCarritoStore()
const router  = useRouter()

const isScrolled = ref(false)
const menuOpen   = ref(false)

const initials = computed(() => {
  if (!auth.user?.nombre) return '?'
  return auth.user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
})

function onScroll() { isScrolled.value = window.scrollY > 20 }
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

async function handleLogout() {
  menuOpen.value = false
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  height: var(--navbar-height);
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
}
.navbar.scrolled {
  background: rgba(17, 24, 39, 0.96);
  box-shadow: var(--shadow-md);
}

.navbar-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xl);
  font-weight: 800;
  letter-spacing: -0.5px;
  transition: transform var(--transition-fast);
}
.navbar-logo:hover { transform: scale(1.03); }
.logo-icon { font-size: 1.5rem; }

.navbar-links {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex: 1;
  justify-content: center;
}
.nav-link {
  padding: 0.4rem var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color var(--transition-fast), background var(--transition-fast);
}
.nav-link:hover { color: var(--color-text); background: var(--color-surface-2); }
.nav-link--active { color: var(--color-primary) !important; background: rgba(45,212,191,0.08); }

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  position: relative;
}

.btn-icon {
  position: relative;
  font-size: 1.3rem;
  width: 2.5rem; height: 2.5rem;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}
.btn-icon:hover { background: var(--color-surface-2); }
.cart-badge {
  position: absolute;
  top: -4px; right: -4px;
  background: var(--color-primary);
  color: #071A14;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px; height: 18px;
  border-radius: var(--radius-full);
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  padding: 0.4rem var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  transition: background var(--transition-fast);
}
.user-menu:hover { background: var(--color-surface-2); }

.user-avatar {
  width: 2rem; height: 2rem;
  background: linear-gradient(135deg, var(--color-primary), #EC4899);
  border-radius: var(--radius-full);
  display: flex; align-items: center; justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: #fff;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-width: 180px;
  box-shadow: var(--shadow-lg);
  z-index: 200;
  overflow: hidden;
}
.dropdown-item {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-align: left;
  transition: background var(--transition-fast), color var(--transition-fast);
  display: flex; align-items: center; gap: var(--space-2);
}
.dropdown-item:hover { background: var(--color-danger); color: #fff; }
</style>
