/**
 * Contact -> AI "CRT power-off" transition (and its mirror, AI -> Contact).
 *
 * Forward: the peace portrait in Contact's photo square collapses vertically
 * into a bright horizontal line, then horizontally into a glowing dot (brief
 * white flash) while Contact fades to black. The view swaps to the AI terminal
 * underneath the black, the dot holds a beat, then travels to the measured
 * position of the AI input's cursor and becomes it, and the terminal fades in
 * from there (its welcome line is already typing).
 *
 * Same engine rules as projectsContactTransition: imperative rAF loop, only
 * transform / opacity are animated (will-change layers), style writes are
 * cached, no per-frame layout reads (rects are measured at a few checkpoints).
 */

export interface CaBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

type Span = readonly [number, number];

export const CONTACT_AI_TIMELINE = {
  dim: [0, 420] as Span, // Contact -> black
  collapseY: [60, 280] as Span, // portrait -> horizontal line
  whiten: [60, 240] as Span, // portrait washes out to white while collapsing
  collapseX: [280, 440] as Span, // line -> dot
  flash: [270, 420] as Span, // brief full-screen white flash
  flashPeak: 0.22,
  swapForward: 440, // Contact -> AI (screen is fully black)
  hold: [440, 640] as Span, // dot holds / pulses
  move: [640, 920] as Span, // dot -> AI input cursor
  toCursor: [850, 930] as Span, // dot crossfades into a cursor block
  reveal: [920, 1250] as Span, // black -> AI terminal (from the cursor)
  cursorOut: [1000, 1100] as Span, // overlay cursor hands over to the real one
  revealScale: 0.985,
  durationMs: 1300,
  reducedMs: 340,
  dotPx: 34, // dot sprite incl. glow
  lineH: 3,
} as const;

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, [a, b]: Span) => clamp01((t - a) / (b - a));
const easeInCubic = (t: number) => t * t * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const toBox = (el: Element): CaBox => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

export interface RunContactAiOptions {
  direction: "forward" | "reverse";
  reduceMotion: boolean;
  /** Contact photo frame ([data-contact-photo]); null until mounted. */
  getPhoto: () => HTMLElement | null;
  /** AI input cursor ([data-ai-cursor]); null until mounted. */
  getCursor: () => HTMLElement | null;
  /** AI terminal root ([data-ai-terminal]). */
  getAiRoot: () => HTMLElement | null;
  /** Switch the React view (called once, while the screen is black). */
  onSwap: () => void;
  onDone: () => void;
}

