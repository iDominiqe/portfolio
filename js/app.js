// ==========================================================================
// iDominiqe Spatial OS — Interactive Liquid Glass Engine
// ==========================================================================

import { SUPPORTED_LANGS, TRANSLATIONS } from "./i18n.js";
import { BG_ANIMATIONS, initBackgroundAnimations } from "./bg-animations.js";
import { BLOG_UI, ARTICLES } from "./blog-data.js";
import {
  smoothScrollToElement,
  updateOmniboxUrl,
  getCurrentOmniboxUrl,
  initScrollProgressBar,
  bindSmoothAnchorLinks
} from "./smooth-scroll.js";

const PALETTES = [
  { id: "aurora", name: "Aurora", swatch: "linear-gradient(135deg,#8b5cf6,#38bdf8,#f472b6)" },
  { id: "vision", name: "Vision", swatch: "linear-gradient(135deg,#e5dfd5,#94a3b8,#fbbf24)" },
  { id: "cyber", name: "Cyber", swatch: "linear-gradient(135deg,#f43f5e,#fb923c,#38bdf8)" },
  { id: "emerald", name: "Solar", swatch: "linear-gradient(135deg,#10b981,#22d3ee,#facc15)" },
  { id: "sunset", name: "Sunset", swatch: "linear-gradient(135deg,#fb7185,#fb923c,#c084fc)" },
  { id: "arctic", name: "Arctic", swatch: "linear-gradient(135deg,#60a5fa,#67e8f9,#818cf8)" }
];

