export const config = {
  runtime: 'edge',
}

function json(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers,
    },
  })
}

function withCors(res, origin) {
  const h = new Headers(res.headers)
  h.set('access-control-allow-origin', origin || '*')
  h.set('access-control-allow-methods', 'POST, OPTIONS')
  h.set('access-control-allow-headers', 'content-type, authorization')
  h.set('access-control-max-age', '86400')
  return new Response(res.body, { status: res.status, headers: h })
}

function normalizeBaseUrl(baseUrl) {
  const url = (baseUrl || 'https://api.openai.com').trim()
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function toOpenAiMessages(history, message) {
  const list = []
  if (Array.isArray(history)) {
    for (const item of history) {
      const role = item?.role
      const content = item?.content
      if ((role === 'user' || role === 'assistant' || role === 'system') && typeof content === 'string') {
        list.push({ role, content })
      }
    }
  }
  list.push({ role: 'user', content: String(message ?? '') })
  return list
}

export default async function handler(req) {
  const origin = req.headers.get('origin') || '*'

  if (req.method === 'OPTIONS') {
    return withCors(new Response(null, { status: 204 }), origin)
  }

  if (req.method !== 'POST') {
    return withCors(json({ error: 'Only POST is supported.' }, { status: 405 }), origin)
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return withCors(
      json(
        {
          error: 'Missing env: OPENAI_API_KEY. 请在 Vercel 项目环境变量中配置。',
        },
        { status: 500 },
      ),
      origin,
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return withCors(json({ error: 'Invalid JSON body.' }, { status: 400 }), origin)
  }

  const message = body?.message
  const history = body?.history
  if (typeof message !== 'string' || !message.trim()) {
    return withCors(json({ error: '`message` must be a non-empty string.' }, { status: 400 }), origin)
  }

  const baseUrl = normalizeBaseUrl(process.env.OPENAI_BASE_URL)
  const model = (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim()

  const upstream = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: toOpenAiMessages(history, message),
      temperature: 0.7,
    }),
  })

  const upstreamText = await upstream.text()

  if (!upstream.ok) {
    return withCors(
      json(
        {
          error: 'Upstream error.',
          status: upstream.status,
          detail: upstreamText,
        },
        { status: 502 },
      ),
      origin,
    )
  }

  let upstreamJson
  try {
    upstreamJson = JSON.parse(upstreamText)
  } catch {
    return withCors(json({ error: 'Upstream returned non-JSON response.' }, { status: 502 }), origin)
  }

  const reply = upstreamJson?.choices?.[0]?.message?.content
  return withCors(json({ reply: typeof reply === 'string' ? reply : '' }), origin)
}

