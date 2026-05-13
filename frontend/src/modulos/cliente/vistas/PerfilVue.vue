<template>
    <section class="perfil-view">
        <header class="header">
        <div>
            <h2>Perfil</h2>
            <p class="subtitle">{{ subtituloPerfil }}</p>
        </div>
        
        <button class="button" type="submit" form="perfil-form" :disabled="cargando">
            {{ cargando ? 'Guardando...' : 'Guardar cambios' }}
        </button>

        </header>


        <form id="perfil-form" class="profile-card" @submit.prevent="saveProfile">
            <div class="form-grid">

                <div class="form-field full-row">
                    <label for="nombre">Nombre</label>
                    <input id="nombre" v-model.trim="perfil.nombre" class="input" type="text" />
                </div>

                <div class="form-field">
                    <label for="apellido_paterno">Apellido paterno</label>
                    <input id="apellido_paterno" v-model.trim="perfil.apellido_paterno" class="input" type="text" />
                </div>

                <div class="form-field">
                    <label for="apellido_materno">Apellido materno</label>
                    <input id="apellido_materno" v-model.trim="perfil.apellido_materno" class="input" type="text" />
                </div>

                <div class="form-field full-row">
                    <label for="correo">Correo</label>
                    <input id="correo" v-model.trim="perfil.correo" class="input" type="email" />
                </div>

                <div class="form-field full-row">
                    <label for="telefono">Teléfono</label>
                    <input id="telefono" v-model.trim="perfil.telefono" class="input" type="tel" />
                </div>

                <template v-if="esPaciente">
                    <div class="form-field full-row">
                        <label for="fecha_nacimiento">Fecha de nacimiento</label>
                        <input id="fecha_nacimiento" v-model="perfil.fecha_nacimiento" class="input" type="date" />
                    </div>

                    <div class="form-field">
                        <label for="sexo">Sexo</label>
                        <select id="sexo" v-model="perfil.sexo" class="input select">
                            <option disabled value="">Selecciona una opción</option>
                            <option>Masculino</option>
                            <option>Femenino</option>
                        </select>
                    </div>

                    <div class="form-field">
                        <label for="tipo_sangre">Tipo de sangre</label>
                        <select id="tipo_sangre" v-model="perfil.tipo_sangre" class="input select">
                            <option disabled value="">Selecciona una opción</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>
                </template>

                <template v-if="esDoctor">
                    <div class="form-field full-row">
                        <label for="especialidad">Especialidad</label>
                        <input id="especialidad" v-model.trim="perfil.especialidad" class="input" type="text" disabled />
                    </div>
                </template>

                <template v-if="esRecepcionista">
                    <div class="form-field">
                        <label for="turno">Turno</label>
                        <input id="turno" v-model.trim="perfil.turno" class="input" type="text" disabled />
                    </div>
                </template>

                <div v-if="mensaje" class="alert alert-success full-row" role="alert">
                    {{ mensaje }}
                </div>

                <div v-if="error" class="alert alert-danger full-row" role="alert">
                    {{ error }}
                </div>
            </div>
        </form>

        <!-- Botón bloqueos — solo doctor -->
        <div v-if="esDoctor" class="profile-card" style="display:flex; justify-content:space-between; align-items:center">
            <div>
                <h2 style="margin:0">Bloqueos de horario</h2>
                <p class="subtitle">Gestiona los días en que no estarás disponible.</p>
            </div>
            <RouterLink class="button" :to="{ name: 'doctor-bloqueos' }">
                Gestionar bloqueos
            </RouterLink>
        </div>

    </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useSesion } from '@/modulos/principal/controladores/useSesion'
import { RouterLink } from 'vue-router'

const { rolUsuario, usuarioActual } = useSesion()

const u = usuarioActual.value

const normalizarSexo = (sexo: string): string => {
	if (sexo === 'M' || sexo === 'Masculino') return 'Masculino'
	if (sexo === 'F' || sexo === 'Femenino')  return 'Femenino'
	return ''
}

const normalizarFecha = (fecha: string): string => {
	if (!fecha) return ''
	return fecha.split('T')[0] ?? ''
}

const perfil = reactive({
	nombre:           u?.nombre                                  ?? '',
	apellido_paterno: u?.apellido_paterno                        ?? '',
	apellido_materno: (u?.apellido_materno  as string)           ?? '',
	correo:           u?.correo                                  ?? '',
	telefono:         (u?.telefono          as string)           ?? '',
	fecha_nacimiento: normalizarFecha((u?.fecha_nacimiento as string) ?? ''),
	sexo:             normalizarSexo((u?.sexo              as string) ?? ''),
	tipo_sangre:      (u?.tipo_sangre       as string)           ?? '',
	especialidad:     (u?.especialidad      as string)           ?? '',
	turno:            (u?.turno             as string)           ?? '',
})

