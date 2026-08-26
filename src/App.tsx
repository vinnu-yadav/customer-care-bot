import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, INITIAL_WELCOME_BONUS } from './firebase';
import { Tournament, UserProfile, Transaction, ArenaTheme } from './types';
import { EsportsBackground } from './components/EsportsBackground';
import { Navbar } from './components/Navbar';
import { DashboardBanner } from './components/DashboardBanner';
import { AuthScreen } from './components/AuthScreen';
import { TournamentsView } from './components/TournamentsView';
import { WalletView } from './components/WalletView';
import { MyMatchesView } from './components/MyMatchesView';
import { TelegramBotView } from './components/TelegramBotView';
import { BottomNav } from './components/BottomNav';
import { playSfx } from './utils/sound';

const DEFAULT_TOURNAMENTS: Record<string, Tournament> = {
  bgmi_grand_01: {
    id: 'bgmi_grand_01',
    name: 'BGMI Pro Squad Championship',
    game: 'BGMI',
    type: 'squad',
    entryFee: 50,
    prizePool: 5000,
    dateTime: 'Today, 08:30 PM IST',
    map: 'Erangel',
    maxPlayers: 100,
    status: 'upcoming',
    roomUid: 'BGMI-ROOM-9042',
    roomPassword: 'ARENAX99_BGMI'
  },
  ff_rush_02: {
    id: 'ff_rush_02',
    name: 'Free Fire Bermuda Clash',
    game: 'FREE FIRE',
    type: 'squad',
    entryFee: 30,
    prizePool: 3000,
    dateTime: 'Today, 09:30 PM IST',
    map: 'Bermuda',
    maxPlayers: 48,
    status: 'upcoming',
    roomUid: 'FF-CLASH-7821',
    roomPassword: 'FF_ARENAX_WIN'
  },
  cod_sniper_03: {
    id: 'cod_sniper_03',
    name: 'COD Mobile Sniper Elite',
    game: 'COD MOBILE',
    type: 'solo',
    entryFee: 25,
    prizePool: 2000,
    dateTime: 'Tomorrow, 07:00 PM IST',
    map: 'Crash (Snipers Only)',
    maxPlayers: 50,
    status: 'upcoming',
    roomUid: 'COD-SNIPER-4412',
    roomPassword: 'COD_DEADSHOT'
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [tournaments, setTournaments] = useState<Record<string, Tournament>>(DEFAULT_TOURNAMENTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'tournaments' | 'wallet' | 'myTournaments' | 'telegramBot'>('tournaments');
  const [showAuthScreenBot, setShowAuthScreenBot] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const stored = localStorage.getItem(`arenax_user_${user.uid}`);
        if (stored) {
          try {
            setUserData(JSON.parse(stored));
          } catch {
            initProfile(user);
          }
        } else {
          initProfile(user);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const initProfile = (user: User) => {
    const newProfile: UserProfile = {
      name: user.displayName || 'Gamer',
      email: user.email || 'gamer@arenax.com',
      photoURL: user.photoURL || undefined,
      rank: 'SILVER',
      wallet: {
        bonus: INITIAL_WELCOME_BONUS,
        deposited: 0,
      },
      joinedTournaments: {}
    };
    setUserData(newProfile);
    localStorage.setItem(`arenax_user_${user.uid}`, JSON.stringify(newProfile));
  };

  const handleGuestLogin = (name: string) => {
    const fakeGuestUser: UserProfile = {
      name: name || 'Demo_Gamer',
      email: 'guest@arenax.com',
      rank: 'BRONZE',
      wallet: {
        bonus: INITIAL_WELCOME_BONUS,
        deposited: 20
      },
      joinedTournaments: {}
    };
    setUserData(fakeGuestUser);
    setCurrentUser({ uid: 'guest_uid_' + Date.now(), displayName: fakeGuestUser.name } as unknown as User);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      setCurrentUser(null);
      setUserData(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white selection:bg-[#e94560] selection:text-white relative pb-24">
      <EsportsBackground theme="crimson" />

      <div className="relative z-10">
        {!currentUser || !userData ? (
          showAuthScreenBot ? (
            <div className="min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center">
              <div className="max-w-4xl w-full mb-3 flex items-center justify-between">
                <button
                  onClick={() => setShowAuthScreenBot(false)}
                  className="bg-[#17212b] border border-[#2481cc]/50 text-[#00f3ff] text-xs font-bold font-orbitron px-3.5 py-2 rounded-xl hover:bg-[#2481cc]/20 transition-all cursor-pointer"
                >
                  ← Back to Login Screen
                </button>
                <span className="text-xs text-slate-400 font-mono">Arena X Support Bot</span>
              </div>
              <TelegramBotView
                currentUser={currentUser}
                userData={userData}
                tournaments={tournaments}
                transactions={transactions}
                onGuestLogin={handleGuestLogin}
                onOpenWalletTab={() => setActiveTab('wallet')}
                onOpenMyMatchesTab={() => setActiveTab('myTournaments')}
              />
            </div>
          ) : (
            <AuthScreen
              onGuestLogin={handleGuestLogin}
              onOpenTelegramBot={() => setShowAuthScreenBot(true)}
            />
          )
        ) : (
          <div>
            <Navbar
              userName={userData.name}
              totalBalance={(userData.wallet?.bonus || 0) + (userData.wallet?.deposited || 0)}
              onOpenWallet={() => setActiveTab('wallet')}
              onOpenTrophyModal={() => playSfx(880, 'triangle')}
              onOpenTelegramBot={() => setActiveTab('telegramBot')}
              activeTab={activeTab}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
              {activeTab !== 'telegramBot' && <DashboardBanner userData={userData} />}

              {activeTab === 'tournaments' && (
                <TournamentsView
                  tournaments={tournaments}
                  userData={userData}
                  onJoinTournament={async () => {}}
                  onOpenWallet={() => setActiveTab('wallet')}
                />
              )}

              {activeTab === 'wallet' && (
                <WalletView
                  userData={userData}
                  transactions={transactions}
                  onDeposit={async () => {}}
                  onWithdraw={async () => {}}
                />
              )}

              {activeTab === 'myTournaments' && (
                <MyMatchesView
                  tournaments={tournaments}
                  userData={userData}
                  onOpenTournaments={() => setActiveTab('tournaments')}
                />
              )}

              {activeTab === 'telegramBot' && (
                <TelegramBotView
                  currentUser={currentUser}
                  userData={userData}
                  tournaments={tournaments}
                  transactions={transactions}
                  onOpenWalletTab={() => setActiveTab('wallet')}
                  onOpenMyMatchesTab={() => setActiveTab('myTournaments')}
                />
              )}
            </main>

            <BottomNav
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              onLogout={handleLogout}
            />
          </div>
        )}
      </div>
    </div>
  );
}