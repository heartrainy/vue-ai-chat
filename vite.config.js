import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

/** 本地开发时用 Vite 中间件实现 /api/chat，不依赖 vercel dev（可避免 GitLab 认证卡住） */
function localApiPlugin(env) {
  return {
    name: 'local-api-chat',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res, next) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }
        const apiKey = env.OPENAI_API_KEY || env.KIMI_API_KEY || env.VITE_OPENAI_API_KEY
        if (!apiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ message: '未配置 API Key，请在 .env 中设置 OPENAI_API_KEY 或 KIMI_API_KEY' }))
          return
        }
        const baseURL = (env.AI_BASE_URL || env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
        const model = env.AI_MODEL || env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo'
        try {
          const body = await new Promise((resolve, reject) => {
            let raw = ''
            req.on('data', (c) => (raw += c))
            req.on('end', () => resolve(raw))
            req.on('error', reject)
          })
          const { messages } = JSON.parse(body || '{}')
          const list = Array.isArray(messages) ? messages : []
          const url = baseURL.includes('/v1') ? `${baseURL}/chat/completions` : `${baseURL}/v1/chat/completions`
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: list.map((m) => ({ role: m.role, content: m.content })),
              stream: false,
            }),
          })
          const data = await response.json()
          if (data.error) {
            res.statusCode = response.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ message: 'API 错误: ' + (data.error?.message || '请求失败') }))
            return
          }
          const content = data.choices?.[0]?.message?.content ?? ''
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ message: content }))
        } catch (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ message: e?.message || '服务器错误' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue(), localApiPlugin(env)],
  }
})
