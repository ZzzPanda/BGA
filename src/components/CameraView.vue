<template>
  <div class="camera-view">
    <div class="video-container">
      <video
        ref="videoRef"
        class="video-stream"
        playsinline
        autoplay
        muted
      ></video>

      <!-- 检测结果覆盖层 -->
      <canvas
        ref="canvasRef"
        class="detection-overlay"
      ></canvas>

      <!-- 状态指示器 -->
      <div class="status-indicators">
        <div v-if="!cameraActive" class="status-badge error">
          摄像头未启动
        </div>
        <div v-else-if="recognitionActive" class="status-badge success">
          识别中...
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="cameraError" class="error-message">
      {{ cameraError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores'
import { cameraManager } from '@/utils/CameraManager'

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const appStore = useAppStore()
const { cameraActive, cameraError, recognitionActive } = storeToRefs(appStore)

// 初始化摄像头
const initCamera = async () => {
  if (!videoRef.value) return

  try {
    await cameraManager.initialize(videoRef.value, {
      facingMode: 'user',
      width: 640,
      height: 480
    })
    appStore.setCameraActive(true)
  } catch (error) {
    console.error('Camera initialization failed:', error)
    appStore.setCameraError((error as Error).message)
  }
}

// 停止摄像头
const stopCamera = () => {
  cameraManager.stop()
  appStore.setCameraActive(false)
}

// 绘制检测框
const drawDetections = (detections: any[]) => {
  if (!canvasRef.value || !videoRef.value) return

  const canvas = canvasRef.value
  const video = videoRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置 canvas 尺寸
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制检测框
  detections.forEach((detection) => {
    const [x, y, width, height] = detection.bbox

    // 绘制矩形框
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 3
    ctx.strokeRect(x, y, width, height)

    // 绘制标签
    ctx.fillStyle = '#00ff00'
    ctx.font = '18px Arial'
    ctx.fillText(
      `${detection.class} ${(detection.score * 100).toFixed(0)}%`,
      x,
      y > 20 ? y - 5 : y + height + 20
    )
  })
}

// 暴露方法给父组件
defineExpose({
  videoElement: videoRef,
  canvasElement: canvasRef,
  drawDetections
})

onMounted(() => {
  initCamera()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.camera-view {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
}

.video-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.video-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.status-indicators {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.status-badge.success {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.status-badge.error {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.error-message {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(239, 68, 68, 0.95);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  max-width: 90%;
  text-align: center;
  z-index: 20;
}
</style>
