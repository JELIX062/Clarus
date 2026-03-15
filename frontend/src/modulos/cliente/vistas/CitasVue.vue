<template>
    <section class="citas-view">
        <h3>Citas</h3>

        <div class="calendar-layout">
        <div class="calendar-container">
            <div class="year-header">
            <button class="nav-button" type="button" @click="prevYear">‹</button>
            <span class="year">{{ visibleYear }}</span>
            <button class="nav-button" type="button" @click="nextYear">›</button>
            </div>

            <table class="months-table">
            <tbody>
                <tr class="months-row">
                <td
                    v-for="(month, index) in shortMonths"
                    :key="month"
                    class="month"
                    :class="{ 'active-month': index === visibleMonth }"
                    @click="setMonth(index)"
                >
                    {{ month }}
                </td>
                </tr>
            </tbody>
            </table>

            <table class="days-table">
            <tbody>
                <tr>
                <td v-for="day in weekDays" :key="day" class="day">{{ day }}</td>
                </tr>
            </tbody>
            </table>

            <table class="dates-table">
            <tbody>
                <tr v-for="(week, weekIndex) in calendarRows" :key="`week-${weekIndex}`">
                <td
                    v-for="dateCell in week"
                    :key="dateCell.key"
                    class="table-date"
                    :class="{
                    nil: !dateCell.day,
                    'active-date': dateCell.day === selectedDay,
                    'event-date': dateCell.day && hasEvents(dateCell.day)
                    }"
                    @click="dateCell.day && selectDay(dateCell.day)"
                >
                    {{ dateCell.day ?? '' }}
                </td>
                </tr>
            </tbody>
            </table>

            <button class="button" type="button" @click="showDialog = true" :disabled="!selectedDay">
            Agregar cita
            </button>
        </div>

            <div class="events-container">
                <div v-if="selectedDayEvents.length === 0" class="event-card empty-state">
                <div class="event-name">
                    No hay citas programadas para {{ fullMonths[visibleMonth] }} {{ selectedDay }}.
                </div>
                </div>

                <div
                v-for="event in selectedDayEvents"
                :key="`${event.occasion}-${event.day}-${event.month}-${event.year}`"
                class="event-card"
                :class="{ cancelled: event.cancelled }"
                >
                <div class="event-name">{{ event.occasion }}</div>
                <div v-if="event.cancelled" class="event-cancelled">Cancelada</div>
                <div v-else class="event-count">{{ event.invited_count }} personas</div>
                </div>
            </div>
        </div>

        <div v-if="showDialog" class="dialog-backdrop" @click.self="closeDialog">
            <div class="dialog">
                <h2 class="dialog-header">Agregar nueva cita</h2>
                <form class="form" @submit.prevent="saveEvent">
                <label class="form-label" for="name">Nombre de la cita</label>
                <input id="name" v-model.trim="eventForm.name" class="input" type="text" maxlength="36" />

                <label class="form-label" for="count">Número de personas</label>
                <input id="count" v-model.number="eventForm.count" class="input" type="number" min="0" />

                <div class="actions">
                    <button class="button" type="button" @click="closeDialog">Cancelar</button>
                    <button class="button button-white" type="submit">Guardar</button>
                </div>
                </form>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
    import { computed, reactive, ref } from 'vue'

    type CalendarEvent = {
    occasion: string
    invited_count: number
    year: number
    month: number
    day: number
    cancelled?: boolean
    }

    const shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dic']
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
    const showDialog = ref(false)

    const eventForm = reactive({
    name: '',
    count: 0
    })

    const events = ref<CalendarEvent[]>([])

    const daysInMonth = computed(() => new Date(visibleYear.value, visibleMonth.value + 1, 0).getDate())
    const firstDayOfMonth = computed(() => new Date(visibleYear.value, visibleMonth.value, 1).getDay())

    const selectedDayEvents = computed(() =>
    events.value.filter(
        (event) =>
        event.day === selectedDay.value &&
        event.month === visibleMonth.value + 1 &&
        event.year === visibleYear.value
    )
    )

    const calendarRows = computed(() => {
    const cells: Array<{ key: string; day: number | null }> = []

    for (let i = 0; i < firstDayOfMonth.value; i += 1) {
        cells.push({ key: `blank-${i}`, day: null })
    }

    for (let day = 1; day <= daysInMonth.value; day += 1) {
        cells.push({ key: `day-${day}`, day })
    }

    while (cells.length % 7 !== 0) {
        cells.push({ key: `tail-${cells.length}`, day: null })
    }

    const weeks: Array<Array<{ key: string; day: number | null }>> = []
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7))
    }

    return weeks
    })

    function setMonth(month: number) {
    visibleMonth.value = month
    selectedDay.value = Math.min(selectedDay.value, daysInMonth.value)
    }

    function nextYear() {
    visibleYear.value += 1
    selectedDay.value = Math.min(selectedDay.value, daysInMonth.value)
    }

    function prevYear() {
    visibleYear.value -= 1
    selectedDay.value = Math.min(selectedDay.value, daysInMonth.value)
    }

    function selectDay(day: number) {
    selectedDay.value = day
    }

    function hasEvents(day: number) {
    return events.value.some(
        (event) => event.day === day && event.month === visibleMonth.value + 1 && event.year === visibleYear.value
    )
    }

    function closeDialog() {
    showDialog.value = false
    eventForm.name = ''
    eventForm.count = 0
    }

    function saveEvent() {
    if (!eventForm.name || eventForm.count < 0) {
        return
    }

    events.value.push({
        occasion: eventForm.name,
        invited_count: eventForm.count,
        year: visibleYear.value,
        month: visibleMonth.value + 1,
        day: selectedDay.value
    })

    closeDialog()
    }
