import React, { useState } from 'react';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider, INITIAL_WELCOME_BONUS } from '../firebase';
import { playSfx } from '../utils/sound';
import { Gift, ShieldCheck, Sparkles, Bot } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthScreenProps {
  onGuestLogin?: (name: string) => void;
  onOpenTelegramBot?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onGuestLogin, onOpenTelegramBot }) => {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    playSfx(587, 'sine');
    setLoading(true);
    setAuthError(null);

    try {
      await signInWithPopup(auth, googleProvider);
      playSfx(880, 'sine');
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.warn('Popup login failed, attempting redirect...', error);
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr: unknown) {
          const rError = redirectErr as { message?: string };
          setAuthError('Redirect failed. You can proceed using Quick Guest Mode below.');
          console.error(rError);
        }
      } else {
        setAuthError(error.message || 'Authentication error. Try Quick Guest Mode below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    playSfx(659, 'triangle');
    if (onGuestLogin) {
      const guestName = 'Gamer_' + Math.floor(1000 + Math.random() * 9000);
      onGuestLogin(guestName);
    }
  };

  return (
    <div id="authScreen" className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="max-w-md w-full bg-[#1a1a2e]/90 backdrop-blur-2xl border-2 border-[#e94560] rounded-3xl p-8 shadow-[0_0_50px_rgba(233,69,96,0.4)] text-center relative overflow-hidden">
        
        {/* Glowing Welcome Bonus Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ffd700]/20 via-[#e94560]/30 to-[#ffd700]/20 border border-[#ffd700] px-4 py-1.5 rounded-full text-xs font-bold text-[#ffd700] mb-6 shadow-[0_0_20px_rgba(255,215,0,0.3)] animate-pulse">
          <Gift className="w-4 h-4 text-[#ffd700]" />
          <span>INSTANT ₹{INITIAL_WELCOME_BONUS} SIGNUP BONUS</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        {/* Title */}
        <h1 className="font-orbitron font-extrabold text-3xl sm:text-4xl text-white tracking-wider mb-2">
          ARENA <span className="text-[#e94560]">X</span>
        </h1>
        <p className="font-rajdhani font-semibold text-slate-300 text-sm mb-6">
          India's Premier 3D Esports Tournament Arena
        </p>

        {/* Google Sign-in Action */}
        <button
          id="googleLoginBtn"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-rajdhani font-bold text-base py-3.5 px-6 rounded-xl shadow-[0_5px_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google Logo"
            className="w-5 h-5"
          />
          {loading ? 'Authenticating with Google...' : 'Sign in with Google'}
        </button>

        {/* Telegram Customer Support Bot Entry Button */}
        {onOpenTelegramBot && (
          <button
            id="authTelegramBotBtn"
            onClick={() => {
              playSfx(750, 'sine');
              onOpenTelegramBot();
            }}
            className="w-full mt-3.5 inline-flex items-center justify-center gap-2 bg-[#17212b] hover:bg-[#2481cc]/30 border border-[#2481cc]/60 text-[#00f3ff] font-rajdhani font-bold text-sm py-3 px-6 rounded-xl shadow-[0_4px_15px_rgba(36,129,204,0.2)] hover:border-[#2481cc] transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4 text-[#00f3ff]" />
            <span>Open 24/7 Telegram Customer Support Bot</span>
          </button>
        )}

        {authError && (
          <div className="mt-4 p-3 bg-[#e94560]/15 border border-[#e94560]/50 rounded-xl text-xs text-[#e94560] leading-snug">
            {authError}
          </div>
        )}

        {/* Guest Fallback */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center gap-2">
          <button
            id="guestLoginBtn"
            onClick={handleGuest}
            className="text-xs text-slate-400 hover:text-[#00f3ff] transition-colors underline font-medium cursor-pointer"
          >
            ⚡ Quick Test as Demo Gamer
          </button>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00f3ff]" />
            100% Fairplay • Secure UPI Payouts
          </span>
        </div>

      </div>
    </div>
  );
};