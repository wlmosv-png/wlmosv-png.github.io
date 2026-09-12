// us_cloud.js — 云端同步适配器（纯 GitHub 私有仓库）
// 数据仓库：wlmosv-png/miwen（私有，只存密文 data.json）
// 访问令牌：两人各自粘贴一次，存各自设备 localStorage（不进网页源码）
// 内容安全：数据是端到端密文 {v:1,salt,iv,ct}，GitHub 侧拿不到密钥
var UsCloud = (function(){
  var CFG_KEY = 'usbox.token.v1';
  var REPO = 'wlmosv-png/miwen';        // 数据仓库
  var FILE = 'data.json';               // 密文文件

  function token(){ try { return localStorage.getItem(CFG_KEY); } catch(e){ return null; } }
  function hasToken(){ var t = token(); return !!(t && t.trim()); }
  function saveToken(t){
    var v = (t || '').trim();
    if (!v) { localStorage.removeItem(CFG_KEY); return false; }
    localStorage.setItem(CFG_KEY, v);
    return true;
  }
  function clearToken(){ try { localStorage.removeItem(CFG_KEY); } catch(e){} }

  function api(method, path, body){
    return fetch('https://api.github.com' + path, {
      method: method,
      headers: {
        'Authorization': 'Bearer ' + token(),
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
  }

  // 读文件元数据 + 内容：{blob, sha}；文件不存在 -> {blob:null, sha:null}
  async function getFile(){
    if (!hasToken()) return { blob: null, sha: null };
    var r = await api('GET', '/repos/' + REPO + '/contents/' + FILE);
    if (r.status === 404) return { blob: null, sha: null };
    if (!r.ok) throw new Error('read-' + r.status);
    var j = await r.json();
    return { blob: JSON.parse(atob(j.content.replace(/\n/g, ''))), sha: j.sha };
  }

  // 读密文：文件不存在 -> null；网络/鉴权错误 -> 抛异常（调用方回退本地缓存）
  async function load(){
    var f = await getFile();
    return f.blob;
  }

  // 写密文：带 sha 乐观锁；冲突(409) -> {conflict:true}（对方刚更新）
  async function save(blob, sha){
    if (!hasToken()) throw new Error('no-token');
    var content = btoa(JSON.stringify(blob));  // blob 全是 base64 ASCII，UTF-8 安全
    var body = { message: 'usbox update ' + Date.now(), content: content };
    if (sha) body.sha = sha;
    var r = await api('PUT', '/repos/' + REPO + '/contents/' + FILE, body);
    if (r.status === 409) return { conflict: true };
    if (!r.ok) throw new Error('write-' + r.status);
    return { ok: true };
  }

  return { load: load, save: save, getFile: getFile, token: token, hasToken: hasToken,
           saveToken: saveToken, clearToken: clearToken, REPO: REPO };
})();
