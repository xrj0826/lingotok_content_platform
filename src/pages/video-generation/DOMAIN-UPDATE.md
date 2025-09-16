# 🌐 AIGC API域名更新

## 📋 **域名变更**

根据最新要求，视频生成模块的所有接口都已更新为使用测试域名：

### **更新前**
```
❌ 错误域名: /manager (代理到 http://111.229.66.85:8866/)
❌ 错误域名: https://api.lingotok.ai
```

### **更新后**
```
✅ 正确域名: https://testapi.lingotok.ai
```

## 🎯 **影响的API接口**

现在所有AIGC API都使用新的测试域名：

### **单词视频接口**
```bash
POST https://testapi.lingotok.ai/api/v1/aigc/create_aigc_word
POST https://testapi.lingotok.ai/api/v1/aigc/get_aigc_word
POST https://testapi.lingotok.ai/api/v1/aigc/operate_aigc_word
```

### **对话视频接口**
```bash
POST https://testapi.lingotok.ai/api/v1/aigc/create_aigc_dialog
POST https://testapi.lingotok.ai/api/v1/aigc/operate_aigc_dialog
POST https://testapi.lingotok.ai/api/v1/aigc/try_aigc_dialog_audio
```

### **展示结果接口**
```bash
POST https://testapi.lingotok.ai/api/v1/aigc/get_aigc_final_video_list
```

### **回调接口**
```bash
POST https://testapi.lingotok.ai/api/v1/aigc/process_aigc_word_callback
```

## 🔧 **技术细节**

### **API基础URL配置**
```typescript
// src/api/aigc-video.ts
const API_BASE_URL = 'https://testapi.lingotok.ai';
```

### **完整的API调用示例**
```typescript
// 创建单词视频
export const createAIGCWord = async (data: {
  series_name: string;
  title: string;
  word: string;
}): Promise<ApiResponse<{ id: string }>> => {
  return await apiRequest('/api/v1/aigc/create_aigc_word', 'POST', 'create_aigc_word', data);
};

// 实际请求URL: https://testapi.lingotok.ai/api/v1/aigc/create_aigc_word
```

## 🔐 **认证方式**

继续使用 `Timestamp + Signature` 认证：

```typescript
// 请求头
{
  "Content-Type": "application/json",
  "Timestamp": "1703123456789",
  "Signature": "sha256hash..."
}
```

## 📊 **域名对比表**

| 模块 | 域名 | 用途 |
|------|------|------|
| **视频管理** | `https://api.lingotok.ai` | 生产环境视频API |
| **AIGC视频生成** | `https://testapi.lingotok.ai` | 测试环境AIGC API |
| **其他服务** | `/manager`, `/Common`, `/Api` | 开发环境代理 |

## 🧪 **测试验证**

### **1. 网络请求检查**
在浏览器开发者工具中应该看到：
```
Request URL: https://testapi.lingotok.ai/api/v1/aigc/create_aigc_word
Request Method: POST
Status: 200 OK
```

### **2. 测试数据**
```javascript
const testData = {
  series_name: '测试系列',
  title: '测试-apple',
  word: 'apple'
};
```

### **3. 预期响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "generated_word_id"
  }
}
```

## 🚨 **注意事项**

### **1. CORS配置**
确保 `https://testapi.lingotok.ai` 已配置正确的CORS策略。

### **2. SSL证书**
测试域名需要有效的SSL证书。

### **3. 防火墙设置**
确保开发环境可以访问测试域名。

## 📝 **相关文件**

已更新的文件：
- ✅ `src/api/aigc-video.ts` - API基础URL已更新

需要注意的文件：
- `vite.config.ts` - 代理配置（AIGC不再使用代理）
- 其他API文件 - 保持原有域名不变

---

**更新状态**: ✅ **完成**  
**新域名**: `https://testapi.lingotok.ai`  
**生效范围**: 所有AIGC视频生成接口

**现在请测试新域名的API调用！** 🚀


































































