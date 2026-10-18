import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { runExpProjectsTransition, type Box as XpBox, type PanelKey as XpPanelKey } from "./expProjectsTransition";
import { runProjectsContactTransition } from "./projectsContactTransition";
import { runContactAiTransition } from "./contactAiTransition";
import {
  Terminal,
  X,
  Briefcase,
  Calendar,
  Minus,
  Maximize2,
  Hash,
  Download,
  Languages,
  Folder,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
  Github,
  ExternalLink,
  Globe,
  Smartphone,
  Activity,
  ArrowUpRight,
  FileText,
  Home,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import {
  aboutData,
  cvData,
  experienceData,
  projectEntries,
  type ProjectEntry,
  type ProjectStatus,
  type ProjectImage,
  type ProjectLink,
} from "@/data/portfolioProfile";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getProjectMedia } from "@/lib/projectMedia";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { AiTerminalView } from "./AiTerminalView";

const TypewriterText = ({
  text,
  speed = 10,
  onTick,
}: {
  text: string;
  speed?: number;
  onTick?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        onTick?.();
      } else {
        setIsDone(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onTick]);

  return (
    <span>
      {displayedText}
      {!isDone && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "steps(2)" }}
          className="inline-block w-1.5 h-3.5 bg-emerald-500 ml-1 align-middle"
        />
      )}
    </span>
  );
};

// `cv` is no longer a section: it is an alias that opens Contact and
// highlights the CV block (see handleCommand).
export const commands = ["about", "experience", "projects", "contact", "ai"];

type AgentId = "frontend" | "backend" | "ai" | "devops";

interface RectBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

const ABOUT_EXP_DURATION_MS = 1500;
const ABOUT_EXP_REDUCED_MS = 450;
/** About and Experience stay mounted together once one is open (the inactive
 *  one hidden), so the timed transition never mounts ~1k nodes mid-animation. */
const HIDDEN_SECTION_STYLE: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  height: 0,
  overflow: "hidden",
  visibility: "hidden",
  pointerEvents: "none",
};

/** Touch-first device: don't auto-focus text inputs (it pops the keyboard). */
function isCoarsePointer(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

interface ExpProjectsTransition {
  direction: "forward" | "reverse";
  sourceMode: "experience" | "direct";
}

interface ExpProjectsSnapshot {
  contentBox: XpBox;
  robotBoxes: XpBox[];
  expClone: { node: HTMLElement; box: XpBox } | null;
  panelClones: Partial<Record<XpPanelKey, { node: HTMLElement; box: XpBox }>>;
  avatar: { src: string; box: XpBox } | null;
}

const rectOf = (el: Element): XpBox => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

/**
 * Maps a job's tech tags in Experience to the 4 agent areas currently in NEURAL_SKILL_MATRIX:
 * - frontend (Gemini): React, React Native, TypeScript, JavaScript, HTML/CSS, Mobile Development
 * - backend (Cursor): Node.js, SQL, PHP, System Design, APIs
 * - ai (Claude): AI, LLMs, MCPs, n8n, IoT, Agile
 * - devops (ChatGPT): AWS, Docker, Git, DevOps, CI/CD
 */
function getMatchingAgentsForTech(techList: string[]): Set<AgentId> {
  const matched = new Set<AgentId>();
  for (const raw of techList) {
    const tag = raw.toLowerCase().trim();
    if (
      tag.includes("react") ||
      tag.includes("typescript") ||
      tag.includes("javascript") ||
      tag.includes("html") ||
      tag.includes("css") ||
      tag.includes("mobile") ||
      tag.includes("frontend") ||
      tag.includes("tailwind")
    ) {
      matched.add("frontend");
    }
    if (
      tag.includes("node") ||
      tag.includes("sql") ||
      tag.includes("php") ||
      tag.includes("system design") ||
      tag.includes("api") ||
      tag.includes("backend") ||
      tag.includes("postgres")
    ) {
      matched.add("backend");
    }
    if (
      tag.includes("ai") ||
      tag.includes("llm") ||
      tag.includes("mcp") ||
      tag.includes("n8n") ||
      tag.includes("iot") ||
      tag.includes("agile")
    ) {
      matched.add("ai");
    }
    if (
      tag.includes("aws") ||
      tag.includes("docker") ||
      tag.includes("git") ||
      tag.includes("devops") ||
      tag.includes("ci/cd") ||
      tag.includes("vercel")
    ) {
      matched.add("devops");
    }
  }
  return matched;
}

const ScanningEffect = () => (
  <motion.div
    className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    transition={{ delay: 2.5, duration: 0.5 }}
  >
    <motion.div
      className="w-full h-[2px] bg-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
      initial={{ top: "-5%" }}
      animate={{
        top: "105%",
      }}
      transition={{
        duration: 2,
        ease: "linear",
      }}
      style={{ position: "absolute" }}
    />
    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15)_0px,rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)] bg-[size:100%_4px] opacity-20" />
  </motion.div>
);

type AvatarPose =
  | "idle"
  | "wave"
  | "coffee"
  | "laptop"
  | "sleep"
  | "bug"
  | "dance"
  | "gym"
  | "ball";

const AVATAR_POSES: AvatarPose[] = [
  "idle",
  "wave",
  "coffee",
  "laptop",
  "sleep",
  "bug",
  "dance",
  "gym",
  "ball",
];

// Slash commands listed by "/" and help in the ask-roiner AI terminal. The
// avatar-pose commands (coffee, deploy...) now just reply with text.
const AI_SLASH_COMMANDS = [
  "help",
  "clear",
  "coffee",
  "deploy",
  "bug",
  "dance",
  "gym",
  "exit",
] as const;

const AVATAR_COMMAND_CONFIG: Record<
  string,
  {
    pose?: AvatarPose;
    stay?: boolean;
    fx?: "rocket";
    hidden?: boolean;
    descKey?: string;
    lines?: { en: string[]; es: string[] };
  }
> = {
  help: {
    pose: "wave",
    descKey: "AVATAR_DESC_HELP",
  },
  info: {
    pose: "wave",
    descKey: "AVATAR_DESC_INFO",
  },
  coffee: {
    pose: "coffee",
    descKey: "AVATAR_DESC_COFFEE",
    lines: {
      en: [
        "brewing… caffeine levels: 87% → 100%. ☕",
        "coffee.exe loaded. productivity +42.",
        "espresso is just a hotfix for sleep.",
      ],
      es: [
        "preparando café… nivel de cafeína: 87% → 100%. ☕",
        "coffee.exe cargado. productividad +42.",
        "un espresso es básicamente un hotfix para el sueño.",
      ],
    },
  },
  deploy: {
    pose: "laptop",
    descKey: "AVATAR_DESC_DEPLOY",
    fx: "rocket",
    lines: {
      en: [
        "git push origin main… 🚀 deployed on a Monday. bold.",
        "build passed. tests passed. vibes passed. 🚀",
        "shipping to prod. no, it's fine. it's fine. 🚀",
      ],
      es: [
        "git push origin main… 🚀 desplegado un lunes. sin miedo al éxito.",
        "build pasó. tests pasaron. las vibras pasaron. 🚀",
        "subiendo a prod. sí, todo está bien. todo fino. 🚀",
      ],
    },
  },
  bug: {
    pose: "bug",
    descKey: "AVATAR_DESC_BUG",
    lines: {
      en: [
        "found one in prod. *stomp* — fixed.",
        "bug squashed. it was a missing semicolon. it's always a semicolon.",
        "404: bug not found (anymore).",
      ],
      es: [
        "encontré uno en prod. *pisa* — arreglado.",
        "bug aplastado. faltaba un punto y coma. siempre es un punto y coma.",
        "404: bug no encontrado (ya pasó a mejor vida).",
      ],
    },
  },
  sleep: {
    pose: "sleep",
    stay: true,
    descKey: "AVATAR_DESC_SLEEP",
    lines: {
      en: [
        "entering low-power mode… zzz. type `wake` to resume.",
        "sleeping. dreams compiled with 0 warnings.",
      ],
      es: [
        "entrando en modo bajo consumo… zzz. escribe `wake` para volver.",
        "durmiendo. sueños compilados con 0 warnings.",
      ],
    },
  },
  wake: {
    pose: "idle",
    descKey: "AVATAR_DESC_WAKE",
    lines: {
      en: [
        "rebooting… ☀️ i'm up, i'm up.",
        "systemctl start roiner — active (running).",
      ],
      es: [
        "reiniciando… ☀️ ya desperté, ya estoy activo.",
        "systemctl start roiner — activo (corriendo).",
      ],
    },
  },
  dance: {
    pose: "dance",
    descKey: "AVATAR_DESC_DANCE",
    lines: {
      en: [
        "♪ tests are green, let's go ♫",
        "dancing like nobody's reviewing my PR. ♪",
      ],
      es: [
        "♪ los tests están en verde, ¡vamos! ♫",
        "bailando como si nadie estuviera revisando mi PR. ♪",
      ],
    },
  },
  gym: {
    pose: "gym",
    descKey: "AVATAR_DESC_GYM",
    lines: {
      en: [
        "lifting heavy… still lighter than node_modules.",
        "rep 12/12. gains committed and pushed.",
      ],
      es: [
        "levantando pesado… igual pesa menos que node_modules.",
        "rep 12/12. ganancias commiteadas y pusheadas.",
      ],
    },
  },
  ball: {
    pose: "ball",
    hidden: true,
    lines: {
      en: [
        "🏀 easter egg unlocked: off-hours, i'm on the court.",
        "🏀 nothing but net. unlike my first regex.",
      ],
      es: [
        "🏀 easter egg desbloqueado: fuera de horario, estoy en la cancha.",
        "🏀 pura red. no como mi primer regex.",
      ],
    },
  },
  clear: {
    descKey: "AVATAR_DESC_CLEAR",
  },
};

const visibleAvatarCommands = Object.entries(AVATAR_COMMAND_CONFIG)
  .filter(([, cfg]) => !cfg.hidden)
  .map(([k]) => k);

const allAutocompleteCommands = [...commands, ...visibleAvatarCommands];

const shellCommands = new Set([
  ...commands,
  ...Object.keys(AVATAR_COMMAND_CONFIG),
]);

type ShellLogItem =
  | { id: string; type: "echo"; raw: string }
  | { id: string; type: "help" }
  | { id: string; type: "response"; en: string; es: string }
  | { id: string; type: "auto-sleep" }
  | { id: string; type: "not-found"; cmd: string };

const viewOrder: ("about" | "experience" | "projects" | "contact")[] = [
  "about",
  "experience",
  "projects",
  "contact",
];

type TerminalView =
  | "terminal"
  | "about"
  | "experience"
  | "projects"
  | "contact";

type TerminalMode = "shell" | "ai";

type ChatRole = "assistant" | "user" | "system";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

function createAiWelcomeHistoryContext(welcomeMessage: string): ChatMessage[] {
  return [
    {
      id: "ai-welcome",
      role: "assistant",
      content: welcomeMessage,
    },
  ];
}

function normalizePrompt(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

interface TerminalPanelProps {
  variant?: "default" | "floating" | "centered";
  /**
   * When true, the collapsed shell is not rendered. The panel only appears
   * once a command expands it (sections / AI mode), so an external UI can
   * drive navigation through the imperative `runCommand` handle.
   */
  headless?: boolean;
  /** Notified whenever the panel expands into (or closes) a full-screen view. */
  onExpandedChange?: (expanded: boolean) => void;
}

export interface TerminalPanelHandle {
  /** Runs a command through the panel's existing command router. */
  runCommand: (cmd: string) => void;
  /** Closes any open full-screen section view. */
  close: () => void;
}

interface ExperienceNodeMarkerProps {
  glowRef: (el: HTMLDivElement | null) => void;
}

/**
 * Timeline node. The base square is static; the "lit" state is a separate
 * layer whose opacity is driven by a compositor (WAAPI) animation in sync
 * with the rail pulse, so nothing repaints while the pulse travels.
 */
function ExperienceNodeMarker({ glowRef }: ExperienceNodeMarkerProps) {
  return (
    <div
      className="relative z-10 flex h-4 w-4 items-center justify-center border"
      style={{
        borderColor: "rgba(63,63,70,0.9)",
        backgroundColor: "rgba(9,9,11,1)",
      }}
    >
      <div className="h-1.5 w-1.5 bg-emerald-500/60" style={{ opacity: 0.45 }} />
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px flex items-center justify-center border will-change-[opacity]"
        style={{
          opacity: 0,
          borderColor: "rgba(16,185,129,0.95)",
          backgroundColor: "rgba(16,185,129,0.18)",
          boxShadow:
            "0 0 18px rgba(16,185,129,0.8), 0 0 28px rgba(16,185,129,0.35)",
        }}
      >
        <div className="h-1.5 w-1.5 scale-125 bg-emerald-500/60" />
      </div>
    </div>
  );
}

function AnimatedContactAvatar({
  isExternallyHovered = false,
  frameRef,
}: {
  isExternallyHovered?: boolean;
  frameRef?: React.Ref<HTMLDivElement>;
}) {
  // Static peace-sign portrait: the greeting itself now happens in the
  // Projects -> Contact transition (sprite glitches into the peace pose and
  // pixel-morphs into this photo), so there is no hover image swap any more.
  // Hover only lights the frame border.
  const [isInternallyHovered, setIsInternallyHovered] = useState(false);
  const isHovered = isExternallyHovered || isInternallyHovered;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setIsInternallyHovered(true)}
      onHoverEnd={() => setIsInternallyHovered(false)}
      className="relative group"
    >
      <motion.div
        className="absolute -inset-3 rounded-[1.7rem] bg-[radial-gradient(circle_at_30%_35%,rgba(16,185,129,0.22),transparent_58%)] opacity-0 blur-2xl pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      />

      <motion.div
        ref={frameRef}
        data-contact-photo=""
        className="relative aspect-square overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#158a67] shadow-2xl"
        animate={{
          borderColor: isHovered
            ? "rgba(52, 211, 153, 0.55)"
            : "rgba(16, 185, 129, 0.2)",
          boxShadow: isHovered
            ? "0 30px 60px -24px rgba(16,185,129,0.38), 0 0 0 1px rgba(52,211,153,0.12)"
            : "0 25px 50px -24px rgba(0,0,0,0.65)",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <img
          data-contact-photo-img=""
          src="/avatar_peace.webp"
          alt="Roiner Hernandez haciendo el signo de paz"
          className="h-full w-full object-cover opacity-95"
        />

        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_42%,rgba(255,255,255,0.16),transparent_26%)] opacity-[0.16]" />

        <div className="absolute -top-1 -left-1 h-12 w-12 border-t-2 border-l-2 border-emerald-400/50 pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 h-12 w-12 border-b-2 border-r-2 border-emerald-400/50 pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}

function TerminalLinkButton({
  label,
  href,
  index = 0,
}: ProjectLink & { index?: number }) {
  // Format label to be lowercase and use spaces (e.g., "explore product site")
  const formattedLabel = label.replace(/_/g, " ").toLowerCase();

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ x: 4 }}
      className="group relative inline-flex items-center gap-2 py-1 transition-all max-md:min-h-11"
    >
      {/* Subtle arrow pulse indicator to call attention */}
      <div className="absolute -left-5 flex items-center justify-center pointer-events-none">
        <ChevronRight className="h-3 w-3 text-emerald-500/40" />
        <motion.div
          animate={{
            scale: [1, 2],
            opacity: [0.6, 0],
            x: [0, 4],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: index * 0.4,
            ease: "easeOut",
          }}
          className="absolute"
        >
          <ChevronRight className="h-3 w-3 text-emerald-400" />
        </motion.div>
      </div>

      <span className="text-sm font-mono text-emerald-500 group-hover:text-emerald-400 transition-colors border-b border-transparent group-hover:border-emerald-500/40 max-md:text-[15px]">
        {formattedLabel}
      </span>

      <ArrowUpRight className="h-4 w-4 text-emerald-500 group-hover:text-emerald-400 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </motion.a>
  );
}

function ProjectSectionLabel({ children }: { children: string }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
      {children}
    </div>
  );
}

const PROJECT_STATUS_STYLES: Record<
  NonNullable<ProjectStatus["kind"]>,
  { badge: string; dot: string; pulse: boolean }
> = {
  production: {
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
    pulse: true,
  },
  live: {
    badge: "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300",
    dot: "bg-emerald-400",
    pulse: false,
  },
  prototype: {
    badge: "border-amber-400/30 bg-amber-400/[0.06] text-amber-200",
    dot: "bg-amber-300",
    pulse: false,
  },
  personal: {
    badge: "border-sky-400/30 bg-sky-400/[0.06] text-sky-200",
    dot: "bg-sky-300",
    pulse: false,
  },
  past: {
    badge: "border-zinc-600/60 bg-zinc-800/40 text-zinc-300",
    dot: "bg-zinc-400",
    pulse: false,
  },
};

function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const style = PROJECT_STATUS_STYLES[status.kind ?? "live"];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 normal-case tracking-[0.06em] ${style.badge}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {style.pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:animate-none ${style.dot}`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${style.dot}`} />
      </span>
      {status.label}
    </span>
  );
}