const cargando = ref(false)
const mensaje  = ref('')
const error    = ref('')

const esPaciente      = computed(() => rolUsuario.value === 'paciente')
const esDoctor        = computed(() => rolUsuario.value === 'doctor')
const esRecepcionista = computed(() => rolUsuario.value === 'recepcionista')

const subtituloPerfil = computed(() => {
	if (esDoctor.value)        return 'Consulta tu información médica registrada.'
	if (esRecepcionista.value) return 'Consulta tu información registrada.'
	return 'Actualiza tu información personal.'
})

const validar = (): string => {
	if (!perfil.nombre.trim())
		return 'El nombre es requerido.'
	if (!perfil.apellido_paterno.trim())
		return 'El apellido paterno es requerido.'
	if (!perfil.correo.trim())
		return 'El correo es requerido.'
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.correo))
		return 'El correo no tiene un formato válido (ej: nombre@dominio.com).'
	if (!perfil.telefono.trim())
		return 'El teléfono es requerido.'
	if (!/^\d+$/.test(perfil.telefono))
		return 'El teléfono solo puede contener números.'
	if (perfil.telefono.length < 10)
		return 'El teléfono debe tener al menos 10 dígitos.'
	if (esPaciente.value) {
		if (!perfil.fecha_nacimiento)
			return 'La fecha de nacimiento es requerida.'
		if (!perfil.sexo)
			return 'El sexo es requerido.'
		if (!perfil.tipo_sangre)
			return 'El tipo de sangre es requerido.'
	}
	return ''
}

const saveProfile = async () => {
	mensaje.value = ''
	error.value   = ''

	const errorValidacion = validar()
	if (errorValidacion) {
		error.value = errorValidacion
		return
	}

	cargando.value = true

	try {
		const respuesta = await fetch('http://localhost:3001/api/paciente', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id_paciente:      u?.id_paciente,
				id_usuario:       u?.id_usuario,
				nombre:           perfil.nombre,
				apellido_paterno: perfil.apellido_paterno,
				apellido_materno: perfil.apellido_materno,
				correo:           perfil.correo,
				telefono:         perfil.telefono,
				fecha_nacimiento: perfil.fecha_nacimiento,
				sexo:             perfil.sexo === 'Masculino' ? 'M' : 'F',
				tipo_sangre:      perfil.tipo_sangre,
				saldo_pendiente:  Number(u?.saldo_pendiente ?? 0),
			}),
		})

		const datos = await respuesta.json()

		if (datos.error) {
			error.value = typeof datos.error === 'string'
				? datos.error
				: 'Error al guardar los cambios.'
			return
		}

		mensaje.value = 'Cambios guardados correctamente.'

	} catch {
		error.value = 'No se pudo conectar con el servidor.'
	} finally {
		cargando.value = false
	}
}
</script>
<style scoped>
    .perfil-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    display: grid;
    gap: 1.5rem;
    }

    .button { text-decoration: none; }

    h2,
    p {
    margin: 0;
    }

    .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    }

    .subtitle {
    margin-top: 0.35rem;
    color: var(--clarus-oxford);
    }

    .target-selector {
    background: var(--clarus-ivory);
    border-radius: 16px;
    box-shadow: 0 8px 20px var(--clarus-shadow);
    padding: 1rem;
    display: grid;
    gap: 0.4rem;
    max-width: 360px;
    }

    .profile-card {
    background: var(--clarus-ivory);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 18px 45px var(--clarus-shadow);
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

    .full-row {
    grid-column: 1 / -1;
    }

    label {
    font-weight: 700;
    color: #334155;
    }

    .input {
    border: 1px solid var(--clarus-gold-soft);
    border-radius: 12px;
    padding: 0.7rem 0.85rem;
    font: inherit;
    min-height: 46px;
    color: var(--clarus-midnight);
    }

    .input:focus {
    outline: 2px solid var(--clarus-gold);
    outline-offset: 1px;
    }

    .button {
    border: 1px solid var(--clarus-midnight);
    background: var(--clarus-midnight);
    color: var(--clarus-ivory);
    border-radius: 999px;
    padding: 0.85rem 1.4rem;
    font-weight: 700;
    cursor: pointer;
    }

    @media (max-width: 900px) {
    .header {
        flex-direction: column;
        align-items: flex-start;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }
    }
</style>
