import React, { createContext, useContext, useState, useEffect } from 'react';
import { portfolioData, type ExperienceEntry, type AboutData, type CvData, type ProjectEntry } from '../../data/portfolioProfile';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  data: {
    experience: ExperienceEntry[];
    about: AboutData;
    cv: CvData;
    projects: ProjectEntry[];
  };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const uiStrings = {
  es: {
    'QUICK_ACCESS_COMMANDS': 'COMANDOS_DE_ACCESO_RAPIDO',
    'READ_ONLY_MODE': 'MODO_SOLO_LECTURA',
    'AI_NEURAL_LINK': 'AI_NEURAL_LINK :: ACTIVO',
    'AI_WELCOME': 'Bienvenido al modo IA. Puedes preguntarme sobre mi experiencia, proyectos, habilidades, disponibilidad y forma de trabajar.',
    'AI_HELP': 'Puedes preguntarme sobre mis habilidades, experiencia, ubicacion, disponibilidad, educacion, proyectos, stack o contacto. Usa clear para reiniciar la conversacion y exit o back para salir del modo ai.',
    'AI_ERROR': 'No pude conectarme con el modo ai en este momento. Revisa la configuracion de OPENROUTER_API_KEY o intenta de nuevo en unos segundos.',
    'AI_LOCAL_SETUP': 'El endpoint /api/chat no esta disponible en este entorno. Para probar el modo ai real en local, inicia la app con `npm run dev:vercel` o `vercel dev`.',
    'AI_FORBIDDEN': 'El endpoint /api/chat devolvio 403 Forbidden. Revisa Vercel Authentication, Deployment Protection o cualquier regla que este bloqueando la funcion.',
    'SUGGESTED_QUESTIONS_LABEL': 'PREGUNTAS_SUGERIDAS',
    'SUGGESTED_Q1': '¿Qué tipo de productos ha construido Roiner?',
    'SUGGESTED_Q2': '¿Cuál es su stack principal?',
    'SUGGESTED_Q3': '¿Qué experiencia tiene con IA y automatización?',
    'SUGGESTED_Q4': '¿Qué proyecto muestra mejor su experiencia full stack?',
    'SUGGESTED_Q5': '¿Está disponible para nuevas oportunidades?',
    'SUGGESTED_Q6': '¿Qué valor puede aportar Roiner a tu equipo?',
    'HERO_TITLE': 'Ingeniero de Software',
    'HERO_SUBTITLE': 'Me gusta construir productos que resuelvan problemas reales. Combino frontend, backend y pensamiento de producto para transformar ideas complejas en experiencias simples, útiles y escalables.',
    'SYSTEM_ACTIVE': 'Sistema Neural Activo',
    'EXPERTISE': 'ESPECIALIDAD',
    'PLACEHOLDER_AI': 'Pregunta sobre habilidades, experiencia, proyectos o disponibilidad...',
    'PLACEHOLDER_SHELL': 'Escribe lo que quieras aquí...',
    'LABEL_LOCATION': 'UBICACIÓN',
    'LABEL_EDUCATION': 'EDUCACIÓN',
    'LABEL_BORN': 'NACIMIENTO',
    'LABEL_STATUS': 'ESTADO',
    'NEURAL_SKILL_MATRIX': 'MATRIZ_DE_HABILIDADES_NEURALES',
    'EXPLORER': 'EXPLORADOR',
    'WORKSPACE': 'ESPACIO_DE_TRABAJO',
    'PRESS': 'Presiona',
    'TO_OPEN': 'para abrir',
    'TO_GO_CONTACT': 'para ir a contacto',
    'CONTACT_TITLE': 'Construyamos algo',
    'CONTACT_TITLE_HIGHLIGHT': 'útil.',
    'CONTACT_SUBTITLE': 'Estoy disponible para oportunidades full-time, proyectos freelance y colaboraciones de producto. Si tienes una idea, un equipo o un problema que valga la pena resolver, conversemos.',
    'EXECUTE': 'EJECUTAR',
    'LANGUAGE_PROTOCOLS': 'Protocolos de lenguaje',
    'AI_THINKING': 'pensando...',
    'AI_CONSULTING_CONTEXT': 'consultando contexto del portfolio...',
    'AI_ENDPOINT_RETURNED': 'El endpoint /api/chat devolvió',
    'AI_TOUCH_HINT': 'Toca aquí para entrar al modo IA',
    'AI_OPEN_HINT': 'abrir modo IA',
    'TOUCH_NEXT_SECTION': 'Toca aquí para ir a la siguiente sección',
    'PARA': 'para',
    'CONTINUE': 'continuar',
    'FINISH': 'finalizar',
    'SYSTEM_RETRIEVING_LOGS': 'Recuperando registros de secure-vault-01... [LISTO]',
    'SYSTEM_SECURE_RELAY': 'Relé seguro en línea. Canales preferidos montados y listos... [OK]',
    'SYSTEM_READING_ASSETS': 'Leyendo activos del sistema... [LISTO]',
    'SKILL_FRONTEND': 'Frontend',
    'SKILL_BACKEND': 'Backend',
    'SKILL_MOBILE': 'Móvil',
    'SKILL_TOOLS_IA': 'TOOLS/IA',
    'SKILL_OTHERS': 'Otros',
    'STATUS_OPEN_TO_NEW_PROJECTS': 'Abierto a nuevos proyectos',
    'PROJECT_EXTERNAL_RESOURCES': 'Recursos externos',
    'PROJECT_CONTEXT': 'Contexto del proyecto',
    'PROJECT_IMPACT': 'Impacto del producto',
    'PROJECT_STACK': 'Tecnologías',
    'PROJECT_CORE_FOCUS_AREAS': 'Áreas de enfoque principales',
    'PROJECT_DELIVERY_SCOPE': 'Alcance de entrega',
    'PROJECT_ARCHITECTURE': 'Arquitectura del proceso',
    'EXIT_AI_LINK': 'SALIR_MODO_IA',
    'DIGITAL_GUIDE': 'Guía Digital',
    'SESSION': 'Sesión',
    'LAST_LOGIN': 'Último acceso',
    'WELCOME_WORKSPACE': 'Bienvenido a mi espacio neuronal. ¿Cómo puedo ayudarte hoy?',
    'SYSTEM_READY_NAVIGATION': 'Sistema listo. Usa el terminal de abajo para navegar o haz clic en un comando.',
    'CURRICULUM_VITAE': 'Curriculum Vitae',
    'PROFESSIONAL_PROFILE': 'Perfil Profesional_v8.4',
    'ASSET_TERMINAL': 'Terminal de activos',
    'SELECT_MANIFEST': 'Selecciona un manifiesto para iniciar el protocolo de descarga.',
    'FORMAT': 'Formato',
    'ACCESS': 'Acceso',
    'GOTO': 'IR A:',
  },
  en: {
    'QUICK_ACCESS_COMMANDS': 'QUICK_ACCESS_COMMANDS',
    'READ_ONLY_MODE': 'READ_ONLY_MODE',
    'AI_NEURAL_LINK': 'AI_NEURAL_LINK :: ACTIVE',
    'AI_WELCOME': 'Welcome to AI mode. You can ask me about my experience, projects, skills, availability, and how I work.',
    'AI_HELP': 'You can ask me about my skills, experience, location, availability, education, projects, stack, or contact. Use clear to reset the conversation and exit or back to leave AI mode.',
    'AI_ERROR': 'I couldn\'t connect to AI mode right now. Check OPENROUTER_API_KEY settings or try again in a few seconds.',
    'AI_LOCAL_SETUP': 'The /api/chat endpoint is not available in this environment. To test real AI mode locally, start the app with `npm run dev:vercel` or `vercel dev`.',
    'AI_FORBIDDEN': 'The /api/chat endpoint returned 403 Forbidden. Check Vercel Authentication, Deployment Protection, or any rule blocking the function.',
    'SUGGESTED_QUESTIONS_LABEL': 'SUGGESTED_QUESTIONS',
    'SUGGESTED_Q1': 'What kind of products has Roiner built?',
    'SUGGESTED_Q2': 'What is his main stack?',
    'SUGGESTED_Q3': 'What experience does he have with AI and automation?',
    'SUGGESTED_Q4': 'Which project best shows his full stack experience?',
    'SUGGESTED_Q5': 'Is he available for new opportunities?',
    'SUGGESTED_Q6': 'What value can Roiner bring to your team?',
    'HERO_TITLE': 'Software Engineer',
    'HERO_SUBTITLE': 'I like building products that solve real problems. I combine frontend, backend, and product thinking to transform complex ideas into simple, useful, and scalable experiences.',
    'SYSTEM_ACTIVE': 'Neural System Active',
    'EXPERTISE': 'EXPERTISE',
    'PLACEHOLDER_AI': 'Ask about skills, experience, projects, or availability...',
    'PLACEHOLDER_SHELL': 'Type anything here...',
    'LABEL_LOCATION': 'LOCATION',
    'LABEL_EDUCATION': 'EDUCATION',
    'LABEL_BORN': 'BORN',
    'LABEL_STATUS': 'STATUS',
    'NEURAL_SKILL_MATRIX': 'NEURAL_SKILL_MATRIX',
    'EXPLORER': 'EXPLORER',
    'WORKSPACE': 'WORKSPACE',
    'PRESS': 'Press',
    'TO_OPEN': 'to open',
    'TO_GO_CONTACT': 'to go to contact',
    'CONTACT_TITLE': 'Let\'s build something',
    'CONTACT_TITLE_HIGHLIGHT': 'useful.',
    'CONTACT_SUBTITLE': 'I am available for full-time opportunities, freelance projects, and product collaborations. If you have an idea, a team, or a problem worth solving, let\'s talk.',
    'EXECUTE': 'EXECUTE',
    'LANGUAGE_PROTOCOLS': 'Language protocols',
    'AI_THINKING': 'thinking...',
    'AI_CONSULTING_CONTEXT': 'consulting portfolio context...',
    'AI_ENDPOINT_RETURNED': 'The /api/chat endpoint returned',
    'AI_TOUCH_HINT': 'Tap here to enter AI mode',
    'AI_OPEN_HINT': 'open AI mode',
    'TOUCH_NEXT_SECTION': 'Tap here to go to the next section',
    'PARA': 'to',
    'CONTINUE': 'continue',
    'FINISH': 'finish',
    'SYSTEM_RETRIEVING_LOGS': 'Retrieving logs from secure-vault-01... [DONE]',
    'SYSTEM_SECURE_RELAY': 'Secure relay online. Preferred channels mounted and ready... [OK]',
    'SYSTEM_READING_ASSETS': 'Reading system assets... [DONE]',
    'SKILL_FRONTEND': 'Frontend',
    'SKILL_BACKEND': 'Backend',
    'SKILL_MOBILE': 'Mobile',
    'SKILL_TOOLS_IA': 'TOOLS/IA',
    'SKILL_OTHERS': 'Others',
    'STATUS_OPEN_TO_NEW_PROJECTS': 'Open to new projects',
    'PROJECT_EXTERNAL_RESOURCES': 'External Resources',
    'PROJECT_CONTEXT': 'Project context',
    'PROJECT_IMPACT': 'Product impact',
    'PROJECT_STACK': 'Stack',
    'PROJECT_CORE_FOCUS_AREAS': 'Core focus areas',
    'PROJECT_DELIVERY_SCOPE': 'Delivery scope',
    'PROJECT_ARCHITECTURE': 'Process architecture',
    'EXIT_AI_LINK': 'EXIT_AI_MODE',
    'DIGITAL_GUIDE': 'Digital Guide',
    'SESSION': 'Session',
    'LAST_LOGIN': 'Last login',
    'WELCOME_WORKSPACE': 'Welcome to my neural workspace. How can I assist your exploration today?',
    'SYSTEM_READY_NAVIGATION': 'System ready. Use the terminal below to navigate or click a command.',
    'CURRICULUM_VITAE': 'Curriculum Vitae',
    'PROFESSIONAL_PROFILE': 'Professional Profile_v8.4',
    'ASSET_TERMINAL': 'Asset Terminal',
    'SELECT_MANIFEST': 'Select a manifest to initialize the download protocol.',
    'FORMAT': 'Format',
    'ACCESS': 'Access',
    'GOTO': 'GOTO:',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('portfolio-language');
    return (saved === 'en' || saved === 'es') ? saved : 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('portfolio-language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    document.title =
      language === 'es'
        ? 'Roiner Hernandez | Portafolio'
        : 'Roiner Hernandez | Portfolio';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  const t = (key: string) => {
    return uiStrings[language][key as keyof typeof uiStrings['es']] || key;
  };

  const data = portfolioData[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, data }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