const SOCIALS = [
  {
    id: "discord",
    name: "Discord",
    handle: "discord.gg/f5wGW62Jsy",
    url: "https://discord.gg/f5wGW62Jsy",
    bg: "linear-gradient(135deg,#5865F2,#404EED)",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z"/></svg>`
  },
  {
    id: "telegram",
    name: "Telegram",
    handle: "@idominiqe",
    url: "https://t.me/idominiqe",
    bg: "linear-gradient(135deg,#2AABEE,#229ED9)",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`
  },
  {
    id: "instagram",
    name: "Instagram",
    handle: "@idominiqe",
    url: "https://www.instagram.com/idominiqe/",
    bg: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#bc1888)",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "@idominiqe",
    url: "https://www.youtube.com/@idominiqe",
    bg: "linear-gradient(135deg,#FF0000,#CC0000)",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z"/></svg>`
  },
  {
    id: "facebook",
    name: "Facebook",
    handle: "/idominiqe",
    url: "https://www.facebook.com/idominiqe/",
    bg: "linear-gradient(135deg,#1877F2,#0C5DC7)",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
  },
  {
    id: "github",
    name: "GitHub",
    handle: "github.com/iDominiqe",
    url: "https://github.com/iDominiqe",
    bg: "linear-gradient(135deg,#334155,#0f172a)",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`
  }
];

const PROJECTS = [
  {
    id: "smartcity",
    category: "ecosystems",
    categories: ["all", "webgl", "ecosystems"],
    domain: "smartcity.idominiqe.com",
    liveUrl: "https://smartcity.idominiqe.com/",
    repoUrl: "https://github.com/iDominiqe/smartcity",
    langs: "EN · FR · BG · RO",
    stack: ["Three.js", "WebGL", "ES6 Modules", "ROI Engine"],
    gradient: "linear-gradient(135deg, #064e3b 0%, #0284c7 52%, #0f172a 100%)",
    accentBadge: "3D Solar Smart City",
    title: {
      en: "Smart-City-Led — 3D Solar City & EV Ecosystem",
      ro: "Smart-City-Led — Oraș Solar 3D & Ecosistem EV",
      fr: "Smart-City-Led — Ville Solaire 3D & Écosystème EV",
      bg: "Smart-City-Led — 3D Соларен Град & EV Екосистема",
      ru: "Smart-City-Led — 3D Солнечный Город и EV-Экосистема"
    },
    desc: {
      en: "Scroll-driven 3D city transitioning from daylight photovoltaic farms and solar EV fast-charging into an illuminated smart-home night ecosystem with live ROI calculations.",
      ro: "Scenă 3D interactivă controlată prin scroll: de la ferme fotovoltaice de zi și stații EV solare până la rețea rezidențială de noapte cu calculator ROI.",
      fr: "Expérience 3D pilotée au défilement : fermes photovoltaïques, recharge EV solaire et maison intelligente nocturne avec calculateur ROI intégré.",
      bg: "Интерактивен 3D град със скрол анимация: от дневни фотоволтаични паркове и EV зарядни станции до нощна умна мрежа с ROI калкулатор.",
      ru: "Интерактивный 3D-город со скролл-сценарием: от дневных солнечных ферм и зарядок EV до ночного умного дома с калькулятором окупаемости ROI."
    }
  },
  {
    id: "huwart",
    category: "ecosystems",
    categories: ["all", "webgl", "ecosystems"],
    domain: "smartcity.idominiqe.com",
    liveUrl: "https://smartcity.idominiqe.com/",
    repoUrl: "https://github.com/iDominiqe/smartcity",
    langs: "EN · FR · BG · RO",
    stack: ["Three.js", "Wind Physics", "Biophilic 3D", "Weather FX"],
    gradient: "linear-gradient(135deg, #047857 0%, #eab308 55%, #1e293b 100%)",
    accentBadge: "Biophilic 3D Map",
    title: {
      en: "NEO® HUWART — Solar & Vegetated Parking 3D",
      ro: "NEO® HUWART — Copertine Solare & Parcări Verzi 3D",
      fr: "NEO® HUWART — Ombrières Solaires & Végétalisées 3D",
      bg: "NEO® HUWART — Соларни & Озеленени Паркинги 3D",
      ru: "NEO® HUWART — 3D Супермаркет и Зелёный Солнечный Паркинг"
    },
    desc: {
      en: "3D architectural twin featuring a glazed supermarket, vegetated solar EV parking canopies, wind turbine with blinking night aviation beacons, and dynamic cloud physics.",
      ro: "Geamăn digital 3D cu supermarket vitrat, parcări solare cu vegetație, turbină eoliană cu balize nocturne și simulare dinamică a vremii.",
      fr: "Jumeau 3D intégrant un supermarché vitré, des ombrières solaires végétalisées, une éolienne nocturne et une simulation météo réaliste.",
      bg: "3D визуализация на супермаркет със стъклени витрини, озеленени соларни навеси, вятърна турбина с нощни маяци и динамични облаци.",
      ru: "3D-карта супермаркета с зеркальными витринами, зелёными солнечными навесами для зарядки авто, ветрогенератором с ночными маяками и физикой облаков."
    }
  },
  {
    id: "loclim",
    category: "embeds",
    categories: ["all", "webgl", "embeds"],
    domain: "smart-city-led.com/loclimaccueil",
    liveUrl: "https://www.smart-city-led.com/loclimaccueil",
    repoUrl: "https://github.com/iDominiqe/smartcity",
    langs: "FR · EN",
    stack: ["Three.js", "Wix Embed", "360° Studio", "Airflow Sim"],
    gradient: "linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #312e81 100%)",
    accentBadge: "360° Product Twin",
    title: {
      en: "LOCLIM / NEO Clim® — 360° 3D HVAC Studio",
      ro: "LOCLIM / NEO Clim® — Studio 3D Climatizare 360°",
      fr: "LOCLIM / NEO Clim® — Studio Climatisation 3D 360°",
      bg: "LOCLIM / NEO Clim® — 360° 3D Климатичен Симулатор",
      ru: "LOCLIM / NEO Clim® — 360° 3D Симулятор Кондиционера"
    },
    desc: {
      en: "Real-time 360° interactive 3D air conditioner twin with Cool, Heat, Dry, and Fan airflow particle modes, packaged as a standalone responsive Wix iframe embed.",
      ro: "Model 3D 360° în timp real pentru climatizare portabilă cu moduri Cool, Heat, Dry și Fan, integrat direct ca widget responsive în Wix.",
      fr: "Démonstrateur 3D temps réel 360° avec modes Cool, Heat, Dry et Fan, encapsulé en widget autonome responsive pour Wix.",
      bg: "Интерактивен 360° 3D климатик в реално време с режими Cool, Heat, Dry и Fan, адаптиран за директно вграждане в Wix.",
      ru: "Интерактивная 3D-визуализация кондиционера 360° в реальном времени (Cool, Heat, Dry, Fan) с адаптивным встраиванием для сайта на Wix."
    }
  },
  {
    id: "blaze",
    category: "cyberpunk",
    categories: ["all", "webgl", "cyberpunk"],
    domain: "blaze.idominiqe.com",
    liveUrl: "https://blaze.idominiqe.com/",
    repoUrl: "https://github.com/iDominiqe/blaze-re41-hud",
    langs: "EN · Cyber HUD",
    stack: ["Three.js", "Preserve-3D", "Web Audio Synth", "HUD"],
    gradient: "linear-gradient(135deg, #be123c 0%, #f97316 48%, #09090b 100%)",
    accentBadge: "Tactical 3D HUD",
    title: {
      en: "BLAZE // RE41 — Tactical 3D Cyberpunk HUD",
      ro: "BLAZE // RE41 — Interfață HUD Cyberpunk 3D",
      fr: "BLAZE // RE41 — HUD Tactique Cyberpunk 3D",
      bg: "BLAZE // RE41 — Тактически 3D Киберпънк HUD",
      ru: "BLAZE // RE41 — Тактический 3D Киберпанк HUD"
    },
    desc: {
      en: "Multi-depth 3D HUD with 28 rotating Originium crystal shards, damped-spring parallax, procedural Web Audio dark-synth BGM, and a 3D Dimensional Link Portal.",
      ro: "Interfață tactică 3D cu cristale WebGL, paralaxă cu arc amortizat, sintetizator audio procedural și portal dimensional pentru rețele sociale.",
      fr: "HUD tactique multi-profondeur avec cristaux WebGL, parallaxe à ressort amorti, synthétiseur Web Audio et portail de liens 3D.",
      bg: "Многопластов 3D HUD с въртящи се WebGL кристали, пружинен паралакс, процедурно Web Audio аудио и 3D социален портал.",
      ru: "Многослойный 3D-интерфейс с 28 кристаллами на WebGL, пружинным параллаксом, процедурным Web Audio синтезатором и 3D-порталом соцсетей."
    }
  },
  {
    id: "cyberofx",
    category: "cyberpunk",
    categories: ["all", "webgl", "cyberpunk"],
    domain: "cyber.idominiqe.com",
    liveUrl: "https://cyber.idominiqe.com/",
    repoUrl: "https://github.com/iDominiqe/cyber-of-x-metaverse",
    langs: "EN · RU",
    stack: ["WebGL", "Custom Cursor", "Overdrive FX", "Spatial"],
    gradient: "linear-gradient(135deg, #4338ca 0%, #ec4899 52%, #090d16 100%)",
    accentBadge: "Metaverse Gateway",
    title: {
      en: "CYBER OF X — WebGL Metaverse Portal",
      ro: "CYBER OF X — Portal Metavers WebGL",
      fr: "CYBER OF X — Portail Métavers WebGL",
      bg: "CYBER OF X — WebGL Метавселена Портал",
      ru: "CYBER OF X — 3D WebGL Портал Метавселенной"
    },
    desc: {
      en: "Next-dimension gaming portal featuring neural boot telemetry, magnetic custom cursor, overdrive visual mode, and responsive mobile/tablet controls.",
      ro: "Portal gaming futurist cu secvență de pornire neurală, cursor magnetic personalizat, mod overdrive și suport complet mobil.",
      fr: "Portail gaming nouvelle génération avec chargement neural, curseur magnétique, mode overdrive et adaptation mobile complète.",
      bg: "Футуристичен гейминг портал с неврален лоудър, магнитен курсор, overdrive режим и пълна мобилна адаптация.",
      ru: "Футуристичный игровой портал с нейронной загрузкой, магнитным курсором, режимом Overdrive и адаптацией под ПК, планшет и телефон."
    }
  },
  {
    id: "spatialos",
    category: "embeds",
    categories: ["all", "embeds", "webgl"],
    domain: "idominiqe.com",
    liveUrl: "https://idominiqe.com/",
    repoUrl: "https://github.com/iDominiqe/portfolio",
    langs: "EN · RO · FR · BG · RU",
    stack: ["Liquid Glass", "6 Palettes", "Parallax 3D", "Cloudflare"],
    gradient: "linear-gradient(135deg, #7c3aed 0%, #0ea5e9 50%, #f472b6 100%)",
    accentBadge: "Spatial Glass OS",
    title: {
      en: "iDominiqe Spatial OS — Liquid Glass Studio",
      ro: "iDominiqe Spatial OS — Studio Liquid Glass",
      fr: "iDominiqe Spatial OS — Studio Liquid Glass",
      bg: "iDominiqe Spatial OS — Liquid Glass Студио",
      ru: "iDominiqe Spatial OS — Liquid Glass Портфолио"
    },
    desc: {
      en: "Signature spatial glass portfolio featuring real-time mouse caustics, 3D floating shards, 6 color themes, custom background uploader, and 5 instant languages.",
      ro: "Portofoliu Liquid Glass cu reflexii dinamice după mouse, elemente 3D plutitoare, 6 palete cromatice, fundal personalizabil și 5 limbi instant.",
      fr: "Portfolio Liquid Glass avec caustiques dynamiques, éclats 3D flottants, 6 palettes, import d'arrière-plan et 5 langues natives.",
      bg: "Liquid Glass портфолио с динамични отблясъци от мишката, плаващи 3D елементи, 6 палитри, собствен фон и 5 езика.",
      ru: "Флагманское портфолио в стиле Liquid Glass с бликами от мыши, парящим 3D-параллаксом, 6 палитрами, загрузкой своего фона и 5 языками."
    }
  }
];

const SERVICE_MODULES = [
  {
    id: "glass",
    days: 3,
    defaultOn: true,
    icon: "💎",
    title: {
      en: "Liquid Glass Spatial UI",
      ro: "Interfață Spatial Liquid Glass",
      fr: "Interface Spatiale Liquid Glass",
      bg: "Liquid Glass Пространствен UI",
      ru: "Дизайн Liquid Glass и освещение"
    },
    desc: {
      en: "Frosted refraction, specular mouse highlights, palettes & dark/light/prism modes.",
      ro: "Efecte de sticlă mată, reflexii după cursor, palete și moduri de iluminare.",
      fr: "Verre dépoli, reflets dynamiques, palettes et modes sombre/clair/prisme.",
      bg: "Матирано стъкло, отблясъци от мишката, палитри и режими на осветление.",
      ru: "Матовое стекло, блики от курсора, палитры тем и переключатель освещения."
    }
  },
  {
    id: "webgl",
    days: 5,
    defaultOn: true,
    icon: "🧊",
    title: {
      en: "Interactive 3D WebGL Scene",
      ro: "Scenă 3D WebGL Interactivă",
      fr: "Scène 3D WebGL Interactive",
      bg: "Интерактивна 3D WebGL Сцена",
      ru: "Интерактивная 3D-сцена (Three.js)"
    },
    desc: {
      en: "Custom Three.js 3D models, camera choreography, lighting & 60 FPS optimization.",
      ro: "Modele 3D Three.js, coregrafie de cameră, lumini și optimizare 60 FPS.",
      fr: "Modèles 3D Three.js sur mesure, caméras fluides et rendu 60 FPS.",
      bg: "Персонализирани 3D модели в Three.js, осветление и 60 FPS производителност.",
      ru: "3D-модели и сцены на Three.js, плавная камера и оптимизация под 60 FPS."
    }
  },
  {
    id: "parallax",
    days: 2,
    defaultOn: true,
    icon: "✨",
    title: {
      en: "3D Parallax & Magnetic Cursor",
      ro: "Paralaxă 3D & Cursor Magnetic",
      fr: "Parallaxe 3D & Curseur Magnétique",
      bg: "3D Паралакс & Магнитен Курсор",
      ru: "3D-параллакс и эффект мышки"
    },
    desc: {
      en: "Damped-spring depth layers reacting smoothly to pointer motion and scroll.",
      ro: "Straturi 3D cu reacție fluidă la mișcarea mouse-ului și scroll.",
      fr: "Couches de profondeur à ressort amorti suivant le pointeur et le scroll.",
      bg: "Многослойни 3D елементи, реагиращи плавно на мишката и скрола.",
      ru: "Пружинный многослойный 3D-параллакс, реагирующий на курсор и прокрутку."
    }
  },
  {
    id: "i18n",
    days: 2,
    defaultOn: true,
    icon: "🌍",
    title: {
      en: "Multi-Language Engine",
      ro: "Motor Multilingv Nativ",
      fr: "Moteur Multilingue Natif",
      bg: "Многоезична Система",
      ru: "Мультиязычность (EN / RO / FR / RU / BG)"
    },
    desc: {
      en: "Instant client-side switching for EN, RO, FR, RU, BG with localized SEO metadata.",
      ro: "Schimbare instantă EN, RO, FR, RU, BG fără reîncărcarea paginii.",
      fr: "Changement instantané EN, RO, FR, RU, BG sans rechargement.",
      bg: "Мигновена смяна на EN, RO, FR, RU, BG без презареждане.",
      ru: "Мгновенное переключение языков без перезагрузки и сохранение выбора."
    }
  },
  {
    id: "cloudflare",
    days: 1,
    defaultOn: false,
    icon: "☁️",
    title: {
      en: "Cloudflare SSL & Domain Setup",
      ro: "Cloudflare SSL & Domeniu Custom",
      fr: "Cloudflare SSL & Domaine",
      bg: "Cloudflare SSL & Домейн",
      ru: "Настройка домена, GitHub и Cloudflare"
    },
    desc: {
      en: "Full DNS routing, HTTPS edge certificates, caching & zero-cost static hosting.",
      ro: "Configurare DNS completă, certificate HTTPS, cache CDN și găzduire statică.",
      fr: "Routage DNS complet, HTTPS Full, cache mondial et déploiement GitHub Pages.",
      bg: "Пълна DNS настройка, HTTPS сертификати и бързо зареждане през Cloudflare.",
      ru: "Привязка домена на Cloudflare, Full HTTPS, кэш и авто-деплой с GitHub."
    }
  },
  {
    id: "embed",
    days: 2,
    defaultOn: false,
    icon: "📱",
    title: {
      en: "Mobile Adaptive & Wix Embed",
      ro: "Adaptiv Mobil & Widget Wix",
      fr: "Responsive Mobile & Intégration Wix",
      bg: "Мобилна Версия & Wix Вграждане",
      ru: "Адаптив под телефоны и виджет для Wix"
    },
    desc: {
      en: "Pixel-tested layout for desktop, tablet, smartphones, or iframe integration.",
      ro: "Optimizat pentru PC, tabletă și telefon sau integrare ca bloc în Wix.",
      fr: "Interface testée sur desktop, tablette, mobile ou intégrable sur Wix.",
      bg: "Оптимизация за компютър, таблет и телефон или вграждане в Wix.",
      ru: "Полная адаптация под ПК, планшет и смартфон или экспорт блока для Wix."
    }
  }
];

const WALLPAPER_PRESETS = {
  mesh: "",
  "spatial-loft":
    "url('data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2c2a29"/><stop offset="50%" stop-color="#4e4841"/><stop offset="100%" stop-color="#1e222b"/></linearGradient><radialGradient id="sun" cx="65%" cy="28%" r="48%"><stop offset="0%" stop-color="#f7e8d4" stop-opacity="0.72"/><stop offset="100%" stop-color="#f7e8d4" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="900" fill="url(#g1)"/><rect width="1600" height="900" fill="url(#sun)"/><rect x="140" y="120" width="520" height="660" rx="28" fill="#ffffff" fill-opacity="0.06"/><rect x="740" y="90" width="720" height="720" rx="36" fill="#000000" fill-opacity="0.16"/><circle cx="1160" cy="310" r="210" fill="#93c5fd" fill-opacity="0.16"/></svg>`
    ) +
    "')",
  "iridescent-silk":
    "url('data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1b1444"/><stop offset="45%" stop-color="#3b267a"/><stop offset="100%" stop-color="#0f3d5e"/></linearGradient><radialGradient id="a" cx="24%" cy="25%" r="45%"><stop offset="0%" stop-color="#f472b6" stop-opacity="0.7"/><stop offset="100%" stop-color="#f472b6" stop-opacity="0"/></radialGradient><radialGradient id="b" cx="80%" cy="70%" r="50%"><stop offset="0%" stop-color="#38bdf8" stop-opacity="0.65"/><stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="900" fill="url(#bg)"/><rect width="1600" height="900" fill="url(#a)"/><rect width="1600" height="900" fill="url(#b)"/><path d="M0 540 C 420 340, 920 760, 1600 410 L 1600 900 L 0 900 Z" fill="#ffffff" fill-opacity="0.09"/></svg>`
    ) +
    "')",
  "cyber-grid":
    "url('data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#070812"/><stop offset="65%" stop-color="#190c20"/><stop offset="100%" stop-color="#090c18"/></linearGradient><radialGradient id="glow" cx="50%" cy="42%" r="42%"><stop offset="0%" stop-color="#f43f5e" stop-opacity="0.48"/><stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="900" fill="url(#bg)"/><rect width="1600" height="900" fill="url(#glow)"/><g stroke="#38bdf8" stroke-opacity="0.14" stroke-width="1.5"><path d="M0 580 L1600 580 M0 640 L1600 640 M0 720 L1600 720 M0 820 L1600 820"/><path d="M800 480 L80 900 M800 480 L420 900 M800 480 L800 900 M800 480 L1180 900 M800 480 L1520 900"/></g></svg>`
    ) +
    "')"
};

