# 卡牌识别系统 (Card Recognition App)

一个基于 Vue3 + TypeScript + TensorFlow.js 的实时卡牌识别与语音朗读应用，专为移动端优化。

## 功能特性

✅ **实时摄像头识别** - 使用前置摄像头实时检测卡牌
✅ **AI 物体检测** - 基于 TensorFlow.js 和 COCO-SSD 模型
✅ **语音朗读** - 使用 Web Speech API 实现 TTS
✅ **智能音频混音** - BGM 与 TTS 自动混音，朗读时降低背景音乐
✅ **移动端优化** - 响应式设计，触摸友好
✅ **PWA 支持** - 可安装为独立应用

## 技术栈

- **前端框架**: Vue 3.4 + TypeScript 5.4
- **构建工具**: Vite 5.1
- **状态管理**: Pinia 2.1
- **路由**: Vue Router 4.3
- **AI/ML**: TensorFlow.js 4.17 + COCO-SSD
- **音频**: Web Audio API + Howler.js
- **TTS**: Web Speech API

## 项目结构

```
card-recognition-app/
├── public/                 # 静态资源
├── src/
│   ├── components/         # Vue 组件
│   │   ├── CameraView.vue          # 摄像头视图组件
│   │   ├── AudioControls.vue       # 音频控制组件
│   │   └── RecognitionPanel.vue    # 识别控制面板
│   ├── views/              # 页面视图
│   │   └── HomeView.vue            # 主页面
│   ├── services/           # 业务服务
│   │   └── CardRecognitionService.ts  # 卡牌识别服务
│   ├── stores/             # Pinia 状态管理
│   │   ├── appStore.ts             # 应用状态
│   │   └── index.ts
│   ├── utils/              # 工具类
│   │   ├── AudioManager.ts         # 音频管理器
│   │   ├── TTSManager.ts           # TTS 管理器
│   │   └── CameraManager.ts        # 摄像头管理器
│   ├── router/             # 路由配置
│   │   └── index.ts
│   ├── App.vue             # 根组件
│   ├── main.ts             # 应用入口
│   └── vite-env.d.ts       # TypeScript 类型声明
├── index.html              # HTML 入口
├── package.json            # 依赖配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 项目文档
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
npm run dev
```

⚠️ **重要**: 摄像头访问需要 HTTPS，Vite 配置已启用 HTTPS。

访问地址：`https://localhost:5173`

如果浏览器提示证书不安全，选择"继续前往"（开发环境正常现象）。

### 3. 手机测试

在同一局域网下，使用手机访问：

```
https://<你的电脑IP>:5173
```

获取电脑 IP:
- macOS: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`
- Linux: `ip addr show`

### 4. 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 5. 预览生产版本

```bash
npm run preview
```

## 核心功能说明

### 1. 摄像头管理 (CameraManager)

**位置**: `src/utils/CameraManager.ts`

**功能**:
- 请求摄像头权限
- 初始化前置摄像头
- 捕获视频帧
- 移动端优化（降低分辨率）

**使用示例**:
```typescript
import { cameraManager } from '@/utils/CameraManager'

await cameraManager.initialize(videoElement, {
  facingMode: 'user',
  width: 640,
  height: 480
})
```

### 2. 音频管理 (AudioManager)

**位置**: `src/utils/AudioManager.ts`

**功能**:
- BGM 循环播放
- 动态音量控制
- 实现 Ducking 效果（朗读时降低 BGM）
- 使用 GainNode 平滑过渡

### 3. TTS 管理 (TTSManager)

**位置**: `src/utils/TTSManager.ts`

**功能**:
- 文字转语音
- 朗读队列管理
- 与 AudioManager 协同

### 4. 卡牌识别服务 (CardRecognitionService)

**位置**: `src/services/CardRecognitionService.ts`

**功能**:
- 加载 TensorFlow.js 模型
- 实时物体检测
- 卡牌数据库匹配
- 防抖优化

## 常见问题

**Q: 摄像头无法访问？**
A: 1) 确保使用 HTTPS 2) 检查浏览器权限设置 3) 确认摄像头未被占用

**Q: TTS 不工作？**
A: 1) 检查浏览器是否支持 Web Speech API 2) iOS 需要启用 Siri 3) 确保设备未静音

**Q: 识别效果不好？**
A: 1) 调低置信度阈值 2) 改善光线条件 3) 使用自定义模型

## License

MIT
