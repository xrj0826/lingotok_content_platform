const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// 递归获取目录下所有文件
async function getAllFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getAllFiles(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

// 修复Less导入
async function fixLessImports() {
  try {
    // 获取layouts目录下所有Vue文件
    const layoutsDir = path.resolve(__dirname, '../layouts');
    const files = await getAllFiles(layoutsDir);
    const vueFiles = files.filter(file => file.endsWith('.vue'));
    
    console.log(`找到 ${vueFiles.length} 个Vue文件需要检查`);
    
    let fixedCount = 0;
    
    // 处理每个文件
    for (const file of vueFiles) {
      const content = await readFileAsync(file, 'utf8');
      
      // 检查是否包含Less样式但缺少变量导入
      if (content.includes('<style lang="less"') && 
          !content.includes("@import '@/style/variables.less'") && 
          (content.includes('@starter-prefix') || 
           content.includes('@anim-duration-base') || 
           content.includes('@anim-time-fn-easing') ||
           content.includes('@anim-duration-slow'))) {
        
        // 在<style>标签后添加导入语句
        const newContent = content.replace(
          /(<style lang="less"[^>]*>)/,
          '$1\n@import \'@/style/variables.less\';\n'
        );
        
        // 写回文件
        await writeFileAsync(file, newContent, 'utf8');
        
        console.log(`已修复: ${file}`);
        fixedCount++;
      }
    }
    
    console.log(`修复完成! 共修复了 ${fixedCount} 个文件的Less变量导入`);
  } catch (error) {
    console.error('修复Less导入时出错:', error);
  }
}

// 执行修复
fixLessImports();
