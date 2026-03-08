<template>
  <q-card class="expense-form shadow-1">
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon :name="isEditing ? 'edit' : 'add_circle'" class="q-mr-sm" />
        {{ isEditing ? 'Editar' : 'Nuevo' }} Gasto
      </div>

      <q-form @submit="submitForm" class="q-gutter-md">
        <!-- Nombre -->
        <q-input
          v-model="form.nombre"
          label="Nombre del gasto"
          outlined
          :rules="[val => !!val || 'El nombre es requerido']"
        >
          <template v-slot:prepend>
            <q-icon name="label" />
          </template>
        </q-input>

        <!-- Precio -->
        <q-input
          v-model.number="form.precio"
          label="Precio"
          type="number"
          prefix="€"
          outlined
          :rules="[
            val => val >= 0 || 'El precio debe ser positivo',
            val => val !== '' || 'El precio es requerido'
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="attach_money" />
          </template>
        </q-input>

        <!-- Categoría -->
        <q-select
          v-model="form.categoria"
          label="Categoría"
          :options="categoriasOptions"
          outlined
          emit-value
          map-options
        >
          <template v-slot:prepend>
            <q-icon name="category" />
          </template>
        </q-select>

        <!-- Método de pago -->
        <q-select
          v-model="form.metodo_pago"
          label="Método de pago"
          :options="metodosOptions"
          outlined
          emit-value
          map-options
        >
          <template v-slot:prepend>
            <q-icon name="credit_card" />
          </template>
        </q-select>

        <!-- Fecha -->
        <q-input
          v-model="form.fecha"
          label="Fecha"
          type="date"
          outlined
        >
          <template v-slot:prepend>
            <q-icon name="calendar_today" />
          </template>
        </q-input>

        <!-- Observación -->
        <q-input
          v-model="form.observacion"
          label="Observación (opcional)"
          type="textarea"
          outlined
          autogrow
        >
          <template v-slot:prepend>
            <q-icon name="note" />
          </template>
        </q-input>

        <!-- Botones -->
        <div class="row justify-end q-mt-md">
          <q-btn
            v-if="isEditing"
            flat
            label="Cancelar"
            color="grey"
            @click="cancelar"
            class="q-mr-sm"
          />
          <q-btn
            type="submit"
            :label="isEditing ? 'Actualizar' : 'Guardar'"
            color="primary"
            :loading="loading"
            :icon="isEditing ? 'save' : 'add'"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Props
const props = defineProps({
  editingGasto: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['submit', 'cancel'])

// Estado interno del formulario
const form = ref({
  id: null,
  nombre: '',
  precio: 0,
  categoria: '',
  metodo_pago: '',
  fecha: new Date().toISOString().split('T')[0],
  observacion: ''
})

// Opciones
const categoriasOptions = [
  { label: 'Alimentación', value: 'Alimentación' },
  { label: 'Transporte', value: 'Transporte' },
  { label: 'Entretenimiento', value: 'Entretenimiento' },
  { label: 'Servicios', value: 'Servicios' },
  { label: 'Ropa', value: 'Ropa' },
  { label: 'Salud', value: 'Salud' },
  { label: 'Educación', value: 'Educación' },
  { label: 'Hogar', value: 'Hogar' },
  { label: 'Otros', value: 'Otros' }
]

const metodosOptions = [
  { label: 'Efectivo', value: 'Efectivo' },
  { label: 'Tarjeta Débito', value: 'Tarjeta Débito' },
  { label: 'Tarjeta Crédito', value: 'Tarjeta Crédito' },
  { label: 'Bizum', value: 'Bizum' },
  { label: 'Transferencia', value: 'Transferencia' },
  { label: 'Otro', value: 'Otro' }
]

// Computed
const isEditing = ref(false)

// Watch para detectar edición
watch(() => props.editingGasto, (newVal) => {
  if (newVal) {
    isEditing.value = true
    form.value = { ...newVal }
  } else {
    isEditing.value = false
    resetForm()
  }
}, { immediate: true })

// Métodos
function submitForm() {
  emit('submit', { ...form.value })
}

function cancelar() {
  emit('cancel')
}

function resetForm() {
  form.value = {
    id: null,
    nombre: '',
    precio: 0,
    categoria: '',
    metodo_pago: '',
    fecha: new Date().toISOString().split('T')[0],
    observacion: ''
  }
  isEditing.value = false
}

// Exponer método para resetear desde el padre
defineExpose({
  resetForm
})
</script>

<style scoped>
.expense-form {
  border-left: 4px solid #1976D2;
}
</style>

