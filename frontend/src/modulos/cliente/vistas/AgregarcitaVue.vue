<template>
	<section class="agregar-cita-view">
		<h2>Nueva cita</h2>

		<form class="form-card" @submit.prevent="guardarCita">

			<div class="field-row">
				<label>
					<span>Especialidad</span>
					<select v-model="form.especialidad_filtro" required>
						<option disabled value="">Selecciona una especialidad</option>
						<option v-for="e in especialidades" :key="e" :value="e">
							{{ e }}
						</option>
					</select>
				</label>

				<label>
					<span>Médico</span>
					<select v-model="form.id_doctor" :disabled="!form.especialidad_filtro" required>
						<option disabled value="">
							{{ form.especialidad_filtro ? 'Selecciona un médico' : 'Elige especialidad primero' }}
						</option>
						<option v-for="d in doctoresFiltrados" :key="d.id_doctor" :value="d.id_doctor">
							Dr. {{ d.nombre }} {{ d.apellido_paterno }}
						</option>
					</select>
				</label>

				<label>
					<span>Sucursal</span>
					<select
						v-if="sucursalesDoctor.length > 1"
						v-model="form.id_sucursal"
						required
					>
						<option disabled value="">Selecciona una sucursal</option>
						<option v-for="s in sucursalesDoctor" :key="s.id_sucursal" :value="s.id_sucursal">
							{{ s.nombre }}
						</option>
					</select>
					<input
						v-else
						:value="sucursalesDoctor[0]?.nombre ?? ''"
						type="text"
						disabled
					/>
				</label>
			</div>
			<div v-if="horarios.length > 0" class="horario-info">
				<p class="horario-titulo">Horario de atención</p>
				<div class="horario-tags">
					<span v-for="h in horarios" :key="h.id_horario" class="horario-tag">
						{{ diasSemana[h.dia_semana] }}
						{{ formatHora(h.hora_inicio) }} – {{ formatHora(h.hora_fin) }}
						· Consultorio {{ h.numero_consultorio }}
					</span>
				</div>
			</div>

			<div class="field-row">
				<label>
					<span>Qué día</span>
					<input v-model="form.fecha" type="date" required />
				</label>

				<label>
					<span>A qué hora</span>
					<input v-model="form.hora_inicio" type="time" required />
				</label>

				<label>
					<span>Consultorio asignado</span>
					<input
						v-if="consultorioAutoAsignado"
						:value="`Consultorio ${consultorioAutoAsignado.numero_consultorio}`"
						type="text"
						disabled
						style="background: #f0fdf4; color: #166534; border-color: #bbf7d0;"
					/>
					<input
						v-else
						value="Se asigna al elegir día y hora"
						type="text"
						disabled
					/>
				</label>

				<label class="full-width">
					<span>Duración de la cita</span>
					<input
						type="range"
						v-model="form.duracion"
						min="30"
						max="120"
						step="30"
						class="form-range mt-1"
					/>
					<div class="d-flex justify-content-between">
						<small>30 min</small>
						<small>1 hora</small>
						<small>1h 30min</small>
						<small>2 horas</small>
					</div>
					<p class="text-center fw-bold mb-0">{{ form.duracion }} minutos</p>
				</label>
			</div>


			<div class="field-row">
				<label>
					<span>Motivo de consulta</span>
					<input v-model.trim="form.motivo_consulta" type="text" placeholder="Describe brevemente el motivo" required maxlength="500" />
				</label>

				<label>
					<span>Nombre del paciente</span>
					<div style="position: relative">
						<input
							v-if="esRecepcionista"
							v-model="busquedaPaciente"
							type="text"
							placeholder="Buscar paciente..."
							@focus="mostrarSugerencias = true"
							@blur="mostrarSugerencias = false"
						/>
						<input
							v-else
							:value="nombrePaciente"
							type="text"
							disabled
						/>
						<div v-if="mostrarSugerencias && sugerencias.length > 0" class="sugerencias-list">
							<button
								v-for="p in sugerencias"
								:key="p.id_paciente"
								type="button"
								class="sugerencia-item"
								@mousedown.prevent="seleccionarPaciente(p)"
							>
								{{ p.nombre }} {{ p.apellido_paterno }} {{ p.apellido_materno ?? '' }}
							</button>
						</div>
					</div>
				</label>

			</div>

			<!-- PACIENTE -->
			<div v-if="!esRecepcionista && costoTotal > 0" class="payment-section">
				<h3>Pago de anticipo requerido</h3>
				<p>Para confirmar tu cita debes pagar el 50% de anticipo.
				<strong>Total a pagar ahora: ${{ (costoTotal * 0.5).toFixed(2) }}</strong>
				</p>

				<div class="field-row">
					<label>
						<span>Método de pago</span>
						<select v-model="form.metodo_pago" required>
							<option disabled value="">Selecciona una opción</option>
							<option>Tarjeta</option>
							<option value="Saldo" :disabled="saldoPaciente < costoTotal * 0.5">
								Saldo disponible (${{ saldoPaciente.toFixed(2) }})
							</option>
						</select>
					</label>
				</div>

				<div v-if="form.metodo_pago === 'Tarjeta'" class="field-row">
					<label>
						<span>Tipo de tarjeta</span>
						<select v-model="tarjeta.tipo" required>
							<option disabled value="">Selecciona</option>
							<option>Crédito</option>
							<option>Débito</option>
						</select>
					</label>
					<label>
						<span>Número de tarjeta</span>
						<input v-model="tarjeta.numero" type="text" placeholder="1234 5678 9012 3456" maxlength="19" required />
					</label>
					<label>
						<span>Nombre en la tarjeta</span>
						<input v-model="tarjeta.titular" type="text" placeholder="Nombre del titular" required />
					</label>
				</div>
				<div v-if="form.metodo_pago === 'Tarjeta'" class="field-row">
					<label>
						<span>Mes de vencimiento</span>
						<select v-model="tarjeta.mes" required>
							<option disabled value="">Mes</option>
							<option v-for="m in 12" :key="m" :value="String(m).padStart(2,'0')">{{ String(m).padStart(2,'0') }}</option>
						</select>
					</label>
					<label>
						<span>Año de vencimiento</span>
						<select v-model="tarjeta.anio" required>
							<option disabled value="">Año</option>
							<option v-for="y in 10" :key="y" :value="2026 + y - 1">{{ 2026 + y - 1 }}</option>
						</select>
					</label>
					<label>
						<span>Código de seguridad</span>
						<input v-model="tarjeta.cvv" type="text" placeholder="CVV" maxlength="4" required />
					</label>
				</div>
			</div>

			<!-- RECEPCIONISTA -->
			<div v-if="esRecepcionista && costoTotal > 0">
				<div class="field-row">
					<label>
						<span>Método de pago (anticipo 50%: ${{ (costoTotal * 0.5).toFixed(2) }})</span>
						<select v-model="form.metodo_pago">
							<option disabled value="">Selecciona una opción</option>
							<option v-for="m in metodosPago" :key="m" :value="m">{{ m }}</option>
							<option value="Saldo" :disabled="saldoPaciente < costoTotal * 0.5">
								Saldo disponible (${{ saldoPaciente.toFixed(2) }})
							</option>
						</select>
					</label>
				</div>
				<div v-if="form.metodo_pago === 'Tarjeta'" class="payment-section">
					<h3>Información de tarjeta</h3>
					<div class="field-row">
						<label>
							<span>Tipo de tarjeta</span>
							<select v-model="tarjeta.tipo">
								<option disabled value="">Selecciona</option>
								<option>Crédito</option>
								<option>Débito</option>
							</select>
						</label>
						<label>
							<span>Número de tarjeta</span>
							<input v-model="tarjeta.numero" type="text" placeholder="1234 5678 9012 3456" maxlength="19" />
						</label>
						<label>
							<span>Nombre en la tarjeta</span>
							<input v-model="tarjeta.titular" type="text" placeholder="Nombre del titular" />
						</label>
					</div>
					<div class="field-row">
						<label>
							<span>Mes vencimiento</span>
							<select v-model="tarjeta.mes">
								<option disabled value="">Mes</option>
								<option v-for="m in 12" :key="m" :value="String(m).padStart(2,'0')">{{ String(m).padStart(2,'0') }}</option>
							</select>
						</label>
						<label>
							<span>Año vencimiento</span>
							<select v-model="tarjeta.anio">
								<option disabled value="">Año</option>
								<option v-for="y in 10" :key="y" :value="2026 + y - 1">{{ 2026 + y - 1 }}</option>
							</select>
						</label>
						<label>
							<span>CVV</span>
							<input v-model="tarjeta.cvv" type="text" placeholder="CVV" maxlength="4" />
						</label>
					</div>
				</div>
			</div>

			<div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
			<div v-if="exito" class="alert alert-success" role="alert">{{ exito }}</div>

			<div class="actions">
				<RouterLink class="button button-white" :to="{ name: 'citas' }">Cancelar</RouterLink>
				<button class="button" type="submit" :disabled="cargando">
					{{ cargando ? 'Guardando...' : 'Guardar cita' }}
				</button>
			</div>

		</form>
	</section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRouter,useRoute } from 'vue-router'
