import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { Code2, Database, Palette, Zap, Globe, Cpu, Layout, Terminal, Sparkles } from 'lucide-react';

const skillCategories = [
  {
    icon: Code2,
    title: 'Frontend Development',
    description: 'Construyendo interfaces modernas, rápidas y accesibles con las últimas tecnologías.',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Vue.js', 'Framer Motion'],
    className: 'lg:col-span-2 lg:row-span-2',
    color: 'emerald'
  },
  {
    icon: Database,
    title: 'Backend & Data',
    description: 'Arquitecturas robustas y bases de datos escalables para aplicaciones de alto tráfico.',
    skills: ['Node.js', 'PostgreSQL', 'MongoDB', 'Express', 'Redis', 'GraphQL'],
    className: 'lg:col-span-1 lg:row-span-1',
    color: 'blue'
  },
  {
    icon: Palette,
    title: 'Design System',
    description: 'Diseño centrado en el usuario y estética premium con enfoque en la usabilidad.',
    skills: ['Figma', 'UI/UX', 'Adobe CC', 'Prototyping', 'Design Ops'],
    className: 'lg:col-span-1 lg:row-span-1',
    color: 'purple'
  },
  {
    icon: Cpu,
    title: 'DevOps & Tools',
    description: 'Automatización, infraestructura como código y despliegue continuo eficiente.',
    skills: ['Git', 'Docker', 'CI/CD', 'AWS', 'Linux', 'Vite', 'Kubernetes'],
    className: 'lg:col-span-2 lg:row-span-1',
    color: 'amber'
  }
];

function TypingText({ text, delay = 0 }: { text: string, delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span className="font-mono">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
        className="inline-block w-2 h-4 ml-1 bg-emerald-500 align-middle"
      />
    </span>
  );
}

function SkillCard({ category, index }: { category: typeof skillCategories[0], index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // 3D Tilt transformation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert to range [-0.5, 0.5]
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Icon = category.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative group ${category.className} min-h-[300px] p-8 rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/10 backdrop-blur-md overflow-hidden transition-all duration-700 hover:border-emerald-500/40 hover:bg-zinc-900/30 shadow-2xl`}
    >
      {/* Dynamic Background Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, rgba(16, 185, 129, 0.03) 0%, transparent 70%)`
        }}
      />

      <div className="relative z-10 flex flex-col h-full" style={{ transform: "translateZ(50px)" }}>
        <div className="flex items-start justify-between mb-8">
          <motion.div 
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 text-emerald-500 shadow-xl group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all duration-500"
          >
            <Icon size={32} />
          </motion.div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-mono text-zinc-600 tracking-[0.3em] uppercase">Level 0{index + 1}</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-1 h-1 rounded-full ${i <= (4-index) ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
              ))}
            </div>
          </div>
        </div>

        <h3 className="text-3xl font-bold text-zinc-100 mb-3 tracking-tight group-hover:translate-x-1 transition-transform duration-500">
          {category.title}
        </h3>
        <p className="text-zinc-400 text-sm mb-10 leading-relaxed group-hover:text-zinc-300 transition-colors">
          {category.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-2.5">
          {category.skills.map((skill, i) => (
            <motion.span
              key={skill}
              whileHover={{ 
                scale: 1.1, 
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                borderColor: "rgba(16, 185, 129, 0.4)",
                color: "#34d399"
              }}
              className="px-4 py-2 rounded-xl bg-zinc-800/40 border border-zinc-700/30 text-zinc-400 text-xs font-semibold backdrop-blur-xl transition-all duration-300 cursor-default flex items-center gap-2"
            >
              <div className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-emerald-500 transition-colors" />
              {skill}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Decorative Corner Icon */}
      <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-20 transition-opacity duration-700 rotate-12 group-hover:rotate-0">
        <Icon size={120} />
      </div>
    </motion.div>
  );
}

export function SkillsSection() {
  return (
    <section className="relative min-h-screen bg-zinc-950 py-32 px-6 overflow-hidden perspective-1000">
      {/* Advanced Background effects */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #34d399 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-24 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 text-emerald-500/80 font-mono text-sm bg-emerald-500/5 w-fit px-4 py-2 rounded-full border border-emerald-500/10 shadow-inner"
          >
            <Terminal size={14} className="animate-pulse" />
            <span className="text-zinc-600">~</span>
            <TypingText text="ls --skills ./tech-ecosystem" delay={0.5} />
          </motion.div>
          
          <div className="relative">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-6xl md:text-8xl font-black text-zinc-100 tracking-tighter leading-none"
            >
              Tech <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-500 drop-shadow-2xl">Arsenal</span>
            </motion.h2>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100px" }}
              transition={{ delay: 0.8, duration: 1 }}
              className="h-2 bg-emerald-500/20 mt-4 rounded-full"
            />
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-zinc-500 max-w-2xl text-xl font-medium leading-relaxed"
          >
            Combinando el poder del diseño intuitivo con arquitecturas técnicas robustas para crear experiencias digitales de próxima generación.
          </motion.p>
        </div>

        {/* Bento Grid with 3D Tilt */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, index) => (
            <SkillCard key={category.title} category={category} index={index} />
          ))}
        </div>

        {/* Footer with Floating Elements */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-24 p-10 rounded-[3rem] border border-zinc-900 bg-zinc-900/20 flex flex-wrap items-center justify-between gap-10 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={40} className="text-emerald-500 animate-spin-slow" />
          </div>
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
              <h4 className="text-zinc-100 font-bold text-xl">¿Listo para el siguiente nivel?</h4>
            </div>
            <p className="text-zinc-500 font-medium">Siempre abierto a colaborar en proyectos ambiciosos.</p>
          </div>
          
          <div className="flex gap-12 relative z-10">
            {[
              { label: 'Estrategia', value: '100%' },
              { label: 'Desarrollo', value: '100%' },
              { label: 'Despliegue', value: '100%' }
            ].map(stat => (
              <div key={stat.label} className="group">
                <div className="text-3xl font-black text-emerald-500 mb-1 group-hover:scale-110 transition-transform">{stat.value}</div>
                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
}
