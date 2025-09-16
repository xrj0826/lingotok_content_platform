/**
 * 将ArrayBuffer转换为Base64字符串
 * @param array ArrayBuffer数据
 * @returns Base64字符串
 */
function arrayBufferToBase64(array: ArrayBuffer): string {
  const uint8Array = new Uint8Array(array);
  const length = uint8Array.byteLength;
  const table = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'
  ];

  let base64Str = "";

  for (let i = 0; length - i >= 3; i += 3) {
    const num1 = uint8Array[i];
    const num2 = uint8Array[i + 1];
    const num3 = uint8Array[i + 2];
    base64Str +=
      table[num1 >>> 2] +
      table[((num1 & 0b11) << 4) | (num2 >>> 4)] +
      table[((num2 & 0b1111) << 2) | (num3 >>> 6)] +
      table[num3 & 0b111111];
  }

  const lastByte = length - i;
  if (lastByte === 1) {
    const lastNum1 = uint8Array[i];
    base64Str +=
      table[lastNum1 >>> 2] + table[(lastNum1 & 0b11) << 4] + "==";
  } else if (lastByte === 2) {
    const lastNum1 = uint8Array[i];
    const lastNum2 = uint8Array[i + 1];
    base64Str +=
      table[lastNum1 >>> 2] +
      table[((lastNum1 & 0b11) << 4) | (lastNum2 >>> 4)] +
      table[(lastNum2 & 0b1111) << 2] +
      "=";
  }

  return base64Str;
}

export default arrayBufferToBase64;
