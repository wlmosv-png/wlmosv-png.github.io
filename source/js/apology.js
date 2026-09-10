(function () {
  "use strict";
  var KEY = "yangyang.sorry.v2";
  var st = { mine: 0, wall: 0, days: [] };
  try { var raw = JSON.parse(localStorage.getItem(KEY) || "null"); if (raw) { st.mine = raw.mine || 0; st.wall = raw.wall || 0; st.days = raw.days || []; } } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LINES = ["我错了", "我不分", "我想你", "对不起", "你回来", "别不说话", "我爱你", "我接着", "不怪你", "是我不好"];
  var WORDS = [
    "我以后想要什么直接讲，不让你猜。",
    "你递上来的台阶，我以后都踩着下来。",
    "我那些脾气在你那儿要付多少利息，昨晚才算清。",
    "阳阳，我想你。",
    "我不分。这句话我一个字都不改。",
    "对不起，昨晚是我把你推远的。",
    "你要骂我就骂，别不理我。",
    "我喜欢你，不是气氛好的时候才喜欢。",
    "你说到第二遍的时候，我这次听见了。",
    "我把「我平时就这样」这句话作废了。",
    "今晚不过夜，我现在就去找你。",
    "你受的那些委屈，不是弹窗，是我欠的账。",
    "我爱你。具体的那种：晚上吃什么，谁倒垃圾。",
    "别让我猜，你直接说，我都接着。",
    "除了你，别人都是凑合，我不想凑合。",
    "你先出气，道理以后再说。",
    "你不回头，我就站在这儿每天说一遍。",
    "我昨晚没拦你。今天不犯这个错。",
    "你妈最近身体怎么样，这个月手头紧不紧——我都想接着问。",
    "我手机第一屏是你的照片，我不想换。",
    "原谅我不着急，你先把自己气顺。",
    "阳阳，我们把昨晚那句重说一次。"];
  var order = [], oi = 0;
  function shuffle() { order = []; for (var i = 0; i < WORDS.length; i++) { order.push(i); }
    for (var j = order.length - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)), t = order[j]; order[j] = order[k]; order[k] = t; } oi = 0; }
  function nextWord() { if (!order.length || oi >= order.length) { shuffle(); } return WORDS[order[oi++]]; }
  function toast(msg) {
    if (reduce) { return; }
    var box = document.createElement("div"); box.className = "ap-toast"; box.textContent = msg;
    document.body.appendChild(box);
    setTimeout(function () { box.classList.add("out"); }, 2400);
    setTimeout(function () { if (box.parentNode) { box.parentNode.removeChild(box); } }, 3100);
  }
  function beep() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) { return; }
      var ac = beep.ac || (beep.ac = new AC());
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = "sine"; o.frequency.value = 392; o.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0.0001, ac.currentTime); g.gain.linearRampToValueAtTime(0.06, ac.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.3);
      o.start(); o.stop(ac.currentTime + 0.32);
    } catch (e) {}
  }
  function drift(s) {
    if (reduce) { return; }
    s.className = "ap-float"; s.textContent = "❤";
    s.style.left = (6 + Math.random() * 88) + "vw";
    s.style.fontSize = (13 + Math.random() * 18) + "px";
    s.style.color = "rgba(244,101,122," + (0.3 + Math.random() * 0.5).toFixed(2) + ")";
    s.style.animationDuration = (9 + Math.random() * 7) + "s";
    document.body.appendChild(s);
    setTimeout(function () { if (s.parentNode) { s.parentNode.removeChild(s); } }, 16500);
  }
  var live = 0;
  function driftLoop() {
    if (reduce || live > 7) { return; }
    live++; drift(document.createElement("span"));
    setTimeout(function () { live--; }, 15000);
    setTimeout(driftLoop, 1200 + Math.random() * 2600);
  }
  function initHearts() {
    var host = document.querySelector("[data-hearts]"); if (!host) { return; }
    var n = parseInt(host.getAttribute("data-hearts") || "10", 10);
    for (var i = 0; i < n; i++) {
      var h = document.createElement("i");
      h.className = "ap-heart"; h.textContent = "❤";
      h.style.animationDelay = (i * 0.13).toFixed(2) + "s";
      h.style.fontSize = (18 + (i % 4) * 7) + "px";
      host.appendChild(h);
    }
  }
  function two(x) { return (x < 10 ? "0" : "") + x; }
  function initSince() {
    var host = document.querySelector("[data-since]"); if (!host) { return; }
    var t = Date.parse(host.getAttribute("data-since"));
    if (isNaN(t)) { return; }
    function tick() {
      var d = new Date(), m = d.getTime() - t;
      if (m < 0) { m = 0; }
      var mins = Math.floor(m / 60000), days = Math.floor(mins / 1440),
        hrs = Math.floor((mins % 1440) / 60), mm = mins % 60;
      host.className = "ap-since";
      host.innerHTML = "从凌晨那句话到现在，已经 <b>" + days + "</b> 天 <b>" + hrs + "</b> 小时 <b>" + two(mm) + "</b> 分。"
        + "<span class=\"ap-since-sub\">这段时间里我没有改过一次主意。</span>";
    }
    tick(); setInterval(tick, 20000);
  }
  function today() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function initWord() {
    var box = document.querySelector("[data-word]"); if (!box) { return; }
    if (!order.length) { shuffle(); }
    var out = box.querySelector("[data-word-text]");
    var dayHost = box.querySelector("[data-days]");
    var day = today();
    if (st.days.indexOf(day) < 0) { st.days.push(day); save(); }
    if (dayHost) { dayHost.textContent = "这是我说不的第 " + st.days.length + " 天。今天也不。"; }
    if (out) { out.parentNode.addEventListener("click", function (e) { if (e.target === out) { act("word"); } }); }
  }
  function rotateWord() {
    var out = document.querySelector("[data-word-text]");
    if (!out) { return; }
    out.classList.add("fade");
    setTimeout(function () { out.textContent = nextWord(); out.classList.remove("fade"); }, 320);
  }
  function initFlip() {
    var f = document.querySelector("[data-flip]"); if (!f) { return; }
    f.addEventListener("click", function () { f.classList.toggle("flipped"); });
  }
  function label() { var h = document.querySelector("[data-wallcount]"); if (h) { h.textContent = "我错了 × " + st.wall; } }
  function addChip(host) {
    var s = document.createElement("span");
    s.className = "ap-chip";
    s.textContent = LINES[Math.floor(Math.random() * LINES.length)];
    host.appendChild(s);
  }
  function initWall() {
    var host = document.querySelector("[data-wall]"); if (!host) { return; }
    for (var i = 0; i < st.wall; i++) { addChip(host); }
    label();
    host.parentNode.addEventListener("click", function (e) {
      var t = e.target;
      if (t === host || (t.parentNode === host && !t.children.length)) { addChip(host); st.wall++; label(); save(); }
    });
    return host;
  }
  var wallHost = initWall();
  function act(a) {
    if (a === "word" || a === "forgive") {
      rotateWord(); beep();
      var s1 = document.createElement("span"); s1.textContent = "又说了一遍"; drift(s1);
    } else if (a === "mine") {
      st.mine++; save(); beep(); toast("对，全是我欠你的。不用你还，你先用。");
    } else if (a === "more") {
      if (!wallHost) { return; }
      for (var i = 0; i < 30; i++) { addChip(wallHost); }
      st.wall += 30; label(); save();
    } else if (a === "clear") {
      if (!wallHost) { return; }
      while (wallHost.firstChild) { wallHost.removeChild(wallHost.firstChild); }
      st.wall = 0; label(); save(); toast("清空了屏幕，话还在。");
    }
  }
  document.addEventListener("click", function (e) {
    var el = e.target, depth = 0, btn = null;
    while (el && depth++ < 6) { if (el.getAttribute && el.getAttribute("data-act")) { btn = el; break; } el = el.parentNode; }
    if (!btn) { return; }
    act(btn.getAttribute("data-act"));
  });
  var orig = document.title, blink = null;
  document.addEventListener("visibilitychange", function () {
    if (blink) { clearInterval(blink); blink = null; }
    if (document.hidden) {
      blink = setInterval(function () {
        document.title = (document.title === orig) ? "阳阳，回来" : orig;
      }, 1200);
    } else { document.title = orig; }
  });
  initHearts(); initSince(); initWord(); initFlip();
  if (!reduce && document.querySelector("[data-word]")) { setInterval(rotateWord, 13000); }
  if (!reduce) { driftLoop(); }
})();


