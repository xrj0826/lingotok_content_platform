export function splitQuery(str) {
  const params = str.split('?')[1]; // 截取?号后的字符串即name=itclanCoder&study=css
  const param = params.split('&'); // 通过&符号进行分割即["name=itclanCoder", "study=css"]
  const obj = {
    state: '',
    appid: undefined,
    redirect_uri: undefined,
  }; // 用一个对象存储目标值
  for (let i = 0; i < param.length; i++) {
    // 循环遍历截取出来的param数组
    const paramsA = param[i].split('='); // 通过split,=继续对数组params每一项进行分割,生成数组["name", "itclanCoder"]
    const key = paramsA[0]; // 取数组项["name", "itclanCoder"]中第0位,即name
    const value = paramsA[1]; // 取数组项["name", "itclanCoder"]中第1位,即itclanCoder
    obj[key] = value;
  }
  return obj;
}
export function filterSize(size) {
  if (!size) return '-';
  if (size < pow1024(1)) return `${size} B`;
  if (size < pow1024(2)) return `${(size / pow1024(1)).toFixed(2)} KB`;
  if (size < pow1024(3)) return `${(size / pow1024(2)).toFixed(2)} MB`;
  if (size < pow1024(4)) return `${(size / pow1024(3)).toFixed(2)} GB`;
  return `${(size / pow1024(4)).toFixed(2)} TB`;
}

function pow1024(num) {
  return 1024 ** num;
}
