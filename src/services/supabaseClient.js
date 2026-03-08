import { createClient } from '@supabase/supabase-js'

// Variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validar URL
const isValidUrl = supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))

let supabase = null

// Solo crear cliente si las credenciales son válidas
if (isValidUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Conectado a Supabase')
} else {
  console.warn('⚠️ Modo demo: Supabase no configurado. Edita el archivo .env')
}

export { supabase }

/**
 * Verificar si Supabase está configuradoS
 */
export function isSupabaseConfigured() {
  return supabase !== null
}

/**
 * Verificar conexión con Supabase
 */
export async function checkConnection() {
  if (!supabase) return false
  try {
    const { error } = await supabase.from('nomina').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

export default supabase

