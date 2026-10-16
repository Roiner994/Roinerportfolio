import { useEffect, useRef, type RefObject } from 'react';

/**
 * Scroll-linked "robot -> pixels -> CRT -> terminal" transition for the hero.
 *
 * All geometry is expressed in the 1280x720 video frame (hero.mp4 / hero.webm).
 * Values were measured by template-matching the cutout taken from
 * hero-final-nobeard.png (1670x941) against the video frames: the PNG maps to
 * the video at ~0.75 scale. The robot bobs between y=108..122 in the loop.
 * The video keeps playing during the transition: only the Cursor robot is
 * swapped for the static cutout, placed where the video robot is right now
 * (ROBOT_Y lookup) and eased to the canonical ROBOT box before it dissolves.
 */
export const VIDEO_W = 1280;
export const VIDEO_H = 720;
/** @deprecated the video no longer freezes; kept for reference. */
export const FREEZE_TIME = 5.0;
/** Video frame rate of hero.mp4 / hero.webm. */
const VIDEO_FPS = 24;
/**
 * Cutout top-left y (video px) per video frame (24 fps, 239 frames), measured
 * by masked template matching of robot-cursor.png against every frame of
 * hero.mp4. x stays at ~1103 (+-0.25 px) for the whole loop.
 */
const ROBOT_Y = [119.9,120.2,120.7,121.1,121.4,121.5,121.4,121.1,120.3,119.9,119.7,119.4,119.0,118.6,118.0,117.3,116.8,116.0,115.2,114.5,113.8,113.3,112.7,112.1,112.0,111.9,112.4,113.6,115.0,116.7,118.5,120.3,121.8,121.6,121.2,120.9,120.4,119.8,119.1,118.6,117.9,117.2,116.3,115.5,114.8,114.0,113.3,112.6,112.0,111.5,110.9,110.3,109.8,109.4,108.9,108.7,108.4,108.3,108.3,108.3,108.4,108.8,109.2,109.7,110.5,111.1,111.9,112.7,113.6,114.3,115.0,115.7,116.5,117.2,117.9,118.5,119.0,119.6,120.1,120.7,121.1,121.3,121.3,121.3,121.2,121.0,120.9,120.8,120.6,120.2,119.8,119.3,118.8,118.0,117.4,116.7,116.0,115.4,114.7,113.8,113.1,112.4,111.7,111.1,110.7,110.2,109.7,109.3,108.9,108.6,108.3,108.2,108.3,108.3,108.5,108.8,109.2,109.5,110.1,110.9,110.1,109.5,109.2,108.8,108.5,108.3,108.3,108.2,108.3,108.6,108.9,109.3,109.7,110.2,110.7,111.1,111.7,112.4,113.1,113.9,114.7,115.4,116.0,116.7,117.4,118.0,118.8,119.3,119.8,120.2,120.6,120.8,120.9,121.0,121.2,121.3,121.3,121.3,121.1,120.7,120.1,119.6,119.0,118.5,117.9,117.2,116.5,115.7,115.0,114.3,113.6,112.7,111.9,111.1,110.5,109.7,109.2,108.8,108.4,108.3,108.3,108.3,108.4,108.7,108.9,109.4,109.8,110.3,110.9,111.4,112.0,112.6,113.3,114.0,114.8,115.5,116.3,117.2,117.9,118.6,119.1,119.8,120.4,120.9,121.2,121.6,121.8,120.3,118.5,116.7,115.0,113.6,112.4,111.8,111.9,112.1,112.7,113.3,113.8,114.5,115.2,116.0,116.8,117.3,118.0,118.6,119.0,119.4,119.7,119.9,120.3,121.1,121.4,121.5,121.4,121.1,120.7,120.2,119.9];
/** Where the video robot's cutout box sits (y, video px) at time t seconds. */
export const robotYAt = (t: number) => {
  const n = ROBOT_Y.length;
  if (!Number.isFinite(t) || t < 0) return ROBOT_Y[0];
  const f = (t * VIDEO_FPS) % n;
  const i = Math.floor(f);
  const a = ROBOT_Y[i];
  const b = ROBOT_Y[Math.min(n - 1, i + 1)];
  return a + (b - a) * (f - i);
};

