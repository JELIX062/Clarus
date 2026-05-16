<template>
    <section class="pacientes-view">
        <header class="header">
            <div>
                <h1>Pacientes</h1>
                <p class="subtitle">Gestiona los pacientes registrados en el sistema.</p>
            </div>
            <button class="button" type="button" @click="abrirCrear">
                + Nuevo paciente
            </button>
        </header>

        <div class="filters">
            <input
                v-model="busqueda"
                class="input"
                type="search"
                placeholder="Buscar por nombre o correo..."
            />
        </div>

        <div v-if="pacientesFiltrados.length === 0" class="empty-state">
            No se encontraron pacientes.
        </div>

        <div class="grid">
            <article
                v-for="p in pacientesFiltrados"
                :key="p.id_paciente"
                class="paciente-card"
            >
                <div class="card-header">
                    <div>
                        <h3>{{ p.nombre }} {{ p.apellido_paterno }} {{ p.apellido_materno ?? '' }}</h3>
                        <p class="meta">{{ p.correo }}</p>
                    </div>
                    <div class="badges">
                        <span class="badge">{{ p.tipo_sangre || '–' }}</span>
                        <span class="badge">{{ formatSexo(p.sexo) }}</span>
                    </div>
                </div>

                <div class="card-body">
                    <div class="campo">
                        <span class="campo-label">Teléfono</span>
                        <span>{{ p.telefono || '–' }}</span>
                    </div>
                    <div class="campo">
                        <span class="campo-label">Fecha de nacimiento</span>
                        <span>{{ formatFecha(p.fecha_nacimiento) }}</span>
                    </div>
                    <div class="campo">
                        <span class="campo-label">Saldo pendiente</span>
                        <span :class="p.saldo_pendiente > 0 ? 'text-danger' : ''">
                            ${{ Number(p.saldo_pendiente).toFixed(2) }}
                        </span>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="button button-sm" type="button" @click="abrirEditar(p)">
                        Editar
                    </button>
                    <button class="button button-sm button-white" type="button" @click="agendarCita(p)">
                        Agendar cita
                    </button>
                    <button class="button button-sm button-white" type="button" @click="verHistorial(p)">
                        Ver historial
                    </button>
                </div>
            </article>
        </div>

        <!-- Modal crear paciente -->
        <div v-if="modalCrear" class="modal-backdrop-custom" @click.self="modalCrear = false">
            <div class="modal-custom">
                <div class="modal-custom-header">
                    <h3>Nuevo paciente</h3>
                    <button class="btn-close-custom" @click="modalCrear = false">✕</button>
                </div>

                <div class="form-grid">
                    <label class="full-row">
                        <span>Nombre</span>
                        <input v-model.trim="formCrear.nombre" class="input" type="text" />
                    </label>
                    <label>
                        <span>Apellido paterno</span>
                        <input v-model.trim="formCrear.apellido_paterno" class="input" type="text" />
                    </label>
                    <label>
                        <span>Apellido materno</span>
                        <input v-model.trim="formCrear.apellido_materno" class="input" type="text" />
                    </label>
                    <label class="full-row">
                        <span>Correo</span>
                        <input v-model.trim="formCrear.correo" class="input" type="email" />
                    </label>
                    <label class="full-row">
                        <span>Teléfono</span>
                        <input v-model.trim="formCrear.telefono" class="input" type="tel" />
                    </label>
                    <label class="full-row">
                        <span>Contraseña</span>
                        <input v-model.trim="formCrear.contraseña" class="input" type="password" />
                    </label>
                    <label>
                        <span>Sexo</span>
                        <select v-model="formCrear.sexo" class="input">
                            <option disabled value="">Selecciona</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </label>
                    <label>
                        <span>Tipo de sangre</span>
                        <select v-model="formCrear.tipo_sangre" class="input">
                            <option disabled value="">Selecciona</option>
                            <option v-for="t in tiposSangre" :key="t" :value="t">{{ t }}</option>
                        </select>
                    </label>
                    <label class="full-row">
                        <span>Fecha de nacimiento</span>
                        <input v-model="formCrear.fecha_nacimiento" class="input" type="date" />
                    </label>
                </div>

                <div v-if="crearError" class="alert alert-danger">{{ crearError }}</div>

                <div class="modal-actions">
                    <button class="button button-white" type="button" @click="modalCrear = false">Cancelar</button>
                    <button class="button" type="button" :disabled="creando" @click="crearPaciente">
                        {{ creando ? 'Creando...' : 'Crear paciente' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal editar paciente -->
        <div v-if="modalEditar" class="modal-backdrop-custom" @click.self="modalEditar = false">
            <div class="modal-custom">
                <div class="modal-custom-header">
                    <h3>Editar paciente</h3>
                    <button class="btn-close-custom" @click="modalEditar = false">✕</button>
                </div>

                <div class="form-grid">
                    <label class="full-row">
                        <span>Nombre</span>
                        <input v-model.trim="form.nombre" class="input" type="text" />
                    </label>
                    <label>
                        <span>Apellido paterno</span>
                        <input v-model.trim="form.apellido_paterno" class="input" type="text" />
                    </label>
                    <label>
                        <span>Apellido materno</span>
                        <input v-model.trim="form.apellido_materno" class="input" type="text" />
                    </label>
                    <label class="full-row">
                        <span>Correo</span>
                        <input v-model.trim="form.correo" class="input" type="email" />
                    </label>
                    <label class="full-row">
                        <span>Teléfono</span>
                        <input v-model.trim="form.telefono" class="input" type="tel" />
                    </label>
                    <label>
                        <span>Sexo</span>
                        <select v-model="form.sexo" class="input">
                            <option disabled value="">Selecciona</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </label>
                    <label>
                        <span>Tipo de sangre</span>
                        <select v-model="form.tipo_sangre" class="input">
                            <option disabled value="">Selecciona</option>
                            <option v-for="t in tiposSangre" :key="t" :value="t">{{ t }}</option>
                        </select>
                    </label>
                    <label class="full-row">
                        <span>Fecha de nacimiento</span>
                        <input v-model="form.fecha_nacimiento" class="input" type="date" />
                    </label>
                </div>

                <div v-if="modalError" class="alert alert-danger">{{ modalError }}</div>

                <div class="modal-actions">
                    <button class="button button-white" type="button" @click="modalEditar = false">Cancelar</button>
                    <button class="button" type="button" :disabled="guardando" @click="guardar">
                        {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="modalHistorial" class="modal-backdrop-custom" @click.self="modalHistorial = false">
            <div class="modal-custom">
                <div class="modal-custom-header">
                    <h3>Historial de {{ pacienteHistorial?.nombre }} {{ pacienteHistorial?.apellido_paterno }}</h3>
                    <button class="btn-close-custom" @click="modalHistorial = false">✕</button>
                </div>
                <div v-if="cargandoHistorial" class="empty-state">Cargando...</div>
                <div v-else-if="historialCitas.length === 0" class="empty-state">No hay citas registradas.</div>
                <div v-else class="consultas-lista">
                    <div v-for="c in historialCitas" :key="c.id_cita" class="consulta-item">
                        <div class="consulta-item-header">
                            <strong>{{ formatFecha(c.fecha) }}</strong>
                            <span :class="tagHistorial(c.estado)">{{ c.estado }}</span>
                        </div>
                        <p><strong>Doctor:</strong> Dr. {{ c.nombre_doctor }} {{ c.apellido_doctor }}</p>
                        <p><strong>Motivo:</strong> {{ c.motivo_consulta }}</p>
                        <p><strong>Hora:</strong> {{ c.hora_inicio?.slice(0,5) }} – {{ c.hora_fin?.slice(0,5) }}</p>
                        <p><strong>Sucursal:</strong> {{ c.nombre_sucursal }} · Consultorio {{ c.numero_consultorio }}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter  } from 'vue-router'
import { useSesion } from '@/modulos/principal/controladores/useSesion'

const { usuarioActual } = useSesion()
const API = 'http://localhost:3001/api'

const router = useRouter()
const pacientes  = ref<any[]>([])
const busqueda   = ref('')
const modalEditar = ref(false)
const modalError  = ref('')
const modalCrear = ref(false)
const crearError = ref('')
const creando    = ref(false)
const guardando   = ref(false)
const modalHistorial    = ref(false)
const historialCitas    = ref<any[]>([])
const cargandoHistorial = ref(false)
const pacienteHistorial = ref<any>(null)


const tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const form = reactive({
    id_paciente:      0,
    id_usuario:       0,
    nombre:           '',
    apellido_paterno: '',
    apellido_materno: '',
    correo:           '',
    telefono:         '',
    sexo:             '',
    tipo_sangre:      '',
    fecha_nacimiento: '',
    saldo_pendiente:  0
})

const formCrear = reactive({
    nombre:           '',
    apellido_paterno: '',
    apellido_materno: '',
    correo:           '',
    telefono:         '',
    contraseña:       '',
    sexo:             '',
    tipo_sangre:      '',
    fecha_nacimiento: ''
})

const formatSexo  = (s: string) => s === 'M' ? 'Masculino' : s === 'F' ? 'Femenino' : '–'
const formatFecha = (f: string) => {
    if (!f) return '–'
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(f.split('T')[0] + 'T12:00:00'))
}

const tagHistorial = (estado: string) => ({
    'badge': true,
    'badge-green':  estado === 'Finalizada',
    'badge-red':    estado === 'Cancelada',
    'badge-yellow': estado === 'No atendida',
    'badge-blue':   estado === 'En curso',
})

const verHistorial = async (p: any) => {
    pacienteHistorial.value = p
    modalHistorial.value    = true
    cargandoHistorial.value = true
    historialCitas.value    = []
    try {
        const res  = await fetch(`${API}/cita/paciente/${p.id_paciente}`)
        const data = await res.json()
        if (Array.isArray(data)) historialCitas.value = data
    } finally {
        cargandoHistorial.value = false
    }
}

const agendarCita = (p: any) => {
    router.push({ 
        name: 'agregar-cita', 
        query: { 
            id_paciente:      p.id_paciente,
            nombre_paciente:  `${p.nombre} ${p.apellido_paterno}`
        } 
    })
}

const pacientesFiltrados = computed(() => {
    const q = busqueda.value.toLowerCase()
    if (!q) return pacientes.value
    return pacientes.value.filter(p =>
        `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''} ${p.correo}`.toLowerCase().includes(q)
    )
})

const cargarPacientes = async () => {
    const res  = await fetch(`${API}/paciente`)
    const data = await res.json()
    if (Array.isArray(data)) pacientes.value = data
}

const abrirCrear = () => {
    crearError.value = ''
    Object.assign(formCrear, {
        nombre: '', apellido_paterno: '', apellido_materno: '',
        correo: '', telefono: '', contraseña: '',
        sexo: '', tipo_sangre: '', fecha_nacimiento: ''
    })
    modalCrear.value = true
}

const crearPaciente = async () => {
    crearError.value = ''
    creando.value    = true
    try {
        const res  = await fetch(`${API}/paciente`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ ...formCrear })
        })
        const data = await res.json()
        if (data.error) {
            crearError.value = typeof data.error === 'string' ? data.error : 'Error al crear el paciente.'
            return
        }
        modalCrear.value = false
        await cargarPacientes()
    } catch {
        crearError.value = 'No se pudo conectar con el servidor.'
    } finally {
        creando.value = false
    }
}

