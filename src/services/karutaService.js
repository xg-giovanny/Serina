/**
 * karutaService.js
 * Servicio para enriquecer datos de cartas usando la API de Karuta (Discord Bot)
 * Documentación: https://docs.karuta.bot/
 */

const KARUTA_API_BASE = 'https://karutabot.com/api'

/**
 * Obtener información de una carta por su código
 * @param {string} code - Código de la carta
 * @returns {Promise<Object>}
 */
export async function getCartaByCode(code) {
  try {
    const response = await fetch(`${KARUTA_API_BASE}/card/${code}`)
    if (!response.ok) throw new Error('Carta no encontrada')
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching carta from Karuta:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtener lista de personajes disponibles en Karuta
 * @returns {Promise<Array>}
 */
export async function getCharacters() {
  try {
    const response = await fetch(`${KARUTA_API_BASE}/characters`)
    if (!response.ok) throw new Error('Error al obtener personajes')
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching characters:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Buscar cartas por personaje
 * @param {string} characterName - Nombre del personaje
 * @returns {Promise<Array>}
 */
export async function searchByCharacter(characterName) {
  try {
    const response = await fetch(`${KARUTA_API_BASE}/search?character=${encodeURIComponent(characterName)}`)
    if (!response.ok) throw new Error('Error en la búsqueda')
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error searching character:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtener información de serie
 * @param {string} series - Nombre de la serie
 * @returns {Promise<Object>}
 */
export async function getSeriesInfo(series) {
  try {
    const response = await fetch(`${KARUTA_API_BASE}/series/${encodeURIComponent(series)}`)
    if (!response.ok) throw new Error('Serie no encontrada')
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching series:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Enriquecer datos de carta con información de Karuta
 * @param {Object} carta - Datos de la carta del Excel
 * @returns {Promise<Object>}
 */
export async function enrichCartaData(carta) {
  if (!carta.code) return { success: false, error: 'Código requerido' }
  
  const result = await getCartaByCode(carta.code)
  
  if (result.success) {
    // Combinar datos del Excel con datos de Karuta
    return {
      success: true,
      data: {
        ...carta,
        karuta: result.data
      }
    }
  }
  
  return result
}

/**
 * Enriquecer múltiples cartas (con límite para evitar rate limiting)
 * @param {Array} cartas - Array de cartas
 * @param {number} limit - Número máximo de peticiones simultáneas
 * @returns {Promise<Array>}
 */
export async function enrichMultipleCartas(cartas, limit = 5) {
  const results = []
  
  for (let i = 0; i < cartas.length; i += limit) {
    const batch = cartas.slice(i, i + limit)
    const batchResults = await Promise.all(
      batch.map(carta => enrichCartaData(carta))
    )
    results.push(...batchResults)
    
    // Pequeña pausa entre batches para evitar rate limiting
    if (i + limit < cartas.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

export default {
  getCartaByCode,
  getCharacters,
  searchByCharacter,
  getSeriesInfo,
  enrichCartaData,
  enrichMultipleCartas
}

