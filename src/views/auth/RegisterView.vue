<template>
  <main class="flex min-h-screen items-center justify-center bg-surface px-margin-mobile py-16 font-inter">
    <div class="w-full max-w-md rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-8 shadow-ambient sm:p-10">

      <!-- Header -->
      <header class="mb-8">
        <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.22em] text-tertiary">Nueva cuenta</p>
        <h1 class="mt-2 font-sora text-2xl font-semibold tracking-tight text-primary">Crear acceso</h1>
        <p class="mt-2 text-sm text-on-surface-variant">Completa los datos para registrarte en FERREMAS.</p>
      </header>

      <!-- Mensaje de éxito -->
      <div
        v-if="message"
        class="mb-6 rounded-xl border border-outline-variant/60 bg-surface-container-low px-4 py-4 text-sm text-on-surface"
        role="status"
      >
        <p class="font-semibold text-primary">¡Registro exitoso!</p>
        <p class="mt-1">{{ message }}</p>
        <RouterLink to="/login" class="mt-3 inline-block font-geist text-[11px] font-semibold uppercase tracking-widest text-primary underline underline-offset-2">
          Ir a Iniciar sesión →
        </RouterLink>
      </div>

      <!-- Error global -->
      <p
        v-if="globalError"
        class="mb-5 rounded-xl border border-error/25 bg-error-container/80 px-4 py-3 text-sm text-on-error-container"
        role="alert"
      >
        {{ globalError }}
      </p>

      <!-- Formulario (oculto tras éxito) -->
      <form v-if="!message" class="space-y-5" @submit.prevent="submit" novalidate>

        <!-- Nombre -->
        <FmInput
          id="reg-nombre"
          v-model="nombre"
          label="Nombre completo"
          type="text"
          placeholder="Ej: Juan Pérez"
          autocomplete="name"
          :error="errors.nombre"
          @blur="validateNombre"
        />

        <!-- Email -->
        <FmInput
          id="reg-email"
          v-model="email"
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.cl"
          autocomplete="email"
          :error="errors.email"
          @blur="validateEmail"
        />

        <!-- Contraseña -->
        <FmInput
          id="reg-pass"
          v-model="password"
          label="Contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          autocomplete="new-password"
          hint="Mínimo 6 caracteres"
          :error="errors.password"
          @blur="validatePassword"
        />

        <!-- Confirmar contraseña -->
        <FmInput
          id="reg-confirm"
          v-model="confirmPassword"
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          autocomplete="new-password"
          :error="errors.confirmPassword"
          @blur="validateConfirm"
        />

        <!-- Términos y condiciones -->
        <div class="flex items-start gap-3">
          <input
            id="reg-terminos"
            v-model="terminos"
            type="checkbox"
            class="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
            @change="errors.terminos = ''"
          />
          <label for="reg-terminos" class="cursor-pointer text-sm text-on-surface-variant">
            Acepto los
            <span class="font-semibold text-primary">términos y condiciones</span>
            de uso de FERREMAS
          </label>
        </div>
        <p v-if="errors.terminos" class="text-xs text-error" role="alert">{{ errors.terminos }}</p>

        <!-- Botón submit -->
        <FmButton native-type="submit" variant="primary" block :loading="loading">
          Crear cuenta
        </FmButton>

      </form>

      <!-- Link a login -->
      <p v-if="!message" class="mt-8 text-center text-sm text-on-surface-variant">
        ¿Ya tienes cuenta?
        <RouterLink to="/login" class="font-semibold text-primary hover:underline">Iniciar sesión</RouterLink>
      </p>

    </div>
  </main>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, isMockup } from '@/lib/supabase.js'
import FmInput from '@/components/ui/FmInput.vue'
import FmButton from '@/components/ui/FmButton.vue'

const router = useRouter()

// ── Campos del formulario ────────────────────────────────────
const nombre          = ref('')
const email           = ref('')
const password        = ref('')
const confirmPassword = ref('')
const terminos        = ref(false)

// ── Estado ───────────────────────────────────────────────────
const loading     = ref(false)
const globalError = ref('')
const message     = ref('')

// ── Errores de campo ─────────────────────────────────────────
const errors = reactive({
  nombre:          '',
  email:           '',
  password:        '',
  confirmPassword: '',
  terminos:        '',
})

// ── Validaciones individuales ────────────────────────────────
function validateNombre() {
  errors.nombre = nombre.value.trim().length < 2
    ? 'Ingresa tu nombre completo'
    : ''
}

function validateEmail() {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  errors.email = !re.test(email.value.trim())
    ? 'Ingresa un correo electrónico válido'
    : ''
}

function validatePassword() {
  errors.password = password.value.length < 6
    ? 'La contraseña debe tener al menos 6 caracteres'
    : ''
}

function validateConfirm() {
  errors.confirmPassword = confirmPassword.value !== password.value
    ? 'Las contraseñas no coinciden'
    : ''
}

function validateAll() {
  validateNombre()
  validateEmail()
  validatePassword()
  validateConfirm()
  if (!terminos.value) errors.terminos = 'Debes aceptar los términos y condiciones'
  return !Object.values(errors).some(Boolean)
}

// ── Mapeo de errores de Supabase al español ──────────────────
function traducirError(msg = '') {
  if (msg.includes('User already registered') || msg.includes('already been registered'))
    return 'Este email ya tiene una cuenta registrada. Intenta iniciar sesión.'
  if (msg.includes('Password should be at least 6'))
    return 'La contraseña debe tener al menos 6 caracteres.'
  if (msg.includes('Unable to validate email'))
    return 'El formato del correo electrónico no es válido.'
  if (msg.includes('Email rate limit exceeded'))
    return 'Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo.'
  return msg
}

// ── Submit ────────────────────────────────────────────────────
async function submit() {
  globalError.value = ''
  message.value     = ''

  if (!validateAll()) return

  // Modo mockup — no hay conexión real a Supabase
  if (isMockup || !supabase) {
    message.value = 'Modo demo activo: el registro real requiere credenciales de Supabase en .env.local'
    return
  }

  loading.value = true
  try {
    // ── PASO 1: Crear cuenta en Supabase Auth ─────────────────
    const { data, error } = await supabase.auth.signUp({
      email:    email.value.trim().toLowerCase(),
      password: password.value,
      options: {
        data: {
          nombre: nombre.value.trim(), // metadata → disponible para el trigger de DB
        },
      },
    })

    if (error) throw error

    // ── PASO 2: Redirigir / mostrar mensaje ───────────────────
    // Si Supabase tiene confirmación de email activada, data.user.email_confirmed_at es null
    const requiereConfirmacion = data?.user && !data.user.email_confirmed_at

    if (requiereConfirmacion) {
      // El usuario debe confirmar su email antes de poder iniciar sesión
      message.value = '¡Cuenta creada! Revisa tu email para confirmar tu cuenta antes de iniciar sesión.'
    } else {
      // Supabase no requiere confirmación → redirigir directo al login
      router.push({ path: '/login', query: { registered: '1' } })
    }

  } catch (err) {
    globalError.value = traducirError(err.message || 'No se pudo completar el registro.')
  } finally {
    loading.value = false
  }
}
</script>
