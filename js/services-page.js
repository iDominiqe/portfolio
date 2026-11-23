// ==========================================================================
// iDominiqe Spatial OS — Scrollable Services, Configurator & Full GitHub Archive
// ==========================================================================

import { PROJECTS, SOCIALS, SERVICE_MODULES } from "./projects-data.js";
import { SUPPORTED_LANGS, TRANSLATIONS } from "./i18n.js";
import {
  smoothScrollToElement,
  updateOmniboxUrl,
  getCurrentOmniboxUrl,
  initScrollProgressBar
} from "./smooth-scroll.js";

const STORAGE_KEY = "idominiqe_vision_v3";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return { lang: p.lang || "en", category: "all", search: "", selectedServices: ["glass", "webgl", "parallax", "i18n"] };
    }
  } catch {
    // ignore
  }
  const bLang = (navigator.language || "en").slice(0, 2).toLowerCase();
  return { lang: SUPPORTED_LANGS.includes(bLang) ? bLang : "en", category: "all", search: "", selectedServices: ["glass", "webgl", "parallax", "i18n"] };
}

const state = loadState();

function t(path) {
  const dict = TRANSLATIONS[state.lang] || TRANSLATIONS.en;
  return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict) ?? path;
}

function showToast(msg) {
  const el = document.getElementById("toast-pill");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("show"), 2500);
}

function renderArchiveGrid() {
  const grid = document.getElementById("services-portfolio-grid");
  if (!grid) return;
  const q = state.search.trim().toLowerCase();
  const list = PROJECTS.filter((p) => {
    const catOk = state.category === "all" || p.categories.includes(state.category);
    if (!catOk) return false;
    if (!q) return true;
    const hay = `${p.title[state.lang] || p.title.en} ${p.desc[state.lang] || p.desc.en} ${p.domain} ${p.stack.join(" ")}`.toLowerCase();
    return hay.includes(q);
  });

  if (!list.length) {
    grid.innerHTML = `<div class="bento-panel liquid-glass" style="grid-column:1/-1; text-align:center;">${t("cmd.noResults")}</div>`;
    return;
  }

  grid.innerHTML = list
    .map(
      (p) => `
      <article class="project-card liquid-glass" data-project-id="${p.id}">
        <div>
          <div class="project-preview-box" style="background:${p.gradient}">
            <svg class="project-wireframe" viewBox="0 0 320 160" preserveAspectRatio="none">
              <circle cx="265" cy="45" r="56" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.5"/>
              <rect x="195" y="65" width="90" height="90" rx="22" transform="rotate(18 240 110)" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
            </svg>
            <div class="project-preview-top">
              <span class="project-cat-badge">${p.accentBadge}</span>
              <span class="project-domain-chip">${p.domain}</span>
            </div>
            <div style="font-family:var(--font-mono); font-size:0.72rem; color:rgba(255,255,255,0.85);">● GitHub Live</div>
          </div>
          <div class="project-body" style="margin-top:13px;">
            <h3>${p.title[state.lang] || p.title.en}</h3>
            <p>${p.desc[state.lang] || p.desc.en}</p>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div class="project-meta-row">${p.stack.map((s) => `<span class="tech-pill">${s}</span>`).join("")}</div>
          <div class="project-footer">
            <span class="project-langs">${p.langs}</span>
            <div class="project-actions">
              <a class="card-circle-btn ghost" href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" title="GitHub" onclick="event.stopPropagation()">&lt;/&gt;</a>
              <a class="card-circle-btn ghost" href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" title="Launch" onclick="event.stopPropagation()">↗</a>
              <button class="card-circle-btn" title="Preview" aria-label="Preview ${p.id}">▶</button>
            </div>
          </div>
        </div>
      </article>`
    )
    .join("");

  grid.querySelectorAll(".project-card").forEach((card) =>
    card.addEventListener("click", () => {
      const proj = PROJECTS.find((item) => item.id === card.dataset.projectId);
      if (proj) openModal(proj);
    })
  );
}