import { useSesion } from '@/modulos/principal/controladores/useSesion'

const router   = useRouter()
const route = useRoute()
const { usuarioActual, rolUsuario  } = useSesion()

// ── Datos del paciente (readonly) ──────────────────────────────
const nombrePaciente = computed(() => {
	const u = usuarioActual.value
	if (!u) return ''
	return `${u.nombre} ${u.apellido_paterno} ${u.apellido_materno ?? ''}`.trim()
})

const esRecepcionista = computed(() => rolUsuario.value === 'recepcionista')


// ── Catálogos ──────────────────────────────────────────────────
type Doctor = {
	id_doctor:       number
	nombre:          string      
	apellido_paterno: string       
	especialidad:    string
	tarifa_consulta: number
    sucursales:         number[]
}

type Consultorio = {
	id_consultorio: number
	numero:         string
	piso:           string
	descripcion:    string
    id_sucursal:    number
}

type Sucursal = {
	id_sucursal: number
	nombre:      string
}

type HorarioDoctor = {
	id_horario:   number
	dia_semana:   number
	hora_inicio:  string
	hora_fin:     string
	numero_consultorio: string
	id_consultorio:     number
}

const horarios = ref<HorarioDoctor[]>([])

const diasSemana: Record<number, string> = {
	1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
	4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
}

