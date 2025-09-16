# AIGC视频生成系统 API 测试文档

## 概述

本文档提供了AIGC视频生成系统所有API接口的测试指南，包括请求示例、响应格式和测试场景。

## 基础配置

### 环境变量

```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:3000
VITE_HUOSHAN_ACCESS_KEY=your_access_key
VITE_HUOSHAN_SECRET_KEY=your_secret_key

# 生产环境
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 请求头设置

```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer your_token',
  'X-Request-ID': 'unique_request_id'
};
```

## 1. 单词视频相关接口

### 1.1 创建单词视频

**接口地址：** `POST /api/v1/aigc/word/create`

**请求参数：**
```json
{
  "series_name": "英语入门",
  "title": "第1课-apple",
  "word": "apple"
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "word_video_123456"
  }
}
```

**测试用例：**
```javascript
// 测试用例1：正常创建
async function testCreateWordVideo() {
  const response = await fetch('/api/v1/aigc/word/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      series_name: "英语基础",
      title: "第1课-hello",
      word: "hello"
    })
  });
  
  const result = await response.json();
  console.log('创建结果:', result);
  
  // 验证
  assert(result.code === 0, '创建失败');
  assert(result.data.id, '未返回ID');
  
  return result.data.id;
}

// 测试用例2：参数校验
async function testCreateWordVideoValidation() {
  const testCases = [
    { series_name: "", title: "test", word: "test" }, // 空系列名
    { series_name: "test", title: "", word: "test" }, // 空标题
    { series_name: "test", title: "test", word: "" }  // 空单词
  ];
  
  for (const testCase of testCases) {
    const response = await fetch('/api/v1/aigc/word/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase)
    });
    
    const result = await response.json();
    assert(result.code !== 0, '参数校验失败');
  }
}
```

### 1.2 生成AI图片

**接口地址：** `POST /api/v1/aigc/word/operate`

**请求参数：**
```json
{
  "id": "word_video_123456",
  "operation": 1,
  "word_prompt": "一个红色的苹果在白色背景上"
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "word_video_123456",
    "title": "第1课-apple",
    "status": 1,
    "word": "apple",
    "ai_gen_img_url": null
  }
}
```

**测试用例：**
```javascript
async function testGenerateWordImage(videoId) {
  const response = await fetch('/api/v1/aigc/word/operate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: videoId,
      operation: 1, // GEN_AI_IMG
      word_prompt: "一个新鲜的红苹果，白色背景，高清摄影"
    })
  });
  
  const result = await response.json();
  console.log('图片生成结果:', result);
  
  assert(result.code === 0, '图片生成失败');
  assert(result.data.status === 1, '状态错误');
  
  return result.data;
}
```

### 1.3 获取单词视频详情

**接口地址：** `GET /api/v1/aigc/word/get?id={video_id}`

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "aigc_word": {
      "id": "word_video_123456",
      "title": "第1课-apple",
      "status": 7,
      "word": "apple",
      "ai_gen_img_url": "https://tos.example.com/img.jpg",
      "ai_gen_video_url": "https://tos.example.com/video.mp4",
      "play_url": "https://vod.example.com/play/123",
      "cover_url": "https://tos.example.com/cover.jpg"
    }
  }
}
```

**测试用例：**
```javascript
async function testGetWordVideo(videoId) {
  const response = await fetch(`/api/v1/aigc/word/get?id=${videoId}`);
  const result = await response.json();
  
  console.log('视频详情:', result);
  
  assert(result.code === 0, '获取详情失败');
  assert(result.data.aigc_word.id === videoId, 'ID不匹配');
  
  return result.data.aigc_word;
}

// 轮询状态测试
async function pollWordVideoStatus(videoId, maxAttempts = 30) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const video = await testGetWordVideo(videoId);
    
    console.log(`轮询第${attempts + 1}次，状态：${video.status}`);
    
    if (video.status === 7) { // FINISHED
      console.log('视频生成完成！');
      return video;
    }
    
    if (video.status === 6) { // FAILED
      throw new Error('视频生成失败');
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }
  
  throw new Error('轮询超时');
}
```

## 2. 对话视频相关接口

### 2.1 创建对话视频

**接口地址：** `POST /api/v1/aigc/dialog/create`

