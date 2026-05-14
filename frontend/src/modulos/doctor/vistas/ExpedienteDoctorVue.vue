<template>
    <section class="page-shell">

        <header class="header">
            <div>
                <h1>Expedientes médicos</h1>
                <p class="subtitle">Pacientes que has atendido.</p>
            </div>
            <button class="button" type="button" @click="abrirCrear">
                + Nuevo expediente
            </button>
        </header>

        <!-- Filtros -->
        <div class="filters">
            <input v-model="busqueda" class="input" type="search" placeholder="Buscar por nombre del paciente..." />
        </div>

        <!-- Lista -->
        <div v-if="expedientesFiltrados.length === 0" class="card empty-state">
            No se encontraron expedientes.
        </div>

        <div class="grid">
            <article
                v-for="exp in expedientesFiltrados"
                :key="exp.id_expediente"
                class="exp-card"
            >
                <div class="exp-card__header">
                    <div>
                        <h3>{{ exp.nombre_paciente }} {{ exp.apellido_paterno }} {{ exp.apellido_materno ?? '' }}</h3>
                        <p class="meta">Código: {{ exp.codigo }} · {{ exp.tipo_sangre ?? '–' }} · {{ formatSexo(exp.sexo) }}</p>
                    </div>
                    <button class="button button-sm" type="button" @click="abrirEditar(exp)">Editar</button>
                </div>

                <div class="exp-card__body">
                    <div class="campo">
                        <span class="campo-label">Antecedentes patológicos</span>
                        <span>{{ exp.ant_patologicos || '–' }}</span>
                    </div>
                    <div class="campo">
                        <span class="campo-label">Medicamentos actuales</span>
                        <span>{{ exp.medicamentos_actuales || '–' }}</span>
                    </div>
                    <div class="campo">
                        <span class="campo-label">Alergias</span>
                        <span>{{ exp.alergias || '–' }}</span>
                    </div>
                </div>
            </article>
        </div>

        <!-- Modal crear/editar -->
        <div class="modal fade" id="modalExpediente" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ modoEdicion ? 'Editar expediente' : 'Nuevo expediente' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">

                        <div v-if="!modoEdicion" class="mb-3">
                            <label class="form-label fw-bold">Paciente</label>
                            <select v-model="form.id_paciente" class="form-select">
                                <option disabled value="">Selecciona un paciente</option>
                                <option v-for="p in pacientesAtendidos" :key="p.id_paciente" :value="p.id_paciente">
                                    {{ p.nombre }} {{ p.apellido_paterno }}
                                </option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold">Antecedentes patológicos</label>
                            <textarea v-model="form.ant_patologicos" class="form-control" rows="3" placeholder="Hipertensión, diabetes, etc." maxlength="1000"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Medicamentos actuales</label>
                            <textarea v-model="form.medicamentos_actuales" class="form-control" rows="2" placeholder="Metformina, Losartán..." maxlength="500"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Alergias</label>
                            <textarea v-model="form.alergias" class="form-control" rows="2" placeholder="Penicilina, látex..." maxlength="500"></textarea>
                        </div>

                        <div v-if="modalError" class="alert alert-danger mb-0">{{ modalError }}</div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-dark" :disabled="guardando" @click="guardar">
                            {{ guardando ? 'Guardando...' : (modoEdicion ? 'Guardar cambios' : 'Crear expediente') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Modal } from 'bootstrap'
import { useSesion } from '@/modulos/principal/controladores/useSesion'

const { usuarioActual } = useSesion()
const API = 'http://localhost:3001/api'

const expedientes      = ref<any[]>([])
const pacientesAtendidos = ref<any[]>([])
const busqueda         = ref('')
const guardando        = ref(false)
const modoEdicion      = ref(false)
const modalError       = ref('')

const form = reactive({
    id_expediente:        0,
    id_paciente:          '' as number | '',
    ant_patologicos:      '',
    medicamentos_actuales:'',
    alergias:             ''
})

const formatSexo = (s: string) => s === 'M' ? 'Masculino' : s === 'F' ? 'Femenino' : '–'

const expedientesFiltrados = computed(() => {
    const q = busqueda.value.toLowerCase()
    if (!q) return expedientes.value
    return expedientes.value.filter(e =>
        `${e.nombre_paciente} ${e.apellido_paterno} ${e.apellido_materno ?? ''}`.toLowerCase().includes(q)
    )
})

const cargarExpedientes = async () => {
    const id = Number(usuarioActual.value?.id_doctor)
    if (!id) return
    const res  = await fetch(`${API}/expediente/doctor/${id}`)
    const data = await res.json()
    if (Array.isArray(data)) expedientes.value = data
}

const cargarPacientes = async () => {
    const id = Number(usuarioActual.value?.id_doctor)
    if (!id) return
    const res  = await fetch(`${API}/cita/doctor/${id}`)
    const data = await res.json()
    if (Array.isArray(data)) {
        const vistos = new Map<number, any>()
        for (const c of data) {
            if (!vistos.has(c.id_paciente)) {
                vistos.set(c.id_paciente, {
                    id_paciente:     c.id_paciente,
                    nombre:          c.nombre_paciente ?? '',
                    apellido_paterno: c.apellido_paciente ?? ''
                })
            }
        }
        pacientesAtendidos.value = [...vistos.values()]
    }
}

const limpiarForm = () => {
    Object.assign(form, {
        id_expediente: 0, id_paciente: '',
        codigo: '', ant_patologicos: '',
        medicamentos_actuales: '', alergias: ''
    })
    modalError.value = ''
}

const abrirCrear = () => {
    modoEdicion.value = false
    limpiarForm()
    new Modal(document.getElementById('modalExpediente')!).show()
}

const abrirEditar = (exp: any) => {
    modoEdicion.value = true
    modalError.value  = ''
    Object.assign(form, {
        id_expediente:         exp.id_expediente,
        id_paciente:           exp.id_paciente,
        codigo:                exp.codigo,
        ant_patologicos:       exp.ant_patologicos       ?? '',
        medicamentos_actuales: exp.medicamentos_actuales ?? '',
        alergias:              exp.alergias              ?? ''
    })
    new Modal(document.getElementById('modalExpediente')!).show()
}

const guardar = async () => {
    modalError.value = ''
    if (!modoEdicion.value && !form.id_paciente) { modalError.value = 'Selecciona un paciente.'; return }

    guardando.value = true
    try {
        const url    = `${API}/expediente`
        const method = modoEdicion.value ? 'PUT' : 'POST'
        const body = modoEdicion.value
            ? {
                id_expediente:         form.id_expediente,
                id_paciente:           form.id_paciente,
                ant_patologicos:       form.ant_patologicos,
                medicamentos_actuales: form.medicamentos_actuales,
                alergias:              form.alergias
            }
            : {
                id_paciente:           form.id_paciente,
                id_doctor:             Number(usuarioActual.value?.id_doctor),
                ant_patologicos:       form.ant_patologicos,
                medicamentos_actuales: form.medicamentos_actuales,
                alergias:              form.alergias
            }

        const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const data = await res.json()
        const parsearErrorExpediente = (err: any): string => {
    if (err?.name === 'ZodError' || err?.issues) {
        for (const issue of (err.issues ?? [])) {
            if (issue.path?.includes('ant_patologicos'))
                return 'Los antecedentes patológicos exceden el límite de caracteres.'
            if (issue.path?.includes('medicamentos_actuales'))
                return 'Los medicamentos exceden el límite de caracteres.'
            if (issue.path?.includes('alergias'))
                return 'Las alergias exceden el límite de caracteres.'
            if (issue.path?.includes('id_paciente'))
                return 'Selecciona un paciente válido.'
            if (issue.path?.includes('id_doctor'))
                return 'Error con el doctor. Intenta cerrar sesión y volver a entrar.'
        }
        return 'Datos inválidos, revisa el formulario.'
    }
    if (typeof err === 'string') return err
    return 'Error al guardar el expediente.'
}

        if (data.error) { 
            modalError.value = parsearErrorExpediente(data.error)
            return 
        }
        Modal.getInstance(document.getElementById('modalExpediente')!)?.hide()
        await cargarExpedientes()
    } catch {
        modalError.value = 'No se pudo conectar con el servidor.'
    } finally {
        guardando.value = false
    }
}

onMounted(async () => {
    await cargarExpedientes()
    await cargarPacientes()
})
</script>

<style scoped>
.page-shell {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    display: grid;
    gap: 1.5rem;
}
.header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
h1, h2, h3, p { margin: 0; }
.subtitle { margin-top: 0.35rem; color: var(--clarus-oxford); }
.filters { display: flex; gap: 1rem; }
.input {
    border: 1px solid var(--clarus-gold-soft);
    border-radius: 12px;
    padding: 0.7rem 0.85rem;
    font: inherit;
    min-height: 46px;
    width: 100%;
    color: var(--clarus-midnight);
}
.grid { display: grid; gap: 1rem; }
.exp-card {
    background: var(--clarus-ivory);
    border-radius: 18px;
    box-shadow: 0 8px 24px var(--clarus-shadow);
    padding: 1.25rem 1.5rem;
    display: grid;
    gap: 1rem;
}
.exp-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}
.meta { font-size: 0.88rem; color: var(--clarus-oxford); margin-top: 0.25rem; }
.exp-card__body { display: grid; gap: 0.6rem; }
.campo { display: grid; gap: 0.2rem; }
.campo-label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--clarus-oxford); }
.empty-state {
    background: var(--clarus-ivory);
    border-radius: 18px;
    box-shadow: 0 8px 24px var(--clarus-shadow);
    padding: 1.5rem;
    color: var(--clarus-oxford);
}
.button {
    background: var(--clarus-midnight);
    color: var(--clarus-ivory);
    border: 1px solid var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.85rem 1.4rem;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
}
.button-sm { padding: 0.45rem 1rem; font-size: 0.88rem; }
@media (max-width: 768px) {
    .header, .exp-card__header { flex-direction: column; align-items: flex-start; }
}
</style>