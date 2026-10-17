/**
 * Timed Projects <-> Contact transition ("zoom & portal", peace version).
 *
 * Imperative (no React state per frame), compositor-friendly: only transform
 * and opacity are animated; every bitmap effect is pre-baked once into small
 * canvases. Forward: Contact is mounted underneath with every block hidden; a
 * clone of the Projects UI sits on top.
 *
 *  0-1000 ms  camera push-in toward the photo square (Projects zooms + dims)
 *             while the avatar drifts from the Explorer onto the square,
 *             position and size eased with the zoom, ending exactly on the
 *             square's settled on-screen rect (scaled to fit).
 *  ~270 ms    CRT glitch on the avatar: pre-baked frames with horizontal
 *             slice offsets + RGB split + scanlines; the pose switches to the
 *             peace-sign sprite during it.
 *  ~280 ms    he holds the peace sign.
 *  then       the square switches on like a CRT (line -> vertical expand,
 *             flash behind him, scanlines over him), and a pixel transition
 *             (sprite pixelates, swaps, the portrait de-pixelates) turns the
 *             sprite into the peace portrait with the V hand / face roughly
 *             aligned; the rest of Contact reveals outward from the square.
 * Reverse plays the same timeline backwards on a clone of Contact while the
 * live Projects view zooms back out underneath.
 */

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

type Span = [number, number];

export const PROJECTS_CONTACT_TIMELINE = {
  /** Camera push-in toward the square + avatar drift onto it. */
  zoomMs: 1000,
  zoomScale: 1.7,
  /** Projects opacity at full zoom (dims instead of an animated blur). */
  zoomDim: 0.42,
  projectsOut: [560, 1000] as Span,
  /**
   * Glitch on arrival. Each step: [start, end, frame] where frame is
   * "g1" | "g2" | "g3" (baked glitch frames) | "old" | "peace" (clean pose).
   */
  glitch: [1000, 1270] as Span,
  glitchSteps: [
    [1000, 1050, "g1"],
    [1050, 1090, "old"],
    [1090, 1150, "g2"],
    [1150, 1185, "peace"],
    [1185, 1240, "g3"],
  ] as Array<[number, number, string]>,
  /** Peace hold: 1270-1550. CRT switch-on after it. */
  crtLine: [1550, 1600] as Span,
  crtExpand: [1600, 1700] as Span,
  crtFlashOut: [1600, 1820] as Span,
  scanlinesOut: [1630, 1950] as Span,
  /** Pixel transition sprite -> portrait (with the alignment zoom). */
  morph: [1660, 1960] as Span,
  /** Alignment: sprite scale at the end of the morph and the zoom origin
   *  (fractions of the square) that put his face / V hand over the
   *  portrait's. */
  morphScale: 1.7,
  morphOrigin: [0.46, 0] as [number, number],
  /** The rest of Contact, staggered by distance from the square. */
  revealStart: 1720,
  revealStaggerMs: 45,
  revealMs: 250,
  durationMs: 2200,
  reducedMs: 360,
};

const PEACE_SPRITE_SRC = "/avatar/peace.png";
const PORTRAIT_SRC = "/avatar_peace.png";
const PORTRAIT_BG = "#158a67";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, [a, b]: Span) => clamp01((t - a) / (b - a));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Images whose async decode has finished (drawing them never blocks). */
const decodedImgs = new WeakSet<HTMLImageElement>();
const ready = (img: HTMLImageElement) =>
  decodedImgs.has(img) && img.complete && img.naturalWidth > 0;

/** Small deterministic PRNG so the baked glitch frames are stable. */
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};

/** Solid-colour silhouette of a sprite (for the RGB-split fringes). */
const tint = (img: HTMLImageElement, w: number, h: number, color: string) => {
  const c = canvas(w, h);
  const g = c.getContext("2d")!;
  g.drawImage(img, 0, 0, w, h);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = color;
  g.fillRect(0, 0, w, h);
  return c;
};

/**
 * One glitch frame at the sprite's natural size: horizontal bands, each from
 * pose A or B, shifted sideways with red / cyan fringes, plus scanlines.
 */
