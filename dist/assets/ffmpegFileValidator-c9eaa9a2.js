var $=Object.defineProperty;var b=(f,s,e)=>s in f?$(f,s,{enumerable:!0,configurable:!0,writable:!0,value:e}):f[s]=e;var p=(f,s,e)=>(b(f,typeof s!="symbol"?s+"":s,e),e);import{Y as F}from"./index-a8a25b76.js";import{a as w}from"./ffmpegForcedMode-4b2cd4b0.js";class d{static async validateFile(s){const e=Date.now(),i=`${this.baseURL}/${s}`,t={file:s,exists:!1,size:0,accessible:!1,loadTime:0};try{console.log(`🔍 检查文件: ${i}`);const r=await fetch(i,{method:"HEAD"});if(t.exists=r.ok,t.accessible=r.ok,r.ok){const l=r.headers.get("content-length");t.size=l?parseInt(l,10):0,console.log(`✅ ${s} - 大小: ${this.formatFileSize(t.size)}`)}else t.error=`HTTP ${r.status}: ${r.statusText}`,console.log(`❌ ${s} - 错误: ${t.error}`)}catch(r){t.error=r instanceof Error?r.message:String(r),console.log(`❌ ${s} - 异常: ${t.error}`)}return t.loadTime=Date.now()-e,t}static async validateAllFiles(s){var h,m;console.log("🚀 开始验证FFmpeg文件...");const e=[],i=[],t=[];for(let a=0;a<this.requiredFiles.length;a++){const c=this.requiredFiles[a];s==null||s(a+1,this.requiredFiles.length,c);const g=await this.validateFile(c);e.push(g),g.accessible||((h=g.error)!=null&&h.includes("404")?i.push(`${c} 文件不存在`):(m=g.error)!=null&&m.includes("403")?i.push(`${c} 文件无访问权限`):i.push(`${c} 无法访问: ${g.error}`))}const r=e.filter(a=>a.accessible).length,l=e.reduce((a,c)=>a+c.size,0),o=r===this.requiredFiles.length;o||(t.push("检查 public/ffmpeg/ 目录是否存在"),t.push("确保所有FFmpeg文件已正确放置"),t.push("检查文件权限设置"),t.push("尝试重新下载FFmpeg文件"));const n=e.find(a=>a.file==="ffmpeg-core.wasm");n!=null&&n.accessible&&n.size<20*1024*1024&&(i.push("ffmpeg-core.wasm 文件太小，可能不完整"),t.push("重新下载完整的 ffmpeg-core.wasm 文件 (~25MB)"));const u=e.find(a=>a.file==="ffmpeg-core.js");return u!=null&&u.accessible&&u.size<100*1024&&(i.push("ffmpeg-core.js 文件太小，可能不完整"),t.push("重新下载完整的 ffmpeg-core.js 文件 (~200KB)")),console.log(`📊 验证完成: ${r}/${this.requiredFiles.length} 文件有效`),{allValid:o,totalFiles:this.requiredFiles.length,validFiles:r,totalSize:l,results:e,issues:i,suggestions:t}}static async testFileContent(s){try{console.log(`📄 测试文件内容: ${s}`);const e=await fetch(`${this.baseURL}/${s}`);if(!e.ok)return{success:!1,error:`HTTP ${e.status}: ${e.statusText}`};const i=e.headers.get("content-type")||"unknown";if(s.endsWith(".wasm")){const t=await e.arrayBuffer();return{success:!0,contentType:i,preview:`WASM文件，大小: ${t.byteLength} 字节`}}else{const t=await e.text(),r=t.length>100?t.substring(0,100)+"...":t;return{success:!0,contentType:i,preview:r}}}catch(e){return{success:!1,error:e instanceof Error?e.message:String(e)}}}static async testToBlobURL(){try{console.log("🔄 测试 toBlobURL 转换...");const{toBlobURL:s}=await F(()=>import("./index-c5152193.js"),[]),e="const.js",i=await s(`${this.baseURL}/${e}`,"text/javascript");return i.startsWith("blob:")?(await fetch(i)).ok?(URL.revokeObjectURL(i),{success:!0,details:"成功转换并验证 blob URL"}):{success:!1,error:"生成的 blob URL 无法访问"}:{success:!1,error:"toBlobURL 未生成有效的 blob URL"}}catch(s){return{success:!1,error:s instanceof Error?s.message:String(s)}}}static async validateEnvironment(){console.log("🔍 开始完整环境验证..."),console.log("🔧 应用FFmpeg强制兼容模式");try{w(),console.log("✅ FFmpeg强制兼容模式应用成功")}catch(o){console.warn("⚠️ FFmpeg强制兼容模式应用失败，继续验证",o)}const s=await this.validateAllFiles(),e=["ffmpeg-core.js","ffmpeg-core.wasm","const.js"],i=[];for(const o of e)if(s.results.find(n=>n.file===o&&n.accessible)){const n=await this.testFileContent(o);i.push({file:o,...n})}const t=await this.testToBlobURL(),r={hasSharedArrayBuffer:typeof SharedArrayBuffer<"u",isCrossOriginIsolated:typeof crossOriginIsolated<"u"?crossOriginIsolated:!1,protocol:typeof window<"u"?window.location.protocol:"unknown",ffmpegUtilAvailable:!1};try{await F(()=>import("./index-c5152193.js"),[]),r.ffmpegUtilAvailable=!0}catch(o){console.warn("@ffmpeg/util 不可用:",o)}const l=s.allValid&&r.ffmpegUtilAvailable;return(!r.hasSharedArrayBuffer||!r.isCrossOriginIsolated)&&console.warn("⚠️ 警告: SharedArrayBuffer或跨域隔离不可用，部分视频处理功能可能受限"),console.log(`🎯 环境验证完成，整体状态: ${l?"✅ 正常":"❌ 有问题"}`),{fileValidation:s,contentTest:i,blobURLTest:t,environment:r,overall:l}}static formatFileSize(s){if(s===0)return"0 B";const e=1024,i=["B","KB","MB","GB"],t=Math.floor(Math.log(s)/Math.log(e));return parseFloat((s/Math.pow(e,t)).toFixed(2))+" "+i[t]}static generateReport(s){const{fileValidation:e,contentTest:i,blobURLTest:t,environment:r,overall:l}=s;let o=`# FFmpeg 文件验证报告

`;return o+=`## 总体状态: ${l?"✅ 正常":"❌ 有问题"}

`,o+=`## 文件验证结果

`,o+=`- 总文件数: ${e.totalFiles}
`,o+=`- 有效文件: ${e.validFiles}
`,o+=`- 总大小: ${this.formatFileSize(e.totalSize)}

`,o+=`### 文件详情

`,e.results.forEach(n=>{const u=n.accessible?"✅":"❌",h=n.accessible?this.formatFileSize(n.size):"N/A";o+=`- ${u} ${n.file} (${h})
`,n.error&&(o+=`  - 错误: ${n.error}
`)}),o+=`
## 环境检查

`,o+=`- SharedArrayBuffer: ${r.hasSharedArrayBuffer?"✅":"❌"}
`,o+=`- 跨域隔离: ${r.isCrossOriginIsolated?"✅":"❌"}
`,o+=`- 协议: ${r.protocol}
`,o+=`- FFmpeg工具库: ${r.ffmpegUtilAvailable?"✅":"❌"}
`,o+=`
## toBlobURL 测试

`,o+=`- 状态: ${t.success?"✅ 正常":"❌ 失败"}
`,t.error&&(o+=`- 错误: ${t.error}
`),t.details&&(o+=`- 详情: ${t.details}
`),e.issues.length>0&&(o+=`
## 发现的问题

`,e.issues.forEach(n=>{o+=`- ${n}
`})),e.suggestions.length>0&&(o+=`
## 解决建议

`,e.suggestions.forEach(n=>{o+=`- ${n}
`})),o}}p(d,"requiredFiles",["ffmpeg-core.js","ffmpeg-core.wasm","ffmpeg-core.worker.js","const.js","errors.js","types.js","utils.js","classes.js"]),p(d,"baseURL","/ffmpeg");async function L(){return d.validateAllFiles()}export{d as F,L as q};
