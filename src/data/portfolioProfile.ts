export type ExperienceEntry = {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  /** Optional short bullets shown under the description. */
  highlights?: string[];
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
  /** "video" renders a muted, looping mp4 (autoplays while visible). Default: image. */
  type?: "image" | "video";
  /** Optional poster for videos; without it the first frame is shown. */
  poster?: string;
};

export type ProjectPresentation = "media-first" | "info-first";

export type ProjectStatusKind =
  | "production"
  | "live"
  | "prototype"
  | "personal"
  | "past";

export type ProjectStatus = {
  label: string;
  value?: string;
  kind?: ProjectStatusKind;
};

/** Curated caption for an image in src/assets/projects/<id>/ (matched by file name; spaces as "_"). */
export type ProjectMediaCaption = {
  file: string;
  caption: string;
};

export type ProjectFallbackVisual = {
  title: string;
  lines: string[];
};

export type ProjectGalleryVariant = "portrait" | "landscape";

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
  heroImage?: ProjectImage;
  secondaryImages?: ProjectImage[];
  gallery?: ProjectImage[];
  galleryVariant?: ProjectGalleryVariant;
  links: ProjectLink[];
  status?: ProjectStatus;
  fallbackVisual?: ProjectFallbackVisual;
  focusAreas?: string;
  deliveryScope?: string;
  /** Shows a pulsing "currently building" dot in the Projects explorer. */
  building?: boolean;
  /** Ordered, captioned subset of src/assets/projects/<id>/ images. */
  mediaCaptions?: ProjectMediaCaption[];
};

const experienceDataEs: ExperienceEntry[] = [
  {
    company: "Plunkton",
    role: "Full Stack & AI Developer",
    period: "Junio 2026 - Presente",
    location: "Remoto",
    description:
      "Desarrollo full stack e IA de Plunkton, una plataforma de ventas con IA para concesionarios de autos en producción.",
    highlights: [
      "Asistente de ventas con IA que atiende leads por WhatsApp, Instagram y chat web y puntúa la intención de compra.",
      "CRM multi-tenant con resúmenes de leads por IA, cola de prioridad y derivación al vendedor indicado.",
      "Integraciones con Meta Cloud API/Twilio, Instagram y sincronización bidireccional con Pilot CRM.",
    ],
    tech: ["Django", "Vue 3", "Celery", "LiteLLM", "n8n", "PostgreSQL"],
  },
  {
    company: "ucrop.it",
    role: "Full Stack Developer",
    period: "2021 - Mayo 2026",
    location: "Argentina",
    description:
      "Diseñé y desarrollé como Full Stack la plataforma líder en trazabilidad agrícola y sostenibilidad. Implementé sistemas de inteligencia verificada para el análisis de carteras de productores, desde riesgos regionales hasta el nivel de parcela individual. Lideré técnicamente la evolución del producto con React y TypeScript.",
    tech: ["React", "TypeScript", "Node.js", "SQL", "AWS"],
  },
  {
    company: "OvniX | Hello Mundo",
    role: "Scrum Master & Software Architect",
    period: "2019 - 2021",
    location: "Chile",
    description:
      "Liderazgo técnico en OvniX, el marketplace para Pymes chilenas. Gestión operativa y facilitación entre stakeholders y equipos de ingeniería. Diseño de arquitecturas escalables y consultoría técnica internacional, implementando productos digitales de alto impacto con React Native y Node.js.",
    tech: ["React Native", "Node.js", "Agile", "System Design"],
  },
  {
    company: "KHAPTO",
    role: "React Native Developer",
    period: "2019 - 2020",
    location: "Chile",
    description:
      "Desarrollo del sistema de medición y registro para kinesiología, integrando hardware con software móvil. Implementación de herramientas para evaluar, analizar y estandarizar procedimientos cinéticos y fuerzas ejercidas para seguimiento clínico objetivo.",
    tech: ["React Native", "IoT", "Mobile Development"],
  },
  {
    company: "ESBrillante | Apreciasoft | Jamit Solution",
    role: "Web Developer",
    period: "2017 - 2019",
    location: "LatAm",
    description:
      "Desarrollo y mantenimiento de aplicaciones web personalizadas, implementación de funcionalidades frontend y soporte técnico en la construcción de productos digitales modernos para múltiples clientes y agencias en México y Argentina.",
    tech: ["JavaScript", "HTML/CSS", "PHP", "SQL"],
  },
];

const experienceDataEn: ExperienceEntry[] = [
  {
    company: "Plunkton",
    role: "Full Stack & AI Developer",
    period: "June 2026 - Present",
    location: "Remote",
    description:
      "Full stack and AI development of Plunkton, an AI sales platform for car dealerships running in production.",
    highlights: [
      "AI sales assistant that answers leads on WhatsApp, Instagram, and web chat and scores purchase intent.",
      "Multi-tenant CRM with AI lead summaries, a priority queue, and handoff to the right salesperson.",
      "Integrations with Meta Cloud API/Twilio, Instagram, and two-way Pilot CRM sync.",
    ],
    tech: ["Django", "Vue 3", "Celery", "LiteLLM", "n8n", "PostgreSQL"],
  },
  {
    company: "ucrop.it",
    role: "Full Stack Developer",
    period: "2021 - May 2026",
    location: "Argentina",
    description:
      "Architected and developed, as a full stack engineer, the leading agricultural traceability and sustainability platform. Implemented verified intelligence systems for producer portfolio analysis, from regional risks down to the plot level. Led the technical evolution of the product using React and TypeScript.",
    tech: ["React", "TypeScript", "Node.js", "SQL", "AWS"],
  },
  {
    company: "OvniX | Hello Mundo",
    role: "Scrum Master & Software Architect",
    period: "2019 - 2021",
    location: "Chile",
    description:
      "Technical leadership at OvniX, the marketplace for Chilean SMEs. Operational management and facilitation between stakeholders and engineering teams. Design of scalable architectures and international technical consultancy, implementing high-impact digital products with React Native and Node.js.",
    tech: ["React Native", "Node.js", "Agile", "System Design"],
  },
  {
    company: "KHAPTO",
    role: "React Native Developer",
    period: "2019 - 2020",
    location: "Chile",
    description:
      "Development of a measurement and registration system for kinesiology, integrating hardware with mobile software. Implementation of tools to evaluate, analyze, and standardize kinetic procedures and forces exerted for objective clinical follow-up.",
    tech: ["React Native", "IoT", "Mobile Development"],
  },
  {
    company: "ESBrillante | Apreciasoft | Jamit Solution",
    role: "Web Developer",
    period: "2017 - 2019",
    location: "LatAm",
    description:
      "Development and maintenance of custom web applications, implementation of frontend functionalities and technical support in building modern digital products for multiple clients and agencies in Mexico and Argentina.",
    tech: ["JavaScript", "HTML/CSS", "PHP", "SQL"],
  },
];

