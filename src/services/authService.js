/**
 * authService.js
 * Servicio de autenticación para Supabase
 * Maneja login, registro, logout y verificación de sesión
 */

import { supabase, isSupabaseConfigured } from './supabaseClient'

const SESSION_KEY = 'serina_session'

/**
 * Iniciar sesión con username y password
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Object} - { user, session, error }
 */
export async function login(username, password) {
  if (!isSupabaseConfigured()) {
    return { user: null, session: null, error: new Error('Supabase no está configurado') }
  }

  try {
    // Usar la función RPC de Supabase para verificar credenciales
    const { data, error } = await supabase.rpc('verify_credentials', {
      p_username: username,
      p_password: password
    })

    if (error) throw error

    if (data && data.length > 0) {
      const user = data[0]
      
      // Verificar si el usuario está activo (status = 1)
      if (user.status !== 1) {
        return { 
          user: null, 
          session: null, 
          error: new Error('Tu cuenta está inactiva. Contacta al administrador.') 
        }
      }
      
      // Crear objeto de sesión
      const session = {
        id: user.id_usuario,
        username: user.username,
        status: user.status,
        created_at: user.created_at,
        token: btoa(JSON.stringify({ id: String(user.id_usuario), username: user.username, status: user.status }))
      }

      // Guardar sesión en localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))

      return { user: session, session, error: null }
    }

    return { user: null, session: null, error: new Error('Credenciales erróneas') }
  } catch (error) {
    console.error('Error en login:', error)
    return { user: null, session: null, error }
  }
}

/**
 * Registrar un nuevo usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Object} - { user, error }
 */
export async function register(username, password) {
  if (!isSupabaseConfigured()) {
    return { user: null, error: new Error('Supabase no está configurado') }
  }

  if (!username || !password) {
    return { user: null, error: new Error('Usuario y contraseña son requeridos') }
  }

  if (password.length < 6) {
    return { user: null, error: new Error('La contraseña debe tener al menos 6 caracteres') }
  }

  try {
    // Usar la función RPC de Supabase para registrar usuario
    const { data, error } = await supabase.rpc('register_user', {
      p_username: username,
      p_password: password
    })

    if (error) throw error

    return { user: { id: data, id_usuario: data, username }, error: null }
  } catch (error) {
    console.error('Error en registro:', error)
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
 * @returns {Object|null} - Sesión del usuario o null
 */
export function getSession() {
  const sessionData = localStorage.getItem(SESSION_KEY)
  if (sessionData) {
    try {
      return JSON.parse(sessionData)
    } catch {
      return null
    }
  }
  return null
}

/**
 * Verificar si hay una sesión activa
 * @returns {boolean}
 */
export function isAuthenticated() {
  const session = getSession()
  return session !== null
}

/**
 * Verificar si el usuario es administrador
 * @returns {boolean}
 */
export function isAdmin() {
  const session = getSession()
  return session?.username === 'admin'
}

export default {
  login,
  register,
  logout,
  getSession,
  isAuthenticated,
  isAdmin
}

