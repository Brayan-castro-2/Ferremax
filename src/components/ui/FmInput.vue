<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" :for="id" class="font-geist text-[10px] font-medium uppercase tracking-[0.16em] text-on-surface-variant">{{ label }}</label>
    <input
      :id="id"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="w-full rounded-xl border border-outline-variant/80 bg-surface-container-low px-4 py-3 font-inter text-sm text-on-surface shadow-inner transition placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="hint" class="text-xs text-on-surface-variant">{{ hint }}</p>
    <p v-if="error" class="text-xs text-error" role="alert">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  modelValue: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  autocomplete: { type: String, default: 'off' },
})

defineEmits(['update:modelValue'])
</script>
