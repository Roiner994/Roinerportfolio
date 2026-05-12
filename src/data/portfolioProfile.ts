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

export type ProjectPresentation = "media-first" | "info-first";

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
  heroImage?: ProjectImage;
  secondaryImages?: ProjectImage[];
  links: ProjectLink[];
  status?: ProjectStatus;
  fallbackVisual?: ProjectFallbackVisual;
  focusAreas?: string;
  deliveryScope?: string;
};

const experienceDataEs: ExperienceEntry[] = [
  {
    company: "ucrop.it",
    role: "Full Stack Developer",
    period: "2021 - Present",
    location: "Argentina",
    description:
      "Arquitectura y desarrollo Full Stack para la plataforma líder en trazabilidad agrícola y sostenibilidad. Implementación de sistemas de inteligencia verificada para análisis de carteras de productores desde riesgos regionales hasta el nivel de parcela individual. Liderazgo técnico en la evolución del producto utilizando React y TypeScript.",
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
    company: "ucrop.it",
    role: "Full Stack Developer",
    period: "2021 - Present",
    location: "Argentina",
    description:
      "Full Stack architecture and development for the leading agricultural traceability and sustainability platform. Implementation of verified intelligence systems for producer portfolio analysis from regional risks to plot level. Technical leadership in product evolution using React and TypeScript.",
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
      href: "/cv-roiner-hernandez-es.pdf",
      detail: "PDF oficial en español",
    },
    {
      label: "Download CV EN",
      href: "/cv-roiner-hernandez-en.pdf",
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
      href: "/cv-roiner-hernandez-es.pdf",
      detail: "Official PDF in Spanish",
    },
    {
      label: "Download CV EN",
      href: "/cv-roiner-hernandez-en.pdf",
      detail: "Official PDF in English",
    },
  ],
};

