/**
 * AIGC视频生成系统快速API测试脚本
 * 可在浏览器控制台或Node.js环境中运行
 */

// 配置项
const CONFIG = {
  baseUrl: 'http://localhost:3000', // 根据实际环境修改
  authToken: 'your_auth_token',     // 替换为实际的认证token
  timeout: 30000                    // 请求超时时间
};

// 工具函数
class APITester {
  constructor(config) {
    this.config = config;
    this.results = [];
  }

  // 发送HTTP请求
  async request(method, url, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.authToken}`,
        'X-Request-ID': this.generateRequestId()
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.config.baseUrl}${url}`, options);
    const result = await response.json();
    
    return {
      status: response.status,
      data: result,
      ok: response.ok
    };
  }

  // 生成请求ID
  generateRequestId() {
    return 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 断言函数
  assert(condition, message) {
    if (!condition) {
      throw new Error(`断言失败: ${message}`);
    }
  }

  // 记录测试结果
  logResult(testName, success, data = null, error = null) {
    const result = {
      test: testName,
      success,
      timestamp: new Date().toISOString(),
      data,
      error: error?.message
    };
    
    this.results.push(result);
    
    const icon = success ? '✅' : '❌';
    const message = success ? '成功' : `失败: ${error?.message}`;
    console.log(`${icon} ${testName}: ${message}`);
    
    if (data && success) {
      console.log('   响应数据:', data);
    }
  }

  // 等待函数
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 创建测试实例
const tester = new APITester(CONFIG);

// 1. 基础接口测试
async function testBasicAPIs() {
  console.log('\n=== 开始基础接口测试 ===');

  // 测试创建单词视频
  try {
    const response = await tester.request('POST', '/api/v1/aigc/word/create', {
      series_name: '测试系列',
      title: '测试单词视频',
      word: 'test'
    });

    tester.assert(response.ok, '请求失败');
    tester.assert(response.data.code === 0, '业务逻辑失败');
    tester.assert(response.data.data.id, '未返回视频ID');

    tester.logResult('创建单词视频', true, response.data);
    return response.data.data.id;

  } catch (error) {
    tester.logResult('创建单词视频', false, null, error);
    return null;
  }
}

// 2. 单词视频完整流程测试
async function testWordVideoFlow() {
  console.log('\n=== 开始单词视频流程测试 ===');
  
  try {
    // 创建视频
    const videoId = await testBasicAPIs();
    if (!videoId) throw new Error('创建视频失败');

    // 生成图片
    const imgResponse = await tester.request('POST', '/api/v1/aigc/word/operate', {
      id: videoId,
      operation: 1, // GEN_AI_IMG
      word_prompt: '一个苹果，白色背景'
    });

    tester.assert(imgResponse.data.code === 0, '图片生成启动失败');
    tester.logResult('启动图片生成', true, imgResponse.data);

    // 轮询状态
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      await tester.sleep(2000);
      
      const statusResponse = await tester.request('GET', `/api/v1/aigc/word/get?id=${videoId}`);
      
      if (statusResponse.data.code === 0) {
        const video = statusResponse.data.data.aigc_word;
        console.log(`   状态检查 ${attempts + 1}: status=${video.status}`);
        
        if (video.status >= 2) { // IMG_REVIEWING 或更高
          tester.logResult('图片生成完成', true, { status: video.status });
          
          // 继续生成视频
          const videoResponse = await tester.request('POST', '/api/v1/aigc/word/operate', {
            id: videoId,
            operation: 2 // GEN_AI_VIDEO
          });
          
          if (videoResponse.data.code === 0) {
            tester.logResult('启动视频生成', true, videoResponse.data);
          }
          
          break;
        }
      }
      
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('轮询超时');
    }

    return videoId;

  } catch (error) {
    tester.logResult('单词视频流程', false, null, error);
    return null;
  }
}

// 3. 对话视频测试
async function testDialogVideoFlow() {
  console.log('\n=== 开始对话视频流程测试 ===');
  
  try {
    // 创建对话视频
    const response = await tester.request('POST', '/api/v1/aigc/dialog/create', {
      series_name: '对话测试',
      title: '测试对话视频'
    });

    tester.assert(response.data.code === 0, '创建对话视频失败');
    const dialogId = response.data.data.id;
    tester.logResult('创建对话视频', true, response.data);

    // 生成远景图
    const farImgResponse = await tester.request('POST', '/api/v1/aigc/dialog/operate', {
      id: dialogId,
      operation: 1, // GEN_FAR_IMG
      far_img_prompt: '一个现代化的办公室'
    });

    tester.assert(farImgResponse.data.code === 0, '远景图生成失败');
    tester.logResult('启动远景图生成', true, farImgResponse.data);

    // 试听音频
    const audioResponse = await tester.request('POST', '/api/v1/aigc/dialog/try-audio', {
      content: 'Hello, this is a test.',
      audio_type: 'BV001_streaming',
      audio_ratio: 1.0
    });

    tester.assert(audioResponse.data.code === 0, '音频试听失败');
    tester.assert(audioResponse.data.data.audio_url, '未返回音频URL');
    tester.logResult('音频试听', true, audioResponse.data);

    return dialogId;

  } catch (error) {
    tester.logResult('对话视频流程', false, null, error);
    return null;
  }
}

