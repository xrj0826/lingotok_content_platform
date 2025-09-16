# 🔍 IDL文档到HTTP接口路径映射分析

## 📋 **IDL结构分析**

根据您提供的IDL文档，我可以分析出以下接口结构：

### **单词类视频接口**

#### **1. 创建单词视频**
```thrift
// IDL中没有明确的请求结构，只有响应
struct CreateAIGCWordResp {
    1: required string id,
}
```
**推测的HTTP接口**：
- **方法**：`POST`
- **可能路径**：`/aigc/word/create` 或 `/api/v1/aigc/word/create`
- **请求参数**：需要从业务逻辑推断（series_name, title, word）

#### **2. 获取单词视频详情**
```thrift
struct GetAIGCWordReq {
    1: required string id,
}
struct GetAIGCWordResp {
    1: required AIGCWord aigc_word,
}
```
**推测的HTTP接口**：
- **方法**：`GET` 或 `POST`
- **可能路径**：`/aigc/word/get` 或 `/api/v1/aigc/word/get`
- **请求参数**：`{ "id": "word_id" }`

#### **3. 操作单词视频**
```thrift
struct OperateCreateAIGCWordReq {
    1: required string id,
    2: required AIGCWordOperation operation,
    3: optional string series_name,
    4: optional string title,
    5: optional string word,
    6: optional string word_prompt,
}
```
**推测的HTTP接口**：
- **方法**：`POST`
- **可能路径**：`/aigc/word/operate` 或 `/api/v1/aigc/word/operate`
- **请求参数**：包含id, operation等

### **对话类视频接口**

#### **4. 创建对话视频**
```thrift
struct CreateAIGCDialogResp {
    1: required string id,
}
```
**推测的HTTP接口**：
- **方法**：`POST`
- **可能路径**：`/aigc/dialog/create` 或 `/api/v1/aigc/dialog/create`

#### **5. 操作对话视频**
```thrift
struct OperateAIGCDialogReq {
    1: required string id,
    2: required AIGCDialogOperation operation,
    3: optional string far_img_prompt,
    4: optional AIGCDialogDetail detail_a,
    5: optional AIGCDialogDetail detail_b,
    6: optional string final_video_url,
}
```
**推测的HTTP接口**：
- **方法**：`POST`
- **可能路径**：`/aigc/dialog/operate` 或 `/api/v1/aigc/dialog/operate`

#### **6. 试听对话音频**
```thrift
struct TryAIGCDialogAudioReq {
    1: required string content,
    2: required string audio_type,
    3: required double audio_ratio,
}
struct TryAIGCDialogAudioResp {
    1: required string audio_url,
}
```
**推测的HTTP接口**：
- **方法**：`POST`
- **可能路径**：`/aigc/dialog/try-audio` 或 `/api/v1/aigc/dialog/try-audio`

### **展示结果接口**

#### **7. 获取最终视频列表**
```thrift
struct GetAIGCFinalVideoListReq {
    1: required i32 offset,
    2: required i32 limit,
    3: required AIGCType aigc_type,
}
struct GetAIGCFinalVideoListResp {
    1: required list<AIGCWord> aigc_word_list,
    2: required list<AIGCDialog> aigc_dialog_list,
    3: required i32 total,
}
```
**推测的HTTP接口**：
- **方法**：`GET` 或 `POST`
- **可能路径**：`/aigc/final-video/list` 或 `/api/v1/aigc/final-video/list`

### **回调接口**

#### **8. 处理单词视频回调**
```thrift
struct PorcessAIGCWordCallbackReq {
    1: required string id,
    2: required bool success,
    3: required string final_video_key
}
```
**推测的HTTP接口**：
- **方法**：`POST`
- **可能路径**：`/aigc/word/callback` 或 `/callback/aigc/word`

## 🤔 **需要确认的信息**

由于IDL文档没有包含HTTP路径信息，我需要您帮助确认：

### **1. 基础URL前缀**
- 是使用 `https://api.lingotok.ai` 还是其他域名？
- 路径前缀是 `/api/v1/` 还是直接 `/`？

### **2. 具体接口路径**
请确认实际的接口路径，例如：
- 创建单词视频：`POST /api/v1/aigc/word/create`？
- 获取单词视频：`GET /api/v1/aigc/word/get`？
- 操作单词视频：`POST /api/v1/aigc/word/operate`？

### **3. 请求方法**
- 所有接口都是POST还是有GET？
- 参数是放在body还是query string？

### **4. 认证方式**
- 是否使用Timestamp + Signature认证？
- 还是使用其他认证方式？

## 📝 **建议的调研方式**

1. **查看后端代码**：如果可以访问后端代码，查看路由定义
2. **查看API网关配置**：检查nginx或其他网关的路由配置
3. **查看现有的网络请求**：使用浏览器开发者工具查看现有的请求
4. **咨询后端开发人员**：直接询问实际的接口路径

## 🎯 **一旦获得路径信息**

请提供实际的接口路径，格式如下：
```
POST https://api.lingotok.ai/api/v1/aigc/word/create
GET  https://api.lingotok.ai/api/v1/aigc/word/get
POST https://api.lingotok.ai/api/v1/aigc/word/operate
...
```

我会立即更新API调用代码以匹配实际的接口路径！


































