/** Robot cutout (public/hero/robot-cursor.png, 142x212 source px). */
export const ROBOT = { x: 1103, y: 110.5, w: 106.5, h: 159, srcW: 142, srcH: 212 };
/**
 * Background clean plate (public/hero/robot-patch.png, 123x189 at 1:1 video
 * px, feathered alpha) that hides the moving video robot over its whole bob
 * envelope (incl. thruster flame) while the video keeps playing underneath.
 * Built from the temporal median of uncovered pixels across all frames.
 */
export const PATCH = { x: 1095, y: 100, w: 123, h: 189 };
/** Inner CRT screen (the green terminal glass). */
/** Claude (orange) robot: head point the hint bubble's tail aims at. */
export const CLAUDE_HEAD = { x: 742, y: 104 };
type Box = { x: number; y: number; w: number; h: number };
/**
 * Robot bounding boxes in the 1280x720 video (measured from the PNG, mapped
 * at 0.755 scale, padded by 8 px for the loop's bob). Order: Claude, ChatGPT,
 * Gemini, Cursor. FACE_BOX is Roiner's head.
 */
export const ROBOT_BOXES: Box[] = [
  { x: 670, y: 98, w: 172, h: 214 },
  { x: 820, y: 33, w: 139, h: 217 },
  { x: 963, y: 40, w: 147, h: 205 },
  { x: 1096, y: 100, w: 125, h: 177 },
];
export const FACE_BOX: Box = { x: 835, y: 236, w: 140, h: 136 };
/** Left edge / middle of Claude's head (tail target for a left-side bubble). */
const CLAUDE_HEAD_LEFT = { x: 702, y: 140 };
export const CRT = { x: 1033, y: 290, w: 102, h: 90, cx: 1084, cy: 335 };

const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;
export const boxStyle = (b: { x: number; y: number; w: number; h: number }) => ({
  left: pct(b.x, VIDEO_W),
  top: pct(b.y, VIDEO_H),
  width: pct(b.w, VIDEO_W),
  height: pct(b.h, VIDEO_H),
});

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Particle = {
  ox: number; oy: number; // origin (video px)
  cx: number; cy: number; // bezier control
  r: number; g: number; b: number;
  delay: number;
};

const PIXEL = 4; // source px per particle block (=3 video px)
const MOBILE_PAN_FROM = 72;
const MOBILE_PAN_TO = 92;

export type HeroTransitionRefs = {
  section: RefObject<HTMLElement | null>;
  sticky: RefObject<HTMLDivElement | null>;
  stage: RefObject<HTMLDivElement | null>;
  video: RefObject<HTMLVideoElement | null>;
  frame: RefObject<HTMLDivElement | null>;
  robot: RefObject<HTMLImageElement | null>;
  patch: RefObject<HTMLImageElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  ui: RefObject<HTMLDivElement | null>;
  shades: RefObject<HTMLDivElement | null>;
  crt: RefObject<HTMLDivElement | null>;
  typed: RefObject<HTMLSpanElement | null>;
  menu: RefObject<HTMLDivElement | null>;
  bubble?: RefObject<HTMLDivElement | null>;
};

/** Default end-of-transition command; HeroVideo can retarget via getCommand. */
export const CRT_COMMAND = 'cd about';

