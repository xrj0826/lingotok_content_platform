// 获取常用时间
// import dayjs from 'dayjs';

// export const LAST_7_DAYS = [
//   dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
//   dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
// ];

// export const LAST_30_DAYS = [
//   dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
//   dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
// ];
// 获取当前日期函数
export function getNowFormatDate() {
  const date = new Date();
  const year = date.getFullYear(); // 获取完整的年份(4位)
  let month = date.getMonth() + 1; // 获取当前月份(0-11,0代表1月)
  let strDate = date.getDate(); // 获取当前日(1-31)
  if (month < 10) month = `0${month}`; // 如果月份是个位数，在前面补0
  if (strDate < 10) strDate = `0${strDate}`; // 如果日是个位数，在前面补0

  return `${year}-${month}-${strDate}`;
}
// 获取当前日期函数
export function translateFormatDate(time) {
  const date = new Date(time);
  const year = date.getFullYear(); // 获取完整的年份(4位)
  let month = date.getMonth() + 1; // 获取当前月份(0-11,0代表1月)
  let strDate = date.getDate(); // 获取当前日(1-31)
  if (month < 10) month = `0${month}`; // 如果月份是个位数，在前面补0
  if (strDate < 10) strDate = `0${strDate}`; // 如果日是个位数，在前面补0

  return `${year}-${month}-${strDate}`;
}
// 格式转换
export function translateDate(date) {
  const dateArr = date.split('-');
  const year = dateArr[0];
  const month = dateArr[1];
  const strDate = dateArr[2];
  return `${year}年${month}月${strDate.slice(0, 2)}日`;
}
// 获取常用时间
import dayjs from 'dayjs';

export const LAST_7_DAYS = [
  dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
];

export const LAST_30_DAYS = [
  dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
];
