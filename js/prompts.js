// ==========================================================================
// iDominiqe Spatial OS — AI Prompts & Live Web Demos (Lazy + Preloaded)
// ==========================================================================

import { SUPPORTED_LANGS, TRANSLATIONS } from "./i18n.js";
import {
  smoothScrollToElement,
  updateOmniboxUrl,
  getCurrentOmniboxUrl,
  initScrollProgressBar
} from "./smooth-scroll.js";

const STORAGE_KEY = "idominiqe_spatial_v2";

let promptsDataMod = null;
let bgAnimationsList = [{ id: "none", icon: "⏹️" }];
let bgController = null;
let parallaxController = null;
let cardObserver = null;

function scheduleIdle(fn, delay = 80) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(fn, { timeout: 600 });
  } else {
    setTimeout(fn, delay);
  }
}

const PALETTES = [
  { id: "flat", name: "Flat", swatch: "linear-gradient(135deg,#0f172a 50%,#f8fafc 50%)" },
  { id: "aurora", name: "Aurora", swatch: "linear-gradient(135deg,#8b5cf6,#38bdf8,#f472b6)" },
  { id: "vision", name: "Vision", swatch: "linear-gradient(135deg,#e5dfd5,#94a3b8,#fbbf24)" },
  { id: "cyber", name: "Cyber", swatch: "linear-gradient(135deg,#f43f5e,#fb923c,#38bdf8)" },
  { id: "emerald", name: "Solar", swatch: "linear-gradient(135deg,#10b981,#22d3ee,#facc15)" },
  { id: "sunset", name: "Sunset", swatch: "linear-gradient(135deg,#fb7185,#fb923c,#c084fc)" },
  { id: "arctic", name: "Arctic", swatch: "linear-gradient(135deg,#60a5fa,#67e8f9,#818cf8)" }
];

const DEFAULT_STATE = {
  lang: "en",
  palette: "flat",
  lighting: "dark",
  bgAnim: "none",
  customBg: "",
  blur: 0,
  glow: 0,
  parallax: 0,
  dim: 0,
  bgBlur: 0,
  shards: false,
  cursor: false
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  const bLang = (navigator.language || "en").slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(bLang) ? { ...DEFAULT_STATE, lang: bLang } : { ...DEFAULT_STATE };
}

const state = loadState();
let activeCat = "all";
let searchQuery = "";
let activeModalItem = null;
let activeModalTab = "preview";
let activeDevice = "desktop";

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function t(path) {
  const dict = TRANSLATIONS[state.lang] || TRANSLATIONS.en;
  return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict) ?? path;
}

function pt() {
  if (!promptsDataMod) return null;
  return promptsDataMod.PROMPTS_UI[state.lang] || promptsDataMod.PROMPTS_UI.en;
}

function showToast(msg) {
  const el = document.getElementById("toast-pill");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.remove("show"), 2600);
}

function selectPalette(paletteId) {
  state.palette = paletteId;
  if (paletteId === "flat") {
    state.bgAnim = "none";
    state.blur = 0;
    state.glow = 0;
    state.parallax = 0;
    state.dim = 0;
    state.shards = false;
    state.cursor = false;
  } else {
    if (state.blur === 0) state.blur = 24;
    if (state.glow === 0) state.glow = 85;
    if (state.parallax === 0) state.parallax = 75;
    if (state.bgAnim === "none") state.bgAnim = "cubes";
    state.shards = true;
  }
  applyThemeAndFX();
  saveState();
}

async function copyPromptText(item, btnEl) {
  await navigator.clipboard?.writeText(item.prompt);
  const ui = pt();
  const copiedText = ui ? ui.copied : "Copied!";
  showToast(copiedText);
  if (btnEl) {
    const orig = btnEl.textContent;
    btnEl.textContent = `✓ ${copiedText}`;
    btnEl.classList.add("is-copied");
    setTimeout(() => {
      btnEl.textContent = orig;
      btnEl.classList.remove("is-copied");
    }, 1800);
  }
}

