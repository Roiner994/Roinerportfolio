import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Terminal, Sparkles, X, Briefcase, Calendar, Minus, Maximize2, Hash, Download, Languages, Folder, FolderOpen, ChevronLeft, ChevronRight, Search, ChevronDown, Github, ExternalLink, Globe, Smartphone, Activity, Target, Layers, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence, animate, useMotionValue, useTransform, type MotionValue } from 'motion/react';

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

type ProjectLink = {
  label: string;
  href: string;
};

type ProjectImage = {
  src: string;
  caption: string;
};

type ProjectPresentation = 'media-first' | 'info-first';

type ProjectStatus = {
  label: string;
  value?: string;
};

type ProjectFallbackVisual = {
  title: string;
  lines: string[];
};

type ProjectEntry = {
  id: string;
  terminalName: string;
  displayName: string;
  subtitle: string;
  category: string;
  role: string;
  impact: string;
  presentation: ProjectPresentation;
  description: string;
  highlights: string[];
  tech: string[];
  heroImage?: ProjectImage;
  secondaryImages?: ProjectImage[];
  links: ProjectLink[];
  status?: ProjectStatus;
  fallbackVisual?: ProjectFallbackVisual;
  focusAreas?: string;
  deliveryScope?: string;
};

const projectEntries: ProjectEntry[] = [
  {
    id: 'flashcardia',
    terminalName: 'Flashcardia',
    displayName: 'Flashcardia AI Mastery',
    subtitle: 'AI learning ecosystem',
    category: 'Product',
    role: 'Product design, UX and AI feature architecture',
    impact: 'Transforms vocabulary practice into a structured mastery loop with generation, repetition and scored feedback.',
    presentation: 'media-first',
    description: 'Ecosistema de aprendizaje impulsado por IA para capturar conocimiento, practicarlo con intención y convertir memoria de corto plazo en dominio de largo plazo.',
    highlights: [
      'Genera nuevas flashcards con IA y voz para acelerar la creación de decks.',
      'Usa repetición espaciada para decidir qué repasar y cuándo hacerlo.',
      'Challenge Mode evalúa frases, asigna score y entrega feedback contextual.',
    ],
    tech: ['React Native', 'AI', 'Voice Input', 'SRS', 'Mobile UX'],
    heroImage: {
      src: '/project-media/flashcardia-challenge.png',
      caption: 'Challenge Mode con evaluación automática y feedback accionable.',
    },
    secondaryImages: [
      {
        src: '/project-media/flashcardia-ai-create.png',
        caption: 'Creación de tarjetas guiada por IA para acelerar el aprendizaje.',
      },
    ],
    links: [
      {
        label: 'LAUNCH_WEB_APPLICATION',
        href: 'https://flashcardia-web.vercel.app/es',
      },
    ],
    status: {
      label: 'KNOWLEDGE_LOOP',
      value: 'ACTIVE',
    },
  },
  {
    id: 'autostream',
    terminalName: 'AutoStream_IA',
    displayName: 'WhatsApp Commerce Agent',
    subtitle: 'Prompt-configurable commerce bot',
    category: 'Automation',
    role: 'Conversational flow design and automation logic',
    impact: 'Lets a business adapt sales logic, payment validation and responses without rewriting code.',
    presentation: 'media-first',
    description: 'Bot de WhatsApp configurable por prompt que puede actuar como tienda o asistente de negocio, adaptando sus reglas de respuesta sin tocar código.',
    highlights: [
      'Interpreta texto, audios e imágenes para sostener una conversación comercial natural.',
      'Detecta comprobantes de pago, valida la intención y registra la venta para operación diaria.',
      'La lógica del negocio se redefine con lenguaje natural para cambiar catálogo, tono y políticas.',
    ],
    tech: ['WhatsApp', 'LLMs', 'Payments OCR', 'Automation', 'Sheets'],
    heroImage: {
      src: '/project-media/autostream-chat.png',
      caption: 'Flujo conversacional para ventas, catálogo y medios de pago.',
    },
    secondaryImages: [
      {
        src: '/project-media/autostream-payment.png',
        caption: 'Procesamiento operativo listo para validar pagos y registrar pedidos.',
      },
    ],
    links: [],
    status: {
      label: 'PROMPT_CONFIGURED',
      value: 'LIVE_LOGIC',
    },
  },
  {
    id: 'ucrop',
    terminalName: 'UCROP_IT',
    displayName: 'ucrop.it Traceability Platform',
    subtitle: 'Agri traceability and sustainability',
    category: 'Platform',
    role: 'Full stack delivery across product, services and operations',
    impact: 'Connected traceability, field operations and sustainability reporting across web, mobile and backoffice systems.',
    presentation: 'info-first',
    description: 'Plataforma de trazabilidad agrícola y sustentabilidad donde participé de punta a punta, desde experiencia de usuario hasta microservicios, despliegues y backoffice.',
    highlights: [
      'Construcción de Crop Story, actividades, creación de crops, campos y reportes de producto.',
      'Creación de campos dibujando polígonos sobre Google Maps para modelar la operación real.',
      'Integración de trazabilidad y reportes de sustentabilidad conectando frontends, APIs y servicios.',
    ],
    tech: ['React', 'Next.js', 'Expo', 'NestJS', 'Python', 'Microservices'],
    links: [
      {
        label: 'EXPLORE_PRODUCT_SITE',
        href: 'https://ucrop.it/',
      },
      {
        label: 'GET_ON_GOOGLE_PLAY',
        href: 'https://play.google.com/store/apps/details?id=com.ucropit.ucropitapp&hl=es',
      },
    ],
    status: {
      label: 'END_TO_END_SCOPE',
      value: 'FULL_STACK',
    },
    fallbackVisual: {
      title: 'TRACEABILITY_PIPELINE',
      lines: [
        'crop_story -> sustainability_report',
        'field_polygon -> activities -> compliance',
        'web + mobile + microservices + backoffice',
      ],
    },
    focusAreas: 'Crop creation, mapped fields, activity flows and sustainability-linked product reporting.',
    deliveryScope: 'Frontend, backend, microservices, deployments and backoffice operations across the platform.',
  },
  {
    id: 'calai',
    terminalName: 'CalAI',
    displayName: 'Cal AI Nutrition Scanner',
    subtitle: 'Computer vision nutrition analysis',
    category: 'AI Tool',
    role: 'AI-assisted nutrition UX and analysis flow',
    impact: 'Makes calorie and macro estimation fast, editable and conversational from a single food photo.',
    presentation: 'media-first',
    description: 'Analizador nutricional por imagen que estima calorías y macronutrientes a partir de una foto, con refinamiento posterior usando prompts conversacionales.',
    highlights: [
      'Convierte una imagen de comida en una estimación rápida de calorías, proteínas, carbohidratos y grasas.',
      'Permite ajustar ingredientes o cantidades con prompts para mejorar precisión sin rehacer el análisis.',
      'Diseñado para mantener el flujo rápido entre captura, lectura del resultado y corrección asistida.',
    ],
    tech: ['Computer Vision', 'Nutrition AI', 'Prompt Refinement', 'Mobile'],
    heroImage: {
      src: '/project-media/calai-results.png',
      caption: 'Lectura nutricional detallada con calorías y macros por alimento.',
    },
    secondaryImages: [
      {
        src: '/project-media/calai-camera.png',
        caption: 'Flujo de captura pensado para obtener una estimación inmediata.',
      },
    ],
    links: [],
    status: {
      label: 'VISION_INFERENCE',
      value: 'READY',
    },
  },
];

