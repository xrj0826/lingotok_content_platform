/**
 * 临时调试脚本 - 测试API调用
 */

// 测试数据
const testData = {
  series_name: '测试系列',
  title: '测试单词视频',
  word: 'test'
};

// 简单测试函数
async function testCreateAIGCWord() {
  console.log('=== 开始测试 createAIGCWord ===');
  console.log('测试数据:', testData);
  
  try {
    // 检查是否能正常导入
    const { createAIGCWord } = await import('@/api/aigc-video');
    console.log('✓ API函数导入成功');
    
    // 调用API
    const result = await createAIGCWord(testData);
    console.log('✓ API调用成功:', result);
    
    return result;
  } catch (error) {
    console.error('❌ API调用失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack
    });
    
    return null;
  }
}

// 在浏览器控制台中运行
if (typeof window !== 'undefined') {
  window.testCreateAIGCWord = testCreateAIGCWord;
  console.log('测试函数已添加到 window.testCreateAIGCWord');
  console.log('请在控制台中运行: testCreateAIGCWord()');
}

export { testCreateAIGCWord };











































































