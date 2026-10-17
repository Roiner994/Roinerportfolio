import { motion, useReducedMotion } from "motion/react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

/**
 * The four agent robots (Gemini, Claude, ChatGPT, Cursor) hanging around the
 * ask-roiner AI terminal: two in the empty area left of the column, two on the
 * right. Idle they float, glance and blink. When a question is sent, ONE of
 * them (round-robin, starting with Claude) takes it: it leans toward the
 * terminal, bobs faster, glows and shows a thought bubble while /api/chat is
 * thinking; the other three keep idling. When the reply arrives that robot
 * recoils and fires a pixel beam into the new reply line; on impact a small
 * pixel burst plays and the reply starts typing (onImpact).
 *
 * Only transform / opacity are animated (CSS keyframes + one motion entrance),
 * so it all stays on the compositor. prefers-reduced-motion: static robots,
 * the bubble still shows (without motion).
 */

type Side = "left" | "right";
type Eye = readonly [number, number, number, number]; // x0, y0, x1, y1 in sprite px

interface Agent {
  id: string;
  name: string;
  src: string;
  w: number;
  h: number;
  eyes: readonly [Eye, Eye];
  visor: string;
  side: Side;
  /** Slot inside its side area (percent). */
  top: string;
  x: string;
  bubble: "dots" | "spinner";
  bob: number; // idle bob period (s)
  phase: number; // animation delay (s)
}

// Eye boxes / visor colours measured from the sprites (public/hero/agents).
const AGENTS: readonly Agent[] = [
  {
    id: "gemini", name: "Gemini", src: "/hero/agents/gemini.png", w: 121, h: 171,
    eyes: [[36, 34, 47, 49], [59, 34, 70, 49]], visor: "#061a26",
    side: "left", top: "13%", x: "50%", bubble: "dots", bob: 3.1, phase: 0,
  },
  {
    id: "claude", name: "Claude", src: "/hero/agents/claude.png", w: 143, h: 194,
    eyes: [[51, 40, 67, 49], [77, 40, 92, 49]], visor: "#0c1414",
    side: "left", top: "53%", x: "30%", bubble: "spinner", bob: 3.7, phase: 1.1,
  },
  {
    id: "chatgpt", name: "ChatGPT", src: "/hero/agents/chatgpt.png", w: 117, h: 188,
    eyes: [[39, 35, 51, 50], [65, 36, 76, 49]], visor: "#031d1f",
    side: "right", top: "25%", x: "46%", bubble: "dots", bob: 3.4, phase: 0.6,
  },
  {
    id: "cursor", name: "Cursor", src: "/hero/agents/cursor.png", w: 142, h: 212,
    eyes: [[49, 41, 61, 58], [76, 41, 90, 58]], visor: "#032224",
    side: "right", top: "62%", x: "28%", bubble: "spinner", bob: 2.9, phase: 1.6,
  },
];

// Order they pop in (alternating sides).
const ENTRANCE_ORDER: Record<string, number> = { gemini: 0, chatgpt: 1, claude: 2, cursor: 3 };

