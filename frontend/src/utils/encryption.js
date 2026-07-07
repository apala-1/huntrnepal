import CryptoJS from 'crypto-js';

// Generate a random AES key for a company
export const generateCompanyKey = () => {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
};

// Encrypt sensitive report data with company's public key
export const encryptReportData = (sensitiveData, companyEncryptionKey) => {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(sensitiveData),
    CryptoJS.enc.Hex.parse(companyEncryptionKey),
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );

  return {
    ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
    iv: iv.toString(CryptoJS.enc.Hex),
    encrypted: true
  };
};

// Decrypt with company's key (only company can do this)
export const decryptReportData = (encryptedData, companyEncryptionKey) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedData.ciphertext) },
      CryptoJS.enc.Hex.parse(companyEncryptionKey),
      {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  } catch (err) {
    return null; // Wrong key or tampered data
  }
};