**请求参数：**
```json
{
  "series_name": "日常对话",
  "title": "第1课-问候语"
}
```

**测试用例：**
```javascript
async function testCreateDialogVideo() {
  const response = await fetch('/api/v1/aigc/dialog/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      series_name: "英语对话",
      title: "第1课-初次见面"
    })
  });
  
  const result = await response.json();
  console.log('对话视频创建结果:', result);
  
  assert(result.code === 0, '创建失败');
  return result.data.id;
}
```

### 2.2 生成远景图

**接口地址：** `POST /api/v1/aigc/dialog/operate`

**请求参数：**
```json
{
  "id": "dialog_video_123456",
  "operation": 1,
  "far_img_prompt": "一个现代化的咖啡厅，温馨的灯光，木质桌椅"
}
```

**测试用例：**
```javascript
async function testGenerateDialogFarImage(videoId) {
  const response = await fetch('/api/v1/aigc/dialog/operate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: videoId,
      operation: 1, // GEN_FAR_IMG
      far_img_prompt: "一个明亮的教室，黑板上写着英语单词，阳光从窗户洒进来"
    })
  });
  
  const result = await response.json();
  console.log('远景图生成结果:', result);
  
  assert(result.code === 0, '远景图生成失败');
  return result.data.aigc_dialog;
}
```

### 2.3 试听音频

**接口地址：** `POST /api/v1/aigc/dialog/try-audio`

**请求参数：**
```json
{
  "content": "Hello, nice to meet you!",
  "audio_type": "BV001_streaming",
  "audio_ratio": 1.0
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "audio_url": "https://tos.example.com/audio.mp3"
  }
}
```

**测试用例：**
```javascript
async function testTryDialogAudio() {
  const testCases = [
    {
      content: "Hello, how are you?",
      audio_type: "BV001_streaming",
      audio_ratio: 1.0
    },
    {
      content: "你好，很高兴见到你！",
      audio_type: "xiaoxiao-2.0",
      audio_ratio: 1.5
    }
  ];
  
  for (const testCase of testCases) {
    const response = await fetch('/api/v1/aigc/dialog/try-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase)
    });
    
    const result = await response.json();
    console.log('音频试听结果:', result);
    
    assert(result.code === 0, '音频生成失败');
    assert(result.data.audio_url, '未返回音频URL');
  }
}
```

## 3. 火山引擎服务接口

### 3.1 文生图服务

**接口地址：** `POST /api/v1/huoshan/text-to-image`

**请求参数：**
```json
{
  "prompt": "一只可爱的小猫在阳光下睡觉",
  "size": "720x1280",
  "watermark": false
}
```

**测试用例：**
```javascript
async function testTextToImage() {
  const response = await fetch('/api/v1/huoshan/text-to-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: "一个美丽的日落，海边的椰子树，高质量摄影",
      size: "720x1280",
      watermark: false
    })
  });
  
  const result = await response.json();
  console.log('文生图结果:', result);
  
  assert(result.code === 0, '文生图失败');
  assert(result.data.image_url, '未返回图片URL');
  
  return result.data;
}
```

### 3.2 图生视频服务

**接口地址：** `POST /api/v1/huoshan/image-to-video`

**请求参数：**
```json
{
  "prompt": "让这张图片中的花朵轻轻摇摆",
  "image_url": "https://tos.example.com/image.jpg"
}
```

**测试用例：**
```javascript
async function testImageToVideo(imageUrl) {
  // 启动图生视频任务
  const response = await fetch('/api/v1/huoshan/image-to-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: "让图片中的内容生动起来，增加自然的动态效果",
      image_url: imageUrl
    })
  });
  
  const result = await response.json();
  console.log('图生视频任务创建结果:', result);
  
  assert(result.code === 0, '任务创建失败');
  assert(result.data.task_id, '未返回任务ID');
  
  // 轮询任务状态
  return await pollVideoTask(result.data.task_id);
}

async function pollVideoTask(taskId) {
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    const response = await fetch(`/api/v1/huoshan/video-task/get?task_id=${taskId}`);
    const result = await response.json();
    
    console.log(`视频任务轮询第${attempts + 1}次:`, result);
    
    if (result.data.status === 'completed' && result.data.video_url) {
      console.log('视频生成完成！');
      return result.data.video_url;
    }
    
    if (result.data.status === 'failed') {
      throw new Error('视频生成失败');
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    attempts++;
  }
  
  throw new Error('视频生成超时');
}
```

