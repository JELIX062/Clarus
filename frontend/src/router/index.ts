import CitasVue from '@/modulos/cliente/vistas/CitasVue.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // path: '/',
    // name: 'home',
    // component: homeView,
    {
      path: '/citas',
      name: 'citas',
      component: CitasVue,
    }
    
  ],
})

export default router
