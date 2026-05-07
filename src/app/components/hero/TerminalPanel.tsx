import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Terminal, Sparkles, X, Briefcase, Calendar, ChevronRight, Minus, Maximize2, Hash, Download, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const commands = [
  'about',
  'experience',
  'projects',
  'contact',
  'cv',
  'ai'
];

const viewOrder: ('about' | 'experience' | 'projects' | 'contact' | 'cv')[] = ['about', 'experience', 'projects', 'contact', 'cv'];

const experienceData = [
  {
    company: "ucrop.it",
    role: "Full Stack Developer",
    period: "2021 - Present",
    location: "Argentina",
    description: "Arquitectura y desarrollo Full Stack para la plataforma líder en trazabilidad agrícola y sostenibilidad. Implementación de sistemas de inteligencia verificada para análisis de carteras de productores desde riesgos regionales hasta el nivel de parcela individual. Liderazgo técnico en la evolución del producto utilizando React y TypeScript.",
    tech: ["React", "TypeScript", "Node.js", "SQL", "AWS"]
  },
  {
    company: "OvniX | Hello Mundo",
    role: "Scrum Master & Software Architect",
    period: "2019 - 2021",
    location: "Chile",
    description: "Liderazgo técnico en OvniX, el marketplace para Pymes chilenas. Gestión operativa y facilitación entre stakeholders y equipos de ingeniería. Diseño de arquitecturas escalables y consultoría técnica internacional, implementando productos digitales de alto impacto con React Native y Node.js.",
    tech: ["React Native", "Node.js", "Agile", "System Design"]
  },
  {
    company: "KHAPTO",
    role: "React Native Developer",
    period: "2019 - 2020",
    location: "Chile",
    description: "Desarrollo del sistema de medición y registro para kinesiología, integrando hardware con software móvil. Implementación de herramientas para evaluar, analizar y estandarizar procedimientos cinéticos y fuerzas ejercidas para seguimiento clínico objetivo.",
    tech: ["React Native", "IoT", "Mobile Development"]
  },
  {
    company: "ESBrillante | Apreciasoft | Jamit Solution",
    role: "Web Developer",
    period: "2017 - 2019",
    location: "LatAm",
    description: "Desarrollo y mantenimiento de aplicaciones web personalizadas, implementación de funcionalidades frontend y soporte técnico en la construcción de productos digitales modernos para múltiples clientes y agencias en México y Argentina.",
    tech: ["JavaScript", "HTML/CSS", "PHP", "SQL"]
  }
];

const aboutData = {
  name: "Roiner Hernandez",
  title: "Ingeniero de Software Full Stack",
  bio: "Ingeniero de Software Full Stack con más de 8 años de experiencia construyendo soluciones web y móviles escalables. Especializado en transformar problemas ambiguos en productos funcionales de extremo a extremo, conectando interfaces, APIs, bases de datos y lógica de negocio. Sólida experiencia en arquitecturas modernas y desarrollo centrado en el producto.",
  location: "Valencia, Venezuela",
  email: "roiner123@gmail.com",
  specialties: ["Arquitecturas Modernas", "Desarrollo centrado en el producto", "IA & Automación", "Escalabilidad"],
  skills: {
    frontend: ["React", "Next.js", "React Native", "TypeScript", "Tailwind", "GraphQL"],
    backend: ["Node.js", "Python", "FastAPI", "REST APIs", "SQL", "NoSQL", "AWS", "Firebase"],
    tools_ia: ["Git", "Docker", "AI Agents", "MCPs", "n8n", "LLMs"]
  },
  education: "Ingeniería en Informática (UNEG)",
  status: "OPEN_FOR_NEW_PROJECTS",
  projects: [
    {
      name: "Flashcardia",
      description: "App móvil para aprendizaje con flashcards, enfocada en la práctica y retención a largo plazo.",
      tech: ["React Native", "Firebase", "Algorithms"]
    },
    {
      name: "Automatización IA",
      description: "Diseño de flujos complejos con n8n, LLMs y agentes autónomos para automatizar tareas y generación de contenido.",
      tech: ["n8n", "OpenAI", "LangChain", "Python"]
    }
  ]
};