interface TerminalPanelProps {
  variant?: 'default' | 'floating' | 'centered';
}

interface ExperienceNodeMarkerProps {
  pulseY: MotionValue<number>;
  targetY: number;
}

function ExperienceNodeMarker({ pulseY, targetY }: ExperienceNodeMarkerProps) {
  const activation = useTransform(pulseY, (value) => {
    const distance = Math.abs(value - targetY);
    return Math.max(0, 1 - distance / 54);
  });

  const borderColor = useTransform(activation, [0, 1], ['rgba(63,63,70,0.9)', 'rgba(16,185,129,0.95)']);
  const backgroundColor = useTransform(activation, [0, 1], ['rgba(9,9,11,1)', 'rgba(16,185,129,0.18)']);
  const boxShadow = useTransform(
    activation,
    [0, 0.65, 1],
    [
      '0 0 0 rgba(16,185,129,0)',
      '0 0 12px rgba(16,185,129,0.45), 0 0 18px rgba(16,185,129,0.18)',
      '0 0 18px rgba(16,185,129,0.8), 0 0 28px rgba(16,185,129,0.35)',
    ]
  );
  const coreOpacity = useTransform(activation, [0, 1], [0.45, 1]);
  const coreScale = useTransform(activation, [0, 1], [1, 1.25]);

  return (
    <motion.div
      className="relative z-10 flex h-4 w-4 items-center justify-center border border-zinc-700 bg-zinc-950"
      style={{ borderColor, backgroundColor, boxShadow }}
    >
      <motion.div className="h-1.5 w-1.5 bg-emerald-500/60" style={{ opacity: coreOpacity, scale: coreScale }} />
    </motion.div>
  );
}

function TerminalLinkButton({ label, href, index = 0 }: ProjectLink & { index?: number }) {
  // Format label to be lowercase and use spaces (e.g., "explore product site")
  const formattedLabel = label.replace(/_/g, ' ').toLowerCase();

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ x: 4 }}
      className="group inline-flex items-center gap-2 py-1 transition-all"
    >
      <span className="text-sm font-mono text-emerald-500 group-hover:text-emerald-400 transition-colors border-b border-transparent group-hover:border-emerald-500/40">
        {formattedLabel}
      </span>
      <ArrowUpRight className="h-4 w-4 text-emerald-500 group-hover:text-emerald-400 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </motion.a>
  );
}

