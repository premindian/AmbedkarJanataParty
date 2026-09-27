(function () {
  if (window.__ambedkarMysteryGlass) return;
  window.__ambedkarMysteryGlass = true;

  var FLAG = "ambedkarMysteryGlass";
  var STYLE_ID = "mystery-glass-style";
  var OVERLAY_ID = "mystery-glass";
  var turning = false;
  var pulseTimer = 0;

  function flagged() {
    try { return sessionStorage.getItem(FLAG) === "1"; } catch (e) { return false; }
  }
  function setFlag() {
    try { sessionStorage.setItem(FLAG, "1"); } catch (e) {}
  }
  function clearFlag() {
    try { sessionStorage.removeItem(FLAG); } catch (e) {}
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css = document.createElement("style");
    css.id = STYLE_ID;
    css.textContent = [
      "html.mystery-glass-on { cursor: wait; }",
      "html.mystery-glass-on::before { pointer-events: none !important; }",
      ".mobile-journey-nav, .mobile-journey-nav * { pointer-events: auto !important; }",
      "#" + OVERLAY_ID + " {",
      "  position: fixed; inset: 0; z-index: 2147483645;",
      "  display: flex; align-items: center; justify-content: center;",
      "  width: 100%; height: 100%; height: 100dvh;",
      "  padding: 24px 16px; opacity: 0; pointer-events: none !important; display: none;",
      "  box-sizing: border-box; overflow: hidden;",
      "  background:",
      "    radial-gradient(ellipse at 50% 38%, rgba(232,213,168,0.22), transparent 42%),",
      "    linear-gradient(165deg, rgba(16,29,50,0.88) 0%, rgba(37,99,168,0.28) 48%, rgba(10,19,33,0.92) 100%);",
      "  -webkit-backdrop-filter: none;",
      "  backdrop-filter: none;",
      "  transition: opacity .28s ease;",
      "}",
      "#" + OVERLAY_ID + ".is-on { display: flex; opacity: 1; pointer-events: none !important; }",
      "#" + OVERLAY_ID + " .mg-pane { text-align: center; color: #f4efe6; width: 100%; max-width: 28rem; margin: 0 auto; }",
      "#" + OVERLAY_ID + " .mg-hour {",
      "  width: 88px; height: 132px; margin: 0 auto 18px; position: relative;",
      "  animation: mg-flip 1.8s ease-in-out infinite;",
      "  filter: drop-shadow(0 18px 28px rgba(0,0,0,.45));",
      "}",
      "#" + OVERLAY_ID + " .mg-bulb {",
      "  position: absolute; left: 14px; width: 60px; height: 60px;",
      "  border: 2px solid #e8d5a8;",
      "  background: linear-gradient(180deg, rgba(255,255,255,.16), rgba(197,165,114,.08));",
      "  box-shadow: inset 0 0 16px rgba(232,213,168,.28);",
      "}",
      "#" + OVERLAY_ID + " .mg-bulb.top { top: 0; border-radius: 8px 8px 50% 50%; }",
      "#" + OVERLAY_ID + " .mg-bulb.bot { bottom: 0; border-radius: 50% 50% 8px 8px; }",
      "#" + OVERLAY_ID + " .mg-neck {",
      "  position: absolute; left: 38px; top: 56px; width: 12px; height: 20px;",
      "  background: linear-gradient(90deg, rgba(232,213,168,.2), #e8d5a8, rgba(232,213,168,.2));",
      "}",
      "#" + OVERLAY_ID + " .mg-sand {",
      "  position: absolute; left: 24px; width: 40px; height: 22px;",
      "  background: #c5a572; opacity: .92;",
      "}",
      "#" + OVERLAY_ID + " .mg-sand.upper { top: 22px; border-radius: 0 0 20px 20px; animation: mg-drain 1.8s linear infinite; }",
      "#" + OVERLAY_ID + " .mg-sand.lower { bottom: 10px; height: 8px; border-radius: 10px 10px 4px 4px; animation: mg-fill 1.8s linear infinite; }",
      "#" + OVERLAY_ID + " .mg-stream {",
      "  position: absolute; left: 42px; top: 58px; width: 4px; height: 18px;",
      "  background: linear-gradient(#e8d5a8, #c5a572);",
      "  animation: mg-stream 1.8s linear infinite;",
      "}",
      "#" + OVERLAY_ID + " .mg-mark {",
      "  position: absolute; inset: 0; display: grid; place-items: center;",
      "  animation: mg-wheel 3.6s linear infinite;",
      "}",
      "#" + OVERLAY_ID + " .mg-mark svg { width: 34px; height: 34px; display: block; }",
      "#" + OVERLAY_ID + " .mg-kicker {",
      "  font-family: 'Libre Franklin', 'Segoe UI', Arial, sans-serif;",
      "  font-size: 0.68rem; letter-spacing: 0.22em; text-transform: uppercase;",
      "  color: #e8d5a8; margin-bottom: 8px;",
      "}",
      "#" + OVERLAY_ID + " .mg-copy {",
      "  font-family: Palatino, Georgia, serif; font-style: italic;",
      "  font-size: clamp(1.05rem, 4.4vw, 1.35rem); line-height: 1.4;",
      "  text-shadow: 0 8px 24px rgba(0,0,0,.4);",
      "}",
      "@keyframes mg-flip { 0%,62% { transform: rotate(0deg); } 78%,100% { transform: rotate(180deg); } }",
      "@keyframes mg-drain { 0% { height: 22px; opacity: .95; } 70% { height: 4px; opacity: .55; } 100% { height: 22px; opacity: .95; } }",
      "@keyframes mg-fill { 0% { height: 6px; } 70% { height: 22px; } 100% { height: 6px; } }",
      "@keyframes mg-stream { 0%,8% { opacity: 0; } 12%,70% { opacity: 1; } 76%,100% { opacity: 0; } }",
      "@keyframes mg-wheel { to { transform: rotate(360deg); } }",
      "@media (prefers-reduced-motion: reduce) {",
      "  #" + OVERLAY_ID + " .mg-hour, #" + OVERLAY_ID + " .mg-sand, #" + OVERLAY_ID + " .mg-stream, #" + OVERLAY_ID + " .mg-mark { animation: none; }",
      "}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(css);
  }

  function ensureOverlay() {
    ensureStyle();
    var el = document.getElementById(OVERLAY_ID);
    if (el) return el;
    el = document.createElement("div");
    el.id = OVERLAY_ID;
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.innerHTML =
      '<div class="mg-pane">' +
        '<div class="mg-hour" aria-hidden="true">' +
          '<div class="mg-bulb top"></div><div class="mg-neck"></div><div class="mg-bulb bot"></div>' +
          '<div class="mg-sand upper"></div><div class="mg-stream"></div><div class="mg-sand lower"></div>' +
          '<div class="mg-mark">' +
            '<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#e8d5a8" stroke-width="1.6"/><circle cx="16" cy="16" r="3.2" fill="#e8d5a8"/><path d="M16 4v24M4 16h24M7.5 7.5l17 17M24.5 7.5l-17 17" stroke="#e8d5a8" stroke-width="1.2" stroke-linecap="round"/></svg>' +
          '</div>' +
        '</div>' +
        '<div class="mg-kicker">Ambedkar Janata Party</div>' +
        '<div class="mg-copy">The Constitution is turning the glass…</div>' +
      '</div>';
    (document.body || document.documentElement).appendChild(el);
    return el;
  }

  function showGlass() {
    document.documentElement.classList.add("mystery-glass-on");
    var el = ensureOverlay();
    el.style.display = "flex";
    el.classList.add("is-on");
    el.setAttribute("aria-busy", "true");
  }

  function hideGlass() {
    clearFlag();
    document.documentElement.classList.remove("mystery-glass-on");
    var el = document.getElementById(OVERLAY_ID);
    if (!el) return;
    el.classList.remove("is-on");
    el.style.display = "none";
    el.removeAttribute("aria-busy");
  }

  function pulseGlass() {
    if (turning) return;
    showGlass();
    window.clearTimeout(pulseTimer);
    pulseTimer = window.setTimeout(function () {
      if (!turning) hideGlass();
    }, 720);
  }

  function samePage(url) {
    try {
      var next = new URL(url, location.href);
      return next.origin === location.origin && next.pathname === location.pathname && next.search === location.search;
    } catch (e) { return false; }
  }

  function isPageTurn(anchor) {
    return !!(anchor && anchor.closest && anchor.closest(".mobile-journey-nav"));
  }
  function asElement(el) {
    if (!el) return null;
    return el.nodeType === 3 ? el.parentElement || el.parentNode : el;
  }

  function closestAnchor(el) {
    el = asElement(el);
    return el && el.closest ? el.closest("a") : null;
  }

  function isIOS() {
    var ua = navigator.userAgent || "";
    if (/iP(ad|hone|od)/.test(ua)) return true;
    return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  }

  function isActionClick(el) {
    el = asElement(el);
    if (!el || el.id === OVERLAY_ID || (el.closest && el.closest("#" + OVERLAY_ID))) return false;
    if (el.closest && el.closest("a")) return false;
    return !!(el.closest && el.closest("button, [role='button'], label.discovery-btn, label.ios-action-control, input[type='submit'], input[type='button']"));
  }

  function beginTurn(url) {
    turning = true;
    setFlag();
    showGlass();
    window.setTimeout(function () {
      if (turning && document.visibilityState === "visible") {
        turning = false;
        hideGlass();
      }
    }, 2800);
    location.href = url;
  }

  function onClick(e) {
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = closestAnchor(e.target);
    if (isPageTurn(a)) {
      if (isIOS()) return;
      e.preventDefault();
      beginTurn(a.href);
      return;
    }
    if (!e.defaultPrevented && isActionClick(e.target)) pulseGlass();
  }

  window.__mysteryArmGlass = function () { setFlag(); };
  window.__mysteryShowGlass = function () { setFlag(); showGlass(); };
  window.__mysteryHideGlass = function () { turning = false; hideGlass(); };

  ensureStyle();
  if (flagged() || document.documentElement.classList.contains("mystery-glass-on")) showGlass();

  document.addEventListener("click", onClick, true);

  document.addEventListener("DOMContentLoaded", function () {
    var el = document.getElementById(OVERLAY_ID);
    if (document.body && el && el.parentNode !== document.body) document.body.appendChild(el);
    if (!turning && (flagged() || document.documentElement.classList.contains("mystery-glass-on"))) {
      window.setTimeout(hideGlass, 240);
    }
  });
  window.addEventListener("pageshow", function (ev) {
    if (ev.persisted) { turning = false; hideGlass(); }
  });
  window.addEventListener("load", function () {
    if (!turning && document.documentElement.classList.contains("mystery-glass-on")) hideGlass();
  });
})();
