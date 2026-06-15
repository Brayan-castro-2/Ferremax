// scratch/verify_schema.cjs
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rptsvvzhcqkmfjcojjhk.supabase.co'
const supabaseKey = 'sb_publishable_Uf9Oj0EHbSEB2IgnVJkDOQ_CCIGkOwO'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('--- Verificando la tabla producto ---')
  const { data, error } = await supabase.from('producto').select('*').limit(1)
  
  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ La tabla producto existe! Datos actuales:', data)
    await insertData()
  }
}

async function insertData() {
  console.log('\n--- Insertando datos de prueba ---')
  
  // 1. Insertar un proveedor (requerido por producto según diagrama)
  const { data: prov, error: errProv } = await supabase
    .from('proveedor')
    .insert([{ nombre: 'Proveedor Test', direccion: 'Calle Falsa 123', telefono: '123456789' }])
    .select()

  let idProveedor = null;
  if (!errProv && prov && prov.length > 0) {
    idProveedor = prov[0].id_proveedor
  }

  // 2. Insertar productos
  const nuevosProductos = [
    { nombre: 'Taladro Percutor 700W', descripcion: 'Taladro profesional', precio: 79990, stock: 15, categoria: 'Herramientas Eléctricas', activa: true, id_proveedor: idProveedor },
    { nombre: 'Sierra Circular 1200W', descripcion: 'Corte preciso', precio: 124990, stock: 8, categoria: 'Herramientas Eléctricas', activa: true, id_proveedor: idProveedor },
    { nombre: 'Set de Llaves Combinadas', descripcion: 'Acero al cromo', precio: 15990, stock: 50, categoria: 'Herramientas Manuales', activa: true, id_proveedor: idProveedor },
    { nombre: 'Caja de Clavos 2"', descripcion: '100 unidades', precio: 4500, stock: 100, categoria: 'Ferretería', activa: true, id_proveedor: idProveedor }
  ]

  const { data: prods, error: errProds } = await supabase
    .from('producto')
    .insert(nuevosProductos)
    .select()

  if (errProds) {
    console.error('❌ Error al insertar productos:', errProds.message)
  } else {
    console.log('✅ Productos insertados con éxito:', prods.length)
  }
}

test()
