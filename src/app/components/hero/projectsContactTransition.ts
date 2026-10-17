/**
 * Timed Projects <-> Contact transition ("zoom & portal").
 *
 * Imperative, same engine style as expProjectsTransition (no React state per
 * frame). Forward: Contact is already mounted underneath with every block
 * hidden; a clone of the Projects UI sits on top. The camera zooms toward
 * Roiner's small avatar in the Explorer while Projects dims and blurs, the
 * avatar grows toward the screen centre, hops, and jumps into the Contact
 * photo square. The square switches on like a CRT (line -> vertical expand,
 * flash + scanlines), the sprite crossfades into the photo and the rest of
 * Contact reveals outward from the square.
 * Reverse plays the same timeline backwards on a clone of Contact while the
 * live Projects view zooms back out underneath.
 */

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const PROJECTS_CONTACT_TIMELINE = {
  /** Camera zoom toward the avatar; Projects dims + blurs. */
  zoomMs: 640,
  zoomScale: 1.7,
  zoomBlurPx: 7,
  /** Projects fully gone by this time. */
  projectsOutMs: 1000,
  /** Avatar size at the screen centre, as a fraction of the photo square. */
  centreSize: 0.62,
  squash1: [640, 700] as [number, number],
  hop: [700, 880] as [number, number],
  hopPx: 26,
  squash2: [880, 940] as [number, number],
  jump: [940, 1320] as [number, number],
  jumpArcPx: 90,
  /** CRT switch-on inside the square. */
  crtLine: [1320, 1380] as [number, number],
  crtExpand: [1380, 1500] as [number, number],
  crtFlashOut: [1380, 1620] as [number, number],
  scanlinesOut: [1420, 1800] as [number, number],
  /** Sprite -> photo crossfade. */
  spriteFade: [1480, 1680] as [number, number],
  /** The rest of Contact, staggered by distance from the square. */
  revealStart: 1500,
  revealStaggerMs: 70,
  revealMs: 300,
  durationMs: 1900,
  reducedMs: 360,
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, [a, b]: [number, number]) => clamp01((t - a) / (b - a));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

const toBox = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

export interface RunProjectsContactOptions {
  direction: "forward" | "reverse";
  reduceMotion: boolean;
  /**
   * Projects UI. Forward: a clone (placed at `projectsBox`, on top).
   * Reverse: the live Projects root underneath (zoomed back out).
   */
  projects: HTMLElement;
  projectsBox: Box;
  /**
   * Contact content. Forward: the live content scroller underneath.
   * Reverse: a clone (placed at `contactBox`, on top).
   */
  contact: HTMLElement;
  contactBox: Box;
  /** Initial scroll offset to restore on the reverse Contact clone. */
  contactScrollTop?: number;
  /** Roiner's mini avatar in the Projects Explorer. */
  avatar: { src: string; box: Box } | null;
  onDone: () => void;
}

