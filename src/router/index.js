import { createRouter, createWebHistory } from 'vue-router'

// Layout
import MainLayout from '@/layouts/MainLayout.vue'

// Pages
import Dashboard from '@/pages/Dashboard.vue'
import Nomina from '@/pages/Nomina.vue'
import Cartas from '@/pages/Cartas.vue'
import DynamicPage from '@/pages/DynamicPage.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
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

// Actualizar título de la página
router.beforeEach((to, from, next) => {
  document.title = `Serina`
  next()
})

export default router

