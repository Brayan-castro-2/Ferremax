// src/stores/auth.js
// Store de autenticación adaptado para el Backend Propio de Ferremas

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null)
  const token   = ref(null)
  const loading = ref(false)
  const error   = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userRole        = computed(() => user.value?.rol || null)
  const isAdmin         = computed(() => userRole.value === 'Administrador' || userRole.value === 'Bodeguero' || userRole.value === 'Vendedor')

  async function login(email, password) {
    loading.value = true
    error.value   = null

    try {
      // Llamada al Backend en lugar de usar Supabase Auth directamente
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Error de autenticación')
      }

      user.value = data.usuario
      token.value = data.token
      
      // Guardar token en localStorage
      localStorage.setItem('ferremas_token', data.token)
      localStorage.setItem('ferremas_user', JSON.stringify(data.usuario))

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
    token.value = null
    error.value = null
    localStorage.removeItem('ferremas_token')
    localStorage.removeItem('ferremas_user')
  }

  async function initialize() {
    const savedToken = localStorage.getItem('ferremas_token')
    const savedUser = localStorage.getItem('ferremas_user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  return { user, token, loading, error, isAuthenticated, userRole, isAdmin, login, logout, initialize }
})
