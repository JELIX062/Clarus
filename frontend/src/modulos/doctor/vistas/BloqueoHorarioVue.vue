<template>
    <section class="page-shell">

        <header class="header">
            <div>
                <h1>Bloqueos de horario</h1>
                <p class="subtitle">Registra los días en que no estarás disponible para consultas.</p>
            </div>
            <RouterLink class="button button-white" :to="{ name: 'perfil' }">
                Volver a perfil
            </RouterLink>
        </header>

        <!-- Formulario -->
        <article class="card">
            <h2>Nuevo bloqueo</h2>

            <form class="form-grid" @submit.prevent="guardarBloqueo">
                <div class="form-field">
                    <label>Fecha inicio</label>
                    <input v-model="bloqueo.fecha_inicio" class="input" type="date" :min="hoy" required />
                </div>
                <div class="form-field">
                    <label>Fecha fin</label>
                    <input v-model="bloqueo.fecha_fin" class="input" type="date" :min="bloqueo.fecha_inicio || hoy" required />
                </div>
                <div class="form-field">
                    <label>Hora inicio</label>
                    <input v-model="bloqueo.hora_inicio" class="input" type="time" required />
                </div>
                <div class="form-field">
                    <label>Hora fin</label>
                    <input v-model="bloqueo.hora_fin" class="input" type="time" required />
                </div>
                <div class="form-field full-row">
                    <label>Motivo <span class="opcional">(opcional)</span></label>
                    <input
                        v-model="bloqueo.motivo"
                        class="input"
                        type="text"
                        placeholder="Ej: Congreso médico, vacaciones..."
                        maxlength="200"
                    />
                </div>

                <div v-if="bloqueoError" class="alert alert-danger full-row" role="alert">{{ bloqueoError }}</div>
                <div v-if="bloqueoExito" class="alert alert-success full-row" role="alert">{{ bloqueoExito }}</div>

                <div class="full-row actions">
                    <button class="button" type="submit" :disabled="bloqueoGuardando">
                        {{ bloqueoGuardando ? 'Guardando...' : 'Registrar bloqueo' }}
                    </button>
                </div>
            </form>
        </article>

        <!-- Lista de bloqueos -->
        <article class="card">
            <h2>Bloqueos registrados</h2>

            <div v-if="bloqueos.length === 0" class="empty-state">
                No tienes bloqueos registrados.
            </div>

            <div v-else class="bloqueos-list">
                <div v-for="b in bloqueos" :key="b.id_bloqueo" class="bloqueo-item">
                    <div>
                        <strong>{{ formatFecha(b.fecha_inicio) }} → {{ formatFecha(b.fecha_fin) }}</strong>
                        <p class="meta">
                            {{ b.hora_inicio.slice(0, 5) }} – {{ b.hora_fin.slice(0, 5) }}
                            <span v-if="b.motivo"> · {{ b.motivo }}</span>
                        </p>
                    </div>
                    <button
                        class="button button-danger"
                        type="button"
                        @click="eliminarBloqueo(b.id_bloqueo)"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </article>

    </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useSesion } from '@/modulos/principal/controladores/useSesion'

const { usuarioActual } = useSesion()

const API = 'http://localhost:3001/api'
const hoy = new Date().toISOString().substring(0, 10)

const bloqueos         = ref<any[]>([])
const bloqueoError     = ref('')
const bloqueoExito     = ref('')
const bloqueoGuardando = ref(false)

const bloqueo = reactive({
    fecha_inicio: '',
    fecha_fin:    '',
    hora_inicio:  '',
    hora_fin:     '',
    motivo:       ''
})

const formatFecha = (fecha: string) => {
    const soloFecha = fecha.split('T')[0] ?? fecha
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' })
        .format(new Date(`${soloFecha}T00:00:00`))
}

const cargarBloqueos = async () => {
    const id = Number(usuarioActual.value?.id_doctor)
    if (!id || isNaN(id)) return
    try {
        const res  = await fetch(`${API}/bloqueo/doctor/${id}`)
        const data = await res.json()
        if (Array.isArray(data)) bloqueos.value = data
    } catch {
        bloqueoError.value = 'No se pudieron cargar los bloqueos.'
    }
}

