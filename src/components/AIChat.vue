<template>
  <div class="chat">
    <header class="chat-header">
      <div class="chat-header-inner">
        <span class="chat-header-dot" aria-hidden="true"></span>
        <h1 class="chat-title">AI 对话</h1>
      </div>
    </header>

    <div class="chat-messages" ref="messagesRef">
      <div v-if="messages.length === 0" class="chat-empty">
        <p class="chat-empty-text">发一条消息开始吧</p>
        <p class="chat-empty-hint">支持流式回复，边想边出字</p>
      </div>
      <div class="chat-message-list">
        <article
          v-for="(msg, index) in messages"
          :key="`${index}-${msg.content?.length || 0}`"
          :class="['message', 'message--' + msg.role]"
        >
          <div class="message-avatar" aria-hidden="true">
            <span v-if="msg.role === 'user'" class="avatar avatar--user">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="3.2"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
            </span>
            <span v-else class="avatar avatar--assistant">AI</span>
          </div>
          <div class="message-body">
            <div class="message-content">{{ msg.content }}</div>
            <span v-if="msg.role === 'assistant' && msg.content === ''" class="message-cursor" aria-hidden="true">|</span>
          </div>
        </article>
      </div>
      <article v-if="isLoading && !streamingContent" class="message message--assistant message--thinking">
        <div class="message-avatar" aria-hidden="true">
          <span class="avatar avatar--assistant">AI</span>
        </div>
        <div class="message-body">
          <div class="thinking-dots" aria-label="思考中">
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
          </div>
        </div>
      </article>
      <article v-if="streamingContent !== null" class="message message--assistant">
        <div class="message-avatar" aria-hidden="true">
          <span class="avatar avatar--assistant">AI</span>
        </div>
        <div class="message-body">
          <div class="message-content">{{ streamingContent }}</div>
          <span class="message-cursor" aria-hidden="true">|</span>
        </div>
      </article>
    </div>

    <div class="chat-input-wrap">
      <div class="chat-input-inner">
        <textarea
          v-model="input"
          class="chat-input"
          placeholder="输入消息，Enter 发送"
          rows="1"
          :disabled="isLoading"
          @keydown.enter.exact.prevent="sendMessage"
        />
        <button
          type="button"
          class="chat-send"
          :disabled="isLoading || !input.trim()"
          aria-label="发送"
          @click="sendMessage"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7L22 2z"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const messages = ref([])
const input = ref('')
const isLoading = ref(false)
const streamingContent = ref(null)
const messagesRef = ref(null)

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

function parseStreamChunk(line) {
  const s = line.replace(/^data:\s*/, '').trim()
  if (s === '[DONE]') return { done: true }
  try {
    const data = JSON.parse(s)
    const content = data.choices?.[0]?.delta?.content ?? data.content
    if (content) return { content }
  } catch (_) {}
  return {}
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  isLoading.value = true
  streamingContent.value = null
  scrollToBottom()

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.value }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      messages.value.push({ role: 'assistant', content: err.message || err.error || `请求失败 ${res.status}` })
      return
    }

    if (!res.body) {
      messages.value.push({ role: 'assistant', content: '无响应内容' })
      return
    }

    const decoder = new TextDecoder()
    const reader = res.body.getReader()
    let buffer = ''
    let full = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const out = parseStreamChunk(line)
        if (out.done) break
        if (out.content) {
          full += out.content
          streamingContent.value = full
          scrollToBottom()
        }
      }
    }

    if (full) {
      messages.value.push({ role: 'assistant', content: full })
    } else {
      messages.value.push({ role: 'assistant', content: '（无回复内容）' })
    }
  } catch (e) {
    messages.value.push({ role: 'assistant', content: '发送失败，请稍后重试。' })
  } finally {
    isLoading.value = false
    streamingContent.value = null
    scrollToBottom()
  }
}

watch(messages, () => scrollToBottom(), { deep: true })
</script>

