/**
 * api.js
 * Cliente HTTP base para comunicarse con el backend
 */

const SESSION_KEY = 'serina_session'

/**
 * Obtener el token de la sesión actual
 */
function getToken() {
  const session = localStorage.getItem(SESSION_KEY)
  if (!session) return null
  try {
    return JSON.parse(session).token
  } catch {
    return null
  }
}

/**
 * Fetch wrapper con autenticación automática
 */
export async function apiFetch(endpoint, options = {}) {
  const token = getToken()

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  }

  // Usar proxy de Vite: /api se redirige al backend
  const response = await fetch(`/api${endpoint}`, config)
  const data = await response.json()

  // Si el token expiró (pero NO en rutas de auth, donde 401 = credenciales malas)
  const isAuthEndpoint = endpoint.startsWith('/auth/')
  if (response.status === 401 && !isAuthEndpoint) {
    localStorage.removeItem(SESSION_KEY)
    window.location.href = '/login'
    throw new Error('Sesión expirada')
  }

  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}`)
  }

  return data
}

export const api = {
  get: (url) => apiFetch(url, { method: 'GET' }),
  post: (url, data) => apiFetch(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => apiFetch(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url) => apiFetch(url, { method: 'DELETE' })
}

export default api
