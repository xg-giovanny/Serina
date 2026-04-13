<template>
  <div>
    <!-- Charts Row -->
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
import { useThemeStore } from '@/store/themeStore'

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

const themeStore = useThemeStore()

const props = defineProps({
  gastos: {
    type: Array,
    required: true
  }
})

// Color palettes
const lightColors = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6'
}

const darkColors = {
  primary: '#818cf8',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#60a5fa',
  purple: '#a78bfa'
}

const currentColors = computed(() => themeStore.isDark ? darkColors : lightColors)

// Chart Data - Gastos por Categoría
const chartDataCategoria = computed(() => {
  const categorias = {}
  props.gastos.forEach(g => {
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
  props.gastos.forEach(g => {
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
  props.gastos.forEach(g => {
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
      backgroundColor: themeStore.isDark ? 'rgba(129, 140, 248, 0.1)' : 'rgba(99, 102, 241, 0.1)',
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
      grid: { color: themeStore.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
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
        color: themeStore.isDark ? '#f1f5f9' : '#374151'
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
      grid: { color: themeStore.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
    },
    x: {
      grid: { display: false }
    }
  }
}))
</script>
