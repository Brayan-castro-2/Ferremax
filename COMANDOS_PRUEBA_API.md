# ⚡ Comandos para Probar la API de Ferremas (PowerShell)

Si no tienes Postman instalado, puedes probar que tu Backend funciona perfectamente copiando y pegando estos comandos directamente en una terminal de **PowerShell**. 

> **Nota para la presentación:** Abre una nueva pestaña de PowerShell, maximízala para que el profesor vea bien, y ve pegando y ejecutando estos comandos uno por uno.

---

### 1. 🛍️ Ver Catálogo de Productos (GET)
Este comando solicita al servidor la lista completa de productos activos. Si la base de datos está vacía, responderá con la lista de emergencia (MOCK DATA).

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Get | ConvertTo-Json -Depth 5
```

### 2. 🔍 Ver Detalle de un Solo Producto (GET)
Este comando busca la ficha técnica de un producto específico (en este caso, el ID 1).

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products/1" -Method Get | ConvertTo-Json -Depth 5
```

### 3. 🔐 Hacer Login / Iniciar Sesión (POST)
Este es el comando estrella. Envía las credenciales del profesor de forma segura al servidor. El servidor verificará y responderá con el **Token JWT** y los datos del usuario.

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"email":"profe@ferremas.cl", "password":"admin123"}' | ConvertTo-Json -Depth 5
```

### 4. 📦 Ver Inventario Físico (GET)
Este comando le pide al servidor que cruce la tabla de inventarios con la de productos para ver cuánto stock hay en bodega.

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory" -Method Get | ConvertTo-Json -Depth 5
```

### 5. ✏️ Actualizar Cantidad en Inventario (PATCH)
Si necesitas demostrar que el sistema no solo lee datos, sino que también los modifica, puedes enviar este comando para simular la llegada de nueva mercancía (ejemplo: cambiar la cantidad del inventario con ID 1 a 50 unidades).

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/1" -Method Patch -Headers @{"Content-Type"="application/json"} -Body '{"cantidad": 50}' | ConvertTo-Json -Depth 5
```

---

### 💡 Tip para la presentación:
Le agregué al final de cada comando `| ConvertTo-Json -Depth 5`. Esto hace que, en lugar de que PowerShell te muestre los datos de forma fea, los formatee de manera vertical y ordenada, muy parecido a como lo haría Postman o un navegador moderno. ¡Se verá súper profesional!
