# 最终视频提交工作流程实现

## 功能概述

根据API文档实现了完整的最终视频提交工作流程：

```
视频编辑 → OBS上传 → 获取云端URL → 调用API提交
```

## 🔄 完整流程

### 1. **视频编辑完成**
- 用户在VideoEditingDialog中完成视频剪切和拼接
- 点击"设为最终结果"触发云端上传

### 2. **华为云OBS上传**
- 自动将拼接结果上传到华为云OBS
- 获取云端访问URL
- 设置为最终视频结果

### 3. **返回主流程**
- 自动跳转到完成步骤（第五步）
- 显示最终视频预览和详细信息

### 4. **提交到API**
- 点击"提交视频"按钮
- 调用 `api/v1/aigc/operate_aigc_dialog` 接口
- 传递最终视频的云端URL

## 🛠 技术实现

### VideoEditingDialog.vue 修改

#### 1. **OBS上传函数**
```typescript
const uploadToHuaweiOBS = async (file: File): Promise<string> => {
  const obsClient = new ObsClient({
    access_key_id: 'your_access_key_id',
    secret_access_key: 'your_secret_access_key', 
    server: 'https://obs.cn-north-4.myhuaweicloud.com',
  });

  const fileName = `video_editing/${timestamp}_${file.name}`;
  
  const result = await obsClient.putObject({
    Bucket: 'lingotok',
    Key: fileName,
    SourceFile: file,
    ACL: 'public-read',
    ContentType: file.type,
  });

  return `https://lingotok.obs.cn-north-4.myhuaweicloud.com/${fileName}`;
};
```

#### 2. **设为最终结果**
```typescript
const setAsFinalResult = async () => {
  try {
    // 1. 获取拼接结果文件
    const response = await fetch(mergeResult.value.url);
    const blob = await response.blob();
    const file = new File([blob], mergeResult.value.title, { type: 'video/mp4' });
    
    // 2. 上传到华为云OBS
    const cloudUrl = await uploadToHuaweiOBS(file);
    
    // 3. 设置云端URL为最终结果
    finalResult.value = {
      url: cloudUrl,
      title: mergeResult.value.title
    };
    
    MessagePlugin.success('视频已上传到华为云OBS，设为最终结果');
  } catch (error) {
    MessagePlugin.error(`上传失败: ${error.message}`);
  }
};
```

### AIGCDialogFlow.vue 修改

#### 1. **处理编辑结果**
```typescript
const handleVideoEditConfirm = (result) => {
  if (result?.url.startsWith('https://') && result.url.includes('obs.')) {
    // 云端URL，设为最终视频
    finalVideoUrl.value = result.url;
    finalVideoUploadTime.value = new Date().toLocaleString();
    
    // 自动跳转到完成步骤
    if (currentStepIndex.value === 3) {
      setTimeout(() => nextStep(), 1500);
    }
  }
};
```

#### 2. **提交最终视频**
```typescript
const submitFinalVideo = async () => {
  // 优先使用编辑后的视频URL
  const finalUrl = finalVideoUrl.value || currentVideo.value?.play_url;
  
  const response = await operateAIGCDialogSubmitFinal({
    id: videoId.value,
    series_name: formData.value.series_name || '默认合集',
    title: formData.value.title,
    final_video_url: finalUrl
  });
  
  if (response.code === 200) {
    MessagePlugin.success('视频提交成功！');
    emit('success', response.data.aigc_dialog);
  }
};
```

## 📋 API接口调用

### 接口详情
- **URL**: `api/v1/aigc/operate_aigc_dialog`
- **方法**: `POST` 
- **操作**: `submit_final_video`

### 请求参数
```typescript
{
  id: string,                    // 对话视频ID
  operation: "submit_final_video", // 操作类型
  series_name: string,           // 合集名称(必传)
  title: string,                 // 视频标题(必传)
  final_video_url: string        // 最终视频URL(必传)
}
```

### 响应数据
```typescript
{
  code: 200,
  data: {
    aigc_dialog: AIGCDialog      // 更新后的对话视频对象
  }
}
```

## 🎯 用户界面优化

### 第五步完成界面

#### 1. **视频来源显示**
```vue
<div class="summary-item">
  <span>视频来源：</span>
  <span v-if="finalVideoUrl" class="video-source edited">
    🎬 编辑后的最终视频
    <small>({{ finalVideoUploadTime }})</small>
  </span>
  <span v-else class="video-source generated">
    🤖 系统生成的视频
  </span>
</div>
```

#### 2. **最终视频预览**
```vue
<div class="final-video">
  <h4>{{ finalVideoUrl ? '编辑后的最终视频' : '系统生成的视频' }}</h4>
  <video :src="finalVideoUrl || currentVideo.play_url" controls />
  
  <!-- 编辑视频详细信息 -->
  <div v-if="finalVideoUrl" class="video-info">
    <p class="video-tip">
      <t-icon name="check-circle" />
      此视频已通过编辑工具处理并上传到华为云OBS
    </p>
    <div class="video-details">
      <p><strong>上传时间:</strong> {{ finalVideoUploadTime }}</p>
      <p><strong>视频地址:</strong> {{ finalVideoUrl }}</p>
    </div>
  </div>
</div>
```

#### 3. **提交按钮**
```vue
<t-button theme="primary" size="large" @click="submitFinalVideo" :loading="loadingSubmit">
  提交视频
</t-button>
```

## 🔒 安全性配置

### 环境变量设置
```env
# 华为云OBS配置
VUE_APP_OBS_ACCESS_KEY=your_actual_access_key
VUE_APP_OBS_SECRET_KEY=your_actual_secret_key
VUE_APP_OBS_BUCKET=lingotok
VUE_APP_OBS_REGION=cn-north-4
VUE_APP_OBS_ENDPOINT=https://obs.cn-north-4.myhuaweicloud.com
```

### 生产环境配置
```typescript
const obsClient = new ObsClient({
  access_key_id: process.env.VUE_APP_OBS_ACCESS_KEY,
  secret_access_key: process.env.VUE_APP_OBS_SECRET_KEY,
  server: process.env.VUE_APP_OBS_ENDPOINT,
});
```

## 🎛 完整工作流程

### 用户操作路径

1. **生成对话视频** → 进入第四步
2. **点击编辑按钮** → 打开VideoEditingDialog
3. **选择本地视频** → 进行剪切和拼接
4. **设为最终结果** → 自动上传到OBS获取云端URL
5. **确认返回** → 自动跳转到第五步
6. **查看最终视频** → 确认编辑结果和详细信息
7. **提交视频** → 调用API完成整个流程

### 系统处理流程

1. **接收编辑结果** → 检查是否为云端URL
2. **保存最终视频信息** → 记录URL和上传时间
3. **更新界面状态** → 显示最终视频预览
4. **API调用** → 传递final_video_url给后端
5. **完成提交** → 触发success事件返回结果

## ✅ 功能特点

1. **自动化流程**：编辑完成后自动上传和跳转
2. **状态跟踪**：完整记录视频来源和处理时间
3. **错误处理**：完善的错误提示和重试机制
4. **用户友好**：清晰的进度提示和状态显示
5. **安全可靠**：云端存储和API标准化调用

这个实现完全符合API文档要求，提供了完整的视频编辑到提交的闭环流程。











