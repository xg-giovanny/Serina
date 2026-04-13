<template>
  <div class="dashboard-layout" :class="{ 'dark-theme': themeStore.isDark }">
    <!-- Top Header Bar -->
    <header class="top-header">
      <div class="header-left">
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <i class="pi pi-bars"></i>
        </button>
        <div class="header-logo">
          <i class="pi pi-bolt"></i>
          <span class="logo-text">Serina</span>
          <p class="page-subtitle">Todo en su lugar.</p>
        </div>
      </div>

      <div class="header-right">
        <!-- Color Picker -->
        <div class="color-picker-wrapper">
          <button class="header-btn" @click="showColorPicker = !showColorPicker" title="Cambiar color principal">
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
              <button v-for="color in colorOptions" :key="color.value" class="color-option"
                :style="{ backgroundColor: color.value }" :class="{ active: componentColor === color.value }"
                @click="setComponentColor(color.value)" :title="color.name">
                <i v-if="componentColor === color.value" class="pi pi-check"></i>
              </button>
            </div>
          </div>
        </div>

        <button class="header-btn theme-btn" @click="themeStore.toggleTheme()"
          :title="themeStore.isDark ? 'Modo claro' : 'Modo oscuro'">
          <i :class="themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>

        <div class="user-menu" v-if="authStore.isAuthenticated">
          <div class="user-avatar"><i class="pi pi-user"></i></div>
          <span class="user-name">{{ authStore.username }}</span>
        </div>

        <button class="header-btn logout-btn" @click="handleLogout" title="Cerrar sesión">
          <i class="pi pi-sign-out"></i>
          <span class="btn-text">Cerrar Sesión</span>
        </button>
      </div>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed, 'mobile-open': mobileMenuOpen }">
      <div class="sidebar-header">
        <div class="sidebar-logo" v-if="!sidebarCollapsed">
          <i class="pi pi-bolt"></i>
          <span>Serina</span>
        </div>
        <div class="sidebar-logo-collapsed" v-else>
          <i class="pi pi-bolt"></i>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item"
          :class="{ active: isActive(item.path) }" @click="closeMobileMenu">
          <i :class="item.icon"></i>
          <span v-if="!sidebarCollapsed">{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <router-view />
    </main>

    <!-- Mobile Overlay -->
    <div class="mobile-overlay" :class="{ active: mobileMenuOpen }" @click="closeMobileMenu"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)
const showColorPicker = ref(false)
const componentColor = ref('#5b21b6')

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

// ========== Métodos ==========

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const setComponentColor = (color) => {
  componentColor.value = color
  localStorage.setItem('componentColor', color)
  applyComponentColor(color)
  showColorPicker.value = false
}

const applyComponentColor = (color) => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Generar un color magenta derivado (por ejemplo, mezcla con rojo/azul)
  const magentaR = Math.min(255, r + 40)
  const magentaG = Math.max(0, g - 20)
  const magentaB = Math.min(255, b + 60)
  const magentaColor = `rgb(${magentaR}, ${magentaG}, ${magentaB})`

  document.documentElement.style.setProperty('--color-primary', color)
  document.documentElement.style.setProperty('--color-primary-hover', `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`)
  document.documentElement.style.setProperty('--color-primary-glow', `rgba(${r}, ${g}, ${b}, 0.25)`)
  document.documentElement.style.setProperty('--neon-violet', color)
  document.documentElement.style.setProperty('--neon-violet-glow', `rgba(${r}, ${g}, ${b}, 0.3)`)
  document.documentElement.style.setProperty('--neon-magenta', magentaColor)
}

const handleLogout = () => {
  authStore.logout()
  closeMobileMenu()
  toast.add({ severity: 'info', summary: 'Sesión cerrada', detail: 'Has cerrado sesión correctamente', life: 3000 })
  router.push('/login')
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.color-picker-wrapper')) {
    showColorPicker.value = false
  }
}

