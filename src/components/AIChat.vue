<template>
  <div class="chat-container">
    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesRef">
      <div v-if="messages.length === 0" class="empty-state">
        <p>发送一条消息开始对话吧 🚀</p>
      </div>
      <div v-for="(message, index) in messages" :key="index" class="message">
        <div class="message-avatar">
          {{ message.role === "user" ? "👤" : "🤖" }}
        </div>
        <div class="message-content">
          <div class="message-role">
            {{ message.role === "user" ? "我" : "AI 助手" }}
          </div>
          <div class="message-text">{{ message.content }}</div>
        </div>
      </div>
      <!-- 加载中状态 -->
      <div v-if="isLoading" class="message loading">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="message-role">AI 助手</div>
          <div class="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入框区域 -->
    <div class="input-container">
      <textarea
        v-model="input"
        @keyup.enter="handleSend"
        placeholder="输入你的问题，按回车发送..."
        :disabled="isLoading"
        class="input-textarea"
      ></textarea>
      <button
        @click="handleSend"
        :disabled="!input.trim() || isLoading"
        class="send-button"
      >
        发送
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useChat } from "ai/vue";

// 聊天核心逻辑
const { messages, input, handleSubmit, isLoading } = useChat({
  api: "/api/chat", // 对接Vercel Edge函数
  onResponse: () => {
    // 消息加载完成后滚动到底部
    scrollToBottom();
  },
});

// 消息容器Ref，用于滚动
const messagesRef = ref(null);

// 发送消息
const handleSend = () => {
  if (!input.value.trim() || isLoading.value) return;
  handleSubmit();
};

// 自动滚动到底部
const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
};

// 监听消息变化，自动滚动
watch(messages, () => {
  scrollToBottom();
});

// 初始化时滚动到底部
onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background-color: #f9fafb;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1rem;
}

.message {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease;
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

.message-avatar {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
}

.message-role {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.message-text {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  line-height: 1.5;
}

.message.loading .message-text {
  background-color: transparent;
  box-shadow: none;
}

.loading-dots {
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #0070f3;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.input-container {
  display: flex;
  gap: 0.8rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: white;
}

.input-textarea {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: none;
  font-size: 1rem;
  line-height: 1.5;
  min-height: 60px;
  max-height: 200px;
}

.input-textarea:focus {
  outline: none;
  border-color: #0070f3;
  box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.1);
}

.send-button {
  padding: 0.75rem 1.5rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  flex-shrink: 0;
}

.send-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.send-button:not(:disabled):hover {
  background-color: #0051aa;
}
</style>
