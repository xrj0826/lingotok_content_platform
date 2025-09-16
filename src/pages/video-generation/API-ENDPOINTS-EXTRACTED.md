# 🎯 AIGC API接口路径提取

## 📋 **从文档中提取的实际API接口**

根据您提供的完整API文档，我提取出了所有实际的接口路径：

### **单词类视频接口**

1. **创建单词视频**
   - **接口**: `api/v1/aigc/create_aigc_word`
   - **方法**: POST
   - **响应**: `CreateAIGCWordResp { id: string }`

2. **获取单词视频详情**
   - **接口**: `api/v1/aigc/get_aigc_word`
   - **方法**: POST
   - **请求**: `GetAIGCWordReq { id: string }`
   - **响应**: `GetAIGCWordResp { aigc_word: AIGCWord }`

3. **操作单词视频**
   - **接口**: `api/v1/aigc/operate_aigc_word`
   - **方法**: POST
   - **请求**: `OperateAIGCWordReq`

### **对话类视频接口**

4. **创建对话视频**
   - **接口**: `api/v1/aigc/create_aigc_dialog`
   - **方法**: POST
   - **响应**: `CreateAIGCDialogResp { id: string }`

5. **操作对话视频**
   - **接口**: `api/v1/aigc/operate_aigc_dialog`
   - **方法**: POST
   - **请求**: `OperateAIGCDialogReq`
   - **响应**: `OperateAIGCDialogResp { aigc_dialog: AIGCDialog }`

6. **试听对话音频**
   - **接口**: `api/v1/aigc/try_aigc_dialog_audio`
   - **方法**: POST
   - **请求**: `TryAIGCDialogAudioReq`
   - **响应**: `TryAIGCDialogAudioResp { audio_url: string }`

### **展示结果接口**

7. **获取最终视频列表**
   - **接口**: `api/v1/aigc/get_aigc_final_video_list`
   - **方法**: POST
   - **请求**: `GetAIGCFinalVideoListReq`
   - **响应**: `GetAIGCFinalVideoListResp`

### **回调接口**

8. **处理单词视频回调**
   - **接口**: `api/v1/aigc/process_aigc_word_callback`
   - **方法**: POST
   - **请求**: `PorcessAIGCWordCallbackReq`

## 🔧 **数据模型映射**

### **Go Model → TypeScript Interface**

#### **AIGCWord (Go)**
```go
type AIGCWord struct {
    mgm.DefaultModel `bson:",inline"`
    Status api_gen.AIGCWordStatus
    SeriesID string
    Title string
    Word string
    AiGenImgKey *string
    AiGenVideoTaskID *string
    AiGenVideoKey *string
    WordAudioKey *string
    FinalVideoKey *string
    VID *string
}
```

#### **AIGCWord (TypeScript)**
```typescript
export interface AIGCWord {
  id: string;
  title: string;
  status: AIGCWordStatus;
  word: string;
  ai_gen_img_url?: string;
  ai_gen_video_url?: string;
  play_url?: string;
  cover_url?: string;
}
```

### **完整的API接口URL格式**

基于您的项目结构，完整的URL应该是：
```
https://api.lingotok.ai/api/v1/aigc/create_aigc_word
https://api.lingotok.ai/api/v1/aigc/get_aigc_word
https://api.lingotok.ai/api/v1/aigc/operate_aigc_word
https://api.lingotok.ai/api/v1/aigc/create_aigc_dialog
https://api.lingotok.ai/api/v1/aigc/operate_aigc_dialog
https://api.lingotok.ai/api/v1/aigc/try_aigc_dialog_audio
https://api.lingotok.ai/api/v1/aigc/get_aigc_final_video_list
https://api.lingotok.ai/api/v1/aigc/process_aigc_word_callback
```

## 🎯 **下一步行动**

1. ✅ **提取API接口路径** - 已完成
2. 🔄 **重写API函数** - 进行中
3. ⏳ **更新数据模型** - 待开始
4. ⏳ **测试接口** - 待开始


































































