<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-info">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">CLARUS</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav_item margin">
                        <router-link class="nav-link item" to="/recetas">Recetas</router-link>
                    </li>
                    <li class="nav_item margin">
                        <router-link class="nav-link item" to="/citas">Citas</router-link>
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

</script>

<style scoped>

</style>