const CSS = `
@keyframes aic-bob { 0%,100% { transform: translate3d(0,0,0) } 50% { transform: translate3d(0,-7px,0) } }
@keyframes aic-fastbob { 0%,100% { transform: translate3d(0,0,0) } 50% { transform: translate3d(0,-4px,0) } }
@keyframes aic-glance-l { 0%,86%,100% { transform: rotate(0) } 89%,95% { transform: rotate(4deg) } }
@keyframes aic-glance-r { 0%,86%,100% { transform: rotate(0) } 89%,95% { transform: rotate(-4deg) } }
@keyframes aic-blink { 0%,94%,100% { transform: scaleY(0) } 96% { transform: scaleY(1) } }
@keyframes aic-glow { 0%,100% { opacity: .35 } 50% { opacity: .95 } }
@keyframes aic-pop { from { opacity: 0; transform: translate3d(0,6px,0) scale(.6) } to { opacity: 1; transform: none } }
@keyframes aic-dot { 0%,100% { opacity: .2 } 40% { opacity: 1 } }
@keyframes aic-spin { to { transform: rotate(360deg) } }
@keyframes aic-fire-l {
  0% { transform: none }
  30% { transform: translate3d(3px,0,0) rotate(10deg) }
  42% { transform: translate3d(-7px,1px,0) rotate(4deg) }
  100% { transform: none }
}
@keyframes aic-fire-r {
  0% { transform: none }
  30% { transform: translate3d(-3px,0,0) rotate(-10deg) }
  42% { transform: translate3d(7px,1px,0) rotate(-4deg) }
  100% { transform: none }
}
@keyframes aic-flash { 0%,100% { opacity: 0 } 25% { opacity: 1 } }
.aic-bob { animation: aic-bob var(--aic-bob) ease-in-out var(--aic-phase) infinite; }
.aic-think .aic-fast { animation: aic-fastbob .62s ease-in-out var(--aic-stagger) infinite; }
.aic-glance-l { animation: aic-glance-l 8.5s ease-in-out var(--aic-phase) infinite; }
.aic-glance-r { animation: aic-glance-r 7.3s ease-in-out var(--aic-phase) infinite; }
.aic-think .aic-glance-l, .aic-think .aic-glance-r { animation: none; }
.aic-lid { transform: scaleY(0); transform-origin: 50% 0; animation: aic-blink var(--aic-blink) linear var(--aic-phase) infinite; }
.aic-glowbox { opacity: 0; transition: opacity .35s ease; }
.aic-think .aic-glowbox { animation: aic-glow 1.25s ease-in-out var(--aic-stagger) infinite; }
.aic-bubble { animation: aic-pop .28s cubic-bezier(.2,.9,.3,1.3) var(--aic-stagger) both; }
.aic-dot { animation: aic-dot 1s ease-in-out infinite; }
.aic-spin { display: inline-block; animation: aic-spin 1.4s steps(8) infinite; }
.aic-fire-l { animation: aic-fire-l .5s cubic-bezier(.3,.7,.4,1) both; transform-origin: 50% 90%; }
.aic-fire-r { animation: aic-fire-r .5s cubic-bezier(.3,.7,.4,1) both; transform-origin: 50% 90%; }
.aic-firing .aic-glowbox { animation: aic-flash .6s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .aic-bob, .aic-fast, .aic-glance-l, .aic-glance-r, .aic-lid, .aic-bubble, .aic-dot, .aic-spin, .aic-fire-l, .aic-fire-r,
  .aic-think .aic-fast, .aic-think .aic-glowbox { animation: none !important; }
  .aic-think .aic-glowbox { opacity: .6; }
  .aic-firing .aic-glowbox { animation: aic-flash .6s ease-out both !important; }
  .aic-lean { transition: none !important; }
}
`;

// Injected once and never removed: adding/removing a <style> on every mount
// would force a whole-document style recalc during the view swap.
function ensureGlobalStyle(id: string, css: string) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

// Shooter rotation: Claude first, then round-robin.
const SHOOT_ORDER = ["claude", "chatgpt", "cursor", "gemini"] as const;

type Pt = { x: number; y: number };

/**
 * Pixel beam from `from` to `to` (viewport px, measured once), then a pixel
 * burst. Imperative rAF, fixed overlay, transform/opacity only.
 */
