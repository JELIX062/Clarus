<template>
    <section class="admin-view">
        <header class="header">
            <div>
                <h1>Sucursales</h1>
                <p class="subtitle">Gestiona las sucursales de Clarus.</p>
            </div>
            <button class="button" type="button" @click="abrirCrear">
                + Registrar nuevo
            </button>
        </header>

        <div class="filters">
            <input v-model="busqueda" class="input" type="search" placeholder="Busca por nombre..." />
        </div>

        <div v-if="sucursalesFiltradas.length === 0" class="empty-state">
            No se encontraron sucursales.
        </div>

        <div class="grid">
            <article v-for="s in sucursalesFiltradas" :key="s.id_sucursal" class="card">
                <div class="card-header">
                    <h3>{{ s.nombre }}</h3>
                    <button class="button button-sm" type="button" @click="abrirEditar(s)">Editar</button>
                </div>
                <p class="meta">
                    <strong>Domicilio:</strong>
                    {{ s.codigo_postal }}, {{ s.calle }} {{ s.numero }}, {{ s.colonia }}, {{ s.ciudad }}.
                </p>
                <p class="meta"><strong>Teléfono:</strong> {{ s.telefono }}</p>
                <p class="meta"><strong>Correo:</strong> {{ s.correo }}</p>
                <span :class="s.activa ? 'badge-active' : 'badge-inactive'">
                    {{ s.activa ? 'Activa' : 'Inactiva' }}
                </span>
            </article>
        </div>

        <!-- Modal crear/editar -->
        <div v-if="modalAbierto" class="modal-backdrop-custom" @click.self="modalAbierto = false">
            <div class="modal-custom">
                <div class="modal-custom-header">
                    <h3>{{ modoEdicion ? 'Editar sucursal' : 'Nueva sucursal' }}</h3>
                    <button class="btn-close-custom" @click="modalAbierto = false">✕</button>
                </div>

                <div class="form-grid">
                    <label class="full-row">
                        <span>Nombre</span>
                        <input v-model.trim="form.nombre" class="input" type="text" placeholder="Nombre de la sucursal" />
                    </label>
                    <label>
                        <span>Calle</span>
                        <input v-model.trim="form.calle" class="input" type="text" placeholder="Calle" />
                    </label>
                    <label>
                        <span>Número</span>
                        <input v-model.trim="form.numero" class="input" type="text" placeholder="Número" />
                    </label>
                    <label>
                        <span>Colonia</span>
                        <input v-model.trim="form.colonia" class="input" type="text" placeholder="Colonia" />
                    </label>
                    <label>
                        <span>Ciudad</span>
                        <input v-model.trim="form.ciudad" class="input" type="text" placeholder="Ciudad" />
                    </label>
                    <label>
                        <span>Código postal</span>
                        <input v-model.trim="form.codigo_postal" class="input" type="text"
                            maxlength="5" pattern="\d{5}" placeholder="Código postal" />
                    </label>
                    <label>
                        <span>Teléfono</span>
                        <input v-model.trim="form.telefono" class="input" type="tel"
                            maxlength="15" placeholder="Teléfono" />
                    </label>
                    <label class="full-row">
                        <span>Correo</span>
                        <input v-model.trim="form.correo" class="input" type="email" placeholder="Correo electrónico" />
                    </label>
                    <label v-if="modoEdicion" class="full-row">
                        <span>Estado</span>
                        <select v-model="form.activa" class="input">
                            <option :value="1">Activa</option>
                            <option :value="0">Inactiva</option>
                        </select>
                    </label>
                </div>

                <!-- Consultorios (solo en edición) -->
                <div v-if="modoEdicion">
                    <h4 style="margin: 0 0 0.75rem; font-size: 1rem;">Consultorios</h4>

                    <div v-if="consultorios.length > 0" style="display: grid; gap: 0.5rem; margin-bottom: 1rem;">
                        <div
                            v-for="c in consultorios"
                            :key="c.id_consultorio"
                            style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border-radius: 10px; padding: 0.6rem 1rem;"
                        >
                            <span style="font-size: 0.9rem;">
                                <strong>Consultorio {{ c.numero }}</strong>
                                <span v-if="c.piso"> · Piso {{ c.piso }}</span>
                                <span v-if="c.descripcion"> · {{ c.descripcion }}</span>
                                <span :style="c.activo ? 'color:#166534' : 'color:#b42318'">
                                    · {{ c.activo ? 'Activo' : 'Inactivo' }}
                                </span>
                            </span>
                            <div style="display: flex; gap: 0.4rem;">
                                <button
                                    class="button button-sm"
                                    type="button"
                                    style="padding: 0.3rem 0.75rem; font-size: 0.82rem;"
                                    @click="abrirEditarConsultorio(c)"
                                >
                                    Editar
                                </button>
                                <button
                                    class="button button-danger button-sm"
                                    type="button"
                                    style="padding: 0.3rem 0.75rem; font-size: 0.82rem;"
                                    @click="eliminarConsultorio(c.id_consultorio)"
                                >
                                    Quitar
                                </button>
                            </div>
                        </div>
                    </div>
                    <p v-else style="color: var(--clarus-oxford); font-size: 0.9rem; margin-bottom: 0.75rem;">
                        No hay consultorios registrados.
                    </p>

                    <button class="button" type="button" style="width: 100%;" @click="abrirNuevoConsultorio">
                        + Agregar consultorio
                    </button>
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
                    <h3>Eliminar sucursal</h3>
                    <button class="btn-close-custom" @click="modalEliminar = false">✕</button>
                </div>
                <p style="color: var(--clarus-oxford)">
                    Esta acción es irreversible. Para confirmar, escribe el nombre de la sucursal:
                    <strong>{{ form.nombre }}</strong>
                </p>

                <div class="advertencia-eliminar">
                    <p class="advertencia-titulo">⚠️ Al eliminar esta sucursal:</p>
                    <ul>
                        <li>Todos sus <strong>consultorios</strong> serán eliminados.</li>
                        <li>Las citas asociadas a sus consultorios quedarán sin consultorio asignado.</li>
                        <li>Los horarios de doctores vinculados a sus consultorios serán eliminados.</li>
                        <li>Los doctores y recepcionistas asignados quedarán sin sucursal.</li>
                    </ul>
                </div>

                <input
                    v-model="confirmNombre"
                    class="input"
                    type="text"
                    placeholder="Escribe el nombre exacto..."
                />
                <div v-if="errorEliminar" class="alert alert-danger">{{ errorEliminar }}</div>
                <div class="modal-actions">
                    <button class="button button-white" type="button" @click="modalEliminar = false">Cancelar</button>
                    <button class="button button-danger" type="button" :disabled="eliminando" @click="eliminar">
                        {{ eliminando ? 'Eliminando...' : 'Confirmar eliminación' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="modalConsultorio" class="modal-backdrop-custom" @click.self="modalConsultorio = false">
            <div class="modal-custom" style="max-width: 480px">
                <div class="modal-custom-header">
                    <h3>{{ modoEditConsult ? 'Editar consultorio' : 'Nuevo consultorio' }}</h3>
                    <button class="btn-close-custom" @click="modalConsultorio = false">✕</button>
                </div>
                <div class="form-grid">
                    <label>
                        <span>Número</span>
                        <input v-model.trim="formConsult.numero" class="input" type="text" placeholder="Ej. 101" />
                    </label>
                    <label>
                        <span>Piso</span>
                        <input v-model.trim="formConsult.piso" class="input" type="text" placeholder="Ej. 1" maxlength="5" />
                    </label>
                    <label class="full-row">
                        <span>Descripción</span>
                        <input v-model.trim="formConsult.descripcion" class="input" type="text" placeholder="Opcional" maxlength="200" />
                    </label>
                    <label v-if="modoEditConsult" class="full-row">
                        <span>Estado</span>
                        <select v-model="formConsult.activo" class="input">
                            <option :value="1">Activo</option>
                            <option :value="0">Inactivo</option>
                        </select>
                    </label>
                </div>
                <div v-if="errorConsultorio" class="alert alert-danger">{{ errorConsultorio }}</div>
                <div class="modal-actions">
                    <button class="button button-white" type="button" @click="modalConsultorio = false">Cancelar</button>
                    <button class="button" type="button" :disabled="guardandoConsult" @click="guardarConsultorio">
                        {{ guardandoConsult ? 'Guardando...' : modoEditConsult ? 'Guardar cambios' : 'Agregar' }}
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useSesion } from '@/modulos/principal/controladores/useSesion'

const { usuarioActual } = useSesion()
const API = 'http://localhost:3001/api'

const sucursales  = ref<any[]>([])
const busqueda    = ref('')
const modalAbierto = ref(false)
const modoEdicion  = ref(false)
const modalError   = ref('')
const guardando    = ref(false)
const confirmNombre   = ref('')
const modalEliminar   = ref(false)
const eliminando      = ref(false)
const errorEliminar   = ref('')
const consultorios     = ref<any[]>([])
const modalConsultorio = ref(false)
const modoEditConsult  = ref(false)
const errorConsultorio = ref('')
const guardandoConsult = ref(false)

const formConsult = reactive({
    id_consultorio: 0,
    id_sucursal:    0,
    numero:         '',
    piso:           '',
    descripcion:    '',
    activo:         1
})

const cargarConsultorios = async (id_sucursal: number) => {
    const res  = await fetch(`${API}/consultorio`)
    const data = await res.json()
    if (Array.isArray(data)) {
        consultorios.value = data.filter((c: any) => c.id_sucursal === id_sucursal)
    }
}

const abrirNuevoConsultorio = () => {
    modoEditConsult.value  = false
    errorConsultorio.value = ''
    Object.assign(formConsult, {
        id_consultorio: 0,
        id_sucursal:    form.id_sucursal,
        numero:         '',
        piso:           '',
        descripcion:    '',
        activo:         1
    })
    modalConsultorio.value = true
}

const abrirEditarConsultorio = (c: any) => {
    modoEditConsult.value  = true
    errorConsultorio.value = ''
    Object.assign(formConsult, {
        id_consultorio: c.id_consultorio,
        id_sucursal:    c.id_sucursal,
        numero:         c.numero      ?? '',
        piso:           c.piso        ?? '',
        descripcion:    c.descripcion ?? '',
        activo:         c.activo
    })
    modalConsultorio.value = true
}

const guardarConsultorio = async () => {
    errorConsultorio.value = ''
    if (!formConsult.numero.trim()) {
        errorConsultorio.value = 'El número es requerido.'
        return
    }
    guardandoConsult.value = true
    try {
        const res  = await fetch(`${API}/consultorio`, {
            method:  modoEditConsult.value ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ ...formConsult })
        })
        const data = await res.json()
        if (data.error) {
            errorConsultorio.value = typeof data.error === 'string' ? data.error : 'Error al guardar.'
            return
        }
        modalConsultorio.value = false
        await cargarConsultorios(form.id_sucursal)
    } catch {
        errorConsultorio.value = 'No se pudo conectar con el servidor.'
    } finally {
        guardandoConsult.value = false
    }
}

