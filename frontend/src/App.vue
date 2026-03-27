<script setup lang="ts">
import { computed } from 'vue'
import menuVue from './modulos/principal/vistas/menuVue.vue'
import { useSesion } from './modulos/principal/controladores/useSesion'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
const { rolUsuario } = useSesion()
const rutasSinMenu = new Set(['inicio-sesion', 'crear-cuenta'])
const mostrarMenu = computed(() => {
  if (route.name === 'crear-cuenta' && rolUsuario.value === 'recepcionista') {
    return true
  }

  return !rutasSinMenu.has(String(route.name))
})
</script>

<template>
  <header v-if="mostrarMenu">
    <menuVue />
  </header>
  <RouterView />
</template>

<style scoped></style>