function renderServicesConfigurator() {
  const grid = document.getElementById("service-toggles-grid");
  if (!grid) return;

  grid.innerHTML = SERVICE_MODULES.map((m) => {
    const isOn = state.selectedServices.includes(m.id);
    return `
      <div class="service-toggle-card liquid-glass ${isOn ? "is-on" : ""}" data-service-id="${m.id}" role="switch" aria-checked="${isOn}" tabindex="0">
        <div class="service-top">
          <div class="service-icon-box">${m.icon}</div>
          <div class="ios-switch" aria-hidden="true"></div>
        </div>
        <div>
          <h4>${m.title[state.lang] || m.title.en}</h4>
          <p>${m.desc[state.lang] || m.desc.en}</p>
        </div>
      </div>`;
  }).join("");

  grid.querySelectorAll("[data-service-id]").forEach((card) => {
    const toggle = () => {
      const id = card.dataset.serviceId;
      const idx = state.selectedServices.indexOf(id);
      if (idx >= 0) {
        if (state.selectedServices.length > 1) state.selectedServices.splice(idx, 1);
      } else {
        state.selectedServices.push(id);
      }
      renderServicesConfigurator();
    };
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  const active = SERVICE_MODULES.filter((m) => state.selectedServices.includes(m.id));
  const totalDays = active.reduce((s, m) => s + m.days, 0);
  document.getElementById("summary-count").textContent = `${active.length} / ${SERVICE_MODULES.length}`;
  document.getElementById("summary-days").textContent = `${totalDays} ${t("serviceSummary.weeks")}`;
  document.getElementById("summary-tier-badge").textContent =
    active.length >= 5 ? t("serviceSummary.tierFlagship") : active.length >= 3 ? t("serviceSummary.tierPro") : t("serviceSummary.tierBase");
  document.getElementById("brief-preview").textContent =
    `iDominiqe Spatial Studio Brief [${state.lang.toUpperCase()}]\nModules:\n${active.map((m) => `• ${m.title[state.lang] || m.title.en}`).join("\n")}\nEst. Delivery: ${totalDays} ${t("serviceSummary.weeks")}`;
}

function renderSocials() {
  const box = document.getElementById("connect-grid");
  if (!box) return;
  box.innerHTML = SOCIALS.map(
    (s) => `
    <a class="connect-card liquid-glass" href="${s.url}" target="_blank" rel="noopener noreferrer">
      <div class="connect-left">
        <div class="social-app-icon" style="background:${s.bg}; width:42px; height:42px;">${s.svg}</div>
        <div style="min-width:0;">
          <h4>${s.name}</h4>
          <p>${s.handle}</p>
        </div>
      </div>
      <span class="card-circle-btn ghost" aria-hidden="true">↗</span>
    </a>`
  ).join("");
}

function openModal(proj) {
  document.getElementById("modal-project-domain").textContent = proj.domain;
  document.getElementById("modal-project-title").textContent = proj.title[state.lang] || proj.title.en;
  document.getElementById("modal-project-desc").textContent = proj.desc[state.lang] || proj.desc.en;
  document.getElementById("modal-project-stack").innerHTML = proj.stack.map((s) => `<span class="tech-pill">${s}</span>`).join("");
  document.getElementById("modal-open-live").href = proj.liveUrl;
  document.getElementById("modal-open-github").href = proj.repoUrl;
  document.getElementById("modal-iframe").src = proj.id === "spatialos" ? "about:blank" : proj.liveUrl;
  document.getElementById("project-modal-backdrop").classList.add("open");
}

function closeModal() {
  document.getElementById("project-modal-backdrop").classList.remove("open");
  document.getElementById("modal-iframe").src = "about:blank";
}

function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const val = t(el.dataset.i18n);
    if (typeof val === "string") el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const val = t(el.dataset.i18nPlaceholder);
    if (typeof val === "string") el.placeholder = val;
  });
  document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("active", b.dataset.lang === state.lang));
  renderArchiveGrid();
  renderServicesConfigurator();
}

function bindEvents() {
  document.querySelectorAll(".lang-btn").forEach((b) =>
    b.addEventListener("click", () => {
      state.lang = b.dataset.lang;
      try {
        const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, lang: state.lang }));
      } catch {}
      applyLanguage();
    })
  );

  document.querySelectorAll("#services-cat-tabs [data-cat]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.category = btn.dataset.cat;
      document.querySelectorAll("#services-cat-tabs [data-cat]").forEach((b) => b.classList.toggle("active", b === btn));
      updateOmniboxUrl(state.category === "all" ? "/services.html" : `/services.html#${state.category}`);
      renderArchiveGrid();
    })
  );

  document.getElementById("services-search")?.addEventListener("input", (e) => {
    state.search = e.target.value;
    renderArchiveGrid();
  });

  document.querySelectorAll("[data-scroll-target]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.scrollTarget);
      if (target) {
        smoothScrollToElement(target, 96);
        updateOmniboxUrl(`/services.html#${btn.dataset.scrollTarget}`);
      }
    })
  );

  document.getElementById("scroll-top-btn")?.addEventListener("click", () => smoothScrollToElement(document.getElementById("main-shell"), 92));
  document.getElementById("copy-domain-btn")?.addEventListener("click", async () => {
    await navigator.clipboard?.writeText(getCurrentOmniboxUrl());
    showToast(t("toast.urlCopied"));
  });
  document.getElementById("copy-brief-btn")?.addEventListener("click", async () => {
    await navigator.clipboard?.writeText(document.getElementById("brief-preview")?.textContent || "");
    showToast(t("toast.briefCopied"));
  });

  document.getElementById("close-project-modal")?.addEventListener("click", closeModal);
  document.getElementById("modal-close-btn")?.addEventListener("click", closeModal);
  document.getElementById("project-modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "project-modal-backdrop") closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

initScrollProgressBar();
renderSocials();
applyLanguage();
bindEvents();
updateOmniboxUrl("/services.html");
