// scratch/seed_database.cjs
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rptsvvzhcqkmfjcojjhk.supabase.co'
// Usando la SERVICE ROLE KEY para saltarse el Row-Level Security (RLS)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdHN2dnpoY3FrbWZqY29qamhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk1MzA1NCwiZXhwIjoyMDkzNTI5MDU0fQ.PrVo3_PVZNYmVdLlpqyya5H0pWPf6_r1YMooWThk1z0'
const supabase = createClient(supabaseUrl, supabaseKey)

async function insertData() {
  console.log('--- Insertando datos de prueba (Poderes de Administrador) ---')
  
  // 1. Roles
  await supabase.from('rol').insert([{ nombre: 'Administrador' }, { nombre: 'Cliente' }, { nombre: 'Vendedor' }])
  
  const { data: roles } = await supabase.from('rol').select('*')
  const rolAdmin = roles?.find(r => r.nombre === 'Administrador')?.id_rol || 1
  const rolCliente = roles?.find(r => r.nombre === 'Cliente')?.id_rol || 2

  // 2. Usuarios de Prueba
  await supabase.from('usuario').insert([
    { nombre: 'Profesor', correo: 'profe@ferremas.cl', contrasenia: 'admin123', id_rol: rolAdmin }
  ])

  // 3. Proveedor (Necesario para insertar producto)
  const { data: prov } = await supabase
    .from('proveedor')
    .insert([{ nombre: 'Proveedor Test', direccion: 'Calle Falsa 123', telefono: '123456789' }])
    .select()
  
  let idProveedor = prov ? prov[0].id_proveedor : null;

  // 4. Productos
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
    console.log('✅ 4 Productos insertados con éxito.')
    
    // 5. Inventario
    if (prods.length > 0) {
      await supabase.from('inventario').insert([
        { id_producto: prods[0].id_producto, cantidad: 15, ubicacion: 'Bodega Central' },
        { id_producto: prods[1].id_producto, cantidad: 8, ubicacion: 'Bodega Central' },
        { id_producto: prods[2].id_producto, cantidad: 50, ubicacion: 'Estante 5' },
        { id_producto: prods[3].id_producto, cantidad: 100, ubicacion: 'Estante 1' }
      ])
      console.log('✅ Inventario creado con éxito.')
    }
  }
}

insertData()
