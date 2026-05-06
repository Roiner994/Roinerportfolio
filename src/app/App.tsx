import { useState } from 'react';
import { HeroVariant1 } from './components/hero/HeroVariant1';
import { HeroVariant2 } from './components/hero/HeroVariant2';
import { HeroVariant3 } from './components/hero/HeroVariant3';

export default function App() {
  const [activeVariant, setActiveVariant] = useState<1 | 2 | 3>(1);

  return (
    <div className="bg-slate-950 text-slate-100">
      {/* Variant Selector */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        {[1, 2, 3].map((variant) => (
          <button
            key={variant}
            onClick={() => setActiveVariant(variant as 1 | 2 | 3)}
            className={`
              px-4 py-2 rounded-lg font-mono text-sm transition-all
              ${activeVariant === variant
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 border border-slate-700'
              }
            `}
          >
            V{variant}
          </button>
        ))}
      </div>

      {/* Hero Variants */}
      {activeVariant === 1 && <HeroVariant1 />}
      {activeVariant === 2 && <HeroVariant2 />}
      {activeVariant === 3 && <HeroVariant3 />}
    </div>
  );
}