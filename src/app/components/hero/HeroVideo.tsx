import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { commands, TerminalPanel, type TerminalPanelHandle } from './TerminalPanel';
import { HeroNameTreatment } from './HeroNameTreatment';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}
import {
  PATCH,
  ROBOT,
  VIDEO_H,
  VIDEO_W,
  boxStyle,
  useHeroCrtTransition,
} from './HeroCrtTransition';

const SECTION_LABELS: Record<string, string> = {
  about: 'About',
  experience: 'Experience',
  projects: 'Projects',
  contact: 'Contact',
  cv: 'CV',
  ai: 'AI',
};

/** Which "agent" gets dispatched for each section (purely cosmetic). */
const SECTION_AGENTS: Record<string, string> = {
  about: 'claude-agent',
  experience: 'gpt-agent',
  projects: 'cursor-agent',
  contact: 'gemini-agent',
  cv: 'gpt-agent',
  ai: 'claude-agent',
};
const FREEFORM_AGENT = 'claude-agent';

const LOCAL_COMMANDS = ['help', 'ls', 'clear'];
const AUTOCOMPLETE_COMMANDS = [...commands, ...LOCAL_COMMANDS];
const MAX_LOG_LINES = 4;

type LogKind = 'cmd' | 'dispatch' | 'ok' | 'info';
type LogLine = { id: number; kind: LogKind; text: string };

const LOG_COLORS: Record<LogKind, string> = {
  cmd: 'text-zinc-300',
  dispatch: 'text-[#00BB7F]',
  ok: 'text-[#00BB7F]/80',
  info: 'text-zinc-500',
};