function ProjectSectionLabel({ children }: { children: string }) {
  return <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">{children}</div>;
}

function ProjectMediaPanel({
  project,
  selectedImageIndex,
  onSelectImage,
}: {
  project: ProjectEntry;
  selectedImageIndex: number;
  onSelectImage: (index: number) => void;
}) {
  const images = [project.heroImage, ...(project.secondaryImages ?? [])].filter(Boolean) as ProjectImage[];
  const activeImage = images[selectedImageIndex] ?? images[0];

  const nextImage = () => {
    onSelectImage((selectedImageIndex + 1) % images.length);
  };

  const prevImage = () => {
    onSelectImage((selectedImageIndex - 1 + images.length) % images.length);
  };

  if (!activeImage) {
    return null;
  }

  return (
    <div className="group relative">
      <div className="overflow-hidden rounded-[2rem] bg-zinc-950/50 shadow-2xl transition-all duration-500">
        <div className="relative flex min-h-[400px] items-center justify-center p-4 sm:p-10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedImageIndex}
              initial={{ opacity: 0, x: 20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              src={activeImage.src}
              alt={project.displayName}
              className="max-h-[550px] w-full object-contain drop-shadow-[0_0_50px_rgba(16,185,129,0.1)] relative z-10"
              style={{
                filter: 'contrast(1.05) brightness(1.05)',
              }}
            />
          </AnimatePresence>

          {/* Minimalist Grid Overlay instead of scanlines */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04),transparent_70%)]" />

          {images.length > 1 && (
            <>
              {/* Full-height Side Navigation */}
              <div className="absolute inset-y-0 left-0 w-16 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={prevImage}
                  className="h-full w-full flex items-center justify-center bg-gradient-to-r from-black/60 to-transparent text-white/20 hover:text-emerald-500 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 w-16 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={nextImage}
                  className="h-full w-full flex items-center justify-center bg-gradient-to-l from-black/60 to-transparent text-white/20 hover:text-emerald-500 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

              {/* Technical Counter Label */}
              <div className="absolute bottom-6 right-6 z-30 flex items-center gap-3 rounded border border-emerald-500/10 bg-black/80 px-3 py-1.5 backdrop-blur-md font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-300">
                <span className="text-zinc-500">MEDIA_INDEX:</span>
                <span className="text-emerald-500 text-sm">{String(selectedImageIndex + 1).padStart(2, '0')}</span>
                <span className="text-zinc-700">/</span>
                <span className="text-zinc-400">{String(images.length).padStart(2, '0')}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function TerminalPanel({ variant = 'default' }: TerminalPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [activeView, setActiveView] = useState<'terminal' | 'about' | 'experience' | 'projects' | 'contact' | 'cv'>('terminal');
  const [activeProjectId, setActiveProjectId] = useState(projectEntries[0].id);
  const [activeProjectImageIndex, setActiveProjectImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [experienceRailHeight, setExperienceRailHeight] = useState(0);
  const [experienceNodeTargets, setExperienceNodeTargets] = useState<number[]>([]);
  const [aboutTypedLength, setAboutTypedLength] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const experienceRailRef = useRef<HTMLDivElement>(null);
  const experienceNodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const experiencePulseY = useMotionValue(-24);
  const activeProject = projectEntries.find((project) => project.id === activeProjectId) ?? projectEntries[0];
  const activeProjectIndex = projectEntries.findIndex((project) => project.id === activeProject.id);
  const hasNextProject = activeProjectIndex !== -1 && activeProjectIndex < projectEntries.length - 1;
  const usesProjectSplitScroll = isExpanded && activeView === 'projects';
  const usesFullscreenExpandedLayout = isExpanded && (activeView === 'projects' || activeView === 'contact' || activeView === 'cv');

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
    if (activeView === 'projects') {
      if (hasNextProject) {
        setActiveProjectId(projectEntries[activeProjectIndex + 1].id);
      } else {
        handleCommand('contact');
      }
      return;
    }

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

  useEffect(() => {
    if (activeView !== 'experience') {
      return;
    }

    const measureTimeline = () => {
      const rail = experienceRailRef.current;
      if (!rail) {
        return;
      }

      const railRect = rail.getBoundingClientRect();
      setExperienceRailHeight(railRect.height);

      const targets = experienceNodeRefs.current.map((node) => {
        if (!node) {
          return 0;
        }

        const nodeRect = node.getBoundingClientRect();
        return nodeRect.top - railRect.top + nodeRect.height / 2;
      });

      setExperienceNodeTargets(targets);
    };

    measureTimeline();

    const observer = new ResizeObserver(() => {
      measureTimeline();
    });

    if (experienceRailRef.current) {
      observer.observe(experienceRailRef.current);
    }

    experienceNodeRefs.current.forEach((node) => {
      if (node) {
        observer.observe(node);
      }
    });

    window.addEventListener('resize', measureTimeline);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureTimeline);
    };
  }, [activeView, isExpanded]);

  useEffect(() => {
    if (activeView !== 'experience' || experienceRailHeight <= 0) {
      return;
    }

    const controls = animate(experiencePulseY, [-24, experienceRailHeight + 24], {
      duration: 4.8,
      repeat: Infinity,
      ease: 'linear',
    });

    return () => {
      controls.stop();
    };
  }, [activeView, experienceRailHeight, experiencePulseY]);

  useEffect(() => {
    if (activeView !== 'about') {
      setAboutTypedLength(0);
      return;
    }

    let frame = 0;
    const fullText = `"${aboutData.bio}"`;
    const tick = () => {
      frame += 3;
      setAboutTypedLength(Math.min(frame, fullText.length));
      if (frame < fullText.length) {
        window.setTimeout(tick, 18);
      }
    };

    const startDelay = window.setTimeout(tick, 180);

    return () => {
      window.clearTimeout(startDelay);
    };
  }, [activeView]);

  useEffect(() => {
    setActiveProjectImageIndex(0);
  }, [activeProjectId]);

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
          backdrop-blur-xl border overflow-hidden cursor-text flex flex-col w-full
          ${usesFullscreenExpandedLayout ? 'h-screen' : isExpanded ? 'min-h-screen' : 'h-full'}
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
        <div className={`relative flex-1 ${
          usesFullscreenExpandedLayout ? 'min-h-0 overflow-hidden' : isExpanded ? 'overflow-visible' : 'min-h-0 overflow-hidden'
        }`}>
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
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                        System ready. Use the terminal below to navigate or click a command.
                      </div>
                    </div>
                  </motion.div>

                  {/* Command chips */}
                  <div className="pt-2">
                    <div className="text-[10px] font-mono text-zinc-400 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
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
                className="flex h-full min-h-0 flex-col bg-black/40"
              >
                <div className={`flex flex-1 min-h-0 flex-col ${
                  activeView === 'projects'
                    ? usesProjectSplitScroll
                      ? 'overflow-hidden p-0'
                      : 'overflow-y-auto custom-scrollbar p-0'
                    : 'overflow-hidden p-6 md:p-10 overflow-y-auto custom-scrollbar'
                }`}>
                  <div className={`${
                    activeView === 'projects'
                      ? usesProjectSplitScroll
                        ? 'h-full w-full min-h-0'
                        : 'w-full min-h-full'
                      : 'max-w-6xl mx-auto min-h-full'
                  } flex flex-1 min-h-0 flex-col`}>

                    <div className={activeView === 'projects' ? 'flex flex-1 min-h-0 flex-col' : 'flex-1 min-h-0'}>
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
                              {/* Scanline Removed as per request */}

                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                            </div>
                            
                            {/* Targeting corner elements */}
                            <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-emerald-500/35 pointer-events-none" />
                            <div className="absolute -top-3 -right-3 w-16 h-16 border-t-2 border-r-2 border-emerald-500/35 pointer-events-none" />
                            <div className="absolute -bottom-3 -left-3 w-16 h-16 border-b-2 border-l-2 border-emerald-500/35 pointer-events-none" />
                            <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-emerald-500/35 pointer-events-none" />
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
                                <div className="relative min-h-[15rem]">
                                  <p className="text-xl text-zinc-300 leading-relaxed font-light">
                                    {`"${aboutData.bio}"`.slice(0, aboutTypedLength)}
                                  </p>
                                  {aboutTypedLength < `"${aboutData.bio}"`.length && (
                                    <motion.span
                                      animate={{ opacity: [1, 0, 1] }}
                                      transition={{ duration: 0.9, repeat: Infinity, ease: 'steps(2)' }}
                                      className="absolute ml-1 inline-block h-6 w-2 bg-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.45)]"
                                    />
                                  )}
                                </div>
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
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                                  <p className="text-emerald-400 text-xs font-mono">{aboutData.status}</p>
                                </div>
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

                        <div className="relative pl-10 md:pl-14">
                          <div className="absolute left-0 top-2 bottom-0 w-6 flex justify-center pointer-events-none">
                            <div ref={experienceRailRef} className="relative h-full w-px overflow-visible">
                              <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 via-emerald-500/10 to-zinc-800" />
                              <motion.div
                                aria-hidden="true"
                                className="absolute top-0 left-1/2 h-16 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-300/0 via-emerald-400 to-emerald-300/0 shadow-[0_0_18px_rgba(16,185,129,0.9)] blur-[0.5px]"
                                style={{ y: experiencePulseY }}
                              />
                            </div>
                          </div>

                          <div className="space-y-16 relative">
                          {experienceData.map((exp, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + i * 0.1 }}
                              className="relative"
                            >
                              <div
                                ref={(node) => {
                                  experienceNodeRefs.current[i] = node;
                                }}
                                className="absolute left-0 top-1.5 w-6 -translate-x-[40px] md:-translate-x-[56px] flex justify-center"
                              >
                                <ExperienceNodeMarker pulseY={experiencePulseY} targetY={experienceNodeTargets[i] ?? 0} />
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex flex-wrap items-center gap-2">
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
                      </div>
                    )}

                    {activeView === 'projects' && (
                        <div
                          className={`flex flex-col bg-zinc-950/50 lg:flex-row ${
                            usesProjectSplitScroll ? 'h-full flex-1 min-h-0 overflow-hidden' : 'min-h-full'
                          }`}
                        >
                          <motion.aside
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex w-full flex-shrink-0 flex-col border-b border-zinc-800 bg-black/40 min-h-0 lg:w-80 lg:border-b-0 lg:border-r"
                          >
                            <div className="border-b border-zinc-800/50 px-4 py-3 flex items-center justify-between bg-zinc-900/20">
                              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                                <Terminal className="w-3 h-3 text-emerald-500/50" />
                                <span>Explorer</span>
                              </div>
                              <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                              </div>
                            </div>


                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pt-4 space-y-0.5">
                              <div className="px-2 pb-2 flex items-center justify-between">
                                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Workspace</span>
                                <ChevronDown className="w-3 h-3 text-zinc-700" />
                              </div>
                              
                              {projectEntries.map((project) => {
                                const isActive = project.id === activeProject.id;

                                return (
                                  <button
                                    key={project.id}
                                    type="button"
                                    onClick={() => setActiveProjectId(project.id)}
                                    className={`group relative flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 rounded-lg ${
                                      isActive
                                        ? 'bg-emerald-500/[0.07] text-emerald-400'
                                        : 'text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300'
                                    }`}
                                  >
                                    {isActive && (
                                      <motion.div 
                                        layoutId="active-indicator"
                                        className="absolute left-0 top-2 bottom-2 w-0.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                                      />
                                    )}
                                    
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-emerald-500' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
                                        {isActive ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className={`font-mono text-xs truncate ${isActive ? 'font-bold text-zinc-100' : ''}`}>
                                          {project.terminalName}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {usesProjectSplitScroll && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={handleNext}
                                className="cursor-pointer border-t border-zinc-800/60 bg-black/50 px-4 py-3 group/prompt"
                              >
                                <div className="flex items-center gap-2 text-white/40 font-mono text-xs group-hover/prompt:text-white/80 transition-colors">
                                  <span className="group-hover/prompt:text-emerald-500 transition-colors">$</span>
                                  <span>
                                    Presiona <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 group-hover/prompt:border-white/20 transition-all">ENTER</span> para {hasNextProject ? `abrir ${projectEntries[activeProjectIndex + 1].terminalName}` : 'ir a contacto'}
                                  </span>
                                  <div className="h-3.5 w-1.5 bg-white/40 group-hover/prompt:bg-emerald-500" />
                                </div>
                              </motion.div>
                            )}
                            
                          </motion.aside>

                          <AnimatePresence mode="wait">
                            <motion.section
                              key={activeProject.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              tabIndex={usesProjectSplitScroll ? 0 : undefined}
                              className={`min-w-0 flex-1 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_40%),linear-gradient(180deg,rgba(9,9,11,0.6),rgba(9,9,11,0.95))] ${
                                usesProjectSplitScroll ? 'h-full min-h-0 overflow-y-auto overscroll-y-contain custom-scrollbar focus:outline-none' : ''
                              }`}
                            >
                              <div className="border-b border-zinc-800 px-6 py-4">
                                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
                                  <span className="text-[#00FF41]">{activeProject.terminalName}</span>
                                  <span className="text-zinc-700">/</span>
                                  <span className="text-zinc-500">{activeProject.category}</span>
                                  {activeProject.status && (
                                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/[0.06] px-2.5 py-1 text-emerald-300">
                                      {activeProject.status.label}
                                      {activeProject.status.value ? ` / ${activeProject.status.value}` : ''}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="grid gap-10 p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-8">
                                <div className="space-y-8">
                                  <div className="space-y-5">
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-4">
                                        <span className="font-mono text-[10px] font-bold text-emerald-500 border-l-2 border-emerald-500 pl-2 uppercase tracking-widest">
                                          DATA_STREAM_{String(activeProjectIndex + 1).padStart(2, '0')}
                                        </span>
                                      </div>
                                      
                                      <div className="relative">
                                        <h3 className="font-mono text-2xl font-black italic tracking-tighter text-white md:text-3xl lg:text-4xl leading-tight">
                                          <span className="text-emerald-500 mr-2 opacity-40 not-italic">&gt;</span>
                                          {activeProject.displayName}
                                          <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
                                            className="ml-2 inline-block h-[0.7em] w-[0.15em] translate-y-0.5 bg-emerald-500/60 not-italic"
                                          />
                                        </h3>
                                      </div>

                                      <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-500">
                                        {activeProject.subtitle}
                                      </div>
                                    </div>

                                    {/* Links - Moved to the top for visibility */}
                                    {activeProject.links.length > 0 && (
                                      <div className="space-y-4 py-2">
                                        <div className="flex items-center gap-3">
                                          <ProjectSectionLabel>External Resources</ProjectSectionLabel>
                                          <div className="h-px flex-1 bg-zinc-800/50" />
                                        </div>
                                        <div className="flex flex-wrap gap-x-8 gap-y-4">
                                          {activeProject.links.map((link, idx) => (
                                            <TerminalLinkButton key={link.href} {...link} index={idx} />
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <p className="max-w-2xl text-base leading-8 text-zinc-300">
                                      {activeProject.description}
                                    </p>
                                  </div>

                                  {/* Additional Project Metadata */}
                                   <div className="grid gap-8 md:grid-cols-2">
                                     {/* Role Section */}
                                     <div className="group relative flex gap-4">
                                       <div className="flex flex-col items-center pt-1">
                                         <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all duration-500">
                                           <Briefcase className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                         </div>
                                         <div className="mt-4 h-full w-px bg-zinc-900 group-hover:bg-emerald-500/10 transition-colors" />
                                       </div>
                                       <div className="flex flex-col gap-1.5 pb-4">
                                         <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60 transition-colors">
                                           POSITION_CONTEXT
                                         </span>
                                         <p className="max-w-xl font-mono text-[13px] leading-relaxed text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                           {activeProject.role}
                                         </p>
                                       </div>
                                     </div>

                                     {/* Impact Section */}
                                     <div className="group relative flex gap-4">
                                       <div className="flex flex-col items-center pt-1">
                                         <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all duration-500">
                                           <Sparkles className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                         </div>
                                         <div className="mt-4 h-full w-px bg-zinc-900 group-hover:bg-emerald-500/10 transition-colors" />
                                       </div>
                                       <div className="flex flex-col gap-1.5 pb-4">
                                         <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60 transition-colors">
                                           PRODUCT_IMPACT
                                         </span>
                                         <p className="max-w-xl font-mono text-[13px] leading-relaxed text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                           {activeProject.impact}
                                         </p>
                                       </div>
                                     </div>
                                   </div>

                                  <div className="space-y-6">
                                     {activeProject.highlights.map((highlight, index) => (
                                       <motion.div
                                         key={highlight}
                                         initial={{ opacity: 0, y: 5 }}
                                         animate={{ opacity: 1, y: 0 }}
                                         transition={{ delay: 0.4 + index * 0.1 }}
                                         className="group flex gap-4"
                                       >
                                         <div className="flex flex-col items-center pt-1">
                                           <ChevronRight className="w-6 h-6 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                           <div className="mt-2 h-full w-px bg-zinc-900 group-hover:bg-emerald-500/10 transition-colors" />
                                         </div>
                                         
                                         <div className="flex flex-col gap-1.5 pb-2">
                                           <p className="max-w-xl font-mono text-[13px] leading-relaxed text-zinc-400 opacity-90 group-hover:text-zinc-200 group-hover:opacity-100 transition-all">
                                             {highlight}
                                           </p>
                                         </div>
                                       </motion.div>
                                     ))}
                                   </div>

                                   <div className="space-y-4">
                                     <ProjectSectionLabel>Stack</ProjectSectionLabel>
                                     <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
                                       {activeProject.tech.map((tech, index) => (
                                         <motion.div
                                           key={tech}
                                           initial={{ opacity: 0 }}
                                           animate={{ opacity: 1 }}
                                           transition={{ delay: 0.6 + index * 0.05 }}
                                           className="group flex items-center gap-2"
                                         >
                                           <span className="font-mono text-xs text-emerald-500/30 transition-colors group-hover:text-emerald-500">#</span>
                                           <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-600 transition-colors group-hover:text-zinc-300">
                                             {tech}
                                           </span>
                                         </motion.div>
                                       ))}
                                     </div>
                                   </div>
                                </div>

                                <div className="space-y-6">
                                  {activeProject.presentation === 'media-first' ? (
                                    <ProjectMediaPanel
                                      project={activeProject}
                                      selectedImageIndex={activeProjectImageIndex}
                                      onSelectImage={setActiveProjectImageIndex}
                                    />
                                  ) : (
                                    <div className="space-y-10">
                                      {/* Process Architecture Visual */}
                                      <div className="overflow-hidden rounded-[2rem] border border-emerald-500/10 bg-zinc-950/50 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:border-emerald-500/20">
                                        <div className="flex items-center gap-3 mb-10">
                                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                                            <Activity className="w-4 h-4 text-emerald-500" />
                                          </div>
                                          <div className="flex flex-col gap-0.5">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400">
                                              {activeProject.fallbackVisual?.title?.replace('PROJECT_FEATURE_CORE', 'SYSTEM_ARCHITECTURE') ?? 'PROCESS_ARCHITECTURE'}
                                            </span>
                                            <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                                              Topology_v2.4
                                            </span>
                                          </div>
                                        </div>

                                        <div className="relative space-y-6">
                                          {/* Vertical Spine - Solid Color (Static) */}
                                          <div className="absolute left-4 top-2 bottom-2 w-px bg-emerald-500/20" />

                                          
                                          {(activeProject.fallbackVisual?.lines ?? []).map((line, idx) => (
                                            <motion.div 
                                              key={line} 
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: idx * 0.15 }}
                                              className="relative pl-12 flex items-center group/line"
                                            >
                                              <div className="absolute left-[12.5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 flex items-center justify-center">
                                                <div className="relative w-2 h-2 rounded-full border border-emerald-500/50 bg-black group-hover/line:bg-emerald-500 group-hover/line:shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300" />
                                              </div>
                                              
                                              {/* Card - No Border, Minimal Background */}
                                              <div className="flex-1 rounded-2xl bg-zinc-900/10 px-6 py-5 transition-all duration-300 group-hover/line:bg-emerald-500/[0.03]">
                                                 <div className="flex items-center justify-between gap-4">
                                                   <span className="font-mono text-[13px] leading-relaxed text-zinc-300 group-hover/line:text-zinc-100 transition-colors">
                                                     <span className="text-emerald-500/40 mr-3">0{idx + 1}_</span>
                                                     {line}
                                                   </span>
                                                 </div>
                                              </div>
                                            </motion.div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Project Context Boxes - Refactored for consistency */}
                                      <div className="grid gap-8 md:grid-cols-2 px-2">
                                         {/* Focus Areas */}
                                         <div className="group relative flex gap-4">
                                            <div className="flex flex-col items-center pt-1">
                                              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all duration-500">
                                                <Target className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                              </div>
                                              <div className="mt-4 h-full w-px bg-zinc-900 group-hover:bg-emerald-500/10 transition-colors" />
                                            </div>
                                            <div className="flex flex-col gap-2 pb-4">
                                              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60 transition-colors">
                                                CORE_FOCUS_AREAS
                                              </span>
                                              <p className="max-w-xl font-mono text-[13px] leading-relaxed text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                                {activeProject.focusAreas ?? 'Core product mechanics, UX loops and key user interactions.'}
                                              </p>
                                            </div>
                                         </div>

                                         {/* Delivery Scope */}
                                         <div className="group relative flex gap-4">
                                            <div className="flex flex-col items-center pt-1">
                                              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all duration-500">
                                                <Layers className="w-5 h-5 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                              </div>
                                              <div className="mt-4 h-full w-px bg-zinc-900 group-hover:bg-emerald-500/10 transition-colors" />
                                            </div>
                                            <div className="flex flex-col gap-2 pb-4">
                                              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60 transition-colors">
                                                DELIVERY_SCOPE
                                              </span>
                                              <p className="max-w-xl font-mono text-[13px] leading-relaxed text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                                {activeProject.deliveryScope ?? 'End-to-end implementation from architecture to production deployment.'}
                                              </p>
                                            </div>
                                         </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.section>
                          </AnimatePresence>
                        </div>
                    )}

                    {activeView === 'contact' && (
                      <div className="w-full space-y-10 pb-8">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-emerald-500">$</span>
                            <span className="text-zinc-300">init secure-channel --handshake</span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-600">
                            Secure relay online. Preferred channels mounted and ready... [OK]
                          </div>
                        </div>

                        <div className="grid gap-12 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover="hover"
                              className="relative group cursor-none"
                            >
                              {/* Clean Minimalism Frame */}
                              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 to-transparent blur opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                              
                              <div className="relative aspect-square overflow-hidden rounded-xl border border-white/5 bg-zinc-950 transition-all duration-500 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]">
                                {/* Base Image */}
                                <img 
                                  src="/roiner_avatar_system.png" 
                                  alt="Contact Avatar" 
                                  className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100 group-hover:rotate-1"
                                />

                                {/* Glitch Layer 1 (Red/Cyan Shift) */}
                                <motion.div 
                                  className="absolute inset-0 mix-blend-screen opacity-0 group-hover:opacity-30 pointer-events-none"
                                  variants={{
                                    hover: {
                                      x: [-2, 2, -1, 0],
                                      transition: { repeat: Infinity, duration: 0.2 }
                                    }
                                  }}
                                >
                                  <img src="/roiner_avatar_system.png" alt="" className="h-full w-full object-cover saturate-[200%] hue-rotate-90" />
                                </motion.div>

                                {/* Digital Noise Overlay */}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] group-hover:opacity-[0.08] pointer-events-none mix-blend-overlay" />

                                {/* Minimalist Data Fragments */}
                                <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none z-30">
                                  <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <span className="font-mono text-[7px] text-emerald-400/40">v2.0.4_STABLE</span>
                                    <span className="font-mono text-[7px] text-emerald-400/40">CORE_SYNC</span>
                                  </div>
                                  <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                      <motion.span 
                                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="font-mono text-[10px] text-emerald-500 font-bold tracking-tighter"
                                      >
                                        [USER_ROOT]
                                      </motion.span>
                                      <span className="font-mono text-xl font-black text-white/90 tracking-tighter">ROINER</span>
                                    </div>
                                    <div className="h-4 w-4 border border-emerald-500/20 flex items-center justify-center">
                                      <div className="h-1 w-1 bg-emerald-500 animate-pulse" />
                                    </div>
                                  </div>
                                </div>

                                {/* Floating Code Snippets */}
                                <motion.div 
                                  className="absolute top-1/4 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-40"
                                  variants={{
                                    hover: { x: -20, transition: { duration: 0.5 } }
                                  }}
                                >
                                  <span className="font-mono text-[6px] text-emerald-500/30 whitespace-nowrap bg-zinc-950/80 px-1 py-0.5">const user = "roiner_hernandez";</span>
                                </motion.div>
                                <motion.div 
                                  className="absolute bottom-1/3 -left-4 opacity-0 group-hover:opacity-100 transition-opacity z-40"
                                  variants={{
                                    hover: { x: 20, transition: { duration: 0.7 } }
                                  }}
                                >
                                  <span className="font-mono text-[6px] text-emerald-500/30 whitespace-nowrap bg-zinc-950/80 px-1 py-0.5">await connection.open();</span>
                                </motion.div>
                              </div>
                            </motion.div>

                            {/* Right Column: Content & Channels */}
                            <div className="flex flex-col justify-center space-y-10">
                              <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                  <div className="h-px w-8 bg-emerald-500/30" />
                                  <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-emerald-500/60 font-bold">
                                    outbound_comms
                                  </span>
                                </div>

                                <h2 className="text-4xl font-bold tracking-tighter text-white md:text-5xl xl:text-6xl leading-none">
                                  Let&apos;s build the <span className="text-emerald-500 underline decoration-emerald-500/20 underline-offset-8 decoration-2">future</span>.
                                </h2>
                                
                                <p className="max-w-md text-sm text-zinc-400 font-mono leading-relaxed">
                                  Handshake ready. Select a protocol to initiate a direct data link with my system. 
                                </p>
                              </div>

                              {/* Terminal Command List */}
                              <div className="grid gap-3">
                                {[
                                  {
                                    label: 'MAIL',
                                    cmd: 'sendmail --to roiner@sys',
                                    value: aboutData.email,
                                    action: `mailto:${aboutData.email}`,
                                    color: 'text-blue-400'
                                  },
                                  {
                                    label: 'GITHUB',
                                    cmd: 'ssh git@github.com:roiner',
                                    value: 'github.com/Roiner994',
                                    action: 'https://github.com/Roiner994',
                                    color: 'text-purple-400'
                                  },
                                  {
                                    label: 'LINKEDIN',
                                    cmd: 'connect --relay linkedin',
                                    value: 'linkedin.com/in/roiner',
                                    action: 'https://linkedin.com/in/roiner-hernandez-6701b212a',
                                    color: 'text-emerald-400'
                                  }
                                ].map((item, i) => (
                                  <motion.a
                                    key={item.label}
                                    href={item.action}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="group relative flex items-center gap-4 overflow-hidden rounded-lg border border-zinc-800/50 bg-zinc-900/10 px-4 py-3 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/[0.03]"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3 mb-1">
                                        <span className={`font-mono text-[9px] font-black tracking-widest ${item.color} bg-white/5 px-1.5 py-0.5 rounded`}>
                                          {item.label}
                                        </span>
                                        <span className="font-mono text-[10px] text-zinc-600 group-hover:text-emerald-500/40 transition-colors">
                                          {item.cmd}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-emerald-500/50 font-mono text-xs font-bold">$</span>
                                        <span className="font-mono text-sm text-zinc-300 group-hover:text-white transition-colors truncate">
                                          {item.value}
                                        </span>
                                        <motion.span 
                                          animate={{ opacity: [1, 0] }}
                                          transition={{ duration: 0.8, repeat: Infinity }}
                                          className="h-4 w-2 bg-emerald-500/60 hidden group-hover:inline-block"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="font-mono text-[8px] text-emerald-500/60 font-bold uppercase">EXECUTE</span>
                                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                    </div>
                                  </motion.a>
                                ))}
                              </div>
                            </div>
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
                    {activeView !== 'terminal' && activeView !== 'projects' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: false, amount: 0.1 }}
                        onClick={handleNext}
                        className={`cursor-pointer group/prompt inline-block ${
                          activeView === 'contact' || activeView === 'cv' ? 'mt-4 mb-4 self-start' : 'mt-8 mb-12'
                        }`}
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
      <div className={`fixed inset-0 z-[140] h-screen w-screen bg-zinc-950 ${usesProjectSplitScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}>
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
