<template>
  <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 font-geist text-[10px] font-semibold uppercase tracking-wider', tone]">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tone: { type: String, default: 'neutral' },
})

const tone = computed(() => {
  const map = {
    neutral: 'bg-surface-container-high text-on-surface-variant ring-1 ring-outline-variant/50',
    success: 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80',
    warning: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80',
    danger: 'bg-error-container text-on-error-container ring-1 ring-error/20',
    accent: 'bg-tertiary-fixed-dim/30 text-tertiary ring-1 ring-tertiary/25',
    info: 'bg-surface-container text-on-surface ring-1 ring-outline-variant',
  }
  return map[props.tone] || map.neutral
})
</script>