interface Tints {
  ra: HTMLCanvasElement;
  rb: HTMLCanvasElement;
  ca: HTMLCanvasElement;
  cb: HTMLCanvasElement;
}
const bakeGlitch = (
  a: HTMLImageElement,
  b: HTMLImageElement,
  w: number,
  h: number,
  tints: Tints,
  pickB: (band: number, r: () => number) => boolean,
  seed: number,
) => {
  const r = rng(seed);
  const out = canvas(w, h);
  const g = out.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  const fr = { a: tints.ra, b: tints.rb };
  const fc = { a: tints.ca, b: tints.cb };
  let y = 0;
  let band = 0;
  while (y < h) {
    const bh = Math.min(h - y, Math.round(lerp(8, 38, r())));
    const useB = pickB(band, r);
    const src = useB ? b : a;
    const big = r() < 0.45;
    const dx = Math.round((r() < 0.5 ? -1 : 1) * (big ? lerp(5, 13, r()) : lerp(0, 3, r())));
    const split = big ? 3 : 2;
    g.globalAlpha = 0.65;
    g.drawImage(useB ? fc.b : fc.a, 0, y, w, bh, dx - split, y, w, bh);
    g.drawImage(useB ? fr.b : fr.a, 0, y, w, bh, dx + split, y, w, bh);
    g.globalAlpha = 1;
    g.drawImage(src, 0, y, w, bh, dx, y, w, bh);
    y += bh;
    band++;
  }
  // scanlines, only over the sprite's own pixels
  g.globalCompositeOperation = "source-atop";
  g.fillStyle = "rgba(0,0,0,0.28)";
  for (let sy = 0; sy < h; sy += 3) g.fillRect(0, sy, w, 1);
  return out;
};

/** Downsampled copy of an image (shown upscaled with pixelated rendering). */
const pixelLevel = (
  img: CanvasImageSource,
  w: number,
  h: number,
  bg?: string,
) => {
  const c = canvas(w, h);
  const g = c.getContext("2d")!;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  if (bg) {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.95;
  }
  g.drawImage(img, 0, 0, w, h);
  return c;
};

const toBox = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

/**
 * The element's settled layout rect: transforms (motion entrance scale / y,
 * hover lift, any ancestor entrance transform) and clip-path are stripped for
 * the measurement and restored synchronously, so nothing is painted.
 */
