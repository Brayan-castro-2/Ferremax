// src/stores/auth.js
// Store de autenticación — usa el API client centralizado.

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/lib/api.js'

const STAFF_ROLES = ['Administrador', 'Vendedor', 'Bodeguero', 'Contador']

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null)
  const token   = ref(null)
  const loading = ref(false)
  const error   = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userRole        = computed(() => user.value?.rol || null)
  const isStaff         = computed(() => STAFF_ROLES.includes(userRole.value))
  const isAdmin         = computed(() => userRole.value === 'Administrador')
  const isCliente       = computed(() => userRole.value === 'Cliente')

  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      const data = await api.auth.login(email, password)
      user.value = data.usuario
      token.value = data.token
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
      try {
        user.value = JSON.parse(savedUser)
      } catch {
        await logout()
      }
    }
  }

  async function refresh() {
    if (!token.value) return
    try {
      const data = await api.auth.me()
      if (data?.usuario) {
        user.value = { ...user.value, ...data.usuario }
        localStorage.setItem('ferremas_user', JSON.stringify(user.value))
      }
    } catch (err) {
      if (err.status === 401) await logout()
    }
  }

  return {
    user, token, loading, error,
    isAuthenticated, userRole, isStaff, isAdmin, isCliente,
    login, logout, initialize, refresh
  }
})
