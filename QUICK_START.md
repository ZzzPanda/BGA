# 快速启动指南 ⚡

## 1️⃣ 前置要求

### 系统要求
- Node.js 18+ 
- npm 9+ 或 pnpm 8+
- 现代浏览器（Chrome 90+, Safari 14+, Firefox 88+）

### 硬件要求
- 摄像头（前置或后置）
- 支持 WebGL 的 GPU（用于 TensorFlow.js）

## 2️⃣ 安装步骤

### Step 1: 克隆或初始化项目

如果项目已存在：
```bash
cd BGA
```

如果是新项目：
```bash
mkdir card-recognition-app
cd card-recognition-app
```

### Step 2: 安装依赖

```bash
npm install
```

安装过程大约需要 1-2 分钟，主要依赖：
- Vue 3 生态系统
- TensorFlow.js（~50MB）
- TypeScript 编译器

### Step 3: 启动开发服务器

```bash
npm run dev
```

看到以下输出表示启动成功：
```
  VITE v5.1.6  ready in 324 ms

  ➜  Local:   https://localhost:5173/
  ➜  Network: https://192.168.1.100:5173/
```

## 3️⃣ 访问应用

### 在电脑上访问

打开浏览器访问：
```
https://localhost:5173
```

⚠️ 浏览器会提示"不安全的连接"，这是正常的（开发环境自签名证书）。
点击 **"高级"** → **"继续访问"**

### 在手机上访问

1. **确保手机和电脑在同一 WiFi 网络**

2. **查看电脑 IP 地址**:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

3. **在手机浏览器访问**:
   ```
   https://<你的电脑IP>:5173
   ```
   例如: `https://192.168.1.100:5173`

4. **允许不安全的连接**（同电脑操作）

## 4️⃣ 首次使用

### 授予权限

首次打开应用时，浏览器会请求权限：

1. **摄像头权限** ✓
   - 点击 "允许"
   - iOS Safari: 可能需要在设置中手动允许

2. **通知权限** （可选）
   - 用于 PWA 通知功能

### 初始化过程

应用启动时会自动：
1. ✅ 初始化音频上下文
2. ✅ 加载 AI 模型（首次需要下载 ~30MB，后续会缓存）
3. ✅ 启动摄像头

状态指示器会显示：
- 🟢 摄像头已就绪
- 🟢 AI 模型已加载
- 🟢 背景音乐已初始化

## 5️⃣ 基本操作

### 开始识别

1. 点击 **"开始识别"** 按钮
2. 将卡牌（或任何物体）对准摄像头
3. 应用会自动识别并朗读

### 调整设置

#### BGM 控制
- 点击 **"播放 BGM"** 开始播放背景音乐
- 拖动音量滑块调整音量

#### 识别设置
- **自动朗读**: 勾选后识别到卡牌自动朗读
- **置信度阈值**: 调整识别的灵敏度（默认 60%）

### 查看结果

识别成功后，面板会显示：
- 识别类别
- 置信度
- 关联文本（如果有）
- 识别时间

## 6️⃣ 常见问题快速修复

### ❌ 摄像头无法访问

**检查清单**:
```bash
✓ 是否使用 HTTPS？
✓ 浏览器是否已授予摄像头权限？
✓ 摄像头是否被其他应用占用？
```

**解决方案**:
1. 刷新页面重新授权
2. 检查浏览器设置 → 隐私 → 摄像头权限
3. 关闭其他使用摄像头的应用

### ❌ AI 模型加载失败

**原因**: 网络问题或 CDN 不可达

**解决方案**:
```bash
# 检查网络连接
ping google.com

# 清除缓存重新加载
rm -rf node_modules/.vite
npm run dev
```

### ❌ TTS 不朗读

**iOS 设备**:
- 进入 设置 → Siri 与搜索 → 启用 Siri

**Android 设备**:
- 进入 设置 → 语言和输入法 → 文字转语音输出

### ❌ 识别不准确

**优化方法**:
1. 改善光线条件（避免过暗或过亮）
2. 降低置信度阈值（如设为 50%）
3. 物体距离摄像头 20-50cm 为宜
4. 保持物体静止 1-2 秒

## 7️⃣ 自定义配置

### 添加自己的卡牌

编辑 `src/services/CardRecognitionService.ts`:

```typescript
export const SAMPLE_CARD_DATABASE: CardData[] = [
  {
    id: 'my_card_001',
    name: '我的卡牌',
    text: '这是我要朗读的内容',
    keywords: ['book', 'card'] // 匹配 AI 识别的类别
  }
]
```

### 更换背景音乐

1. 将 MP3 文件放到 `public/audio/` 目录:
   ```bash
   mkdir -p public/audio
   cp your-music.mp3 public/audio/bgm.mp3
   ```

2. 编辑 `src/views/HomeView.vue`:
   ```typescript
   await audioManager.loadBGM('/audio/bgm.mp3')
   ```

### 调整识别参数

编辑 `src/stores/appStore.ts`:

```typescript
const detectionInterval = ref(300)  // 更频繁识别
const confidenceThreshold = ref(0.5) // 更低阈值
```

## 8️⃣ 构建生产版本

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

构建产物在 `dist/` 目录，可以部署到任何静态服务器。

## 9️⃣ 调试技巧

### 查看控制台日志

按 F12 打开开发者工具，查看日志：
```javascript
Camera initialized successfully
Model loaded successfully
TensorFlow backend: webgl
BGM playing
TTS: Started speaking
```

### 性能监控

在控制台运行：
```javascript
// 查看 TensorFlow 内存使用
tf.memory()

// 查看音频状态
audioManager.getState()

// 查看摄像头状态
cameraManager.isActive
```

## 🎯 下一步

- 📖 阅读 [开发指南](DEVELOPMENT_GUIDE.md) 了解架构
- 🏗️ 查看 [项目结构](PROJECT_STRUCTURE.md) 理解代码组织
- 🔧 参考 [技术选型](TECH_STACK.md) 深入技术细节

## 📞 获取帮助

遇到问题？
1. 查看 [README.md](README.md) 常见问题
2. 查看浏览器控制台错误信息
3. 提交 Issue 到项目仓库

祝你使用愉快！🎉
