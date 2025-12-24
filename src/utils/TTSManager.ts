/**
 * TTS 管理器 - 使用 Web Speech API 实现文字转语音
 * 核心功能：
 * 1. 文字朗读
 * 2. 与 AudioManager 协同，朗读时自动降低 BGM
 * 3. 队列管理，避免重复朗读
 */

import { audioManager } from './AudioManager'

export interface TTSOptions {
  lang?: string // 语言，默认 'zh-CN'
  rate?: number // 语速，范围 0.1-10，默认 1
  pitch?: number // 音调，范围 0-2，默认 1
  volume?: number // 音量，范围 0-1，默认 1
}

export class TTSManager {
  private synth: SpeechSynthesis
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isSpeaking = false
  private queue: string[] = []

  constructor() {
    this.synth = window.speechSynthesis
  }

  /**
   * 朗读文本
   */
  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // 如果正在朗读，加入队列
      if (this.isSpeaking) {
        this.queue.push(text)
        console.log('TTS: Added to queue', text)
        resolve()
        return
      }

      // 清空现有朗读
      this.cancel()

      // 创建语音实例
      const utterance = new SpeechSynthesisUtterance(text)

      // 设置选项
      utterance.lang = options.lang || 'zh-CN'
      utterance.rate = options.rate || 1
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume !== undefined ? options.volume : 1

      // 开始朗读前降低 BGM
      utterance.onstart = () => {
        console.log('TTS: Started speaking', text)
        this.isSpeaking = true
        audioManager.duckBGM()
      }

      // 朗读结束后恢复 BGM
      utterance.onend = () => {
        console.log('TTS: Finished speaking', text)
        this.isSpeaking = false
        audioManager.unduckBGM()
        this.currentUtterance = null

        // 处理队列中的下一个
        this.processQueue()
        resolve()
      }

      // 错误处理
      utterance.onerror = (event) => {
        console.error('TTS: Speech error', event)
        this.isSpeaking = false
        audioManager.unduckBGM()
        this.currentUtterance = null
        reject(event)
      }

      this.currentUtterance = utterance
      this.synth.speak(utterance)
    })
  }

  /**
   * 处理队列
   */
  private processQueue(): void {
    if (this.queue.length > 0 && !this.isSpeaking) {
      const nextText = this.queue.shift()
      if (nextText) {
        this.speak(nextText)
      }
    }
  }

  /**
   * 取消当前朗读
   */
  cancel(): void {
    if (this.synth.speaking) {
      this.synth.cancel()
    }
    this.isSpeaking = false
    this.currentUtterance = null
    audioManager.unduckBGM()
  }

  /**
   * 暂停朗读
   */
  pause(): void {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause()
    }
  }

  /**
   * 恢复朗读
   */
  resume(): void {
    if (this.synth.paused) {
      this.synth.resume()
    }
  }

  /**
   * 清空队列
   */
  clearQueue(): void {
    this.queue = []
  }

  /**
   * 获取可用的语音列表
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices()
  }

  /**
   * 检查是否支持 TTS
   */
  static isSupported(): boolean {
    return 'speechSynthesis' in window
  }

  get speaking(): boolean {
    return this.isSpeaking
  }

  get queueLength(): number {
    return this.queue.length
  }
}

// 导出单例实例
export const ttsManager = new TTSManager()
