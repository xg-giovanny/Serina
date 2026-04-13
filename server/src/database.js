import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY !== 'PENDIENTE_AGREGAR_TU_SERVICE_ROLE_KEY' 
  ? process.env.SUPABASE_SERVICE_ROLE_KEY 
  : process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos en .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('✅ Conectado a Supabase desde el servidor')

export default supabase
