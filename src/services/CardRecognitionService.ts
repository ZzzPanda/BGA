/**
 * 卡牌识别服务 - 使用 TensorFlow.js 进行实时物体检测
 * 核心功能：
 * 1. 加载 COCO-SSD 预训练模型
 * 2. 实时检测视频帧中的物体
 * 3. 识别卡牌（本例使用物体检测，可替换为自定义卡牌模型）
 * 4. 防抖优化，避免重复识别
 */

import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

export interface DetectionResult {
  class: string // 识别的类别
  score: number // 置信度 0-1
  bbox: [number, number, number, number] // [x, y, width, height]
  text?: string // 关联的文字（需要自定义映射）
}

export interface CardData {
  id: string
  name: string
  text: string // 要朗读的文字
  keywords: string[] // 用于匹配的关键词
}

export class CardRecognitionService {
  private model: cocoSsd.ObjectDetection | null = null
  private isModelLoaded = false
  private lastDetectionTime = 0
  private readonly DETECTION_INTERVAL = 500 // 检测间隔（毫秒）
  private cardDatabase: CardData[] = []

  /**
   * 初始化模型
   */
  async initialize(): Promise<void> {
    if (this.isModelLoaded) return

    try {
      console.log('Loading TensorFlow.js model...')

      // 设置后端（WebGL 性能最好）
      await tf.setBackend('webgl')
      await tf.ready()

      // 加载 COCO-SSD 模型（可替换为自定义模型）
      this.model = await cocoSsd.load({
        base: 'mobilenet_v2' // 使用 MobileNet v2，移动端性能更好
      })

      this.isModelLoaded = true
      console.log('Model loaded successfully')
      console.log('TensorFlow backend:', tf.getBackend())
    } catch (error) {
      console.error('Failed to load model:', error)
      throw error
    }
  }

  /**
   * 加载卡牌数据库
   */
  loadCardDatabase(cards: CardData[]): void {
    this.cardDatabase = cards
    console.log(`Loaded ${cards.length} cards to database`)
  }

  /**
   * 检测图像中的物体
   */
  async detect(
    imageElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ): Promise<DetectionResult[]> {
    if (!this.model) {
      throw new Error('Model not initialized')
    }

    // 防抖：避免检测过于频繁
    const now = Date.now()
    if (now - this.lastDetectionTime < this.DETECTION_INTERVAL) {
      return []
    }
    this.lastDetectionTime = now

    try {
      // 执行检测
      const predictions = await this.model.detect(imageElement)

      // 转换结果格式
      const results: DetectionResult[] = predictions.map((pred) => ({
        class: pred.class,
        score: pred.score,
        bbox: pred.bbox as [number, number, number, number]
      }))

      // 匹配卡牌数据库
      this.matchCards(results)

      return results
    } catch (error) {
      console.error('Detection error:', error)
      return []
    }
  }

  /**
   * 匹配卡牌数据库，填充文字信息
   */
  private matchCards(results: DetectionResult[]): void {
    results.forEach((result) => {
      // 查找匹配的卡牌
      const matchedCard = this.cardDatabase.find((card) =>
        card.keywords.some((keyword) =>
          result.class.toLowerCase().includes(keyword.toLowerCase())
        )
      )

      if (matchedCard) {
        result.text = matchedCard.text
      }
    })
  }

  /**
   * 识别卡牌并返回要朗读的文字
   * 返回置信度最高的结果
   */
  async recognizeCard(
    imageElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ): Promise<{ text: string; confidence: number } | null> {
    const results = await this.detect(imageElement)

    if (results.length === 0) {
      return null
    }

    // 过滤有文字的结果
    const validResults = results.filter((r) => r.text && r.score > 0.6)

    if (validResults.length === 0) {
      return null
    }

    // 返回置信度最高的结果
    const bestResult = validResults.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    )

    return {
      text: bestResult.text || '',
      confidence: bestResult.score
    }
  }

  /**
   * 设置检测间隔
   */
  setDetectionInterval(interval: number): void {
    this.DETECTION_INTERVAL = interval
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
    }
    this.isModelLoaded = false
    tf.disposeVariables()
    console.log('CardRecognitionService disposed')
  }

  get modelLoaded(): boolean {
    return this.isModelLoaded
  }
}

// 导出单例实例
export const cardRecognitionService = new CardRecognitionService()

// 示例卡牌数据库
export const SAMPLE_CARD_DATABASE: CardData[] = [
  {
    id: 'card_001',
    name: '书本',
    text: '这是一本书，书中自有黄金屋',
    keywords: ['book']
  },
  {
    id: 'card_002',
    name: '手机',
    text: '这是一部手机，连接你我他',
    keywords: ['cell phone', 'phone']
  },
  {
    id: 'card_003',
    name: '杯子',
    text: '这是一个杯子，用来装水喝',
    keywords: ['cup', 'mug']
  },
  {
    id: 'card_004',
    name: '人物',
    text: '检测到人物',
    keywords: ['person']
  },
  {
    id: 'card_005',
    name: '瓶子',
    text: '这是一个瓶子',
    keywords: ['bottle']
  }
]
