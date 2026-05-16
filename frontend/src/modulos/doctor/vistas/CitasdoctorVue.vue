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
                    <p>Citas del día seleccionado.</p>
                </div>
                <span class="counter">{{ selectedDayAppointments.length }}</span>
            </div>

            <div v-if="selectedDayAppointments.length === 0" class="empty-state">
                No tienes citas programadas para este día.
            </div>

            <div v-else class="appointment-list">
                <article
                    v-for="appointment in selectedDayAppointments"
                    :key="appointment.id"
                    class="appointment-card"
                >
                    <div class="card-row">
                        <h3>{{ appointment.patientName ?? 'Paciente' }}</h3>
                        <span class="tag" :class="tagClass(appointment.estado)">{{ appointment.estado }}</span>
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

                    <div class="card-actions">
                        <button
                            v-if="(appointment.estado === 'Programada' || appointment.estado === 'En curso') && citaHaEmpezado(appointment)"
                            class="button button-success"
                            type="button"
                            @click="marcarEnCurso(appointment.id)"
                        >
                            {{ appointment.estado === 'En curso' ? 'Continuar consulta' : 'Iniciar' }}
                        </button>
                        <button
                            v-if="appointment.estado === 'Programada' && citaHaEmpezado(appointment)"
                            class="button button-warning"
                            type="button"
                            @click="marcarNoAtendida(appointment.id)"
                        >
                            No atendida
                        </button>
                        <button
                            v-if="appointment.estado !== 'Cancelada' && appointment.estado !== 'Completada' && appointment.estado !== 'No atendida' && appointment.estado !== 'En curso' && appointment.estado !== 'Finalizada'"
                            class="button button-danger"
                            type="button"
                            @click="handleCancelar(appointment.id)"
                        >
                            Cancelar
                        </button>
                    </div>
                </article>
            </div>

            <div class="details-actions details-actions-bottom">
                <RouterLink class="button button-white" :to="{ name: 'historial-citas' }">
                    Ver historial
                </RouterLink>
            </div>
        </article>

        </div>

        <!-- Modal cancelar -->
        <div class="modal fade" id="modalCancelarDoctor" tabindex="-1">
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
                        <div class="alert alert-success mb-0">
                            <strong>✓ Aplica reembolso</strong><br>
                            El doctor cancela la cita, se devolverá el 100% del anticipo pagado.
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

    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Modal } from 'bootstrap'
import { useCitas } from '@/modulos/cliente/controladores/useCita'
import { useSesion } from '@/modulos/principal/controladores/useSesion'
import { useRouter } from 'vue-router'
const router = useRouter()

const { appointments, fetchCitasDoctor, cancelarCita } = useCitas()
const { usuarioActual } = useSesion()

const API = 'http://localhost:3001/api'

onMounted(async () => {
    if (usuarioActual.value?.id_doctor) {
        await fetchCitasDoctor(Number(usuarioActual.value.id_doctor))
    }
})

// ── Calendario ────────────────────────────────────────────────
const fullMonths  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const weekDays    = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const now           = new Date()
const visibleYear   = ref(now.getFullYear())
const visibleMonth  = ref(now.getMonth())
const selectedDay   = ref(now.getDate())
const todayDay      = now.getDate()
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
    for (let i = 0; i < firstDayOfMonth.value; i++) cells.push({ day: null, key: `empty-${i}` })
    for (let d = 1; d <= daysInMonth.value; d++) cells.push({ day: d, key: `day-${d}` })
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

// ── Lógica de citas ───────────────────────────────────────────
const tagClass = (estado: string) => ({
    'tag-success':     estado === 'En curso',
    'tag-warning':     estado === 'Programada',
    'tag-danger':      estado === 'Cancelada',
    'tag-muted':       estado === 'Completada' || estado === 'Atendida',
    'tag-no-atendida': estado === 'No atendida',
    'tag-finalizada':  estado === 'Finalizada'  

})

const citaHaEmpezado = (appointment: any): boolean => {
    const ahora      = new Date()
    const inicioCita = new Date(`${appointment.date}T${appointment.time}:00`)
    return ahora >= inicioCita
}

const marcarEnCurso = async (id_cita: number) => {
    const cita = appointments.value.find(a => a.id === id_cita)
    
    if (cita?.estado !== 'En curso') {
        const res  = await fetch(`${API}/cita/estado`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_cita,
                estado:    'En curso',
                id_doctor: Number(usuarioActual.value?.id_doctor)
            })
        })
        const data = await res.json()
        if (data.error) return
    }

    await router.push({ name: 'doctor-consulta', params: { id_cita } })
}

