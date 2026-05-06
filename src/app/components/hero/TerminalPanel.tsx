import { useState, useEffect } from 'react';
import { Terminal, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const commands = [
  'experience',
  'projects',
  'stack',
  'ai',
  'contact',
  'cv'
];

interface TerminalPanelProps {
  variant?: 'default' | 'floating' | 'centered';
}

export function TerminalPanel({ variant = 'default' }: TerminalPanelProps) {
  const [bootSequence, setBootSequence] = useState(0);
  useEffect(() => {
    const sequences = [
      'Loading profile...',
      'Loading experience...',
      'Loading projects...',
      'Loading AI workflows...',
    ];

    if (bootSequence < sequences.length) {
      // Randomized delay for more organic feel
      const delay = 300 + Math.random() * 500;
      const timer = setTimeout(() => {
        setBootSequence(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [bootSequence]);

  const bootMessages = [
    'Loading profile... done',
    'Loading experience... done',
    'Loading projects... done',
    'Loading AI workflows... done',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`
        relative backdrop-blur-xl border rounded-2xl overflow-hidden w-full min-h-[520px]
        ${variant === 'floating' ? 'shadow-2xl shadow-emerald-500/10' : ''}
        ${variant === 'centered' ? 'max-w-4xl mx-auto' : ''}
      `}
      style={{
        background: 'rgba(9, 9, 11, 0.95)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 rounded-2xl blur opacity-30" />

      {/* Terminal header */}
      <div className="relative border-b border-zinc-800 px-5 py-3 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Terminal className="w-4 h-4" />
            <span className="text-sm font-mono">RoinerOS v1.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-mono">AI Assistant</span>
        </div>
      </div>

      {/* Terminal content */}
      <div className="relative p-6 font-mono text-sm">
        {/* Boot sequence */}
        <div className="mb-6 space-y-1">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-emerald-400 mb-2 flex items-center gap-2"
          >
            <span className="text-emerald-500/50">$</span>
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "auto" }}
              transition={{ duration: 1, ease: "steps(20)" }}
              className="overflow-hidden whitespace-nowrap"
            >
              initialize_portfolio
            </motion.span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-2 h-4 bg-emerald-500"
            />
          </motion.div>
          
          {bootMessages.slice(0, bootSequence).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-zinc-500 flex items-center gap-3"
            >
              <span className="text-[10px] text-zinc-700">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span>{msg}</span>
            </motion.div>
          ))}
        </div>

        {/* AI greeting */}
        {bootSequence >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 20
              }}
              className="flex items-start gap-3 p-4 bg-zinc-950/50 rounded-lg border border-emerald-500/20"
            >
              <motion.div 
                animate={{ 
                  boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 10px rgba(16, 185, 129, 0.3)", "0 0 0px rgba(16, 185, 129, 0)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold flex-shrink-0"
              >
                A
              </motion.div>
              <div className="space-y-2">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-zinc-200"
                >
                  Hi, I'm Roiner's portfolio assistant.
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-zinc-400 text-xs"
                >
                  Type "help" or choose a topic below.
                </motion.p>
              </div>
            </motion.div>

            {/* Command chips */}
            <div className="pt-2">
              <div className="text-xs text-zinc-500 mb-3">Quick commands:</div>
              <div className="grid grid-cols-3 gap-2">
                {commands.map((cmd, i) => (
                  <motion.button
                    key={cmd}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 bg-black/30 hover:bg-zinc-800/50 border border-zinc-800 hover:border-emerald-500/50 rounded-lg text-zinc-300 hover:text-emerald-400 transition-all text-xs"
                  >
                    {cmd}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
