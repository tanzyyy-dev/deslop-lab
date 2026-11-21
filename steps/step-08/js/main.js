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

    // Esc で閉じて、フォーカスをメニューボタンに戻す
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("nav-open")) {
        setNav(false);
        toggle.focus();
      }
    });

    // PC 表示に切り替わったら、開いたままのメニューを閉じる
    var desktop = window.matchMedia("(min-width: 721px)");
    var onLayoutChange = function () {
      if (desktop.matches) setNav(false);
    };
    if (desktop.addEventListener) {
      desktop.addEventListener("change", onLayoutChange);
    } else {
      desktop.addListener(onLayoutChange);
    }
  }
})();
