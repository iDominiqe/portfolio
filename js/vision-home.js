// ==========================================================================
// iDominiqe Spatial OS v3 — VisionOS Smoked-Glass Single-Screen Controller
// ==========================================================================

import { PROJECTS, SOCIALS } from "./projects-data.js";
import { SUPPORTED_LANGS, TRANSLATIONS } from "./i18n.js";

const STORAGE_KEY = "idominiqe_vision_v3";

const CITIES = {
  chisinau: { name: "Chisinau", lat: 47.0105, lon: 28.8638 },
  bucharest: { name: "Bucharest", lat: 44.4268, lon: 26.1025 },
  paris: { name: "Paris", lat: 48.8566, lon: 2.3522 },
  london: { name: "London", lat: 51.5072, lon: -0.1276 },
  tokyo: { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  newyork: { name: "New York", lat: 40.7128, lon: -74.006 }
};

const WEATHER_CONDITIONS = {
  en: { clear: "Clear sky", partly: "Partly cloudy", cloudy: "Overcast", rain: "Rain showers", storm: "Thunderstorm", snow: "Snowfall", fog: "Mist / Fog" },
  ro: { clear: "Cer senin", partly: "Parțial noros", cloudy: "Înnorat", rain: "Ploaie", storm: "Furtună", snow: "Ninsoare", fog: "Ceață" },
  fr: { clear: "Ciel dégagé", partly: "Partiellement nuageux", cloudy: "Couvert", rain: "Averses", storm: "Orage", snow: "Neige", fog: "Brouillard" },
  bg: { clear: "Ясно", partly: "Разкъсана облачност", cloudy: "Облачно", rain: "Дъжд", storm: "Гръмотевична буря", snow: "Сняг", fog: "Мъгла" },
  ru: { clear: "Ясно", partly: "Переменная облачность", cloudy: "Облачно", rain: "Дождь", storm: "Гроза", snow: "Снег", fog: "Туман" }
};

const FALLBACK_WEATHER = {
  chisinau: { temp: 9, high: 12, low: 4, hum: 64, wind: 11, code: 2 },
  bucharest: { temp: 12, high: 15, low: 6, hum: 58, wind: 10, code: 1 },
  paris: { temp: 13, high: 16, low: 8, hum: 71, wind: 14, code: 3 },
  london: { temp: 11, high: 13, low: 7, hum: 76, wind: 18, code: 61 },
  tokyo: { temp: 16, high: 19, low: 11, hum: 55, wind: 9, code: 0 },
  newyork: { temp: 10, high: 14, low: 5, hum: 52, wind: 16, code: 1 }
};

const DEFAULT_STATE = {
  lang: "en",
  vtheme: "loft",
  heroIndex: 0,
  category: "all",
  search: "",
  sortReverse: false,
  cityKey: "chisinau",
  customGeo: null,
  customBg: ""
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    // ignore storage restriction
  }
  const bLang = (navigator.language || "en").slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(bLang) ? { ...DEFAULT_STATE, lang: bLang } : { ...DEFAULT_STATE };
}

const state = loadState();
let lastWeatherPayload = null;

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

