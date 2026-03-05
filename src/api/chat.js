// 兼容本地开发和Vercel部署的AI接口
export const config = {
  runtime: 'edge', // 启用Vercel Edge Runtime
}

export default async function handler(req) {
  try {
    // 解析请求体
    const { messages } = await req.json()

    // 配置OpenAI客户端
    const apiKey = process.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: '缺少OPENAI_API_KEY' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 调用OpenAI API（流式响应）
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_OPENAI_MODEL,
        messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
        stream: true
      })
    })

    // 返回流式响应
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}