const eliminarConsultorio = async (id_consultorio: number) => {
    if (!confirm('¿Seguro que deseas eliminar este consultorio?')) return
    await fetch(`${API}/consultorio`, {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id_consultorio })
    })
    await cargarConsultorios(form.id_sucursal)
}

const abrirEliminar = () => {
    confirmNombre.value = ''
    errorEliminar.value = ''
    modalEliminar.value = true
}

const eliminar = async () => {
    if (confirmNombre.value.trim() !== form.nombre.trim()) {
        errorEliminar.value = 'El nombre no coincide.'
        return
    }
    eliminando.value = true
    try {
        const res  = await fetch(`${API}/sucursal`, {
            method:  'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id_sucursal: form.id_sucursal })
        })
        const data = await res.json()
        if (data.error) {
            errorEliminar.value = typeof data.error === 'string' ? data.error : 'Error al eliminar.'
            return
        }
        modalEliminar.value = false
        modalAbierto.value  = false
        await cargarSucursales()
    } catch {
        errorEliminar.value = 'No se pudo conectar con el servidor.'
    } finally {
        eliminando.value = false
    }
}

const form = reactive({
    id_sucursal:      0,
    id_administrador: 0,
    nombre:           '',
    calle:            '',
    numero:           '',
    colonia:          '',
    ciudad:           '',
    codigo_postal:    '',
    telefono:         '',
    correo:           '',
    activa:           1
})

