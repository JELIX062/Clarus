import CitasVue from '@/modulos/cliente/vistas/CitasVue.vue'
import RecetasVue from '@/modulos/cliente/vistas/RecetasVue.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // path: '/',
    // name: 'presentacion',
    // component: presntacionVue,
    {
      path: '/citas',
      name: 'citas',
      component: CitasVue,
    },
    {
      path: '/recetas',
      name: 'recetas',
      component: RecetasVue,
    },
    
  ],
})

export default router
