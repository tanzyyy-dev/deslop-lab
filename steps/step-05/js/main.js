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
})();
