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
