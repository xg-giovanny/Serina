<template>
  <div class="dynamic-tabs">
    <!-- Botón para agregar -->
    <q-btn
      color="positive"
      :icon="buttonIcon"
      :label="buttonLabel"
      @click="showDialog = true"
      class="q-mb-md"
    />

    <!-- Lista de tabs -->
    <div v-if="tabs.length > 0" class="q-gutter-sm">
      <q-chip
        v-for="tab in tabs"
        :key="tab.id"
        :icon="tab.icono"
        removable
        @remove="confirmarEliminar(tab)"
        @click="seleccionarTab(tab)"
        :color="tab.id === tabActivo ? 'primary' : 'grey'"
        text-color="white"
      >
        {{ tab.nombre }}
      </q-chip>
    </div>

    <!-- Mensaje vacío -->
    <div v-else class="text-center q-pa-md text-grey-6">
      <q-icon name="tab" size="48px" />
      <p>No hay tabs creados</p>
    </div>

    <!-- Dialog para crear nuevo tab -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Crear Nuevo Tab</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="nuevoTab.nombre"
            label="Nombre del tab"
            outlined
            class="q-mb-md"
            :rules="[val => !!val || 'El nombre es requerido']"
            @keyup.enter="crearTab"
          >
            <template v-slot:prepend>
              <q-icon name="label" />
            </template>
          </q-input>

          <q-select
            v-model="nuevoTab.icono"
            label="Icono"
            :options="iconOptions"
            outlined
            emit-value
            map-options
          >
            <template v-slot:prepend>
              <q-icon name="emoji_emotions" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.value" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup @click="resetForm" />
          <q-btn
            flat
            label="Crear"
            @click="crearTab"
            :loading="loading"
            :disable="!nuevoTab.nombre"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useTabsStore } from '@/stores/tabsStore'

const $q = useQuasar()
const tabsStore = useTabsStore()

// Props
const props = defineProps({
  buttonLabel: {
    type: String,
    default: 'Agregar Tab'
  },
  buttonIcon: {
    type: String,
    default: 'add'
  }
})

// Emits
const emit = defineEmits(['select', 'created', 'deleted'])

// Estado
const showDialog = ref(false)
const loading = ref(false)
const tabActivo = ref(null)

const nuevoTab = ref({
  nombre: '',
  icono: 'article'
})

// Opciones de iconos
const iconOptions = [
  { label: 'Artículo', value: 'article' },
  { label: 'Persona', value: 'person' },
  { label: 'Grupo', value: 'groups' },
  { label: 'Gráfico', value: 'insights' },
  { label: 'Archivo', value: 'folder' },
  { label: 'Mensaje', value: 'message' },
  { label: 'Configuración', value: 'settings' },
  { label: 'Estrella', value: 'star' },
  { label: 'Corazón', value: 'favorite' },
  { label: 'Dinero', value: 'attach_money' },
  { label: 'Tienda', value: 'store' },
  { label: 'Evento', value: 'event' },
  { label: 'Nota', value: 'note' },
  { label: 'Imagen', value: 'image' },
  { label: 'Video', value: 'videocam' },
  { label: 'Juego', value: 'sports_esports' },
  { label: 'Libro', value: 'book' },
  { label: 'Música', value: 'music_note' },
  { label: 'Película', value: 'movie' },
  { label: 'Comida', value: 'restaurant' }
]

// Computed
const tabs = ref([])

// Watch para cargar tabs desde el store
watch(() => tabsStore.tabs, (newTabs) => {
  tabs.value = newTabs
}, { immediate: true })

// Métodos
function seleccionarTab(tab) {
  tabActivo.value = tab.id
  emit('select', tab)
}

async function crearTab() {
  if (!nuevoTab.value.nombre) {
    $q.notify({
      type: 'warning',
      message: 'El nombre es requerido',
      position: 'top-right'
    })
    return
  }

  loading.value = true

  const result = await tabsStore.crearTab({
    nombre: nuevoTab.value.nombre,
    icono: nuevoTab.value.icono
  })

  loading.value = false

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Tab creado correctamente',
      position: 'top-right'
    })
    showDialog.value = false
    emit('created', result.data)
    resetForm()
  } else {
    $q.notify({
      type: 'negative',
      message: result.error || 'Error al crear tab',
      position: 'top-right'
    })
  }
}

function confirmarEliminar(tab) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Eliminar "${tab.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const result = await tabsStore.eliminarTab(tab.id)
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Tab eliminado',
        position: 'top-right'
      })
      emit('deleted', tab)
      
      if (tabActivo.value === tab.id) {
        tabActivo.value = null
      }
    }
  })
}

function resetForm() {
  nuevoTab.value = {
    nombre: '',
    icono: 'article'
  }
}

// Cargar tabs al montar
onMounted(async () => {
  await tabsStore.fetchTabs()
  tabs.value = tabsStore.tabs
})
</script>

<style scoped>
.dynamic-tabs {
  width: 100%;
}
</style>

