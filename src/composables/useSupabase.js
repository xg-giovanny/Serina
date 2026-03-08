/**
 * useSupabase.js
 * Composable para usar Supabase de forma reactiva
 * Proporciona métodos удобные para las operaciones CRUD
 */

import { ref } from 'vue'
import { supabase, checkConnection } from '@/services/supabaseClient'
import { useQuasar } from 'quasar'

/**
 * Hook principal para usar Supabase
 * @returns {Object} Métodos y estado reactivo
 */
export function useSupabase() {
  const $q = useQuasar()
  const loading = ref(false)
  const error = ref(null)
  const isConnected = ref(false)

  /**
   * Verificar conexión con Supabase
   */
  async function verifyConnection() {
    isConnected.value = await checkConnection()
    return isConnected.value
  }

  /**
   * Mostrar notificación de éxito
   * @param {string} message
   */
  function notifySuccess(message) {
    $q.notify({
      type: 'positive',
      message,
      position: 'top-right',
      timeout: 3000
    })
  }

  /**
   * Mostrar notificación de error
   * @param {string} message
   */
  function notifyError(message) {
    $q.notify({
      type: 'negative',
      message,
      position: 'top-right',
      timeout: 4000
    })
  }

  /**
   * Mostrar loading
   * @param {string} message
   */
  function showLoading(message = 'Cargando...') {
    $q.loading.show({
      message,
      spinnerColor: 'primary'
    })
  }

  /**
   * Ocultar loading
   */
  function hideLoading() {
    $q.loading.hide()
  }

  /**
   * Generic CRUD operations
   */
  
  /**
   * Obtener todos los registros de una tabla
   * @param {string} table - Nombre de la tabla
   * @param {Object} options - Opciones de query
   */
  async function getAll(table, options = {}) {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase.from(table).select(options.select || '*')
      
      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending ?? true })
      }
      
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      const { data, error: err } = await query
      
      if (err) throw err
      
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      notifyError(err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener un registro por ID
   * @param {string} table - Nombre de la tabla
   * @param {number} id - ID del registro
   */
  async function getById(table, id) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()
      
      if (err) throw err
      
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      notifyError(err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear un registro
   * @param {string} table - Nombre de la tabla
   * @param {Object} data - Datos a insertar
   */
  async function create(table, data) {
    loading.value = true
    error.value = null
    
    try {
      const { data: result, error: err } = await supabase
        .from(table)
        .insert([data])
        .select()
      
      if (err) throw err
      
      return { success: true, data: result[0] }
    } catch (err) {
      error.value = err.message
      notifyError(err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar un registro
   * @param {string} table - Nombre de la tabla
   * @param {number} id - ID del registro
   * @param {Object} data - Datos a actualizar
   */
  async function update(table, id, data) {
    loading.value = true
    error.value = null
    
    try {
      const { data: result, error: err } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
      
      if (err) throw err
      
      return { success: true, data: result[0] }
    } catch (err) {
      error.value = err.message
      notifyError(err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar un registro
   * @param {string} table - Nombre de la tabla
   * @param {number} id - ID del registro
   */
  async function remove(table, id) {
    loading.value = true
    error.value = null
    
    try {
      const { error: err } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (err) throw err
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      notifyError(err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Buscar registros con filtros
   * @param {string} table - Nombre de la tabla
   * @param {Object} filters - Filtros a aplicar
   */
  async function search(table, filters = {}) {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase.from(table).select('*')
      
      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (typeof value === 'string' && value.includes('%')) {
            query = query.like(key, value)
          } else {
            query = query.eq(key, value)
          }
        }
      })
      
      const { data, error: err } = await query
      
      if (err) throw err
      
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      notifyError(err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    loading,
    error,
    isConnected,
    
    // Métodos
    verifyConnection,
    notifySuccess,
    notifyError,
    showLoading,
    hideLoading,
    getAll,
    getById,
    create,
    update,
    remove,
    search,
    
    // Cliente de Supabase (para uso avanzado)
    client: supabase
  }
}

export default useSupabase

