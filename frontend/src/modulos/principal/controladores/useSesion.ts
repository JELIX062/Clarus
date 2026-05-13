import { computed, ref } from 'vue'

export type RolUsuario = 'paciente' | 'doctor' | 'recepcionista'

export interface UsuarioSesion {
    id_usuario: number
    id_rol: number
    nombre_rol: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string | null
    correo: string
    telefono?: string | null
    [key: string]: unknown
}

const STORAGE_KEY = 'clarus-sesion'

// Normaliza el nombre_rol que viene del backend al tipo del frontend
const normalizarRol = (nombreRol: string): RolUsuario => {
    const rol = nombreRol.toLowerCase().trim()
    if (rol === 'doctor') return 'doctor'
    if (rol === 'recepcionista') return 'recepcionista'
    return 'paciente'
}

const cargarSesion = (): { rol: RolUsuario; usuario: UsuarioSesion | null } => {
    if (typeof window === 'undefined') return { rol: 'paciente', usuario: null }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw)
    } catch { /* sesión corrupta, ignorar */ }
    return { rol: 'paciente', usuario: null }
}

const sesionInicial = cargarSesion()
const rolUsuario = ref<RolUsuario>(sesionInicial.rol)
const usuarioActual = ref<UsuarioSesion | null>(sesionInicial.usuario)

const setUsuario = (usuario: UsuarioSesion) => {
    const rol = normalizarRol(usuario.nombre_rol)
    rolUsuario.value = rol
    usuarioActual.value = usuario
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ rol, usuario }))
    }
}

// Mantener compatibilidad con código existente
const setRolUsuario = (rol: RolUsuario) => {
    rolUsuario.value = rol
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ rol, usuario: usuarioActual.value })
        )
    }
}

const cerrarSesion = () => {
    rolUsuario.value = 'paciente'
    usuarioActual.value = null
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY)
    }
    // Limpiar citas del usuario anterior
    import('@/modulos/cliente/controladores/useCita').then(({ useCitas }) => {
        useCitas().limpiarCitas()
    })
}

const estaAutenticado = computed(() => usuarioActual.value !== null)

export const useSesion = () => ({
    rolUsuario,
    usuarioActual,
    estaAutenticado,
    setUsuario,
    setRolUsuario,
    cerrarSesion,
})