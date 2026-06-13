-- ============================================================
-- FERREMAS - Schema oficial adaptado para Supabase
-- Ejecuta esto en tu Supabase SQL Editor
-- ============================================================

-- 1. Limpiar tablas viejas del esquema anterior (si existen)
DROP TABLE IF EXISTS producto_promocion CASCADE;
DROP TABLE IF EXISTS historial_pedido CASCADE;
DROP TABLE IF EXISTS boleta CASCADE;
DROP TABLE IF EXISTS pago CASCADE;
DROP TABLE IF EXISTS detalle_pedido CASCADE;
DROP TABLE IF EXISTS pedido CASCADE;
DROP TABLE IF EXISTS promocion_3x2 CASCADE;
DROP TABLE IF EXISTS cupon CASCADE;
DROP TABLE IF EXISTS promocion CASCADE;
DROP TABLE IF EXISTS inventario CASCADE;
DROP TABLE IF EXISTS sucursal CASCADE;
DROP TABLE IF EXISTS producto CASCADE;
DROP TABLE IF EXISTS proveedor CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS rol CASCADE;

-- Limpiar tablas si existieran con el nuevo nombre (reinicio)
DROP TABLE IF EXISTS historial_pedidos CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ============================================================
-- TABLA: roles
-- ============================================================
CREATE TABLE public.roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================================
-- TABLA: usuarios
-- IMPORTANTE: El ID es un UUID que hace referencia directa
-- a auth.users (el sistema nativo de Supabase Auth)
-- ============================================================
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    rol_id INT REFERENCES public.roles(id) ON DELETE SET NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: productos
-- ============================================================
CREATE TABLE public.productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoria VARCHAR(100),
    imagen_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- TABLA: pedidos
-- ============================================================
CREATE TABLE public.pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente'
           CHECK (estado IN ('pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado', 'cancelado')),
    tipo_entrega VARCHAR(50) NOT NULL DEFAULT 'retiro'
           CHECK (tipo_entrega IN ('retiro', 'despacho')),
    direccion TEXT,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: detalle_pedido
-- ============================================================
CREATE TABLE public.detalle_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0)
);

-- ============================================================
-- TABLA: pagos
-- ============================================================
CREATE TABLE public.pagos (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL UNIQUE REFERENCES public.pedidos(id) ON DELETE CASCADE,
    metodo VARCHAR(50) NOT NULL
           CHECK (metodo IN ('tarjeta', 'transferencia', 'efectivo', 'webpay')),
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente'
           CHECK (estado IN ('pendiente', 'confirmado', 'rechazado')),
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: historial_pedidos
-- ============================================================
CREATE TABLE public.historial_pedidos (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    estado VARCHAR(50) NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: inventario (Ubicaciones en bodega/sucursales)
-- ============================================================
CREATE TABLE public.inventario (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    ubicacion VARCHAR(150),
    cantidad INT NOT NULL DEFAULT 0 CHECK (cantidad >= 0)
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- 1. Registrar en historial al cambiar estado de pedido
CREATE OR REPLACE FUNCTION public.fn_registrar_historial_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO public.historial_pedidos (pedido_id, estado, fecha)
        VALUES (NEW.id, NEW.estado, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_historial_pedido ON public.pedidos;
CREATE TRIGGER trg_historial_pedido
AFTER UPDATE OF estado ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.fn_registrar_historial_pedido();

-- 2. Descontar stock al confirmar pedido
CREATE OR REPLACE FUNCTION public.fn_descontar_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'confirmado' AND OLD.estado = 'pendiente' THEN
        UPDATE public.productos p
        SET stock = p.stock - dp.cantidad
        FROM public.detalle_pedido dp
        WHERE dp.pedido_id = NEW.id
          AND p.id = dp.producto_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_descontar_stock ON public.pedidos;
CREATE TRIGGER trg_descontar_stock
AFTER UPDATE OF estado ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.fn_descontar_stock();

-- ============================================================
-- DATOS SEMILLA (INSERTS)
-- ============================================================

-- Roles básicos obligatorios
INSERT INTO public.roles (nombre) VALUES
    ('Administrador'),
    ('Vendedor'),
    ('Bodeguero'),
    ('Contador'),
    ('Cliente')
ON CONFLICT (nombre) DO NOTHING;

-- Productos de tu catálogo inicial
INSERT INTO public.productos (nombre, descripcion, precio, stock, categoria, activo) VALUES
('Taladro Percutor 700W', 'Taladro con percusión para mampostería', 79990, 12, 'Herramientas Eléctricas', true),
('Sierra Circular 1400W', 'Sierra de alta potencia para maderas', 124990, 8, 'Herramientas Eléctricas', true),
('Destornillador Eléctrico', 'Batería de larga duración 18V', 34990, 25, 'Herramientas Eléctricas', true),
('Martillo 500g Mango Fibra', 'Mango ergonómico antideslizante', 12990, 40, 'Herramientas Manuales', true),
('Llave Inglesa 10"', 'Acero forjado resistente', 8990, 30, 'Herramientas Manuales', true),
('Set Brocas HSS 19 piezas', 'Para metal, madera y plástico', 19990, 3, 'Herramientas Manuales', true),
('Cemento 25kg Portland', 'Alta resistencia, uso general', 7490, 60, 'Construcción', true),
('Pintura Látex Blanca 4L', 'Interior/exterior, lavable', 18990, 18, 'Pintura', true),
('Rodillo 22cm Lana', 'Para superficies lisas y semilisas', 4990, 35, 'Pintura', true),
('Extensión 10m 3 Enchufes', 'Cable 2.5mm², uso industrial', 14990, 22, 'Electricidad', true),
('Casco de Seguridad HDPE', 'Certificado ANSI Z89.1', 9990, 0, 'Seguridad', true),
('Guantes de Trabajo Kevlar', 'Protección contra cortes', 5990, 50, 'Seguridad', true);
