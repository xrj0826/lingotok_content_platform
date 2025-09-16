/**
 * 视频剪切相关工具函数
 */

/**
 * 日期字符串转成时间戳
 * @param dateStr 日期字符串
 * @returns 时间戳
 */
export function dateStrChangeTimeTamp(dateStr: string): number {
  const modifiedDateStr = dateStr.substring(0, 23);
  const normalizedDateStr = modifiedDateStr.replace(/-/g, '/');
  const timeTamp = new Date(normalizedDateStr).getTime();
  return timeTamp;
}

/**
 * 获取当前时间，精准到毫秒
 * @param val 时间戳值
 * @returns 格式化的时间字符串
 */
export function getNowTime(val: number): string {
  const date = new Date(val);
  const hour = (date.getHours() - 8) < 10 ? '0' + (date.getHours() - 8) : (date.getHours() - 8).toString();
  const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes().toString();
  const second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds().toString();
  const milliSeconds = date.getMilliseconds(); // 毫秒
  const currentTime = hour + ':' + minute + ':' + second + '.' + milliSeconds;
  return currentTime;
}

/**
 * 时间字符串转换为秒数
 * @param time 时间字符串 格式: HH:MM:SS.mmm
 * @returns 秒数
 */
export function timeToSec(time: string): number {
  const [hour, min, sec] = time.split(':');
  const s = Number(hour) * 3600 + Number(min) * 60 + Number(sec);
  return s;
}
