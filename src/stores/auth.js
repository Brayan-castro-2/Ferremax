// src/stores/auth.js
// Store de autenticación con soporte para Supabase Auth real

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
  const session = ref(null)
  const loading = ref(false)
  const error   = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userRole        = computed(() => user.value?.rol_nombre || null)
  const isAdmin         = computed(() => userRole.value === 'Administrador')

  /**
   * Login — Usa Supabase Auth oficial para verificar contraseñas.
   * Al loguear con éxito, busca el perfil del usuario en la tabla 'public.usuarios'.
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

      // ── MODO PRODUCCIÓN — Supabase Auth ────────────────────────
      
      // 1. Autenticar con Supabase (GoTrue)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (authError) throw authError

      session.value = authData.session

      // 2. Buscar perfil en la tabla public.usuarios para obtener el ROL
      // NOTA: El ID del auth.user coincide con public.usuarios.id gracias al trigger.
      let { data: profile, error: profError } = await supabase
        .from('usuarios')
        .select('id, nombre, email, rol_id, roles(nombre)')
        .eq('id', authData.user.id)
        .single()

      if (profError || !profile) {
        // Si el perfil no existe, aplicamos fallback intentando crearlo
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert({
            id: authData.user.id,
            nombre: authData.user.user_metadata?.nombre 
                    || authData.user.email.split('@')[0],
            email: authData.user.email,
            rol_id: 5,  // rol Cliente por defecto
            activo: true
          })
          
        if (insertError) {
          console.error('Error al obtener perfil original:', profError)
          throw new Error('Tu cuenta de usuario no tiene un perfil asociado en Ferremas.')
        }

        // Volvemos a buscar el perfil recién creado
        const { data: newProfile, error: newProfError } = await supabase
          .from('usuarios')
          .select('id, nombre, email, rol_id, roles(nombre)')
          .eq('id', authData.user.id)
          .single()

        if (newProfError || !newProfile) {
          console.error('Error al obtener perfil original:', profError)
          throw new Error('Tu cuenta de usuario no tiene un perfil asociado en Ferremas.')
        }
        
        profile = newProfile
      }

      user.value = {
        id:         profile.id,
        nombre:     profile.nombre,
        email:      profile.email,
        rol_id:     profile.rol_id,
        rol_nombre: profile.roles?.nombre || 'Cliente'
      }

      return { ok: true }

    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout — Cierra sesión en Supabase y limpia el estado local.
   */
  async function logout() {
    if (!isMockup) {
      await supabase.auth.signOut()
    }
    user.value = null
    session.value = null
    error.value = null
  }

  /**
   * Inicializar sesión — para mantener al usuario logueado al recargar la página.
   */
  async function initialize() {
    if (isMockup) return

    const { data: { session: activeSession } } = await supabase.auth.getSession()
    if (activeSession) {
      session.value = activeSession
      // Cargar perfil automáticamente
      try {
        const { data: profile } = await supabase
          .from('usuarios')
          .select('id, nombre, email, rol_id, roles(nombre)')
          .eq('id', activeSession.user.id)
          .single()

        if (profile) {
          user.value = {
            id:         profile.id,
            nombre:     profile.nombre,
            email:      profile.email,
            rol_id:     profile.rol_id,
            rol_nombre: profile.roles?.nombre || 'Cliente'
          }
        }
      } catch (e) {
        console.error('No se pudo restaurar la sesión:', e)
      }
    }
  }

  return { user, loading, error, isAuthenticated, userRole, isAdmin, login, logout, initialize }
})
