import React from 'react';
import { UserProfile } from '../types';
import { Trophy, Gift, Zap, Shield, Sparkles } from 'lucide-react';
import { INITIAL_WELCOME_BONUS } from '../firebase';

interface DashboardBannerProps {
  userData: UserProfile | null;
}

export const DashboardBanner: React.FC<DashboardBannerProps> = ({ userData }) => {
  const bonusBal = userData?.wallet?.bonus || 0;
  const depBal = userData?.wallet?.deposited || 0;
  const joinedCount = Object.keys(userData?.joinedTournaments || {}).length;

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-[#e94560]/50 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6 sm:p-8 shadow-[0_10px_35px_rgba(233,69,96,0.25)]">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Welcome Content */}
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-[#ffd700]/20 border border-[#ffd700] px-3 py-1 rounded-full text-xs font-bold text-[#ffd700]">
            <Gift className="w-3.5 h-3.5" />
            <span>₹{INITIAL_WELCOME_BONUS} Welcome Bonus Active</span>
            <Sparkles className="w-3 h-3" />
          </div>

          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white tracking-wide">
            Welcome back, <span className="text-[#00f3ff]">{userData?.name || 'Champion'}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Compete in verified daily custom rooms for BGMI, Free Fire, COD Mobile, and PUBG Mobile. Instant automated UPI prize payouts directly to your account.
          </p>
        </div>

        {/* Right Stats Quick Grid */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-black/40 border border-white/10 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Rank</span>
            <span className="font-orbitron font-bold text-sm text-[#ffd700] flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#ffd700]" />
              {userData?.rank || 'SILVER'}
            </span>
          </div>

          <div className="bg-black/40 border border-white/10 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Matches</span>
            <span className="font-orbitron font-bold text-sm text-[#00f3ff] flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[#00f3ff]" />
              {joinedCount}
            </span>
          </div>

          <div className="bg-black/40 border border-[#2ecc71]/40 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-[#2ecc71] font-bold uppercase block">Wallet</span>
            <span className="font-orbitron font-bold text-sm text-[#2ecc71]">
              ₹{bonusBal + depBal}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};