/* ---------- 倒数日 ---------- */
(function () {
  var q1 = function (s) { return document.querySelector(s); };
  var qAll = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var DAY = 864e5;
  var MARKUP = '<div class="ap-page" data-page data-anchor="2026-01-24T00:00:00+08:00">'
    + '<div class="ap-aurora"><i></i><i></i><i></i></div><div class="ap-grain"></div>'
    + '<section class="ap-stage"><p class="ap-kicker">JANUARY 24</p>'
    + '<h2 class="ap-big"><span data-days>--</span><em>天</em></h2>'
    + '<p class="ap-cap">认识你，到今天</p>'
    + '<div class="ap-clock" data-clock><b>--</b><i>时</i><b>--</b><i>分</i><b>--</b><i>秒</i></div>'
    + '<p class="ap-line" data-warn></p></section>'
    + '<section class="ap-grid">'
    + '<div class="ap-cell"><b data-stat="weeks">--</b><i>周</i></div>'
    + '<div class="ap-cell"><b data-stat="hours">--</b><i>小时</i></div>'
    + '<div class="ap-cell"><b data-stat="months">--</b><i>个月</i></div>'
    + '<div class="ap-cell"><b data-stat="beats">--</b><i>次心跳</i></div></section>'
    + '<section class="ap-next"><div class="ap-next-row"><span>下一个 1 月 24 日</span><b data-next>--</b><em>天</em></div>'
    + '<div class="ap-bar"><i data-bar></i></div>'
    + '<div class="ap-barfoot"><span data-passed>--%</span><span>这一轮已经走过</span></div></section>'
    + '<a class="ap-jump" href="#letter" aria-label="往下">↓</a></div>';

  function inject() {
    if (q1('[data-page]')) return true;
    var home = q1('.recent-posts'), art = q1('#article-container') || q1('#post');
    if (!home && !art) return false;
    var box = document.createElement('div');
    box.innerHTML = MARKUP;
    var node = box.firstChild;
    if (home) { home.parentNode.insertBefore(node, home); home.style.display = 'none'; }
    else { art.parentNode.insertBefore(node, art); }
    if (!document.getElementById('letter')) {
      var j = node.querySelector('.ap-jump');
      if (j) j.setAttribute('href', '/posts/yangyang-i-am-sorry/');
    }
    return true;
  }
  if (!inject()) return;
  document.body.classList.add('ap-day');
  var page = q1('[data-page]');
  var anchor = new Date(page.getAttribute('data-anchor') || '2026-01-24T00:00:00+08:00');
  var bigEl = q1('[data-days]'), clockEl = q1('[data-clock]'), nextEl = q1('[data-next]');
  var barEl = q1('[data-bar]'), passEl = q1('[data-passed]'), warnEl = q1('[data-warn]');
  var cells = {};
  qAll('[data-stat]').forEach(function (el) { cells[el.getAttribute('data-stat')] = el; });
  if (warnEl) warnEl.textContent = anchor.getFullYear() + ' 年 1 月 24 日 · 起算';
  var cb = clockEl ? qAll('[data-clock] b') : [];
  function p2(n) { return n < 10 ? '0' + n : '' + n; }
  function cm(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function monthSpan(a, b) {
    var m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    if (b.getDate() < a.getDate()) m--;
    return m < 0 ? 0 : m;
  }
  function set(el, v) { if (el && el.textContent !== v) el.textContent = v; }
  (function tick() {
    var now = new Date(), diff = now - anchor;
    if (diff > 0) {
      var days = Math.floor(diff / DAY);
      if (bigEl && bigEl.textContent !== String(days)) {
        bigEl.textContent = String(days);
        bigEl.classList.remove('tick'); void bigEl.offsetWidth; bigEl.classList.add('tick');
      }
      var rest = diff - days * DAY;
      if (cb[0]) cb[0].textContent = p2(Math.floor(rest / 36e5));
      if (cb[1]) cb[1].textContent = p2(Math.floor(rest % 36e5 / 6e4));
      if (cb[2]) cb[2].textContent = p2(Math.floor(rest % 6e4 / 1e3));
      if (cells.weeks) cells.weeks.textContent = cm(Math.floor(days / 7));
      if (cells.hours) cells.hours.textContent = cm(Math.floor(diff / 36e5));
      if (cells.months) cells.months.textContent = cm(monthSpan(anchor, now));
      if (cells.beats) cells.beats.textContent = cm(Math.floor(diff / 6e4 * 72));
      var y = now.getFullYear(), next = new Date(y, 0, 24);
      if (next < now) next = new Date(y + 1, 0, 24);
      var prev = new Date(next.getFullYear() - 1, 0, 24);
      set(nextEl, String(Math.ceil((next - now) / DAY)));
      var pct = (now - prev) / (next - prev) * 100;
      if (barEl) barEl.style.width = pct.toFixed(2) + '%';
      set(passEl, pct.toFixed(1) + '%');
    }
    setTimeout(tick, 1000);
  })();
  if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var stage = q1('.ap-page');
    if (stage) {
      var puff = function () {
        var d = document.createElement('span');
        d.className = 'ap-dust';
        d.style.left = (Math.random() * 100) + '%';
        d.style.animationDuration = (16 + Math.random() * 14) + 's';
        d.style.opacity = (0.25 + Math.random() * 0.5).toFixed(2);
        stage.appendChild(d);
        setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 31000);
        setTimeout(puff, 900 + Math.random() * 1400);
      };
      puff();
    }
  }
})();
