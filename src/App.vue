<template>
  <div id="app">
    <header class="header">
      <h1>Vue AI 聊天助手</h1>
      <p class="subtitle">基于 Vercel AI SDK + OpenAI</p>
    </header>
    <main class="main">
      <AIChat />
    </main>
    <footer class="footer">
      <p>
        Vue + AI SDK 练手项目 |
        <a href="https://vercel.com" target="_blank">Vercel 部署</a>
      </p>
    </footer>
  </div>
</template>

<script setup>
import AIChat from "./components/AIChat.vue";
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    sans-serif;
}

#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #0070f3;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 0.9rem;
}

.main {
  flex: 1;
}

.footer {
  margin-top: 2rem;
  text-align: center;
  color: #888;
  font-size: 0.8rem;
}

.footer a {
  color: #0070f3;
  text-decoration: none;
}
</style>
