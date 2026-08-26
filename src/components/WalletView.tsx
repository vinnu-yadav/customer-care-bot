import React, { useState } from 'react';
import { UserProfile, Transaction } from '../types';
import { Wallet, Gift, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { playSfx } from '../utils/sound';

interface WalletViewProps {
  userData: UserProfile | null;
  transactions: Transaction[];
  onDeposit: (amount: number) => Promise<void>;
  onWithdraw: (amount: number, upiId: string) => Promise<void>;
}

export const WalletView: React.FC<WalletViewProps> = ({ userData }) => {
  const [upiInput, setUpiInput] = useState(userData?.upiId || '');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const bonus = userData?.wallet?.bonus || 0;
  const deposited = userData?.wallet?.deposited || 0;
  const totalBalance = bonus + deposited;

  const handleWithdrawRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);

    if (isNaN(amt) || amt < 50) {
      alert('Minimum withdrawal amount is ₹50');
      return;
    }

    if (amt > deposited) {
      alert(`You can only withdraw cash winnings. Current withdrawable balance: ₹${deposited}`);
      return;
    }

    if (!upiInput.includes('@')) {
      alert('Please enter a valid UPI ID (e.g. mobile@upi, name@okaxis)');
      return;
    }

    playSfx(880, 'sine');
    setStatusMsg(`✅ Payout of ₹${amt} initiated to ${upiInput}. Marshals process within 15-30 minutes.`);
    setWithdrawAmount('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Wallet Overview Card */}
      <div className="bg-[#1a1a2e] border-2 border-[#ffd700]/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(255,215,0,0.15)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Spendable Balance</span>
            <div className="font-orbitron font-extrabold text-3xl sm:text-4xl text-[#ffd700] mt-1">
              ₹{totalBalance}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-black/40 border border-white/10 px-4 py-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block font-bold">Bonus Cash</span>
              <span className="font-orbitron font-bold text-[#00f3ff] text-base">₹{bonus}</span>
            </div>
            <div className="bg-black/40 border border-white/10 px-4 py-2.5 rounded-2xl">
              <span className="text-[10px] text-slate-400 block font-bold">Withdrawable</span>
              <span className="font-orbitron font-bold text-[#2ecc71] text-base">₹{deposited}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-[#1a1a2e] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-md">
        <h3 className="font-orbitron font-bold text-lg text-white mb-2 flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-[#2ecc71]" />
          <span>Request Instant UPI Withdrawal</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Minimum withdrawal is ₹50. Winnings are sent straight to your UPI account.
        </p>

        <form onSubmit={handleWithdrawRequest} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Your UPI ID</label>
            <input
              type="text"
              value={upiInput}
              onChange={(e) => setUpiInput(e.target.value)}
              placeholder="e.g. yourname@okaxis, 9876543210@paytm"
              className="w-full bg-[#0f0f1e] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#2ecc71]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Withdrawal Amount (₹)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Min. ₹50"
              className="w-full bg-[#0f0f1e] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#2ecc71]"
            />
          </div>

          {statusMsg && (
            <div className="p-3 bg-[#2ecc71]/20 border border-[#2ecc71] rounded-xl text-[#2ecc71] font-bold">
              {statusMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[#2ecc71] hover:bg-[#27ae60] text-slate-900 font-orbitron font-bold text-xs uppercase rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Submit Withdrawal Request
          </button>
        </form>
      </div>

      {/* Deposit Note */}
      <div className="bg-[#17212b] border border-[#2481cc]/50 rounded-2xl p-4 text-xs text-slate-300 flex items-center justify-between">
        <div>
          <span className="font-bold text-[#00f3ff] block">Need to Add Deposit Funds?</span>
          <span>Contact tournament admin @ArenaXSupportAdmin or Instagram @_vinnu___yadav_ for instant UPI balance credit.</span>
        </div>
      </div>

    </div>
  );
};