// ==========================================================================
// APPLICATION STATE
// ==========================================================================
const DEFAULT_STATE = {
  lang: "en",
  palette: "aurora",
  lighting: "dark",
  bgAnim: "cubes",
  category: "all",
  search: "",
  heroIndex: 0,
  bgPreset: "mesh",
  customBg: "",
  blur: 28,
  glow: 100,
  parallax: 100,
  dim: 28,
  bgBlur: 0,
  shards: true,
  cursor: true,
  selectedServices: ["glass", "webgl", "parallax", "i18n"]
};

function loadState() {
  try {
    const raw = localStorage.getItem("idominiqe_spatial_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch {
    // Ignore storage read errors in restricted contexts
  }
  const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGS.includes(browserLang)) {
    return { ...DEFAULT_STATE, lang: browserLang };
  }
  return { ...DEFAULT_STATE };
}

const state = loadState();

function saveState() {
  try {
    localStorage.setItem("idominiqe_spatial_v1", JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}

function t(path) {
  const dict = TRANSLATIONS[state.lang] || TRANSLATIONS.en;
  return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict) ?? path;
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
// RENDERING & TRANSLATIONS
// ==========================================================================
function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.title = t("metaTitle");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const val = t(el.dataset.i18n);
    if (typeof val === "string") el.textContent = val;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const val = t(el.dataset.i18nPlaceholder);
    if (typeof val === "string") el.placeholder = val;
  });

  document.querySelectorAll("[data-i18n-tooltip]").forEach((el) => {
    const val = t(el.dataset.i18nTooltip);
    if (typeof val === "string") el.setAttribute("data-tooltip", val);
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === state.lang);
  });

  renderHero();
  renderMiniBuilds();
  renderPortfolioGrid();
  renderServices();
  renderAnimPickers();
  renderBlogPreview();
}

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

  // Sync wallpaper
  const wp = document.getElementById("bg-wallpaper");
  if (state.customBg) {
    wp.style.backgroundImage = `url("${state.customBg}")`;
    wp.classList.add("active");
  } else if (state.bgPreset !== "mesh" && WALLPAPER_PRESETS[state.bgPreset]) {
    wp.style.backgroundImage = WALLPAPER_PRESETS[state.bgPreset];
    wp.classList.add("active");
  } else {
    wp.style.backgroundImage = "none";
    wp.classList.remove("active");
  }

  // Sync active controls
  document.querySelectorAll("[data-lighting-set]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lightingSet === state.lighting);
  });
  document.querySelectorAll("[data-palette-id]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.paletteId === state.palette);
  });
  document.querySelectorAll("[data-anim-id]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.animId === state.bgAnim);
  });
  document.querySelectorAll("[data-bg-preset]").forEach((btn) => {
    btn.classList.toggle("active", !state.customBg && btn.dataset.bgPreset === state.bgPreset);
  });

  const sliderMap = [
    ["ctrl-blur", "val-blur", state.blur, "px"],
    ["ctrl-glow", "val-glow", state.glow, "%"],
    ["ctrl-parallax", "val-parallax", state.parallax, "%"],
    ["ctrl-dim", "val-dim", state.dim, "%"],
    ["ctrl-bgblur", "val-bgblur", state.bgBlur, "px"]
  ];
  for (const [id, lbl, val, unit] of sliderMap) {
    const input = document.getElementById(id);
    const out = document.getElementById(lbl);
    if (input) input.value = val;
    if (out) out.textContent = `${val}${unit}`;
  }
  const shardsToggle = document.getElementById("ctrl-shards");
  const cursorToggle = document.getElementById("ctrl-cursor");
  if (shardsToggle) shardsToggle.checked = state.shards;
  if (cursorToggle) cursorToggle.checked = state.cursor;
}

