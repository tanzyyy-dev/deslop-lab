(function () {
  "use strict";

  // 楽曲の試聴プレーヤー。
  // HTML には標準の <audio controls> を置いておき（JS なしでも試聴できる）、
  // JS が動く環境では controls を外して、このサイトの部品に置き換える。

  // 図形の外形は高さ 16px・幅 14px 程度（24px の枠に収める）。再生の三角は視覚の重心に合わせて右に 1px ずらしている
  var PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4v16l12-8z" fill="currentColor"/></svg>';
  var PAUSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="4" width="4.5" height="16" rx="1" fill="currentColor"/><rect x="14.5" y="4" width="4.5" height="16" rx="1" fill="currentColor"/></svg>';
  var SEEK_STEP = 5; // 秒
  var ARTIST = "天音ルミ";

  var players = [];
  var activePlayer = null;

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function isTime(sec) {
    return typeof sec === "number" && isFinite(sec) && sec >= 0;
  }

  // 表示用（ドット書体）: 1:05
  function clock(sec) {
    var s = Math.floor(sec);
    return Math.floor(s / 60) + ":" + pad(s % 60);
  }

  // 読み上げ用: 1分05秒
  function spoken(sec) {
    var s = Math.floor(sec);
    return Math.floor(s / 60) + "分" + pad(s % 60) + "秒";
  }

  function setHandler(session, action, handler) {
    try {
      session.setActionHandler(action, handler);
    } catch (err) {
      // このブラウザが対応していない操作は無視する
    }
  }

  function setupMediaSession(p) {
    if (!("mediaSession" in navigator)) return;
    var session = navigator.mediaSession;

    if (typeof MediaMetadata === "function") {
      var artwork = [];
      if (p.jacket) {
        artwork.push({
          src: p.jacket.currentSrc || p.jacket.src,
          sizes: "800x800",
          type: "image/webp"
        });
      }
      try {
        session.metadata = new MediaMetadata({
          title: p.title,
          artist: ARTIST,
          artwork: artwork
        });
      } catch (err) {
        // メタデータが作れない環境では何もしない
      }
    }

    setHandler(session, "play", function () { p.play(); });
    setHandler(session, "pause", function () { p.audio.pause(); });
    setHandler(session, "seekbackward", function (details) {
      p.seekTo(p.audio.currentTime - ((details && details.seekOffset) || SEEK_STEP));
    });
    setHandler(session, "seekforward", function (details) {
      p.seekTo(p.audio.currentTime + ((details && details.seekOffset) || SEEK_STEP));
    });
    setHandler(session, "seekto", function (details) {
      if (details && isTime(details.seekTime)) p.seekTo(details.seekTime);
    });
  }

  function createPlayer(audio) {
    var article = audio.closest(".release");
    var title = audio.closest(".release-text").querySelector("h3").textContent.trim();
    var jacket = article.querySelector("img.jacket");

    // 標準の controls を外し、この部品に置き換える。audio 要素は再生エンジンとして残し、隠す。
    audio.removeAttribute("controls");
    audio.hidden = true;

    var ui = document.createElement("div");
    ui.className = "player";
    ui.innerHTML =
      '<button type="button" class="player-toggle"></button>' +
      '<div class="player-seek">' +
        '<div class="player-bar" aria-hidden="true"><span class="player-bar-fill"></span></div>' +
        '<input type="range" class="player-range" min="0" max="0" step="any" value="0" disabled>' +
      '</div>' +
      '<div class="player-meta">' +
        '<div class="player-status" aria-live="polite"></div>' +
        '<div class="player-time"><span class="player-current">--:--</span> / <span class="player-length">--:--</span></div>' +
      '</div>';
    audio.insertAdjacentElement("afterend", ui);

    var toggle = ui.querySelector(".player-toggle");
    var seek = ui.querySelector(".player-seek");
    var range = ui.querySelector(".player-range");
    var status = ui.querySelector(".player-status");
    var currentEl = ui.querySelector(".player-current");
    var lengthEl = ui.querySelector(".player-length");
    range.setAttribute("aria-label", title + " の再生位置");

    var loading = false;
    var failed = false;
    var dragging = false;
    var lastPaused = null;

    var p = {
      audio: audio,
      title: title,
      jacket: jacket
    };

    function loaded() {
      return audio.readyState >= 1 && isTime(audio.duration);
    }

    function render() {
      var paused = audio.paused;
      var isLoaded = loaded();
      var dur = isLoaded ? audio.duration : 0;
      var cur = isTime(audio.currentTime) ? audio.currentTime : 0;

      // 再生ボタン
      toggle.setAttribute("aria-label", paused ? title + " を再生" : title + " を一時停止");
      if (paused !== lastPaused) {
        toggle.innerHTML = paused ? PLAY_ICON : PAUSE_ICON;
        lastPaused = paused;
      }

      // 状態表示
      var msg = "";
      var playing = false;
      if (failed) {
        msg = "再生できませんでした";
      } else if (!paused && loading) {
        msg = "読み込み中…";
      } else if (!paused) {
        msg = "再生中";
        playing = true;
      }
      status.textContent = msg;
      status.classList.toggle("is-playing", playing);

      // 時間表示
      currentEl.textContent = isLoaded ? clock(cur) : "--:--";
      lengthEl.textContent = isLoaded ? clock(dur) : "--:--";

      // シークバー
      range.max = isLoaded ? dur : 0;
      range.disabled = !isLoaded;
      if (!dragging) range.value = isLoaded ? cur : 0;
      range.setAttribute("aria-valuetext", isLoaded ? spoken(cur) + " / " + spoken(dur) : "長さは未取得");
      seek.style.setProperty("--p", (isLoaded && dur > 0 ? (cur / dur) * 100 : 0) + "%");
    }

    function seekTo(t) {
      if (!loaded()) return;
      var dur = audio.duration;
      audio.currentTime = Math.min(Math.max(t, 0), dur);
      render();
    }

    function play() {
      failed = false;
      render();
      var promise = audio.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function (err) {
          // 再生をすぐ止めたときの中断は、エラーとして扱わない
          if (err && err.name === "AbortError") return;
          failed = true;
          loading = false;
          render();
        });
      }
    }

    p.play = play;
    p.seekTo = seekTo;

    toggle.addEventListener("click", function () {
      if (audio.paused) play();
      else audio.pause();
    });

    range.addEventListener("input", function () {
      dragging = true;
      seekTo(parseFloat(range.value));
    });
    range.addEventListener("change", function () {
      dragging = false;
      render();
    });
    range.addEventListener("keydown", function (e) {
      if (!loaded()) return;
      var cur = audio.currentTime;
      var target = null;
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          target = cur - SEEK_STEP;
          break;
        case "ArrowRight":
        case "ArrowUp":
          target = cur + SEEK_STEP;
          break;
        case "Home":
          target = 0;
          break;
        case "End":
          target = audio.duration;
          break;
      }
      if (target === null) return;
      e.preventDefault();
      seekTo(target);
    });

    audio.addEventListener("play", function () {
      failed = false;
      // 1曲を再生したら、ほかの曲は止める
      players.forEach(function (other) {
        if (other !== p && !other.audio.paused) other.audio.pause();
      });
      activePlayer = p;
      setupMediaSession(p);
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
      render();
    });
    audio.addEventListener("pause", function () {
      loading = false;
      if (activePlayer === p && "mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
      }
      render();
    });
    audio.addEventListener("waiting", function () {
      loading = true;
      render();
    });
    audio.addEventListener("playing", function () {
      loading = false;
      render();
    });
    audio.addEventListener("canplay", function () {
      loading = false;
      render();
    });
    audio.addEventListener("loadedmetadata", render);
    audio.addEventListener("durationchange", render);
    audio.addEventListener("timeupdate", render);
    audio.addEventListener("ended", function () {
      // 最後まで再生したら先頭に戻して停止状態にする
      loading = false;
      audio.currentTime = 0;
      render();
    });
    audio.addEventListener("error", function () {
      failed = true;
      loading = false;
      render();
    });

    render();
    return p;
  }

  var audios = document.querySelectorAll("audio.release-audio");
  Array.prototype.forEach.call(audios, function (audio) {
    players.push(createPlayer(audio));
  });
})();