const sucursalesFiltradas = computed(() => {
    const q = busqueda.value.toLowerCase()
    if (!q) return sucursales.value
    return sucursales.value.filter(s => s.nombre.toLowerCase().includes(q))
})

const cargarSucursales = async () => {
    const res  = await fetch(`${API}/sucursal`)
    const data = await res.json()
    if (Array.isArray(data)) sucursales.value = data
}

const abrirCrear = () => {
    modoEdicion.value = false
    modalError.value  = ''
    Object.assign(form, {
        id_sucursal: 0, nombre: '', calle: '', numero: '',
        colonia: '', ciudad: '', codigo_postal: '',
        telefono: '', correo: '', activa: 1
    })
    consultorios.value = []
    modalAbierto.value = true
}

const abrirEditar = async(s: any) => {
    modoEdicion.value = true
    modalError.value  = ''
    
    Object.assign(form, {
        id_sucursal:   s.id_sucursal,
        id_administrador: s.id_administrador,
        nombre:        s.nombre        ?? '',
        calle:         s.calle         ?? '',
        numero:        s.numero        ?? '',
        colonia:       s.colonia       ?? '',
        ciudad:        s.ciudad        ?? '',
        codigo_postal: s.codigo_postal ?? '',
        telefono:      s.telefono      ?? '',
        correo:        s.correo        ?? '',
        activa:        s.activa
    })
    await cargarConsultorios(s.id_sucursal)
    modalAbierto.value = true
}

