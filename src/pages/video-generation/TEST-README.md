# AIGC视频生成系统API测试指南

## 概述

本文档提供了完整的API测试解决方案，包括详细的测试文档、Postman集合和可执行的测试脚本。

## 📁 测试文件说明

### 1. API-TEST-GUIDE.md
**详细的API测试文档**
- 🔍 所有接口的详细说明和测试用例
- 📝 完整的请求/响应示例
- 🔧 测试工具函数和轮询机制
- 📊 性能测试和压力测试指南

### 2. AIGC-API-Postman-Collection.json
**Postman测试集合**
- 📦 可直接导入Postman的完整接口集合
- ⚙️ 包含环境变量和自动化测试脚本
- 🔄 支持接口间的数据传递和依赖关系
- ✅ 内置响应验证和断言

### 3. quick-api-test.js
**快速测试脚本**
- 🚀 可在浏览器控制台直接运行
- 🎯 包含完整流程和单项测试
- 📈 自动生成测试报告
- 💾 支持结果保存和分析

## 🚀 快速开始

### 方法1: 使用Postman（推荐）

1. **导入集合**
   ```bash
   # 在Postman中导入集合文件
   File -> Import -> AIGC-API-Postman-Collection.json
   ```

2. **配置环境变量**
   ```json
   {
     "baseUrl": "http://localhost:3000",
     "authToken": "your_auth_token"
   }
   ```

3. **运行测试**
   - 单个接口：点击Send按钮
   - 批量测试：使用Collection Runner
   - 自动化测试：配置Newman运行

### 方法2: 浏览器控制台测试

1. **打开浏览器控制台**
   ```bash
   # 访问您的应用
   http://localhost:3000
   
   # 按F12打开开发者工具
   # 切换到Console标签
   ```

2. **加载测试脚本**
   ```javascript
   // 复制 quick-api-test.js 内容到控制台
   // 或者动态加载
   fetch('/src/pages/video-generation/quick-api-test.js')
     .then(r => r.text())
     .then(code => eval(code));
   ```

3. **配置并运行**
   ```javascript
   // 修改配置
   CONFIG.baseUrl = 'http://localhost:3000';
   CONFIG.authToken = 'your_real_token';
   
   // 运行测试
   runAllTests();  // 完整测试
   quickTest();    // 快速测试
   ```

### 方法3: Node.js环境测试

1. **安装依赖**
   ```bash
   npm install node-fetch
   ```

2. **创建测试文件**
   ```javascript
   // test.js
   const fetch = require('node-fetch');
   global.fetch = fetch;
   
   const { runAllTests, CONFIG } = require('./quick-api-test.js');
   
   // 修改配置
   CONFIG.baseUrl = 'http://localhost:3000';
   CONFIG.authToken = 'your_token';
   
   // 运行测试
   runAllTests().then(report => {
     console.log('测试完成:', report);
   });
   ```

3. **执行测试**
   ```bash
   node test.js
   ```

## 🔧 配置说明

### 环境配置

```javascript
const CONFIG = {
  baseUrl: 'http://localhost:3000',    // API服务地址
  authToken: 'your_auth_token',        // 认证令牌
  timeout: 30000                       // 请求超时时间（毫秒）
};
```

### 认证配置

大多数接口需要认证，请确保配置正确的Token：

```javascript
// 在请求头中会自动添加
headers: {
  'Authorization': 'Bearer your_auth_token'
}
```

## 📋 测试项目清单

### ✅ 单词视频接口
- [x] 创建单词视频
- [x] 生成AI图片
- [x] 生成AI视频
- [x] 生成最终视频
- [x] 获取视频详情
- [x] 状态轮询测试

### ✅ 对话视频接口
- [x] 创建对话视频
- [x] 生成远景图
- [x] 生成近景图A/B
- [x] 音频试听
- [x] 生成对话视频
- [x] 获取对话详情

