import {
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * "ask-roiner" — Claude Code style AI terminal used when TerminalPanel is in
 * AI mode. Purely presentational: conversation state, /api/chat and commands
 * stay in TerminalPanel (onSubmit === handleAiCommand).
 */

export type AiChatRole = "assistant" | "user" | "system";
export type AiChatMessage = { id: string; role: AiChatRole; content: string };
export type AiSlashCommand = { name: string; desc: string };

// VS15 (\uFE0E) forces text presentation so these never render as emoji.
const DOT = "\u23FA\uFE0E"; // ⏺
const SPINNER = ["\u00B7", "\u273B", "\u2722", "\u2733\uFE0E"]; // · ✻ ✢ ✳

const ROINER_ASCII = [
  "█▀█ █▀█ █ █▄ █ █▀▀ █▀█",
  "█▀▄ █▄█ █ █ ▀█ ██▄ █▀▄",
].join("\n");

const STRINGS = {
  en: {
    welcome: "Welcome to",
    intro: "Ask me about Roiner's projects, stack, experience or availability",
    try: "Try asking",
    thinking: "Thinking…",
    hints: ["? for shortcuts", "/ for commands", "esc to exit"],
    shortcuts: [
      ["/", "commands"],
      ["↑ ↓", "pick a suggestion · enter to ask"],
      ["1-6", "ask a suggested question"],
      ["tab", "complete a command"],
      ["esc", "clear input · exit AI mode"],
      ["ctrl+c", "exit AI mode"],
    ],
    noMatch: "no matching commands",
  },
  es: {
    welcome: "Bienvenido a",
    intro: "Pregúntame por los proyectos, stack, experiencia o disponibilidad de Roiner",
    try: "Prueba a preguntar",
    thinking: "Pensando…",
    hints: ["? atajos", "/ comandos", "esc para salir"],
    shortcuts: [
      ["/", "comandos"],
      ["↑ ↓", "elegir sugerencia · enter para preguntar"],
      ["1-6", "preguntar una sugerencia"],
      ["tab", "completar comando"],
      ["esc", "borrar entrada · salir del modo IA"],
      ["ctrl+c", "salir del modo IA"],
    ],
    noMatch: "ningún comando coincide",
  },
} as const;

export interface AiTerminalViewProps {
  lang: "en" | "es";
  messages: AiChatMessage[];
  isThinking: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (value: string) => void;
  onExit: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  suggestedQuestions: string[];
  slashCommands: AiSlashCommand[];
  placeholder: string;
  Typewriter: ComponentType<{ text: string; speed?: number; onTick?: () => void }>;
  onTypingTick?: () => void;
  footer?: ReactNode;
}

function ThinkingLine({ label }: { label: string }) {
  const [frame, setFrame] = useState(0);
  const [startedAt] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setFrame((f) => f + 1), 160);
    return () => window.clearInterval(id);
  }, []);
  const seconds = Math.floor((Date.now() - startedAt) / 1000);
  return (
    <div data-ai-thinking className="flex items-baseline gap-2 text-emerald-400">
      <span className="inline-block w-[1ch] text-center">
        {SPINNER[frame % SPINNER.length]}
      </span>
      <span className="text-[#00d492]">{label}</span>
      <span className="text-zinc-600">({seconds}s)</span>
    </div>
  );
}

