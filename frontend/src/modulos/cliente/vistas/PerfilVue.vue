<template>
    <section class="perfil-view">
        <header class="header">
        <div>
            <h2>Perfil</h2>
            <p class="subtitle">Actualiza tu información personal.</p>
        </div>
        <button class="button" type="submit" form="perfil-form">Guardar cambios</button>
        </header>

        <form id="perfil-form" class="profile-card" @submit.prevent="saveProfile">
        <div class="form-grid">
            <div class="form-field">
            <label for="nombres">Nombres</label>
            <input id="nombres" v-model.trim="profile.nombres" class="input" type="text" />
            </div>

            <div class="form-field">
            <label for="apellidos">Apellidos</label>
            <input id="apellidos" v-model.trim="profile.apellidos" class="input" type="text" />
            </div>

            <div class="form-field full-row">
            <label for="curp">CURP</label>
            <input id="curp" v-model.trim="profile.curp" class="input" type="text" maxlength="18" />
            </div>

            <div class="form-field full-row">
            <label for="correo">Correo</label>
            <input id="correo" v-model.trim="profile.correo" class="input" type="email" />
            </div>

            <div class="form-field full-row">
            <label for="telefono">Número de teléfono</label>
            <div class="phone-group">
                <input id="codigo" v-model.trim="profile.codigoPais" class="input code" type="text" />
                <input id="telefono" v-model.trim="profile.telefono" class="input" type="tel" />
            </div>
            </div>

            <div class="form-field">
            <label for="fecha">Fecha de nacimiento</label>
            <input id="fecha" v-model="profile.fechaNacimiento" class="input" type="date" />
            </div>

            <div class="form-field">
            <label for="genero">Género</label>
            <select id="genero" v-model="profile.genero" class="input select">
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
    import { reactive } from 'vue'

    const profile = reactive({
    nombres: '',
    apellidos: '',
    curp: '',
    correo: '',
    codigoPais: '',
    telefono: '',
    fechaNacimiento: '',
    genero: '',
    })

    function saveProfile() {
    console.log('Perfil guardado', { ...profile })
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
    color: #475569;
    }

    .profile-card {
    background: #fff;
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
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
    border: 1px solid #dbeafe;
    border-radius: 12px;
    padding: 0.7rem 0.85rem;
    font: inherit;
    min-height: 46px;
    color: #0f172a;
    }

    .input:focus {
    outline: 2px solid #bfdbfe;
    outline-offset: 1px;
    }

    .phone-group {
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 0.6rem;
    }

    .button {
    border: 1px solid #2563eb;
    background: #2563eb;
    color: #fff;
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
