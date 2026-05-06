import { HeroVariant3 } from './components/hero/HeroVariant3';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ContactSection } from './components/ContactSection';

export default function App() {
  return (
    <div className="bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
      <main>
        <HeroVariant3 />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </main>
    </div>
  );
}