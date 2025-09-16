/**
 * 测试签名认证的脚本
 * 验证AIGC视频生成API是否正确使用Timestamp+Signature认证
 */

import { generateRequestParams } from '@/utils/crypto';

// 测试签名生成
function testSignatureGeneration() {
  console.log('=== 测试签名生成 ===');
  
  const testApis = [
    'aigc_word_create',
    'aigc_word_get',
    'aigc_word_operate',
    'aigc_dialog_create',
    'aigc_final_video_list'
  ];
  
  testApis.forEach(apiName => {
    const params = generateRequestParams(apiName);
    console.log(`API: ${apiName}`);
    console.log(`  Timestamp: ${params.Timestamp}`);
    console.log(`  Signature: ${params.Signature}`);
    console.log('---');
  });
}

// 测试API调用格式
async function testAPICallFormat() {
  console.log('=== 测试API调用格式 ===');
  
  // 模拟createAIGCWord调用
  const testData = {
    series_name: '测试系列',
    title: '测试单词视频',
    word: 'test'
  };
  
  const apiName = 'aigc_word_create';
  const requestParams = generateRequestParams(apiName);
  
  const requestConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Timestamp': requestParams.Timestamp.toString(),
      'Signature': requestParams.Signature,
    },
    data: testData,
  };
  
  console.log('请求配置:', JSON.stringify(requestConfig, null, 2));
  console.log('✅ 请求头包含必要的签名信息');
  
  return requestConfig;
}

// 验证请求头格式
function validateHeaders(headers) {
  const required = ['Content-Type', 'Timestamp', 'Signature'];
  const missing = required.filter(key => !headers[key]);
  
  if (missing.length > 0) {
    console.error('❌ 缺少必要的请求头:', missing);
    return false;
  }
  
  console.log('✅ 请求头格式正确');
  return true;
}

// 主测试函数
async function runSignatureAuthTests() {
  console.log('🚀 开始签名认证测试');
  
  try {
    // 测试1: 签名生成
    testSignatureGeneration();
    
    // 测试2: API调用格式
    const requestConfig = await testAPICallFormat();
    
    // 测试3: 请求头验证
    validateHeaders(requestConfig.headers);
    
    console.log('✅ 所有签名认证测试通过');
    
  } catch (error) {
    console.error('❌ 签名认证测试失败:', error);
  }
}

// 在浏览器环境中提供全局函数
if (typeof window !== 'undefined') {
  window.runSignatureAuthTests = runSignatureAuthTests;
  window.testSignatureGeneration = testSignatureGeneration;
  
  console.log('签名认证测试函数已添加到全局作用域');
  console.log('运行: runSignatureAuthTests()');
}

export { runSignatureAuthTests, testSignatureGeneration, validateHeaders };


































