const abrirEditar = (p: any) => {
    modalError.value = ''
    Object.assign(form, {
        id_paciente:      p.id_paciente,
        id_usuario:       p.id_usuario,
        nombre:           p.nombre           ?? '',
        apellido_paterno: p.apellido_paterno  ?? '',
        apellido_materno: p.apellido_materno  ?? '',
        correo:           p.correo            ?? '',
        telefono:         p.telefono          ?? '',
        sexo:             p.sexo              ?? '',
        tipo_sangre:      p.tipo_sangre       ?? '',
        fecha_nacimiento: p.fecha_nacimiento ? p.fecha_nacimiento.split('T')[0] : '',
        saldo_pendiente:  Number(p.saldo_pendiente ?? 0)
    })
    modalEditar.value = true
}

const guardar = async () => {
    modalError.value = ''
    guardando.value  = true
    try {
        const res  = await fetch(`${API}/paciente`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ ...form })
        })
        const data = await res.json()
        if (data.error) {
            modalError.value = typeof data.error === 'string' ? data.error : 'Error al guardar.'
            return
        }
        modalEditar.value = false
        await cargarPacientes()
    } catch {
        modalError.value = 'No se pudo conectar con el servidor.'
    } finally {
        guardando.value = false
    }
}

onMounted(cargarPacientes)
</script>

