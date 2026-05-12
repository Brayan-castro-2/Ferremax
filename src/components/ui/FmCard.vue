<template>
  <div :class="['rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-ambient transition duration-300 hover:border-outline-variant hover:shadow-lg', paddedClass]">
    <header v-if="$slots.title || title" class="mb-5 flex items-start justify-between gap-4">
      <div>
        <p v-if="eyebrow" class="font-geist text-[10px] font-medium uppercase tracking-[0.2em] text-on-surface-variant">{{ eyebrow }}</p>
        <h3 v-if="title" class="font-sora text-lg font-semibold tracking-tight text-primary">{{ title }}</h3>
      </div>
      <slot name="actions" />
    </header>
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  padded: { type: Boolean, default: true },
})

const paddedClass = computed(() => (props.padded ? '' : '!p-0'))
</script>
