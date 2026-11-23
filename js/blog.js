// ==========================================================================
// iDominiqe Spatial OS — Blog Hub & Dedicated Article Controller
// ==========================================================================

import { SUPPORTED_LANGS, TRANSLATIONS } from "./i18n.js";
import {
  smoothScrollToElement,
  updateOmniboxUrl,
  getCurrentOmniboxUrl,
  initScrollProgressBar,
  bindSmoothAnchorLinks
} from "./smooth-scroll.js";

const STORAGE_KEY = "idominiqe_spatial_v2";

let blogDataMod = null;
let bgAnimationsList = [{ id: "none", icon: "⏹️" }];
let bgController = null;
let parallaxController = null;

function scheduleIdle(fn, delay = 70) {
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
  bgPreset: "mesh",
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
    // ignore storage errors
  }
  const bLang = (navigator.language || "en").slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(bLang) ? { ...DEFAULT_STATE, lang: bLang } : { ...DEFAULT_STATE };
}

const state = loadState();
let activeTopic = "all";
let searchQuery = "";

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
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

function t(path) {
  const dict = TRANSLATIONS[state.lang] || TRANSLATIONS.en;
  return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict) ?? path;
}

function bt() {
  if (!blogDataMod) return null;
  return blogDataMod.BLOG_UI[state.lang] || blogDataMod.BLOG_UI.en;
}

function showToast(msg) {
  const el = document.getElementById("toast-pill");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.remove("show"), 2600);
}