const cvData = {
  summaryEs: "Ingeniero de Software Full Stack con más de 8 años de experiencia construyendo soluciones web y móviles escalables. Especializado en transformar problemas ambiguos en productos funcionales de extremo a extremo, conectando interfaces, APIs, bases de datos y lógica de negocio.",
  summaryEn: "Senior Full Stack Software Engineer with 8+ years of experience building scalable web and mobile products. Skilled at turning complex requirements into end-to-end solutions across frontend, backend, databases, APIs, and AI-powered workflows.",
  languages: [
    { label: 'Español', level: 'Nativo' },
    { label: 'English', level: 'B1 - B2' }
  ],
  downloads: [
    {
      label: 'Descargar CV ES',
      href: '/cv-roiner-hernandez-es.pdf',
      detail: 'PDF oficial en español'
    },
    {
      label: 'Download CV EN',
      href: '/cv-roiner-hernandez-en.pdf',
      detail: 'Official PDF in English'
    }
  ]
};

interface TerminalPanelProps {
  variant?: 'default' | 'floating' | 'centered';
}

export function TerminalPanel({ variant = 'default' }: TerminalPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [activeView, setActiveView] = useState<'terminal' | 'about' | 'experience' | 'projects' | 'contact' | 'cv'>('terminal');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.toLowerCase().trim();
    if (['experience', 'about', 'projects', 'contact', 'cv'].includes(cleanCmd)) {
      setIsExpanded(true);
      setActiveView(cleanCmd as any);
    } else if (cleanCmd === 'ai') {
      // Future AI integration
      setActiveView('terminal');
    } else {
      setActiveView('terminal');
    }
    setInputValue('');
  };

  const handleNext = () => {
    const currentIndex = viewOrder.indexOf(activeView as any);
    if (currentIndex !== -1 && currentIndex < viewOrder.length - 1) {
      handleCommand(viewOrder[currentIndex + 1]);
    } else if (activeView !== 'terminal') {
      closeExpanded();
    }
  };

  const closeExpanded = () => {
    setIsExpanded(false);
    setActiveView('terminal');
  };

  // Lock body scroll and listen for Enter key when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && activeView !== 'terminal') {
          e.preventDefault();
          handleNext();
        }
      };
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleGlobalKeyDown);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isExpanded, activeView, handleNext]);

  const handleTerminalClick = () => {
    if (activeView === 'terminal') {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(inputValue);
    }
  };

  const panel = (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 40,
          mass: 1,
          opacity: { duration: 0.4 }
        }}
        onClick={handleTerminalClick}
        className={`
          backdrop-blur-xl border overflow-hidden cursor-text flex flex-col h-full w-full
          ${variant === 'floating' && !isExpanded ? 'shadow-2xl shadow-emerald-500/10' : ''}
          ${variant === 'centered' && !isExpanded ? 'max-w-4xl mx-auto' : ''}
          ${isExpanded ? 'border-none rounded-none' : 'border-zinc-800 rounded-2xl'}
        `}
        style={{
          background: isExpanded ? 'rgba(9, 9, 11, 1)' : 'rgba(9, 9, 11, 0.98)',
          borderColor: isExpanded ? 'transparent' : 'rgba(16, 185, 129, 0.3)',
        }}
      >
        {/* Ambient glow */}
        <div className={`absolute -inset-[1px] bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 blur opacity-30 pointer-events-none ${isExpanded ? '' : 'rounded-2xl'}`} />

        {/* Terminal header */}
        <div className="relative border-b border-zinc-800 px-5 py-3 flex items-center justify-between bg-black/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-2 group/controls">
              <button 
                onClick={(e) => { e.stopPropagation(); closeExpanded(); }}
                className="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/10 flex items-center justify-center transition-all hover:brightness-110 shadow-[0_0_8px_rgba(255,95,86,0.2)]"
              >
                <X className="w-2 h-2 text-black/60 opacity-0 group-hover/controls:opacity-100 transition-opacity" strokeWidth={3} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); closeExpanded(); }}
                className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/10 flex items-center justify-center transition-all hover:brightness-110 shadow-[0_0_8px_rgba(255,189,46,0.2)]"
              >
                <Minus className="w-2 h-2 text-black/60 opacity-0 group-hover/controls:opacity-100 transition-opacity" strokeWidth={3} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="w-3 h-3 rounded-full bg-[#27c93f] border border-black/10 flex items-center justify-center transition-all hover:brightness-110 shadow-[0_0_8px_rgba(39,201,63,0.2)]"
              >
                <Maximize2 className="w-2 h-2 text-black/60 opacity-0 group-hover/controls:opacity-100 transition-opacity" strokeWidth={3} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-mono tracking-tight">
                {activeView === 'terminal' ? 'roiner@workspace:~' : `roiner@workspace:~/${activeView}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {activeView !== 'terminal' && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500/50 px-2 py-0.5 border border-emerald-500/20 rounded">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                READ_ONLY_MODE
              </div>
            )}
            {isExpanded && (
              <button 
                onClick={(e) => { e.stopPropagation(); closeExpanded(); }}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeView === 'terminal' ? (
              <motion.div
                key="terminal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 font-mono text-sm flex flex-col gap-6 h-full"
              >
                {/* AI greeting */}
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex items-start gap-4 p-5 bg-emerald-500/[0.03] backdrop-blur-md rounded-xl border border-emerald-500/10 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />
                    
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full border border-emerald-500/30 overflow-hidden bg-zinc-900 relative">
                        <img src="/avatar3.png" alt="Avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
                      </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70 font-mono">Digital Guide</span>
                          <div className="w-1 h-1 rounded-full bg-zinc-700" />
                        </div>
                        <div className="text-[9px] font-mono text-zinc-500 uppercase flex gap-3">
                          <span>Session: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                          <span>Last login: {new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-zinc-200 leading-snug">Welcome to my neural workspace. How can I assist your exploration today?</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
                        System ready. Use the terminal below to navigate or click a command.
                      </div>
                    </div>
                  </motion.div>

                  {/* Command chips */}
                  <div className="pt-2">
                    <div className="text-[10px] font-mono text-zinc-400 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      QUICK_ACCESS_COMMANDS
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {commands.map((cmd, i) => (
                        <motion.button
                          key={cmd}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ 
                            backgroundColor: 'rgba(16, 185, 129, 0.05)',
                            borderColor: 'rgba(16, 185, 129, 0.4)',
                            shadow: '2px 2px 0px rgba(16, 185, 129, 0.3)',
                            y: -2,
                            x: -2
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCommand(cmd);
                          }}
                          className="px-2 py-3 bg-transparent border border-zinc-800 text-zinc-500 hover:text-emerald-400 transition-all text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-center hover:shadow-[3px_3px_0px_rgba(16,185,129,0.2)]"
                        >
                          {cmd}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interactive Terminal Input (Bottom) */}
                <div className="mt-auto pb-8 pt-6">
                  <div className="flex items-center gap-3 text-white transition-colors px-1">
                    <div className="flex items-center shrink-0 text-sm font-mono font-bold text-white/40">
                      <span>$</span>
                    </div>
                    
                    <div className="relative flex-1 flex items-center">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        autoComplete="off"
                        placeholder="Escribe lo que quieras aquí..."
                        className="w-full bg-transparent border-none outline-none p-0 font-mono text-sm text-white caret-transparent placeholder:text-white/20"
                        autoFocus
                      />
                        <motion.div
                          animate={{ 
                            opacity: [1, 0, 1]
                          }}
                          transition={{ 
                            duration: 1, 
                            repeat: Infinity,
                            ease: "steps(2)"
                          }}
                          style={{ left: `${inputValue.length}ch` }}
                          className="absolute w-2 h-4 bg-white ml-0 pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                        />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="expanded-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col h-full bg-black/40"
              >
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
                  <div className="max-w-6xl mx-auto min-h-full flex flex-col">

                    <div className="flex-1">
                      {activeView === 'about' && (
                      <div className="space-y-12 pb-12">
                        {/* Profile Header Section */}
                        <div className="grid md:grid-cols-12 gap-12 items-start">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="md:col-span-4 relative group mx-auto md:mx-0 max-w-sm"
                          >
                            <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative aspect-square md:aspect-[4/5] rounded-2xl border border-emerald-500/20 overflow-hidden bg-zinc-900 shadow-2xl">
                              <img 
                                src="/avatar-complete3.png" 
                                alt="Roiner Hernandez" 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                            </div>
                            
                            {/* Decorative corner elements */}
                            <div className="absolute -top-3 -right-3 w-16 h-16 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-2xl pointer-events-none" />
                            <div className="absolute -bottom-3 -left-3 w-16 h-16 border-b-2 border-l-2 border-emerald-500/30 rounded-bl-2xl pointer-events-none" />
                          </motion.div>
                          
                          <div className="md:col-span-8 space-y-8 pt-4">
                            <div className="space-y-6">
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">SYSTEM_IDENTIFIED: HUMAN_ENGINEER</span>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                                  <span className="text-emerald-500">$</span>
                                  <span>cat profile_summary.md</span>
                                </div>
                                <p className="text-xl text-zinc-300 leading-relaxed font-light italic">
                                  "{aboutData.bio}"
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1 group hover:border-emerald-500/30 transition-colors">
                                <span className="text-[10px] text-zinc-500 uppercase font-mono">Location</span>
                                <p className="text-zinc-200 text-xs font-mono">{aboutData.location}</p>
                              </div>
                              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1 group hover:border-emerald-500/30 transition-colors">
                                <span className="text-[10px] text-zinc-500 uppercase font-mono">Education</span>
                                <p className="text-zinc-200 text-xs font-mono">{aboutData.education}</p>
                              </div>
                              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1 group hover:border-emerald-500/30 transition-colors col-span-2 sm:col-span-1">
                                <span className="text-[10px] text-emerald-500/60 uppercase font-mono">Status</span>
                                <p className="text-emerald-400 text-xs font-mono">{aboutData.status}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Knowledge Base Section (Skills) */}
                        <div className="space-y-8">
                          <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-zinc-800" />
                            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">Neural_Skill_Matrix</h3>
                            <div className="h-px flex-1 bg-zinc-800" />
                          </div>

                          <div className="grid sm:grid-cols-3 gap-6">
                            {Object.entries(aboutData.skills).map(([category, items], idx) => (
                              <motion.div 
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (idx * 0.1) }}
                                className="space-y-4 p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl group hover:bg-zinc-800/20 transition-all"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                  <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">{category.replace('_', ' ')}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {items.map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-black/40 border border-zinc-800 text-[10px] text-zinc-400 font-mono rounded-md group-hover:border-emerald-500/20 group-hover:text-zinc-200 transition-colors">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeView === 'experience' && (
                      <div className="space-y-12">
                        {/* Terminal Command Simulation */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-emerald-500">$</span>
                            <span className="text-zinc-300">cat experience.json</span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-600">
                            Retrieving logs from secure-vault-01... [DONE]
                          </div>
                        </div>

                        <div className="space-y-16 relative before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-zinc-800 pl-8 md:pl-12">
                          {experienceData.map((exp, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + i * 0.1 }}
                              className="relative"
                            >
                              <div className="absolute -left-[41px] md:-left-[57px] top-1.5 w-4 h-4 bg-zinc-950 border border-zinc-800 z-10 flex items-center justify-center">
                                 <div className="w-1.5 h-1.5 bg-emerald-500/50" />
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-emerald-500 px-1.5 py-0.5 bg-emerald-500/5 border border-emerald-500/20 rounded">
                                      {exp.period}
                                    </span>
                                    <span className="text-zinc-700 font-mono text-[10px]">::</span>
                                    <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">{exp.company}</span>
                                  </div>
                                  <h3 className="text-xl font-bold text-zinc-100 tracking-tight">{exp.role}</h3>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl font-mono opacity-80">
                                  {exp.description}
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                                  {exp.tech.map((t, ti) => (
                                    <span key={ti} className="text-[10px] font-mono text-zinc-600 flex items-center gap-1">
                                      <span className="text-emerald-500/30">#</span>
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeView === 'projects' && (
                      <div className="space-y-12 pb-12">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-emerald-500">$</span>
                            <span className="text-zinc-300">ls -la projects/</span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-600">
                            Total 2 items found in workspace...
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 pb-12">
                          {aboutData.projects.map((project, i) => (
                            <motion.div
                              key={project.name}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 + i * 0.1 }}
                              className="group p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-emerald-500/30 transition-all hover:bg-zinc-800/30"
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{project.name}</h3>
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full group-hover:animate-ping" />
                                  </div>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed font-mono">
                                  {project.description}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {project.tech.map(t => (
                                    <span key={t} className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 bg-black/30 border border-zinc-800 rounded">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeView === 'contact' && (
                      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
                        <div className="text-center space-y-4">
                          <h2 className="text-4xl font-bold text-white tracking-tighter">Secure Communication</h2>
                          <p className="text-zinc-500 font-mono">Establishing encrypted link...</p>
                        </div>
                        
                        <div className="grid gap-4 w-full max-w-md pb-12">
                          {[
                            { label: 'EMAIL', value: aboutData.email, icon: '📧' },
                            { label: 'GITHUB', value: 'github.com/Roiner994', icon: '💻' },
                            { label: 'LINKEDIN', value: 'linkedin.com/in/roiner', icon: '🤝' }
                          ].map((item, i) => (
                            <motion.div
                              key={item.label}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{item.icon}</span>
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-zinc-500 font-mono">{item.label}</span>
                                  <span className="text-sm text-zinc-200 group-hover:text-emerald-400 transition-colors">{item.value}</span>
                                </div>
                              </div>
                              <span className="text-emerald-500/30 font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">COPY_CMD</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeView === 'cv' && (
                      <div className="space-y-12 pb-12">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-emerald-500">$</span>
                            <span className="text-zinc-300">open cv/roiner-hernandez.bundle</span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-600">
                            Official resume assets mounted successfully... [OK]
                          </div>
                        </div>

                        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
                          <div className="space-y-8">
                            <div className="p-6 md:p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl space-y-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                  <Briefcase className="w-7 h-7 text-emerald-400" />
                                </div>
                                <div>
                                  <h2 className="text-3xl font-bold text-white tracking-tight">Curriculum Vitae</h2>
                                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.25em]">Dual language professional profile</p>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-black/30 border border-zinc-800 rounded-2xl space-y-3">
                                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500">
                                    <Languages className="w-3.5 h-3.5" />
                                    Resumen ES
                                  </div>
                                  <p className="text-sm text-zinc-300 leading-relaxed">{cvData.summaryEs}</p>
                                </div>
                                <div className="p-4 bg-black/30 border border-zinc-800 rounded-2xl space-y-3">
                                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500">
                                    <Languages className="w-3.5 h-3.5" />
                                    Summary EN
                                  </div>
                                  <p className="text-sm text-zinc-300 leading-relaxed">{cvData.summaryEn}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="p-6 bg-zinc-900/40 border border-emerald-500/20 rounded-3xl space-y-5 sticky top-0">
                              <div className="space-y-2">
                                <span className="text-[10px] text-emerald-500 font-mono uppercase tracking-[0.25em]">Official Downloads</span>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                  Descarga el CV en el idioma que necesites. Ambos archivos provienen de la versión oficial compartida.
                                </p>
                              </div>

                              <div className="space-y-3">
                                {cvData.downloads.map((file) => (
                                  <a
                                    key={file.href}
                                    href={file.href}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex items-center justify-between gap-4 p-4 bg-black/30 border border-zinc-800 rounded-2xl hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] transition-all"
                                  >
                                    <div className="space-y-1">
                                      <div className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors">{file.label}</div>
                                      <div className="text-[10px] font-mono uppercase tracking-wide text-zinc-500">{file.detail}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                                      <Download className="w-4 h-4" />
                                    </div>
                                  </a>
                                ))}
                              </div>

                              <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="p-3 bg-black/30 border border-zinc-800 rounded-xl text-center">
                                  <span className="block text-[10px] text-zinc-600 font-mono uppercase">Format</span>
                                  <span className="text-xs text-zinc-300 font-mono">PDF</span>
                                </div>
                                <div className="p-3 bg-black/30 border border-zinc-800 rounded-xl text-center">
                                  <span className="block text-[10px] text-zinc-600 font-mono uppercase">Variants</span>
                                  <span className="text-xs text-zinc-300 font-mono">ES / EN</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Integrated Navigation Prompt */}
                    {activeView !== 'terminal' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: false, amount: 0.1 }}
                        onClick={handleNext}
                        className="mt-8 mb-12 cursor-pointer group/prompt inline-block"
                      >
                        <div className="flex items-center gap-2 text-white/40 font-mono text-sm group-hover/prompt:text-white/80 transition-colors">
                          <span className="group-hover/prompt:text-emerald-500 transition-colors">$</span>
                          <span>
                            Presiona <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 group-hover/prompt:border-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]">ENTER</span> para {
                              viewOrder.indexOf(activeView as any) !== -1 && 
                              viewOrder.indexOf(activeView as any) < viewOrder.length - 1 
                                ? 'continuar' 
                                : 'finalizar'
                            }
                          </span>
                          <div 
                            className="w-2 h-4 bg-white/40 group-hover/prompt:bg-emerald-500" 
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Terminal Status Bar for Expanded View */}
                <div className="border-t border-zinc-800/50 bg-black/60 px-6 py-3 flex items-center justify-between font-mono text-[10px]">
                  <div className="flex items-center gap-6">
                    <div className="flex gap-4 text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-500/50">L</span> {activeView === 'about' ? '1' : '124'}
                      </div>
                      <div className="flex items-center gap-1.5 uppercase tracking-widest">
                        UTF-8
                      </div>
                    </div>

                    {/* Quick Navigation Commands */}
                    <div className="hidden lg:flex items-center gap-3 border-l border-zinc-800 pl-6">
                      <span className="text-zinc-600">GOTO:</span>
                      {commands.map((cmd) => (
                        <button
                          key={cmd}
                          onClick={() => handleCommand(cmd)}
                          className={`
                            px-2 py-0.5 rounded transition-colors
                            ${activeView === cmd ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}
                          `}
                        >
                          {cmd.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={closeExpanded}
                    className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-all rounded group"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    RETURN_TO_SHELL
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
  );

  if (isExpanded && typeof document !== 'undefined') {
    return createPortal(
      <div className="fixed inset-0 z-[140] h-screen w-screen bg-zinc-950">
        {panel}
      </div>,
      document.body
    );
  }

  return (
    <div className="relative w-full min-h-[580px]">
      {panel}
    </div>
  );
}