const projectEntriesEs: ProjectEntry[] = [
  {
    id: "flashcardia",
    terminalName: "Flashcardia",
    displayName: "Flashcardia",
    subtitle: "De tarjetas manuales a práctica activa con IA.",
    category: "Product",
    role: "Diseño de producto, UX y arquitectura de funcionalidades con IA.",
    impact:
      "Transforma la práctica de vocabulario en un ciclo estructurado de aprendizaje con generación, repetición y feedback evaluado por IA.",
    presentation: "media-first",
    description:
      "Plataforma de aprendizaje con IA que reduce la fricción de crear tarjetas de estudio y convierte la práctica de vocabulario en entrenamiento activo.",
    highlights: [
      "Problema: En herramientas como Anki, cada tarjeta debe crearse manualmente, lo que hace que preparar material de estudio sea lento y pesado.",
      "Solución: Flashcardia genera tarjetas completas con definición, pronunciación y ejemplos de uso, reduciendo la fricción de estudiar.",
      "Modo Challenge: Modo de práctica activa donde el usuario crea frases propias y recibe feedback de IA, una puntuación de 1 a 10 y ejemplos mejorados.",
      "Explorar: Módulo para descubrir decks públicos, copiarlos y empezar a practicar rápidamente.",
    ],
    tech: [
      "IA aplicada",
      "Language Learning",
      "Spaced Repetition",
      "AI Feedback",
      "Product Design",
      "React Native",
      "Supabase",
    ],
    links: [
      {
        label: "ABRIR_APLICACIÓN_WEB",
        href: "https://flashcardia-web.vercel.app/",
      },
    ],
    status: {
      label: "CICLO_DE_APRENDIZAJE",
      value: "ACTIVO",
    },
  },
  {
    id: "autostream",
    terminalName: "Chatbot_AI",
    displayName: "WhatsApp Commerce Agent",
    subtitle: "AGENTE COMERCIAL CONFIGURABLE PARA WHATSAPP",
    category: "Automation",
    role: "Automatización comercial con n8n, WhatsApp, reglas dinámicas e IA multimodal.",
    impact:
      "Permite adaptar la lógica de atención y ventas desde un documento, sin reescribir código.",
    presentation: "media-first",
    description:
      "Agente comercial para WhatsApp construido con n8n. Automatiza atención, ventas y registro de pagos a partir de reglas de negocio escritas en lenguaje natural.",
    highlights: [
      "Problema: Muchos negocios atienden clientes por WhatsApp de forma manual y dependen de procesos repetitivos para responder consultas, validar pagos y registrar operaciones.",
      "Solución: El bot centraliza la atención y permite definir la lógica comercial desde un documento editable, sin modificar código.",
      "Reglas de negocio: El negocio puede cambiar tono, personalidad, catálogo, respuestas, políticas o incluso gestionar distintas tiendas escribiendo nuevas reglas en el documento.",
      "Inteligencia de medios: El sistema interpreta mensajes, notas de audio e imágenes de WhatsApp para sostener conversaciones más naturales.",
      "Seguimiento de pagos: Cuando detecta un comprobante de pago, analiza la imagen, extrae el monto y registra la operación en Excel/Sheets para control diario.",
    ],
    tech: [
      "N8N",
      "WhatsApp",
      "LLMs",
      "OCR",
      "Speech-to-Text",
      "Automatización",
      "Excel",
      "Prompt Logic",
    ],
    links: [],
    status: {
      label: "REGLAS_CONFIGURADAS",
      value: "LÓGICA_EN_VIVO",
    },
  },
  {
    id: "ucrop",
    terminalName: "UCROP_IT",
    displayName: "ucrop.it Traceability Platform",
    subtitle: "PLATAFORMA B2B DE TRAZABILIDAD AGRÍCOLA",
    category: "Platform",
    role: "Desarrollo full stack de funcionalidades web, mobile, APIs y backoffice para una plataforma agrícola de trazabilidad.",
    impact:
      "Centraliza datos de campo, actividades agrícolas, indicadores ambientales y reportes normativos para compañías y unidades productivas.",
    presentation: "info-first",
    description:
      "Plataforma B2B de trazabilidad agrícola, sostenibilidad y cumplimiento normativo que conecta campos, cultivos, actividades, datos geoespaciales e informes ambientales en un ecosistema web, móvil y backoffice.",
    highlights: [
      "Flujo de trazabilidad: Construcción de flujos para registrar campos, cultivos y actividades, conectándolos con Crop Story y reportes de trazabilidad.",
      "Inteligencia geoespacial: Creación de campos desde Google Maps o importación KMZ, con soporte para polígonos, imágenes satelitales y análisis histórico del terreno.",
      "Sostenibilidad: Visualización de indicadores como huella de carbono, huella hídrica y CFT dentro de reportes ambientales asociados al cultivo.",
      "Cumplimiento: Cálculo y generación de informes para normativas como 2BSvs, EPA y EUDR aplicadas a unidades productivas y compañías agrícolas.",
      "Alcance de entrega: Desarrollo dentro de un equipo multidisciplinario de funcionalidades web, mobile, backoffice, APIs y servicios.",
    ],
    tech: [
      "React",
      "Next.js",
      "Expo",
      "NestJS",
      "Python",
      "Google Maps",
      "KMZ",
      "Satellite Data",
      "Traceability",
      "Sustainability",
      "Compliance",
    ],
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
      label: "ALCANCE_TOTAL",
      value: "FULL_STACK",
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
    focusAreas:
      "Creación de cultivos, campos mapeados, flujos de actividades e informes de producto vinculados a sostenibilidad.",
    deliveryScope:
      "Frontend, backend, microservicios, despliegues y operaciones de backoffice en toda la plataforma.",
  },
  {
    id: "calai",
    terminalName: "Cal_AI",
    displayName: "Cal AI Nutrition Scanner",
    subtitle: "APP MOBILE DE REGISTRO NUTRICIONAL CON IA",
    category: "AI Tool",
    role: "UX mobile para registro nutricional, análisis visual y corrección asistida por IA.",
    impact:
      "Reduce la fricción de registrar comidas al convertir una foto en estimaciones editables de calorías y macronutrientes.",
    presentation: "media-first",
    description:
      "App mobile de registro nutricional con IA que estima calorías y macronutrientes a partir de una foto, permitiendo ajustar el resultado con correcciones en lenguaje natural.",
    highlights: [
      "Problema: Registrar comidas manualmente suele ser lento, impreciso y difícil de mantener como hábito diario.",
      "Análisis visual: Detecta ingredientes, estima porciones, calorías y macronutrientes a partir de una foto tomada con la cámara o importada desde la galería.",
      "Ajuste conversacional: Permite corregir el análisis con lenguaje natural, ajustando ingredientes o cantidades sin rehacer el registro.",
      "Seguimiento de progreso: Muestra gráficas semanales para comparar consumo, objetivos configurados y patrones de alimentación.",
    ],
    tech: [
      "React Native",
      "Computer Vision",
      "LLMs",
      "Nutrition AI",
      "Data Visualization",
      "Mobile UX",
    ],
    links: [],
    status: {
      label: "INFERENCIA_VISUAL",
      value: "LISTO",
    },
  },
];

