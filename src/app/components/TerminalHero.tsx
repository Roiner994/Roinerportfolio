import { useState, useEffect } from 'react';
import { Terminal, Code, Briefcase } from 'lucide-react';

interface TerminalHeroProps {
  scrollProgress: number;
}

export function TerminalHero({ scrollProgress }: TerminalHeroProps) {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = `> Hola! Soy [Tu Nombre]\n> Full Stack Developer\n> Construyendo experiencias digitales innovadoras...\n> _`;

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>

      {/* Terminal Window */}
      <div
        className="relative z-10 w-[90%] max-w-4xl"
        style={{
          transform: `scale(${1 + scrollProgress * 2})`,
          opacity: 1 - scrollProgress,
        }}
      >
        {/* Window Header */}
        <div className="bg-zinc-800 rounded-t-lg border border-zinc-700 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
          <div className="flex items-center gap-2 ml-4 text-zinc-400 text-sm">
            <Terminal className="w-4 h-4" />
            <span>portfolio.tsx</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="bg-zinc-900/95 backdrop-blur-sm border border-t-0 border-zinc-700 rounded-b-lg p-8 min-h-[400px] font-mono">
          <div className="space-y-2">
            {displayedText.split('\n').map((line, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-emerald-500">{line}</span>
              </div>
            ))}
          </div>

          {/* Command suggestions */}
          <div className="mt-8 pt-8 border-t border-zinc-800 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer">
              <Code className="w-5 h-5" />
              <span className="text-sm">Ver proyectos</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer">
              <Briefcase className="w-5 h-5" />
              <span className="text-sm">Experiencia</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer">
              <Terminal className="w-5 h-5" />
              <span className="text-sm">Contacto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-500 text-sm animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <span>Scroll para explorar</span>
          <div className="w-6 h-10 border-2 border-zinc-500 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-zinc-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
