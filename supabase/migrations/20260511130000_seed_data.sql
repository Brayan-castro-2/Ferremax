-- =============================================================================
-- FERREMAS — Datos semilla (seed)
-- Ejecutar en Supabase SQL Editor DESPUÉS de la migración de tablas plurales.
-- Idempotente: usa ON CONFLICT DO NOTHING / DO UPDATE.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1) ROLES
--    Los roles son referenciados por usuarios.rol_id → roles.id
--    Nombres alineados con TiposDeDatos.js: Administrador | Vendedor |
--    Bodeguero | Contador | Cliente
-- -----------------------------------------------------------------------------

INSERT INTO public.roles (id, nombre) VALUES
  (1, 'Administrador'),
  (2, 'Vendedor'),
  (3, 'Bodeguero'),
  (4, 'Contador'),
  (5, 'Cliente')
ON CONFLICT (id) DO UPDATE
  SET nombre = EXCLUDED.nombre;

-- Sincronizar secuencia para que el próximo INSERT auto asigne id >= 6
SELECT setval(
  pg_get_serial_sequence('public.roles', 'id'),
  GREATEST(5, (SELECT MAX(id) FROM public.roles))
);

-- -----------------------------------------------------------------------------
-- 2) PRODUCTOS
--    Columnas usadas por el backend: id, nombre, descripcion, precio,
--    stock, categoria, activo
--    Precios en CLP (sin decimales).
-- -----------------------------------------------------------------------------

INSERT INTO public.productos (nombre, descripcion, precio, stock, categoria, activo) VALUES
  (
    'Taladro Percutor 800W',
    'Taladro eléctrico percutor 800W con mandril de 13 mm, 2 velocidades y maletín incluido. Ideal para hormigón y mampostería.',
    49990,
    25,
    'Herramientas Eléctricas',
    true
  ),
  (
    'Amoladora Angular 4½" 850W',
    'Amoladora compacta de 850W, disco de 115 mm, protector ajustable y empuñadura lateral. Apta para corte y desbaste.',
    34990,
    18,
    'Herramientas Eléctricas',
    true
  ),
  (
    'Sierra Circular 7¼" 1200W',
    'Sierra circular de 1200W con guía paralela, profundidad de corte 65 mm a 90° y hoja de carburo de 24 dientes.',
    64990,
    12,
    'Herramientas Eléctricas',
    true
  ),
  (
    'Martillo Carpintero 500g',
    'Martillo de carpintero con cabeza de acero forjado de 500 g y mango de fibra de vidrio antideslizante.',
    8990,
    60,
    'Herramientas Manuales',
    true
  ),
  (
    'Juego Destornilladores 10 piezas',
    'Set de 10 destornilladores (planos y Phillips) con mangos ergonómicos bimaterial y puntas endurecidas CrV.',
    12490,
    45,
    'Herramientas Manuales',
    true
  ),
  (
    'Llave Pico de Loro 10"',
    'Llave ajustable de 10 pulgadas (250 mm) con quijada cromada antideslizante. Capacidad máxima 30 mm.',
    7490,
    55,
    'Herramientas Manuales',
    true
  ),
  (
    'Cemento Gris 25 kg',
    'Cemento Portland tipo I, saco de 25 kg. Para obras civiles, fundaciones y hormigón en masa.',
    5990,
    200,
    'Construcción',
    true
  ),
  (
    'Pintura Látex Interior 4L',
    'Pintura látex interior blanco mate lavable, rendimiento aprox. 10–12 m² por litro. Secado rápido (2 h).',
    18990,
    80,
    'Pintura',
    true
  )
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3) USUARIO DE PRUEBA
--
--    IMPORTANTE: Supabase Auth es la fuente de verdad de autenticación.
--    Este INSERT crea solo el perfil en public.usuarios (tabla de datos,
--    no la tabla de auth). El UUID debe coincidir con el creado en Auth.
--
--    PASO PREVIO (hazlo UNA VEZ en Authentication > Users > Add User):
--      Email   : cliente@ferremas.cl
--      Password: Ferremas2026!
--
--    Luego copia el UUID generado y reemplaza el valor abajo.
--    Si ya tienes el UUID, puedes ejecutar este bloque directamente.
--
--    Columnas usadas por auth.service.js: id, nombre, rol_id, activo
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  v_rol_id  INT;
  v_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- ← REEMPLAZAR con UUID real de Auth
BEGIN
  -- Obtener id del rol Cliente
  SELECT id INTO v_rol_id FROM public.roles WHERE nombre = 'Cliente' LIMIT 1;

  IF v_rol_id IS NULL THEN
    RAISE EXCEPTION 'Rol "Cliente" no encontrado. Ejecuta primero la sección de roles.';
  END IF;

  -- Insertar perfil si no existe (basado en el UUID de Auth)
  INSERT INTO public.usuarios (id, nombre, rol_id, activo)
  VALUES (v_user_id, 'Cliente Test', v_rol_id, true)
  ON CONFLICT (id) DO UPDATE
    SET nombre  = EXCLUDED.nombre,
        rol_id  = EXCLUDED.rol_id,
        activo  = EXCLUDED.activo;

  RAISE NOTICE 'Usuario "Cliente Test" (id: %) listo con rol_id = %', v_user_id, v_rol_id;
END $$;

COMMIT;

-- =============================================================================
-- Verificaciones post-seed (pegar en una query separada)
-- =============================================================================
-- SELECT id, nombre FROM public.roles ORDER BY id;
-- SELECT id, nombre, precio, stock, categoria FROM public.productos ORDER BY categoria, nombre;
-- SELECT id, nombre, activo FROM public.usuarios;
-- =============================================================================
