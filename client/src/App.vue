<template>
  <div :class="{ 'dark-theme': themeStore.isDark }">
    <Toast />
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/store/themeStore'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>

<style>
/* Base styles */
html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}
</style>

