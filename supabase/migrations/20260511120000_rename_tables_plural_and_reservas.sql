-- =============================================================================
-- FERREMAS — Migración: tablas en plural (alineado con Node/Vue) + reservas
-- Ejecutar en Supabase SQL Editor (PostgreSQL 14+ recomendado).
-- Idempotente en la medida de lo posible (IF EXISTS / IF NOT EXISTS).
-- =============================================================================
-- Origen típico (singular): rol, usuario, cliente, producto, pedido, pago,
--   boleta, historial_pedido, promocion, proveedor, sucursal, cupon,
--   producto_promocion  (+ detalle_pedido, inventario sin cambio)
-- Destino (código): roles, usuarios, clientes, productos, pedidos, pagos,
--   boletas, historial_pedidos, promociones, proveedores, sucursales, cupones,
--   producto_promociones, detalle_pedido, inventario, reservas
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1) Renombrar tablas (PostgreSQL actualiza FKs al renombrar la tabla destino)
-- -----------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.rol RENAME TO roles;
ALTER TABLE IF EXISTS public.usuario RENAME TO usuarios;
ALTER TABLE IF EXISTS public.cliente RENAME TO clientes;
ALTER TABLE IF EXISTS public.producto RENAME TO productos;
ALTER TABLE IF EXISTS public.pedido RENAME TO pedidos;
ALTER TABLE IF EXISTS public.pago RENAME TO pagos;
ALTER TABLE IF EXISTS public.boleta RENAME TO boletas;
ALTER TABLE IF EXISTS public.historial_pedido RENAME TO historial_pedidos;
ALTER TABLE IF EXISTS public.promocion RENAME TO promociones;
ALTER TABLE IF EXISTS public.proveedor RENAME TO proveedores;
ALTER TABLE IF EXISTS public.sucursal RENAME TO sucursales;
ALTER TABLE IF EXISTS public.cupon RENAME TO cupones;
ALTER TABLE IF EXISTS public.producto_promocion RENAME TO producto_promociones;
-- public.detalle_pedido y public.inventario: mismos nombres que el código

-- -----------------------------------------------------------------------------
-- 2) Renombrar índices PK/UNIQUE típicos (solo si aún tienen el nombre antiguo)
--    Si falla alguna línea, consulta: SELECT indexname, tablename FROM pg_indexes
--    WHERE schemaname = 'public' ORDER BY tablename;
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'rol_pkey') THEN
    ALTER INDEX public.rol_pkey RENAME TO roles_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'usuario_pkey') THEN
    ALTER INDEX public.usuario_pkey RENAME TO usuarios_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'cliente_pkey') THEN
    ALTER INDEX public.cliente_pkey RENAME TO clientes_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'producto_pkey') THEN
    ALTER INDEX public.producto_pkey RENAME TO productos_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'pedido_pkey') THEN
    ALTER INDEX public.pedido_pkey RENAME TO pedidos_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'pago_pkey') THEN
    ALTER INDEX public.pago_pkey RENAME TO pagos_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'boleta_pkey') THEN
    ALTER INDEX public.boleta_pkey RENAME TO boletas_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'historial_pedido_pkey') THEN
    ALTER INDEX public.historial_pedido_pkey RENAME TO historial_pedidos_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'promocion_pkey') THEN
    ALTER INDEX public.promocion_pkey RENAME TO promociones_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'proveedor_pkey') THEN
    ALTER INDEX public.proveedor_pkey RENAME TO proveedores_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'sucursal_pkey') THEN
    ALTER INDEX public.sucursal_pkey RENAME TO sucursales_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'cupon_pkey') THEN
    ALTER INDEX public.cupon_pkey RENAME TO cupones_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'i' AND c.relname = 'producto_promocion_pkey') THEN
    ALTER INDEX public.producto_promocion_pkey RENAME TO producto_promociones_pkey;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Índices secundarios: renombrar si existen con nombres antiguos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_pedido_usuario') THEN
    ALTER INDEX public.idx_pedido_usuario RENAME TO idx_pedidos_usuario;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_pedido_cliente') THEN
    ALTER INDEX public.idx_pedido_cliente RENAME TO idx_pedidos_cliente;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_historial_pedido_pedido') THEN
    ALTER INDEX public.idx_historial_pedido_pedido RENAME TO idx_historial_pedidos_pedido;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Crear índices útiles en tablas que NO dependen de usuario_id (idempotente)
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_pedido_id ON public.detalle_pedido (pedido_id);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_producto_id ON public.detalle_pedido (producto_id);
CREATE INDEX IF NOT EXISTS idx_historial_pedidos_pedido_id ON public.historial_pedidos (pedido_id);
CREATE INDEX IF NOT EXISTS idx_pagos_pedido_id ON public.pagos (pedido_id);

