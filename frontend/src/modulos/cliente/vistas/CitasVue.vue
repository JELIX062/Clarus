<template>
    <section class="citas-view">
        <div class="calendar-layout">

        <article class="calendar-card">
            <div class="calendar-toolbar">
                <button class="nav-button" type="button" @click="prevMonth">‹</button>
                <div class="month-selector">
                    <button class="month-label month-label-button" type="button" @click="toggleMonthMenu">
                        <h2>{{ fullMonths[visibleMonth] }}</h2>
                        <span>{{ visibleYear }}</span>
                    </button>
                    <div v-if="showMonthMenu" class="month-menu">
                        <button
                            v-for="(month, index) in fullMonths"
                            :key="month"
                            type="button"
                            class="month-menu-item"
                            :class="{ active: index === visibleMonth }"
                            @click="selectMonthFromMenu(index)"
                        >
                            {{ month }}
                        </button>
                    </div>
                </div>
                <button class="nav-button" type="button" @click="nextMonth">›</button>
            </div>

            <div class="weekdays-grid">
                <span v-for="day in weekDays" :key="day">{{ day }}</span>
            </div>

            <div class="dates-grid">
                <button
                    v-for="dateCell in calendarCells"
                    :key="dateCell.key"
                    type="button"
                    class="date-cell"
                    :class="{
                        empty: !dateCell.day,
                        active: dateCell.day === selectedDay,
                        'has-appointments': dateCell.day && hasAppointments(dateCell.day),
                        today: dateCell.day === todayDay && isCurrentVisibleMonth
                    }"
                    :disabled="!dateCell.day"
                    @click="dateCell.day && selectDay(dateCell.day)"
                >
                    <span>{{ dateCell.day ?? '' }}</span>
                    <small v-if="dateCell.day && appointmentCountByDay[dateCell.day]">
                        {{ appointmentCountByDay[dateCell.day] }}
                    </small>
                </button>
            </div>
        </article>

        <article class="details-card details-card-layout">
            <div class="section-heading">
                <div>
                    <h2>{{ selectedDateLabel }}</h2>
                    <p>Citas registradas para el día seleccionado.</p>
                </div>
                <span class="counter">{{ selectedDayAppointments.length }}</span>
            </div>

            <div v-if="selectedDayAppointments.length === 0" class="empty-state">
                {{
                    esDoctor
                        ? 'No tienes citas programadas para este día.'
                        : 'No hay citas para este día. Puedes usar Agregar cita para registrar una nueva.'
                }}
            </div>

            <div v-else class="appointment-list">
                <article
                    v-for="appointment in selectedDayAppointments"
                    :key="appointment.id"
                    class="appointment-card"
                >
                    <div class="card-row">
                        <h3>{{ appointment.doctor }}</h3>
                        <span class="tag">{{ appointment.estado }}</span>
                    </div>
                    <div class="card-row muted">
                        <span>{{ appointment.time }} – {{ appointment.horaFin }}</span>
                        <span>{{ appointment.sucursal }}</span>
                        <span>{{ appointment.consultorio }}</span>
                    </div>
                    <div class="card-row muted">
                        <span>Motivo: {{ appointment.motivo }}</span>
                        <span>{{ appointment.specialty }}</span>
                    </div>
                    
                    <button
                        v-if="(esDoctor || esRecepcionista || esPaciente) && appointment.estado === 'Programada'"
                        class="button button-danger"
                        type="button"
                        @click="handleCancelar(appointment.id)"
                    >
                        Cancelar cita
                    </button>
                </article>
            </div>

            <div class="details-actions details-actions-bottom">
                <RouterLink v-if="!esDoctor" class="button" :to="{ name: 'agregar-cita' }">
                    {{ esRecepcionista ? 'Agendar cita para paciente' : 'Agregar cita' }}
                </RouterLink>
                <RouterLink v-if="!esRecepcionista" class="button button-white" :to="{ name: 'historial-citas' }">
                    {{ esDoctor ? 'Ver historial general' : 'Ver historial' }}
                </RouterLink>
            </div>

            <!-- Modal cancelar cita -->
            <div class="modal fade" id="modalCancelar" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Cancelar cita</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <label class="form-label">Motivo de cancelación</label>
                            <input
                                v-model="motivoCancelacion"
                                type="text"
                                class="form-control mb-3"
                                placeholder="Escribe el motivo..."
                            />

                            <div :class="aplicaReembolso ? 'alert alert-success' : 'alert alert-warning'" class="mb-0">
                                <strong>{{ aplicaReembolso ? '✓ Aplica reembolso' : '✗ No aplica reembolso' }}</strong><br>
                                {{ mensajeReembolso }}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn btn-danger" @click="confirmarCancelacion">
                                Confirmar cancelación
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>

        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useCitas } from '../controladores/useCita'
