import { HeroVideo } from './components/hero/HeroVideo';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ContactSection } from './components/ContactSection';
import { TerminalOverlay } from './components/ui/TerminalOverlay';
import { LanguageProvider } from '../lib/i18n/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <div className="overflow-x-clip bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
        <TerminalOverlay />
        <main>
          <HeroVideo />
        </main>
      </div>
    </LanguageProvider>
  );
}
