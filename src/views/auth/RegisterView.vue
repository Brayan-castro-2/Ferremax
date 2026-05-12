<template>
  <main class="flex min-h-screen items-center justify-center bg-surface px-margin-mobile py-16 font-inter">
    <div class="w-full max-w-md rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-8 shadow-ambient sm:p-10">
      <header class="mb-8">
        <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.22em] text-tertiary">Nueva cuenta</p>
        <h1 class="mt-2 font-sora text-2xl font-semibold tracking-tight text-primary">Crear acceso</h1>
        <p class="mt-2 text-sm text-on-surface-variant">Usa un correo válido. En producción se validará vía Supabase Auth.</p>
      </header>

      <p v-if="message" class="mb-4 rounded-xl border border-outline-variant/60 bg-surface-container-low px-4 py-3 text-sm text-on-surface" role="status">{{ message }}</p>
      <p v-if="error" class="mb-4 rounded-xl border border-error/25 bg-error-container/80 px-4 py-3 text-sm text-on-error-container" role="alert">{{ error }}</p>

      <form class="space-y-5" @submit.prevent="submit">
        <FmInput id="reg-email" v-model="email" label="Correo" type="email" autocomplete="email" required />
        <FmInput id="reg-pass" v-model="password" label="Contraseña" type="password" autocomplete="new-password" required />
        <FmButton native-type="submit" variant="primary" block :loading="loading">
          Registrarme
        </FmButton>
      </form>

      <p class="mt-8 text-center text-sm text-on-surface-variant">
        ¿Ya tienes cuenta?
        <RouterLink to="/login" class="font-semibold text-primary hover:underline">Iniciar sesión</RouterLink>
      </p>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { supabase, isMockup } from '@/lib/supabase.js'
import FmInput from '@/components/ui/FmInput.vue'
import FmButton from '@/components/ui/FmButton.vue'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const message = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    if (isMockup || !supabase) {
      message.value = 'Modo demo: usa las cuentas de prueba en Iniciar sesión (contraseña 12345).'
      return
    }
    const { error: err } = await supabase.auth.signUp({
      email: email.value.trim().toLowerCase(),
      password: password.value,
    })
    if (err) throw err
    message.value = 'Revisa tu correo para confirmar la cuenta (si el proyecto tiene confirmación activada).'
  } catch (e) {
    error.value = e.message || 'No se pudo registrar'
  } finally {
    loading.value = false
  }
}
</script>
