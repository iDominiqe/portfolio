// ==========================================================================
// iDominiqe Spatial OS — Multi-Mode Procedural Background Animations
// ==========================================================================

export const BG_ANIMATIONS = [
  { id: "none", icon: "⏹️" },
  { id: "cubes", icon: "🧊" },
  { id: "constellation", icon: "🕸️" },
  { id: "rings", icon: "🪐" },
  { id: "waves", icon: "🌊" },
  { id: "aurora", icon: "✨" }
];

const PALETTE_THEMES = {
  aurora: {
    primary: [139, 92, 246],
    secondary: [56, 189, 248],
    tertiary: [244, 114, 182]
  },
  vision: {
    primary: [226, 214, 198],
    secondary: [147, 197, 253],
    tertiary: [251, 191, 36]
  },
  cyber: {
    primary: [244, 63, 94],
    secondary: [251, 146, 60],
    tertiary: [56, 189, 248]
  },
  emerald: {
    primary: [16, 185, 129],
    secondary: [34, 211, 238],
    tertiary: [250, 204, 21]
  },
  sunset: {
    primary: [251, 113, 133],
    secondary: [251, 146, 60],
    tertiary: [192, 132, 252]
  },
  arctic: {
    primary: [96, 165, 250],
    secondary: [103, 232, 249],
    tertiary: [129, 140, 248]
  }
};

function rgba(rgb, a) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}

// 3D Cube vertices & faces
const CUBE_VERTS = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1]
];

const CUBE_FACES = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 1, 5, 4],
  [2, 3, 7, 6],
  [0, 3, 7, 4],
  [1, 2, 6, 5]
];

const OCT_VERTS = [
  [0, -1.3, 0],
  [1, 0, 0],
  [0, 0, 1],
  [-1, 0, 0],
  [0, 0, -1],
  [0, 1.3, 0]
];

const OCT_EDGES = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [5, 1], [5, 2], [5, 3], [5, 4],
  [1, 2], [2, 3], [3, 4], [4, 1]
];

function rotatePoint([x, y, z], rx, ry, rz) {
  // Rotate X
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const y1 = y * cx - z * sx;
  const z1 = y * sx + z * cx;
  // Rotate Y
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const x2 = x * cy + z1 * sy;
  const z2 = -x * sy + z1 * cy;
  // Rotate Z
  const cz = Math.cos(rz), sz = Math.sin(rz);
  return [x2 * cz - y1 * sz, x2 * sz + y1 * cz, z2];
}

