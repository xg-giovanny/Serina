<template>
  <q-card class="stats-card shadow-1">
    <q-card-section>
      <div class="row items-center no-wrap">
        <q-avatar
          :color="color"
          text-color="white"
          :icon="icon"
          size="56px"
          class="q-mr-md"
        />
        <div class="col">
          <div class="text-caption text-grey-7 text-uppercase">
            {{ title }}
          </div>
          <div class="text-h5 text-weight-bold">
            {{ value }}
          </div>
          <div class="text-caption text-grey-6" v-if="subtitle">
            {{ subtitle }}
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
/**
 * StatsCard.vue
 * Componente reutilizable para mostrar tarjetas de estadísticas
 */

defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    default: 'analytics'
  },
  color: {
    type: String,
    default: 'primary'
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.stats-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
</style>