// ==========================================================================
// THEME, LIGHTING & ANIMATION PICKERS
// ==========================================================================
function applyThemeAndFX() {
  const root = document.documentElement;
  root.setAttribute("data-palette", state.palette);
  root.setAttribute("data-lighting", state.lighting);
  root.style.setProperty("--glass-blur", `${state.blur}px`);
  root.style.setProperty("--glow-strength", (state.glow / 100).toFixed(2));
  root.style.setProperty("--parallax-depth", (state.parallax / 100).toFixed(2));
  root.style.setProperty("--bg-dim", (state.dim / 100).toFixed(2));
  root.style.setProperty("--bg-image-blur", `${state.bgBlur}px`);

  document.body.classList.toggle("no-shards", !state.shards);
  document.body.classList.toggle("custom-cursor-on", state.cursor);

  const wp = document.getElementById("bg-wallpaper");
  if (wp) {
    if (state.customBg) {
      wp.style.backgroundImage = `url("${state.customBg}")`;
      wp.classList.add("active");
    } else {
      wp.style.backgroundImage = "none";
      wp.classList.remove("active");
    }
  }

  document.querySelectorAll("[data-lighting-set]").forEach((b) => b.classList.toggle("active", b.dataset.lightingSet === state.lighting));
  document.querySelectorAll("[data-palette-id]").forEach((b) => b.classList.toggle("active", b.dataset.paletteId === state.palette));
  document.querySelectorAll("[data-anim-id]").forEach((b) => b.classList.toggle("active", b.dataset.animId === state.bgAnim));

  const sliders = [
    ["ctrl-blur", "val-blur", state.blur, "px"],
    ["ctrl-glow", "val-glow", state.glow, "%"],
    ["ctrl-parallax", "val-parallax", state.parallax, "%"],
    ["ctrl-dim", "val-dim", state.dim, "%"],
    ["ctrl-bgblur", "val-bgblur", state.bgBlur, "px"]
  ];
  for (const [id, lbl, val, u] of sliders) {
    const inp = document.getElementById(id);
    const out = document.getElementById(lbl);
    if (inp) inp.value = val;
    if (out) out.textContent = `${val}${u}`;
  }
  const shards = document.getElementById("ctrl-shards");
  const cursor = document.getElementById("ctrl-cursor");
  if (shards) shards.checked = state.shards;
  if (cursor) cursor.checked = state.cursor;

  bgController?.wake();
  parallaxController?.wake();
}

function renderPaletteAndAnimPickers() {
  const palBox = document.getElementById("drawer-palette-list");
  if (palBox) {
    palBox.innerHTML = PALETTES.map(
      (p) => `<button class="palette-chip ${state.palette === p.id ? "active" : ""}" data-palette-id="${p.id}">
        <span class="swatch-dot" style="background:${p.swatch}"></span>
        <span>${p.name}</span>
      </button>`
    ).join("");
    palBox.querySelectorAll("[data-palette-id]").forEach((btn) =>
      btn.addEventListener("click", () => selectPalette(btn.dataset.paletteId))
    );
  }

  const animBox = document.getElementById("drawer-anim-list");
  if (animBox) {
    const labels = t("bgAnims") || {};
    animBox.innerHTML = bgAnimationsList.map(
      (a) => `<button class="anim-chip ${state.bgAnim === a.id ? "active" : ""}" data-anim-id="${a.id}">
        <span aria-hidden="true">${a.icon}</span>
        <span>${labels[a.id] || a.id}</span>
      </button>`
    ).join("");
    animBox.querySelectorAll("[data-anim-id]").forEach((btn) =>
      btn.addEventListener("click", () => {
        state.bgAnim = btn.dataset.animId;
        applyThemeAndFX();
        saveState();
      })
    );
  }
}