</script>

<style scoped>
    .citas-view {
    padding: 1.5rem;
    }

    .calendar-layout {
    display: grid;
    grid-template-columns: minmax(320px, 2fr) minmax(260px, 1fr);
    gap: 1.25rem;
    }

    .calendar-container,
    .events-container {
    background: #fff;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .year-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    }

    .year {
    font-weight: 700;
    font-size: 1.25rem;
    }

    .nav-button {
    border: 0;
    background: transparent;
    font-size: 1.5rem;
    cursor: pointer;
    }

    table {
    width: 100%;
    border-collapse: collapse;
    }

    .month,
    .day,
    .table-date {
    text-align: center;
    padding: 0.45rem;
    }

    .month {
    font-size: 0.85rem;
    cursor: pointer;
    }

    .active-month {
    color: #fff;
    background: #2e86de;
    border-radius: 6px;
    }

    .day {
    font-size: 0.8rem;
    color: #6a6a6a;
    }

    .table-date {
    cursor: pointer;
    border-radius: 6px;
    }

    .table-date.nil {
    cursor: default;
    }

    .table-date:hover:not(.nil) {
    background: #f1f4f9;
    }

    .active-date {
    background: #2e86de;
    color: #fff;
    }

    .event-date {
    font-weight: 700;
    }

    .button {
    margin-top: 0.8rem;
    border: 1px solid #2e86de;
    background: #2e86de;
    color: #fff;
    border-radius: 8px;
    padding: 0.5rem 0.9rem;
    }

    .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    }

    .button-white {
    background: #fff;
    color: #2e86de;
    }

    .events-container {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    }

    .event-card {
    border-left: 6px solid #2e86de;
    background: #f8fbff;
    border-radius: 8px;
    padding: 0.7rem;
    }

    .event-card.cancelled,
    .empty-state {
    border-left-color: #ff1744;
    }

    .event-name {
    font-weight: 600;
    }

    .event-count,
    .event-cancelled {
    font-size: 0.9rem;
    color: #515151;
    }

    .dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: grid;
    place-items: center;
    }

    .dialog {
    width: min(420px, 92vw);
    background: #fff;
    border-radius: 12px;
    padding: 1rem;
    }

    .form {
    display: grid;
    gap: 0.55rem;
    }

    .form-label {
    font-weight: 600;
    }

    .input {
    border: 1px solid #cfd7e3;
    border-radius: 8px;
    padding: 0.45rem;
    }

    .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 0.4rem;
    }
    @media (max-width: 900px) {
    .calendar-layout {
        grid-template-columns: 1fr;
    }
    }
</style>