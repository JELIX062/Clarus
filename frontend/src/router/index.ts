import CitasVue from '@/modulos/cliente/vistas/CitasVue.vue'
import AgregarcitaVue from '@/modulos/cliente/vistas/AgregarcitaVue.vue'
import HistorialcitasVue from '@/modulos/cliente/vistas/HistorialcitasVue.vue'
import RecetasVue from '@/modulos/cliente/vistas/RecetasVue.vue'
import PerfilVue from '@/modulos/cliente/vistas/PerfilVue.vue'
import InicioSesionVue from '@/modulos/principal/vistas/InicioSesionVue.vue'
import CrearCuentaVue from '@/modulos/principal/vistas/CrearCuentaVue.vue'
import CitasDoctorVue from '@/modulos/doctor/vistas/CitasdoctorVue.vue'
import ExpedientesDoctorVue from '@/modulos/doctor/vistas/ExpedienteDoctorVue.vue'
import ConsultaFisicaVue from '@/modulos/doctor/vistas/ConsultaFisicaVue.vue'
import CitasRecepcionistaVue from '@/modulos/recepcionista/vistas/CitasRecepcionistaVue.vue'
import PacientesVue from '@/modulos/recepcionista/vistas/PacientesVue.vue'
import AdminSucursalVue    from '@/modulos/administrador/vistas/AdminSucursalVue.vue'
import AdminDoctoresVue    from '@/modulos/administrador/vistas/AdminDoctoresVue.vue'
import AdminRecepcionistasVue from '@/modulos/administrador/vistas/AdminRecepcionistasVue.vue'
import { useSesion } from '@/modulos/principal/controladores/useSesion'
import { createRouter, createWebHistory } from 'vue-router'
import { defineComponent, h } from 'vue'

// Componente puente: muestra CitasDoctorVue si es doctor, CitasVue si no
const CitasRouter = defineComponent({
    setup() {
        const { rolUsuario } = useSesion()
        return () => {
            if (rolUsuario.value === 'doctor')        return h(CitasDoctorVue)
            if (rolUsuario.value === 'recepcionista') return h(CitasRecepcionistaVue)
            return h(CitasVue)
        }
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
      component: CitasRouter         
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
      path: '/expedientes',          
      name: 'expedientes',
      component: ExpedientesDoctorVue
    },
    {
      path: '/doctor/bloqueos',
      name: 'doctor-bloqueos',
      component: () => import('@/modulos/doctor/vistas/BloqueoHorarioVue.vue')
    },
    {
      path: '/doctor/consulta/:id_cita',
      name: 'doctor-consulta',
      component: ConsultaFisicaVue
    },
    {
      path: '/recepcionista/pacientes',
      name: 'recepcionista-pacientes',
      component: PacientesVue
    },
    {
      path: '/admin/sucursales',
      name: 'admin-sucursales',
      component: AdminSucursalVue
    },
    {
      path: '/admin/doctores',
      name: 'admin-doctores',
      component: AdminDoctoresVue
    },
    {
      path: '/admin/recepcionistas',
      name: 'admin-recepcionistas',
      component: AdminRecepcionistasVue
    },
  ]
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

    // Solo recepcionistas pueden ver pacientes
    if (rolUsuario.value !== 'recepcionista' && to.name === 'recepcionista-pacientes') {
        return { name: 'citas' }
    }

    // Solo doctores pueden registrar consultas físicas
    if (rolUsuario.value !== 'doctor' && to.name === 'doctor-consulta') {
        return { name: 'citas' }
    }

        // Redirige a citas si ya está autenticado e intenta ir al login
    if (estaAutenticado.value && rutasPublicas.has(String(to.name))) {
        return { name: 'citas' }
    }

    if (rolUsuario.value !== 'administrador' && 
    ['admin-sucursales','admin-doctores','admin-recepcionistas'].includes(String(to.name))) {
    return { name: 'citas' }
}

    // Admin va a sucursales por defecto ← agrega aquí
    if (estaAutenticado.value && rolUsuario.value === 'administrador' && to.name === 'citas') {
        return { name: 'admin-sucursales' }
    }

    return true
})


export default router