export function AiTerminalView({
  lang,
  messages,
  isThinking,
  inputValue,
  setInputValue,
  onSubmit,
  onExit,
  inputRef,
  scrollRef,
  suggestedQuestions,
  slashCommands,
  placeholder,
  Typewriter,
  onTypingTick,
  footer,
}: AiTerminalViewProps) {
  const s = STRINGS[lang] ?? STRINGS.en;
  const [suggestIndex, setSuggestIndex] = useState(-1);
  const [slashIndex, setSlashIndex] = useState(0);

  const showSuggestions =
    !isThinking && !messages.some((m) => m.role !== "assistant" || m.id !== "ai-welcome");
  const isSlash = inputValue.startsWith("/") && !inputValue.includes(" ");
  const showShortcuts = inputValue === "?";

  const slashMatches = useMemo(() => {
    if (!isSlash) return [];
    const q = inputValue.slice(1).toLowerCase();
    return slashCommands.filter((c) => c.name.startsWith(q));
  }, [isSlash, inputValue, slashCommands]);

  // Focus the prompt on mount (the view mounts after AnimatePresence's exit,
  // so the parent's focus effect has already run) and again after a reply.
  useEffect(() => {
    if (!isThinking) inputRef.current?.focus({ preventScroll: true });
  }, [isThinking, inputRef]);

  useEffect(() => setSlashIndex(0), [inputValue]);
  useEffect(() => {
    if (!showSuggestions) setSuggestIndex(-1);
  }, [showSuggestions]);

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  const submit = (value: string) => {
    if (!value.trim()) return;
    setSuggestIndex(-1);
    onSubmit(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      onExit();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (inputValue) setInputValue("");
      else if (suggestIndex >= 0) setSuggestIndex(-1);
      else onExit();
      return;
    }
    if (isSlash && slashMatches.length > 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const d = e.key === "ArrowDown" ? 1 : -1;
        setSlashIndex((i) => (i + d + slashMatches.length) % slashMatches.length);
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        setInputValue(`/${slashMatches[slashIndex]?.name ?? slashMatches[0].name}`);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        const pick = slashMatches[slashIndex] ?? slashMatches[0];
        submit(`/${pick.name}`);
        return;
      }
    }
    if (e.key === "Tab") {
      e.preventDefault();
      return;
    }
    if (showSuggestions && !inputValue) {
      const n = suggestedQuestions.length;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const d = e.key === "ArrowDown" ? 1 : -1;
        setSuggestIndex((i) => (i < 0 ? (d > 0 ? 0 : n - 1) : (i + d + n) % n));
        return;
      }
      if (/^[1-9]$/.test(e.key) && Number(e.key) <= n) {
        e.preventDefault();
        submit(suggestedQuestions[Number(e.key) - 1]);
        return;
      }
      if (e.key === "Enter" && suggestIndex >= 0) {
        e.preventDefault();
        e.stopPropagation();
        submit(suggestedQuestions[suggestIndex]);
        return;
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (showShortcuts) return;
      submit(inputValue);
    }
  };

  return (
    <div
      data-ai-terminal
      className="flex h-full min-h-0 w-full flex-col bg-[#09090b] font-mono text-[13px] leading-relaxed text-zinc-300"
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      <div
        id="out"
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-5 pb-4 pt-6 sm:px-8">
          {/* Banner */}
          <div className="flex flex-col items-start gap-4">
            <pre
              aria-label="ROINER"
              className="hidden select-none whitespace-pre font-mono text-[13px] leading-[1.05] text-[#00bc7d] sm:block lg:text-[16px]"
            >
              {ROINER_ASCII}
            </pre>
            <div
              data-ai-banner
              className="max-w-full rounded-lg border border-[#00bc7d]/45 px-4 py-3 sm:min-w-[26rem]"
            >
              <div className="text-zinc-200">
                <span className="mr-2 text-[#00d492]">{SPINNER[1]}</span>
                {s.welcome} <span className="font-semibold text-white">ask-roiner</span>
              </div>
              <div className="mt-2 text-xs text-zinc-500">{s.intro}</div>
              <div className="mt-2 text-xs text-zinc-600">
                cwd: <span className="text-zinc-400">~/ai</span>
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div className="flex flex-col gap-3">
            {messages.map((m) => {
              if (m.role === "user") {
                return (
                  <div key={m.id} data-ai-msg="user" className="flex gap-2 text-zinc-500">
                    <span className="shrink-0 select-none">&gt;</span>
                    <span className="min-w-0 whitespace-pre-wrap break-words">{m.content}</span>
                  </div>
                );
              }
              if (m.role === "system") {
                return (
                  <div key={m.id} data-ai-msg="system" className="flex gap-2 pl-[2ch] text-zinc-400">
                    <span className="shrink-0 select-none text-zinc-600">⎿</span>
                    <span className="min-w-0 whitespace-pre-wrap break-words">{m.content}</span>
                  </div>
                );
              }
              return (
                <div key={m.id} data-ai-msg="assistant" className="flex gap-2 text-zinc-100">
                  <span className="shrink-0 select-none text-[#00d492]">{DOT}</span>
                  <span className="min-w-0 whitespace-pre-wrap break-words">
                    {m.id === lastAssistantId ? (
                      <Typewriter text={m.content} speed={12} onTick={onTypingTick} />
                    ) : (
                      m.content
                    )}
                  </span>
                </div>
              );
            })}
            {isThinking && <ThinkingLine label={s.thinking} />}
          </div>

          {/* Suggested questions */}
          {showSuggestions && suggestedQuestions.length > 0 && (
            <div data-ai-suggestions className="mt-1 flex flex-col gap-0.5">
              <div className="mb-1 text-xs text-zinc-600">{s.try}:</div>
              {suggestedQuestions.map((q, i) => {
                const active = i === suggestIndex;
                return (
                  <button
                    key={q}
                    type="button"
                    data-ai-suggestion={i + 1}
                    onMouseEnter={() => setSuggestIndex(i)}
                    onClick={(e) => {
                      e.stopPropagation();
                      submit(q);
                    }}
                    className={`group flex w-fit max-w-full items-baseline gap-2 rounded px-2 py-0.5 text-left transition-colors ${
                      active ? "bg-[#00bc7d]/10 text-[#00d492]" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span className={`w-[1ch] select-none ${active ? "text-[#00d492]" : "text-transparent"}`}>›</span>
                    <span className={active ? "text-[#00d492]" : "text-zinc-600"}>{i + 1}.</span>
                    <span className="min-w-0 break-words">{q}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="mx-auto w-full max-w-4xl px-5 pb-3 pt-1 sm:px-8">
        <div className="relative">
          {isSlash && (
            <div
              data-ai-slash-menu
              className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-zinc-800 bg-[#0c0c0e]/95 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]"
            >
              {slashMatches.length === 0 ? (
                <div className="px-3 py-1 text-zinc-600">{s.noMatch}</div>
              ) : (
                slashMatches.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    onMouseEnter={() => setSlashIndex(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      submit(`/${c.name}`);
                    }}
                    className={`flex w-full items-baseline gap-4 px-3 py-0.5 text-left ${
                      i === slashIndex ? "bg-[#00bc7d]/10 text-[#00d492]" : "text-zinc-400"
                    }`}
                  >
                    <span className="w-[10ch] shrink-0">/{c.name}</span>
                    <span className={i === slashIndex ? "text-emerald-200/70" : "text-zinc-600"}>{c.desc}</span>
                  </button>
                ))
              )}
            </div>
          )}
          <div
            data-ai-input-box
            className="flex items-center gap-2 rounded-lg border border-zinc-700/80 bg-[#0c0c0e] px-3 py-2.5 focus-within:border-[#00bc7d]/60"
          >
            <span className="shrink-0 select-none text-zinc-400">&gt;</span>
            <div className="relative min-w-0 flex-1">
              <input
                id="inp"
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isThinking}
                autoComplete="off"
                spellCheck={false}
                aria-label={placeholder}
                className="w-full bg-transparent text-zinc-100 caret-transparent outline-none disabled:opacity-60"
              />
              {/* Custom block cursor sits right after the typed text; when the
                  input is empty the placeholder starts after the cursor. */}
              <span
                aria-hidden
                data-ai-cursor
                className="pointer-events-none absolute top-1/2 h-[1.15em] w-[0.6em] -translate-y-1/2 bg-[#00d492]"
                style={{
                  left: `${inputValue.length}ch`,
                  animation: "hero-caret-blink 1.05s steps(1) infinite",
                }}
              />
              {!inputValue && (
                <span className="pointer-events-none absolute left-[1.25ch] top-1/2 -translate-y-1/2 truncate pr-2 text-zinc-600" style={{ maxWidth: "calc(100% - 1.25ch)" }}>
                  {placeholder}
                </span>
              )}
            </div>
          </div>
        </div>
        {showShortcuts ? (
          <div className="mt-1.5 grid grid-cols-1 gap-x-8 px-1 text-[11px] text-zinc-500 sm:grid-cols-2">
            {s.shortcuts.map(([k, d]) => (
              <div key={k}>
                <span className="text-zinc-300">{k}</span> <span>{d}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-1.5 px-1 text-[11px] text-zinc-600">{s.hints.join(" · ")}</div>
        )}
      </div>
      {footer}
    </div>
  );
}
