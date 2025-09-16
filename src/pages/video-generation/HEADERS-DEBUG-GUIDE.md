# 🔍 Headers传递调试指南

## 📋 问题描述

接口 `/manager/api/v1/aigc/word/create` 在调用时没有传递 `Signature` 等请求头参数。

## 🔧 调试步骤

### 1. **启用调试日志**
我已经在请求拦截器中添加了详细的调试日志：

```javascript
console.log('Request interceptor - URL:', url, 'Type:', typeof url);
console.log('Request interceptor - Original options:', options);
console.log('Request interceptor result:', result);
console.log('Final headers:', result.options.headers);
```

### 2. **测试方法**
1. 打开浏览器开发者工具
2. 切换到Console标签页  
3. 在视频生成页面输入测试数据并提交
4. 查看控制台输出

### 3. **预期输出**
如果headers正确传递，应该看到：

```javascript
Request interceptor - Original options: {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Timestamp': '1703123456789',
    'Signature': 'a1b2c3d4e5f6...'
  },
  data: { series_name: '测试系列', title: '测试-apple', word: 'apple' }
}

Final headers: {
  'Content-Type': 'application/json',
  'Timestamp': '1703123456789', 
  'Signature': 'a1b2c3d4e5f6...',
  'accessToken': 'xxx',
  'uuid': 'xxx'
}
```

### 4. **可能的问题**

#### **问题1：API函数没有调用generatePostAuthHeaders**
检查 `createAIGCWord` 函数是否正确使用了签名认证：

```javascript
// ❌ 错误
headers: {
  'Content-Type': 'application/json',
}

// ✅ 正确  
headers: generatePostAuthHeaders('aigc_word_create'),
```

#### **问题2：generateRequestParams函数有问题**
检查签名生成函数：

```javascript
// 应该返回
{
  Timestamp: 1703123456789,
  Signature: 'sha256hash...'
}
```

#### **问题3：请求拦截器覆盖了headers**
已修复：现在使用扩展运算符合并headers：

```javascript
headers: {
  ...options.headers, // 保留原有headers
  ...headers // 添加新的headers  
}
```

## 📊 调试检查清单

- [ ] 控制台是否显示 "Request interceptor - URL"
- [ ] Original options 中是否包含 Timestamp 和 Signature
- [ ] Final headers 中是否包含所有必要的头部
- [ ] Network 标签页中请求是否包含正确的headers
- [ ] 后端是否收到了签名认证头部

## 🎯 快速验证

运行以下代码在控制台中验证签名生成：

```javascript
// 验证签名生成
import { generateRequestParams } from '@/utils/crypto';
const params = generateRequestParams('aigc_word_create');
console.log('Generated params:', params);
```

## 📝 解决方案

如果headers仍然没有传递，可能需要：

1. **检查import路径**：确保正确导入了 `generateRequestParams`
2. **检查API调用**：确保使用了 `generatePostAuthHeaders`
3. **检查请求库**：确认使用的是正确的request实例
4. **检查拦截器**：验证请求拦截器是否正常工作

---

**调试状态**: 🔄 进行中  
**最后更新**: ${new Date().toLocaleString()}


































