function fireBeam(from: Pt, to: Pt, onImpact: () => void): () => void {
  const TRAVEL = 330;
  const BURST = 300;
  const root = document.createElement("div");
  root.setAttribute("data-ai-beam", "");
  root.setAttribute("aria-hidden", "true");
  Object.assign(root.style, {
    position: "fixed", left: "0", top: "0", width: "0", height: "0",
    zIndex: "190", pointerEvents: "none",
  } as Partial<CSSStyleDeclaration>);
  const sq = (size: number, color: string, shadow = "") => {
    const el = document.createElement("div");
    Object.assign(el.style, {
      position: "absolute", left: `${-size / 2}px`, top: `${-size / 2}px`,
      width: `${size}px`, height: `${size}px`, background: color,
      boxShadow: shadow, willChange: "transform, opacity", opacity: "0",
    } as Partial<CSSStyleDeclaration>);
    root.appendChild(el);
    return el;
  };
  // Trail first so the head paints on top.
  const trail = [6, 5, 4, 4, 3, 3].map((s, i) =>
    sq(s, i % 2 ? "#00bc7d" : "#00d492"),
  );
  const head = sq(
    8,
    "#eafff6",
    "4px 0 0 #00d492, -4px 0 0 #00d492, 0 4px 0 #00d492, 0 -4px 0 #00d492, 0 0 14px 3px rgba(0,212,146,0.7)",
  );
  const sparks = Array.from({ length: 10 }, (_, i) => ({
    el: sq(i % 3 === 0 ? 5 : 4, i % 2 ? "#00d492" : "#d9fff0"),
    a: (i / 10) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1),
    d: 16 + (i % 3) * 7,
  }));
  document.body.appendChild(root);

  const ctrl = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 70 };
  const at = (t: number): Pt => {
    const u = 1 - t;
    return {
      x: u * u * from.x + 2 * u * t * ctrl.x + t * t * to.x,
      y: u * u * from.y + 2 * u * t * ctrl.y + t * t * to.y,
    };
  };
  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const tf = (el: HTMLElement, p: Pt, sc = 1) => {
    el.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0) scale(${sc.toFixed(3)})`;
  };

  let raf = 0;
  let last = -1;
  let t = 0;
  let impacted = false;
  let done = false;
  const end = () => {
    done = true;
    cancelAnimationFrame(raf);
    root.remove();
  };
  const tick = (now: number) => {
    if (done) return;
    if (last >= 0) t += Math.min(34, now - last);
    last = now;
    const k = Math.min(1, t / TRAVEL);
    if (k < 1) {
      head.style.opacity = "1";
      tf(head, at(ease(k)));
      trail.forEach((el, i) => {
        const kk = ease(Math.max(0, k - 0.06 * (i + 1)));
        el.style.opacity = k - 0.06 * (i + 1) > 0 ? (0.85 - i * 0.12).toFixed(2) : "0";
        tf(el, at(kk));
      });
    } else {
      if (!impacted) {
        impacted = true;
        head.style.opacity = "0";
        trail.forEach((el) => (el.style.opacity = "0"));
        onImpact();
      }
      const b = Math.min(1, (t - TRAVEL) / BURST);
      const eb = 1 - Math.pow(1 - b, 3);
      sparks.forEach(({ el, a, d }) => {
        el.style.opacity = (1 - b).toFixed(3);
        tf(el, { x: to.x + Math.cos(a) * d * eb, y: to.y + Math.sin(a) * d * eb }, 1 - 0.5 * b);
      });
      if (b >= 1) {
        end();
        return;
      }
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    if (!done) {
      if (!impacted) onImpact();
      end();
    }
  };
}

function ThoughtBubble({ kind, side }: { kind: Agent["bubble"]; side: Side }) {
  // Pixel-style bubble above the head, offset toward the terminal column.
  const toward = side === "left" ? { left: "62%" } : { right: "62%" };
  const trail = side === "left" ? "left-1" : "right-1";
  return (
    <div className="aic-bubble pointer-events-none absolute -top-3 z-10" style={toward}>
      <div className="relative -translate-y-full">
        <div className="flex h-7 min-w-[44px] items-center justify-center gap-[3px] rounded-[5px] border-2 border-[#00bc7d]/70 bg-[#0c0c0e] px-2 font-mono text-[14px] leading-none text-[#00d492] shadow-[2px_2px_0_rgba(0,188,125,0.35)]">
          {kind === "dots" ? (
            [0, 1, 2].map((i) => (
              <span
                key={i}
                className="aic-dot block h-[4px] w-[4px] bg-[#00d492]"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))
          ) : (
            <span className="aic-spin">{"\u273B"}</span>
          )}
        </div>
        <span className={`absolute -bottom-[7px] block h-[5px] w-[5px] border border-[#00bc7d]/70 bg-[#0c0c0e] ${trail}`} />
        <span
          className={`absolute -bottom-[12px] block h-[3px] w-[3px] bg-[#00bc7d]/70 ${side === "left" ? "-left-1" : "-right-1"}`}
        />
      </div>
    </div>
  );
}

