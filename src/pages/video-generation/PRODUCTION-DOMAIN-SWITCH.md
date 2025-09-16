# 🚀 AIGC API切换至正式域名

## 📋 **域名切换**

视频生成页面的所有接口已统一切换为正式域名：

### **切换详情**
```diff
- const API_BASE_URL = 'https://testapi.lingotok.ai';  // 测试域名
+ const API_BASE_URL = 'https://api.lingotok.ai';     // 正式域名 ✅
```

## 🎯 **统一后的API接口**

现在所有AIGC API都使用正式域名，与项目其他模块完全统一：

### **单词视频接口**
```bash
POST https://api.lingotok.ai/api/v1/aigc/create_aigc_word
POST https://api.lingotok.ai/api/v1/aigc/get_aigc_word
POST https://api.lingotok.ai/api/v1/aigc/operate_aigc_word
```

### **对话视频接口**
```bash
POST https://api.lingotok.ai/api/v1/aigc/create_aigc_dialog
POST https://api.lingotok.ai/api/v1/aigc/operate_aigc_dialog
POST https://api.lingotok.ai/api/v1/aigc/try_aigc_dialog_audio
```

### **展示结果接口**
```bash
POST https://api.lingotok.ai/api/v1/aigc/get_aigc_final_video_list
```

### **回调接口**
```bash
POST https://api.lingotok.ai/api/v1/aigc/process_aigc_word_callback
```

## 📊 **项目域名统一性**

现在整个项目的API域名完全统一：

| 模块 | 域名 | 状态 |
|------|------|------|
| **视频管理** | `https://api.lingotok.ai` | ✅ 正式域名 |
| **AIGC视频生成** | `https://api.lingotok.ai` | ✅ 正式域名 |
| **订单管理** | `https://api.lingotok.ai` | ✅ 正式域名 |
| **用户管理** | `https://api.lingotok.ai` | ✅ 正式域名 |

## 🔐 **认证方式保持一致**

继续使用标准的 `Timestamp + Signature` 认证：

```typescript
// 请求头示例
{
  "Content-Type": "application/json",
  "Timestamp": "1703123456789",
  "Signature": "sha256hash..."
}
```

## 🎯 **API调用示例**

### **创建单词视频**
```typescript
// 完整URL: https://api.lingotok.ai/api/v1/aigc/create_aigc_word
const result = await createAIGCWord({
  series_name: '英语基础系列',
  title: '第1课-apple',
  word: 'apple'
});
```

### **获取单词视频详情**
```typescript
// 完整URL: https://api.lingotok.ai/api/v1/aigc/get_aigc_word
const result = await getAIGCWord('word_id_123');
```

### **操作单词视频**
```typescript
// 完整URL: https://api.lingotok.ai/api/v1/aigc/operate_aigc_word
const result = await operateAIGCWordGenImg({
  id: 'word_id_123',
  word_prompt: 'A red apple on white background'
});
```

## 🧪 **测试验证**

### **1. 网络请求检查**
在浏览器开发者工具中应该看到：
```
Request URL: https://api.lingotok.ai/api/v1/aigc/create_aigc_word
Request Method: POST
Request Headers:
  Content-Type: application/json
  Timestamp: 1703123456789
  Signature: sha256hash...
```

### **2. 与其他模块对比**
AIGC API现在与视频管理API使用相同的域名：
```bash
# 视频管理API (参考)
POST https://api.lingotok.ai/api/v1/video/search_video

# AIGC API (现在)
POST https://api.lingotok.ai/api/v1/aigc/create_aigc_word
```

### **3. 测试数据**
```javascript
const testData = {
  series_name: '测试系列',
  title: '测试-apple',
  word: 'apple'
};
```

## ✅ **切换优势**

### **1. 域名统一**
- 整个项目使用统一的正式域名
- 便于运维和管理

### **2. 环境一致**
- 开发、测试、生产环境保持一致
- 减少环境差异导致的问题

### **3. 认证统一**
- 所有API使用相同的认证机制
- 简化前端代码维护

## 🚨 **注意事项**

### **1. 缓存清理**
切换域名后建议清除浏览器缓存。

### **2. 网络检查**
确保正式域名的网络连通性。

### **3. CORS配置**
确认正式域名的CORS策略正确配置。

---

**切换状态**: ✅ **完成**  
**正式域名**: `https://api.lingotok.ai`  
**统一性**: 与项目其他模块完全一致

**现在所有视频生成接口都使用正式域名！** 🎉


































































