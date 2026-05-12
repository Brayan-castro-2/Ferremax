<template>
  <main class="flex min-h-screen items-center justify-center bg-surface px-margin-mobile py-16 font-inter">
    <div class="w-full max-w-md rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-8 shadow-ambient sm:p-10">
      <header class="mb-8">
        <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.22em] text-tertiary">Nueva contraseña</p>
        <h1 class="mt-2 font-sora text-2xl font-semibold tracking-tight text-primary">Define tu clave</h1>
        <p class="mt-2 text-sm text-on-surface-variant">Tras abrir el enlace de recuperación, Supabase restaura la sesión temporal.</p>
      </header>

      <p v-if="error" class="mb-4 rounded-xl border border-error/25 bg-error-container/80 px-4 py-3 text-sm text-on-error-container" role="alert">{{ error }}</p>
      <p v-if="message" class="mb-4 rounded-xl border border-outline-variant/60 bg-surface-container-low px-4 py-3 text-sm" role="status">{{ message }}</p>

      <form v-if="ready" class="space-y-5" @submit.prevent="submit">
        <FmInput id="np-pass" v-model="password" label="Nueva contraseña" type="password" autocomplete="new-password" required />
        <FmInput id="np-pass2" v-model="password2" label="Repetir" type="password" autocomplete="new-password" required />
        <FmButton native-type="submit" variant="primary" block :loading="loading">Actualizar</FmButton>
      </form>
      <p v-else class="text-sm text-on-surface-variant">Comprobando sesión de recuperación…</p>

      <p class="mt-8 text-center text-sm text-on-surface-variant">
        <RouterLink to="/login" class="font-semibold text-primary hover:underline">Ir al login</RouterLink>
      </p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase, isMockup } from '@/lib/supabase.js'
import FmInput from '@/components/ui/FmInput.vue'
import FmButton from '@/components/ui/FmButton.vue'

const password = ref('')
const password2 = ref('')
const loading = ref(false)
const error = ref('')
const message = ref('')
const ready = ref(false)

onMounted(async () => {
  if (isMockup || !supabase) {
    ready.value = true
    error.value = 'Modo demo: el restablecimiento vía enlace no aplica. Usa Iniciar sesión con cuentas de prueba.'
    return
  }
  const { data } = await supabase.auth.getSession()
  ready.value = true
  if (!data.session) {
    error.value = 'Sesión de recuperación no encontrada. Abre el enlace del correo o solicita uno nuevo.'
  }
})

async function submit() {
  if (password.value !== password2.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  loading.value = true
  error.value = ''
  try {
    if (isMockup || !supabase) return
    const { error: err } = await supabase.auth.updateUser({ password: password.value })
    if (err) throw err
    message.value = 'Contraseña actualizada. Ya puedes iniciar sesión.'
  } catch (e) {
    error.value = e.message || 'No se pudo actualizar'
  } finally {
    loading.value = false
  }
}
</script>