export function useHeroCrtTransition(
  refs: HeroTransitionRefs,
  opts: {
    reduceMotion: boolean;
    canPlay: () => boolean;
    /** Command typed on the CRT (e.g. `cd about`). */
    getCommand: () => string;
    /** Time-based transition progress, 0 (hero) .. 1 (inside the CRT). */
    getProgress: () => number;
  },
) {
  const optsRef = useRef(opts);
  optsRef.current = opts;
  /** Call to re-render the scene after changing progress. */
  const renderRef = useRef<() => void>(() => {});

  useEffect(() => {
    const r = refs;
    let particles: Particle[] = [];
    let raf = 0;
    let base = { vx: 0, vy: 0, vw: 0, vh: 0, W: 0, H: 0, cover: false, posY: 0.5, posX: 1 };

    // ---- particles from the cutout --------------------------------------
    const img = new Image();
    img.src = '/hero/robot-cursor.png';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      const k = ROBOT.w / ROBOT.srcW;
      const list: Particle[] = [];
      for (let y = 0; y < c.height; y += PIXEL) {
        for (let x = 0; x < c.width; x += PIXEL) {
          const sx = Math.min(c.width - 1, x + (PIXEL >> 1));
          const sy = Math.min(c.height - 1, y + (PIXEL >> 1));
          const i = (sy * c.width + sx) * 4;
          if (data[i + 3] < 140) continue;
          const ox = ROBOT.x + x * k;
          const oy = ROBOT.y + y * k;
          const mx = (ox + CRT.cx) / 2;
          const my = (oy + CRT.cy) / 2;
          const swirl = (Math.random() - 0.3) * 90;
          list.push({
            ox, oy,
            cx: mx + swirl,
            cy: my - 20 - Math.random() * 40,
            r: data[i], g: data[i + 1], b: data[i + 2],
            // top of the robot breaks apart first, with some randomness
            delay: (y / c.height) * 0.3 + Math.random() * 0.3,
          });
        }
      }
      particles = list;
      schedule();
    };

    // ---- layout ----------------------------------------------------------
    const measure = () => {
      const stage = r.stage.current;
      const video = r.video.current;
      const sticky = r.sticky.current;
      if (!stage || !video || !sticky) return;
      const prev = stage.style.transform;
      stage.style.transform = 'none';
      video.style.objectPosition = '';
      const vr = video.getBoundingClientRect();
      const sr = sticky.getBoundingClientRect();
      stage.style.transform = prev;
      const cs = getComputedStyle(video);
      const [, py = '50%'] = cs.objectPosition.split(' ');
      const [px0] = cs.objectPosition.split(' ');
      base = {
        vx: vr.left - sr.left,
        vy: vr.top - sr.top,
        vw: vr.width,
        vh: vr.height,
        W: sr.width,
        H: sr.height,
        cover: cs.objectFit === 'cover',
        posX: parseFloat(px0) / 100 || 0,
        posY: parseFloat(py) / 100 || 0.5,
      };
      if (base.cover) base.posX = MOBILE_PAN_FROM / 100;
    };

    /** Rendered 1280x720 content rect inside the video element. */
    const contentRect = (posX: number) => {
      const s = base.cover
        ? Math.max(base.vw / VIDEO_W, base.vh / VIDEO_H)
        : Math.min(base.vw / VIDEO_W, base.vh / VIDEO_H);
      const cw = VIDEO_W * s;
      const ch = VIDEO_H * s;
      return { s, left: (base.vw - cw) * posX, top: (base.vh - ch) * base.posY, cw, ch };
    };

    // ---- hint bubble placement (never over a robot, the face or the UI) ---
    const placeBubble = (cr: { s: number; left: number; top: number }) => {
      const el = r.bubble?.current;
      if (!el) return;
      const bw = el.offsetWidth;
      const bh = el.offsetHeight;
      const s = cr.s;
      const ox = base.vx + cr.left;
      const oy = base.vy + cr.top;
      type R = { l: number; t: number; r: number; b: number };
      const toS = (b: Box): R => ({ l: ox + b.x * s, t: oy + b.y * s, r: ox + (b.x + b.w) * s, b: oy + (b.y + b.h) * s });
      const obstacles: R[] = [...ROBOT_BOXES, FACE_BOX].map(toS);
      const sticky = r.sticky.current?.getBoundingClientRect();
      const uiBox = (r.ui.current?.firstElementChild as HTMLElement | null)?.getBoundingClientRect();
      if (sticky && uiBox && uiBox.width) {
        obstacles.push({ l: uiBox.left - sticky.left, t: uiBox.top - sticky.top, r: uiBox.right - sticky.left, b: uiBox.bottom - sticky.top });
      }
      const claude = toS(ROBOT_BOXES[0]);
      const headL = { x: ox + CLAUDE_HEAD_LEFT.x * s, y: oy + CLAUDE_HEAD_LEFT.y * s };
      const headT = { x: ox + CLAUDE_HEAD.x * s, y: claude.t };
      const W = base.W;
      const H = base.H;
      const cands = [
        { l: claude.l - 6 - bw, t: headL.y - bh / 2, tail: 'right' },
        { l: claude.l - 6 - bw, t: claude.t - bh * 0.6, tail: 'right' },
        { l: claude.l + (claude.r - claude.l) * 0.25 - bw, t: claude.t - 14 - bh, tail: 'down' },
        { l: headT.x - bw * 0.5, t: claude.t - 14 - bh, tail: 'down' },
        { l: headT.x - bw * 0.85, t: claude.t - 14 - bh, tail: 'down' },
        // right edge tucked just left of the ChatGPT robot
        { l: toS(ROBOT_BOXES[1]).l - 4 - bw, t: claude.t - 14 - bh, tail: 'down' },
      ];
      const overlap = (a: R, b: R) =>
        Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) *
        Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
      let best = cands[0];
      let bestScore = Infinity;
      for (const c of cands) {
        c.l = Math.min(Math.max(8, c.l), W - bw - 8);
        c.t = Math.min(Math.max(8, c.t), H - bh - 8);
        const rect = { l: c.l, t: c.t, r: c.l + bw, b: c.t + bh };
        const score = obstacles.reduce((acc, o) => acc + overlap(rect, o), 0);
        if (score < bestScore) {
          best = c;
          bestScore = score;
        }
        if (score === 0) break;
      }
      el.style.left = `${best.l.toFixed(1)}px`;
      el.style.top = `${best.t.toFixed(1)}px`;
      el.dataset.tail = best.tail;
      // aim the tail at Claude's head
      if (best.tail === 'right') {
        el.style.setProperty('--tail-y', `${Math.min(bh - 10, Math.max(6, headL.y - best.t)).toFixed(1)}px`);
      } else {
        el.style.setProperty('--tail-x', `${Math.min(bw - 12, Math.max(6, headT.x - best.l)).toFixed(1)}px`);
      }
      el.style.visibility = 'visible';
    };

    // ---- per-frame update ------------------------------------------------
    const draw = (d: number, glow: number, s: number) => {
      const canvas = r.canvas.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, VIDEO_W, VIDEO_H);
      if (glow > 0.001) {
        ctx.fillStyle = `rgba(80,255,170,${(glow * 0.35).toFixed(3)})`;
        ctx.fillRect(CRT.x + 4, CRT.y + 4, CRT.w - 8, CRT.h - 8);
      }
      if (d <= 0 || d >= 1) return;
      // keep particles at least one screen pixel big
      const minSize = Math.max(1, Math.ceil(1 / Math.max(s, 0.0001)));
      for (const p of particles) {
        const t = clamp01((d - p.delay) / 0.4);
        if (t >= 1) continue;
        const e = t * t; // accelerate into the screen
        const u = 1 - e;
        const x = u * u * p.ox + 2 * u * e * p.cx + e * e * CRT.cx;
        const y = u * u * p.oy + 2 * u * e * p.cy + e * e * CRT.cy;
        const size = Math.max(minSize, Math.round(3 * (1 - e * 0.7)));
        ctx.globalAlpha = t > 0.85 ? 1 - (t - 0.85) / 0.15 : 1;
        // tint towards CRT phosphor green as the pixel is pulled in
        const m = e * 0.85;
        ctx.fillStyle = `rgb(${Math.round(p.r + (77 - p.r) * m)},${Math.round(p.g + (255 - p.g) * m)},${Math.round(p.b + (176 - p.b) * m)})`;
        ctx.fillRect(Math.round(x), Math.round(y), size, size);
      }
      ctx.globalAlpha = 1;
    };

    const update = () => {
      raf = 0;
      const video = r.video.current;
      if (!video) return;
      const { reduceMotion, canPlay } = optsRef.current;
      const p = clamp01(optsRef.current.getProgress());

      // The loop keeps playing through the transition (only the Cursor robot
      // is swapped for the cutout). Safety net: back on the hero, make sure
      // the loop is running.
      if (!reduceMotion && p <= 0.005 && video.paused && canPlay() && video.readyState >= 2) {
        video.play()?.catch(() => {});
      }

      const setOpacity = (el: HTMLElement | null, o: number) => {
        if (!el) return;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o <= 0.001 ? 'hidden' : 'visible';
      };

      if (reduceMotion) {
        const crr = contentRect(base.posX);
        if (r.frame.current) {
          r.frame.current.style.left = `${crr.left}px`;
          r.frame.current.style.top = `${crr.top}px`;
          r.frame.current.style.width = `${crr.cw}px`;
          r.frame.current.style.height = `${crr.ch}px`;
        }
        placeBubble(crr);
        const f = range(p, 0.25, 0.7);
        setOpacity(r.ui.current, 1 - f);
        setOpacity(r.crt.current, f);
        if (r.crt.current) r.crt.current.style.pointerEvents = f > 0.6 ? 'auto' : 'none';
        if (r.ui.current) r.ui.current.style.pointerEvents = f > 0.4 ? 'none' : '';
        if (r.typed.current) r.typed.current.textContent = optsRef.current.getCommand();
        setOpacity(r.menu.current, f);
        setOpacity(r.robot.current, 0);
        setOpacity(r.patch.current, 0);
        if (r.stage.current) r.stage.current.style.transform = 'none';
        return;
      }

      // 1) mobile: pan the cover crop so the robot + CRT are on screen
      const pan = easeInOut(range(p, 0, 0.12));
      const posX = base.cover
        ? (MOBILE_PAN_FROM + (MOBILE_PAN_TO - MOBILE_PAN_FROM) * pan) / 100
        : base.posX;
      if (base.cover) video.style.objectPosition = `${(posX * 100).toFixed(2)}% 50%`;
      const cr = contentRect(posX);
      const frame = r.frame.current;
      if (frame) {
        frame.style.left = `${cr.left}px`;
        frame.style.top = `${cr.top}px`;
        frame.style.width = `${cr.cw}px`;
        frame.style.height = `${cr.ch}px`;
      }

      placeBubble(cr);

      // 2) swap video robot -> cutout, 3) dissolve into pixels
      const swapped = p > 0.02;
      const d = range(p, 0.12, 0.45);
      setOpacity(r.patch.current, swapped ? 1 : 0);
      setOpacity(r.robot.current, swapped && d <= 0 ? 1 : 0);
      // cutout starts exactly where the (still playing) video robot is, then
      // eases to the canonical box the particles originate from
      if (r.robot.current && swapped && d <= 0) {
        const live = robotYAt(video.currentTime);
        const y = live + (ROBOT.y - live) * easeInOut(range(p, 0.02, 0.11));
        r.robot.current.style.top = pct(y, VIDEO_H);
      }

      // 4) dolly into the CRT screen
      const z = easeInOut(range(p, 0.42, 0.86));
      const sx = base.vx + cr.left + CRT.cx * cr.s;
      const sy = base.vy + cr.top + CRT.cy * cr.s;
      const zoom = Math.max(base.W / (CRT.w * cr.s), base.H / (CRT.h * cr.s)) * 1.12;
      const scale = 1 + (zoom - 1) * z;
      const tx = sx + (base.W / 2 - sx) * z - scale * sx;
      const ty = sy + (base.H / 2 - sy) * z - scale * sy;
      if (r.stage.current) {
        r.stage.current.style.transform =
          z > 0 ? `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${scale.toFixed(4)})` : 'none';
      }

      const glow = range(p, 0.25, 0.45) * (1 - range(p, 0.6, 0.8));
      draw(d, glow, cr.s * scale);

      const uiFade = range(p, 0.03, 0.2);
      setOpacity(r.ui.current, 1 - uiFade);
      if (r.ui.current) r.ui.current.style.pointerEvents = uiFade > 0.5 ? 'none' : '';
      setOpacity(r.shades.current, 1 - range(p, 0.25, 0.5));

      // 5) CRT terminal reveal + typing
      const c = range(p, 0.72, 0.82);
      setOpacity(r.crt.current, c);
      if (r.crt.current) r.crt.current.style.pointerEvents = c > 0.9 ? 'auto' : 'none';
      const k = range(p, 0.8, 0.93);
      if (r.typed.current) {
        const cmd = optsRef.current.getCommand();
        r.typed.current.textContent = cmd.slice(0, Math.round(k * cmd.length));
      }
      setOpacity(r.menu.current, range(p, 0.94, 0.97));
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // the animator already runs inside rAF, so render synchronously
    renderRef.current = update;
    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    update();
    window.addEventListener('resize', onResize);
    const video = r.video.current;
    video?.addEventListener('loadedmetadata', onResize);
    const ro = new ResizeObserver(onResize);
    if (r.sticky.current) ro.observe(r.sticky.current);

    return () => {
      cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
      video?.removeEventListener('loadedmetadata', onResize);
      ro.disconnect();
      if (video) video.style.objectPosition = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.reduceMotion]);

  return renderRef;
}