const aboutDataEs: AboutData = {
  name: "Roiner Hernandez",
  title: "Ingeniero de Software Full Stack",
  bio: "Ingeniero de Software Full Stack con casi una década de experiencia diseñando y construyendo productos web y móviles escalables. Especializado en transformar contextos ambiguos en soluciones funcionales, conectando interfaces, APIs, bases de datos, automatizaciones e integraciones con IA.",
  location: "Valencia, Venezuela",
  email: "roiner123@gmail.com",
  specialties: [
    "Arquitecturas Modernas",
    "Desarrollo centrado en el producto",
    "IA & Automatización",
    "Escalabilidad",
  ],
  skills: {
    frontend: [
      "React",
      "Next.js",
      "React Native",
      "TypeScript",
      "Tailwind",
      "GraphQL",
    ],
    backend: [
      "Node.js",
      "Python",
      "FastAPI",
      "REST APIs",
      "SQL",
      "NoSQL",
      "AWS",
      "Firebase",
    ],
    tools_ia: ["Git", "Docker", "AI Agents", "MCPs", "n8n", "LLMs"],
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
      description:
        "Plataforma de aprendizaje con IA diseñada para simplificar la creación y práctica de flashcards.",
      tech: ["IA aplicada", "React Native", "Supabase"],
    },
    {
      name: "Automatización con IA",
      description:
        "Diseño de flujos complejos con n8n, LLMs y agentes autónomos para automatizar tareas y generación de contenido.",
      tech: ["n8n", "OpenAI", "LangChain", "Python"],
    },
  ],
};

const aboutDataEn: AboutData = {
  name: "Roiner Hernandez",
  title: "Full Stack Software Engineer",
  bio: "Full Stack Software Engineer with nearly a decade of experience designing and building scalable web and mobile products. Specialized in transforming ambiguous contexts into functional solutions, connecting interfaces, APIs, databases, automations, and AI integrations.",
  location: "Valencia, Venezuela",
  email: "roiner123@gmail.com",
  specialties: [
    "Modern Architectures",
    "Product-focused development",
    "AI & Automation",
    "Scalability",
  ],
  skills: {
    frontend: [
      "React",
      "Next.js",
      "React Native",
      "TypeScript",
      "Tailwind",
      "GraphQL",
    ],
    backend: [
      "Node.js",
      "Python",
      "FastAPI",
      "REST APIs",
      "SQL",
      "NoSQL",
      "AWS",
      "Firebase",
    ],
    tools_ia: ["Git", "Docker", "AI Agents", "MCPs", "n8n", "LLMs"],
  },
  education: "Computer Engineering (UNEG)",
  status: "OPEN_FOR_NEW_PROJECTS",
  birthDate: "15/05/1994",
  phone: "+584148589600",
  remoteOnly: true,
  willingToRelocate: true,
  projects: [
    {
      name: "Flashcardia",
      description:
        "Applied AI learning platform designed to simplify the creation and practice of flashcards.",
      tech: ["Applied AI", "React Native", "Supabase"],
    },
    {
      name: "AI Workflow Automation",
      description:
        "Design of complex workflows with n8n, LLMs, and autonomous agents to automate tasks and content generation.",
      tech: ["n8n", "OpenAI", "LangChain", "Python"],
    },
  ],
};

const cvDataEs: CvData = {
  summaryEs:
    "Ingeniero de Software Full Stack con casi una década de experiencia diseñando y construyendo productos web y móviles escalables. Especializado en transformar contextos ambiguos en soluciones funcionales, conectando interfaces, APIs, bases de datos, automatizaciones e integraciones con IA.",
  summaryEn:
    "Full Stack Software Engineer with nearly a decade of experience designing and building scalable web and mobile products. Skilled at turning ambiguous requirements into end-to-end solutions across frontend, backend, databases, APIs, automations, and AI-powered workflows.",
  languages: [
    { label: "Español", level: "Nativo" },
    { label: "Inglés", level: "B1 - B2" },
  ],
  downloads: [
    {
      label: "Descargar CV ES",
      href: "/Roiner-Hernandez-cv-es.pdf",
      detail: "PDF oficial en español",
    },
    {
      label: "Download CV EN",
      href: "/Roiner-Hernandez-cv-en.pdf",
      detail: "Official PDF in English",
    },
  ],
};

const cvDataEn: CvData = {
  summaryEs:
    "Ingeniero de Software Full Stack con casi una década de experiencia diseñando y construyendo productos web y móviles escalables. Especializado en transformar contextos ambiguos en soluciones funcionales, conectando interfaces, APIs, bases de datos, automatizaciones e integraciones con IA.",
  summaryEn:
    "Full Stack Software Engineer with nearly a decade of experience designing and building scalable web and mobile products. Skilled at turning ambiguous requirements into end-to-end solutions across frontend, backend, databases, APIs, automations, and AI-powered workflows.",
  languages: [
    { label: "Spanish", level: "Native" },
    { label: "English", level: "B1 - B2" },
  ],
  downloads: [
    {
      label: "Download CV ES",
      href: "/Roiner-Hernandez-cv-es.pdf",
      detail: "Official PDF in Spanish",
    },
    {
      label: "Download CV EN",
      href: "/Roiner-Hernandez-cv-en.pdf",
      detail: "Official PDF in English",
    },
  ],
};

