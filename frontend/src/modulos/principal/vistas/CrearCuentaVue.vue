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

                <label>
                    Número de teléfono
                    <input
                        v-model="formulario.telefono"
                        type="tel"
                        placeholder="5512345678"
                        @input="soloNumeros"
                        maxlength="15"
                    />
                </label>

                <label>
                    Fecha de nacimiento
                    <input v-model="formulario.fecha_nacimiento" type="date" />
                </label>

                <label>
                    Sexo
                    <select v-model="formulario.sexo">
                        <option disabled value="">Selecciona una opción</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                    </select>
                </label>

                <label>
                    Tipo de sangre
                    <select v-model="formulario.tipo_sangre">
                        <option disabled value="">Selecciona</option>
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                        <option>O+</option>
                        <option>O-</option>
                    </select>
                </label>

                <label>
                    Contraseña
                    <div class="password-wrapper">
                        <input
                            v-model="contrasena"
                            :type="mostrarPassword ? 'text' : 'password'"
                            placeholder="••••••••"
                            required
                            minlength="6"
                        />
                        <button type="button" class="toggle-password" @click.stop="mostrarPassword = !mostrarPassword">
                            <img :src="mostrarPassword ? ojoAbierto : ojoCerrado" alt="toggle" />
                        </button>
                    </div>
                </label>

                <label>
                    Confirmar contraseña
                    <div class="password-wrapper">
                        <input
                            v-model="confirmacionContrasena"
                            :type="mostrarConfirmPassword ? 'text' : 'password'"
                            placeholder="••••••••"
                            required
                            minlength="6"
                        />
                        <button type="button" class="toggle-password" @click.stop="mostrarConfirmPassword = !mostrarConfirmPassword">
                            <img :src="mostrarConfirmPassword ? ojoAbierto : ojoCerrado" alt="toggle" />
                        </button>
                    </div>
                </label>

                <p v-if="error" class="error">{{ error }}</p>
                <p v-if="exito" class="exito">{{ exito }}</p>

                <button type="submit" :disabled="cargando">
                    {{ cargando ? 'Creando cuenta...' : textoBoton }}
                </button>
            </form>

            <p class="help">
                ¿Ya tienes una cuenta?
                <RouterLink :to="{ name: 'inicio-sesion' }">Inicia sesión aquí</RouterLink>
            </p>
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSesion } from '../controladores/useSesion'
import ojoAbierto from '../Recursos/ojo_abierto.png'
import ojoCerrado from '../Recursos/ojo_cerrado.png'

const mostrarPassword        = ref(false)
const mostrarConfirmPassword = ref(false)

const router = useRouter()
const { rolUsuario, setUsuario } = useSesion()

const formulario = reactive({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    correo: '',
    telefono: '',
    fecha_nacimiento: '',
    sexo: '',
    tipo_sangre: ''
})

const contrasena = ref('')
const confirmacionContrasena = ref('')
const error = ref('')
const exito = ref('')
const cargando = ref(false)

const esRecepcionista = computed(() => rolUsuario.value === 'recepcionista')

const descripcionFormulario = computed(() =>
    esRecepcionista.value
        ? 'Captura los datos del paciente para crear una nueva cuenta.'
        : 'Completa tus datos para registrarte.'
)

const textoBoton = computed(() => esRecepcionista.value ? 'Registrar paciente' : 'Crear cuenta')

// Solo permite números en el teléfono
const soloNumeros = (e: Event) => {
    const input = e.target as HTMLInputElement
    input.value = input.value.replace(/\D/g, '')
    formulario.telefono = input.value
}

