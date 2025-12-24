# 项目结构详解

## 📁 目录结构

```
BGA/
├── 📄 配置文件
│   ├── package.json           # 项目依赖和脚本
│   ├── tsconfig.json          # TypeScript 配置
│   ├── vite.config.ts         # Vite 构建配置
│   ├── .eslintrc.cjs          # ESLint 规则
│   ├── .prettierrc.json       # Prettier 格式化规则
│   └── .gitignore             # Git 忽略文件
│
├── 📄 文档
│   ├── README.md              # 项目说明
│   ├── TECH_STACK.md          # 技术选型说明
│   ├── DEVELOPMENT_GUIDE.md   # 开发指南
│   └── PROJECT_STRUCTURE.md   # 本文件
│
├── 🌐 入口文件
│   └── index.html             # HTML 入口
│
└── 📂 src/                    # 源代码目录
    ├── 🎨 components/         # Vue 组件
    │   ├── CameraView.vue          # 摄像头视图
    │   ├── AudioControls.vue       # 音频控制面板
    │   └── RecognitionPanel.vue    # 识别控制面板
    │
    ├── 📄 views/              # 页面视图
    │   └── HomeView.vue            # 主页面
    │
    ├── 🧠 services/           # 业务服务
    │   └── CardRecognitionService.ts  # 卡牌识别服务
    │
    ├── 🗄️ stores/             # 状态管理
    │   ├── appStore.ts             # 应用全局状态
    │   └── index.ts                # Store 导出
    │
    ├── 🛠️ utils/              # 工具类
    │   ├── AudioManager.ts         # 音频管理器
    │   ├── TTSManager.ts           # TTS 管理器
    │   └── CameraManager.ts        # 摄像头管理器
    │
    ├── 🚦 router/             # 路由配置
    │   └── index.ts
    │
    ├── App.vue                # 根组件
    ├── main.ts                # 应用入口
    └── vite-env.d.ts          # 类型声明
```

## 📦 核心模块说明

### 1. 工具类 (utils/)

#### AudioManager.ts
**职责**: 管理背景音乐播放和音量控制
**核心功能**:
- 使用 Web Audio API 创建音频上下文
- 实现 BGM 循环播放
- 提供音量动态调节（Ducking）
- 平滑的淡入淡出效果

**关键方法**:
```typescript
- initialize(): 初始化音频上下文
- loadBGM(url): 加载背景音乐
- playBGM(): 播放 BGM
- duckBGM(): 降低 BGM 音量
- unduckBGM(): 恢复 BGM 音量
```

#### TTSManager.ts
**职责**: 管理文字转语音功能
**核心功能**:
- 使用 Web Speech API 进行语音合成
- 朗读队列管理
- 与 AudioManager 协同工作

**关键方法**:
```typescript
- speak(text, options): 朗读文本
- cancel(): 取消当前朗读
- pause()/resume(): 暂停/恢复朗读
```

#### CameraManager.ts
**职责**: 管理摄像头访问和视频流
**核心功能**:
- 请求摄像头权限
- 配置摄像头参数（分辨率、帧率）
- 捕获视频帧
- 摄像头切换（前置/后置）

**关键方法**:
```typescript
- initialize(videoElement, constraints): 初始化摄像头
- captureFrame(canvas): 捕获当前帧
- switchCamera(): 切换摄像头
- stop(): 停止摄像头
```

### 2. 服务层 (services/)

#### CardRecognitionService.ts
**职责**: 卡牌识别核心逻辑
**核心功能**:
- 加载 TensorFlow.js 模型
- 实时物体检测
- 卡牌数据库匹配
- 性能优化（防抖、节流）

**关键方法**:
```typescript
- initialize(): 加载模型
- loadCardDatabase(cards): 加载卡牌数据
- detect(imageElement): 检测物体
- recognizeCard(imageElement): 识别卡牌
```

**数据流**:
```
Video Frame → TensorFlow.js → Detection Results → Card Matching → TTS
```

### 3. 状态管理 (stores/)

#### appStore.ts
**职责**: 全局应用状态管理
**状态分类**:

1. **摄像头状态**
   - cameraActive: 摄像头是否激活
   - cameraError: 摄像头错误信息

2. **音频状态**
   - bgmPlaying: BGM 播放状态
   - bgmVolume: BGM 音量
   - ttsSpeaking: TTS 朗读状态