### ✅ 火山引擎服务
- [x] 文生图服务
- [x] 图生图服务
- [x] 图生视频服务
- [x] 对口型服务
- [x] TTS语音合成
- [x] 字幕生成服务

### ✅ 视频库管理
- [x] 获取视频列表
- [x] 获取视频合集
- [x] 删除视频

### ✅ 系统测试
- [x] 并发测试
- [x] 性能测试
- [x] 错误处理测试
- [x] 数据验证测试

## 📊 测试报告

### 自动化报告

测试脚本会自动生成详细的测试报告：

```javascript
{
  "total": 15,           // 总测试数
  "passed": 13,          // 通过数
  "failed": 2,           // 失败数
  "results": [           // 详细结果
    {
      "test": "创建单词视频",
      "success": true,
      "timestamp": "2024-01-01T10:00:00.000Z",
      "data": { /* 响应数据 */ }
    }
  ]
}
```

### 查看报告

```javascript
// 浏览器环境
localStorage.getItem('aigc_test_results');

// 控制台输出
console.table(tester.results);
```

## 🐛 常见问题

### 1. 认证失败
```
❌ 错误: 401 Unauthorized
```
**解决方案:**
- 检查authToken是否正确
- 确认Token未过期
- 验证权限配置

### 2. 请求超时
```
❌ 错误: Request timeout
```
**解决方案:**
- 增加timeout配置
- 检查网络连接
- 确认服务状态

### 3. CORS错误
```
❌ 错误: CORS policy
```
**解决方案:**
- 配置服务端CORS设置
- 使用代理服务器
- 在服务端环境测试

### 4. 数据验证失败
```
❌ 错误: 断言失败
```
**解决方案:**
- 检查请求参数格式
- 验证响应数据结构
- 查看API文档确认字段要求

## 🔄 持续集成

### GitHub Actions示例

```yaml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install node-fetch
      
      - name: Run API tests
        run: node test.js
        env:
          API_BASE_URL: ${{ secrets.API_BASE_URL }}
          AUTH_TOKEN: ${{ secrets.AUTH_TOKEN }}
```

### Newman集成

```bash
# 安装Newman
npm install -g newman

# 运行Postman集合
newman run AIGC-API-Postman-Collection.json \
  --environment environment.json \
  --reporters cli,html \
  --reporter-html-export report.html
```

## 📈 性能基准

### 期望性能指标

| 接口类型 | 响应时间 | 成功率 | 并发数 |
|---------|---------|--------|--------|
| 创建任务 | < 2s | > 99% | 50 |
| 状态查询 | < 500ms | > 99.9% | 100 |
| 文生图 | < 10s | > 95% | 10 |
| 图生视频 | < 60s | > 90% | 5 |
| TTS | < 5s | > 98% | 20 |

### 监控指标

- **响应时间**: 平均 < 3s
- **错误率**: < 5%
- **可用性**: > 99%
- **并发处理**: > 50 req/s

## 🛠️ 测试工具扩展

### 自定义测试用例

```javascript
// 添加新的测试用例
async function testCustomScenario() {
  try {
    // 您的测试逻辑
    const response = await tester.request('POST', '/api/custom', data);
    tester.assert(response.ok, '自定义测试失败');
    tester.logResult('自定义测试', true, response.data);
  } catch (error) {
    tester.logResult('自定义测试', false, null, error);
  }
}
```

### 数据驱动测试

```javascript
// 使用测试数据集
const testData = [
  { word: 'apple', prompt: '红苹果' },
  { word: 'book', prompt: '蓝色书本' },
  { word: 'car', prompt: '红色汽车' }
];

for (const data of testData) {
  await testWordCreation(data);
}
```

## 📞 技术支持

如果遇到测试相关问题，请：

1. 查看控制台错误信息
2. 检查网络连接状态
3. 验证API服务状态
4. 参考错误处理指南
5. 联系开发团队

---

**祝您测试顺利！** 🎉





