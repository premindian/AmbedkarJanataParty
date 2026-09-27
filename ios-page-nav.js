(function () {
  if (window.__iosPageNav) return;
  window.__iosPageNav = true;

  var down = null;
  var going = null;
  var left = false;

  function navEl() {
    return document.querySelector(".mobile-journey-nav");
  }

  function isCoarse() {
    return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  }

  function addStyle() {
    if (document.getElementById("ios-page-nav-style")) return;
    var css = document.createElement("style");
    css.id = "ios-page-nav-style";
    css.textContent =
      ".mobile-journey-nav a.is-pressed,.mobile-journey-nav a.is-going{background:#c5a572!important;color:#111!important}";
    (document.head || document.documentElement).appendChild(css);
  }

  function liftNav() {
    var nav = navEl();
    if (!nav) return;
    var gap = 0;
    if (window.visualViewport) {
      gap = Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop);
    }
    nav.style.bottom = ((isCoarse() ? 72 : 18) + gap) + "px";
  }

  function linkAt(x, y) {
    var nav = navEl();
    if (!nav) return null;
    var items = nav.querySelectorAll("a");
    if (!items.length) return null;
    var nr = nav.getBoundingClientRect();
    if (x < nr.left - 30 || x > nr.right + 30 || y < nr.top - 30 || y > nr.bottom + 30) return null;
    var best = null;
    var bestD = Infinity;
    for (var i = 0; i < items.length; i++) {
      var r = items[i].getBoundingClientRect();
      var d = x < r.left ? r.left - x : (x > r.right ? x - r.right : 0);
      if (d < bestD) {
        bestD = d;
        best = items[i];
      }
    }
    return best;
  }

  function point(e) {
    var t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
    return t ? { x: t.clientX, y: t.clientY } : { x: e.clientX, y: e.clientY };
  }

  function reset() {
    going = null;
    down = null;
    var marked = document.querySelectorAll(".mobile-journey-nav a.is-going, .mobile-journey-nav a.is-pressed");
    for (var i = 0; i < marked.length; i++) {
      marked[i].classList.remove("is-going");
      marked[i].classList.remove("is-pressed");
    }
    if (window.__mysteryHideGlass) window.__mysteryHideGlass();
  }

  function go(a) {
    if (!a || !a.href) return;
    var href = a.href;
    if (going && going.href === href) return;
    going = { href: href };
    a.classList.add("is-going");
    if (window.__mysteryArmGlass) window.__mysteryArmGlass();
    window.location.href = href;
    window.setTimeout(function () {
      if (window.__mysteryShowGlass) window.__mysteryShowGlass();
    }, 0);
    window.setTimeout(function () {
      if (going && going.href === href && !left) window.location.href = href;
    }, 1200);
    window.setTimeout(function () {
      if (going && going.href === href && !left) reset();
    }, 10000);
  }

  function onDown(e) {
    if (e.pointerType === "mouse") return;
    liftNav();
    var p = point(e);
    var a = linkAt(p.x, p.y);
    if (down && down.a && down.a !== a) down.a.classList.remove("is-pressed");
    down = a ? { a: a, x: p.x, y: p.y, at: Date.now() } : null;
    if (a) a.classList.add("is-pressed");
  }

  function onUp(e) {
    if (e.pointerType === "mouse") return;
    if (!down) return;
    var d = down;
    down = null;
    d.a.classList.remove("is-pressed");
    var p = point(e);
    var dx = p.x - d.x;
    var dy = p.y - d.y;
    if ((dx * dx) + (dy * dy) > 1600) return;
    if (e.type.indexOf("cancel") >= 0 && Date.now() - d.at > 600) return;
    go(linkAt(p.x, p.y) || d.a);
  }

  var passive = { capture: true, passive: true };
  window.addEventListener("touchstart", onDown, passive);
  window.addEventListener("pointerdown", onDown, passive);
  window.addEventListener("touchend", onUp, passive);
  window.addEventListener("touchcancel", onUp, passive);
  window.addEventListener("pointerup", onUp, passive);
  window.addEventListener("pointercancel", onUp, passive);

  window.addEventListener("click", function (e) {
    var el = e.target && e.target.nodeType === 3 ? e.target.parentElement : e.target;
    var inNav = !!(el && el.closest && el.closest(".mobile-journey-nav a"));
    if (going) {
      if (inNav) e.preventDefault();
      return;
    }
    if (inNav) return;
    var a = linkAt(e.clientX, e.clientY);
    if (!a) return;
    e.preventDefault();
    go(a);
  }, true);

  window.addEventListener("pagehide", function () { left = true; });
  window.addEventListener("pageshow", function (e) {
    left = false;
    if (e.persisted) reset();
  });

  addStyle();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", liftNav);
  else liftNav();
  window.addEventListener("load", liftNav);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", liftNav);
    window.visualViewport.addEventListener("scroll", liftNav);
  }
  window.addEventListener("orientationchange", function () { window.setTimeout(liftNav, 250); });
})();
