import React from 'react';
import { ArenaTheme } from '../types';

interface EsportsBackgroundProps {
  theme?: ArenaTheme;
}

export const EsportsBackground: React.FC<EsportsBackgroundProps> = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dark Grid Background */}
      <div
        className="absolute inset-0 bg-[#0a0a14] opacity-95"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(233, 69, 96, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 243, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      {/* Subtle glowing ambient spheres */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#e94560]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#00f3ff]/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};