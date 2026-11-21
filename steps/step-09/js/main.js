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

  // ---- ページの先頭へ（ロゴ・フッターのリンク） ----
  // href="#top" は JS なしでも先頭の目印へ飛ぶ。JS があるときは、
  // スクロール・フォーカス移動・URL のハッシュ削除をここで行う。
  var topMark = document.getElementById("top");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function goTop(e) {
    e.preventDefault();
    if (header && header.classList.contains("nav-open")) setNav(false);
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    if (topMark) topMark.focus({ preventScroll: true });
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  document.querySelectorAll('a.logo[href="#top"], a.to-top[href="#top"]').forEach(function (link) {
    link.addEventListener("click", goTop);
  });
})();
