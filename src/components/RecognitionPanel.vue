<template>
  <div class="recognition-panel">
    <!-- 控制按钮 -->
    <div class="control-buttons">
      <button
        class="btn btn-lg"
        :class="{ 'btn-success': !recognitionActive, 'btn-warning': recognitionActive }"
        :disabled="!isReady || modelLoading"
        @click="toggleRecognition"
      >
        <span v-if="modelLoading">加载模型中...</span>
        <span v-else-if="!isReady">等待就绪...</span>
        <span v-else>{{ recognitionActive ? '停止识别' : '开始识别' }}</span>
      </button>
    </div>

    <!-- 识别结果 -->
    <div v-if="lastDetection" class="detection-result">
      <h3 class="result-title">最近识别</h3>
      <div class="result-card">
        <div class="result-item">
          <span class="result-label">类别:</span>
          <span class="result-value">{{ lastDetection.class }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">置信度:</span>
          <span class="result-value">{{ (lastDetection.score * 100).toFixed(1) }}%</span>
        </div>
        <div v-if="lastDetection.text" class="result-item">
          <span class="result-label">内容:</span>
          <span class="result-value">{{ lastDetection.text }}</span>
        </div>
        <div class="result-item">
          <span class="result-label">时间:</span>
          <span class="result-value">{{ formatTime(lastDetectionTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 状态信息 -->
    <div class="status-info">
      <div class="status-item">
        <span class="status-icon" :class="{ active: cameraActive }">●</span>
        <span>摄像头</span>
      </div>
      <div class="status-item">
        <span class="status-icon" :class="{ active: modelLoaded }">●</span>
        <span>AI 模型</span>
      </div>
      <div class="status-item">
        <span class="status-icon" :class="{ active: bgmPlaying }">●</span>
        <span>背景音乐</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores'

const appStore = useAppStore()
const {
  isReady,
  cameraActive,
  bgmPlaying,
  modelLoaded,
  modelLoading,
  recognitionActive,
  lastDetection,
  lastDetectionTime
} = storeToRefs(appStore)

const emit = defineEmits<{
  toggleRecognition: []
}>()

const toggleRecognition = () => {
  emit('toggleRecognition')
}

const formatTime = (timestamp: number) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN')
}
</script>

<style scoped>
.recognition-panel {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.control-buttons {
  margin-bottom: 1.5rem;
}

.btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn-success {
  background: #22c55e;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #16a34a;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.detection-result {
  margin-bottom: 1.5rem;
}

.result-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.result-card {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-label {
  color: #6b7280;
  font-weight: 500;
}

.result-value {
  color: #1f2937;
  font-weight: 600;
}

.status-info {
  display: flex;
  justify-content: space-around;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.status-icon {
  font-size: 1.5rem;
  color: #d1d5db;
  transition: color 0.3s;
}

.status-icon.active {
  color: #22c55e;
}
</style>
