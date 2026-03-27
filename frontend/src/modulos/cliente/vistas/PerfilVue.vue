<template>
    <section class="perfil-view">
        <header class="header">
        <div>
            <h2>Perfil</h2>
            <p class="subtitle">{{ subtituloPerfil }}</p>
        </div>
        <button class="button" type="submit" form="perfil-form">Guardar cambios</button>
        </header>

        <div v-if="esRecepcionista" class="target-selector">
        <label for="perfil-objetivo">Editar datos de</label>
        <select id="perfil-objetivo" v-model="objetivoPerfil" class="input select">
            <option value="recepcionista">Recepcionista</option>
            <option value="cliente">Cliente</option>
        </select>
        </div>

        <form id="perfil-form" class="profile-card" @submit.prevent="saveProfile">
        <div class="form-grid">
            <div class="form-field">
            <label for="nombres">Nombres</label>
            <input id="nombres" v-model.trim="profileActual.nombres" class="input" type="text" />
            </div>

            <div class="form-field">
            <label for="apellidos">Apellidos</label>
            <input id="apellidos" v-model.trim="profileActual.apellidos" class="input" type="text" />
            </div>

            <div class="form-field full-row">
            <label for="curp">CURP</label>
            <input id="curp" v-model.trim="profileActual.curp" class="input" type="text" maxlength="18" />
            </div>

            <div class="form-field full-row">
            <label for="correo">Correo</label>
            <input id="correo" v-model.trim="profileActual.correo" class="input" type="email" />
            </div>

            <div class="form-field full-row">
            <label for="telefono">Número de teléfono</label>
            <input id="telefono" v-model.trim="profileActual.telefono" class="input" type="tel" />
            </div>

            <div class="form-field">
            <label for="fecha">Fecha de nacimiento</label>
            <input id="fecha" v-model="profileActual.fechaNacimiento" class="input" type="date" />
            </div>

            <div class="form-field">
            <label for="genero">Género</label>
            <select id="genero" v-model="profileActual.genero" class="input select">
                <option disabled value="">Selecciona una opción</option>
                <option>Masculino</option>
                <option>Femenino</option>
                <option>Otro</option>
            </select>
            </div>
        </div>
        </form>
    </section>
</template>

<script setup lang="ts">
    import { computed, reactive, ref } from 'vue'
    import { useSesion } from '@/modulos/principal/controladores/useSesion'

    type PerfilObjetivo = 'recepcionista' | 'cliente'

    const { rolUsuario } = useSesion()

    const perfilRecepcionista = reactive({
    nombres: '',
    apellidos: '',
    curp: '',
    correo: '',
    codigoPais: '',
    telefono: '',
    fechaNacimiento: '',
    genero: ''
    })

    const perfilCliente = reactive({
    nombres: '',
    apellidos: '',
    curp: '',
    correo: '',
    codigoPais: '',
    telefono: '',
    fechaNacimiento: '',
    genero: ''
    })

    const objetivoPerfil = ref<PerfilObjetivo>('recepcionista')
    const esRecepcionista = computed(() => rolUsuario.value === 'recepcionista')

    const profileActual = computed(() => {
    if (esRecepcionista.value && objetivoPerfil.value === 'cliente') {
        return perfilCliente
    }

    return perfilRecepcionista
    })

    const subtituloPerfil = computed(() => {
    if (!esRecepcionista.value) {
        return 'Actualiza tu información personal.'
    }

    return objetivoPerfil.value === 'cliente'
        ? 'Actualiza los datos del cliente seleccionado.'
        : 'Actualiza los datos de la recepcionista.'
    })

    function saveProfile() {
    console.log('Perfil guardado', {
        objetivo: esRecepcionista.value ? objetivoPerfil.value : 'usuario',
        datos: { ...profileActual.value }
    })
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
