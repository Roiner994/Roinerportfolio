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
      const timer = setTimeout(() => {
        setBootSequence(bootSequence + 1);
      }, 400);
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
        relative backdrop-blur-xl border rounded-2xl overflow-hidden
        ${variant === 'floating' ? 'shadow-2xl shadow-cyan-500/10' : ''}
        ${variant === 'centered' ? 'max-w-4xl mx-auto' : ''}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
        borderColor: 'rgba(56, 189, 248, 0.2)',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-violet-500/20 rounded-2xl blur opacity-50" />

      {/* Terminal header */}
      <div className="relative border-b border-slate-700/50 px-5 py-3 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal className="w-4 h-4" />
            <span className="text-sm font-mono">RoinerOS v1.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-mono">AI Assistant</span>
        </div>
      </div>

      {/* Terminal content */}
      <div className="relative p-6 font-mono text-sm">
        {/* Boot sequence */}
        <div className="mb-6 space-y-1">
          <div className="text-cyan-400 mb-2">&gt; initialize_portfolio</div>
          {bootMessages.slice(0, bootSequence).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-400"
            >
              {msg}
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
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                A
              </div>
              <div className="space-y-2">
                <p className="text-slate-200">
                  Hi, I'm Roiner's portfolio assistant.
                </p>
                <p className="text-slate-400 text-xs">
                  Type "help" or choose a topic below.
                </p>
              </div>
            </div>

            {/* Command chips */}
            <div className="pt-2">
              <div className="text-xs text-slate-500 mb-3">Quick commands:</div>
              <div className="grid grid-cols-3 gap-2">
                {commands.map((cmd, i) => (
                  <motion.button
                    key={cmd}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-slate-300 hover:text-cyan-400 transition-all text-xs"
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