### 3.3 TTS服务

**接口地址：** `POST /api/v1/huoshan/tts`

**请求参数：**
```json
{
  "text": "Hello, welcome to our English learning platform!",
  "audio_type": "BV001_streaming",
  "audio_ratio": 1.0
}
```

**测试用例：**
```javascript
async function testTTS() {
  const testTexts = [
    { text: "Hello world!", audio_type: "BV001_streaming", audio_ratio: 1.0 },
    { text: "你好世界！", audio_type: "xiaoxiao-2.0", audio_ratio: 1.2 },
    { text: "Bonjour le monde!", audio_type: "common-female", audio_ratio: 0.8 }
  ];
  
  for (const testCase of testTexts) {
    const response = await fetch('/api/v1/huoshan/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase)
    });
    
    const result = await response.json();
    console.log('TTS结果:', result);
    
    assert(result.code === 0, 'TTS生成失败');
    assert(result.data.audio_url, '未返回音频URL');
  }
}
```

## 4. 视频库相关接口

### 4.1 获取视频列表

**接口地址：** `GET /api/v1/aigc/final-video/list`

**请求参数：**
```
offset=0&limit=20&aigc_type=1
```

**测试用例：**
```javascript
async function testGetVideoList() {
  const testCases = [
    { offset: 0, limit: 10, aigc_type: 1 }, // 单词视频
    { offset: 0, limit: 10, aigc_type: 2 }, // 对话视频
    { offset: 10, limit: 20, aigc_type: 1 } // 分页测试
  ];
  
  for (const params of testCases) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`/api/v1/aigc/final-video/list?${query}`);
    const result = await response.json();
    
    console.log('视频列表结果:', result);
    
    assert(result.code === 0, '获取列表失败');
    assert(Array.isArray(result.data.aigc_word_list) || Array.isArray(result.data.aigc_dialog_list), '数据格式错误');
  }
}
```

## 5. 完整测试流程

### 5.1 单词视频完整流程测试

```javascript
async function testCompleteWordVideoFlow() {
  console.log('=== 开始单词视频完整流程测试 ===');
  
  try {
    // 1. 创建单词视频
    const videoId = await testCreateWordVideo();
    console.log('✓ 视频创建成功:', videoId);
    
    // 2. 生成AI图片
    const videoData = await testGenerateWordImage(videoId);
    console.log('✓ 图片生成启动成功');
    
    // 3. 轮询状态直到完成
    const finalVideo = await pollWordVideoStatus(videoId);
    console.log('✓ 视频生成完成:', finalVideo);
    
    // 4. 验证最终结果
    assert(finalVideo.ai_gen_img_url, '缺少图片URL');
    assert(finalVideo.play_url, '缺少播放URL');
    
    console.log('=== 单词视频流程测试完成 ===');
    return finalVideo;
    
  } catch (error) {
    console.error('❌ 单词视频流程测试失败:', error);
    throw error;
  }
}
```

### 5.2 对话视频完整流程测试

```javascript
async function testCompleteDialogVideoFlow() {
  console.log('=== 开始对话视频完整流程测试 ===');
  
  try {
    // 1. 创建对话视频
    const videoId = await testCreateDialogVideo();
    console.log('✓ 对话视频创建成功:', videoId);
    
    // 2. 生成远景图
    const dialogData = await testGenerateDialogFarImage(videoId);
    console.log('✓ 远景图生成启动成功');
    
    // 3. 试听音频
    await testTryDialogAudio();
    console.log('✓ 音频试听测试成功');
    
    // 4. 轮询状态
    const finalDialog = await pollDialogVideoStatus(videoId);
    console.log('✓ 对话视频生成完成:', finalDialog);
    
    console.log('=== 对话视频流程测试完成 ===');
    return finalDialog;
    
  } catch (error) {
    console.error('❌ 对话视频流程测试失败:', error);
    throw error;
  }
}
```

## 6. 性能测试

### 6.1 并发测试