import { useSesion } from '@/modulos/principal/controladores/useSesion'
import { Modal } from 'bootstrap'

const motivoCancelacion = ref('')
const citaACancelar = ref<number | null>(null)

const { appointments, fetchCitasPaciente, cancelarCita } = useCitas()
const { rolUsuario, usuarioActual } = useSesion()

const aplicaReembolso  = ref(false)
const mensajeReembolso = ref('')

const handleCancelar = (id: number) => {
    citaACancelar.value     = id
    motivoCancelacion.value = ''

    // Busca la cita para saber su fecha
    const cita = appointments.value.find(a => a.id === id)
    if (cita) {
        const fechaCita   = new Date(`${cita.date}T${cita.time}:00`)
        const ahora       = new Date()
        const horasRestantes = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60)

        if (horasRestantes >= 24) {
            aplicaReembolso.value  = true
            mensajeReembolso.value = `Se realizará el reembolso porque la cita se cancela con más de 24 horas de anticipación.`
        } else {
            aplicaReembolso.value  = false
            mensajeReembolso.value = `No se realizará el reembolso porque faltan menos de 24 horas para la cita.`
        }
    }

    const modal = new Modal(document.getElementById('modalCancelar')!)
    modal.show()
}

const confirmarCancelacion = async () => {
    if (!motivoCancelacion.value.trim()) return
    if (!citaACancelar.value) return

    await cancelarCita(citaACancelar.value, motivoCancelacion.value, usuarioActual.value?.id_usuario as number ?? 0)

    const modal = Modal.getInstance(document.getElementById('modalCancelar')!)
    modal?.hide()
    citaACancelar.value = null
}


onMounted(async () => {
    if (usuarioActual.value?.id_paciente) {
        await fetchCitasPaciente(usuarioActual.value.id_paciente as number)
    }
})

const esDoctor        = computed(() => rolUsuario.value === 'doctor')
const esRecepcionista = computed(() => rolUsuario.value === 'recepcionista')
const esPaciente = computed(() => rolUsuario.value === 'paciente')

const fullMonths = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const weekDays   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const now          = new Date()
const visibleYear  = ref(now.getFullYear())
const visibleMonth = ref(now.getMonth())
const selectedDay  = ref(now.getDate())
const todayDay     = now.getDate()
const showMonthMenu = ref(false)

const isCurrentVisibleMonth = computed(
    () => visibleYear.value === now.getFullYear() && visibleMonth.value === now.getMonth()
)

const daysInMonth     = computed(() => new Date(visibleYear.value, visibleMonth.value + 1, 0).getDate())
const firstDayOfMonth = computed(() => new Date(visibleYear.value, visibleMonth.value, 1).getDay())

watch([visibleMonth, visibleYear], () => {
    if (selectedDay.value > daysInMonth.value) selectedDay.value = daysInMonth.value
})

const calendarCells = computed(() => {
    const cells: { day: number | null; key: string }[] = []
    for (let i = 0; i < firstDayOfMonth.value; i++) {
        cells.push({ day: null, key: `empty-${i}` })
    }
    for (let d = 1; d <= daysInMonth.value; d++) {
        cells.push({ day: d, key: `day-${d}` })
    }
    return cells
})

const appointmentsInVisibleMonth = computed(() =>
    appointments.value.filter(a => {
        const [y, m] = a.date.split('-').map(Number)
        return y === visibleYear.value && m === visibleMonth.value + 1
    })
)

const appointmentCountByDay = computed<Record<number, number>>(() =>
    appointmentsInVisibleMonth.value.reduce<Record<number, number>>((acc, a) => {
        const day = Number(a.date.split('-')[2])
        acc[day] = (acc[day] ?? 0) + 1
        return acc
    }, {})
)

const hasAppointments = (day: number) => !!appointmentCountByDay.value[day]

const selectedDayAppointments = computed(() => {
    const yyyy = visibleYear.value
    const mm   = String(visibleMonth.value + 1).padStart(2, '0')
    const dd   = String(selectedDay.value).padStart(2, '0')
    return appointments.value.filter(a => a.date === `${yyyy}-${mm}-${dd}`)
})

const selectedDateLabel = computed(() =>
    new Date(visibleYear.value, visibleMonth.value, selectedDay.value)
        .toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
)

const selectDay           = (day: number) => { selectedDay.value = day }
const toggleMonthMenu     = ()            => { showMonthMenu.value = !showMonthMenu.value }
const selectMonthFromMenu = (i: number)   => { visibleMonth.value = i; showMonthMenu.value = false }

const prevMonth = () => {
    if (visibleMonth.value === 0) { visibleYear.value--; visibleMonth.value = 11 }
    else visibleMonth.value--
    showMonthMenu.value = false
}
const nextMonth = () => {
    if (visibleMonth.value === 11) { visibleYear.value++; visibleMonth.value = 0 }
    else visibleMonth.value++
    showMonthMenu.value = false
}


