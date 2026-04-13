<template>
  <div class="stat-card">
    <div class="stat-icon" :class="severity">
      <i :class="icon"></i>
    </div>
    <div class="stat-content">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value" :class="valueClass">{{ formattedValue }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    default: 'primary',
    validator: (val) => ['primary', 'success', 'warning', 'danger'].includes(val)
  },
  prefix: {
    type: String,
    default: ''
  },
  valueClass: {
    type: String,
    default: ''
  },
  formatNumber: {
    type: Boolean,
    default: false
  }
})

const formattedValue = computed(() => {
  if (props.formatNumber && typeof props.value === 'number') {
    const formatted = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(props.value)
    return `${props.prefix}${formatted}`
  }
  return `${props.prefix}${props.value}`
})
</script>
