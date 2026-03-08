<template>
  <div class="chart-component" :style="{ height: height }">
    <Doughnut v-if="type === 'doughnut'" :data="chartData" :options="mergedOptions" />
    <Bar v-else-if="type === 'bar'" :data="chartData" :options="mergedOptions" />
    <Line v-else-if="type === 'line'" :data="chartData" :options="mergedOptions" />
    <Pie v-else-if="type === 'pie'" :data="chartData" :options="mergedOptions" />
    <HorizontalBar v-else-if="type === 'horizontalBar'" :data="chartData" :options="mergedOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut, Bar, Line, Pie, HorizontalBar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Props
const props = defineProps({
  type: {
    type: String,
    default: 'bar',
    validator: (value) => ['doughnut', 'bar', 'line', 'pie', 'horizontalBar'].includes(value)
  },
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  },
  height: {
    type: String,
    default: '300px'
  }
})

// Opciones por defecto
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20
      }
    }
  }
}

// Combinar opciones
const mergedOptions = computed(() => {
  return {
    ...defaultOptions,
    ...props.options,
    plugins: {
      ...defaultOptions.plugins,
      ...props.options.plugins
    }
  }
})

// Datos del gráfico
const chartData = computed(() => props.data)
</script>

<style scoped>
.chart-component {
  width: 100%;
  position: relative;
}
</style>

