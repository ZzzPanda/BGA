# 开发指南

## 项目架构详解

### 1. 技术选型理由

**为什么选择 Vue 3？**
- Composition API 更适合复杂逻辑复用
- 性能优秀，包体积小
- TypeScript 支持完善

**为什么选择 TensorFlow.js？**
- 纯前端实现，无需后端
- 丰富的预训练模型
- 支持 WebGL 加速

**为什么选择 Web Audio API？**
- 原生 API，无额外依赖
- 支持精确的音量控制
- 低延迟，适合实时混音

### 2. 关键功能实现

#### 摄像头流处理

```typescript
// 获取视频流
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'user',
    width: { ideal: 640 },
    height: { ideal: 480 }
  }
})

// 绑定到 video 元素
videoElement.srcObject = stream
```

#### 实时识别循环

```typescript
const recognitionLoop = async () => {
  // 1. 从视频流捕获帧
  const frame = captureFrame(videoElement)
  
  // 2. 使用 TensorFlow.js 进行推理
  const predictions = await model.detect(frame)
  
  // 3. 处理结果
  handlePredictions(predictions)
  
  // 4. 继续循环
  requestAnimationFrame(recognitionLoop)
}
```

#### 音频 Ducking 实现

```typescript
// 使用 GainNode 实现平滑音量过渡
const duckBGM = () => {
  const currentTime = audioContext.currentTime
  bgmGainNode.gain.linearRampToValueAtTime(
    0.2, // 降低到 20%
    currentTime + 0.5 // 0.5秒过渡
  )
}
```

### 3. 性能优化策略

#### 降低识别频率

```typescript
// 使用防抖，避免过度计算
const DETECTION_INTERVAL = 500 // 每 500ms 识别一次

let lastDetectionTime = 0
if (now - lastDetectionTime < DETECTION_INTERVAL) {
  return // 跳过本次识别
}
```

#### 降采样视频

```typescript
// 使用较低分辨率进行识别
canvas.width = 320  // 而不是 1920
canvas.height = 240 // 而不是 1080
```

#### 代码分割

```typescript
// vite.config.ts
manualChunks: {
  'tensorflow': ['@tensorflow/tfjs'],
  'vue-vendor': ['vue', 'vue-router', 'pinia']
}
```

### 4. 移动端适配

#### 视口设置

```html
<meta name="viewport" 
      content="width=device-width, initial-scale=1.0, 
               maximum-scale=1.0, user-scalable=no">
```

#### 触摸优化

```css
body {
  -webkit-tap-highlight-color: transparent;
  touch-action: pan-x pan-y;
}
```

#### iOS 视频播放

```html
<video playsinline autoplay muted></video>
```

### 5. 调试技巧

#### 查看 TensorFlow.js 后端

```javascript
console.log('Backend:', tf.getBackend())
console.log('Memory:', tf.memory())
```

#### 性能监控

```javascript
const start = performance.now()
await model.detect(image)
const duration = performance.now() - start
console.log(`Detection took ${duration}ms`)
```

#### 音频调试

```javascript
console.log('Audio context state:', audioContext.state)
console.log('Current gain:', bgmGainNode.gain.value)
```

## 扩展功能建议

### 1. 添加卡牌历史记录

```typescript
// stores/historyStore.ts
export const useHistoryStore = defineStore('history', () => {
  const history = ref<Detection[]>([])
  
  const addRecord = (detection: Detection) => {
    history.value.unshift(detection)
    if (history.value.length > 50) {
      history.value.pop()
    }
  }
  
  return { history, addRecord }
})
```

### 2. 添加自定义 TTS 语音

```typescript
// 列出可用语音
const voices = speechSynthesis.getVoices()

// 选择特定语音
utterance.voice = voices.find(v => v.name === 'Ting-Ting')
```

### 3. 添加识别置信度可视化

```vue
<div class="confidence-bar">
  <div 
    class="confidence-fill"
    :style="{ width: `${confidence * 100}%` }"
  ></div>
</div>
```

### 4. 离线支持（PWA）

```typescript
// Service Worker 缓存策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  )
})
```

## 常见问题排查

### 问题：模型加载很慢

**解决方案**:
1. 使用 CDN 加速模型文件
2. 使用更小的模型（lite_mobilenet_v2）
3. 添加加载进度提示

### 问题：识别准确率低

**解决方案**:
1. 训练自定义模型
2. 添加图像预处理（增强对比度、去噪）
3. 使用多帧融合提高稳定性

### 问题：音频混音不流畅

**解决方案**:
1. 增加淡入淡出时间
2. 使用 exponentialRampToValueAtTime 替代 linearRamp
3. 确保在主线程执行音频操作

## 测试建议

### 单元测试

```typescript
// tests/unit/AudioManager.spec.ts
describe('AudioManager', () => {
  it('should initialize audio context', async () => {
    await audioManager.initialize()
    expect(audioManager.initialized).toBe(true)
  })
})
```

### 集成测试

```typescript
// tests/integration/CardRecognition.spec.ts
describe('Card Recognition Flow', () => {
  it('should detect and speak card text', async () => {
    // 模拟卡牌出现
    // 验证识别结果
    // 验证 TTS 触发
  })
})
```

## 部署注意事项

### HTTPS 证书

生产环境必须使用有效的 HTTPS 证书：
- 推荐使用 Let's Encrypt 免费证书
- Vercel/Netlify 自动提供 HTTPS

### 环境变量

```env
VITE_API_BASE_URL=https://your-api.com
VITE_MODEL_URL=https://cdn.com/model
```

### CDN 加速

```typescript
// 使用 CDN 加载模型
const modelUrl = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd'
```

## 最佳实践

1. **错误边界**: 使用 Vue 的 errorHandler 捕获错误
2. **资源清理**: 组件卸载时清理摄像头和音频资源
3. **状态同步**: 使用 Pinia 集中管理状态
4. **代码分割**: 按需加载 TensorFlow.js
5. **性能监控**: 使用 Performance API 监控关键操作