// ==========================================================================
// THEME, LIGHTING, ANIMATIONS & SHARED FX
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
// BLOG HUB RENDERING (/blog/)
// ==========================================================================
function renderBlogHub() {
  const grid = document.getElementById("blog-hub-grid");
  if (!grid || !blogDataMod) return;
  const ui = bt();
  const { ARTICLES } = blogDataMod;

  document.title = ui.blogTitle;
  updateOmniboxUrl(activeTopic === "all" ? "/blog/" : `/blog/?topic=${activeTopic}`);

  const topicTabs = document.getElementById("blog-topic-tabs");
  if (topicTabs) {
    topicTabs.innerHTML = Object.entries(ui.topics)
      .map(
        ([key, label]) =>
          `<button class="shell-tab ${activeTopic === key ? "active" : ""}" data-topic="${key}">${label}</button>`
      )
      .join("");
    topicTabs.querySelectorAll("[data-topic]").forEach((btn) =>
      btn.addEventListener("click", () => {
        activeTopic = btn.dataset.topic;
        renderBlogHub();
      })
    );
  }

  const q = searchQuery.trim().toLowerCase();
  const filtered = ARTICLES.filter((a) => {
    const topicOk = activeTopic === "all" || a.topic === activeTopic;
    if (!topicOk) return false;
    if (!q) return true;
    const hay = `${a.title[state.lang] || a.title.en} ${a.excerpt[state.lang] || a.excerpt.en} ${a.tags.join(" ")}`.toLowerCase();
    return hay.includes(q);
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="bento-panel liquid-glass" style="grid-column:1/-1; text-align:center;">${t("cmd.noResults")}</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((a) => {
      const title = a.title[state.lang] || a.title.en;
      const excerpt = a.excerpt[state.lang] || a.excerpt.en;
      const topicLabel = ui.topics[a.topic] || a.topic;
      return `
      <a class="blog-card liquid-glass" href="./${a.file}">
        <div>
          <div class="blog-card-banner" style="background:${a.gradient}">
            <div class="blog-card-meta">
              <span class="project-cat-badge">${topicLabel}</span>
              <span class="project-domain-chip">/${a.slug}</span>
            </div>
            <div class="blog-card-meta">
              <span>${a.date}</span>
              <span>⏱ ${a.readTime} ${ui.readTimeSuffix}</span>
            </div>
          </div>
          <div style="margin-top:14px;">
            <h3>${title}</h3>
            <p>${excerpt}</p>
          </div>
        </div>
        <div class="project-footer">
          <div class="project-meta-row">
            ${a.tags.map((tag) => `<span class="tech-pill">${tag}</span>`).join("")}
          </div>
          <span class="card-circle-btn" aria-hidden="true">→</span>
        </div>
      </a>`;
    })
    .join("");
}

// ==========================================================================
// DEDICATED ARTICLE RENDERING (/blog/<slug>.html)
// ==========================================================================
function renderInteractiveWidget(article) {
  const ui = bt();
  const mount = document.getElementById("article-widget-mount");
  if (!mount || !article.widgetType) return;

  if (article.widgetType === "dns-inspector") {
    const records = [
      { type: "NS", host: "idominiqe.com", val: "Cloudflare Anycast Nameservers", desc: "Delegates full zone authority to Cloudflare global DNS." },
      { type: "A", host: "@ (idominiqe.com)", val: "185.199.108.153 – .111.153 (Proxied ☁️)", desc: "Routes root apex traffic through Cloudflare edge to GitHub Pages." },
      { type: "CNAME", host: "cyber / blaze / v-2 / smartcity / smartcity-v2 / smartcity-v3", val: "idominiqe.github.io (Proxied ☁️)", desc: "Maps clean subdomains to separate repositories without exposing IPs." },
      { type: "TXT", host: "_discord / @ SPF / DKIM", val: "Verification & Mail Auth", desc: "Proves domain ownership and prevents email spoofing (DNS-Only)." },
      { type: "MX", host: "idominiqe.com", val: "route1..3.mx.cloudflare.net", desc: "Routes incoming mail securely to private aliases." }
    ];
    let selected = 0;
    const draw = () => {
      const r = records[selected];
      mount.innerHTML = `
        <div class="widget-box liquid-glass">
          <h3 class="panel-title">🧭 ${ui.widgets.dnsTitle}</h3>
          <p class="section-sub" style="margin-top:4px;">${ui.widgets.dnsSub}</p>
          <div class="dns-tabs">
            ${records.map((rec, i) => `<button class="dns-tab-btn ${i === selected ? "active" : ""}" data-rec-idx="${i}">${rec.type}</button>`).join("")}
          </div>
          <div class="article-code" style="margin-top:6px;">TYPE:  ${r.type}\nHOST:  ${r.host}\nVALUE: ${r.val}\nROLE:  ${r.desc}</div>
        </div>`;
      mount.querySelectorAll("[data-rec-idx]").forEach((b) =>
        b.addEventListener("click", () => {
          selected = Number(b.dataset.recIdx);
          draw();
        })
      );
    };
    draw();
  } else if (article.widgetType === "security-checklist") {
    const items = [
      "Cloudflare SSL Mode: Full / Full (Strict)",
      "Always Use HTTPS + TLS 1.2+",
      "DNSSEC Enabled at Registrar",
      "Registrar & GitHub 2FA Hardware/TOTP",
      "Zero Exposed DB / Admin Login",
      "Proxied Edge WAF & DDoS Shield"
    ];
    const checked = new Set([0, 1, 3, 4, 5]);
    const draw = () => {
      const pct = Math.round((checked.size / items.length) * 100);
      mount.innerHTML = `
        <div class="widget-box liquid-glass">
          <div class="panel-head-row">
            <h3 class="panel-title">🛡️ ${ui.widgets.secTitle}</h3>
            <span class="panel-badge">${pct}% Ready</span>
          </div>
          <p class="section-sub">${ui.widgets.secSub}</p>
          <div class="checklist-grid">
            ${items
              .map(
                (label, idx) => `
              <div class="check-item ${checked.has(idx) ? "checked" : ""}" data-chk="${idx}">
                <span>${label}</span>
                <strong>${checked.has(idx) ? "✓" : "○"}</strong>
              </div>`
              )
              .join("")}
          </div>
        </div>`;
      mount.querySelectorAll("[data-chk]").forEach((el) =>
        el.addEventListener("click", () => {
          const idx = Number(el.dataset.chk);
          if (checked.has(idx)) checked.delete(idx);
          else checked.add(idx);
          draw();
        })
      );
    };
    draw();
  } else if (article.widgetType === "privacy-audit") {
    const items = [
      "WHOIS / RDAP Owner Data Redacted",
      "SPF + DKIM + DMARC Configured",
      "Zero Cross-Site Ad Tracking Cookies",
      "GitHub No-Reply Email for Public Commits",
      "Local-First Preferences (localStorage)"
    ];
    const checked = new Set([0, 1, 2, 4]);
    const draw = () => {
      const pct = Math.round((checked.size / items.length) * 100);
      mount.innerHTML = `
        <div class="widget-box liquid-glass">
          <div class="panel-head-row">
            <h3 class="panel-title">🔐 ${ui.widgets.privTitle}</h3>
            <span class="panel-badge">${pct}% Protected</span>
          </div>
          <p class="section-sub">${ui.widgets.privSub}</p>
          <div class="checklist-grid">
            ${items
              .map(
                (label, idx) => `
              <div class="check-item ${checked.has(idx) ? "checked" : ""}" data-pchk="${idx}">
                <span>${label}</span>
                <strong>${checked.has(idx) ? "✓" : "○"}</strong>
              </div>`
              )
              .join("")}
          </div>
        </div>`;
      mount.querySelectorAll("[data-pchk]").forEach((el) =>
        el.addEventListener("click", () => {
          const idx = Number(el.dataset.pchk);
          if (checked.has(idx)) checked.delete(idx);
          else checked.add(idx);
          draw();
        })
      );
    };
    draw();
  } else if (article.widgetType === "arch-compare") {
    mount.innerHTML = `
      <div class="widget-box liquid-glass">
        <h3 class="panel-title">⚡ ${ui.widgets.archTitle}</h3>
        <p class="section-sub" style="margin-top:4px;">${ui.widgets.archSub}</p>
        <div class="article-code" style="margin-top:12px;">METRIC              EDGE STATIC 3D (ES6)      LEGACY MONOLITH CMS
────────────────────────────────────────────────────────────────────
TTFB (Global Edge)  < 25 ms (Cloudflare CDN)   350 - 900 ms (PHP/DB)
Server Attack Area  Zero (No DB / No wp-admin) High (Plugins / SQLi)
Monthly Hosting     $0 (GitHub Pages + CF)     $15 - $80 / mo VPS
3D & Liquid Glass   Native 60 FPS GPU          Heavy Plugin Bloat</div>
      </div>`;
  }
}

function renderArticlePage(articleId) {
  if (!blogDataMod) return;
  const { ARTICLES } = blogDataMod;
  const idx = ARTICLES.findIndex((a) => a.id === articleId);
  const article = ARTICLES[idx >= 0 ? idx : 0];
  const ui = bt();

  const title = article.title[state.lang] || article.title.en;
  const excerpt = article.excerpt[state.lang] || article.excerpt.en;
  const sections = article.sections[state.lang] || article.sections.en;

  document.title = `${title} — iDominiqe Blog`;
  updateOmniboxUrl(`/blog/${article.slug}`);

  document.getElementById("article-hero-bg").style.background = article.gradient;
  document.getElementById("article-topic-badge").textContent = ui.topics[article.topic] || article.topic;
  document.getElementById("article-meta-time").textContent = `${article.date} · ⏱ ${article.readTime} ${ui.readTimeSuffix}`;
  document.getElementById("article-title").textContent = title;
  document.getElementById("article-excerpt").textContent = excerpt;
  document.getElementById("article-tags").innerHTML = article.tags.map((tg) => `<span class="glass-tag">${tg}</span>`).join("");

  const tocEl = document.getElementById("article-toc-links");
  if (tocEl) {
    tocEl.innerHTML = sections
      .map((s, i) => `<a class="toc-link ${i === 0 ? "active" : ""}" href="#${s.id}">${s.heading}</a>`)
      .join("");
  }

  const bodyEl = document.getElementById("article-body");
  if (bodyEl) {
    bodyEl.innerHTML = sections
      .map(
        (s) => `
      <article class="article-block liquid-glass" id="${s.id}">
        <h2>${s.heading}</h2>
        ${s.paragraphs.map((p) => `<p>${p}</p>`).join("")}
        ${s.callout ? `<div class="article-callout">${s.callout}</div>` : ""}
        ${s.code ? `<pre class="article-code">${s.code}</pre>` : ""}
      </article>`
      )
      .join("") + `<div id="article-widget-mount"></div>`;
  }

  renderInteractiveWidget(article);

  // Prev / Next pager
  const prev = ARTICLES[(idx - 1 + ARTICLES.length) % ARTICLES.length];
  const next = ARTICLES[(idx + 1) % ARTICLES.length];
  const pagerEl = document.getElementById("article-pager");
  if (pagerEl) {
    pagerEl.innerHTML = `
      <a class="pager-card liquid-glass" href="./${prev.file}">
        <span style="font-size:0.75rem; color:var(--text-muted);">← ${ui.prevArticle}</span>
        <strong>${prev.title[state.lang] || prev.title.en}</strong>
      </a>
      <a class="pager-card liquid-glass" href="./${next.file}" style="text-align:right;">
        <span style="font-size:0.75rem; color:var(--text-muted);">${ui.nextArticle} →</span>
        <strong>${next.title[state.lang] || next.title.en}</strong>
      </a>`;
  }

  // Scroll spy for section omnibox update + TOC highlight
  const secObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateOmniboxUrl(`/blog/${article.slug}#${entry.target.id}`);
          document.querySelectorAll(".toc-link").forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        }
      });
    },
    { threshold: 0.35 }
  );
  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) secObserver.observe(el);
  });
}

