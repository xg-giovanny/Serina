/**
 * nominaApi.js
 * Servicio de nómina/gastos que llama al backend
 */

import { api } from './api.js'

/**
 * Obtener todos los gastos (con filtros opcionales)
 */
export async function getAllNomina(filters = {}) {
  const params = new URLSearchParams()
  if (filters.categoria) params.set('categoria', filters.categoria)
  if (filters.fechaInicio) params.set('fechaInicio', filters.fechaInicio)
  if (filters.fechaFin) params.set('fechaFin', filters.fechaFin)
  if (filters.busqueda) params.set('busqueda', filters.busqueda)

  const query = params.toString()
  const data = await api.get(`/nomina${query ? `?${query}` : ''}`)
  return data
}

/**
 * Obtener estadísticas de gastos
 */
export async function getNominaStats() {
  return await api.get('/nomina/stats')
}

/**
 * Crear un nuevo gasto
 */
export async function createNomina(registro) {
  return await api.post('/nomina', registro)
}

/**
 * Actualizar un gasto
 */
export async function updateNomina(id, updates) {
  return await api.put(`/nomina/${id}`, updates)
}

/**
 * Eliminar un gasto
 */
export async function deleteNomina(id) {
  return await api.delete(`/nomina/${id}`)
}

export default {
  getAllNomina,
  getNominaStats,
  createNomina,
  updateNomina,
  deleteNomina
}
