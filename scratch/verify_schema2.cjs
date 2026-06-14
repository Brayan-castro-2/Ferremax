// scratch/verify_schema2.cjs
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rptsvvzhcqkmfjcojjhk.supabase.co'
const supabaseKey = 'sb_publishable_Uf9Oj0EHbSEB2IgnVJkDOQ_CCIGkOwO'
const supabase = createClient(supabaseUrl, supabaseKey)

async function insertData() {
  console.log('--- Insertando datos de prueba ---')
  
  // Insertar un proveedor
  const { data: prov } = await supabase
    .from('proveedor')
    .insert([{ nombre: 'Proveedor Test', direccion: 'Calle Falsa 123', telefono: '123456789' }])
    .select()

  let idProveedor = prov ? prov[0].id_proveedor : null;

  // Insertar productos sin especificar 'activa' (asumiendo que tiene default o no es requerido)
  const nuevosProductos = [
    { nombre: 'Taladro Percutor 700W', descripcion: 'Taladro profesional', precio: 79990, stock: 15, categoria: 'Herramientas Eléctricas', id_proveedor: idProveedor },
    { nombre: 'Sierra Circular 1200W', descripcion: 'Corte preciso', precio: 124990, stock: 8, categoria: 'Herramientas Eléctricas', id_proveedor: idProveedor },
    { nombre: 'Set de Llaves Combinadas', descripcion: 'Acero al cromo', precio: 15990, stock: 50, categoria: 'Herramientas Manuales', id_proveedor: idProveedor },
    { nombre: 'Caja de Clavos 2"', descripcion: '100 unidades', precio: 4500, stock: 100, categoria: 'Ferretería', id_proveedor: idProveedor }
  ]

  const { data: prods, error: errProds } = await supabase
    .from('producto')
    .insert(nuevosProductos)
    .select()

  if (errProds) {
    console.error('❌ Error al insertar productos:', errProds.message)
  } else {
    console.log('✅ Productos insertados con éxito:', prods.length)
    
    // Si los productos se insertaron, intentemos insertar roles e inventario
    await supabase.from('rol').insert([{ nombre: 'Administrador' }, { nombre: 'Cliente' }])
    
    if (prods.length > 0) {
      await supabase.from('inventario').insert([
        { id_producto: prods[0].id_producto, cantidad: 15, ubicacion: 'Pasillo A' },
        { id_producto: prods[1].id_producto, cantidad: 8, ubicacion: 'Pasillo A' }
      ])
      console.log('✅ Inventario insertado con éxito.')
    }
  }
}

insertData()
