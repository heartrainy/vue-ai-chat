import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

export const config = {
  runtime: 'edge'
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.KIMI_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: '未配置 OPENAI_API_KEY 或 KIMI_API_KEY，请在 .env 或 Vercel 环境变量中设置' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const baseURL = (process.env.AI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = process.env.AI_MODEL || process.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo'

  const openai = createOpenAI({
    baseURL: baseURL.includes('/v1') ? baseURL : `${baseURL}/v1`,
    apiKey,
    compatibility: 'compatible'
  })

  try {
    const { messages } = await req.json()

    const result = await streamText({
      model: openai(model),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (e) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: e?.message || 'stream error' })}\n\n`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ message: error?.message || '服务器错误' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
