<template>
  <div class="fade-in">

    <!-- Stats Cards -->
    <div class="grid grid-cols-4 mb-6">
      <StatCard
        label="Total Gastos"
        :value="totalGastos"
        icon="pi pi-wallet"
        severity="primary"
        prefix="$"
        :formatNumber="true"
      />
      <StatCard
        label="Ahorro"
        :value="ahorro"
        icon="pi pi-chart-line"
        severity="success"
        prefix="$"
        :formatNumber="true"
      />
      <StatCard
        label="Cartas"
        :value="totalCartas"
        icon="pi pi-th-large"
        severity="warning"
      />
      <StatCard
        label="Último Movimiento"
        :value="ultimoMovimiento"
        icon="pi pi-clock"
        severity="danger"
        valueClass="text-sm"
      />
    </div>

    <!-- Charts -->
    <ExpenseCharts :gastos="gastos" />

    <!-- Recent Transactions -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Últimos Movimientos</h3>
        <Button label="Ver Todos" icon="pi pi-arrow-right" iconPos="right" text @click="$router.push('/nomina')" />
      </div>
      <div class="card-body p-0">
        <DataTable :value="recentTransactions" :paginator="false" :rows="5" class="p-datatable-sm">
          <Column field="nombre" header="Nombre">
            <template #body="{ data }">
              <span class="font-medium">{{ data.nombre }}</span>
            </template>
          </Column>
          <Column field="categoria" header="Categoría">
            <template #body="{ data }">
              <Tag :value="data.categoria" :severity="getCategorySeverity(data.categoria)" />
            </template>
          </Column>
          <Column field="precio" header="Monto">
            <template #body="{ data }">
              <span class="font-medium">${{ formatNumber(data.precio) }}</span>
            </template>
          </Column>
          <Column field="fecha" header="Fecha">
            <template #body="{ data }">
              <span class="text-muted">{{ formatDate(data.fecha) }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { getAllNomina } from '@/services/nominaApi'
import { getAllCartas } from '@/services/cartasApi'

// Componentes extraídos
import StatCard from '@/components/cards/StatCard.vue'
import ExpenseCharts from '@/components/charts/ExpenseCharts.vue'

const gastos = ref([])
const cartas = ref([])

// Computed
const totalGastos = computed(() => {
  return gastos.value.reduce((sum, g) => sum + (parseFloat(g.precio) || 0), 0)
})

const ahorro = computed(() => {
  // Ejemplo: ahorro = ingresos - gastos (aquí simplificado)
  return totalGastos.value > 0 ? totalGastos.value * 0.2 : 0
})

const totalCartas = computed(() => cartas.value.length)

const ultimoMovimiento = computed(() => {
  if (!gastos.value.length) return 'Sin datos'
  const latest = gastos.value.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
  return latest ? formatDate(latest.fecha) : 'Sin datos'
})

const recentTransactions = computed(() => {
  return [...gastos.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
})

// Methods
const formatNumber = (num) => {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(num)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getCategorySeverity = (categoria) => {
  const severities = {
    'comida': 'warning',
    'transporte': 'info',
    'entretenimiento': 'danger',
    'servicios': 'success',
    'compras': 'secondary'
  }
  return severities[categoria?.toLowerCase()] || 'info'
}

const loadData = async () => {
  try {
    const nominaResult = await getAllNomina()
    if (nominaResult.success) gastos.value = nominaResult.data

    const cartasResult = await getAllCartas()
    if (cartasResult.success) cartas.value = cartasResult.data
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
}

onMounted(async () => {
  await loadData()
})
</script>
