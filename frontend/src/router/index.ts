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
import { defineComponent, h } from 'vue'

// Componente puente: muestra CitasDoctorVue si es doctor, CitasVue si no
const CitasRouter = defineComponent({
  setup() {
    const { rolUsuario } = useSesion()
    return () => h(rolUsuario.value === 'doctor' ? CitasDoctorVue : CitasVue)
  }
})

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
      component: CitasRouter          // ← rinde el componente correcto según rol
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
      path: '/expedientes',           // ← antes era /doctor/expedientes
      name: 'expedientes',
      component: ExpedientesDoctorVue
    }
    // Las rutas /doctor/citas y /doctor/expedientes ya no existen
  ]
})

router.beforeEach((to) => {
  const { rolUsuario } = useSesion()

  // Los doctores no pueden agregar citas
  if (to.name === 'agregar-cita' && rolUsuario.value === 'doctor') {
    return { name: 'citas' }
  }

  // Los doctores van a expedientes en lugar de recetas
  if (rolUsuario.value === 'doctor' && to.name === 'recetas') {
    return { name: 'expedientes' }
  }

  // Los recepcionistas no tienen recetas
  if (rolUsuario.value === 'recepcionista' && to.name === 'recetas') {
    return { name: 'citas' }
  }

  // Solo doctores pueden ver expedientes
  if (rolUsuario.value !== 'doctor' && to.name === 'expedientes') {
    return { name: 'citas' }
  }

  return true
})

router.beforeEach((to) => {
  const { estaAutenticado, rolUsuario } = useSesion()

  const rutasPublicas = new Set(['inicio-sesion', 'crear-cuenta'])

  // Redirige a login si no está autenticado
  if (!estaAutenticado.value && !rutasPublicas.has(String(to.name))) {
    return { name: 'inicio-sesion' }
  }

  // Redirige a citas si ya está autenticado e intenta ir al login
  if (estaAutenticado.value && rutasPublicas.has(String(to.name))) {
    return { name: 'citas' }
  }

  // ... resto de los guards existentes
  if (to.name === 'agregar-cita' && rolUsuario.value === 'doctor') {
    return { name: 'citas' }
  }
  // etc.
})

export default router