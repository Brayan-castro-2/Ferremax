// scratch/test_new_db.cjs
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rptsvvzhcqkmfjcojjhk.supabase.co'
const supabaseKey = 'sb_publishable_Uf9Oj0EHbSEB2IgnVJkDOQ_CCIGkOwO'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('--- Probando conexión a la nueva DB ---')
  console.log('URL:', supabaseUrl)
  
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, precio, stock')
      .limit(5)

    if (error) {
      console.error('❌ Error al conectar:', error.message)
      if (error.message.includes('404')) console.log('Tip: La tabla "productos" no parece existir en esta DB.')
    } else {
      console.log('✅ ¡Conexión exitosa!')
      console.log('Productos encontrados:', data ? data.length : 0)
      if (data && data.length > 0) {
        console.table(data)
      } else {
        console.log('La tabla "productos" está vacía o no existe.')
      }
    }
  } catch (err) {
    console.error('💥 Error inesperado:', err.message)
  }
}

test()