const formatHora = (hora: string) => hora.slice(0, 5)

const tarjeta = reactive({
	tipo:    '',
	numero:  '',
	titular: '',
	mes:     '',
	anio:    '',
	cvv:     '',
})
const sucursales = ref<Sucursal[]>([])
const doctores     = ref<Doctor[]>([])
const consultorios = ref<Consultorio[]>([])
const pacientes          = ref<any[]>([])
const busquedaPaciente   = ref('')
const mostrarSugerencias = ref(false)
const pacienteSeleccionado = ref<any>(null)


const sugerencias = computed(() => {
    if (!busquedaPaciente.value.trim()) return []
    
    const normalizar = (str: string) => str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

    const q = normalizar(busquedaPaciente.value)
    return pacientes.value.filter(p =>
        normalizar(`${p.nombre} ${p.apellido_paterno} ${p.apellido_materno ?? ''}`).includes(q)
    ).slice(0, 6)
})

const seleccionarPaciente = (p: any) => {
    pacienteSeleccionado.value = p
    busquedaPaciente.value     = `${p.nombre} ${p.apellido_paterno}`
    mostrarSugerencias.value   = false
    form.id_paciente           = p.id_paciente  // ← agrega este campo al form también
}

// Autoasigna el consultorio según el día y hora seleccionados
const consultorioAutoAsignado = computed(() => {
    if (!form.fecha || !form.hora_inicio || !horarios.value.length) return null

    const diaSemana = new Date(`${form.fecha}T00:00:00`).getDay()
    const horaSeleccionada = `${form.hora_inicio}:00`

    return horarios.value.find(h =>
        h.dia_semana === diaSemana &&
        horaSeleccionada >= h.hora_inicio &&
        horaSeleccionada < h.hora_fin
    ) ?? null
})

