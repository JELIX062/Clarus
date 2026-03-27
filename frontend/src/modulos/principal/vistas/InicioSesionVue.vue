<template>
    <main class="login-view">
        <section class="login-card" aria-labelledby="titulo-login">
        <p class="brand">CLARUS</p>
        <h1 id="titulo-login">Inicio de sesión</h1>
        <p class="description">Ingresa con tu correo para administrar citas, recetas y tu perfil.</p>

        <form class="login-form" @submit.prevent="iniciarSesion">
            <label>
            Correo electrónico
            <input v-model="correo" type="email" placeholder="Correo" required />
            </label>

            <label>
            Contraseña
            <input v-model="contrasena" type="password" placeholder="••••••••" required minlength="6" />
            </label>

            <label>
            Rol
            <select v-model="rol" required>
                <option value="paciente">Paciente</option>
                <option value="doctor">Doctor</option>
                <option value="recepcionista">Recepcionista</option>
            </select>
            </label>

            <button type="submit">Entrar</button>
        </form>

        <p class="help">¿Aún no tienes cuenta? <RouterLink :to="{ name: 'crear-cuenta' }">Crear cuenta</RouterLink></p>
        </section>
    </main>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { RouterLink, useRouter } from 'vue-router'
    import { useSesion } from '../controladores/useSesion'

    const router = useRouter()
    const { setRolUsuario } = useSesion()

    const correo = ref('')
    const contrasena = ref('')
    const rol = ref<'paciente' | 'doctor' | 'recepcionista'>('paciente')

    const iniciarSesion = () => {
    setRolUsuario(rol.value)

    if (rol.value === 'doctor') {
        void router.push({ name: 'doctor-citas' })
        return
    }

    void router.push({ name: 'citas' })
    }
</script>

<style scoped>
    .login-view {
    min-height: calc(100vh - 1px);
    display: grid;
    place-items: center;
    padding: 2rem 1rem;
    background: linear-gradient(135deg, var(--clarus-ivory) 0%, var(--clarus-gold-soft) 100%);
    }

    .login-card {
    width: min(100%, 420px);
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

    .login-form {
    display: grid;
    gap: 1rem;
    }

    label {
    display: grid;
    gap: 0.35rem;
    font-size: 0.94rem;
    color: var(--clarus-midnight);
    }

    input,
    select {
    padding: 0.72rem;
    border-radius: 10px;
    border: 1px solid var(--clarus-border);
    font-size: 1rem;
    }

    .remember-row {
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.9rem;
    color: #4b5563;
    }

    button {
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
</style>