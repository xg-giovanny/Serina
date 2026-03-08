<template>
  <div class="dashboard-layout" :class="{ 'dark-theme': isDark }">
    <!-- Top Header Bar -->
    <header class="top-header">
      <div class="header-left">
        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <i class="pi pi-bars"></i>
        </button>
        <!-- Logo -->
        <div class="header-logo">
          <i class="pi pi-bolt"></i>
          <span class="logo-text">Serina</span>
          <p class="page-subtitle">Todo en su lugar.</p>
        </div>
      </div>
      
      <div class="header-right">
        <!-- Component Color Picker -->
        <div class="header-action color-picker-wrapper">
          <button class="header-btn" @click="showColorPicker = !showColorPicker" title="Cambiar color de componentes">
            <i class="pi pi-palette"></i>
          </button>
          <div v-if="showColorPicker" class="color-picker-dropdown">
            <div class="color-picker-header">
              <span>Color Principal</span>
              <button class="close-color-picker" @click="showColorPicker = false">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <div class="color-options">
              <button 
                v-for="color in colorOptions" 
                :key="color.value"
                class="color-option"
                :style="{ backgroundColor: color.value }"
                :class="{ active: componentColor === color.value }"
                @click="setComponentColor(color.value)"
                :title="color.name"
              >
                <i v-if="componentColor === color.value" class="pi pi-check"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Theme Toggle -->
        <button class="header-btn theme-btn" @click="toggleTheme" :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
          <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>

        <!-- User Menu -->
        <div class="user-menu" v-if="authStore.isAuthenticated">
          <div class="user-avatar">
            <i class="pi pi-user"></i>
          </div>
          <span class="user-name">{{ authStore.username }}</span>
        </div>

        <!-- Logout Button -->
        <button class="header-btn logout-btn" @click="handleLogout" title="Cerrar sesión">
          <i class="pi pi-sign-out"></i>
          <span class="btn-text">Cerrar Sesión</span>
        </button>
      </div>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed, 'mobile-open': mobileMenuOpen }">
      <!-- Logo -->
      <div class="sidebar-header">

        <button class="sidebar-toggle" @click="toggleSidebar">
          <i class="pi pi-bars"></i>
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
          @click="closeMobileMenu"
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
          @click="closeMobileMenu"
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

    <!-- Mobile Overlay -->
    <div 
      class="mobile-overlay" 
      :class="{ active: mobileMenuOpen }" 
      @click="closeMobileMenu"
    ></div>
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
const mobileMenuOpen = ref(false)
const showAddTabDialog = ref(false)
const savingTab = ref(false)
const dynamicTabs = ref([])
const showColorPicker = ref(false)
const componentColor = ref('#5b21b6')

const newTab = ref({
  nombre: '',
  icono: 'pi pi-bookmark'
})

// Color options for component color picker
const colorOptions = [
  { name: 'Violeta', value: '#5b21b6' },
  { name: 'Cyan', value: '#0891b2' },
  { name: 'Verde', value: '#16a34a' },
  { name: 'Naranja', value: '#ea580c' },
  { name: 'Rosa', value: '#db2777' },
  { name: 'Rojo', value: '#dc2626' },
  { name: 'Azul', value: '#2563eb' },
  { name: 'Amarillo', value: '#ca8a04' },
  { name: 'Magenta', value: '#c026d3' },
  { name: 'Teal', value: '#0d9488' },
]

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

// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  applyTheme()
  window.dispatchEvent(new Event('themechange'))
}

const applyTheme = () => {
  // Apply to document root for CSS variables
  document.documentElement.classList.toggle('dark', isDark.value)
  
  // Also dispatch event for other components
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDark: isDark.value } }))
}

const setComponentColor = (color) => {
  componentColor.value = color
  localStorage.setItem('componentColor', color)
  applyComponentColor(color)
  showColorPicker.value = false
}

const applyComponentColor = (color) => {
  // Convert hex to RGB for opacity variants
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Set CSS variables
  document.documentElement.style.setProperty('--color-primary', color)
  document.documentElement.style.setProperty('--color-primary-hover', `rgb(${Math.max(0, r-30)}, ${Math.max(0, g-30)}, ${Math.max(0, b-30)})`)
  document.documentElement.style.setProperty('--color-primary-glow', `rgba(${r}, ${g}, ${b}, 0.25)`)
  document.documentElement.style.setProperty('--neon-violet', color)
  document.documentElement.style.setProperty('--neon-violet-glow', `rgba(${r}, ${g}, ${b}, 0.3)`)
}

const handleLogout = () => {
  authStore.logout()
  closeMobileMenu()
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
  // Initialize auth session
  authStore.initSession()
  
  // Load theme
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
  
  // Load component color
  const savedColor = localStorage.getItem('componentColor')
  if (savedColor) {
    componentColor.value = savedColor
    applyComponentColor(savedColor)
  }
  
  await loadTabs()
})

// Watch theme changes
watch(isDark, (val) => {
  applyTheme()
})

// Close color picker when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.color-picker-wrapper')) {
    showColorPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Dashboard Layout */
