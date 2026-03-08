<template>
  <div class="fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Nómina</h1>
        <p class="page-subtitle">Gestiona tus gastos e ingresos</p>
      </div>
      <Button 
        label="Nuevo Gasto" 
        icon="pi pi-plus" 
        @click="openDialog"
      />
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <IconField iconPosition="left" class="flex-1">
        <InputIcon class="pi pi-search" />
        <InputText v-model="filters['global'].value"  class="w-full" />
      </IconField>
      <Dropdown 
        v-model="filters['categoria'].value" 
        :options="categorias" 
        placeholder="Categoría" 
        showClear
        class="w-48"
      />
      <Calendar 
        v-model="dateRange" 
        selectionMode="range" 
        placeholder="Rango de fechas"
        showIcon
        dateFormat="dd/mm/yy"
        class="w-64"
      />
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="card p-4">
        <div class="text-muted text-sm">Total Gastos</div>
        <div class="text-2xl font-bold">${{ formatNumber(totalGastos) }}</div>
      </div>
      <div class="card p-4">
        <div class="text-muted text-sm">Cantidad de Registros</div>
        <div class="text-2xl font-bold">{{ filteredData.length }}</div>
      </div>
      <div class="card p-4">
        <div class="text-muted text-sm">Promedio por Gasto</div>
        <div class="text-2xl font-bold">${{ formatNumber(promedioGasto) }}</div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card">
      <DataTable 
        :value="filteredData" 
        :paginator="true" 
        :rows="10"
        :filters="filters"
        :loading="loading"
        filterDisplay="menu"
        :globalFilterFields="['nombre', 'categoria', 'metodo_pago']"
        stripedRows
        removableSort
        class="p-datatable-sm"
        :pt="{ wrapper: { style: 'overflow-x: auto' } }"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-lg font-medium">Lista de Gastos</span>
          </div>
        </template>
        
        <Column field="nombre" header="Nombre" sortable style="min-width: 150px">
          <template #body="{ data }">
            <span class="font-medium">{{ data.nombre }}</span>
          </template>
        </Column>
        
        <Column field="categoria" header="Categoría" sortable style="min-width: 120px">
          <template #body="{ data }">
            <Tag :value="data.categoria" :severity="getCategorySeverity(data.categoria)" />
          </template>
        </Column>
        
        <Column field="precio" header="Precio" sortable style="min-width: 100px">
          <template #body="{ data }">
            <span class="font-bold">${{ formatNumber(data.precio) }}</span>
          </template>
        </Column>
        
        <Column field="metodo_pago" header="Método" sortable style="min-width: 120px">
          <template #body="{ data }">
            <span class="text-muted">{{ data.metodo_pago }}</span>
          </template>
        </Column>
        
        <Column field="fecha" header="Fecha" sortable style="min-width: 120px">
          <template #body="{ data }">
            {{ formatDate(data.fecha) }}
          </template>
        </Column>
        
        <Column field="observacion" header="Observación" style="min-width: 150px">
          <template #body="{ data }">
            <span class="text-muted text-sm">{{ data.observacion || '-' }}</span>
          </template>
        </Column>
        
        <Column header="Acciones" style="width: 100px; text-align: center">
          <template #body="{ data }">
            <div class="flex gap-2 justify-center">
              <Button icon="pi pi-pencil" text rounded severity="info" @click="editItem(data)" v-tooltip.top="'Editar'" />
              <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(data)" v-tooltip.top="'Eliminar'" />
            </div>
          </template>
        </Column>
        
        <template #empty>
          <div class="empty-state">
            <i class="pi pi-inbox"></i>
            <h3>No se encontraron registros</h3>
            <p>Agrega un nuevo gasto usando el botón de arriba</p>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Add/Edit Dialog -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="editingItem ? 'Editar Gasto' : 'Nuevo Gasto'" 
      :style="{ width: '500px' }" 
      modal
      :closable="true"
    >
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <InputText v-model="form.nombre" placeholder="Ej: Supermercado" class="w-full" />
        </div>
        
        <div class="form-group">
          <label class="form-label">Precio *</label>
          <InputNumber v-model="form.precio" mode="currency" currency="USD" locale="es-ES" class="w-full" />
        </div>
        
        <div class="form-group">
          <label class="form-label">Categoría *</label>
          <Dropdown 
            v-model="form.categoria" 
            :options="categorias" 
            placeholder="Seleccionar"
            class="w-full"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">Método de Pago</label>
          <Dropdown 
            v-model="form.metodo_pago" 
            :options="metodosPago" 
            placeholder="Seleccionar"
            class="w-full"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">Fecha</label>
          <Calendar v-model="form.fecha" dateFormat="dd/mm/yy" showIcon class="w-full" />
        </div>
        
        <div class="form-group col-span-2">
          <label class="form-label">Observación</label>
          <Textarea v-model="form.observacion" rows="2" placeholder="Notas adicionales..." class="w-full" />
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="closeDialog" />
        <Button :label="editingItem ? 'Actualizar' : 'Guardar'" icon="pi pi-check" @click="saveItem" :loading="saving" />
      </template>
    </Dialog>

    <!-- Delete Confirmation -->
    <Dialog v-model:visible="deleteDialogVisible" header="Confirmar Eliminación" :style="{ width: '400px' }" modal>
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-2xl text-warning"></i>
        <p>¿Estás seguro de eliminar <strong>{{ itemToDelete?.nombre }}</strong>?</p>
      </div>
      <template #footer>
        <Button label="Cancelar" text @click="deleteDialogVisible = false" />
        <Button label="Eliminar" severity="danger" icon="pi pi-trash" @click="deleteItem" :loading="deleting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Tooltip from 'primevue/tooltip'