function renderPalettes() {
  const targets = ["palette-quick-pills", "drawer-palette-list"];
  for (const targetId of targets) {
    const container = document.getElementById(targetId);
    if (!container) continue;
    container.innerHTML = PALETTES.map(
      (p) => `
      <button class="palette-chip ${state.palette === p.id ? "active" : ""}" data-palette-id="${p.id}">
        <span class="swatch-dot" style="background:${p.swatch}"></span>
        <span>${p.name}</span>
      </button>`
    ).join("");

    container.querySelectorAll("[data-palette-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.palette = btn.dataset.paletteId;
        applyThemeAndFX();
        saveState();
      });
    });
  }
}

function renderAnimPickers() {
  const labels = t("bgAnims") || {};
  for (const targetId of ["quick-anim-list", "drawer-anim-list"]) {
    const box = document.getElementById(targetId);
    if (!box) continue;
    box.innerHTML = BG_ANIMATIONS.map(
      (a) => `
      <button class="anim-chip ${state.bgAnim === a.id ? "active" : ""}" data-anim-id="${a.id}">
        <span aria-hidden="true">${a.icon}</span>
        <span>${labels[a.id] || a.id}</span>
      </button>`
    ).join("");

    box.querySelectorAll("[data-anim-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.bgAnim = btn.dataset.animId;
        applyThemeAndFX();
        saveState();
      });
    });
  }
}