.dashboard-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Top Header Bar */
.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 200;
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
}

.header-logo i {
  font-size: 24px;
  color: var(--color-primary);
}

.logo-text {
  background: linear-gradient(135deg, var(--color-primary), var(--neon-magenta));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}

.header-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.header-btn i {
  font-size: 18px;
}

.theme-btn {
  background: linear-gradient(135deg, var(--neon-violet), var(--neon-magenta));
  border: none;
  color: white;
}

.theme-btn:hover {
  box-shadow: 0 0 15px var(--neon-violet-glow);
  transform: scale(1.05);
}

.logout-btn {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.logout-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

/* Color Picker */
.color-picker-wrapper {
  position: relative;
}

.color-picker-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  min-width: 220px;
  box-shadow: var(--shadow-lg);
  z-index: 300;
}

.color-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.color-picker-header span {
  font-weight: 600;
  color: var(--text-primary);
}

.close-color-picker {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.close-color-picker:hover {
  color: var(--text-primary);
}

.color-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: white;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.color-option i {
  font-size: 12px;
}

/* User Menu */
.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: var(--bg-hover);
  border-radius: 8px;
}

.user-menu .user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-menu .user-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 64px;
  left: 0;
  height: calc(100vh - 64px);

  width: 260px;
  min-width: 260px;

  background: var(--bg-card);
  border-right: 1px solid var(--border-color);

  display: flex;
  flex-direction: column;

  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  z-index: 150;
}

.sidebar.collapsed {
  width: 72px;
  min-width: 72px;
}

.sidebar-header {
  padding: 16px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border-color);
  min-height: 60px;
  margin: 0px;
}

.sidebar.collapsed .sidebar-header {
  padding: 0px;
  justify-content: center;
}

.sidebar-toggle {
  background: var(--color-primary);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px var(--color-primary-glow);
}

.sidebar-toggle i {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.sidebar.collapsed .sidebar-toggle i {
  transform: rotate(180deg);
}

.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 10px;
  margin-bottom: 2px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  font-size: 14px;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  background: linear-gradient(90deg, var(--color-primary), var(--neon-magenta));
  border-radius: 0 6px 6px 0;
  transition: width 0.25s ease;
  opacity: 0;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item:hover::before {
  width: 4px;
  opacity: 1;
  height: 60%;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(91, 33, 182, 0.15), rgba(192, 38, 211, 0.1));
  color: var(--color-primary);
  box-shadow: 0 0 20px rgba(91, 33, 182, 0.2);
}

.nav-item.active::before {
  width: 4px;
  opacity: 1;
  height: 60%;
}

.nav-item i {
  font-size: 18px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
  transition: all 0.25s ease;
  color: inherit;
}

.nav-item.active i {
  color: var(--color-primary);
  text-shadow: 0 0 10px var(--color-primary-glow);
}

.nav-item span {
  flex: 1;
  opacity: 1;
  transition: opacity 0.2s ease, width 0.25s ease;
  overflow: hidden;
}

/* Sidebar collapsed state - nav items */
.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 14px 0;
  width: 100%;
}

.sidebar.collapsed .nav-item i {
  margin: 0;
  width: auto;
  font-size: 20px;

}

.sidebar.collapsed .nav-item span {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.sidebar.collapsed .nav-item::before {
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  top: auto;
  bottom: 0;
  border-radius: 6px 6px 0 0;
}

.sidebar.collapsed .nav-item:hover::before,
.sidebar.collapsed .nav-item.active::before {
  width: 40px;
  height: 3px;
}

/* Dynamic tabs in collapsed state */
.sidebar.collapsed .text-sm {
  display: none;
}

.theme-toggle,
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  color: var(--text-secondary);
  background: var(--bg-hover);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  width: 100%;
}

.theme-toggle:hover,
.logout-btn:hover {
  background: var(--color-primary);
  color: white;
}

.logout-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.logout-btn:hover {
  background: #ef4444;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--bg-hover);
  border-radius: 8px;
  margin-top: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 260px;
  margin-top: 64px;
  width: calc(100% - 260px);
  min-height: calc(100vh - 64px);
  background: var(--bg-primary);
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content.sidebar-collapsed {
  margin-left: 72px;
  width: calc(100% - 72px);
}

.sidebar.collapsed .text-sm {
  display: none;
}

/* Mobile Overlay */
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 140;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .mobile-overlay.active {
    display: block;
  }
  
  .btn-text {
    display: none;
  }
  
  .user-menu .user-name {
    display: none;
  }
}

@media (max-width: 640px) {
  .top-header {
    padding: 0 12px;
  }
  
  .header-logo .logo-text {
    display: none;
  }
  
  .color-picker-dropdown {
    right: -60px;
  }
  
  .main-content {
    padding: 16px;
  }
}

/* Utility Classes */
.text-sm { font-size: 12px; }
.text-muted { color: var(--text-muted); }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.mt-4 { margin-top: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-auto { margin-top: auto; }
.pt-4 { padding-top: 1rem; }
.w-full { width: 100%; }
.form-group { margin-bottom: 16px; }
.form-label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary); }
</style>

