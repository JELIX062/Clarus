<script setup lang="ts">
import { computed } from 'vue'
import menuVue from './modulos/principal/vistas/menuVue.vue'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
const rutasSinMenu = new Set(['inicio-sesion', 'crear-cuenta'])
const mostrarMenu = computed(() => !rutasSinMenu.has(String(route.name)))
</script>

<template>
  <header v-if="mostrarMenu">
    <menuVue />
  </header>
  <RouterView />
</template>

<style scoped></style>