function renderBlogPreview() {
  const grid = document.getElementById("blog-preview-grid");
  if (!grid) return;
  const ui = BLOG_UI[state.lang] || BLOG_UI.en;
  grid.innerHTML = ARTICLES.map((a) => {
    const title = a.title[state.lang] || a.title.en;
    const excerpt = a.excerpt[state.lang] || a.excerpt.en;
    const topicLabel = ui.topics[a.topic] || a.topic;
    return `
      <a class="blog-card liquid-glass" href="blog/${a.file}">
        <div>
          <div class="blog-card-banner" style="background:${a.gradient}">
            <div class="blog-card-meta">
              <span class="project-cat-badge">${topicLabel}</span>
              <span class="project-domain-chip">/blog/${a.slug}</span>
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
            ${a.tags.map((tg) => `<span class="tech-pill">${tg}</span>`).join("")}
          </div>
          <span class="card-circle-btn" aria-hidden="true">→</span>
        </div>
      </a>`;
  }).join("");
}

function renderSocials() {
  const miniGrid = document.getElementById("social-app-grid");
  if (miniGrid) {
    miniGrid.innerHTML = SOCIALS.map(
      (s) => `
      <a class="social-app-tile" href="${s.url}" target="_blank" rel="noopener noreferrer">
        <div class="social-app-icon" style="background:${s.bg}">${s.svg}</div>
        <span>${s.name}</span>
      </a>`
    ).join("");
  }

  const connectGrid = document.getElementById("connect-grid");
  if (connectGrid) {
    connectGrid.innerHTML = SOCIALS.map(
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
}

function renderHero() {
  const p = PROJECTS[state.heroIndex % PROJECTS.length];
  const bg = document.getElementById("hero-visual-bg");
  const title = document.getElementById("hero-title");
  const desc = document.getElementById("hero-desc");
  const domain = document.getElementById("hero-domain-chip");
  const tags = document.getElementById("hero-tags");
  const launch = document.getElementById("hero-launch-btn");
  const repo = document.getElementById("hero-repo-btn");
  const inspect = document.getElementById("hero-inspect-btn");

  if (!p || !title) return;
  bg.style.background = p.gradient;
  title.textContent = p.title[state.lang] || p.title.en;
  desc.textContent = p.desc[state.lang] || p.desc.en;
  domain.textContent = p.domain;
  tags.innerHTML = [p.accentBadge, ...p.stack].map((tag) => `<span class="glass-tag">${tag}</span>`).join("");
  launch.href = p.liveUrl;
  repo.href = p.repoUrl;
  inspect.onclick = () => openProjectModal(p);

  document.querySelectorAll(".mini-build-item").forEach((item, idx) => {
    item.classList.toggle("active", idx === state.heroIndex);
  });
}

function renderMiniBuilds() {
  const container = document.getElementById("mini-build-list");
  if (!container) return;
  container.innerHTML = PROJECTS.slice(0, 4)
    .map(
      (p, idx) => `
      <div class="mini-build-item ${idx === state.heroIndex ? "active" : ""}" data-hero-idx="${idx}">
        <div class="mini-thumb" style="background:${p.gradient}">3D</div>
        <div class="mini-info">
          <h4>${p.title[state.lang] || p.title.en}</h4>
          <p>${p.domain}</p>
        </div>
        <div class="mini-play" aria-hidden="true">▶</div>
      </div>`
    )
    .join("");

  container.querySelectorAll("[data-hero-idx]").forEach((el) => {
    el.addEventListener("click", () => {
      state.heroIndex = Number(el.dataset.heroIdx);
      renderHero();
    });
  });
}

function getFilteredProjects() {
  const q = state.search.trim().toLowerCase();
  return PROJECTS.filter((p) => {
    const catOk = state.category === "all" || p.categories.includes(state.category);
    if (!catOk) return false;
    if (!q) return true;
    const hay = `${p.title[state.lang] || p.title.en} ${p.desc[state.lang] || p.desc.en} ${p.domain} ${p.stack.join(" ")}`.toLowerCase();
    return hay.includes(q);
  });
}

function renderPortfolioGrid() {
  const grid = document.getElementById("portfolio-grid");
  if (!grid) return;
  const list = getFilteredProjects();
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
            <div style="font-family:var(--font-mono); font-size:0.72rem; color:rgba(255,255,255,0.85);">● Live Production</div>
          </div>
          <div class="project-body" style="margin-top:13px;">
            <h3>${p.title[state.lang] || p.title.en}</h3>
            <p>${p.desc[state.lang] || p.desc.en}</p>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <div class="project-meta-row">
            ${p.stack.map((s) => `<span class="tech-pill">${s}</span>`).join("")}
          </div>
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

  grid.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", () => {
      const proj = PROJECTS.find((item) => item.id === card.dataset.projectId);
      if (proj) openProjectModal(proj);
    });
  });
}

