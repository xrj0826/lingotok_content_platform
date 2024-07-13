export const cosUploadUtils = {
  getProgressText,
};

/**
 * @description 根据进度信息生成提示文本
 * @param {*} progressInfo 进度信息  {"loaded":0,"total":302313472,"speed":0,"percent":0.12}
 * @returns
 */
function getProgressText(progressInfo, isPercent = false) {
  console.log("开始计算进度信息");
  const { loaded, total, speed, percent } = progressInfo;

  // 计算上传进度
  const getSizeInfo = (byteNumber) => {
    if (Number.isNaN(byteNumber)) {
      return "-";
    }
    const kbNumber = Math.round(byteNumber / 1000);
    return kbNumber < 1000
      ? `${kbNumber}KB`
      : `${(kbNumber / 1000).toFixed(1)}MB`;
  };
  const getLoadedInfo = () => {
    if (isPercent) {
      return `${Math.floor((percent || 0) * 100)}%`; // 12%
    } else {
      return `${getSizeInfo(loaded)}/${getSizeInfo(total)}`; // 123M/1024M
    }
  };

  // 当前速度
  const getSpeedInfo = () => {
    const speedKb = Math.round(speed / 1000);
    if (Number.isNaN(speedKb)) {
      return "-";
    }
    return speedKb > 500
      ? `${(speedKb / 1000).toFixed(1)}MB/s`
      : `${speedKb}KB/s`;
  };

  // 计算剩余时间
  const getRestTime = () => {
    const restSeconds = Math.round((total - loaded) / (speed || "-"));
    if (Number.isNaN(restSeconds)) {
      return "-";
    }
    const minutes = `${Math.floor(restSeconds / 60)}分${restSeconds % 60}秒`;
    return restSeconds > 60 ? minutes : `${restSeconds}秒`;
  };

  let info = "";

  try {
    info = `上传进度: <span>${getLoadedInfo()}</span> 当前速度: <span>${getSpeedInfo()}</span> 剩余时间: <span>${getRestTime()}</span>`;
  } catch (e) {
    console.error(e);
  }
  console.log("进度信息计算完成", info);
  return info;
}
