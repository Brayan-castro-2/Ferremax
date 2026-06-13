-- ============================================================
-- FIX: Eliminar recursión infinita en políticas RLS
-- ============================================================

-- 1. Eliminar políticas conflictivas (recursivas)
DROP POLICY IF EXISTS "usuarios_admin_lectura_total" ON public.usuarios;
DROP POLICY IF EXISTS "pedidos_staff_lectura_total" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos_actualizacion_staff" ON public.pedidos;

-- ============================================================
-- FIX: Recrear Trigger de registro para asegurar que inserte
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, email, rol_id, activo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.email,
    (SELECT id FROM public.roles WHERE nombre = 'Cliente' LIMIT 1),
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
