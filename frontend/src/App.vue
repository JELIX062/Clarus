<script setup lang="ts">
import menuVue from './modulos/principal/vistas/menuVue.vue';
import { RouterView } from 'vue-router';

</script>

<template>
  <header>
    <menuVue/>
  </header>
  <RouterView/>
</template>

<style scoped></style>