<style scoped>
.pacientes-view {
    max-width: 1100px;
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

h1, h2, h3, p { margin: 0; }

.subtitle {
    margin-top: 0.35rem;
    color: var(--clarus-oxford);
}

.filters {
    display: flex;
    gap: 1rem;
}

.input {
    border: 1px solid var(--clarus-gold-soft);
    border-radius: 12px;
    padding: 0.7rem 0.85rem;
    font: inherit;
    min-height: 46px;
    width: 100%;
    color: var(--clarus-midnight);
}

.grid {
    display: grid;
    gap: 1rem;
}

.paciente-card {
    background: var(--clarus-ivory);
    border-radius: 18px;
    box-shadow: 0 8px 24px var(--clarus-shadow);
    padding: 1.25rem 1.5rem;
    display: grid;
    gap: 1rem;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}

.meta {
    font-size: 0.88rem;
    color: var(--clarus-oxford);
    margin-top: 0.2rem;
}

.badges {
    display: flex;
    gap: 0.4rem;
    flex-shrink: 0;
}

.badge {
    background: var(--clarus-gold-soft);
    color: var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.2rem 0.75rem;
    font-size: 0.82rem;
    font-weight: 600;
}

.card-body {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
}

.campo {
    display: grid;
    gap: 0.2rem;
}

.campo-label {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--clarus-oxford);
}

