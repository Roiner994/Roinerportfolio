import { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, FileText, FolderOpen, Cpu, Zap, Code2, Monitor, Layers, Hash } from 'lucide-react';
import { NeuralBackground } from './NeuralBackground';
import { TerminalPanel } from './TerminalPanel';
import { HeroNameTreatment } from './HeroNameTreatment';

export function HeroVariant3() {
  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-hidden flex flex-col">
      {/* Large neural network background */}
      <NeuralBackground />

      {/* Multiple gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-3xl" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-6 w-full">
        <div className="flex-1 flex items-center">
          <div className="grid lg:grid-cols-12 gap-12 items-center w-full">
            {/* Left side - Text content (spans 6 columns) */}
            <div className="lg:col-span-6 space-y-8">
              {/* System status */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex items-center gap-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300 font-mono">Neural System Active</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-sm font-mono">
                  <Zap className="w-4 h-4" />
                  v1.0.2
                </div>
              </motion.div>

              {/* Main heading */}
              <div className="space-y-6">
                <HeroNameTreatment />

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-px w-12 bg-gradient-to-r from-emerald-500/50 to-transparent" />
                  <p className="text-xl text-zinc-300 font-light whitespace-nowrap">
                    Ingeniero de Software Full Stack
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/50 to-transparent" />
                </motion.div>
              </div>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="text-lg text-zinc-400 leading-relaxed max-w-xl"
              >
                Más de 8 años de experiencia construyendo soluciones web y móviles escalables. 
                Especializado en transformar problemas ambiguos en productos funcionales 
                de extremo a extremo.
              </motion.p>

              {/* Feature highlights - Minimalist version */}
              <div className="flex items-center gap-8 pt-4">
                {[
                  { icon: Code2, label: 'Full Stack' },
                  { icon: Cpu, label: 'AI/ML' },
                  { icon: Zap, label: 'Performance' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 + i * 0.1 }}
                    className="flex items-center gap-3 group pointer-events-none"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <item.icon className="w-5 h-5 text-emerald-400/70" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-emerald-500/50 font-mono uppercase tracking-[0.2em] leading-none mb-1">Expertise</span>
                      <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">{item.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right side - Floating terminal panel (spans 6 columns) */}
            <div className="lg:col-span-6 relative flex items-center h-full lg:translate-y-10">
              {/* Ambient glow behind terminal */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 1.2 }}
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-3xl blur-3xl scale-105" 
              />

              <motion.div
                initial={{ opacity: 0, x: 50, rotate: 2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ 
                  duration: 1, 
                  delay: 0.4,
                  type: "spring",
                  stiffness: 50,
                  damping: 20
                }}
                className="relative w-full"
              >
                <TerminalPanel variant="floating" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="pb-12 border-t border-zinc-800/50 pt-8"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Next.js', 'React Native', 'Node.js', 'TypeScript', 'Python', 'FastAPI', 'GraphQL', 'AWS', 'Docker', 'Firebase', 'n8n'].map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.05 }}
                className="px-3 py-1.5 bg-zinc-800/30 border border-zinc-700/30 rounded-lg text-xs text-zinc-400 font-mono backdrop-blur-sm hover:border-emerald-500/30 hover:text-emerald-300 transition-all cursor-default"
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
