<template>
  <div class="card-grid">
    <div
      v-for="carta in cartas"
      :key="carta.id"
      class="grid-item"
      @click="$emit('select', carta)"
    >
      <q-card class="carta-card shadow-1 cursor-pointer">
        <!-- Imagen -->
        <div class="carta-imagen">
          <img
            v-if="carta.imagen"
            :src="carta.imagen"
            :alt="carta.character"
            class="carta-img"
            loading="lazy"
          />
          <div v-else class="carta-placeholder flex flex-center">
            <q-icon name="style" size="48px" color="grey-5" />
          </div>
          
          <!-- Badge de calidad -->
          <q-badge
            v-if="carta.quality"
            floating
            :color="getCalidadColor(carta.quality)"
            class="q-ma-xs"
          >
            {{ carta.quality }}
          </q-badge>
        </div>

        <!-- Info -->
        <q-card-section class="q-pa-sm">
          <div class="text-subtitle2 text-weight-bold ellipsis">
            {{ carta.character || 'Sin nombre' }}
          </div>
          <div class="text-caption text-grey-7 ellipsis">
            {{ carta.series || 'Sin serie' }}
          </div>
          <div class="row items-center q-mt-xs">
            <q-chip dense size="sm" color="grey-3" text-color="grey-8">
              #{{ carta.number || carta.edition || '-' }}
            </q-chip>
            <q-space />
            <span class="text-caption text-grey-6">{{ carta.code }}</span>
          </div>
        </q-card-section>

        <!-- Acciones -->
        <q-card-actions class="q-pa-xs">
          <q-btn
            v-if="showEdit"
            flat
            dense
            round
            icon="edit"
            size="sm"
            @click.stop="$emit('edit', carta)"
          />
          <q-space />
          <q-btn
            v-if="showDelete"
            flat
            dense
            round
            icon="delete"
            size="sm"
            color="negative"
            @click.stop="$emit('delete', carta)"
          />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup>
/**
 * CardGrid.vue
 * Componente reutilizable para mostrar grid de cartas
 */

defineProps({
  cartas: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Number,
    default: 6
  },
  showEdit: {
    type: Boolean,
    default: true
  },
  showDelete: {
    type: Boolean,
    default: true
  }
})

defineEmits(['select', 'edit', 'delete'])

function getCalidadColor(calidad) {
  const colors = {
    'common': 'grey',
    'uncommon': 'green',
    'rare': 'blue',
    'epic': 'purple',
    'legendary': 'orange',
    'mythic': 'red',
    'default': 'grey'
  }
  return colors[calidad?.toLowerCase()] || colors.default
}
</script>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.carta-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.carta-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.carta-imagen {
  position: relative;
  height: 140px;
  overflow: hidden;
}

.carta-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carta-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