// ==========================================================================
// GALLERY WITH LAZY VIEWPORT + STAGGERED PRELOAD FOR VIDEO & LIVE DEMOS
// ==========================================================================
function hydrateCardMedia(card, list, autoPlay = false) {
  const item = list.find((p) => p.id === card.dataset.promptId);
  if (!item) return;

  const video = card.querySelector("video.prompt-video-preview");
  if (video) {
    if (video.dataset.hydrated !== "1") {
      video.preload = "auto";
      video.src = video.dataset.videoSrc;
      video.dataset.hydrated = "1";
    }
    if (autoPlay && video.paused) {
      video.play().catch(() => {});
    }
    return;
  }

  const iframe = card.querySelector("iframe");
  if (!iframe || iframe.dataset.hydrated === "1") return;
  iframe.srcdoc = item.previewHtml;
  iframe.dataset.hydrated = "1";
}

function renderPromptsGallery() {
  const grid = document.getElementById("prompts-grid");
  if (!grid || !promptsDataMod) return;
  const ui = pt();
  const { PROMPT_TEMPLATES } = promptsDataMod;

  document.title = ui.pageTitle;
  if (!activeModalItem) {
    updateOmniboxUrl(activeCat === "all" ? "/prompts/" : `/prompts/?cat=${activeCat}`);
  }

  const tabs = document.getElementById("prompts-cat-tabs");
  if (tabs) {
    tabs.innerHTML = Object.entries(ui.categories)
      .map(([k, label]) => `<button class="shell-tab ${activeCat === k ? "active" : ""}" data-cat="${k}">${label}</button>`)
      .join("");
    tabs.querySelectorAll("[data-cat]").forEach((btn) =>
      btn.addEventListener("click", () => {
        activeCat = btn.dataset.cat;
        renderPromptsGallery();
      })
    );
  }

  const q = searchQuery.trim().toLowerCase();
  const list = PROMPT_TEMPLATES.filter((item) => {
    const catOk = activeCat === "all" || item.category === activeCat;
    if (!catOk) return false;
    if (!q) return true;
    const hay = `${item.title[state.lang] || item.title.en} ${item.desc[state.lang] || item.desc.en} ${item.stack.join(" ")} ${item.prompt}`.toLowerCase();
    return hay.includes(q);
  });

  if (!list.length) {
    grid.innerHTML = `<div class="bento-panel liquid-glass" style="grid-column:1/-1; text-align:center;">${t("cmd.noResults")}</div>`;
    return;
  }

  grid.innerHTML = list
    .map((item) => {
      const title = item.title[state.lang] || item.title.en;
      const desc = item.desc[state.lang] || item.desc.en;
      const mediaEl = item.videoUrl
        ? `<video class="prompt-video-preview" data-video-src="${item.videoUrl}" muted loop playsinline preload="none" aria-label="${title}"></video>`
        : `<iframe sandbox="allow-scripts" loading="lazy" title="${title}"></iframe>`;
      const videoBadge = item.videoUrl
        ? `<span class="video-badge-pill">🎬 ${ui.videoBadge || "Motion Video"}</span>`
        : "";
      return `
      <article class="prompt-card liquid-glass" data-prompt-id="${item.id}">
        <div>
          <div class="prompt-viewport" data-open-demo="${item.id}" title="${ui.liveDemo}" style="background:${item.colors[2] || "#101218"}">
            ${mediaEl}
            <div class="prompt-viewport-overlay">
              <span class="project-cat-badge">${item.badge}</span>
              <span style="display:flex; align-items:center; gap:6px;">
                ${videoBadge}
                <span class="swatch-row">${item.colors.map((c) => `<i class="swatch-mini" style="background:${c}"></i>`).join("")}</span>
              </span>
            </div>
          </div>

          <div class="prompt-card-body" style="margin-top:14px;">
            <h3>${title}</h3>
            <p>${desc}</p>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <div class="project-meta-row">
            ${item.stack.map((s) => `<span class="tech-pill">${s}</span>`).join("")}
            <span class="tech-pill">${item.fonts}</span>
          </div>
          <div class="prompt-card-actions">
            <button class="btn-secondary-glass" data-open-demo="${item.id}" style="padding:8px 14px; font-size:0.8rem;">
              ▶ ${ui.liveDemo}
            </button>
            <button class="btn-primary-glass copy-prompt-btn" data-copy-id="${item.id}" style="padding:8px 15px; font-size:0.8rem;">
              📋 ${ui.copyPrompt}
            </button>
          </div>
        </div>
      </article>`;
    })
    .join("");

  if (cardObserver) cardObserver.disconnect();
  const cards = Array.from(grid.querySelectorAll(".prompt-card"));

  cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector("video.prompt-video-preview");
        if (entry.isIntersecting) {
          hydrateCardMedia(entry.target, list, true);
          if (!video) cardObserver.unobserve(entry.target);
        } else if (video && !video.paused) {
          video.pause();
        }
      });
    },
    { rootMargin: "160px" }
  );
  cards.forEach((card) => cardObserver.observe(card));

  // Background staggered preloader so offscreen videos & demos buffer lazily after shell paint
  cards.forEach((card, idx) => {
    setTimeout(() => hydrateCardMedia(card, list, false), 150 + idx * 160);
  });

  grid.querySelectorAll("[data-open-demo]").forEach((el) =>
    el.addEventListener("click", () => {
      const item = PROMPT_TEMPLATES.find((p) => p.id === el.dataset.openDemo);
      if (item) openPromptModal(item);
    })
  );

  grid.querySelectorAll("[data-copy-id]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const item = PROMPT_TEMPLATES.find((p) => p.id === btn.dataset.copyId);
      if (item) copyPromptText(item, btn);
    })
  );
}

