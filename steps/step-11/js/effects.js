(function () {
  "use strict";

  // 演出（STEP3-3）。動きは「電波のチューニング」「星のまたたき」「ホログラムの光」のどれかを表す。
  // A（登場）は CSS だけで動く（html.js-tune は head のインラインスクリプトが付ける）。
  // B（星空）と C（きらめき）は canvas、E（レベルメーター）は AnalyserNode。
  // 色は既存の CSS 変数（--text、--ramune、--lamp）だけを使う。

  var root = document.documentElement;
  var STORAGE_KEY = "lumi-effects";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobileMQ = window.matchMedia("(max-width: 720px)");
  var MAX_SPARKS = 60;
  var SHOOT_ANGLE = 0.44; // 流れ星の角度（約25度）
  var SHOOT_LEN = 220;    // 流れ星の長さ（px）
  var SHOOT_MS = 800;

  var toggleBtn = document.getElementById("fx-toggle");
  var colors = { text: "", ramune: "", lamp: "" };
  var enabled = false;
  var docVisible = !document.hidden;
  var rafId = 0;

  var heroVisual = document.querySelector(".hero-visual");
  var starCanvas = null, starCtx = null, starW = 0, starH = 0;
  var stars = [];
  var heroInView = true;
  var shoot = null;
  var nextShootAt = 0;

  var sparkCanvas = null, sparkCtx = null, sparkW = 0, sparkH = 0;
  var sparks = [];

  var audioCtx = null, analyser = null, freqData = null, graphOff = false;
  var meters = [];

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function dpr() { return Math.min(window.devicePixelRatio || 1, 2); }
  function now() { return performance.now(); }

  function loadPref() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (err) { return null; }
  }
  function savePref(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch (err) {}
  }

  // ---------- 状態の切り替え ----------
  function renderToggle() {
    if (!toggleBtn) return;
    toggleBtn.hidden = false;
    toggleBtn.disabled = reduced;
    toggleBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
    toggleBtn.textContent = "きらめき演出：" + (enabled ? "オン" : "オフ");
  }

  function setEnabled(on) {
    enabled = on && !reduced;
    root.classList.toggle("fx-off", !enabled);
    if (!enabled) {
      clearStars();
      clearSparks();
      meters.forEach(stopMeter);
    }
    kick();
    renderToggle();
  }

  // ---------- B. ヒーローの星空（星のまたたき） ----------
  function initStars() {
    starCanvas = document.createElement("canvas");
    starCanvas.className = "hero-stars";
    starCanvas.setAttribute("aria-hidden", "true");
    heroVisual.appendChild(starCanvas);
    starCtx = starCanvas.getContext("2d");

    var total = Math.round(rnd(40, 60));
    for (var i = 0; i < total; i++) {
      // 7割は上半分（画像の暗い上側）、残りは左半分に置く。ルミの顔の付近（右側・中央付近）は少なめ
      var inTop = i < total * 0.7;
      stars.push({
        x: inTop ? rnd(0, 1) : rnd(0, 0.5),
        y: inTop ? rnd(0, 0.5) : rnd(0, 1),
        r: rnd(0.8, 2),
        period: rnd(3, 7) * 1000,
        phase: rnd(0, Math.PI * 2),
        ramune: Math.random() < 0.35,
        // 全体の約15%は「きらめく星」: 最大の明るさのときに細い十字の光を出す
        twinkle: Math.random() < 0.15
      });
    }
    // 配列をシャッフルし、スマホで前半だけ描いても同じ割合になるようにする
    for (var j = stars.length - 1; j > 0; j--) {
      var idx = Math.floor(Math.random() * (j + 1));
      var tmp = stars[j]; stars[j] = stars[idx]; stars[idx] = tmp;
    }
    nextShootAt = now() + rnd(10000, 18000);
    resizeStars();

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        heroInView = entries[0].isIntersecting;
        kick();
      }).observe(starCanvas);
    }
  }

  function resizeStars() {
    var rect = starCanvas.getBoundingClientRect();
    var d = dpr();
    starW = rect.width;
    starH = rect.height;
    starCanvas.width = Math.max(1, Math.round(starW * d));
    starCanvas.height = Math.max(1, Math.round(starH * d));
    starCtx.setTransform(d, 0, 0, d, 0, 0);
  }

  function drawStars(t) {
    starCtx.clearRect(0, 0, starW, starH);
    // スマホ幅では星の数を半分にする（配列の前半だけを描く）
    var count = mobileMQ.matches ? Math.ceil(stars.length / 2) : stars.length;
    for (var i = 0; i < count; i++) {
      var s = stars[i];
      var px = s.x * starW;
      var py = s.y * starH;
      var k = 0.5 + 0.5 * Math.sin((t / s.period) * Math.PI * 2 + s.phase);
      starCtx.globalAlpha = 0.15 + 0.7 * k; // 0.15〜0.85
      starCtx.fillStyle = s.ramune ? colors.ramune : colors.text;
      starCtx.beginPath();
      starCtx.arc(px, py, s.r, 0, Math.PI * 2);
      starCtx.fill();

      // きらめく星: 明るさが最大付近のときだけ、縦横の細い十字の光（腕の長さは半径の4.5倍）
      if (s.twinkle && k > 0.9) {
        var flash = (k - 0.9) / 0.1; // 0〜1
        var arm = s.r * 4.5;
        starCtx.globalAlpha = 0.85 * flash;
        starCtx.strokeStyle = colors.text;
        starCtx.lineWidth = 0.6;
        starCtx.beginPath();
        starCtx.moveTo(px - arm, py);
        starCtx.lineTo(px + arm, py);
        starCtx.moveTo(px, py - arm);
        starCtx.lineTo(px, py + arm);
        starCtx.stroke();
      }
    }
    starCtx.globalAlpha = 1;

    if (!shoot && t >= nextShootAt && starW > 0) {
      shoot = { t0: t, x: rnd(0, starW * 0.5), y: rnd(0, starH * 0.35) };
      nextShootAt = t + rnd(10000, 18000);
    }
    if (shoot) drawShoot(t);
  }

  function drawShoot(t) {
    var p = (t - shoot.t0) / SHOOT_MS;
    if (p >= 1) { shoot = null; return; }
    var dx = Math.cos(SHOOT_ANGLE) * SHOOT_LEN;
    var dy = Math.sin(SHOOT_ANGLE) * SHOOT_LEN;
    var hx = shoot.x + dx * p;
    var hy = shoot.y + dy * p;
    var tx = hx - dx * 0.4;
    var ty = hy - dy * 0.4;
    starCtx.globalAlpha = 0.9 * (1 - p);
    starCtx.strokeStyle = colors.text;
    starCtx.lineWidth = 1.2;
    starCtx.lineCap = "round";
    starCtx.beginPath();
    starCtx.moveTo(tx, ty);
    starCtx.lineTo(hx, hy);
    starCtx.stroke();
    starCtx.globalAlpha = 1;
  }

  function clearStars() {
    shoot = null;
    if (starCtx) starCtx.clearRect(0, 0, starW, starH);
  }

  // ---------- C. 名前をタップするときらめく（イースターエッグ） ----------
  function initSparkCanvas() {
    sparkCanvas = document.createElement("canvas");
    sparkCanvas.className = "fx-sparkle";
    sparkCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(sparkCanvas);
    sparkCtx = sparkCanvas.getContext("2d");
    resizeSparks();
  }

  function resizeSparks() {
    var rect = sparkCanvas.getBoundingClientRect();
    var d = dpr();
    sparkW = rect.width;
    sparkH = rect.height;
    sparkCanvas.width = Math.max(1, Math.round(sparkW * d));
    sparkCanvas.height = Math.max(1, Math.round(sparkH * d));
    sparkCtx.setTransform(d, 0, 0, d, 0, 0);
  }

  function spawnSparks(x, y) {
    if (!sparkCanvas) initSparkCanvas();
    var count = Math.min(Math.round(rnd(8, 12)), MAX_SPARKS - sparks.length);
    var t = now();
    var palette = [colors.ramune, colors.lamp, colors.text];
    for (var i = 0; i < count; i++) {
      var a = rnd(0, Math.PI * 2);
      var v = rnd(60, 115); // 0.7 秒で 40〜80px ほど飛ぶ
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        born: t,
        life: 700,
        size: rnd(7.5, 13.5), // 中心からの半径（外形は約15〜27px）。前の約1.5倍
        rot: rnd(0, Math.PI),
        spin: rnd(-4, 4),
        color: pick(palette)
      });
    }
    kick();
  }

  function drawSparks(t) {
    sparkCtx.clearRect(0, 0, sparkW, sparkH);
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      var age = Math.max(0, (t - s.born) / s.life);
      if (age >= 1) { sparks.splice(i, 1); continue; }
      var sec = Math.max(0, t - s.born) / 1000;
      var x = s.x + s.vx * sec;
      var y = s.y + s.vy * sec;
      var R = s.size * (1 - 0.5 * age);
      var rot = s.rot + s.spin * sec;
      sparkCtx.globalAlpha = 1 - age;
      sparkCtx.fillStyle = s.color;
      sparkCtx.beginPath();
      // 4 角の星形（外側の角と内側の谷を交互に）
      for (var k = 0; k < 8; k++) {
        var rad = k % 2 === 0 ? R : R * 0.3;
        var ang = rot + k * Math.PI / 4;
        var px = x + Math.cos(ang) * rad;
        var py = y + Math.sin(ang) * rad;
        if (k === 0) sparkCtx.moveTo(px, py);
        else sparkCtx.lineTo(px, py);
      }
      sparkCtx.closePath();
      sparkCtx.fill();
    }
    sparkCtx.globalAlpha = 1;
  }

  function clearSparks() {
    sparks = [];
    if (sparkCtx) sparkCtx.clearRect(0, 0, sparkW, sparkH);
  }

  // ---------- 描画ループ（画面外・タブ非表示では止める） ----------
  function shouldRun() {
    return enabled && docVisible && ((starCanvas && heroInView) || sparks.length > 0);
  }

  function kick() {
    if (!rafId && shouldRun()) rafId = requestAnimationFrame(frame);
  }

  function frame() {
    rafId = 0;
    if (!shouldRun()) return;
    var t = now();
    if (starCanvas && heroInView) drawStars(t);
    if (sparkCanvas) drawSparks(t);
    if (shouldRun()) rafId = requestAnimationFrame(frame);
  }

  // ---------- E. 再生中のレベルメーター（電波） ----------
  // 音声を AnalyserNode に通すのは、AudioContext を作れて、file:// 以外で開いているときだけ。
  // createMediaElementSource の後は必ず analyser を destination につなぎ、音が消えないようにする。
  // 失敗したときは何もせず、元の「●」の表示のままにする。
  function ensureGraph() {
    if (audioCtx || graphOff) return !!audioCtx;
    // file:// では、音声が cross-origin 扱いになり、経路に入れると無音になるおそれがあるため使わない
    if (window.location.protocol === "file:") { graphOff = true; return false; }
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { graphOff = true; return false; }
    try {
      var ctx = new Ctx();
      var an = ctx.createAnalyser();
      an.fftSize = 256;
      an.smoothingTimeConstant = 0.75;
      an.connect(ctx.destination);
      audioCtx = ctx;
      analyser = an;
      freqData = new Uint8Array(an.frequencyBinCount);
    } catch (err) {
      graphOff = true;
      audioCtx = null;
    }
    return !!audioCtx;
  }

  function resumeCtx() {
    if (audioCtx && audioCtx.state !== "running" && audioCtx.resume) {
      var p = audioCtx.resume();
      if (p && p.catch) p.catch(function () {});
    }
  }

  // audio 要素を analyser の経路につなぐ（要素ごとに1回だけ）。running でないときはつながない（無音を避ける）
  function connect(m) {
    if (m.sourced || !ensureGraph() || audioCtx.state !== "running") return;
    var src;
    try {
      src = audioCtx.createMediaElementSource(m.audio);
    } catch (err) {
      return; // つながなければ audio は元のまま再生される
    }
    try {
      src.connect(analyser);
    } catch (err) {
      src.connect(audioCtx.destination);
      return;
    }
    m.sourced = true;
    m.wrap.classList.add("has-meter");
  }

  var BANDS = [[1, 4], [4, 8], [8, 14], [14, 22], [22, 36]];

  function startMeter(m) {
    if (m.frame) return;
    function loop() {
      analyser.getByteFrequencyData(freqData);
      for (var b = 0; b < BANDS.length; b++) {
        var lo = BANDS[b][0], hi = BANDS[b][1], sum = 0;
        for (var i = lo; i < hi; i++) sum += freqData[i];
        var v = sum / (hi - lo) / 255;
        var level = Math.min(1, 0.2 + v * 1.6);
        m.bars[b].style.transform = "scaleY(" + level.toFixed(3) + ")";
      }
      m.frame = requestAnimationFrame(loop);
    }
    m.frame = requestAnimationFrame(loop);
  }

  function stopMeter(m) {
    if (m.frame) cancelAnimationFrame(m.frame);
    m.frame = 0;
    m.bars.forEach(function (bar) { bar.style.transform = "scaleY(0.2)"; });
  }

  function setupMeters() {
    var audios = document.querySelectorAll("audio.release-audio");
    Array.prototype.forEach.call(audios, function (audio) {
      var player = audio.nextElementSibling;
      if (!player || !player.classList.contains("player")) return;
      var meta = player.querySelector(".player-meta");
      var status = player.querySelector(".player-status");
      var toggle = player.querySelector(".player-toggle");
      if (!meta || !status || !toggle) return;

      // player.js は status の中身（テキスト）を書き換えるので、メーターは status の外側に置く
      var wrap = document.createElement("div");
      wrap.className = "player-state";
      var meter = document.createElement("span");
      meter.className = "player-meter";
      meter.setAttribute("aria-hidden", "true");
      var bars = [];
      for (var i = 0; i < 5; i++) {
        var bar = document.createElement("span");
        bar.className = "player-meter-bar";
        meter.appendChild(bar);
        bars.push(bar);
      }
      wrap.appendChild(meter);
      meta.insertBefore(wrap, status);
      wrap.appendChild(status);

      var m = { audio: audio, wrap: wrap, bars: bars, sourced: false, frame: 0 };
      meters.push(m);

      // player.js の再生ボタンの後に登録されるので、audio.play() の後で経路を作る。
      // AudioContext はユーザーの操作（クリック）の中で作る。
      // ここでは audio.paused を見ない（player.js の click で play() が先に呼ばれ、paused は既に false のため）
      toggle.addEventListener("click", function () {
        if (!enabled) return;
        ensureGraph();
        resumeCtx();
        connect(m);
      });
      audio.addEventListener("play", function () {
        if (!enabled) return;
        if (!m.sourced) connect(m);
        if (m.sourced) {
          resumeCtx();
          startMeter(m);
        }
      });
      audio.addEventListener("pause", function () { stopMeter(m); });
      audio.addEventListener("ended", function () { stopMeter(m); });
    });
  }

  // ---------- 初期化 ----------
  var cs = getComputedStyle(root);
  colors.text = cs.getPropertyValue("--text").trim();
  colors.ramune = cs.getPropertyValue("--ramune").trim();
  colors.lamp = cs.getPropertyValue("--lamp").trim();

  if (!reduced) {
    if (heroVisual) initStars();
    setupMeters();
  }

  // 初期状態: reduced-motion では必ずオフ。それ以外は保存された設定（既定はオン）
  setEnabled(!reduced && loadPref() !== "off");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      if (reduced) return;
      var next = !enabled;
      savePref(next ? "on" : "off");
      setEnabled(next);
    });
  }

  // 名前をタップ（クリック）するときらめく
  var nameEl = document.querySelector(".hero h1 .jp");
  if (nameEl && !reduced) {
    nameEl.addEventListener("click", function (e) {
      if (!enabled) return;
      spawnSparks(e.clientX, e.clientY);
    });
  }

  window.addEventListener("resize", function () {
    if (starCanvas) resizeStars();
    if (sparkCanvas) resizeSparks();
  });

  document.addEventListener("visibilitychange", function () {
    docVisible = !document.hidden;
    kick();
  });
})();