<style scoped>
.chat {
  --chat-bg: #ffffff;
  --chat-surface: #ffffff;
  --chat-border: #e8e8e8;
  --chat-text: #1a1a1a;
  --chat-muted: #9a9a9a;
  --chat-user-bg: #1a1a1a;
  --chat-user-text: #ffffff;
  --chat-assistant-bg: #f5f5f5;
  --chat-assistant-border: transparent;
  --chat-accent: #1a1a1a;
  --font: 'IBM Plex Sans', system-ui, sans-serif;
  --radius: 12px;
  --radius-sm: 8px;
  width: 100%;
  max-width: 520px;
  height: 100%;
  max-height: 680px;
  display: flex;
  flex-direction: column;
  background: var(--chat-bg);
  border-radius: var(--radius);
  border: 1px solid var(--chat-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.chat-header {
  flex-shrink: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--chat-border);
  background: var(--chat-surface);
}

.chat-header-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.chat-header-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--chat-accent);
}

.chat-title {
  font-family: var(--font);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--chat-text);
  letter-spacing: -0.01em;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--chat-muted);
}

.chat-empty-text {
  font-family: var(--font);
  font-size: 0.9375rem;
  font-weight: 500;
}

.chat-empty-hint {
  font-size: 0.8125rem;
  font-weight: 400;
}

.chat-message-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  max-width: 90%;
}

.message--user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message--assistant {
  align-self: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--chat-user-text);
  background: var(--chat-user-bg);
}

.avatar svg {
  width: 16px;
  height: 16px;
}

.avatar--assistant {
  background: var(--chat-assistant-bg);
  color: var(--chat-text);
  border: 1px solid var(--chat-border);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.message-body {
  min-width: 0;
}

.message-content {
  font-family: var(--font);
  font-size: 0.9375rem;
  line-height: 1.6;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  white-space: pre-wrap;
  word-break: break-word;
}

.message--user .message-content {
  background: var(--chat-user-bg);
  color: var(--chat-user-text);
  border-bottom-right-radius: 2px;
}

.message--assistant .message-content {
  background: var(--chat-assistant-bg);
  color: var(--chat-text);
  border: none;
  border-bottom-left-radius: 2px;
}

.message-cursor {
  display: inline-block;
  margin-left: 2px;
  color: var(--chat-accent);
  animation: blink 0.9s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.message--thinking .message-body {
  padding: 4px 0;
}

.thinking-dots {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 14px;
}

.thinking-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--chat-muted);
  animation: thinking 1.2s ease-in-out infinite;
}

.thinking-dot:nth-child(1) { animation-delay: 0s; }
.thinking-dot:nth-child(2) { animation-delay: 0.15s; }
.thinking-dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes thinking {
  0%, 100% { transform: scale(0.9); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
}

.chat-input-wrap {
  flex-shrink: 0;
  padding: 16px 20px;
  background: var(--chat-surface);
  border-top: 1px solid var(--chat-border);
}

.chat-input-inner {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 10px 14px;
  background: var(--chat-bg);
  border: 1px solid var(--chat-border);
  border-radius: var(--radius-sm);
  transition: border-color 0.15s;
}

.chat-input-inner:focus-within {
  border-color: var(--chat-accent);
}

.chat-input {
  flex: 1;
  min-height: 40px;
  max-height: 140px;
  padding: 6px 0;
  border: none;
  background: transparent;
  font-family: var(--font);
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--chat-text);
  resize: none;
  outline: none;
}

.chat-input::placeholder {
  color: var(--chat-muted);
}

.chat-send {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--chat-accent);
  color: var(--chat-user-text);
  cursor: pointer;
  transition: opacity 0.15s;
}

.chat-send:hover:not(:disabled) {
  opacity: 0.88;
}

.chat-send:active:not(:disabled) {
  opacity: 0.8;
}

.chat-send:disabled {
  background: var(--chat-border);
  color: var(--chat-muted);
  cursor: not-allowed;
  opacity: 1;
}

.chat-send svg {
  width: 16px;
  height: 16px;
}
</style>
