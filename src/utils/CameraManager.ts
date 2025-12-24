/**
 * 摄像头管理器 - 管理前置摄像头访问和视频流
 * 核心功能：
 * 1. 请求摄像头权限
 * 2. 获取前置摄像头视频流
 * 3. 移动端优化（分辨率、帧率）
 * 4. 资源清理
 */

export interface CameraConstraints {
  width?: number
  height?: number
  facingMode?: 'user' | 'environment'
  frameRate?: number
}

export class CameraManager {
  private stream: MediaStream | null = null
  private videoElement: HTMLVideoElement | null = null

  /**
   * 初始化摄像头
   */
  async initialize(
    videoElement: HTMLVideoElement,
    constraints: CameraConstraints = {}
  ): Promise<MediaStream> {
    this.videoElement = videoElement

    // 默认约束（针对移动端优化）
    const defaultConstraints: MediaStreamConstraints = {
      video: {
        facingMode: constraints.facingMode || 'user', // 前置摄像头
        width: { ideal: constraints.width || 640 },
        height: { ideal: constraints.height || 480 },
        frameRate: { ideal: constraints.frameRate || 30, max: 30 }
      },
      audio: false
    }

    try {
      // 请求摄像头权限
      this.stream = await navigator.mediaDevices.getUserMedia(defaultConstraints)

      // 绑定到 video 元素
      this.videoElement.srcObject = this.stream
      this.videoElement.setAttribute('playsinline', 'true') // iOS 需要
      this.videoElement.setAttribute('autoplay', 'true')
      this.videoElement.setAttribute('muted', 'true')

      // 等待视频加载
      await new Promise<void>((resolve) => {
        this.videoElement!.onloadedmetadata = () => {
          this.videoElement!.play()
          resolve()
        }
      })

      console.log('Camera initialized successfully')
      console.log('Stream settings:', this.stream.getVideoTracks()[0].getSettings())

      return this.stream
    } catch (error) {
      console.error('Failed to initialize camera:', error)
      throw this.handleCameraError(error)
    }
  }

  /**
   * 捕获当前帧到 Canvas
   */
  captureFrame(canvas: HTMLCanvasElement): ImageData | null {
    if (!this.videoElement) {
      console.warn('Video element not initialized')
      return null
    }

    const context = canvas.getContext('2d')
    if (!context) {
      console.error('Failed to get canvas context')
      return null
    }

    // 设置 canvas 尺寸
    canvas.width = this.videoElement.videoWidth
    canvas.height = this.videoElement.videoHeight

    // 绘制当前帧
    context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height)

    // 返回图像数据
    return context.getImageData(0, 0, canvas.width, canvas.height)
  }

  /**
   * 切换摄像头（前置/后置）
   */
  async switchCamera(): Promise<void> {
    if (!this.stream) return

    const currentFacingMode = this.getCurrentFacingMode()
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user'

    // 停止当前流
    this.stop()

    // 重新初始化
    if (this.videoElement) {
      await this.initialize(this.videoElement, { facingMode: newFacingMode })
    }
  }

  /**
   * 获取当前摄像头模式
   */
  private getCurrentFacingMode(): 'user' | 'environment' {
    if (!this.stream) return 'user'

    const videoTrack = this.stream.getVideoTracks()[0]
    const settings = videoTrack.getSettings()
    return (settings.facingMode as 'user' | 'environment') || 'user'
  }

  /**
   * 停止摄像头
   */
  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop()
      })
      this.stream = null
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null
    }

    console.log('Camera stopped')
  }

  /**
   * 检查摄像头权限
   */
  static async checkPermission(): Promise<PermissionState> {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      return result.state
    } catch (error) {
      console.warn('Permission API not supported', error)
      return 'prompt'
    }
  }

  /**
   * 检查是否支持摄像头
   */
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  /**
   * 错误处理
   */
  private handleCameraError(error: any): Error {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return new Error('摄像头权限被拒绝，请在设置中允许访问摄像头')
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return new Error('未找到摄像头设备')
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return new Error('摄像头正在被其他应用使用')
    } else if (error.name === 'OverconstrainedError') {
      return new Error('摄像头不支持所请求的配置')
    } else if (error.name === 'NotSupportedError') {
      return new Error('浏览器不支持访问摄像头（需要 HTTPS）')
    } else {
      return new Error(`摄像头初始化失败: ${error.message}`)
    }
  }

  /**
   * 获取视频尺寸
   */
  getVideoSize(): { width: number; height: number } | null {
    if (!this.videoElement) return null

    return {
      width: this.videoElement.videoWidth,
      height: this.videoElement.videoHeight
    }
  }

  /**
   * 获取当前流
   */
  getStream(): MediaStream | null {
    return this.stream
  }

  get isActive(): boolean {
    return this.stream !== null && this.stream.active
  }
}

// 导出单例实例
export const cameraManager = new CameraManager()
