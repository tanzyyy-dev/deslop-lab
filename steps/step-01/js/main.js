(function () {
  "use strict";

  // ---- Mobile navigation ----
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("gnav");

  function setNav(open) {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(!header.classList.contains("nav-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setNav(false);
    });
  }

  // ---- Countdown to next live ----
  var countdown = document.getElementById("countdown");
  if (countdown) {
    var target = new Date(countdown.getAttribute("data-target")).getTime();
    var els = {
      d: document.getElementById("cd-d"),
      h: document.getElementById("cd-h"),
      m: document.getElementById("cd-m"),
      s: document.getElementById("cd-s")
    };

    var pad = function (n) { return String(n).padStart(2, "0"); };

    var tick = function () {
      var diff = Math.max(0, target - Date.now());
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);
      els.d.textContent = days;
      els.h.textContent = pad(hours);
      els.m.textContent = pad(mins);
      els.s.textContent = pad(secs);
    };

    if (isNaN(target)) {
      Object.keys(els).forEach(function (k) { els[k].textContent = "--"; });
    } else {
      tick();
      setInterval(tick, 1000);
    }
  }

  // ---- Fan letter form (demo only: nothing is sent) ----
  var form = document.getElementById("contact-form");
  var note = document.getElementById("form-note");
  if (form && note) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      note.textContent = "ありがとうございます！このサイトはデモのため、メッセージは送信されません。";
      form.reset();
    });
  }
})();
