import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Layout
import MainLayout from '@/layouts/MainLayout.vue'

// Pages
import Dashboard from '@/pages/Dashboard.vue'
import Nomina from '@/pages/Nomina.vue'
import Cartas from '@/pages/Cartas.vue'
import DynamicPage from '@/pages/DynamicPage.vue'
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'

// Rutas públicas (no requieren autenticación)
const publicRoutes = ['login', 'register']

const routes = [
  // Rutas de autenticación
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: 'Iniciar Sesión', public: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { title: 'Registrarse', public: true }
  },
  // Rutas protegidas
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: Dashboard,
        meta: { title: 'Dashboard', icon: 'pi-home' }
      },
      {
        path: 'nomina',
        name: 'nomina',
        component: Nomina,
        meta: { title: 'Nómina', icon: 'pi-wallet' }
      },
      {
        path: 'cartas',
        name: 'cartas',
        component: Cartas,
        meta: { title: 'Cartas', icon: 'pi-th-large' }
      },
      {
        path: 'tab/:id',
        name: 'dynamic-tab',
        component: DynamicPage,
        meta: { title: 'Tab', icon: 'pi-plus' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Middleware de autenticación
router.beforeEach((to, from, next) => {
  // Actualizar título
  document.title = to.meta.title ? `${to.meta.title} - Serina` : 'Serina'
  
  // Obtener store de auth
  const authStore = useAuthStore()
  
  // Inicializar sesión si no está inicializada
  if (!authStore.user) {
    authStore.initSession()
  }
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Redirigir a login si no está autenticado
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  // Si ya está autenticado e intenta acceder a login/register, redirigir al dashboard
  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }
  
  next()
})

export default router

