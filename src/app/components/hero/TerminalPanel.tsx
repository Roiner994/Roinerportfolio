import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Terminal,
  Sparkles,
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
  Target,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  aboutData,
  cvData,
  experienceData,
  projectEntries,
  type ProjectEntry,
  type ProjectImage,
  type ProjectLink,
} from "@/data/portfolioProfile";
import { getProjectMedia } from "@/lib/projectMedia";
import { useIsMobile } from "@/app/components/ui/use-mobile";

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

const commands = ["about", "experience", "projects", "contact", "cv", "ai"];

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

const shellCommands = new Set(commands);

const viewOrder: ("about" | "experience" | "projects" | "contact" | "cv")[] = [
  "about",
  "experience",
  "projects",
  "contact",
  "cv",
];

type TerminalView =
  | "terminal"
  | "about"
  | "experience"
  | "projects"
  | "contact"
  | "cv";

type TerminalMode = "shell" | "ai";

type ChatRole = "assistant" | "user" | "system";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const AI_WELCOME_MESSAGE =
  "bienvenido al modo ai, puedes preguntar lo que quieras y te respondere en base a mi conocimiento";
const AI_HELP_MESSAGE =
  "Puedes preguntarme sobre mis habilidades, experiencia, ubicacion, disponibilidad, educacion, proyectos, stack o contacto. Usa clear para limpiar y exit o back para salir del modo ai.";
const AI_ERROR_MESSAGE =
  "No pude conectarme con el modo ai en este momento. Revisa la configuracion de OPENROUTER_API_KEY o intenta de nuevo en unos segundos.";
const AI_LOCAL_SETUP_MESSAGE =
  "El endpoint /api/chat no esta disponible en este entorno. Para probar el modo ai real en local, inicia la app con `npm run dev:vercel` o `vercel dev`.";