const projectEntriesEn: ProjectEntry[] = [
  {
    id: "flashcardia",
    terminalName: "Flashcardia",
    displayName: "Flashcardia",
    subtitle: "From manual cards to active practice with AI.",
    category: "Product",
    role: "Product design, UX, and AI feature architecture.",
    impact:
      "Transforms vocabulary practice into a structured learning cycle with AI-evaluated generation, repetition, and feedback.",
    presentation: "media-first",
    description:
      "AI learning platform that reduces study card creation friction and turns vocabulary practice into active training.",
    highlights: [
      "Problem: In tools like Anki, each card must be created manually, making study material preparation slow and tedious.",
      "Solution: Flashcardia generates complete cards with definition, pronunciation, and usage examples, reducing study friction.",
      "Challenge Mode: Active practice mode where the user creates their own sentences and receives AI feedback, a score from 1 to 10, and improved examples.",
      "Explore: Module to discover public decks, copy them, and start practicing quickly.",
    ],
    tech: [
      "Applied AI",
      "Language Learning",
      "Spaced Repetition",
      "AI Feedback",
      "Product Design",
      "React Native",
      "Supabase",
    ],
    links: [
      {
        label: "LAUNCH_WEB_APPLICATION",
        href: "https://flashcardia-web.vercel.app/",
      },
    ],
    status: {
      label: "KNOWLEDGE_LOOP",
      value: "ACTIVE",
    },
  },
  {
    id: "autostream",
    terminalName: "Chatbot_AI",
    displayName: "WhatsApp Commerce Agent",
    subtitle: "CONFIGURABLE COMMERCIAL AGENT FOR WHATSAPP",
    category: "Automation",
    role: "Commercial automation with n8n, WhatsApp, dynamic rules, and multimodal AI.",
    impact:
      "Allows adapting support and sales logic from a document, without rewriting code.",
    presentation: "media-first",
    description:
      "Commercial agent for WhatsApp built with n8n. Automates support, sales, and payment registration from business rules written in natural language.",
    highlights: [
      "Problem: Many businesses handle WhatsApp customers manually and rely on repetitive processes to answer queries, validate payments, and register operations.",
      "Solution: The bot centralizes support and allows defining business logic from an editable document, without code modification.",
      "Business Rules: The business can change tone, personality, catalog, responses, policies, or even manage different stores by writing new rules in the document.",
      "Media Intelligence: The system interprets WhatsApp messages, audio notes, and images to maintain more natural conversations.",
      "Payment Tracking: When it detects a payment receipt, it analyzes the image, extracts the amount, and registers the operation in Excel/Sheets for daily control.",
    ],
    tech: [
      "N8N",
      "WhatsApp",
      "LLMs",
      "OCR",
      "Speech-to-Text",
      "Automation",
      "Excel",
      "Prompt Logic",
    ],
    links: [],
    status: {
      label: "PROMPT_CONFIGURED",
      value: "LIVE_LOGIC",
    },
  },
  {
    id: "ucrop",
    terminalName: "UCROP_IT",
    displayName: "ucrop.it Traceability Platform",
    subtitle: "AGRICULTURAL TRACEABILITY B2B PLATFORM",
    category: "Platform",
    role: "Full stack development of web, mobile, API, and backoffice functionalities for an agricultural traceability platform.",
    impact:
      "Centralizes field data, agricultural activities, environmental indicators, and regulatory reports for companies and production units.",
    presentation: "info-first",
    description:
      "B2B platform for agricultural traceability, sustainability, and regulatory compliance that connects fields, crops, activities, geospatial data, and environmental reports in a web, mobile, and backoffice ecosystem.",
    highlights: [
      "Traceability Flow: Construction of flows to register fields, crops, and activities, connecting them with Crop Story and traceability reports.",
      "Geo Intelligence: Field creation from Google Maps or KMZ import, with support for polygons, satellite imagery, and historical terrain analysis.",
      "Sustainability: Visualization of indicators such as carbon footprint, water footprint, and CFT within environmental reports associated with the crop.",
      "Compliance: Calculation and generation of reports for regulations such as 2BSvs, EPA, and EUDR applied to production units and agricultural companies.",
      "Delivery Scope: Development within a multidisciplinary team of web, mobile, backoffice, APIs, and services.",
    ],
    tech: [
      "React",
      "Next.js",
      "Expo",
      "NestJS",
      "Python",
      "Google Maps",
      "KMZ",
      "Satellite Data",
      "Traceability",
      "Sustainability",
      "Compliance",
    ],
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
      label: "END_TO_END_SCOPE",
      value: "FULL_STACK",
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
    focusAreas:
      "Crop creation, mapped fields, activity flows and sustainability-linked product reporting.",
    deliveryScope:
      "Frontend, backend, microservices, deployments and backoffice operations across the platform.",
  },
  {
    id: "calai",
    terminalName: "Cal_AI",
    displayName: "Cal AI Nutrition Scanner",
    subtitle: "AI NUTRITION LOGGING MOBILE APP",
    category: "AI Tool",
    role: "Mobile UX for nutritional logging, visual analysis, and AI-assisted correction.",
    impact:
      "Reduces the friction of logging meals by converting a photo into editable estimates of calories and macronutrients.",
    presentation: "media-first",
    description:
      "AI nutritional logging mobile app that estimates calories and macronutrients from a photo, allowing adjustments with natural language corrections.",
    highlights: [
      "Problem: Logging meals manually is usually slow, imprecise, and hard to maintain as a daily habit.",
      "Vision Analysis: Detects ingredients, estimates portions, calories, and macronutrients from a photo taken with the camera or imported from the gallery.",
      "Conversational Refinement: Allows correcting the analysis with natural language, adjusting ingredients or quantities without redoing the record.",
      "Progress Tracking: Shows weekly charts to compare intake, configured goals, and eating patterns.",
    ],
    tech: [
      "React Native",
      "Computer Vision",
      "LLMs",
      "Nutrition AI",
      "Data Visualization",
      "Mobile UX",
    ],
    links: [],
    status: {
      label: "VISION_INFERENCE",
      value: "READY",
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
    `${t.exp}: ${experience.map((item) => `${item.company} | ${item.role} | ${item.period} | ${item.location} | ${item.description} | Tech: ${item.tech.join(", ")}`).join("\n")}`,
    `${t.projects}: ${projects.map((project) => `${project.displayName} | ${project.subtitle} | ${project.category} | ${project.role} | ${project.description} | Highlights: ${project.highlights.join(" / ")} | Tech: ${project.tech.join(", ")}`).join("\n")}`,
    `${t.addProjects}: ${about.projects.map((project) => `${project.name} | ${project.description} | Tech: ${project.tech.join(", ")}`).join("\n")}`,
  ].join("\n");
}