const guardarBloqueo = async () => {
    bloqueoError.value = ''
    bloqueoExito.value = ''

    if (bloqueo.fecha_fin < bloqueo.fecha_inicio) {
        bloqueoError.value = 'La fecha fin no puede ser anterior a la fecha inicio.'
        return
    }
    if (bloqueo.hora_fin <= bloqueo.hora_inicio) {
        bloqueoError.value = 'La hora fin debe ser posterior a la hora inicio.'
        return
    }

    bloqueoGuardando.value = true
    try {
        const res = await fetch(`${API}/bloqueo`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_doctor:    usuarioActual.value?.id_doctor,
                fecha_inicio: bloqueo.fecha_inicio,
                fecha_fin:    bloqueo.fecha_fin,
                hora_inicio:  `${bloqueo.hora_inicio}:00`,
                hora_fin:     `${bloqueo.hora_fin}:00`,
                motivo:       bloqueo.motivo,
                creado_por:   usuarioActual.value?.id_usuario
            })
        })
        const data = await res.json()
        if (data.error) {
            bloqueoError.value = 'Error al registrar el bloqueo.'
            return
        }
        bloqueoExito.value = 'Bloqueo registrado correctamente.'
        Object.assign(bloqueo, { fecha_inicio: '', fecha_fin: '', hora_inicio: '', hora_fin: '', motivo: '' })
        await cargarBloqueos()
    } catch {
        bloqueoError.value = 'No se pudo conectar con el servidor.'
    } finally {
        bloqueoGuardando.value = false
    }
}

const eliminarBloqueo = async (id_bloqueo: number) => {
    try {
        await fetch(`${API}/bloqueo`, {
            method:  'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_bloqueo })
        })
        await cargarBloqueos()
    } catch {
        bloqueoError.value = 'No se pudo eliminar el bloqueo.'
    }
}

onMounted(cargarBloqueos)
</script>

<style scoped>
.page-shell {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    display: grid;
    gap: 1.5rem;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}
h1, h2, p { margin: 0; }
.subtitle { margin-top: 0.35rem; color: var(--clarus-oxford); }
.card {
    background: var(--clarus-ivory);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 18px 45px var(--clarus-shadow);
    display: grid;
    gap: 1.25rem;
}
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}
.form-field {
    display: grid;
    gap: 0.4rem;
}
.full-row { grid-column: 1 / -1; }
label { font-weight: 700; color: #334155; }
.opcional { font-weight: 400; color: var(--clarus-oxford); font-size: 0.85rem; }
.input {
    border: 1px solid var(--clarus-gold-soft);
    border-radius: 12px;
    padding: 0.7rem 0.85rem;
    font: inherit;
    min-height: 46px;
    color: var(--clarus-midnight);
}
.input:focus { outline: 2px solid var(--clarus-gold); outline-offset: 1px; }
.actions { display: flex; justify-content: flex-end; }
.button {
    background: var(--clarus-midnight);
    color: var(--clarus-ivory);
    border: 1px solid var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.85rem 1.4rem;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
}
.button-white { background: var(--clarus-ivory); color: var(--clarus-midnight); }
.button-danger { background: #b42318; border-color: #b42318; padding: 0.5rem 1rem; font-size: 0.88rem; }
.button:disabled { opacity: 0.7; cursor: not-allowed; }
.bloqueos-list { display: grid; gap: 0.75rem; }
.bloqueo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    border: 1px solid var(--clarus-border);
    border-radius: 14px;
    padding: 1rem 1.25rem;
}
.meta { margin: 0.25rem 0 0; font-size: 0.88rem; color: var(--clarus-oxford); }
.empty-state { color: var(--clarus-oxford); }
@media (max-width: 768px) {
    .header, .bloqueo-item { flex-direction: column; align-items: flex-start; }
    .form-grid { grid-template-columns: 1fr; }
}
</style>