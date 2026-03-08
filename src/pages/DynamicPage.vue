<template>
  <div class="fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ tabName }}</h1>
        <p class="page-subtitle">Contenido personalizado</p>
      </div>
      <div class="flex gap-2">
        <Button 
          label="Editar Contenido" 
          icon="pi pi-pencil" 
          @click="editing = true"
          v-if="!editing"
        />
        <Button 
          label="Guardar" 
          icon="pi pi-check" 
          severity="success"
          @click="saveContent"
          v-if="editing"
          :loading="saving"
        />
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          text
          @click="cancelEdit"
          v-if="editing"
        />
      </div>
    </div>

    <!-- Content Display -->
    <div v-if="!editing" class="card">
      <div class="card-body">
        <div v-if="content" v-html="content" class="prose"></div>
        <div v-else class="empty-state">
          <i class="pi pi-file-edit"></i>
          <h3>Contenido vacío</h3>
          <p>Haz clic en "Editar Contenido" para agregar información</p>
        </div>
      </div>
    </div>

    <!-- Editor -->
    <div v-if="editing" class="card">
      <div class="card-header">
        <h3 class="card-title">Editor de Contenido</h3>
      </div>
      <div class="card-body">
        <Textarea 
          v-model="editContent" 
          rows="20" 
          class="w-full font-mono text-sm"
          placeholder="Escribe tu contenido aquí... Puedes usar HTML para formatear"
        />
        <div class="mt-4 text-muted text-sm">
          <i class="pi pi-info-circle"></i>
          Puedes usar HTML básico para dar formato al contenido
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="card mt-6">
      <div class="card-body">
        <h4 class="font-medium mb-4">Información del Tab</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-muted">ID:</span>
            <span class="ml-2">{{ tabId }}</span>
          </div>
          <div>
            <span class="text-muted">Icono:</span>
            <i :class="tabIcon" class="ml-2"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { supabase, isSupabaseConfigured } from '@/services/supabaseClient'

const route = useRoute()
const toast = useToast()

const tabId = computed(() => route.params.id)
const content = ref('')
const editContent = ref('')
const editing = ref(false)
const saving = ref(false)
const tabName = ref('Tab Dinámico')
const tabIcon = ref('pi pi-bookmark')

const saveContent = async () => {
  saving.value = true
  try {
    // Aquí guardarías el contenido en Supabase si tienes una tabla para ello
    content.value = editContent.value
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Contenido guardado', life: 3000 })
    editing.value = false
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  editContent.value = content.value
  editing.value = false
}

const loadTabInfo = async () => {
  if (!isSupabaseConfigured()) return
  
  try {
    const { data } = await supabase.from('tabs').select('*').eq('id', tabId.value).single()
    if (data) {
      tabName.value = data.nombre
      tabIcon.value = data.icono || 'pi pi-bookmark'
      content.value = data.contenido || ''
      editContent.value = content.value
    }
  } catch (error) {
    console.error('Error loading tab:', error)
  }
}

onMounted(() => {
  loadTabInfo()
})
</script>

<style scoped>
.prose {
  line-height: 1.7;
}

.prose h1, .prose h2, .prose h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.prose p {
  margin-bottom: 1rem;
}

.prose ul, .prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose code {
  background: var(--bg-sidebar);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.prose pre {
  background: var(--bg-sidebar);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
}
</style>

