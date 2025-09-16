# FFmpeg正确配置指南

## 参考文档
本配置完全按照 [CSDN文档](https://blog.csdn.net/qq_45902692/article/details/135032429) 的最佳实践进行。

## 关键修复点

### 1. 文件引用方式
**❌ 错误方式（直接使用路径）:**
```javascript
await ffmpeg.load({
  coreURL: '/ffmpeg/ffmpeg-core.js',
  wasmURL: '/ffmpeg/ffmpeg-core.wasm',
  workerURL: '/ffmpeg/ffmpeg-core.worker.js',
});
```

**✅ 正确方式（使用toBlobURL）:**
```javascript
import { toBlobURL } from '@ffmpeg/util';

await ffmpeg.load({
  coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
  wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
  workerURL: await toBlobURL('/ffmpeg/ffmpeg-core.worker.js', 'text/javascript'),
});
```

### 2. 跨域隔离配置
**vite.config.ts 正确配置:**
```typescript
server: {
  headers: {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",  // 注意：必须是require-corp
    "Cross-Origin-Resource-Policy": "cross-origin",
  },
}
```

### 3. 完整的文件结构
```
public/
└── ffmpeg/
    ├── ffmpeg-core.js        # 核心JavaScript文件
    ├── ffmpeg-core.wasm      # WebAssembly文件
    ├── ffmpeg-core.worker.js # Worker文件
    ├── const.js              # 常量定义（Worker依赖）
    ├── errors.js             # 错误定义（Worker依赖）
    ├── types.js              # 类型定义（可选）
    ├── utils.js              # 工具函数（可选）
    └── classes.js            # 类定义（可选）
```

**注意**: `const.js`和`errors.js`是必需的，因为`ffmpeg-core.worker.js`会导入这些文件。

## 测试步骤

1. **访问测试页面**: `http://localhost:8889/#/video-editor`
2. **点击"🔧 快速测试"标签页**
3. **点击"📚 文档推荐配置"按钮**
4. **查看控制台日志**获取详细信息

## 环境要求

- ✅ **协议**: HTTPS 或 localhost
- ✅ **浏览器**: Chrome 68+, Firefox 79+, Safari 15.2+
- ✅ **SharedArrayBuffer**: 可用
- ✅ **crossOriginIsolated**: true

## 常见问题解决

### Q: 仍然卡在加载状态？
A: 
1. 检查浏览器控制台的详细错误信息
2. 确认 `crossOriginIsolated` 返回 `true`
3. 重启开发服务器
4. 清除浏览器缓存

### Q: SharedArrayBuffer 不可用？
A:
1. 检查 vite.config.ts 中的CORS头部配置
2. 确保使用正确的协议（HTTPS或localhost）
3. 重启开发服务器

### Q: 文件无法访问？
A:
1. 确认文件存在于 `public/ffmpeg/` 目录
2. 检查文件权限
3. 尝试直接访问 `http://localhost:8889/ffmpeg/ffmpeg-core.js`

## 配置优先级

1. **📚 文档推荐配置** - 使用toBlobURL的标准方式
2. **⚡ 简化版配置** - 使用默认加载方式
3. **🔧 完整版配置** - 包含备用CDN的完整配置

## 成功标志

当看到以下日志时表示配置成功：
```
🚀 按照文档标准初始化FFmpeg...
✅ 环境检查通过
✅ ffmpeg-core.js 文件检查通过
✅ ffmpeg-core.wasm 文件检查通过  
✅ ffmpeg-core.worker.js 文件检查通过
✅ const.js 文件检查通过
✅ errors.js 文件检查通过
🔄 使用toBlobURL转换文件...
🎉 FFmpeg加载成功！
```