function ProjectMediaPanel({
  project,
  selectedImageIndex,
  onSelectImage,
  compact = false,
}: {
  project: ProjectEntry;
  selectedImageIndex: number;
  onSelectImage: (index: number) => void;
  /** Mobile: in-flow viewer, swipe between images, tap to view full screen. */
  compact?: boolean;
}) {
  const [zoomed, setZoomed] = useState(false);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  // Videos that failed to load are dropped, so the viewer falls back to images.
  const [failedMedia, setFailedMedia] = useState<string[]>([]);
  const images = useMemo(() => {
    const all: ProjectImage[] =
      project.gallery && project.gallery.length > 0
        ? project.gallery
        : getProjectMedia(project.id, project.mediaCaptions);
    return all.filter((item) => !failedMedia.includes(item.src));
  }, [project.gallery, project.id, project.mediaCaptions, failedMedia]);
  const isLandscape = project.galleryVariant === "landscape";
  const activeImage = images[selectedImageIndex] ?? images[0];
  const isVideo = activeImage?.type === "video";
  const reduceMotion = useReducedMotion() ?? false;
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isImageLoading, setIsImageLoading] = useState(true);

  // Video: muted loop that plays only while visible (paused off-screen, and
  // never autoplayed with reduced motion; controls are shown instead).
  useEffect(() => {
    const video = videoRef.current;
    if (!isVideo || !video || reduceMotion) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [isVideo, activeImage?.src, reduceMotion]);

  // Reset loading state when image source changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [activeImage?.src]);

  // Preload only the neighbours of the visible image (not the whole gallery),
  // so arrows feel instant without downloading every screenshot up front.
  useEffect(() => {
    if (images.length < 2) return;
    const neighbours = [
      images[(selectedImageIndex + 1) % images.length],
      images[(selectedImageIndex - 1 + images.length) % images.length],
    ];
    neighbours.forEach((img) => {
      if (img.type === "video") return;
      const preloader = new window.Image();
      preloader.decoding = "async";
      preloader.src = img.src;
    });
  }, [images, selectedImageIndex]);

  const nextImage = () => {
    onSelectImage((selectedImageIndex + 1) % images.length);
  };

  const prevImage = () => {
    onSelectImage((selectedImageIndex - 1 + images.length) % images.length);
  };

  if (!activeImage) {
    return null;
  }

  const swipeHandlers = compact
    ? {
        onTouchStart: (e: React.TouchEvent) => {
          const t = e.touches[0];
          swipeRef.current = t ? { x: t.clientX, y: t.clientY } : null;
        },
        onTouchEnd: (e: React.TouchEvent) => {
          const start = swipeRef.current;
          swipeRef.current = null;
          const t = e.changedTouches[0];
          if (!start || !t || images.length < 2) return;
          const dx = t.clientX - start.x;
          const dy = t.clientY - start.y;
          if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
          if (dx < 0) nextImage();
          else prevImage();
        },
      }
    : {};

  return (
    <div className="group relative w-full min-w-0 lg:flex lg:h-full lg:flex-col lg:justify-center">
      <div
        className={`overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-500 ${
          isLandscape
            ? "border border-zinc-800/80 bg-zinc-950"
            : "bg-zinc-950/50"
        }`}
      >
        <div
          {...swipeHandlers}
          style={compact ? { touchAction: "pan-y" } : undefined}
          className={`relative flex items-center justify-center overflow-hidden ${
            isLandscape
              ? "aspect-[16/10] w-full p-2 sm:p-3"
              : compact
                ? "h-[min(56dvh,520px)] min-h-[300px] p-3"
                : "h-[min(58vh,600px)] min-h-[340px] p-3 sm:p-5 lg:h-[calc(100vh-345px)]"
          }`}
        >
          {/* Loading indicator */}
          <AnimatePresence>
            {isImageLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 z-0 flex items-center justify-center bg-zinc-950/20 ${compact ? "" : "backdrop-blur-sm"}`}
              >
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-16 h-16 rounded-full border-2 border-emerald-500/20 flex items-center justify-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30" />
                  </motion.div>
                  <span className="font-mono text-[10px] text-emerald-500/40 uppercase tracking-widest">
                    Loading Media...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isVideo ? (
              <motion.video
                key={activeImage.src}
                ref={videoRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: isImageLoading ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                src={activeImage.src}
                poster={activeImage.poster}
                muted
                loop
                playsInline
                preload="metadata"
                controls={reduceMotion}
                aria-label={activeImage.caption || project.displayName}
                onLoadedData={() => setIsImageLoading(false)}
                onError={() => {
                  setFailedMedia((prev) => [...prev, activeImage.src]);
                  setIsImageLoading(true);
                }}
                className={`relative z-10 w-full object-contain ${
                  isLandscape ? "max-h-full bg-zinc-950" : "h-full max-h-full"
                }`}
              />
            ) : (
            <motion.img
              key={activeImage.src}
              initial={{ opacity: 0, x: 20, scale: 0.98 }}
              animate={{ opacity: isImageLoading ? 0 : 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 1.02 }}
              onLoad={() => setIsImageLoading(false)}
              onClick={compact ? () => setZoomed(true) : undefined}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              src={activeImage.src}
              alt={activeImage.caption || project.displayName}
              decoding="async"
              className={`relative z-10 w-full object-contain ${
                isLandscape
                  ? "max-h-full bg-zinc-950"
                  : "h-full max-h-full drop-shadow-[0_0_50px_rgba(16,185,129,0.1)]"
              }`}
            />
            )}
          </AnimatePresence>

          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04),transparent_70%)]" />

          {images.length > 1 && (
            <>
              {/* Full-height Side Navigation - Always visible and green */}
              <div className="absolute inset-y-0 left-0 w-16 z-30 flex items-center justify-center transition-opacity duration-300">
                <button
                  onClick={prevImage}
                  aria-label={language === "es" ? "Imagen anterior" : "Previous image"}
                className="h-full w-full flex items-center justify-center bg-gradient-to-r from-black/40 to-transparent text-emerald-500/60 hover:text-emerald-400 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 w-16 z-30 flex items-center justify-center transition-opacity duration-300">
                <button
                  onClick={nextImage}
                  aria-label={language === "es" ? "Imagen siguiente" : "Next image"}
                className="h-full w-full flex items-center justify-center bg-gradient-to-l from-black/40 to-transparent text-emerald-500/60 hover:text-emerald-400 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

            </>
          )}
        </div>
      </div>

      {/* Mobile full-screen image viewer (tap the image; tap anywhere to close) */}
      {compact &&
        zoomed &&
        !isVideo &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={activeImage.caption || project.displayName}
            onClick={() => setZoomed(false)}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]"
          >
            <img
              src={activeImage.src}
              alt={activeImage.caption || project.displayName}
              className="max-h-full max-w-full object-contain"
            />
            <button
              type="button"
              aria-label={language === "es" ? "Cerrar" : "Close"}
              onClick={() => setZoomed(false)}
              className="absolute right-2 top-[max(0.5rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>,
          document.body,
        )}

      {/* Feature caption: what the app does in this slide (also the media counter) */}
      {activeImage.caption && (
        <div className="mt-5 px-1 min-h-[96px]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeImage.src}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-400">
                <span>
                  {language === "es" ? "FUNCIÓN" : "FEATURE"}{" "}
                  {String(selectedImageIndex + 1).padStart(2, "0")}
                  <span className="text-emerald-700">/</span>
                  {String(images.length).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
              </div>
              <p className="mt-2.5 flex gap-2.5 font-mono text-[18px] font-semibold leading-snug tracking-tight text-zinc-100 max-md:text-[16px] xl:text-[20px]">
                <span className="text-emerald-500" aria-hidden="true">
                  &gt;
                </span>
                <span>{activeImage.caption}</span>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export const TerminalPanel = forwardRef<TerminalPanelHandle, TerminalPanelProps>(
  function TerminalPanel(
    { variant = "default", headless = false, onExpandedChange },
    ref,
  ) {
  const { t, language, toggleLanguage, data } = useLanguage();
  const {
    about: aboutData,
    cv: cvData,
    experience: experienceData,
    projects: projectEntries,
  } = data;
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion() ?? false;
  const aboutStatusText =
    aboutData.status === "OPEN_FOR_NEW_PROJECTS"
      ? t("STATUS_OPEN_TO_NEW_PROJECTS")
      : aboutData.status;

  const SUGGESTED_QUESTIONS = [
    t("SUGGESTED_Q1"),
    t("SUGGESTED_Q2"),
    t("SUGGESTED_Q3"),
    t("SUGGESTED_Q4"),
    t("SUGGESTED_Q5"),
    t("SUGGESTED_Q6"),
  ];

  const [inputValue, setInputValue] = useState("");
  const [activeView, setActiveView] = useState<TerminalView>("terminal");
  const [terminalMode, setTerminalMode] = useState<TerminalMode>("shell");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() =>
    createAiWelcomeHistoryContext(t("AI_WELCOME")),
  );
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState("plunkton");
  const [activeProjectImageIndex, setActiveProjectImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [isContactCardHovered, setIsContactCardHovered] = useState(false);
  const [experienceRailHeight, setExperienceRailHeight] = useState(0);
  const [experienceNodeTargets, setExperienceNodeTargets] = useState<number[]>(
    [],
  );
  const [aboutTypedLength, setAboutTypedLength] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showAboutHint, setShowAboutHint] = useState(false);
  const [sessionId] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase(),
  );
  const [avatarPose, setAvatarPose] = useState<AvatarPose>("idle");
  const [avatarAnim, setAvatarAnim] = useState<"idle" | "pop" | "squash" | "">(
    "idle",
  );
  const [rocketBursts, setRocketBursts] = useState<
    Array<{ id: string; sparks: Array<{ dx: number; dy: number }> }>
  >([]);
  const [shellLog, setShellLog] = useState<ShellLogItem[]>([]);
  const [showInitialBanner, setShowInitialBanner] = useState(true);
  const [hasOpenedProject, setHasOpenedProject] = useState(false);
  const [miniDisplayPose, setMiniDisplayPose] = useState<AvatarPose>("wave");
  const [miniAnim, setMiniAnim] = useState<"idle" | "pop">("idle");
  const skipMiniPopRef = useRef(false);
  const [projectsHint, setProjectsHint] = useState(false);
  const [aboutExpTransition, setAboutExpTransition] = useState<{
    direction: "forward" | "reverse";
    fromRects: RectBox[];
    toRects: RectBox[];
    // Phones: false when the robots can't fly visibly (About cards off
    // screen, or going back to About); the sections just crossfade.
    fly?: boolean;
  } | null>(null);
  // Active Experience job: kept out of React state so scrolling never
  // re-renders the whole panel; toggled as a data attribute on the job nodes.
  const activeExperienceIndexRef = useRef(0);
  const [keepAboutExpMounted, setKeepAboutExpMounted] = useState(false);
  const appliedExperienceIndexRef = useRef(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const shellOutputRef = useRef<HTMLDivElement>(null);
  const experienceRailRef = useRef<HTMLDivElement>(null);
  const experienceNodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const experienceItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const applyActiveExperienceIndex = useCallback((idx: number) => {
    activeExperienceIndexRef.current = idx;
    if (appliedExperienceIndexRef.current === idx) return;
    appliedExperienceIndexRef.current = idx;
    experienceItemRefs.current.forEach((node, i) => {
      if (!node) return;
      if (i === idx) node.setAttribute("data-job-active", "");
      else node.removeAttribute("data-job-active");
    });
  }, []);
  const experiencePulseRef = useRef<HTMLDivElement>(null);
  const experienceGlowRefs = useRef<Array<HTMLDivElement | null>>([]);

  const overlayScrollRef = useRef<HTMLDivElement>(null);
  const innerScrollRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const aboutCardsGridRef = useRef<HTMLDivElement>(null);
  const expSectionRef = useRef<HTMLDivElement>(null);
  const aboutRobotRefs = useRef<Array<HTMLElement | null>>([
    null,
    null,
    null,
    null,
  ]);
  const expRobotRefs = useRef<Array<HTMLElement | null>>([
    null,
    null,
    null,
    null,
  ]);
  const flyingRobotRefs = useRef<Array<HTMLDivElement | null>>([
    null,
    null,
    null,
    null,
  ]);
  const isAboutExpTransitioningRef = useRef(false);
  const aboutExpRafRef = useRef<number>(0);
  const aboutRectsCacheRef = useRef<RectBox[]>([]);
  const capturedAboutScrollTopRef = useRef<number>(0);
  const hasVisitedAboutRef = useRef(false);
  const lastTransitionEndRef = useRef<number>(0);
  // Touch: reaching the bottom of About/Experience first "arms" the next
  // section (a visible card); a second pull (or a tap) runs the transition.
  const [nextArmed, setNextArmed] = useState(false);
  const nextArmedRef = useRef(false);
  const setArmed = useCallback((v: boolean) => {
    if (nextArmedRef.current === v) return;
    nextArmedRef.current = v;
    setNextArmed(v);
  }, []);

  const [expProjectsTransition, setExpProjectsTransition] = useState<ExpProjectsTransition | null>(null);
  const isExpProjectsTransitioningRef = useRef(false);
  const expProjectsSnapshotRef = useRef<ExpProjectsSnapshot | null>(null);
  const projectsSidebarRef = useRef<HTMLElement>(null);
  const projectsBreadcrumbRef = useRef<HTMLDivElement>(null);
  const projectsTextPanelRef = useRef<HTMLDivElement>(null);
  const projectsMediaPanelRef = useRef<HTMLDivElement>(null);
  const projectsStatusBarRef = useRef<HTMLDivElement>(null);
  const projectsScrollSectionRef = useRef<HTMLElement>(null);
  const projectFolderRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const projectChipsRef = useRef<HTMLDivElement>(null);
  const projectTitleRef = useRef<HTMLSpanElement>(null);
  const contactPhotoRef = useRef<HTMLDivElement>(null);
  const contactRootRef = useRef<HTMLDivElement>(null);
  const projectsRootRef = useRef<HTMLDivElement>(null);
  const [projContactTransition, setProjContactTransition] = useState<{
    direction: "forward" | "reverse";
  } | null>(null);
  const isProjContactTransitioningRef = useRef(false);
  // Contact <-> AI "CRT power-off" transition (see contactAiTransition.ts).
  const isContactAiTransitioningRef = useRef(false);
  const contactAiCancelRef = useRef<null | (() => void)>(null);
  // While true, the view swap under the transition is instant (no
  // AnimatePresence fade, so there is never a blank frame).
  const [instantViewSwap, setInstantViewSwap] = useState(false);
  // Phones: section hops use the "curtain" (see mobileJump).
  const mobileJumpRef = useRef(false);
  const mobileJumpFnRef = useRef<null | ((cmd: string) => void)>(null);
  const [aiCrewLeaving, setAiCrewLeaving] = useState(false);
  const projContactSnapRef = useRef<{
    projectsClone?: HTMLElement;
    projectsBox?: XpBox;
    avatar?: { src: string; box: XpBox } | null;
    contactClone?: HTMLElement;
    contactBox?: XpBox;
    contactScrollTop?: number;
    projectsScrollTop?: number;
    spriteSrc?: string;
  } | null>(null);
  const contactCvRef = useRef<HTMLDivElement>(null);
  const contactCvButtonRef = useRef<HTMLAnchorElement>(null);
  const [cvFocusTick, setCvFocusTick] = useState(0);
  const [cvHighlight, setCvHighlight] = useState(false);
  const activeViewRef = useRef<TerminalView>(activeView);
  activeViewRef.current = activeView;

  const poseRef = useRef<AvatarPose>("idle");
  const animRef = useRef<"idle" | "pop" | "squash" | "">("idle");
  const backToIdleTimerRef = useRef<number | null>(null);
  const popTimerRef = useRef<number | null>(null);
  const sleepTimerRef = useRef<number | null>(null);
  const squashTimerRef = useRef<number | null>(null);
  const miniPopTimerRef = useRef<number | null>(null);

  const agentCards: Array<{
    id: AgentId;
    area: string;
    shortLabel: string;
    sprite: string;
    skills: string[];
  }> = [
    {
      id: "frontend",
      area: "Frontend",
      shortLabel: "FRONTEND",
      sprite: "/hero/agents/gemini.png",
      skills: aboutData.skills.frontend,
    },
    {
      id: "backend",
      area: "Backend",
      shortLabel: "BACKEND",
      sprite: "/hero/agents/cursor.png",
      skills: aboutData.skills.backend.filter((s) => s !== "AWS"),
    },
    {
      id: "ai",
      area: language === "es" ? "IA y Agentes" : "AI & Agents",
      shortLabel: language === "es" ? "IA / AGENTES" : "AI / AGENTS",
      sprite: "/hero/agents/claude.png",
      skills: aboutData.skills.tools_ia.filter((s) =>
        ["AI Agents", "LLMs", "MCPs", "n8n"].includes(s),
      ),
    },
    {
      id: "devops",
      area: language === "es" ? "DevOps y Herramientas" : "DevOps & Tools",
      shortLabel: "DEVOPS",
      sprite: "/hero/agents/chatgpt.png",
      skills: [
        ...aboutData.skills.tools_ia.filter((s) =>
          ["Git", "Docker"].includes(s),
        ),
        ...(aboutData.skills.backend.includes("AWS") ? ["AWS"] : []),
      ],
    },
  ];

  const activeProject =
    projectEntries.find((project) => project.id === activeProjectId) ??
    projectEntries[0];
  const activeProjectIndex = projectEntries.findIndex(
    (project) => project.id === activeProject.id,
  );
  const hasNextProject =
    activeProjectIndex !== -1 && activeProjectIndex < projectEntries.length - 1;
  const usesProjectSplitScroll = isExpanded && activeView === "projects";
  const isAiMode = terminalMode === "ai";
  const usesFullscreenExpandedLayout =
    isExpanded &&
    (activeView === "projects" ||
      activeView === "contact" ||
      isAiMode);
  const usesTouchNavigationCopy = isMobile || isCompactViewport;

  const sectionMiniPose: AvatarPose | null =
    aboutExpTransition !== null ||
    expProjectsTransition !== null ||
    projContactTransition !== null
      ? null
      : !isAiMode && activeView === "projects"
      ? hasOpenedProject
        ? "laptop"
        : "coffee"
      : null;

  // Mini avatar hint in Projects: "open a folder", until a folder is opened or ~8s.
  useEffect(() => {
    if (
      isExpanded &&
      activeView === "projects" &&
      !isAiMode &&
      expProjectsTransition === null &&
      projContactTransition === null &&
      !hasOpenedProject
    ) {
      // let the avatar settle (pop / morph hand-off) before the bubble appears
      const show = window.setTimeout(() => setProjectsHint(true), 350);
      const hide = window.setTimeout(() => setProjectsHint(false), 8350);
      return () => {
        window.clearTimeout(show);
        window.clearTimeout(hide);
        setProjectsHint(false);
      };
    }
    setProjectsHint(false);
  }, [
    isExpanded,
    activeView,
    isAiMode,
    expProjectsTransition,
    projContactTransition,
    hasOpenedProject,
  ]);

  // `cv` alias: once Contact is showing (and no transition runs), bring the
  // CV block into view, focus its main button and pulse its border.
  useEffect(() => {
    if (cvFocusTick === 0) return;
    if (
      activeView !== "contact" ||
      expProjectsTransition !== null ||
      projContactTransition !== null
    )
      return;
    const t0 = window.setTimeout(() => {
      contactCvRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
      contactCvButtonRef.current?.focus({ preventScroll: true });
      setCvHighlight(true);
    }, 380);
    const t1 = window.setTimeout(() => setCvHighlight(false), 2600);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      setCvHighlight(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvFocusTick, activeView, expProjectsTransition, projContactTransition]);

  // Preload all pixel-art sprites on mount
  useEffect(() => {
    AVATAR_POSES.forEach((pose) => {
      const img = new window.Image();
      img.src = `/avatar/${pose}.png`;
    });
  }, []);

  // Preload + decode the Contact photo layers once Projects is open, so the
  // Projects -> Contact transition doesn't fetch/decode them mid-animation.
  useEffect(() => {
    if (activeView !== "projects") return;
    ["/avatar_peace.webp", "/avatar/peace.png"].forEach(
      (src) => {
        const img = new window.Image();
        img.src = src;
        void img.decode?.().catch(() => {});
      },
    );
  }, [activeView]);

  // Sync section mini avatar pose and pop transition
  useEffect(() => {
    if (!sectionMiniPose) {
      return;
    }
    setMiniDisplayPose(sectionMiniPose);
    if (skipMiniPopRef.current) {
      skipMiniPopRef.current = false;
      setMiniAnim("idle");
      return;
    }
    setMiniAnim("pop");
    if (miniPopTimerRef.current) {
      window.clearTimeout(miniPopTimerRef.current);
    }
    miniPopTimerRef.current = window.setTimeout(() => {
      setMiniAnim("idle");
    }, 320);
    return () => {
      if (miniPopTimerRef.current) {
        window.clearTimeout(miniPopTimerRef.current);
      }
    };
  }, [sectionMiniPose]);

  const triggerAvatarPose = useCallback(
    (newPose: AvatarPose, { stay = false }: { stay?: boolean } = {}) => {
      if (backToIdleTimerRef.current) {
        window.clearTimeout(backToIdleTimerRef.current);
        backToIdleTimerRef.current = null;
      }
      if (popTimerRef.current) {
        window.clearTimeout(popTimerRef.current);
        popTimerRef.current = null;
      }

      poseRef.current = newPose;
      setAvatarPose(newPose);

      animRef.current = "";
      setAvatarAnim("");
      window.requestAnimationFrame(() => {
        animRef.current = "pop";
        setAvatarAnim("pop");
        popTimerRef.current = window.setTimeout(() => {
          const nextAnim = poseRef.current === "idle" ? "idle" : "";
          animRef.current = nextAnim;
          setAvatarAnim(nextAnim);
        }, 320);
      });

      if (newPose !== "idle" && !stay) {
        backToIdleTimerRef.current = window.setTimeout(() => {
          poseRef.current = "idle";
          setAvatarPose("idle");
          animRef.current = "pop";
          setAvatarAnim("pop");
          popTimerRef.current = window.setTimeout(() => {
            if (poseRef.current === "idle") {
              animRef.current = "idle";
              setAvatarAnim("idle");
            }
          }, 320);
        }, 6000);
      }
    },
    [],
  );

  const armSleep = useCallback(() => {
    if (sleepTimerRef.current) {
      window.clearTimeout(sleepTimerRef.current);
    }
    sleepTimerRef.current = window.setTimeout(() => {
      if (poseRef.current !== "sleep") {
        triggerAvatarPose("sleep", { stay: true });
        setChatHistory((current) => [
          ...current,
          {
            id: `sleep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            role: "system",
            content: t("AVATAR_AUTO_SLEEP"),
          },
        ]);
      }
    }, 20000);
  }, [triggerAvatarPose, t]);

  // Occasional idle squash
  useEffect(() => {
    let innerTimer: number | null = null;
    const scheduleSquash = () => {
      const delay = 3500 + Math.random() * 4000;
      squashTimerRef.current = window.setTimeout(() => {
        if (poseRef.current === "idle" && animRef.current === "idle") {
          animRef.current = "squash";
          setAvatarAnim("squash");
          innerTimer = window.setTimeout(() => {
            if (poseRef.current === "idle") {
              animRef.current = "idle";
              setAvatarAnim("idle");
            }
          }, 340);
        }
        scheduleSquash();
      }, delay);
    };
    scheduleSquash();
    return () => {
      if (squashTimerRef.current) {
        window.clearTimeout(squashTimerRef.current);
      }
      if (innerTimer) {
        window.clearTimeout(innerTimer);
      }
    };
  }, []);

  // Auto-sleep after 20s of inactivity in AI mode
  useEffect(() => {
    if (!isAiMode || activeView !== "terminal") {
      if (sleepTimerRef.current) {
        window.clearTimeout(sleepTimerRef.current);
      }
      return;
    }

    armSleep();

    const handleActivity = () => {
      if (poseRef.current !== "sleep") {
        armSleep();
      }
    };

    const events = ["mousemove", "keydown", "touchstart", "scroll"] as const;
    events.forEach((ev) =>
      window.addEventListener(ev, handleActivity, { passive: true }),
    );
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      if (sleepTimerRef.current) {
        window.clearTimeout(sleepTimerRef.current);
      }
    };
  }, [activeView, isAiMode, armSleep]);

  // Cleanup pose timers on unmount
  useEffect(() => {
    return () => {
      if (backToIdleTimerRef.current)
        window.clearTimeout(backToIdleTimerRef.current);
      if (popTimerRef.current) window.clearTimeout(popTimerRef.current);
      if (sleepTimerRef.current) window.clearTimeout(sleepTimerRef.current);
    };
  }, []);

  const triggerRocketFx = useCallback(() => {
    const id = `rocket-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const sparks = Array.from({ length: 10 }, () => ({
      dx: Math.trunc(Math.random() * 120 - 60),
      dy: Math.trunc(Math.random() * -120 - 20),
    }));
    setRocketBursts((prev) => [...prev, { id, sparks }]);
    window.setTimeout(() => {
      setRocketBursts((prev) => prev.filter((b) => b.id !== id));
    }, 1700);
  }, []);

  // Phones: until the visitor asks something, the AI view stays at the top
  // (auto-scrolling the welcome clipped the ask-roiner card mid-way).
  const aiPhoneIdleRef = useRef(false);
  aiPhoneIdleRef.current = isMobile && !chatHistory.some((m) => m.role === "user");
  const scrollToBottom = useCallback(() => {
    if (aiPhoneIdleRef.current) return;
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, []);

  const enterAiMode = () => {
    setTerminalMode("ai");
    setActiveView("terminal");
    setIsExpanded(true);
    setInputValue("");
    setChatHistory(createAiWelcomeHistoryContext(t("AI_WELCOME")));
    triggerAvatarPose("dance");
  };

  const exitAiMode = () => {
    setTerminalMode("shell");
    setActiveView("terminal");
    setIsExpanded(false);
    setInputValue("");
  };

  const resetAiConversation = () => {
    setChatHistory(createAiWelcomeHistoryContext(t("AI_WELCOME")));
    setInputValue("");
  };

  const appendSystemMessage = (content: string) => {
    setChatHistory((current) => [
      ...current,
      {
        id: `system-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: "system",
        content,
      },
    ]);
  };

  const startContactAiTransition = (direction: "forward" | "reverse") => {
    // Phones: Contact -> AI plays the CRT power-off inside the content band
    // (header and tab bar stay); AI -> Contact keeps the curtain.
    const phoneCa = window.matchMedia("(max-width: 767px)").matches;
    if (phoneCa && direction === "reverse" && mobileJumpFnRef.current) {
      mobileJumpFnRef.current("contact");
      return;
    }
    let band: { top: number; bottom: number } | undefined;
    if (phoneCa) {
      const hb = document.querySelector("[data-terminal-header]")?.getBoundingClientRect();
      const tb = document.querySelector("[data-mobile-tabbar]")?.getBoundingClientRect();
      band = {
        top: Math.max(0, hb ? hb.bottom : 0),
        bottom: tb ? tb.top : window.innerHeight,
      };
    }
    // Phones: collapse whatever "screen" is on view: the photo square, or
    // (scrolled down to the ask-roiner button) the button itself.
    const inBand = (el: Element | null) => {
      if (!el || !band) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.top >= band.top - 4 && r.bottom <= band.bottom + 4;
    };
    const pickPhoto = () => {
      const photo = document.querySelector<HTMLElement>("[data-contact-photo]");
      if (!phoneCa || inBand(photo)) return photo;
      const cta = document.querySelector<HTMLElement>("[data-mobile-ai-cta]");
      return inBand(cta) ? cta : photo;
    };
    const pickedPhoto = direction === "forward" ? pickPhoto() : null;
    if (
      isAboutExpTransitioningRef.current ||
      isExpProjectsTransitioningRef.current ||
      isProjContactTransitioningRef.current ||
      isContactAiTransitioningRef.current
    )
      return;
    isContactAiTransitioningRef.current = true;
    setInstantViewSwap(true);
    if (direction === "reverse") setAiCrewLeaving(true);
    setInputValue("");
    contactAiCancelRef.current = runContactAiTransition({
      direction,
      reduceMotion,
      getPhoto: () =>
        pickedPhoto && pickedPhoto.isConnected
          ? pickedPhoto
          : document.querySelector<HTMLElement>("[data-contact-photo]"),
      band,
      getCursor: () => document.querySelector<HTMLElement>("[data-ai-cursor]"),
      getAiRoot: () => document.querySelector<HTMLElement>("[data-ai-terminal]"),
      onSwap: () => {
        if (direction === "forward") {
          enterAiMode();
        } else {
          setTerminalMode("shell");
          setIsExpanded(true);
          setActiveView("contact");
          setInputValue("");
        }
      },
      onDone: () => {
        isContactAiTransitioningRef.current = false;
        contactAiCancelRef.current = null;
        setInstantViewSwap(false);
        setAiCrewLeaving(false);
        if (direction === "forward" && !isCoarsePointer()) {
          inputRef.current?.focus({ preventScroll: true });
        }
      },
    });
  };

  useEffect(() => () => contactAiCancelRef.current?.(), []);

  const aiSlashCommands = AI_SLASH_COMMANDS.map((name) => ({
    name,
    desc:
      name === "exit"
        ? language === "es"
          ? "salir del modo IA"
          : "exit AI mode"
        : AVATAR_COMMAND_CONFIG[name]?.descKey
          ? t(AVATAR_COMMAND_CONFIG[name].descKey as string)
          : "",
  }));

  const handleAiCommand = async (rawValue: string) => {
    const trimmed = rawValue.trim();
    // "/help", "/clear"... are the same as the bare commands.
    const normalized = normalizePrompt(rawValue).replace(/^\/(?=\S)/, "");

    if (!trimmed || isAiThinking) {
      return;
    }

    armSleep();

    if (normalized === "exit" || normalized === "back") {
      exitAiMode();
      return;
    }

    if (normalized === "clear") {
      resetAiConversation();
      return;
    }

    if (normalized in AVATAR_COMMAND_CONFIG) {
      const cfg = AVATAR_COMMAND_CONFIG[normalized];
      if (cfg.pose) {
        triggerAvatarPose(cfg.pose, { stay: cfg.stay });
      }
      if (cfg.fx === "rocket") {
        triggerRocketFx();
      }

      const userCmdMessage: ChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: "user",
        content: trimmed,
      };

      if (normalized === "help" || normalized === "info") {
        const cmdLines = aiSlashCommands
          .map((c) => `/${c.name.padEnd(8)} ${c.desc}`)
          .join("\n");
        const helpContent = `${t("AVATAR_AVAILABLE_COMMANDS")}\n${cmdLines}\n\n${t("AI_HELP")}`;
        setChatHistory((current) => [
          ...current,
          userCmdMessage,
          {
            id: `system-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            role: "system",
            content: helpContent,
          },
        ]);
        setInputValue("");
        return;
      }

      if (cfg.lines) {
        const pool = language === "es" ? cfg.lines.es : cfg.lines.en;
        const replyLine = pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
        setChatHistory((current) => [
          ...current,
          userCmdMessage,
          {
            id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            role: "assistant",
            content: replyLine,
          },
        ]);
        setInputValue("");
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const outgoingHistory = [...chatHistory, userMessage]
      .filter(
        (message) => message.id !== "ai-welcome" && message.role !== "system",
      )
      .slice(-10)
      .map((message) => ({
        role: message.role as "user" | "assistant",
        content: message.content,
      }));

    setChatHistory((current) => [...current, userMessage]);
    setInputValue("");
    triggerAvatarPose("laptop");

    try {
      setIsAiThinking(true);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: outgoingHistory,
          language: language,
        }),
      });

      const rawBody = await response.text();
      const data = rawBody
        ? (() => {
            try {
              return JSON.parse(rawBody);
            } catch {
              return null;
            }
          })()
        : null;
      const fallbackStatusMessage =
        response.status === 403
          ? t("AI_FORBIDDEN")
          : `${t("AI_ENDPOINT_RETURNED")} ${response.status} ${response.statusText || "Error"}.`;
      const assistantContent =
        data?.message?.content && typeof data.message.content === "string"
          ? data.message.content
          : response.ok
            ? t("AI_ERROR")
            : response.status === 404
              ? t("AI_LOCAL_SETUP")
              : data?.error && typeof data.error === "string"
                ? data.error
                : fallbackStatusMessage;

      setChatHistory((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          role: "assistant",
          content: assistantContent,
        },
      ]);
    } catch {
      setChatHistory((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          role: "assistant",
          content: t("AI_ERROR"),
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const getFallbackExpRect = useCallback((idx: number): RectBox => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    if (vw < 768) {
      const size = 44;
      const gap = 16;
      const totalW = 4 * size + 3 * gap;
      const startX = (vw - totalW) / 2;
      return {
        left: startX + idx * (size + gap),
        top: 64,
        width: size,
        height: size,
      };
    }
    const size = 72;
    const sideOffsetOuter = Math.max(18, Math.min(130, vw * 0.5 - 510));
    const sideOffsetInner = Math.max(28, Math.min(165, vw * 0.5 - 475));
    const configs = [
      { left: sideOffsetOuter, top: vh * 0.24 },
      { left: sideOffsetInner, top: vh * 0.56 },
      { left: vw - sideOffsetInner - size, top: vh * 0.29 },
      { left: vw - sideOffsetOuter - size, top: vh * 0.61 },
    ];
    const cfg = configs[idx] ?? configs[0];
    return { left: cfg.left, top: cfg.top, width: size, height: size };
  }, []);

  const getActiveScroller = useCallback((): HTMLElement | null => {
    if (activeViewRef.current === "projects" && projectsScrollSectionRef.current) {
      return projectsScrollSectionRef.current;
    }
    const inner = innerScrollRef.current;
    const outer = overlayScrollRef.current;
    if (inner && inner.scrollHeight > inner.clientHeight + 4) {
      return inner;
    }
    if (outer) {
      return outer;
    }
    return document.querySelector<HTMLElement>("[data-section-overlay]");
  }, []);

  const readRobotRects = useCallback(
    (
      refs: React.MutableRefObject<Array<HTMLElement | null>>,
      fallback: (idx: number) => RectBox,
    ): RectBox[] =>
      [0, 1, 2, 3].map((i) => {
        const r = refs.current[i]?.getBoundingClientRect();
        return r && r.width > 0
          ? { left: r.left, top: r.top, width: r.width, height: r.height }
          : fallback(i);
      }),
    [],
  );

  const startAboutExpTransition = useCallback(
    (direction: "forward" | "reverse") => {
      if (isAboutExpTransitioningRef.current) return;

      if (direction === "forward") {
        const aboutRects = readRobotRects(aboutRobotRefs, getFallbackExpRect);
        const expRects = readRobotRects(expRobotRefs, getFallbackExpRect);
        const scroller = getActiveScroller();
        capturedAboutScrollTopRef.current = scroller?.scrollTop ?? 0;
        aboutRectsCacheRef.current = aboutRects;
        // Phones: only fly the robots when their About cards are on screen
        // (e.g. after scrolling to the matrix); from the top of About (tab
        // bar) they would rise from behind the tab bar.
        const phone = window.matchMedia("(max-width: 767px)").matches;
        const vhNow = window.innerHeight;
        // Phones always fly: robots whose About card is off screen fade and
        // rise in from the bottom of the content area (see the effect).
        void phone;
        void vhNow;
        const fly = true;

        hasVisitedAboutRef.current = true;
        isAboutExpTransitioningRef.current = true;
        appliedExperienceIndexRef.current = -1;
        applyActiveExperienceIndex(0);
        setTerminalMode("shell");
        setIsExpanded(true);
        // The view itself switches mid-animation (inside the RAF loop) so the
        // outgoing section can fade out in place first.
        setAboutExpTransition({
          direction: "forward",
          fromRects: aboutRects,
          toRects: expRects,
          fly,
        });
      } else {
        const expRects = readRobotRects(expRobotRefs, getFallbackExpRect);
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cached = aboutRectsCacheRef.current;
        const aboutGuess: RectBox[] =
          cached.length === 4
            ? cached
            : [0, 1, 2, 3].map((i) => ({
                left: vw / 2 - 160 + i * 80,
                top: vh * 0.68,
                width: 71,
                height: 71,
              }));

        hasVisitedAboutRef.current = true;
        isAboutExpTransitioningRef.current = true;
        setAboutTypedLength(aboutData.bio.length + 4);
        setTerminalMode("shell");
        setIsExpanded(true);
        setAboutExpTransition({
          direction: "reverse",
          fromRects: expRects,
          toRects: aboutGuess,
          fly: !window.matchMedia("(max-width: 767px)").matches,
        });
      }
    },
    [aboutData.bio.length, getActiveScroller, getFallbackExpRect, readRobotRects],
  );

  // Pre-mount the sibling section (About <-> Experience) while idle, so the
  // transition only flips visibility instead of mounting mid-animation.
  useEffect(() => {
    const inPair =
      isExpanded && (activeView === "about" || activeView === "experience");
    if (!inPair) {
      setKeepAboutExpMounted(false);
      return;
    }
    if (keepAboutExpMounted || aboutExpTransition) return;
    let idle = 0;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const timer = window.setTimeout(() => {
      if (w.requestIdleCallback) {
        idle = w.requestIdleCallback(() => setKeepAboutExpMounted(true), {
          timeout: 700,
        });
      } else {
        setKeepAboutExpMounted(true);
      }
    }, 500);
    return () => {
      window.clearTimeout(timer);
      if (idle) w.cancelIdleCallback?.(idle);
    };
  }, [isExpanded, activeView, keepAboutExpMounted, aboutExpTransition]);

  // Drive the timed About <-> Experience transition:
  // 1) outgoing section fades/slides out while the 4 robots lift off,
  // 2) view switches at ~42%, 3) incoming section fades in as robots land.
  useEffect(() => {
    if (!aboutExpTransition) return;

    const { direction, fromRects, toRects } = aboutExpTransition;
    const fly = aboutExpTransition.fly !== false;
    // Phones: no section slide (opacity only, so the robot row is measured
    // in place) and overlapping fades (no black frame in the middle).
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const duration =
      reduceMotion || !fly ? ABOUT_EXP_REDUCED_MS : ABOUT_EXP_DURATION_MS;
    const SWITCH_AT = 0.42;
    const vh = window.innerHeight;
    const lift = reduceMotion
      ? 0
      : phone
        ? 0
        : Math.max(70, Math.min(170, vh * 0.16));
    const target: RectBox[] = toRects.map((r) => ({ ...r }));
    let from: Array<RectBox | undefined> = fromRects.slice();
    // Phones, About -> Experience: keep every robot fully on screen. The
    // flight is bounded to the content band (below the header, above the tab
    // bar); robots whose About card is off screen fade + rise in from the
    // bottom of that band; the first destination guess is the slot row
    // (the riders' own rects are not laid out while Experience is hidden).
    const phoneFwd = phone && direction === "forward" && fly;
    const vwNow = window.innerWidth;
    // The header scrolls with About; it is back at the top once Experience
    // shows, so keep the robots below its height either way.
    const headerEl = document.querySelector<HTMLElement>("[data-terminal-header]");
    const bandTop =
      Math.max(headerEl?.getBoundingClientRect().bottom ?? 0, headerEl?.offsetHeight ?? 52) + 6;
    const bandBottom =
      (document.querySelector("[data-mobile-tabbar]")?.getBoundingClientRect().top ?? vh) - 6;
    const entering = [false, false, false, false];
    if (phoneFwd) {
      // Per robot sprite (not the whole card), with tolerance: a sprite counts
      // as on screen when most of it is inside the visible content area (the
      // header has usually scrolled away at the end of About). On-screen
      // robots fly from their cards; off-screen ones fade in just inside the
      // edge nearest their card (same column, same direction of travel).
      // Only when none is on screen do all four rise together from the bottom.
      const visTop = Math.max(0, headerEl?.getBoundingClientRect().bottom ?? 0);
      const visBottom = bandBottom + 6;
      const isVis = (r?: RectBox) => {
        if (!r || r.width <= 0 || r.height <= 0) return false;
        const overlap = Math.min(r.top + r.height, visBottom) - Math.max(r.top, visTop);
        return overlap / r.height >= 0.6;
      };
      const vis = [0, 1, 2, 3].map((i) => isVis(fromRects[i]));
      const anyVisible = vis.some(Boolean);
      from = [0, 1, 2, 3].map((i) => {
        const a = fromRects[i];
        if (anyVisible && a && vis[i]) return a;
        entering[i] = true;
        if (anyVisible && a && a.width > 0) {
          const top =
            a.top + a.height / 2 < (visTop + visBottom) / 2
              ? visTop + 4
              : visBottom - a.height - 10;
          return { left: a.left, top, width: a.width, height: a.height };
        }
        const size = 40;
        return {
          left: Math.max(8, Math.min(vwNow - size - 8, (vwNow - 4 * size - 3 * 24) / 2 + i * (size + 24))),
          top: bandBottom - size - 8,
          width: size,
          height: size,
        };
      });
      for (let i = 0; i < 4; i++) {
        target[i] = { left: 24 + i * 44, top: bandTop + 84, width: 28, height: 28 };
      }
    }
    const destRefs = direction === "forward" ? expRobotRefs : aboutRobotRefs;
    const dirSign = direction === "forward" ? 1 : -1;

    let cancelled = false;
    let switched = false;
    let scrollRestored = direction === "forward";
    // Destination rects are read twice (once the incoming view is shown, and
    // at 90%), not every frame; the robots converge toward the cached rects.
    let measuredDest = false;
    let measuredLate = false;
    // Phones, About -> Experience: land on the top-row slots (the riders'
    // own transforms may not be laid out yet when this is read).
    const readDest = () =>
      [0, 1, 2, 3].map((i) => {
        const slot =
          phone && direction === "forward"
            ? document.querySelectorAll("[data-exp-crew-slot] > span")[i]
            : null;
        const r = (slot ?? destRefs.current[i])?.getBoundingClientRect();
        return r && r.width > 0
          ? { left: r.left, top: r.top, width: r.width, height: r.height }
          : null;
      });
    let destRects: Array<RectBox | null> = [];
    const startTime = performance.now();

    const getOutgoing = () =>
      direction === "forward" ? aboutSectionRef.current : expSectionRef.current;
    const getIncoming = () =>
      direction === "forward" ? expSectionRef.current : aboutSectionRef.current;

    const styleSection = (
      el: HTMLElement | null,
      opacity: number,
      y: number,
    ) => {
      if (!el) return;
      el.style.willChange = "opacity, transform";
      el.style.opacity = opacity.toFixed(3);
      el.style.transform =
        reduceMotion || phone || Math.abs(y) < 0.05
          ? ""
          : `translate3d(0, ${y.toFixed(2)}px, 0)`;
    };

    const clearSection = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.willChange = "";
      el.style.opacity = "";
      el.style.transform = "";
    };

    const restoreAboutScroll = () => {
      const scroller = getActiveScroller();
      if (!scroller) return;
      scroller.scrollTop = capturedAboutScrollTopRef.current;
      const cardsGrid = aboutCardsGridRef.current;
      if (cardsGrid) {
        const cr = cardsGrid.getBoundingClientRect();
        if (cr.bottom > vh - 24 || cr.top < 56) {
          scroller.scrollTop = Math.max(
            0,
            scroller.scrollTop + (cr.bottom - (vh - 72)),
          );
        }
      }
    };

    const step = (now: number) => {
      if (cancelled) return;
      const raw = clamp01((now - startTime) / duration);

      if (!switched && raw >= SWITCH_AT) {
        switched = true;
        if (direction === "forward") {
          setActiveView("experience");
          window.requestAnimationFrame(() => {
            if (overlayScrollRef.current) overlayScrollRef.current.scrollTop = 0;
            if (innerScrollRef.current) innerScrollRef.current.scrollTop = 0;
          });
        } else {
          setActiveView("about");
        }
      }

      // Sections: outgoing fades out before the switch, incoming fades in after.
      if (!switched) {
        const s = smoothstep(0, SWITCH_AT, raw);
        styleSection(getOutgoing(), 1 - s, -14 * s * dirSign);
      } else {
        const incoming = getIncoming();
        // The sibling may already be mounted (hidden); wait for the commit
        // that actually shows it.
        const shown =
          !!incoming && !incoming.hasAttribute("data-section-hidden");
        if (shown && !scrollRestored) {
          scrollRestored = true;
          restoreAboutScroll();
        }
        const a = phone
          ? smoothstep(SWITCH_AT, fly ? 0.8 : 1, raw)
          : smoothstep(SWITCH_AT + 0.04, 0.96, raw);
        styleSection(incoming, a, 16 * (1 - a) * dirSign);

        if (shown && (!measuredDest || (raw >= 0.9 && !measuredLate))) {
          if (measuredDest) measuredLate = true;
          measuredDest = true;
          destRects = readDest();
        }

        // Converge toward the measured destination rects.
        for (let i = 0; i < 4; i++) {
          const r = destRects[i];
          if (r) {
            const k = raw >= 0.9 ? 1 : 0.22;
            target[i].left += (r.left - target[i].left) * k;
            target[i].top += (r.top - target[i].top) * k;
            target[i].width += (r.width - target[i].width) * k;
            target[i].height += (r.height - target[i].height) * k;
          }
        }
      }

      // Robots: smooth quadratic-bezier arc from origin to destination.
      for (let i = 0; i < 4; i++) {
        const robotEl = flyingRobotRefs.current[i];
        if (!robotEl) continue;
        const stagger = reduceMotion ? 0 : i * 0.05;
        const u = clamp01((raw - stagger) / (1 - (reduceMotion ? 0 : 0.15)));
        const e = easeInOutSine(u);
        const a = from[i] ?? target[i];
        const b = target[i] ?? a;

        const ax = a.left + a.width / 2;
        const ay = a.top + a.height / 2;
        const bx = b.left + b.width / 2;
        const by = b.top + b.height / 2;
        const cx = (ax + bx) / 2;
        const cy = Math.min(ay, by) - lift;
        const inv = 1 - e;
        let x = inv * inv * ax + 2 * inv * e * cx + e * e * bx;
        let y = inv * inv * ay + 2 * inv * e * cy + e * e * by;
        const w = a.width + (b.width - a.width) * e;
        const h = a.height + (b.height - a.height) * e;
        // The element keeps its initial box; size changes are a scale.
        const w0 = fromRects[i]?.width ?? 71;
        const h0 = fromRects[i]?.height ?? 71;
        if (phoneFwd) {
          x = Math.max(w / 2 + 2, Math.min(vwNow - w / 2 - 2, x));
          // Robots starting above the header line (it has scrolled away)
          // ease down to it instead of jumping.
          const top0 = Math.min(bandTop, from[i]?.top ?? bandTop);
          y = Math.max(top0 + (bandTop - top0) * e + h / 2, Math.min(bandBottom - h / 2, y));
          robotEl.style.opacity = entering[i] ? smoothstep(0, 0.3, u).toFixed(3) : "1";
        }

        const vx = 2 * inv * (cx - ax) + 2 * e * (bx - cx);
        const activity = Math.sin(Math.PI * u);
        const tilt = reduceMotion
          ? 0
          : Math.max(-9, Math.min(9, vx * 0.012)) * activity;

        robotEl.style.transform = `translate3d(${(x - w0 / 2).toFixed(1)}px, ${(y - h0 / 2).toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg) scale(${(w / w0).toFixed(4)}, ${(h / h0).toFixed(4)})`;
      }

      if (raw < 1) {
        aboutExpRafRef.current = window.requestAnimationFrame(step);
        return;
      }

      clearSection(aboutSectionRef.current);
      clearSection(expSectionRef.current);
      isAboutExpTransitioningRef.current = false;
      lastTransitionEndRef.current = performance.now();
      setAboutExpTransition(null);
    };

    step(startTime);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(aboutExpRafRef.current);
    };
  }, [aboutExpTransition, getActiveScroller, reduceMotion]);

  const startExpProjectsTransition = useCallback(
    (
      direction: "forward" | "reverse",
      sourceMode: "experience" | "direct" = "experience",
    ) => {
      // Phones: every Experience <-> Projects hop (swipe, scroll-end, keys)
      // uses the curtain instead of the desktop choreography.
      if (mobileJumpFnRef.current && window.matchMedia("(max-width: 767px)").matches) {
        mobileJumpFnRef.current(direction === "forward" ? "projects" : "experience");
        return;
      }
      if (
        isAboutExpTransitioningRef.current ||
        isExpProjectsTransitioningRef.current ||
        isProjContactTransitioningRef.current ||
        isContactAiTransitioningRef.current
      )
        return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const contentBox = innerScrollRef.current
        ? rectOf(innerScrollRef.current)
        : { left: 0, top: 0, width: vw, height: vh };

      const snapshot: ExpProjectsSnapshot = {
        contentBox,
        robotBoxes: [],
        expClone: null,
        panelClones: {},
        avatar: null,
      };

      // Roiner's mini avatar (bottom-right in Projects): the finale robot morphs into it.
      const miniEl = document.getElementById("mini");
      if (miniEl) {
        // Forward: measure where the avatar will rest in Projects (it sits in
        // the explorer column there), not where it is in Experience.
        const prevPlace = miniEl.getAttribute("data-place");
        if (direction === "forward") miniEl.setAttribute("data-place", "projects");
        const r = rectOf(miniEl);
        if (direction === "forward") {
          if (prevPlace === null) miniEl.removeAttribute("data-place");
          else miniEl.setAttribute("data-place", prevPlace);
        }
        const hidden = miniEl.classList.contains("off");
        if (r.width > 0) {
          snapshot.avatar = {
            src:
              direction === "forward"
                ? `/avatar/${hasOpenedProject ? "laptop" : "coffee"}.png`
                : (miniEl as HTMLImageElement).src,
            // .off is translated 20px down; land on the resting position
            box: { ...r, top: hidden ? r.top - 20 : r.top },
          };
        }
      }

      if (direction === "forward") {
        const expEl = sourceMode === "experience" ? expSectionRef.current : null;
        if (expEl) {
          snapshot.expClone = {
            node: expEl.cloneNode(true) as HTMLElement,
            box: rectOf(expEl),
          };
        }
        snapshot.robotBoxes =
          sourceMode === "experience"
            ? readRobotRects(expRobotRefs, getFallbackExpRect)
            : [
                { left: vw * 0.5 - 36, top: -110, width: 72, height: 72 },
                { left: -110, top: vh * 0.45 - 36, width: 72, height: 72 },
                { left: vw * 0.35, top: vh + 110, width: 72, height: 72 },
                { left: vw + 110, top: vh * 0.55, width: 72, height: 72 },
              ];
      } else {
        const live: Array<[XpPanelKey, HTMLElement | null]> = [
          ["sidebar", projectsSidebarRef.current],
          ["text", projectsTextPanelRef.current],
          ["media", projectsMediaPanelRef.current],
          ["breadcrumb", projectsBreadcrumbRef.current],
        ];
        live.forEach(([k, el]) => {
          if (el) {
            snapshot.panelClones[k] = {
              node: el.cloneNode(true) as HTMLElement,
              box: rectOf(el),
            };
          }
        });
      }

      expProjectsSnapshotRef.current = snapshot;
      isExpProjectsTransitioningRef.current = true;
      setTerminalMode("shell");
      setIsExpanded(true);
      // The destination view mounts immediately, underneath the snapshot.
      setActiveView(direction === "forward" ? "projects" : "experience");
      setExpProjectsTransition({ direction, sourceMode });
    },
    [getFallbackExpRect, readRobotRects, hasOpenedProject],
  );

  useLayoutEffect(() => {
    if (!expProjectsTransition) return;
    const snap = expProjectsSnapshotRef.current;
    if (!snap) return;
    const { direction } = expProjectsTransition;
    const forward = direction === "forward";

    if (forward) {
      if (overlayScrollRef.current) overlayScrollRef.current.scrollTop = 0;
      if (innerScrollRef.current) innerScrollRef.current.scrollTop = 0;
      if (projectsScrollSectionRef.current)
        projectsScrollSectionRef.current.scrollTop = 0;
    } else {
      // Return to where the user left Experience: the end of the timeline.
      const scroller = getActiveScroller();
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    }

    const cancel = runExpProjectsTransition({
      direction,
      // Mobile: the short crossfade (no full-screen pixel unfold over a
      // single-column layout; also avoids the heavy first-frame setup).
      reduceMotion: reduceMotion || isMobile,
      sprites: agentCards.map((a) => a.sprite),
      panels: {
        sidebar: projectsSidebarRef.current,
        text: projectsTextPanelRef.current,
        media: projectsMediaPanelRef.current,
        breadcrumb: projectsBreadcrumbRef.current,
        status: projectsStatusBarRef.current,
      },
      contentBox: innerScrollRef.current
        ? rectOf(innerScrollRef.current)
        : snap.contentBox,
      robotBoxes: forward
        ? () => snap.robotBoxes
        : () => readRobotRects(expRobotRefs, getFallbackExpRect),
      snapshot: {
        contentBox: snap.contentBox,
        expClone: snap.expClone,
        panelClones: snap.panelClones,
      },
      liveExpSection: forward ? null : expSectionRef.current,
      titleEl: forward ? projectTitleRef.current : null,
      titleLength: activeProject.displayName.length,
      avatar: snap.avatar,
      onDone: () => {
        if (forward) {
          // Hand over from the canvas-drawn avatar to the real one without
          // its CSS fade/pop, so the morph result simply stays.
          skipMiniPopRef.current = true;
          const mini = document.getElementById("mini");
          if (mini) {
            mini.style.transition = "none";
            window.setTimeout(() => {
              mini.style.transition = "";
            }, 120);
          }
        }
        isExpProjectsTransitioningRef.current = false;
        lastTransitionEndRef.current = performance.now();
        expProjectsSnapshotRef.current = null;
        setExpProjectsTransition(null);
      },
    });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expProjectsTransition]);

  // ---- Projects <-> Contact ("zoom & portal") ----
  const startProjContactTransition = useCallback(
    (direction: "forward" | "reverse") => {
      // Phones: Contact -> Projects uses the curtain; Projects -> Contact
      // keeps the avatar / CRT / peace-morph effect (mobile variant).
      if (
        direction === "reverse" &&
        mobileJumpFnRef.current &&
        window.matchMedia("(max-width: 767px)").matches
      ) {
        mobileJumpFnRef.current("projects");
        return;
      }
      if (
        isAboutExpTransitioningRef.current ||
        isExpProjectsTransitioningRef.current ||
        isProjContactTransitioningRef.current ||
        isContactAiTransitioningRef.current
      )
        return;
      const snap: NonNullable<typeof projContactSnapRef.current> = {};
      if (direction === "forward") {
        const root = projectsRootRef.current;
        if (!root) {
          setActiveView("contact");
          return;
        }
        snap.projectsBox = rectOf(root);
        // Phones: Projects scrolls inside its own section; mark it so the
        // clone can be put back at the same scroll offset.
        const liveScroller = projectsScrollSectionRef.current;
        liveScroller?.setAttribute("data-pc-scroller", "");
        snap.projectsScrollTop = liveScroller?.scrollTop ?? 0;
        snap.projectsClone = root.cloneNode(true) as HTMLElement;
        liveScroller?.removeAttribute("data-pc-scroller");
        // A cloned <video> has no frame (it showed as a blank white box):
        // swap each one for a still of the live video's current frame.
        const liveVideos = root.querySelectorAll("video");
        snap.projectsClone.querySelectorAll("video").forEach((cv, i) => {
          const lv = liveVideos[i];
          if (!lv) return;
          const r = lv.getBoundingClientRect();
          const c = document.createElement("canvas");
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          c.width = Math.max(1, Math.round(r.width * dpr));
          c.height = Math.max(1, Math.round(r.height * dpr));
          c.className = cv.className;
          c.setAttribute("style", cv.getAttribute("style") ?? "");
          c.style.width = `${r.width}px`;
          c.style.height = `${r.height}px`;
          try {
            const g = c.getContext("2d");
            if (g && lv.videoWidth > 0) {
              // object-contain: letterbox the frame like the live element.
              const k = Math.min(c.width / lv.videoWidth, c.height / lv.videoHeight);
              const w = lv.videoWidth * k;
              const h = lv.videoHeight * k;
              g.drawImage(lv, (c.width - w) / 2, (c.height - h) / 2, w, h);
            }
          } catch {
            /* tainted or not ready: leave the canvas empty (dark) */
          }
          cv.replaceWith(c);
        });
        const mini = document.getElementById("mini") as HTMLImageElement | null;
        // Phones: the avatar lives at the end of the project (folders block).
        const endAvatar = window.matchMedia("(max-width: 767px)").matches
          ? root.querySelector<HTMLImageElement>("[data-projects-end-avatar]")
          : null;
        if (endAvatar) {
          const r = rectOf(endAvatar);
          const onScreen = r.width > 0 && r.top < window.innerHeight && r.top + r.height > 0;
          snap.avatar = onScreen ? { src: endAvatar.src, box: r } : null;
          const cloneAvatar = snap.projectsClone.querySelector<HTMLElement>(
            "[data-projects-end-avatar]",
          );
          if (cloneAvatar && onScreen) cloneAvatar.style.visibility = "hidden";
          snap.spriteSrc = endAvatar.src;
          if (mini) mini.style.visibility = "hidden";
        } else if (mini) {
          const r = rectOf(mini);
          const hidden = mini.classList.contains("off");
          snap.avatar =
            r.width > 0
              ? { src: mini.src, box: { ...r, top: hidden ? r.top - 20 : r.top } }
              : null;
          mini.style.visibility = "hidden";
        }
        setProjectsHint(false);
      } else {
        const inner = innerScrollRef.current;
        if (!inner) {
          setActiveView("projects");
          return;
        }
        snap.contactBox = rectOf(inner);
        snap.contactClone = inner.cloneNode(true) as HTMLElement;
        snap.contactScrollTop = inner.scrollTop;
      }
      projContactSnapRef.current = snap;
      isProjContactTransitioningRef.current = true;
      setTerminalMode("shell");
      setIsExpanded(true);
      // The destination view mounts immediately, underneath the snapshot.
      setActiveView(direction === "forward" ? "contact" : "projects");
      setProjContactTransition({ direction });
    },
    [],
  );

  useLayoutEffect(() => {
    if (!projContactTransition) return;
    const snap = projContactSnapRef.current;
    if (!snap) return;
    const forward = projContactTransition.direction === "forward";
    const inner = innerScrollRef.current;
    const mini = document.getElementById("mini") as HTMLImageElement | null;
    if (mini) mini.style.visibility = "hidden";

    let projects: HTMLElement | null;
    let projectsBox: XpBox;
    let contact: HTMLElement | null;
    let contactBox: XpBox;
    let avatar: { src: string; box: XpBox } | null = null;
    if (forward) {
      if (overlayScrollRef.current) overlayScrollRef.current.scrollTop = 0;
      if (inner) inner.scrollTop = 0;
      projects = snap.projectsClone ?? null;
      projectsBox = snap.projectsBox!;
      contact = inner;
      contactBox = inner ? rectOf(inner) : projectsBox;
      // Phones: the avatar starts from the visible one at the end of the
      // project; if it isn't on screen (tab-bar jump) there is no fly-in and
      // Roiner appears on the Contact square (glitch + peace) only.
      avatar = snap.avatar ?? null;
    } else {
      if (projectsScrollSectionRef.current)
        projectsScrollSectionRef.current.scrollTop = 0;
      projects = projectsRootRef.current;
      projectsBox = projects ? rectOf(projects) : snap.contactBox!;
      contact = snap.contactClone ?? null;
      contactBox = snap.contactBox!;
      if (mini && !isMobile) {
        const r = rectOf(mini);
        const hidden = mini.classList.contains("off");
        if (r.width > 0)
          avatar = {
            src: `/avatar/${hasOpenedProject ? "laptop" : "coffee"}.png`,
            box: { ...r, top: hidden ? r.top - 20 : r.top },
          };
      }
    }

    const finish = () => {
      if (!forward) {
        // Hand over from the flying sprite to the real avatar without its
        // CSS fade/pop, so it simply stays where the sprite landed.
        skipMiniPopRef.current = true;
      }
      if (mini) {
        mini.style.transition = "none";
        mini.style.visibility = "";
        window.setTimeout(() => {
          mini.style.transition = "";
        }, 120);
      }
      isProjContactTransitioningRef.current = false;
      lastTransitionEndRef.current = performance.now();
      projContactSnapRef.current = null;
      setProjContactTransition(null);
    };

    if (!projects || !contact) {
      finish();
      return;
    }

    const cancel = runProjectsContactTransition({
      direction: projContactTransition.direction,
      // Phones, Contact -> Projects: the short crossfade (Projects opens at the
      // top, where there is no avatar for the peace sprite to land on).
      reduceMotion: reduceMotion || (isMobile && !forward),
      projects,
      projectsBox,
      contact,
      contactBox,
      contactScrollTop: snap.contactScrollTop,
      avatar,
      mobile: isMobile,
      spriteSrc: snap.spriteSrc,
      onDone: finish,
    });
    // Phones: put the Projects clone back at the scroll offset it had.
    if (forward && snap.projectsScrollTop && projects) {
      const sc = projects.querySelector<HTMLElement>("[data-pc-scroller]");
      if (sc) sc.scrollTop = snap.projectsScrollTop;
    }
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projContactTransition]);

  // Phones: section jumps use one simple "curtain" (the content area dims to
  // black, the view switches underneath, then it fades back in). It replaces
  // the desktop choreographies that don't fit a narrow screen (zooms,
  // panels, crossfades of two different layouts on top of each other).
  // Opacity only, on a throwaway element: no React state per frame.
  const jumpTo = (cmd: string) => {
    setInputValue("");
    if (cmd === "ai") {
      enterAiMode();
    } else {
      if (cmd === "projects") setHasOpenedProject(false);
      setTerminalMode("shell");
      setIsExpanded(true);
      setActiveView(cmd as any);
    }
  };
  // Phones: a hop under the curtain swaps the view instantly, so the section
  // would just "be there" (its entrance only played on the first open). Play
  // a short fade-up of the visible blocks as the curtain lifts, every time.
  const playArrival = (bandTop: number, bandBottom: number) => {
    const root = innerScrollRef.current;
    if (!root) return;
    const visible = (el: Element) => {
      if (el.closest("[data-section-hidden]")) return false;
      const r = el.getBoundingClientRect();
      return r.height > 0 && r.width > 0 && r.bottom > bandTop && r.top < bandBottom;
    };
    let node: Element = root;
    for (let d = 0; d < 8; d++) {
      const kids = Array.from(node.children).filter(visible);
      if (kids.length !== 1) break;
      node = kids[0];
    }
    let blocks = Array.from(node.children).filter(visible);
    if (blocks.length > 0 && blocks.length < 3) {
      blocks = blocks.flatMap((b) => {
        const kids = Array.from(b.children).filter(visible);
        return kids.length > 1 ? kids : [b];
      });
    }
    blocks.slice(0, 8).forEach((el, i) => {
      if (typeof (el as HTMLElement).animate !== "function") return;
      (el as HTMLElement).animate(
        [
          { opacity: 0, transform: "translate3d(0, 14px, 0)" },
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
        ],
        {
          duration: 380,
          delay: 40 + i * 55,
          easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
          fill: "backwards",
        },
      );
    });
  };
  const mobileJump = (cmd: string) => {
    if (
      mobileJumpRef.current ||
      isAboutExpTransitioningRef.current ||
      isExpProjectsTransitioningRef.current ||
      isProjContactTransitioningRef.current ||
      isContactAiTransitioningRef.current
    )
      return;
    if (cmd === "ai" ? isAiMode : !isAiMode && activeView === cmd) return;
    // Projects -> Contact and Contact -> AI keep their own effects on phones.
    if (cmd === "contact" && !isAiMode && activeView === "projects") {
      startProjContactTransition("forward");
      return;
    }
    if (cmd === "ai" && !isAiMode && activeView === "contact") {
      startContactAiTransition("forward");
      return;
    }
    // About <-> Experience: the same robot hand-off as the swipe, every time.
    if (cmd === "experience" && !isAiMode && activeView === "about") {
      setHasInteracted(true);
      startAboutExpTransition("forward");
      return;
    }
    if (cmd === "about" && !isAiMode && activeView === "experience") {
      setHasInteracted(true);
      startAboutExpTransition("reverse");
      return;
    }
    setHasInteracted(true);
    mobileJumpRef.current = true;
    const header = document.querySelector("[data-terminal-header]");
    const tabbar = document.querySelector("[data-mobile-tabbar]");
    const top = header ? header.getBoundingClientRect().bottom : 0;
    const bottom = tabbar ? tabbar.getBoundingClientRect().top : window.innerHeight;
    const curtain = document.createElement("div");
    curtain.setAttribute("data-mobile-curtain", "");
    Object.assign(curtain.style, {
      position: "fixed",
      left: "0",
      right: "0",
      top: `${top}px`,
      height: `${Math.max(0, bottom - top)}px`,
      background: "#000",
      opacity: "0",
      zIndex: "157",
      pointerEvents: "none",
    });
    document.body.appendChild(curtain);
    document.body.setAttribute("data-mobile-jumping", "");
    // Swap instantly under the curtain (no AnimatePresence exit fade, so the
    // old view never lingers). Set before the swap so the outgoing view
    // re-renders with the instant exit first.
    setInstantViewSwap(true);
    const fast = reduceMotion ? 1 : 0;
    const done = () => {
      curtain.remove();
      document.body.removeAttribute("data-mobile-jumping");
      setInstantViewSwap(false);
      mobileJumpRef.current = false;
      lastTransitionEndRef.current = performance.now();
    };
    curtain
      .animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: fast || 140,
        easing: "ease-in",
        fill: "forwards",
      })
      .finished.then(() => {
        jumpTo(cmd);
        const MARK: Record<string, string> = {
          about: "[data-about-whoami]",
          experience: "[data-exp-crew-slot]",
          projects: "[data-project-header]",
          contact: "[data-contact-photo]",
          ai: "[data-ai-view]",
        };
        const shown = (sel?: string) => {
          if (!sel) return false;
          const el = overlayScrollRef.current?.querySelector(sel);
          return !!el && !el.closest("[data-section-hidden]") && el.getClientRects().length > 0;
        };
        const from = isAiMode ? "ai" : activeView;
        const t0 = performance.now();
        let stable = 0;
        // Wait until the old view is gone and the new one is mounted and laid
        // out (a few frames), then lift.
        const wait = () => {
          const ov = overlayScrollRef.current;
          if (shown(MARK[cmd]) && (from === cmd || !shown(MARK[from]))) stable++;
          if (stable < 3 && performance.now() - t0 < 900) {
            window.requestAnimationFrame(wait);
            return;
          }
          if (ov) ov.scrollTop = 0;
          if (innerScrollRef.current) innerScrollRef.current.scrollTop = 0;
          if (!fast && cmd !== "ai") playArrival(top, bottom);
          curtain
            .animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: fast || 240,
              easing: "ease-out",
              fill: "forwards",
            })
            .finished.then(done, done);
        };
        window.requestAnimationFrame(wait);
      }, done);
  };

  mobileJumpFnRef.current = mobileJump;

  const handleCommand = (cmd: string) => {
    if (
      isAboutExpTransitioningRef.current ||
      isProjContactTransitioningRef.current ||
      isContactAiTransitioningRef.current ||
      mobileJumpRef.current
    )
      return;
    setHasInteracted(true);
    const cleanCmd = cmd.toLowerCase().trim();

    // Phones: Experience <-> Projects and Projects <-> Contact use the curtain.
    if (
      isMobile &&
      isExpanded &&
      !isAiMode &&
      ((cleanCmd === "projects" && activeView !== "projects") ||
        (cleanCmd === "experience" && activeView === "projects"))
    ) {
      mobileJump(cleanCmd);
      return;
    }

    if (!cleanCmd) {
      setInputValue("");
      return;
    }

    if (cleanCmd === "experience" && isExpanded && activeView === "about") {
      setInputValue("");
      startAboutExpTransition("forward");
      return;
    }

    if (cleanCmd === "about" && isExpanded && activeView === "experience") {
      setInputValue("");
      startAboutExpTransition("reverse");
      return;
    }

    if (cleanCmd === "projects" && isExpanded && activeView === "experience") {
      setInputValue("");
      startExpProjectsTransition("forward", "experience");
      return;
    }

    if (cleanCmd === "experience" && isExpanded && activeView === "projects") {
      setInputValue("");
      startExpProjectsTransition("reverse", "experience");
      return;
    }

    if (cleanCmd === "contact" && isExpanded && activeView === "projects") {
      setInputValue("");
      startProjContactTransition("forward");
      return;
    }

    if (cleanCmd === "projects" && isExpanded && activeView === "contact") {
      setInputValue("");
      startProjContactTransition("reverse");
      return;
    }

    if (cleanCmd === "projects" && isExpanded && activeView !== "projects") {
      setInputValue("");
      startExpProjectsTransition("forward", "direct");
      return;
    }

    if (cleanCmd === "ai" && isExpanded && activeView === "contact" && !isAiMode) {
      startContactAiTransition("forward");
      return;
    }

    if (cleanCmd === "contact" && isAiMode && activeView === "terminal") {
      startContactAiTransition("reverse");
      return;
    }

    if (cleanCmd === "cv") {
      // Alias: the CV now lives inside Contact.
      handleCommand("contact");
      setCvFocusTick((n) => n + 1);
      return;
    }

    if (
      ["experience", "about", "projects", "contact"].includes(cleanCmd)
    ) {
      if (cleanCmd === "projects") {
        setHasOpenedProject(false);
      }
      setTerminalMode("shell");
      setIsExpanded(true);
      setActiveView(cleanCmd as any);
    } else if (cleanCmd === "ai") {
      enterAiMode();
    } else if (!commands.includes(cleanCmd)) {
      enterAiMode();
      window.setTimeout(() => {
        void handleAiCommand(cmd);
      }, 0);
    } else {
      setTerminalMode("shell");
      setActiveView("terminal");
    }
    setInputValue("");
  };

  const handleNext = () => {
    if (
      isAboutExpTransitioningRef.current ||
      isExpProjectsTransitioningRef.current ||
      isProjContactTransitioningRef.current ||
      isContactAiTransitioningRef.current
    )
      return;

    if (activeView === "about") {
      startAboutExpTransition("forward");
      return;
    }

    if (activeView === "experience") {
      if (isMobile) {
        mobileJump("projects");
        return;
      }
      startExpProjectsTransition("forward", "experience");
      return;
    }

    if (activeView === "projects") {
      // Phones pick the next project from the folders at the end of each
      // project; swiping on keeps going to Contact.
      if (hasNextProject && !isMobile) {
        setActiveProjectId(projectEntries[activeProjectIndex + 1].id);
        setHasOpenedProject(true);
      } else {
        handleCommand("contact");
      }
      return;
    }

    const currentIndex = viewOrder.indexOf(activeView as any);
    if (currentIndex !== -1 && currentIndex < viewOrder.length - 1) {
      handleCommand(viewOrder[currentIndex + 1]);
    } else if (activeView === "contact") {
      handleCommand("ai");
    } else if (activeView !== "terminal") {
      closeExpanded();
    }
  };

  const closeExpanded = () => {
    if (
      isAboutExpTransitioningRef.current ||
      isExpProjectsTransitioningRef.current ||
      isProjContactTransitioningRef.current ||
      isContactAiTransitioningRef.current
    )
      return;
    if (isAiMode) {
      exitAiMode();
    }
    setIsExpanded(false);
    setActiveView("terminal");
  };

  const handleExternalClose = useCallback(() => {
    if (
      isAboutExpTransitioningRef.current ||
      isExpProjectsTransitioningRef.current ||
      isProjContactTransitioningRef.current ||
      isContactAiTransitioningRef.current
    )
      return;
    if (activeViewRef.current === "projects") {
      startExpProjectsTransition("reverse", "experience");
      return;
    }
    if (activeViewRef.current === "contact") {
      startProjContactTransition("reverse");
      return;
    }
    if (activeViewRef.current === "experience") {
      startAboutExpTransition("reverse");
      return;
    }
    if (performance.now() - lastTransitionEndRef.current < 420) return;
    closeExpanded();
  }, [
    startAboutExpTransition,
    startExpProjectsTransition,
    startProjContactTransition,
  ]);

  // Let external UIs (e.g. the video hero) drive the same command router.
  useImperativeHandle(ref, () => ({
    runCommand: handleCommand,
    close: handleExternalClose,
  }));

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  // Add hint effect for "about" command after 6 seconds of inactivity
  useEffect(() => {
    if (hasInteracted || activeView !== "terminal") return;

    const timer = setTimeout(() => {
      setShowAboutHint(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasInteracted, activeView]);

  // Lock body scroll and listen for Enter / Escape / Scroll triggers when expanded
  useEffect(() => {
    if (!isExpanded) {
      document.body.style.overflow = "auto";
      return;
    }

    document.body.style.overflow = "hidden";
    let bottomWheelAccum = 0;
    let topWheelAccum = 0;
    let lastScrollTime = 0;
    let touchStartY = 0;
    let touchFired = false;

    const isAtBottom = () => {
      const scroller = getActiveScroller();
      if (!scroller) return true;
      return (
        scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 10
      );
    };

    const isAtTop = () => {
      const outer = overlayScrollRef.current;
      const inner = innerScrollRef.current;
      const projectSec = projectsScrollSectionRef.current;
      const outerTop = !outer || outer.scrollTop <= 2;
      const innerTop = !inner || inner.scrollTop <= 2;
      const projectTop =
        activeViewRef.current !== "projects" ||
        !projectSec ||
        projectSec.scrollTop <= 2;
      return outerTop && innerTop && projectTop;
    };

    const onScroll = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target === overlayScrollRef.current ||
          target === innerScrollRef.current ||
          target.hasAttribute?.("data-section-overlay"))
      ) {
        lastScrollTime = performance.now();
        if (!isAtBottom()) {
          bottomWheelAccum = 0;
          setArmed(false);
        }
        if (!isAtTop()) topWheelAccum = 0;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (
        isAboutExpTransitioningRef.current ||
        isExpProjectsTransitioningRef.current ||
        isProjContactTransitioningRef.current ||
        isContactAiTransitioningRef.current
      ) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (activeViewRef.current === "about" && e.deltaY > 4) {
        if (isAtBottom()) {
          const settledAtBottom = performance.now() - lastScrollTime > 160;
          bottomWheelAccum += e.deltaY;
          if (settledAtBottom || bottomWheelAccum >= 85) {
            e.preventDefault();
            bottomWheelAccum = 0;
            startAboutExpTransition("forward");
          }
        } else {
          bottomWheelAccum = 0;
        }
      } else if (activeViewRef.current === "experience" && e.deltaY < -4) {
        if (isAtTop()) {
          const settledAtTop = performance.now() - lastScrollTime > 220;
          topWheelAccum += Math.abs(e.deltaY);
          if (settledAtTop || topWheelAccum >= 90) {
            e.preventDefault();
            topWheelAccum = 0;
            startAboutExpTransition("reverse");
          }
        } else {
          topWheelAccum = 0;
        }
      } else if (activeViewRef.current === "experience" && e.deltaY > 4) {
        if (isAtBottom()) {
          const settledAtBottom = performance.now() - lastScrollTime > 160;
          bottomWheelAccum += e.deltaY;
          if (settledAtBottom || bottomWheelAccum >= 85) {
            e.preventDefault();
            bottomWheelAccum = 0;
            startExpProjectsTransition("forward", "experience");
          }
        } else {
          bottomWheelAccum = 0;
        }
      }
      // Projects: wheel only scrolls project content; leaving Projects is
      // done via the GOTO bar / RETURN_TO_SHELL / the "continue" line.
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const isFormField =
        (activeViewRef.current === "terminal" ||
          activeViewRef.current === "contact") &&
        el &&
        (el.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

      if (
        isAboutExpTransitioningRef.current ||
        isExpProjectsTransitioningRef.current ||
        isProjContactTransitioningRef.current ||
        isContactAiTransitioningRef.current
      ) {
        if (
          [
            "Enter",
            "Escape",
            "ArrowDown",
            "ArrowUp",
            "PageDown",
            "PageUp",
            " ",
          ].includes(e.key)
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }

      if (isFormField) return;

      if (e.key === "Enter" && activeViewRef.current !== "terminal") {
        e.preventDefault();
        handleNext();
        return;
      }

      if (e.key === "Escape" && activeViewRef.current === "experience") {
        e.preventDefault();
        e.stopPropagation();
        startAboutExpTransition("reverse");
        return;
      }

      if (e.key === "Escape" && activeViewRef.current === "projects") {
        e.preventDefault();
        e.stopPropagation();
        startExpProjectsTransition("reverse", "experience");
        return;
      }

      if (e.key === "Escape" && activeViewRef.current === "contact") {
        e.preventDefault();
        e.stopPropagation();
        startProjContactTransition("reverse");
        return;
      }

      if (
        activeViewRef.current === "about" &&
        ["ArrowDown", "PageDown", " "].includes(e.key) &&
        isAtBottom()
      ) {
        e.preventDefault();
        startAboutExpTransition("forward");
        return;
      }

      if (
        activeViewRef.current === "experience" &&
        ["ArrowUp", "PageUp"].includes(e.key) &&
        isAtTop()
      ) {
        e.preventDefault();
        startAboutExpTransition("reverse");
      }

      if (
        activeViewRef.current === "experience" &&
        ["ArrowDown", "PageDown", " "].includes(e.key) &&
        isAtBottom()
      ) {
        e.preventDefault();
        startExpProjectsTransition("forward", "experience");
      }

    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
      touchFired = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (
        isAboutExpTransitioningRef.current ||
        isExpProjectsTransitioningRef.current ||
        isProjContactTransitioningRef.current ||
        isContactAiTransitioningRef.current
      ) {
        // Only cancel when the browser allows it (a touch that already
        // started a native scroll is not cancelable; the overlay's
        // touch-action/overflow lock in mobile.css stops that one).
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (touchFired) return;
      if (performance.now() - lastTransitionEndRef.current < 380) return;

      const dy = (e.touches[0]?.clientY ?? 0) - touchStartY;
      if (activeViewRef.current === "about" && dy < -42 && isAtBottom()) {
        touchFired = true;
        if (!nextArmedRef.current) {
          setArmed(true);
          return;
        }
        setArmed(false);
        startAboutExpTransition("forward");
      } else if (
        activeViewRef.current === "experience" &&
        dy > 48 &&
        isAtTop()
      ) {
        touchFired = true;
        startAboutExpTransition("reverse");
      } else if (
        activeViewRef.current === "experience" &&
        dy < -42 &&
        isAtBottom()
      ) {
        touchFired = true;
        if (!nextArmedRef.current) {
          setArmed(true);
          return;
        }
        setArmed(false);
        startExpProjectsTransition("forward", "experience");
      }
    };

    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", handleGlobalKeyDown, { capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", handleGlobalKeyDown, {
        capture: true,
      });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [
    isExpanded,
    activeView,
    getActiveScroller,
    handleNext,
    startAboutExpTransition,
    startExpProjectsTransition,
    startProjContactTransition,
    setArmed,
  ]);

  // Disarm the touch "next" card whenever the view changes.
  useEffect(() => {
    setArmed(false);
  }, [activeView, setArmed]);

  const handleTerminalClick = () => {
    if (activeView === "terminal") {
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const autocompleteShellCommand = () => {
    const normalizedInput = inputValue.toLowerCase().trimStart();

    if (!normalizedInput || isAiMode) {
      return;
    }

    const matches = allAutocompleteCommands.filter((command) =>
      command.startsWith(normalizedInput),
    );

    if (matches.length === 1) {
      setInputValue(matches[0]);
      return;
    }

    if (matches.length > 1) {
      let sharedPrefix = matches[0];

      for (const match of matches.slice(1)) {
        let prefixLength = 0;

        while (
          prefixLength < sharedPrefix.length &&
          prefixLength < match.length &&
          sharedPrefix[prefixLength] === match[prefixLength]
        ) {
          prefixLength += 1;
        }

        sharedPrefix = sharedPrefix.slice(0, prefixLength);
      }

      if (sharedPrefix.length > normalizedInput.length) {
        setInputValue(sharedPrefix);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isAiMode && e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      exitAiMode();
      return;
    }

    if (!isAiMode && e.key === "Tab") {
      e.preventDefault();
      autocompleteShellCommand();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      if (isAiMode && activeView === "terminal") {
        void handleAiCommand(inputValue);
      } else {
        handleCommand(inputValue);
      }
    }
  };

  useEffect(() => {
    if (!isAiMode || activeView !== "terminal") {
      return;
    }

    if (!isCoarsePointer()) inputRef.current?.focus();
    if (aiPhoneIdleRef.current) return;
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory, isAiMode, activeView]);

  // Track which Experience job is visible while scrolling (badge/chips glow).
  // rAF-throttled, and the result is applied as a data attribute (no React
  // render); a layout effect so the first state is set before paint.
  useLayoutEffect(() => {
    if (activeView !== "experience") {
      return;
    }

    const computeActiveJob = (): number => {
      const scroller = getActiveScroller();
      if (scroller) {
        if (scroller.scrollTop <= 20) {
          return 0;
        }
        if (
          scroller.scrollTop + scroller.clientHeight >=
          scroller.scrollHeight - 24
        ) {
          return Math.max(0, experienceData.length - 1);
        }
      }

      const anchorY = window.innerHeight * 0.42;
      let bestIdx = 0;
      let bestDist = Infinity;

      for (let i = 0; i < experienceData.length; i++) {
        const node = experienceItemRefs.current[i];
        if (!node) continue;
        const r = node.getBoundingClientRect();
        if (r.top <= anchorY && r.bottom >= anchorY) {
          return i;
        }
        const center = (r.top + r.bottom) * 0.5;
        const dist = Math.abs(center - anchorY);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      return bestIdx;
    };

    let raf = 0;
    const updateActiveJob = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        applyActiveExperienceIndex(computeActiveJob());
      });
    };

    // Initial state synchronously (the nodes were just mounted / re-shown).
    appliedExperienceIndexRef.current = -1;
    applyActiveExperienceIndex(
      isAboutExpTransitioningRef.current
        ? activeExperienceIndexRef.current
        : computeActiveJob(),
    );
    document.addEventListener("scroll", updateActiveJob, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", updateActiveJob);

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener("scroll", updateActiveJob, {
        capture: true,
      });
      window.removeEventListener("resize", updateActiveJob);
    };
  }, [
    activeView,
    experienceData.length,
    getActiveScroller,
    applyActiveExperienceIndex,
  ]);

  useEffect(() => {
    if (activeView !== "experience") {
      return;
    }

    const measureTimeline = () => {
      const rail = experienceRailRef.current;
      if (!rail) {
        return;
      }

      // Layout-space measurement: the first measure often lands while the
      // panel's layout animation / the About->Experience transition still has
      // a transform on an ancestor, which shrank the rects (the pulse then
      // only swept the top ~60% of the rail). Correct by the transform scale.
      const railRect = rail.getBoundingClientRect();
      const railHeight = rail.offsetHeight;
      const scale = railRect.height > 0 ? railHeight / railRect.height : 1;
      setExperienceRailHeight(railHeight);

      const targets = experienceNodeRefs.current.map((node) => {
        if (!node) {
          return 0;
        }

        const nodeRect = node.getBoundingClientRect();
        return (nodeRect.top - railRect.top + nodeRect.height / 2) * scale;
      });

      setExperienceNodeTargets(targets);
    };

    measureTimeline();

    const observer = new ResizeObserver(() => {
      measureTimeline();
    });

    if (experienceRailRef.current) {
      observer.observe(experienceRailRef.current);
    }

    experienceNodeRefs.current.forEach((node) => {
      if (node) {
        observer.observe(node);
      }
    });

    window.addEventListener("resize", measureTimeline);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureTimeline);
    };
  }, [activeView, isExpanded]);

  useEffect(() => {
    if (activeView !== "experience" || experienceRailHeight <= 0) {
      return;
    }

    // Rail pulse + node glow as compositor animations (transform / opacity).
    // Same timing as before: linear sweep from -24px to height+24px in 4.8s;
    // each node lights up within 54px of the pulse.
    const pulse = experiencePulseRef.current;
    if (!pulse || typeof pulse.animate !== "function") {
      return;
    }
    const DURATION = 4800;
    const from = -24;
    const to = experienceRailHeight + 24;
    const span = to - from;
    const timing: KeyframeAnimationOptions = {
      duration: DURATION,
      iterations: Infinity,
      easing: "linear",
    };
    const anims: Animation[] = [
      pulse.animate(
        [
          { transform: `translateY(${from}px)` },
          { transform: `translateY(${to}px)` },
        ],
        timing,
      ),
    ];
    experienceGlowRefs.current.forEach((el, i) => {
      if (!el) return;
      const target = experienceNodeTargets[i] ?? 0;
      const activation = (u: number) =>
        Math.max(0, 1 - Math.abs(from + u * span - target) / 54);
      const c = (target - from) / span;
      const w = 54 / span;
      const offsets = Array.from(
        new Set(
          [0, c - w, c, c + w, 1].map((u) => Math.min(1, Math.max(0, u))),
        ),
      ).sort((a, b) => a - b);
      anims.push(
        el.animate(
          offsets.map((offset) => ({ offset, opacity: activation(offset) })),
          timing,
        ),
      );
    });
    const t0 = document.timeline.currentTime;
    if (typeof t0 === "number") {
      anims.forEach((a) => {
        a.startTime = t0;
      });
    }

    return () => {
      anims.forEach((a) => a.cancel());
    };
  }, [activeView, experienceRailHeight, experienceNodeTargets]);

  // Leaving the About/Experience pair (hero, Projects, Contact, AI) resets the
  // About entrance, so it plays again on the next visit, not only once.
  useEffect(() => {
    if (!isExpanded || isAiMode || (activeView !== "about" && activeView !== "experience")) {
      hasVisitedAboutRef.current = false;
    }
  }, [isExpanded, isAiMode, activeView]);

  useEffect(() => {
    if (activeView !== "about") {
      setAboutTypedLength(0);
      return;
    }

    const fullText = `"${aboutData.bio}"`;
    if (
      hasVisitedAboutRef.current ||
      isAboutExpTransitioningRef.current ||
      reduceMotion ||
      // Phones: the bio is shown complete right away, so it never reads as
      // cut off mid-sentence (and the panel isn't re-rendered per tick).
      isMobile
    ) {
      // Reduced motion: the bio appears complete (no typewriter).
      setAboutTypedLength(fullText.length);
      if (reduceMotion) hasVisitedAboutRef.current = true;
      return;
    }

    const step = 3;
    const delay = 18;
    let frame = 0;
    let timer = 0;
    const tick = () => {
      frame += step;
      setAboutTypedLength(Math.min(frame, fullText.length));
      if (frame < fullText.length) {
        timer = window.setTimeout(tick, delay);
      } else {
        hasVisitedAboutRef.current = true;
      }
    };

    timer = window.setTimeout(tick, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeView, aboutData.bio, reduceMotion, isMobile]);

  useEffect(() => {
    setActiveProjectImageIndex(0);
  }, [activeProjectId]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const syncCompactViewport = () => {
      setIsCompactViewport(mediaQuery.matches);
    };

    syncCompactViewport();
    mediaQuery.addEventListener("change", syncCompactViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncCompactViewport);
    };
  }, []);

  // Thin GOTO bar shared by the expanded sections and the AI terminal.
  const renderStatusBar = (inAi: boolean) => (
              <div
                ref={inAi ? undefined : projectsStatusBarRef}
                data-goto-bar={inAi ? "ai" : "expanded"}
                className="border-t border-zinc-800/50 bg-black/60 px-4 py-3 font-mono text-[10px] max-md:hidden sm:px-6"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="flex gap-4 text-zinc-500 text-[9px] sm:text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-500/50">L</span>{" "}
                        {inAi ? chatHistory.length : activeView === "about" ? "1" : "124"}
                      </div>
                      <div className="flex items-center gap-1.5 uppercase tracking-widest">
                        UTF-8
                      </div>
                    </div>

                    {/* Quick Navigation Commands */}
                    <div className="flex min-w-0 flex-wrap items-center gap-2 border-t border-zinc-800 pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0 lg:pl-6">
                      <span className="text-zinc-600 shrink-0">
                        {t("GOTO")}
                      </span>
                      {commands.map((cmd) => (
                        <button
                          key={cmd}
                          onClick={() => {
                            // Re-clicking AI would reset the conversation.
                            if (inAi && cmd === "ai") return;
                            handleCommand(cmd);
                          }}
                          className={`
                              px-2 py-0.5 rounded transition-colors shrink-0
                              ${(inAi ? cmd === "ai" : activeView === cmd) ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}
                            `}
                        >
                          {cmd.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={inAi ? exitAiMode : closeExpanded}
                    className="flex items-center gap-2 self-start px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-all rounded group lg:self-auto"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform">
                      ←
                    </span>
                    RETURN_TO_SHELL
                  </button>
                </div>
              </div>
  );

  // Mobile About: tapping a robot card expands its skill chips (no navigation).
  const [aboutOpenAgent, setAboutOpenAgent] = useState<AgentId | null>(null);

  // Mobile Experience: the 4 robots ride the timeline rail, fully
  // scroll-linked (a pure function of scrollTop, written as transforms in
  // rAF; no React state per frame, no timers):
  //   top:    side by side in a row under "Retrieving logs..." (slot row)
  //   scroll: one by one they slide left onto the rail, then travel down it
  //           in single file, staggered
  //   end:    one by one they leave the rail bottom and settle into the row
  //           above the "next" card (slot row), slightly larger
  // Paths go horizontal only in the header / closing rows, vertical only in
  // the rail gutter, so they never cross job text. Reduced motion: no
  // riders, the closing row is shown static.
  const expRidersRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isMobile || activeView !== "experience" || reduceMotion) return;
    const sc = getActiveScroller();
    const layer = expRidersRef.current;
    if (!sc || !layer) return;
    const SIZE = 28;
    const GAP = 40; // spacing in the single file
    const RAIL_X = 12 - SIZE / 2; // rail centre is 12px into the gutter
    // The header row scrolls away quickly, so the row -> rail move happens
    // within the first ~140px of scroll (straight, staggered glides through
    // the empty band between the header and the first job).
    // Slide along the row band: duration grows with the distance to the
    // gutter so every robot moves at a similar speed; the drop onto the rail
    // starts once it is mostly in the gutter.
    const IN_X_BASE = 24;
    const IN_X_PER_PX = 0.28;
    const IN_Y = 120;
    const IN_STAGGER = 14;
    // Closing: the leader leaves first; while its slot is still below the
    // fold the robot waits at the bottom of the gutter (one GAP higher per
    // robot), so nobody leaves the screen or bunches up.
    const DROP = 300; // scroll px for one robot's glide down the gutter
    const DROP_START = 620; // ...starting this far before the end
    const DROP_STAGGER = 40;
    const SLIDE = 95; // scroll px for one robot's slide into the closing row
    const SLIDE_START = 170;
    const SLIDE_STAGGER = 25;
    type P = { x: number; y: number };
    let top: P[] = [];
    let end: P[] = [];
    let endScale = 1;
    let layerY = 0;
    let railH = 0;
    let sMax = 0;
    const contentPos = (el: Element) => {
      const sr = sc.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - sr.left, y: r.top - sr.top + sc.scrollTop, w: r.width, h: r.height };
    };
    const measure = () => {
      const lp = contentPos(layer);
      layerY = lp.y;
      const rail = experienceRailRef.current;
      railH = rail ? rail.offsetHeight : 0;
      const tops = sc.querySelectorAll("[data-exp-crew-slot] > span");
      const ends = sc.querySelectorAll("[data-exp-crew-back] > span");
      top = [...tops].map((el) => {
        const p = contentPos(el);
        return { x: p.x - lp.x + (p.w - SIZE) / 2, y: p.y - lp.y + (p.h - SIZE) / 2 };
      });
      end = [...ends].map((el) => {
        const p = contentPos(el);
        endScale = p.w / SIZE;
        // translate is applied with transform-origin at the top-left
        return { x: p.x - lp.x, y: p.y - lp.y };
      });
      sMax = Math.max(0, sc.scrollHeight - sc.clientHeight);
      // The pre-mounted section may still be hidden when this first runs.
      return (
        top.length === 4 &&
        end.length === 4 &&
        !layer.closest("[data-section-hidden]") &&
        tops[0].getBoundingClientRect().width > 0
      );
    };
    const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const ease = (t: number) => t * t * (3 - 2 * t); // smoothstep
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let dirty = false;
    let valid = false;
    // Right after the section is shown its layout still settles for a few
    // hundred ms (entrance animations); keep re-measuring every frame until
    // the slots stop moving, so the robots follow instead of snapping later.
    let stableFrames = 0;
    let lastSig = "";
    const settleUntil = performance.now() + 2500;
    const write = () => {
      raf = 0;
      const settling = stableFrames < 12 && performance.now() < settleUntil;
      if (dirty || !valid || settling) {
        dirty = false;
        valid = measure();
        // Not laid out yet: try again next frame (stops once valid).
        if (!valid) {
          raf = window.requestAnimationFrame(write);
          return;
        }
        const sig = `${top[0].y.toFixed(1)},${end[0].y.toFixed(1)},${layerY.toFixed(1)}`;
        stableFrames = sig === lastSig ? stableFrames + 1 : 0;
        lastSig = sig;
        if (stableFrames < 12 && performance.now() < settleUntil) {
          raf = window.requestAnimationFrame(write);
        }
      }
      if (top.length < 4 || end.length < 4) return;
      const S = sc.scrollTop;
      const anchor = S + sc.clientHeight * 0.4 - layerY;
      const lo = 3 * GAP;
      const hi = Math.max(lo, railH - SIZE);
      const lead = Math.min(Math.max(anchor, lo), hi);
      let prevX = 0;
      let prevY = 0;
      for (let i = 0; i < 4; i++) {
        const el = expRobotRefs.current[i];
        if (!el) continue;
        const railY = lead - i * GAP;
        // row -> rail: slide left along the (empty) row band, then drop
        // into the gutter; the leader goes first so nobody crosses.
        const s0 = S - i * IN_STAGGER;
        const inX = IN_X_BASE + Math.abs(top[i].x - RAIL_X) * IN_X_PER_PX;
        let x = lerp(top[i].x, RAIL_X, ease(clamp01(s0 / inX)));
        let y = lerp(top[i].y, railY, ease(clamp01((s0 - 0.6 * inX) / IN_Y)));
        // Keep clear of the robot ahead: until it is a body-length lower,
        // stay (smoothly) to its right.
        if (i > 0) {
          const room = ease(clamp01((GAP - (prevY - y)) / (GAP - SIZE)));
          x = Math.max(x, prevX + (SIZE + 4) * room);
        }
        prevX = x;
        prevY = y;
        let k = 1;
        // rail -> closing row: leader first; drop down the gutter, then
        // slide across (leader to the far right so nobody crosses).
        const slot = end[3 - i];
        const by = ease(clamp01((S - (sMax - DROP_START) - i * DROP_STAGGER) / DROP));
        if (by > 0) {
          // glide down the gutter towards the slot, waiting above the fold
          const limit = S - layerY + sc.clientHeight - SIZE * endScale - 12 - i * GAP;
          y = Math.min(lerp(y, slot.y, by), limit);
          const bx = ease(clamp01((S - (sMax - SLIDE_START) - i * SLIDE_STAGGER) / SLIDE));
          x = lerp(x, slot.x, bx);
          k = lerp(1, endScale, bx);
        }
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${k.toFixed(3)})`;
      }
    };
    let raf = 0;
    const kick = () => {
      if (!raf) raf = window.requestAnimationFrame(write);
    };
    write();
    sc.addEventListener("scroll", kick, { passive: true });
    const ro =
      "ResizeObserver" in window
        ? new ResizeObserver(() => {
            dirty = true;
            kick();
          })
        : null;
    // The section may still be offset by the About -> Experience transition
    // when this runs; measure again once it has settled.
    const settle = window.setTimeout(() => {
      dirty = true;
      kick();
    }, ABOUT_EXP_DURATION_MS + 200);
    if (experienceRailRef.current) ro?.observe(experienceRailRef.current);
    if (sc.firstElementChild) ro?.observe(sc.firstElementChild);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      sc.removeEventListener("scroll", kick);
      ro?.disconnect();
    };
  }, [isMobile, activeView, reduceMotion, getActiveScroller]);
  const expRobotsSettled =
    aboutExpTransition === null && expProjectsTransition === null;

  const keepAboutExpPair =
    keepAboutExpMounted &&
    isExpanded &&
    (activeView === "about" || activeView === "experience");

  // Project media / architecture visual: rendered in the right column on
  // desktop, and in the single-column flow (after the description) on mobile.
  const projectMediaBlock = (
    <>
                                {activeProject.presentation ===
                                "media-first" ? (
                                  <ProjectMediaPanel
                                    project={activeProject}
                                    selectedImageIndex={activeProjectImageIndex}
                                    onSelectImage={setActiveProjectImageIndex}
                                    compact={isMobile}
                                  />
                                ) : (
                                  <div>
                                    {/* Process Architecture Visual */}
                                    <div className="overflow-hidden rounded-[2rem] border border-emerald-500/10 bg-zinc-950/50 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:border-emerald-500/20 max-md:rounded-2xl max-md:p-5 max-md:backdrop-blur-none">
                                      <div className="flex items-center gap-3 mb-10">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                                          <Activity className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400">
                                            {activeProject.fallbackVisual?.title?.replace(
                                              "PROJECT_FEATURE_CORE",
                                              "SYSTEM_ARCHITECTURE",
                                            ) ?? "PROCESS_ARCHITECTURE"}
                                          </span>
                                          <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                                            Topology_v2.4
                                          </span>
                                        </div>
                                      </div>

                                      <div className="relative space-y-6">
                                        {/* Vertical Spine - Solid Color (Static) */}
                                        <div className="absolute left-4 top-2 bottom-2 w-px bg-emerald-500/20" />

                                        {(
                                          activeProject.fallbackVisual?.lines ??
                                          []
                                        ).map((line, idx) => (
                                          <motion.div
                                            key={line}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.15 }}
                                            className="relative pl-12 flex items-center group/line"
                                          >
                                            <div className="absolute left-[12.5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 flex items-center justify-center">
                                              <div className="relative w-2 h-2 rounded-full border border-emerald-500/50 bg-black group-hover/line:bg-emerald-500 group-hover/line:shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300" />
                                            </div>

                                            {/* Card - No Border, Minimal Background */}
                                            <div className="flex-1 rounded-2xl bg-zinc-900/10 px-6 py-5 transition-all duration-300 group-hover/line:bg-emerald-500/[0.03] max-md:px-3 max-md:py-3">
                                              <div className="flex items-center justify-between gap-4">
                                                <span className="font-mono text-[13px] leading-relaxed text-zinc-300 group-hover/line:text-zinc-100 transition-colors max-md:text-[15px]">
                                                  <span className="text-emerald-500/40 mr-3">
                                                    0{idx + 1}_
                                                  </span>
                                                  {line.replace(/^\d+_\s*/, "")}
                                                </span>
                                              </div>
                                            </div>
                                          </motion.div>
                                        ))}
                                      </div>
                                    </div>

                                  </div>
                                )}
    </>
  );

  const panel = (
    <motion.div
      // Phones: no layout animation inside the fullscreen sections. Switching
      // views changes the panel height and motion "corrected" it with a
      // scaleY squash (content looked zoomed for ~120ms after each jump).
      layout={!(isMobile && isExpanded)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 40,
        mass: 1,
        opacity: { duration: 0.4 },
      }}
      onClick={handleTerminalClick}
      className={`
          ${isExpanded ? "" : "backdrop-blur-xl"} border overflow-hidden cursor-text flex flex-col w-full min-w-0
          ${usesFullscreenExpandedLayout ? "h-screen max-md:h-full" : isExpanded ? "min-h-screen max-md:min-h-full" : "h-full"}
          ${variant === "floating" && !isExpanded ? "shadow-2xl shadow-emerald-500/10" : ""}
          ${variant === "centered" && !isExpanded ? "max-w-4xl mx-auto" : ""}
          ${isExpanded ? "border-none rounded-none" : "border-zinc-800 rounded-2xl"}
        `}
      style={{
        background:
          isExpanded && activeView === "experience"
            ? "#000000"
            : isExpanded
              ? "rgba(9, 9, 11, 1)"
              : "rgba(9, 9, 11, 0.98)",
        borderColor: isExpanded ? "transparent" : "rgba(16, 185, 129, 0.3)",
      }}
    >
      {/* Ambient glow */}
      <div
        className={`absolute -inset-[1px] bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 opacity-30 pointer-events-none ${isExpanded ? "" : "blur rounded-2xl"}`}
      />

      {/* Terminal header */}
      <div data-terminal-header="" className="relative flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-black/40 px-3 py-3 max-md:flex-nowrap max-md:gap-2 max-md:py-0 max-md:pr-1 sm:flex-nowrap sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Phones: the dots don't do anything useful there (close/home live
              in the tab bar), so they are hidden and the path gets the room. */}
          <div
            className="flex gap-2 group/controls max-md:hidden"
            data-traffic-lights=""
            aria-hidden={isMobile || undefined}
          >
            <button
              tabIndex={isMobile ? -1 : undefined}
              onClick={(e) => {
                e.stopPropagation();
                closeExpanded();
              }}
              className="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/10 flex items-center justify-center transition-all hover:brightness-110 shadow-[0_0_8px_rgba(255,95,86,0.2)]"
            >
              <X
                className="w-2 h-2 text-black/60 opacity-0 group-hover/controls:opacity-100 transition-opacity"
                strokeWidth={3}
              />
            </button>
            <button
              tabIndex={isMobile ? -1 : undefined}
              onClick={(e) => {
                e.stopPropagation();
                closeExpanded();
              }}
              className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/10 flex items-center justify-center transition-all hover:brightness-110 shadow-[0_0_8px_rgba(255,189,46,0.2)]"
            >
              <Minus
                className="w-2 h-2 text-black/60 opacity-0 group-hover/controls:opacity-100 transition-opacity"
                strokeWidth={3}
              />
            </button>
            <button
              tabIndex={isMobile ? -1 : undefined}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="w-3 h-3 rounded-full bg-[#27c93f] border border-black/10 flex items-center justify-center transition-all hover:brightness-110 shadow-[0_0_8px_rgba(39,201,63,0.2)]"
            >
              <Maximize2
                className="w-2 h-2 text-black/60 opacity-0 group-hover/controls:opacity-100 transition-opacity"
                strokeWidth={3}
              />
            </button>
          </div>
          <div className="flex min-w-0 items-center max-md:flex-1 gap-2 text-zinc-400">
            <Terminal className="h-4 w-4 shrink-0" />
            <span className="truncate text-[13px] font-mono tracking-tight sm:text-xs">
              {activeView === "terminal"
                ? isAiMode
                  ? "roiner@workspace:~/ai"
                  : "roiner@workspace:~"
                : `roiner@workspace:~/${activeView}`}
            </span>
          </div>
        </div>
        <div className="flex w-full items-center justify-end gap-2 max-md:w-auto max-md:gap-0 sm:w-auto sm:gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLanguage();
            }}
            aria-label={language === "es" ? "Switch to English" : "Cambiar a español"}
            className="flex items-center gap-2 px-2 py-1 rounded border border-zinc-800 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group/lang max-md:my-1 max-md:h-11 max-md:min-w-11 max-md:justify-center max-md:px-3"
          >
            <Languages className="w-3.5 h-3.5 text-zinc-500 group-hover/lang:text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover/lang:text-emerald-300 max-md:text-[13px]">
              {language.toUpperCase()}
            </span>
          </button>

          {activeView !== "terminal" && (
            <div className="hidden items-center gap-2 rounded border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-500/50 sm:flex">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              {t("READ_ONLY_MODE")}
            </div>
          )}
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeExpanded();
              }}
              aria-label={language === "es" ? "Cerrar" : "Close"}
              className="text-zinc-500 hover:text-white transition-colors p-1 max-md:flex max-md:h-11 max-md:w-11 max-md:items-center max-md:justify-center"
            >
              <X className="w-4 h-4 max-md:h-5 max-md:w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`relative flex-1 ${
          usesFullscreenExpandedLayout
            ? "min-h-0 overflow-hidden"
            : isExpanded
              ? "overflow-visible"
              : "min-h-0 overflow-hidden"
        }`}
      >
        <AnimatePresence mode="wait">
          {activeView === "terminal" && isAiMode ? (
            <motion.div
              key="ai-terminal"
              data-ai-view=""
              initial={instantViewSwap ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={
                instantViewSwap
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0 }
              }
              className="flex h-full min-h-0 min-w-0 flex-col"
            >
              <AiTerminalView
                lang={language === "es" ? "es" : "en"}
                messages={chatHistory}
                isThinking={isAiThinking}
                inputValue={inputValue}
                setInputValue={setInputValue}
                onSubmit={(value) => void handleAiCommand(value)}
                onExit={exitAiMode}
                inputRef={inputRef}
                scrollRef={chatScrollRef}
                suggestedQuestions={SUGGESTED_QUESTIONS}
                slashCommands={aiSlashCommands}
                placeholder={t("PLACEHOLDER_AI")}
                Typewriter={TypewriterText}
                onTypingTick={scrollToBottom}
                footer={renderStatusBar(true)}
                // After the CRT power-off the view mounts under black; the
                // banner sweep / robots wait until the terminal is revealed.
                entranceDelay={instantViewSwap ? 0.55 : 0.15}
                crewLeaving={aiCrewLeaving}
              />
            </motion.div>
          ) : activeView === "terminal" ? (
            <motion.div
              key="terminal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 sm:p-6 font-mono text-sm flex flex-col gap-5 sm:gap-6 h-full min-w-0"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="text-[9px] sm:text-[10px] font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-[0.18em] sm:tracking-[0.2em]">
                  <div
                    className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${isAiMode ? "bg-emerald-400" : "bg-emerald-500"}`}
                  />
                  {t("QUICK_ACCESS_COMMANDS")}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                  {commands.map((cmd, i) => {
                    const isActiveCommand =
                      (cmd === "ai" && isAiMode) ||
                      (!isAiMode &&
                        activeView !== "terminal" &&
                        activeView === cmd);

                    return (
                      <motion.button
                        key={cmd}
                        initial={{ opacity: 0 }}
                        animate={
                          cmd === "about" && showAboutHint && !hasInteracted
                            ? {
                                opacity: 1,
                                y: [0, -8, 0],
                                transition: {
                                  delay: i * 0.05,
                                  y: {
                                    duration: 0.6,
                                    repeat: Infinity,
                                    repeatDelay: 5,
                                    ease: "easeOut",
                                  },
                                },
                              }
                            : { opacity: 1 }
                        }
                        transition={{ delay: i * 0.05 }}
                        whileHover={{
                          backgroundColor: isActiveCommand
                            ? "rgba(16, 185, 129, 0.12)"
                            : "rgba(16, 185, 129, 0.05)",
                          borderColor: "rgba(16, 185, 129, 0.4)",
                          shadow: "2px 2px 0px rgba(16, 185, 129, 0.3)",
                          y: -2,
                          x: -2,
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommand(cmd);
                        }}
                        className={`
                            px-2 py-2.5 sm:py-3 border transition-all text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-center
                            ${
                              isActiveCommand
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[3px_3px_0px_rgba(16,185,129,0.18)]"
                                : cmd === "about" &&
                                    showAboutHint &&
                                    !hasInteracted
                                  ? "bg-emerald-500/5 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                  : "bg-transparent border-zinc-800 text-zinc-500 hover:text-emerald-400 hover:shadow-[3px_3px_0px_rgba(16,185,129,0.2)]"
                            }
                          `}
                      >
                        {cmd}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {!isAiMode && (
                <>
                  <div className="space-y-4 min-w-0">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5 bg-emerald-500/[0.03] backdrop-blur-md rounded-xl border border-emerald-500/10 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />

                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full border border-emerald-500/30 overflow-hidden bg-zinc-900 relative">
                          <img
                            src="/avatar3.webp"
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
                        </div>
                      </div>

                      <div className="space-y-2 relative z-10 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-500/70 font-mono">
                              {t("DIGITAL_GUIDE")}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-zinc-700" />
                          </div>
                          <div className="text-[8px] sm:text-[9px] font-mono text-zinc-500 uppercase flex flex-wrap gap-x-3 gap-y-1">
                            <span className="whitespace-nowrap">
                              {t("SESSION")}: {sessionId}
                            </span>
                            <span className="whitespace-nowrap">
                              {t("LAST_LOGIN")}:{" "}
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-zinc-200 leading-snug text-[15px] sm:text-base max-w-prose">
                          {t("WELCOME_WORKSPACE")}
                        </p>
                        <div className="flex items-start gap-1.5 text-[9px] sm:text-[10px] text-zinc-500 font-mono max-w-prose">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                          {t("SYSTEM_READY_NAVIGATION")}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Interactive Terminal Input (Bottom) */}
                  <div className="mt-auto pb-6 pt-4 sm:pb-8 sm:pt-6">
                    <div className="flex items-center gap-3 text-white transition-colors px-1 min-w-0">
                      <div className="flex items-center shrink-0 text-sm font-mono font-bold text-white/40">
                        <span>$</span>
                      </div>

                      <div className="relative flex-1 flex items-center">
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          spellCheck={false}
                          autoComplete="off"
                          placeholder={t("PLACEHOLDER_SHELL")}
                          className="w-full bg-transparent border-none outline-none p-0 font-mono text-sm text-white caret-transparent placeholder:text-white/20 disabled:opacity-60 min-w-0"
                          autoFocus
                        />
                        <motion.div
                          animate={{
                            opacity: [1, 0, 1],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "steps(2)",
                          }}
                          style={{ left: `${inputValue.length}ch` }}
                          className="absolute w-2 h-4 bg-white ml-0 pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="expanded-view"
              initial={instantViewSwap ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                instantViewSwap
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0, y: -20 }
              }
              className={`flex h-full min-h-0 flex-col ${
                activeView === "experience" ? "bg-black" : "bg-black/40"
              }`}
            >
              <div
                ref={innerScrollRef}
                className={`flex flex-1 min-h-0 flex-col ${
                  activeView === "projects"
                    ? usesProjectSplitScroll
                      ? "overflow-hidden p-0"
                      : "overflow-y-auto custom-scrollbar p-0"
                    : "overflow-hidden p-6 md:p-10 overflow-y-auto custom-scrollbar"
                }`}
              >
                <div
                  className={`${
                    activeView === "projects"
                      ? usesProjectSplitScroll
                        ? "h-full w-full min-h-0"
                        : "w-full min-h-full"
                      : activeView === "experience"
                        ? "max-w-4xl mx-auto w-full min-h-full md:px-20 lg:px-28"
                        : "max-w-6xl mx-auto min-h-full"
                  } flex flex-1 min-h-0 flex-col`}
                >
                  <div
                    className={
                      activeView === "projects"
                        ? "flex flex-1 min-h-0 flex-col"
                        : "flex-1 min-h-0"
                    }
                  >
                    {(activeView === "about" ||
                      (keepAboutExpPair && activeView === "experience")) && (
                      <div
                        ref={aboutSectionRef}
                        className="space-y-12 pb-12"
                        data-section-hidden={
                          activeView !== "about" ? "" : undefined
                        }
                        aria-hidden={activeView !== "about" || undefined}
                        {...(activeView !== "about"
                          ? ({ inert: "" } as Record<string, string>)
                          : {})}
                        style={
                          activeView !== "about"
                            ? HIDDEN_SECTION_STYLE
                            : {
                                opacity:
                                  aboutExpTransition?.direction === "reverse"
                                    ? 0
                                    : 1,
                              }
                        }
                      >
                        {/* Profile Header Section */}
                        <div className="grid md:grid-cols-12 gap-12 items-start max-md:grid-cols-[104px_minmax(0,1fr)] max-md:gap-x-4 max-md:gap-y-6">
                          <motion.div
                            initial={
                              hasVisitedAboutRef.current
                                ? false
                                : { opacity: 0, scale: 0.9 }
                            }
                            animate={{ opacity: 1, scale: 1 }}
                            className="md:col-span-4 relative group mx-auto md:mx-0 max-w-sm max-md:mx-0 max-md:w-[104px]"
                          >
                            <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 max-md:hidden" />
                            <div className="relative aspect-square md:aspect-[4/5] rounded-2xl border border-emerald-500/20 overflow-hidden bg-zinc-900 shadow-2xl max-md:rounded-xl">
                              <img
                                src="/avatar-complete3.webp"
                                alt="Roiner Hernandez"
                                className="w-full h-full object-cover"
                              />
                              <ScanningEffect />

                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                            </div>

                            {/* Targeting corner elements */}
                            <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-emerald-500/35 pointer-events-none max-md:hidden" />
                            <div className="absolute -top-3 -right-3 w-16 h-16 border-t-2 border-r-2 border-emerald-500/35 pointer-events-none max-md:hidden" />
                            <div className="absolute -bottom-3 -left-3 w-16 h-16 border-b-2 border-l-2 border-emerald-500/35 pointer-events-none max-md:hidden" />
                            <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-emerald-500/35 pointer-events-none max-md:hidden" />
                          </motion.div>

                          {/* Mobile: terminal-style identity next to the small portrait */}
                          {isMobile && (
                            <div data-about-whoami="" className="min-w-0 space-y-1.5 self-center font-mono">
                              <div className="flex items-center gap-2 text-[14px] text-zinc-500">
                                <span className="text-emerald-500">$</span>
                                <span>whoami</span>
                              </div>
                              <p className="text-[18px] font-bold leading-tight text-zinc-100">
                                {aboutData.name}
                              </p>
                              <p className="text-[14px] leading-snug text-emerald-400/90">
                                {t("HERO_TITLE")}
                              </p>
                              <p className="text-[12px] text-zinc-500">
                                <span className="text-emerald-500/60">~/</span>roiner.png
                              </p>
                            </div>
                          )}

                          <div className="md:col-span-8 space-y-8 pt-4 max-md:col-span-2 max-md:space-y-6 max-md:pt-0">
                            <div className="space-y-6">
                              <div
                                data-about-badge=""
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                              >
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest max-md:text-[12px] max-md:tracking-wider">
                                  SYSTEM_IDENTIFIED: HUMAN_ENGINEER
                                </span>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 max-md:text-[14px]">
                                  <span className="text-emerald-500">$</span>
                                  <span>cat profile_summary.md</span>
                                </div>
                                <div className="relative min-h-[15rem] max-md:min-h-0">
                                  <p className="text-xl text-zinc-300 leading-relaxed font-light whitespace-pre-wrap max-md:text-[17px] max-md:font-normal">
                                    {`${aboutData.bio}`.slice(
                                      0,
                                      aboutTypedLength,
                                    )}
                                  </p>
                                  {aboutTypedLength <
                                    `${aboutData.bio}`.length && (
                                    <motion.span
                                      animate={{ opacity: [1, 0, 1] }}
                                      transition={{
                                        duration: 0.9,
                                        repeat: Infinity,
                                        ease: "steps(2)",
                                      }}
                                      className="absolute ml-1 inline-block h-6 w-2 bg-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.45)]"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div
                                data-about-card=""
                                className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1 group hover:border-emerald-500/30 transition-colors"
                              >
                                <span className="text-[10px] text-zinc-500 uppercase font-mono max-md:text-[12px]">
                                  {t("LABEL_LOCATION")}
                                </span>
                                <p className="text-zinc-200 text-xs font-mono max-md:text-[14px]">
                                  {aboutData.location}
                                </p>
                              </div>
                              <div
                                data-about-card=""
                                className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1 group hover:border-emerald-500/30 transition-colors"
                              >
                                <span className="text-[10px] text-zinc-500 uppercase font-mono max-md:text-[12px]">
                                  {t("LABEL_EDUCATION")}
                                </span>
                                <p className="text-zinc-200 text-xs font-mono max-md:text-[14px]">
                                  {aboutData.education}
                                </p>
                              </div>
                              <div
                                data-about-badge=""
                                className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1 col-span-2 sm:col-span-1"
                              >
                                <span className="text-[10px] text-emerald-500/70 uppercase font-mono max-md:text-[12px]">
                                  {t("LABEL_STATUS")}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                                  <p className="text-emerald-300 text-xs font-mono max-md:text-[14px]">
                                    {aboutStatusText}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Knowledge Base Section (Agent Fleet Matrix) */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div
                              data-about-divider=""
                              className="h-px flex-1 bg-zinc-800"
                            />
                            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em] max-md:text-[13px] max-md:tracking-[0.15em]">
                              {t("NEURAL_SKILL_MATRIX")}
                            </h3>
                            <div
                              data-about-divider=""
                              className="h-px flex-1 bg-zinc-800"
                            />
                          </div>

                          {/* 4 Cards Row (2x2 on mobile, 4-col on desktop) */}
                          <div
                            ref={aboutCardsGridRef}
                            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
                          >
                            {agentCards.map((agent, idx) => {
                              const chipsOpen =
                                !isMobile || aboutOpenAgent === agent.id;
                              return (
                              <div
                                key={agent.id}
                                data-about-card=""
                                {...(isMobile
                                  ? {
                                      role: "button",
                                      tabIndex: 0,
                                      "aria-expanded": chipsOpen,
                                      onKeyDown: (e: React.KeyboardEvent) => {
                                        if (e.key === " ") {
                                          e.preventDefault();
                                          setAboutOpenAgent((cur) =>
                                            cur === agent.id ? null : agent.id,
                                          );
                                        }
                                      },
                                    }
                                  : {})}
                                onClick={() =>
                                  isMobile
                                    ? setAboutOpenAgent((cur) =>
                                        cur === agent.id ? null : agent.id,
                                      )
                                    : startAboutExpTransition("forward")
                                }
                                className={`group relative flex flex-col items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 sm:p-4 text-center font-mono cursor-pointer transition-all duration-300 hover:border-emerald-500/40 hover:bg-zinc-900/60 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]${
                                  isMobile && chipsOpen
                                    ? " border-emerald-500/50 bg-emerald-500/[0.06]"
                                    : ""
                                }`}
                              >
                                {/* Floating robot sprite */}
                                <div className="relative flex h-[72px] sm:h-[88px] w-full items-center justify-center">
                                  <div
                                    ref={(el) => {
                                      aboutRobotRefs.current[idx] = el;
                                    }}
                                    className="relative flex h-[62px] w-[62px] sm:h-[71px] sm:w-[71px] items-center justify-center cursor-pointer"
                                  >
                                    {/* hover lift + shadow on a static wrapper; the float is a CSS (compositor) animation on the img */}
                                    <div className="flex h-full w-full items-center justify-center drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:-translate-y-1.5">
                                      <img
                                        src={agent.sprite}
                                        alt={agent.area}
                                        className="robot-float-3-5 h-[62px] w-auto sm:h-[71px] max-w-full object-contain cursor-pointer"
                                        style={{
                                          imageRendering: "pixelated",
                                          animationDelay: `${idx * 0.45}s`,
                                          visibility: aboutExpTransition
                                            ? "hidden"
                                            : "visible",
                                        }}
                                        draggable={false}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Area Title & Directly Visible Skills */}
                                <div className="w-full flex-1 flex flex-col justify-start pt-2.5 border-t border-zinc-800/60 space-y-2">
                                  <h4 className="text-xs sm:text-[13px] font-mono font-bold text-emerald-400 tracking-wide uppercase">
                                    {agent.area}
                                  </h4>

                                  {isMobile && (
                                    <span className="block text-[12px] text-zinc-400">
                                      {agent.skills.length}{" "}
                                      {language === "es" ? "skills" : "skills"}{" "}
                                      <span aria-hidden="true">
                                        {chipsOpen ? "▴" : "▾"}
                                      </span>
                                    </span>
                                  )}

                                  <div
                                    className={`flex flex-wrap justify-center gap-1 pt-0.5${
                                      chipsOpen ? "" : " hidden"
                                    }`}
                                  >
                                    {agent.skills.map((skill) => (
                                      <span
                                        key={skill}
                                        data-about-chip=""
                                        className="px-1.5 py-0.5 bg-black/40 border border-zinc-800/80 text-[10px] text-zinc-300 font-mono rounded group-hover:border-emerald-500/30 group-hover:text-zinc-100 transition-colors max-md:px-2 max-md:py-1 max-md:text-[13px]"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Mobile: touch "command bar" (the hero terminal's job lives here now) */}
                        {isMobile && (
                          <div data-about-commands="" className="space-y-3 font-mono">
                            <div className="flex items-center gap-2 text-[14px] text-zinc-500">
                              <span className="text-emerald-500">$</span>
                              <span>ls ~/</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {(["experience", "projects", "contact", "ai"] as const).map(
                                (cmd) => (
                                  <button
                                    key={cmd}
                                    type="button"
                                    onClick={() => handleCommand(cmd)}
                                    className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-left text-[15px] text-zinc-200"
                                  >
                                    <span className="text-emerald-500">cd</span>
                                    <span className="truncate">{cmd}</span>
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {(activeView === "experience" ||
                      (keepAboutExpPair && activeView === "about")) && (
                      <div
                        ref={expSectionRef}
                        className="space-y-12 pt-2 max-md:space-y-8 md:pt-0"
                        data-section-hidden={
                          activeView !== "experience" ? "" : undefined
                        }
                        aria-hidden={activeView !== "experience" || undefined}
                        {...(activeView !== "experience"
                          ? ({ inert: "" } as Record<string, string>)
                          : {})}
                        style={
                          activeView !== "experience"
                            ? HIDDEN_SECTION_STYLE
                            : {
                                opacity:
                                  aboutExpTransition?.direction === "forward"
                                    ? 0
                                    : 1,
                              }
                        }
                      >
                        {/* Terminal Command Simulation */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono max-md:text-[14px]">
                            <span className="text-emerald-500">$</span>
                            <span className="text-zinc-300">
                              cat experience.json
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-600 max-md:text-[12px] max-md:text-zinc-500">
                            {t("SYSTEM_RETRIEVING_LOGS")}
                          </div>
                          {isMobile && (
                            <div
                              data-exp-crew-slot=""
                              aria-hidden="true"
                              className="flex gap-4 pt-3"
                            >
                              {agentCards.map((agent) => (
                                <span key={agent.id} className="h-7 w-7" />
                              ))}
                            </div>
                          )}
                        </div>



                        <div className="relative pl-10 md:pl-14">
                          {/* Mobile: robots riding the rail (see expRidersRef) */}
                          {isMobile && (
                            <div
                              ref={expRidersRef}
                              data-exp-riders=""
                              aria-hidden="true"
                              className="pointer-events-none absolute left-0 top-0 z-[2] h-0 w-0"
                              style={{
                                // Hidden only while robots are flying in/out; with a
                                // plain crossfade the row fades with the section.
                                visibility:
                                  !reduceMotion &&
                                  expProjectsTransition === null &&
                                  (aboutExpTransition === null ||
                                    aboutExpTransition.fly === false)
                                    ? "visible"
                                    : "hidden",
                              }}
                            >
                              {agentCards.map((agent, idx) => (
                                <span
                                  key={agent.id}
                                  ref={(el) => {
                                    expRobotRefs.current[idx] = el;
                                  }}
                                  className="absolute left-0 top-0 flex h-7 w-7 origin-top-left items-center justify-center will-change-transform"
                                >
                                  <img
                                    src={agent.sprite}
                                    alt=""
                                    className="h-7 w-7 object-contain"
                                    style={{
                                      imageRendering: "pixelated",
                                      filter: "drop-shadow(0 0 4px rgba(0,0,0,0.9))",
                                    }}
                                    draggable={false}
                                  />
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="absolute left-0 top-2 bottom-0 w-6 flex justify-center pointer-events-none">
                            <div
                              ref={experienceRailRef}
                              className="relative h-full w-px overflow-visible"
                            >
                              <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 via-emerald-500/10 to-zinc-800" />
                              <div
                                ref={experiencePulseRef}
                                aria-hidden="true"
                                className="absolute top-0 left-1/2 h-16 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-300/0 via-emerald-400 to-emerald-300/0 shadow-[0_0_18px_rgba(16,185,129,0.9)] will-change-transform"
                                style={{ transform: "translateY(-24px)" }}
                              />
                            </div>
                          </div>

                          <div className="space-y-16 relative max-md:space-y-14">
                            {experienceData.map((exp, i) => {
                              return (
                                <motion.div
                                  key={i}
                                  ref={(node) => {
                                    experienceItemRefs.current[i] = node;
                                  }}
                                  initial={
                                    aboutExpTransition
                                      ? false
                                      : { opacity: 0, x: -10 }
                                  }
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 + i * 0.08 }}
                                  className="group/job relative max-md:scroll-mt-16"
                                >
                                  <div
                                    ref={(node) => {
                                      experienceNodeRefs.current[i] = node;
                                    }}
                                    className="absolute left-0 top-1.5 w-6 -translate-x-[40px] md:-translate-x-[56px] flex justify-center"
                                  >
                                    <ExperienceNodeMarker
                                      glowRef={(el) => {
                                        experienceGlowRefs.current[i] = el;
                                      }}
                                    />
                                  </div>

                                  <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span
                                          className="text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors max-md:text-[12px] text-emerald-500 bg-emerald-500/5 border-emerald-500/20 group-data-[job-active]/job:text-emerald-300 group-data-[job-active]/job:bg-emerald-500/15 group-data-[job-active]/job:border-emerald-400/40 group-data-[job-active]/job:shadow-[0_0_12px_rgba(77,255,176,0.18)]"
                                        >
                                          {exp.period}
                                        </span>
                                        <span className="text-zinc-700 font-mono text-[10px] max-md:text-[12px]">
                                          ::
                                        </span>
                                        <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest max-md:text-[13px] max-md:tracking-wider">
                                          {exp.company}
                                        </span>
                                      </div>
                                      <h3 className="text-xl font-bold text-zinc-100 tracking-tight">
                                        {exp.role}
                                      </h3>
                                    </div>
                                    <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl font-mono opacity-80 max-md:text-[15px] max-md:text-zinc-300 max-md:opacity-100">
                                      {exp.description}
                                    </p>
                                    {exp.highlights && exp.highlights.length > 0 && (
                                      <ul className="max-w-2xl space-y-1.5">
                                        {exp.highlights.map((item) => (
                                          <li
                                            key={item}
                                            className="flex gap-2 font-mono text-[13px] leading-relaxed text-zinc-400 opacity-80 max-md:text-[14px] max-md:text-zinc-300 max-md:opacity-100"
                                          >
                                            <span className="text-emerald-500/60">
                                              &gt;
                                            </span>
                                            <span>{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                    <div className="flex flex-wrap gap-x-3 gap-y-2 pt-2">
                                      {exp.tech.map((techItem, ti) => (
                                        <span
                                          key={ti}
                                          className="text-[10px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded border max-md:text-[12px] transition-[color,background-color,border-color,box-shadow] duration-300 text-zinc-500 border-transparent group-data-[job-active]/job:text-emerald-300 group-data-[job-active]/job:border-emerald-500/35 group-data-[job-active]/job:bg-emerald-500/10 group-data-[job-active]/job:shadow-[0_0_10px_rgba(77,255,176,0.14)]"
                                        >
                                          <span className="text-emerald-500/30 group-data-[job-active]/job:text-emerald-400">
                                            #
                                          </span>
                                          {techItem}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeView === "projects" && (
                      <div
                        ref={projectsRootRef}
                        className={`flex flex-col bg-zinc-950/50 lg:flex-row ${
                          usesProjectSplitScroll
                            ? "h-full flex-1 min-h-0 overflow-hidden"
                            : "min-h-full"
                        }`}
                      >
                        <motion.aside
                          ref={projectsSidebarRef}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          data-project-picker=""
                          className="flex w-full flex-shrink-0 flex-col border-b border-zinc-800 bg-black/40 min-h-0 max-md:hidden lg:w-64 lg:border-b-0 lg:border-r"
                        >
                          <div className="border-b border-zinc-800/50 px-4 py-3 flex items-center justify-between bg-zinc-900/20 max-md:hidden">
                            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                              <Terminal className="w-3 h-3 text-emerald-500/50" />
                              <span>{t("EXPLORER")}</span>
                            </div>
                            <div className="flex gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                            </div>
                          </div>

                          <div
                            ref={projectChipsRef}
                            data-project-picker-strip=""
                            className="flex-1 overflow-y-auto custom-scrollbar p-2 pt-4 space-y-0.5 max-md:flex max-md:h-12 max-md:flex-none max-md:items-center max-md:gap-2 max-md:space-y-0 max-md:overflow-x-auto max-md:overflow-y-hidden max-md:px-3 max-md:py-0.5 max-md:[scrollbar-width:none]"
                          >
                            <div className="px-2 pb-2 flex items-center justify-between max-md:hidden">
                              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                                {t("WORKSPACE")}
                              </span>
                              <ChevronDown className="w-3 h-3 text-zinc-700" />
                            </div>

                            {projectEntries.map((project, pIdx) => {
                              const isActive = project.id === activeProject.id;

                              return (
                                <button
                                  key={project.id}
                                  ref={(el) => {
                                    projectFolderRefs.current[pIdx] = el;
                                  }}
                                  type="button"
                                  onClick={() => {
                                    setActiveProjectId(project.id);
                                    setHasOpenedProject(true);
                                  }}
                                  aria-current={isActive ? "true" : undefined}
                                  className={`group relative flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 rounded-lg max-md:h-11 max-md:w-auto max-md:shrink-0 max-md:gap-2 max-md:rounded-full max-md:border max-md:px-4 max-md:py-0 ${
                                    isActive
                                      ? "bg-emerald-500/[0.07] text-emerald-400 max-md:border-emerald-500/50 max-md:bg-emerald-500/10"
                                      : "text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300 max-md:border-zinc-800 max-md:text-zinc-300"
                                  }`}
                                >
                                  {isActive && (
                                    <motion.div
                                      layoutId="active-indicator"
                                      className="absolute left-0 top-2 bottom-2 w-0.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] max-md:hidden"
                                    />
                                  )}

                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`shrink-0 transition-colors duration-200 ${isActive ? "text-emerald-500" : "text-zinc-700 group-hover:text-zinc-500"}`}
                                    >
                                      {isActive ? (
                                        <FolderOpen className="w-4 h-4" />
                                      ) : (
                                        <Folder className="w-4 h-4" />
                                      )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span
                                        className={`font-mono text-xs truncate max-md:overflow-visible max-md:whitespace-nowrap max-md:text-[14px] ${isActive ? "font-bold text-zinc-100" : ""}`}
                                      >
                                        {project.terminalName}
                                      </span>
                                    </div>
                                  </div>
                                  {project.building && (
                                    <span
                                      className="ml-auto flex shrink-0 items-center max-md:ml-0"
                                      title={
                                        language === "es"
                                          ? "Construyendo ahora"
                                          : "Currently building"
                                      }
                                    >
                                      <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                                      </span>
                                      <span className="sr-only">
                                        {language === "es"
                                          ? "Construyendo ahora"
                                          : "Currently building"}
                                      </span>
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                        </motion.aside>

                        <AnimatePresence mode="wait">
                          <motion.section
                            ref={projectsScrollSectionRef}
                            key={activeProject.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            tabIndex={usesProjectSplitScroll ? 0 : undefined}
                            className={`min-w-0 flex-1 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_40%),linear-gradient(180deg,rgba(9,9,11,0.6),rgba(9,9,11,0.95))] ${
                              usesProjectSplitScroll
                                ? "h-full min-h-0 overflow-y-auto overscroll-y-contain custom-scrollbar focus:outline-none"
                                : ""
                            }`}
                          >
                            <div
                              ref={projectsBreadcrumbRef}
                              data-project-header=""
                              className="border-b border-zinc-800 px-6 py-4 max-md:sticky max-md:top-0 max-md:z-10 max-md:bg-zinc-950/95 max-md:px-4 max-md:py-3"
                            >
                              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] max-md:gap-x-2 max-md:text-[13px] max-md:tracking-[0.12em]">
                                {isMobile && (
                                  <FolderOpen className="h-4 w-4 shrink-0 text-emerald-500" />
                                )}
                                <span className="text-[#00FF41]">
                                  {activeProject.terminalName}
                                </span>
                                {isMobile && (
                                  <span className="text-zinc-400 normal-case tracking-normal">
                                    ({activeProjectIndex + 1}/{projectEntries.length})
                                  </span>
                                )}
                                <span className="text-zinc-700">/</span>
                                <span className="text-zinc-500">
                                  {activeProject.category}
                                </span>
                                {activeProject.status && (
                                  <ProjectStatusBadge
                                    status={activeProject.status}
                                  />
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 items-start gap-8 p-6 max-md:gap-6 max-md:p-4 lg:grid-cols-[minmax(300px,0.58fr)_minmax(0,1.42fr)] lg:p-8">
                              <div
                                ref={projectsTextPanelRef}
                                className="space-y-7 min-w-0"
                              >
                                <div className="space-y-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                      <span className="font-mono text-[10px] font-bold text-emerald-500 border-l-2 border-emerald-500 pl-2 uppercase tracking-widest">
                                        DATA_STREAM_
                                        {String(
                                          activeProjectIndex + 1,
                                        ).padStart(2, "0")}
                                      </span>
                                    </div>

                                    <div className="relative">
                                      <h3 className="font-mono text-2xl font-black italic tracking-tighter text-white md:text-3xl leading-tight">
                                        <span className="text-emerald-500 mr-2 opacity-40 not-italic">
                                          &gt;
                                        </span>
                                        <span ref={projectTitleRef}>
                                          {activeProject.displayName}
                                        </span>
                                        <motion.span
                                          animate={{ opacity: [1, 0] }}
                                          transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "steps(2)",
                                          }}
                                          className="ml-2 inline-block h-[0.7em] w-[0.15em] translate-y-0.5 bg-emerald-500/60 not-italic"
                                        />
                                      </h3>
                                    </div>

                                  </div>

                                  {/* Links - Moved to the top for visibility */}
                                  <p className="text-[15px] leading-7 text-zinc-300 max-md:text-[16px]">
                                    {activeProject.description}
                                  </p>

                                  {/* Mobile: media sits in the flow, right after the description */}
                                  {isMobile && (
                                    <div data-mobile-media="" className="pt-2">
                                      {projectMediaBlock}
                                    </div>
                                  )}

                                  {activeProject.links.length > 0 && (
                                    <div className="py-1">
                                      <div className="flex flex-wrap gap-x-6 gap-y-3">
                                        {activeProject.links.map(
                                          (link, idx) => (
                                            <TerminalLinkButton
                                              key={link.href}
                                              {...link}
                                              index={idx}
                                            />
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}

                                </div>

                                <div className="space-y-[18px]">
                                  {activeProject.highlights.map(
                                    (highlight, index) => (
                                      <motion.div
                                        key={highlight}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          delay: 0.4 + index * 0.1,
                                        }}
                                        className="group flex gap-2.5"
                                      >
                                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/50 transition-colors group-hover:text-emerald-500" />
                                        <div className="flex flex-col">
                                          <p className="font-mono text-[12.5px] leading-[1.65] text-zinc-400 transition-colors group-hover:text-zinc-200 max-md:text-[15px] max-md:text-zinc-300">
                                            {highlight.includes(": ") ? (
                                              <>
                                                <span className="font-bold text-emerald-500/80">
                                                  {highlight.split(": ")[0]}:
                                                </span>{" "}
                                                {highlight
                                                  .split(": ")
                                                  .slice(1)
                                                  .join(": ")}
                                              </>
                                            ) : (
                                              highlight
                                            )}
                                          </p>
                                        </div>
                                      </motion.div>
                                    ),
                                  )}
                                </div>

                                <div className="space-y-3">
                                  <ProjectSectionLabel>
                                    {t("PROJECT_STACK")}
                                  </ProjectSectionLabel>
                                  <ul className="flex flex-wrap gap-2 pt-1">
                                    {activeProject.tech.map((tech, index) => (
                                      <motion.li
                                        key={tech}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                          delay: 0.5 + index * 0.04,
                                        }}
                                        className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-[11px] text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-300 max-md:px-2.5 max-md:py-1.5 max-md:text-[13px]"
                                      >
                                        {tech}
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div
                                ref={projectsMediaPanelRef}
                                className="w-full min-w-0 space-y-6 max-md:hidden lg:sticky lg:top-6 lg:h-[calc(100vh-222px)]"
                              >
                                {!isMobile && projectMediaBlock}
                              </div>
                            </div>
                            {isMobile && (
                              <div
                                data-projects-end=""
                                className="mx-4 mb-2 mt-4 space-y-4 border-t border-zinc-800/60 pt-6"
                              >
                                <div className="flex items-end gap-3">
                                  <img
                                    data-projects-end-avatar=""
                                    src={`/avatar/${hasOpenedProject ? "laptop" : "coffee"}.png`}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-auto w-14 shrink-0"
                                    style={{ imageRendering: "pixelated" }}
                                    draggable={false}
                                  />
                                  <p className="relative mb-3 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-[15px] leading-snug text-zinc-100">
                                    <span
                                      aria-hidden="true"
                                      className="absolute -left-[7px] bottom-3 h-3 w-3 rotate-45 border-b border-l border-zinc-700 bg-zinc-900"
                                    />
                                    {language === "es"
                                      ? "¿Quieres ver más proyectos? Elige una carpeta o sigue a contacto."
                                      : "Want to see more projects? Pick a folder — or keep going to contact."}
                                  </p>
                                </div>
                                <ul className="grid grid-cols-2 gap-2">
                                  {projectEntries
                                    .filter((p) => p.id !== activeProject.id)
                                    .map((project) => (
                                      <li key={project.id}>
                                        <button
                                          type="button"
                                          data-project-folder={project.id}
                                          onClick={() => {
                                            setActiveProjectId(project.id);
                                            setHasOpenedProject(true);
                                            projectsScrollSectionRef.current?.scrollTo({ top: 0 });
                                            getActiveScroller()?.scrollTo({ top: 0 });
                                          }}
                                          className="flex min-h-[56px] w-full items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left font-mono text-[14px] text-zinc-200 active:border-emerald-500/50 active:bg-emerald-500/10"
                                        >
                                          <Folder className="h-5 w-5 shrink-0 text-emerald-500/80" />
                                          <span className="min-w-0 break-words leading-tight">
                                            {project.terminalName}
                                          </span>
                                          {project.building && (
                                            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                                          )}
                                        </button>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCommand("contact")}
                              className="group/continue mx-6 mb-10 mt-2 flex cursor-pointer items-center gap-2 border-t border-zinc-800/60 pt-6 font-mono text-xs text-white/40 transition-colors hover:text-white/80 max-md:mx-4 max-md:min-h-[56px] max-md:pt-4 max-md:text-[15px] max-md:text-white/70 lg:mx-8"
                            >
                              <span className="text-emerald-500/70 group-hover/continue:text-emerald-500">
                                $
                              </span>
                              <span>
                                cd ../contact{" "}
                                <span className="text-emerald-400">→</span>
                              </span>
                              <span className="h-3.5 w-1.5 bg-white/40 group-hover/continue:bg-emerald-500" />
                            </button>
                          </motion.section>
                        </AnimatePresence>
                      </div>
                    )}

                    {activeView === "contact" && (
                      <div ref={contactRootRef} className="w-full space-y-8 pb-4 [@media(max-height:820px)]:space-y-5">
                        <div data-contact-reveal="header" className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono max-md:text-[14px]">
                            <span className="text-emerald-500">$</span>
                            <span className="text-zinc-300">
                              init secure-channel --handshake
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-600 max-md:text-[12px] max-md:text-zinc-500">
                            {t("SYSTEM_SECURE_RELAY")}
                          </div>
                        </div>

                        <div className="grid gap-8 xl:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] xl:items-center xl:gap-12">
                          {/* Photo frame: square slot for Roiner's image */}
                          <div
                            className="mx-auto w-full max-w-[260px] max-md:max-w-[200px] sm:max-w-[320px] xl:max-w-[400px] [@media(max-height:820px)]:xl:max-w-[340px]"
                          >
                            <AnimatedContactAvatar
                              isExternallyHovered={isContactCardHovered}
                              frameRef={contactPhotoRef}
                            />
                            <div data-contact-reveal="caption" className="mt-3 flex items-center justify-between font-mono text-[10px] text-zinc-600 max-md:text-[12px] max-md:text-zinc-500">
                              <span>
                                <span className="text-emerald-500/60">~/</span>
                                roiner.png
                              </span>
                              <span>1:1 · {language === "es" ? "en línea" : "online"}</span>
                            </div>
                          </div>

                          {/* Right Column: Content, Channels and CV */}
                          <div className="flex min-w-0 flex-col justify-center space-y-7 [@media(max-height:820px)]:space-y-4">
                            <div data-contact-reveal="title" className="space-y-4 [@media(max-height:820px)]:space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="h-px w-8 bg-emerald-500/30" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-emerald-500/60 font-bold max-md:text-[12px] max-md:tracking-[0.25em]">
                                  outbound_comms
                                </span>
                              </div>

                              <h2 className="text-4xl font-bold tracking-tighter text-white md:text-5xl leading-none [@media(max-height:820px)]:md:text-[2.6rem]">
                                {t("CONTACT_TITLE")}{" "}
                                <span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8 decoration-2">
                                  {t("CONTACT_TITLE_HIGHLIGHT")}
                                </span>
                              </h2>

                              <p className="max-w-xl text-sm text-zinc-400 font-mono leading-relaxed max-md:text-[15px] max-md:text-zinc-300">
                                {t("CONTACT_SUBTITLE")}
                              </p>
                            </div>

                            {/* Terminal Command List */}
                            <div data-contact-reveal="channels" className="grid gap-3 sm:grid-cols-2">
                              {[
                                {
                                  label: "WHATSAPP",
                                  value: "+58 414 858 9600",
                                  action: "https://wa.me/584148589600",
                                  color: "text-emerald-400",
                                },
                                {
                                  label: "MAIL",
                                  value: aboutData.email,
                                  action: `mailto:${aboutData.email}`,
                                  color: "text-blue-400",
                                },
                                {
                                  label: "LINKEDIN",
                                  value: "in/roiner-hernandez-a6314894",
                                  action:
                                    "https://www.linkedin.com/in/roiner-hernandez-a6314894/",
                                  color: "text-blue-400",
                                },
                                {
                                  label: "GITHUB",
                                  value: "github.com/Roiner994",
                                  action: "https://github.com/Roiner994",
                                  color: "text-purple-400",
                                },
                              ].map((item, i) => (
                                <motion.a
                                  key={item.label}
                                  href={item.action}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={item.value}
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + i * 0.08 }}
                                  onHoverStart={() =>
                                    setIsContactCardHovered(true)
                                  }
                                  onHoverEnd={() =>
                                    setIsContactCardHovered(false)
                                  }
                                  className="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-lg border border-zinc-800/50 bg-zinc-900/10 px-4 py-3 [@media(max-height:820px)]:py-2 max-md:min-h-[60px] max-md:py-2.5 max-md:[@media(max-height:820px)]:py-2.5 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/[0.03]"
                                >
                                  <div className="flex-1 min-w-0">
                                    <span
                                      className={`mb-1 inline-block font-mono text-[9px] font-black tracking-widest max-md:text-[11px] ${item.color} bg-white/5 px-1.5 py-0.5 rounded`}
                                    >
                                      {item.label}
                                    </span>
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-emerald-500/50 font-mono text-xs font-bold">
                                        $
                                      </span>
                                      <span className="font-mono text-[13px] text-zinc-300 group-hover:text-white transition-colors truncate max-md:whitespace-normal max-md:text-[15px] max-md:[overflow-wrap:anywhere]">
                                        {item.value}
                                      </span>
                                    </div>
                                  </div>
                                  <ArrowUpRight className="h-4 w-4 shrink-0 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100 max-md:h-5 max-md:w-5 max-md:opacity-100" />
                                </motion.a>
                              ))}
                            </div>

                            {/* CV (merged from the old CV section) */}
                            <div
                              id="contact-cv"
                              ref={contactCvRef}
                              data-contact-reveal="cv"
                              data-highlight={cvHighlight ? "on" : undefined}
                              className="relative space-y-4 rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-5 [@media(max-height:820px)]:space-y-3 [@media(max-height:820px)]:p-4 transition-[border-color,box-shadow] duration-500 data-[highlight=on]:border-emerald-400/70 data-[highlight=on]:shadow-[0_0_0_1px_rgba(52,211,153,0.35),0_0_36px_-6px_rgba(16,185,129,0.5)]"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 font-mono text-xs">
                                  <span className="text-emerald-500">$</span>
                                  <span className="text-zinc-300">cat ./cv.pdf</span>
                                </div>
                                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60">
                                  {t("CURRICULUM_VITAE")}
                                </span>
                              </div>
                              <p className="font-mono text-[12.5px] leading-relaxed text-zinc-400 max-md:text-[15px] max-md:text-zinc-300">
                                {language === "es"
                                  ? cvData.summaryEs
                                  : cvData.summaryEn}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                {cvData.languages.map((lang) => (
                                  <span
                                    key={lang.label}
                                    className="flex items-center gap-2 rounded-md border border-zinc-800 bg-black/40 px-2.5 py-1 font-mono text-[11px] text-zinc-300 max-md:text-[13px]"
                                  >
                                    {lang.label}
                                    <span className="text-zinc-700">::</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70 max-md:text-[12px]">
                                      {lang.level}
                                    </span>
                                  </span>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-2.5">
                                <a
                                  ref={contactCvButtonRef}
                                  href={
                                    language === "es"
                                      ? "/Roiner-Hernandez-cv-es.pdf"
                                      : "/Roiner-Hernandez-cv-en.pdf"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group/cv flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-emerald-300 max-md:min-h-12 max-md:w-full max-md:justify-center max-md:text-[14px] transition-colors hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                                >
                                  <FileText className="h-4 w-4" />
                                  {language === "es" ? "Ver CV" : "View CV"}
                                  <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover/cv:opacity-100" />
                                </a>
                                {cvData.downloads.map((file) => (
                                  <a
                                    key={file.href}
                                    href={file.href}
                                    download
                                    title={file.detail}
                                    className="group/dl flex items-center gap-2 rounded-lg border border-zinc-800 bg-black/40 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 max-md:min-h-12 max-md:flex-1 max-md:justify-center max-md:whitespace-nowrap max-md:px-3 max-md:text-[13px] max-md:tracking-wider max-md:text-zinc-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                                  >
                                    <Download className="h-4 w-4 text-zinc-600 transition-colors group-hover/dl:text-emerald-500" />
                                    {file.label}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeView !== "terminal" && activeView !== "projects" && (
                      <div
                        data-contact-reveal={
                          activeView === "contact" ? "prompt" : undefined
                        }
                        className={
                          activeView === "contact"
                            ? // Pinned to the bottom of the scroller (and only as
                              // wide as the hint, so it sits in the free column
                              // under the photo) so it is never cut off above
                              // the GOTO bar.
                              "sticky bottom-0 z-20 -mb-6 w-fit max-w-full self-start bg-gradient-to-t from-zinc-950 from-55% to-transparent pb-4 pr-4 pt-4 max-md:static max-md:mb-0 max-md:w-full max-md:bg-none max-md:p-0 md:-mb-10"
                            : "w-full"
                        }
                      >
                      {activeView === "experience" && isMobile && (
                        <div
                          data-exp-crew-back=""
                          aria-hidden="true"
                          className="mt-10 flex justify-center gap-5"
                        >
                          {agentCards.map((agent) => (
                            <span key={agent.id} className="h-9 w-9">
                              {reduceMotion && (
                                <img
                                  src={agent.sprite}
                                  alt=""
                                  className="h-9 w-9 object-contain"
                                  style={{ imageRendering: "pixelated" }}
                                  draggable={false}
                                />
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                      {(activeView === "about" ||
                        activeView === "experience") && (
                        <button
                          type="button"
                          data-mobile-next=""
                          data-armed={nextArmed ? "" : undefined}
                          onClick={handleNext}
                          className={`mb-10 mt-6 flex min-h-[64px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left font-mono transition-colors md:hidden ${
                            nextArmed
                              ? "border-emerald-400/70 bg-emerald-500/10"
                              : "border-zinc-800 bg-zinc-900/40"
                          }`}
                        >
                          <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="text-[12px] uppercase tracking-widest text-zinc-500">
                              {language === "es" ? "Siguiente" : "Next"}
                            </span>
                            <span className="truncate text-[16px] text-zinc-100">
                              <span className="text-emerald-500">$</span> cd{" "}
                              {activeView === "about" ? "experience" : "projects"}
                            </span>
                          </span>
                          <span
                            className={`shrink-0 text-right text-[13px] ${
                              nextArmed ? "text-emerald-300" : "text-emerald-500/80"
                            }`}
                          >
                            {nextArmed
                              ? language === "es"
                                ? "desliza otra vez ↓"
                                : "swipe again ↓"
                              : language === "es"
                                ? "toca o desliza ↓"
                                : "tap or swipe ↓"}
                          </span>
                        </button>
                      )}
                      {activeView === "contact" && (
                        <button
                          type="button"
                          data-mobile-ai-cta=""
                          onClick={handleNext}
                          className="mb-8 mt-2 flex min-h-[64px] w-full items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-left font-mono md:hidden"
                        >
                          <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="text-[12px] uppercase tracking-widest text-zinc-400">
                              {language === "es"
                                ? "Pregúntale a la IA"
                                : "Ask the AI"}
                            </span>
                            <span className="truncate text-[16px] font-bold text-zinc-100">
                              <span className="text-emerald-500">$</span>{" "}
                              {language === "es"
                                ? "Abrir ask-roiner"
                                : "Open ask-roiner"}
                            </span>
                          </span>
                          <span aria-hidden="true" className="shrink-0 text-[18px] text-emerald-400">
                            →
                          </span>
                        </button>
                      )}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: false, amount: 0.1 }}
                        onClick={handleNext}
                        className={`cursor-pointer group/prompt inline-block w-full relative z-10 ${
                          activeView === "about" ||
                          activeView === "experience" ||
                          activeView === "contact"
                            ? "max-md:hidden"
                            : ""
                        } ${
                          activeView === "contact"
                            ? "mt-0 mb-0 self-start"
                            : "mt-8 mb-12"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-white/40 font-mono text-sm group-hover/prompt:text-white/80 transition-colors">
                          <span className="group-hover/prompt:text-emerald-500 transition-colors">
                            $
                          </span>
                          <span>
                            {usesTouchNavigationCopy ? (
                              activeView === "contact" ? (
                                t("AI_TOUCH_HINT")
                              ) : (
                                t("TOUCH_NEXT_SECTION")
                              )
                            ) : (
                              <>
                                {t("PRESS")}{" "}
                                <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 group-hover/prompt:border-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                  ENTER
                                </span>{" "}
                                {t("PARA")}{" "}
                                {activeView === "contact"
                                  ? t("AI_OPEN_HINT")
                                  : viewOrder.indexOf(activeView as any) !==
                                        -1 &&
                                      viewOrder.indexOf(activeView as any) <
                                        viewOrder.length - 1
                                    ? t("CONTINUE")
                                    : t("FINISH")}
                              </>
                            )}
                          </span>
                          <div className="w-2 h-4 bg-white/40 group-hover/prompt:bg-emerald-500 shrink-0" />
                        </div>
                      </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terminal Status Bar for Expanded View */}
              {renderStatusBar(false)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  // In Projects the avatar rests in the explorer column (desktop), so it never
  // covers the text or the media viewer; see .pixel-avatar-mini[data-place].
  const miniPlace =
    isExpanded && activeView === "projects" && !isAiMode
      ? "projects"
      : undefined;

  const miniAvatar =
    typeof document !== "undefined"
      ? createPortal(
          <>
          {projectsHint && (
            <div
              aria-live="polite"
              data-tail={isCompactViewport ? "right" : "down"}
              style={
                isCompactViewport
                  ? undefined
                  : ({ "--tail-x": "92%" } as React.CSSProperties)
              }
              className={`hero-bubble-anchor pointer-events-none fixed z-[161] max-md:hidden ${
                isCompactViewport
                  ? "right-[76px] bottom-[118px] sm:right-[106px] sm:bottom-[104px]"
                  : "hero-bubble-anchor--sidebar left-3 bottom-[198px]"
              }`}
            >
              <div className="hero-bubble">
                <p className="hero-bubble-text">
                  {language === "es"
                    ? "Abre una carpeta para ver el proyecto"
                    : "Open a folder to see the project"}
                </p>
                <span className="hero-bubble-tail" />
              </div>
            </div>
          )}
          <img
            id="mini"
            data-place={miniPlace}
            src={`/avatar/${miniDisplayPose}.png`}
            alt=""
            aria-hidden="true"
            className={`pixel-avatar-mini fixed right-3 bottom-24 sm:right-5 sm:bottom-16 w-14 sm:w-[72px] z-[160] pointer-events-none ${
              sectionMiniPose ? `on ${miniAnim}` : "off"
            }`}
          />
          </>,
          document.body,
        )
      : null;

  if (isExpanded && typeof document !== "undefined") {
    const showExpRobots =
      activeView === "experience" &&
      aboutExpTransition === null &&
      expProjectsTransition === null;

    const handleExpRobotClick = (agentId: AgentId) => {
      if (isAboutExpTransitioningRef.current) return;
      const matchingIndices: number[] = [];
      experienceData.forEach((exp, idx) => {
        if (getMatchingAgentsForTech(exp.tech).has(agentId)) {
          matchingIndices.push(idx);
        }
      });
      if (matchingIndices.length === 0) return;
      const nextIdx =
        matchingIndices.find(
          (idx) => idx > activeExperienceIndexRef.current,
        ) ?? matchingIndices[0];
      applyActiveExperienceIndex(nextIdx);
      experienceItemRefs.current[nextIdx]?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    };

    const desktopPositions: Array<React.CSSProperties> = [
      {
        left: "clamp(18px, calc(50vw - 510px), 130px)",
        top: "24%",
      },
      {
        left: "clamp(28px, calc(50vw - 475px), 165px)",
        top: "56%",
      },
      {
        right: "clamp(28px, calc(50vw - 475px), 165px)",
        top: "29%",
      },
      {
        right: "clamp(18px, calc(50vw - 510px), 130px)",
        top: "61%",
      },
    ];

    return (
      <>
        {createPortal(
          <>
            <div
              ref={overlayScrollRef}
              data-section-overlay=""
              data-view={activeView}
              data-transitioning={
                aboutExpTransition || expProjectsTransition || projContactTransition
                  ? ""
                  : undefined
              }
              className={`fixed inset-0 z-[140] h-screen w-screen ${
                activeView === "experience" ? "bg-black" : "bg-zinc-950"
              } ${usesProjectSplitScroll ? "overflow-hidden" : "overflow-y-auto"}`}
            >
              {panel}
            </div>

            {/* Mobile bottom tab bar (replaces the GOTO bar below md) */}
            <nav
              data-mobile-tabbar=""
              aria-label={language === "es" ? "Secciones" : "Sections"}
              className="fixed inset-x-0 bottom-0 z-[158] flex items-stretch border-t border-zinc-800 bg-zinc-950 pb-[env(safe-area-inset-bottom)] md:hidden"
            >
              {commands.map((cmd) => {
                const active = isAiMode ? cmd === "ai" : activeView === cmd;
                return (
                  <button
                    key={cmd}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      if (isAiMode && cmd === "ai") return;
                      if (!isAiMode && activeView === cmd) return;
                      mobileJump(cmd);
                    }}
                    className={`flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1.5 font-mono text-[12px] ${
                      active ? "text-emerald-400" : "text-zinc-400"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-0.5 w-6 rounded-full ${active ? "bg-emerald-400" : "bg-transparent"}`}
                    />
                    <span className="max-w-full truncate px-0.5">
                      {cmd === "experience" ? "exp" : cmd}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                aria-label={language === "es" ? "Volver al inicio" : "Back to start"}
                onClick={isAiMode ? exitAiMode : closeExpanded}
                className="flex h-14 w-12 shrink-0 items-center justify-center border-l border-zinc-800 text-zinc-400"
              >
                <Home className="h-5 w-5" />
              </button>
            </nav>

            {/* Fixed Experience Robot Fleet (2 left, 2 right on desktop; top bar on mobile) */}
            {(activeView === "about" || activeView === "experience") && !isMobile && (
              <div
                aria-hidden={!showExpRobots}
                className="fixed inset-0 z-[155] pointer-events-none"
                style={{
                  visibility: showExpRobots ? "visible" : "hidden",
                  opacity: showExpRobots ? 1 : 0,
                }}
              >
                {isMobile ? (
                  <div className="fixed top-[56px] left-1/2 -translate-x-1/2 flex items-center gap-5 px-4 py-1.5">
                    {agentCards.map((agent, idx) => (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => handleExpRobotClick(agent.id)}
                        title={agent.area}
                        aria-label={agent.area}
                        className={`relative flex items-center justify-center cursor-pointer ${
                          showExpRobots
                            ? "pointer-events-auto"
                            : "pointer-events-none"
                        }`}
                      >
                        <div
                          ref={(el) => {
                            expRobotRefs.current[idx] = el;
                          }}
                          className="relative flex h-[44px] w-[44px] items-center justify-center cursor-pointer"
                        >
                          <div
                            className="flex h-full w-full items-center justify-center"
                            style={{
                              filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6))",
                            }}
                          >
                            <img
                              src={agent.sprite}
                              alt={agent.area}
                              className="robot-float-2-5 h-[44px] w-[44px] object-contain cursor-pointer"
                              style={{
                                imageRendering: "pixelated",
                                animationDelay: `${idx * 0.45}s`,
                              }}
                              draggable={false}
                            />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  agentCards.map((agent, idx) => (
                    <div
                      key={agent.id}
                      style={desktopPositions[idx]}
                      onClick={() => handleExpRobotClick(agent.id)}
                      title={agent.area}
                      className={`fixed flex items-center justify-center cursor-pointer select-none group ${
                        showExpRobots
                          ? "pointer-events-auto"
                          : "pointer-events-none"
                      }`}
                    >
                      <div
                        ref={(el) => {
                          expRobotRefs.current[idx] = el;
                        }}
                        className="relative flex h-[72px] w-[72px] items-center justify-center cursor-pointer"
                      >
                        {/* hover scale + shadow on a static wrapper; the float is a CSS (compositor) animation on the img */}
                        <div
                          className="flex h-full w-full items-center justify-center transition-transform duration-200 group-hover:scale-110"
                          style={{
                            filter: "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.6))",
                          }}
                        >
                          <img
                            src={agent.sprite}
                            alt={agent.area}
                            className="robot-float-5 h-[72px] w-[72px] object-contain cursor-pointer"
                            style={{
                              imageRendering: "pixelated",
                              animationDelay: `${idx * 0.5}s`,
                            }}
                            draggable={false}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Timed About <-> Experience flying robots layer */}
            {aboutExpTransition && aboutExpTransition.fly !== false && (
              <div className="fixed inset-0 z-[210] pointer-events-none overflow-hidden">
                {agentCards.map((agent, idx) => {
                  const initialBox = aboutExpTransition.fromRects[idx];
                  return (
                    <div
                      key={agent.id}
                      ref={(el) => {
                        flyingRobotRefs.current[idx] = el;
                      }}
                      className="fixed left-0 top-0 pointer-events-none cursor-pointer will-change-transform"
                      style={{
                        width: `${initialBox?.width ?? 71}px`,
                        height: `${initialBox?.height ?? 71}px`,
                        transform: `translate3d(${initialBox?.left ?? 0}px, ${initialBox?.top ?? 0}px, 0)`,
                        transformOrigin: "center center",
                      }}
                    >
                      <img
                        src={agent.sprite}
                        alt={agent.area}
                        className="h-full w-full object-contain cursor-pointer"
                        style={{
                          imageRendering: "pixelated",
                          filter: "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.6))",
                        }}
                        draggable={false}
                      />
                    </div>
                  );
                })}
              </div>
            )}

          </>,
          document.body,
        )}
        {miniAvatar}
      </>
    );
  }

  if (headless) {
    return <>{miniAvatar}</>;
  }

  return (
    <div className="relative w-full min-h-[580px]">
      {panel}
      {miniAvatar}
    </div>
  );
  },
);
