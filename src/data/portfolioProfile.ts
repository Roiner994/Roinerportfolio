export type ExperienceEntry = {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  tech: string[];
};

export type AboutProject = {
  name: string;
  description: string;
  tech: string[];
};

export type AboutData = {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  specialties: string[];
  skills: {
    frontend: string[];
    backend: string[];
    tools_ia: string[];
  };
  education: string;
  status: string;
  birthDate: string;
  phone: string;
  remoteOnly: boolean;
  willingToRelocate: boolean;
  projects: AboutProject[];
};

export type CvLanguage = {
  label: string;
  level: string;
};

export type CvDownload = {
  label: string;
  href: string;
  detail: string;
};

export type CvData = {
  summaryEs: string;
  summaryEn: string;
  languages: CvLanguage[];
  downloads: CvDownload[];
};

export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectImage = {
  src: string;
  caption: string;
};

export type ProjectPresentation = 'media-first' | 'info-first';

export type ProjectStatus = {
  label: string;
  value?: string;
};

export type ProjectFallbackVisual = {
  title: string;
  lines: string[];
};

export type ProjectEntry = {
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
  heroImage?: ProjectImage; // Legacy: now loaded dynamically from src/assets/projects/[id]
  secondaryImages?: ProjectImage[]; // Legacy: now loaded dynamically from src/assets/projects/[id]
  links: ProjectLink[];
  status?: ProjectStatus;
  fallbackVisual?: ProjectFallbackVisual;
  focusAreas?: string;
  deliveryScope?: string;
};

export const experienceData: ExperienceEntry[] = [
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

export const aboutData: AboutData = {
  name: "Roiner Hernandez",
  title: "Ingeniero de Software Full Stack",
  bio: "Soy Ingeniero de Software Full Stack con casi una década de experiencia diseñando y construyendo productos web y móviles para problemas reales de negocio. Me especializo en transformar contextos ambiguos en soluciones funcionales, conectando interfaces, APIs, bases de datos, automatizaciones e integraciones con IA.Trabajo con mentalidad de producto: no solo implemento pantallas, también pienso en arquitectura, experiencia de usuario, escalabilidad y mantenibilidad.",
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
  birthDate: "15/05/1994",
  phone: "+584148589600",
  remoteOnly: true,
  willingToRelocate: true,
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

export const cvData: CvData = {
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

export const projectEntries: ProjectEntry[] = [
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
    links: [],
    status: {
      label: 'VISION_INFERENCE',
      value: 'READY',
    },
  },
];

export function buildPortfolioKnowledgeContext() {
  const birthDate = new Date("1994-05-15");
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return [
    `Nombre: ${aboutData.name}`,
    `Rol: ${aboutData.title}`,
    `Bio: ${aboutData.bio}`,
    `Fecha de Nacimiento: ${aboutData.birthDate} (Edad: ${age} años)`,
    `Ubicacion: ${aboutData.location}`,
    `Email: ${aboutData.email}`,
    `Telefono: ${aboutData.phone} (WhatsApp disponible)`,
    `Estado profesional: ${aboutData.status}`,
    `Preferencias laborales: Busco trabajo remoto principalmente, pero estoy dispuesto a mudarme de ciudad o pais si la situacion lo amerita.`,
    `Educacion: ${aboutData.education}`,
    `Especialidades: ${aboutData.specialties.join(', ')}`,
    `Skills frontend: ${aboutData.skills.frontend.join(', ')}`,
    `Skills backend: ${aboutData.skills.backend.join(', ')}`,
    `Herramientas IA: ${aboutData.skills.tools_ia.join(', ')}`,
    `Idiomas: ${cvData.languages.map((language) => `${language.label} (${language.level})`).join(', ')}`,
    `Experiencia profesional: ${experienceData.map((item) => `${item.company} | ${item.role} | ${item.period} | ${item.location} | ${item.description} | Tech: ${item.tech.join(', ')}`).join('\n')}`,
    `Proyectos destacados: ${projectEntries.map((project) => `${project.displayName} | ${project.subtitle} | ${project.category} | ${project.role} | ${project.description} | Highlights: ${project.highlights.join(' / ')} | Tech: ${project.tech.join(', ')}`).join('\n')}`,
    `Proyectos personales adicionales: ${aboutData.projects.map((project) => `${project.name} | ${project.description} | Tech: ${project.tech.join(', ')}`).join('\n')}`,
  ].join('\n');
}
