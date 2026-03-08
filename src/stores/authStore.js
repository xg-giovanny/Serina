/**
 * authStore.js
 * Estado de autenticación con Pinia
 * Maneja la sesión del usuario de forma reactiva
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => user.value !== null)
  const username = computed(() => user.value?.username || '')

  // Inicializar sesión desde localStorage
  function initSession() {
    const session = authService.getSession()
    if (session) {
      user.value = session
    }
  }

  // Iniciar sesión
  async function login(username, password) {
    loading.value = true
    error.value = null
    
    try {
      const result = await authService.login(username, password)
      
      if (result.error) {
        error.value = result.error.message
        return { success: false, error: result.error }
      }

      user.value = result.user
      return { success: true, user: result.user }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Registrar usuario
  async function register(username, password) {
    loading.value = true
    error.value = null
    
    try {
      const result = await authService.register(username, password)
      
      if (result.error) {
        error.value = result.error.message
        return { success: false, error: result.error }
      }

      return { success: true, user: result.user }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Cerrar sesión
  function logout() {
    authService.logout()
    user.value = null
  }

  return {
    // Estado
    user,
    loading,
    error,
    // Computed
    isAuthenticated,
    username,
    // Métodos
    initSession,
    login,
    register,
    logout
  }
})

