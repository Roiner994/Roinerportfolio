import { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, FileText, FolderOpen, Cpu, Zap, Code2, Monitor, Layers, Hash } from 'lucide-react';
import { NeuralBackground } from './NeuralBackground';
import { TerminalPanel } from './TerminalPanel';
import { HeroNameTreatment } from './HeroNameTreatment';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function HeroVariant3() {
  const { t } = useLanguage();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden overflow-y-hidden bg-zinc-950">
      {/* Large neural network background */}
      <NeuralBackground />

      {/* Multiple gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-3xl" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

      {/* Main content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6">
        <div className="flex flex-1 items-start py-10 sm:py-12 lg:items-center">
          <div className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left side - Text content (spans 6 columns) */}
            <div className="min-w-0 space-y-6 sm:space-y-8 lg:col-span-6">
              {/* System status */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex flex-wrap items-center gap-3 sm:gap-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-300 font-mono sm:text-sm">{t('SYSTEM_ACTIVE')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 sm:text-sm">
                  <Zap className="w-4 h-4" />
                  v1.1.0
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
                  <div className="hidden h-px w-12 bg-gradient-to-r from-emerald-500/50 to-transparent sm:block" />
                  <p className="text-lg font-light text-zinc-300 sm:text-xl">
                    {t('HERO_TITLE')}
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/50 to-transparent" />
                </motion.div>
              </div>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
              >
                {t('HERO_SUBTITLE')}
              </motion.p>

              {/* Feature highlights - Minimalist version */}
              <div className="grid grid-cols-2 gap-4 pt-2 sm:flex sm:flex-wrap sm:items-center sm:gap-8 sm:pt-4">
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
                      <span className="text-[10px] text-emerald-500/50 font-mono uppercase tracking-[0.2em] leading-none mb-1">{t('EXPERTISE')}</span>
                      <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">{item.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right side - Floating terminal panel (spans 6 columns) */}
            <div className="relative flex min-w-0 items-center lg:col-span-6 lg:h-full lg:translate-y-10">
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
                className="relative w-full min-w-0"
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
          className="border-t border-zinc-800/50 pb-10 pt-6 sm:pb-12 sm:pt-8"
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