const projectEntriesEs: ProjectEntry[] = [
  {
    id: "plunkton",
    terminalName: "Plunkton",
    displayName: "Plunkton",
    subtitle: "DE CHATS DISPERSOS A LEADS CALIFICADOS CON IA.",
    category: "Platform",
    role:
      "IA conversacional, captación de leads multicanal y CRM multi-tenant para concesionarios de autos.",
    impact:
      "Convierte conversaciones dispersas en leads calificados y priorizados, listos para que un vendedor los tome.",
    presentation: "media-first",
    galleryVariant: "landscape",
    building: true,
    description:
      "Plataforma de ventas con IA para concesionarios de autos, en producción: un asistente atiende leads por WhatsApp, Instagram y chat web, y un CRM los deriva al vendedor indicado.",
    highlights: [
      "Asistente IA: Responde sobre modelos y stock, puntúa la intención de compra y registra los productos que le interesan a cada lead.",
      "CRM inteligente: Resúmenes de leads con IA y un próximo paso sugerido, una cola de prioridad y un dashboard de conversión.",
      "Canales: WhatsApp (Meta Cloud API o Twilio), DMs y respuestas a comentarios de Instagram, widget de chat web, sincronización bidireccional con Pilot CRM y Tokko.",
      "Multi-tenant y derivación: Cada concesionario gestiona su equipo, sucursales y catálogo; los leads llegan al vendedor indicado con aviso por WhatsApp.",
    ],
    tech: ["Django", "DRF", "Celery", "Vue 3", "n8n", "LiteLLM", "WhatsApp Cloud API", "Twilio", "Instagram API", "PostgreSQL", "pgvector"],
    gallery: [
      {
        type: "video",
        src: "/projects/plunkton/demo.mp4",
        caption: "Conversación en vivo: la IA responde y califica un lead",
      },
      {
        src: "/projects/plunkton/01-leads-produccion.webp",
        caption:
          "Bandeja de leads en producción: pendientes, esperando respuesta y sin asignar, con resúmenes de IA.",
      },
      {
        src: "/projects/plunkton/02-lead-conversacion.webp",
        caption:
          "Conversación de un lead de Instagram: respuesta privada al comentario, asistente IA y vendedor en un mismo hilo.",
      },
      {
        src: "/projects/plunkton/03-lead-detalle.webp",
        caption:
          "Detalle del lead con insights consolidados por IA, etapa, intención y score de lead caliente.",
      },
      {
        src: "/projects/plunkton/09-lead-detalle-ia.webp",
        caption:
          "Detalle del lead con resumen consolidado por IA, score de intención de compra y próximo paso sugerido.",
      },
      {
        src: "/projects/plunkton/04-integraciones-conexion.webp",
        caption:
          "Estado de conexión de WhatsApp, Instagram, chat web, Pilot CRM y Tokko.",
      },
      {
        src: "/projects/plunkton/05-integraciones-estado.webp",
        caption:
          "Panel de integraciones con el asistente virtual y la configuración de reactividad de derivación.",
      },
      {
        src: "/projects/plunkton/06-integracion-pilot-crm.webp",
        caption:
          "Conexión con Pilot CRM y sincronización bidireccional configurable.",
      },
      {
        src: "/projects/plunkton/07-dashboard.webp",
        caption:
          "Dashboard de conversión: leads nuevos, intención de compra, tasa de cierre y fuentes.",
      },
      {
        src: "/projects/plunkton/08-equipo.webp",
        caption:
          "Equipo organizado por tipo: ventas 0 km, postventa y planes de ahorro.",
      },
    ],
    links: [
      {
        label: "ABRIR_PLATAFORMA_CRM",
        href: "https://crm.plunkton.com",
      },
    ],
    status: {
      label: "En producción",
      kind: "production",
    },
  },
  {
    id: "goscale",
    terminalName: "GoScale",
    displayName: "GoScale",
    subtitle: "DE LA ESTRATEGIA A LA VENTA EN UN SOLO SISTEMA DE LANZAMIENTO.",
    category: "Platform",
    role:
      "Plataforma de operación de lanzamientos con planificación guiada e integraciones de email, WhatsApp, checkouts y Meta Ads.",
    impact:
      "Conecta cada etapa del lanzamiento en un flujo guiado, desde la planificación hasta los resultados de venta.",
    presentation: "media-first",
    galleryVariant: "landscape",
    description:
      "SaaS para lanzadores de productos digitales en LATAM que reúne todo un lanzamiento en un solo lugar: estrategia, oferta, copy, tráfico pago, captación por WhatsApp, finanzas y ventas.",
    highlights: [
      "Flujo guiado: Cliente > Producto > Lanzamiento, organizado en seis pilares: Estratega, Copy, Tráfico, Plataformas, Finanzas y Ventas.",
      "Planificación y métricas en vivo: Calcula fechas y CPL, con seguimiento planificado vs. real en todo el embudo.",
      "Tráfico y WhatsApp Analytics: Dashboards de embudo, calidad de lead y presupuesto diario, con captación por WhatsApp desglosada por fuente.",
      "Integraciones y finanzas: ConvertKit, Sendflow, Stripe, ThriveCart y Meta Ads; presupuesto vs. real, cuotas y roles Admin/Editor/Viewer.",
    ],
    tech: ["NestJS", "React", "TypeScript", "Vite", "Cloudflare Pages", "Meta Ads API", "Stripe", "ThriveCart", "ConvertKit"],
    gallery: [
      {
        src: "/projects/goscale/01-whatsapp-analytics.webp",
        caption:
          "Analítica de captación por WhatsApp: leads del gestor vs. WhatsApp por fuente (Meta, TikTok, orgánico, listas).",
      },
      {
        src: "/projects/goscale/02-resultados-lanzamiento.webp",
        caption:
          "Resultados del lanzamiento: facturación, ROAS, ROI, margen e inversión desglosada.",
      },
      {
        src: "/projects/goscale/03-metricas-en-vivo.webp",
        caption:
          "Métricas en vivo: planificado vs. real en todo el embudo.",
      },
      {
        src: "/projects/goscale/04-trafico-vision-general.webp",
        caption:
          "Visión general de tráfico: inversión, CPL, leads y conversión de un vistazo.",
      },
      {
        src: "/projects/goscale/05-resumen-leads.webp",
        caption:
          "Resumen de leads por canal: Meta (Instagram/Facebook), TikTok y orgánico.",
      },
      {
        src: "/projects/goscale/06-calidad-de-lead.webp",
        caption:
          "Calidad de lead a partir de encuestas, por campaña y público.",
      },
      {
        src: "/projects/goscale/07-integraciones-producto.webp",
        caption:
          "Integraciones del producto: ConvertKit, Sendflow, Stripe y ThriveCart conectados.",
      },
      {
        src: "/projects/goscale/08-pilares-lanzamiento.webp",
        caption:
          "Un lanzamiento dividido en seis pilares: Estratega, Copy, Tráfico, Plataformas, Finanzas y Ventas.",
      },
    ],
    links: [
      {
        label: "ABRIR_APLICACION_WEB",
        href: "https://go-scale.pages.dev",
      },
    ],
    status: {
      label: "En producción",
      kind: "production",
    },
  },
  {
    id: "ucrop",
    terminalName: "ucrop.it",
    displayName: "ucrop.it",
    subtitle: "PLATAFORMA B2B DE TRAZABILIDAD AGRÍCOLA",
    category: "Platform",
    role:
      "Desarrollo full stack de funcionalidades web, mobile, APIs y backoffice para una plataforma agrícola de trazabilidad.",
    impact:
      "Centraliza datos de campo, actividades agrícolas, indicadores ambientales y reportes normativos para compañías y unidades productivas.",
    presentation: "info-first",
    description:
      "Plataforma B2B de trazabilidad agrícola, sostenibilidad y cumplimiento normativo en web, móvil y backoffice.",
    highlights: [
      "Flujos de trazabilidad: Registro de campos, cultivos y actividades, conectados con Crop Story y reportes de trazabilidad.",
      "Geoespacial: Campos desde Google Maps o importación KMZ, con polígonos, imágenes satelitales y análisis histórico del terreno.",
      "Sostenibilidad: Indicadores de huella de carbono, huella hídrica y CFT en los reportes ambientales de cada cultivo.",
      "Cumplimiento: Generación de informes para 2BSvs, EPA y EUDR para unidades productivas y compañías agrícolas.",
    ],
    tech: ["React", "Next.js", "Expo", "NestJS", "Python", "Google Maps API"],
    links: [
      {
        label: "EXPLORE_PRODUCT_SITE",
        href: "https://ucrop.it/",
      },
      {
        label: "GET_ON_GOOGLE_PLAY",
        href: "https://play.google.com/store/apps/details?id=com.ucropit.ucropitapp&hl=es",
      },
    ],
    status: {
      label: "Trabajo anterior",
      kind: "past",
    },
    fallbackVisual: {
      title: "PIPELINE_DE_TRAZABILIDAD",
      lines: [
        "01_ fields -> crops -> activities",
        "02_ crop_story -> sustainability_report",
        "03_ maps + kmz -> satellite_analysis",
        "04_ productive_units -> compliance_reports",
        "05_ web + mobile + backoffice + services",
      ],
    },
  },
  {
    id: "autostream",
    terminalName: "WhatsApp Commerce Agent",
    displayName: "WhatsApp Commerce Agent",
    subtitle: "AGENTE COMERCIAL CONFIGURABLE PARA WHATSAPP",
    category: "Automation",
    role:
      "Automatización comercial con n8n, WhatsApp, reglas dinámicas e IA multimodal.",
    impact:
      "Permite adaptar la lógica de atención y ventas desde un documento, sin reescribir código.",
    presentation: "media-first",
    description:
      "Agente de ventas y atención para WhatsApp construido con n8n, guiado por reglas de negocio escritas en lenguaje natural.",
    highlights: [
      "Reglas en un documento: Tono, catálogo, políticas e incluso varias tiendas se editan en un documento, sin cambiar código.",
      "Multimodal: Entiende mensajes de texto, notas de voz e imágenes enviadas por WhatsApp.",
      "Seguimiento de pagos: Lee comprobantes de pago, extrae el monto y registra cada operación en Excel/Sheets.",
      "Ventas y atención: Responde sobre el catálogo, toma pedidos e indica los métodos de pago en el chat.",
    ],
    tech: ["n8n", "WhatsApp", "LLMs", "OCR", "Speech-to-Text", "Google Sheets"],
    mediaCaptions: [
      {
        file: "01chat.png",
        caption:
          "Chat de WhatsApp: el agente responde desde dos catálogos (ropa y cuentas de streaming) e indica los métodos de pago.",
      },
      {
        file: "02chat.png",
        caption:
          "Pedidos repetidos en un mismo chat: el agente envía cada código de acceso de Netflix o Disney cuando se le pide.",
      },
      {
        file: "Screenshot_2026-05-07_at_1.59.16_PM.png",
        caption:
          "Reglas de negocio en lenguaje natural: rol, catálogos de las tiendas, preguntas frecuentes y protocolo de respuesta.",
      },
      {
        file: "Screenshot_2026-05-07_at_12.52.29_PM.png",
        caption:
          "El prompt del agente vive en un Google Doc editable: el negocio cambia su comportamiento sin tocar código.",
      },
      {
        file: "Screenshot_2026-05-07_at_12.53.34_PM.png",
        caption:
          "Registro de pagos en Google Sheets: fecha, referencia, monto y tasa por comprobante, más un resumen diario.",
      },
      {
        file: "Screenshot_2026-05-07_at_12.55.04_PM.png",
        caption:
          "El workflow de n8n detrás del agente de WhatsApp.",
      },
    ],
    links: [
      {
        label: "VER_CÓDIGO_EN_GITHUB",
        href: "https://github.com/Roiner994/whatsapp-automatization",
      },
    ],
    status: {
      label: "Prototipo",
      kind: "prototype",
    },
  },
  {
    id: "flashcardia",
    terminalName: "Flashcardia",
    displayName: "Flashcardia",
    subtitle: "DE TARJETAS MANUALES A PRÁCTICA ACTIVA CON IA.",
    category: "Product",
    role:
      "Diseño de producto, UX y arquitectura de funcionalidades con IA.",
    impact:
      "Transforma la práctica de vocabulario en un ciclo estructurado de aprendizaje con generación, repetición y feedback evaluado por IA.",
    presentation: "media-first",
    description:
      "App de flashcards con IA que genera tarjetas de estudio completas y convierte la práctica de vocabulario en entrenamiento activo.",
    highlights: [
      "Tarjetas con IA: Genera tarjetas completas con definición, pronunciación y ejemplos de uso.",
      "Modo Challenge: Escribe tus propias frases y recibe feedback de IA, una puntuación de 1 a 10 y un ejemplo mejorado.",
      "Sesiones de repaso: Práctica con repetición espaciada y calificaciones Again, Hard, Good y Easy.",
      "Explorar: Descubre decks públicos, cópialos y empieza a practicar de inmediato.",
    ],
    tech: ["React Native", "Supabase"],
    mediaCaptions: [
      {
        file: "01_card.png",
        caption:
          "Vista previa de tarjeta: concepto, significado y ejemplos de uso generados por IA, lista para guardar en un mazo.",
      },
      {
        file: "02_card.png",
        caption:
          "Inicio del mazo: tarjetas nuevas, en aprendizaje y en repaso, y acceso rápido a “Crear tarjeta con IA”.",
      },
      {
        file: "03_card.png",
        caption:
          "Sesión de repaso: cada tarjeta se califica como Again, Hard, Good o Easy.",
      },
      {
        file: "Screenshot_2026-02-20_at_10.06.12_PM.png",
        caption:
          "Configuración del Challenge: cantidad de tarjetas a practicar y modo de dificultad.",
      },
      {
        file: "Screenshot_2026-02-20_at_10.06.47_PM.png",
        caption:
          "Modo Challenge: la IA puntúa con 10/10 una frase escrita por el usuario y sugiere una mejor forma de decirla.",
      },
      {
        file: "Screenshot_2026-02-20_at_10.07.08_PM.png",
        caption:
          "Uso incorrecto: la IA explica el error, lo puntúa con 1/10 y muestra un ejemplo correcto.",
      },
      {
        file: "Screenshot_2026-02-20_at_10.07.24_PM.png",
        caption:
          "Challenge completado, con la puntuación final.",
      },
      {
        file: "Screenshot_2026-02-20_at_10.02.21_PM.png",
        caption:
          "Inicio de sesión con Google o email para sincronizar mazos entre dispositivos, o continuar como invitado.",
      },
    ],
    links: [
      {
        label: "ABRIR_APLICACIÓN_WEB",
        href: "https://flashcardia-web.vercel.app/",
      },
    ],
    status: {
      label: "Proyecto personal",
      kind: "personal",
    },
  },
  {
    id: "calai",
    terminalName: "Cal AI",
    displayName: "Cal AI",
    subtitle: "APP MOBILE DE REGISTRO NUTRICIONAL CON IA",
    category: "AI Tool",
    role:
      "UX mobile para registro nutricional, análisis visual y corrección asistida por IA.",
    impact:
      "Reduce la fricción de registrar comidas al convertir una foto en estimaciones editables de calorías y macronutrientes.",
    presentation: "media-first",
    description:
      "App móvil que estima calorías y macros a partir de una foto de la comida y permite corregir el resultado en lenguaje natural.",
    highlights: [
      "Análisis de foto: Detecta ingredientes y estima porciones, calorías y macronutrientes desde la cámara o la galería.",
      "Ajustes con IA: Corrige ingredientes o cantidades en lenguaje natural sin rehacer el registro.",
      "Registro diario: Calorías frente a la meta diaria, con progreso de macros y las comidas del día.",
      "Tendencias: Gráficas semanales y mensuales para comparar consumo, metas y patrones de alimentación.",
    ],
    tech: ["React Native", "LLMs", "Computer Vision"],
    mediaCaptions: [
      {
        file: "Screenshot_20260507-133748.png",
        caption:
          "Análisis de la foto: calorías totales, macros y desglose por ingrediente de la comida.",
      },
      {
        file: "Screenshot_20260507-133907.png",
        caption:
          "Ajuste con IA: se agrega “con un aguacate y jugo de fresa” en lenguaje natural.",
      },
      {
        file: "Screenshot_20260507-133927.png",
        caption:
          "Desglose actualizado tras el ajuste con IA, con el aguacate y el jugo agregados.",
      },
      {
        file: "Screenshot_20260507-134906.png",
        caption:
          "Hoy: calorías frente a la meta diaria, progreso de macros y comidas registradas.",
      },
      {
        file: "camera.png",
        caption:
          "Tendencias semanales: promedio diario, calorías por día, metas alcanzadas y reparto de macros.",
      },
      {
        file: "Screenshot_20260507-134930.png",
        caption:
          "Tendencias mensuales: promedio diario, comidas registradas, metas alcanzadas y reparto de macros.",
      },
    ],
    links: [
    ],
    status: {
      label: "Proyecto personal",
      kind: "personal",
    },
  },
];

