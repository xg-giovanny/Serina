<template>
  <div class="excel-uploader">
    <!-- Área de upload -->
    <q-file
      v-model="file"
      :label="label"
      outlined
      :accept="accept"
      :filter="checkFileType"
      :disable="loading"
      @rejected="onRejected"
      @update:model-value="onFileSelected"
    >
      <template v-slot:prepend>
        <q-icon name="attach_file" />
      </template>
      <template v-slot:append>
        <q-icon v-if="file" name="close" class="cursor-pointer" @click.stop="clearFile" />
      </template>
    </q-file>

    <!-- Preview de datos -->
    <div v-if="previewData.length > 0" class="q-mt-md">
      <q-chip color="positive" text-color="white" icon="check_circle" @remove="clearFile" removable>
        {{ previewData.length }} registros detectados
      </q-chip>

      <!-- Tabla de preview -->
      <q-table
        :rows="previewData.slice(0, previewLimit)"
        :columns="previewColumns"
        flat
        dense
        class="q-mt-md"
        :rows-per-page-options="[0]"
        :pagination="{ rowsPerPage: 0 }"
      >
        <template v-slot:no-data>
          <div></div>
        </template>
      </q-table>

      <p v-if="previewData.length > previewLimit" class="text-caption text-grey-6 q-mt-sm">
        ... y {{ previewData.length - previewLimit }} más
      </p>
    </div>

    <!-- Información de columnas requeridas -->
    <q-expansion-item
      v-if="showColumnsInfo"
      icon="info"
      label="Ver columnas requeridas"
      class="q-mt-md"
    >
      <q-card class="bg-grey-1">
        <q-card-section>
          <p class="text-caption">Columnas esperadas en el Excel:</p>
          <div class="row q-gutter-xs">
            <q-chip v-for="col in requiredColumns" :key="col" size="sm">
              {{ col }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Loading indicator -->
    <div v-if="loading" class="q-mt-md">
      <q-linear-progress indeterminate color="primary" />
      <p class="text-caption text-grey-6 q-mt-sm">{{ loadingMessage }}</p>
    </div>

    <!-- Error message -->
    <q-banner v-if="error" class="bg-negative text-white q-mt-md" rounded>
      <template v-slot:avatar>
        <q-icon name="error" />
      </template>
      {{ error }}
    </q-banner>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { processCartasExcel } from '@/utils/excelParser'

const $q = useQuasar()

// Props
const props = defineProps({
  label: {
    type: String,
    default: 'Seleccionar archivo Excel'
  },
  accept: {
    type: String,
    default: '.xlsx, .xls'
  },
  previewLimit: {
    type: Number,
    default: 5
  },
  showColumnsInfo: {
    type: Boolean,
    default: true
  },
  requiredColumns: {
    type: Array,
    default: () => [
      'code', 'number', 'edition', 'character', 'series', 'quality',
      'obtainedDate', 'burnValue', 'dye.code', 'dye.name', 'frame',
      'morphed', 'trimmed', 'tag', 'alias', 'wishlists', 'fights',
      'dropQuality', 'dropper', 'grabber', 'guild',
      'worker.effort', 'worker.style', 'worker.purity', 'worker.grabber',
      'worker.dropper', 'worker.quickness', 'worker.toughness',
      'worker.vanity', 'worker.recoveryDate'
    ]
  },
  emitPreview: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['processed', 'error', 'clear'])

// Estado
const file = ref(null)
const previewData = ref([])
const loading = ref(false)
const loadingMessage = ref('')
const error = ref(null)

// Columnas para preview (se generarán dinámicamente)
const previewColumns = ref([])

// Watch para archivo seleccionado
watch(file, async (newFile) => {
  if (newFile) {
    await processFile(newFile)
  } else {
    clearData()
  }
})

// Métodos
function checkFileType(files) {
  return files.filter(f => 
    f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
  )
}

function onRejected() {
  $q.notify({
    type: 'negative',
    message: 'Solo se permiten archivos Excel (.xlsx, .xls)',
    position: 'top-right'
  })
  error.value = 'Tipo de archivo no válido'
  emit('error', error.value)
}

async function processFile(selectedFile) {
  loading.value = true
  loadingMessage.value = 'Procesando archivo...'
  error.value = null
  previewData.value = []

  try {
    const result = await processCartasExcel(selectedFile)

    if (result.success) {
      previewData.value = result.data
      
      // Generar columnas para preview
      if (result.data.length > 0) {
        const firstRow = result.data[0]
        previewColumns.value = Object.keys(firstRow).map(key => ({
          name: key,
          label: key,
          field: key,
          align: 'left'
        }))
      }

      // Emitir datos procesados
      emit('processed', {
        file: selectedFile,
        data: result.data,
        total: result.total
      })

      $q.notify({
        type: 'positive',
        message: `${result.total} registros procesados`,
        position: 'top-right'
      })
    } else {
      error.value = result.error
      emit('error', result.error)
    }
  } catch (err) {
    error.value = err.message
    emit('error', err.message)
  } finally {
    loading.value = false
    loadingMessage.value = ''
  }
}

function onFileSelected(selectedFile) {
  // Este watcher maneja el archivo
}

function clearFile() {
  file.value = null
  clearData()
  emit('clear')
}

function clearData() {
  previewData.value = []
  previewColumns.value = []
  error.value = null
}

// Exponer métodos
defineExpose({
  clearFile,
  previewData,
  loading,
  error
})
</script>

<style scoped>
.excel-uploader {
  width: 100%;
}
</style>

