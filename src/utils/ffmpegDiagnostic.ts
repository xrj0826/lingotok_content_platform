/**
 * FFmpeg诊断工具
 * 用于检测和诊断SharedArrayBuffer支持问题
 */

import { diagnoseSharedArrayBufferSupport } from './ffmpegConfig';

/**
 * 在控制台显示详细的诊断信息
 */
export function logFFmpegDiagnostic(): void {
  console.group('🔧 FFmpeg环境诊断');

  const diagnosis = diagnoseSharedArrayBufferSupport();

  console.log('📋 基本信息:');
  console.log('  - SharedArrayBuffer可用:', typeof SharedArrayBuffer !== 'undefined');
  console.log('  - 跨域隔离状态:', crossOriginIsolated);
  console.log('  - 当前协议:', location.protocol);
  console.log('  - 主机名:', location.hostname);
  console.log('  - 用户代理:', navigator.userAgent.substring(0, 100) + '...');

  if (diagnosis.supported) {
    console.log('✅ SharedArrayBuffer支持正常，FFmpeg可以正常使用');
  } else {
    console.warn('❌ SharedArrayBuffer不可用，FFmpeg无法使用');

    if (diagnosis.issues.length > 0) {
      console.group('🚨 发现的问题:');
      diagnosis.issues.forEach((issue, index) => {
        console.warn(`  ${index + 1}. ${issue}`);
      });
      console.groupEnd();
    }

    if (diagnosis.recommendations.length > 0) {
      console.group('💡 解决建议:');
      diagnosis.recommendations.forEach((rec, index) => {
        console.info(`  ${index + 1}. ${rec}`);
      });
      console.groupEnd();
    }
  }

  console.groupEnd();
}

/**
 * 创建诊断信息的HTML显示
 */
export function createDiagnosticHTML(): string {
  const diagnosis = diagnoseSharedArrayBufferSupport();

  const statusIcon = diagnosis.supported ? '✅' : '❌';
  const statusText = diagnosis.supported ? '支持正常' : '不可用';
  const statusColor = diagnosis.supported ? '#4caf50' : '#f44336';

  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h3 style="color: #333; margin-top: 0;">🔧 FFmpeg环境诊断</h3>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color: #666;">基本信息</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li>SharedArrayBuffer: ${typeof SharedArrayBuffer !== 'undefined' ? '✅ 可用' : '❌ 不可用'}</li>
          <li>跨域隔离: ${crossOriginIsolated ? '✅ 已启用' : '❌ 未启用'}</li>
          <li>协议: ${location.protocol}</li>
          <li>主机: ${location.hostname}</li>
        </ul>
      </div>
      
      <div style="background: ${statusColor}; color: white; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0;">${statusIcon} SharedArrayBuffer状态: ${statusText}</h4>
      </div>
  `;

  if (!diagnosis.supported) {
    if (diagnosis.issues.length > 0) {
      html += `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; color: #856404;">🚨 发现的问题</h4>
          <ul style="margin: 0; padding-left: 20px; color: #856404;">
            ${diagnosis.issues.map(issue => `<li>${issue}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (diagnosis.recommendations.length > 0) {
      html += `
        <div style="background: #d1ecf1; border: 1px solid #b8daff; padding: 15px; border-radius: 4px;">
          <h4 style="margin: 0 0 10px 0; color: #0c5460;">💡 解决建议</h4>
          <ol style="margin: 0; padding-left: 20px; color: #0c5460;">
            ${diagnosis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ol>
        </div>
      `;
    }
  }

  html += '</div>';
  return html;
}

/**
 * 在页面中显示诊断信息
 */
export function showDiagnosticModal(): void {
  // 移除已存在的诊断窗口
  const existingModal = document.getElementById('ffmpeg-diagnostic-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // 创建模态窗口
  const modal = document.createElement('div');
  modal.id = 'ffmpeg-diagnostic-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 8px;
    max-width: 90%;
    max-height: 90%;
    overflow: auto;
    position: relative;
  `;

  const closeButton = document.createElement('button');
  closeButton.textContent = '✕ 关闭';
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: #f44336;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
  `;

  closeButton.onclick = () => modal.remove();

  content.innerHTML = createDiagnosticHTML();
  content.appendChild(closeButton);
  modal.appendChild(content);
  document.body.appendChild(modal);

  // 点击背景关闭
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };
}












