function renderServices() {
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
      saveState();
      renderServices();
    };
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  // Update summary panel
  const activeModules = SERVICE_MODULES.filter((m) => state.selectedServices.includes(m.id));
  const totalDays = activeModules.reduce((sum, m) => sum + m.days, 0);
  const countEl = document.getElementById("summary-count");
  const daysEl = document.getElementById("summary-days");
  const tierEl = document.getElementById("summary-tier-badge");
  const briefEl = document.getElementById("brief-preview");

  if (countEl) countEl.textContent = `${activeModules.length} / ${SERVICE_MODULES.length}`;
  if (daysEl) daysEl.textContent = `${totalDays} ${t("serviceSummary.weeks")}`;
  if (tierEl) {
    tierEl.textContent =
      activeModules.length >= 5
        ? t("serviceSummary.tierFlagship")
        : activeModules.length >= 3
          ? t("serviceSummary.tierPro")
          : t("serviceSummary.tierBase");
  }
  if (briefEl) {
    const lines = activeModules.map((m) => `• ${m.title[state.lang] || m.title.en}`);
    briefEl.textContent = `iDominiqe Spatial Studio Brief [${state.lang.toUpperCase()}]\nPalette: ${state.palette} (${state.lighting})\nModules:\n${lines.join("\n")}\nEst. Delivery: ${totalDays} ${t("serviceSummary.weeks")}`;
  }
}

