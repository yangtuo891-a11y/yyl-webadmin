<template>
  <router-view />
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style>
#app {
  height: 100vh;
  margin: 0;
  padding: 0;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>