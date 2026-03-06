# Vue AI Chat

一个基于 Vue 3 + Vercel AI SDK 的简单聊天机器人项目。

## 功能特性

- 💬 实时AI对话
- 🎨 简洁的聊天界面
- ⚡ 基于Vite的快速开发体验
- 🚀 支持Vercel一键部署

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

在项目根目录复制 `.env.example` 为 `.env`，按使用的服务配置：

- **OpenAI**：设置 `OPENAI_API_KEY=你的key`，可不设置 `AI_BASE_URL`（默认 OpenAI）。
- **Kimi（月之暗面）**：设置 `KIMI_API_KEY=你的key`，并设置：
  ```env
  AI_BASE_URL=https://api.moonshot.cn/v1
  AI_MODEL=moonshot-v1-8k
  ```
  国内也可用 `https://api.moonshot.cn/v1`，海外可用 `https://api.moonshot.ai/v1`。

### 本地开发

**方式一：只用 Vite（推荐，无需 Vercel 登录）**

不依赖 `vercel dev`，本地已内置 `/api/chat` 中间件，适合不想折腾 GitLab 认证时使用：

```bash
npm run dev:vite
```

浏览器打开 **http://localhost:5173**，在 `.env` 中配置好 `OPENAI_API_KEY`（OpenAI）或 `KIMI_API_KEY` + `AI_BASE_URL`（Kimi）即可对话。

**方式二：Vercel Dev（与线上一致）**

若希望和部署环境一致，可用 `vercel dev`：

```bash
npm run dev
```

终端会提示地址（多为 **http://localhost:3000**）。

若出现 **“Waiting for GitLab authentication to be completed”** 一直卡住：

- **跳过浏览器登录**：到 [Vercel → Account → Tokens](https://vercel.com/account/tokens) 创建 Token，在终端执行：
  ```bash
  vercel login --token 你的Token
  ```
  再运行 `npm run dev`。
- **或直接改用方式一**：用 `npm run dev:vite`，功能相同，无需 Vercel 登录。

### 构建部署

```bash
npm run build
```

## 部署到Vercel

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量：`OPENAI_API_KEY`（OpenAI）或 `KIMI_API_KEY` + `AI_BASE_URL`（Kimi）
4. 点击部署

## 技术栈

- Vue 3
- Vite
- Vercel AI SDK
- OpenAI API

## 许可证

MIT
