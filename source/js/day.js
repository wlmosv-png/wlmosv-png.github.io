(function () {
  var root = document.getElementById("days");
  if (!root) return;
  var since = Date.parse(root.getAttribute("data-since") || "2026-01-24T00:00:00+08:00");
  var miles = (root.getAttribute("data-milestones") || "100,200,365,1000").split(",").map(Number);
  function g(id) { return document.getElementById(id); }
  var D = g("d-day"), H = g("d-hour"), M = g("d-min"), S = g("d-sec");
  var L = g("d-lead"), MO = g("d-moon"), MS = g("d-ms"), R = g("d-ring"), RL = g("d-ringlabel");
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function set(el, v) { if (el && el.textContent !== v) el.textContent = v; }
  var shown = 0, raf = 0;
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function roll(to) {
    if (calm || !L) { shown = to; set(L, String(to)); return; }
    var from = shown, t0 = Date.now(), dur = 1200;
    cancelAnimationFrame(raf);
    (function step() {
      var p = Math.min(1, (Date.now() - t0) / dur);
      var v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      set(L, String(v));
      if (p < 1) { raf = requestAnimationFrame(step); } else { shown = to; set(L, String(to)); }
    })();
  }
  var last = -1;
  function tick() {
    var now = Date.now(), t = Math.max(0, now - since);
    var days = Math.floor(t / 864e5);
    if (days !== last) { roll(days); last = days; }
    set(D, String(days));
    set(H, pad(Math.floor(t / 36e5) % 24));
    set(M, pad(Math.floor(t / 6e4) % 60));
    set(S, pad(Math.floor(t / 1e3) % 60));
    set(MO, String(Math.floor(days / 29.53058882)));
    var next = null, html = "", i, n, due, left, p;
    for (i = 0; i < miles.length; i++) {
      n = miles[i]; due = since + n * 864e5;
      if (due <= now) { html += '<span class="chip past">' + n + ' 天 · 已过</span>'; }
      else { if (!next) next = { n: n, due: due }; left = Math.ceil((due - now) / 864e5);
        html += '<span class="chip">' + n + ' 天 · 还有 ' + left + ' 天</span>'; }
    }
    if (next) {
      p = Math.max(0, Math.min(100, (now - since) / (next.due - since) * 100));
      html = '<span class="chip next">下一个 · ' + next.n + ' 天</span>' + html;
    }
    if (MS && MS.getAttribute("data-h") !== html) { MS.setAttribute("data-h", html); MS.innerHTML = html; }
    if (R && next) { R.style.background = "conic-gradient(#ffd7e0 " + (p * 3.6).toFixed(1) + "deg, rgba(255,255,255,.18) 0deg)"; }
    if (RL) { set(RL, next ? p.toFixed(1) + "%" : "100%"); }
  }
  tick(); setInterval(tick, 1000);
})();

(function () {
  if (document.getElementById('days')) return;
  var info = document.getElementById('site-info');
  if (!info) return;
  var b = document.createElement('p');
  b.className = 'day-badge';
  info.appendChild(b);
  var A = Date.parse('2026-01-24T00:00:00+08:00');
  var t = function () { b.textContent = '第 ' + Math.max(0, Math.floor((Date.now() - A) / 864e5)) + ' 天'; };
  t(); setInterval(t, 6e4);
})();
