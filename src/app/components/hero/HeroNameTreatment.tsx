import { motion } from 'motion/react';

const LETTER_MAP: Record<string, number[][]> = {
  R: [[1,1,1,1], [1,0,0,1], [1,1,1,1], [1,1,0,0], [1,0,1,1]],
  O: [[1,1,1,1], [1,0,0,1], [1,0,0,1], [1,0,0,1], [1,1,1,1]],
  I: [[1,1,1], [0,1,0], [0,1,0], [0,1,0], [1,1,1]],
  N: [[1,1,0,1], [1,1,0,1], [1,0,1,1], [1,0,1,1], [1,0,0,1]],
  E: [[1,1,1,1], [1,0,0,0], [1,1,1,1], [1,0,0,0], [1,1,1,1]],
  H: [[1,0,0,1], [1,0,0,1], [1,1,1,1], [1,0,0,1], [1,0,0,1]],
  A: [[1,1,1,1], [1,0,0,1], [1,1,1,1], [1,0,0,1], [1,0,0,1]],
  D: [[1,1,1,0], [1,0,0,1], [1,0,0,1], [1,0,0,1], [1,1,1,0]],
  Z: [[1,1,1,1], [0,0,1,1], [0,1,1,0], [1,1,0,0], [1,1,1,1]],
  ' ': [[0], [0], [0], [0], [0]],
};

function BlockLetter({ 
  char, 
  activeColor = 'bg-white', 
  shadowColor = 'shadow-[1.5px_1.5px_0px_rgba(16,185,129,0.5),3px_3px_0px_rgba(16,185,129,0.1),-1px_-1px_0px_rgba(255,255,255,0.1)]' 
}: { 
  char: string, 
  activeColor?: string, 
  shadowColor?: string 
}) {
  const pattern = LETTER_MAP[char.toUpperCase()] || LETTER_MAP[' '];
  return (
    <div 
      className="grid gap-[1px] md:gap-[1.5px] p-0.5 flex-shrink-0" 
      style={{ 
        gridTemplateColumns: `repeat(${pattern[0].length}, minmax(0, 1fr))`,
        width: 'var(--block-letter-width)',
        '--block-letter-width': `calc(${pattern[0].length} * clamp(3px, 1vw + 1.15px, 12px))`
      } as any}
    >
      {pattern.flat().map((active, i) => (
        <div
          key={i}
          className={`aspect-square transition-all duration-700 ${
            active 
              ? `${activeColor} ${shadowColor}` 
              : 'bg-transparent'
          }`}
          style={{
            transitionDelay: `${i * 10}ms`
          }}
        />
      ))}
    </div>
  );
}

export function HeroNameTreatment() {
  // NEURAL MATRIX PULSE - CUSTOM ALTERNATING
  const emeraldShadow = 'shadow-[1.5px_1.5px_0px_#047857,3px_3px_0px_rgba(16,185,129,0.15),-1px_-1px_0px_rgba(255,255,255,0.1)]';
  const blackShadow = 'shadow-[1.5px_1.5px_0px_#000,3px_3px_0px_rgba(0,0,0,0.4),-1px_-1px_0px_rgba(255,255,255,0.05)]';

  return (
    <div className="space-y-4 md:space-y-8 lg:space-y-12 py-2 md:py-4 w-full max-w-full">
      <div className="flex max-w-full origin-left scale-[1.2] items-center gap-[2px] sm:scale-100 sm:gap-1 md:gap-2.5 lg:gap-4 overflow-visible">
        {"ROINER".split("").map((char, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.6 }}
            className="flex-shrink-0"
          >
            <BlockLetter 
              char={char} 
              activeColor={i % 2 === 0 ? "bg-emerald-500" : "bg-white"} 
              shadowColor={i % 2 === 0 ? blackShadow : emeraldShadow}
            />
          </motion.div>
        ))}
      </div>
      <div className="flex max-w-full origin-left scale-[1.2] items-center gap-[2px] sm:scale-100 sm:gap-1 md:gap-2.5 lg:gap-4 sm:ml-3 md:ml-6 lg:ml-12 overflow-visible">
        {"HERNANDEZ".split("").map((char, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08, duration: 0.6 }}
            className="flex-shrink-0"
          >
            <BlockLetter 
              char={char} 
              activeColor={i % 2 === 0 ? "bg-emerald-500" : "bg-white"}
              shadowColor={i % 2 === 0 ? blackShadow : emeraldShadow}
            />
          </motion.div>
        ))}
        <div
          className="hidden rounded-sm bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] sm:ml-2 sm:block sm:h-6 sm:w-2 md:ml-4 md:h-8 md:w-3 lg:h-10 lg:w-4"
        />
      </div>
    </div>
  );
}