function showToast(msg) {
  const el = document.getElementById("v-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.remove("show"), 2400);
}

// ==========================================================================
// ENTRANCE TILE PRELOAD CHOREOGRAPHY
// ==========================================================================
function runTilePreloadAnimation() {
  const root = document.getElementById("vision-root");
  const bar = document.getElementById("address-progress");
  if (!root) return;

  root.classList.remove("is-revealed");
  root.classList.add("is-preloading");

  if (bar) {
    bar.classList.remove("running");
    void bar.offsetWidth;
    bar.classList.add("running");
  }

  clearTimeout(runTilePreloadAnimation._t);
  runTilePreloadAnimation._t = setTimeout(() => {
    root.classList.remove("is-preloading");
    root.classList.add("is-revealed");
  }, 260);
}

// ==========================================================================
// PROCEDURAL 3D ARTWORK MOTIFS FOR HERO & POSTER TILES
// ==========================================================================
function getMotifSvg(motif) {
  switch (motif) {
    case "solar-grid":
      return `<defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#10b981"/></linearGradient></defs><circle cx="210" cy="110" r="78" fill="none" stroke="url(#g1)" stroke-width="1.5"/><polygon points="150,150 210,72 275,150" fill="none" stroke="#ffffff" stroke-opacity="0.45" stroke-width="1.6"/><path d="M120 135 Q210 65 295 140" fill="none" stroke="#38bdf8" stroke-opacity="0.6" stroke-width="1.5"/>`;
    case "topo-wasm":
      return `<ellipse cx="215" cy="120" rx="90" ry="38" fill="none" stroke="#2dd4bf" stroke-opacity="0.5" stroke-width="1.4"/><ellipse cx="215" cy="110" rx="68" ry="26" fill="none" stroke="#38bdf8" stroke-opacity="0.65" stroke-width="1.4"/><ellipse cx="215" cy="100" rx="44" ry="15" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="1.4"/>`;
    case "crystal-hud":
      return `<polygon points="210,25 258,108 210,192 162,108" fill="rgba(249,115,22,0.18)" stroke="#f97316" stroke-width="1.6"/><polygon points="210,48 242,108 210,168 178,108" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="1.2"/><circle cx="210" cy="108" r="88" fill="none" stroke="#fb7185" stroke-dasharray="6 6" stroke-width="1.2"/>`;
    case "portal-ring":
      return `<circle cx="210" cy="110" r="76" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="14 6"/><circle cx="210" cy="110" r="54" fill="none" stroke="#ec4899" stroke-width="1.6"/><circle cx="210" cy="110" r="24" fill="rgba(255,255,255,0.18)" stroke="#fff" stroke-width="1.5"/>`;
    case "canopy-3d":
      return `<rect x="135" y="74" width="145" height="68" rx="12" transform="skewX(-12)" fill="rgba(16,185,129,0.22)" stroke="#34d399" stroke-width="1.6"/><line x1="170" y1="142" x2="170" y2="185" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2"/><line x1="238" y1="142" x2="238" y2="185" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2"/>`;
    default:
      return `<rect x="155" y="55" width="110" height="110" rx="22" transform="rotate(16 210 110)" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.52)" stroke-width="1.6"/><circle cx="210" cy="110" r="36" fill="none" stroke="#38bdf8" stroke-width="1.6"/>`;
  }
}

// ==========================================================================
// RENDERING UI
// ==========================================================================
function syncAddressUrl(proj) {
  const input = document.getElementById("address-input");
  if (!input || document.activeElement === input) return;
  input.value = proj && proj.id !== "smartcity-v3"
    ? `https://portfolio.idominiqe.com/#${proj.id}`
    : "https://portfolio.idominiqe.com/";
}

function renderProfilePop() {
  const slot = document.getElementById("profile-social-links");
  if (!slot) return;
  slot.innerHTML = SOCIALS.map(
    (s) => `<a class="pop-link" href="${s.url}" target="_blank" rel="noopener noreferrer">
      <span>${s.name}</span>
      <span style="opacity:0.65; font-size:0.68rem;">${s.handle}</span>
    </a>`
  ).join("");
}

function renderRail() {
  const featBox = document.getElementById("rail-featured-list");
  const queueBox = document.getElementById("rail-queue-list");
  const ordered = state.sortReverse ? [...PROJECTS].reverse() : PROJECTS;

  if (featBox) {
    const featuredItems = ordered.slice(0, 2);
    featBox.innerHTML = featuredItems
      .map((p) => {
        const idx = PROJECTS.findIndex((x) => x.id === p.id);
        return `
        <button class="featured-thumb-tile ${idx === state.heroIndex ? "active" : ""}" data-select-idx="${idx}" style="background:${p.gradient};">
          <div class="thumb-scrim"></div>
          <div class="thumb-meta">
            <strong>${p.title[state.lang] || p.title.en}</strong>
            <span>${p.domain}</span>
          </div>
          <span class="circle-play-sm" aria-hidden="true">▶</span>
        </button>`;
      })
      .join("");
  }

  if (queueBox) {
    const queueItems = ordered.slice(2, 5);
    queueBox.innerHTML = queueItems
      .map((p) => {
        const idx = PROJECTS.findIndex((x) => x.id === p.id);
        return `
        <button class="queue-row" data-select-idx="${idx}">
          <span class="queue-icon" style="background:${p.gradient};">3D</span>
          <span class="queue-info">
            <strong>${p.title[state.lang] || p.title.en}</strong>
            <span>${p.domain}</span>
          </span>
          <span class="circle-play-sm" style="background:rgba(255,255,255,0.16);" aria-hidden="true">▶</span>
        </button>`;
      })
      .join("");
  }

  document.querySelectorAll("[data-select-idx]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.heroIndex = Number(btn.dataset.selectIdx);
      saveState();
      renderHero();
      renderRail();
    })
  );
}