onMounted(async () => {
	if (route.query.id_paciente) {
		form.id_paciente       = Number(route.query.id_paciente)
		busquedaPaciente.value = String(route.query.nombre_paciente ?? '')
		
		// Busca el paciente completo para tener el saldo
		const res  = await fetch(`http://localhost:3001/api/paciente/${route.query.id_paciente}`)
		const data = await res.json()
		const p    = Array.isArray(data) ? data[0] : data
		pacienteSeleccionado.value = p ?? { id_paciente: Number(route.query.id_paciente) }
	}
    try {
        const [resDoctores, resConsultorios, resSucursales] = await Promise.all([
            fetch('http://localhost:3001/api/doctor'),
            fetch('http://localhost:3001/api/consultorio'),
            fetch('http://localhost:3001/api/sucursal'),
        ])
        doctores.value     = await resDoctores.json()
        consultorios.value = await resConsultorios.json()
        sucursales.value   = await resSucursales.json()

        if (esRecepcionista.value) {
            const res  = await fetch('http://localhost:3001/api/paciente')
            const data = await res.json()
            if (Array.isArray(data)) pacientes.value = data
        }
    } catch {
        error.value = 'No se pudo cargar la información del servidor.'
    }
})


// ── Formulario ─────────────────────────────────────────────────
const form = reactive({
    especialidad_filtro: '',
    id_sucursal:         '',
    id_doctor:           '',
    id_consultorio:      '',
    fecha:               '',
    hora_inicio:         '',
    motivo_consulta:     '',
    metodo_pago:         '',
    duracion:            30,
    id_paciente:         0,
})

const error   = ref('')
const exito   = ref('')
const cargando = ref(false)

// Especialidades únicas de todos los doctores
const especialidades = computed(() => {
    const set = new Set(doctores.value.map(d => d.especialidad).filter(Boolean))
    return Array.from(set).sort()
})

// Doctores filtrados por especialidad
const doctoresFiltrados = computed(() =>
    form.especialidad_filtro
        ? doctores.value.filter(d => d.especialidad === form.especialidad_filtro)
        : []
)

// Sucursales del doctor seleccionado
const sucursalesDoctor = computed(() => {
    if (!form.id_doctor) return []
    const doctor = doctores.value.find(d => d.id_doctor === Number(form.id_doctor))
    if (!doctor) return []
    return sucursales.value.filter(s => doctor.sucursales.includes(s.id_sucursal))
})

// Al cambiar especialidad, resetea doctor y sucursal
watch(() => form.especialidad_filtro, () => {
    form.id_doctor      = ''
    form.id_sucursal    = ''
    form.id_consultorio = ''
    horarios.value      = []
})

// Al cambiar doctor, autoselecciona sucursal si solo tiene una
watch(() => form.id_doctor, async (nuevoId) => {
    horarios.value      = []
    form.id_sucursal    = ''
    form.id_consultorio = ''
    if (!nuevoId) return

    // Si el doctor solo trabaja en una sucursal, la selecciona automáticamente
    const doctor = doctores.value.find(d => d.id_doctor === Number(nuevoId))
    if (doctor?.sucursales?.length === 1) {
        form.id_sucursal = String(doctor.sucursales[0])
    }

    try {
        const res  = await fetch(`http://localhost:3001/api/horario/doctor/${nuevoId}`)
        const data = await res.json()
        if (Array.isArray(data)) horarios.value = data
    } catch { /* silencioso */ }
})

watch(() => form.id_doctor, async (nuevoId) => {
	horarios.value = []
	if (!nuevoId) return

	try {
		const res  = await fetch(`http://localhost:3001/api/horario/doctor/${nuevoId}`)
		const data = await res.json()
		if (Array.isArray(data)) horarios.value = data
	} catch { /* silencioso */ }
})

watch(consultorioAutoAsignado, (h) => {
    form.id_consultorio = h ? String(h.id_consultorio) : ''
})

// Doctor seleccionado → autocompleta especialidad y costo
const doctorSeleccionado = computed(() =>
	doctores.value.find(d => d.id_doctor === Number(form.id_doctor)) ?? null
)

