<template>
  <div class="audio-controls">
    <!-- BGM 控制 -->
    <div class="control-section">
      <h3 class="control-title">背景音乐</h3>
      <div class="control-row">
        <button
          class="btn"
          :class="{ 'btn-primary': !bgmPlaying, 'btn-danger': bgmPlaying }"
          @click="toggleBGM"
        >
          {{ bgmPlaying ? '停止 BGM' : '播放 BGM' }}
        </button>
      </div>

      <div class="control-row">
        <label class="control-label">音量</label>
        <input
          type="range"
          min="0"
          max="100"
          :value="bgmVolume * 100"
          @input="onVolumeChange"
          class="slider"
        />
        <span class="value-display">{{ Math.round(bgmVolume * 100) }}%</span>
      </div>
    </div>

    <!-- TTS 控制 -->
    <div class="control-section">
      <h3 class="control-title">语音朗读</h3>
      <div class="control-row">
        <label class="control-label">启用朗读</label>
        <input
          type="checkbox"
          :checked="ttsEnabled"
          @change="toggleTTS"
          class="checkbox"
        />
      </div>

      <div v-if="ttsSpeaking" class="speaking-indicator">
        正在朗读...
      </div>
    </div>

    <!-- 识别设置 -->
    <div class="control-section">
      <h3 class="control-title">识别设置</h3>
      <div class="control-row">
        <label class="control-label">自动朗读</label>
        <input
          type="checkbox"
          :checked="autoSpeak"
          @change="toggleAutoSpeak"
          class="checkbox"
        />
      </div>

      <div class="control-row">
        <label class="control-label">置信度阈值</label>
        <input
          type="range"
          min="0"
          max="100"
          :value="confidenceThreshold * 100"
          @input="onThresholdChange"
          class="slider"
        />
        <span class="value-display">{{ Math.round(confidenceThreshold * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores'
import { audioManager } from '@/utils/AudioManager'

const appStore = useAppStore()
const {
  bgmPlaying,
  bgmVolume,
  ttsEnabled,
  ttsSpeaking,
  autoSpeak,
  confidenceThreshold
} = storeToRefs(appStore)

// Emits
const emit = defineEmits<{
  bgmToggle: [playing: boolean]
  ttsToggle: [enabled: boolean]
}>()

// 切换 BGM
const toggleBGM = () => {
  emit('bgmToggle', !bgmPlaying.value)
}

// 切换 TTS
const toggleTTS = () => {
  const newValue = !ttsEnabled.value
  appStore.setTtsEnabled(newValue)
  emit('ttsToggle', newValue)
}

// 切换自动朗读
const toggleAutoSpeak = () => {
  appStore.updateSettings({
    autoSpeak: !autoSpeak.value
  })
}

// 音量变化
const onVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const volume = parseInt(target.value) / 100
  appStore.setBgmVolume(volume)
  audioManager.setBGMVolume(volume)
}

// 阈值变化
const onThresholdChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const threshold = parseInt(target.value) / 100
  appStore.updateSettings({
    confidenceThreshold: threshold
  })
}
</script>

<style scoped>
.audio-controls {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.control-section {
  margin-bottom: 1.5rem;
}

.control-section:last-child {
  margin-bottom: 0;
}

.control-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.control-label {
  font-size: 0.875rem;
  color: #4b5563;
  min-width: 80px;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}

.checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.value-display {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  min-width: 45px;
  text-align: right;
}

.speaking-indicator {
  padding: 0.5rem 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 2px solid #22c55e;
  border-radius: 0.5rem;
  color: #16a34a;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
