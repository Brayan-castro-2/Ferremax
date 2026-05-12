<template>
  <Teleport to="body">
    <Transition name="fm-modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[400] flex items-center justify-center bg-primary/40 px-4 py-10 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @keydown.esc.prevent="$emit('update:modelValue', false)"
      >
        <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-8 shadow-2xl" @click.stop>
          <div class="mb-6 flex items-start justify-between gap-4">
            <div>
              <p v-if="eyebrow" class="font-geist text-[10px] font-medium uppercase tracking-[0.2em] text-on-tertiary-container">{{ eyebrow }}</p>
              <h2 :id="titleId" class="font-sora text-xl font-semibold tracking-tight text-primary">{{ title }}</h2>
            </div>
            <button
              type="button"
              class="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
              aria-label="Cerrar"
              @click="$emit('update:modelValue', false)"
            >
              ✕
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const titleId = computed(() => `fm-modal-${props.title?.slice(0, 8) || 't'}`)
</script>

<style scoped>
.fm-modal-enter-active,
.fm-modal-leave-active {
  transition: opacity 0.2s ease;
}
.fm-modal-enter-from,
.fm-modal-leave-to {
  opacity: 0;
}
</style>