export interface AiAgentsCrewProps {
  thinking: boolean;
  /** Seconds before the robots pop in (longer after the CRT transition). */
  entranceDelay?: number;
  /** Robots slide back out (AI -> Contact transition). */
  leaving?: boolean;
  /** Element the beam hits (the new reply's ⏺); measured once at fire time. */
  getReplyTarget?: () => HTMLElement | null;
  /** Beam hit the reply (or no beam was shown): start typing. */
  onImpact?: () => void;
}

export function AiAgentsCrew({
  thinking,
  entranceDelay = 0.2,
  leaving = false,
  getReplyTarget,
  onImpact,
}: AiAgentsCrewProps) {
  ensureGlobalStyle("ai-agents-crew-css", CSS);
  const reduce = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const robotRefs = useRef<Record<string, HTMLImageElement | null>>({});
  const [shooter, setShooter] = useState<string | null>(null);
  const [firing, setFiring] = useState<{ id: string; n: number } | null>(null);
  const turn = useRef(0);
  const shooterRef = useRef<string | null>(null);
  const wasThinking = useRef(false);
  const cancelBeam = useRef<null | (() => void)>(null);
  const impactRef = useRef(onImpact);
  impactRef.current = onImpact;

  // Pick the shooter when Thinking starts; it fires when the reply arrives.
  useEffect(() => {
    const was = wasThinking.current;
    wasThinking.current = thinking;
    if (thinking && !was) {
      const id = SHOOT_ORDER[turn.current % SHOOT_ORDER.length];
      turn.current += 1;
      shooterRef.current = id;
      setShooter(id);
      return;
    }
    if (!thinking && was) {
      const id = shooterRef.current;
      setShooter(null);
      const impact = () => impactRef.current?.();
      const visible = !!rootRef.current && rootRef.current.getClientRects().length > 0;
      const img = id ? robotRefs.current[id] : null;
      const target = getReplyTarget?.() ?? null;
      if (!id || !visible || !img || !target) {
        impact();
        return;
      }
      setFiring({ id, n: turn.current });
      if (reduce) {
        // No projectile: a brief highlight on the firing robot.
        impact();
      } else {
        const side = AGENTS.find((a) => a.id === id)?.side ?? "left";
        const r = img.getBoundingClientRect();
        const tr = target.getBoundingClientRect();
        const from = {
          x: side === "left" ? r.right - r.width * 0.22 : r.left + r.width * 0.22,
          y: r.top + r.height * 0.5,
        };
        const to = { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 };
        // Short wind-up (lean + recoil) before the shot leaves.
        const t = window.setTimeout(() => {
          cancelBeam.current = fireBeam(from, to, impact);
        }, 130);
        cancelBeam.current = () => {
          window.clearTimeout(t);
          impact();
        };
      }
      const off = window.setTimeout(() => setFiring(null), 650);
      return () => window.clearTimeout(off);
    }
  }, [thinking, reduce, getReplyTarget]);

  useEffect(() => () => cancelBeam.current?.(), []);

  return (
    <div
      aria-hidden
      ref={rootRef}
      data-ai-crew={firing ? `firing:${firing.id}` : shooter ? `thinking:${shooter}` : "idle"}
      className="pointer-events-none absolute inset-0 z-0 hidden select-none min-[1100px]:block"
      style={{ ["--aic-h" as string]: "clamp(88px, 8.4vw, 128px)" }}
    >
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className="absolute bottom-0 top-0"
          style={{ [side]: 0, width: "calc((100% - 56rem) / 2)" }}
        >
          {AGENTS.filter((a) => a.side === side).map((a) => {
            const i = AGENTS.indexOf(a);
            const order = ENTRANCE_ORDER[a.id];
            const dx = side === "left" ? -48 : 48;
            const isThinker = thinking && shooter === a.id;
            const isFiring = firing?.id === a.id;
            const vars = {
              "--aic-bob": `${a.bob}s`,
              "--aic-phase": `-${a.phase}s`,
              "--aic-stagger": "0s",
              "--aic-blink": `${4.4 + i * 0.9}s`,
            } as CSSProperties;
            return (
              <div
                key={a.id}
                data-ai-agent={a.id}
                className={`absolute ${isThinker ? "aic-think" : ""} ${isFiring ? "aic-firing" : ""}`}
                style={{ top: a.top, [side]: a.x, ...vars }}
              >
                <motion.div
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: dx, scale: 0.85 }}
                  animate={
                    leaving
                      ? { opacity: 0, x: reduce ? 0 : dx, scale: reduce ? 1 : 0.9 }
                      : { opacity: 1, x: 0, scale: 1 }
                  }
                  transition={
                    leaving
                      ? { duration: 0.28, delay: order * 0.04, ease: [0.4, 0, 1, 1] }
                      : {
                          duration: reduce ? 0.2 : 0.5,
                          delay: entranceDelay + order * 0.09,
                          ease: [0.2, 0.9, 0.3, 1.15],
                        }
                  }
                  style={{ willChange: "transform, opacity" }}
                >
                  <div
                    className="aic-lean transition-transform duration-[450ms] ease-[cubic-bezier(.3,.7,.3,1.2)]"
                    style={{
                      transformOrigin: "50% 100%",
                      transform: isThinker ? `rotate(${side === "left" ? 7 : -7}deg)` : "none",
                    }}
                  >
                    <div className={side === "left" ? "aic-glance-l" : "aic-glance-r"} style={{ transformOrigin: "50% 90%" }}>
                      <div className="aic-bob">
                        <div className="aic-fast">
                          <div
                            key={isFiring ? `fire-${firing!.n}` : "still"}
                            className={isFiring ? (side === "left" ? "aic-fire-l" : "aic-fire-r") : undefined}
                          >
                            <div className="relative">
                              <div
                                className="aic-glowbox absolute -inset-[30%] rounded-full"
                                style={{
                                  background:
                                    "radial-gradient(closest-side, rgba(0,212,146,0.35), rgba(0,212,146,0.12) 55%, rgba(0,212,146,0) 100%)",
                                }}
                              />
                              <div className="relative" style={{ height: "var(--aic-h)", aspectRatio: `${a.w} / ${a.h}` }}>
                                <img
                                  ref={(el) => {
                                    robotRefs.current[a.id] = el;
                                  }}
                                  src={a.src}
                                  alt=""
                                  draggable={false}
                                  className="block h-full w-full object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]"
                                  style={{ imageRendering: "pixelated" }}
                                />
                                {a.eyes.map(([x0, y0, x1, y1], k) => (
                                  <span
                                    key={k}
                                    className="aic-lid absolute block"
                                    style={{
                                      left: `${(x0 / a.w) * 100}%`,
                                      top: `${(y0 / a.h) * 100}%`,
                                      width: `${((x1 - x0) / a.w) * 100}%`,
                                      height: `${((y1 - y0) / a.h) * 100}%`,
                                      background: a.visor,
                                    }}
                                  />
                                ))}
                              </div>
                              {isThinker && <ThoughtBubble kind={a.bubble} side={side} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
