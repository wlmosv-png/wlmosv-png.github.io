// us_crypto.js — 端到端加密核心（浏览器 + Node 双兼容）
// 密码 -> PBKDF2-SHA256(150k) -> AES-GCM 256
// 数据格式: {v:1, salt:b64, iv:b64, ct:b64}  (密文 = AES-GCM(明文UTF8))
(function (global) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function b64(buf) {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s);
  }
  function unb64(s) {
    const bin = atob(s);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }

  async function deriveKey(password, saltB64) {
    const salt = unb64(saltB64);
    const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
  }

  async function encryptObject(password, obj) {
    const salt = crypto.getRandomValues(new Uint8Array(12));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, b64(salt));
    const pt = enc.encode(JSON.stringify(obj));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, pt);
    return { v: 1, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
  }

  async function decryptObject(password, blob) {
    const key = await deriveKey(password, blob.salt);
    const iv = unb64(blob.iv);
    const ct = unb64(blob.ct);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return JSON.parse(dec.decode(pt));
  }

  global.UsCrypto = { encryptObject, decryptObject, deriveKey, b64, unb64 };
})(typeof globalThis !== 'undefined' ? globalThis : this);
