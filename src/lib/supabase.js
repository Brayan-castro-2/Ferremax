// src/lib/supabase.js
// Configuración central del cliente Supabase

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
// Soporta tanto el formato nuevo (PUBLISHABLE_KEY) como el antiguo (ANON_KEY)
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
                 || import.meta.env.VITE_SUPABASE_ANON_KEY
                 || ''

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const isMockup = import.meta.env.VITE_APP_MODE === 'mockup' || !supabaseUrl || !supabaseKey

if (import.meta.env.DEV) {
  console.log('[Supabase] URL:', supabaseUrl || '❌ NO DEFINIDA')
  console.log('[Supabase] Key:', supabaseKey ? '✅ OK' : '❌ NO DEFINIDA')
  console.log('[Supabase] Modo Mockup:', isMockup)
}

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

