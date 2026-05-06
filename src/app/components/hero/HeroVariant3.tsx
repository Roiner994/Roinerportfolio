import { motion } from 'motion/react';
import { Terminal, FileText, FolderOpen, Cpu, Zap, Code2 } from 'lucide-react';
import { NeuralBackground } from './NeuralBackground';
import { TerminalPanel } from './TerminalPanel';

export function HeroVariant3() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden flex items-center">
      {/* Large neural network background */}
      <NeuralBackground />

      {/* Multiple gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-500/15 rounded-full blur-3xl opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left side - Text content (spans 6 columns) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-8"
          >
            {/* System status */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-300 font-mono">Neural System Active</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-mono">
                <Zap className="w-4 h-4" />
                v1.0.0
              </div>
            </motion.div>

            {/* Main heading */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight">
                <span className="block bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Roiner
                </span>
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Hernandez
                </span>
              </h1>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                <p className="text-xl text-slate-300 font-light whitespace-nowrap">
                  Full Stack Software Engineer
                </p>
                <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/50 to-transparent" />
              </div>
            </div>

            {/* Description */}
            <p className="text-lg text-slate-400 leading-relaxed">
              Building scalable web, mobile, backend, and AI-powered workflows.
              Architecting intelligent systems that solve real-world challenges
              with precision and innovation.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Code2, label: 'Full Stack' },
                { icon: Cpu, label: 'AI/ML' },
                { icon: Zap, label: 'Performance' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl"
                >
                  <item.icon className="w-6 h-6 text-cyan-400" />
                  <span className="text-sm text-slate-300 font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-white overflow-hidden shadow-lg shadow-cyan-500/25"
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
          </motion.div>

          {/* Right side - Floating terminal panel (spans 6 columns) */}
          <div className="lg:col-span-6 relative">
            {/* Ambient glow behind terminal */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-3xl scale-105" />

            <motion.div
              initial={{ opacity: 0, x: 30, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <TerminalPanel variant="floating" />
            </motion.div>

            {/* Floating tech badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute -left-8 top-1/4 px-4 py-2 bg-slate-800/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg text-sm text-cyan-300 font-mono shadow-lg shadow-cyan-500/10"
            >
              TypeScript
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="absolute -right-8 top-2/3 px-4 py-2 bg-slate-800/80 backdrop-blur-xl border border-violet-500/30 rounded-lg text-sm text-violet-300 font-mono shadow-lg shadow-violet-500/10"
            >
              AI Powered
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="absolute left-1/4 -bottom-6 px-4 py-2 bg-slate-800/80 backdrop-blur-xl border border-blue-500/30 rounded-lg text-sm text-blue-300 font-mono shadow-lg shadow-blue-500/10"
            >
              Cloud Native
            </motion.div>
          </div>
        </div>

        {/* Bottom tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-20 pt-12 border-t border-slate-800"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'GraphQL', 'TensorFlow', 'FastAPI'].map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.05 }}
                className="px-3 py-1.5 bg-slate-800/30 border border-slate-700/30 rounded-lg text-xs text-slate-400 font-mono backdrop-blur-sm hover:border-cyan-500/30 hover:text-cyan-300 transition-all cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
