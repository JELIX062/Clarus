<template>
	<main class="signup-view">
		<section class="signup-card" aria-labelledby="titulo-registro">
			<p class="brand">CLARUS</p>
			<h1 id="titulo-registro">Crear cuenta</h1>
			<p class="description">{{ descripcionFormulario }}</p>

			<form class="signup-form" @submit.prevent="crearCuenta">

				<label class="full-row">
					Nombre(s)
					<input v-model="formulario.nombre" type="text" placeholder="Tu nombre" required />
				</label>

				<label>
					Apellido paterno
					<input v-model="formulario.apellido_paterno" type="text" placeholder="Apellido paterno" required />
				</label>

				<label>
					Apellido materno
					<input v-model="formulario.apellido_materno" type="text" placeholder="Apellido materno" />
				</label>

				<label class="full-row">
					Correo
					<input v-model="formulario.correo" type="email" placeholder="correo@ejemplo.com" required />
				</label>

				<label class="full-row">
					Número de teléfono
					<input v-model="formulario.telefono" type="tel"  required />
				</label>

				<label class="full-row">
					Fecha de nacimiento
					<input v-model="formulario.fecha_nacimiento" type="date" required />
				</label>

				<label>
					Sexo
					<select v-model="formulario.sexo" required>
						<option disabled value="">Selecciona una opción</option>
						<option value="M">Masculino</option>
						<option value="F">Femenino</option>
					</select>
				</label>

				<label>
					Tipo de sangre
					<input v-model="formulario.tipo_sangre" type="text" required />
				</label>

				<label>
					Contraseña
					<input v-model="contrasena" type="password" placeholder="••••••••" required minlength="6" />
				</label>

				<label>
					Confirmar contraseña
					<input v-model="confirmacionContrasena" type="password" placeholder="••••••••" required minlength="6" />
				</label>

				<p v-if="error" class="error">{{ error }}</p>

				<button type="submit" :disabled="cargando">
					{{ cargando ? 'Registrando...' : textoBoton }}
				</button>

			</form>

			<p class="help">
				Ya tienes una cuenta?
				<RouterLink :to="{ name: 'inicio-sesion' }">Inicia sesion aqui</RouterLink>
			</p>
		</section>
	</main>
</template>

<script setup lang="ts">
	import { computed, reactive, ref } from 'vue'
	import { RouterLink, useRouter } from 'vue-router'
	import { useSesion } from '../controladores/useSesion'

	const router = useRouter()
	const { rolUsuario, setUsuario } = useSesion()

	const formulario = reactive({
		nombre:           '',
		apellido_paterno: '',
		apellido_materno: '',
		correo:           '',
		telefono:         '',
		fecha_nacimiento: '',
		sexo:             '',
		tipo_sangre:      '',
	})

	const contrasena             = ref('')
	const confirmacionContrasena = ref('')
	const error                  = ref('')
	const cargando               = ref(false)

	const esRecepcionista = computed(() => rolUsuario.value === 'recepcionista')

	const descripcionFormulario = computed(() =>
		esRecepcionista.value
			? 'Captura los datos del paciente para crear una nueva cuenta.'
			: 'Completa tus datos para registrarte.'
	)

	const textoBoton = computed(() =>
		esRecepcionista.value ? 'Registrar paciente' : 'Crear cuenta'
	)

	const crearCuenta = async () => {
		if (contrasena.value !== confirmacionContrasena.value) {
			error.value = 'Las contraseñas no coinciden.'
			return
		}

		cargando.value = true
		error.value = ''

		try {
			const respuestaRegistro = await fetch('http://localhost:3001/api/paciente', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...formulario, contraseña: contrasena.value }),
			})

			const datosRegistro = await respuestaRegistro.json()

			if (datosRegistro.error) {
				error.value = datosRegistro.error
				return
			}

			if (esRecepcionista.value) {
				void router.push({ name: 'citas' })
				return
			}

			// Login automatico
			const respuestaLogin = await fetch('http://localhost:3001/api/usuario/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					correo: formulario.correo,
					contraseña: contrasena.value,
				}),
			})

			const datosLogin = await respuestaLogin.json()

			if (datosLogin.error) {
				void router.push({ name: 'inicio-sesion' })
				return
			}

			setUsuario(datosLogin.usuario)
			void router.push({ name: 'citas' })

		} catch {
			error.value = 'No se pudo conectar con el servidor.'
		} finally {
			cargando.value = false
		}
	}
</script>

<style scoped>
	.signup-view {
		min-height: calc(100vh - 1px);
		display: grid;
		place-items: center;
		padding: 2rem 1rem;
		background: linear-gradient(135deg, var(--clarus-ivory) 0%, var(--clarus-gold-soft) 100%);
	}

	.signup-card {
		width: min(100%, 740px);
		padding: 2rem;
		border-radius: 20px;
		background: var(--clarus-ivory);
		box-shadow: 0 14px 36px var(--clarus-shadow);
	}

	.brand {
		margin: 0;
		color: var(--clarus-gold);
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	h1 {
		margin: 0.4rem 0;
		font-size: 1.9rem;
	}

	.description {
		margin: 0 0 1.4rem;
		color: var(--clarus-oxford);
	}

	.signup-form {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.94rem;
		color: var(--clarus-midnight);
	}

	.full-row {
		grid-column: 1 / -1;
	}

	input,
	select {
		padding: 0.72rem;
		border-radius: 10px;
		border: 1px solid var(--clarus-border);
		font-size: 1rem;
		min-height: 44px;
	}

	button {
		grid-column: 1 / -1;
		border: none;
		border-radius: 10px;
		background: var(--clarus-gold);
		color: var(--clarus-ivory);
		padding: 0.78rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}

	button:hover {
		background: var(--clarus-midnight-soft);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error {
		grid-column: 1 / -1;
		margin: 0;
		color: #dc2626;
		font-size: 0.9rem;
	}

	.help {
		margin: 1.1rem 0 0;
		font-size: 0.9rem;
		color: var(--clarus-oxford);
	}

	.help a {
		color: var(--clarus-gold);
		text-decoration: none;
	}

	.help a:hover {
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.signup-form {
			grid-template-columns: 1fr;
		}
	}
</style>