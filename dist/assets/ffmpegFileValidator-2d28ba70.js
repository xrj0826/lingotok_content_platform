var b=Object.defineProperty;var F=(u,s,e)=>s in u?b(u,s,{enumerable:!0,configurable:!0,writable:!0,value:e}):u[s]=e;var g=(u,s,e)=>(F(u,typeof s!="symbol"?s+"":s,e),e);import{X as $}from"./index-3365d8ff.js";class d{static async validateFile(s){const e=Date.now(),i=`${this.baseURL}/${s}`,t={file:s,exists:!1,size:0,accessible:!1,loadTime:0};try{console.log(`🔍 检查文件: ${i}`);const o=await fetch(i,{method:"HEAD"});if(t.exists=o.ok,t.accessible=o.ok,o.ok){const c=o.headers.get("content-length");t.size=c?parseInt(c,10):0,console.log(`✅ ${s} - 大小: ${this.formatFileSize(t.size)}`)}else t.error=`HTTP ${o.status}: ${o.statusText}`,console.log(`❌ ${s} - 错误: ${t.error}`)}catch(o){t.error=o instanceof Error?o.message:String(o),console.log(`❌ ${s} - 异常: ${t.error}`)}return t.loadTime=Date.now()-e,t}static async validateAllFiles(s){var p,m;console.log("🚀 开始验证FFmpeg文件...");const e=[],i=[],t=[];for(let a=0;a<this.requiredFiles.length;a++){const f=this.requiredFiles[a];s==null||s(a+1,this.requiredFiles.length,f);const h=await this.validateFile(f);e.push(h),h.accessible||((p=h.error)!=null&&p.includes("404")?i.push(`${f} 文件不存在`):(m=h.error)!=null&&m.includes("403")?i.push(`${f} 文件无访问权限`):i.push(`${f} 无法访问: ${h.error}`))}const o=e.filter(a=>a.accessible).length,c=e.reduce((a,f)=>a+f.size,0),r=o===this.requiredFiles.length;r||(t.push("检查 public/ffmpeg/ 目录是否存在"),t.push("确保所有FFmpeg文件已正确放置"),t.push("检查文件权限设置"),t.push("尝试重新下载FFmpeg文件"));const n=e.find(a=>a.file==="ffmpeg-core.wasm");n!=null&&n.accessible&&n.size<20*1024*1024&&(i.push("ffmpeg-core.wasm 文件太小，可能不完整"),t.push("重新下载完整的 ffmpeg-core.wasm 文件 (~25MB)"));const l=e.find(a=>a.file==="ffmpeg-core.js");return l!=null&&l.accessible&&l.size<100*1024&&(i.push("ffmpeg-core.js 文件太小，可能不完整"),t.push("重新下载完整的 ffmpeg-core.js 文件 (~200KB)")),console.log(`📊 验证完成: ${o}/${this.requiredFiles.length} 文件有效`),{allValid:r,totalFiles:this.requiredFiles.length,validFiles:o,totalSize:c,results:e,issues:i,suggestions:t}}static async testFileContent(s){try{console.log(`📄 测试文件内容: ${s}`);const e=await fetch(`${this.baseURL}/${s}`);if(!e.ok)return{success:!1,error:`HTTP ${e.status}: ${e.statusText}`};const i=e.headers.get("content-type")||"unknown";if(s.endsWith(".wasm")){const t=await e.arrayBuffer();return{success:!0,contentType:i,preview:`WASM文件，大小: ${t.byteLength} 字节`}}else{const t=await e.text(),o=t.length>100?t.substring(0,100)+"...":t;return{success:!0,contentType:i,preview:o}}}catch(e){return{success:!1,error:e instanceof Error?e.message:String(e)}}}static async testToBlobURL(){try{console.log("🔄 测试 toBlobURL 转换...");const{toBlobURL:s}=await $(()=>import("./index-c5152193.js"),[]),e="const.js",i=await s(`${this.baseURL}/${e}`,"text/javascript");return i.startsWith("blob:")?(await fetch(i)).ok?(URL.revokeObjectURL(i),{success:!0,details:"成功转换并验证 blob URL"}):{success:!1,error:"生成的 blob URL 无法访问"}:{success:!1,error:"toBlobURL 未生成有效的 blob URL"}}catch(s){return{success:!1,error:s instanceof Error?s.message:String(s)}}}static async validateEnvironment(){console.log("🔍 开始完整环境验证...");const s=await this.validateAllFiles(),e=["ffmpeg-core.js","ffmpeg-core.wasm","const.js"],i=[];for(const n of e)if(s.results.find(l=>l.file===n&&l.accessible)){const l=await this.testFileContent(n);i.push({file:n,...l})}const t=await this.testToBlobURL(),o={hasSharedArrayBuffer:typeof SharedArrayBuffer<"u",isCrossOriginIsolated:typeof crossOriginIsolated<"u"?crossOriginIsolated:!1,protocol:typeof window<"u"?window.location.protocol:"unknown",ffmpegUtilAvailable:!1};try{await $(()=>import("./index-c5152193.js"),[]),o.ffmpegUtilAvailable=!0}catch(n){console.warn("@ffmpeg/util 不可用:",n)}const r=!1?s.allValid&&o.ffmpegUtilAvailable:s.allValid&&t.success&&o.hasSharedArrayBuffer&&o.isCrossOriginIsolated&&o.ffmpegUtilAvailable;return console.log(`🎯 环境验证完成，整体状态: ${r?"✅ 正常":"❌ 有问题"}`),{fileValidation:s,contentTest:i,blobURLTest:t,environment:o,overall:r}}static formatFileSize(s){if(s===0)return"0 B";const e=1024,i=["B","KB","MB","GB"],t=Math.floor(Math.log(s)/Math.log(e));return parseFloat((s/Math.pow(e,t)).toFixed(2))+" "+i[t]}static generateReport(s){const{fileValidation:e,contentTest:i,blobURLTest:t,environment:o,overall:c}=s;let r=`# FFmpeg 文件验证报告

`;return r+=`## 总体状态: ${c?"✅ 正常":"❌ 有问题"}

`,r+=`## 文件验证结果

`,r+=`- 总文件数: ${e.totalFiles}
`,r+=`- 有效文件: ${e.validFiles}
`,r+=`- 总大小: ${this.formatFileSize(e.totalSize)}

`,r+=`### 文件详情

`,e.results.forEach(n=>{const l=n.accessible?"✅":"❌",p=n.accessible?this.formatFileSize(n.size):"N/A";r+=`- ${l} ${n.file} (${p})
`,n.error&&(r+=`  - 错误: ${n.error}
`)}),r+=`
## 环境检查

`,r+=`- SharedArrayBuffer: ${o.hasSharedArrayBuffer?"✅":"❌"}
`,r+=`- 跨域隔离: ${o.isCrossOriginIsolated?"✅":"❌"}
`,r+=`- 协议: ${o.protocol}
`,r+=`- FFmpeg工具库: ${o.ffmpegUtilAvailable?"✅":"❌"}
`,r+=`
## toBlobURL 测试

`,r+=`- 状态: ${t.success?"✅ 正常":"❌ 失败"}
`,t.error&&(r+=`- 错误: ${t.error}
`),t.details&&(r+=`- 详情: ${t.details}
`),e.issues.length>0&&(r+=`
## 发现的问题

`,e.issues.forEach(n=>{r+=`- ${n}
`})),e.suggestions.length>0&&(r+=`
## 解决建议

`,e.suggestions.forEach(n=>{r+=`- ${n}
`})),r}}g(d,"requiredFiles",["ffmpeg-core.js","ffmpeg-core.wasm","ffmpeg-core.worker.js","const.js","errors.js","types.js","utils.js","classes.js"]),g(d,"baseURL","/ffmpeg");async function U(){return d.validateAllFiles()}export{d as F,U as q};
