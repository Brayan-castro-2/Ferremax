<template>
  <RouterLink
    v-if="to && !disabled"
    :to="to"
    :class="classes"
    class="fm-btn inline-flex items-center justify-center gap-2 font-geist text-[11px] font-semibold uppercase tracking-[0.14em] transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <span v-if="loading" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
    <slot />
  </RouterLink>
  <span
    v-else-if="to && disabled"
    :class="[classes, 'cursor-not-allowed opacity-45']"
    aria-disabled="true"
  >
    <slot />
  </span>
  <button
    v-else
    :type="nativeType"
    :disabled="disabled || loading"
    :class="classes"
    class="fm-btn inline-flex items-center justify-center gap-2 font-geist text-[11px] font-semibold uppercase tracking-[0.14em] transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-45"
  >
    <span v-if="loading" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  to: { type: [String, Object], default: null },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  nativeType: { type: String, default: 'button' },
})

const classes = computed(() => {
  const base = props.block ? 'w-full' : ''
  const size =
    props.size === 'sm'
      ? 'rounded-lg px-4 py-2.5'
      : props.size === 'lg'
        ? 'rounded-xl px-8 py-4'
        : 'rounded-xl px-6 py-3.5'
  const variants = {
    primary: 'bg-primary text-on-primary shadow-ambient hover:-translate-y-0.5 hover:shadow-lg',
    secondary: 'border border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary/40 hover:bg-surface-container-low',
    accent: 'bg-tertiary text-on-tertiary shadow-ambient hover:-translate-y-0.5 hover:brightness-110',
    ghost: 'border border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
    danger: 'bg-error text-on-error hover:brightness-105',
  }
  return [base, size, variants[props.variant] || variants.primary].join(' ')
})
</script>
