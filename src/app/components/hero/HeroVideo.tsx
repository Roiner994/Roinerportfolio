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
import {
  CRT_COMMAND,
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
  useHeroCrtTransition(
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
    },
    {
      reduceMotion,
      // Only resume the loop when we are back at the top of the hero.
      canPlay: () => !reduceMotion && !sectionOpenRef.current,
    },
  );

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
    if (window.scrollY > 4 && sectionRef.current && sectionRef.current.getBoundingClientRect().top < -4) return;
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

      const isSection = commands.includes(cmd);
      const agent = SECTION_AGENTS[cmd] || FREEFORM_AGENT;

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
    [isDispatching, pushLines, reduceMotion],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(inputValue);
  };

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
      className="relative w-full bg-[#030213]"
      style={{ height: reduceMotion ? '200svh' : '380svh' }}
    >
     <div
      ref={stickyRef}
      className="sticky top-0 h-svh min-h-[560px] w-full overflow-hidden bg-[#030213]"
     >
      {/* Stage: scaled/translated on scroll to dolly into the CRT */}
      <div
        ref={stageRef}
        className="pointer-events-none absolute inset-0 origin-top-left will-change-transform"
      >
      {/* Video wrapper with responsive vertical margin and max height */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden px-0 py-3 sm:py-5 lg:py-6 xl:py-8">
        <div className="relative flex h-full max-h-[82vh] lg:max-h-[660px] xl:max-h-[720px] 2xl:max-h-[760px] w-full max-w-[1920px] items-center justify-end">
          <video
            key={reduceMotion ? 'still' : 'motion'}
            ref={videoRef}
            className="h-full w-full object-cover object-[72%_center] lg:object-contain lg:object-right"
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
          {/* 1280x720 frame overlay aligned to the rendered video content */}
          <div
            ref={frameRef}
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
        className="pointer-events-none absolute inset-0 lg:hidden z-[4]"
        style={{
          background:
            'linear-gradient(0deg, rgba(3,2,19,0.96) 0%, rgba(3,2,19,0.88) 42%, rgba(3,2,19,0.4) 66%, rgba(3,2,19,0) 85%)',
        }}
      />

      </div>

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
          className="font-terminal text-xs tracking-wide text-[#00BB7F] sm:text-sm"
        >
          ~/roiner <span className="text-zinc-500">—</span> orchestrator
        </motion.p>

        {/* Pixel Name Treatment + Title (Foto 3) */}
        <motion.div variants={item} className="space-y-1.5 sm:space-y-2">
          <HeroNameTreatment />

          <div className="flex items-center gap-3 pt-0.5">
            <div className="hidden h-px w-10 bg-gradient-to-r from-emerald-500/50 to-transparent sm:block" />
            <p className="font-mono text-xs sm:text-sm font-light text-zinc-300 tracking-wider">
              {t('HERO_TITLE')}
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/50 to-transparent" />
          </div>
        </motion.div>

        {/* Compact interactive terminal with Digital Guide banner (Foto 4) */}
        <motion.div variants={item} className="mt-1 w-full max-w-[28rem] xl:max-w-[31rem]">
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
                className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] text-zinc-400 transition-colors hover:text-[#00BB7F] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00BB7F]"
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
                      src="/avatar3.png"
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
                {commands.map((cmd) => (
                  <li key={cmd} className="min-w-0">
                    <button
                      type="button"
                      disabled={isDispatching}
                      onClick={(event) => {
                        event.stopPropagation();
                        dispatch(cmd);
                      }}
                      className="group flex w-full min-w-0 items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.03] px-2 py-1.5 text-left font-mono text-[11px] sm:text-[12px] text-zinc-300 transition-colors hover:border-[#00BB7F]/50 hover:bg-[#00BB7F]/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00BB7F] disabled:opacity-60"
                    >
                      <span
                        aria-hidden="true"
                        className="hidden text-[#00BB7F]/70 transition-colors group-hover:text-[#00BB7F] min-[360px]:inline"
                      >
                        ›
                      </span>
                      <span className="truncate">{SECTION_LABELS[cmd]}</span>
                    </button>
                  </li>
                ))}
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
                  className="min-w-0 flex-1 bg-transparent font-mono text-[14px] sm:text-[12px] text-zinc-100 caret-[#00BB7F] outline-none placeholder:text-zinc-600"
                />
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>

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
          <p className="text-base sm:text-xl" aria-label={`> ${CRT_COMMAND}`}>
            <span aria-hidden="true">
              <span className="text-[#00BB7F]">&gt;</span> <span ref={typedRef} />
              <span className="animate-pulse">_</span>
            </span>
          </p>
          <div ref={menuRef} className="invisible opacity-0">
            <p className="mb-3 text-xs text-[#4dffb0]/60 sm:text-sm">{t('SYSTEM_READY_NAVIGATION')}</p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {commands.map((cmd) => (
                <li key={cmd}>
                  <button
                    type="button"
                    onClick={() => panelRef.current?.runCommand(cmd)}
                    className="w-full rounded border border-[#4dffb0]/30 bg-[#4dffb0]/[0.04] px-3 py-2 text-left text-sm transition-colors hover:border-[#4dffb0]/70 hover:bg-[#4dffb0]/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4dffb0]"
                  >
                    › {SECTION_LABELS[cmd]}
                  </button>
                </li>
              ))}
            </ul>
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
