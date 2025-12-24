/**
 * 音频管理器 - 使用 Web Audio API 实现 BGM 和 TTS 的混音控制
 * 核心功能：
 * 1. 管理 BGM 播放和音量
 * 2. 实现 TTS 朗读时自动降低 BGM 音量（Ducking）
 * 3. 使用 GainNode 实现平滑的音量过渡
 */

export class AudioManager {
  private audioContext: AudioContext | null = null
  private bgmGainNode: GainNode | null = null
  private bgmSource: AudioBufferSourceNode | null = null
  private bgmBuffer: AudioBuffer | null = null

  private readonly BGM_NORMAL_VOLUME = 0.7 // BGM 正常音量
  private readonly BGM_DUCKED_VOLUME = 0.2 // BGM 降低后的音量
  private readonly FADE_DURATION = 0.5 // 淡入淡出时间（秒）

  private isInitialized = false
  private isBGMPlaying = false

  /**
   * 初始化音频上下文（必须在用户交互后调用）
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // 创建 AudioContext
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // 创建 BGM 增益节点
      this.bgmGainNode = this.audioContext.createGain()
      this.bgmGainNode.gain.value = this.BGM_NORMAL_VOLUME
      this.bgmGainNode.connect(this.audioContext.destination)

      this.isInitialized = true
      console.log('AudioManager initialized successfully')
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error)
      throw error
    }
  }

  /**
   * 加载 BGM 音频文件
   */
  async loadBGM(url: string): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized')
    }

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      this.bgmBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      console.log('BGM loaded successfully')
    } catch (error) {
      console.error('Failed to load BGM:', error)
      throw error
    }
  }

  /**
   * 播放 BGM（循环播放）
   */
  playBGM(): void {
    if (!this.audioContext || !this.bgmBuffer || !this.bgmGainNode) {
      console.warn('Cannot play BGM: not properly initialized')
      return
    }

    // 停止当前播放的 BGM
    this.stopBGM()

    // 创建新的音源
    this.bgmSource = this.audioContext.createBufferSource()
    this.bgmSource.buffer = this.bgmBuffer
    this.bgmSource.loop = true
    this.bgmSource.connect(this.bgmGainNode)
    this.bgmSource.start(0)

    this.isBGMPlaying = true
    console.log('BGM playing')
  }

  /**
   * 停止 BGM
   */
  stopBGM(): void {
    if (this.bgmSource) {
      try {
        this.bgmSource.stop()
      } catch (error) {
        // 忽略已停止的错误
      }
      this.bgmSource.disconnect()
      this.bgmSource = null
    }
    this.isBGMPlaying = false
  }

  /**
   * 降低 BGM 音量（用于 TTS 朗读时）
   */
  duckBGM(): void {
    if (!this.bgmGainNode || !this.audioContext) return

    const currentTime = this.audioContext.currentTime
    this.bgmGainNode.gain.cancelScheduledValues(currentTime)
    this.bgmGainNode.gain.setValueAtTime(this.bgmGainNode.gain.value, currentTime)
    this.bgmGainNode.gain.linearRampToValueAtTime(
      this.BGM_DUCKED_VOLUME,
      currentTime + this.FADE_DURATION
    )

    console.log('BGM ducked')
  }

  /**
   * 恢复 BGM 音量
   */
  unduckBGM(): void {
    if (!this.bgmGainNode || !this.audioContext) return

    const currentTime = this.audioContext.currentTime
    this.bgmGainNode.gain.cancelScheduledValues(currentTime)
    this.bgmGainNode.gain.setValueAtTime(this.bgmGainNode.gain.value, currentTime)
    this.bgmGainNode.gain.linearRampToValueAtTime(
      this.BGM_NORMAL_VOLUME,
      currentTime + this.FADE_DURATION
    )

    console.log('BGM unducked')
  }

  /**
   * 设置 BGM 音量
   */
  setBGMVolume(volume: number): void {
    if (!this.bgmGainNode) return
    const clampedVolume = Math.max(0, Math.min(1, volume))
    this.bgmGainNode.gain.value = clampedVolume
  }

  /**
   * 获取音频上下文状态
   */
  getState(): string {
    return this.audioContext?.state || 'not-initialized'
  }

  /**
   * 恢复音频上下文（处理 iOS 自动暂停问题）
   */
  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.stopBGM()

    if (this.bgmGainNode) {
      this.bgmGainNode.disconnect()
      this.bgmGainNode = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.isInitialized = false
  }

  get initialized(): boolean {
    return this.isInitialized
  }

  get bgmPlaying(): boolean {
    return this.isBGMPlaying
  }
}

// 导出单例实例
export const audioManager = new AudioManager()
