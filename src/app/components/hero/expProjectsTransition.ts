/**
 * Timed Experience <-> Projects transition.
 *
 * Imperative (no React state per frame). Forward: Projects is already mounted
 * underneath with every panel clipped shut; a snapshot of Experience fades out
 * on top while four robots fly to their IDE panel, flash, vanish and the panel
 * opens from the landing point (clip-path only) with a CSS scanline sweep.
 * Reverse plays the exact same timeline mirrored on cloned Projects panels
 * while the live Experience view fades in underneath.
 */

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type PanelKey = "sidebar" | "text" | "media" | "breadcrumb" | "status";

export type PanelEls = Partial<Record<PanelKey, HTMLElement | null>>;

/** Single source of truth for both directions. Index order = agentCards order. */
export const EXP_PROJECTS_TIMELINE = {
  // gemini, cursor, claude, chatgpt
  arrivals: [1200, 450, 700, 950],
  // Gemini -> top breadcrumb only; Cursor -> sidebar, then a pixel streak runs
  // down from its landing point and opens the bottom status bar.
  panels: [["breadcrumb"], ["sidebar", "status"], ["text"], ["media"]] as PanelKey[][],
  /** Robot palette [base, alt] used for the collapse square / panel fill. */
  colors: [
    ["#3b5bdb", "#5c7cfa"], // gemini
    ["#f4f4f5", "#27272a"], // cursor
    ["#d97757", "#f0a07a"], // claude
    ["#10a37f", "#34d3a8"], // chatgpt
  ],
  /**
   * "unfold": robot -> coloured square -> window unfolds (variant A).
   * "reassemble": robot breaks into its own pixels which rebuild the panel (variant B).
   */
  revealStyle: "reassemble" as "unfold" | "reassemble",
  assembleStaggerMs: 220,
  assembleTravelMs: 240,
  crossfadeMs: 160,
  maxParticles: 800,
  spriteGrid: 14,
  squarePx: 14,
  unfoldMs: 300,
  dissolveMs: 160,
  cellPx: 10,
  streakMs: 220,
  flightMs: 450,
  anticipationMs: 90,
  shrinkMs: 80,
  expFadeMs: 380, // overlaps the first landing (450ms) so there is no empty frame
  tailMs: 60,
  flightScale: 1.4,
  titleCharMs: 22,
};

const REVEAL_MS =
  EXP_PROJECTS_TIMELINE.revealStyle === "unfold"
    ? EXP_PROJECTS_TIMELINE.unfoldMs + EXP_PROJECTS_TIMELINE.dissolveMs
    : EXP_PROJECTS_TIMELINE.assembleStaggerMs +
      EXP_PROJECTS_TIMELINE.assembleTravelMs +
      EXP_PROJECTS_TIMELINE.crossfadeMs;

export const EXP_PROJECTS_DURATION_MS =
  Math.max(...EXP_PROJECTS_TIMELINE.arrivals) +
  REVEAL_MS +
  EXP_PROJECTS_TIMELINE.tailMs;

export const EXP_PROJECTS_REDUCED_MS = 400;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const cellHash = (x: number, y: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
};
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

const toBox = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

const intersect = (a: Box, b: Box): Box => {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.left + a.width, b.left + b.width);
  const bottom = Math.min(a.top + a.height, b.top + b.height);
  return { left, top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
};

export interface RunOptions {
  direction: "forward" | "reverse";
  reduceMotion: boolean;
  sprites: string[];
  /** Live panels (forward: real Projects panels; reverse: status bar only is live). */
  panels: PanelEls;
  /** Content viewport (inner scroll area) used to clamp landing points. */
  contentBox: Box;
  /** Robot rects on the Experience side (already measured after layout). */
  robotBoxes: () => Box[];
  /** Forward: snapshot of Experience to fade out. Reverse: snapshot of Projects panels. */
  snapshot: {
    contentBox: Box;
    expClone?: { node: HTMLElement; box: Box } | null;
    panelClones?: Partial<Record<PanelKey, { node: HTMLElement; box: Box }>>;
  };
  /** Live Experience section (reverse fade-in). */
  liveExpSection?: HTMLElement | null;
  /** Title span to "type" via max-width ch (forward only). */
  titleEl?: HTMLElement | null;
  titleLength?: number;
  onDone: () => void;
}

