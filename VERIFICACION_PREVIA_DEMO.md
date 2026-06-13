# ✅ VERIFICACIÓN PREVIA A LA DEMO — FERREMAS

> **Última actualización:** 12/05/2026  
> Sigue este documento en orden de arriba hacia abajo antes de presentar.

---

## 1. CHECKLIST DE ARCHIVOS CRÍTICOS

Verifica que todos estos archivos existen y contienen valores reales (no placeholders):

### Variables de entorno

- [ ] **`backend/.env`** — Debe existir con credenciales reales
  ```
  SUPABASE_URL=https://TU-PROYECTO.supabase.co    ← NO debe decir "xxxx"
  SUPABASE_ANON_KEY=eyJ...                         ← key real de Supabase
  SUPABASE_SERVICE_ROLE_KEY=eyJ...                 ← key real de Supabase
  JWT_SECRET=<64 caracteres hex>                   ← generado con crypto
  JWT_EXPIRES_IN=8h
  PORT=3000
  NODE_ENV=development
  CORS_ORIGIN=http://localhost:5173
  ```
  > ⚡ Si no existe: ejecuta `setup.bat` (Windows) o `bash setup.sh` (Mac/Linux)

- [ ] **`.env.local`** — Debe existir en la raíz del proyecto
  ```
  VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ...
  VITE_APP_MODE=production                         ← CRÍTICO: NO debe decir "mockup"
  VITE_API_URL=http://localhost:3000
  ```

### Base de datos Supabase

- [ ] **Migración principal ejecutada:**  
  `supabase/migrations/20260511120000_rename_tables_plural_and_reservas.sql`

- [ ] **Datos semilla ejecutados:**  
  `supabase/migrations/20260511130000_seed_data.sql`

  > ⚠️ Para verificar: ir a Supabase → **Table Editor** → confirmar que existen tablas `productos`, `usuarios`, `pedidos`, `inventario`, `roles`

### Postman

- [ ] Colección importada en Postman:  
  `postman/FERREMAS.postman_collection.json`

- [ ] La colección ya tiene `baseUrl = http://localhost:3000` configurado en sus variables (sin necesidad de crear un entorno separado)

- [ ] Credenciales de prueba **existen en la BD** (creadas por el seed):
  - `admin@ferremas.cl` / `password`
  - `cliente@ferremas.cl` / `password`
  - `vendedor@ferremas.cl` / `password`

---

## 2. COMANDOS DE INICIO

> ⚠️ **Abre DOS terminales** separadas. El backend debe estar corriendo antes de iniciar el frontend.

### Terminal 1 — Backend (Node.js + Express)

```bash
cd backend
npm install
npm run dev
```

**Salida esperada:**
```
╔══════════════════════════════════════╗
║   FERREMAS API                       ║
║   http://localhost:3000              ║
║   Entorno: development               ║
╚══════════════════════════════════════╝
```

> Si aparece `Error: Cannot find module` → ejecuta `npm install` primero  
> Si aparece `EADDRINUSE :3000` → otro proceso usa el puerto. Ejecuta: `npx kill-port 3000`

### Terminal 2 — Frontend (Vue.js + Vite)

```bash
# Desde la raíz del proyecto (NO desde /backend)
npm install
npm run dev
```

**Salida esperada:**
```
  VITE v6.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

---

## 3. VERIFICACIONES EN EL NAVEGADOR

Visita cada URL en orden y confirma el resultado esperado:

| URL | Resultado esperado |
|---|---|
| `http://localhost:3000/health` | `{"status":"OK","service":"FERREMAS API","timestamp":"...","env":"development"}` |
| `http://localhost:5173/` | Redirige automáticamente a `/catalogo` |
| `http://localhost:5173/catalogo` | Grid de productos con imágenes, filtros por categoría |
| `http://localhost:5173/login` | Formulario de login con diseño Industrial Zen (fondo oscuro, tipografía Sora) |
| `http://localhost:5173/admin` | Redirige a `/login` si no hay sesión activa |
| `http://localhost:5173/dashboard` | Redirige a `/login` si no hay sesión activa |

> 🔴 **Si `/catalogo` muestra spinner infinito** → el modo mockup está activo (ver sección 4)  
> 🔴 **Si `/health` da "Connection refused"** → el backend no está corriendo

---

## 4. VERIFICACIÓN DEL MODO MOCKUP

El frontend tiene dos modos operativos controlados por `VITE_APP_MODE` en `.env.local`:

### Señales de modo `mockup` (datos locales — NO usar en demo)

