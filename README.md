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

## 部署到 Vercel

### 方式一：通过网页（推荐）

1. **把代码推到 Git**
   - 在 [GitHub](https://github.com) 或 [GitLab](https://gitlab.com) 新建仓库，在项目根目录执行：
   ```bash
   git init
   git add .
   git commit -m "init"
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

2. **在 Vercel 里导入项目**
   - 打开 [vercel.com](https://vercel.com) 并登录（可用 GitHub/GitLab 账号）。
   - 点击 **Add New… → Project**，选择 **Import Git Repository**，选中刚推送的仓库，点 **Import**。

3. **配置环境变量**
   - 在 **Environment Variables** 里添加（和本地 `.env` 一致）：
   - **用 OpenAI**：`OPENAI_API_KEY` = 你的 OpenAI Key。
   - **用 Kimi**：  
     `KIMI_API_KEY` = 你的 Kimi Key  
     `AI_BASE_URL` = `https://api.moonshot.cn/v1`  
     `AI_MODEL` = `moonshot-v1-8k`
   - 保存后点 **Deploy**。

4. **等构建完成**
   - 构建结束后会给你一个 `xxx.vercel.app` 的地址，打开即可使用。

### 方式二：用 Vercel CLI

1. 安装并登录（若未登录）：
   ```bash
   npm i -g vercel
   vercel login
   ```
2. 在项目根目录执行：
   ```bash
   vercel
   ```
   按提示关联项目、配置环境变量（或提前在 Vercel 网页里填好）。  
   正式上线用：`vercel --prod`。

## 技术栈

- Vue 3
- Vite
- Vercel AI SDK
- OpenAI API

## 许可证

MIT
