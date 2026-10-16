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
  /** Per-robot flash size multiplier (Gemini's is modest). */
  flashScale: [0.6, 1, 1, 1],
  streakMs: 220,
  flightMs: 450,
  anticipationMs: 90,
  shrinkMs: 80,
  flashLeadMs: 40,
  flashMs: 260,
  flashRadius: 120,
  ringCount: 24,
  ringDistance: 110,
  revealMs: 320,
  scanMs: 250,
  expFadeMs: 380, // overlaps the first landing (450ms) so there is no empty frame
  tailMs: 60,
  flightScale: 1.4,
  titleCharMs: 22,
};

export const EXP_PROJECTS_DURATION_MS =
  Math.max(...EXP_PROJECTS_TIMELINE.arrivals) +
  EXP_PROJECTS_TIMELINE.revealMs +
  EXP_PROJECTS_TIMELINE.tailMs;

export const EXP_PROJECTS_REDUCED_MS = 400;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
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

  const scans: Partial<Record<PanelKey, HTMLDivElement>> = {};
  const makeScan = (k: PanelKey) => {
    const s = document.createElement("div");
    Object.assign(s.style, {
      position: "absolute",
      zIndex: "1",
      opacity: "0",
      backgroundImage:
        "linear-gradient(to bottom, rgba(234,255,244,0) 0%, rgba(234,255,244,0.95) 50%, rgba(77,255,176,0) 100%)," +
        "repeating-linear-gradient(to bottom, rgba(77,255,176,0.16) 0px, rgba(77,255,176,0.16) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)",
      backgroundRepeat: "no-repeat, repeat",
      backgroundSize: "100% 14px, 100% 100%",
      mixBlendMode: "screen",
    } as CSSStyleDeclaration);
    fx.appendChild(s);
    scans[k] = s;
  };
  document.body.appendChild(fx);

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
    (Object.keys(animPanels) as PanelKey[]).forEach((k) => {
      if (!scans[k] && animPanels[k]) makeScan(k);
      const b = panelBoxes[k];
      const s = scans[k];
      if (b && s) {
        Object.assign(s.style, {
          left: `${b.left}px`,
          top: `${b.top}px`,
          width: `${b.width}px`,
          height: `${b.height}px`,
        });
      }
    });
  };

  // Clip everything shut before first paint (forward) / start open (reverse).
  const panelOwner = (k: PanelKey) => T.panels.findIndex((ks) => ks.includes(k));
  const setPanel = (k: PanelKey, p: number, lx: number, ly: number) => {
    const el = animPanels[k];
    const b = panelBoxes[k];
    if (!el) return;
    if (p >= 1) {
      el.style.clipPath = "";
      return;
    }
    if (!b) {
      el.style.clipPath = "inset(50%)";
      return;
    }
    const rx = lx - b.left;
    const ry = ly - b.top;
    if (k === "breadcrumb" || k === "status") {
      const e = easeOutCubic(p);
      el.style.clipPath = `inset(0px ${((1 - e) * (b.width - rx)).toFixed(1)}px 0px ${((1 - e) * rx).toFixed(1)}px)`;
      return;
    }
    const far = Math.max(
      Math.hypot(rx, ry),
      Math.hypot(b.width - rx, ry),
      Math.hypot(rx, b.height - ry),
      Math.hypot(b.width - rx, b.height - ry),
    );
    el.style.clipPath = `circle(${(easeOutCubic(p) * far).toFixed(1)}px at ${rx.toFixed(1)}px ${ry.toFixed(1)}px)`;
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

  // ---------- frame renderer at forward-time tf ----------
  const drawFlash = (x: number, y: number, fp: number, seed: number, k = 1) => {
    if (!ctx || fp <= 0 || fp >= 1) return;
    const e = easeOutCubic(fp);
    const alpha = 1 - fp;
    const radius = (10 + e * (T.flashRadius - 10)) * k;
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, `rgba(255,255,255,${alpha})`);
    g.addColorStop(0.3, `rgba(234,255,244,${alpha * 0.9})`);
    g.addColorStop(0.7, `rgba(77,255,176,${alpha * 0.45})`);
    g.addColorStop(1, "rgba(77,255,176,0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    const colors = ["#ffffff", "#eafff4", "#4dffb0", "#a7f3d0"];
    const dist = (14 + e * (T.ringDistance - 14)) * k;
    ctx.globalAlpha = Math.min(1, alpha * 1.4);
    for (let k = 0; k < T.ringCount; k++) {
      const a = (k / T.ringCount) * Math.PI * 2 + seed * 0.37;
      const s = k % 3 === 0 ? 8 : k % 3 === 1 ? 7 : 6;
      const px = Math.round((x + Math.cos(a) * dist) / 2) * 2;
      const py = Math.round((y + Math.sin(a) * dist) / 2) * 2;
      ctx.fillStyle = colors[k % colors.length];
      ctx.fillRect(px - s / 2, py - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  };

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
      }
      // --- flashes (one per landing; Gemini gets two) ---
      // Pixel streak: Cursor's landing -> status bar (the visible cause).
      if (land.length > 1 && ctx && animPanels[land[1].panel]) {
        const a0 = land[0];
        const a1 = land[1];
        let sp = (tf - arr) / T.streakMs;
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
            ctx.fillStyle = q === steps ? "#ffffff" : q % 2 ? "#4dffb0" : "#eafff4";
            ctx.fillRect(px - w / 2 + (q % 2 ? 3 : -3), py - w / 2, w, w);
          }
          ctx.globalAlpha = 1;
        }
      }
      land.forEach((l, j) => {
        if (j > 0 && !animPanels[l.panel]) return;
        const fs = j === 0 ? arr - T.flashLeadMs : arr + T.streakMs - 20;
        let fp = (tf - fs) / T.flashMs;
        if (!forward) fp = 1 - fp; // play as a puff in real time
        drawFlash(l.x, l.y, fp, i * 4 + j, (T.flashScale[i] ?? 1) * (j === 0 ? 1 : 0.55));
      });
    }
    // --- panels + scanlines ---
    (Object.keys(animPanels) as PanelKey[]).forEach((k) => {
      const owner = panelOwner(k);
      if (owner < 0) return;
      const l = (landings[owner] ?? []).find((m) => m.panel === k);
      const arr =
        T.arrivals[owner] + (T.panels[owner].indexOf(k) > 0 ? T.streakMs : 0);
      const p = clamp01((tf - arr) / T.revealMs);
      if (l) setPanel(k, p, l.x, l.y);
      const s = scans[k];
      if (s) {
        const sp = (tf - arr) / T.scanMs;
        if (sp <= 0 || sp >= 1) {
          s.style.opacity = "0";
        } else {
          const bh = panelBoxes[k]?.height ?? 0;
          s.style.opacity = Math.sin(sp * Math.PI).toFixed(3);
          s.style.backgroundPosition = `0px ${(sp * bh - 7).toFixed(1)}px, 0px 0px`;
          s.style.clipPath = animPanels[k]?.style.clipPath ?? "";
        }
      }
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
