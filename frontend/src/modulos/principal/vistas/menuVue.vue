<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">CLARUS</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">

                    <!-- Admin -->
                    <template v-if="rolUsuario === 'administrador'">
                        <li class="nav_item margin">
                            <router-link class="nav-link item" to="/admin/sucursales">Sucursal</router-link>
                        </li>
                        <li class="nav_item margin">
                            <router-link class="nav-link item" to="/admin/doctores">Doctores</router-link>
                        </li>
                        <li class="nav_item margin">
                            <router-link class="nav-link item" to="/admin/recepcionistas">Recepcionistas</router-link>
                        </li>
                    </template>

                    <!-- Otros roles -->
                    <template v-else>
                        <li class="nav_item margin">
                            <router-link class="nav-link item" :to="rutaCitas">Citas</router-link>
                        </li>
                        <li v-if="rolUsuario === 'recepcionista'" class="nav_item margin">
                            <router-link class="nav-link item" to="/recepcionista/pacientes">Pacientes</router-link>
                        </li>
                        <li v-if="rolUsuario !== 'recepcionista'" class="nav_item margin">
                            <router-link class="nav-link item" :to="rutaSecundaria">{{ etiquetaSecundaria }}</router-link>
                        </li>
                        <li class="nav_item margin">
                            <router-link class="nav-link item" to="/perfil">Perfil</router-link>
                        </li>
                    </template>

                </ul>
                <button class="btn btn-danger btn-sm" @click="cerrarSesionYRedirigir">Cerrar sesión</button>
            </div>
        </div>
    </nav>
</template>
<script setup lang="ts">
    import { computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { useSesion } from '../controladores/useSesion'

    const router = useRouter()
    const { rolUsuario, cerrarSesion } = useSesion()

    const cerrarSesionYRedirigir = () => {
        cerrarSesion()
        void router.push({ name: 'inicio-sesion' })
    }

    const etiquetaSecundaria = computed(() => {
        if (rolUsuario.value === 'doctor') return 'Expedientes'
        if (rolUsuario.value === 'recepcionista') return 'Nueva cuenta'
        return 'Recetas'
    })

    const rutaCitas = computed(() => '/citas')
    const rutaSecundaria = computed(() => {
        if (rolUsuario.value === 'doctor') return '/expedientes'
        if (rolUsuario.value === 'recepcionista') return '/crear-cuenta'
        return '/recetas'
    })
</script>

<style scoped>
    .navbar {
        background: var(--clarus-midnight) !important;
        box-shadow: 0 10px 24px var(--clarus-shadow);
    }

    .navbar-brand,
    .item {
        color: var(--clarus-ivory) !important;
    }

    .navbar-brand {
        font-weight: 700;
        letter-spacing: 0.08em;
    }

    .item.router-link-active {
        color: var(--clarus-gold) !important;
        font-weight: 700;
    }

    .item:hover {
        color: var(--clarus-gold) !important;
    }

    .btn-cerrar {
	background: none;
	border: none;
	cursor: pointer;
	padding: 0;
	font-size: inherit;
}
</style>