- El login acepta cualquier contraseña genérica
- Los KPIs del Admin siempre muestran exactamente: `$4.280.000`, `34`, `128`, `312`
- El catálogo siempre muestra los mismos 12 productos fijos

### Señales de modo `production` ✅ correcto para demo

- El login falla con credenciales incorrectas
- El catálogo carga productos dinámicamente desde Supabase
- Los KPIs muestran datos reales del mes actual

### Forzar modo producción

En `.env.local`:

```
VITE_APP_MODE=production
```

Luego reiniciar: `Ctrl+C` → `npm run dev`

**Lógica en el código** (`src/lib/supabase.js` línea 16):
```javascript
export const isMockup = import.meta.env.VITE_APP_MODE === 'mockup' || !supabaseUrl || !supabaseKey
```
→ Si `VITE_SUPABASE_URL` está vacío, **automáticamente entra en mockup** aunque `VITE_APP_MODE=production`.

---

## 5. PRUEBAS POSTMAN PASO A PASO

### Preparación (1 vez)

1. Abrir Postman → **File → Import** → seleccionar `postman/FERREMAS.postman_collection.json`
2. La colección aparecerá como **"FERREMAS API — Integración"**
3. Variables ya preconfiguradas: `baseUrl=http://localhost:3000`, credenciales de los 3 roles

### Ejecutar todos los tests

1. Click en `...` junto al nombre de la colección → **Run collection**
2. Todos los 18 requests seleccionados → **Run FERREMAS API — Integración**
3. Resultado esperado: **18/18 en verde** ✅

### Los 18 tests

| # | Nombre | Método | Endpoint | Verifica |
|---|---|---|---|---|
| 1 | Health check | GET | `/health` | `status: "OK"` |
| 2 | Login admin → guarda token | POST | `/api/auth/login` | Token JWT + usuario |
| 3 | GET /auth/me (token válido) | GET | `/api/auth/me` | Usuario con `rolNombre` |
| 4 | GET /products | GET | `/api/products` | Array de productos + total |
| 5 | GET /products filtro categoría | GET | `/api/products?categoria=...` | Filtrado correcto |
| 6 | GET /products/:id (id=1) | GET | `/api/products/1` | `stock_disponible` presente |
| 7 | GET /inventory | GET | `/api/inventory` | `totalRegistros` + `inventario` |
| 8 | POST /orders (5 ítems → desc. 10%) | POST | `/api/orders` | `aplicaDescuento: true` |
| 9 | GET /orders/mis-pedidos | GET | `/api/orders/mis-pedidos` | Array de pedidos del cliente |
| 10 | GET /currency/dolar | GET | `/api/currency/dolar` | `valorDolar` numérico |
| 11 | Login inválido → 401 | POST | `/api/auth/login` | Error 401 |
| 12 | /auth/me sin token → 401 | GET | `/api/auth/me` | Error 401 |
| 13 | /orders sin token → 401 | GET | `/api/orders` | Error 401 |
| 14 | /orders con rol Cliente → 403 | GET | `/api/orders` | Error 403 `INSUFFICIENT_ROLE` |
| 15 | /orders stock insuficiente → 409 | POST | `/api/orders` | Error 409 |
| 16 | /products/99999 → 404 | GET | `/api/products/99999` | Error 404 |
| 17 | PATCH estado inválido → 400 | PATCH | `/api/orders/:id/estado` | Error 400 validación |
| 18 | POST /orders sin body → 400 | POST | `/api/orders` | Error 400 validación |

### Qué hacer si falla un test

| Error | Causa probable | Solución |
|---|---|---|
| Test #1 falla | Backend no está corriendo | Verificar Terminal 1 |
| Test #2 falla | Usuario no existe en BD | Ejecutar seed SQL en Supabase |
| Tests #3–#18 dan 401 | Token vacío porque #2 falló | Re-ejecutar #2 primero |
| Test #8 falla (201) | Productos 1-5 no existen en BD | Ejecutar seed SQL |
| Test #10 falla (dólar) | API mindicador.cl sin acceso | Verificar conexión a internet |

---

## 6. FLUJO DE DEMO RECOMENDADO (6–8 minutos)

### ⏱ Paso 1 — API funcionando (30 seg)
1. Abrir `http://localhost:3000/health`
2. Mostrar `{"status":"OK","service":"FERREMAS API",...}`
3. Mencionar: *"Backend Express activo con rate limiting, CORS y manejo de errores global"*

### ⏱ Paso 2 — Flujo Cliente completo (2 min)
1. Ir a `/catalogo` → mostrar filtros por categoría
2. Entrar a un producto → precio en USD (API externa en vivo)
3. Agregar al carrito → ir a `/carrito`
4. Proceder a `/checkout` → redirige a login (ruta protegida por guard)
5. Login con `cliente@ferremas.cl` / `password`
6. Completar checkout → página de confirmación con ID de pedido

