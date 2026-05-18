<template>
    <section class="admin-view">
        <header class="header">
            <div>
                <h1>Doctores</h1>
                <p class="subtitle">Gestiona los doctores de Clarus.</p>
            </div>
            <button class="button" type="button" @click="abrirCrear">
                + Registrar nuevo
            </button>
        </header>

        <div class="filters">
            <input v-model="busqueda" class="input" type="search" placeholder="Busca por nombre..." />
        </div>

        <div v-if="doctoresFiltrados.length === 0" class="empty-state">
            No se encontraron doctores.
        </div>

        <div class="grid">
            <article v-for="d in doctoresFiltrados" :key="d.id_doctor" class="card">
                <div class="card-header">
                    <h3>Dr. {{ d.nombre }} {{ d.apellido_paterno }} {{ d.apellido_materno ?? '' }}</h3>
                    <button class="button button-sm" type="button" @click="abrirEditar(d)">Editar</button>
                </div>
                <div class="card-body">
                    <div class="campo">
                        <span class="campo-label">Especialidad</span>
                        <span>{{ d.especialidad }}</span>
                    </div>
                    <div class="campo">
                        <span class="campo-label">Tarifa</span>
                        <span>${{ Number(d.tarifa_consulta).toFixed(2) }}</span>
                    </div>
                    <div class="campo">
                        <span class="campo-label">RFC</span>
                        <span>{{ d.rfc }}</span>
                    </div>
                    <div class="campo">
                        <span class="campo-label">Cédula</span>
                        <span>{{ d.cedula_profesional }}</span>
                    </div>
                    <div class="campo">
                        <span class="campo-label">Correo</span>
                        <span>{{ d.correo }}</span>
                    </div>
                    <div class="campo">
                        <span class="campo-label">Teléfono</span>
                        <span>{{ d.telefono || '–' }}</span>
                    </div>
                    <div class="campo">
                        <span class="campo-label">Sucursal</span>
                        <span>{{ nombreSucursal(d.id_sucursal) }}</span>
                    </div>
                </div>
            </article>
        </div>

        <!-- Modal crear/editar -->
        <div v-if="modalAbierto" class="modal-backdrop-custom" @click.self="modalAbierto = false">
            <div class="modal-custom">
                <div class="modal-custom-header">
                    <h3>{{ modoEdicion ? 'Editar doctor' : 'Nuevo doctor' }}</h3>
                    <button class="btn-close-custom" @click="modalAbierto = false">✕</button>
                </div>

                <div class="form-grid">
                    <label>
                        <span>Nombre</span>
                        <input v-model.trim="form.nombre" class="input" type="text" placeholder="Nombre" />
                    </label>
                    <label>
                        <span>Apellido paterno</span>
                        <input v-model.trim="form.apellido_paterno" class="input" type="text" placeholder="Apellido paterno" />
                    </label>
                    <label>
                        <span>Apellido materno</span>
                        <input v-model.trim="form.apellido_materno" class="input" type="text" placeholder="Apellido materno" />
                    </label>
                    <label>
                        <span>Correo</span>
                        <input v-model.trim="form.correo" class="input" type="email" placeholder="doctor@clarus.com" />
                    </label>
                    <label>
                        <span>Teléfono</span>
                        <input v-model.trim="form.telefono" class="input" type="tel" placeholder="6671234567" />
                    </label>
                    <label v-if="!modoEdicion">
                        <span>Contraseña</span>
                        <input v-model.trim="form.contraseña" class="input" type="password" placeholder="Mínimo 6 caracteres" />
                    </label>
                    <label>
                        <span>Especialidad</span>
                        <input v-model.trim="form.especialidad" class="input" type="text" placeholder="Ej. Medicina General" />
                    </label>
                    <label>
                        <span>RFC</span>
                        <input v-model.trim="form.rfc" class="input" type="text" maxlength="13" placeholder="ABC121212XYZ" />
                    </label>
                    <label>
                        <span>Cédula profesional</span>
                        <input v-model.trim="form.cedula_profesional" class="input" type="text" placeholder="Ej. 1234567" />
                    </label>
                    <label>
                        <span>Tarifa consulta</span>
                        <input v-model.number="form.tarifa_consulta" class="input" type="number" step="0.01" placeholder="Ej. 500.00" />
                    </label>
                    <label class="full-row">
                        <span>Sucursal</span>
                        <select v-model="form.id_sucursal" class="input">
                            <option disabled :value="0">Selecciona una sucursal</option>
                            <option v-for="s in sucursales" :key="s.id_sucursal" :value="s.id_sucursal">
                                {{ s.nombre }}
                            </option>
                        </select>
                    </label>
                </div>

                <div v-if="modoEdicion">
                    <h4 style="margin: 0 0 0.75rem; font-size: 1rem;">Horarios de atención</h4>

                    <div v-if="horarios.length > 0" style="display: grid; gap: 0.5rem; margin-bottom: 1rem;">
                        <div
                            v-for="h in horarios"
                            :key="h.id_horario"
                            style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border-radius: 10px; padding: 0.6rem 1rem;"
                        >
                            <span style="font-size: 0.9rem;">
                                <strong>{{ diasSemana.find(d => d.valor === h.dia_semana)?.label }}</strong>
                                · {{ h.hora_inicio.slice(0,5) }} – {{ h.hora_fin.slice(0,5) }}
                                · Consultorio {{ h.numero_consultorio }}
                            </span>
                            <button
                                class="button button-danger"
                                type="button"
                                style="padding: 0.3rem 0.75rem; font-size: 0.82rem;"
                                @click="eliminarHorario(h.id_horario)"
                            >
                                Quitar
                            </button>
                        </div>
                    </div>
                    <p v-else style="color: var(--clarus-oxford); font-size: 0.9rem; margin-bottom: 0.75rem;">
                        No hay horarios registrados.
                    </p>

                    <div class="form-grid" style="background: #f8fafc; border-radius: 12px; padding: 1rem;">
                        <label>
                            <span>Día</span>
                            <select v-model="nuevoHorario.dia_semana" class="input">
                                <option v-for="d in diasSemana" :key="d.valor" :value="d.valor">{{ d.label }}</option>
                            </select>
                        </label>
                        <label>
                            <span>Consultorio</span>
                            <select v-model="nuevoHorario.id_consultorio" class="input">
                                <option disabled :value="0">Selecciona</option>
                                <option v-for="c in consultorios" :key="c.id_consultorio" :value="c.id_consultorio">
                                    Consultorio {{ c.numero }}
                                </option>
                            </select>
                        </label>
                        <label>
                            <span>Hora inicio</span>
                            <input v-model="nuevoHorario.hora_inicio" class="input" type="time" />
                        </label>
                        <label>
                            <span>Hora fin</span>
                            <input v-model="nuevoHorario.hora_fin" class="input" type="time" />
                        </label>
                        <div class="full-row">
                            <div v-if="errorHorario" class="alert alert-danger" style="margin-bottom: 0.5rem;">{{ errorHorario }}</div>
                            <button class="button" type="button" @click="agregarHorario" style="width: 100%;">
                                + Agregar horario
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="modalError" class="alert alert-danger">{{ modalError }}</div>

                <div class="modal-actions">
                    <button v-if="modoEdicion" class="button button-danger" type="button" @click="abrirEliminar">
                        Eliminar
                    </button>
                    <div style="flex: 1"></div>
                    <button class="button button-white" type="button" @click="modalAbierto = false">Cancelar</button>
                    <button class="button" type="button" :disabled="guardando" @click="guardar">
                        {{ guardando ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Registrar' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="modalEliminar" class="modal-backdrop-custom" @click.self="modalEliminar = false">
            <div class="modal-custom" style="max-width: 480px">
                <div class="modal-custom-header">
                    <h3>Eliminar doctor</h3>
                    <button class="btn-close-custom" @click="modalEliminar = false">✕</button>
                </div>
                <p style="color: var(--clarus-oxford)">
                    Esta acción es irreversible. Para confirmar escribe el nombre completo:
                    <strong>{{ form.nombre }} {{ form.apellido_paterno }}</strong>
                </p>
                <input v-model="confirmNombre" class="input" type="text" placeholder="Escribe el nombre exacto..." />
                <div v-if="errorEliminar" class="alert alert-danger">{{ errorEliminar }}</div>
                <div class="modal-actions">
                    <button class="button button-white" type="button" @click="modalEliminar = false">Cancelar</button>
                    <button class="button button-danger" type="button" :disabled="eliminando" @click="eliminar">
                        {{ eliminando ? 'Eliminando...' : 'Confirmar eliminación' }}
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

const API = 'http://localhost:3001/api'

const doctores   = ref<any[]>([])
const sucursales = ref<any[]>([])
const horarios       = ref<any[]>([])
const consultorios   = ref<any[]>([])
const busqueda    = ref('')
const modalAbierto = ref(false)
const modoEdicion  = ref(false)
const modalError   = ref('')
const guardando    = ref(false)
const confirmNombre   = ref('')
const modalEliminar   = ref(false)
const eliminando      = ref(false)
const errorEliminar   = ref('')

const diasSemana = [
    { valor: 0, label: 'Domingo' },
    { valor: 1, label: 'Lunes' },
    { valor: 2, label: 'Martes' },
    { valor: 3, label: 'Miércoles' },
    { valor: 4, label: 'Jueves' },
    { valor: 5, label: 'Viernes' },
    { valor: 6, label: 'Sábado' },
]

const nuevoHorario = reactive({
    dia_semana:    1,
    hora_inicio:   '',
    hora_fin:      '',
    id_consultorio: 0
})

const errorHorario = ref('')

const cargarHorarios = async (id_doctor: number) => {
    const res  = await fetch(`${API}/horario/doctor/${id_doctor}`)
    const data = await res.json()
    if (Array.isArray(data)) horarios.value = data
}

const cargarConsultorios = async (id_sucursal: number) => {
    const res  = await fetch(`${API}/consultorio`)
    const data = await res.json()
    if (Array.isArray(data)) {
        consultorios.value = data.filter((c: any) => c.id_sucursal === id_sucursal)
    }
}

const agregarHorario = async () => {
    errorHorario.value = ''
    if (!nuevoHorario.hora_inicio || !nuevoHorario.hora_fin || !nuevoHorario.id_consultorio) {
        errorHorario.value = 'Completa todos los campos del horario.'
        return
    }
    const res  = await fetch(`${API}/horario`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            id_doctor:      form.id_doctor,
            id_consultorio: nuevoHorario.id_consultorio,
            dia_semana:     nuevoHorario.dia_semana,
            hora_inicio:    `${nuevoHorario.hora_inicio}:00`,
            hora_fin:       `${nuevoHorario.hora_fin}:00`
        })
    })
    const data = await res.json()
    if (data.error) {
        errorHorario.value = typeof data.error === 'string' ? data.error : 'Error al agregar horario.'
        return
    }
    await cargarHorarios(form.id_doctor)
    Object.assign(nuevoHorario, { dia_semana: 1, hora_inicio: '', hora_fin: '', id_consultorio: 0 })
}

