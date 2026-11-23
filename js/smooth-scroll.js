// ==========================================================================
// iDominiqe Spatial OS — Smooth Eased Scrolling & Dynamic Top Omnibox URL
// ==========================================================================

let activeScrollRaf = null;

export function smoothScrollToY(targetY, duration = 680) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, targetY);
    return;
  }

  if (activeScrollRaf) cancelAnimationFrame(activeScrollRaf);

  const startY = window.scrollY;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const clampedTarget = Math.max(0, Math.min(targetY, maxScroll));
  const diff = clampedTarget - startY;
  if (Math.abs(diff) < 2) return;

  const startTime = performance.now();
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const cancelOnUserInput = () => {
    if (activeScrollRaf) {
      cancelAnimationFrame(activeScrollRaf);
      activeScrollRaf = null;
    }
    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener("wheel", cancelOnUserInput);
    window.removeEventListener("touchstart", cancelOnUserInput);
  };

  window.addEventListener("wheel", cancelOnUserInput, { passive: true });
  window.addEventListener("touchstart", cancelOnUserInput, { passive: true });

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeOutCubic(progress);
    window.scrollTo(0, startY + diff * eased);

    if (progress < 1) {
      activeScrollRaf = requestAnimationFrame(step);
    } else {
      activeScrollRaf = null;
      cleanup();
    }
  }

  activeScrollRaf = requestAnimationFrame(step);
}

export function smoothScrollToElement(el, offset = 92) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  smoothScrollToY(top);
}

export function updateOmniboxUrl(pathOrHash) {
  const clean = pathOrHash.startsWith("http")
    ? pathOrHash
    : `https://portfolio.idominiqe.com${pathOrHash.startsWith("/") ? "" : "/"}${pathOrHash}`;
  const el = document.getElementById("omnibox-url-text");
  if (el && el.textContent !== clean) {
    el.textContent = clean;
    el.classList.remove("omnibox-pulse");
    void el.offsetWidth;
    el.classList.add("omnibox-pulse");
  }
  return clean;
}

export function getCurrentOmniboxUrl() {
  return document.getElementById("omnibox-url-text")?.textContent || "https://portfolio.idominiqe.com/";
}

export function initScrollProgressBar() {
  const bar = document.getElementById("scroll-progress-bar");
  if (!bar) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    bar.style.width = `${pct.toFixed(2)}%`;
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}

export function bindSmoothAnchorLinks(onHashChange) {
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    smoothScrollToElement(target);
    if (typeof onHashChange === "function") onHashChange(href);
  });
}
