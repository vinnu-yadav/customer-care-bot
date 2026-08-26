import React, { useState } from 'react';
import { Tournament, UserProfile } from '../types';
import { Trophy, Clock, Users, Swords, ShieldAlert, Sparkles, Check, ChevronRight } from 'lucide-react';
import { playSfx } from '../utils/sound';

interface TournamentsViewProps {
  tournaments: Record<string, Tournament>;
  userData: UserProfile | null;
  onJoinTournament: (tournamentId: string, playerData: { inGameName: string; inGameUid: string }) => Promise<void>;
  onOpenWallet: () => void;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  tournaments,
  userData,
  onOpenWallet
}) => {
  const [selectedGame, setSelectedGame] = useState<string>('ALL');
  const [activeModalTournament, setActiveModalTournament] = useState<Tournament | null>(null);
  const [inGameName, setInGameName] = useState(userData?.inGameName || '');
  const [inGameUid, setInGameUid] = useState(userData?.inGameUid || '');
  const [isJoining, setIsJoining] = useState(false);

  const tournamentList = Object.values(tournaments);
  const filteredTournaments = selectedGame === 'ALL'
    ? tournamentList
    : tournamentList.filter(t => t.game === selectedGame);

  const handleRegister = (t: Tournament) => {
    playSfx(600, 'sine');
    setActiveModalTournament(t);
  };

  const handleConfirmRegistration = async () => {
    if (!inGameName.trim() || !inGameUid.trim()) {
      alert('Please enter your in-game name and UID.');
      return;
    }

    setIsJoining(true);
    playSfx(750, 'sine');

    setTimeout(() => {
      setIsJoining(false);
      alert(`✅ Registration confirmed for ${activeModalTournament?.name}! Room credentials will be revealed 15 mins prior in My Matches.`);
      setActiveModalTournament(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Game Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'BGMI', 'FREE FIRE', 'COD MOBILE', 'PUBG'].map((game) => (
          <button
            key={game}
            onClick={() => {
              playSfx(500, 'sine');
              setSelectedGame(game);
            }}
            className={`px-4 py-2 rounded-xl font-orbitron font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
              selectedGame === game
                ? 'bg-[#e94560] text-white shadow-[0_0_15px_rgba(233,69,96,0.5)] scale-105'
                : 'bg-[#1a1a2e] text-slate-300 border border-white/10 hover:border-white/30'
            }`}
          >
            {game}
          </button>
        ))}
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((t) => {
          const joinedCount = Object.keys(t.participants || {}).length;
          const isFull = joinedCount >= t.maxPlayers;
          const isJoined = Boolean(userData?.joinedTournaments?.[t.id]);

          return (
            <div
              key={t.id}
              className="bg-[#1a1a2e]/90 border-2 border-[#e94560]/40 hover:border-[#00f3ff] rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-orbitron font-bold px-2.5 py-1 rounded-md bg-[#e94560]/20 text-[#e94560] border border-[#e94560]/50 uppercase">
                    {t.game}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase bg-black/40 px-2 py-0.5 rounded">
                    {t.type} • {t.map}
                  </span>
                </div>

                <h3 className="font-orbitron font-bold text-base text-white group-hover:text-[#00f3ff] transition-colors">
                  {t.name}
                </h3>

                <div className="grid grid-cols-2 gap-2 bg-[#0f0f1e] p-3 rounded-xl border border-white/5 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Prize Pool</span>
                    <span className="font-orbitron font-bold text-[#ffd700] text-sm">₹{t.prizePool}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Entry Fee</span>
                    <span className="font-orbitron font-bold text-[#00f3ff] text-sm">₹{t.entryFee}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#ffd700]" />
                    {t.dateTime}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-mono">
                    <Users className="w-3.5 h-3.5 text-[#00f3ff]" />
                    {joinedCount}/{t.maxPlayers}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10">
                {isJoined ? (
                  <div className="w-full py-2.5 bg-[#2ecc71]/20 border border-[#2ecc71] text-[#2ecc71] text-xs font-orbitron font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Registered in Match</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRegister(t)}
                    disabled={isFull}
                    className="w-full py-2.5 bg-gradient-to-r from-[#e94560] to-[#ff6b81] hover:shadow-[0_0_15px_rgba(233,69,96,0.6)] text-white font-orbitron font-bold text-xs uppercase rounded-xl transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>{isFull ? 'Lobby Full' : `Join Match (₹${t.entryFee})`}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      {activeModalTournament && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] border-2 border-[#00f3ff] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-orbitron font-bold text-lg text-white">
                Enter Tournament
              </h3>
              <button
                onClick={() => setActiveModalTournament(null)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#0f0f1e] p-3 rounded-xl border border-white/10 text-xs space-y-1">
              <div className="text-slate-400">Match: <span className="text-white font-bold">{activeModalTournament.name}</span></div>
              <div className="text-slate-400">Entry Fee: <span className="text-[#00f3ff] font-bold">₹{activeModalTournament.entryFee}</span> (Bonus balance applies first)</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">In-Game Name (IGN)</label>
                <input
                  type="text"
                  value={inGameName}
                  onChange={(e) => setInGameName(e.target.value)}
                  placeholder="e.g. SoulMortal_X"
                  className="w-full bg-[#0f0f1e] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00f3ff]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">In-Game Numeric UID</label>
                <input
                  type="text"
                  value={inGameUid}
                  onChange={(e) => setInGameUid(e.target.value)}
                  placeholder="e.g. 512398471"
                  className="w-full bg-[#0f0f1e] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00f3ff]"
                />
              </div>
            </div>

            <button
              onClick={handleConfirmRegistration}
              disabled={isJoining}
              className="w-full py-3 bg-[#00f3ff] hover:bg-[#00d0db] text-slate-900 font-orbitron font-bold text-xs uppercase rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {isJoining ? 'Reserving Slot...' : 'Confirm & Reserve Slot'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};