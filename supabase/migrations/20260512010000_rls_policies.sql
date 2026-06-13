-- ============================================================
-- RLS POLICIES — FERREMAS
-- Permite lectura pública en tablas del catálogo
-- Protege datos sensibles (usuarios, pedidos) con auth
-- ============================================================

-- PRODUCTOS: lectura pública (cualquiera puede ver el catálogo)
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "productos_lectura_publica" ON public.productos
  FOR SELECT USING (true);

-- ROLES: lectura pública (necesario para el join de usuarios)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_lectura_publica" ON public.roles
  FOR SELECT USING (true);

-- INVENTARIO: lectura pública
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventario_lectura_publica" ON public.inventario
  FOR SELECT USING (true);

-- USUARIOS: solo el propio usuario puede leer su perfil
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usuarios_lectura_propia" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

-- USUARIOS: administradores pueden leer todos los usuarios
CREATE POLICY "usuarios_admin_lectura_total" ON public.usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      JOIN public.roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'Administrador'
    )
  );

-- USUARIOS: el propio usuario puede actualizar sus datos
CREATE POLICY "usuarios_actualizacion_propia" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

-- USUARIOS: inserción solo mediante service_role (trigger)
CREATE POLICY "usuarios_insercion_service_role" ON public.usuarios
  FOR INSERT WITH CHECK (true);

-- PEDIDOS: cliente ve solo sus pedidos
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pedidos_lectura_propia" ON public.pedidos
  FOR SELECT USING (auth.uid() = usuario_id);

-- PEDIDOS: vendedor y admin ven todos los pedidos
CREATE POLICY "pedidos_staff_lectura_total" ON public.pedidos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      JOIN public.roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre IN ('Vendedor', 'Administrador')
    )
  );

-- PEDIDOS: cliente puede crear pedidos (insertar)
CREATE POLICY "pedidos_insercion_cliente" ON public.pedidos
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- PEDIDOS: vendedor/admin puede actualizar estado
CREATE POLICY "pedidos_actualizacion_staff" ON public.pedidos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      JOIN public.roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre IN ('Vendedor', 'Administrador')
    )
  );

-- DETALLE_PEDIDO: mismo acceso que pedidos
ALTER TABLE public.detalle_pedido ENABLE ROW LEVEL SECURITY;
CREATE POLICY "detalle_lectura_propia" ON public.detalle_pedido
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = detalle_pedido.pedido_id AND p.usuario_id = auth.uid()
    )
  );

CREATE POLICY "detalle_insercion_cliente" ON public.detalle_pedido
  FOR INSERT WITH CHECK (true);


-- INSTRUCCIONES:
-- 1. Ir a Supabase → SQL Editor → New query
-- 2. Pegar TODO este contenido
-- 3. Click en "Run"
-- 4. Verificar en Authentication → Policies que aparecen las policies