import { supabase, isSupabaseConfigured } from '@/services/supabaseClient'

// FilterMatchMode constants - defined locally
const FilterMatchMode = {
  STARTS_WITH: 'startsWith',
  ENDS_WITH: 'endsWith',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'notContains',
  EQUALS: 'equals',
  NOT_EQUALS: 'notEquals',
  IN: 'in',
  LESS_THAN: 'lt',
  LESS_THAN_OR_EQUAL_TO: 'lte',
  GREATER_THAN: 'gt',
  GREATER_THAN_OR_EQUAL_TO: 'gte',
  BETWEEN: 'between',
  DATE_IS: 'dateIs',
  DATE_IS_NOT: 'dateIsNot',
  DATE_BEFORE: 'dateBefore',
  DATE_AFTER: 'dateAfter'
}

const v = FilterMatchMode

const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const gastos = ref([])
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingItem = ref(null)
const itemToDelete = ref(null)
const dateRange = ref(null)

const form = ref({
  nombre: '',
  precio: 0,
  categoria: '',
  metodo_pago: '',
  fecha: new Date(),
  observacion: ''
})

const filters = ref({
  global: { value: null, matchMode: v.CONTAINS },
  categoria: { value: null, matchMode: v.EQUALS }
})

const categorias = [
  'Comida', 'Transporte', 'Entretenimiento', 'Servicios', 
  'Compras', 'Salud', 'Educación', 'Otros'
]

const metodosPago = ['Efectivo', 'Débito', 'Crédito', 'Transferencia', 'Otro']

// Computed
const filteredData = computed(() => {
  let data = [...gastos.value]
  
  // Filter by category
  if (filters.value.categoria.value) {
    data = data.filter(g => g.categoria === filters.value.categoria.value)
  }
  
  // Filter by date range
  if (dateRange.value && dateRange.value[0]) {
    const start = new Date(dateRange.value[0])
    const end = dateRange.value[1] ? new Date(dateRange.value[1]) : start
    data = data.filter(g => {
      const fecha = new Date(g.fecha)
      return fecha >= start && fecha <= end
    })
  }
  
  return data
})

const totalGastos = computed(() => {
  return filteredData.value.reduce((sum, g) => sum + (parseFloat(g.precio) || 0), 0)
})

const promedioGasto = computed(() => {
  return filteredData.value.length ? totalGastos.value / filteredData.value.length : 0
})

// Methods
const formatNumber = (num) => {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(num)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES')
}

const getCategorySeverity = (categoria) => {
  const severities = {
    'comida': 'warning',
    'transporte': 'info',
    'entretenimiento': 'danger',
    'servicios': 'success',
    'compras': 'secondary',
    'salud': 'danger',
    'educación': 'info'
  }
  return severities[categoria?.toLowerCase()] || 'info'
}

const openDialog = () => {
  editingItem.value = null
  form.value = {
    nombre: '',
    precio: 0,
    categoria: '',
    metodo_pago: '',
    fecha: new Date(),
    observacion: ''
  }
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  editingItem.value = null
}

const editItem = (item) => {
  editingItem.value = item
  form.value = { ...item, fecha: new Date(item.fecha) }
  dialogVisible.value = true
}

const saveItem = async () => {
  if (!form.value.nombre || !form.value.categoria) {
    toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Completa los campos requeridos', life: 3000 })
    return
  }
  
  saving.value = true
  try {
    const data = {
      nombre: form.value.nombre,
      precio: form.value.precio,
      categoria: form.value.categoria,
      metodo_pago: form.value.metodo_pago,
      fecha: form.value.fecha,
      observacion: form.value.observacion
    }
    
    if (editingItem.value) {
      // Update
      if (isSupabaseConfigured()) {
        await supabase.from('nomina').update(data).eq('id', editingItem.value.id)
      }
      const index = gastos.value.findIndex(g => g.id === editingItem.value.id)
      if (index !== -1) {
        gastos.value[index] = { ...gastos.value[index], ...data }
      }
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto actualizado', life: 3000 })
    } else {
      // Create
      if (isSupabaseConfigured()) {
        const { data: newData } = await supabase.from('nomina').insert([data]).select()
        if (newData) {
          gastos.value = [...newData, ...gastos.value]
        }
      } else {
        // Demo mode
        gastos.value = [{ ...data, id: Date.now(), created_at: new Date() }, ...gastos.value]
      }
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto guardado', life: 3000 })
    }
    
    closeDialog()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  deleteDialogVisible.value = true
}

const deleteItem = async () => {
  if (!itemToDelete.value) return
  
  deleting.value = true
  try {
    if (isSupabaseConfigured()) {
      await supabase.from('nomina').delete().eq('id', itemToDelete.value.id)
    }
    gastos.value = gastos.value.filter(g => g.id !== itemToDelete.value.id)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Gasto eliminado', life: 3000 })
    deleteDialogVisible.value = false
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } finally {
    deleting.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('nomina').select('*').order('created_at', { ascending: false })
      if (data) gastos.value = data
    } else {
      // Demo data
      gastos.value = [
        { id: 1, nombre: 'Supermercado', precio: 150, categoria: 'Comida', metodo_pago: 'Débito', fecha: '2024-01-15', observacion: 'Compras semanales', created_at: new Date() },
        { id: 2, nombre: 'Gasolina', precio: 80, categoria: 'Transporte', metodo_pago: 'Efectivo', fecha: '2024-01-14', observacion: '', created_at: new Date() },
        { id: 3, nombre: 'Netflix', precio: 15, categoria: 'Entretenimiento', metodo_pago: 'Crédito', fecha: '2024-01-13', observacion: 'Suscripción mensual', created_at: new Date() }
      ]
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.col-span-2 {
  grid-column: span 2;
}
</style>

