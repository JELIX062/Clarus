<template>
    <section class="recetas-view">

        <header class="header">
            <div>
                <h1>Mis consultas</h1>
                <p class="subtitle">Historial de tratamientos e indicaciones médicas.</p>
            </div>
        </header>

        <div class="filters">
            <input
                v-model.trim="searchTerm"
                class="input"
                type="search"
                placeholder="Buscar por doctor o motivo..."
            />
        </div>

        <div v-if="cargando" class="empty-state card">Cargando consultas...</div>
        <div v-else-if="consultasFiltradas.length === 0" class="empty-state card">
            No se encontraron consultas registradas.
        </div>

        <div v-else class="consultas-grid">
            <article v-for="c in consultasFiltradas" :key="c.id_consulta" class="consulta-card">
                <div class="card-header">
                    <div>
                        <h3>Dr. {{ c.nombre_doctor }} {{ c.apellido_doctor }}</h3>
                        <p class="meta">{{ c.especialidad }} · {{ formatFecha(c.fecha_consulta) }}</p>
                    </div>
                </div>

                <div class="campo">
                    <span class="campo-label">Motivo de consulta</span>
                    <span>{{ c.motivo_consulta || '–' }}</span>
                </div>
                <div class="campo">
                    <span class="campo-label">Tratamiento</span>
                    <span>{{ c.tratamiento || '–' }}</span>
                </div>
                <div class="campo">
                    <span class="campo-label">Indicaciones</span>
                    <span>{{ c.indicaciones || '–' }}</span>
                </div>
            </article>
        </div>

    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useSesion } from '@/modulos/principal/controladores/useSesion'

const { usuarioActual } = useSesion()

const API = 'http://localhost:3001/api'

const consultas  = ref<any[]>([])
const cargando   = ref(false)
const searchTerm = ref('')

const consultasFiltradas = computed(() => {
    const q = searchTerm.value.toLowerCase()
    if (!q) return consultas.value
    return consultas.value.filter(c =>
        `${c.nombre_doctor} ${c.apellido_doctor} ${c.motivo_consulta ?? ''}`.toLowerCase().includes(q)
    )
})

const formatFecha = (fecha: string) =>
    new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' })
        .format(new Date(fecha))

onMounted(async () => {
    const id = usuarioActual.value?.id_paciente
    if (!id) return
    cargando.value = true
    try {
        const res  = await fetch(`${API}/consultafisica/paciente/${id}`)
        const data = await res.json()
        if (Array.isArray(data)) consultas.value = data
    } finally {
        cargando.value = false
    }
})
</script>

<style scoped>
.recetas-view {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    display: grid;
    gap: 1.5rem;
}
.header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
h1, h2, h3, p { margin: 0; }
.subtitle { margin-top: 0.35rem; color: var(--clarus-oxford); }
.filters { display: grid; }
.input {
    border: 1px solid var(--clarus-border);
    border-radius: 12px;
    padding: 0.7rem 0.85rem;
    font-size: 0.98rem;
    width: 100%;
}
.consultas-grid { display: grid; gap: 1rem; }
.consulta-card, .empty-state.card {
    background: var(--clarus-ivory);
    border-radius: 20px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 18px 45px var(--clarus-shadow);
    display: grid;
    gap: 0.85rem;
}
.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.meta { font-size: 0.88rem; color: var(--clarus-oxford); margin-top: 0.25rem; }
.campo { display: grid; gap: 0.2rem; }
.campo-label {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--clarus-oxford);
}
.empty-state { color: var(--clarus-oxford); padding: 1.5rem; }
@media (max-width: 768px) {
    .card-header { flex-direction: column; }
}
</style>