const eliminarHorario = async (id_horario: number) => {
    await fetch(`${API}/horario`, {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id_horario })
    })
    await cargarHorarios(form.id_doctor)
}

const form = reactive({
    id_doctor:         0,
    id_usuario:        0,
    nombre:            '',
    apellido_paterno:  '',
    apellido_materno:  '',
    correo:            '',
    telefono:          '',
    contraseña:        '',
    especialidad:      '',
    rfc:               '',
    cedula_profesional:'',
    tarifa_consulta:   0,
    id_sucursal:       0
})

const doctoresFiltrados = computed(() => {
    const q = busqueda.value.toLowerCase()
    if (!q) return doctores.value
    return doctores.value.filter(d =>
        `${d.nombre} ${d.apellido_paterno} ${d.apellido_materno ?? ''}`.toLowerCase().includes(q)
    )
})

const nombreSucursal = (id: number) =>
    sucursales.value.find(s => s.id_sucursal === id)?.nombre ?? '–'

const cargarDatos = async () => {
    const [resDoctores, resSucursales] = await Promise.all([
        fetch(`${API}/doctor`),
        fetch(`${API}/sucursal`)
    ])
    const dataDoctores   = await resDoctores.json()
    const dataSucursales = await resSucursales.json()
    if (Array.isArray(dataDoctores))   doctores.value   = dataDoctores
    if (Array.isArray(dataSucursales)) sucursales.value = dataSucursales
}

