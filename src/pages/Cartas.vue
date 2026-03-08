<template>
  <div class="fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Colección de Cartas</h1>
        <p class="page-subtitle">Gestiona tu colección de cartas</p>
      </div>
      <div class="flex gap-2">
        <Button 
          label="Importar Excel" 
          icon="pi pi-file-excel" 
          severity="success"
          @click="showUploadDialog = true"
        />
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <IconField iconPosition="left" class="flex-1">
        <InputIcon class="pi pi-search" />
        <InputText v-model="searchQuery" class="w-full" />
      </IconField>
      <Dropdown 
        v-model="filterSeries" 
        :options="seriesOptions" 
        placeholder="Serie"
        showClear
        class="w-48"
      />
      <Dropdown 
        v-model="filterQuality" 
        :options="qualityOptions" 
        placeholder="Calidad"
        showClear
        class="w-48"
      />
      <div class="text-muted flex items-center">
        {{ filteredCartas.length }} cartas
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon primary">
          <i class="pi pi-th-large"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Total Cartas</div>
          <div class="stat-value">{{ cartas.length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">
          <i class="pi pi-star"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Series Únicas</div>
          <div class="stat-value">{{ uniqueSeries }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <i class="pi pi-verified"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Calidades Únicas</div>
          <div class="stat-value">{{ uniqueQualities }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon danger">
          <i class="pi pi-fire"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Valor Total Quemado</div>
          <div class="stat-value">${{ formatNumber(totalBurnValue) }}</div>
        </div>
      </div>
    </div>

    <!-- Card Grid -->
    <div v-if="filteredCartas.length > 0" class="card-grid">
      <div 
        v-for="carta in filteredCartas" 
        :key="carta.id"
        class="collection-card"
        @click="openCardDetail(carta)"
      >
        <div class="collection-card-image">
          <i class="pi pi-image"></i>
        </div>
        <div class="collection-card-content">
          <div class="collection-card-title">{{ carta.character || 'Sin nombre' }}</div>
          <div class="collection-card-meta">
            <span class="collection-card-tag" :class="getQualityClass(carta.quality)">
              {{ carta.quality || 'N/A' }}
            </span>
            <span>{{ carta.series || 'Sin serie' }}</span>
          </div>
          <div class="text-sm text-muted mt-2">
            #{{ carta.number }} | {{ carta.edition }}ª edición
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card p-6 text-center">
      <i class="pi pi-inbox text-4xl text-muted mb-4"></i>
      <h3 class="text-lg font-medium mb-2">No hay cartas</h3>
      <p class="text-muted mb-4">Importa un archivo Excel para agregar cartas a tu colección</p>
      <Button label="Importar Excel" icon="pi pi-upload" @click="showUploadDialog = true" />
    </div>

    <!-- Upload Dialog -->
    <Dialog v-model:visible="showUploadDialog" header="Importar Cartas desde Excel" :style="{ width: '600px' }" modal>
      <div class="mb-4">
        <p class="text-muted mb-4">Sube un archivo Excel con las siguientes columnas:</p>
        <div class="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded">
          <code>code, number, edition, character, series, quality, obtainedDate, burnValue, dye.code, dye.name, frame, morphed, trimmed, tag, alias, wishlists, fights, dropQuality, dropper, grabber, guild, worker.effort, worker.style, worker.purity, worker.grabber, worker.dropper, worker.quickness, worker.toughness, worker.vanity, worker.recoveryDate, worker.recoveryTimestamp</code>
        </div>
      </div>
      
      <FileUpload
        mode="basic"
        name="excel"
        accept=".xlsx,.xls"
        :maxFileSize="10000000"
        :auto="false"
        chooseLabel="Seleccionar Archivo"
        class="w-full"
        @select="onFileSelect"
      />
      
      <div v-if="previewData.length > 0" class="mt-4">
        <h4 class="font-medium mb-2">Vista previa ({{ previewData.length }} cartas)</h4>
        <div class="max-h-64 overflow-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="p-2 text-left">Code</th>
                <th class="p-2 text-left">Personaje</th>
                <th class="p-2 text-left">Serie</th>
                <th class="p-2 text-left">Calidad</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in previewData.slice(0, 10)" :key="idx" class="border-b">
                <td class="p-2">{{ item.code }}</td>
                <td class="p-2">{{ item.character }}</td>
                <td class="p-2">{{ item.series }}</td>
                <td class="p-2">{{ item.quality }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="previewData.length > 10" class="text-center p-2 text-muted">
            ... y {{ previewData.length - 10 }} más
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" text @click="showUploadDialog = false" />
        <Button 
          label="Importar" 
          icon="pi pi-check" 
          @click="importCartas" 
          :loading="importing"
          :disabled="previewData.length === 0"
        />
      </template>
    </Dialog>

    <!-- Card Detail Dialog -->
    <Dialog v-model:visible="showDetailDialog" :header="selectedCarta?.character" :style="{ width: '600px' }" modal>
      <div v-if="selectedCarta" class="space-y-4">
        <div class="flex gap-4">
          <div class="w-48 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <i class="pi pi-image text-4xl text-muted"></i>
          </div>
          <div class="flex-1 space-y-2">
            <div><strong>Código:</strong> {{ selectedCarta.code }}</div>
            <div><strong>Número:</strong> {{ selectedCarta.number }}</div>
            <div><strong>Edición:</strong> {{ selectedCarta.edition }}</div>
            <div><strong>Serie:</strong> {{ selectedCarta.series }}</div>
            <div><strong>Calidad:</strong> <Tag :value="selectedCarta.quality" :severity="getQualitySeverity(selectedCarta.quality)" /></div>
            <div><strong>Fecha de Obtención:</strong> {{ selectedCarta.obtainedDate }}</div>
            <div v-if="selectedCarta.burnValue"><strong>Valor de Quemado:</strong> ${{ selectedCarta.burnValue }}</div>
            <div v-if="selectedCarta.frame"><strong>Marco:</strong> {{ selectedCarta.frame }}</div>
            <div v-if="selectedCarta.morphed"><strong>Transformado:</strong> Sí</div>
            <div v-if="selectedCarta.trimmed"><strong>Recortado:</strong> Sí</div>
            <div v-if="selectedCarta.tag"><strong>Tag:</strong> {{ selectedCarta.tag }}</div>
            <div v-if="selectedCarta.alias"><strong>Alias:</strong> {{ selectedCarta.alias }}</div>
          </div>
        </div>
        
        <!-- Dye Info -->
        <div v-if="selectedCarta.dye" class="p-3 bg-gray-100 dark:bg-gray-800 rounded">
          <strong>Tinte:</strong> {{ selectedCarta.dye.name }} ({{ selectedCarta.dye.code }})
        </div>
        
        <!-- Worker Info -->
        <div v-if="selectedCarta.worker" class="p-3 bg-gray-100 dark:bg-gray-800 rounded">
          <strong>Worker:</strong>
          <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>Esfuerzo: {{ selectedCarta.worker.effort }}</div>
            <div>Estilo: {{ selectedCarta.worker.style }}</div>
            <div>Pureza: {{ selectedCarta.worker.purity }}</div>
            <div>Quickness: {{ selectedCarta.worker.quickness }}</div>
            <div>Toughness: {{ selectedCarta.worker.toughness }}</div>
            <div>Vanity: {{ selectedCarta.worker.vanity }}</div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button label="Cerrar" @click="showDetailDialog = false" />
        <Button label="Eliminar" severity="danger" icon="pi pi-trash" @click="deleteCarta" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import * as XLSX from 'xlsx'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import FileUpload from 'primevue/fileupload'
import Tag from 'primevue/tag'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { supabase, isSupabaseConfigured } from '@/services/supabaseClient'

const toast = useToast()

const cartas = ref([])
const searchQuery = ref('')
const filterSeries = ref(null)
const filterQuality = ref(null)
const showUploadDialog = ref(false)
const showDetailDialog = ref(false)
const selectedCarta = ref(null)
const previewData = ref([])
const importing = ref(false)

const seriesOptions = computed(() => {
  const series = new Set(cartas.value.map(c => c.series).filter(Boolean))
  return Array.from(series)
})

const qualityOptions = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic']

const filteredCartas = computed(() => {
  let data = [...cartas.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(c => 
      (c.character || '').toLowerCase().includes(query) ||
      (c.series || '').toLowerCase().includes(query) ||
      (c.code || '').toLowerCase().includes(query)
    )
  }
  
  if (filterSeries.value) {
    data = data.filter(c => c.series === filterSeries.value)
  }
  
  if (filterQuality.value) {
    data = data.filter(c => c.quality === filterQuality.value)
  }
  
  return data
})

const uniqueSeries = computed(() => {
  return new Set(cartas.value.map(c => c.series).filter(Boolean)).size
})

const uniqueQualities = computed(() => {
  return new Set(cartas.value.map(c => c.quality).filter(Boolean)).size
})

const totalBurnValue = computed(() => {
  return cartas.value.reduce((sum, c) => sum + (parseFloat(c.burnValue) || 0), 0)
})

// Methods
const formatNumber = (num) => {
  return new Intl.NumberFormat('es-ES').format(num)
}

const getQualityClass = (quality) => {
  const classes = {
    'common': 'quality-common',
    'uncommon': 'quality-uncommon',
    'rare': 'quality-rare',
    'epic': 'quality-epic',
    'legendary': 'quality-legendary',
    'mythic': 'quality-mythic'
  }
  return classes[quality?.toLowerCase()] || ''
}

const getQualitySeverity = (quality) => {
  const severities = {
    'common': 'secondary',
    'uncommon': 'success',
    'rare': 'info',
    'epic': 'warning',
    'legendary': 'danger',
    'mythic': 'danger'
  }
  return severities[quality?.toLowerCase()] || 'info'
}

const onFileSelect = (event) => {
  const file = event.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet)
      previewData.value = jsonData
      toast.add({ severity: 'info', summary: 'Archivo leído', detail: `${jsonData.length} cartas encontradas`, life: 3000 })
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Error al leer el archivo Excel', life: 3000 })
    }
  }
  reader.readAsArrayBuffer(file)
}

const importCartas = async () => {
  if (previewData.value.length === 0) return
  
  importing.value = true
  try {
    if (isSupabaseConfigured()) {
      // Import to Supabase
      const { data, error } = await supabase.from('cartas').insert(previewData.value).select()
      if (error) throw error
      cartas.value = [...data, ...cartas.value]
    } else {
      // Demo mode
      const newCartas = previewData.value.map((c, idx) => ({
        ...c,
        id: Date.now() + idx
      }))
      cartas.value = [...newCartas, ...cartas.value]
    }
    
    toast.add({ severity: 'success', summary: 'Éxito', detail: `${previewData.value.length} cartas importadas`, life: 3000 })
    showUploadDialog.value = false
    previewData.value = []
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } finally {
    importing.value = false
  }
}

const openCardDetail = (carta) => {
  selectedCarta.value = carta
  showDetailDialog.value = true
}

const deleteCarta = async () => {
  if (!selectedCarta.value) return
  
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('cartas').delete().eq('id', selectedCarta.value.id)
    }
    cartas.value = cartas.value.filter(c => c.id !== selectedCarta.value.id)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Carta eliminada', life: 3000 })
    showDetailDialog.value = false
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  }
}

const loadData = async () => {
  if (isSupabaseConfigured()) {
    const { data } = await supabase.from('cartas').select('*').order('id', { ascending: false })
    if (data) cartas.value = data
  } else {
    // Demo data
    cartas.value = [
      { id: 1, code: 'C001', number: 1, edition: 1, character: 'Dragon Knight', series: 'Fantasy', quality: 'Legendary', burnValue: 500 },
      { id: 2, code: 'C002', number: 2, edition: 1, character: 'Mage', series: 'Fantasy', quality: 'Epic', burnValue: 300 },
      { id: 3, code: 'C003', number: 3, edition: 2, character: 'Warrior', series: 'Action', quality: 'Rare', burnValue: 150 }
    ]
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 16px;
}

.space-y-2 > * + * {
  margin-top: 8px;
}
</style>