function renderHero() {
  const p = PROJECTS[state.heroIndex % PROJECTS.length];
  if (!p) return;

  document.getElementById("hero-art-layer").style.background = p.gradient;
  document.getElementById("hero-motif-svg").innerHTML = getMotifSvg(p.motif);
  document.getElementById("hero-domain-chip").textContent = p.domain;
  document.getElementById("hero-title").textContent = p.title[state.lang] || p.title.en;
  document.getElementById("hero-desc").textContent = p.desc[state.lang] || p.desc.en;
  document.getElementById("hero-tag-row").innerHTML = [p.accentBadge, ...p.stack.slice(0, 3)]
    .map((tg) => `<span class="hero-tag">${tg}</span>`)
    .join("");
  document.getElementById("hero-launch-btn").href = p.liveUrl;
  document.getElementById("hero-repo-btn").href = p.repoUrl;
  document.getElementById("hero-preview-btn").onclick = () => openProjectModal(p);

  syncAddressUrl(p);
}

function renderPosterGrid() {
  const grid = document.getElementById("poster-grid");
  if (!grid) return;

  const q = state.search.trim().toLowerCase();
  const filtered = PROJECTS.filter((p) => {
    const catOk = state.category === "all" || p.categories.includes(state.category);
    if (!catOk) return false;
    if (!q) return true;
    const hay = `${p.title[state.lang] || p.title.en} ${p.desc[state.lang] || p.desc.en} ${p.domain} ${p.stack.join(" ")}`.toLowerCase();
    return hay.includes(q);
  });

  const displayList = (filtered.length ? filtered : PROJECTS).slice(0, 4);
  grid.innerHTML = displayList
    .map((p, idx) => {
      const projIdx = PROJECTS.findIndex((x) => x.id === p.id);
      return `
      <article class="poster-card tile-reveal" style="--i:${6 + idx}; background:${p.gradient};" data-poster-idx="${projIdx}">
        <svg class="poster-card-motif" viewBox="0 0 280 220" aria-hidden="true">${getMotifSvg(p.motif)}</svg>
        <div class="poster-card-scrim"></div>

        <div class="poster-top">
          <a class="poster-more-btn" href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" title="GitHub Repository" onclick="event.stopPropagation()">•••</a>
        </div>

        <div class="poster-bottom">
          <div class="poster-text">
            <span class="poster-badge">${p.stack[0]}</span>
            <h3>${p.title[state.lang] || p.title.en}</h3>
            <p>${p.desc[state.lang] || p.desc.en}</p>
          </div>
          <button class="poster-play-btn" data-open-modal-idx="${projIdx}" title="Live 3D Preview" aria-label="Preview ${p.id}" onclick="event.stopPropagation()">▶</button>
        </div>
      </article>`;
    })
    .join("");

  grid.querySelectorAll("[data-poster-idx]").forEach((card) =>
    card.addEventListener("click", () => {
      state.heroIndex = Number(card.dataset.posterIdx);
      saveState();
      renderHero();
      renderRail();
    })
  );

  grid.querySelectorAll("[data-open-modal-idx]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const proj = PROJECTS[Number(btn.dataset.openModalIdx)];
      if (proj) openProjectModal(proj);
    })
  );
}

