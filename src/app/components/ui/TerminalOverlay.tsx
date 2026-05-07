import React from 'react';

export const TerminalOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden">
      {/* CRT Vignette (Radial gradient) */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 80%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      
      {/* Scanlines Effect */}
      <div 
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        style={{
          background: 'repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 2px)',
          backgroundSize: '100% 2px'
        }}
      />
    </div>
  );
};
