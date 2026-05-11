/**
 * Portfolio knowledge context for the AI chat serverless function.
 * This file lives in api/ so Vercel's bundler includes it.
 * It mirrors the data from src/data/portfolioProfile.ts but is self-contained.
 * The underscore prefix (_) prevents Vercel from treating it as a separate endpoint.
 */

const experienceData = [
  {
    company: "ucrop.it",
    role: "Full Stack Developer",
    period: "2021 - Present",
    location: "Argentina",
    description: "Arquitectura y desarrollo Full Stack para la plataforma líder en trazabilidad agrícola y sostenibilidad. Implementación de sistemas de inteligencia verificada para análisis de carteras de productores desde riesgos regionales hasta el nivel de parcela individual. Liderazgo técnico en la evolución del producto utilizando React y TypeScript.",
    tech: ["React", "TypeScript", "Node.js", "SQL", "AWS"],
  },
  {
    company: "OvniX | Hello Mundo",
    role: "Scrum Master & Software Architect",
    period: "2019 - 2021",
    location: "Chile",
    description: "Liderazgo técnico en OvniX, el marketplace para Pymes chilenas. Gestión operativa y facilitación entre stakeholders y equipos de ingeniería. Diseño de arquitecturas escalables y consultoría técnica internacional, implementando productos digitales de alto impacto con React Native y Node.js.",
    tech: ["React Native", "Node.js", "Agile", "System Design"],
  },
  {
    company: "KHAPTO",
    role: "React Native Developer",
    period: "2019 - 2020",
    location: "Chile",
    description: "Desarrollo del sistema de medición y registro para kinesiología, integrando hardware con software móvil. Implementación de herramientas para evaluar, analizar y estandarizar procedimientos cinéticos y fuerzas ejercidas para seguimiento clínico objetivo.",
    tech: ["React Native", "IoT", "Mobile Development"],
  },
  {
    company: "ESBrillante | Apreciasoft | Jamit Solution",
    role: "Web Developer",
    period: "2017 - 2019",
    location: "LatAm",
    description: "Desarrollo y mantenimiento de aplicaciones web personalizadas, implementación de funcionalidades frontend y soporte técnico en la construcción de productos digitales modernos para múltiples clientes y agencias en México y Argentina.",
    tech: ["JavaScript", "HTML/CSS", "PHP", "SQL"],
  },
];

const aboutData = {
  name: "Roiner Hernandez",
  title: "Ingeniero de Software Full Stack",
  bio: "Ingeniero de Software Full Stack con casi una década de experiencia diseñando y construyendo productos web y móviles escalables. Especializado en transformar contextos ambiguos en soluciones funcionales, conectando interfaces, APIs, bases de datos, automatizaciones e integraciones con IA.",
  location: "Valencia, Venezuela",
  email: "roiner123@gmail.com",
  specialties: ["Arquitecturas Modernas", "Desarrollo centrado en el producto", "IA & Automación", "Escalabilidad"],
  skills: {
    frontend: ["React", "Next.js", "React Native", "TypeScript", "Tailwind", "GraphQL"],
    backend: ["Node.js", "Python", "FastAPI", "REST APIs", "SQL", "NoSQL", "AWS", "Firebase"],
    tools_ia: ["Git", "Docker", "AI Agents", "MCPs", "n8n", "LLMs"],
  },
  education: "Ingeniería en Informática (UNEG)",
  status: "OPEN_FOR_NEW_PROJECTS",
  birthDate: "15/05/1994",
  phone: "+584148589600",
  projects: [
    {
      name: "Flashcardia",
      description: "Plataforma de aprendizaje con IA que reduce la fricción de crear tarjetas de estudio y convierte la práctica de vocabulario en entrenamiento activo.",
      tech: ["IA aplicada", "Language Learning", "Spaced Repetition", "AI Feedback", "Product Design", "React Native", "Supabase"],
    },
    {
      name: "Chatbot IA",
      description: "Agente comercial para WhatsApp construido con n8n. Automatiza atención, ventas y registro de pagos a partir de reglas de negocio escritas en lenguaje natural.",
      tech: ["N8N", "WhatsApp", "LLMs", "OCR", "Speech-to-Text", "Automatización", "Excel", "Prompt Logic"],
    },
  ],
};

const cvLanguages = [
  { label: 'Español', level: 'Nativo' },
  { label: 'English', level: 'B1 - B2' },
];

