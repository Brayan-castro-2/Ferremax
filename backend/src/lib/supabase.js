// backend/src/lib/supabase.js
// Cliente Supabase centralizado para el backend
// Usa SUPABASE_SERVICE_ROLE_KEY para operaciones admin (bypass RLS)
// Usa SUPABASE_ANON_KEY para operaciones de cliente

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] ⚠️  Faltan SUPABASE_URL o SUPABASE_ANON_KEY en el .env')
  process.exit(1)
}

/** Cliente con anon key (respeta RLS) — para operaciones de usuario */
const supabase = createClient(supabaseUrl, supabaseKey)

/** Cliente con service_role key (bypass RLS) — para operaciones admin */
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : supabase  // fallback al anon si no está configurada

module.exports = { supabase, supabaseAdmin }
