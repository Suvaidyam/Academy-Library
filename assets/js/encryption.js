// Load CryptoJS from CDN dynamically
function loadCryptoJS() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js';
    script.onload = () => {
      console.log('✅ CryptoJS loaded');
      resolve();
    };
    script.onerror = () => reject('❌ Failed to load CryptoJS');
    document.head.appendChild(script);
  });
}

// Once loaded, define your encryption/decryption functions
export function Encryption(params) {
  const secretKey = "mySecretKey";
  return CryptoJS.AES.encrypt(JSON.stringify(params), secretKey).toString();
}

export function Decryption(encryptedData) {
  const secretKey = "mySecretKey";
  const decrypted = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}

// Your app logic using roles


// Load CryptoJS first, then run logic
document.addEventListener('DOMContentLoaded', async () => {
  await loadCryptoJS();
 
});