const especialidad = computed(() => doctorSeleccionado.value?.especialidad ?? '')
const costoTotal   = computed(() => doctorSeleccionado.value?.tarifa_consulta ?? 0)

// Hora fin = hora inicio + 30 minutos
const horaFin = computed(() => {
    if (!form.hora_inicio) return ''
    const partes = form.hora_inicio.split(':')
    const h = Number(partes[0] ?? 0)
    const m = Number(partes[1] ?? 0)
    const fin = new Date(0, 0, 0, h, m + Number(form.duracion))
    return `${String(fin.getHours()).padStart(2, '0')}:${String(fin.getMinutes()).padStart(2, '0')}:00`
})

const metodosPago = ['Efectivo', 'Tarjeta']

const saldoPaciente = computed(() => {
    if (esRecepcionista.value) {
        return Number(pacienteSeleccionado.value?.saldo_pendiente ?? 0)
    }
    return Number(usuarioActual.value?.saldo_pendiente ?? 0)
})

// ── Submit ─────────────────────────────────────────────────────
const guardarCita = async () => {
    error.value = ''
    exito.value = ''

    if (!form.id_doctor || !form.id_consultorio || !form.fecha || !form.hora_inicio || !form.motivo_consulta) {
        error.value = 'Completa todos los campos obligatorios.'
        return
    }

    // Paciente debe llenar datos de tarjeta
    if (!esRecepcionista.value) {
		if (!form.metodo_pago) {
			error.value = 'Selecciona un método de pago.'
			return
		}
		if (form.metodo_pago === 'Tarjeta') {
			if (!tarjeta.tipo || !tarjeta.numero || !tarjeta.titular || !tarjeta.mes || !tarjeta.anio || !tarjeta.cvv) {
				error.value = 'Completa los datos de la tarjeta para pagar el anticipo.'
				return
			}
		}
	}



    // Recepcionista debe elegir método
    if (esRecepcionista.value && !form.metodo_pago) {
        error.value = 'Selecciona un método de pago.'
        return
    }

    const fechaSeleccionada = new Date(`${form.fecha}T${form.hora_inicio}`)
    if (fechaSeleccionada <= new Date()) {
        error.value = 'La fecha y hora deben ser futuras.'
        return
    }

	if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(form.motivo_consulta)) {
		error.value = 'El motivo de consulta debe contener texto descriptivo, no solo números.'
		return
	}

	if (form.motivo_consulta.length < 5) {
		error.value = 'El motivo de consulta debe tener al menos 5 caracteres.'
		return
	}

    cargando.value = true

    try {
        const respuesta = await fetch('http://localhost:3001/api/cita', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
				id_paciente: esRecepcionista.value
					? Number(pacienteSeleccionado.value?.id_paciente)
					: usuarioActual.value?.id_paciente,
				id_doctor:        Number(form.id_doctor),
				id_consultorio:   Number(form.id_consultorio),
				id_recepcionista: esRecepcionista.value 
					? Number(usuarioActual.value?.id_recepcionista) 
					: null,
				fecha:            form.fecha,
				hora_inicio:      `${form.hora_inicio}:00`,
				hora_fin:         horaFin.value,
				motivo_consulta:  form.motivo_consulta,
				costo_total:      Number(costoTotal.value),
				registrado_por:   usuarioActual.value?.id_usuario,
				metodo_pago: form.metodo_pago,
				referencia:       null,
			}),
        })

        const datos = await respuesta.json()

        if (datos.error) {
            error.value = typeof datos.error === 'string'
                ? datos.error
                : 'Error al guardar la cita.'
            return
        }

        exito.value = 'Cita registrada correctamente. Redirigiendo...'
        setTimeout(() => void router.push({ name: 'citas' }), 1500)

    } catch {
        error.value = 'No se pudo conectar con el servidor.'
    } finally {
        cargando.value = false
    }
}
</script>

