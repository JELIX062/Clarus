<template>
    <main class="signup-view">
        <section class="signup-card" aria-labelledby="titulo-registro">
        <p class="brand">CLARUS</p>
        <h1 id="titulo-registro">Crear cuenta</h1>
        <p class="description">{{ descripcionFormulario }}</p>

        <form class="signup-form" @submit.prevent="crearCuenta">
            <label>
            Nombres
            <input v-model="formulario.nombres" type="text" placeholder="Tus nombres" required />
            </label>

            <label>
            Apellidos
            <input v-model="formulario.apellidos" type="text" placeholder="Tus apellidos" required />
            </label>

            <label class="full-row">
            CURP
            <input
                v-model="formulario.curp"
                type="text"
                placeholder="CURP"
                maxlength="18"
                minlength="18"
                required
            />
            </label>

            <label class="full-row">
            Correo
            <input v-model="formulario.correo" type="email" placeholder="Correo" required />
            </label>



            <label class="full-row">
            Número de teléfono
            <input v-model="formulario.telefono" type="tel" placeholder="5512345678" required />
            </label>

            <label>
            Fecha de nacimiento
            <input v-model="formulario.fechaNacimiento" type="date" required />
            </label>

            <label>
            Género
            <select v-model="formulario.genero" required>
                <option disabled value="">Selecciona una opción</option>
                <option>Masculino</option>
                <option>Femenino</option>
                <option>Otro</option>
            </select>
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

            <button type="submit">{{ textoBoton }}</button>
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

    const router = useRouter()
    const { rolUsuario } = useSesion()

    const formulario = reactive({
    nombres: '',
    apellidos: '',
    curp: '',
    correo: '',
    codigoPais: '',
    telefono: '',
    fechaNacimiento: '',
    genero: ''
    })

    const contrasena = ref('')
    const confirmacionContrasena = ref('')
    const error = ref('')
    const esRecepcionista = computed(() => rolUsuario.value === 'recepcionista')
    const descripcionFormulario = computed(() =>
        esRecepcionista.value
        ? 'Captura los datos del paciente para crear una nueva cuenta.'
        : 'Captura los mismos datos de perfil para completar tu registro.'
    )
    const textoBoton = computed(() => (esRecepcionista.value ? 'Registrar paciente' : 'Crear cuenta'))

    const crearCuenta = () => {
    if (contrasena.value !== confirmacionContrasena.value) {
        error.value = 'Las contraseñas no coinciden.'
        return
    }

    error.value = ''
    console.log(esRecepcionista.value ? 'Cuenta de paciente creada' : 'Cuenta creada', { ...formulario })
    void router.push({ name: 'perfil' })
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