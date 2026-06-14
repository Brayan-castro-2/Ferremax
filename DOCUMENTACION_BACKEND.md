# 📘 Documentación Oficial del Backend - Ferremas API

Esta documentación explica cómo está construido el backend (el "cerebro" del sistema), cómo se conecta con la base de datos de Supabase, y cómo realizar pruebas utilizando Postman.

---

## 🏗️ 1. Arquitectura del Backend
El backend está desarrollado utilizando una arquitectura moderna, segura y escalable:
* **Entorno:** Node.js.
* **Framework:** Express.js (API REST *Stateless*).
* **Seguridad:** Tokens JWT (JSON Web Tokens).
* **Base de Datos:** PostgreSQL alojada en Supabase.
* **Modo de Respaldo (Mock Fallback):** Si la base de datos se cae o está vacía, el servidor automáticamente responde con "Datos Simulados" (Mock Data) para asegurar que el sistema nunca deje de funcionar.

---

## 🗄️ 2. Estructura de la Base de Datos (Nuevo Esquema)
El backend está programado para comunicarse con las siguientes tablas principales de Supabase:

1. **`usuario`**: Almacena el personal (Administradores, Vendedores, Bodegueros). Contiene nombre, correo, contraseña y `id_rol`.
2. **`cliente`**: Almacena a los clientes finales.
3. **`rol`**: Define los niveles de acceso del sistema.
4. **`producto`**: Catálogo de ventas (nombre, precio, categoría, stock).
5. **`inventario`**: Control físico de productos en sucursales.
6. **`pedido`** y **`detalle_pedido`**: Registran las ventas realizadas.

---

## 🚀 3. Lista de Consultas Actuales (Endpoints)

Aquí están las "puertas de entrada" a las que puedes hacer consultas usando Postman.

### A. Módulo de Autenticación (`/api/auth`)
*   **POST** `http://localhost:3000/api/auth/login`
    *   **Qué hace:** Valida el correo y la contraseña. Si son correctos, devuelve un Token JWT.
    *   **Regla de Seguridad:** Busca en la tabla `usuario` y si no lo encuentra, busca en `cliente`.
    *   **Datos de prueba (Body JSON):** 
        ```json
        {
          "email": "profe@ferremas.cl",
          "password": "admin123"
        }
        ```

### B. Módulo de Catálogo (`/api/products`)
*   **GET** `http://localhost:3000/api/products`
    *   **Qué hace:** Trae la lista de todos los productos activos.
    *   **Regla de Seguridad:** Es de acceso público (no requiere Token).
    *   **Respaldo:** Si la tabla `producto` está vacía, devuelve los 4 productos de emergencia `(MOCK)`.

*   **GET** `http://localhost:3000/api/products/:id`
    *   **Qué hace:** Busca la ficha técnica de un producto en específico.

### C. Módulo de Inventario (`/api/inventory`)
*   **GET** `http://localhost:3000/api/inventory`
    *   **Qué hace:** Muestra el stock físico real cruzando la tabla `inventario` con `producto`.
    *   **Regla de Seguridad:** *Temporalmente público para facilitar pruebas.*

*   **PATCH** `http://localhost:3000/api/inventory/:id`
    *   **Qué hace:** Actualiza la cantidad de stock físico.
    *   **Body JSON necesario:** `{"cantidad": 50}`

### D. Módulo de Pedidos (`/api/orders`) *(En desarrollo)*
*   **POST** `/api/orders`: Crea un pedido (Requiere estar logueado).
*   **GET** `/api/orders`: Lista pedidos (Solo Admin y Vendedor).

---

## 🛡️ 4. Reglas de Negocio Implementadas

1.  **Sin Estado (Stateless):** El servidor no guarda sesiones en su memoria. Toda petición que requiera seguridad debe incluir el Token JWT en la cabecera (*Header*: `Authorization: Bearer <TOKEN>`).
2.  **Verificación de Contraseñas por Defecto:** *(Regla académica)* Si el usuario inicia sesión por primera vez con su RUT como contraseña, el sistema exigirá que cambie la contraseña antes de poder hacer un pedido (Middleware `requirePasswordChanged`).
3.  **Reserva Lógica (Soft-Reservation):** Existe un servicio programado que, al momento de armar un carrito, "congela" el stock durante 15 minutos sin descontarlo físicamente del inventario general, evitando sobre-ventas.

---

## 🛠️ 5. Cómo comunicarte con la API desde Postman

Para presentarle el sistema al profesor, sigue estos pasos exactos:

1.  Asegúrate de que el servidor Node.js esté ejecutándose (Terminal: `npm run dev` dentro de la carpeta backend).
2.  Abre Postman.
3.  Para obtener los productos: 
    *   Selecciona `GET`.
    *   Escribe la URL: `http://localhost:3000/api/products`.
    *   Presiona `Send`.
4.  Para hacer Login:
    *   Selecciona `POST`.
    *   Escribe la URL: `http://localhost:3000/api/auth/login`.
    *   Ve a la pestaña `Body` > `raw` > selecciona `JSON`.
    *   Escribe las credenciales de prueba del profe y dale a `Send`.