function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.title = t("metaTitle");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const val = t(el.dataset.i18n);
    if (typeof val === "string") el.textContent = val;
  });

  document.querySelectorAll("[data-vision]").forEach((el) => {
    const val = t(`vision.${el.dataset.vision}`);
    if (typeof val === "string") el.textContent = val;
  });

  document.querySelectorAll("[data-vision-placeholder]").forEach((el) => {
    const val = t(`vision.${el.dataset.visionPlaceholder}`);
    if (typeof val === "string") el.placeholder = val;
  });

  document.querySelectorAll("[data-i18n-tip]").forEach((el) => {
    const val = t(el.dataset.i18nTip);
    if (typeof val === "string") el.setAttribute("data-tip", val);
  });

  document.querySelectorAll(".lang-mini-btn").forEach((b) => b.classList.toggle("active", b.dataset.lang === state.lang));

  renderRail();
  renderHero();
  renderPosterGrid();
  if (lastWeatherPayload) renderWeatherData(lastWeatherPayload);
}

function applyTheme() {
  document.documentElement.setAttribute("data-vtheme", state.vtheme);
  const wp = document.getElementById("loft-wallpaper");
  if (wp) {
    if (state.customBg) {
      wp.style.backgroundImage = `url("${state.customBg}")`;
      wp.classList.add("active");
    } else {
      wp.style.backgroundImage = "none";
      wp.classList.remove("active");
    }
  }
  document.querySelectorAll("[data-set-vtheme]").forEach((b) => b.classList.toggle("active", b.dataset.setVtheme === state.vtheme));
}

// ==========================================================================
// GOOGLE-STYLE LIVE WEATHER WIDGET (Open-Meteo + Instant Fallback)
// ==========================================================================
function wmoCategory(code) {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 95) return "storm";
  if (code >= 51) return "rain";
  return "partly";
}

