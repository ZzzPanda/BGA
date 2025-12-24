<template>
  <div class="home-view">
    <!-- 摄像头视图 -->
    <div class="camera-section">
      <CameraView ref="cameraViewRef" />
    </div>

    <!-- 控制面板 -->
    <div class="controls-section">
      <!-- 识别控制 -->
      <RecognitionPanel @toggle-recognition="handleToggleRecognition" />

      <!-- 音频控制（可折叠） -->
      <div class="collapsible-section">
        <button class="section-toggle" @click="showAudioControls = !showAudioControls">
          <span>音频设置</span>
          <span class="toggle-icon">{{ showAudioControls ? '▼' : '▶' }}</span>
        </button>
        <transition name="slide">
          <AudioControls
            v-if="showAudioControls"
            @bgm-toggle="handleBGMToggle"
            @tts-toggle="handleTTSToggle"
          />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores'
import CameraView from '@/components/CameraView.vue'
import RecognitionPanel from '@/components/RecognitionPanel.vue'
import AudioControls from '@/components/AudioControls.vue'
import { audioManager } from '@/utils/AudioManager'
import { ttsManager } from '@/utils/TTSManager'
import { cardRecognitionService, SAMPLE_CARD_DATABASE } from '@/services/CardRecognitionService'

const cameraViewRef = ref<InstanceType<typeof CameraView> | null>(null)
const showAudioControls = ref(false)

const appStore = useAppStore()
const { recognitionActive, canDetect, autoSpeak, confidenceThreshold } = storeToRefs(appStore)

let recognitionTimer: number | null = null

// 初始化应用
onMounted(async () => {
  try {
    // 初始化音频管理器（需要用户交互触发）
    await audioManager.initialize()

    // 加载 AI 模型
    appStore.setModelLoading(true)
    await cardRecognitionService.initialize()
    cardRecognitionService.loadCardDatabase(SAMPLE_CARD_DATABASE)
    appStore.setModelLoaded(true)

    console.log('Application initialized successfully')
  } catch (error) {
    console.error('Initialization error:', error)
  }
})

// 清理资源
onUnmounted(() => {
  stopRecognition()
  audioManager.dispose()
  cardRecognitionService.dispose()
})

// 处理 BGM 切换
const handleBGMToggle = async (playing: boolean) => {
  try {
    if (playing) {
      // 这里需要加载实际的 BGM 文件
      // await audioManager.loadBGM('/path/to/bgm.mp3')
      // audioManager.playBGM()
      appStore.setBgmPlaying(true)
      console.log('BGM playback started (需要实际音频文件)')
    } else {
      audioManager.stopBGM()
      appStore.setBgmPlaying(false)
    }
  } catch (error) {
    console.error('BGM toggle error:', error)
  }
}

// 处理 TTS 切换
const handleTTSToggle = (enabled: boolean) => {
  if (!enabled) {
    ttsManager.cancel()
  }
}

// 处理识别切换
const handleToggleRecognition = () => {
  if (recognitionActive.value) {
    stopRecognition()
  } else {
    startRecognition()
  }
}

// 开始识别
const startRecognition = () => {
  appStore.setRecognitionActive(true)
  runRecognitionLoop()
}

// 停止识别
const stopRecognition = () => {
  appStore.setRecognitionActive(false)
  if (recognitionTimer) {
    clearTimeout(recognitionTimer)
    recognitionTimer = null
  }
}

// 识别循环
const runRecognitionLoop = async () => {
  if (!canDetect.value) {
    recognitionTimer = window.setTimeout(runRecognitionLoop, 100)
    return
  }

  try {
    const videoElement = cameraViewRef.value?.videoElement
    if (!videoElement) return

    // 执行识别
    const result = await cardRecognitionService.recognizeCard(videoElement)

    if (result && result.confidence >= confidenceThreshold.value) {
      console.log('Card detected:', result)

      // 更新最新检测结果
      appStore.updateLastDetection({
        class: 'Card',
        score: result.confidence,
        bbox: [0, 0, 0, 0],
        text: result.text
      })

      // 自动朗读
      if (autoSpeak.value && result.text) {
        appStore.setTtsSpeaking(true)
        await ttsManager.speak(result.text)
        appStore.setTtsSpeaking(false)
      }
    }

    // 绘制检测结果
    const detections = await cardRecognitionService.detect(videoElement)
    cameraViewRef.value?.drawDetections(detections)
  } catch (error) {
    console.error('Recognition error:', error)
  }

  // 继续循环
  if (recognitionActive.value) {
    recognitionTimer = window.setTimeout(runRecognitionLoop, 100)
  }
}
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.camera-section {
  flex: 1;
  min-height: 0;
  position: relative;
}

.controls-section {
  flex-shrink: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 50vh;
  overflow-y: auto;
}

.collapsible-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  overflow: hidden;
}

.section-toggle {
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  transition: background 0.2s;
}

.section-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.toggle-icon {
  font-size: 0.875rem;
  color: #6b7280;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* 移动端优化 */
@media (min-width: 768px) {
  .home-view {
    flex-direction: row;
  }

  .camera-section {
    flex: 1;
  }

  .controls-section {
    width: 400px;
    max-height: 100vh;
  }
}
</style>
