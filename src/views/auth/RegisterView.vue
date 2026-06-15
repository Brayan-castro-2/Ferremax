<template>
  <div class="flex min-h-screen flex-col">
    <main class="flex flex-1 items-center justify-center bg-surface px-margin-mobile py-16 font-inter">
      <div class="w-full max-w-lg">
        <RouterLink to="/catalogo" class="mb-6 flex items-center gap-1.5 font-geist text-[10px] uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary">
          ← Volver al catálogo
        </RouterLink>

        <div class="w-full rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-8 shadow-ambient sm:p-10">
          <header class="mb-8">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.22em] text-tertiary">Nueva cuenta</p>
            <h1 class="mt-2 font-sora text-2xl font-semibold tracking-tight text-primary">Crear cuenta de cliente</h1>
            <p class="mt-2 text-sm text-on-surface-variant">
              Te pediremos tu dirección para coordinar despachos a domicilio.
            </p>
          </header>

          <div v-if="success" class="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800" role="status">
            <p class="font-semibold">¡Cuenta creada exitosamente!</p>
            <p class="mt-1">Ya puedes iniciar sesión con tu email y contraseña.</p>
            <RouterLink to="/login" class="mt-3 inline-block font-geist text-[11px] font-semibold uppercase tracking-widest text-primary underline underline-offset-2">
              Ir a iniciar sesión →
            </RouterLink>
          </div>

          <p v-if="globalError" class="mb-5 rounded-xl border border-error/25 bg-error-container/80 px-4 py-3 text-sm text-on-error-container" role="alert">
            {{ globalError }}
          </p>

          <form v-if="!success" class="space-y-5" @submit.prevent="submit" novalidate>
            <FmInput
              id="reg-nombre"
              v-model="form.nombre"
              label="Nombre completo *"
              type="text"
              placeholder="Ej: Juan Pérez"
              autocomplete="name"
              :error="errors.nombre"
            />

            <FmInput
              id="reg-email"
              v-model="form.email"
              label="Correo electrónico *"
              type="email"
              placeholder="tu@correo.cl"
              autocomplete="email"
              :error="errors.email"
            />

            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FmInput
                id="reg-pass"
                v-model="form.password"
                label="Contraseña *"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autocomplete="new-password"
                :error="errors.password"
              />
              <FmInput
                id="reg-confirm"
                v-model="form.confirmPassword"
                label="Confirmar contraseña *"
                type="password"
                placeholder="Repite tu contraseña"
                autocomplete="new-password"
                :error="errors.confirmPassword"
              />
            </div>

            <FmInput
              id="reg-rut"
              v-model="form.rut"
              label="RUT"
              type="text"
              placeholder="12.345.678-9"
            />

            <FmInput
              id="reg-telefono"
              v-model="form.telefono"
              label="Teléfono"
              type="tel"
              placeholder="+56 9 1234 5678"
              autocomplete="tel"
            />

            <FmInput
              id="reg-direccion"
              v-model="form.direccion"
              label="Dirección de despacho *"
              type="text"
              placeholder="Calle, número, depto"
              autocomplete="street-address"
              :error="errors.direccion"
            />

            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FmInput
                id="reg-comuna"
                v-model="form.comuna"
                label="Comuna"
                type="text"
                placeholder="Ej: Providencia"
              />
              <FmInput
                id="reg-ciudad"
                v-model="form.ciudad"
                label="Ciudad"
                type="text"
                placeholder="Ej: Santiago"
              />
            </div>

            <div class="flex items-start gap-3">
              <input
                id="reg-terminos"
                v-model="terminos"
                type="checkbox"
                class="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
              />
              <label for="reg-terminos" class="cursor-pointer text-sm text-on-surface-variant">
                Acepto los <span class="font-semibold text-primary">términos y condiciones</span> de uso de FERREMAS
              </label>
            </div>
            <p v-if="errors.terminos" class="text-xs text-error">{{ errors.terminos }}</p>

            <FmButton native-type="submit" variant="primary" block :loading="loading">
              Crear cuenta
            </FmButton>
          </form>

          <p v-if="!success" class="mt-8 text-center text-sm text-on-surface-variant">
            ¿Ya tienes cuenta?
            <RouterLink to="/login" class="font-semibold text-primary hover:underline">Iniciar sesión</RouterLink>
          </p>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { api } from '@/lib/api.js'
import FmInput from '@/components/ui/FmInput.vue'
import FmButton from '@/components/ui/FmButton.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const form = reactive({
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
  rut: '',
  telefono: '',
  direccion: '',
  comuna: '',
  ciudad: ''
})

const terminos = ref(false)
const loading = ref(false)
const globalError = ref('')
const success = ref(false)

const errors = reactive({
  nombre: '', email: '', password: '', confirmPassword: '', direccion: '', terminos: ''
})

function validate() {
  errors.nombre = form.nombre.trim().length < 2 ? 'Ingresa tu nombre completo' : ''
  errors.email = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? 'Email inválido' : ''
  errors.password = form.password.length < 6 ? 'Mínimo 6 caracteres' : ''
  errors.confirmPassword = form.password !== form.confirmPassword ? 'Las contraseñas no coinciden' : ''
  errors.direccion = form.direccion.trim().length < 5 ? 'Ingresa una dirección válida para despacho' : ''
  errors.terminos = !terminos.value ? 'Debes aceptar los términos' : ''
  return !Object.values(errors).some(Boolean)
}

async function submit() {
  globalError.value = ''
  if (!validate()) return

  loading.value = true
  try {
    await api.clientes.registrar({
      nombre:    form.nombre.trim(),
      email:     form.email.trim().toLowerCase(),
      password:  form.password,
      direccion: form.direccion.trim(),
      rut:       form.rut.trim() || undefined,
      telefono:  form.telefono.trim() || undefined,
      comuna:    form.comuna.trim() || undefined,
      ciudad:    form.ciudad.trim() || undefined
    })
    success.value = true
  } catch (err) {
    globalError.value = err.message || 'No se pudo completar el registro.'
  } finally {
    loading.value = false
  }
}
</script>
