<template>
    <section class="consulta-view">
        <h2>Registrar consulta</h2>
        <p class="subtitle">Cita #{{ id_cita }} · {{ citaInfo?.nombre_paciente }} {{ citaInfo?.apellido_paciente }}</p>

        <form class="form-card" @submit.prevent="guardar">

            <div class="field-row">
                <label>
                    <span>Motivo de consulta</span>
                    <input v-model="form.motivo_consulta" type="text" required maxlength="500" />
                </label>
                <label>
                    <span>Peso (kg)</span>
                    <input v-model.number="form.peso_kg" type="number" step="0.1" required />
                </label>
                <label>
                    <span>Talla (cm)</span>
                    <input v-model.number="form.talla_cm" type="number" step="0.1" required />
                </label>
            </div>

            <div class="field-row">
                <label>
                    <span>Tensión arterial</span>
                    <input v-model="form.tension_arterial" type="text" placeholder="120/80" maxlength="10" required />
                </label>
                <label>
                    <span>Temperatura (°C)</span>
                    <input v-model.number="form.temperatura_c" type="number" step="0.1" required />
                </label>
                <label>
                    <span>Frecuencia cardíaca</span>
                    <input v-model.number="form.frecuencia_cardiaca" type="number" required />
                </label>
            </div>

            <label>
                <span>Notas del examen físico</span>
                <textarea v-model="form.notas_examen_fisico" rows="3" maxlength="2000" />
            </label>

            <label>
                <span>Notas clínicas</span>
                <textarea v-model="form.notas_clinicas" rows="3" maxlength="2000" />
            </label>

            <label>
                <span>Tratamiento</span>
                <textarea v-model="form.tratamiento" rows="3" maxlength="2000" />
            </label>

            <label>
                <span>Indicaciones</span>
                <textarea v-model="form.indicaciones" rows="3" maxlength="1000" />
            </label>

            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="exito" class="alert alert-success">{{ exito }}</div>

            <div class="actions">
                <button type="button" class="button button-white" @click="router.back()">Cancelar</button>
                <button type="submit" class="button" :disabled="cargando">
                    {{ cargando ? 'Guardando...' : 'Guardar consulta' }}
                </button>
            </div>

        </form>
    </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSesion } from '@/modulos/principal/controladores/useSesion'

const route  = useRoute()
const router = useRouter()
const { usuarioActual } = useSesion()

const API      = 'http://localhost:3001/api'
const id_cita  = Number(route.params.id_cita)
const citaInfo = ref<any>(null)
const error    = ref('')
const exito    = ref('')
const cargando = ref(false)

const form = reactive({
    motivo_consulta:    '',
    peso_kg:            0,
    talla_cm:           0,
    tension_arterial:   '',
    temperatura_c:      0,
    frecuencia_cardiaca: 0,
    notas_examen_fisico: '',
    notas_clinicas:     '',
    tratamiento:        '',
    indicaciones:       ''
})

onMounted(async () => {
    const res  = await fetch(`${API}/cita/${id_cita}`)
    const data = await res.json()
    if (!data.error) citaInfo.value = data
})

const guardar = async () => {
    error.value   = ''
    exito.value   = ''
    cargando.value = true

    try {
        const res  = await fetch(`${API}/consultafisica`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_cita,
                id_expediente: null,
                id_doctor:     Number(usuarioActual.value?.id_doctor),
                ...form
            })
        })
        const data = await res.json()

        if (data.error) {
            error.value = typeof data.error === 'string' ? data.error : 'Error al guardar.'
            return
        }

        exito.value = 'Consulta registrada correctamente. Redirigiendo...'
        setTimeout(() => router.push({ name: 'doctor-citas' }), 1500)

    } catch {
        error.value = 'No se pudo conectar con el servidor.'
    } finally {
        cargando.value = false
    }
}
</script>

<style scoped>
.consulta-view {
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 1.5rem 3rem;
    display: grid;
    gap: 1.5rem;
}
.subtitle { color: var(--clarus-oxford); margin-top: -1rem; }
.form-card {
    background: var(--clarus-ivory);
    border-radius: 18px;
    padding: 2rem;
    box-shadow: 0 18px 45px var(--clarus-shadow);
    display: grid;
    gap: 1.2rem;
}
.field-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}
label { display: grid; gap: 0.35rem; font-weight: 500; }
input, textarea, select {
    padding: 0.72rem;
    border-radius: 10px;
    border: 1px solid var(--clarus-border);
    font: inherit;
    width: 100%;
}
textarea { resize: vertical; }
.actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 0.5rem; }
.button {
    background: var(--clarus-midnight);
    color: var(--clarus-ivory);
    border: 1px solid var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.85rem 1.4rem;
    font-weight: 700;
    cursor: pointer;
}
.button-white {
    background: var(--clarus-ivory);
    color: var(--clarus-midnight);
}
@media (max-width: 768px) {
    .field-row { grid-template-columns: 1fr; }
}
</style>