const guardar = async () => {
    modalError.value = ''

    if (form.numero && !/^\d+$/.test(form.numero)) {
        modalError.value = 'El número debe contener solo dígitos.'
        return
    }

    if (!form.nombre.trim() || form.nombre.length < 2) {
        modalError.value = 'El nombre debe tener al menos 2 caracteres.'
        return
    }
    if (!/^\d{5}$/.test(form.codigo_postal)) {
        modalError.value = 'El código postal debe ser exactamente 5 dígitos numéricos.'
        return
    }
    if (!/^\d{10,15}$/.test(form.telefono)) {
        modalError.value = 'El teléfono debe tener entre 10 y 15 dígitos numéricos.'
        return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
        modalError.value = 'El correo no tiene un formato válido.'
        return
    }

    guardando.value = true
    try {
        const url    = `${API}/sucursal`
        const method = modoEdicion.value ? 'PUT' : 'POST'
        const body   = modoEdicion.value
            ? { ...form }
            : {
                id_administrador: Number(usuarioActual.value?.id_administrador),
                nombre:        form.nombre,
                calle:         form.calle,
                numero:        form.numero,
                colonia:       form.colonia,
                ciudad:        form.ciudad,
                codigo_postal: form.codigo_postal,
                telefono:      form.telefono,
                correo:        form.correo
            }

        const res  = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(body)
        })
        const data = await res.json()
        if (data.error) {
            if (data.error.name === 'ZodError') {
                try {
                    const errores = JSON.parse(data.error.message)
                    const mensajes: Record<string, string> = {
                        nombre:           'El nombre debe tener al menos 2 caracteres.',
                        calle:            'La calle debe tener al menos 2 caracteres.',
                        numero:           'El número es demasiado largo (máx. 10).',
                        colonia:          'La colonia debe tener al menos 2 caracteres.',
                        ciudad:           'La ciudad debe tener al menos 2 caracteres.',
                        codigo_postal:    'El código postal debe tener exactamente 5 dígitos numéricos.',
                        telefono:         'El teléfono debe tener entre 10 y 15 dígitos numéricos.',
                        correo:           'El correo no tiene un formato válido.',
                        id_administrador: 'Error interno: falta el administrador.',
                        activa:           'El estado debe ser Activa o Inactiva.',
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
        modalAbierto.value = false
        await cargarSucursales()
    } catch {
        modalError.value = 'No se pudo conectar con el servidor.'
    } finally {
        guardando.value = false
    }
}

onMounted(cargarSucursales)
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

.meta {
    font-size: 0.9rem;
    color: var(--clarus-oxford);
}

.badge-active {
    background: #dcfce7;
    color: #166534;
    border-radius: 999px;
    padding: 0.2rem 0.75rem;
    font-size: 0.82rem;
    font-weight: 600;
    width: fit-content;
}

.badge-inactive {
    background: #fee2e2;
    color: #b42318;
    border-radius: 999px;
    padding: 0.2rem 0.75rem;
    font-size: 0.82rem;
    font-weight: 600;
    width: fit-content;
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

.button-danger {
    background: #b42318;
    border-color: #b42318;
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
    .form-grid { grid-template-columns: 1fr; }
}
</style>