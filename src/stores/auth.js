// src/stores/auth.js
// Store de autenticación - maneja sesión del usuario y roles
// En modo mockup simula el login con usuarios de prueba

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isMockup } from '@/lib/supabase.js'

// Usuarios de prueba para el mockup
const MOCKUP_USERS = {
  'admin@ferremas.cl':     { id: '1', nombre: 'Carlos Admin',    rol: 'Administrador', cambio_password_obligatorio: false },
  'vendedor@ferremas.cl':  { id: '2', nombre: 'Ana Vendedora',   rol: 'Vendedor',      cambio_password_obligatorio: false },
  'bodeguero@ferremas.cl': { id: '3', nombre: 'Luis Bodeguero',  rol: 'Bodeguero',     cambio_password_obligatorio: false },
  'contador@ferremas.cl':  { id: '4', nombre: 'María Contadora', rol: 'Contador',      cambio_password_obligatorio: false },
  'cliente@ferremas.cl':   { id: '5', nombre: 'Pedro Cliente',   rol: 'Cliente',       cambio_password_obligatorio: false },
}

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userRole        = computed(() => user.value?.rol || null)
  const isAdmin         = computed(() => userRole.value === 'Administrador')

  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      if (isMockup) {
        // Simular delay de red
        await new Promise(r => setTimeout(r, 800))

        const found = MOCKUP_USERS[email.toLowerCase()]
        if (!found || password !== '12345') {
          throw new Error('Credenciales incorrectas. (Mockup: usa contraseña 12345)')
        }
        user.value = { ...found, email }
        token.value = 'mockup-token-' + Date.now()
        return { ok: true, user: user.value }
      }

      // TODO: Integrar Supabase Auth cuando se agreguen las credenciales
      // const { data, error: sbError } = await supabase.auth.signInWithPassword({ email, password })
      // if (sbError) throw sbError
      // user.value = data.user
      // token.value = data.session.access_token

    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    user.value = null
    token.value = null
  }

  return { user, token, loading, error, isAuthenticated, userRole, isAdmin, login, logout }
})
