/**
 * authService.js
 * Servicio de autenticación para Supabase
 * Maneja login, registro, logout y verificación de sesión
 * CON PROTECCIÓN DE INTENTOS (max 3 intentos)
 */

import { supabase, isSupabaseConfigured } from './supabaseClient'

const SESSION_KEY = 'serina_session'
const MAX_ATTEMPTS = 3

/**
 * Verificar si el usuario está bloqueado por demasiados intentos
 * @param {string} username - Nombre de usuario
 * @returns {Object} - { blocked: boolean, message: string }
 */
async function checkLoginAttempts(username) {
  if (!isSupabaseConfigured()) {
    return { blocked: false }
  }

  try {
    const { data, error } = await supabase.rpc('check_login_attempts', {
      p_username: username
    })

    if (error) {
      console.error('Error checking login attempts:', error)
      return { blocked: false }
    }

    // Si returns false, está bloqueado
    if (data === false || data === 'false') {
      // Obtener información del bloqueo
      const { data: attemptData } = await supabase
        .from('login_attempts')
        .select('locked_until')
        .eq('username', username)
        .single()

      if (attemptData?.locked_until) {
        const lockedUntil = new Date(attemptData.locked_until)
        const minutesLeft = Math.ceil((lockedUntil - new Date()) / 60000)
        return { 
          blocked: true, 
          message: `Demasiados intentos. Intenta de nuevo en ${minutesLeft} minutos.` 
        }
      }
      return { blocked: true, message: 'Demasiados intentos. Intenta de nuevo más tarde.' }
    }

    return { blocked: false }
  } catch (error) {
    console.error('Error checking login attempts:', error)
    return { blocked: false }
  }
}

/**
 * Registrar intento de login (éxito o fracaso)
 * @param {string} username - Nombre de usuario
 * @param {boolean} success - Si el login fue exitoso
 */
async function recordLoginAttempt(username, success) {
  if (!isSupabaseConfigured()) return

  try {
    await supabase.rpc('record_login_attempt', {
      p_username: username,
      p_success: success
    })
  } catch (error) {
    console.error('Error recording login attempt:', error)
  }
}

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
    // 1. Verificar si está bloqueado por demasiados intentos
    const attemptCheck = await checkLoginAttempts(username)
    if (attemptCheck.blocked) {
      return { 
        user: null, 
        session: null, 
        error: new Error(attemptCheck.message) 
      }
    }

    // 2. Verificar credenciales
    const { data, error } = await supabase.rpc('verify_credentials', {
      p_username: username,
      p_password: password
    })

    if (error) {
      // Registrar intento fallido
      await recordLoginAttempt(username, false)
      
      // Obtener количество de intentos
      const { data: attemptData } = await supabase
        .from('login_attempts')
        .select('attempts')
        .eq('username', username)
        .single()

      const attempts = attemptData?.attempts || 0
      const remaining = MAX_ATTEMPTS - attempts

      if (remaining > 0) {
        return { 
          user: null, 
          session: null, 
          error: new Error(`Credenciales erróneas. Te quedan ${remaining} intentos.`) 
        }
      } else {
        return { 
          user: null, 
          session: null, 
          error: new Error('Demasiados intentos. Tu cuenta está bloqueada por 15 minutos.') 
        }
      }
    }

    if (data && data.length > 0) {
      const user = data[0]
      
      // Verificar si el usuario está activo (status = 1)
      if (user.status !== 1) {
        await recordLoginAttempt(username, false)
        return { 
          user: null, 
          session: null, 
          error: new Error('Tu cuenta está inactiva. Contacta al administrador.') 
        }
      }
      
      // 3. Generar token seguro (simulado - en producción usar JWT real)
      const sessionToken = generateSecureToken(user.id_usuario, user.username, user.status)
      
      // Crear objeto de sesión
      const session = {
        id: user.id_usuario,
        username: user.username,
        status: user.status,
        created_at: user.created_at,
        token: sessionToken
      }

      // 4. Registrar intento exitoso
      await recordLoginAttempt(username, true)

      // 5. Guardar sesión en localStorage (solo datos necesarios)
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        id: session.id,
        username: session.username,
        token: session.token
      }))

      return { user: session, session, error: null }
    }

    // Login fallido
    await recordLoginAttempt(username, false)
    return { user: null, session: null, error: new Error('Credenciales erróneas') }
  } catch (error) {
    console.error('Error en login:', error)
    await recordLoginAttempt(username, false)
    return { user: null, session: null, error }
  }
}

/**
 * Generar un token pseudo-seguro
 * En producción, esto debería usar JWT real
 */
function generateSecureToken(userId, username, status) {
  const payload = {
    id: userId,
    username: username,
    status: status,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  }
  // Usar btoa con algo más de seguridad (en producción usar JWT)
  return btoa(JSON.stringify(payload))
}

/**
 * Verificar si el token es válido
 */
export function verifyToken(token) {
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp && Date.now() > payload.exp) {
      return null // Token expirado
    }
    return payload
  } catch {
    return null // Token inválido
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

  // Validar nombre de usuario (solo letras, números y guiones)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { user: null, error: new Error('Usuario solo puede contener letras, números y guiones bajos') }
  }

  try {
    // Usar la función RPC de Supabase para registrar usuario
    const { data, error } = await supabase.rpc('register_user', {
      p_username: username,
      p_password: password
    })

    if (error) {
      // Manejar error específico de usuario duplicado
      if (error.message.includes('ya existe')) {
        return { user: null, error: new Error('El usuario ya existe') }
      }
      throw error
    }

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
      const session = JSON.parse(sessionData)
      
      // Verificar token
      if (session.token) {
        const payload = verifyToken(session.token)
        if (!payload) {
          // Token expirado o inválido
          localStorage.removeItem(SESSION_KEY)
          return null
        }
      }
      
      return session
    } catch {
      localStorage.removeItem(SESSION_KEY)
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
  isAdmin,
  verifyToken
}

