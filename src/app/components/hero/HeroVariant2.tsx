import { motion } from 'motion/react';
import { Terminal, FileText, FolderOpen, Github, Linkedin, Mail } from 'lucide-react';
import { NeuralBackground } from './NeuralBackground';
import { TerminalPanel } from './TerminalPanel';

export function HeroVariant2() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex items-center">
      {/* Neural network background */}
      <NeuralBackground />

      {/* Centered gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />

      {/* Main content - Centered */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="text-center space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Status badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-sm text-cyan-300 font-mono">RoinerOS Initialized</span>
              </div>
            </div>

            {/* Name */}
            <h1 className="text-7xl lg:text-8xl font-bold">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Roiner Hernandez
              </span>
            </h1>

            {/* Title */}
            <p className="text-3xl text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text font-light">
              Full Stack Software Engineer
            </p>

            {/* Description */}
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Building scalable web, mobile, backend, and AI-powered workflows
              with modern technologies and innovative solutions.
            </p>
          </motion.div>

          {/* Terminal - Main focal point */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <TerminalPanel variant="centered" />
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 pt-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-white overflow-hidden shadow-lg shadow-cyan-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Launch Terminal
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-cyan-500/50 rounded-xl font-medium text-slate-200 hover:text-white transition-all flex items-center gap-2"
            >
              <FolderOpen className="w-5 h-5" />
              View Projects
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-cyan-500/50 rounded-xl font-medium text-slate-200 hover:text-white transition-all flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Download CV
            </motion.button>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center gap-4 pt-8"
          >
            {[
              { icon: Github, href: '#' },
              { icon: Linkedin, href: '#' },
              { icon: Mail, href: '#' },
            ].map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all"
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </motion.div>

          {/* Tech stack */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="pt-12 space-y-4"
          >
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Technology Ecosystem</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'AI/ML', 'GraphQL'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-slate-800/30 border border-slate-700/30 rounded-lg text-sm text-slate-300 font-mono backdrop-blur-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
