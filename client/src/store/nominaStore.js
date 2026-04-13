/**
 * nominaStore.js
 * Store de Pinia para gestionar el estado de Nómina/Gastos
 * Maneja la lógica de negocio relacionada con los gastos
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as nominaService from '@/services/nominaApi'

export const useNominaStore = defineStore('nomina', () => {
  // ========== Estado ==========
  const gastos = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filtros = ref({
    categoria: '',
    fechaInicio: '',
    fechaFin: '',
    busqueda: ''
  })
  
  // ========== Getters ==========
  
  // Total de gastos
  const totalGastos = computed(() => {
    return gastos.value.reduce((sum, gasto) => sum + (gasto.precio || 0), 0)
  })
  
  // Gastos por categoría
  const gastosPorCategoria = computed(() => {
    return gastos.value.reduce((acc, gasto) => {
      const cat = gasto.categoria || 'Sin categoría'
      acc[cat] = (acc[cat] || 0) + (gasto.precio || 0)
      return acc
    }, {})
  })
  
  // Gastos por método de pago
  const gastosPorMetodo = computed(() => {
    return gastos.value.reduce((acc, gasto) => {
      const metodo = gasto.metodo_pago || 'Sin método'
      acc[metodo] = (acc[metodo] || 0) + (gasto.precio || 0)
      return acc
    }, {})
  })
  
  // Últimos 5 movimientos
  const ultimosMovimientos = computed(() => {
    return [...gastos.value].slice(0, 5)
  })
  
  // Lista de categorías únicas
  const categoriasUnicas = computed(() => {
    return [...new Set(gastos.value.map(g => g.categoria).filter(Boolean))]
  })
  
  // Lista de métodos de pago únicos
  const metodosUnicos = computed(() => {
    return [...new Set(gastos.value.map(g => g.metodo_pago).filter(Boolean))]
  })
  
  // Gastos filtrados
  const gastosFiltrados = computed(() => {
    let result = [...gastos.value]
    
    if (filtros.value.categoria) {
      result = result.filter(g => g.categoria === filtros.value.categoria)
    }
    
    if (filtros.value.fechaInicio && filtros.value.fechaFin) {
      result = result.filter(g => {
        const fecha = new Date(g.fecha)
        return fecha >= new Date(filtros.value.fechaInicio) && 
               fecha <= new Date(filtros.value.fechaFin)
      })
    }
    
    if (filtros.value.busqueda) {
      const busqueda = filtros.value.busqueda.toLowerCase()
      result = result.filter(g => 
        (g.nombre || '').toLowerCase().includes(busqueda) ||
        (g.categoria || '').toLowerCase().includes(busqueda)
      )
    }
    
    return result
  })
  
  // ========== Acciones ==========
  
  /**
   * Cargar todos los gastos desde Supabase
   */
  async function fetchGastos() {
    loading.value = true
    error.value = null
    
    const result = await nominaService.getAllNomina()
    
    if (result.success) {
      gastos.value = result.data
    } else {
      error.value = result.error
    }
    
    loading.value = false
  }
  
  /**
   * Agregar un nuevo gasto
   * @param {Object} gasto - Datos del gasto
   */
  async function agregarGasto(gasto) {
    loading.value = true
    error.value = null
    
    const result = await nominaService.createNomina(gasto)
    
    if (result.success) {
      gastos.value.unshift(result.data)
    } else {
      error.value = result.error
    }
    
    loading.value = false
    return result
  }
  
  /**
   * Actualizar un gasto
   * @param {number} id - ID del gasto
   * @param {Object} updates - Datos a actualizar
   */
  async function actualizarGasto(id, updates) {
    loading.value = true
    error.value = null
    
    const result = await nominaService.updateNomina(id, updates)
    
    if (result.success) {
      const index = gastos.value.findIndex(g => g.id === id)
      if (index !== -1) {
        gastos.value[index] = result.data
      }
    } else {
      error.value = result.error
    }
    
    loading.value = false
    return result
  }
  
  /**
   * Eliminar un gasto
   * @param {number} id - ID del gasto
   */
  async function eliminarGasto(id) {
    loading.value = true
    error.value = null
    
    const result = await nominaService.deleteNomina(id)
    
    if (result.success) {
      gastos.value = gastos.value.filter(g => g.id !== id)
    } else {
      error.value = result.error
    }
    
    loading.value = false
    return result
  }
  
  /**
   * Actualizar filtros
   * @param {Object} nuevosFiltros
   */
  function setFiltros(nuevosFiltros) {
    filtros.value = { ...filtros.value, ...nuevosFiltros }
  }
  
  /**
   * Limpiar filtros
   */
  function limpiarFiltros() {
    filtros.value = {
      categoria: '',
      fechaInicio: '',
      fechaFin: '',
      busqueda: ''
    }
  }
  
  /**
   * Obtener estadísticas completas
   */
  async function fetchEstadisticas() {
    return await nominaService.getNominaStats()
  }
  
  return {
    // Estado
    gastos,
    loading,
    error,
    filtros,
    
    // Getters
    totalGastos,
    gastosPorCategoria,
    gastosPorMetodo,
    ultimosMovimientos,
    categoriasUnicas,
    metodosUnicos,
    gastosFiltrados,
    
    // Acciones
    fetchGastos,
    agregarGasto,
    actualizarGasto,
    eliminarGasto,
    setFiltros,
    limpiarFiltros,
    fetchEstadisticas
  }
})

