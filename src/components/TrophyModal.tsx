import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';

interface TrophyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrophyModal: React.FC<TrophyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] border-2 border-[#ffd700] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-[0_0_50px_rgba(255,215,0,0.3)]">
        <div className="w-20 h-20 bg-gradient-to-tr from-[#ffd700] to-[#e94560] rounded-full p-1 mx-auto flex items-center justify-center shadow-lg">
          <div className="w-full h-full bg-[#0f0f1e] rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-[#ffd700] animate-bounce" />
          </div>
        </div>

        <h3 className="font-orbitron font-extrabold text-xl text-white">
          Champion Cup
        </h3>
        <p className="text-xs text-slate-300">
          Awarded to victorious tournament squad captains with automated cash prize crediting.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#ffd700] hover:bg-[#e6c200] text-slate-900 font-orbitron font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
        >
          Close Inspection
        </button>
      </div>
    </div>
  );
};