// ==========================================================================
// MODALS, DRAWER & COMMAND PALETTE
// ==========================================================================
function openProjectModal(proj) {
  const backdrop = document.getElementById("project-modal-backdrop");
  document.getElementById("modal-project-domain").textContent = proj.domain;
  document.getElementById("modal-project-title").textContent = proj.title[state.lang] || proj.title.en;
  document.getElementById("modal-project-desc").textContent = proj.desc[state.lang] || proj.desc.en;
  document.getElementById("modal-project-stack").innerHTML = proj.stack
    .map((s) => `<span class="tech-pill">${s}</span>`)
    .join("");
  document.getElementById("modal-open-live").href = proj.liveUrl;
  document.getElementById("modal-open-github").href = proj.repoUrl;

  const iframe = document.getElementById("modal-iframe");
  iframe.src = proj.id === "spatialos" ? "about:blank" : proj.liveUrl;
  backdrop.classList.add("open");
}

function closeProjectModal() {
  const backdrop = document.getElementById("project-modal-backdrop");
  backdrop.classList.remove("open");
  document.getElementById("modal-iframe").src = "about:blank";
}

function setStudioDrawer(open) {
  document.getElementById("studio-drawer").classList.toggle("open", open);
  document.getElementById("studio-backdrop").classList.toggle("open", open);
}

function openCmdPalette() {
  const backdrop = document.getElementById("cmd-backdrop");
  const input = document.getElementById("cmd-input");
  backdrop.classList.add("open");
  input.value = "";
  renderCmdResults("");
  setTimeout(() => input.focus(), 40);
}

function closeCmdPalette() {
  document.getElementById("cmd-backdrop").classList.remove("open");
}

function renderCmdResults(query) {
  const container = document.getElementById("cmd-results");
  const q = query.trim().toLowerCase();

  const commands = [
    ...PROJECTS.map((p) => ({
      label: `🚀 ${p.title[state.lang] || p.title.en}`,
      hint: p.domain,
      action: () => {
        closeCmdPalette();
        openProjectModal(p);
      }
    })),
    {
      label: `✨ ${t("nav.prompts")} — Live Web Demos & AI Prompts`,
      hint: "/prompts/",
      action: () => {
        closeCmdPalette();
        window.location.href = "prompts/index.html";
      }
    },
    ...ARTICLES.map((a) => ({
      label: `📘 ${a.title[state.lang] || a.title.en}`,
      hint: `/blog/${a.slug}`,
      action: () => {
        closeCmdPalette();
        window.location.href = `blog/${a.file}`;
      }
    })),
    ...BG_ANIMATIONS.map((a) => ({
      label: `${a.icon} BG Animation: ${(t("bgAnims") || {})[a.id] || a.id}`,
      hint: "Canvas FX",
      action: () => {
        state.bgAnim = a.id;
        applyThemeAndFX();
        saveState();
        closeCmdPalette();
      }
    })),
    ...PALETTES.map((pal) => ({
      label: `🎨 Palette: ${pal.name}`,
      hint: "Theme",
      action: () => {
        state.palette = pal.id;
        applyThemeAndFX();
        saveState();
        closeCmdPalette();
      }
    })),
    ...SUPPORTED_LANGS.map((code) => ({
      label: `🌍 Language: ${TRANSLATIONS[code].langName} (${code.toUpperCase()})`,
      hint: "i18n",
      action: () => {
        state.lang = code;
        applyLanguage();
        saveState();
        closeCmdPalette();
      }
    })),
    ...SOCIALS.map((s) => ({
      label: `🔗 ${s.name} — ${s.handle}`,
      hint: "External",
      action: () => {
        window.open(s.url, "_blank", "noopener,noreferrer");
        closeCmdPalette();
      }
    }))
  ];

  const filtered = q ? commands.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(q)) : commands.slice(0, 8);
  if (!filtered.length) {
    container.innerHTML = `<div class="cmd-item">${t("cmd.noResults")}</div>`;
    return;
  }

  container.innerHTML = filtered
    .map(
      (c, idx) => `
      <div class="cmd-item" data-cmd-idx="${idx}">
        <span>${c.label}</span>
        <span class="panel-badge">${c.hint}</span>
      </div>`
    )
    .join("");

  container.querySelectorAll("[data-cmd-idx]").forEach((row) => {
    row.addEventListener("click", () => filtered[Number(row.dataset.cmdIdx)].action());
  });
}