function syncModalView() {
  if (!activeModalItem) return;
  const stage = document.getElementById("modal-stage-wrap");
  const codeBox = document.getElementById("modal-prompt-code");
  const deviceControls = document.getElementById("modal-device-controls");
  const deviceFrame = document.getElementById("modal-device-frame");
  const videoEl = document.getElementById("modal-live-video");
  const iframeEl = document.getElementById("modal-live-iframe");
  const videoTabBtn = document.getElementById("modal-tab-video");

  if (videoTabBtn) {
    videoTabBtn.style.display = activeModalItem.videoUrl ? "inline-flex" : "none";
  }

  const isStageVisible = activeModalTab === "video" || activeModalTab === "preview";
  stage.style.display = isStageVisible ? "flex" : "none";
  deviceControls.style.display = isStageVisible ? "inline-flex" : "none";
  codeBox.style.display = activeModalTab === "prompt" ? "block" : "none";

  if (videoEl && iframeEl) {
    if (activeModalTab === "video" && activeModalItem.videoUrl) {
      iframeEl.style.display = "none";
      videoEl.style.display = "block";
      if (videoEl.getAttribute("src") !== activeModalItem.videoUrl) {
        videoEl.src = activeModalItem.videoUrl;
      }
      videoEl.play().catch(() => {});
    } else {
      if (!videoEl.paused) videoEl.pause();
      videoEl.style.display = "none";
      iframeEl.style.display = "block";
      if (activeModalTab === "preview" && !iframeEl.srcdoc) {
        iframeEl.srcdoc = activeModalItem.previewHtml;
      }
    }
  }

  deviceFrame.classList.remove("is-tablet", "is-mobile");
  if (activeDevice === "tablet") deviceFrame.classList.add("is-tablet");
  if (activeDevice === "mobile") deviceFrame.classList.add("is-mobile");

  document.querySelectorAll("[data-modal-tab]").forEach((b) => b.classList.toggle("active", b.dataset.modalTab === activeModalTab));
  document.querySelectorAll("[data-device-size]").forEach((b) => b.classList.toggle("active", b.dataset.deviceSize === activeDevice));
}

function openPromptModal(item) {
  activeModalItem = item;
  activeModalTab = item.videoUrl ? "video" : "preview";
  activeDevice = "desktop";

  updateOmniboxUrl(`/prompts/#${item.id}`);
  document.getElementById("modal-prompt-badge").textContent = item.badge;
  document.getElementById("modal-prompt-title").textContent = item.title[state.lang] || item.title.en;
  document.getElementById("modal-prompt-code").textContent = item.prompt;

  const videoEl = document.getElementById("modal-live-video");
  const iframeEl = document.getElementById("modal-live-iframe");
  if (videoEl) {
    videoEl.src = item.videoUrl || "";
  }
  if (iframeEl) {
    iframeEl.srcdoc = item.previewHtml || "";
  }

  syncModalView();
  document.getElementById("prompt-modal-backdrop").classList.add("open");
}

