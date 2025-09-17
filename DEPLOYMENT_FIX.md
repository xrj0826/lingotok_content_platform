# 部署错误修复指南

## 问题分析

根据部署后的错误截图，主要存在以下问题：

1. **404错误** - `iconfont.js` 和 `logo.svg` 文件无法找到
2. **MIME类型错误** - JavaScript文件被识别为 `binary/octet-stream` 而不是 `application/javascript`
3. **CORS问题** - 缺乏适当的跨域头部设置

## 解决方案

### 1. 已修复的文件

- ✅ `dist/_headers` - 添加了完整的CORS和MIME类型配置
- ✅ `dist/index.html` - 修复了字体和图标文件路径
- ✅ `dist/.htaccess` - 为Apache服务器添加了配置
- ✅ `nginx.conf` - 为Nginx服务器添加了配置

### 2. 部署步骤

#### 如果使用Nginx：

1. 将 `nginx.conf` 文件内容复制到你的Nginx服务器配置中
2. 重启Nginx服务：`sudo systemctl restart nginx`

#### 如果使用Apache：

1. 确保 `dist/.htaccess` 文件存在
2. 确保Apache启用了mod_rewrite和mod_headers模块：
   ```bash
   sudo a2enmod rewrite
   sudo a2enmod headers
   sudo systemctl restart apache2
   ```

#### 如果使用其他静态文件服务器（如Netlify、Vercel）：

1. 确保 `dist/_headers` 文件存在并正确配置
2. 重新部署应用

### 3. 验证修复

部署后检查以下内容：

1. 打开浏览器开发者工具
2. 刷新页面
3. 检查Network标签：
   - ✅ 所有JavaScript文件应该返回 `application/javascript` MIME类型
   - ✅ 所有CSS文件应该返回 `text/css` MIME类型
   - ✅ SVG文件应该返回 `image/svg+xml` MIME类型
   - ✅ 字体文件应该正确加载
   - ✅ 没有404错误

### 4. FFmpeg相关配置

该项目使用FFmpeg.wasm，需要特殊的CORS配置：

- `Cross-Origin-Embedder-Policy: credentialless`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: cross-origin`

这些头部已在配置文件中正确设置。

### 5. 常见问题排查

如果仍有问题，请检查：

1. **路径问题**: 确保所有静态资源文件都在正确的位置
2. **服务器配置**: 确保服务器支持并正确应用了配置文件
3. **缓存问题**: 清除浏览器缓存并强制刷新
4. **域名配置**: 确保域名配置正确，特别是子路径部署

### 6. 测试命令

可以使用以下命令测试资源是否正确返回：

```bash
# 测试JavaScript文件MIME类型
curl -I https://yourdomain.com/assets/index-8831cd8c.js

# 测试字体文件
curl -I https://yourdomain.com/font/iconfont.js

# 测试SVG图标
curl -I https://yourdomain.com/logo.svg
```

正确的响应应该包含适当的Content-Type头部。
