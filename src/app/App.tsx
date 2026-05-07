import { HeroVariant3 } from './components/hero/HeroVariant3';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ContactSection } from './components/ContactSection';
import { TerminalOverlay } from './components/ui/TerminalOverlay';

export default function App() {
  return (
    <div className="bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
      <TerminalOverlay />
      <main>
        <HeroVariant3 />
      </main>
    </div>
  );
}