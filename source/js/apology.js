// 认错站的交互。只认 data-* ，不依赖主题结构。
(function () {
  "use strict";
  var KEY = "yangyang.sorry.v1";
  var st = { taken: 0, scolded: 0, wall: 0 };
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) { var o = JSON.parse(raw); if (o && typeof o === "object") { st.taken = +o.taken || 0; st.scolded = +o.scolded || 0; st.wall = +o.wall || 0; } }
  } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var REDUCE = false;
  try { REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var APOLOGY = [
    "我错了", "对不起", "是我不对", "我不该那样说话", "我语气不好",
    "你生气是有道理的", "我不辩解", "我把你的沉默当成了同意", "我不该急着收尾",
    "下次我先停三秒", "你说得对", "让你受委屈了，对不起"
  ];
  var SCOLD = ["骂得对", "这句我记下了", "再来一句", "不还嘴", "我听着", "继续，别客气"];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function toast(msg) {
    var old = document.querySelector(".ap-toast");
    if (old && old.parentNode) { old.parentNode.removeChild(old); }
    var d = document.createElement("div");
    d.className = "ap-toast";
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) { d.parentNode.removeChild(d); } }, 2600);
  }
  function blip(freq) {
    if (REDUCE) { return; }
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { return; }
      blip.ctx = blip.ctx || new AC();
      var c = blip.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.value = freq || 320;
      g.gain.value = 0.05;
      o.connect(g); g.connect(c.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18);
      o.stop(c.currentTime + 0.2);
    } catch (e) {}
  }
  function floatCard(text) {
    if (REDUCE) { return; }
    var d = document.createElement("span");
    d.className = "ap-float";
    d.textContent = text;
    d.style.left = (8 + Math.random() * 84) + "vw";
    d.style.animationDuration = (3.4 + Math.random() * 2.2) + "s";
    document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) { d.parentNode.removeChild(d); } }, 6200);
  }
  function pct() {
    if (st.taken === 0) { return 0; }
    return Math.min(99, Math.round(100 * (1 - 1 / (1 + st.taken * 0.11))));
  }
  function addChip(host, text, count) {
    if (!host) { return; }
    var s = document.createElement("span");
    s.className = "ap-chip";
    s.textContent = text;
    host.insertBefore(s, host.firstChild || null);
    if (count) { st.wall += 1; }
  }
  function chips(host) { return host.querySelectorAll(".ap-chip").length; }
  function paint() {
    var p = pct();
    var boxes = document.querySelectorAll("[data-forgive]");
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      var bar = box.querySelector(".forgive-bar > i");
      var num = box.querySelector(".forgive-num");
      var note = box.querySelector(".sorry-box-note");
      if (bar) { bar.style.width = p + "%"; }
      if (num) { num.textContent = p + "%"; }
      if (note) { note.textContent = "（已被你收下 " + st.taken + " 次，被我挨骂 " + st.scolded + " 次。到不了 100% —— 那个开关不在我手里。）"; }
    }
    var wall = document.querySelector("[data-wall]");
    if (wall) {
      while (chips(wall) < st.wall) { addChip(wall, pick(APOLOGY), false); }
      while (chips(wall) > st.wall && chips(wall) > 0) { wall.removeChild(wall.lastChild); }
    }
    var cnt = document.querySelector("[data-wallcount]");
    if (cnt) { cnt.textContent = "我错了 × " + st.wall; }
  }
  function act(kind) {
    var wall = document.querySelector("[data-wall]");
    if (kind === "forgive") { st.taken += 1; blip(520); floatCard(pick(APOLOGY)); }
    else if (kind === "scold") { st.scolded += 1; blip(170); toast(pick(SCOLD)); floatCard("我听着"); }
    else if (kind === "reset") { st.taken = 0; st.wall = 0; blip(240); toast("好，那我从头说。"); }
    else if (kind === "more") { for (var i = 0; i < 30; i++) { addChip(wall, pick(APOLOGY), true); } blip(460); }
    else if (kind === "shuffle") { toast(pick(APOLOGY) + " —— 换个说法，意思一样"); }
    else if (kind === "clear") { st.wall = 0; blip(200); toast("清掉了。话还在这。"); }
    save(); paint();
  }
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    while (t && t.nodeType === 1 && !t.hasAttribute("data-act")) { t = t.parentNode; }
    if (t && t.nodeType === 1 && t.hasAttribute("data-act")) { ev.preventDefault(); act(t.getAttribute("data-act")); return; }
    var n = ev.target, host = null;
    while (n && n.nodeType === 1) { if (n.hasAttribute("data-wall")) { host = n; break; } n = n.parentNode; }
    if (host) { addChip(host, pick(APOLOGY), true); save(); paint(); blip(640); }
  }, true);
  var flicker = null, real = document.title;
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && !flicker) {
      flicker = setInterval(function () { document.title = (document.title === real ? "我错了，阳阳" : real); }, 1100);
    }
    if (!document.hidden && flicker) { clearInterval(flicker); flicker = null; document.title = real; }
  });
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", paint); } else { paint(); }
})();