3. **识别状态**
   - modelLoaded: 模型加载状态
   - recognitionActive: 识别激活状态
   - lastDetection: 最新识别结果

4. **系统设置**
   - detectionInterval: 识别间隔
   - confidenceThreshold: 置信度阈值
   - autoSpeak: 自动朗读开关

### 4. 组件层 (components/)

#### CameraView.vue
**职责**: 显示摄像头画面和检测结果
**功能**:
- 渲染视频流
- 绘制检测框（Canvas 覆盖层）
- 显示状态指示器
- 错误提示

#### AudioControls.vue
**职责**: 音频和识别设置控制面板
**功能**:
- BGM 播放控制
- 音量调节滑块
- TTS 开关
- 识别参数设置

#### RecognitionPanel.vue
**职责**: 识别控制和结果显示
**功能**:
- 开始/停止识别按钮
- 显示识别结果
- 系统状态指示器

### 5. 视图层 (views/)

#### HomeView.vue
**职责**: 主页面，组装所有组件
**功能**:
- 组件布局和协调
- 识别循环逻辑
- 事件处理和状态同步

## 🔄 数据流向

### 识别流程
```
1. 用户点击"开始识别" 
   ↓
2. HomeView 启动识别循环
   ↓
3. CameraManager 捕获视频帧
   ↓
4. CardRecognitionService 进行 AI 识别
   ↓
5. 更新 appStore 状态
   ↓
6. 触发 TTSManager 朗读
   ↓
7. AudioManager 降低 BGM 音量
   ↓
8. 朗读完成后恢复 BGM
   ↓
9. 回到步骤 3（循环）
```

### 状态更新流程
```
Component → Action → Store → Reactive Update → Component
```

## 🎯 关键交互点

### 1. 摄像头 ↔ 识别服务
```typescript
// CameraView 捕获帧
const frame = cameraManager.captureFrame(canvas)

// 传递给识别服务
const result = await cardRecognitionService.detect(frame)
```

### 2. 识别服务 ↔ TTS
```typescript
// 识别到卡牌
const result = await recognizeCard(video)

// 触发朗读
if (result.text) {
  await ttsManager.speak(result.text)
}
```

### 3. TTS ↔ 音频管理
```typescript
// TTS 开始朗读前
audioManager.duckBGM()

// TTS 朗读结束后
audioManager.unduckBGM()
```

## 🚀 扩展点

### 添加新卡牌类型
编辑 `services/CardRecognitionService.ts`:
```typescript
export const SAMPLE_CARD_DATABASE: CardData[] = [
  {
    id: 'new_card',
    name: '新卡牌',
    text: '朗读内容',
    keywords: ['keyword1', 'keyword2']
  }
]
```

### 添加新的识别模型
替换 `CardRecognitionService.initialize()`:
```typescript
this.model = await tf.loadGraphModel('custom-model-url')
```

### 添加新的音频效果
扩展 `AudioManager.ts`:
```typescript
addReverb() {
  const convolver = this.audioContext.createConvolver()
  // 添加混响效果
}
```

## 📊 性能考虑

### 关键性能指标
- 模型加载时间: < 3s
- 单次识别时间: < 100ms
- 视频帧率: 30fps
- 音频延迟: < 50ms

### 优化策略
1. **懒加载**: TensorFlow.js 模型按需加载
2. **代码分割**: 将大型库单独打包
3. **降采样**: 使用低分辨率进行识别
4. **防抖**: 控制识别频率
5. **缓存**: 模型和资源缓存

## 🔧 配置文件说明

### vite.config.ts
- **server.https**: 启用 HTTPS（摄像头必需）
- **server.host**: 允许局域网访问
- **build.rollupOptions**: 代码分割配置
- **optimizeDeps**: 依赖预构建优化

### tsconfig.json
- **paths**: 路径别名 `@` → `src`
- **strict**: 严格类型检查
- **target**: ES2020 编译目标

## 📱 移动端特殊处理

### iOS Safari
- `playsinline` 属性必需
- 音频播放需要用户手势触发
- 禁用双指缩放

### Android Chrome
- 摄像头权限显式请求
- 启用硬件加速

## 🧪 测试策略

### 单元测试
- 工具类方法测试
- 服务层逻辑测试

### 集成测试
- 识别流程测试
- 音频混音测试

### E2E 测试
- 完整用户流程测试
- 多设备兼容性测试
