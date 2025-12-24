# 安装与部署指南 🚀

## 目录
1. [本地开发](#本地开发)
2. [生产构建](#生产构建)
3. [部署到云平台](#部署到云平台)
4. [HTTPS 配置](#https-配置)
5. [故障排查](#故障排查)

---

## 本地开发

### 前置条件
```bash
node -v    # 需要 v18.0.0+
npm -v     # 需要 v9.0.0+
```

### 步骤

#### 1. 安装依赖
```bash
npm install
```

预计安装时间：2-3 分钟
主要依赖包大小：
- TensorFlow.js: ~50MB
- Vue 3: ~3MB
- 其他依赖: ~20MB

#### 2. 启动开发服务器
```bash
npm run dev
```

成功启动后会看到：
```
VITE v5.1.6  ready in 324 ms

➜  Local:   https://localhost:5173/
➜  Network: https://192.168.1.100:5173/
```

#### 3. 访问应用
- 桌面端: https://localhost:5173
- 移动端: https://[你的IP]:5173

---

## 生产构建

### 构建命令
```bash
npm run build
```

构建输出:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # 主应用代码
│   ├── tensorflow-[hash].js # TensorFlow.js
│   ├── vue-vendor-[hash].js # Vue 生态
│   └── index-[hash].css     # 样式文件
└── audio/                    # 音频资源
```

### 预览构建结果
```bash
npm run preview
```

### 构建优化
```bash
# 分析包大小
npm install -D rollup-plugin-visualizer
```

---

## 部署到云平台

### 1. Vercel (推荐)

#### 通过 CLI 部署
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

#### 通过 GitHub 自动部署
1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 连接 GitHub 仓库
4. 自动检测 Vite 项目并部署

#### 配置文件 (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

---

### 2. Netlify

#### 通过 CLI 部署
```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 初始化
netlify init

# 部署
netlify deploy --prod
```

#### 配置文件 (netlify.toml)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 3. GitHub Pages

#### 配置 vite.config.ts
```typescript
export default defineConfig({
  base: '/your-repo-name/', // 替换为你的仓库名
  // ...
})
```

#### 部署脚本 (deploy.sh)
```bash
#!/bin/bash

# 构建
npm run build

# 进入构建目录
cd dist

# 初始化 Git
git init
git add -A
git commit -m 'Deploy'

# 推送到 gh-pages 分支
git push -f git@github.com:username/repo.git main:gh-pages

cd -
```

#### 执行部署
```bash
chmod +x deploy.sh
./deploy.sh
```

---

### 4. 自托管服务器

#### 使用 Nginx

1. **构建项目**
```bash
npm run build
```

2. **上传到服务器**
```bash
scp -r dist/* user@server:/var/www/card-recognition
```

3. **Nginx 配置**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/card-recognition;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

4. **重启 Nginx**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## HTTPS 配置

⚠️ **重要**: 摄像头访问必须使用 HTTPS

### 开发环境

Vite 已自动配置自签名证书：
```typescript
// vite.config.ts
server: {
  https: true
}
```

### 生产环境

#### 方案 1: Let's Encrypt (免费)
```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

#### 方案 2: 云平台自动 HTTPS
- Vercel: 自动提供
- Netlify: 自动提供
- Cloudflare: 自动提供

---

## 环境变量

创建 `.env` 文件：
```env
# API 配置
VITE_API_BASE_URL=https://api.example.com

# TensorFlow 模型 URL
VITE_MODEL_URL=https://cdn.example.com/model

# 功能开关
VITE_ENABLE_ANALYTICS=true
```

使用：
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

---

## Docker 部署

### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped
```

### 构建和运行
```bash
docker-compose up -d
```

---

## 性能优化

### 1. 启用 CDN
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    external: ['@tensorflow/tfjs'],
    output: {
      paths: {
        '@tensorflow/tfjs': 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs'
      }
    }
  }
}
```

### 2. 资源预加载
```html
<link rel="preload" href="/model.json" as="fetch" crossorigin>
```

### 3. Service Worker 缓存
已通过 vite-plugin-pwa 自动配置

---

## 故障排查

### 问题 1: 构建失败
```bash
# 清除缓存
rm -rf node_modules package-lock.json
npm install

# 清除 Vite 缓存
rm -rf node_modules/.vite
```

### 问题 2: HTTPS 证书错误
- 开发环境: 浏览器选择"继续访问"
- 生产环境: 检查证书是否过期

### 问题 3: 摄像头无法访问
- 确保使用 HTTPS
- 检查浏览器权限设置
- 查看控制台错误信息

### 问题 4: 部署后白屏
- 检查 base 路径配置
- 查看浏览器控制台错误
- 确认资源路径正确

### 问题 5: TensorFlow.js 加载失败
```bash
# 检查网络连接
curl -I https://cdn.jsdelivr.net/npm/@tensorflow/tfjs

# 使用备用 CDN
# 编辑 src/services/CardRecognitionService.ts
```

---

## 监控和日志

### 添加错误监控
```typescript
// main.ts
import * as Sentry from '@sentry/vue'

Sentry.init({
  app,
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.MODE
})
```

### 性能监控
```typescript
// 监控模型加载时间
const start = performance.now()
await model.load()
console.log(`Model loaded in ${performance.now() - start}ms`)
```

---

## 更新和维护

### 更新依赖
```bash
# 检查过时的包
npm outdated

# 更新所有依赖
npm update

# 更新主要版本
npm install vue@latest
```

### 安全审计
```bash
npm audit
npm audit fix
```

---

## 支持和帮助

- 📖 文档: [README.md](README.md)
- 🐛 报告问题: GitHub Issues
- 💬 讨论: GitHub Discussions

---

祝部署顺利！🎉
