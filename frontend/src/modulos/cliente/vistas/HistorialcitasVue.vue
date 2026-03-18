<template>
    <section class="page-shell">
        <div class="page-header">
        <div>
            <p class="eyebrow">Historial</p>
            <h1>Historial de citas</h1>
            <p>Consulta de forma separada tus citas pasadas y tus próximas atenciones.</p>
        </div>
        <RouterLink class="button button-white" :to="{ name: 'citas' }">Volver a citas</RouterLink>
        </div>

        <div class="history-grid">
        <article class="history-card">
            <div class="section-heading">
            <h2>Citas próximas</h2>
            <span>{{ upcomingAppointments.length }}</span>
            </div>

            <div v-if="upcomingAppointments.length === 0" class="empty-state">No hay citas próximas.</div>

            <ul v-else class="history-list">
            <li v-for="appointment in upcomingAppointments" :key="appointment.id">
                <strong>{{ appointment.doctor }}</strong>
                <span>{{ appointment.specialty }} · {{ appointment.building }}</span>
                <span>{{ formatDate(appointment.date) }} · {{ formatTime(appointment.time) }}</span>
            </li>
            </ul>
        </article>

        <article class="history-card">
            <div class="section-heading">
            <h2>Citas pasadas</h2>
            <span>{{ pastAppointments.length }}</span>
            </div>

            <div v-if="pastAppointments.length === 0" class="empty-state">No hay citas pasadas.</div>

            <ul v-else class="history-list">
            <li v-for="appointment in pastAppointments" :key="appointment.id">
                <strong>{{ appointment.doctor }}</strong>
                <span>{{ appointment.specialty }} · {{ appointment.building }}</span>
                <span>{{ formatDate(appointment.date) }} · {{ formatTime(appointment.time) }}</span>
            </li>
            </ul>
        </article>
        </div>
    </section>
</template>

<script setup lang="ts">
    import { RouterLink } from 'vue-router'
    import { useCitas } from '../controladores/useCita'

    const { upcomingAppointments, pastAppointments } = useCitas()

    const formatDate = (date: string) =>
    new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'long'
    }).format(new Date(`${date}T00:00:00`))

    const formatTime = (time: string) =>
    new Intl.DateTimeFormat('es-MX', {
        timeStyle: 'short'
    }).format(new Date(`2026-01-01T${time}:00`))
</script>

<style scoped>
    .page-shell {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    }
    .page-header,
    .history-card {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
    }
    .page-header {
    padding: 2rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1.5rem;
    }
    .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #2563eb;
    font-weight: 700;
    margin: 0 0 0.5rem;
    }
    h1,
    h2,
    p {
    margin: 0;
    }
    .page-header p:last-child {
    color: #475569;
    margin-top: 0.75rem;
    }
    .history-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    }
    .history-card {
    padding: 1.5rem;
    }
    .section-heading {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    gap: 1rem;
    }
    .section-heading span,
    .empty-state,
    .history-list span {
    color: #475569;
    }
    .history-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.85rem;
    }
    .history-list li {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1rem;
    display: grid;
    gap: 0.25rem;
    }
    .button {
    background: #2563eb;
    color: #fff;
    border: 1px solid #2563eb;
    border-radius: 999px;
    padding: 0.85rem 1.4rem;
    text-decoration: none;
    font-weight: 700;
    }
    .button-white {
    background: #fff;
    color: #2563eb;
    }
    @media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: stretch;
    }
    }
</style>