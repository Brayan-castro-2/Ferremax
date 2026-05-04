// src/stores/auth.js
// Store de autenticación con soporte para Supabase real y modo mockup

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isMockup } from '@/lib/supabase.js'

// Usuarios de prueba para modo mockup (sin Supabase)
const MOCKUP_USERS = {
  'admin@ferremas.cl':     { id: 'uuid-1', nombre: 'Carlos Admin',    rol_nombre: 'Administrador', rol_id: 1 },
  'vendedor@ferremas.cl':  { id: 'uuid-2', nombre: 'Ana Vendedora',   rol_nombre: 'Vendedor',      rol_id: 2 },
  'bodeguero@ferremas.cl': { id: 'uuid-3', nombre: 'Luis Bodeguero',  rol_nombre: 'Bodeguero',     rol_id: 3 },
  'contador@ferremas.cl':  { id: 'uuid-4', nombre: 'María Contadora', rol_nombre: 'Contador',      rol_id: 4 },
  'cliente@ferremas.cl':   { id: 'uuid-5', nombre: 'Pedro Cliente',   rol_nombre: 'Cliente',       rol_id: 5 },
}

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null)
  const loading = ref(false)
  const error   = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userRole        = computed(() => user.value?.rol_nombre || null)
  const isAdmin         = computed(() => userRole.value === 'Administrador')

  /**
   * Login — en producción consulta la tabla `usuarios` con JOIN a `roles`.
   * IMPORTANTE: El schema usa password_hash, lo que requiere verificación
   * server-side. Por ahora se verifica solo la existencia del usuario por email
   * (flujo académico). Para producción real, implementar Edge Function o backend.
   *
   * En modo mockup, usa los usuarios de prueba con contraseña "12345".
   */
  async function login(email, password) {
    loading.value = true
    error.value   = null

    try {
      // ── MODO MOCKUP ──────────────────────────────────────────
      if (isMockup) {
        await new Promise(r => setTimeout(r, 700))
        const found = MOCKUP_USERS[email.toLowerCase()]
        if (!found || password !== '12345') {
          throw new Error('Credenciales incorrectas. (Mockup: usa contraseña 12345)')
        }
        user.value = { ...found, email }
        return { ok: true }
      }

      // ── MODO PRODUCCIÓN — Supabase ────────────────────────────
      // Paso 1: buscar usuario en tabla `usuarios` con su rol
      const { data: usuarioData, error: sbError } = await supabase
        .from('usuarios')
        .select('id, nombre, email, rol_id, activo, roles(nombre)')
        .eq('email', email.toLowerCase().trim())
        .eq('activo', true)
        .single()

      if (sbError || !usuarioData) {
        throw new Error('Usuario no encontrado o inactivo.')
      }

      // Paso 2: Verificación de contraseña
      // NOTA ACADÉMICA: El schema guarda password_hash. Para verificar bcrypt
      // correctamente desde el frontend necesitarías una Edge Function.
      // Aquí verificamos existencia + un campo simple.
      // TODO: Implementar Edge Function para verificación real de hash.
      //
      // Alternativa: migrar a Supabase Auth (recomendado para producción)
      //   supabase.auth.signInWithPassword({ email, password })

      user.value = {
        id:         usuarioData.id,
        nombre:     usuarioData.nombre,
        email:      usuarioData.email,
        rol_id:     usuarioData.rol_id,
        rol_nombre: usuarioData.roles?.nombre || 'Cliente',
        activo:     usuarioData.activo
      }

      return { ok: true }

    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    user.value = null
    error.value = null
  }

  return { user, loading, error, isAuthenticated, userRole, isAdmin, login, logout }
})
