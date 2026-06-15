-- ============================================================
-- FERREMAS — MIGRACIÓN PASO 1
-- Cubre la retroalimentación del profe + requisitos del caso:
--   • Tabla sucursales (4 RM + 3 regiones)
--   • Tabla clientes separada de usuarios (con dirección obligatoria)
--   • Tabla boletas (Vendedor: gestionar facturación)
--   • Columnas para flujo Contador (confirmar pagos transferencia, registrar entrega)
--   • Columnas para flujo Admin (RUT + password_changed)
--   • inventario.sucursal_id (stock por sucursal)
--
-- Cómo correr: pegar todo este archivo en el SQL Editor de Supabase
-- y darle "RUN". Es idempotente (se puede correr varias veces sin romper).
-- ============================================================

-- ------------------------------------------------------------
-- 1) TABLA: sucursales
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sucursales (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL UNIQUE,
  direccion  TEXT NOT NULL,
  comuna     VARCHAR(100),
  ciudad     VARCHAR(100) NOT NULL,
  region     VARCHAR(100) NOT NULL,
  telefono   VARCHAR(20),
  activa     BOOLEAN NOT NULL DEFAULT TRUE,
  creada_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2) TABLA: clientes (separada de usuarios, con dirección obligatoria)
--    id apunta a auth.users(id) para reutilizar Supabase Auth.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre     VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  rut        VARCHAR(20),
  telefono   VARCHAR(20),
  direccion  TEXT NOT NULL,             -- obligatorio para despacho
  comuna     VARCHAR(100),
  ciudad     VARCHAR(100),
  activo     BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3) TABLA: boletas (emisión al confirmar pedido)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS boletas (
  id             SERIAL PRIMARY KEY,
  pedido_id      INTEGER NOT NULL UNIQUE REFERENCES pedidos(id) ON DELETE RESTRICT,
  numero_boleta  VARCHAR(50) NOT NULL UNIQUE,
  subtotal       NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  descuento      NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),
  total          NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  fecha_emision  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  emitida_por    UUID REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 4) COLUMNAS NUEVAS en tablas existentes
-- ------------------------------------------------------------

-- inventario: vinculado a sucursal
ALTER TABLE inventario
  ADD COLUMN IF NOT EXISTS sucursal_id INTEGER REFERENCES sucursales(id) ON DELETE SET NULL;

-- usuarios (staff): RUT + flag de cambio de contraseña inicial
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS rut              VARCHAR(20),
  ADD COLUMN IF NOT EXISTS password_changed BOOLEAN NOT NULL DEFAULT FALSE;

-- pagos: trazabilidad de confirmación por Contador
ALTER TABLE pagos
  ADD COLUMN IF NOT EXISTS confirmado_por     UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fecha_confirmacion TIMESTAMPTZ;

-- pedidos: cliente_id (nuevo), entrega (Contador), sucursal de despacho
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS cliente_id    UUID REFERENCES clientes(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS entregado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fecha_entrega TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sucursal_id   INTEGER REFERENCES sucursales(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- 5) ÍNDICES para queries frecuentes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_inventario_sucursal ON inventario(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_inventario_producto_sucursal ON inventario(producto_id, sucursal_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente     ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_sucursal    ON pedidos(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_boletas_pedido      ON boletas(pedido_id);
CREATE INDEX IF NOT EXISTS idx_clientes_email      ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_rut        ON clientes(rut);

-- ------------------------------------------------------------
-- 6) SEED: 7 sucursales reales (4 RM + 3 regiones según el caso)
-- ------------------------------------------------------------
INSERT INTO sucursales (nombre, direccion, comuna, ciudad, region, telefono) VALUES
  ('Ferremas Centro',     'Av. Libertador Bernardo O''Higgins 1234', 'Santiago',   'Santiago',    'Metropolitana', '+56 2 2345 6789'),
  ('Ferremas Vitacura',   'Av. Vitacura 5678',                       'Vitacura',   'Santiago',    'Metropolitana', '+56 2 2987 6543'),
  ('Ferremas Maipú',      'Av. Pajaritos 9012',                      'Maipú',      'Santiago',    'Metropolitana', '+56 2 2555 1212'),
  ('Ferremas La Florida', 'Av. Vicuña Mackenna 7890',                'La Florida', 'Santiago',    'Metropolitana', '+56 2 2444 5566'),
  ('Ferremas Valparaíso', 'Av. Argentina 3456',                      'Valparaíso', 'Valparaíso',  'Valparaíso',    '+56 32 234 5678'),
  ('Ferremas Concepción', 'Av. Manuel Rodríguez 2345',               'Concepción', 'Concepción',  'Biobío',        '+56 41 222 3344'),
  ('Ferremas Temuco',     'Av. Caupolicán 1122',                     'Temuco',     'Temuco',      'Araucanía',     '+56 45 233 4455')
ON CONFLICT (nombre) DO NOTHING;

-- ------------------------------------------------------------
-- 7) Migrar inventario existente a la sucursal 1 (Centro)
--    para no perder data.
-- ------------------------------------------------------------
UPDATE inventario SET sucursal_id = 1 WHERE sucursal_id IS NULL;

-- ------------------------------------------------------------
-- 8) Generar stock distribuido en 3 sucursales para los primeros
--    5 productos (caso de uso explícito del profe: "una sucursal
--    tiene stock, otra no").
-- ------------------------------------------------------------
DO $$
DECLARE
  prod_id INTEGER;
BEGIN
  FOR prod_id IN (SELECT id FROM productos ORDER BY id LIMIT 5)
  LOOP
    -- Vitacura: stock medio (5-15 unidades)
    IF NOT EXISTS (SELECT 1 FROM inventario WHERE producto_id = prod_id AND sucursal_id = 2) THEN
      INSERT INTO inventario (producto_id, sucursal_id, cantidad, ubicacion)
      VALUES (prod_id, 2, (FLOOR(RANDOM() * 10) + 5)::INT, 'Pasillo B - Estante 2');
    END IF;
    -- Valparaíso: stock bajo o cero (0-3 unidades) — para demostrar "esta sucursal NO tiene stock"
    IF NOT EXISTS (SELECT 1 FROM inventario WHERE producto_id = prod_id AND sucursal_id = 5) THEN
      INSERT INTO inventario (producto_id, sucursal_id, cantidad, ubicacion)
      VALUES (prod_id, 5, FLOOR(RANDOM() * 4)::INT, 'Pasillo C - Estante 1');
    END IF;
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- 9) Marcar al admin existente como password_changed = TRUE
--    (ya cambió su contraseña manualmente; no debe ser bloqueado
--    por el middleware requirePasswordChanged).
-- ------------------------------------------------------------
UPDATE usuarios
SET password_changed = TRUE
WHERE rol_id IS NOT NULL;

-- ============================================================
-- VERIFICACIÓN — corre estos SELECTs después para confirmar
-- ============================================================
-- SELECT id, nombre, ciudad, region FROM sucursales ORDER BY id;
-- SELECT producto_id, sucursal_id, cantidad, ubicacion FROM inventario ORDER BY producto_id, sucursal_id;
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_schema='public' AND table_name IN ('clientes','boletas','sucursales')
--   ORDER BY table_name, ordinal_position;
