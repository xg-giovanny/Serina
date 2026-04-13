/**
 * cartasStore.js
 * Store de Pinia para gestionar el estado de Cartas
 * Maneja la lógica de negocio relacionada con el catálogo de cartas
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as cartasService from '@/services/cartasApi'

export const useCartasStore = defineStore('cartas', () => {
  // ========== Estado ==========
  const cartas = ref([])
  const loading = ref(false)
  const error = ref(null)
  const uploading = ref(false)
  const filtros = ref({
    serie: '',
    calidad: '',
    busqueda: ''
  })
  
  // ========== Getters ==========
  
  // Total de cartas
  const totalCartas = computed(() => cartas.value.length)
  
  // Cartas filtradas
  const cartasFiltradas = computed(() => {
    let result = [...cartas.value]
    
    if (filtros.value.serie) {
      result = result.filter(c => c.series === filtros.value.serie)
    }
    
    if (filtros.value.calidad) {
      result = result.filter(c => c.quality === filtros.value.calidad)
    }
    
    if (filtros.value.busqueda) {
      const busqueda = filtros.value.busqueda.toLowerCase()
      result = result.filter(c => 
        (c.character || '').toLowerCase().includes(busqueda) ||
        (c.code || '').toLowerCase().includes(busqueda) ||
        (c.series || '').toLowerCase().includes(busqueda)
      )
    }
    
    return result
  })
  
  // Series únicas
  const seriesUnicas = computed(() => {
    return [...new Set(cartas.value.map(c => c.series).filter(Boolean))].sort()
  })
  
  // Calidades únicas
  const calidadesUnicas = computed(() => {
    return [...new Set(cartas.value.map(c => c.quality).filter(Boolean))].sort()
  })
  
  // Estadísticas por serie
  const cartasPorSerie = computed(() => {
    return cartas.value.reduce((acc, carta) => {
      const serie = carta.series || 'Sin serie'
      acc[serie] = (acc[serie] || 0) + 1
      return acc
    }, {})
  })
  
  // Estadísticas por calidad
  const cartasPorCalidad = computed(() => {
    return cartas.value.reduce((acc, carta) => {
      const calidad = carta.quality || 'Sin calidad'
      acc[calidad] = (acc[calidad] || 0) + 1
      return acc
    }, {})
  })
  
  // ========== Acciones ==========
  
  /**
   * Cargar todas las cartas desde Supabase
   */
  async function fetchCartas() {
    loading.value = true
    error.value = null
    
    const result = await cartasService.getAllCartas()
    
    if (result.success) {
      cartas.value = result.data
    } else {
      error.value = result.error
    }
    
    loading.value = false
  }
  
  /**
   * Insertar cartas desde Excel
   * @param {Array} nuevasCartas - Array de cartas a insertar
   */
  async function insertarCartas(nuevasCartas) {
    uploading.value = true
    error.value = null
    
    const result = await cartasService.insertCartas(nuevasCartas)
    
    if (result.success) {
      // Recargar cartas después de insertar
      await fetchCartas()
    } else {
      error.value = result.error
    }
    
    uploading.value = false
    return result
  }
  
  /**
   * Eliminar una carta
   * @param {number} id - ID de la carta
   */
  async function eliminarCarta(id) {
    loading.value = true
    error.value = null
    
    const result = await cartasService.deleteCarta(id)
    
    if (result.success) {
      cartas.value = cartas.value.filter(c => c.id !== id)
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
      serie: '',
      calidad: '',
      busqueda: ''
    }
  }
  
  /**
   * Obtener estadísticas completas
   */
  async function fetchEstadisticas() {
    return await cartasService.getCartasStats()
  }
  
  /**
   * Obtener carta por ID
   * @param {number} id
   */
  function getCartaById(id) {
    return cartas.value.find(c => c.id === id)
  }
  
  return {
    // Estado
    cartas,
    loading,
    error,
    uploading,
    filtros,
    
    // Getters
    totalCartas,
    cartasFiltradas,
    seriesUnicas,
    calidadesUnicas,
    cartasPorSerie,
    cartasPorCalidad,
    
    // Acciones
    fetchCartas,
    insertarCartas,
    eliminarCarta,
    setFiltros,
    limpiarFiltros,
    fetchEstadisticas,
    getCartaById
  }
})