const projectEntriesEn: ProjectEntry[] = [
  {
    id: "plunkton",
    terminalName: "Plunkton",
    displayName: "Plunkton",
    subtitle: "FROM SCATTERED CHATS TO QUALIFIED LEADS WITH AI.",
    category: "Platform",
    role:
      "Conversational AI, multichannel lead capture, and a multi-tenant CRM for car dealerships.",
    impact:
      "Turns scattered conversations into qualified, prioritized leads that are ready for a salesperson.",
    presentation: "media-first",
    galleryVariant: "landscape",
    building: true,
    description:
      "AI sales platform for car dealerships, in production: an assistant answers leads on WhatsApp, Instagram, and web chat, and a CRM routes them to the right salesperson.",
    highlights: [
      "AI Assistant: Answers model and stock questions, scores purchase intent, and records each lead’s product interests.",
      "Smart CRM: AI lead summaries with a suggested next step, a priority queue, and a conversion dashboard.",
      "Channels: WhatsApp (Meta Cloud API or Twilio), Instagram DMs and comment replies, a web chat widget, two-way Pilot CRM sync, and Tokko.",
      "Multi-tenant Handoff: Each dealership runs its own team, branches, and catalog; leads go to the right salesperson with a WhatsApp alert.",
    ],
    tech: ["Django", "DRF", "Celery", "Vue 3", "n8n", "LiteLLM", "WhatsApp Cloud API", "Twilio", "Instagram API", "PostgreSQL", "pgvector"],
    gallery: [
      {
        type: "video",
        src: "/projects/plunkton/demo.mp4",
        caption: "Live conversation: AI answers and qualifies a lead",
      },
      {
        src: "/projects/plunkton/01-leads-produccion.webp",
        caption:
          "Production lead inbox: pending, awaiting reply, and unassigned queues with AI summaries.",
      },
      {
        src: "/projects/plunkton/02-lead-conversacion.webp",
        caption:
          "An Instagram lead conversation: comment private reply, AI assistant, and salesperson in one thread.",
      },
      {
        src: "/projects/plunkton/03-lead-detalle.webp",
        caption:
          "Lead detail with AI-consolidated insights, stage, intent, and a hot-lead score.",
      },
      {
        src: "/projects/plunkton/09-lead-detalle-ia.webp",
        caption:
          "Lead detail with AI-consolidated summary, purchase-intent score, and suggested next step.",
      },
      {
        src: "/projects/plunkton/04-integraciones-conexion.webp",
        caption:
          "Connection status for WhatsApp, Instagram, web chat, Pilot CRM, and Tokko.",
      },
      {
        src: "/projects/plunkton/05-integraciones-estado.webp",
        caption:
          "Integrations panel with the virtual assistant and handoff reactivity settings.",
      },
      {
        src: "/projects/plunkton/06-integracion-pilot-crm.webp",
        caption:
          "Pilot CRM connection with bidirectional sync toggles.",
      },
      {
        src: "/projects/plunkton/07-dashboard.webp",
        caption:
          "Conversion dashboard: new leads, purchase intent, close rate, and lead sources.",
      },
      {
        src: "/projects/plunkton/08-equipo.webp",
        caption:
          "Team organized by type: new-car sales, after-sales, and savings plans.",
      },
    ],
    links: [
      {
        label: "LAUNCH_CRM_PLATFORM",
        href: "https://crm.plunkton.com",
      },
    ],
    status: {
      label: "In production",
      kind: "production",
    },
  },
  {
    id: "goscale",
    terminalName: "GoScale",
    displayName: "GoScale",
    subtitle: "FROM STRATEGY TO SALES IN ONE LAUNCH SYSTEM.",
    category: "Platform",
    role:
      "Launch operations platform with guided planning and integrations for email, WhatsApp, checkouts, and Meta Ads.",
    impact:
      "Connects every stage of a launch in one guided flow, from planning to sales results.",
    presentation: "media-first",
    galleryVariant: "landscape",
    description:
      "SaaS for digital product launchers in LATAM that runs a whole launch in one place: strategy, offer, copy, paid traffic, WhatsApp capture, finance, and sales.",
    highlights: [
      "Guided Flow: Client > Product > Launch, organized in six pillars: Strategist, Copy, Traffic, Platforms, Finance, and Sales.",
      "Planning & Live Metrics: Calculates dates and CPL, with planned vs. actual tracking across the funnel.",
      "Traffic & WhatsApp Analytics: Funnel, lead-quality, and daily budget dashboards, with WhatsApp capture broken down by source.",
      "Integrations & Finance: ConvertKit, Sendflow, Stripe, ThriveCart, and Meta Ads; budget vs. actual, installments, and Admin/Editor/Viewer roles.",
    ],
    tech: ["NestJS", "React", "TypeScript", "Vite", "Cloudflare Pages", "Meta Ads API", "Stripe", "ThriveCart", "ConvertKit"],
    gallery: [
      {
        src: "/projects/goscale/01-whatsapp-analytics.webp",
        caption:
          "WhatsApp capture analytics: manager vs. WhatsApp leads by source (Meta, TikTok, organic, lists).",
      },
      {
        src: "/projects/goscale/02-resultados-lanzamiento.webp",
        caption:
          "Launch results: revenue, ROAS, ROI, margin, and investment breakdown.",
      },
      {
        src: "/projects/goscale/03-metricas-en-vivo.webp",
        caption: "Live metrics: planned vs. actual across the funnel.",
      },
      {
        src: "/projects/goscale/04-trafico-vision-general.webp",
        caption:
          "Traffic overview: spend, CPL, leads, and conversion at a glance.",
      },
      {
        src: "/projects/goscale/05-resumen-leads.webp",
        caption:
          "Leads summary by channel: Meta (Instagram/Facebook), TikTok, and organic.",
      },
      {
        src: "/projects/goscale/06-calidad-de-lead.webp",
        caption: "Lead quality from surveys, by campaign and audience.",
      },
      {
        src: "/projects/goscale/07-integraciones-producto.webp",
        caption:
          "Product integrations: ConvertKit, Sendflow, Stripe, and ThriveCart connected.",
      },
      {
        src: "/projects/goscale/08-pilares-lanzamiento.webp",
        caption:
          "A launch split into six pillars: Strategist, Copy, Traffic, Platforms, Finance, and Sales.",
      },
    ],
    links: [
      {
        label: "LAUNCH_WEB_APPLICATION",
        href: "https://go-scale.pages.dev",
      },
    ],
    status: {
      label: "In production",
      kind: "production",
    },
  },
  {
    id: "ucrop",
    terminalName: "ucrop.it",
    displayName: "ucrop.it",
    subtitle: "AGRICULTURAL TRACEABILITY B2B PLATFORM",
    category: "Platform",
    role:
      "Full stack development of web, mobile, API, and backoffice functionalities for an agricultural traceability platform.",
    impact:
      "Centralizes field data, agricultural activities, environmental indicators, and regulatory reports for companies and production units.",
    presentation: "info-first",
    description:
      "B2B platform for agricultural traceability, sustainability, and regulatory compliance across web, mobile, and backoffice.",
    highlights: [
      "Traceability Flows: Register fields, crops, and activities, linked to Crop Story and traceability reports.",
      "Geospatial: Fields from Google Maps or KMZ import, with polygons, satellite imagery, and historical terrain analysis.",
      "Sustainability: Carbon footprint, water footprint, and CFT indicators in each crop’s environmental reports.",
      "Compliance: Report generation for 2BSvs, EPA, and EUDR for production units and agricultural companies.",
    ],
    tech: ["React", "Next.js", "Expo", "NestJS", "Python", "Google Maps API"],
    links: [
      {
        label: "EXPLORE_PRODUCT_SITE",
        href: "https://ucrop.it/",
      },
      {
        label: "GET_ON_GOOGLE_PLAY",
        href: "https://play.google.com/store/apps/details?id=com.ucropit.ucropitapp&hl=es",
      },
    ],
    status: {
      label: "Past work",
      kind: "past",
    },
    fallbackVisual: {
      title: "TRACEABILITY_PIPELINE",
      lines: [
        "01_ fields -> crops -> activities",
        "02_ crop_story -> sustainability_report",
        "03_ maps + kmz -> satellite_analysis",
        "04_ productive_units -> compliance_reports",
        "05_ web + mobile + backoffice + services",
      ],
    },
  },
  {
    id: "autostream",
    terminalName: "WhatsApp Commerce Agent",
    displayName: "WhatsApp Commerce Agent",
    subtitle: "CONFIGURABLE COMMERCIAL AGENT FOR WHATSAPP",
    category: "Automation",
    role:
      "Commercial automation with n8n, WhatsApp, dynamic rules, and multimodal AI.",
    impact:
      "Allows adapting support and sales logic from a document, without rewriting code.",
    presentation: "media-first",
    description:
      "WhatsApp sales and support agent built with n8n, driven by business rules written in plain language.",
    highlights: [
      "Rules in a Document: Tone, catalog, policies, and even multiple stores are edited in a doc, with no code changes.",
      "Multimodal: Understands text messages, voice notes, and images sent over WhatsApp.",
      "Payment Tracking: Reads payment receipts, extracts the amount, and logs each operation in Excel/Sheets.",
      "Sales & Support: Answers catalog questions, takes requests, and shares payment methods in the chat.",
    ],
    tech: ["n8n", "WhatsApp", "LLMs", "OCR", "Speech-to-Text", "Google Sheets"],
    mediaCaptions: [
      {
        file: "01chat.png",
        caption:
          "WhatsApp chat: the agent answers from two store catalogs (clothing and streaming accounts) and lists the payment methods.",
      },
      {
        file: "02chat.png",
        caption:
          "Repeated requests in one chat: the agent sends each Netflix or Disney access code on demand.",
      },
      {
        file: "Screenshot_2026-05-07_at_1.59.16_PM.png",
        caption:
          "Business rules written in plain language: role, store catalogs, FAQ, and response protocol.",
      },
      {
        file: "Screenshot_2026-05-07_at_12.52.29_PM.png",
        caption:
          "The agent’s system prompt lives in an editable Google Doc, so the business changes behavior without touching code.",
      },
      {
        file: "Screenshot_2026-05-07_at_12.53.34_PM.png",
        caption:
          "Payment log in Google Sheets: date, reference, amount, and exchange rate per receipt, plus a daily summary.",
      },
      {
        file: "Screenshot_2026-05-07_at_12.55.04_PM.png",
        caption:
          "The n8n workflow behind the WhatsApp agent.",
      },
    ],
    links: [
      {
        label: "VIEW_GITHUB_REPOSITORY",
        href: "https://github.com/Roiner994/whatsapp-automatization",
      },
    ],
    status: {
      label: "Prototype",
      kind: "prototype",
    },
  },
  {
    id: "flashcardia",
    terminalName: "Flashcardia",
    displayName: "Flashcardia",
    subtitle: "FROM MANUAL CARDS TO ACTIVE PRACTICE WITH AI.",
    category: "Product",
    role:
      "Product design, UX, and AI feature architecture.",
    impact:
      "Transforms vocabulary practice into a structured learning cycle with AI-evaluated generation, repetition, and feedback.",
    presentation: "media-first",
    description:
      "AI flashcard app that generates complete study cards and turns vocabulary practice into active training.",
    highlights: [
      "AI Cards: Generates full cards with definition, pronunciation, and usage examples.",
      "Challenge Mode: Write your own sentences and get AI feedback, a 1–10 score, and an improved example.",
      "Review Sessions: Spaced-repetition practice with Again, Hard, Good, and Easy ratings.",
      "Explore: Discover public decks, copy them, and start practicing right away.",
    ],
    tech: ["React Native", "Supabase"],
    mediaCaptions: [
      {
        file: "01_card.png",
        caption:
          "Card preview: AI-generated concept, meaning, and usage examples, ready to save to a deck.",
      },
      {
        file: "02_card.png",
        caption:
          "Deck home: new, learning, and review counts, plus a quick “Create card with AI” action.",
      },
      {
        file: "03_card.png",
        caption:
          "Review session: each card is rated Again, Hard, Good, or Easy.",
      },
      {
        file: "Screenshot_2026-02-20_at_10.06.12_PM.png",
        caption:
          "Challenge setup: choose how many cards to practice and the difficulty mode.",
      },
      {
        file: "Screenshot_2026-02-20_at_10.06.47_PM.png",
        caption:
          "Challenge mode: the AI scores a user-written sentence 10/10 and suggests a better way to say it.",
      },
      {
        file: "Screenshot_2026-02-20_at_10.07.08_PM.png",
        caption:
          "Wrong usage: the AI explains the mistake, scores it 1/10, and shows a correct example.",
      },
      {
        file: "Screenshot_2026-02-20_at_10.07.24_PM.png",
        caption:
          "Challenge complete, with the final score.",
      },
      {
        file: "Screenshot_2026-02-20_at_10.02.21_PM.png",
        caption:
          "Sign in with Google or email to sync decks across devices, or continue as a guest.",
      },
    ],
    links: [
      {
        label: "LAUNCH_WEB_APPLICATION",
        href: "https://flashcardia-web.vercel.app/",
      },
    ],
    status: {
      label: "Personal project",
      kind: "personal",
    },
  },
  {
    id: "calai",
    terminalName: "Cal AI",
    displayName: "Cal AI",
    subtitle: "AI NUTRITION LOGGING MOBILE APP",
    category: "AI Tool",
    role:
      "Mobile UX for nutritional logging, visual analysis, and AI-assisted correction.",
    impact:
      "Reduces the friction of logging meals by converting a photo into editable estimates of calories and macronutrients.",
    presentation: "media-first",
    description:
      "Mobile app that estimates calories and macros from a meal photo and lets you correct the result in plain language.",
    highlights: [
      "Photo Analysis: Detects ingredients and estimates portions, calories, and macronutrients from the camera or gallery.",
      "AI Adjustments: Correct ingredients or quantities in natural language without redoing the log.",
      "Daily Log: Calories against the daily goal, with macro progress and the meals logged today.",
      "Trends: Weekly and monthly charts to compare intake, goals, and eating patterns.",
    ],
    tech: ["React Native", "LLMs", "Computer Vision"],
    mediaCaptions: [
      {
        file: "Screenshot_20260507-133748.png",
        caption:
          "Photo analysis: total calories, macros, and a per-ingredient breakdown of the meal.",
      },
      {
        file: "Screenshot_20260507-133907.png",
        caption:
          "Adjust with AI: adding “with an avocado and strawberry juice” in plain language.",
      },
      {
        file: "Screenshot_20260507-133927.png",
        caption:
          "Updated breakdown after the AI adjustment, with the avocado and juice added.",
      },
      {
        file: "Screenshot_20260507-134906.png",
        caption:
          "Today: calories against the daily goal, macro progress, and the meals logged.",
      },
      {
        file: "camera.png",
        caption:
          "Weekly trends: daily average, calories per day, goals met, and macro split.",
      },
      {
        file: "Screenshot_20260507-134930.png",
        caption:
          "Monthly trends: daily average, meals logged, goals met, and macro split.",
      },
    ],
    links: [
    ],
    status: {
      label: "Personal project",
      kind: "personal",
    },
  },
];