// ==========================================================================
// LANGUAGE SYNC & EVENTS
// ==========================================================================
function applyLanguage() {
  document.documentElement.lang = state.lang;
  const ui = bt();

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const val = t(el.dataset.i18n);
    if (typeof val === "string") el.textContent = val;
  });

  if (ui) {
    document.querySelectorAll("[data-blog-i18n]").forEach((el) => {
      const val = el.dataset.blogI18n.split(".").reduce((a, p) => (a ? a[p] : undefined), ui);
      if (typeof val === "string") el.textContent = val;
    });

    document.querySelectorAll("[data-blog-placeholder]").forEach((el) => {
      const val = el.dataset.blogPlaceholder.split(".").reduce((a, p) => (a ? a[p] : undefined), ui);
      if (typeof val === "string") el.placeholder = val;
    });
  }

  document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("active", b.dataset.lang === state.lang));

  renderPaletteAndAnimPickers();

  if (blogDataMod) {
    const articleId = document.body.dataset.articleId;
    if (articleId) renderArticlePage(articleId);
    else renderBlogHub();
  }
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
    if (cursor && state.cursor) cursor.classList.toggle("is-hover", Boolean(e.target.closest("a, button, .check-item")));
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

  document.getElementById("blog-search")?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderBlogHub();
  });

  document.getElementById("copy-domain-btn")?.addEventListener("click", async () => {
    await navigator.clipboard?.writeText(getCurrentOmniboxUrl());
    showToast(t("toast.urlCopied"));
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

  document.getElementById("scroll-top-btn")?.addEventListener("click", () => {
    smoothScrollToElement(document.getElementById("main-shell"), 92);
  });
}

// ==========================================================================
// BOOTSTRAP (STAGE 1: SHELL -> STAGE 2: STAGED IDLE PRELOADING)
// ==========================================================================
initScrollProgressBar();
bindSmoothAnchorLinks((hash) => {
  const id = document.body.dataset.articleId;
  if (id) updateOmniboxUrl(`/blog/${id}${hash}`);
});
renderPaletteAndAnimPickers();
applyThemeAndFX();
applyLanguage();
bindEvents();
parallaxController = initParallaxCursor();

scheduleIdle(async () => {
  const [bMod, bgMod] = await Promise.all([
    import("./blog-data.js"),
    import("./bg-animations.js")
  ]);
  blogDataMod = bMod;
  bgAnimationsList = bgMod.BG_ANIMATIONS;
  bgController = bgMod.initBackgroundAnimations(() => state);

  applyLanguage();
}, 40);
