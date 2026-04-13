/**
 * cartasApi.js
 * Servicio de cartas que llama al backend
 */

import { api } from './api.js'

/**
 * Obtener todas las cartas (con filtros opcionales)
 */
export async function getAllCartas(filters = {}) {
  const params = new URLSearchParams()
  if (filters.serie) params.set('serie', filters.serie)
  if (filters.calidad) params.set('calidad', filters.calidad)
  if (filters.busqueda) params.set('busqueda', filters.busqueda)

  const query = params.toString()
  return await api.get(`/cartas${query ? `?${query}` : ''}`)
}

/**
 * Obtener estadísticas de cartas
 */
export async function getCartasStats() {
  return await api.get('/cartas/stats')
}

/**
 * Importar cartas en bulk
 */
export async function importCartas(cartas) {
  return await api.post('/cartas/import', { cartas })
}

/**
 * Eliminar una carta
 */
export async function deleteCarta(id) {
  return await api.delete(`/cartas/${id}`)
}

export default {
  getAllCartas,
  getCartasStats,
  importCartas,
  deleteCarta
}