const parsearError = (err: any): string => {
    if (err?.name === 'ZodError' || err?.issues) {
        for (const issue of (err.issues ?? [])) {
            if (issue.path?.includes('correo') || issue.validation === 'email') {
                return 'El correo no es válido. Asegúrate de incluir el dominio (ej: usuario@dominio.com)'
            }
            if (issue.path?.includes('telefono')) {
                return 'El teléfono solo debe contener números.'
            }
            if (issue.path?.includes('contraseña')) {
                return 'La contraseña debe tener al menos 6 caracteres.'
            }
        }
        return 'Datos inválidos, revisa el formulario.'
    }
    return typeof err === 'string' ? err : 'Error al crear la cuenta.'
}
const validar = (): string => {
    if (!formulario.nombre.trim())
        return 'El nombre es requerido.'
    if (!formulario.apellido_paterno.trim())
        return 'El apellido paterno es requerido.'
    if (!formulario.correo.trim())
        return 'El correo es requerido.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.correo))
        return 'El correo no tiene un formato válido (ej: nombre@dominio.com).'
    if (formulario.telefono && !/^\d+$/.test(formulario.telefono))
        return 'El teléfono solo puede contener números.'
    if (formulario.telefono && formulario.telefono.length < 10)
        return 'El teléfono debe tener al menos 10 dígitos.'
    if (!formulario.fecha_nacimiento)
        return 'La fecha de nacimiento es requerida.'
    if (!formulario.sexo)
        return 'El sexo es requerido.'
    if (!formulario.tipo_sangre)
        return 'El tipo de sangre es requerido.'
    if (!contrasena.value)
        return 'La contraseña es requerida.'
    if (contrasena.value.length < 6)
        return 'La contraseña debe tener al menos 6 caracteres.'
    if (contrasena.value !== confirmacionContrasena.value)
        return 'Las contraseñas no coinciden.'
    return ''
}

const crearCuenta = async () => {
    error.value = ''
    exito.value = ''

    const mensajeError = validar()
    if (mensajeError) {
        error.value = mensajeError
        return
    }

    cargando.value = true

    try {
        const respuesta = await fetch('http://localhost:3001/api/paciente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formulario,
                contraseña: contrasena.value
            })
        })

        const datos = await respuesta.json()

        if (datos.error) {
			error.value = parsearError(datos.error)
			return
		}

		// Login automático
		const loginResp = await fetch('http://localhost:3001/api/usuario/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				correo: formulario.correo,
				contraseña: contrasena.value
			})
		})

		const loginDatos = await loginResp.json()

		if (loginDatos.error) {
			void router.push({ name: 'inicio-sesion' })
			return
		}

		setUsuario(loginDatos.usuario)
		void router.push({ name: 'citas' })

    } catch {
        error.value = 'No se pudo conectar con el servidor. Intenta de nuevo.'
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
    text-align: center;
}
.password-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.password-wrapper input {
    padding-right: 3rem;
    width: 100%;
    box-sizing: border-box;
}

.toggle-password {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    border-radius: 0;
}

.toggle-password img {
    width: 28px;
    height: 28px;
    opacity: 0.5;
    filter: invert(0.5);
}

.toggle-password:hover img {
    opacity: 1;
    filter: invert(0.3);
}
.brand {
    margin: 0;
    color: var(--clarus-gold);
    font-weight: 700;
    letter-spacing: 0.08em;
}
h1 { margin: 0.4rem 0; font-size: 1.9rem; }
.description { margin: 0 0 1.4rem; color: var(--clarus-oxford); }
.signup-form {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    text-align: left;
}
label {
    display: grid;
    gap: 0.35rem;
    font-size: 0.94rem;
    color: var(--clarus-midnight);
}
.full-row { grid-column: 1 / -1; }
input, select {
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
button:disabled { opacity: 0.7; cursor: not-allowed; }
button:hover:not(:disabled) { background: var(--clarus-midnight-soft); }
.error {
    grid-column: 1 / -1;
    margin: 0;
    padding: 0.75rem;
    background: #fee2e2;
    border-radius: 10px;
    color: #dc2626;
    font-size: 0.9rem;
}
.exito {
    grid-column: 1 / -1;
    margin: 0;
    padding: 0.75rem;
    background: #dcfce7;
    border-radius: 10px;
    color: #15803d;
    font-size: 0.9rem;
}
.help {
    margin: 1.1rem 0 0;
    font-size: 0.9rem;
    color: var(--clarus-oxford);
}
.help a { color: var(--clarus-gold); text-decoration: none; }
.help a:hover { text-decoration: underline; }
@media (max-width: 768px) {
    .signup-form { grid-template-columns: 1fr; }
}
</style>