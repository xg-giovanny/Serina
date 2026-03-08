<template>
  <div :class="{ 'dark-theme': isDark }">
    <Toast />
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isDark = ref(false)

const applyTheme = () => {
  document.documentElement.classList.toggle('dark', isDark.value)
}

// Global theme toggle function (accessible from anywhere)
window.toggleAppTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  applyTheme()
  window.dispatchEvent(new Event('themechange'))
}

// Get current theme status
window.isDarkMode = () => isDark.value

onMounted(() => {
  // Load saved theme
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // Check system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
  
  // Listen for theme changes from other components
  window.addEventListener('themechange', () => {
    isDark.value = localStorage.getItem('theme') === 'dark'
    applyTheme()
  })
  
  // Listen for custom theme changes
  window.addEventListener('theme-changed', (e) => {
    isDark.value = e.detail.isDark
    applyTheme()
  })
})

onUnmounted(() => {
  window.removeEventListener('themechange', () => {})
  window.removeEventListener('theme-changed', () => {})
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