export function runProjectsContactTransition(
  opts: RunProjectsContactOptions,
): () => void {
  const T = PROJECTS_CONTACT_TIMELINE;
  const forward = opts.direction === "forward";
  const reduce = opts.reduceMotion;
  const duration = reduce ? T.reducedMs : T.durationMs;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const layers: HTMLElement[] = [];
  const restore: Array<() => void> = [];
  const styleLive = (el: HTMLElement) => {
    const prev = el.getAttribute("style");
    restore.push(() => {
      if (prev === null) el.removeAttribute("style");
      else el.setAttribute("style", prev);
    });
  };

  const makeLayer = (box: Box, z: number) => {
    const layer = document.createElement("div");
    layer.setAttribute("data-pc-transition", "");
    layer.setAttribute("aria-hidden", "true");
    Object.assign(layer.style, {
      position: "fixed",
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      overflow: "hidden",
      zIndex: String(z),
      pointerEvents: "none",
    } as CSSStyleDeclaration);
    document.body.appendChild(layer);
    layers.push(layer);
    return layer;
  };

  const placeClone = (node: HTMLElement, layer: HTMLElement) => {
    node.removeAttribute("id");
    node.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    Object.assign(node.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "100%",
      height: "100%",
      margin: "0",
    } as CSSStyleDeclaration);
    layer.appendChild(node);
  };

  // ---------- Projects side ----------
  let projectsEl = opts.projects;
  if (forward) {
    // Outer layer clips; the inner wrapper is what zooms / blurs / fades.
    const layer = makeLayer(opts.projectsBox, 150);
    const zoom = document.createElement("div");
    Object.assign(zoom.style, {
      position: "absolute",
      inset: "0",
      background: "#09090b",
      willChange: "transform, filter, opacity",
    } as CSSStyleDeclaration);
    layer.appendChild(zoom);
    placeClone(projectsEl, zoom);
    projectsEl = zoom;
  } else {
    styleLive(projectsEl);
  }

  // ---------- Contact side ----------
  let contactRoot = opts.contact;
  if (!forward) {
    const layer = makeLayer(opts.contactBox, 150);
    placeClone(contactRoot, layer);
    if (opts.contactScrollTop) contactRoot.scrollTop = opts.contactScrollTop;
  }
  const frame = contactRoot.querySelector<HTMLElement>("[data-contact-photo]");
  const revealEls = Array.from(
    contactRoot.querySelectorAll<HTMLElement>("[data-contact-reveal]"),
  );
  if (forward) {
    if (frame) styleLive(frame);
    revealEls.forEach(styleLive);
  }

  let frameBox: Box = frame
    ? toBox(frame)
    : { left: vw / 2 - 150, top: vh / 2 - 150, width: 300, height: 300 };
  let fcx = frameBox.left + frameBox.width / 2;
  let fcy = frameBox.top + frameBox.height / 2;

  // Reveal order and direction: outward from the square.
  const reveals = revealEls
    .map((el) => {
      const b = toBox(el);
      const cx = b.left + b.width / 2;
      const cy = b.top + b.height / 2;
      const dx = cx - fcx;
      const dy = cy - fcy;
      const horizontal =
        b.left >= frameBox.left + frameBox.width - 4 ||
        b.left + b.width <= frameBox.left + 4;
      return { el, dist: Math.hypot(dx, dy), dx, dy, horizontal };
    })
    .sort((a, b) => a.dist - b.dist)
    .map((r, i) => ({ ...r, delay: T.revealStart + i * T.revealStaggerMs }));

  // ---------- CRT overlays on the square ----------
  const crt = makeLayer(frameBox, 165);
  crt.style.borderRadius = "1rem";
  const flash = document.createElement("div");
  Object.assign(flash.style, {
    position: "absolute",
    inset: "0",
    background:
      "radial-gradient(ellipse at center, rgba(236,253,245,0.95) 0%, rgba(52,211,153,0.85) 45%, rgba(16,185,129,0.4) 100%)",
    opacity: "0",
  } as CSSStyleDeclaration);
  const scan = document.createElement("div");
  Object.assign(scan.style, {
    position: "absolute",
    inset: "0",
    background:
      "repeating-linear-gradient(to bottom, rgba(0,0,0,0.38) 0px, rgba(0,0,0,0.38) 1px, transparent 1px, transparent 3px)",
    opacity: "0",
  } as CSSStyleDeclaration);
  const line = document.createElement("div");
  Object.assign(line.style, {
    position: "absolute",
    left: "0",
    right: "0",
    top: "50%",
    height: "2px",
    marginTop: "-1px",
    background: "#ecfdf5",
    boxShadow: "0 0 18px 4px rgba(52,211,153,0.9)",
    opacity: "0",
  } as CSSStyleDeclaration);
  crt.append(flash, scan, line);

  // ---------- flying avatar ----------
  const sprite = document.createElement("img");
  sprite.setAttribute("data-pc-transition", "");
  sprite.alt = "";
  sprite.setAttribute("aria-hidden", "true");
  if (opts.avatar) sprite.src = opts.avatar.src;
  Object.assign(sprite.style, {
    position: "fixed",
    left: "0",
    top: "0",
    zIndex: "170",
    pointerEvents: "none",
    imageRendering: "pixelated",
    transformOrigin: "50% 100%",
    filter: "drop-shadow(0 0 12px rgba(34,224,122,0.4))",
    willChange: "transform, opacity",
    opacity: "0",
  } as CSSStyleDeclaration);
  if (opts.avatar && !reduce) {
    document.body.appendChild(sprite);
    layers.push(sprite);
  }

  // Avatar keyframes: mini rect -> screen centre -> square.
  const a0 = opts.avatar?.box ?? {
    left: vw / 2 - 36,
    top: vh - 160,
    width: 72,
    height: 112,
  };
  const aspect = a0.width / Math.max(1, a0.height);
  const h0 = a0.height;
  const h1 = frameBox.height * T.centreSize;
  let h2 = frameBox.height * 0.94;
  // bottom-centre anchors
  const p0 = { x: a0.left + a0.width / 2, y: a0.top + a0.height };
  const p1 = { x: vw / 2, y: vh / 2 + h1 / 2 };
  let p2 = { x: fcx, y: frameBox.top + frameBox.height };
  // Forward: Contact has just mounted and its photo card is still running its
  // own entrance scale; measure the square again before the avatar jumps.
  let remeasured = !forward || !frame;
  const remeasure = () => {
    remeasured = true;
    if (!frame) return;
    const prevClip = frame.style.clipPath;
    frame.style.clipPath = "";
    frameBox = toBox(frame);
    frame.style.clipPath = prevClip;
    fcx = frameBox.left + frameBox.width / 2;
    fcy = frameBox.top + frameBox.height / 2;
    h2 = frameBox.height * 0.94;
    p2 = { x: fcx, y: frameBox.top + frameBox.height };
    Object.assign(crt.style, {
      left: `${frameBox.left}px`,
      top: `${frameBox.top}px`,
      width: `${frameBox.width}px`,
      height: `${frameBox.height}px`,
    } as CSSStyleDeclaration);
  };
  const originX = p0.x - opts.projectsBox.left;
  const originY = p0.y - a0.height / 2 - opts.projectsBox.top;

  const render = (t: number) => {
    if (reduce) {
      const k = clamp01(t / duration);
      projectsEl.style.opacity = String(1 - k);
      revealEls.forEach((el) => (el.style.opacity = String(k)));
      if (frame) frame.style.opacity = String(k);
      return;
    }

    if (!remeasured && t >= T.hop[0]) remeasure();

    // Projects: zoom toward the avatar, dim, blur, then fade away.
    const z = easeInOutCubic(seg(t, [0, T.zoomMs]));
    const out = seg(t, [T.zoomMs - 120, T.projectsOutMs]);
    projectsEl.style.transformOrigin = `${originX}px ${originY}px`;
    projectsEl.style.transform = `scale(${lerp(1, T.zoomScale, z)})`;
    projectsEl.style.filter = `blur(${(T.zoomBlurPx * z).toFixed(2)}px) brightness(${lerp(1, 0.7, z).toFixed(3)})`;
    projectsEl.style.opacity = String(lerp(1, 0.5, z) * (1 - out));

    // Avatar path.
    let x: number;
    let y: number;
    let h: number;
    let sx = 1;
    let sy = 1;
    if (t <= T.zoomMs) {
      const k = easeInOutCubic(seg(t, [0, T.zoomMs]));
      x = lerp(p0.x, p1.x, k);
      y = lerp(p0.y, p1.y, k);
      h = lerp(h0, h1, k);
    } else if (t < T.jump[0]) {
      x = p1.x;
      y = p1.y;
      h = h1;
      const q1 = seg(t, T.squash1);
      const q2 = seg(t, T.squash2);
      const squash =
        t < T.hop[0]
          ? Math.sin(Math.PI * q1) * 0.12
          : t >= T.squash2[0]
            ? Math.sin(Math.PI * q2) * 0.14
            : 0;
      sy = 1 - squash;
      sx = 1 + squash * 0.7;
      y -= Math.sin(Math.PI * seg(t, T.hop)) * T.hopPx;
    } else {
      const k = seg(t, T.jump);
      const e = easeInOutSine(k);
      x = lerp(p1.x, p2.x, e);
      y = lerp(p1.y, p2.y, e) - Math.sin(Math.PI * k) * T.jumpArcPx;
      h = lerp(h1, h2, easeOutCubic(k));
      // stretch on take-off, settle on landing
      sy = 1 + Math.sin(Math.PI * k) * 0.06;
      sx = 1 - Math.sin(Math.PI * k) * 0.04;
    }
    const w = h * aspect;
    sprite.style.width = `${w}px`;
    sprite.style.height = `${h}px`;
    sprite.style.transform = `translate3d(${x - w / 2}px, ${y - h}px, 0) scale(${sx}, ${sy})`;
    sprite.style.opacity = String(1 - seg(t, T.spriteFade));

    // Photo square: hidden until the CRT line, then expands vertically.
    if (frame) {
      const ex = easeOutCubic(seg(t, T.crtExpand));
      const inset = 50 * (1 - ex);
      const on = t >= T.crtLine[0];
      frame.style.opacity = on ? "1" : "0";
      frame.style.clipPath = `inset(${inset.toFixed(2)}% 0 ${inset.toFixed(2)}% 0 round 1rem)`;
    }
    const lineK = seg(t, T.crtLine);
    line.style.opacity =
      t < T.crtLine[0] ? "0" : String(t < T.crtExpand[1] ? Math.min(1, lineK * 1.6) * (1 - seg(t, T.crtExpand)) : 0);
    line.style.transform = `scaleX(${lineK.toFixed(3)})`;
    flash.style.opacity =
      t < T.crtExpand[0] ? "0" : String(1 - easeOutCubic(seg(t, T.crtFlashOut)));
    flash.style.clipPath = frame ? frame.style.clipPath : "";
    scan.style.opacity =
      t < T.crtExpand[0] ? "0" : String(0.9 * (1 - seg(t, T.scanlinesOut)));

    // The rest of Contact, outward from the square.
    reveals.forEach((r) => {
      const k = easeOutCubic(seg(t, [r.delay, r.delay + T.revealMs]));
      r.el.style.opacity = String(k);
      const hide = (100 * (1 - k)).toFixed(2);
      if (r.horizontal) {
        r.el.style.clipPath =
          r.dx >= 0 ? `inset(0 ${hide}% 0 0)` : `inset(0 0 0 ${hide}%)`;
        r.el.style.transform = `translateX(${((r.dx >= 0 ? -1 : 1) * 14 * (1 - k)).toFixed(2)}px)`;
      } else {
        r.el.style.clipPath =
          r.dy >= 0 ? `inset(0 0 ${hide}% 0)` : `inset(${hide}% 0 0 0)`;
        r.el.style.transform = `translateY(${((r.dy >= 0 ? -1 : 1) * 10 * (1 - k)).toFixed(2)}px)`;
      }
    });
  };

  render(forward ? 0 : duration);

  let raf = 0;
  let done = false;
  const start = performance.now();
  const cleanup = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    layers.forEach((l) => l.remove());
    restore.forEach((fn) => fn());
  };
  const tick = () => {
    const elapsed = performance.now() - start;
    const t = forward ? elapsed : duration - elapsed;
    render(Math.max(0, Math.min(duration, t)));
    if (elapsed >= duration) {
      cleanup();
      opts.onDone();
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return cleanup;
}