type Landing = { x: number; y: number; panel: PanelKey };

export function runExpProjectsTransition(opts: RunOptions): () => void {
  const T = EXP_PROJECTS_TIMELINE;
  const { direction, reduceMotion } = opts;
  const forward = direction === "forward";
  const duration = reduceMotion ? EXP_PROJECTS_REDUCED_MS : EXP_PROJECTS_DURATION_MS;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const viewport: Box = { left: 0, top: 0, width: vw, height: vh };

  // ---------- layers ----------
  const snapLayer = document.createElement("div");
  snapLayer.setAttribute("data-xp-snapshot", "");
  const sb = opts.snapshot.contentBox;
  Object.assign(snapLayer.style, {
    position: "fixed",
    left: `${sb.left}px`,
    top: `${sb.top}px`,
    width: `${sb.width}px`,
    height: `${sb.height}px`,
    overflow: "hidden",
    zIndex: "150",
    pointerEvents: "none",
  } as CSSStyleDeclaration);
  const snapBg = document.createElement("div");
  Object.assign(snapBg.style, {
    position: "absolute",
    inset: "0",
    background: forward ? "#000" : "#09090b",
  } as CSSStyleDeclaration);
  snapLayer.appendChild(snapBg);

  const place = (node: HTMLElement, box: Box) => {
    Object.assign(node.style, {
      position: "absolute",
      left: `${box.left - sb.left}px`,
      top: `${box.top - sb.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      margin: "0",
      opacity: "1",
    } as CSSStyleDeclaration);
    node.removeAttribute("id");
    node.setAttribute("aria-hidden", "true");
    snapLayer.appendChild(node);
  };

  const expClone = opts.snapshot.expClone;
  if (forward && expClone) place(expClone.node, expClone.box);

  // Panel elements actually animated by the timeline.
  const animPanels: PanelEls = {};
  const panelBoxes: Partial<Record<PanelKey, Box>> = {};
  if (forward) {
    (Object.keys(opts.panels) as PanelKey[]).forEach((k) => {
      animPanels[k] = opts.panels[k] ?? null;
    });
  } else {
    const clones = opts.snapshot.panelClones ?? {};
    (Object.keys(clones) as PanelKey[]).forEach((k) => {
      const c = clones[k];
      if (!c) return;
      c.node.style.background = "#09090b";
      place(c.node, c.box);
      animPanels[k] = c.node;
      panelBoxes[k] = c.box;
    });
    // The status bar also exists in Experience, so reverse leaves it open
    // (closing it only to pop it back would be an effect without a cause).
  }
  document.body.appendChild(snapLayer);

  const fx = document.createElement("div");
  Object.assign(fx.style, {
    position: "fixed",
    inset: "0",
    zIndex: "210",
    pointerEvents: "none",
    overflow: "hidden",
  } as CSSStyleDeclaration);
  const canvas = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: `${vw}px`,
    height: `${vh}px`,
    zIndex: "3",
  } as CSSStyleDeclaration);
  const ctx = canvas.getContext("2d");
  ctx?.scale(dpr, dpr);
  fx.appendChild(canvas);

  const robots = opts.sprites.map((src) => {
    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "72px",
      height: "72px",
      willChange: "transform, opacity",
      zIndex: "2",
      opacity: "0",
    } as CSSStyleDeclaration);
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.draggable = false;
    Object.assign(img.style, {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      imageRendering: "pixelated",
      filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.7))",
    } as CSSStyleDeclaration);
    wrap.appendChild(img);
    fx.appendChild(wrap);
    return wrap;
  });

  document.body.appendChild(fx);

  // Pixel-textured fill per robot (2x2 checker of base/alt in 4px cells).
  const patterns: Array<CanvasPattern | string> = T.colors.map(([base, alt]) => {
    const pc = document.createElement("canvas");
    pc.width = 8;
    pc.height = 8;
    const p = pc.getContext("2d");
    if (!p || !ctx) return base;
    p.fillStyle = base;
    p.fillRect(0, 0, 8, 8);
    p.fillStyle = alt;
    p.fillRect(0, 0, 4, 4);
    p.fillRect(4, 4, 4, 4);
    return ctx.createPattern(pc, "repeat") ?? base;
  });

  // ---------- measurement (cached) ----------
  let landings: Landing[][] = [];
  let robotFrom: Box[] = [];
  const measure = () => {
    (["sidebar", "text", "media", "breadcrumb", "status"] as PanelKey[]).forEach((k) => {
      if (!forward && k !== "status" && panelBoxes[k]) return; // clones keep snapshot boxes
      const el = animPanels[k];
      if (el) panelBoxes[k] = toBox(el);
    });
    const content = forward ? opts.contentBox : sb;
    landings = T.panels.map((keys) =>
      keys
        .map((k): Landing | null => {
          const b = panelBoxes[k];
          if (!b || b.width <= 0) return null;
          const clampTo = k === "status" ? viewport : intersect(intersect(b, content), viewport);
          const vis = clampTo.width > 0 && clampTo.height > 0 ? intersect(b, clampTo) : b;
          let y = vis.top + vis.height / 2;
          if (k === "sidebar") y = vis.top + Math.min(260, vis.height * 0.35);
          if (k === "text") y = vis.top + Math.min(200, vis.height * 0.3);
          if (k === "media") y = vis.top + Math.min(220, vis.height * 0.4);
          if (k === "breadcrumb") y = Math.max(y, (72 * T.flightScale) / 2 + 4);
          return { x: vis.left + vis.width / 2, y, panel: k };
        })
        .filter((l): l is Landing => l !== null),
    );
    // Status bar opens from directly below Cursor's landing point.
    const cur = landings[1];
    const sbBox = panelBoxes.status;
    if (cur && cur[0] && cur[1] && sbBox) {
      cur[1].x = Math.min(sbBox.left + sbBox.width - 8, Math.max(sbBox.left + 8, cur[0].x));
    }
    robotFrom = opts.robotBoxes();
  };

  // Clip everything shut before first paint (forward) / start open (reverse).
  const panelOwner = (k: PanelKey) => T.panels.findIndex((ks) => ks.includes(k));
  const clipTo = (k: PanelKey, r: Box | null) => {
    const el = animPanels[k];
    const b = panelBoxes[k];
    if (!el) return;
    if (!r || !b) {
      el.style.clipPath = r ? "" : "inset(50%)";
      return;
    }
    const t = Math.max(0, r.top - b.top);
    const l = Math.max(0, r.left - b.left);
    const rt = Math.max(0, b.left + b.width - (r.left + r.width));
    const bt = Math.max(0, b.top + b.height - (r.top + r.height));
    el.style.clipPath = `inset(${t.toFixed(1)}px ${rt.toFixed(1)}px ${bt.toFixed(1)}px ${l.toFixed(1)}px)`;
  };

  /** Visible area of a panel (big panels are clamped to the content viewport). */
  const visibleBox = (k: PanelKey): Box | null => {
    const b = panelBoxes[k];
    if (!b) return null;
    if (k === "status" || k === "breadcrumb") return b;
    const v = intersect(intersect(b, forward ? opts.contentBox : sb), viewport);
    return v.width > 0 && v.height > 0 ? v : b;
  };

  /**
   * "Unfold": square in the robot's colour stretches to panel width, then to
   * panel height (stepped, slight overshoot), pixel fill dissolves into content.
   */
  const drawUnfold = (k: PanelKey, owner: number, l: Landing, tf: number, start: number) => {
    const vb = visibleBox(k);
    if (!vb) return;
    const sq = Math.min(T.squarePx, vb.height);
    const pat = patterns[owner] ?? "#fff";
    const u = (tf - start) / T.unfoldMs;
    const lx = Math.min(vb.left + vb.width - sq / 2, Math.max(vb.left + sq / 2, l.x));
    const ly = Math.min(vb.top + vb.height - sq / 2, Math.max(vb.top + sq / 2, l.y));
    if (u < 0) {
      clipTo(k, null);
      return;
    }
    if (u < 1) {
      const step = (v: number) => Math.round(v * 12) / 12; // slight "steps" feel
      const hp = step(clamp01(u / 0.45));
      const vp = step(clamp01((u - 0.45) / 0.55));
      const eh = easeOutBack(hp);
      const ev = easeOutBack(vp);
      const left = lerp(lx - sq / 2, vb.left, eh);
      const width = lerp(sq, vb.width, eh);
      const top = lerp(ly - sq / 2, vb.top, ev);
      const height = lerp(sq, vb.height, ev);
      const r = { left, top, width, height };
      clipTo(k, r);
      if (ctx) {
        // fill thins out as the window opens so content starts to show through
        ctx.globalAlpha = 0.95 - 0.25 * vp;
        ctx.fillStyle = pat;
        ctx.fillRect(left, top, width, height);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 1;
        ctx.strokeRect(left + 0.5, top + 0.5, width - 1, height - 1);
      }
      return;
    }
    const d = (tf - start - T.unfoldMs) / T.dissolveMs;
    animPanels[k]!.style.clipPath = "";
    if (d >= 1) return;
    if (!ctx) return;
    // pixel dissolve of the fill
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = pat;
    const c = T.cellPx;
    for (let y = vb.top; y < vb.top + vb.height; y += c) {
      for (let x = vb.left; x < vb.left + vb.width; x += c) {
        if (cellHash(Math.floor(x / c), Math.floor(y / c)) > d) ctx.fillRect(x, y, c, c);
      }
    }
    ctx.globalAlpha = 1;
    // tiny edge flash
    ctx.strokeStyle = `rgba(255,255,255,${(0.9 * (1 - d)).toFixed(3)})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(vb.left + 1, vb.top + 1, vb.width - 2, vb.height - 2);
  };

  // ---------- "reassemble" (variant B) ----------
  const reassemble = T.revealStyle === "reassemble";
  type Sample = { u: number; v: number; color: string };
  const spriteSamples: Sample[][] = [];
  const sampleSprite = (i: number): Sample[] => {
    if (spriteSamples[i]) return spriteSamples[i];
    const out: Sample[] = [];
    const img = robots[i]?.querySelector("img");
    const G = T.spriteGrid;
    try {
      if (img && img.complete && img.naturalWidth > 0) {
        const oc = document.createElement("canvas");
        oc.width = G;
        oc.height = G;
        const o = oc.getContext("2d");
        if (o) {
          o.imageSmoothingEnabled = true;
          o.drawImage(img, 0, 0, G, G);
          const data = o.getImageData(0, 0, G, G).data;
          for (let y = 0; y < G; y++) {
            for (let x = 0; x < G; x++) {
              const a = data[(y * G + x) * 4 + 3];
              if (a < 90) continue;
              const r = data[(y * G + x) * 4];
              const g = data[(y * G + x) * 4 + 1];
              const b = data[(y * G + x) * 4 + 2];
              out.push({ u: (x + 0.5) / G, v: (y + 0.5) / G, color: `rgb(${r},${g},${b})` });
            }
          }
        }
      }
    } catch {
      /* tainted or not loaded: fall back to palette */
    }
    if (out.length === 0) {
      const [c0, c1] = T.colors[i];
      for (let k = 0; k < 64; k++)
        out.push({ u: ((k % 8) + 0.5) / 8, v: (Math.floor(k / 8) + 0.5) / 8, color: k % 2 ? c0 : c1 });
    }
    spriteSamples[i] = out;
    return out;
  };

  type Particle = { sx: number; sy: number; tx: number; ty: number; delay: number; color: string };
  const grids: Partial<Record<PanelKey, { cell: number; srcSize: number; parts: Particle[] }>> = {};
  const buildGrid = (k: PanelKey, owner: number, l: Landing) => {
    const vb = visibleBox(k);
    if (!vb) return null;
    const isPrimary = T.panels[owner][0] === k;
    const samples = sampleSprite(owner);
    const cell = Math.max(6, Math.ceil(Math.sqrt((vb.width * vb.height) / T.maxParticles)));
    const cols = Math.ceil(vb.width / cell);
    const rows = Math.ceil(vb.height / cell);
    // Source = the robot as it was at arrival (or the streak head for a secondary bar).
    const robotSize = isPrimary ? 72 * T.flightScale : 22;
    const parts: Particle[] = [];
    let maxD = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tx = vb.left + c * cell;
        const ty = vb.top + r * cell;
        const d = Math.hypot(tx - l.x, ty - l.y);
        if (d > maxD) maxD = d;
        const smp = samples[(r * cols + c) % samples.length];
        parts.push({
          sx: l.x - robotSize / 2 + smp.u * robotSize,
          sy: l.y - robotSize / 2 + smp.v * robotSize,
          tx,
          ty,
          delay: d, // normalised below
          color: smp.color,
        });
      }
    }
    // ordered stagger: a wave from the landing point outwards
    parts.forEach((pt) => (pt.delay = (pt.delay / maxD) * T.assembleStaggerMs));
    const g = { cell, srcSize: robotSize / T.spriteGrid, parts };
    grids[k] = g;
    return g;
  };

  const drawReassemble = (k: PanelKey, owner: number, l: Landing, tf: number, start: number) => {
    const el = animPanels[k];
    if (!el) return;
    const t = tf - start;
    const settle = T.assembleStaggerMs + T.assembleTravelMs;
    if (t < 0) {
      el.style.clipPath = "inset(50%)";
      return;
    }
    if (t >= settle + T.crossfadeMs) {
      el.style.clipPath = "";
      return;
    }
    const g = grids[k] ?? buildGrid(k, owner, l);
    if (!g || !ctx) return;
    // panel stays hidden while the grid builds, then crossfades in under it
    el.style.clipPath = t < settle ? "inset(50%)" : "";
    const fade = t < settle ? 1 : 1 - (t - settle) / T.crossfadeMs;
    ctx.globalAlpha = fade;
    for (let n = 0; n < g.parts.length; n++) {
      const pt = g.parts[n];
      const p = clamp01((t - pt.delay) / T.assembleTravelMs);
      const e = easeOutCubic(p);
      const size = lerp(g.srcSize, g.cell, e);
      ctx.fillStyle = pt.color;
      ctx.fillRect(lerp(pt.sx, pt.tx, e), lerp(pt.sy, pt.ty, e), size, size);
    }
    // faint frame once the grid has landed, so it reads as a window
    if (t >= settle) {
      const vb = visibleBox(k);
      if (vb) {
        ctx.strokeStyle = `rgba(255,255,255,${(0.8 * fade).toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(vb.left + 1, vb.top + 1, vb.width - 2, vb.height - 2);
      }
    }
    ctx.globalAlpha = 1;
  };

  (Object.keys(animPanels) as PanelKey[]).forEach((k) => {
    const el = animPanels[k];
    if (el && forward) el.style.clipPath = "inset(50%)";
  });
  if (!forward && opts.liveExpSection) opts.liveExpSection.style.opacity = "0";
  if (forward && !reduceMotion && opts.titleEl && opts.titleLength) {
    Object.assign(opts.titleEl.style, {
      display: "inline-block",
      maxWidth: "0ch",
      overflow: "hidden",
      whiteSpace: "nowrap",
      verticalAlign: "bottom",
    });
  }

  const renderAt = (tf: number) => {
    if (ctx) ctx.clearRect(0, 0, vw, vh);
    for (let i = 0; i < T.arrivals.length; i++) {
      const arr = T.arrivals[i];
      const start = arr - T.flightMs;
      const land = landings[i] ?? [];
      const target = land[0];
      const from = robotFrom[i];
      const el = robots[i];
      // --- robot ---
      if (el && from && target) {
        const fx0 = from.left + from.width / 2;
        const fy0 = from.top + from.height / 2;
        const base = from.width || 72;
        let x = fx0;
        let y = fy0;
        let scale = 1;
        let rot = 0;
        let alpha = 1;
        if (tf >= start && tf < arr - T.shrinkMs) {
          const ft = tf - start;
          if (ft < T.anticipationMs) {
            // wind-up: pull back away from target and squash
            const a = Math.sin((ft / T.anticipationMs) * Math.PI);
            const dx = target.x - fx0;
            const dy = target.y - fy0;
            const len = Math.hypot(dx, dy) || 1;
            x = fx0 - (dx / len) * 12 * a;
            y = fy0 - (dy / len) * 12 * a + 4 * a;
            scale = 1 - 0.1 * a;
          } else {
            const u = clamp01((ft - T.anticipationMs) / (T.flightMs - T.anticipationMs - T.shrinkMs));
            const e = easeInOutSine(u);
            const cx = (fx0 + target.x) / 2;
            const cy = Math.min(fy0, target.y) - 80;
            const inv = 1 - e;
            x = inv * inv * fx0 + 2 * inv * e * cx + e * e * target.x;
            y = inv * inv * fy0 + 2 * inv * e * cy + e * e * target.y;
            const vx = 2 * inv * (cx - fx0) + 2 * e * (target.x - cx);
            rot = Math.max(-12, Math.min(12, vx * 0.015)) * Math.sin(Math.PI * u);
            scale = 1 + (T.flightScale - 1) * Math.min(1, u * 2.5);
          }
        } else if (reassemble && tf >= arr - T.shrinkMs && tf < arr) {
          x = target.x;
          y = target.y;
          scale = T.flightScale;
        } else if (tf >= arr - T.shrinkMs && tf < arr) {
          const sp = (tf - (arr - T.shrinkMs)) / T.shrinkMs;
          x = target.x;
          y = target.y;
          scale = T.flightScale * (1 - 0.65 * sp);
          alpha = 1 - sp;
        } else if (tf >= arr) {
          alpha = 0;
        }
        el.style.width = `${base}px`;
        el.style.height = `${base}px`;
        el.style.transform = `translate3d(${(x - base / 2).toFixed(1)}px, ${(y - base / 2).toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotate(${rot.toFixed(2)}deg)`;
        el.style.opacity = alpha.toFixed(3);
        // robot collapses into a square of its own colour
        if (!reassemble && ctx && tf >= arr - T.shrinkMs && tf < arr) {
          const sp = (tf - (arr - T.shrinkMs)) / T.shrinkMs;
          const sz = lerp(base * 0.6, T.squarePx, sp);
          ctx.globalAlpha = sp;
          ctx.fillStyle = patterns[i] ?? "#fff";
          ctx.fillRect(target.x - sz / 2, target.y - sz / 2, sz, sz);
          ctx.globalAlpha = 1;
        }
      }
      // Pixel streak: Cursor's landing -> status bar (the visible cause).
      if (land.length > 1 && ctx && animPanels[land[1].panel]) {
        const a0 = land[0];
        const a1 = land[1];
        const sp = (tf - arr) / T.streakMs;
        if (sp > 0 && sp < 1.35) {
          const head = Math.min(1, sp);
          const tail = Math.max(0, sp - 0.35);
          const steps = 18;
          for (let q = 0; q <= steps; q++) {
            const u = tail + ((head - tail) * q) / steps;
            const px = Math.round((a0.x + (a1.x - a0.x) * u) / 2) * 2;
            const py = Math.round((a0.y + (a1.y - a0.y) * u) / 2) * 2;
            const w = q === steps ? 8 : 4 + (q / steps) * 3;
            ctx.globalAlpha = 0.35 + 0.65 * (q / steps);
            ctx.fillStyle = q === steps ? "#ffffff" : T.colors[i][q % 2];
            ctx.fillRect(px - w / 2 + (q % 2 ? 3 : -3), py - w / 2, w, w);
          }
          ctx.globalAlpha = 1;
        }
      }
    }
    // --- panels ---
    (Object.keys(animPanels) as PanelKey[]).forEach((k) => {
      const owner = panelOwner(k);
      if (owner < 0) return;
      const l = (landings[owner] ?? []).find((m) => m.panel === k);
      if (!l) return;
      const start =
        T.arrivals[owner] + (T.panels[owner].indexOf(k) > 0 ? T.streakMs : 0);
      if (reassemble) drawReassemble(k, owner, l, tf, start);
      else drawUnfold(k, owner, l, tf, start);
    });
    // --- title typing (forward only) ---
    if (forward && opts.titleEl && opts.titleLength) {
      const ts = T.arrivals[2] + 40;
      const n = Math.max(0, Math.floor((tf - ts) / T.titleCharMs));
      opts.titleEl.style.maxWidth = n >= opts.titleLength ? "none" : `${n}ch`;
    }
  };

  // ---------- loop ----------
  let raf = 0;
  let cancelled = false;
  let startTime = 0;
  let frames = 0;

  const cleanup = () => {
    snapLayer.remove();
    fx.remove();
    (["sidebar", "text", "media", "breadcrumb", "status"] as PanelKey[]).forEach((k) => {
      const el = opts.panels[k];
      if (el) el.style.clipPath = "";
    });
    if (opts.liveExpSection) opts.liveExpSection.style.opacity = "";
    if (opts.titleEl) {
      ["display", "maxWidth", "overflow", "whiteSpace", "verticalAlign"].forEach((p) =>
        opts.titleEl!.style.removeProperty(p.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)),
      );
    }
  };

  const step = (now: number) => {
    if (cancelled) return;
    frames++;
    // let React commit + layout settle for two frames, then measure once
    if (frames <= 2) {
      if (frames === 2) {
        measure();
        startTime = now;
      }
      if (frames === 1 && !forward) renderAt(duration); // reverse starts fully open
      raf = requestAnimationFrame(step);
      return;
    }
    const t = now - startTime;
    const raw = clamp01(t / duration);

    if (forward) {
      const f = clamp01(t / (reduceMotion ? duration : T.expFadeMs));
      snapLayer.style.opacity = (1 - f * f).toFixed(3);
    } else {
      const f = clamp01(t / (reduceMotion ? duration : T.expFadeMs + 100));
      snapBg.style.opacity = (1 - f).toFixed(3);
      if (opts.liveExpSection) opts.liveExpSection.style.opacity = f.toFixed(3);
      if (reduceMotion) snapLayer.style.opacity = (1 - f).toFixed(3);
    }

    if (reduceMotion) {
      (Object.keys(animPanels) as PanelKey[]).forEach((k) => {
        const el = animPanels[k];
        if (el) el.style.clipPath = forward ? "" : el.style.clipPath;
      });
    } else {
      renderAt(forward ? t : duration - t);
    }

    if (raw < 1) {
      raf = requestAnimationFrame(step);
      return;
    }
    cleanup();
    opts.onDone();
  };

  raf = requestAnimationFrame(step);

  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    cleanup();
  };
}