const abrirCrear = () => {
    modoEdicion.value  = false
    modalError.value   = ''
    horarios.value     = []
    consultorios.value = []
    Object.assign(form, {
        id_doctor: 0, id_usuario: 0, nombre: '', apellido_paterno: '',
        apellido_materno: '', correo: '', telefono: '', contraseña: '',
        especialidad: '', rfc: '', cedula_profesional: '',
        tarifa_consulta: 0, id_sucursal: 0
    })
    modalAbierto.value = true
}

const abrirEditar = async (d: any) => {
    modoEdicion.value = true
    modalError.value  = ''
    Object.assign(form, {
        id_doctor:          d.id_doctor,
        id_usuario:         d.id_usuario,
        nombre:             d.nombre             ?? '',
        apellido_paterno:   d.apellido_paterno   ?? '',
        apellido_materno:   d.apellido_materno   ?? '',
        correo:             d.correo             ?? '',
        telefono:           d.telefono           ?? '',
        contraseña:         '',
        especialidad:       d.especialidad       ?? '',
        rfc:                d.rfc                ?? '',
        cedula_profesional: d.cedula_profesional ?? '',
        tarifa_consulta:    Number(d.tarifa_consulta),
        id_sucursal:        d.id_sucursal
    })
    modalAbierto.value = true
    await cargarHorarios(d.id_doctor)
    await cargarConsultorios(d.id_sucursal)
}

