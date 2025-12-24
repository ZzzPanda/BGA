/**
 * 应用状态管理 - 使用 Pinia
 * 管理全局应用状态，包括：
 * 1. 摄像头状态
 * 2. 音频状态
 * 3. 识别状态
 * 4. 系统设置
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DetectionResult } from '@/services/CardRecognitionService'

export const useAppStore = defineStore('app', () => {
  // 摄像头状态
  const cameraActive = ref(false)
  const cameraError = ref<string | null>(null)

  // 音频状态
  const bgmPlaying = ref(false)
  const bgmVolume = ref(0.7)
  const ttsEnabled = ref(true)
  const ttsSpeaking = ref(false)

  // 识别状态
  const modelLoaded = ref(false)
  const modelLoading = ref(false)
  const recognitionActive = ref(false)
  const lastDetection = ref<DetectionResult | null>(null)
  const lastDetectionTime = ref<number>(0)

  // 系统设置
  const detectionInterval = ref(500) // 毫秒
  const confidenceThreshold = ref(0.6) // 置信度阈值
  const autoSpeak = ref(true) // 自动朗读

  // 计算属性
  const isReady = computed(() => cameraActive.value && modelLoaded.value)
  const canDetect = computed(() => isReady.value && recognitionActive.value && !ttsSpeaking.value)

  // Actions - 摄像头
  function setCameraActive(active: boolean) {
    cameraActive.value = active
    if (active) {
      cameraError.value = null
    }
  }

  function setCameraError(error: string | null) {
    cameraError.value = error
    if (error) {
      cameraActive.value = false
    }
  }

  // Actions - 音频
  function setBgmPlaying(playing: boolean) {
    bgmPlaying.value = playing
  }

  function setBgmVolume(volume: number) {
    bgmVolume.value = Math.max(0, Math.min(1, volume))
  }

  function setTtsEnabled(enabled: boolean) {
    ttsEnabled.value = enabled
  }

  function setTtsSpeaking(speaking: boolean) {
    ttsSpeaking.value = speaking
  }

  // Actions - 识别
  function setModelLoaded(loaded: boolean) {
    modelLoaded.value = loaded
    if (loaded) {
      modelLoading.value = false
    }
  }

  function setModelLoading(loading: boolean) {
    modelLoading.value = loading
  }

  function setRecognitionActive(active: boolean) {
    recognitionActive.value = active
  }

  function updateLastDetection(detection: DetectionResult | null) {
    lastDetection.value = detection
    lastDetectionTime.value = Date.now()
  }

  // Actions - 设置
  function updateSettings(settings: {
    detectionInterval?: number
    confidenceThreshold?: number
    autoSpeak?: boolean
  }) {
    if (settings.detectionInterval !== undefined) {
      detectionInterval.value = settings.detectionInterval
    }
    if (settings.confidenceThreshold !== undefined) {
      confidenceThreshold.value = settings.confidenceThreshold
    }
    if (settings.autoSpeak !== undefined) {
      autoSpeak.value = settings.autoSpeak
    }
  }

  // 重置状态
  function reset() {
    cameraActive.value = false
    cameraError.value = null
    bgmPlaying.value = false
    ttsSpeaking.value = false
    recognitionActive.value = false
    lastDetection.value = null
  }

  return {
    // State
    cameraActive,
    cameraError,
    bgmPlaying,
    bgmVolume,
    ttsEnabled,
    ttsSpeaking,
    modelLoaded,
    modelLoading,
    recognitionActive,
    lastDetection,
    lastDetectionTime,
    detectionInterval,
    confidenceThreshold,
    autoSpeak,

    // Computed
    isReady,
    canDetect,

    // Actions
    setCameraActive,
    setCameraError,
    setBgmPlaying,
    setBgmVolume,
    setTtsEnabled,
    setTtsSpeaking,
    setModelLoaded,
    setModelLoading,
    setRecognitionActive,
    updateLastDetection,
    updateSettings,
    reset
  }
})