// 4. 火山引擎服务测试
async function testHuoshanServices() {
  console.log('\n=== 开始火山引擎服务测试 ===');

  const tests = [
    {
      name: '文生图服务',
      url: '/api/v1/huoshan/text-to-image',
      data: {
        prompt: '一只可爱的小猫',
        size: '720x1280',
        watermark: false
      }
    },
    {
      name: 'TTS服务',
      url: '/api/v1/huoshan/tts',
      data: {
        text: 'Hello world!',
        audio_type: 'BV001_streaming',
        audio_ratio: 1.0
      }
    }
  ];

  for (const test of tests) {
    try {
      const response = await tester.request('POST', test.url, test.data);
      
      tester.assert(response.ok, '请求失败');
      tester.assert(response.data.code === 0, '业务逻辑失败');
      
      tester.logResult(test.name, true, response.data);
      
    } catch (error) {
      tester.logResult(test.name, false, null, error);
    }
  }
}

// 5. 视频库测试
async function testVideoLibrary() {
  console.log('\n=== 开始视频库测试 ===');

  const tests = [
    {
      name: '获取单词视频列表',
      url: '/api/v1/aigc/final-video/list?offset=0&limit=10&aigc_type=1'
    },
    {
      name: '获取对话视频列表',
      url: '/api/v1/aigc/final-video/list?offset=0&limit=10&aigc_type=2'
    },
    {
      name: '获取视频合集',
      url: '/api/v1/video-generation/collections'
    }
  ];

  for (const test of tests) {
    try {
      const response = await tester.request('GET', test.url);
      
      tester.assert(response.ok, '请求失败');
      tester.assert(response.data.code === 0, '业务逻辑失败');
      
      tester.logResult(test.name, true, response.data);
      
    } catch (error) {
      tester.logResult(test.name, false, null, error);
    }
  }
}

// 6. 性能测试
async function testPerformance() {
  console.log('\n=== 开始性能测试 ===');

  try {
    const testCount = 5;
    const promises = [];
    const startTime = Date.now();

    // 并发创建多个单词视频
    for (let i = 0; i < testCount; i++) {
      promises.push(
        tester.request('POST', '/api/v1/aigc/word/create', {
          series_name: `并发测试${i}`,
          title: `并发视频${i}`,
          word: `test${i}`
        })
      );
    }

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const successCount = results.filter(r => r.data.code === 0).length;
    
    tester.logResult('并发性能测试', true, {
      总请求数: testCount,
      成功数: successCount,
      失败数: testCount - successCount,
      总耗时: `${duration}ms`,
      平均响应时间: `${Math.round(duration / testCount)}ms`,
      成功率: `${Math.round(successCount / testCount * 100)}%`
    });

  } catch (error) {
    tester.logResult('并发性能测试', false, null, error);
  }
}

// 7. 生成测试报告
function generateReport() {
  console.log('\n=== 测试报告 ===');
  
  const total = tester.results.length;
  const passed = tester.results.filter(r => r.success).length;
  const failed = total - passed;
  
  console.log(`总测试数: ${total}`);
  console.log(`通过: ${passed}`);
  console.log(`失败: ${failed}`);
  console.log(`成功率: ${Math.round(passed / total * 100)}%`);
  
  if (failed > 0) {
    console.log('\n失败的测试:');
    tester.results.filter(r => !r.success).forEach(result => {
      console.log(`  ❌ ${result.test}: ${result.error}`);
    });
  }
  
  // 保存详细报告到 localStorage (浏览器环境)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('aigc_test_results', JSON.stringify(tester.results, null, 2));
    console.log('\n📊 详细测试结果已保存到 localStorage.aigc_test_results');
  }
  
  return {
    total,
    passed,
    failed,
    results: tester.results
  };
}

// 主测试函数
async function runAllTests() {
  console.log('🚀 开始AIGC视频生成系统API测试');
  console.log(`📋 测试环境: ${CONFIG.baseUrl}`);
  
  try {
    // 运行所有测试
    await testBasicAPIs();
    await testWordVideoFlow();
    await testDialogVideoFlow();
    await testHuoshanServices();
    await testVideoLibrary();
    await testPerformance();
    
    // 生成报告
    const report = generateReport();
    
    console.log('\n✅ 所有测试完成');
    return report;
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    return null;
  }
}

// 快速测试函数（只测试核心接口）
async function quickTest() {
  console.log('🚀 开始快速API测试');
  
  const tests = [
    () => tester.request('POST', '/api/v1/aigc/word/create', {
      series_name: '快速测试',
      title: '测试',
      word: 'test'
    }),
    () => tester.request('GET', '/api/v1/aigc/final-video/list?offset=0&limit=5&aigc_type=1'),
    () => tester.request('POST', '/api/v1/huoshan/tts', {
      text: 'Quick test',
      audio_type: 'BV001_streaming',
      audio_ratio: 1.0
    })
  ];

  for (let i = 0; i < tests.length; i++) {
    try {
      const response = await tests[i]();
      console.log(`✅ 测试 ${i + 1}: 成功`);
    } catch (error) {
      console.log(`❌ 测试 ${i + 1}: 失败 - ${error.message}`);
    }
  }
}

// 导出函数（Node.js环境）
if (typeof module !== 'undefined') {
  module.exports = {
    runAllTests,
    quickTest,
    testWordVideoFlow,
    testDialogVideoFlow,
    CONFIG
  };
}

// 使用说明
console.log(`
📖 使用说明:

1. 完整测试:
   runAllTests()

2. 快速测试:
   quickTest()

3. 单独测试:
   testWordVideoFlow()
   testDialogVideoFlow()

4. 修改配置:
   CONFIG.baseUrl = 'https://your-api-domain.com'
   CONFIG.authToken = 'your_real_token'

5. 查看结果:
   localStorage.getItem('aigc_test_results')
`);

// 如果在浏览器环境中，自动提供全局函数
if (typeof window !== 'undefined') {
  window.runAllTests = runAllTests;
  window.quickTest = quickTest;
  window.testWordVideoFlow = testWordVideoFlow;
  window.testDialogVideoFlow = testDialogVideoFlow;
  window.CONFIG = CONFIG;
}