<style scoped>
    .page-shell {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    }
    .page-title {
    margin: 0 0 1rem;
    color: var(--clarus-midnight);
    }
    .form-card {
    background: var(--clarus-ivory);
    border-radius: 20px;
    box-shadow: 0 18px 45px var(--clarus-shadow);
    padding: 1.75rem;
    }
    .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    }
    label {
    display: grid;
    gap: 0.45rem;
    font-weight: 600;
    color: var(--clarus-midnight);
    }
    label span {
    font-size: 0.95rem;
    }
    input,
    select {
    width: 100%;
    border-radius: 14px;
    border: 1px solid var(--clarus-border);
    padding: 0.85rem 1rem;
    font: inherit;
    }
    .full-width {
    grid-column: 1 / -1;
    }
    .payment-card {
    border: 1px solid var(--clarus-gold-soft);
    border-radius: 18px;
    padding: 1.25rem;
    background: var(--clarus-ivory);
    }
    .payment-card__header {
    margin-bottom: 1rem;
    }
    .payment-card__header h2,
    .payment-card__header p {
    margin: 0;
    }
    .payment-card__header p {
    color: var(--clarus-oxford);
    margin-top: 0.35rem;
    }
    .payment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    }
    .button {
    background: var(--clarus-midnight);
    color: var(--clarus-ivory);
    border: 1px solid var(--clarus-midnight);
    border-radius: 999px;
    padding: 0.85rem 1.4rem;
    text-decoration: none;
    font-weight: 700;
    cursor: pointer;
    }
    .button-white {
    background: var(--clarus-ivory);
    color: var(--clarus-midnight);
    }
    .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
    }
    .feedback {
    margin: 1rem 0 0;
    font-weight: 600;
    }
    .error {
    color: #b91c1c;
    }
    .success {
    color: #15803d;
    }

	.sugerencias-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--clarus-ivory);
    border: 1px solid var(--clarus-gold-soft);
    border-radius: 12px;
    box-shadow: 0 8px 24px var(--clarus-shadow);
    z-index: 50;
    max-height: 200px;
    overflow-y: auto;
}

.sugerencia-item {
    display: block;
    width: 100%;
    padding: 0.65rem 1rem;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font: inherit;
    color: var(--clarus-midnight);
}

.sugerencia-item:hover {
    background: var(--clarus-gold-soft);
}

    @media (max-width: 768px) {
    .actions {
        flex-direction: column;
        align-items: stretch;
    }
    }

    .agregar-cita-view {
	max-width: 1000px;
	margin: 2rem auto;
	padding: 0 1.5rem;
}

h2 {
	margin-bottom: 1.5rem;
}

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

label {
	display: grid;
	gap: 0.35rem;
	font-size: 0.94rem;
	color: var(--clarus-midnight);
}

label span {
	font-weight: 500;
}

input,
select {
	padding: 0.72rem;
	border-radius: 10px;
	border: 1px solid var(--clarus-border);
	font-size: 1rem;
	min-height: 44px;
	width: 100%;
}

input:disabled,
select:disabled {
	background: #f5f5f5;
	color: #888;
}

.form-range::-webkit-slider-thumb {
    background-color: var(--clarus-midnight);
}
.form-range::-moz-range-thumb {
    background-color: var(--clarus-midnight);
}

.actions {
	display: flex;
	justify-content: flex-end;
	gap: 1rem;
	margin-top: 0.5rem;
}

.feedback {
	margin: 0;
	padding: 0.6rem 0.8rem;
	border-radius: 8px;
	font-size: 0.9rem;
}

.form-range {
    width: 100%;
    padding: 0;
    border: none;
    background: transparent;
}

.horario-info {
	background: #f0fdf4;
	border: 1px solid #bbf7d0;
	border-radius: 10px;
	padding: 0.8rem 1rem;
}

.horario-titulo {
	font-weight: 600;
	font-size: 0.9rem;
	color: #166534;
	margin: 0 0 0.5rem;
}

.horario-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
}

.horario-tag {
	background: #dcfce7;
	color: #166534;
	border-radius: 999px;
	padding: 0.25rem 0.75rem;
	font-size: 0.85rem;
	font-weight: 500;
}


@media (max-width: 768px) {
	.field-row {
		grid-template-columns: 1fr;
	}
}
</style>