function closePromptModal() {
  activeModalItem = null;
  document.getElementById("prompt-modal-backdrop").classList.remove("open");
  const videoEl = document.getElementById("modal-live-video");
  if (videoEl) {
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();
  }
  document.getElementById("modal-live-iframe").srcdoc = "";
  updateOmniboxUrl(activeCat === "all" ? "/prompts/" : `/prompts/?cat=${activeCat}`);
}

// ==========================================================================
// LANGUAGE, CURSOR & EVENTS
// ==========================================================================
function applyLanguage() {
  document.documentElement.lang = state.lang;
  const ui = pt();

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const val = t(el.dataset.i18n);
    if (typeof val === "string") el.textContent = val;
  });
  if (ui) {
    document.querySelectorAll("[data-prompt-i18n]").forEach((el) => {
      const val = el.dataset.promptI18n.split(".").reduce((a, p) => (a ? a[p] : undefined), ui);
      if (typeof val === "string") el.textContent = val;
    });
    document.querySelectorAll("[data-prompt-placeholder]").forEach((el) => {
      const val = el.dataset.promptPlaceholder.split(".").reduce((a, p) => (a ? a[p] : undefined), ui);
      if (typeof val === "string") el.placeholder = val;
    });
  }

  document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("active", b.dataset.lang === state.lang));

  renderPaletteAndAnimPickers();
  if (promptsDataMod) renderPromptsGallery();
}

