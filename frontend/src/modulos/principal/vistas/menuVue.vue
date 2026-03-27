<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">CLARUS</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav_item margin">
                        <router-link class="nav-link item" :to="rutaCitas">Citas</router-link>
                    </li>
                    <li class="nav_item margin">
                        <router-link class="nav-link item" :to="rutaSecundaria">{{ etiquetaSecundaria }}</router-link>
                    </li>
                    <li class="nav_item margin">
                        <router-link class="nav-link item" to="/perfil">Perfil</router-link>
                    </li>
                </ul>
            </div>
            </div>
        </div>
</nav>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { useSesion } from '../controladores/useSesion'

    const { rolUsuario } = useSesion()

    const etiquetaSecundaria = computed(() => {
      if (rolUsuario.value === 'doctor') return 'Expedientes'
      if (rolUsuario.value === 'recepcionista') return 'Nueva cuenta'
      return 'Recetas'
    })

    const rutaCitas = computed(() => (rolUsuario.value === 'doctor' ? '/doctor/citas' : '/citas'))
    const rutaSecundaria = computed(() => {
      if (rolUsuario.value === 'doctor') return '/doctor/expedientes'
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
</style>