// ========== Ciclo de vida ==========
onMounted(async () => {
  authStore.initSession()

  const savedColor = localStorage.getItem('componentColor')
  if (savedColor) {
    componentColor.value = savedColor
    applyComponentColor(savedColor)
  } else {
    // Aplicar color inicial
    applyComponentColor(componentColor.value)
  }

  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ========== Variables base (se sobrescriben con las del theme store) ========== */
.dashboard-layout {
  --bg-primary: #f8fafc;
  --bg-card: #ffffff;
  --bg-hover: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --neon-violet: #5b21b6;
  --neon-magenta: #c026d3;
  --neon-violet-glow: rgba(91, 33, 182, 0.3);
  --color-primary: #5b21b6;
  --color-primary-hover: #4c1d95;
  --color-primary-glow: rgba(91, 33, 182, 0.25);
}

/* Tema oscuro (lo aplica tu store, aquí solo definimos las variables oscuras) */
.dashboard-layout.dark-theme {
  --bg-primary: #0f172a;
  --bg-card: #1e293b;
  --bg-hover: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --border-color: #334155;
}

/* ========== Layout general ========== */
.dashboard-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* ========== Top Header ========== */
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
  align-items: baseline;
  gap: 8px;
  font-weight: 700;
}

.header-logo i {
  font-size: 24px;
  color: var(--color-primary);
}

.logo-text {
  font-size: 1.25rem;
  background: linear-gradient(135deg, var(--color-primary), var(--neon-magenta));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  font-size: 0.75rem;
  font-weight: normal;
  color: var(--text-muted);
  margin: 0 0 0 4px;
  white-space: nowrap;
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
  padding: 8px 12px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.header-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.theme-btn {
  background: linear-gradient(135deg, var(--neon-violet), var(--neon-magenta));
  border: none;
  color: white;
}

.theme-btn:hover {
  box-shadow: 0 0 12px var(--neon-violet-glow);
  transform: scale(1.02);
}

.logout-btn {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.logout-btn:hover {
  background: #ef4444;
  color: white;
}

/* ========== Color Picker ========== */
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

.close-color-picker {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}

.color-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.1s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: white;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.color-option i {
  font-size: 12px;
}

/* ========== User Menu ========== */
.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: var(--bg-hover);
  border-radius: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
}

/* ========== Sidebar ========== */
.sidebar {
  position: fixed;
  top: 64px;
  left: 0;
  height: calc(100vh - 64px);
  width: 260px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  z-index: 150;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  padding: 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  min-height: 60px;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 16px 0;
}

.sidebar-logo,
.sidebar-logo-collapsed {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--color-primary);
}

.sidebar-logo i,
.sidebar-logo-collapsed i {
  font-size: 1.4rem;
}

.sidebar-logo-collapsed {
  justify-content: center;
  width: 100%;
}

.sidebar-toggle {
  background: var(--color-primary);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px var(--color-primary-glow);
}

.sidebar.collapsed .sidebar-toggle i {
  transform: rotate(180deg);
}

.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
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
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 60%;
  background: linear-gradient(90deg, var(--color-primary), var(--neon-magenta));
  border-radius: 0 6px 6px 0;
  transition: width 0.2s;
  opacity: 0;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item:hover::before {
  width: 4px;
  opacity: 1;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(91, 33, 182, 0.15), rgba(192, 38, 211, 0.1));
  color: var(--color-primary);
}

.nav-item.active::before {
  width: 4px;
  opacity: 1;
}

.nav-item i {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

/* Sidebar collapsed */
.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 14px 0;
}

.sidebar.collapsed .nav-item i {
  margin: 0;
  width: auto;
  font-size: 1.3rem;
}

.sidebar.collapsed .nav-item span {
  display: none;
}

.sidebar.collapsed .nav-item::before {
  left: 50%;
  transform: translateX(-50%);
  top: auto;
  bottom: 0;
  height: 3px;
  width: 0;
  border-radius: 3px 3px 0 0;
}

.sidebar.collapsed .nav-item:hover::before,
.sidebar.collapsed .nav-item.active::before {
  width: 40px;
  opacity: 1;
}

/* ========== Main Content ========== */
.main-content {
  flex: 1;
  margin-left: 260px;
  margin-top: 64px;
  padding: 24px;
  transition: margin 0.25s ease;
  min-height: calc(100vh - 64px);
}

.main-content.sidebar-collapsed {
  margin-left: 72px;
}

/* ========== Mobile ========== */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-primary);
}

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 140;
}

@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0 !important;
    width: 100%;
  }

  .mobile-menu-btn {
    display: block;
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

  .page-subtitle {
    display: none;
  }

  .color-picker-dropdown {
    right: -40px;
  }

  .main-content {
    padding: 16px;
  }
}
</style>