```javascript
async function testConcurrentRequests() {
  const concurrentTasks = Array.from({ length: 5 }, (_, i) => 
    testCreateWordVideo().then(videoId => ({ index: i, videoId }))
  );
  
  try {
    const results = await Promise.all(concurrentTasks);
    console.log('并发测试结果:', results);
    
    results.forEach((result, index) => {
      assert(result.videoId, `任务${index}创建失败`);
    });
    
    console.log('✓ 并发测试通过');
  } catch (error) {
    console.error('❌ 并发测试失败:', error);
  }
}
```

### 6.2 压力测试

```javascript
async function testStress() {
  const startTime = Date.now();
  const requests = 50;
  let successCount = 0;
  let errorCount = 0;
  
  const tasks = Array.from({ length: requests }, async () => {
    try {
      await testCreateWordVideo();
      successCount++;
    } catch (error) {
      errorCount++;
    }
  });
  
  await Promise.all(tasks);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`压力测试结果：
    总请求数: ${requests}
    成功数: ${successCount}
    失败数: ${errorCount}
    耗时: ${duration}ms
    平均响应时间: ${duration / requests}ms
    成功率: ${(successCount / requests * 100).toFixed(2)}%
  `);
}
```

## 7. 工具函数

### 7.1 断言函数

```javascript
function assert(condition, message) {
  if (!condition) {
    throw new Error(`断言失败: ${message}`);
  }
}
```

### 7.2 测试运行器

```javascript
async function runAllTests() {
  const tests = [
    { name: '创建单词视频', test: testCreateWordVideo },
    { name: '创建对话视频', test: testCreateDialogVideo },
    { name: '文生图服务', test: testTextToImage },
    { name: 'TTS服务', test: testTTS },
    { name: '获取视频列表', test: testGetVideoList },
    { name: '完整单词视频流程', test: testCompleteWordVideoFlow },
    { name: '完整对话视频流程', test: testCompleteDialogVideoFlow }
  ];
  
  const results = [];
  
  for (const { name, test } of tests) {
    console.log(`\n开始测试: ${name}`);
    try {
      const startTime = Date.now();
      const result = await test();
      const duration = Date.now() - startTime;
      
      results.push({
        name,
        status: 'PASS',
        duration,
        result
      });
      
      console.log(`✓ ${name} 测试通过 (${duration}ms)`);
    } catch (error) {
      results.push({
        name,
        status: 'FAIL',
        error: error.message
      });
      
      console.error(`❌ ${name} 测试失败:`, error.message);
    }
  }
  
  // 生成测试报告
  generateTestReport(results);
}

function generateTestReport(results) {
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  
  console.log(`\n=== 测试报告 ===
    总测试数: ${results.length}
    通过: ${passCount}
    失败: ${failCount}
    成功率: ${(passCount / results.length * 100).toFixed(2)}%
  `);
  
  if (failCount > 0) {
    console.log('\n失败的测试:');
    results.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`  - ${result.name}: ${result.error}`);
    });
  }
}
```

## 8. 使用方法

### 8.1 在浏览器控制台运行

```javascript
// 复制整个测试代码到浏览器控制台，然后运行：
runAllTests();
```

### 8.2 在Node.js环境运行

```javascript
// 安装依赖
npm install node-fetch

// 创建测试文件 test.js，然后运行：
node test.js
```

### 8.3 集成到自动化测试

```javascript
// 在Jest或其他测试框架中使用
describe('AIGC API Tests', () => {
  test('创建单词视频', async () => {
    const videoId = await testCreateWordVideo();
    expect(videoId).toBeTruthy();
  });
  
  test('完整流程测试', async () => {
    const result = await testCompleteWordVideoFlow();
    expect(result.status).toBe(7); // FINISHED
  });
});
```

## 9. 常见问题和解决方案

### 9.1 接口超时

```javascript
// 设置更长的超时时间
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

fetch('/api/endpoint', {
  signal: controller.signal
}).finally(() => clearTimeout(timeoutId));
```

### 9.2 认证失败

```javascript
// 检查Token是否有效
async function checkAuth() {
  const response = await fetch('/api/v1/auth/check');
  if (response.status === 401) {
    console.error('认证失败，请检查Token');
    return false;
  }
  return true;
}
```

### 9.3 网络错误重试

```javascript
async function retryRequest(requestFn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

这个测试文档涵盖了AIGC视频生成系统的所有主要API接口，提供了完整的测试用例和使用示例，可以帮助开发者快速验证API功能和进行系统测试。






