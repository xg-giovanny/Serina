<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Logo -->
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="pi pi-bolt"></i>
          <span v-if="!sidebarCollapsed">Serina</span>
        </div>
        <button class="sidebar-toggle" @click="toggleSidebar">
          <i :class="sidebarCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"></i>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path" 
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <i :class="item.icon"></i>
          <span v-if="!sidebarCollapsed">{{ item.label }}</span>
        </router-link>

        <!-- Dynamic Tabs -->
        <div v-if="!sidebarCollapsed && dynamicTabs.length > 0" class="mt-4 mb-2">
          <span class="text-sm text-muted px-4">Tabs Dinámicos</span>
        </div>
        <router-link 
          v-for="tab in dynamicTabs"
          :key="tab.id"
          :to="`/tab/${tab.id}`"
          class="nav-item"
          :class="{ active: isActive(`/tab/${tab.id}`) }"
        >
          <i :class="tab.icono || 'pi pi-bookmark'"></i>
          <span v-if="!sidebarCollapsed">{{ tab.nombre }}</span>
        </router-link>

        <!-- Add Tab Button -->
        <button class="nav-item mt-2" @click="showAddTabDialog = true">
          <i class="pi pi-plus"></i>
          <span v-if="!sidebarCollapsed">Agregar Tab</span>
        </button>
      </nav>

      <!-- Theme Toggle -->
      <div class="sidebar-footer mt-auto pt-4">
        <button class="theme-toggle w-full" @click="toggleTheme">
          <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'"></i>
          <span v-if="!sidebarCollapsed">{{ isDark ? 'Modo Claro' : 'Modo Oscuro' }}</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <router-view />
    </main>

    <!-- Add Tab Dialog -->
    <Dialog v-model:visible="showAddTabDialog" header="Agregar Nuevo Tab" :style="{ width: '400px' }" modal>
      <div class="form-group">
        <label class="form-label">Nombre del Tab</label>
        <InputText v-model="newTab.nombre" placeholder="Ej: Inversiones" class="w-full" />
      </div>
      <div class="form-group">
        <label class="form-label">Icono (clase PrimeIcons)</label>
        <Dropdown 
          v-model="newTab.icono" 
          :options="iconOptions" 
          optionLabel="label" 
          optionValue="value"
          placeholder="Selecciona un icono"
          class="w-full"
        />
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="showAddTabDialog = false" />
        <Button label="Guardar" icon="pi pi-check" @click="addTab" :loading="savingTab" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { supabase, isSupabaseConfigured } from '@/services/supabaseClient'
import { useTabsStore } from '@/stores/tabsStore'

const route = useRoute()
const toast = useToast()
const tabsStore = useTabsStore()

const sidebarCollapsed = ref(false)
const isDark = ref(false)
const showAddTabDialog = ref(false)
const savingTab = ref(false)
const dynamicTabs = ref([])

const newTab = ref({
  nombre: '',
  icono: 'pi pi-bookmark'
})

const navItems = [
  { path: '/', label: 'Inicio', icon: 'pi pi-home' },
  { path: '/nomina', label: 'Nómina', icon: 'pi pi-wallet' },
  { path: '/cartas', label: 'Cartas', icon: 'pi pi-th-large' }
]

const iconOptions = [
  { label: 'Bookmark', value: 'pi pi-bookmark' },
  { label: 'Chart', value: 'pi pi-chart-bar' },
  { label: 'Star', value: 'pi pi-star' },
  { label: 'Heart', value: 'pi pi-heart' },
  { label: 'Flag', value: 'pi pi-flag' },
  { label: 'Map', value: 'pi pi-map' },
  { label: 'Settings', value: 'pi pi-cog' },
  { label: 'Calendar', value: 'pi pi-calendar' },
  { label: 'Shopping Cart', value: 'pi pi-shopping-cart' },
  { label: 'Credit Card', value: 'pi pi-credit-card' }
]

// Métodos
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  window.dispatchEvent(new Event('themechange'))
}

const loadTabs = async () => {
  if (!isSupabaseConfigured()) return
  const { data } = await supabase.from('tabs').select('*').order('created_at', { ascending: true })
  if (data) {
    dynamicTabs.value = data
    tabsStore.setTabs(data)
  }
}

const addTab = async () => {
  if (!newTab.value.nombre.trim()) {
    toast.add({ severity: 'warn', summary: 'Advertencia', detail: 'Ingresa un nombre para el tab', life: 3000 })
    return
  }
  
  savingTab.value = true
  try {
    const { data, error } = await supabase.from('tabs').insert([{
      nombre: newTab.value.nombre,
      icono: newTab.value.icono
    }]).select()
    
    if (error) throw error
    
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Tab creado correctamente', life: 3000 })
    showAddTabDialog.value = false
    newTab.value = { nombre: '', icono: 'pi pi-bookmark' }
    await loadTabs()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
  } finally {
    savingTab.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Cargar tema
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  await loadTabs()
})

// Watch theme changes
watch(isDark, (val) => {
  document.documentElement.classList.toggle('dark', val)
})
</script>

