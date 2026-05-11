<template>
	<section class="recetas-view">

		<div class="page-header">
			<div>
				<h2>Mis recetas médicas</h2>
				<p class="subtitle">Tratamientos e indicaciones registrados en tus consultas.</p>
			</div>
		</div>

		<div v-if="cargando" class="empty-state">Cargando...</div>

		<div v-else-if="error" class="empty-state">{{ error }}</div>

		<template v-else>

			<!-- Info general del expediente -->
			<div v-if="expediente" class="info-row">
				<span class="tag">Expediente #{{ expediente.codigo }}</span>
				<span v-if="expediente.alergias" class="tag tag-warning">
					Alergias: {{ expediente.alergias }}
				</span>
				<span v-if="expediente.medicamentos_actuales" class="tag tag-info">
					Medicamentos actuales: {{ expediente.medicamentos_actuales }}
				</span>
			</div>

			<!-- Consultas con tratamiento -->
			<div v-if="consultas.length === 0" class="empty-state">
				No hay tratamientos registrados en tus consultas.
			</div>

			<div v-for="consulta in consultas" :key="consulta.id_consulta" class="recipe-card">
				<div class="card-top">
					<div>
						<h3>{{ consulta.tratamiento || 'Sin tratamiento registrado' }}</h3>
						<p class="meta">
							Dr. {{ consulta.nombre_doctor }} {{ consulta.apellido_doctor }}
							&nbsp;·&nbsp;
							{{ formatFecha(consulta.fecha_consulta) }}
						</p>
					</div>
					<span class="tag" :class="consulta.firmada ? 'tag-active' : 'tag-warning'">
						{{ consulta.firmada ? 'Firmada' : 'Sin firmar' }}
					</span>
				</div>

				<div v-if="consulta.indicaciones" class="detail-row">
					<strong>Indicaciones:</strong> {{ consulta.indicaciones }}
				</div>

				<div v-if="consulta.motivo_consulta" class="detail-row">
					<strong>Motivo:</strong> {{ consulta.motivo_consulta }}
				</div>

				<div v-if="consulta.notas_clinicas" class="detail-row">
					<strong>Notas clínicas:</strong> {{ consulta.notas_clinicas }}
				</div>
			</div>

		</template>
	</section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSesion } from '@/modulos/principal/controladores/useSesion'

const { usuarioActual } = useSesion()

type Expediente = {
	id_expediente:         number
	codigo:                string
	ant_patologicos:       string
	medicamentos_actuales: string
	alergias:              string
}

type ConsultaFisica = {
	id_consulta:     number
	fecha_consulta:  string
	tratamiento:     string
	indicaciones:    string
	motivo_consulta: string
	notas_clinicas:  string
	firmada:         number
	nombre_doctor:   string
	apellido_doctor: string
}

const expediente = ref<Expediente | null>(null)
const consultas  = ref<ConsultaFisica[]>([])
const cargando   = ref(true)
const error      = ref('')

const formatFecha = (fecha: string): string => {
	if (!fecha) return ''
	return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(fecha))
}

onMounted(async () => {
	const idPaciente = usuarioActual.value?.id_paciente
	if (!idPaciente) {
		error.value    = 'No se encontró el paciente en sesión.'
		cargando.value = false
		return
	}

	try {
		// 1. Obtener expediente
		const respExp  = await fetch(`http://localhost:3001/api/expediente/paciente/${idPaciente}`)
		const datosExp = await respExp.json()

		// El endpoint devuelve un array, tomamos el primero
		const exp = Array.isArray(datosExp) ? datosExp[0] : datosExp

		if (!exp?.id_expediente) {
			error.value = 'No tienes un expediente registrado aún.'
			return
		}

		expediente.value = exp

		// 2. Obtener consultas físicas del expediente
		const respCon  = await fetch(`http://localhost:3001/api/consultafisica/expediente/${exp.id_expediente}`)
		const datosCon = await respCon.json()

		if (Array.isArray(datosCon)) {
			consultas.value = datosCon
		}

	} catch {
		error.value = 'No se pudo conectar con el servidor.'
	} finally {
		cargando.value = false
	}
})
</script>

<style scoped>
	.recetas-view {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 1.5rem 3rem;
		display: grid;
		gap: 1.2rem;
	}

	h2, h3, p { margin: 0; }

	.subtitle {
		color: var(--clarus-oxford);
		margin-top: 0.25rem;
	}

	.info-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		border-radius: 999px;
		padding: 0.3rem 0.8rem;
		font-size: 0.82rem;
		font-weight: 700;
		background: var(--clarus-gold-soft);
		color: var(--clarus-midnight);
	}

	.tag-active  { background: #dcfce7; color: #166534; }
	.tag-warning { background: #fef3c7; color: #92400e; }
	.tag-info    { background: #dbeafe; color: #1e40af; }

	.recipe-card {
		background: var(--clarus-ivory);
		border-radius: 18px;
		padding: 1.25rem 1.5rem;
		box-shadow: 0 18px 45px var(--clarus-shadow);
		display: grid;
		gap: 0.6rem;
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.meta {
		color: var(--clarus-oxford);
		font-size: 0.9rem;
		margin-top: 0.2rem;
	}

	.detail-row {
		font-size: 0.95rem;
		color: var(--clarus-midnight);
		border-top: 1px solid var(--clarus-gold-soft);
		padding-top: 0.5rem;
	}

	.empty-state {
		background: var(--clarus-ivory);
		border-radius: 18px;
		padding: 1.5rem;
		color: var(--clarus-oxford);
		box-shadow: 0 18px 45px var(--clarus-shadow);
	}
</style>