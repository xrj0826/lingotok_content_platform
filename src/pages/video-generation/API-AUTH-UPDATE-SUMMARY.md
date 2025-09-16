# 🔐 视频生成API认证方式更新总结

## 📋 问题分析

通过对比其他页面的API调用方式，发现视频生成页面的接口缺少了项目标准的签名认证机制：

### **其他页面使用的认证方式：**
```javascript
// 标准签名认证
const headers = {
  'Content-Type': 'application/json',
  'Timestamp': timestamp.toString(),
  'Signature': signature
};
```

### **视频生成页面之前使用的认证方式：**
```javascript
// 错误的Bearer token认证
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer token'
};
```

## 🔧 修复内容

### 1. **添加签名认证工具函数**
```javascript
// 生成带签名的请求头（GET请求）
function generateAuthHeaders(apiName: string) {
  const requestParams = generateRequestParams(apiName);
  return {
    'Timestamp': requestParams.Timestamp.toString(),
    'Signature': requestParams.Signature,
  };
}

// 生成带签名的POST请求头
function generatePostAuthHeaders(apiName: string) {
  return {
    'Content-Type': 'application/json',
    ...generateAuthHeaders(apiName),
  };
}
```

### 2. **更新的API函数示例**

#### **修复前：**
```javascript
export const createAIGCWord = (data) => {
  return request('/api/v1/aigc/word/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
};
```

#### **修复后：**
```javascript
export const createAIGCWord = (data) => {
  return request('/api/v1/aigc/word/create', {
    method: 'POST',
    headers: generatePostAuthHeaders('aigc_word_create'),
    data,
  });
};
```

### 3. **已更新的API函数**

✅ **核心函数已更新**：
- `createAIGCWord` - 创建单词视频
- `getAIGCWord` - 获取单词视频详情  
- `operateAIGCWordGenImg` - 生成AI图片
- `createAIGCDialog` - 创建对话视频
- `getAIGCFinalVideoList` - 获取视频列表

🔄 **待更新函数**：
- 其他操作类API函数
- 火山引擎服务API
- 回调处理函数

## 📝 API名称映射表

| 函数名 | API名称 | 说明 |
|--------|---------|------|
| `createAIGCWord` | `aigc_word_create` | 创建单词视频 |
| `getAIGCWord` | `aigc_word_get` | 获取单词视频详情 |
| `operateAIGCWordGenImg` | `aigc_word_operate` | 单词视频操作 |
| `createAIGCDialog` | `aigc_dialog_create` | 创建对话视频 |
| `getAIGCDialog` | `aigc_dialog_get` | 获取对话视频详情 |
| `operateAIGCDialogGenFarImg` | `aigc_dialog_operate` | 对话视频操作 |
| `getAIGCFinalVideoList` | `aigc_final_video_list` | 获取最终视频列表 |
| `generateImageFromText` | `huoshan_text_to_image` | 火山引擎文生图 |
| `generateTTS` | `huoshan_tts` | 火山引擎TTS |

## 🧪 测试验证

### **测试数据：**
```javascript
// 单词视频测试
const testData = {
  series_name: '测试系列',
  title: '测试单词视频-apple',
  word: 'apple'
};
```

### **预期请求头：**
```javascript
{
  "Content-Type": "application/json",
  "Timestamp": "1703123456789",
  "Signature": "a1b2c3d4e5f6..."
}
```

### **验证步骤：**
1. 打开浏览器开发者工具
2. 提交测试数据
3. 查看Network请求
4. 确认请求头包含`Timestamp`和`Signature`

## 🔍 签名算法说明

项目使用的签名算法：
```javascript
// 签名生成规则
const message = `${apiName}${timestamp}lingotok`;
const signature = CryptoJS.SHA256(message).toString();
```

### **签名组成：**
- **API名称**：如 `aigc_word_create`
- **时间戳**：当前时间的毫秒数
- **固定密钥**：`lingotok`

## 📊 更新进度

- ✅ **分析其他页面认证机制**
- ✅ **创建签名认证工具函数**  
- ✅ **更新核心API函数**
- ✅ **创建测试验证脚本**
- 🔄 **批量更新剩余API函数**（进行中）

## 🎯 下一步行动

1. **完成所有API函数的认证更新**
2. **全面测试更新后的API调用**
3. **确认与后端API的兼容性**
4. **清理旧的认证代码**

## 📝 注意事项

- 所有API都必须使用相同的签名算法
- 时间戳和签名必须在每次请求时重新生成
- API名称必须与后端期望的名称完全一致
- GET请求只需要`Timestamp`和`Signature`
- POST请求还需要`Content-Type: application/json`

---

**更新完成时间**: ${new Date().toLocaleString()}  
**更新状态**: 🔄 核心功能已更新，其他API持续更新中


































































