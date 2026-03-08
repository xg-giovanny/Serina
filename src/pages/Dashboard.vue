<template>
  <div class="fade-in">


    <!-- Stats Cards -->
    <div class="grid grid-cols-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon primary">
          <i class="pi pi-wallet"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Total Gastos</div>
          <div class="stat-value">${{ formatNumber(totalGastos) }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon success">
          <i class="pi pi-chart-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Ahorro</div>
          <div class="stat-value">${{ formatNumber(ahorro) }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon warning">
          <i class="pi pi-th-large"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Cartas</div>
          <div class="stat-value">{{ totalCartas }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon danger">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Último Movimiento</div>
          <div class="stat-value text-sm">{{ ultimoMovimiento }}</div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-2 gap-6 mb-6">
      <div class="chart-container">
        <h3 class="card-title mb-4">Gastos por Categoría</h3>
        <div style="height: 300px">
          <Bar v-if="chartDataCategoria.labels.length" :data="chartDataCategoria" :options="chartOptions" />
          <div v-else class="empty-state">
            <i class="pi pi-chart-bar"></i>
            <p>No hay datos suficientes</p>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <h3 class="card-title mb-4">Gastos por Método de Pago</h3>
        <div style="height: 300px">
          <Doughnut v-if="chartDataMetodo.labels.length" :data="chartDataMetodo" :options="chartOptionsDonut" />
          <div v-else class="empty-state">
            <i class="pi pi-chart-pie"></i>
            <p>No hay datos suficientes</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Chart -->
    <div class="chart-container mb-6">
      <h3 class="card-title mb-4">Gastos por Mes</h3>
      <div style="height: 300px">
        <Line v-if="chartDataMensual.labels.length" :data="chartDataMensual" :options="chartOptionsLine" />
        <div v-else class="empty-state">
          <i class="pi pi-calendar"></i>
          <p>No hay datos suficientes</p>
        </div>
      </div>
    </div>

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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { supabase, isSupabaseConfigured } from '@/services/supabaseClient'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const isDark = ref(false)
const gastos = ref([])
const cartas = ref([])

// Light mode colors
const lightColors = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6'
}

// Dark mode colors
const darkColors = {
  primary: '#818cf8',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#60a5fa',
  purple: '#a78bfa'
}

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

// Get current colors based on theme
const currentColors = computed(() => isDark.value ? darkColors : lightColors)

// Chart Data - Gastos por Categoría
const chartDataCategoria = computed(() => {
  const categorias = {}
  gastos.value.forEach(g => {
    const cat = g.categoria || 'Sin categoría'
    categorias[cat] = (categorias[cat] || 0) + parseFloat(g.precio || 0)
  })
  
  const colors = currentColors.value
  
  return {
    labels: Object.keys(categorias),
    datasets: [{
      label: 'Gastos por Categoría',
      data: Object.values(categorias),
      backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger, colors.info, colors.purple],
      borderRadius: 8
    }]
  }
})

// Chart Data - Gastos por Método de Pago
const chartDataMetodo = computed(() => {
  const metodos = {}
  gastos.value.forEach(g => {
    const met = g.metodo_pago || 'Sin método'
    metodos[met] = (metodos[met] || 0) + parseFloat(g.precio || 0)
  })
  
  const colors = currentColors.value
  
  return {
    labels: Object.keys(metodos),
    datasets: [{
      data: Object.values(metodos),
      backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger, colors.info],
      borderWidth: 0
    }]
  }
})

// Chart Data - Gastos Mensuales
const chartDataMensual = computed(() => {
  const meses = {}
  gastos.value.forEach(g => {
    if (g.fecha) {
      const fecha = new Date(g.fecha)
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      meses[mes] = (meses[mes] || 0) + parseFloat(g.precio || 0)
    }
  })
  
  const sortedMonths = Object.keys(meses).sort()
  const colors = currentColors.value
  
  return {
    labels: sortedMonths,
    datasets: [{
      label: 'Gastos Mensuales',
      data: sortedMonths.map(m => meses[m]),
      borderColor: colors.primary,
      backgroundColor: isDark.value ? 'rgba(129, 140, 248, 0.1)' : 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }
})

// Chart Options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: isDark.value ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
    },
    x: {
      grid: { display: false }
    }
  }
}))

const chartOptionsDonut = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: isDark.value ? '#f1f5f9' : '#374151'
      }
    }
  }
}))

const chartOptionsLine = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: isDark.value ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
    },
    x: {
      grid: { display: false }
    }
  }
}))

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

// Handle theme changes
const handleThemeChange = () => {
  const savedTheme = localStorage.getItem('theme')
  isDark.value = savedTheme === 'dark'
}

const loadData = async () => {
  if (!isSupabaseConfigured()) {
    // Modo demo con datos de ejemplo
    gastos.value = [
      { id: 1, nombre: 'Supermercado', precio: 150, categoria: 'comida', metodo_pago: 'Débito', fecha: '2024-01-15', created_at: new Date() },
      { id: 2, nombre: 'Gasolina', precio: 80, categoria: 'transporte', metodo_pago: 'Efectivo', fecha: '2024-01-14', created_at: new Date() },
      { id: 3, nombre: 'Netflix', precio: 15, categoria: 'entretenimiento', metodo_pago: 'Crédito', fecha: '2024-01-13', created_at: new Date() }
    ]
    cartas.value = [{ id: 1 }, { id: 2 }, { id: 3 }]
    return
  }

  try {
    const { data: gastosData } = await supabase.from('nomina').select('*').order('created_at', { ascending: false })
    if (gastosData) gastos.value = gastosData

    const { data: cartasData } = await supabase.from('cartas').select('id')
    if (cartasData) cartas.value = cartasData
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
}

onMounted(async () => {
  // Load theme from localStorage
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDark.value)

  // Listen for theme changes
  window.addEventListener('themechange', handleThemeChange)
  window.addEventListener('theme-changed', handleThemeChange)

  await loadData()
})

onUnmounted(() => {
  window.removeEventListener('themechange', handleThemeChange)
  window.removeEventListener('theme-changed', handleThemeChange)
})
</script>