export const portfolioData = {
  es: {
    experience: experienceDataEs,
    about: aboutDataEs,
    cv: cvDataEs,
    projects: projectEntriesEs,
  },
  en: {
    experience: experienceDataEn,
    about: aboutDataEn,
    cv: cvDataEn,
    projects: projectEntriesEn,
  },
};

// Default exports for backward compatibility or direct access if needed
export const experienceData = experienceDataEs;
export const aboutData = aboutDataEs;
export const cvData = cvDataEs;
export const projectEntries = projectEntriesEs;

export function buildPortfolioKnowledgeContext(language: "es" | "en" = "es") {
  const data = portfolioData[language];
  const { about, cv, experience, projects } = data;

  const birthDate = new Date("1994-05-15");
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const translations = {
    es: {
      name: "Nombre",
      role: "Rol",
      bio: "Bio",
      birth: "Fecha de Nacimiento",
      age: "Edad",
      years: "años",
      location: "Ubicacion",
      email: "Email",
      phone: "Telefono",
      ws: "WhatsApp disponible",
      status: "Estado profesional",
      prefs: "Preferencias laborales",
      prefsVal:
        "Busco trabajo remoto principalmente, pero estoy dispuesto a mudarme de ciudad o pais si la situacion lo amerita.",
      edu: "Educacion",
      spec: "Especialidades",
      lang: "Idiomas",
      exp: "Experiencia profesional",
      projects: "Proyectos destacados",
      addProjects: "Proyectos personales adicionales",
      skillsFrontend: "Skills frontend",
      skillsBackend: "Skills backend",
      skillsIA: "TOOLS/IA",
    },
    en: {
      name: "Name",
      role: "Role",
      bio: "Bio",
      birth: "Birth Date",
      age: "Age",
      years: "years old",
      location: "Location",
      email: "Email",
      phone: "Phone",
      ws: "WhatsApp available",
      status: "Professional status",
      prefs: "Job preferences",
      prefsVal:
        "I am primarily looking for remote work, but I am willing to relocate if the situation warrants it.",
      edu: "Education",
      spec: "Specialties",
      lang: "Languages",
      exp: "Professional Experience",
      projects: "Featured Projects",
      addProjects: "Additional personal projects",
      skillsFrontend: "Frontend skills",
      skillsBackend: "Backend skills",
      skillsIA: "TOOLS/IA",
    },
  };

  const t = translations[language];

  return [
    `${t.name}: ${about.name}`,
    `${t.role}: ${about.title}`,
    `${t.bio}: ${about.bio}`,
    `${t.birth}: ${about.birthDate} (${t.age}: ${age} ${t.years})`,
    `${t.location}: ${about.location}`,
    `${t.email}: ${about.email}`,
    `${t.phone}: ${about.phone} (${t.ws})`,
    `${t.status}: ${about.status}`,
    `${t.prefs}: ${t.prefsVal}`,
    `${t.edu}: ${about.education}`,
    `${t.spec}: ${about.specialties.join(", ")}`,
    `${t.skillsFrontend}: ${about.skills.frontend.join(", ")}`,
    `${t.skillsBackend}: ${about.skills.backend.join(", ")}`,
    `${t.skillsIA}: ${about.skills.tools_ia.join(", ")}`,
    `${t.lang}: ${cv.languages.map((l) => `${l.label} (${l.level})`).join(", ")}`,
    `${t.exp}: ${experience.map((item) => `${item.company} | ${item.role} | ${item.period} | ${item.location} | ${item.description}${item.highlights?.length ? ` ${item.highlights.join(" / ")}` : ""} | Tech: ${item.tech.join(", ")}`).join("\n")}`,
    `${t.projects}: ${projects.map((project) => `${project.displayName} | ${project.subtitle} | ${project.category} | ${project.role} | ${project.description} | Highlights: ${project.highlights.join(" / ")} | Tech: ${project.tech.join(", ")}`).join("\n")}`,
    `${t.addProjects}: ${about.projects.map((project) => `${project.name} | ${project.description} | Tech: ${project.tech.join(", ")}`).join("\n")}`,
  ].join("\n");
}
