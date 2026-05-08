import { Mail, Github, Linkedin, MessageCircle, Twitter } from 'lucide-react';

export function ContactSection() {
  const socialLinks = [
    { icon: Github, label: 'GitHub', href: 'https://github.com/Roiner994', username: 'github.com/Roiner994' },
    { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/roiner-hernandez-a6314894/', username: 'linkedin.com/in/roiner-hernandez-a6314894' },
    { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/584148589600', username: '+58 414 858 9600' },
    { icon: Mail, label: 'Email', href: 'mailto:roiner123@gmail.com', username: 'roiner123@gmail.com' },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl w-full">
        {/* Terminal Window */}
        <div className="bg-zinc-800 rounded-t-lg border border-zinc-700 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
          <div className="text-zinc-400 text-sm ml-4 font-mono">
            contact.sh
          </div>
        </div>

        {/* Contact Content */}
        <div className="bg-zinc-900/95 border border-t-0 border-zinc-700 rounded-b-lg p-8">
          <div className="font-mono">
            {/* Header */}
            <div className="mb-8">
              <div className="text-emerald-500 mb-2">
                <span className="text-zinc-600">$</span> ./contact.sh --connect
              </div>
              <div className="text-zinc-400 mb-4">
                Conectando con redes sociales...
              </div>
              <h2 className="text-3xl text-zinc-100 mb-2">
                Construyamos algo juntos
              </h2>
              <p className="text-zinc-400">
                Siempre abierto a nuevas oportunidades y colaboraciones
              </p>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="group flex items-center gap-4 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-emerald-500/50 transition-all duration-300"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                      <Icon className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-zinc-100 group-hover:text-emerald-400 transition-colors">
                        {social.label}
                      </div>
                      <div className="text-sm text-zinc-500">
                        {social.username}
                      </div>
                    </div>
                    <div className="text-zinc-600 group-hover:text-emerald-500 transition-colors">
                      →
                    </div>
                  </a>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-8 p-6 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-lg">
              <div className="text-emerald-500 mb-2">
                <span className="text-zinc-600">$</span> echo "Estado: Disponible para freelance"
              </div>
              <div className="text-zinc-300 mb-4">
                Estado: Disponible para freelance ✓
              </div>
              <a
                href="mailto:tu@email.com"
                className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-900 rounded-lg transition-colors"
              >
                Enviar mensaje
              </a>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-zinc-800 text-zinc-600 text-sm">
              <div>© 2026 Roiner Hernandez. Hecho con React + Tailwind</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
