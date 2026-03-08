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

      <!-- User Info & Logout -->
      <div class="sidebar-footer mt-auto pt-4">
        <!-- Theme Toggle -->
        <button class="theme-toggle w-full" @click="toggleTheme">
          <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'"></i>
          <span v-if="!sidebarCollapsed">{{ isDark ? 'Modo Claro' : 'Modo Oscuro' }}</span>
        </button>
        
        <!-- User Info -->
        <div class="user-info w-full" v-if="authStore.isAuthenticated">
          <div class="user-avatar">
            <i class="pi pi-user"></i>
          </div>
          <div class="user-details" v-if="!sidebarCollapsed">
            <span class="user-name">{{ authStore.username }}</span>
          </div>
        </div>
        
        <!-- Logout Button -->
        <button class="logout-btn w-full mt-2" @click="handleLogout" v-if="authStore.isAuthenticated">
          <i class="pi pi-sign-out"></i>
          <span v-if="!sidebarCollapsed">Cerrar Sesión</span>
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
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { supabase, isSupabaseConfigured } from '@/services/supabaseClient'
import { useTabsStore } from '@/stores/tabsStore'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const tabsStore = useTabsStore()
const authStore = useAuthStore()

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

const handleLogout = () => {
  authStore.logout()
  toast.add({ severity: 'info', summary: 'Sesión cerrada', detail: 'Has cerrado sesión correctamente', life: 3000 })
  router.push('/login')
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
  // Inicializar sesión de autenticación
  authStore.initSession()
  
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

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  display: flex;
}

.sidebar {
  width: 260px;
  background: #1e1e2f;
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
}

.sidebar-logo i {
  font-size: 24px;
  color: #6366f1;
}

.sidebar-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 10px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  font-size: 14px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-item.active {
  background: #6366f1;
  color: #fff;
}

.nav-item i {
  font-size: 18px;
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.theme-toggle,
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  width: 100%;
}

.theme-toggle:hover,
.logout-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.logout-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.4);
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-top: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar i {
  font-size: 16px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  background: #f8f9fa;
}

.main-content.sidebar-collapsed {
  margin-left: 70px;
}

.text-sm {
  font-size: 12px;
}

.text-muted {
  color: rgba(255, 255, 255, 0.5);
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-auto {
  margin-top: auto;
}

.pt-4 {
  padding-top: 1rem;
}

.w-full {
  width: 100%;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}
</style>

