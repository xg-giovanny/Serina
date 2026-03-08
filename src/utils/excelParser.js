/**
 * excelParser.js
 * Utilidad para parsear archivos Excel usando SheetJS (xlsx)
 * Convierte archivos Excel a JSON para guardar en Supabase
 */

import * as XLSX from 'xlsx'

/**
 * Lee un archivo Excel y lo convierte a JSON
 * @param {File} file - Archivo Excel a procesar
 * @returns {Promise<Array>} - Array de objetos con los datos
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Obtener primera hoja
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Mapea los datos del Excel al formato de Supabase
 * @param {Array} rawData - Datos crudos del Excel
 * @returns {Array} - Datos mapeados al formato de la tabla cartas
 */
export function mapExcelToCartas(rawData) {
  return rawData.map((row, index) => {
    // Mapeo de columnas del Excel a la estructura de la base de datos
    return {
      code: row.code || row.Code || row.CODE || null,
      number: row.number || row.Number || row.numero || row.Número || null,
      edition: row.edition || row.Edition || row.edicion || row.Edición || null,
      character: row.character || row.Character || row.personaje || row.Personaje || null,
      series: row.series || row.Series || row.serie || row.Serie || null,
      quality: row.quality || row.Quality || row.calidad || row.Calidad || null,
      obtainedDate: row.obtainedDate || row['obtained date'] || row.obtained_date || row.fecha_obtencion || null,
      obtainedTimestamp: row.obtainedTimestamp || row['obtained timestamp'] || row.obtained_timestamp || null,
      burnValue: row.burnValue || row['burn value'] || row.burn_value || row.valor_quema || null,
      dye: row.dye || row.Dye || row.tinte || row.Tinte 
        ? { 
            code: row['dye.code'] || row.dye_code || null, 
            name: row['dye.name'] || row.dye_name || row.dye || row.Dye || null 
          }
        : null,
      frame: row.frame || row.Frame || row.marco || row.Marco || null,
      morphed: row.morphed || row.Morphed || row.transformado || row.Transformado || false,
      trimmed: row.trimmed || row.Trimmed || row.recortado || row.Recortado || false,
      tag: row.tag || row.Tag || row.etiqueta || row.Etiqueta || null,
      alias: row.alias || row.Alias || row.apodo || row.Apodo || null,
      wishlists: row.wishlists || row.Wishlists || row.listas_deseos || null,
      fights: row.fights || row.Fights || row.luchas || row.Luchas || null,
      dropQuality: row.dropQuality || row['drop quality'] || row.drop_quality || row.calidad_drop || null,
      dropper: row.dropper || row.Dropper || row.droppeador || null,
      grabber: row.grabber || row.Grabber || row.agarrador || null,
      guild: row.guild || row.Guild || row.gremio || null,
      worker: row.worker || row.Worker || row.trabajador || row.Trabajador
        ? {
            effort: row['worker.effort'] || row.worker_effort || row.esfuerzo || null,
            style: row['worker.style'] || row.worker_style || row.estilo || null,
            purity: row['worker.purity'] || row.worker_purity || row.pureza || null,
            grabber: row['worker.grabber'] || row.worker_grabber || null,
            dropper: row['worker.dropper'] || row.worker_dropper || null,
            quickness: row['worker.quickness'] || row.worker_quickness || row.prisa || null,
            toughness: row['worker.toughness'] || row.worker_toughness || row.dureza || null,
            vanity: row['worker.vanity'] || row.worker_vanity || row.vanidad || null,
            recoveryDate: row['worker.recoveryDate'] || row['worker recovery date'] || row.worker_recovery_date || null,
            recoveryTimestamp: row['worker.recoveryTimestamp'] || row['worker recovery timestamp'] || row.worker_recovery_timestamp || null
          }
        : null,
      created_at: new Date().toISOString()
    }
  })
}

/**
 * Lee y procesa un archivo Excel de cartas
 * @param {File} file - Archivo Excel a procesar
 * @returns {Promise<Array>} - Array de cartas procesadas
 */
export async function processCartasExcel(file) {
  try {
    // Leer archivo
    const rawData = await parseExcelFile(file)
    
    // Validar que tenga datos
    if (!rawData || rawData.length === 0) {
      throw new Error('El archivo Excel está vacío')
    }
    
    // Mapear datos
    const mappedData = mapExcelToCartas(rawData)
    
    return {
      success: true,
      data: mappedData,
      total: mappedData.length
    }
  } catch (error) {
    console.error('Error procesando Excel:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Obtiene las columnas disponibles en el Excel
 * @param {File} file - Archivo Excel
 * @returns {Promise<Array>} - Nombres de columnas
 */
export async function getExcelColumns(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Obtener primera fila como encabezados
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        const columns = jsonData[0] || []
        
        resolve(columns)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Exporta datos a Excel
 * @param {Array} data - Datos a exportar
 * @param {string} filename - Nombre del archivo
 */
export function exportToExcel(data, filename = 'exportacion.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')
  XLSX.writeFile(workbook, filename)
}

export default {
  parseExcelFile,
  mapExcelToCartas,
  processCartasExcel,
  getExcelColumns,
  exportToExcel
}