-- -----------------------------------------------------------------------------
-- 3) usuarios.activo
-- -----------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.usuarios
  ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

UPDATE public.usuarios SET activo = TRUE WHERE activo IS NULL;

-- -----------------------------------------------------------------------------
-- 4) pedidos.usuario_id (código espera UUID → usuarios)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF to_regclass('public.pedidos') IS NULL THEN
    RETURN;
  END IF;

  -- A) Ya existe usuario_id: sincronizar desde clientes y quitar cliente_id si aplica
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'usuario_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'cliente_id'
    )
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'clientes' AND column_name = 'usuario_id'
    ) THEN
      UPDATE public.pedidos p
      SET usuario_id = c.usuario_id
      FROM public.clientes c
      WHERE p.cliente_id = c.id
        AND (p.usuario_id IS NULL OR p.usuario_id IS DISTINCT FROM c.usuario_id);
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'cliente_id'
    ) THEN
      ALTER TABLE public.pedidos DROP COLUMN cliente_id CASCADE;
    END IF;
    RETURN;
  END IF;

  -- B) No hay usuario_id pero sí cliente_id + clientes.usuario_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'cliente_id'
  )
  AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clientes' AND column_name = 'usuario_id'
  ) THEN
    ALTER TABLE public.pedidos ADD COLUMN usuario_id UUID;
    UPDATE public.pedidos p
    SET usuario_id = c.usuario_id
    FROM public.clientes c
    WHERE p.cliente_id = c.id;
    ALTER TABLE public.pedidos DROP COLUMN cliente_id CASCADE;
    RETURN;
  END IF;

  -- C) Solo cliente_id (p.ej. FK mal nombrada): renombrar a usuario_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'cliente_id'
  ) THEN
    ALTER TABLE public.pedidos RENAME COLUMN cliente_id TO usuario_id;
    RETURN;
  END IF;

  -- D) Ninguna FK de usuario: agregar columna vacía
  ALTER TABLE public.pedidos ADD COLUMN usuario_id UUID;
END $$;

-- FK a usuarios (solo si no existe ya)
DO $$
BEGIN
  IF to_regclass('public.pedidos') IS NULL OR to_regclass('public.usuarios') IS NULL THEN
    RETURN;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pedidos_usuario_id_fkey'
      AND conrelid = 'public.pedidos'::regclass
  ) THEN
    RETURN;
  END IF;
  ALTER TABLE public.pedidos
    ADD CONSTRAINT pedidos_usuario_id_fkey
    FOREIGN KEY (usuario_id) REFERENCES public.usuarios (id)
    ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE NOTICE 'No se pudo crear pedidos_usuario_id_fkey: revisa valores huérfanos en pedidos.usuario_id';
  WHEN OTHERS THEN
    RAISE NOTICE 'pedidos_usuario_id_fkey: %', SQLERRM;
END $$;

-- Índices sobre pedidos.usuario_id (creados DESPUÉS de que la columna ya existe)
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_id ON public.pedidos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_creado_en ON public.pedidos (creado_en DESC);

-- -----------------------------------------------------------------------------
-- 5) Tabla reservas
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reservas (
  id          SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES public.productos (id) ON DELETE CASCADE,
  pedido_id   INTEGER REFERENCES public.pedidos (id) ON DELETE SET NULL,
  usuario_id  UUID REFERENCES public.usuarios (id) ON DELETE SET NULL,
  cantidad    INTEGER NOT NULL CHECK (cantidad > 0),
  estado      VARCHAR(20) DEFAULT 'activa',
  creada_en   TIMESTAMPTZ DEFAULT now(),
  expira_en   TIMESTAMPTZ NOT NULL,
  CONSTRAINT reservas_estado_chk CHECK (estado IN ('activa', 'confirmada', 'expirada'))
);

CREATE INDEX IF NOT EXISTS idx_reservas_producto ON public.reservas (producto_id, estado, expira_en);
CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON public.reservas (usuario_id) WHERE usuario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reservas_pedido ON public.reservas (pedido_id) WHERE pedido_id IS NOT NULL;

COMMENT ON TABLE public.reservas IS 'Reservas lógicas de stock (TTL); backend reservation.service / orders.';

COMMIT;

-- =============================================================================
-- Post-check manual (opcional en SQL Editor)
-- =============================================================================
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1;
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'pedidos' ORDER BY ordinal_position;
-- =============================================================================
