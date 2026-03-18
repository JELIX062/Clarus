import { computed, ref, watch } from 'vue'

export type Appointment = {
    id: string
    building: string
    doctor: string
    specialty: string
    date: string
    time: string
    paymentMethod: string
    paymentReference: string
    notes: string
    }

export type AppointmentInput = Omit<Appointment, 'id'>

const STORAGE_KEY = 'clarus-citas'

const defaultAppointments: Appointment[] = []

const parseStoredAppointments = (): Appointment[] => {
    if (typeof window === 'undefined') {
        return [...defaultAppointments]
    }

    const storedAppointments = window.localStorage.getItem(STORAGE_KEY)

    if (!storedAppointments) {
        return [...defaultAppointments]
    }

    try {
        const parsedAppointments = JSON.parse(storedAppointments) as Appointment[]
        return Array.isArray(parsedAppointments) ? parsedAppointments : [...defaultAppointments]
    } catch {
        return [...defaultAppointments]
    }
}

const appointments = ref<Appointment[]>(parseStoredAppointments())

if (typeof window !== 'undefined') {
    watch(
        appointments,
        (currentAppointments) => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentAppointments))
        },
        { deep: true }
    )
}

const normalizeDateTime = (appointment: Appointment) =>
    new Date(`${appointment.date}T${appointment.time}:00`).getTime()

export const useCitas = () => {
    const sortedAppointments = computed(() =>
        [...appointments.value].sort((firstAppointment, secondAppointment) => {
        return normalizeDateTime(firstAppointment) - normalizeDateTime(secondAppointment)
        })
    )

    const now = new Date()
    now.setSeconds(0, 0)

    const upcomingAppointments = computed(() =>
        sortedAppointments.value.filter((appointment) => normalizeDateTime(appointment) >= now.getTime())
    )

    const pastAppointments = computed(() =>
        [...sortedAppointments.value]
        .filter((appointment) => normalizeDateTime(appointment) < now.getTime())
        .reverse()
    )

    const addAppointment = (appointment: AppointmentInput) => {
        appointments.value = [
        ...appointments.value,
        {
            id: crypto.randomUUID(),
            ...appointment
        }
        ]
    }

    return {
        appointments,
        sortedAppointments,
        upcomingAppointments,
        pastAppointments,
        addAppointment
    }
}