// src/lib/supabase.js
// Configuración central del cliente Supabase
// NOTA: En modo mockup (VITE_APP_MODE=mockup) este cliente NO se usa.
// Cuando tengas tus credenciales, agrégalas en .env.local y cambia el modo a "production".

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || ''
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// El cliente queda inicializado pero no hace peticiones en modo mockup
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const isMockup = import.meta.env.VITE_APP_MODE === 'mockup' || !supabaseUrl || !supabaseKey

export const verificarConexion = async () => {
  if (isMockup) {
    console.log('🟡 FERREMAS: Modo MOCKUP activo (sin Supabase real)')
    return { ok: false, modo: 'mockup' }
  }

  try {
    // Intenta hacer una query simple a Supabase
    const { error } = await supabase
      .from('roles')
      .select('id')
      .limit(1)

    if (error) {
      console.error('🔴 FERREMAS: Error de conexión con Supabase:', error.message)
      console.error('   → Verifica que las migraciones SQL fueron ejecutadas')
      console.error('   → Verifica VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local')
      return { ok: false, error: error.message }
    }

    console.log('🟢 FERREMAS: Conexión con Supabase OK')
    return { ok: true, modo: 'produccion' }

  } catch (e) {
    console.error('🔴 FERREMAS: No se pudo conectar con Supabase:', e.message)
    return { ok: false, error: e.message }
  }
}
