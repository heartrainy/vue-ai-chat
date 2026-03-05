import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 本地开发代理，避免跨域
      '/api': {
        target: 'https://vue-ai-chat.vercel.app', // 替换成你的Vercel域名
        changeOrigin: true,
        secure: false
      }
    }
  }
})

