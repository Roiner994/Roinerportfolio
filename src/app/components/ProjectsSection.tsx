import { Github, ExternalLink, Terminal } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'E-commerce Platform',
    description: 'Plataforma de comercio electrónico full-stack con React, Node.js y PostgreSQL',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    github: '#',
    live: '#',
  },
  {
    id: 2,
    title: 'Task Management App',
    description: 'Aplicación de gestión de tareas con autenticación y tiempo real',
    tech: ['Next.js', 'Supabase', 'Tailwind', 'TypeScript'],
    github: '#',
    live: '#',
  },
  {
    id: 3,
    title: 'AI Chat Interface',
    description: 'Interfaz de chat con IA usando OpenAI API y streaming de respuestas',
    tech: ['React', 'OpenAI', 'Express', 'WebSockets'],
    github: '#',
    live: '#',
  },
  {
    id: 4,
    title: 'Analytics Dashboard',
    description: 'Dashboard de analíticas en tiempo real con visualización de datos',
    tech: ['Vue.js', 'D3.js', 'Firebase', 'Charts'],
    github: '#',
    live: '#',
  },
];

export function ProjectsSection() {
  return (
    <div className="min-h-screen bg-zinc-900 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-8 h-8 text-emerald-500" />
            <h2 className="text-4xl font-mono text-emerald-500">
              <span className="text-zinc-400">~/</span>proyectos
            </h2>
          </div>
          <p className="text-zinc-400 font-mono text-lg ml-11">
            Una colección de mis trabajos recientes y experimentos
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="group relative bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-6 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Project Number */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 text-zinc-900 rounded-full flex items-center justify-center font-mono font-bold">
                {String(project.id).padStart(2, '0')}
              </div>

              {/* Project Content */}
              <h3 className="text-xl font-mono text-emerald-400 mb-3 group-hover:text-emerald-300 transition-colors">
                {project.title}
              </h3>

              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-zinc-900/80 text-emerald-400 text-xs font-mono rounded border border-zinc-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex gap-4 mt-6 pt-4 border-t border-zinc-700">
                <a
                  href={project.github}
                  className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-mono"
                >
                  <Github className="w-4 h-4" />
                  <span>Código</span>
                </a>
                <a
                  href={project.live}
                  className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-mono"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Demo</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
