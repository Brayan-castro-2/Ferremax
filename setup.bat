@echo off
REM =============================================================
REM  FERREMAS — Setup inicial de variables de entorno
REM  Uso: setup.bat (doble clic o desde cmd)
REM  Compatible: Windows (cmd / PowerShell)
REM =============================================================

chcp 65001 > nul
setlocal EnableDelayedExpansion

REM ── Banner ────────────────────────────────────────────────────
echo.
echo ╔══════════════════════════════════════════════╗
echo ║        FERREMAS — Configuración inicial      ║
echo ╚══════════════════════════════════════════════╝
echo.

REM ── Verificar Node.js ─────────────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js no esta instalado.
    echo         Descargalo desde https://nodejs.org
    pause
    exit /b 1
)

REM ── Instrucciones Supabase ────────────────────────────────────
echo [PASO 1] Obtener credenciales de Supabase
echo.
echo   Ve a: https://app.supabase.com
echo   ^> Selecciona tu proyecto
echo   ^> Settings -^> API
echo   Ahi encontraras la URL y las dos API Keys.
echo.
echo   ATENCION: La Service Role Key tiene permisos totales.
echo             Nunca la expongas en el frontend.
echo.

REM ── Leer credenciales ─────────────────────────────────────────
set /p SUPABASE_URL="SUPABASE_URL        (ej: https://xxxx.supabase.co): "
set /p SUPABASE_ANON_KEY="SUPABASE_ANON_KEY   (anon/public key): "
set /p SUPABASE_SERVICE_ROLE_KEY="SUPABASE_SERVICE_ROLE_KEY (service_role key): "

REM Validaciones básicas
if "%SUPABASE_URL%"=="" (
    echo [ERROR] SUPABASE_URL es obligatorio.
    pause & exit /b 1
)
if "%SUPABASE_ANON_KEY%"=="" (
    echo [ERROR] SUPABASE_ANON_KEY es obligatorio.
    pause & exit /b 1
)
if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
    echo [ERROR] SUPABASE_SERVICE_ROLE_KEY es obligatorio.
    pause & exit /b 1
)

REM ── Generar JWT_SECRET ────────────────────────────────────────
echo.
echo [INFO] Generando JWT_SECRET seguro...
for /f %%i in ('node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))"') do set JWT_SECRET=%%i
echo [OK]   JWT_SECRET generado ^(64 caracteres^).

REM ── Obtener fecha y hora ──────────────────────────────────────
for /f "tokens=1-3 delims=/" %%a in ("%DATE%") do (
    set DIA=%%a
    set MES=%%b
    set ANIO=%%c
)
set TIMESTAMP=%ANIO%-%MES%-%DIA% %TIME:~0,8%

REM ── Crear carpeta backend si no existe ───────────────────────
if not exist "backend" mkdir backend

REM ── Verificar backend/.env ────────────────────────────────────
echo.
set BACKEND_ENV=backend\.env
set SKIP_BACKEND=0

if exist "%BACKEND_ENV%" (
    echo [AVISO] El archivo %BACKEND_ENV% ya existe.
    set /p OVERWRITE_BE="        ^¿Sobreescribir? (s/N): "
    if /i "!OVERWRITE_BE!" neq "s" (
        echo        Omitiendo %BACKEND_ENV%.
        set SKIP_BACKEND=1
    )
)

if !SKIP_BACKEND! == 0 (
    (
        echo # ============================================================
        echo #  FERREMAS Backend — Variables de entorno
        echo #  Generado por setup.bat el %TIMESTAMP%
        echo #  NUNCA subas este archivo al repositorio.
        echo # ============================================================
        echo.
        echo # Supabase
        echo SUPABASE_URL=%SUPABASE_URL%
        echo SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY%
        echo SUPABASE_SERVICE_ROLE_KEY=%SUPABASE_SERVICE_ROLE_KEY%
        echo.
        echo # Autenticacion
        echo JWT_SECRET=%JWT_SECRET%
        echo JWT_EXPIRES_IN=8h
        echo.
        echo # Servidor
        echo PORT=3000
        echo NODE_ENV=development
        echo.
        echo # CORS — URL del frontend en desarrollo
        echo CORS_ORIGIN=http://localhost:5173
    ) > "%BACKEND_ENV%"
    echo [OK]   %BACKEND_ENV% creado correctamente.
)

REM ── Verificar .env.local (frontend) ──────────────────────────
set FRONTEND_ENV=.env.local
set SKIP_FRONTEND=0

if exist "%FRONTEND_ENV%" (
    echo.
    echo [AVISO] El archivo %FRONTEND_ENV% ya existe.
    set /p OVERWRITE_FE="        ^¿Sobreescribir? (s/N): "
    if /i "!OVERWRITE_FE!" neq "s" (
        echo        Omitiendo %FRONTEND_ENV%.
        set SKIP_FRONTEND=1
    )
)

if !SKIP_FRONTEND! == 0 (
    (
        echo # ============================================================
        echo #  FERREMAS Frontend — Variables de entorno Vite
        echo #  Generado por setup.bat el %TIMESTAMP%
        echo #  NUNCA subas este archivo al repositorio.
        echo #  Solo las variables con prefijo VITE_ son expuestas al cliente.
        echo # ============================================================
        echo.
        echo VITE_SUPABASE_URL=%SUPABASE_URL%
        echo VITE_SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY%
        echo.
        echo # production = usa la API real ^| mockup = usa datos de prueba locales
        echo VITE_APP_MODE=production
        echo.
        echo # URL del backend Node.js en desarrollo
        echo VITE_API_URL=http://localhost:3000
    ) > "%FRONTEND_ENV%"
    echo [OK]   %FRONTEND_ENV% creado correctamente.
)

REM ── Confirmación final ────────────────────────────────────────
echo.
echo ╔══════════════════════════════════════════════╗
echo ║       ✅ Configuración completada            ║
echo ╚══════════════════════════════════════════════╝
echo.
echo [Backend]  cd backend ^&^& npm install ^&^& npm run dev
echo [Frontend] (en otra terminal) npm install ^&^& npm run dev
echo.
echo URLs disponibles:
echo   Frontend -^> http://localhost:5173
echo   Backend  -^> http://localhost:3000
echo.
pause
