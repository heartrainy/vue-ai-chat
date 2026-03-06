<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>AI 聊天助手</h2>
    </div>

    <div class="messages" ref="messagesContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.role]"
      >
        <div class="message-content">{{ msg.content }}</div>
      </div>
      <div v-if="isLoading" class="message assistant">
        <div class="message-content">思考中...</div>
      </div>
    </div>

    <div class="input-area">
      <input
        v-model="input"
        @keyup.enter="sendMessage"
        placeholder="输入消息..."
        :disabled="isLoading"
      />
      <button @click="sendMessage" :disabled="isLoading || !input.trim()">
        发送
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const messages = ref([])
const input = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!input.value.trim() || isLoading.value) return

  const userMessage = input.value
  messages.value.push({ role: 'user', content: userMessage })
  input.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.value })
    })

    const data = await response.json()
    messages.value.push({ role: 'assistant', content: data.message })
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: '抱歉，发生了错误，请稍后重试。'
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

</script>

<style scoped>
.chat-container {
  width: 600px;
  height: 700px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e5e5e5;
  text-align: center;
}

.chat-header h2 {
  font-size: 20px;
  color: #333;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  animation: fadeIn 0.3s;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
}

.message.user .message-content {
  background: #007aff;
  color: white;
}

.message.assistant .message-content {
  background: #f0f0f0;
  color: #333;
}

.input-area {
  padding: 20px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  gap: 10px;
}

.input-area input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.input-area input:focus {
  border-color: #007aff;
}

.input-area button {
  padding: 12px 24px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.input-area button:hover:not(:disabled) {
  background: #0056b3;
}

.input-area button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
