import { ref } from 'vue'

const API = 'http://localhost:3001/api'

export type Appointment = {
    id: number
    doctor: string
    specialty: string
    date: string
    time: string
    horaFin: string
    sucursal: string
    consultorio: string
    motivo: string
    estado: string
    costo: number
    patientName?: string
}

const appointments = ref<Appointment[]>([])

const mapCita = (c: any): Appointment => ({
    id: c.id_cita,
    doctor: `Dr. ${c.nombre_doctor} ${c.apellido_doctor}`,
    specialty: c.especialidad ?? '',
    date: (c.fecha ?? '').toString().split('T')[0],
    time: (c.hora_inicio ?? '').toString().substring(0, 5),
    horaFin: (c.hora_fin ?? '').toString().substring(0, 5),
    sucursal: c.nombre_sucursal,
    consultorio: `Consultorio ${c.numero_consultorio}`,
    motivo: c.motivo_consulta,
    estado: c.estado,
    costo: c.costo_total,
    patientName: c.nombre_paciente ? `${c.nombre_paciente} ${c.apellido_paciente}` : undefined
})

export const useCitas = () => {
    const fetchCitasPaciente = async (id_paciente: number) => {
        try {
            const res = await fetch(`${API}/cita/paciente/${id_paciente}`)
            const data = await res.json()
            if (Array.isArray(data)) {
                appointments.value = data.map(mapCita)
            }
        } catch (e) {
            console.error('Error al cargar citas:', e)
        }
    }

    const fetchCitasDoctor = async (id_doctor: number) => {
        try {
            const res = await fetch(`${API}/cita/doctor/${id_doctor}`)
            const data = await res.json()
            if (Array.isArray(data)) {
                appointments.value = data.map(mapCita)
            }
        } catch (e) {
            console.error('Error al cargar citas del doctor:', e)
        }
    }

    const cancelarCita = async (id_cita: number, motivo: string, cancelado_por: number) => {
        try {
            const res = await fetch(`${API}/cita/cancelar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_cita, motivo, cancelado_por })
            })
            const data = await res.json()
            if (!data.error) {
                appointments.value = appointments.value.map(a =>
                    a.id === id_cita ? { ...a, estado: 'Cancelada' } : a
                )
            }
            return data
        } catch {
            return { error: 'Error de conexión' }
        }
    }

    const limpiarCitas = () => {
    appointments.value = []
}

    return { appointments, fetchCitasPaciente, fetchCitasDoctor, cancelarCita,limpiarCitas     }
}