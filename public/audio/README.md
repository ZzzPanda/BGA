# 音频资源目录

## 使用说明

将你的背景音乐文件（BGM）放置在此目录中。

## 支持的格式

- MP3 (推荐)
- WAV
- OGG
- M4A

## 文件命名建议

```
bgm.mp3           - 默认背景音乐
bgm-calm.mp3      - 平静风格
bgm-energetic.mp3 - 活力风格
```

## 如何使用

1. 将音频文件复制到此目录
2. 在代码中引用：

```typescript
// src/views/HomeView.vue
await audioManager.loadBGM('/audio/bgm.mp3')
```

## 推荐资源

### 免费音乐网站
- [Pixabay Music](https://pixabay.com/music/)
- [Free Music Archive](https://freemusicarchive.org/)
- [Incompetech](https://incompetech.com/)
- [YouTube Audio Library](https://www.youtube.com/audiolibrary)

### 注意事项
⚠️ 确保音频文件有适当的使用许可
⚠️ 建议音频文件大小 < 5MB（更快加载）
⚠️ 推荐码率: 128-192 kbps

## 示例

你可以从以下来源获取测试音频：
```bash
# 下载示例 BGM（需要 curl）
curl -o public/audio/bgm.mp3 "https://example.com/sample-bgm.mp3"
```
