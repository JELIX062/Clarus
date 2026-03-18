import CitasVue from '@/modulos/cliente/vistas/CitasVue.vue'
import AgregarcitaVue from '@/modulos/cliente/vistas/AgregarcitaVue.vue'
import HistorialcitasVue from '@/modulos/cliente/vistas/HistorialcitasVue.vue'
import RecetasVue from '@/modulos/cliente/vistas/RecetasVue.vue'
import PerfilVue from '@/modulos/cliente/vistas/PerfilVue.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'citas' }
    },
    {
      path: '/citas',
      name: 'citas',
      component: CitasVue
    },
    {
      path: '/citas/agregar',
      name: 'agregar-cita',
      component: AgregarcitaVue
    },
    {
      path: '/citas/historial',
      name: 'historial-citas',
      component: HistorialcitasVue
    },
    {
      path: '/recetas',
      name: 'recetas',
      component: RecetasVue
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: PerfilVue
    }
  ]
})

export default router