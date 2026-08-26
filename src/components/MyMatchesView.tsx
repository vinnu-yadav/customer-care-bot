import React, { useState } from 'react';
import { Tournament, UserProfile } from '../types';
import { Key, Copy, Check, Gamepad2, ShieldAlert } from 'lucide-react';
import { playSfx } from '../utils/sound';

interface MyMatchesViewProps {
  tournaments: Record<string, Tournament>;
  userData: UserProfile | null;
  onOpenTournaments: () => void;
}

export const MyMatchesView: React.FC<MyMatchesViewProps> = ({
  tournaments,
  userData,
  onOpenTournaments
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const joinedMap = userData?.joinedTournaments || {};
  const joinedIds = Object.keys(joinedMap);

  const copyCreds = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    playSfx(900, 'sine');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (joinedIds.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center mx-auto text-[#00f3ff]">
          <Gamepad2 className="w-8 h-8" />
        </div>
        <h3 className="font-orbitron font-bold text-lg text-white">No Matches Joined Yet</h3>
        <p className="text-xs text-slate-400">
          Browse active BGMI, Free Fire, and COD Mobile tournaments to reserve your custom room slot.
        </p>
        <button
          onClick={onOpenTournaments}
          className="py-2.5 px-6 bg-[#e94560] text-white font-orbitron font-bold text-xs rounded-xl uppercase hover:scale-105 transition-all cursor-pointer"
        >
          Browse Tournaments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="font-orbitron font-bold text-xl text-white">
        My Joined Tournaments & Room Credentials
      </h2>

      <div className="space-y-4">
        {joinedIds.map((id) => {
          const t = tournaments[id];
          if (!t) return null;

          return (
            <div
              key={id}
              className="bg-[#1a1a2e] border-2 border-[#00f3ff]/50 rounded-2xl p-5 shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#e94560] uppercase">{t.game}</span>
                  <h3 className="font-orbitron font-bold text-base text-white">{t.name}</h3>
                </div>
                <span className="text-xs text-[#ffd700] font-mono">{t.dateTime}</span>
              </div>

              {/* Room Pass Box */}
              <div className="bg-[#0f0f1e] p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500">Room ID:</span> <span className="font-mono font-bold text-[#00f3ff]">{t.roomUid || 'Published 15m prior'}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500">Password:</span> <span className="font-mono font-bold text-[#ffd700]">{t.roomPassword || 'Published 15m prior'}</span>
                  </div>
                </div>

                <button
                  onClick={() => copyCreds(`Room ID: ${t.roomUid}\nPassword: ${t.roomPassword}`, id)}
                  className="px-3.5 py-2 bg-[#2481cc]/30 hover:bg-[#2481cc]/60 border border-[#2481cc] text-[#00f3ff] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedId === id ? <Check className="w-3.5 h-3.5 text-[#2ecc71]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === id ? 'Copied!' : 'Copy Room Pass'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};