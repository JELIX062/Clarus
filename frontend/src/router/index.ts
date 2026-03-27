import CitasVue from '@/modulos/cliente/vistas/CitasVue.vue'
import AgregarcitaVue from '@/modulos/cliente/vistas/AgregarcitaVue.vue'
import HistorialcitasVue from '@/modulos/cliente/vistas/HistorialcitasVue.vue'
import RecetasVue from '@/modulos/cliente/vistas/RecetasVue.vue'
import PerfilVue from '@/modulos/cliente/vistas/PerfilVue.vue'
import InicioSesionVue from '@/modulos/principal/vistas/InicioSesionVue.vue'
import CrearCuentaVue from '@/modulos/principal/vistas/CrearCuentaVue.vue'
import CitasDoctorVue from '@/modulos/doctor/vistas/CitasdoctorVue.vue'
import ExpedientesDoctorVue from '@/modulos/doctor/vistas/ExpedienteDoctorVue.vue'
import { useSesion } from '@/modulos/principal/controladores/useSesion'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'inicio-sesion' }
    },
    {
      path: '/inicio-sesion',
      name: 'inicio-sesion',
      component: InicioSesionVue
    },
    {
      path: '/crear-cuenta',
      name: 'crear-cuenta',
      component: CrearCuentaVue
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
    },
    {
      path: '/doctor/citas',
      name: 'doctor-citas',
      component: CitasDoctorVue
    },
    {
      path: '/doctor/expedientes',
      name: 'doctor-expedientes',
      component: ExpedientesDoctorVue
    }
  ]
})

router.beforeEach((to) => {
  const { rolUsuario } = useSesion()

  if (to.name === 'agregar-cita' && rolUsuario.value === 'doctor') {
    return { name: 'doctor-citas' }
  }

  if (rolUsuario.value === 'doctor' && to.name === 'citas') {
    return { name: 'doctor-citas' }
  }

  if (rolUsuario.value === 'doctor' && to.name === 'recetas') {
    return { name: 'doctor-expedientes' }
  }

  if (rolUsuario.value === 'recepcionista' && to.name === 'recetas') {
    return { name: 'citas' }
  }

  if (rolUsuario.value !== 'doctor' && (to.name === 'doctor-citas' || to.name === 'doctor-expedientes')) {
    return { name: 'citas' }
  }

  return true
})

export default router