### ⏱ Paso 3 — Flujo Vendedor (1 min)
1. Cerrar sesión → login con `vendedor@ferremas.cl` / `password`
2. Navegar a `/vendedor`
3. Ver lista de pedidos → cambiar estado de uno
4. *"El rol Vendedor no puede acceder a /admin ni a /bodeguero"*

### ⏱ Paso 4 — Panel Administrador (1 min)
1. Cerrar sesión → login con `admin@ferremas.cl` / `password`
2. Navegar a `/admin`
3. Mostrar KPIs (ventas, pedidos, usuarios, stock) + tabla de usuarios con badges
4. *"El Administrador también puede acceder a las vistas de Vendedor y Bodeguero"*

### ⏱ Paso 5 — Postman (1.5 min)
1. **Run collection** → mostrar 18/18 en verde en tiempo real
2. Destacar tests de error: 401, 403, 404, 409
3. *"La API maneja correctamente todos los casos de error con códigos HTTP apropiados"*

### ⏱ Paso 6 — Tipo de cambio USD (30 seg)
1. Volver al catálogo → señalar el precio en USD al lado del CLP
2. *"Se consume la API externa mindicador.cl en tiempo real para el tipo de cambio del dólar"*

---

## 7. SOLUCIÓN A ERRORES COMUNES

### 🔴 Error CORS en la consola del navegador
**Causa:** `CORS_ORIGIN` en `backend/.env` no coincide con el origen del frontend  
**Solución:**
```
# backend/.env
CORS_ORIGIN=http://localhost:5173
```
Reiniciar el backend.

---

### 🔴 Error 401 en Postman desde el test #3 en adelante
**Causa:** El test #2 (Login admin) falló y la variable `token` está vacía  
**Solución:**
1. Ejecutar manualmente el test #2 y verificar respuesta 200
2. Si falla con 401: ejecutar seed en Supabase para crear los usuarios de prueba
3. Si falla con "Connection refused": arrancar el backend

---

### 🔴 `isMockup = true` — Frontend con datos de prueba
**Causa:** `.env.local` tiene `VITE_APP_MODE=mockup` o `VITE_SUPABASE_URL` vacío  
**Diagnóstico:** El catálogo siempre muestra exactamente los mismos 12 productos  
**Solución:**
```
# .env.local (raíz del proyecto)
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_MODE=production
```
Reiniciar: `Ctrl+C` → `npm run dev`

---

### 🔴 Catálogo vacío o spinner infinito
**Causa:** Tabla `productos` vacía o inexistente  
**Solución:** En Supabase → **SQL Editor**:
```sql
SELECT COUNT(*) FROM productos;
```
Si retorna 0 o error → ejecutar `supabase/migrations/20260511130000_seed_data.sql`

---

### 🔴 Error "relation does not exist" en el backend
**Causa:** Migraciones no ejecutadas en Supabase  
**Solución:** En Supabase → **SQL Editor** → ejecutar en orden:
1. `supabase/migrations/20260511120000_rename_tables_plural_and_reservas.sql`
2. `supabase/migrations/20260511130000_seed_data.sql`

---

### 🔴 Puerto 3000 o 5173 ya en uso
```powershell
# Windows PowerShell
npx kill-port 3000
npx kill-port 5173
```

---

### 🔴 `npm run dev` falla con "Cannot find module"
```bash
# Raíz (frontend)
npm install

# Backend
cd backend && npm install
```

---

### 🔴 Tipo de cambio USD no carga
**Causa:** API externa `mindicador.cl` sin respuesta  
**Impacto:** Solo el precio en USD no aparece; el resto funciona normal  
**Para la demo:** Mostrar el test #10 de Postman que verifica `/api/currency/dolar`

---

## REFERENCIAS RÁPIDAS

| Recurso | Ruta |
|---|---|
| Setup inicial (Windows) | `setup.bat` |
| Setup inicial (Mac/Linux) | `setup.sh` |
| Colección Postman | `postman/FERREMAS.postman_collection.json` |
| Migración principal | `supabase/migrations/20260511120000_rename_tables_plural_and_reservas.sql` |
| Datos semilla | `supabase/migrations/20260511130000_seed_data.sql` |
| Config isMockup | `src/lib/supabase.js` |
| Rutas y guards | `src/router/index.js` |
| Entry point backend | `backend/server.js` |
| Rutas API registradas | `backend/app.js` |