// ==========================================================================
// 3D DAMPED-SPRING PARALLAX & MOUSE CAUSTICS
// ==========================================================================
function initParallaxAndMouseFX() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cursor = document.getElementById("spatial-cursor");
  const halo = document.getElementById("cursor-halo");
  const core = document.getElementById("cursor-core");
  const shell = document.getElementById("main-shell");
  const artifacts = document.querySelectorAll(".glass-artifact");

  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;
  let mouseX = window.innerWidth * 0.5;
  let mouseY = window.innerHeight * 0.5;
  let haloX = mouseX;
  let haloY = mouseY;

  window.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;

    if (core) {
      core.style.left = `${mouseX}px`;
      core.style.top = `${mouseY}px`;
    }

    const glassTarget = e.target.closest(".liquid-glass");
    if (glassTarget) {
      const rect = glassTarget.getBoundingClientRect();
      glassTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      glassTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
    }

    const interactive = e.target.closest("a, button, .project-card, .service-toggle-card, .mini-build-item");
    if (cursor) cursor.classList.toggle("is-hover", Boolean(interactive));
  });

  function animate() {
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    haloX += (mouseX - haloX) * 0.16;
    haloY += (mouseY - haloY) * 0.16;

    if (halo) {
      halo.style.left = `${haloX}px`;
      halo.style.top = `${haloY}px`;
    }

    if (!reducedMotion && state.parallax > 0) {
      const factor = state.parallax / 100;
      const scrollY = window.scrollY;
      if (shell && window.innerWidth > 900) {
        const rx = (-curY * 1.4 * factor).toFixed(3);
        const ry = (curX * 1.6 * factor).toFixed(3);
        shell.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      } else if (shell) {
        shell.style.transform = "";
      }

      artifacts.forEach((art, idx) => {
        const depth = Number(art.dataset.depth || 25) * factor;
        const tx = curX * depth;
        const ty = curY * depth - scrollY * (0.04 + idx * 0.015);
        const rot = idx * 18 + curX * 14 * factor;
        art.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)`;
      });
    }

    requestAnimationFrame(animate);
  }
  animate();
}

// ==========================================================================
// EVENT BINDINGS & INIT
// ==========================================================================
function bindEvents() {
  // Language switcher
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      applyLanguage();
      saveState();
    });
  });

  // Lighting switcher (Top bar + Drawer)
  document.querySelectorAll("[data-lighting-set]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.lighting = btn.dataset.lightingSet;
      applyThemeAndFX();
      saveState();
    });
  });

  // Category tabs
  document.querySelectorAll("[data-category]").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.category = tab.dataset.category;
      document.querySelectorAll("[data-category]").forEach((el) => el.classList.toggle("active", el === tab));
      renderPortfolioGrid();
    });
  });

  // Search input
  const searchInput = document.getElementById("portfolio-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.search = e.target.value;
      renderPortfolioGrid();
    });
  }

  // Hero carousel prev/next
  const stepHero = (delta) => {
    state.heroIndex = (state.heroIndex + delta + PROJECTS.length) % PROJECTS.length;
    renderHero();
  };
  document.getElementById("hero-prev")?.addEventListener("click", () => stepHero(-1));
  document.getElementById("hero-next")?.addEventListener("click", () => stepHero(1));
  document.getElementById("hero-prev-top")?.addEventListener("click", () => stepHero(-1));
  document.getElementById("hero-next-top")?.addEventListener("click", () => stepHero(1));

  // Smooth scroll targets & dynamic omnibox URL scroll spy
  const scrollButtons = document.querySelectorAll("[data-scroll-target]");
  scrollButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.scrollTarget;
      const target = document.getElementById(id);
      if (target) {
        smoothScrollToElement(target);
        updateOmniboxUrl(id === "overview" ? "/" : `/#${id}`);
      }
    });
  });

  const sections = ["overview", "portfolio", "services", "blog-preview", "analytics", "connect"];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          scrollButtons.forEach((b) => b.classList.toggle("active", b.dataset.scrollTarget === entry.target.id));
          updateOmniboxUrl(entry.target.id === "overview" ? "/" : `/#${entry.target.id}`);
        }
      });
    },
    { threshold: 0.25 }
  );
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  // Studio Drawer triggers
  document.getElementById("open-studio-btn")?.addEventListener("click", () => setStudioDrawer(true));
  document.getElementById("dock-studio-btn")?.addEventListener("click", () => setStudioDrawer(true));
  document.getElementById("open-studio-inline")?.addEventListener("click", () => setStudioDrawer(true));
  document.getElementById("bottom-studio-btn")?.addEventListener("click", () => setStudioDrawer(true));
  document.getElementById("close-studio-btn")?.addEventListener("click", () => setStudioDrawer(false));
  document.getElementById("studio-backdrop")?.addEventListener("click", () => setStudioDrawer(false));

  // Wallpaper presets & custom backgrounds
  document.querySelectorAll("[data-bg-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.bgPreset = btn.dataset.bgPreset;
      state.customBg = "";
      applyThemeAndFX();
      saveState();
    });
  });

  document.getElementById("apply-bg-url")?.addEventListener("click", () => {
    const url = document.getElementById("custom-bg-url").value.trim();
    if (!url) return;
    state.customBg = url;
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
    state.bgPreset = "mesh";
    document.getElementById("custom-bg-url").value = "";
    applyThemeAndFX();
    saveState();
    showToast(t("toast.bgReset"));
  });

  // Sliders & FX Toggles
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

  // Copy active omnibox URL & brief
  document.getElementById("copy-domain-btn")?.addEventListener("click", async () => {
    await navigator.clipboard?.writeText(getCurrentOmniboxUrl());
    showToast(t("toast.urlCopied"));
  });

  document.getElementById("copy-brief-btn")?.addEventListener("click", async () => {
    const text = document.getElementById("brief-preview")?.textContent || "";
    await navigator.clipboard?.writeText(text);
    showToast(t("toast.briefCopied"));
  });

  // Modals & Command Palette
  document.getElementById("close-project-modal")?.addEventListener("click", closeProjectModal);
  document.getElementById("modal-close-btn")?.addEventListener("click", closeProjectModal);
  document.getElementById("project-modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "project-modal-backdrop") closeProjectModal();
  });

  document.getElementById("open-cmd-btn")?.addEventListener("click", openCmdPalette);
  document.getElementById("cmd-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "cmd-backdrop") closeCmdPalette();
  });
  document.getElementById("cmd-input")?.addEventListener("input", (e) => renderCmdResults(e.target.value));

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openCmdPalette();
    } else if (e.key === "Escape") {
      closeCmdPalette();
      closeProjectModal();
      setStudioDrawer(false);
    }
  });
}

// ==========================================================================
// BOOTSTRAP
// ==========================================================================
initScrollProgressBar();
bindSmoothAnchorLinks((hash) => updateOmniboxUrl(`/${hash}`));
renderPalettes();
renderAnimPickers();
renderSocials();
applyThemeAndFX();
applyLanguage();
bindEvents();
initBackgroundAnimations(() => state);
initParallaxAndMouseFX();
