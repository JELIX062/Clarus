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
                    ? "No tienes citas programadas para este día."
                    : "No hay citas para este día. Puedes usar Agregar cita para registrar una nueva."
            }}
            </div>

            <div v-else class="appointment-list">
            <article
                v-for="appointment in selectedDayAppointments"
                :key="appointment.id"
                class="appointment-card"
            >
                <div class="appointment-card__header">
                <div>
                    <h3>{{ appointment.doctor }}</h3>
                    <p>{{ appointment.specialty }}</p>
                    <p v-if="esDoctor || esRecepcionista" class="patient-name">
                    Paciente: {{ appointment.patientName }}
                    </p>
                </div>
                <span class="tag">{{ appointment.building }}</span>
                </div>

                <dl>
                <div>
                    <dt>Hora</dt>
                    <dd>{{ formatTime(appointment.time) }}</dd>
                </div>
                <div>
                    <dt>Pago</dt>
                    <dd>{{ appointment.paymentMethod }} · {{ appointment.paymentReference }}</dd>
                    <small :class="appointment.paid ? 'payment-status paid' : 'payment-status pending'">
                    {{ appointment.paid ? 'Pagado' : 'Pendiente de pago' }}
                    </small>
                </div>
                </dl>

                <p v-if="appointment.notes" class="notes">{{ appointment.notes }}</p>

                <button
                v-if="esDoctor || esRecepcionista"
                class="button button-danger"
                type="button"
                @click="cancelarCita(appointment.id)"
                >
                Cancelar cita
                </button>
                <button
                v-if="esRecepcionista && !appointment.paid"
                class="button button-success"
                type="button"
                @click="recibirPago(appointment.id)"
                >
                Recibir pago
                </button>
            </article>
            </div>

            <div class="details-actions details-actions-bottom">
            <RouterLink v-if="!esDoctor" class="button" :to="{ name: 'agregar-cita' }">
                {{ esRecepcionista ? "Agendar cita para paciente" : "Agregar cita" }}
            </RouterLink>
            <RouterLink
            v-if="!esRecepcionista"
            class="button button-white"
            :to="{ name: 'historial-citas' }"
            >
                {{ esDoctor ? "Ver historial general" : "Ver historial" }}
            </RouterLink>
            </div>
        </article>
        </div>

    </section>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import { RouterLink } from 'vue-router'
    import { useCitas } from '../controladores/useCita'
    import { useSesion } from '@/modulos/principal/controladores/useSesion'

    const { appointments, removeAppointment, registerPayment } = useCitas()
    const { rolUsuario } = useSesion()

    const fullMonths = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
    ]
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    const now = new Date()
    const visibleYear = ref(now.getFullYear())
    const visibleMonth = ref(now.getMonth())
    const selectedDay = ref(now.getDate())
    const todayDay = now.getDate()
    const showMonthMenu = ref(false)
    const isCurrentVisibleMonth = computed(
    () => visibleYear.value === now.getFullYear() && visibleMonth.value === now.getMonth()
    )

    const daysInMonth = computed(() => new Date(visibleYear.value, visibleMonth.value + 1, 0).getDate())
    const firstDayOfMonth = computed(() => new Date(visibleYear.value, visibleMonth.value, 1).getDay())

    watch([visibleMonth, visibleYear], () => {
    if (selectedDay.value > daysInMonth.value) {
        selectedDay.value = daysInMonth.value
    }
    })

    const appointmentsInVisibleMonth = computed(() =>
    appointments.value.filter((appointment) => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}:00`)

        return (
        appointmentDate.getFullYear() === visibleYear.value && appointmentDate.getMonth() === visibleMonth.value
        )
    })
    )

    const appointmentCountByDay = computed<Record<number, number>>(() => {
    return appointmentsInVisibleMonth.value.reduce<Record<number, number>>((accumulator, appointment) => {
        const day = new Date(`${appointment.date}T${appointment.time}:00`).getDate()
        accumulator[day] = (accumulator[day] ?? 0) + 1
        return accumulator
    }, {})
    })

    const calendarCells = computed(() => {
    const cells: Array<{ key: string; day: number | null }> = []

    for (let index = 0; index < firstDayOfMonth.value; index += 1) {
        cells.push({ key: `blank-${index}`, day: null })
    }

    for (let day = 1; day <= daysInMonth.value; day += 1) {
        cells.push({ key: `day-${visibleYear.value}-${visibleMonth.value}-${day}`, day })
    }

    while (cells.length % 7 !== 0) {
        cells.push({ key: `tail-${cells.length}`, day: null })
    }

    return cells
    })

    const selectedDayAppointments = computed(() =>
    appointmentsInVisibleMonth.value
        .filter((appointment) => new Date(`${appointment.date}T${appointment.time}:00`).getDate() === selectedDay.value)
        .sort((firstAppointment, secondAppointment) => firstAppointment.time.localeCompare(secondAppointment.time))
    )

    const selectedDateLabel = computed(() => {
    return `${selectedDay.value} de ${fullMonths[visibleMonth.value]} de ${visibleYear.value}`
    })

    const esDoctor = computed(() => rolUsuario.value === 'doctor')
    const esRecepcionista = computed(() => rolUsuario.value === 'recepcionista')

    const hasAppointments = (day: number) => Boolean(appointmentCountByDay.value[day])

    const selectDay = (day: number) => {
    selectedDay.value = day
    }

    const setMonth = (month: number) => {
    visibleMonth.value = month
    }

    const toggleMonthMenu = () => {
    showMonthMenu.value = !showMonthMenu.value
    }

    const selectMonthFromMenu = (month: number) => {
    setMonth(month)
    showMonthMenu.value = false
    }

    const prevMonth = () => {
    if (visibleMonth.value === 0) {
        visibleMonth.value = 11
        visibleYear.value -= 1
        showMonthMenu.value = false
        return
    }

    visibleMonth.value -= 1
    showMonthMenu.value = false
    }

    const nextMonth = () => {
    if (visibleMonth.value === 11) {
        visibleMonth.value = 0
        visibleYear.value += 1
        showMonthMenu.value = false
        return
    }

    visibleMonth.value += 1
    showMonthMenu.value = false
    }

    const cancelarCita = (appointmentId: string) => {
    removeAppointment(appointmentId)
    }

    const recibirPago = (appointmentId: string) => {
    registerPayment(appointmentId)
    }

    const formatTime = (time: string) =>
    new Intl.DateTimeFormat('es-MX', {
        timeStyle: 'short'
    }).format(new Date(`2026-01-01T${time}:00`))
</script>

<style scoped>
    .citas-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    display: grid;
    gap: 1.5rem;
    }
    .calendar-card,
    .details-card,
    .appointment-card {
    background: var(--clarus-ivory);
    border-radius: 20px;
    box-shadow: 0 18px 45px var(--clarus-shadow);
    }
    h1,
    h2,
    h3,
    p {
    margin: 0;
    }
    .button {
    background: var(--clarus-midnight);
    color: var(--clarus-ivory);
    border: 1px solid var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.85rem 1.4rem;
    text-decoration: none;
    font-weight: 700;
    }
    .button-white {
    background: var(--clarus-ivory);
    color: var(--clarus-midnight);
    }
    .button-danger {
    margin-top: 1rem;
    background: #b42318;
    border-color: #b42318;
    }
    .button-success {
    margin-top: 0.6rem;
    background: #047857;
    border-color: #047857;
    }
    .calendar-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
    gap: 1.5rem;
    }
    .calendar-card,
    .details-card {
    padding: 1.5rem;
    }
    .details-card-layout {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    }
    .calendar-toolbar,
    .section-heading,
    .appointment-card__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    }
    .month-selector {
    position: relative;
    }
    .month-label {
    text-align: center;
    }
    .month-label-button {
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 0.35rem 0.75rem;
    }
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
    }
    .month-menu-item.active {
    background: var(--clarus-midnight);
    color: var(--clarus-ivory);
    border-color: var(--clarus-midnight);
    }
    .month-label span,
    .section-heading p,
    .empty-state,
    .notes,
    .appointment-card p,
    dt,
    small {
    color: var(--clarus-oxford);
    }
    .nav-button {
    border: 0;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 999px;
    background: var(--clarus-gold-soft);
    color: var(--clarus-midnight);
    font-size: 1.35rem;
    font-weight: 700;
    }
    .weekdays-grid,
    .dates-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.5rem;
    }
    .date-cell {
    border: 1px solid var(--clarus-gold-soft);
    background: var(--clarus-ivory);
    border-radius: 14px;
    }
    .weekdays-grid {
    margin-bottom: 0.5rem;
    }
    .weekdays-grid span {
    text-align: center;
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--clarus-oxford);
    }
    .dates-grid {
    grid-auto-rows: minmax(76px, auto);
    }
    .date-cell {
    padding: 0.65rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    font-weight: 700;
    }
    .date-cell.has-appointments {
    background: var(--clarus-gold-soft);
    border-color: var(--clarus-gold);
    }
    .date-cell.active {
    background: var(--clarus-midnight);
    color: var(--clarus-ivory);
    border-color: var(--clarus-midnight);
    }
    .date-cell.active small,
    .date-cell.active span {
    color: inherit;
    }
    .date-cell.today {
    outline: 2px solid var(--clarus-gold);
    }
    .date-cell.empty {
    border-style: dashed;
    opacity: 0.45;
    }
    .date-cell:disabled {
    cursor: default;
    }
    .counter,
    .tag {
    background: var(--clarus-gold-soft);
    color: var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
    font-weight: 700;
    }
    .appointment-list {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
    }
    .details-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    }
    .details-actions-bottom {
    margin-top: auto;
    padding-top: 2rem;
    }
    .appointment-card {
    padding: 1.25rem;
    border: 1px solid var(--clarus-border);
    }
    dl {
    display: grid;
    gap: 0.8rem;
    margin: 0;
    }
    dt {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    }
    dd {
    margin: 0.25rem 0 0;
    font-weight: 600;
    }
    .payment-status {
    display: inline-block;
    margin-top: 0.3rem;
    font-weight: 700;
    font-size: 0.82rem;
    }
    .payment-status.pending {
    color: #b45309;
    }
    .payment-status.paid {
    color: #047857;
    }
    .patient-name {
    margin-top: 0.4rem;
    font-weight: 700;
    }
    .notes,
    .empty-state {
    margin-top: 1rem;
    }
    @media (max-width: 960px) {
    .calendar-layout {
        grid-template-columns: 1fr;
    }
    }
    @media (max-width: 768px) {
    .calendar-toolbar,
    .section-heading,
    .appointment-card__header,
    .details-actions {
        flex-direction: column;
        align-items: flex-start;
    }

    .weekdays-grid,
    .dates-grid {
        gap: 0.35rem;
    }

    .date-cell {
        min-height: 68px;
    }
    }
</style>