</script>

<style scoped>
.citas-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    display: grid;
    gap: 1.5rem;
}
.calendar-card, .details-card, .appointment-card {
    background: var(--clarus-ivory);
    border-radius: 20px;
    box-shadow: 0 18px 45px var(--clarus-shadow);
}
h1, h2, h3, p { margin: 0; }
.button {
    background: var(--clarus-midnight);
    color: var(--clarus-ivory);
    border: 1px solid var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.85rem 1.4rem;
    text-decoration: none;
    font-weight: 700;
    cursor: pointer;
}
.button-white  { background: var(--clarus-ivory); color: var(--clarus-midnight); }
.button-danger { background: #b42318; border-color: #b42318; }
.calendar-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
    gap: 1.5rem;
}
.calendar-card, .details-card { padding: 1.5rem; }
.details-card-layout { display: flex; flex-direction: column; min-height: 100%; }
.calendar-toolbar, .section-heading {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
}
.month-selector { position: relative; }
.month-label { text-align: center; }
.month-label-button { border: 0; background: transparent; cursor: pointer; padding: 0.35rem 0.75rem; }
.month-menu {
    position: absolute;
    top: calc(100% + 0.75rem);
    left: 50%;
    transform: translateX(-50%);
    width: min(260px, 80vw);
    background: var(--clarus-ivory);
    border: 1px solid var(--clarus-gold-soft);
    border-radius: 18px;
    box-shadow: 0 18px 45px var(--clarus-shadow);
    padding: 0.75rem;
    display: grid;
    gap: 0.45rem;
    z-index: 10;
}
.month-menu-item {
    border: 1px solid var(--clarus-gold-soft);
    background: var(--clarus-ivory);
    border-radius: 12px;
    padding: 0.7rem 0.9rem;
    text-align: left;
    color: var(--clarus-midnight);
    font-weight: 700;
    cursor: pointer;
}
.month-menu-item.active { background: var(--clarus-midnight); color: var(--clarus-ivory); border-color: var(--clarus-midnight); }
.month-label span, .section-heading p, .empty-state {
    color: var(--clarus-oxford);
}
.nav-button {
    border: 0; width: 2.75rem; height: 2.75rem; border-radius: 999px;
    background: var(--clarus-gold-soft); color: var(--clarus-midnight);
    font-size: 1.35rem; font-weight: 700; cursor: pointer;
}
.weekdays-grid, .dates-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.5rem;
}
.weekdays-grid { margin-bottom: 0.5rem; }
.weekdays-grid span { text-align: center; font-size: 0.88rem; font-weight: 700; color: var(--clarus-oxford); }
.dates-grid { grid-auto-rows: minmax(76px, auto); }
.date-cell {
    border: 1px solid var(--clarus-gold-soft);
    background: var(--clarus-ivory);
    border-radius: 14px;
    padding: 0.65rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    font-weight: 700;
    cursor: pointer;
}
.date-cell.has-appointments { background: var(--clarus-gold-soft); border-color: var(--clarus-gold); }
.date-cell.active            { background: var(--clarus-midnight); color: var(--clarus-ivory); border-color: var(--clarus-midnight); }
.date-cell.active small,
.date-cell.active span       { color: inherit; }
.date-cell.today             { outline: 2px solid var(--clarus-gold); }
.date-cell.empty             { border-style: dashed; opacity: 0.45; }
.date-cell:disabled          { cursor: default; }
.counter, .tag {
    background: var(--clarus-gold-soft); color: var(--clarus-midnight);
    border-radius: 999px; padding: 0.4rem 0.75rem; font-size: 0.85rem; font-weight: 700;
}
.appointment-list     { display: grid; gap: 1rem; margin-top: 1rem; }
.details-actions      { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.details-actions-bottom { margin-top: auto; padding-top: 2rem; }
.appointment-card {
    padding: 1rem 1.25rem;
    border: 1px solid var(--clarus-border);
    border-radius: 16px;
    display: grid;
    gap: 0.35rem;
}
.card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
}
.appointment-card h3 { margin: 0; font-size: 1.4rem; }
.appointment-card p  { margin: 0; }
.muted { font-size: 0.85rem; color: var(--clarus-oxford); }
.empty-state { margin-top: 1rem; }
.appointment-card .button-danger {
    justify-self: start;
    margin-top: 0.4rem;
    padding: 0.55rem 1.2rem;
    font-size: 0.88rem;
}
@media (max-width: 960px) {
    .calendar-layout { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
    .calendar-toolbar, .section-heading, .details-actions {
        flex-direction: column; align-items: flex-start;
    }
    .weekdays-grid, .dates-grid { gap: 0.35rem; }
    .date-cell { min-height: 68px; }
}
</style>