.text-danger { color: #b42318; font-weight: 600; }

.card-actions {
    display: flex;
    gap: 0.5rem;
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

.button-sm {
    padding: 0.45rem 1rem;
    font-size: 0.88rem;
}

.button-white {
    background: var(--clarus-ivory);
    color: var(--clarus-midnight);
}

.empty-state {
    background: var(--clarus-ivory);
    border-radius: 18px;
    box-shadow: 0 8px 24px var(--clarus-shadow);
    padding: 1.5rem;
    color: var(--clarus-oxford);
}

.modal-backdrop-custom {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
}

.modal-custom {
    background: var(--clarus-ivory);
    border-radius: 20px;
    padding: 1.75rem;
    width: min(680px, 90vw);
    max-height: 85vh;
    overflow-y: auto;
    display: grid;
    gap: 1.2rem;
}

.modal-custom-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-close-custom {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--clarus-oxford);
}

.badge-green {
    background: #dcfce7;
    color: #166534;
    border-radius: 999px;
    padding: 0.2rem 0.75rem;
    font-size: 0.82rem;
    font-weight: 600;
}

.badge-red {
    background: #fee2e2;
    color: #b42318;
    border-radius: 999px;
    padding: 0.2rem 0.75rem;
    font-size: 0.82rem;
    font-weight: 600;
}

.badge-yellow {
    background: #fef9c3;
    color: #854d0e;
    border-radius: 999px;
    padding: 0.2rem 0.75rem;
    font-size: 0.82rem;
    font-weight: 600;
}

.badge-blue {
    background: #e0e7ff;
    color: #3730a3;
    border-radius: 999px;
    padding: 0.2rem 0.75rem;
    font-size: 0.82rem;
    font-weight: 600;
}

.consultas-lista { 
    display: grid; 
    gap: 1rem; 
}

.consulta-item {
    background: white;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    display: grid;
    gap: 0.4rem;
    border: 1px solid var(--clarus-border);
}
.consulta-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.form-grid label {
    display: grid;
    gap: 0.35rem;
    font-weight: 500;
    font-size: 0.94rem;
}

.full-row {
    grid-column: 1 / -1;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

@media (max-width: 768px) {
    .header { flex-direction: column; align-items: flex-start; }
    .card-body { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
}
</style>