const projectEntries = [
  {
    displayName: 'Flashcardia',
    subtitle: 'De tarjetas manuales a práctica activa con IA.',
    category: 'Product',
    role: 'Diseño de producto, UX y arquitectura de funcionalidades con IA.',
    description: 'Plataforma de aprendizaje con IA que reduce la fricción de crear tarjetas de estudio y convierte la práctica de vocabulario en entrenamiento activo.',
    highlights: [
      'Problem: En herramientas como Anki, cada tarjeta debe crearse manualmente, lo que hace que preparar material de estudio sea lento y pesado.',
      'Solution: Flashcardia genera tarjetas completas con definición, pronunciación y ejemplos de uso, reduciendo la fricción de estudiar.',
      'Challenge Mode: Modo de práctica activa donde el usuario crea frases propias y recibe feedback de IA, una puntuación de 1 a 10 y ejemplos mejorados.',
      'Explore: Módulo para descubrir decks públicos, copiarlos y empezar a practicar rápidamente.',
    ],
    tech: ['IA aplicada', 'Language Learning', 'Spaced Repetition', 'AI Feedback', 'Product Design', 'React Native', 'Supabase'],
  },
  {
    displayName: 'WhatsApp Commerce Agent',
    subtitle: 'AGENTE COMERCIAL CONFIGURABLE PARA WHATSAPP',
    category: 'Automation',
    role: 'Automatización comercial con n8n, WhatsApp, reglas dinámicas e IA multimodal.',
    description: 'Agente comercial para WhatsApp construido con n8n. Automatiza atención, ventas y registro de pagos a partir de reglas de negocio escritas en lenguaje natural.',
    highlights: [
      'Problem: Muchos negocios atienden clientes por WhatsApp de forma manual y dependen de procesos repetitivos para responder consultas, validar pagos y registrar operaciones.',
      'Solution: El bot centraliza la atención y permite definir la lógica comercial desde un documento editable, sin modificar código.',
      'Business Rules: El negocio puede cambiar tono, personalidad, catálogo, respuestas, políticas o incluso gestionar distintas tiendas escribiendo nuevas reglas en el documento.',
      'Media Intelligence: El sistema interpreta mensajes, notas de audio e imágenes de WhatsApp para sostener conversaciones más naturales.',
      'Payment Tracking: Cuando detecta un comprobante de pago, analiza la imagen, extrae el monto y registra la operación en Excel/Sheets para control diario.',
    ],
    tech: ['N8N', 'WhatsApp', 'LLMs', 'OCR', 'Speech-to-Text', 'Automatización', 'Excel', 'Prompt Logic'],
  },
  {
    displayName: 'ucrop.it Traceability Platform',
    subtitle: 'PLATAFORMA B2B DE TRAZABILIDAD AGRÍCOLA',
    category: 'Platform',
    role: 'Desarrollo full stack de funcionalidades web, mobile, APIs y backoffice para una plataforma agrícola de trazabilidad.',
    description: 'Plataforma B2B de trazabilidad agrícola, sostenibilidad y cumplimiento normativo que conecta campos, cultivos, actividades, datos geoespaciales e informes ambientales en un ecosistema web, móvil y backoffice.',
    highlights: [
      'Traceability Flow: Construcción de flujos para registrar campos, cultivos y actividades, conectándolos con Crop Story y reportes de trazabilidad.',
      'Geo Intelligence: Creación de campos desde Google Maps o importación KMZ, con soporte para polígonos, imágenes satelitales y análisis histórico del terreno.',
      'Sustainability: Visualización de indicadores como huella de carbono, huella hídrica y CFT dentro de reportes ambientales asociados al cultivo.',
      'Compliance: Cálculo y generación de informes para normativas como 2BSvs, EPA y EUDR aplicadas a unidades productivas y compañías agrícolas.',
      'Delivery Scope: Desarrollo dentro de un equipo multidisciplinario de funcionalidades web, mobile, backoffice, APIs y servicios.',
    ],
    tech: ['React', 'Next.js', 'Expo', 'NestJS', 'Python', 'Google Maps', 'KMZ', 'Satellite Data', 'Traceability', 'Sustainability', 'Compliance'],
  },
  {
    displayName: 'Cal AI Nutrition Scanner',
    subtitle: 'APP MOBILE DE REGISTRO NUTRICIONAL CON IA',
    category: 'AI Tool',
    role: 'UX mobile para registro nutricional, análisis visual y corrección asistida por IA.',
    description: 'App mobile de registro nutricional con IA que estima calorías y macronutrientes a partir de una foto, permitiendo ajustar el resultado con correcciones en lenguaje natural.',
    highlights: [
      'Problem: Registrar comidas manualmente suele ser lento, impreciso y difícil de mantener como hábito diario.',
      'Vision Analysis: Detecta ingredientes, estima porciones, calorías y macronutrientes a partir de una foto tomada con la cámara o importada desde la galería.',
      'Conversational Refinement: Permite corregir el análisis con lenguaje natural, ajustando ingredientes o cantidades sin rehacer el registro.',
      'Progress Tracking: Muestra gráficas semanales para comparar consumo, objetivos configurados y patrones de alimentación.',
    ],
    tech: ['React Native', 'Computer Vision', 'LLMs', 'Nutrition AI', 'Data Visualization', 'Mobile UX'],
  },
];

export function buildPortfolioKnowledgeContext(): string {
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
    `Idiomas: ${cvLanguages.map((l) => `${l.label} (${l.level})`).join(', ')}`,
    `Experiencia profesional: ${experienceData.map((item) => `${item.company} | ${item.role} | ${item.period} | ${item.location} | ${item.description} | Tech: ${item.tech.join(', ')}`).join('\n')}`,
    `Proyectos destacados: ${projectEntries.map((project) => `${project.displayName} | ${project.subtitle} | ${project.category} | ${project.role} | ${project.description} | Highlights: ${project.highlights.join(' / ')} | Tech: ${project.tech.join(', ')}`).join('\n')}`,
    `Proyectos personales adicionales: ${aboutData.projects.map((project) => `${project.name} | ${project.description} | Tech: ${project.tech.join(', ')}`).join('\n')}`,
  ].join('\n');
}
