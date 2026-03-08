<template>
  <q-table
    :rows="gastos"
    :columns="columns"
    row-key="id"
    :loading="loading"
    :pagination="pagination"
    :filter="filter"
    flat
    bordered
    class="expense-table"
  >
    <!-- Columna nombre -->
    <template v-slot:body-cell-nombre="props">
      <q-td :props="props">
        <div class="text-weight-medium">{{ props.row.nombre }}</div>
        <div v-if="props.row.observacion" class="text-caption text-grey-6">
          {{ props.row.observacion }}
        </div>
      </q-td>
    </template>

    <!-- Columna precio -->
    <template v-slot:body-cell-precio="props">
      <q-td :props="props">
        <span class="text-negative text-weight-bold text-body1">
          {{ formatCurrency(props.row.precio) }}
        </span>
      </q-td>
    </template>

    <!-- Columna categoría -->
    <template v-slot:body-cell-categoria="props">
      <q-td :props="props">
        <q-chip
          :color="getCategoriaColor(props.row.categoria)"
          text-color="white"
          size="sm"
          dense
        >
          {{ props.row.categoria || 'Sin categoría' }}
        </q-chip>
      </q-td>
    </template>

    <!-- Columna método de pago -->
    <template v-slot:body-cell-metodo_pago="props">
      <q-td :props="props">
        <div class="row items-center no-wrap">
          <q-icon :name="getMetodoIcon(props.row.metodo_pago)" class="q-mr-xs text-grey-7" />
          {{ props.row.metodo_pago || 'Sin método' }}
        </div>
      </q-td>
    </template>

    <!-- Columna fecha -->
    <template v-slot:body-cell-fecha="props">
      <q-td :props="props">
        <div>{{ formatDate(props.row.fecha) }}</div>
        <div class="text-caption text-grey-6">
          {{ formatTime(props.row.created_at) }}
        </div>
      </q-td>
    </template>

    <!-- Columna acciones -->
    <template v-slot:body-cell-acciones="props">
      <q-td :props="props" auto-width>
        <q-btn
          flat
          round
          dense
          icon="edit"
          color="primary"
          size="sm"
          @click="$emit('edit', props.row)"
        >
          <q-tooltip>Editar</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          icon="delete"
          color="negative"
          size="sm"
          @click="$emit('delete', props.row)"
        >
          <q-tooltip>Eliminar</q-tooltip>
        </q-btn>
      </q-td>
    </template>

    <!-- Loading -->
    <template v-slot:loading>
      <q-inner-loading showing color="primary" />
    </template>

    <!-- Vacío -->
    <template v-slot:no-data>
      <div class="full-width text-center q-pa-lg">
        <q-icon name="receipt_long" size="64px" color="grey-4" />
        <p class="text-h6 text-grey-6 q-mt-md">{{ noDataMessage }}</p>
        <slot name="no-data-action"></slot>
      </div>
    </template>
  </q-table>
</template>

<script setup>
import { ref } from 'vue'

/**
 * ExpenseTable.vue
 * Componente reutilizable para mostrar tabla de gastos
 */

const props = defineProps({
  gastos: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  filter: {
    type: String,
    default: ''
  },
  noDataMessage: {
    type: String,
    default: 'No hay gastos registrados'
  }
})

defineEmits(['edit', 'delete'])

// Columnas de la tabla
const columns = [
  { 
    name: 'nombre', 
    label: 'Nombre', 
    field: 'nombre', 
    align: 'left', 
    sortable: true,
    style: 'width: 200px'
  },
  { 
    name: 'precio', 
    label: 'Precio', 
    field: 'precio', 
    align: 'right', 
    sortable: true,
    style: 'width: 100px'
  },
  { 
    name: 'categoria', 
    label: 'Categoría', 
    field: 'categoria', 
    align: 'left', 
    sortable: true,
    style: 'width: 130px'
  },
  { 
    name: 'metodo_pago', 
    label: 'Método', 
    field: 'metodo_pago', 
    align: 'left',
    style: 'width: 130px'
  },
  { 
    name: 'fecha', 
    label: 'Fecha', 
    field: 'fecha', 
    align: 'left', 
    sortable: true,
    style: 'width: 120px'
  },
  { 
    name: 'acciones', 
    label: 'Acciones', 
    field: 'acciones', 
    align: 'center',
    style: 'width: 100px'
  }
]

// Paginación
const pagination = ref({
  sortBy: 'fecha',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsPerPageOptions: [5, 10, 25, 50]
})

// Métodos
function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getCategoriaColor(categoria) {
  const colors = {
    'Alimentación': 'orange',
    'Transporte': 'blue',
    'Entretenimiento': 'purple',
    'Servicios': 'teal',
    'Ropa': 'pink',
    'Salud': 'red',
    'Educación': 'indigo',
    'Hogar': 'brown',
    'Otros': 'grey'
  }
  return colors[categoria] || 'grey'
}

function getMetodoIcon(metodo) {
  const icons = {
    'Efectivo': 'payments',
    'Tarjeta Débito': 'credit_card',
    'Tarjeta Crédito': 'credit_card',
    'Bizum': 'smartphone',
    'Transferencia': 'account_balance'
  }
  return icons[metodo] || 'more_horiz'
}
</script>

<style scoped>
.expense-table {
  border-radius: 8px;
}
</style>

