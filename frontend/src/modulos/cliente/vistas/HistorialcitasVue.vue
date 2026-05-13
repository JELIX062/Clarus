<template>
    <section class="page-shell">

        <header class="header">
            <div>
                <h1>Historial de citas</h1>
                <p class="subtitle">Consulta tus citas próximas y pasadas.</p>
            </div>
            <RouterLink class="button button-white" :to="{ name: 'citas' }">Volver a citas</RouterLink>
        </header>

        <div class="history-grid">
            <article class="history-card">
                <div class="section-heading">
                    <h2>Citas próximas</h2>
                    <span class="counter">{{ citasProximas.length }}</span>
                </div>

                <div v-if="citasProximas.length === 0" class="empty-state">No hay citas próximas.</div>

                <ul v-else class="history-list">
                    <li v-for="a in citasProximas" :key="a.id">
                        <div class="cita-header">
                            <strong>{{ a.doctor }}</strong>
                            <span class="tag-estado">{{ a.estado }}</span>
                        </div>
                        <span class="muted">{{ a.specialty }}</span>
                        <span class="muted">{{ formatDate(a.date) }} · {{ a.time }} – {{ a.horaFin }}</span>
                        <span class="muted">{{ a.sucursal }} · {{ a.consultorio }}</span>
                        <span class="muted">Motivo: {{ a.motivo }}</span>
                    </li>
                </ul>
            </article>

            <article class="history-card">
                <div class="section-heading">
                    <h2>Citas pasadas</h2>
                    <span class="counter">{{ citasPasadas.length }}</span>
                </div>

                <div v-if="citasPasadas.length === 0" class="empty-state">No hay citas pasadas.</div>

                <ul v-else class="history-list">
                    <li v-for="a in citasPasadas" :key="a.id">
                        <div class="cita-header">
                            <strong>{{ a.doctor }}</strong>
                            <span class="tag-cancelada" v-if="a.estado === 'Cancelada'">Cancelada</span>
                            <span class="tag-estado" v-else>{{ a.estado }}</span>
                        </div>
                        <span class="muted">{{ a.specialty }}</span>
                        <span class="muted">{{ formatDate(a.date) }} · {{ a.time }} – {{ a.horaFin }}</span>
                        <span class="muted">{{ a.sucursal }} · {{ a.consultorio }}</span>
                        <span class="muted">Motivo: {{ a.motivo }}</span>
                    </li>
                </ul>
            </article>
        </div>

    </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCitas } from '../controladores/useCita'
import { useSesion } from '@/modulos/principal/controladores/useSesion'

const { appointments, fetchCitasPaciente } = useCitas()
const { usuarioActual } = useSesion()

onMounted(async () => {
    if (appointments.value.length === 0 && usuarioActual.value?.id_paciente) {
        await fetchCitasPaciente(usuarioActual.value.id_paciente as number)
    }
})

const hoy = new Date().toISOString().substring(0, 10)

const citasProximas = computed(() =>
    appointments.value.filter(a => a.date >= hoy && a.estado !== 'Cancelada')
)

const citasPasadas = computed(() =>
    appointments.value.filter(a => a.date < hoy || a.estado === 'Cancelada')
)

const formatDate = (date: string) =>
    new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(`${date}T00:00:00`))
</script>

<style scoped>
.page-shell {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    display: grid;
    gap: 1.5rem;
}
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}
h1, h2, p { margin: 0; }
.subtitle { margin-top: 0.35rem; color: var(--clarus-oxford); }
.history-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
}
.history-card {
    background: var(--clarus-ivory);
    border-radius: 20px;
    box-shadow: 0 18px 45px var(--clarus-shadow);
    padding: 1.5rem;
}
.section-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;
}
.counter {
    background: var(--clarus-gold-soft);
    color: var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.3rem 0.75rem;
    font-size: 0.85rem;
    font-weight: 700;
}
.history-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.85rem;
}
.history-list li {
    border: 1px solid var(--clarus-border);
    border-radius: 16px;
    padding: 1rem;
    display: grid;
    gap: 0.3rem;
}
.cita-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
}
.muted { color: var(--clarus-oxford); font-size: 0.93rem; }
.empty-state { color: var(--clarus-oxford); }
.tag-estado {
    background: var(--clarus-gold-soft);
    color: var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.2rem 0.7rem;
    font-size: 0.8rem;
    font-weight: 700;
    white-space: nowrap;
}
.tag-cancelada {
    background: #fee2e2;
    color: #b42318;
    border-radius: 999px;
    padding: 0.2rem 0.7rem;
    font-size: 0.8rem;
    font-weight: 700;
    white-space: nowrap;
}
.button {
    background: var(--clarus-midnight);
    color: var(--clarus-ivory);
    border: 1px solid var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.85rem 1.4rem;
    text-decoration: none;
    font-weight: 700;
    white-space: nowrap;
}
.button-white { background: var(--clarus-ivory); color: var(--clarus-midnight); }
@media (max-width: 768px) {
    .header { flex-direction: column; align-items: flex-start; }
}
</style>