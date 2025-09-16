# 🔍 AIGC API认证方式最终测试

## 📋 问题分析

通过分析代码和配置，发现了以下关键信息：

### **1. 代理配置分析**
```javascript
// vite.config.ts
'/manager': {
  target: 'http://111.229.66.85:8866/',  // AIGC API服务器
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/manager/, '')
}
```

### **2. 其他页面的API**
```javascript
// 其他页面使用的API地址
'https://api.lingotok.ai/api/v1/video/...'  // 需要Timestamp+Signature认证
```

### **3. AIGC API地址**
```javascript
// AIGC API实际地址
'/manager/api/v1/aigc/word/create'  // 可能使用不同的认证方式
```

## 🧪 测试方案

### **测试1：不使用签名认证（当前设置）**
```javascript
const useSignatureAuth = false;
const headers = { 'Content-Type': 'application/json' };
```

**预期结果**：
- 请求拦截器会添加 `accessToken` 和 `uuid`
- 最终请求头应该包含：
  ```javascript
  {
    'Content-Type': 'application/json',
    'accessToken': 'xxx',
    'uuid': 'xxx'
  }
  ```

### **测试2：使用签名认证**
```javascript
const useSignatureAuth = true;
const headers = generatePostAuthHeaders('aigc_word_create');
```

**预期结果**：
- 最终请求头应该包含：
  ```javascript
  {
    'Content-Type': 'application/json',
    'Timestamp': '1703123456789',
    'Signature': 'sha256hash...',
    'accessToken': 'xxx',
    'uuid': 'xxx'
  }
  ```

## 🔬 调试步骤

### **1. 当前测试（不使用签名）**
1. 打开浏览器开发者工具
2. 在视频生成页面输入测试数据
3. 提交表单
4. 查看控制台输出和Network请求

**期望看到的日志**：
```
=== createAIGCWord called ===
Input data: { series_name: '测试系列', title: '测试-apple', word: 'apple' }
Using headers: { 'Content-Type': 'application/json' }
Signature auth enabled: false
Request interceptor - URL: /api/v1/aigc/word/create
Request interceptor - Original options: { method: 'POST', headers: {...}, data: {...} }
Final headers: { 'Content-Type': 'application/json', 'accessToken': 'xxx', 'uuid': 'xxx' }
```

### **2. 网络请求验证**
在Network标签页中检查：
- 请求URL：`/manager/api/v1/aigc/word/create`
- 请求头是否包含 `accessToken` 和 `uuid`
- 响应状态码和内容

## 📊 判断标准

### **如果不使用签名认证成功**：
- ✅ 响应状态码 200
- ✅ 响应包含有效数据
- ✅ 没有认证错误
- **结论**：AIGC API使用 `accessToken` 认证，不需要签名

### **如果不使用签名认证失败**：
- ❌ 响应状态码 401/403
- ❌ 认证相关错误信息
- **结论**：需要切换到签名认证方式

## 🎯 下一步行动

### **方案A：如果accessToken认证有效**
1. 保持当前的简单认证方式
2. 移除不必要的签名认证代码
3. 确保所有AIGC API使用一致的认证

### **方案B：如果需要签名认证**
1. 将 `useSignatureAuth` 改为 `true`
2. 更新所有AIGC API函数
3. 测试签名认证是否工作正常

## 📝 测试数据

```javascript
const testData = {
  series_name: '测试系列',
  title: '测试单词视频-apple',
  word: 'apple'
};
```

---

**测试状态**：🔄 进行中  
**当前设置**：不使用签名认证  
**下次更新**：根据测试结果决定最终认证方式


































































