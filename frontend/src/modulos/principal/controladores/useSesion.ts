import { ref } from 'vue'

export type RolUsuario = 'paciente' | 'doctor'

const STORAGE_KEY = 'clarus-rol-usuario'

const parseStoredRole = (): RolUsuario => {
    if (typeof window === 'undefined') {
        return 'paciente'
    }

    const storedRole = window.localStorage.getItem(STORAGE_KEY)
    return storedRole === 'doctor' ? 'doctor' : 'paciente'
}

const rolUsuario = ref<RolUsuario>(parseStoredRole())

const setRolUsuario = (rol: RolUsuario) => {
    rolUsuario.value = rol

    if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, rol)
    }
}

export const useSesion = () => ({
    rolUsuario,
    setRolUsuario
})
