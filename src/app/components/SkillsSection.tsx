import { Code2, Database, Palette, Zap } from 'lucide-react';

const skillCategories = [
  {
    icon: Code2,
    title: 'Frontend',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Vue.js'],
  },
  {
    icon: Database,
    title: 'Backend',
    skills: ['Node.js', 'PostgreSQL', 'MongoDB', 'Express', 'REST APIs'],
  },
  {
    icon: Palette,
    title: 'Design',
    skills: ['Figma', 'UI/UX', 'Responsive Design', 'Animations', 'Prototyping'],
  },
  {
    icon: Zap,
    title: 'Tools',
    skills: ['Git', 'Docker', 'CI/CD', 'AWS', 'Testing'],
  },
];

export function SkillsSection() {
  return (
    <div className="min-h-screen bg-zinc-950 py-20 px-6 flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        {/* Terminal-style header */}
        <div className="mb-12">
          <div className="font-mono text-emerald-500 mb-2">
            <span className="text-zinc-600">$</span> cat skills.json
          </div>
          <h2 className="text-4xl font-mono text-zinc-100 ml-4">
            Tech Stack
          </h2>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-emerald-500/30 transition-all duration-300"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/20">
                  <Icon className="w-6 h-6 text-emerald-500" />
                </div>

                {/* Category Title */}
                <h3 className="text-lg font-mono text-emerald-400 mb-4">
                  {category.title}
                </h3>

                {/* Skills List */}
                <ul className="space-y-2">
                  {category.skills.map((skill) => (
                    <li
                      key={skill}
                      className="text-zinc-400 text-sm font-mono flex items-center gap-2"
                    >
                      <span className="text-emerald-500">→</span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Terminal output style footer */}
        <div className="mt-12 p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg font-mono text-sm">
          <div className="text-emerald-500">
            <span className="text-zinc-600">$</span> echo "Siempre aprendiendo nuevas tecnologías..."
          </div>
          <div className="text-zinc-400 mt-1">
            Siempre aprendiendo nuevas tecnologías...
          </div>
        </div>
      </div>
    </div>
  );
}