export function runContactAiTransition(opts: RunContactAiOptions): () => void {
  const T = CONTACT_AI_TIMELINE;
  const forward = opts.direction === "forward";
  const reduce = opts.reduceMotion;
  const D = reduce ? T.reducedMs : T.durationMs;
  // Reverse plays the forward timeline backwards (f = D - s); it swaps once
  // the AI terminal is fully black, right before the dot starts travelling.
  const swapAt = reduce ? 160 : forward ? T.swapForward : D - T.move[1];
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const layers: HTMLElement[] = [];
  const restore: Array<() => void> = [];
  const written = new WeakMap<HTMLElement, Record<string, string>>();
  const put = (el: HTMLElement, prop: string, value: string) => {
    let rec = written.get(el);
    if (!rec) written.set(el, (rec = {}));
    if (rec[prop] === value) return;
    rec[prop] = value;
    el.style.setProperty(prop, value);
  };
  const styleLive = (el: HTMLElement) => {
    const prev = el.getAttribute("style");
    restore.push(() => {
      if (prev === null) el.removeAttribute("style");
      else el.setAttribute("style", prev);
    });
  };
  const layer = (z: number, css: Partial<CSSStyleDeclaration>) => {
    const el = document.createElement("div");
    el.setAttribute("data-pc-transition", "contact-ai");
    el.setAttribute("aria-hidden", "true");
    Object.assign(el.style, {
      position: "fixed",
      left: "0px",
      top: "0px",
      pointerEvents: "none",
      zIndex: String(z),
      opacity: "0",
      willChange: "transform, opacity",
      contain: "strict",
    } as Partial<CSSStyleDeclaration>, css);
    document.body.appendChild(el);
    layers.push(el);
    return el;
  };

  // ---------- layers ----------
  const dim = layer(160, { width: `${vw}px`, height: `${vh}px`, background: "#050506" });
  const flash = reduce
    ? null
    : layer(162, { width: `${vw}px`, height: `${vh}px`, background: "#ffffff" });

  // The CRT picture, beam and dot are only needed for the full version.
  let stage: HTMLElement | null = null;
  let white: HTMLElement | null = null;
  let beam: HTMLElement | null = null;
  let dot: HTMLElement | null = null;
  let cur: HTMLElement | null = null;
  if (!reduce) {
    // The CRT picture is a snapshot of the photo frame (added once found).
    stage = layer(166, { overflow: "hidden" });
    white = document.createElement("div");
    Object.assign(white.style, {
      position: "absolute",
      inset: "0",
      background: "#f4fff9",
      opacity: "0",
      willChange: "opacity",
    } as Partial<CSSStyleDeclaration>);
    stage.append(white);
    beam = layer(167, {
      height: `${T.lineH}px`,
      background: "#ffffff",
      borderRadius: "2px",
      boxShadow: "0 0 6px 1px #ffffff, 0 0 18px 4px rgba(0,212,146,0.75)",
      contain: "layout paint",
    });
    const d = T.dotPx;
    dot = layer(170, {
      width: `${d}px`,
      height: `${d}px`,
      borderRadius: "50%",
      background:
        "radial-gradient(circle, #ffffff 0 18%, rgba(190,255,232,0.95) 26%, rgba(0,212,146,0.75) 40%, rgba(0,212,146,0.18) 58%, rgba(0,212,146,0) 70%)",
    });
    cur = layer(169, {
      background: "#00d492",
      boxShadow: "0 0 10px rgba(0,212,146,0.65)",
      contain: "layout paint",
    });
  }

  // ---------- measurements (checkpoints only) ----------
  let photoEl: HTMLElement | null = null;
  let photo: CaBox | null = null;
  let radius = "0px";
  let cursorEl: HTMLElement | null = null;
  let cursor: CaBox | null = null;
  let aiRoot: HTMLElement | null = null;
  let aiBox: CaBox | null = null;
  const remeasured = new Set<number>();

  const grabPhoto = () => {
    const el = opts.getPhoto();
    if (!el) return;
    if (el !== photoEl) {
      photoEl = el;
      styleLive(el);
      // 0.001, not 0: keeps it rasterized so un-hiding it costs no frame.
      el.style.opacity = "0.001";
      radius = getComputedStyle(el).borderRadius;
      if (stage && white) {
        stage.querySelector("[data-ca-clone]")?.remove();
        const clone = el.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-ca-clone", "");
        clone.removeAttribute("data-contact-photo");
        clone.querySelectorAll("[data-contact-photo-img]").forEach((n) =>
          n.removeAttribute("data-contact-photo-img"),
        );
        Object.assign(clone.style, {
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          margin: "0",
          opacity: "1",
          transform: "none",
          boxShadow: "none",
        } as Partial<CSSStyleDeclaration>);
        stage.insertBefore(clone, white);
      }
    }
    const b = toBox(el);
    if (b.width > 0) photo = b;
  };
  const grabAi = () => {
    const c = opts.getCursor();
    if (c) {
      cursorEl = c;
      const b = toBox(c);
      if (b.width > 0) cursor = b;
    }
    const r = opts.getAiRoot();
    if (r && r !== aiRoot) {
      aiRoot = r;
      styleLive(r);
      r.style.willChange = "transform, opacity";
    }
    if (aiRoot) aiBox = toBox(aiRoot);
  };

  const onContactSide = () => (forward ? !swapped : swapped);
  let swapped = false;

  if (onContactSide()) grabPhoto();
  else grabAi();

  const placeStage = () => {
    if (!stage || !beam || !photo) return;
    put(stage, "left", `${photo.left}px`);
    put(stage, "top", `${photo.top}px`);
    put(stage, "width", `${photo.width}px`);
    put(stage, "height", `${photo.height}px`);
    put(stage, "border-radius", radius);
    put(beam, "left", `${photo.left}px`);
    put(beam, "top", `${photo.top + photo.height / 2 - T.lineH / 2}px`);
    put(beam, "width", `${photo.width}px`);
  };
  placeStage();

  const center = (b: CaBox | null) =>
    b ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : { x: vw / 2, y: vh / 2 };

  // ---------- frame ----------
  const render = (s: number) => {
    // f = position on the forward timeline.
    const f = forward ? s : D - s;

    if (reduce) {
      const o = f < 160 ? easeOutCubic(seg(f, [0, 150])) : 1 - easeOutCubic(seg(f, [180, 330]));
      put(dim, "opacity", o.toFixed(3));
      return;
    }

    // Contact -> black, black -> AI.
    const dimIn = easeInCubic(seg(f, T.dim)) * 0.6 + seg(f, T.dim) * 0.4;
    const dimOut = easeInOutCubic(seg(f, T.reveal));
    const dimO = f < T.reveal[0] ? dimIn : 1 - dimOut;
    put(dim, "opacity", dimO.toFixed(3));

    // Flash: quick rise, slower decay.
    const fl = seg(f, T.flash);
    const flO = fl <= 0 || fl >= 1 ? 0 : fl < 0.2 ? fl / 0.2 : 1 - easeOutCubic((fl - 0.2) / 0.8);
    put(flash!, "opacity", (flO * T.flashPeak).toFixed(3));

    // Portrait -> line.
    const cy = easeInCubic(seg(f, T.collapseY));
    const stageOn = f < T.collapseY[1] && !!photo;
    put(stage!, "opacity", stageOn ? "1" : "0");
    if (stageOn && photo) {
      const sy = Math.max(T.lineH / photo.height, 1 - cy);
      put(stage!, "transform", `scale3d(${lerp(1, 1.04, cy).toFixed(4)},${sy.toFixed(4)},1)`);
      put(white!, "opacity", easeOutCubic(seg(f, T.whiten)).toFixed(3));
    }

    // Line -> dot.
    const beamOn = f >= T.collapseY[1] - 8 && f < T.collapseX[1] && !!photo;
    put(beam!, "opacity", beamOn ? "1" : "0");
    if (beamOn && photo) {
      const cx = easeInCubic(seg(f, T.collapseX));
      const minX = (T.dotPx * 0.45) / photo.width;
      put(beam!, "transform", `scale3d(${Math.max(minX, 1 - cx).toFixed(4)},1,1)`);
    }

    // Dot: hold + travel to the cursor.
    const dotOn = f >= T.collapseX[1] - 30 && f < T.cursorOut[1];
    const p0 = center(photo);
    const p1 = cursor ? center(cursor) : p0;
    const mv = easeInOutCubic(seg(f, T.move));
    const x = lerp(p0.x, p1.x, mv);
    const y = lerp(p0.y, p1.y, mv);
    const born = easeOutCubic(seg(f, [T.collapseX[1] - 30, T.collapseX[1] + 20]));
    const pulse = 1 + 0.18 * Math.sin(seg(f, T.hold) * Math.PI * 2);
    const tc = easeInOutCubic(seg(f, T.toCursor));
    const dotScale = lerp(0.5, 1, born) * (f < T.hold[1] ? pulse : lerp(1, 0.75, mv));
    put(dot!, "opacity", dotOn ? ((1 - tc) * (0.6 + 0.4 * born)).toFixed(3) : "0");
    put(
      dot!,
      "transform",
      `translate3d(${(x - T.dotPx / 2).toFixed(2)}px,${(y - T.dotPx / 2).toFixed(2)}px,0) scale(${dotScale.toFixed(4)})`,
    );

    // Cursor block takes over from the dot, then hands over to the real one.
    if (cursor) {
      put(cur!, "width", `${cursor.width}px`);
      put(cur!, "height", `${cursor.height}px`);
      put(cur!, "transform", `translate3d(${(x - cursor.width / 2).toFixed(2)}px,${(y - cursor.height / 2).toFixed(2)}px,0)`);
      put(cur!, "opacity", (tc * (1 - seg(f, T.cursorOut))).toFixed(3));
    }

    // AI terminal grows in from its cursor.
    if (aiRoot && aiBox && cursor) {
      const r = easeOutCubic(seg(f, T.reveal));
      const ox = center(cursor).x - aiBox.left;
      const oy = center(cursor).y - aiBox.top;
      put(aiRoot, "transform-origin", `${ox.toFixed(1)}px ${oy.toFixed(1)}px`);
      put(aiRoot, "transform", `scale(${lerp(T.revealScale, 1, r).toFixed(4)})`);
    }
  };

  // ---------- clock ----------
  let raf = 0;
  let last = -1;
  let warm = 0;
  let s = 0;
  let done = false;

  const cleanup = () => {
    cancelAnimationFrame(raf);
    layers.forEach((l) => l.remove());
    restore.forEach((fn) => fn());
  };

  const tick = (now: number) => {
    if (done) return;
    if (last < 0 || warm < 2) {
      warm++;
      last = now;
      render(0);
      raf = requestAnimationFrame(tick);
      return;
    }
    s += Math.min(34, now - last);
    last = now;

    if (!swapped && s >= swapAt) {
      swapped = true;
      opts.onSwap();
    }
    // Pick up the newly mounted side and re-measure at a few checkpoints.
    const f = forward ? s : D - s;
    if (swapped) {
      if (onContactSide()) {
        if (!photo || !photoEl) grabPhoto();
        else
          for (const cp of [80, 260]) {
            if (!remeasured.has(cp) && s - swapAt >= cp) {
              remeasured.add(cp);
              grabPhoto();
            }
          }
        placeStage();
      } else {
        if (!cursorEl || !aiRoot) grabAi();
        else if (!remeasured.has(1) && f >= T.move[0] - 20) {
          remeasured.add(1);
          grabAi();
        }
      }
    }

    render(Math.min(s, D));
    if (s >= D) {
      done = true;
      cleanup();
      opts.onDone();
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    if (done) return;
    done = true;
    if (!swapped) opts.onSwap();
    cleanup();
    opts.onDone();
  };
}