export function initBackgroundAnimations(getConfig) {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let w = 0;
  let h = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
  let smoothPX = 0.5;
  let smoothPY = 0.5;
  let time = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  window.addEventListener("pointermove", (e) => {
    pointerX = e.clientX / Math.max(1, w);
    pointerY = e.clientY / Math.max(1, h);
  });

  // Scene entities
  const cubes = Array.from({ length: 18 }, (_, i) => ({
    nx: Math.random(),
    ny: Math.random(),
    z: 0.35 + (i / 18) * 1.15,
    size: 22 + (i % 5) * 11,
    rx: Math.random() * Math.PI * 2,
    ry: Math.random() * Math.PI * 2,
    rz: Math.random() * Math.PI * 2,
    vrx: (Math.random() - 0.5) * 0.011,
    vry: (Math.random() - 0.5) * 0.013,
    vrz: (Math.random() - 0.5) * 0.008,
    vx: (Math.random() - 0.5) * 0.00045,
    vy: -0.00025 - Math.random() * 0.00045,
    colorIdx: i % 3
  }));

  const nodes = Array.from({ length: 48 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0007,
    vy: (Math.random() - 0.5) * 0.0007,
    r: 2 + (i % 4),
    c: i % 3
  }));

  const prisms = Array.from({ length: 10 }, (_, i) => ({
    nx: 0.1 + (i / 10) * 0.8 + (Math.random() - 0.5) * 0.08,
    ny: 0.15 + Math.random() * 0.7,
    r: 24 + (i % 4) * 12,
    rx: Math.random() * 6,
    ry: Math.random() * 6,
    speed: 0.006 + (i % 3) * 0.003,
    c: i % 3
  }));

  const blobs = Array.from({ length: 5 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0006,
    vy: (Math.random() - 0.5) * 0.0006,
    r: 230 + i * 55
  }));

  const waveParticles = Array.from({ length: 34 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    speed: 0.001 + Math.random() * 0.002,
    size: 1.5 + (i % 3),
    c: i % 3
  }));

  function getColors() {
    const cfg = getConfig();
    const theme = PALETTE_THEMES[cfg.palette] || PALETTE_THEMES.aurora;
    return [theme.primary, theme.secondary, theme.tertiary];
  }

  function drawPointerSpotlight(colors, cfg) {
    if (cfg.glow <= 0) return;
    const px = smoothPX * w;
    const py = smoothPY * h;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, 290);
    grad.addColorStop(0, rgba(colors[1], (cfg.glow / 100) * 0.24));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, 290, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCubes(colors, cfg) {
    const isLight = cfg.lighting === "light";
    const tiltX = (smoothPY - 0.5) * 0.35;
    const tiltY = (smoothPX - 0.5) * 0.35;

    // Soft backdrop aura behind cubes
    for (let i = 0; i < 2; i++) {
      const gx = i === 0 ? w * 0.2 : w * 0.8;
      const gy = i === 0 ? h * 0.25 : h * 0.75;
      const g = ctx.createRadialGradient(gx, gy, 20, gx, gy, 360);
      g.addColorStop(0, rgba(colors[i], isLight ? 0.18 : 0.24));
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(gx, gy, 360, 0, Math.PI * 2);
      ctx.fill();
    }

    const sorted = [...cubes].sort((a, b) => b.z - a.z);
    for (const c of sorted) {
      c.rx += c.vrx;
      c.ry += c.vry;
      c.rz += c.vrz;
      c.nx += c.vx;
      c.ny += c.vy;

      if (c.ny < -0.14) c.ny = 1.14;
      if (c.nx < -0.12) c.nx = 1.12;
      if (c.nx > 1.12) c.nx = -0.12;

      const parallaxShiftX = (smoothPX - 0.5) * (70 / c.z) * (cfg.parallax / 100);
      const parallaxShiftY = (smoothPY - 0.5) * (60 / c.z) * (cfg.parallax / 100);
      const cx = c.nx * w + parallaxShiftX;
      const cy = c.ny * h + parallaxShiftY;
      const scale = c.size / c.z;
      const col = colors[c.colorIdx];

      const projected = CUBE_VERTS.map((v) => {
        const [rx, ry, rz] = rotatePoint(v, c.rx + tiltX, c.ry + tiltY, c.rz);
        const persp = 4 / (4 + rz * 0.6);
        return [cx + rx * scale * persp, cy + ry * scale * persp, rz];
      });

      // Order faces back-to-front by average Z
      const orderedFaces = CUBE_FACES.map((face) => {
        const avgZ = face.reduce((acc, idx) => acc + projected[idx][2], 0) / 4;
        return { face, avgZ };
      }).sort((a, b) => a.avgZ - b.avgZ);

      for (const { face, avgZ } of orderedFaces) {
        ctx.beginPath();
        face.forEach((vIdx, idx) => {
          const [px, py] = projected[vIdx];
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();

        const depthAlpha = Math.max(0.04, Math.min(0.24, (0.14 - avgZ * 0.04) / c.z));
        ctx.fillStyle = isLight
          ? rgba(col, depthAlpha * 0.85)
          : rgba(col, depthAlpha);
        ctx.fill();

        ctx.strokeStyle = isLight
          ? rgba([255, 255, 255], 0.58)
          : rgba([255, 255, 255], Math.min(0.45, 0.24 / c.z + 0.08));
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
    }
  }

  function drawConstellation(colors, cfg) {
    const isLight = cfg.lighting === "light";
    const px = smoothPX * w;
    const py = smoothPY * h;
    const linkDist = Math.min(180, w * 0.16);

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > 1) n.vx *= -1;
      if (n.y < 0 || n.y > 1) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const ax = a.x * w;
      const ay = a.y * h;

      // Link to pointer
      const dp = Math.hypot(ax - px, ay - py);
      if (dp < linkDist * 1.25) {
        ctx.strokeStyle = rgba(colors[1], (1 - dp / (linkDist * 1.25)) * 0.45);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const bx = b.x * w;
        const by = b.y * h;
        const d = Math.hypot(ax - bx, ay - by);
        if (d < linkDist) {
          ctx.strokeStyle = rgba(colors[a.c], (1 - d / linkDist) * (isLight ? 0.35 : 0.28));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }

      ctx.fillStyle = rgba(colors[a.c], isLight ? 0.65 : 0.8);
      ctx.beginPath();
      ctx.arc(ax, ay, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawRings(colors, cfg) {
    const isLight = cfg.lighting === "light";
    const cx = w * 0.5 + (smoothPX - 0.5) * 45;
    const cy = h * 0.5 + (smoothPY - 0.5) * 45;

    // Concentric tilted orbital rings
    for (let i = 0; i < 4; i++) {
      const rx = 140 + i * 95;
      const ry = (55 + i * 34) * (0.75 + 0.25 * Math.sin(time * 0.5 + i));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.08 * (i % 2 === 0 ? 1 : -1) + i * 0.4);
      ctx.strokeStyle = rgba(colors[i % 3], isLight ? 0.28 : 0.24);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Floating rotating 3D octahedron prisms
    for (const p of prisms) {
      p.rx += p.speed;
      p.ry += p.speed * 1.25;
      const px = p.nx * w + (smoothPX - 0.5) * 40;
      const py = p.ny * h + Math.sin(time + p.nx * 5) * 14;
      const pts = OCT_VERTS.map((v) => {
        const [x, y] = rotatePoint(v, p.rx, p.ry, 0);
        return [px + x * p.r, py + y * p.r];
      });
      ctx.strokeStyle = rgba(colors[p.c], isLight ? 0.55 : 0.5);
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (const [a, b] of OCT_EDGES) {
        ctx.moveTo(pts[a][0], pts[a][1]);
        ctx.lineTo(pts[b][0], pts[b][1]);
      }
      ctx.stroke();
    }
  }

  function drawWaves(colors, cfg) {
    const horizon = h * 0.46 + (smoothPY - 0.5) * 35;
    const vanishX = w * 0.5 + (smoothPX - 0.5) * 90;

    // Perspective lines
    ctx.strokeStyle = rgba(colors[1], cfg.lighting === "light" ? 0.22 : 0.2);
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(vanishX + i * 24, horizon);
      ctx.lineTo(vanishX + i * 190, h + 20);
      ctx.stroke();
    }

    // Moving horizontal perspective waves
    const offset = (time * 38) % 60;
    for (let y = 0; y < 12; y++) {
      const t = (y * 60 + offset) / 720;
      const py = horizon + Math.pow(t, 1.85) * (h - horizon + 40);
      ctx.strokeStyle = rgba(colors[0], Math.min(0.4, t * 0.45));
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
      ctx.stroke();
    }

    // Rising data particles
    for (const pt of waveParticles) {
      pt.y -= pt.speed;
      if (pt.y < 0) {
        pt.y = 1.02;
        pt.x = Math.random();
      }
      ctx.fillStyle = rgba(colors[pt.c], 0.65);
      ctx.beginPath();
      ctx.arc(pt.x * w, pt.y * h, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawAurora(colors) {
    blobs.forEach((b, i) => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -0.15 || b.x > 1.15) b.vx *= -1;
      if (b.y < -0.15 || b.y > 1.15) b.vy *= -1;

      const bx = b.x * w;
      const by = b.y * h;
      const grad = ctx.createRadialGradient(bx, by, 10, bx, by, b.r);
      grad.addColorStop(0, rgba(colors[i % 3], 0.34));
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, b.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let rafId = null;

  function loop() {
    rafId = null;
    const cfg = getConfig();

    if (document.hidden || cfg.bgAnim === "none") {
      ctx.clearRect(0, 0, w, h);
      return;
    }

    time += reduced ? 0.002 : 0.016;
    smoothPX += (pointerX - smoothPX) * 0.08;
    smoothPY += (pointerY - smoothPY) * 0.08;

    ctx.clearRect(0, 0, w, h);
    const colors = getColors();

    switch (cfg.bgAnim) {
      case "constellation":
        drawConstellation(colors, cfg);
        break;
      case "rings":
        drawRings(colors, cfg);
        break;
      case "waves":
        drawWaves(colors, cfg);
        break;
      case "aurora":
        drawAurora(colors);
        break;
      case "cubes":
      default:
        drawCubes(colors, cfg);
        break;
    }

    drawPointerSpotlight(colors, cfg);
    rafId = requestAnimationFrame(loop);
  }

  const wake = () => {
    const cfg = getConfig();
    if (cfg.bgAnim === "none") {
      ctx.clearRect(0, 0, w, h);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      return;
    }
    if (!rafId && !document.hidden) {
      rafId = requestAnimationFrame(loop);
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) wake();
  });

  wake();
  return { wake };
}
