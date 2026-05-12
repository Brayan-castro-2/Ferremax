<template>
  <main class="flex min-h-screen items-center justify-center bg-surface px-margin-mobile py-16 font-inter">
    <div class="w-full max-w-md rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-8 shadow-ambient sm:p-10">
      <header class="mb-8">
        <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.22em] text-tertiary">Recuperación</p>
        <h1 class="mt-2 font-sora text-2xl font-semibold tracking-tight text-primary">Restablecer acceso</h1>
        <p class="mt-2 text-sm text-on-surface-variant">Te enviaremos un enlace si Supabase Auth está configurado.</p>
      </header>

      <p v-if="message" class="mb-4 rounded-xl border border-outline-variant/60 bg-surface-container-low px-4 py-3 text-sm" role="status">{{ message }}</p>
      <p v-if="error" class="mb-4 rounded-xl border border-error/25 bg-error-container/80 px-4 py-3 text-sm text-on-error-container" role="alert">{{ error }}</p>

      <form class="space-y-5" @submit.prevent="submit">
        <FmInput id="fp-email" v-model="email" label="Correo" type="email" autocomplete="email" required />
        <FmButton native-type="submit" variant="primary" block :loading="loading">Enviar enlace</FmButton>
      </form>

      <p class="mt-8 text-center text-sm text-on-surface-variant">
        <RouterLink to="/login" class="font-semibold text-primary hover:underline">Volver al inicio de sesión</RouterLink>
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
const loading = ref(false)
const error = ref('')
const message = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    if (isMockup || !supabase) {
      message.value = 'Modo demo: contacta a un administrador o usa cuentas de prueba en Iniciar sesión.'
      return
    }
    const redirect = `${window.location.origin}/restablecer`
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.value.trim().toLowerCase(), {
      redirectTo: redirect,
    })
    if (err) throw err
    message.value = 'Si el correo existe, recibirás instrucciones en breve.'
  } catch (e) {
    error.value = e.message || 'No se pudo enviar'
  } finally {
    loading.value = false
  }
}
</script>
