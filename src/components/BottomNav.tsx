import React from 'react';
import { Trophy, Wallet, Gamepad2, LogOut, Bot } from 'lucide-react';
import { playSfx } from '../utils/sound';

interface BottomNavProps {
  activeTab: 'tournaments' | 'wallet' | 'myTournaments' | 'telegramBot';
  onTabChange: (tab: 'tournaments' | 'wallet' | 'myTournaments' | 'telegramBot') => void;
  onLogout: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onLogout,
}) => {
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f1e]/90 backdrop-blur-xl border-t-2 border-[#e94560] shadow-[0_-5px_25px_rgba(233,69,96,0.3)] px-3 py-2 flex items-center justify-around">
        
        <button
          id="navTournaments"
          onClick={() => {
            playSfx(500, 'sine');
            onTabChange('tournaments');
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 text-xs font-bold font-rajdhani transition-all cursor-pointer ${
            activeTab === 'tournaments'
              ? 'text-[#e94560] scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>Tournaments</span>
        </button>

        <button
          id="navMyTournaments"
          onClick={() => {
            playSfx(550, 'sine');
            onTabChange('myTournaments');
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 text-xs font-bold font-rajdhani transition-all cursor-pointer ${
            activeTab === 'myTournaments'
              ? 'text-[#00f3ff] scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span>My Matches</span>
        </button>

        <button
          id="navWallet"
          onClick={() => {
            playSfx(600, 'sine');
            onTabChange('wallet');
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 text-xs font-bold font-rajdhani transition-all cursor-pointer ${
            activeTab === 'wallet'
              ? 'text-[#ffd700] scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Wallet</span>
        </button>

        <button
          id="navTelegramBot"
          onClick={() => {
            playSfx(750, 'sine');
            onTabChange('telegramBot');
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 text-xs font-bold font-rajdhani transition-all cursor-pointer relative ${
            activeTab === 'telegramBot'
              ? 'text-[#00f3ff] scale-105'
              : 'text-[#2481cc] hover:text-[#00f3ff]'
          }`}
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#2ecc71] animate-ping" />
          </div>
          <span>Support Bot</span>
        </button>

        <button
          onClick={() => {
            playSfx(300, 'sawtooth');
            onLogout();
          }}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 text-xs font-bold font-rajdhani text-slate-400 hover:text-[#e94560] transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>

      </nav>

      {/* Floating Telegram Customer Service Launcher */}
      <div id="supportFabContainer" className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2.5">
        <button
          onClick={() => {
            playSfx(750, 'sine');
            onTabChange('telegramBot');
          }}
          className="bg-[#17212b]/95 border border-[#2481cc] text-[#00f3ff] text-[11px] font-bold font-orbitron px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(36,129,204,0.4)] flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer"
        >
          <Bot className="w-3.5 h-3.5 text-[#00f3ff]" />
          <span>24/7 Telegram Bot</span>
          <span className="w-2 h-2 rounded-full bg-[#2ecc71]" />
        </button>

        <button
          onClick={() => {
            playSfx(750, 'sine');
            onTabChange('telegramBot');
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#2481cc] via-[#00f3ff] to-[#2481cc] p-0.5 shadow-[0_0_25px_rgba(0,243,255,0.6)] flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all cursor-pointer"
          aria-label="Open Telegram Customer Service Bot"
          title="24/7 Esports Customer Support Bot"
        >
          <div className="w-full h-full rounded-full bg-[#17212b] flex items-center justify-center overflow-hidden border border-white/40">
            <Bot className="w-7 h-7 text-[#00f3ff]" />
          </div>
        </button>
      </div>
    </>
  );
};