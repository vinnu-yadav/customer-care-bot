import React from 'react';
import { Trophy, Wallet, Sparkles, Download, Bot } from 'lucide-react';
import { playSfx } from '../utils/sound';

interface NavbarProps {
  userName: string;
  totalBalance: number;
  onOpenWallet: () => void;
  onOpenTrophyModal: () => void;
  onOpenTelegramBot?: () => void;
  activeTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  totalBalance,
  onOpenWallet,
  onOpenTrophyModal,
  onOpenTelegramBot,
  activeTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0f0f1e]/85 backdrop-blur-xl border-b-2 border-[#e94560] shadow-[0_5px_25px_rgba(233,69,96,0.25)] px-4 sm:px-8 py-3 flex items-center justify-between">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e94560] to-[#00f3ff] p-0.5 shadow-[0_0_15px_rgba(233,69,96,0.6)]">
          <div className="w-full h-full bg-[#0f0f1e] rounded-[10px] flex items-center justify-center">
            <Trophy className="w-5 h-5 text-[#ffd700]" />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-orbitron font-extrabold text-lg sm:text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-[#00f3ff]">
              ARENA X
            </span>
            <span className="text-[10px] bg-[#e94560]/20 text-[#e94560] border border-[#e94560]/40 px-1.5 py-0.2 rounded font-bold uppercase tracking-widest hidden sm:inline">
              ESPORTS
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            BGMI • FREE FIRE • COD • PUBG
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Telegram Bot Direct Navigation */}
        {onOpenTelegramBot && (
          <button
            id="nav-telegram-bot-btn"
            onClick={() => {
              playSfx(700, 'sine');
              onOpenTelegramBot();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold font-rajdhani text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'telegramBot'
                ? 'bg-[#2481cc] text-white border border-[#00f3ff] shadow-[0_0_15px_#2481cc]'
                : 'bg-[#2481cc]/20 border border-[#2481cc]/60 text-[#00f3ff] hover:bg-[#2481cc]/35 hover:scale-105 shadow-[0_0_10px_rgba(36,129,204,0.3)]'
            }`}
            title="24/7 Telegram Customer Service Bot"
          >
            <Bot className="w-4 h-4 text-[#00f3ff] animate-pulse" />
            <span className="hidden sm:inline">Telegram Bot</span>
            <span className="w-2 h-2 rounded-full bg-[#2ecc71] inline-block animate-ping"></span>
          </button>
        )}

        {/* Direct HTML File Download Button */}
        <a
          id="nav-download-file-btn"
          href="/arena-x-tournament.html"
          download="arena-x-tournament.html"
          onClick={() => playSfx(660, 'sine')}
          className="hidden md:flex items-center gap-1.5 bg-[#00f3ff]/15 border border-[#00f3ff]/40 text-[#00f3ff] text-xs sm:text-sm font-bold font-rajdhani px-3 py-1.5 rounded-xl shadow-[0_0_12px_rgba(0,243,255,0.2)] hover:bg-[#00f3ff]/25 hover:border-[#00f3ff] hover:scale-105 transition-all cursor-pointer"
          title="Download standalone single-file HTML version"
        >
          <Download className="w-4 h-4 text-[#00f3ff]" />
          <span>Download</span>
        </a>

        {/* 3D Champion Trophy Inspection Button */}
        <button
          id="nav-trophy-inspect-btn"
          onClick={() => {
            playSfx(880, 'triangle');
            onOpenTrophyModal();
          }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#ffd700]/20 to-[#e94560]/30 border border-[#ffd700] text-[#ffd700] text-xs sm:text-sm font-bold font-rajdhani px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:bg-[#ffd700]/30 hover:scale-105 transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-[#ffd700]" />
          <span className="hidden lg:inline">3D Trophy</span>
          <Sparkles className="w-3 h-3 animate-spin hidden sm:inline" />
        </button>

        {/* User Tag */}
        <div className="hidden sm:flex items-center gap-2 bg-[#1a1a2e] border border-white/10 px-3 py-1 rounded-full">
          <img
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${userName || 'gamer'}`}
            alt="avatar"
            className="w-5 h-5 rounded-full bg-[#e94560]"
          />
          <span
            id="userNameDisplay"
            className="font-bold text-xs text-[#00f3ff] max-w-[90px] truncate"
          >
            {userName}
          </span>
        </div>

        {/* Wallet Balance Pill */}
        <button
          id="nav-wallet-pill"
          onClick={() => {
            playSfx(600, 'sine');
            onOpenWallet();
          }}
          className="flex items-center gap-2 bg-gradient-to-br from-[#e94560]/20 to-[#00f3ff]/15 border border-[#e94560] px-3 py-1.5 rounded-full font-orbitron font-bold text-xs sm:text-sm text-white shadow-[0_0_12px_rgba(233,69,96,0.3)] hover:scale-105 hover:border-[#00f3ff] hover:shadow-[0_0_18px_rgba(0,243,255,0.5)] transition-all cursor-pointer"
        >
          <Wallet className="w-4 h-4 text-[#ffd700]" />
          <span>₹<span id="totalWallet">{totalBalance}</span></span>
        </button>

      </div>
    </header>
  );
};