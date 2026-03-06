<template>
  <div class="app">
    <AIChat />
  </div>
</template>

<script setup>
import AIChat from './components/AIChat.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  background: #f7f7f7;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
