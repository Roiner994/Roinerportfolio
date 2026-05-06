import { motion } from 'motion/react';
import { Terminal, FileText, FolderOpen } from 'lucide-react';
import { NeuralBackground } from './NeuralBackground';
import { TerminalPanel } from './TerminalPanel';

export function HeroVariant1() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex items-center">
      {/* Neural network background */}
      <NeuralBackground />

      {/* Gradient overlays */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-20" />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Text content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Name badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm text-cyan-300 font-mono">System Online</span>
          </motion.div>

          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-7xl font-bold">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Roiner
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                Hernandez
              </span>
            </h1>

            <p className="text-2xl text-slate-300 font-light">
              Full Stack Software Engineer
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
            Building scalable web, mobile, backend, and AI-powered workflows.
            Transforming complex challenges into elegant solutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-white overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Open Terminal
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-cyan-500/50 rounded-xl font-medium text-slate-200 hover:text-white transition-all flex items-center gap-2"
            >
              <FolderOpen className="w-5 h-5" />
              View Projects
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-cyan-500/50 rounded-xl font-medium text-slate-200 hover:text-white transition-all flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Download CV
            </motion.button>
          </div>

          {/* Tech stack preview */}
          <div className="pt-6 space-y-3">
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Core Stack</p>
            <div className="flex flex-wrap gap-2">
              {['React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'AI/ML'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right side - Terminal */}
        <div className="relative">
          <TerminalPanel />
        </div>
      </div>
    </div>
  );
}