function createAiWelcomeHistory(): ChatMessage[] {
  return [
    {
      id: "ai-welcome",
      role: "assistant",
      content: AI_WELCOME_MESSAGE,
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
}

interface ExperienceNodeMarkerProps {
  pulseY: MotionValue<number>;
  targetY: number;
}

function ExperienceNodeMarker({ pulseY, targetY }: ExperienceNodeMarkerProps) {
  const activation = useTransform(pulseY, (value) => {
    const distance = Math.abs(value - targetY);
    return Math.max(0, 1 - distance / 54);
  });

  const borderColor = useTransform(
    activation,
    [0, 1],
    ["rgba(63,63,70,0.9)", "rgba(16,185,129,0.95)"],
  );
  const backgroundColor = useTransform(
    activation,
    [0, 1],
    ["rgba(9,9,11,1)", "rgba(16,185,129,0.18)"],
  );
  const boxShadow = useTransform(
    activation,
    [0, 0.65, 1],
    [
      "0 0 0 rgba(16,185,129,0)",
      "0 0 12px rgba(16,185,129,0.45), 0 0 18px rgba(16,185,129,0.18)",
      "0 0 18px rgba(16,185,129,0.8), 0 0 28px rgba(16,185,129,0.35)",
    ],
  );
  const coreOpacity = useTransform(activation, [0, 1], [0.45, 1]);
  const coreScale = useTransform(activation, [0, 1], [1, 1.25]);

  return (
    <motion.div
      className="relative z-10 flex h-4 w-4 items-center justify-center border border-zinc-700 bg-zinc-950"
      style={{ borderColor, backgroundColor, boxShadow }}
    >
      <motion.div
        className="h-1.5 w-1.5 bg-emerald-500/60"
        style={{ opacity: coreOpacity, scale: coreScale }}
      />
    </motion.div>
  );
}

function AnimatedContactAvatar({
  isExternallyHovered = false,
}: {
  isExternallyHovered?: boolean;
}) {
  const [hasSwappedToPeace, setHasSwappedToPeace] = useState(false);
  const [isInitialSwapAccentActive, setIsInitialSwapAccentActive] =
    useState(false);
  const handSwapTransition = {
    duration: 0.09,
    ease: "easeOut" as const,
  };

  const handLayerClassName =
    "absolute inset-0 h-full w-full object-cover pointer-events-none";
  const handLayerStyle = {
    clipPath:
      "polygon(0% 18%, 27% 18%, 34% 28%, 36% 44%, 35% 60%, 32% 77%, 25% 92%, 16% 100%, 0% 100%)",
  };

  useEffect(() => {
    setHasSwappedToPeace(false);
    setIsInitialSwapAccentActive(false);

    const swapTimeoutId = window.setTimeout(() => {
      setHasSwappedToPeace(true);
      setIsInitialSwapAccentActive(true);
    }, 1800);

    const accentTimeoutId = window.setTimeout(() => {
      setIsInitialSwapAccentActive(false);
    }, 2920);

    return () => {
      window.clearTimeout(swapTimeoutId);
      window.clearTimeout(accentTimeoutId);
    };
  }, []);

  const isHovered = hasSwappedToPeace && isExternallyHovered;
  const showPeace = hasSwappedToPeace && !isHovered;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 0 }}
      animate={{
        opacity: 1,
        scale: isHovered
          ? 1.025
          : isInitialSwapAccentActive
            ? [1, 1.016, 1.006, 1]
            : 1,
        y: isHovered ? -4 : isInitialSwapAccentActive ? [0, -1.5, -0.5, 0] : 0,
      }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <motion.div
        className="absolute -inset-3 rounded-[1.7rem] bg-[radial-gradient(circle_at_30%_35%,rgba(16,185,129,0.22),transparent_58%)] opacity-0 blur-2xl pointer-events-none"
        animate={{
          opacity: isHovered
            ? 1
            : isInitialSwapAccentActive
              ? [0, 0.42, 0.14, 0]
              : 0,
          scale: isHovered
            ? 1.04
            : isInitialSwapAccentActive
              ? [0.985, 1.025, 1.005, 1]
              : 0.98,
        }}
        transition={{
          duration: isInitialSwapAccentActive ? 0.34 : 0.18,
          ease: "easeOut",
        }}
      />

      <motion.div
        className="relative aspect-square overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#158a67] shadow-2xl"
        animate={{
          borderColor: isHovered
            ? "rgba(52, 211, 153, 0.55)"
            : isInitialSwapAccentActive
              ? [
                  "rgba(16, 185, 129, 0.2)",
                  "rgba(52, 211, 153, 0.5)",
                  "rgba(16, 185, 129, 0.2)",
                ]
              : "rgba(16, 185, 129, 0.2)",
          boxShadow: isHovered
            ? "0 30px 60px -24px rgba(16,185,129,0.38), 0 0 0 1px rgba(52,211,153,0.12)"
            : isInitialSwapAccentActive
              ? [
                  "0 25px 50px -24px rgba(0,0,0,0.65)",
                  "0 29px 60px -26px rgba(16,185,129,0.22), 0 0 0 1px rgba(52,211,153,0.08)",
                  "0 25px 50px -24px rgba(0,0,0,0.65)",
                ]
              : "0 25px 50px -24px rgba(0,0,0,0.65)",
        }}
        transition={{
          duration: isInitialSwapAccentActive ? 0.34 : 0.2,
          ease: "easeOut",
        }}
      >
        <img
          src="/avatar_base.png"
          alt="Avatar animado de contacto pasando de saludo a signo de paz"
          className="h-full w-full object-cover opacity-95"
        />

        <motion.img
          src="/avatar_hello.png"
          alt=""
          aria-hidden="true"
          className={handLayerClassName}
          style={handLayerStyle}
          animate={{
            opacity: showPeace ? 0 : 1,
            scale: isHovered ? 1.015 : 1,
          }}
          transition={{
            ...handSwapTransition,
            scale: { duration: 0.22, ease: "easeOut" },
          }}
        />

        <motion.img
          src="/avatar_peace.png"
          alt=""
          aria-hidden="true"
          className={handLayerClassName}
          style={handLayerStyle}
          animate={{
            opacity: showPeace ? 1 : 0,
            scale: isHovered ? 1.015 : 1,
          }}
          transition={{
            ...handSwapTransition,
            scale: { duration: 0.22, ease: "easeOut" },
          }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_42%,rgba(255,255,255,0.16),transparent_26%)]"
          animate={{
            opacity: isHovered
              ? 0.24
              : isInitialSwapAccentActive
                ? [0.16, 0.21, 0.18, 0.16]
                : 0.16,
          }}
          transition={{ duration: isInitialSwapAccentActive ? 0.34 : 0.2 }}
        />

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
      className="group relative inline-flex items-center gap-2 py-1 transition-all"
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

      <span className="text-sm font-mono text-emerald-500 group-hover:text-emerald-400 transition-colors border-b border-transparent group-hover:border-emerald-500/40">
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

function ProjectMediaPanel({
  project,
  selectedImageIndex,
  onSelectImage,
}: {
  project: ProjectEntry;
  selectedImageIndex: number;
  onSelectImage: (index: number) => void;
}) {
  const images = getProjectMedia(project.id);
  const activeImage = images[selectedImageIndex] ?? images[0];

  const nextImage = () => {
    onSelectImage((selectedImageIndex + 1) % images.length);
  };

  const prevImage = () => {
    onSelectImage((selectedImageIndex - 1 + images.length) % images.length);
  };

  if (!activeImage) {
    return null;
  }

  return (
    <div className="group relative">
      <div className="overflow-hidden rounded-[2rem] bg-zinc-950/50 shadow-2xl transition-all duration-500">
        <div className="relative flex min-h-[400px] items-center justify-center p-4 sm:p-10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedImageIndex}
              initial={{ opacity: 0, x: 20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              src={activeImage.src}
              alt={project.displayName}
              className="max-h-[550px] w-full object-contain drop-shadow-[0_0_50px_rgba(16,185,129,0.1)] relative z-10"
              style={{
                filter: "contrast(1.05) brightness(1.05)",
              }}
            />
          </AnimatePresence>

          <div
            className="absolute inset-0 z-20 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #10b981 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04),transparent_70%)]" />

          {images.length > 1 && (
            <>
              {/* Full-height Side Navigation */}
              <div className="absolute inset-y-0 left-0 w-16 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={prevImage}
                  className="h-full w-full flex items-center justify-center bg-gradient-to-r from-black/60 to-transparent text-white/20 hover:text-emerald-500 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 w-16 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={nextImage}
                  className="h-full w-full flex items-center justify-center bg-gradient-to-l from-black/60 to-transparent text-white/20 hover:text-emerald-500 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

              {/* Technical Counter Label */}
              <div className="absolute bottom-6 right-6 z-30 flex items-center gap-3 rounded border border-emerald-500/10 bg-black/80 px-3 py-1.5 backdrop-blur-md font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-300">
                <span className="text-zinc-500">MEDIA_INDEX:</span>
                <span className="text-emerald-500 text-sm">
                  {String(selectedImageIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-zinc-700">/</span>
                <span className="text-zinc-400">
                  {String(images.length).padStart(2, "0")}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function TerminalPanel({ variant = "default" }: TerminalPanelProps) {
  const isMobile = useIsMobile();
  const [inputValue, setInputValue] = useState("");
  const [activeView, setActiveView] = useState<TerminalView>("terminal");
  const [terminalMode, setTerminalMode] = useState<TerminalMode>("shell");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(
    createAiWelcomeHistory,
  );
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(projectEntries[0].id);
  const [activeProjectImageIndex, setActiveProjectImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [isContactCardHovered, setIsContactCardHovered] = useState(false);
  const [experienceRailHeight, setExperienceRailHeight] = useState(0);
  const [experienceNodeTargets, setExperienceNodeTargets] = useState<number[]>(
    [],
  );
  const [aboutTypedLength, setAboutTypedLength] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const experienceRailRef = useRef<HTMLDivElement>(null);
  const experienceNodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const experiencePulseY = useMotionValue(-24);
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
      activeView === "cv" ||
      isAiMode);
  const usesTouchNavigationCopy = isMobile || isCompactViewport;

  const scrollToBottom = useCallback(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, []);

  const enterAiMode = () => {
    setTerminalMode("ai");
    setActiveView("terminal");
    setIsExpanded(true);
    setInputValue("");
    setChatHistory(createAiWelcomeHistory());
  };

  const exitAiMode = () => {
    setTerminalMode("shell");
    setActiveView("terminal");
    setIsExpanded(false);
    setInputValue("");
  };

  const resetAiConversation = () => {
    setChatHistory(createAiWelcomeHistory());
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

  const handleAiCommand = async (rawValue: string) => {
    const trimmed = rawValue.trim();
    const normalized = normalizePrompt(rawValue);

    if (!trimmed || isAiThinking) {
      return;
    }

    if (normalized === "exit" || normalized === "back") {
      exitAiMode();
      return;
    }

    if (normalized === "clear") {
      resetAiConversation();
      return;
    }

    if (normalized === "help") {
      appendSystemMessage(AI_HELP_MESSAGE);
      setInputValue("");
      return;
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

    try {
      setIsAiThinking(true);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: outgoingHistory,
        }),
      });

      const data = await response.json().catch(() => null);
      const assistantContent =
        data?.message?.content && typeof data.message.content === "string"
          ? data.message.content
          : response.ok
            ? AI_ERROR_MESSAGE
            : response.status === 404
              ? AI_LOCAL_SETUP_MESSAGE
              : data?.error && typeof data.error === "string"
                ? data.error
                : AI_ERROR_MESSAGE;

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
          content: AI_ERROR_MESSAGE,
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.toLowerCase().trim();

    if (!cleanCmd) {
      setInputValue("");
      return;
    }

    if (
      ["experience", "about", "projects", "contact", "cv"].includes(cleanCmd)
    ) {
      setTerminalMode("shell");
      setIsExpanded(true);
      setActiveView(cleanCmd as any);
    } else if (cleanCmd === "ai") {
      enterAiMode();
    } else if (!shellCommands.has(cleanCmd)) {
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
    if (activeView === "projects") {
      if (hasNextProject) {
        setActiveProjectId(projectEntries[activeProjectIndex + 1].id);
      } else {
        handleCommand("contact");
      }
      return;
    }

    const currentIndex = viewOrder.indexOf(activeView as any);
    if (currentIndex !== -1 && currentIndex < viewOrder.length - 1) {
      handleCommand(viewOrder[currentIndex + 1]);
    } else if (activeView === "cv") {
      handleCommand("ai");
    } else if (activeView !== "terminal") {
      closeExpanded();
    }
  };

  const closeExpanded = () => {
    if (isAiMode) {
      exitAiMode();
    }
    setIsExpanded(false);
    setActiveView("terminal");
  };

  // Lock body scroll and listen for Enter key when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && activeView !== "terminal") {
          e.preventDefault();
          handleNext();
        }
      };
      window.addEventListener("keydown", handleGlobalKeyDown);
      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("keydown", handleGlobalKeyDown);
      };
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isExpanded, activeView, handleNext]);

  const handleTerminalClick = () => {
    if (activeView === "terminal") {
      inputRef.current?.focus();
    }
  };

  const autocompleteShellCommand = () => {
    const normalizedInput = inputValue.toLowerCase().trimStart();

    if (!normalizedInput || isAiMode) {
      return;
    }

    const matches = commands.filter((command) =>
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

    inputRef.current?.focus();
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory, isAiMode, activeView]);

  useEffect(() => {
    if (activeView !== "experience") {
      return;
    }

    const measureTimeline = () => {
      const rail = experienceRailRef.current;
      if (!rail) {
        return;
      }

      const railRect = rail.getBoundingClientRect();
      setExperienceRailHeight(railRect.height);

      const targets = experienceNodeRefs.current.map((node) => {
        if (!node) {
          return 0;
        }

        const nodeRect = node.getBoundingClientRect();
        return nodeRect.top - railRect.top + nodeRect.height / 2;
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

    const controls = animate(
      experiencePulseY,
      [-24, experienceRailHeight + 24],
      {
        duration: 4.8,
        repeat: Infinity,
        ease: "linear",
      },
    );

    return () => {
      controls.stop();
    };
  }, [activeView, experienceRailHeight, experiencePulseY]);

  useEffect(() => {
    if (activeView !== "about") {
      setAboutTypedLength(0);
      return;
    }

    let frame = 0;
    const fullText = `"${aboutData.bio}"`;
    const tick = () => {
      frame += 3;
      setAboutTypedLength(Math.min(frame, fullText.length));
      if (frame < fullText.length) {
        window.setTimeout(tick, 18);
      }
    };

    const startDelay = window.setTimeout(tick, 180);

    return () => {
      window.clearTimeout(startDelay);
    };
  }, [activeView]);

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

  const panel = (
    <motion.div
      layout
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
          backdrop-blur-xl border overflow-hidden cursor-text flex flex-col w-full
          ${usesFullscreenExpandedLayout ? "h-screen" : isExpanded ? "min-h-screen" : "h-full"}
          ${variant === "floating" && !isExpanded ? "shadow-2xl shadow-emerald-500/10" : ""}
          ${variant === "centered" && !isExpanded ? "max-w-4xl mx-auto" : ""}
          ${isExpanded ? "border-none rounded-none" : "border-zinc-800 rounded-2xl"}
        `}
      style={{
        background: isExpanded ? "rgba(9, 9, 11, 1)" : "rgba(9, 9, 11, 0.98)",
        borderColor: isExpanded ? "transparent" : "rgba(16, 185, 129, 0.3)",
      }}
    >
      {/* Ambient glow */}
      <div
        className={`absolute -inset-[1px] bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 blur opacity-30 pointer-events-none ${isExpanded ? "" : "rounded-2xl"}`}
      />

      {/* Terminal header */}
      <div className="relative border-b border-zinc-800 px-5 py-3 flex items-center justify-between bg-black/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-2 group/controls">
            <button
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
          <div className="flex items-center gap-2 text-zinc-400">
            <Terminal className="w-4 h-4" />
            <span className="text-xs font-mono tracking-tight">
              {activeView === "terminal"
                ? isAiMode
                  ? "roiner@workspace:~/ai"
                  : "roiner@workspace:~"
                : `roiner@workspace:~/${activeView}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {activeView !== "terminal" && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500/50 px-2 py-0.5 border border-emerald-500/20 rounded">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              READ_ONLY_MODE
            </div>
          )}
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeExpanded();
              }}
              className="text-zinc-500 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
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
          {activeView === "terminal" ? (
            <motion.div
              key="terminal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 font-mono text-sm flex flex-col gap-6 h-full"
            >
              <div className="space-y-4">
                <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                  <div
                    className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${isAiMode ? "bg-emerald-400" : "bg-emerald-500"}`}
                  />
                  QUICK_ACCESS_COMMANDS
                </div>
                <div className="grid grid-cols-3 gap-3">
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
                        animate={{ opacity: 1 }}
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
                            px-2 py-3 border transition-all text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-center
                            ${
                              isActiveCommand
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[3px_3px_0px_rgba(16,185,129,0.18)]"
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

              {isAiMode ? (
                <div className="flex min-h-0 flex-1 flex-col gap-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between border-b border-emerald-500/10 pb-4 mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-500/60">
                        <span className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        AI_NEURAL_LINK :: ACTIVE
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exitAiMode();
                      }}
                      className="group flex items-center gap-2 rounded-sm border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 transition-all hover:border-emerald-500/40 hover:bg-emerald-950/20 hover:text-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-95"
                    >
                      <X
                        size={12}
                        className="text-zinc-500 transition-colors group-hover:text-emerald-400"
                      />
                      EXIT_AI_LINK
                    </button>
                  </motion.div>

                  <div
                    ref={chatScrollRef}
                    className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pt-2"
                  >
                    {chatHistory.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index === chatHistory.length - 1 ? 0.04 : 0,
                        }}
                        className="flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest opacity-40">
                          <span
                            className={
                              message.role === "user"
                                ? "text-zinc-100"
                                : "text-emerald-500"
                            }
                          >
                            {message.role === "user"
                              ? "guest@workspace"
                              : "ai@neural-link"}
                          </span>
                          <span className="text-zinc-500">
                            ::{" "}
                            {new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                        <div
                          className={`
                            text-sm leading-relaxed font-mono
                            ${message.role === "user" ? "text-zinc-200" : "text-emerald-400/90"}
                          `}
                        >
                          {message.role === "user" && (
                            <span className="mr-2 text-zinc-600">$</span>
                          )}
                          {message.role !== "user" &&
                          index === chatHistory.length - 1 ? (
                            <TypewriterText
                              text={message.content}
                              onTick={scrollToBottom}
                            />
                          ) : (
                            message.content
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {isAiThinking && (
                      <motion.div
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest opacity-40">
                          <span className="text-emerald-500">
                            ai@neural-link
                          </span>
                          <span className="text-zinc-500">:: thinking...</span>
                        </div>
                        <div className="text-sm leading-relaxed font-mono text-emerald-400/90">
                          <TypewriterText
                            text="consultando conocimiento del portfolio..."
                            onTick={scrollToBottom}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex items-start gap-4 p-5 bg-emerald-500/[0.03] backdrop-blur-md rounded-xl border border-emerald-500/10 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />

                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full border border-emerald-500/30 overflow-hidden bg-zinc-900 relative">
                        <img
                          src="/avatar3.png"
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
                      </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70 font-mono">
                            Digital Guide
                          </span>
                          <div className="w-1 h-1 rounded-full bg-zinc-700" />
                        </div>
                        <div className="text-[9px] font-mono text-zinc-500 uppercase flex gap-3">
                          <span>
                            Session:{" "}
                            {Math.random()
                              .toString(36)
                              .substring(7)
                              .toUpperCase()}
                          </span>
                          <span>
                            Last login: {new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-zinc-200 leading-snug">
                        Welcome to my neural workspace. How can I assist your
                        exploration today?
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                        System ready. Use the terminal below to navigate or
                        click a command.
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Interactive Terminal Input (Bottom) */}
              <div className="mt-auto pb-8 pt-6">
                <div className="flex items-center gap-3 text-white transition-colors px-1">
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
                      disabled={isAiMode && isAiThinking}
                      placeholder={
                        isAiMode
                          ? "Pregunta sobre habilidades, experiencia, ubicacion, disponibilidad..."
                          : "Escribe lo que quieras aquí..."
                      }
                      className="w-full bg-transparent border-none outline-none p-0 font-mono text-sm text-white caret-transparent placeholder:text-white/20 disabled:opacity-60"
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
            </motion.div>
          ) : (
            <motion.div
              key="expanded-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex h-full min-h-0 flex-col bg-black/40"
            >
              <div
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
                    {activeView === "about" && (
                      <div className="space-y-12 pb-12">
                        {/* Profile Header Section */}
                        <div className="grid md:grid-cols-12 gap-12 items-start">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="md:col-span-4 relative group mx-auto md:mx-0 max-w-sm"
                          >
                            <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative aspect-square md:aspect-[4/5] rounded-2xl border border-emerald-500/20 overflow-hidden bg-zinc-900 shadow-2xl">
                              <img
                                src="/avatar-complete3.png"
                                alt="Roiner Hernandez"
                                className="w-full h-full object-cover"
                              />
                              <ScanningEffect />

                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                            </div>

                            {/* Targeting corner elements */}
                            <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-emerald-500/35 pointer-events-none" />
                            <div className="absolute -top-3 -right-3 w-16 h-16 border-t-2 border-r-2 border-emerald-500/35 pointer-events-none" />
                            <div className="absolute -bottom-3 -left-3 w-16 h-16 border-b-2 border-l-2 border-emerald-500/35 pointer-events-none" />
                            <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-emerald-500/35 pointer-events-none" />
                          </motion.div>

                          <div className="md:col-span-8 space-y-8 pt-4">
                            <div className="space-y-6">
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                                  SYSTEM_IDENTIFIED: HUMAN_ENGINEER
                                </span>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                                  <span className="text-emerald-500">$</span>
                                  <span>cat profile_summary.md</span>
                                </div>
                                <div className="relative min-h-[15rem]">
                                  <p className="text-xl text-zinc-300 leading-relaxed font-light">
                                    {`"${aboutData.bio}"`.slice(
                                      0,
                                      aboutTypedLength,
                                    )}
                                  </p>
                                  {aboutTypedLength <
                                    `"${aboutData.bio}"`.length && (
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
                              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1 group hover:border-emerald-500/30 transition-colors">
                                <span className="text-[10px] text-zinc-500 uppercase font-mono">
                                  Location
                                </span>
                                <p className="text-zinc-200 text-xs font-mono">
                                  {aboutData.location}
                                </p>
                              </div>
                              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1 group hover:border-emerald-500/30 transition-colors">
                                <span className="text-[10px] text-zinc-500 uppercase font-mono">
                                  Education
                                </span>
                                <p className="text-zinc-200 text-xs font-mono">
                                  {aboutData.education}
                                </p>
                              </div>
                              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1 group hover:border-emerald-500/30 transition-colors col-span-2 sm:col-span-1">
                                <span className="text-[10px] text-emerald-500/60 uppercase font-mono">
                                  Status
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                                  <p className="text-emerald-400 text-xs font-mono">
                                    {aboutData.status}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Knowledge Base Section (Skills) */}
                        <div className="space-y-8">
                          <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-zinc-800" />
                            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">
                              Neural_Skill_Matrix
                            </h3>
                            <div className="h-px flex-1 bg-zinc-800" />
                          </div>

                          <div className="grid sm:grid-cols-3 gap-6">
                            {Object.entries(aboutData.skills).map(
                              ([category, items], idx) => (
                                <motion.div
                                  key={category}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 + idx * 0.1 }}
                                  className="space-y-4 p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl group hover:bg-zinc-800/20 transition-all"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">
                                      {category.replace("_", " ")}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {items.map((skill) => (
                                      <span
                                        key={skill}
                                        className="px-2 py-1 bg-black/40 border border-zinc-800 text-[10px] text-zinc-400 font-mono rounded-md group-hover:border-emerald-500/20 group-hover:text-zinc-200 transition-colors"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </motion.div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeView === "experience" && (
                      <div className="space-y-12">
                        {/* Terminal Command Simulation */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-emerald-500">$</span>
                            <span className="text-zinc-300">
                              cat experience.json
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-600">
                            Retrieving logs from secure-vault-01... [DONE]
                          </div>
                        </div>

                        <div className="relative pl-10 md:pl-14">
                          <div className="absolute left-0 top-2 bottom-0 w-6 flex justify-center pointer-events-none">
                            <div
                              ref={experienceRailRef}
                              className="relative h-full w-px overflow-visible"
                            >
                              <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 via-emerald-500/10 to-zinc-800" />
                              <motion.div
                                aria-hidden="true"
                                className="absolute top-0 left-1/2 h-16 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-300/0 via-emerald-400 to-emerald-300/0 shadow-[0_0_18px_rgba(16,185,129,0.9)] blur-[0.5px]"
                                style={{ y: experiencePulseY }}
                              />
                            </div>
                          </div>

                          <div className="space-y-16 relative">
                            {experienceData.map((exp, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="relative"
                              >
                                <div
                                  ref={(node) => {
                                    experienceNodeRefs.current[i] = node;
                                  }}
                                  className="absolute left-0 top-1.5 w-6 -translate-x-[40px] md:-translate-x-[56px] flex justify-center"
                                >
                                  <ExperienceNodeMarker
                                    pulseY={experiencePulseY}
                                    targetY={experienceNodeTargets[i] ?? 0}
                                  />
                                </div>

                                <div className="space-y-4">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-[10px] font-mono text-emerald-500 px-1.5 py-0.5 bg-emerald-500/5 border border-emerald-500/20 rounded">
                                        {exp.period}
                                      </span>
                                      <span className="text-zinc-700 font-mono text-[10px]">
                                        ::
                                      </span>
                                      <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
                                        {exp.company}
                                      </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-100 tracking-tight">
                                      {exp.role}
                                    </h3>
                                  </div>
                                  <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl font-mono opacity-80">
                                    {exp.description}
                                  </p>
                                  <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                                    {exp.tech.map((t, ti) => (
                                      <span
                                        key={ti}
                                        className="text-[10px] font-mono text-zinc-600 flex items-center gap-1"
                                      >
                                        <span className="text-emerald-500/30">
                                          #
                                        </span>
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeView === "projects" && (
                      <div
                        className={`flex flex-col bg-zinc-950/50 lg:flex-row ${
                          usesProjectSplitScroll
                            ? "h-full flex-1 min-h-0 overflow-hidden"
                            : "min-h-full"
                        }`}
                      >
                        <motion.aside
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex w-full flex-shrink-0 flex-col border-b border-zinc-800 bg-black/40 min-h-0 lg:w-80 lg:border-b-0 lg:border-r"
                        >
                          <div className="border-b border-zinc-800/50 px-4 py-3 flex items-center justify-between bg-zinc-900/20">
                            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                              <Terminal className="w-3 h-3 text-emerald-500/50" />
                              <span>Explorer</span>
                            </div>
                            <div className="flex gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pt-4 space-y-0.5">
                            <div className="px-2 pb-2 flex items-center justify-between">
                              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                                Workspace
                              </span>
                              <ChevronDown className="w-3 h-3 text-zinc-700" />
                            </div>

                            {projectEntries.map((project) => {
                              const isActive = project.id === activeProject.id;

                              return (
                                <button
                                  key={project.id}
                                  type="button"
                                  onClick={() => setActiveProjectId(project.id)}
                                  className={`group relative flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 rounded-lg ${
                                    isActive
                                      ? "bg-emerald-500/[0.07] text-emerald-400"
                                      : "text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300"
                                  }`}
                                >
                                  {isActive && (
                                    <motion.div
                                      layoutId="active-indicator"
                                      className="absolute left-0 top-2 bottom-2 w-0.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
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
                                        className={`font-mono text-xs truncate ${isActive ? "font-bold text-zinc-100" : ""}`}
                                      >
                                        {project.terminalName}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {usesProjectSplitScroll && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={handleNext}
                              className="cursor-pointer border-t border-zinc-800/60 bg-black/50 px-4 py-3 group/prompt"
                            >
                              <div className="flex items-center gap-2 text-white/40 font-mono text-xs group-hover/prompt:text-white/80 transition-colors">
                                <span className="group-hover/prompt:text-emerald-500 transition-colors">
                                  $
                                </span>
                                <span>
                                  Presiona{" "}
                                  <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 group-hover/prompt:border-white/20 transition-all">
                                    ENTER
                                  </span>{" "}
                                  para{" "}
                                  {hasNextProject
                                    ? `abrir ${projectEntries[activeProjectIndex + 1].terminalName}`
                                    : "ir a contacto"}
                                </span>
                                <div className="h-3.5 w-1.5 bg-white/40 group-hover/prompt:bg-emerald-500" />
                              </div>
                            </motion.div>
                          )}
                        </motion.aside>

                        <AnimatePresence mode="wait">
                          <motion.section
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
                            <div className="border-b border-zinc-800 px-6 py-4">
                              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
                                <span className="text-[#00FF41]">
                                  {activeProject.terminalName}
                                </span>
                                <span className="text-zinc-700">/</span>
                                <span className="text-zinc-500">
                                  {activeProject.category}
                                </span>
                                {activeProject.status && (
                                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/[0.06] px-2.5 py-1 text-emerald-300">
                                    {activeProject.status.label}
                                    {activeProject.status.value
                                      ? ` / ${activeProject.status.value}`
                                      : ""}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid gap-10 p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-8">
                              <div className="space-y-8">
                                <div className="space-y-5">
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                      <span className="font-mono text-[10px] font-bold text-emerald-500 border-l-2 border-emerald-500 pl-2 uppercase tracking-widest">
                                        DATA_STREAM_
                                        {String(
                                          activeProjectIndex + 1,
                                        ).padStart(2, "0")}
                                      </span>
                                    </div>

                                    <div className="relative">
                                      <h3 className="font-mono text-2xl font-black italic tracking-tighter text-white md:text-3xl lg:text-4xl leading-tight">
                                        <span className="text-emerald-500 mr-2 opacity-40 not-italic">
                                          &gt;
                                        </span>
                                        {activeProject.displayName}
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

                                    <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-500">
                                      {activeProject.subtitle}
                                    </div>
                                  </div>

                                  {/* Links - Moved to the top for visibility */}
                                  {activeProject.links.length > 0 && (
                                    <div className="space-y-4 py-2">
                                      <div className="flex items-center gap-3">
                                        <ProjectSectionLabel>
                                          External Resources
                                        </ProjectSectionLabel>
                                        <div className="h-px flex-1 bg-zinc-800/50" />
                                      </div>
                                      <div className="flex flex-wrap gap-x-8 gap-y-4">
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

                                  <p className="max-w-2xl text-base leading-8 text-zinc-300">
                                    {activeProject.description}
                                  </p>
                                </div>

                                {/* Additional Project Metadata */}
                                <div className="grid gap-8 md:grid-cols-2">
                                  {/* Role Section */}
                                  <div className="group relative flex gap-4">
                                    <div className="flex flex-col items-center pt-1">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all duration-500">
                                        <Briefcase className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                      </div>
                                      <div className="mt-4 h-full w-px bg-zinc-900 group-hover:bg-emerald-500/10 transition-colors" />
                                    </div>
                                    <div className="flex flex-col gap-1.5 pb-4">
                                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60 transition-colors">
                                        POSITION_CONTEXT
                                      </span>
                                      <p className="max-w-xl font-mono text-[13px] leading-relaxed text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                        {activeProject.role}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Impact Section */}
                                  <div className="group relative flex gap-4">
                                    <div className="flex flex-col items-center pt-1">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all duration-500">
                                        <Sparkles className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                      </div>
                                      <div className="mt-4 h-full w-px bg-zinc-900 group-hover:bg-emerald-500/10 transition-colors" />
                                    </div>
                                    <div className="flex flex-col gap-1.5 pb-4">
                                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60 transition-colors">
                                        PRODUCT_IMPACT
                                      </span>
                                      <p className="max-w-xl font-mono text-[13px] leading-relaxed text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                        {activeProject.impact}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  {activeProject.highlights.map(
                                    (highlight, index) => (
                                      <motion.div
                                        key={highlight}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          delay: 0.4 + index * 0.1,
                                        }}
                                        className="group flex gap-4"
                                      >
                                        <div className="flex flex-col items-center pt-1">
                                          <ChevronRight className="w-6 h-6 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                          <div className="mt-2 h-full w-px bg-zinc-900 group-hover:bg-emerald-500/10 transition-colors" />
                                        </div>

                                        <div className="flex flex-col gap-1.5 pb-2">
                                          <p className="max-w-xl font-mono text-[13px] leading-relaxed text-zinc-400 opacity-90 group-hover:text-zinc-200 group-hover:opacity-100 transition-all">
                                            {highlight}
                                          </p>
                                        </div>
                                      </motion.div>
                                    ),
                                  )}
                                </div>

                                <div className="space-y-4">
                                  <ProjectSectionLabel>
                                    Stack
                                  </ProjectSectionLabel>
                                  <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
                                    {activeProject.tech.map((tech, index) => (
                                      <motion.div
                                        key={tech}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                          delay: 0.6 + index * 0.05,
                                        }}
                                        className="group flex items-center gap-2"
                                      >
                                        <span className="font-mono text-xs text-emerald-500/30 transition-colors group-hover:text-emerald-500">
                                          #
                                        </span>
                                        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-600 transition-colors group-hover:text-zinc-300">
                                          {tech}
                                        </span>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-6">
                                {activeProject.presentation ===
                                "media-first" ? (
                                  <ProjectMediaPanel
                                    project={activeProject}
                                    selectedImageIndex={activeProjectImageIndex}
                                    onSelectImage={setActiveProjectImageIndex}
                                  />
                                ) : (
                                  <div className="space-y-10">
                                    {/* Process Architecture Visual */}
                                    <div className="overflow-hidden rounded-[2rem] border border-emerald-500/10 bg-zinc-950/50 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:border-emerald-500/20">
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
                                            <div className="flex-1 rounded-2xl bg-zinc-900/10 px-6 py-5 transition-all duration-300 group-hover/line:bg-emerald-500/[0.03]">
                                              <div className="flex items-center justify-between gap-4">
                                                <span className="font-mono text-[13px] leading-relaxed text-zinc-300 group-hover/line:text-zinc-100 transition-colors">
                                                  <span className="text-emerald-500/40 mr-3">
                                                    0{idx + 1}_
                                                  </span>
                                                  {line}
                                                </span>
                                              </div>
                                            </div>
                                          </motion.div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Project Context Boxes - Refactored for consistency */}
                                    <div className="grid gap-8 md:grid-cols-2 px-2">
                                      {/* Focus Areas */}
                                      <div className="group relative flex gap-4">
                                        <div className="flex flex-col items-center pt-1">
                                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all duration-500">
                                            <Target className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                          </div>
                                          <div className="mt-4 h-full w-px bg-zinc-900 group-hover:bg-emerald-500/10 transition-colors" />
                                        </div>
                                        <div className="flex flex-col gap-2 pb-4">
                                          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60 transition-colors">
                                            CORE_FOCUS_AREAS
                                          </span>
                                          <p className="max-w-xl font-mono text-[13px] leading-relaxed text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                            {activeProject.focusAreas ??
                                              "Core product mechanics, UX loops and key user interactions."}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Delivery Scope */}
                                      <div className="group relative flex gap-4">
                                        <div className="flex flex-col items-center pt-1">
                                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all duration-500">
                                            <Layers className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                          </div>
                                          <div className="mt-4 h-full w-px bg-zinc-900 group-hover:bg-emerald-500/10 transition-colors" />
                                        </div>
                                        <div className="flex flex-col gap-2 pb-4">
                                          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60 transition-colors">
                                            DELIVERY_SCOPE
                                          </span>
                                          <p className="max-w-xl font-mono text-[13px] leading-relaxed text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                            {activeProject.deliveryScope ??
                                              "End-to-end implementation from architecture to production deployment."}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.section>
                        </AnimatePresence>
                      </div>
                    )}

                    {activeView === "contact" && (
                      <div className="w-full space-y-10 pb-8">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-emerald-500">$</span>
                            <span className="text-zinc-300">
                              init secure-channel --handshake
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-600">
                            Secure relay online. Preferred channels mounted and
                            ready... [OK]
                          </div>
                        </div>

                        <div className="grid gap-12 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
                          <AnimatedContactAvatar
                            isExternallyHovered={isContactCardHovered}
                          />

                          {/* Right Column: Content & Channels */}
                          <div className="flex flex-col justify-center space-y-10">
                            <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="h-px w-8 bg-emerald-500/30" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-emerald-500/60 font-bold">
                                  outbound_comms
                                </span>
                              </div>

                              <h2 className="text-4xl font-bold tracking-tighter text-white md:text-5xl xl:text-6xl leading-none">
                                Let&apos;s build the{" "}
                                <span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8 decoration-2">
                                  future
                                </span>
                                .
                              </h2>

                              <p className="max-w-md text-sm text-zinc-400 font-mono leading-relaxed">
                                Handshake ready. Select a protocol to initiate a
                                direct data link with my system.
                              </p>
                            </div>

                            {/* Terminal Command List */}
                            <div className="grid gap-3">
                              {[
                                {
                                  label: "MAIL",
                                  cmd: "sendmail --to roiner@sys",
                                  value: aboutData.email,
                                  action: `mailto:${aboutData.email}`,
                                  color: "text-blue-400",
                                },
                                {
                                  label: "GITHUB",
                                  cmd: "ssh git@github.com:roiner",
                                  value: "github.com/Roiner994",
                                  action: "https://github.com/Roiner994",
                                  color: "text-purple-400",
                                },
                                {
                                  label: "LINKEDIN",
                                  cmd: "connect --relay linkedin",
                                  value: "linkedin.com/in/roiner",
                                  action:
                                    "https://linkedin.com/in/roiner-hernandez-6701b212a",
                                  color: "text-emerald-400",
                                },
                              ].map((item, i) => (
                                <motion.a
                                  key={item.label}
                                  href={item.action}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.4 + i * 0.1 }}
                                  onHoverStart={() =>
                                    setIsContactCardHovered(true)
                                  }
                                  onHoverEnd={() =>
                                    setIsContactCardHovered(false)
                                  }
                                  className="group relative flex items-center gap-4 overflow-hidden rounded-lg border border-zinc-800/50 bg-zinc-900/10 px-4 py-3 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/[0.03]"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                      <span
                                        className={`font-mono text-[9px] font-black tracking-widest ${item.color} bg-white/5 px-1.5 py-0.5 rounded`}
                                      >
                                        {item.label}
                                      </span>
                                      <span className="font-mono text-[10px] text-zinc-600 group-hover:text-emerald-500/40 transition-colors">
                                        {item.cmd}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-emerald-500/50 font-mono text-xs font-bold">
                                        $
                                      </span>
                                      <span className="font-mono text-sm text-zinc-300 group-hover:text-white transition-colors truncate">
                                        {item.value}
                                      </span>
                                      <motion.span
                                        animate={{ opacity: [1, 0] }}
                                        transition={{
                                          duration: 0.8,
                                          repeat: Infinity,
                                        }}
                                        className="h-4 w-2 bg-emerald-500/60 hidden group-hover:inline-block"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="font-mono text-[8px] text-emerald-500/60 font-bold uppercase">
                                      EXECUTE
                                    </span>
                                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                  </div>
                                </motion.a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeView === "cv" && (
                      <div className="space-y-12 pb-12">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-emerald-500">$</span>
                            <span className="text-zinc-300">
                              cat /sys/docs/cv_manifest.json --verbose
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-600">
                            Reading system assets... [DONE]
                            <span className="ml-4 text-emerald-500/50">CRC: 0x88F2A</span>
                          </div>
                        </div>

                        <div className="grid xl:grid-cols-[1.3fr_0.7fr] gap-8 items-start">
                          <div className="space-y-8">
                            {/* Main CV Identity Card */}
                            <div className="relative group">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/10 rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                              <div className="relative p-6 md:p-10 bg-zinc-900/60 border border-zinc-800 rounded-[2rem] space-y-8 backdrop-blur-xl">
                                {/* Terminal Window Controls (Decorative) */}
                                <div className="absolute top-6 right-8 flex gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                  <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                      <Briefcase className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-zinc-950 flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">
                                      Curriculum Vitae
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <span className="text-emerald-500 font-mono text-[10px] font-bold uppercase tracking-[0.3em]">
                                        Professional Profile_v8.4
                                      </span>
                                      <div className="h-px w-8 bg-zinc-800" />
                                      <span className="text-zinc-500 font-mono text-[9px] uppercase">
                                        SECURE_ID: RH-{new Date().getFullYear()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Language Proficiency Section */}
                                <div className="space-y-4 pt-2">
                                  <div className="flex items-center gap-3">
                                    <ProjectSectionLabel>Language protocols</ProjectSectionLabel>
                                    <div className="h-px flex-1 bg-zinc-800/40" />
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    {cvData.languages.map((lang, idx) => (
                                      <div 
                                        key={idx}
                                        className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-zinc-800 rounded-xl hover:border-emerald-500/30 transition-colors group/lang"
                                      >
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 group-hover/lang:bg-emerald-500 transition-colors" />
                                        <span className="font-mono text-xs text-zinc-300">{lang.label}</span>
                                        <span className="text-zinc-700 font-mono text-[10px]">::</span>
                                        <span className="font-mono text-[10px] font-bold text-emerald-500/60 group-hover/lang:text-emerald-500 transition-colors uppercase tracking-widest">{lang.level}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Professional Summaries */}
                                <div className="grid md:grid-cols-2 gap-6 pt-4">
                                  <div className="relative group/card flex flex-col">
                                    <div className="absolute -top-3 -left-2 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-mono text-[9px] font-black text-emerald-500/80 z-10 shadow-lg">
                                      DATA_DUMP [ES]
                                    </div>
                                    <div className="flex-1 p-6 bg-black/40 border border-zinc-800/60 rounded-2xl group-hover/card:border-emerald-500/20 transition-all duration-500 relative overflow-hidden">
                                      <div className="absolute top-0 right-0 p-2 opacity-5 group-hover/card:opacity-10 transition-opacity">
                                        <Languages className="w-12 h-12 text-white" />
                                      </div>
                                      <p className="text-[13px] text-zinc-400 leading-relaxed font-mono relative z-10">
                                        {cvData.summaryEs}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="relative group/card flex flex-col">
                                    <div className="absolute -top-3 -left-2 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-mono text-[9px] font-black text-emerald-500/80 z-10 shadow-lg">
                                      DATA_DUMP [EN]
                                    </div>
                                    <div className="flex-1 p-6 bg-black/40 border border-zinc-800/60 rounded-2xl group-hover/card:border-emerald-500/20 transition-all duration-500 relative overflow-hidden">
                                      <div className="absolute top-0 right-0 p-2 opacity-5 group-hover/card:opacity-10 transition-opacity">
                                        <Languages className="w-12 h-12 text-white" />
                                      </div>
                                      <p className="text-[13px] text-zinc-400 leading-relaxed font-mono relative z-10">
                                        {cvData.summaryEn}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-8">
                            <div className="space-y-6">
                             {/* Download panel */}
                             <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-6 relative overflow-hidden group/actions">

                               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_40%)]" />
                               
                               <div className="space-y-3 relative">
                                 <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                                     <span className="font-mono text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Asset Terminal</span>
                                   </div>
                                   <span className="font-mono text-[10px] text-zinc-700 font-bold">v1.0.4</span>
                                 </div>
                                 <p className="text-[12px] text-zinc-600 font-mono italic">
                                   Select manifest to initialize download protocol.
                                 </p>
                               </div>

                               <div className="space-y-4 relative">
                                 {cvData.downloads.map((file, i) => (
                                   <a
                                     key={file.href}
                                     href={file.href}
                                     download
                                     className="group/dl block relative"
                                   >
                                     <div className="flex items-center justify-between px-5 py-3 bg-black/40 border border-zinc-800 rounded-xl group-hover/dl:border-emerald-500/50 group-hover/dl:bg-emerald-500/[0.02] transition-all duration-300">
                                       <div className="flex items-center gap-4">
                                          <Download className="w-4 h-4 text-zinc-600 group-hover/dl:text-emerald-500 transition-colors" />
                                          <span className="font-mono text-xs font-bold text-zinc-400 group-hover/dl:text-emerald-500 uppercase tracking-widest">
                                            {file.label}
                                          </span>
                                       </div>
                                       <ArrowUpRight className="w-4 h-4 text-zinc-800 group-hover/dl:text-emerald-500 transition-all" />
                                     </div>
                                   </a>
                                 ))}
                               </div>

                               <div className="grid grid-cols-2 gap-4 pt-2 relative">
                                  <div className="px-4 py-2 bg-black/40 border border-zinc-800 rounded-lg flex items-center justify-between group/meta transition-colors hover:border-zinc-700">
                                    <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Format</span>
                                    <span className="text-[10px] text-zinc-400 font-bold font-mono">PDF/A-1</span>
                                  </div>
                                  <div className="px-4 py-2 bg-black/40 border border-zinc-800 rounded-lg flex items-center justify-between group/meta transition-colors hover:border-zinc-700">
                                    <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Access</span>
                                    <span className="text-[10px] text-zinc-400 font-bold font-mono">PUBLIC</span>
                                  </div>
                               </div>
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                    )}
                    {activeView !== "terminal" && activeView !== "projects" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: false, amount: 0.1 }}
                        onClick={handleNext}
                        className={`cursor-pointer group/prompt inline-block w-full relative z-10 ${
                          activeView === "contact" || activeView === "cv"
                            ? "mt-8 mb-6 self-start"
                            : "mt-8 mb-12"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-white/40 font-mono text-sm group-hover/prompt:text-white/80 transition-colors">
                          <span className="group-hover/prompt:text-emerald-500 transition-colors">
                            $
                          </span>
                          <span>
                            {usesTouchNavigationCopy ? (
                              activeView === "cv" ? (
                                "Toca aqui para entrar al modo ai"
                              ) : (
                                "Toca aqui para ir a la siguiente seccion"
                              )
                            ) : (
                              <>
                                Presiona{" "}
                                <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 group-hover/prompt:border-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                  ENTER
                                </span>{" "}
                                para{" "}
                                {activeView === "cv"
                                  ? "abrir modo ai"
                                  : viewOrder.indexOf(activeView as any) !==
                                        -1 &&
                                      viewOrder.indexOf(activeView as any) <
                                        viewOrder.length - 1
                                    ? "continuar"
                                    : "finalizar"}
                              </>
                            )}
                          </span>
                          <div className="w-2 h-4 bg-white/40 group-hover/prompt:bg-emerald-500 shrink-0" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terminal Status Bar for Expanded View */}
              <div className="border-t border-zinc-800/50 bg-black/60 px-4 py-3 font-mono text-[10px] sm:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="flex gap-4 text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-500/50">L</span>{" "}
                        {activeView === "about" ? "1" : "124"}
                      </div>
                      <div className="flex items-center gap-1.5 uppercase tracking-widest">
                        UTF-8
                      </div>
                    </div>

                    {/* Quick Navigation Commands */}
                    <div className="flex min-w-0 flex-wrap items-center gap-2 border-t border-zinc-800 pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0 lg:pl-6">
                      <span className="text-zinc-600 shrink-0">GOTO:</span>
                      {commands.map((cmd) => (
                        <button
                          key={cmd}
                          onClick={() => handleCommand(cmd)}
                          className={`
                              px-2 py-0.5 rounded transition-colors shrink-0
                              ${activeView === cmd ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}
                            `}
                        >
                          {cmd.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={closeExpanded}
                    className="flex items-center gap-2 self-start px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-all rounded group lg:self-auto"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform">
                      ←
                    </span>
                    RETURN_TO_SHELL
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  if (isExpanded && typeof document !== "undefined") {
    return createPortal(
      <div
        className={`fixed inset-0 z-[140] h-screen w-screen bg-zinc-950 ${usesProjectSplitScroll ? "overflow-hidden" : "overflow-y-auto"}`}
      >
        {panel}
      </div>,
      document.body,
    );
  }

  return <div className="relative w-full min-h-[580px]">{panel}</div>;
}
