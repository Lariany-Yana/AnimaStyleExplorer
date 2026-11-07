import { app } from "../../scripts/app.js";

const SITE_URL = "https://animastyles.thetacursed.com";
const TAB_ID = "animastyles-sidebar-tab";
const ICON_CLASS = "animastyles-tab-icon";
const OVERLAY_ID = "animastyles-overlay";

const ICON_SVG_URI =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z'/%3E%3C/svg%3E";

const CSS = `
.${ICON_CLASS} {
  display: inline-block;
  width: 1.3rem;
  height: 1.3rem;
  background-color: currentColor;
  -webkit-mask: url("${ICON_SVG_URI}") center / contain no-repeat;
  mask: url("${ICON_SVG_URI}") center / contain no-repeat;
}
#${OVERLAY_ID} {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}
#${OVERLAY_ID}[hidden] { display: none; }
.animastyles-dialog {
  display: flex;
  flex-direction: column;
  width: 90vw;
  height: 90vh;
  background: #1f1f1f;
  border: 1px solid #3d3d3d;
  border-radius: 10px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.65);
  overflow: hidden;
  color: #e5e5e5;
}
.animastyles-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #262626;
  border-bottom: 1px solid #3d3d3d;
  flex: 0 0 auto;
}
.animastyles-title { font-size: 14px; font-weight: 600; }
.animastyles-url {
  font-size: 12px;
  color: #9c9c9c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 40vw;
}
.animastyles-spacer { flex: 1 1 auto; }
.animastyles-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #c7c7c7;
  cursor: pointer;
  flex: 0 0 auto;
}
.animastyles-btn:hover { background: #3d3d3d; color: #ffffff; }
.animastyles-btn svg { width: 16px; height: 16px; }
.animastyles-body { position: relative; flex: 1 1 auto; background: #ffffff; }
.animastyles-body iframe { display: block; width: 100%; height: 100%; border: 0; background: #ffffff; }
.animastyles-loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #1f1f1f;
  color: #bdbdbd;
  font-size: 13px;
}
.animastyles-loader[hidden] { display: none; }
.animastyles-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #4a4a4a;
  border-top-color: #d0d0d0;
  border-radius: 50%;
  animation: animastyles-spin 0.8s linear infinite;
}
@keyframes animastyles-spin { to { transform: rotate(360deg); } }
`;

function injectStyles() {
  if (document.getElementById("animastyles-styles")) return;
  const style = document.createElement("style");
  style.id = "animastyles-styles";
  style.textContent = CSS;
  document.head.appendChild(style);
}

const SVG_EXTERNAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
const SVG_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const SVG_REFRESH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';

let overlayEl = null;
let iframeEl = null;
let loaderEl = null;

let loaded = false;
let expectLoad = false;

function buildOverlay() {
  if (overlayEl) return overlayEl;

  overlayEl = document.createElement("div");
  overlayEl.id = OVERLAY_ID;
  overlayEl.hidden = true;

  const dialog = document.createElement("div");
  dialog.className = "animastyles-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-label", "Anima Styles");

  const header = document.createElement("div");
  header.className = "animastyles-header";

  const icon = document.createElement("span");
  icon.className = ICON_CLASS;

  const title = document.createElement("span");
  title.className = "animastyles-title";
  title.textContent = "Anima Style Explorer";

  const url = document.createElement("span");
  url.className = "animastyles-url";
  url.textContent = SITE_URL;

  const spacer = document.createElement("span");
  spacer.className = "animastyles-spacer";

  const refreshBtn = document.createElement("button");
  refreshBtn.className = "animastyles-btn";
  refreshBtn.title = "Refresh";
  refreshBtn.innerHTML = SVG_REFRESH;
  refreshBtn.addEventListener("click", () => reloadIframe());

  const extBtn = document.createElement("button");
  extBtn.className = "animastyles-btn";
  extBtn.title = "Open in new tab";
  extBtn.innerHTML = SVG_EXTERNAL;
  extBtn.addEventListener("click", () => window.open(SITE_URL, "_blank", "noopener"));

  const closeBtn = document.createElement("button");
  closeBtn.className = "animastyles-btn";
  closeBtn.title = "Close (Esc)";
  closeBtn.innerHTML = SVG_CLOSE;
  closeBtn.addEventListener("click", () => hideOverlay());

  header.append(icon, title, url, spacer, refreshBtn, extBtn, closeBtn);

  const body = document.createElement("div");
  body.className = "animastyles-body";

  loaderEl = document.createElement("div");
  loaderEl.className = "animastyles-loader";
  loaderEl.innerHTML = '<span class="animastyles-spinner"></span>';

  iframeEl = document.createElement("iframe");
  iframeEl.title = "Anima Style Explorer";
  iframeEl.setAttribute(
    "allow",
    "clipboard-write *; clipboard-read *; fullscreen; popups; downloads; autoplay"
  );
  iframeEl.addEventListener("load", onIframeLoad);

  body.append(loaderEl, iframeEl);
  dialog.append(header, body);
  overlayEl.appendChild(dialog);
  document.body.appendChild(overlayEl);

  overlayEl.addEventListener("mousedown", (e) => {
    if (e.target === overlayEl) hideOverlay();
  });

  return overlayEl;
}

function navigate() {
  expectLoad = true;
  iframeEl.src = SITE_URL;
}

function reloadIframe() {
  loaded = false;
  expectLoad = true;
  loaderEl.hidden = false;
  iframeEl.src = SITE_URL + (SITE_URL.includes("?") ? "&" : "?") + "r=" + Date.now();
}

function onIframeLoad() {
  if (!expectLoad) return;
  expectLoad = false;
  loaded = true;
  if (loaderEl) loaderEl.hidden = true;
}

function showOverlay() {
  buildOverlay();
  overlayEl.hidden = false;
  if (loaded) {
    loaderEl.hidden = true;
  } else {
    loaderEl.hidden = false;
    navigate();
  }
}

function hideOverlay() {
  if (overlayEl) overlayEl.hidden = true;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlayEl && !overlayEl.hidden) {
    e.stopPropagation();
    hideOverlay();
  }
}, true);

function findTabButton() {
  for (const b of document.querySelectorAll("button, [role='button']")) {
    if (b.querySelector("." + ICON_CLASS)) return b;
  }
  return null;
}

app.registerExtension({
  name: "AnimaStyles.Browser",
  async setup() {
    injectStyles();
    app.extensionManager.registerSidebarTab({
      id: TAB_ID,
      icon: ICON_CLASS,
      title: "Anima Styles",
      type: "custom",
      render: (el) => {
        showOverlay();
        const b = findTabButton();
        if (b) b.click();
        setTimeout(() => {
          if (el.isConnected && el.offsetParent !== null) {
            const b2 = findTabButton();
            if (b2) b2.click();
          }
        }, 150);
      },
    });
  },
});