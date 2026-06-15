-- ============================================================
-- FERREMAS — MIGRACIÓN PASO 2 (Gestión de riesgos)
--   • Tabla `devoluciones` para flujo de retorno/reembolso
--   • Columnas `notas_cliente` y `motivo_cancelacion` en pedidos
--
-- Pegar todo en Supabase SQL Editor → RUN. Idempotente.
-- ============================================================

-- ── Columnas nuevas en pedidos ─────────────────────────────
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS notas_cliente       TEXT,
  ADD COLUMN IF NOT EXISTS motivo_cancelacion  TEXT,
  ADD COLUMN IF NOT EXISTS fecha_cancelacion   TIMESTAMPTZ;

-- ── Tabla devoluciones ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS devoluciones (
  id              SERIAL PRIMARY KEY,
  pedido_id       INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE RESTRICT,
  motivo          TEXT NOT NULL,
  estado          VARCHAR(50) NOT NULL DEFAULT 'solicitada'
                    CHECK (estado IN ('solicitada','aprobada','rechazada','procesada')),
  solicitada_por  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  procesada_por   UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_procesada TIMESTAMPTZ,
  notas_internas  TEXT,
  monto_devuelto  NUMERIC(12, 2) CHECK (monto_devuelto IS NULL OR monto_devuelto >= 0)
);

CREATE INDEX IF NOT EXISTS idx_devoluciones_pedido ON devoluciones(pedido_id);
CREATE INDEX IF NOT EXISTS idx_devoluciones_estado ON devoluciones(estado);

-- ============================================================
-- Verificación
-- ============================================================
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_schema='public' AND table_name IN ('devoluciones','pedidos')
--   ORDER BY table_name, ordinal_position;