const marcarNoAtendida = async (id_cita: number) => {
    const res = await fetch(`${API}/cita/estado`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_cita,
            estado:    'No atendida',
            id_doctor: Number(usuarioActual.value?.id_doctor)
        })
    })
    const data = await res.json()
    if (!data.error) {
        appointments.value = appointments.value.map(a =>
            a.id === id_cita ? { ...a, estado: 'No atendida' } : a
        )
    }
}

// ── Modal cancelar ────────────────────────────────────────────
const motivoCancelacion = ref('')
const citaACancelar     = ref<number | null>(null)
const aplicaReembolso   = ref(false)
const mensajeReembolso  = ref('')

const handleCancelar = (id: number) => {
    citaACancelar.value     = id
    motivoCancelacion.value = ''
    aplicaReembolso.value   = true
    mensajeReembolso.value  = 'Se realizará el reembolso del anticipo pagado por el paciente.'
    new Modal(document.getElementById('modalCancelarDoctor')!).show()
}

const confirmarCancelacion = async () => {
    if (!motivoCancelacion.value.trim() || !citaACancelar.value) return

    await fetch(`${API}/cita/cancelar-doctor`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_cita:      citaACancelar.value,
            motivo:       motivoCancelacion.value,
            cancelado_por: usuarioActual.value?.id_usuario as number ?? 0
        })
    })

    appointments.value = appointments.value.map(a =>
        a.id === citaACancelar.value ? { ...a, estado: 'Cancelada' } : a
    )
    Modal.getInstance(document.getElementById('modalCancelarDoctor')!)?.hide()
    citaACancelar.value = null
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
.calendar-card, .details-card {
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
.button-white   { background: var(--clarus-ivory); color: var(--clarus-midnight); }
.button-danger  { background: #b42318; border-color: #b42318; padding: 0.55rem 1.1rem; font-size: 0.88rem; }
.button-success { background: #15803d; border-color: #15803d; padding: 0.55rem 1.1rem; font-size: 0.88rem; color: var(--clarus-ivory); border-radius: 999px; font-weight: 700; cursor: pointer; }
.button-warning { background: #d97706; border-color: #d97706; padding: 0.55rem 1.1rem; font-size: 0.88rem; color: var(--clarus-ivory); border-radius: 999px; font-weight: 700; cursor: pointer; }
.tag-no-atendida { background: #fef3c7 !important; color: #d97706 !important; }
.tag-finalizada {
    background: #e0e7ff !important;
    color: #3730a3 !important;
}
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
.month-label span, .section-heading p, .empty-state { color: var(--clarus-oxford); }
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
.appointment-list {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
    max-height: 420px;
    overflow-y: auto;
    padding-right: 0.25rem;
    scrollbar-width: thin;
    scrollbar-color: var(--clarus-gold-soft) transparent;
}

.appointment-list::-webkit-scrollbar {
    width: 5px;
}

.appointment-list::-webkit-scrollbar-track {
    background: transparent;
}

.appointment-list::-webkit-scrollbar-thumb {
    background: var(--clarus-gold-soft);
    border-radius: 999px;
}
.tag-success { background: #dcfce7 !important; color: #15803d !important; }
.tag-warning { background: var(--clarus-gold-soft); color: var(--clarus-midnight); }
.tag-danger  { background: #fee2e2 !important; color: #b42318 !important; }
.tag-muted   { background: #f1f5f9 !important; color: #64748b !important; }
.details-actions        { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.details-actions-bottom { margin-top: auto; padding-top: 2rem; }
.appointment-card       { padding: 1rem 1.25rem; border: 1px solid var(--clarus-border); border-radius: 16px; display: grid; gap: 0.35rem; }
.card-row               { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.appointment-card h3    { margin: 0; font-size: 1.1rem; }
.muted                  { font-size: 0.85rem; color: var(--clarus-oxford); }
.card-actions           { display: flex; gap: 0.5rem; margin-top: 0.4rem; flex-wrap: wrap; }
.empty-state            { margin-top: 1rem; }
@media (max-width: 960px) { .calendar-layout { grid-template-columns: 1fr; } }
@media (max-width: 768px) {
    .calendar-toolbar, .section-heading, .details-actions {
        flex-direction: column; align-items: flex-start;
    }
    .weekdays-grid, .dates-grid { gap: 0.35rem; }
    .date-cell { min-height: 68px; }
}
</style>