const finalBox = (el: HTMLElement): Box => {
  const touched: Array<[HTMLElement, string, string, string, string]> = [];
  for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) {
    const cs = getComputedStyle(n);
    const transformed =
      cs.transform !== "none" ||
      (cs.scale && cs.scale !== "none") ||
      (cs.translate && cs.translate !== "none") ||
      (cs.rotate && cs.rotate !== "none");
    if (!transformed && n !== el) continue;
    const st = n.style;
    touched.push([n, st.transform, st.scale, st.translate, st.rotate]);
    st.transform = "none";
    st.scale = "none";
    st.translate = "none";
    st.rotate = "none";
  }
  const box = toBox(el);
  touched.forEach(([n, tf, sc, tr, ro]) => {
    n.style.transform = tf;
    n.style.scale = sc;
    n.style.translate = tr;
    n.style.rotate = ro;
  });
  return box;
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
  let duration = reduce ? T.reducedMs : T.durationMs;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const layers: HTMLElement[] = [];
  // Only touch the DOM when a value actually changes (fewer style
  // invalidations per frame).
  const written = new WeakMap<HTMLElement, Record<string, string>>();
  const put = (el: HTMLElement, prop: string, value: string) => {
    let rec = written.get(el);
    if (!rec) written.set(el, (rec = {}));
    if (rec[prop] === value) return;
    rec[prop] = value;
    el.style.setProperty(prop, value);
  };
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
      willChange: "transform, opacity",
    } as CSSStyleDeclaration);
    layer.appendChild(zoom);
    placeClone(projectsEl, zoom);
    projectsEl = zoom;
  } else {
    styleLive(projectsEl);
    projectsEl.style.willChange = "transform, opacity";
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
  const photoImg =
    frame?.querySelector<HTMLImageElement>("[data-contact-photo-img]") ??
    frame?.querySelector<HTMLImageElement>("img") ??
    null;
  if (forward) {
    if (frame) styleLive(frame);
    if (photoImg) styleLive(photoImg);
    revealEls.forEach(styleLive);
  }
  // Decode the photo up front so it doesn't decode at the moment it lights up.
  frame
    ?.querySelectorAll("img")
    .forEach((img) => void img.decode?.().catch(() => {}));
  if (!reduce) {
    if (frame) frame.style.willChange = "transform, opacity";
    if (photoImg) photoImg.style.willChange = "opacity";
    revealEls.forEach((el) => (el.style.willChange = "transform, opacity"));
  }

  let frameBox: Box = frame
    ? finalBox(frame)
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
  // Never cut the last reveal short (it would pop on cleanup).
  if (!reduce && reveals.length)
    duration = Math.max(duration, reveals[reveals.length - 1].delay + T.revealMs);

  // ---------- CRT overlays on the square ----------
  // Behind the avatar: the flash (the screen lighting up). In front of him:
  // the switch-on line and the scanlines.
  const crtBack = makeLayer(frameBox, 164);
  crtBack.style.borderRadius = "1rem";
  const crtFront = makeLayer(frameBox, 168);
  crtFront.style.borderRadius = "1rem";
  const layerStyle = (extra: Partial<CSSStyleDeclaration>) =>
    ({
      position: "absolute",
      inset: "0",
      opacity: "0",
      willChange: "transform, opacity",
      ...extra,
    }) as CSSStyleDeclaration;
  const flash = document.createElement("div");
  Object.assign(
    flash.style,
    layerStyle({
      background:
        "radial-gradient(ellipse at center, rgba(236,253,245,0.95) 0%, rgba(52,211,153,0.85) 45%, rgba(16,185,129,0.4) 100%)",
      borderRadius: "1rem",
    }),
  );
  const scan = document.createElement("div");
  Object.assign(
    scan.style,
    layerStyle({
      background:
        "repeating-linear-gradient(to bottom, rgba(0,0,0,0.38) 0px, rgba(0,0,0,0.38) 1px, transparent 1px, transparent 3px)",
    }),
  );
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
    willChange: "transform, opacity",
  } as CSSStyleDeclaration);
  crtBack.append(flash);
  crtFront.append(scan, line);

  // ---------- images ----------
  const oldSrc = opts.avatar?.src ?? PEACE_SPRITE_SRC;
  const imgEl = (src: string) => {
    const i = document.createElement("img");
    i.alt = "";
    i.decoding = "async";
    i.src = src;
    // Off-main-thread decode; canvas baking waits for it, so drawImage
    // never forces a synchronous decode mid-animation.
    if (i.decode) void i.decode().then(() => decodedImgs.add(i), () => {});
    else decodedImgs.add(i);
    return i;
  };
  const oldImg = imgEl(oldSrc);
  const peaceImg = imgEl(PEACE_SPRITE_SRC);
  const portraitImg = imgEl(PORTRAIT_SRC);
  // The 1254px portrait is shrunk off the main thread (createImageBitmap with
  // resize); the pixel levels are then cut from that small copy.
  let portraitSmall: CanvasImageSource | null = null;
  if (!reduce) {
    const shrink = () => {
      const fallback = () => {
        const c = canvas(192, 192);
        const g = c.getContext("2d")!;
        g.imageSmoothingQuality = "high";
        g.drawImage(portraitImg, 0, 0, 192, 192);
        portraitSmall = c;
      };
      if (typeof createImageBitmap !== "function") return fallback();
      createImageBitmap(portraitImg, {
        resizeWidth: 192,
        resizeHeight: 192,
        resizeQuality: "high",
      }).then((bm) => (portraitSmall = bm), fallback);
    };
    if (portraitImg.decode) portraitImg.decode().then(shrink, () => {});
    else portraitImg.addEventListener("load", shrink, { once: true });
  }

  // ---------- free-flying avatar (drift phase) ----------
  const sprite = imgEl(oldSrc);
  sprite.setAttribute("data-pc-transition", "");
  sprite.setAttribute("aria-hidden", "true");
  const spriteLook = {
    imageRendering: "pixelated",
    filter: "drop-shadow(0 0 12px rgba(34,224,122,0.4))",
  };
  Object.assign(sprite.style, {
    position: "fixed",
    left: "0",
    top: "0",
    zIndex: "170",
    pointerEvents: "none",
    transformOrigin: "50% 100%",
    willChange: "transform, opacity",
    opacity: "0",
    ...spriteLook,
  } as CSSStyleDeclaration);
  if (opts.avatar && !reduce) {
    document.body.appendChild(sprite);
    layers.push(sprite);
  }

  // ---------- stage on the square: glitch, peace hold, pixel morph ----------
  // Clipped to the square. spriteBox sits where the avatar landed; every
  // frame variant is a stacked layer and only its opacity flips.
  const stage = makeLayer(frameBox, 166);
  stage.style.borderRadius = "1rem";
  stage.style.opacity = "0";
  stage.style.willChange = "opacity";
  const spriteBox = document.createElement("div");
  Object.assign(spriteBox.style, {
    position: "absolute",
    left: "0",
    top: "0",
    willChange: "transform",
    ...spriteLook,
  } as CSSStyleDeclaration);
  const portraitBox = document.createElement("div");
  Object.assign(portraitBox.style, {
    position: "absolute",
    inset: "0",
    willChange: "transform",
  } as CSSStyleDeclaration);
  stage.append(portraitBox, spriteBox);
  const fill = <E extends HTMLElement>(el: E): E => {
    Object.assign(el.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "100%",
      height: "100%",
      imageRendering: "pixelated",
      opacity: "0",
      willChange: "opacity",
    } as CSSStyleDeclaration);
    return el;
  };
  const sOld = fill(imgEl(oldSrc));
  const sPeace = fill(imgEl(PEACE_SPRITE_SRC));
  spriteBox.append(sOld, sPeace);
  // Filled in by bake() once the images are decoded.
  const glitchFrames: Record<string, HTMLCanvasElement> = {};
  const spriteLevels: HTMLCanvasElement[] = [];
  const portraitLevels: HTMLCanvasElement[] = [];
  // Baked incrementally, one small job per frame during the drift (the
  // main thread is idle then), so no single frame pays for all of it.
  let baked = false;
  const jobs: Array<() => void> = [];
  let jobsQueued = false;
  const queueJobs = () => {
    jobsQueued = true;
    const w = peaceImg.naturalWidth;
    const h = peaceImg.naturalHeight;
    const tints = {} as Tints;
    jobs.push(
      () => (tints.ra = tint(oldImg, w, h, "rgba(255,40,90,1)")),
      () => (tints.rb = tint(peaceImg, w, h, "rgba(255,40,90,1)")),
      () => (tints.ca = tint(oldImg, w, h, "rgba(40,235,255,1)")),
      () => (tints.cb = tint(peaceImg, w, h, "rgba(40,235,255,1)")),
      () => (glitchFrames.g1 = bakeGlitch(oldImg, peaceImg, w, h, tints, () => false, 7)),
      () => (glitchFrames.g2 = bakeGlitch(oldImg, peaceImg, w, h, tints, (i) => i % 2 === 1, 23)),
      () => (glitchFrames.g3 = bakeGlitch(oldImg, peaceImg, w, h, tints, (_, r) => r() > 0.15, 51)),
      ...[44, 22, 11].map((lw) => () => {
        spriteLevels.push(pixelLevel(peaceImg, lw, (lw * h) / w));
      }),
      ...[12, 24, 48, 96].map((n) => () => {
        portraitLevels.push(pixelLevel(portraitSmall!, n, n, PORTRAIT_BG));
      }),
      () => {
        Object.values(glitchFrames).forEach((c) => spriteBox.append(fill(c)));
        spriteLevels.forEach((c) => spriteBox.append(fill(c)));
        portraitLevels.forEach((c) => portraitBox.append(fill(c)));
        baked = true;
      },
    );
  };
  const bakeStep = () => {
    if (baked || reduce) return;
    if (!jobsQueued) {
      if (!ready(oldImg) || !ready(peaceImg) || !portraitSmall) return;
      queueJobs();
      return;
    }
    // ~3 ms of baking per frame at most.
    const until = performance.now() + 3;
    while (jobs.length && performance.now() < until) jobs.shift()!();
  };

  // Avatar keyframes: mini rect -> drift onto the square (scaled to fit).
  const a0 = opts.avatar?.box ?? {
    left: vw / 2 - 36,
    top: vh - 160,
    width: 72,
    height: 112,
  };
  const aspect = a0.width / Math.max(1, a0.height);
  const h0 = a0.height;
  const p0 = { x: a0.left + a0.width / 2, y: a0.top + a0.height };
  // The camera pushes in toward the square (its settled centre).
  const zoomOrigin = {
    x: frameBox.left + frameBox.width / 2,
    y: frameBox.top + frameBox.height / 2,
  };
  let h2 = 0;
  let w2 = 0;
  let p2 = { x: 0, y: 0 };
  let sbLeft = 0;
  let sbTop = 0;
  const placeTarget = () => {
    fcx = frameBox.left + frameBox.width / 2;
    fcy = frameBox.top + frameBox.height / 2;
    h2 = Math.min(frameBox.height, frameBox.width / Math.max(0.01, aspect));
    w2 = h2 * aspect;
    p2 = { x: fcx, y: frameBox.top + frameBox.height };
    // Sprite box laid out once at its landing size; the flight only scales.
    put(sprite, "width", `${w2}px`);
    put(sprite, "height", `${h2}px`);
    for (const l of [crtBack, crtFront, stage]) {
      put(l, "left", `${frameBox.left}px`);
      put(l, "top", `${frameBox.top}px`);
      put(l, "width", `${frameBox.width}px`);
      put(l, "height", `${frameBox.height}px`);
    }
    sbLeft = (frameBox.width - w2) / 2;
    sbTop = frameBox.height - h2;
    put(spriteBox, "left", `${sbLeft}px`);
    put(spriteBox, "top", `${sbTop}px`);
    put(spriteBox, "width", `${w2}px`);
    put(spriteBox, "height", `${h2}px`);
    const ox = T.morphOrigin[0] * frameBox.width;
    const oy = T.morphOrigin[1] * frameBox.height;
    put(spriteBox, "transform-origin", `${ox - sbLeft}px ${oy - sbTop}px`);
    put(portraitBox, "transform-origin", `${ox}px ${oy}px`);
  };
  placeTarget();
  // Forward: re-check the square's settled rect at a few checkpoints before
  // landing (each check forces a style/layout pass). Reverse: static clone.
  const checkpoints = forward && frame ? [250, 600, 900] : [];
  const remeasure = () => {
    if (!frame) return;
    const b = finalBox(frame);
    if (
      Math.abs(b.left - frameBox.left) < 0.5 &&
      Math.abs(b.top - frameBox.top) < 0.5 &&
      Math.abs(b.width - frameBox.width) < 0.5
    )
      return;
    frameBox = b;
    placeTarget();
  };
  const originX = zoomOrigin.x - opts.projectsBox.left;
  const originY = zoomOrigin.y - opts.projectsBox.top;

  const show = (el: HTMLElement | undefined, on: boolean) => {
    if (el) put(el, "opacity", on ? "1" : "0");
  };

  const render = (t: number) => {
    if (reduce) {
      const k = clamp01(t / duration);
      projectsEl.style.opacity = String(1 - k);
      revealEls.forEach((el) => (el.style.opacity = String(k)));
      if (frame) frame.style.opacity = String(k);
      return;
    }

    bakeStep();
    while (checkpoints.length && t >= checkpoints[0]) {
      checkpoints.shift();
      remeasure();
    }

    // Projects: camera push-in toward the square, dim, then fade away.
    const z = easeInOutCubic(seg(t, [0, T.zoomMs]));
    const out = seg(t, T.projectsOut);
    put(projectsEl, "transform-origin", `${originX}px ${originY}px`);
    put(projectsEl, "transform", `scale(${lerp(1, T.zoomScale, z).toFixed(4)})`);
    put(projectsEl, "opacity", (lerp(1, T.zoomDim, z) * (1 - out)).toFixed(3));

    // Drift (free sprite) until it lands; from then on the stage takes over
    // at the identical spot.
    const drifting = t < T.zoomMs;
    if (drifting) {
      const x = lerp(p0.x, p2.x, z);
      const y = lerp(p0.y, p2.y, z);
      const s = lerp(h0, h2, z) / Math.max(1, h2);
      put(
        sprite,
        "transform",
        `translate3d(${(x - w2 / 2).toFixed(2)}px, ${(y - h2).toFixed(2)}px, 0) scale(${s.toFixed(4)})`,
      );
    }
    show(sprite, drifting);

    // Morph progress (pixel transition + alignment zoom).
    const mk = seg(t, T.morph);
    const me = easeInOutCubic(mk);
    const portraitLive = mk >= 0.95;
    show(stage, !drifting && !portraitLive);

    // Which sprite frame is up.
    let frameKey = t < T.glitchSteps[0][0] ? "old" : "peace";
    for (const [a, b, key] of T.glitchSteps) if (t >= a && t < b) frameKey = key;
    if (!baked && frameKey.startsWith("g")) frameKey = t < 1150 ? "old" : "peace";
    // Sprite pixel level index (-1 = sharp) and portrait level index.
    const sLevel = mk <= 0 ? -1 : mk < 0.12 ? -1 : mk < 0.27 ? 0 : mk < 0.4 ? 1 : mk < 0.5 ? 2 : 3;
    const pLevel = mk < 0.5 ? -1 : mk < 0.6 ? 0 : mk < 0.72 ? 1 : mk < 0.84 ? 2 : mk < 0.95 ? 3 : 4;
    const spriteVisible = sLevel < 3 && baked ? true : !baked ? mk < 0.5 : false;
    show(sOld, spriteVisible && sLevel === -1 && frameKey === "old");
    show(sPeace, spriteVisible && sLevel === -1 && frameKey === "peace");
    for (const key of ["g1", "g2", "g3"])
      show(glitchFrames[key], spriteVisible && sLevel === -1 && frameKey === key);
    spriteLevels.forEach((c, i) => show(c, spriteVisible && sLevel === i));
    portraitLevels.forEach((c, i) => show(c, pLevel === i));
    // Glitch jitter of the whole sprite + alignment zoom during the morph.
    const jit =
      frameKey === "g1" ? -4 : frameKey === "g2" ? 5 : frameKey === "g3" ? -2 : 0;
    const sA = lerp(1, T.morphScale, me);
    put(
      spriteBox,
      "transform",
      `translate3d(${jit}px, 0, 0) scale(${sA.toFixed(4)})`,
    );
    put(portraitBox, "transform", `scale(${(sA / T.morphScale).toFixed(4)})`);

    // Photo square: the CRT "screen". Hidden until the line, expands
    // vertically from it; the real photo shows once the morph resolves.
    const ex = easeOutCubic(seg(t, T.crtExpand));
    const ey = Math.max(0.004, ex).toFixed(4);
    if (frame) {
      // 0.001, not 0: keeps the square + photo rasterised while hidden, so
      // they don't raster on the frame they appear.
      put(frame, "opacity", t >= T.crtLine[0] ? "1" : "0.001");
      put(frame, "transform", ex >= 1 ? "none" : `scaleY(${ey})`);
    }
    if (photoImg) put(photoImg, "opacity", portraitLive ? "" : "0.001");
    const lineK = seg(t, T.crtLine);
    put(
      line,
      "opacity",
      t < T.crtLine[0]
        ? "0"
        : (t < T.crtExpand[1]
            ? Math.min(1, lineK * 1.6) * (1 - seg(t, T.crtExpand))
            : 0
          ).toFixed(3),
    );
    put(line, "transform", `scaleX(${lineK.toFixed(3)})`);
    put(
      flash,
      "opacity",
      t < T.crtExpand[0] ? "0" : (1 - easeOutCubic(seg(t, T.crtFlashOut))).toFixed(3),
    );
    put(flash, "transform", `scaleY(${ey})`);
    put(
      scan,
      "opacity",
      t < T.crtExpand[0] ? "0" : (0.9 * (1 - seg(t, T.scanlinesOut))).toFixed(3),
    );

    // The rest of Contact, outward from the square (opacity + translate).
    reveals.forEach((r) => {
      const k = easeOutCubic(seg(t, [r.delay, r.delay + T.revealMs]));
      put(r.el, "opacity", k.toFixed(3));
      const off = 1 - k;
      put(
        r.el,
        "transform",
        off <= 0
          ? "none"
          : r.horizontal
            ? `translate3d(${((r.dx >= 0 ? -1 : 1) * 22 * off).toFixed(2)}px, 0, 0)`
            : `translate3d(0, ${((r.dy >= 0 ? -1 : 1) * 14 * off).toFixed(2)}px, 0)`,
      );
    });
  };

  render(forward ? 0 : duration);

  let raf = 0;
  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    layers.forEach((l) => l.remove());
    restore.forEach((fn) => fn());
  };
  // Timeline clock: driven by rAF timestamps, starting on the second frame so
  // the one-off cost of mounting / rasterising the new view lands on the
  // static first frame. A late frame advances at most ~2 frames so a hitch
  // never reads as a jump.
  let elapsed = 0;
  let last = 0;
  let warm = 0;
  const tick = (now: number) => {
    if (warm < 2) {
      warm++;
      last = now;
      bakeStep();
      raf = requestAnimationFrame(tick);
      return;
    }
    elapsed += Math.min(now - last, 34);
    last = now;
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
