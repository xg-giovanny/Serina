/**
 * supabaseService.js
 * Servicios para operaciones CRUD con Supabase
 * Maneja todas las interacciones con la base de datos
 */

import { supabase } from './supabaseClient'
import { getSession } from './authService'

// Función helper para obtener el id_usuario actual
function getCurrentUserId() {
  const session = getSession()
  return session?.id || null
}

// ============================================
// SERVICIOS DE NÓMINA (GASTOS)
// ============================================

/**
 * Obtener todos los registros de nómina
 * @returns {Promise<Array>}
 */
export async function getAllNomina() {
  try {
    const { data, error } = await supabase
      .from('nomina')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching nomina:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtener nómina con filtros
 * @param {Object} filters - Filtros a aplicar
 * @returns {Promise<Array>}
 */
export async function getNominaWithFilters(filters = {}) {
  try {
    let query = supabase.from('nomina').select('*').order('created_at', { ascending: false })
    
    if (filters.categoria) {
      query = query.eq('categoria', filters.categoria)
    }
    
    if (filters.fechaInicio && filters.fechaFin) {
      query = query.gte('fecha', filters.fechaInicio).lte('fecha', filters.fechaFin)
    }
    
    if (filters.busqueda) {
      query = query.ilike('nombre', `%${filters.busqueda}%`)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error filtering nomina:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Crear nuevo registro de nómina
 * @param {Object} registro - Datos del registro
 * @returns {Promise<Object>}
 */
export async function createNomina(registro) {
  try {
    const registroWithUser = {
      ...registro,
      id_usuario: getCurrentUserId()
    }
    
    const { data, error } = await supabase
      .from('nomina')
      .insert([registroWithUser])
      .select()
    
    if (error) throw error
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error creating nomina:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Actualizar registro de nómina
 * @param {number} id - ID del registro
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>}
 */
export async function updateNomina(id, updates) {
  try {
    const { data, error } = await supabase
      .from('nomina')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error updating nomina:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Eliminar registro de nómina
 * @param {number} id - ID del registro
 * @returns {Promise<Object>}
 */
export async function deleteNomina(id) {
  try {
    const { error } = await supabase
      .from('nomina')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting nomina:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtener estadísticas de nómina
 * @returns {Promise<Object>}
 */
export async function getNominaStats() {
  try {
    const { data, error } = await supabase
      .from('nomina')
      .select('precio, categoria, metodo_pago, fecha, created_at')
    
    if (error) throw error
    
    // Calcular totales
    const totalGastos = data.reduce((sum, item) => sum + (item.precio || 0), 0)
    
    // Gastos por categoría
    const gastosPorCategoria = data.reduce((acc, item) => {
      const cat = item.categoria || 'Sin categoría'
      acc[cat] = (acc[cat] || 0) + (item.precio || 0)
      return acc
    }, {})
    
    // Gastos por método de pago
    const gastosPorMetodo = data.reduce((acc, item) => {
      const metodo = item.metodo_pago || 'Sin método'
      acc[metodo] = (acc[metodo] || 0) + (item.precio || 0)
      return acc
    }, {})
    
    // Movimientos por mes
    const movimientosPorMes = data.reduce((acc, item) => {
      const mes = new Date(item.created_at).toLocaleString('es-ES', { year: 'numeric', month: 'short' })
      acc[mes] = (acc[mes] || 0) + 1
      return acc
    }, {})
    
    return {
      success: true,
      stats: {
        totalGastos,
        cantidadRegistros: data.length,
        gastosPorCategoria,
        gastosPorMetodo,
        movimientosPorMes,
        ultimosMovimientos: data.slice(0, 5)
      }
    }
  } catch (error) {
    console.error('Error getting nomina stats:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// SERVICIOS DE CARTAS
// ============================================

/**
 * Obtener todas las cartas
 * @returns {Promise<Array>}
 */
export async function getAllCartas() {
  try {
    const { data, error } = await supabase
      .from('cartas')
      .select('*')
      .order('character', { ascending: true })
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching cartas:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtener cartas con filtros
 * @param {Object} filters - Filtros a aplicar
 * @returns {Promise<Array>}
 */
export async function getCartasWithFilters(filters = {}) {
  try {
    let query = supabase.from('cartas').select('*').order('character', { ascending: true })
    
    if (filters.serie) {
      query = query.eq('series', filters.serie)
    }
    
    if (filters.calidad) {
      query = query.eq('quality', filters.calidad)
    }
    
    if (filters.busqueda) {
      query = query.ilike('character', `%${filters.busqueda}%`)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error filtering cartas:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Insertar cartas desde Excel
 * @param {Array} cartas - Array de cartas a insertar
 * @returns {Promise<Object>}
 */
export async function insertCartas(cartas) {
  try {
    const idUsuario = getCurrentUserId()
    const cartasWithUser = cartas.map(carta => ({
      ...carta,
      id_usuario: idUsuario
    }))
    
    const { data, error } = await supabase
      .from('cartas')
      .insert(cartasWithUser)
      .select()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error inserting cartas:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Eliminar carta
 * @param {number} id - ID de la carta
 * @returns {Promise<Object>}
 */
export async function deleteCarta(id) {
  try {
    const { error } = await supabase
      .from('cartas')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting carta:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtener estadísticas de cartas
 * @returns {Promise<Object>}
 */
export async function getCartasStats() {
  try {
    const { data, error } = await supabase
      .from('cartas')
      .select('series, quality')
    
    if (error) throw error
    
    // Contar por serie
    const porSerie = data.reduce((acc, item) => {
      acc[item.series] = (acc[item.series] || 0) + 1
      return acc
    }, {})
    
    // Contar por calidad
    const porCalidad = data.reduce((acc, item) => {
      acc[item.quality] = (acc[item.quality] || 0) + 1
      return acc
    }, {})
    
    return {
      success: true,
      stats: {
        totalCartas: data.length,
        porSerie,
        porCalidad
      }
    }
  } catch (error) {
    console.error('Error getting cartas stats:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// SERVICIOS DE TABS DINÁMICOS
// ============================================

/**
 * Obtener todos los tabs
 * @returns {Promise<Array>}
 */
export async function getAllTabs() {
  try {
    const { data, error } = await supabase
      .from('tabs')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching tabs:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Crear nuevo tab
 * @param {Object} tab - Datos del tab
 * @returns {Promise<Object>}
 */
export async function createTab(tab) {
  try {
    const tabWithUser = {
      ...tab,
      id_usuario: getCurrentUserId()
    }
    
    const { data, error } = await supabase
      .from('tabs')
      .insert([tabWithUser])
      .select()
    
    if (error) throw error
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error creating tab:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Eliminar tab
 * @param {number} id - ID del tab
 * @returns {Promise<Object>}
 */
export async function deleteTab(id) {
  try {
    const { error } = await supabase
      .from('tabs')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting tab:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtener tab por ID
 * @param {number} id - ID del tab
 * @returns {Promise<Object>}
 */
export async function getTabById(id) {
  try {
    const { data, error } = await supabase
      .from('tabs')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching tab:', error)
    return { success: false, error: error.message }
  }
}