function googleWeatherSvg(kind, size = 26) {
  const s = `width="${size}" height="${size}" class="weather-svg-icon"`;
  if (kind === "clear") {
    return `<svg ${s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="7.5" fill="#FBBC04"/><g stroke="#FBBC04" stroke-width="2" stroke-linecap="round"><line x1="16" y1="3" x2="16" y2="6"/><line x1="16" y1="26" x2="16" y2="29"/><line x1="3" y1="16" x2="6" y2="16"/><line x1="26" y1="16" x2="29" y2="16"/><line x1="6.8" y1="6.8" x2="9" y2="9"/><line x1="23" y1="23" x2="25.2" y2="25.2"/><line x1="25.2" y1="6.8" x2="23" y2="9"/><line x1="9" y1="23" x2="6.8" y2="25.2"/></g></svg>`;
  }
  if (kind === "rain") {
    return `<svg ${s} viewBox="0 0 32 32"><path d="M9 20h14a4.5 4.5 0 0 0 .4-9A6.5 6.5 0 0 0 11 9.2 5 5 0 0 0 9 20z" fill="#E8EAED"/><path d="M11 23l-1.5 4M16 23l-1.5 4M21 23l-1.5 4" stroke="#4285F4" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  }
  if (kind === "storm") {
    return `<svg ${s} viewBox="0 0 32 32"><path d="M9 19h14a4.5 4.5 0 0 0 .4-9A6.5 6.5 0 0 0 11 8.2 5 5 0 0 0 9 19z" fill="#BDC1C6"/><polygon points="16,19 13,24 16,24 14.5,29 20,23 17,23" fill="#FBBC04"/></svg>`;
  }
  if (kind === "snow") {
    return `<svg ${s} viewBox="0 0 32 32"><path d="M9 19h14a4.5 4.5 0 0 0 .4-9A6.5 6.5 0 0 0 11 8.2 5 5 0 0 0 9 19z" fill="#E8EAED"/><circle cx="11" cy="24" r="1.5" fill="#8AB4F8"/><circle cx="16" cy="25.5" r="1.5" fill="#8AB4F8"/><circle cx="21" cy="24" r="1.5" fill="#8AB4F8"/></svg>`;
  }
  if (kind === "cloudy" || kind === "fog") {
    return `<svg ${s} viewBox="0 0 32 32"><path d="M8 22h16a5 5 0 0 0 .5-10A7 7 0 0 0 10.5 10.2 5.5 5.5 0 0 0 8 22z" fill="#F1F3F4"/></svg>`;
  }
  // partly cloudy (Google iconic sun behind white cloud)
  return `<svg ${s} viewBox="0 0 32 32"><circle cx="20.5" cy="11.5" r="5.5" fill="#FBBC04"/><path d="M8.5 23h13.8a4.2 4.2 0 0 0 .4-8.4A6 6 0 0 0 11 12.8 4.8 4.8 0 0 0 8.5 23z" fill="#FFFFFF"/></svg>`;
}

function renderWeatherData(data) {
  lastWeatherPayload = data;
  const dict = WEATHER_CONDITIONS[state.lang] || WEATHER_CONDITIONS.en;
  const kind = wmoCategory(data.code);

  document.getElementById("weather-icon-slot").innerHTML = googleWeatherSvg(kind, 26);
  document.getElementById("weather-temp").textContent = `${Math.round(data.temp)}°C`;
  document.getElementById("weather-cond").textContent = dict[kind] || dict.partly;
  document.getElementById("weather-hl").textContent = `H:${Math.round(data.high)}° L:${Math.round(data.low)}°`;
  document.getElementById("weather-hum").textContent = `💧 ${Math.round(data.hum)}%`;
  document.getElementById("weather-wind").textContent = `💨 ${Math.round(data.wind)} km/h`;

  const hourlyBox = document.getElementById("weather-hourly");
  if (hourlyBox && Array.isArray(data.hourly)) {
    hourlyBox.innerHTML = data.hourly
      .map(
        (h) => `<span class="hour-slot">${h.label} ${googleWeatherSvg(wmoCategory(h.code), 16)} <strong>${Math.round(h.temp)}°</strong></span>`
      )
      .join("");
  }

  const cityQuery = encodeURIComponent(data.label || "Chisinau");
  document.getElementById("google-weather-link").href = `https://www.google.com/search?q=weather+${cityQuery}`;
}

async function fetchLiveWeather() {
  const select = document.getElementById("weather-city-select");
  if (select && CITIES[state.cityKey]) select.value = state.cityKey;

  const target = state.customGeo || CITIES[state.cityKey] || CITIES.chisinau;
  const fb = FALLBACK_WEATHER[state.cityKey] || FALLBACK_WEATHER.chisinau;

  // Immediately render fallback/cached baseline so layout never flashes empty
  renderWeatherData({
    ...fb,
    label: target.name,
    hourly: [
      { label: "+3h", temp: fb.temp + 1, code: fb.code },
      { label: "+6h", temp: fb.temp - 1, code: fb.code },
      { label: "+9h", temp: fb.low + 1, code: fb.code }
    ]
  });

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${target.lat}&longitude=${target.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=2`;
    const res = await fetch(url);
    if (!res.ok) return;
    const json = await res.json();
    const cur = json.current || {};
    const daily = json.daily || {};
    const hourlyTimes = json.hourly?.time || [];
    const hourlyTemps = json.hourly?.temperature_2m || [];
    const hourlyCodes = json.hourly?.weather_code || [];

    const nowIso = cur.time || "";
    const curIdx = Math.max(0, hourlyTimes.findIndex((tm) => tm >= nowIso));
    const slots = [3, 6, 9].map((offset) => {
      const idx = Math.min(hourlyTemps.length - 1, curIdx + offset);
      const hr = (hourlyTimes[idx] || "").slice(11, 16) || `+${offset}h`;
      return { label: hr, temp: hourlyTemps[idx] ?? fb.temp, code: hourlyCodes[idx] ?? cur.weather_code ?? 1 };
    });

    renderWeatherData({
      temp: cur.temperature_2m ?? fb.temp,
      high: daily.temperature_2m_max?.[0] ?? fb.high,
      low: daily.temperature_2m_min?.[0] ?? fb.low,
      hum: cur.relative_humidity_2m ?? fb.hum,
      wind: cur.wind_speed_10m ?? fb.wind,
      code: cur.weather_code ?? fb.code,
      label: target.name,
      hourly: slots
    });
  } catch {
    // Keep graceful fallback cleanly with zero console spam
  }
}

// ==========================================================================
// MODALS, ADDRESS BAR ROUTING & EVENTS
// ==========================================================================
function openProjectModal(proj) {
  document.getElementById("v-modal-domain").textContent = proj.domain;
  document.getElementById("v-modal-title").textContent = proj.title[state.lang] || proj.title.en;
  document.getElementById("v-modal-desc").textContent = proj.desc[state.lang] || proj.desc.en;
  document.getElementById("v-modal-stack").innerHTML = proj.stack
    .map((s) => `<span class="poster-badge" style="margin:0; font-size:0.7rem;">${s}</span>`)
    .join("");
  document.getElementById("v-modal-live").href = proj.liveUrl;
  document.getElementById("v-modal-github").href = proj.repoUrl;
  document.getElementById("v-modal-iframe").src = proj.id === "spatialos" ? "about:blank" : proj.liveUrl;
  document.getElementById("v-modal-backdrop").classList.add("open");
}

function closeProjectModal() {
  document.getElementById("v-modal-backdrop").classList.remove("open");
  document.getElementById("v-modal-iframe").src = "about:blank";
}

function setDrawerOpen(open) {
  document.getElementById("v-drawer").classList.toggle("open", open);
  document.getElementById("v-drawer-backdrop").classList.toggle("open", open);
}

function bindEvents() {
  // Address bar submit routing
  document.getElementById("address-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = (document.getElementById("address-input").value || "").trim().toLowerCase();
    if (!raw || raw === "/" || raw === "home") {
      runTilePreloadAnimation();
      return;
    }
    if (raw.includes("blog")) {
      window.location.href = "blog/index.html";
      return;
    }
    if (raw.includes("service") || raw.includes("archive")) {
      window.location.href = "services.html";
      return;
    }
    if (raw.includes("v-2") || raw.includes("v2")) {
      window.open("https://v-2.idominiqe.com/", "_blank", "noopener,noreferrer");
      return;
    }
    const cleanHash = raw.replace(/^https?:\/\/(?:portfolio\.)?idominiqe\.com\/?#?/, "");
    const match = PROJECTS.find(
      (p) => p.id.toLowerCase().includes(cleanHash) || p.domain.toLowerCase().includes(cleanHash) || p.title.en.toLowerCase().includes(cleanHash)
    );
    if (match) {
      state.heroIndex = PROJECTS.findIndex((x) => x.id === match.id);
      saveState();
      renderHero();
      renderRail();
      runTilePreloadAnimation();
      openProjectModal(match);
    } else {
      showToast(t("cmd.noResults"));
      syncAddressUrl(PROJECTS[state.heroIndex]);
    }
  });

  document.getElementById("addr-replay")?.addEventListener("click", runTilePreloadAnimation);
  document.getElementById("addr-copy")?.addEventListener("click", async () => {
    const url = document.getElementById("address-input")?.value || "https://portfolio.idominiqe.com/";
    await navigator.clipboard?.writeText(url);
    showToast(t("toast.urlCopied"));
  });

  const stepHero = (delta) => {
    state.heroIndex = (state.heroIndex + delta + PROJECTS.length) % PROJECTS.length;
    saveState();
    renderHero();
    renderRail();
  };
  document.getElementById("addr-prev")?.addEventListener("click", () => stepHero(-1));
  document.getElementById("addr-next")?.addEventListener("click", () => stepHero(1));
  document.getElementById("hero-prev")?.addEventListener("click", () => stepHero(-1));
  document.getElementById("hero-next")?.addEventListener("click", () => stepHero(1));

  // Category Tabs
  document.querySelectorAll("[data-tab-cat]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.category = btn.dataset.tabCat;
      document.querySelectorAll("[data-tab-cat]").forEach((b) => b.classList.toggle("active", b === btn));
      renderPosterGrid();
      runTilePreloadAnimation();
    })
  );

  // Search filter
  document.getElementById("vision-search")?.addEventListener("input", (e) => {
    state.search = e.target.value;
    renderPosterGrid();
  });

  // Sort rail toggle
  document.querySelector(".rail-sort")?.addEventListener("click", () => {
    state.sortReverse = !state.sortReverse;
    renderRail();
  });

  // Languages
  document.querySelectorAll(".lang-mini-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      saveState();
      applyLanguage();
    })
  );

  // Profile popover
  const pop = document.getElementById("profile-popover");
  document.getElementById("profile-chip-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    pop?.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (pop && !pop.contains(e.target)) pop.classList.remove("open");
  });

  // Modals & Drawer
  document.getElementById("v-modal-close")?.addEventListener("click", closeProjectModal);
  document.getElementById("v-modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "v-modal-backdrop") closeProjectModal();
  });

  document.getElementById("open-theme-drawer")?.addEventListener("click", () => setDrawerOpen(true));
  document.getElementById("dock-theme-btn")?.addEventListener("click", () => setDrawerOpen(true));
  document.getElementById("v-drawer-close")?.addEventListener("click", () => setDrawerOpen(false));
  document.getElementById("v-drawer-backdrop")?.addEventListener("click", () => setDrawerOpen(false));

  document.querySelectorAll("[data-set-vtheme]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.vtheme = btn.dataset.setVtheme;
      saveState();
      applyTheme();
    })
  );

  document.getElementById("v-bg-apply")?.addEventListener("click", () => {
    const val = document.getElementById("v-bg-url")?.value.trim();
    if (!val) return;
    state.customBg = val;
    saveState();
    applyTheme();
    showToast(t("toast.bgApplied"));
  });

  document.getElementById("v-bg-file")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.customBg = String(reader.result);
      saveState();
      applyTheme();
      showToast(t("toast.bgApplied"));
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("v-bg-reset")?.addEventListener("click", () => {
    state.customBg = "";
    saveState();
    applyTheme();
    showToast(t("toast.bgReset"));
  });

  // Weather Controls
  document.getElementById("weather-city-select")?.addEventListener("change", (e) => {
    state.cityKey = e.target.value;
    state.customGeo = null;
    saveState();
    fetchLiveWeather();
  });

  document.getElementById("weather-geo-btn")?.addEventListener("click", () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.customGeo = {
          name: "My Location",
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4))
        };
        saveState();
        fetchLiveWeather();
      },
      () => showToast("Geolocation unavailable — using city forecast")
    );
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeProjectModal();
      setDrawerOpen(false);
      pop?.classList.remove("open");
    } else if (e.key === "ArrowLeft" && document.activeElement.tagName !== "INPUT") {
      stepHero(-1);
    } else if (e.key === "ArrowRight" && document.activeElement.tagName !== "INPUT") {
      stepHero(1);
    }
  });
}

// ==========================================================================
// BOOTSTRAP
// ==========================================================================
applyTheme();
renderProfilePop();
applyLanguage();
bindEvents();
fetchLiveWeather();
requestAnimationFrame(() => runTilePreloadAnimation());
