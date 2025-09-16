# FFmpeg SharedArrayBuffer 问题解决指南

## 问题描述

在Vue项目中使用FFmpeg.wasm时，可能遇到以下错误：
- `SharedArrayBuffer is not defined`
- `ReferenceError: SharedArrayBuffer is not defined`
- `The Cross-Origin-Opener-Policy header has been ignored`

## 解决方案

### 1. 配置开发环境跨域隔离

在 `vite.config.ts` 中添加正确的CORS头部：

```typescript
export default ({ mode }: ConfigEnv): UserConfig => {
  return {
    // ... 其他配置
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",  // 注意：必须是 require-corp
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    },
  };
};
```

### 2. 配置生产环境

在项目根目录创建 `_headers` 文件：

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Resource-Policy: cross-origin

/ffmpeg/*
  Cross-Origin-Resource-Policy: cross-origin
```

### 3. 使用诊断工具

```typescript
import { logFFmpegDiagnostic, showDiagnosticModal } from '@/utils/ffmpegDiagnostic';

// 在控制台显示诊断信息
logFFmpegDiagnostic();

// 在页面显示诊断弹窗
showDiagnosticModal();
```

### 4. 检查环境要求

- ✅ 使用HTTPS协议或localhost环境
- ✅ 现代浏览器支持（Chrome 68+, Firefox 79+, Safari 15.2+）
- ✅ 正确的CORS头部配置
- ✅ 重启开发服务器

## 常见问题

### Q: 配置了头部但仍然报错？
A: 确保重启开发服务器，并清除浏览器缓存。

### Q: 在HTTP环境下无法使用？
A: SharedArrayBuffer需要安全上下文，必须使用HTTPS或localhost。

### Q: 浏览器兼容性问题？
A: 检查浏览器版本，Safari需要15.2+版本。

### Q: 生产环境配置？
A: 确保服务器配置了正确的CORS头部，或使用_headers文件。

## 验证步骤

1. 在浏览器控制台运行：`console.log(crossOriginIsolated)`，应该返回 `true`
2. 运行：`console.log(typeof SharedArrayBuffer !== 'undefined')`，应该返回 `true`
3. 使用诊断工具检查详细状态

## 进一步帮助

如果问题仍然存在，请：
1. 检查浏览器开发者工具的网络面板
2. 查看控制台的详细错误信息
3. 使用提供的诊断工具获取完整报告
































