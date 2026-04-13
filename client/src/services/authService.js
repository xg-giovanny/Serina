/**
 * authApi.js
 * Servicio de autenticación que llama al backend
 */

import { api } from './api.js'

const SESSION_KEY = 'serina_session'

/**
 * Iniciar sesión
 */
export async function login(username, password) {
  try {
    const data = await api.post('/auth/login', { username, password })

    // Guardar sesión en localStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      id: data.user.id,
      username: data.user.username,
      token: data.token
    }))

    return { user: data.user, session: data, error: null }
  } catch (error) {
    return { user: null, session: null, error }
  }
}

/**
 * Registrar un nuevo usuario
 */
export async function register(username, password) {
  try {
    const data = await api.post('/auth/register', { username, password })

    return { user: data.user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

/**
 * Cerrar sesión
 */
export function logout() {
  localStorage.removeItem(SESSION_KEY)
  return { success: true }
}

/**
 * Obtener sesión actual
 */
export function getSession() {
  const sessionData = localStorage.getItem(SESSION_KEY)
  if (!sessionData) return null
  try {
    return JSON.parse(sessionData)
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

/**
 * Verificar si hay sesión activa
 */
export function isAuthenticated() {
  return getSession() !== null
}

export default {
  login,
  register,
  logout,
  getSession,
  isAuthenticated
}