function initParallaxCursor() {
  const cursor = document.getElementById("spatial-cursor");
  const halo = document.getElementById("cursor-halo");
  const core = document.getElementById("cursor-core");
  const artifacts = document.querySelectorAll(".glass-artifact");

  let mx = window.innerWidth * 0.5;
  let my = window.innerHeight * 0.5;
  let hx = mx;
  let hy = my;
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let rafId = null;

  window.addEventListener("pointermove", (e) => {
    if (state.palette === "flat" && state.parallax === 0 && !state.cursor && state.glow === 0) return;

    mx = e.clientX;
    my = e.clientY;
    tx = (mx / window.innerWidth - 0.5) * 2;
    ty = (my / window.innerHeight - 0.5) * 2;
    if (core && state.cursor) {
      core.style.left = `${mx}px`;
      core.style.top = `${my}px`;
    }
    if (state.glow > 0) {
      const card = e.target.closest(".liquid-glass");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${mx - r.left}px`);
        card.style.setProperty("--my", `${my - r.top}px`);
      }
    }
    if (cursor && state.cursor) {
      cursor.classList.toggle("is-hover", Boolean(e.target.closest("a, button, .prompt-viewport")));
    }
  });

  function tick() {
    rafId = null;
    if (document.hidden || (state.parallax === 0 && !state.cursor)) return;

    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    hx += (mx - hx) * 0.16;
    hy += (my - hy) * 0.16;
    if (halo && state.cursor) {
      halo.style.left = `${hx}px`;
      halo.style.top = `${hy}px`;
    }
    if (state.parallax > 0 && state.shards) {
      const f = state.parallax / 100;
      artifacts.forEach((art, idx) => {
        const d = Number(art.dataset.depth || 24) * f;
        art.style.transform = `translate3d(${cx * d}px, ${cy * d}px, 0) rotate(${idx * 18 + cx * 14 * f}deg)`;
      });
    }
    rafId = requestAnimationFrame(tick);
  }

  const wake = () => {
    if (!rafId && !document.hidden && (state.parallax > 0 || state.cursor)) {
      rafId = requestAnimationFrame(tick);
    }
  };
  wake();
  return { wake };
}

function bindEvents() {
  document.querySelectorAll(".lang-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      applyLanguage();
      saveState();
    })
  );

  document.querySelectorAll("[data-lighting-set]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.lighting = btn.dataset.lightingSet;
      applyThemeAndFX();
      saveState();
    })
  );

  document.getElementById("prompts-search")?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderPromptsGallery();
  });

  document.getElementById("copy-domain-btn")?.addEventListener("click", async () => {
    await navigator.clipboard?.writeText(getCurrentOmniboxUrl());
    showToast(t("toast.urlCopied"));
  });

  document.getElementById("scroll-top-btn")?.addEventListener("click", () => {
    smoothScrollToElement(document.getElementById("main-shell"), 92);
  });

  document.querySelectorAll("[data-modal-tab]").forEach((btn) =>
    btn.addEventListener("click", () => {
      activeModalTab = btn.dataset.modalTab;
      syncModalView();
    })
  );
  document.querySelectorAll("[data-device-size]").forEach((btn) =>
    btn.addEventListener("click", () => {
      activeDevice = btn.dataset.deviceSize;
      syncModalView();
    })
  );
  document.getElementById("modal-copy-prompt")?.addEventListener("click", (e) => {
    if (activeModalItem) copyPromptText(activeModalItem, e.currentTarget);
  });
  document.getElementById("close-prompt-modal")?.addEventListener("click", closePromptModal);
  document.getElementById("prompt-modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "prompt-modal-backdrop") closePromptModal();
  });

  const setDrawer = (open) => {
    document.getElementById("studio-drawer")?.classList.toggle("open", open);
    document.getElementById("studio-backdrop")?.classList.toggle("open", open);
  };
  document.getElementById("open-studio-btn")?.addEventListener("click", () => setDrawer(true));
  document.getElementById("close-studio-btn")?.addEventListener("click", () => setDrawer(false));
  document.getElementById("studio-backdrop")?.addEventListener("click", () => setDrawer(false));

  const bindSlider = (id, key) => {
    document.getElementById(id)?.addEventListener("input", (e) => {
      state[key] = Number(e.target.value);
      applyThemeAndFX();
      saveState();
    });
  };
  bindSlider("ctrl-blur", "blur");
  bindSlider("ctrl-glow", "glow");
  bindSlider("ctrl-parallax", "parallax");
  bindSlider("ctrl-dim", "dim");
  bindSlider("ctrl-bgblur", "bgBlur");

  document.getElementById("ctrl-shards")?.addEventListener("change", (e) => {
    state.shards = e.target.checked;
    applyThemeAndFX();
    saveState();
  });
  document.getElementById("ctrl-cursor")?.addEventListener("change", (e) => {
    state.cursor = e.target.checked;
    applyThemeAndFX();
    saveState();
  });

  document.getElementById("apply-bg-url")?.addEventListener("click", () => {
    const u = document.getElementById("custom-bg-url")?.value.trim();
    if (!u) return;
    state.customBg = u;
    applyThemeAndFX();
    saveState();
    showToast(t("toast.bgApplied"));
  });
  document.getElementById("upload-bg-file")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.customBg = String(reader.result);
      applyThemeAndFX();
      saveState();
      showToast(t("toast.bgApplied"));
    };
    reader.readAsDataURL(file);
  });
  document.getElementById("reset-bg-btn")?.addEventListener("click", () => {
    state.customBg = "";
    applyThemeAndFX();
    saveState();
    showToast(t("toast.bgReset"));
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closePromptModal();
      setDrawer(false);
    }
  });
}

// ==========================================================================
// BOOTSTRAP (STAGE 1: SHELL -> STAGE 2: STAGED PRELOADING)
// ==========================================================================
initScrollProgressBar();
renderPaletteAndAnimPickers();
applyThemeAndFX();
applyLanguage();
bindEvents();
parallaxController = initParallaxCursor();

scheduleIdle(async () => {
  const [pMod, bgMod] = await Promise.all([
    import("./prompts-data.js"),
    import("./bg-animations.js")
  ]);
  promptsDataMod = pMod;
  bgAnimationsList = bgMod.BG_ANIMATIONS;
  bgController = bgMod.initBackgroundAnimations(() => state);

  applyLanguage();
}, 40);
