import CryptoJS from 'crypto-js';
/**
 * 解密方法
 * @param encryptedPhoneNumber
 * @returns {string}
 */
export function decrypt(encryptedPhoneNumber: string | CryptoJS.lib.CipherParams) {
  const key = CryptoJS.enc.Utf8.parse('1234567890abcdef');
  const decrypted = CryptoJS.AES.decrypt(encryptedPhoneNumber, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
