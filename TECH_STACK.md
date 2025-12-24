# 技术选型说明

## 核心技术栈

### 前端框架
- **Vue 3.4+** - 使用 Composition API，性能优秀，适合移动端
- **TypeScript 5.4+** - 类型安全，提升代码可维护性
- **Vite 5.1+** - 快速的开发服务器和优化的构建工具

### 状态管理
- **Pinia 2.1+** - Vue 3 官方推荐的状态管理库，轻量级且类型友好

### 路由
- **Vue Router 4.3+** - Vue 3 官方路由解决方案

### 机器学习 & 计算机视觉
- **TensorFlow.js 4.17+** - 浏览器端机器学习框架
- **COCO-SSD 模型** - 预训练的物体检测模型（可替换为自定义卡牌识别模型）

### 音频处理
- **Web Audio API** - 原生浏览器 API，实现 BGM 和 TTS 混音
- **Howler.js 2.2+** - 音频库，简化音频管理和跨浏览器兼容性
- **Web Speech API** - 浏览器原生 TTS（语音合成）

### PWA 支持
- **vite-plugin-pwa** - 渐进式 Web 应用支持，离线访问

## 技术决策说明

### 1. 为什么选择 TensorFlow.js？
- ✅ 纯前端实现，无需后端服务器
- ✅ 实时性能好，适合移动端
- ✅ 丰富的预训练模型
- ✅ 支持自定义模型训练和部署

### 2. 音频架构设计
```
Web Audio API (AudioContext)
├── BGM Track (GainNode for volume control)
├── TTS Track (Web Speech API → MediaStreamDestination)
└── Master Output (动态混音)
```

### 3. 卡牌识别方案
- **方案 A（推荐）**: 使用 COCO-SSD 进行物体检测，结合 OCR 识别卡牌文字
- **方案 B**: 训练自定义 TensorFlow.js 模型识别特定卡牌
- **方案 C**: 使用 AR.js + 标记识别（需要卡牌上有特定标记）

本项目采用方案 A 作为起点，便于快速原型开发。

### 4. 移动端优化策略
- 使用 `vw/vh` 单位实现响应式布局
- 启用硬件加速（CSS `transform` 和 `will-change`）
- 懒加载 TensorFlow.js 模型
- 视频流降采样（降低分辨率以减少计算量）
- 节流和防抖控制识别频率

### 5. 性能优化
- **代码分割**: TensorFlow 和 Vue 分别打包
- **Tree Shaking**: 移除未使用代码
- **Worker 线程**: 将识别逻辑移到 Web Worker（可选）
- **RequestAnimationFrame**: 优化视频帧处理

## 安装依赖

```bash
npm install
```

主要依赖说明：
- `vue`, `vue-router`, `pinia` - 核心框架
- `@tensorflow/tfjs`, `@tensorflow-models/coco-ssd` - 机器学习
- `howler` - 音频管理（可选，用于简化 BGM 控制）
- `vite-plugin-pwa` - PWA 支持

## 浏览器兼容性

### 必需特性
- ✅ ES2020+ 支持
- ✅ Web Audio API
- ✅ getUserMedia (摄像头访问)
- ✅ Web Speech API (TTS)
- ✅ WebGL (TensorFlow.js 需要)

### 测试通过的浏览器
- Chrome/Edge 90+
- Safari 14+ (iOS)
- Firefox 88+

### 注意事项
⚠️ **必须使用 HTTPS** - 摄像头访问需要安全上下文
⚠️ **iOS Safari 限制** - 需要用户手势触发音频播放