const abrirEliminar = () => {
    confirmNombre.value = ''
    errorEliminar.value = ''
    modalEliminar.value = true
}

const eliminar = async () => {
    const nombreCompleto = `${form.nombre} ${form.apellido_paterno}`.trim()
    if (confirmNombre.value.trim() !== nombreCompleto) {
        errorEliminar.value = 'El nombre no coincide.'
        return
    }
    eliminando.value = true
    try {
        const res  = await fetch(`${API}/doctor`, {
            method:  'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id_doctor: form.id_doctor })
        })
        const data = await res.json()
        if (data.error) {
            errorEliminar.value = typeof data.error === 'string' ? data.error : 'Error al eliminar.'
            return
        }
        modalEliminar.value = false
        modalAbierto.value  = false
        await cargarDatos()
    } catch {
        errorEliminar.value = 'No se pudo conectar con el servidor.'
    } finally {
        eliminando.value = false
    }
}

const guardar = async () => {
    modalError.value = ''

    if (!form.nombre.trim() || form.nombre.length < 2) {
        modalError.value = 'El nombre debe tener al menos 2 caracteres.'
        return
    }
    if (!form.apellido_paterno.trim() || form.apellido_paterno.length < 2) {
        modalError.value = 'El apellido paterno debe tener al menos 2 caracteres.'
        return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
        modalError.value = 'El correo no tiene un formato válido.'
        return
    }
    if (form.telefono && !/^\d{10,15}$/.test(form.telefono)) {
        modalError.value = 'El teléfono debe tener entre 10 y 15 dígitos numéricos.'
        return
    }
    if (!modoEdicion.value && form.contraseña.length < 6) {
        modalError.value = 'La contraseña debe tener al menos 6 caracteres.'
        return
    }
    if (!form.especialidad.trim()) {
        modalError.value = 'La especialidad es requerida.'
        return
    }
    if (form.tarifa_consulta <= 0) {
        modalError.value = 'La tarifa debe ser mayor a 0.'
        return
    }
    if (!form.id_sucursal) {
        modalError.value = 'Selecciona una sucursal.'
        return
    }

    guardando.value = true
    try {
        const body = modoEdicion.value
            ? {
                id_doctor:          form.id_doctor,
                id_usuario:         form.id_usuario,
                nombre:             form.nombre,
                apellido_paterno:   form.apellido_paterno,
                apellido_materno:   form.apellido_materno,
                correo:             form.correo,
                telefono:           form.telefono,
                especialidad:       form.especialidad,
                rfc:                form.rfc,
                cedula_profesional: form.cedula_profesional,
                tarifa_consulta:    form.tarifa_consulta,
                id_sucursal:        form.id_sucursal,
                ...(form.contraseña ? { contraseña: form.contraseña } : {})
            }
            : { ...form }

        const res  = await fetch(`${API}/doctor`, {
            method:  modoEdicion.value ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(body)
        })
        const data = await res.json()
        if (data.error) {
            if (data.error.name === 'ZodError') {
                try {
                    const errores = JSON.parse(data.error.message)
                    const mensajes: Record<string, string> = {
                        nombre:             'El nombre debe tener al menos 2 caracteres.',
                        apellido_paterno:   'El apellido paterno debe tener al menos 2 caracteres.',
                        apellido_materno:   'El apellido materno es demasiado largo.',
                        correo:             'El correo no tiene un formato válido.',
                        telefono:           'El teléfono debe tener entre 10 y 15 dígitos.',
                        contraseña:         'La contraseña debe tener al menos 6 caracteres.',
                        especialidad:       'La especialidad debe tener al menos 2 caracteres.',
                        rfc:                'El RFC no tiene un formato válido.',
                        cedula_profesional: 'La cédula debe tener entre 5 y 20 caracteres.',
                        tarifa_consulta:    'La tarifa debe ser mayor a 0.',
                        id_sucursal:        'Selecciona una sucursal válida.',
                    }
                    modalError.value = errores
                        .map((e: any) => mensajes[e.path?.[0]] ?? `${e.path?.[0]}: ${e.message}`)
                        .join(' • ')
                } catch {
                    modalError.value = 'Error de validación al guardar.'
                }
            } else {
                modalError.value = typeof data.error === 'string' ? data.error : 'Error al guardar.'
            }
            return
        }
        if (!modoEdicion.value) {
            await cargarDatos()
            const doctorNuevo = doctores.value.find(d => d.correo === form.correo)
            if (doctorNuevo) {
                await abrirEditar(doctorNuevo)
            }
        } else {
            modalAbierto.value = false
            await cargarDatos()
        }
    } catch {
        modalError.value = 'No se pudo conectar con el servidor.'
    } finally {
        guardando.value = false
    }
}

onMounted(cargarDatos)
</script>

<style scoped>
.admin-view {
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

.card {
    background: var(--clarus-ivory);
    border-radius: 18px;
    box-shadow: 0 8px 24px var(--clarus-shadow);
    padding: 1.25rem 1.25rem;
    display: grid;
    gap: 0.5rem;
    border: none;
    overflow: hidden;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    background: #f1f5f9;
    border-radius: 10px;
    padding: 0.75rem 0.5rem;
    border: none !important;
}


.card-body {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
}

.campo { display: grid; gap: 0.2rem; }

.campo-label {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--clarus-oxford);
}

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

.button-danger {
    background: #b42318;
    border-color: #b42318;
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

.full-row { grid-column: 1 / -1; }

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