export function HeroVideo() {
  const { t, language, toggleLanguage } = useLanguage();
  const reduceMotion = useReducedMotion() ?? false;
  const isNarrow = useMediaQuery('(max-width: 767px)');
  const isCoarse = useMediaQuery('(pointer: coarse)');

  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLImageElement>(null);
  const patchRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const shadesRef = useRef<HTMLDivElement>(null);
  const crtRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const sectionOpenRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<TerminalPanelHandle>(null);
  const timersRef = useRef<number[]>([]);
  const lineIdRef = useRef(0);

  const [inputValue, setInputValue] = useState('');
  const [log, setLog] = useState<LogLine[]>([]);
  const [isDispatching, setIsDispatching] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sessionId] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase(),
  );
  const [lastLoginDate] = useState(() => new Date().toLocaleDateString());

  sectionOpenRef.current = sectionOpen;
  /** About was opened automatically by reaching the end of the transition. */
  const autoAboutRef = useRef(false);
  /** Section the transition opens at its end (natural scroll -> about). */
  const targetRef = useRef('about');
  const [crtTarget, setCrtTarget] = useState('about');
  const retarget = useCallback((cmd: string) => {
    targetRef.current = cmd;
    setCrtTarget(cmd);
  }, []);
  const progressRef = useRef(0);
  /** About hint (pulse + idle typed tip) until About/transition is used. */
  const [hintDone, setHintDone] = useState(false);
  const [hintTyped, setHintTyped] = useState(0);
  const animatingRef = useRef(false);
  const reversingRef = useRef(false);
  const animRafRef = useRef(0);
  const holdTimerRef = useRef(0);
  const renderRef = useHeroCrtTransition(
    {
      section: sectionRef,
      sticky: stickyRef,
      stage: stageRef,
      video: videoRef,
      frame: frameRef,
      robot: robotRef,
      patch: patchRef,
      canvas: canvasRef,
      ui: uiRef,
      shades: shadesRef,
      crt: crtRef,
      typed: typedRef,
      menu: menuRef,
      bubble: bubbleRef,
    },
    {
      reduceMotion,
      // Only resume the loop when we are back on the hero.
      canPlay: () => !reduceMotion && !sectionOpenRef.current,
      getCommand: () => `cd ${targetRef.current}`,
      getProgress: () => progressRef.current,
      isReversing: () => reversingRef.current,
    },
  );

  /** Timed (not scroll-scrubbed) playback of the transition progress. */
  const animateTo = useCallback(
    (to: 0 | 1, onDone?: () => void) => {
      if (animatingRef.current) return false;
      animatingRef.current = true;
      reversingRef.current = to === 0;
      const from = progressRef.current;
      const duration = (reduceMotion ? 600 : 3000) * Math.abs(to - from);
      const t0 = performance.now();
      const step = (now: number) => {
        const t = duration > 0 ? Math.min(1, (now - t0) / duration) : 1;
        const e = reduceMotion ? t : t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        progressRef.current = from + (to - from) * e;
        renderRef.current();
        if (t < 1) {
          animRafRef.current = requestAnimationFrame(step);
        } else {
          animatingRef.current = false;
          reversingRef.current = false;
          onDone?.();
        }
      };
      animRafRef.current = requestAnimationFrame(step);
      return true;
    },
    [reduceMotion, renderRef],
  );

  /** Hero -> robot dissolve -> CRT -> `cd <section>` -> open that section. */
  const openForward = useCallback(
    (cmd: string) => {
      if (sectionOpenRef.current) return false;
      if (reversingRef.current) {
        cancelAnimationFrame(animRafRef.current);
        animatingRef.current = false;
        reversingRef.current = false;
      } else if (animatingRef.current || progressRef.current > 0) {
        return false;
      }
      setHintDone(true);
      retarget(cmd);
      return animateTo(1, () => {
        holdTimerRef.current = window.setTimeout(
          () => {
            autoAboutRef.current = true;
            panelRef.current?.runCommand(targetRef.current);
          },
          reduceMotion ? 0 : 450,
        );
      });
    },
    [animateTo, reduceMotion, retarget],
  );

  /** Restart the background loop (autoplay can reject; ignore safely). */
  const resumeLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video || reduceMotion || sectionOpenRef.current) return;
    video.muted = true;
    try {
      const playback = video.play();
      if (playback) playback.catch(() => {});
    } catch {
      /* ignore */
    }
  }, [reduceMotion]);

  /** Section -> CRT -> back out to the hero, in reverse. */
  const playBack = useCallback(() => {
    if (animatingRef.current) return;
    animateTo(0, () => {
      retarget('about');
      // Back on the hero: exact 0 (hides cutout/patch, clears canvas, unfreezes)
      progressRef.current = 0;
      renderRef.current();
      resumeLoop();
    });
  }, [animateTo, retarget, renderRef, resumeLoop]);

  // Closing an auto-opened section (scroll-up, RETURN_TO_SHELL, Esc) plays
  // the transition back to the hero.
  useEffect(() => {
    if (sectionOpen || !autoAboutRef.current) return;
    autoAboutRef.current = false;
    playBack();
  }, [sectionOpen, playBack]);

  useEffect(
    () => () => {
      cancelAnimationFrame(animRafRef.current);
      window.clearTimeout(holdTimerRef.current);
    },
    [],
  );

  // Input: the first downward wheel / swipe / key on the hero plays the
  // transition; upward input at the top of the opened section reverses it.
  useEffect(() => {
    let lastOverlayScroll = 0;
    const overlayAtTop = () => {
      const el = document.querySelector<HTMLElement>('[data-section-overlay]');
      // require the overlay to have settled at its top (no momentum carry-over)
      return (!el || el.scrollTop <= 0) && performance.now() - lastOverlayScroll > 300;
    };
    const forward = () => {
      if (!sectionOpenRef.current) openForward('about');
    };
    const back = () => {
      if (!sectionOpenRef.current || !autoAboutRef.current || animatingRef.current) return;
      // Only the About/Experience stack reverses on upward input at the top.
      // Projects, Contact and AI scroll their own content; leaving them is
      // explicit (Escape / GOTO / RETURN_TO_SHELL), never a scroll.
      const overlay = document.querySelector<HTMLElement>('[data-section-overlay]');
      const view = overlay?.dataset.view;
      if (view !== 'about' && view !== 'experience') return;
      if (overlayAtTop()) {
        panelRef.current?.close(); // the close effect plays the reverse
      }
    };
    const onScroll = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (el && el.hasAttribute?.('data-section-overlay')) lastOverlayScroll = performance.now();
    };
    const onWheel = (e: WheelEvent) => {
      if (sectionOpenRef.current) {
        // A section is open: only an upward wheel can matter (back() filters
        // by view); skip everything else.
        if (e.deltaY < -4) back();
        return;
      }
      if (e.deltaY > 4) forward();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName))) return;
      if (['PageDown', 'ArrowDown', ' ', 'Spacebar'].includes(e.key)) {
        if (!sectionOpenRef.current) {
          e.preventDefault();
          forward();
        }
      } else if (['PageUp', 'ArrowUp'].includes(e.key)) {
        back();
      }
    };
    let startY = 0;
    let fired = false;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
      fired = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (fired) return;
      const dy = (e.touches[0]?.clientY ?? 0) - startY;
      if (dy < -40 && !sectionOpenRef.current) {
        fired = true;
        forward();
      } else if (dy > 50) {
        fired = true;
        back();
      }
    };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [openForward]);

  // Keep the background video in sync with reduced-motion and open sections.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // React does not reflect `muted` as an attribute; set it explicitly so
    // mobile browsers allow autoplay.
    video.muted = true;
    if (reduceMotion || sectionOpen) {
      video.pause();
      return;
    }
    if (progressRef.current > 0) return;
    const playback = video.play();
    if (playback) playback.catch(() => {});
  }, [reduceMotion, sectionOpen]);

  useEffect(
    () => () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const pushLines = useCallback((lines: Array<Omit<LogLine, 'id'>>) => {
    setLog((current) =>
      [...current, ...lines.map((line) => ({ ...line, id: ++lineIdRef.current }))].slice(
        -MAX_LOG_LINES,
      ),
    );
  }, []);

  const dispatch = useCallback(
    (raw: string) => {
      const value = raw.trim();
      const cmd = value.toLowerCase();
      setInputValue('');
      if (!cmd || isDispatching) return;

      if (cmd === 'clear') {
        setLog([]);
        return;
      }

      if (cmd === 'help' || cmd === 'ls') {
        pushLines([
          { kind: 'cmd', text: `$ ${value}` },
          { kind: 'info', text: commands.join('  ') },
        ]);
        return;
      }

      // `cv` is an alias for Contact (it opens Contact and highlights the CV).
      const isSection = commands.includes(cmd) || cmd === 'cv';
      const agent = SECTION_AGENTS[cmd] || FREEFORM_AGENT;

      // Sections (not AI mode) travel through the robot -> CRT transition.
      if (isSection && cmd !== 'ai' && !sectionOpenRef.current) {
        inputRef.current?.blur();
        pushLines([
          { kind: 'cmd', text: `$ ${value}` },
          { kind: 'dispatch', text: `> dispatching ${agent}...` },
        ]);
        if (openForward(cmd)) return;
      }

      setIsDispatching(true);
      inputRef.current?.blur();
      pushLines([
        { kind: 'cmd', text: `$ ${value}` },
        { kind: 'dispatch', text: `> dispatching ${agent}...` },
      ]);

      const timer = window.setTimeout(
        () => {
          pushLines([
            {
              kind: 'ok',
              text: isSection ? `✓ ${SECTION_LABELS[cmd]} ready` : '✓ handed off to ai mode',
            },
          ]);
          setIsDispatching(false);
          // Reuse the site's existing command router (sections / AI mode).
          panelRef.current?.runCommand(isSection ? cmd : value);
        },
        reduceMotion ? 120 : 550,
      );
      timersRef.current.push(timer);
    },
    [isDispatching, pushLines, reduceMotion, openForward],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Empty prompt + Enter = the suggested `about`.
    dispatch(inputValue.trim() ? inputValue : 'about');
  };

  // Hint "said" by the Claude robot in a pixel speech bubble.
  // Plain ASCII-ish text (no emoji / fallback glyphs) so typing is even;
  // a CSS/SVG pixel arrow appears once typing finishes.
  // Touch copy: phones (<768px) have no hero terminal, just the CTA; other
  // touch screens keep the buttons but have no ENTER key.
  const HINT_TEXT = isNarrow
    ? language === 'es'
      ? 'desliza para entrar'
      : 'swipe up to enter'
    : language === 'es'
      ? 'intenta presionar About'
      : 'try pressing About';
  const hintEnter = isNarrow
    ? language === 'es'
      ? 'o toca cd about'
      : 'or tap cd about'
    : isCoarse
      ? language === 'es'
        ? 'o desliza hacia arriba'
        : 'or swipe up'
      : language === 'es'
        ? 'o presiona ENTER'
        : 'or press ENTER';
  const hintL1 = Array.from(HINT_TEXT);
  // only line 1 is typed; line 2 fades in complete afterwards
  const hintTotal = hintL1.length;

  // After ~2 s of inactivity on the hero, auto-type the About hint.
  useEffect(() => {
    if (hintDone) return;
    let idle = 0;
    let typer = 0;
    const total = hintTotal;
    const startTyping = () => {
      let i = 0;
      typer = window.setInterval(
        () => {
          i = reduceMotion ? total : i + 1;
          setHintTyped(i);
          if (i >= total) window.clearInterval(typer);
        },
        reduceMotion ? 0 : 60,
      );
    };
    const arm = () => {
      window.clearTimeout(idle);
      if (typer) return; // already shown; keep it
      idle = window.setTimeout(startTyping, 1700);
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    arm();
    return () => {
      window.clearTimeout(idle);
      window.clearInterval(typer);
      events.forEach((e) => window.removeEventListener(e, arm));
    };
  }, [hintDone, reduceMotion, hintTotal]);

  // Position the bubble as soon as it mounts (and on language change).
  const bubbleShown = !hintDone && hintTyped > 0;
  useEffect(() => {
    if (bubbleShown) renderRef.current();
  }, [bubbleShown, language, renderRef]);

  // Enter anywhere on the hero (outside a text field / button) runs about.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat || sectionOpenRef.current) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(el.tagName))) return;
      if (progressRef.current > 0) return;
      e.preventDefault();
      dispatch('about');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Tab') return;
    const partial = inputValue.trim().toLowerCase();
    if (!partial) return;
    const matches = AUTOCOMPLETE_COMMANDS.filter((command) => command.startsWith(partial));
    if (matches.length === 1) {
      event.preventDefault();
      setInputValue(matches[0]);
    }
  };

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.2 : 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Roiner Hernandez"
      className="relative h-svh min-h-[560px] w-full bg-[#030213]"
    >
     <div
      ref={stickyRef}
      data-section-open={sectionOpen ? "" : undefined}
      className="sticky top-0 h-svh min-h-[560px] w-full overflow-hidden bg-[#030213]"
     >
      {/* Stage: scaled/translated on scroll to dolly into the CRT */}
      <div
        ref={stageRef}
        data-hero-stage=""
        className="pointer-events-none absolute inset-0 origin-top-left will-change-transform"
      >
      {/* Video wrapper with responsive vertical margin and max height */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden px-0 py-3 max-md:pb-[calc(13rem+env(safe-area-inset-bottom))] max-md:pt-[max(3.25rem,calc(env(safe-area-inset-top)+2.75rem))] sm:py-5 lg:py-6 xl:py-8">
        {/* Phones: the box is as tall as needed for the 4 robots (x 670..1221 of
            the 1280x720 frame) to fit the width; see HeroCrtTransition measure(). */}
        <div className="relative flex h-full max-h-[82vh] lg:max-h-[660px] xl:max-h-[720px] 2xl:max-h-[760px] w-full max-w-[1920px] items-center justify-end max-md:h-[calc((100vw-20px)*1.3067)] max-md:max-h-full">
          <video
            key={reduceMotion ? 'still' : 'motion'}
            ref={videoRef}
            className="h-full w-full object-cover object-[72%_center] max-md:object-[93%_center] lg:object-contain lg:object-right"
            style={{ imageRendering: 'pixelated' }}
            poster="/hero/hero-poster.jpg"
            autoPlay={!reduceMotion}
            muted
            loop
            playsInline
            preload={reduceMotion ? 'none' : 'auto'}
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src="/hero/hero.webm" type="video/webm" />
            <source src="/hero/hero.mp4" type="video/mp4" />
          </video>
          {/* Phones: soften the video's bottom edge into the page */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-t from-[#030213] to-transparent md:hidden"
          />
          {/* 1280x720 frame overlay aligned to the rendered video content */}
          <div
            ref={frameRef}
            data-hero-frame=""
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-full"
          >
            <img
              ref={patchRef}
              src="/hero/robot-patch.png"
              alt=""
              draggable={false}
              className="absolute invisible opacity-0"
              style={{ ...boxStyle(PATCH), imageRendering: 'pixelated' }}
            />
            <img
              ref={robotRef}
              src="/hero/robot-cursor.png"
              alt=""
              draggable={false}
              className="absolute invisible opacity-0"
              style={{ ...boxStyle(ROBOT), imageRendering: 'pixelated' }}
            />
            <canvas
              ref={canvasRef}
              width={VIDEO_W}
              height={VIDEO_H}
              className="absolute inset-0 h-full w-full"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      </div>
      </div>

      <div ref={shadesRef}>

      {/* Subtle top & bottom edge fade into #030213 for vertical margin blending */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-10 lg:h-14 bg-gradient-to-b from-[#030213] to-transparent z-[5]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 lg:h-14 bg-gradient-to-t from-[#030213] to-transparent z-[5]"
      />

      {/* Readability gradients: from the left on desktop, from the bottom on mobile */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block z-[4]"
        style={{
          background:
            'linear-gradient(90deg, rgba(3,2,19,0.95) 0%, rgba(3,2,19,0.85) 30%, rgba(3,2,19,0.3) 55%, rgba(3,2,19,0) 75%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 lg:hidden max-md:hidden z-[4]"
        style={{
          background:
            'linear-gradient(0deg, rgba(3,2,19,0.96) 0%, rgba(3,2,19,0.88) 42%, rgba(3,2,19,0.4) 66%, rgba(3,2,19,0) 85%)',
        }}
      />
      {/* Phones: shorter fade, only under the name + CTA (keeps the face clear) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4] md:hidden"
        style={{
          background:
            'linear-gradient(0deg, rgba(3,2,19,0.97) 0%, rgba(3,2,19,0.9) 24%, rgba(3,2,19,0.35) 36%, rgba(3,2,19,0) 46%)',
        }}
      />

      </div>

      {/* Claude robot speech bubble (idle hint); placed by the transition hook
          so it never covers a robot, Roiner's face or the hero text. */}
      {!hintDone && hintTyped > 0 && (
        <div
          ref={bubbleRef}
          aria-hidden="true"
          className="hero-bubble-anchor pointer-events-none absolute left-0 top-0 z-[6] invisible"
        >
          <div className="hero-bubble">
            {/* Full text is always laid out; characters are revealed in place
                (no reflow, fixed bubble size). Cursor = highlighted next cell. */}
            <p className="hero-bubble-text">
              {hintL1.map((ch, i) => (
                <span
                  key={i}
                  className={i < hintTyped ? undefined : i === hintTyped ? 'hero-type-cursor' : 'invisible'}
                >
                  {ch}
                </span>
              ))}
            </p>
            <p
              className="hero-bubble-text mt-0.5 text-[10px] text-zinc-400 transition-opacity duration-200"
              style={{ opacity: hintTyped >= hintTotal ? 1 : 0 }}
            >
              {hintEnter}
            </p>
            <span className="hero-bubble-tail" />
          </div>
        </div>
      )}

      <div ref={uiRef}>
      {/* Overlay content: vertically centered on desktop, preventing viewport overflow */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        aria-hidden={sectionOpen || undefined}
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6 lg:inset-y-0 lg:right-auto lg:my-auto lg:h-fit lg:w-[48%] xl:w-[44%] 2xl:w-[40%] lg:gap-3.5 lg:pl-10 xl:pl-16 lg:pr-4"
      >
        <motion.p
          variants={item}
          className="font-terminal text-xs tracking-wide text-[#00BB7F] max-md:text-[13px] sm:text-sm"
        >
          ~/roiner <span className="text-zinc-500">—</span> orchestrator
        </motion.p>

        {/* Pixel Name Treatment + Title (Foto 3) */}
        <motion.div variants={item} className="space-y-1.5 sm:space-y-2">
          <HeroNameTreatment />

          <div className="flex items-center gap-3 pt-0.5">
            <div className="hidden h-px w-10 bg-gradient-to-r from-emerald-500/50 to-transparent sm:block" />
            <p className="font-mono text-xs sm:text-sm font-light text-zinc-300 tracking-wider max-md:text-[14px]">
              {t('HERO_TITLE')}
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/50 to-transparent" />
          </div>
        </motion.div>

        {/* Compact interactive terminal with Digital Guide banner (Foto 4) */}
        {/* Mobile: one terminal-style CTA instead of the hero terminal */}
        <motion.div variants={item} className="mt-1 w-full md:hidden">
          <button
            type="button"
            data-hero-cta=""
            disabled={isDispatching}
            onClick={() => dispatch('about')}
            className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#00BB7F]/50 bg-[#030213]/90 px-4 py-2.5 text-left font-mono disabled:opacity-60"
          >
            <span className="text-[16px] text-zinc-100">
              <span className="text-[#00BB7F]">$</span> cd about{' '}
              <span aria-hidden="true" className="hero-block-caret text-[#00BB7F]">
                ▋
              </span>
            </span>
            <span className="text-[13px] text-zinc-400">
              {language === 'es' ? 'desliza o toca' : 'swipe or tap'}
            </span>
          </button>
        </motion.div>

        <motion.div variants={item} className="mt-1 w-full max-w-[28rem] max-md:hidden xl:max-w-[31rem]">
          <div
            onClick={() => inputRef.current?.focus({ preventScroll: true })}
            className="cursor-text overflow-hidden rounded-xl border border-[#00BB7F]/35 bg-[#030213]/85 font-terminal text-[13px] shadow-[0_0_0_1px_rgba(0,187,127,0.08),0_0_24px_rgba(0,187,127,0.14)] backdrop-blur-md"
          >
            {/* Window title bar */}
            <div className="flex items-center justify-between gap-3 border-b border-[#00BB7F]/20 bg-black/40 px-3 py-1.5 sm:py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#00BB7F]" />
                </span>
                <span className="truncate font-mono text-[11px] text-zinc-400">
                  agents@roiner:~
                </span>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleLanguage();
                }}
                className="shrink-0 cursor-pointer rounded px-1.5 py-0.5 font-mono text-[11px] text-zinc-400 transition-colors hover:text-[#00BB7F] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00BB7F]"
                aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a español'}
              >
                <span className={language === 'en' ? 'font-bold text-[#00BB7F]' : ''}>EN</span>
                <span className="px-1 text-zinc-600">/</span>
                <span className={language === 'es' ? 'font-bold text-[#00BB7F]' : ''}>ES</span>
              </button>
            </div>

            {/* Terminal Body */}
            <div className="space-y-2.5 p-2.5 sm:p-3.5">
              {/* Digital Guide Welcome Card (Foto 4) */}
              <div className="relative flex items-start gap-2.5 sm:gap-3 rounded-lg border border-[#00BB7F]/20 bg-[#00BB7F]/[0.03] p-2.5 sm:p-3 backdrop-blur-sm overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,187,127,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-25" />
                <div className="relative shrink-0">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-[#00BB7F]/30 overflow-hidden bg-zinc-900 shadow-[0_0_10px_rgba(0,187,127,0.15)]">
                    <img
                      src="/avatar3.webp"
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="relative z-10 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[9px] sm:text-[10px]">
                    <span className="font-bold tracking-wider text-[#00BB7F] uppercase">
                      {t('DIGITAL_GUIDE')}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 uppercase">
                      {t('SESSION')}: {sessionId}
                    </span>
                    <span className="text-zinc-500 uppercase hidden min-[440px]:inline">
                      {t('LAST_LOGIN')}: {lastLoginDate}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] sm:text-[12.5px] leading-snug text-zinc-200">
                    {t('WELCOME_WORKSPACE')}
                  </p>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] text-zinc-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00BB7F] animate-pulse shrink-0" />
                    <span className="truncate">{t('SYSTEM_READY_NAVIGATION')}</span>
                  </div>
                </div>
              </div>

              {/* Section Buttons */}
              <ul className="grid grid-cols-3 gap-1.5">
                {commands.map((cmd) => {
                  const isHint = cmd === 'about' && !hintDone;
                  return (
                  <li key={cmd} className="min-w-0">
                    <button
                      type="button"
                      disabled={isDispatching}
                      onClick={(event) => {
                        event.stopPropagation();
                        dispatch(cmd);
                      }}
                      className={`group flex w-full min-w-0 cursor-pointer disabled:cursor-wait items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.03] px-2 py-1.5 text-left font-mono text-[11px] sm:text-[12px] text-zinc-300 transition-colors hover:border-[#00BB7F]/50 hover:bg-[#00BB7F]/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00BB7F] disabled:opacity-60 ${
                        isHint ? 'hero-about-hint' : !hintDone ? 'opacity-75 hover:opacity-100' : ''
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="hidden text-[#00BB7F]/70 transition-colors group-hover:text-[#00BB7F] min-[360px]:inline"
                      >
                        ›
                      </span>
                      <span className="truncate">{SECTION_LABELS[cmd]}</span>
                      {isHint && (
                        <span aria-hidden="true" className="hero-block-caret ml-auto text-[#00BB7F]">
                          ▋
                        </span>
                      )}
                    </button>
                  </li>
                  );
                })}
              </ul>

              {/* Dispatch feedback log */}
              {log.length > 0 && (
                <div aria-live="polite" className="space-y-0.5 font-mono text-[11px]">
                  {log.map((line) => (
                    <p key={line.id} className={`truncate ${LOG_COLORS[line.kind]}`}>
                      {line.text}
                    </p>
                  ))}
                </div>
              )}

              {/* Interactive prompt input */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-0.5">
                <span className="font-mono text-[#00BB7F]" aria-hidden="true">
                  $
                </span>
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isDispatching}
                  placeholder={t('HERO_TERMINAL_PLACEHOLDER')}
                  aria-label={t('HERO_TERMINAL_HINT')}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  className="min-w-0 flex-1 bg-transparent font-mono text-[16px] sm:text-[12px] text-zinc-100 caret-[#00BB7F] outline-none placeholder:text-zinc-600"
                />
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile language pill (the hero terminal that holds EN/ES is hidden) */}
      <button
        type="button"
        onClick={toggleLanguage}
        aria-hidden={sectionOpen || undefined}
        tabIndex={sectionOpen ? -1 : undefined}
        aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a español'}
        className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex h-11 min-w-11 items-center justify-center rounded-full border border-[#00BB7F]/40 bg-[#030213]/85 px-3 font-mono text-[13px] text-zinc-400 md:hidden"
      >
        <span className={language === 'en' ? 'font-bold text-[#00BB7F]' : ''}>EN</span>
        <span className="px-1 text-zinc-600">/</span>
        <span className={language === 'es' ? 'font-bold text-[#00BB7F]' : ''}>ES</span>
      </button>

      </div>

      {/* CRT terminal revealed at the end of the dolly */}
      <div
        ref={crtRef}
        className="invisible absolute inset-0 z-30 overflow-hidden bg-[#03130c] opacity-0"
        style={{ pointerEvents: 'none' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0,187,127,0.16) 0%, rgba(0,187,127,0.05) 45%, rgba(0,0,0,0.75) 100%)',
          }}
        />
        <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col justify-center gap-4 px-6 font-terminal text-[#4dffb0] [text-shadow:0_0_6px_rgba(77,255,176,0.55)] sm:px-10">
          <p className="text-xs text-[#4dffb0]/60 sm:text-sm">ROINER-OS v2.6 · crt link established</p>
          <p className="text-base sm:text-xl" aria-label={`> cd ${crtTarget}`}>
            <span aria-hidden="true">
              <span className="text-[#00BB7F]">&gt;</span> <span ref={typedRef} />
              <span className="animate-pulse">_</span>
            </span>
          </p>
          <div ref={menuRef} className="invisible space-y-1 text-xs sm:text-sm opacity-0">
            <p className="text-[#4dffb0]/70">&gt; dispatching claude-agent...</p>
            <button
              type="button"
              onClick={() => panelRef.current?.runCommand(crtTarget)}
              className="cursor-pointer text-left text-[#4dffb0] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4dffb0] max-md:min-h-11"
            >
              ✓ {SECTION_LABELS[crtTarget] ?? crtTarget} ready
            </button>
          </div>
        </div>
        {/* scanlines + glass glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, transparent 1px, transparent 3px)',
            boxShadow: 'inset 0 0 120px rgba(0,0,0,0.85), inset 0 0 40px rgba(77,255,176,0.12)',
          }}
        />
      </div>

      {/* Existing section views (rendered full-screen via portal when a command runs) */}
      <TerminalPanel ref={panelRef} headless onExpandedChange={setSectionOpen} />
     </div>
    </section>
  );
}
