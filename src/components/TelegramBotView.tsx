import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Tournament, Transaction } from '../types';
import { auth, googleProvider, INITIAL_WELCOME_BONUS } from '../firebase';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { playSfx } from '../utils/sound';
import {
  Send,
  CheckCheck,
  RotateCcw,
  Bot,
  ExternalLink,
  ChevronRight,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Message {
  id: string;
  sender: 'bot' | 'user' | 'system';
  text: string;
  timestamp: string;
  type?: 'text' | 'auth_prompt' | 'tournaments' | 'wallet' | 'room' | 'ticket_form' | 'ticket_created' | 'rules';
  buttons?: Array<{
    text: string;
    action: string;
    isPrimary?: boolean;
  }>;
}

interface TelegramBotViewProps {
  currentUser: unknown;
  userData: UserProfile | null;
  tournaments: Record<string, Tournament>;
  transactions: Transaction[];
  onOpenWalletTab?: () => void;
  onOpenMyMatchesTab?: () => void;
  onGuestLogin?: (name: string) => void;
}

export const TelegramBotView: React.FC<TelegramBotViewProps> = ({
  currentUser,
  userData,
  tournaments,
  transactions,
  onGuestLogin,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTicketCategory, setActiveTicketCategory] = useState<string>('Payment / Withdrawal');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    if (!currentUser || !userData) {
      setMessages([
        {
          id: 'msg_welcome_unauth',
          sender: 'bot',
          text: `🤖 **Arena X 24/7 Customer Service Bot**\n\nWelcome to the official esports tournament assistant for **BGMI**, **Free Fire**, **COD Mobile**, and **PUBG Mobile**!\n\n🔒 **Authentication Required:**\nTo access live match Room ID & Password, view your **₹${INITIAL_WELCOME_BONUS} Welcome Bonus**, or resolve transaction issues, please sign in with Google.`,
          timestamp: formatTime(),
          type: 'auth_prompt',
          buttons: [
            { text: `🔐 Sign in with Google (Claim ₹${INITIAL_WELCOME_BONUS} Bonus)`, action: 'LOGIN_GOOGLE', isPrimary: true },
            { text: '⚡ Test as Guest Gamer', action: 'LOGIN_GUEST' },
            { text: '🛡️ Why is Google login required?', action: 'EXPLAIN_AUTH' }
          ]
        }
      ]);
    } else {
      const totalBal = (userData.wallet?.bonus || 0) + (userData.wallet?.deposited || 0);

      setMessages([
        {
          id: 'msg_welcome_auth',
          sender: 'bot',
          text: `✅ **Google Authentication Verified!**\n\n👋 Welcome **${userData.name || 'Champion'}** to Arena X Customer Support Bot!\n\n💰 **Current Balance:** **₹${totalBal}** (₹${userData.wallet?.bonus || 0} Bonus + ₹${userData.wallet?.deposited || 0} Deposited)\n📱 **Linked UPI:** \`${userData.upiId || 'Not set'}\`\n\nPlease select an option below:`,
          timestamp: formatTime(),
          buttons: [
            { text: '⚠️ Transactions Problem', action: 'TRANSACTIONS_PROBLEM', isPrimary: true },
            { text: '💳 Deposit to Ur Acc', action: 'DEPOSIT_TO_ACC', isPrimary: true },
            { text: '🎮 Browse Tournaments', action: 'VIEW_TOURNAMENTS' },
            { text: '🔑 Room ID & Pass', action: 'VIEW_ROOM_CREDS' },
            { text: '🎫 Submit Support Ticket', action: 'OPEN_TICKET_FORM' }
          ]
        }
      ]);
    }
  }, [currentUser, userData?.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch {
        if (onGuestLogin) onGuestLogin('Player_' + Math.floor(1000 + Math.random() * 9000));
      }
    }
  };

  const handleAction = async (action: string) => {
    if (action === 'LOGIN_GOOGLE') return handleGoogleLogin();
    if (action === 'LOGIN_GUEST') {
      if (onGuestLogin) onGuestLogin('Player_' + Math.floor(1000 + Math.random() * 9000));
      return;
    }

    if (action === 'TRANSACTIONS_PROBLEM') {
      if (!userData) {
        addBotResponse('⚠️ Please sign in with Google first to inspect your transaction ledger.', [
          { text: '🔐 Sign in with Google', action: 'LOGIN_GOOGLE', isPrimary: true }
        ]);
        return;
      }

      if (!transactions || transactions.length === 0) {
        const bonus = userData.wallet?.bonus || 0;
        const deposited = userData.wallet?.deposited || 0;
        addBotResponse(
          `📊 **User Transaction Ledger:**\n\n` +
          `• 👤 Account: **${userData.name}**\n` +
          `• 📱 UPI: \`${userData.upiId || 'Not linked'}\`\n` +
          `• 🎁 Welcome Bonus: **₹${bonus}** (Credited)\n` +
          `• 💳 Deposited Balance: **₹${deposited}**\n` +
          `• 📁 Status: No recent pending or failed transaction records found in database.\n\n` +
          `If an amount was deducted from your bank/UPI but not credited, please submit an instant support ticket below:`,
          [
            { text: '🎫 Report Transaction Issue', action: 'OPEN_TICKET_FORM', isPrimary: true },
            { text: '💳 Deposit to Ur Acc', action: 'DEPOSIT_TO_ACC' },
            { text: '🔙 Main Menu', action: 'MAIN_MENU' }
          ]
        );
      } else {
        let historyText = `📊 **Your Recent Database Transactions (${transactions.length}):**\n\n`;
        transactions.slice(0, 5).forEach((tx) => {
          const icon = tx.type === 'deposit' ? '🟢' : tx.type === 'winning' ? '🏆' : tx.type === 'withdrawal' ? '💸' : '🎟️';
          historyText += `${icon} **#${tx.id.slice(-6).toUpperCase()}** | ${tx.type.toUpperCase()}\n` +
            `  • Amount: **₹${tx.amount}** | Status: \`${tx.status.toUpperCase()}\`\n` +
            `  • Date: ${tx.date} ${tx.note ? `\n  • Note: ${tx.note}` : ''}\n\n`;
        });

        addBotResponse(
          historyText + `💡 If you have an issue with a specific transaction above, tap 'Submit Ticket' to inform tournament marshals.`,
          [
            { text: '🎫 Submit Ticket for Transaction', action: 'OPEN_TICKET_FORM', isPrimary: true },
            { text: '💳 Deposit to Ur Acc', action: 'DEPOSIT_TO_ACC' },
            { text: '🔙 Main Menu', action: 'MAIN_MENU' }
          ]
        );
      }
      return;
    }

    if (action === 'DEPOSIT_TO_ACC') {
      addBotResponse(
        `💳 **Deposit Funds to Your Account:**\n\n` +
        `📢 **Contact Admin:** Only the tournament admin has access to verify and add deposit funds directly to your wallet account.\n\n` +
        `• 📱 **Telegram Admin**: @ArenaXSupportAdmin\n` +
        `• 📸 **Instagram Admin**: @_vinnu___yadav_\n` +
        `• ⚡ **Payment Modes**: UPI (GPay, PhonePe, Paytm), QR Scan, BHIM\n` +
        `• ⏱️ **Turnaround Time**: Instant (< 2 minutes after sharing screenshot)\n\n` +
        `Send your registered username (**${userData?.name || 'Your Name'}**) and transaction screenshot directly to admin for balance credit.`,
        [
          { text: '⚠️ Transactions Problem', action: 'TRANSACTIONS_PROBLEM', isPrimary: true },
          { text: '🎫 Open Support Ticket', action: 'OPEN_TICKET_FORM' },
          { text: '🔙 Main Menu', action: 'MAIN_MENU' }
        ]
      );
      return;
    }

    if (action === 'VIEW_TOURNAMENTS') {
      const tourList = Object.values(tournaments) as Tournament[];
      let responseText = `🎮 **Active Tournaments Available Now:**\n\n`;
      tourList.forEach(t => {
        const joined = Object.keys(t.participants || {}).length;
        responseText += `• **${t.name}** (${t.game})\n  🏆 Prize: **₹${t.prizePool}** | 🎟️ Entry: **₹${t.entryFee}**\n  ⏰ Time: ${t.dateTime} | 👥 Slots: ${joined}/${t.maxPlayers}\n\n`;
      });
      addBotResponse(responseText, [
        { text: '🔑 Check Room Password', action: 'VIEW_ROOM_CREDS', isPrimary: true },
        { text: '💳 Deposit to Ur Acc', action: 'DEPOSIT_TO_ACC' },
        { text: '🔙 Main Menu', action: 'MAIN_MENU' }
      ]);
      return;
    }

    if (action === 'VIEW_ROOM_CREDS') {
      const joinedIds = Object.keys(userData?.joinedTournaments || {});
      if (joinedIds.length === 0) {
        addBotResponse(`🔑 **Room Credentials Status:**\n\nYou have not registered for any active tournament match yet.\n\nRoom ID & Password unlock 15 minutes before the match!`, [
          { text: '🎮 Browse & Join Tournaments', action: 'VIEW_TOURNAMENTS', isPrimary: true },
          { text: '🔙 Main Menu', action: 'MAIN_MENU' }
        ]);
      } else {
        let roomText = `🔑 **Your Match Room Credentials:**\n\n`;
        joinedIds.forEach(id => {
          const t = tournaments[id];
          if (t) {
            roomText += `🎮 **${t.name}** (${t.game})\n⏰ Time: ${t.dateTime}\n🆔 **Room ID:** \`${t.roomUid || 'Available 15m prior'}\`\n🔐 **Password:** \`${t.roomPassword || 'Available 15m prior'}\`\n\n`;
          }
        });
        addBotResponse(roomText, [
          { text: '⚠️ Transactions Problem', action: 'TRANSACTIONS_PROBLEM' },
          { text: '🔙 Main Menu', action: 'MAIN_MENU' }
        ]);
      }
      return;
    }

    if (action === 'OPEN_TICKET_FORM') {
      addBotResponse(`🎫 **Arena X Official Support Ticket Desk**\nPlease select your issue type and type a short description below:`, [], 'ticket_form');
      return;
    }

    if (action === 'MAIN_MENU') {
      addBotResponse(`📋 **Arena X Main Menu**\nSelect an option below:`, [
        { text: '⚠️ Transactions Problem', action: 'TRANSACTIONS_PROBLEM', isPrimary: true },
        { text: '💳 Deposit to Ur Acc', action: 'DEPOSIT_TO_ACC', isPrimary: true },
        { text: '🎮 Browse Tournaments', action: 'VIEW_TOURNAMENTS' },
        { text: '🔑 Room ID & Pass', action: 'VIEW_ROOM_CREDS' },
        { text: '🎫 Submit Support Ticket', action: 'OPEN_TICKET_FORM' }
      ]);
      return;
    }
  };

  const addBotResponse = (text: string, buttons?: Message['buttons'], type?: Message['type']) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      playSfx(880, 'sine');
      setMessages(prev => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text,
          timestamp: formatTime(),
          type: type || 'text',
          buttons
        }
      ]);
    }, 400);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query) return;

    setInputText('');
    setMessages(prev => [...prev, { id: 'user_' + Date.now(), sender: 'user', text: query, timestamp: formatTime() }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userContext: userData ? { name: userData.name, wallet: userData.wallet } : null,
          history: messages.slice(-5)
        })
      });
      const data = await res.json();
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: data.reply || 'Here to assist you with Arena X!',
          timestamp: formatTime(),
          buttons: [
            { text: '⚠️ Transactions Problem', action: 'TRANSACTIONS_PROBLEM' },
            { text: '💳 Deposit to Ur Acc', action: 'DEPOSIT_TO_ACC' },
            { text: '🎮 Tournaments', action: 'VIEW_TOURNAMENTS' }
          ]
        }
      ]);
    } catch {
      setIsTyping(false);
      addBotResponse(`🎮 **Arena X Support:** Choose an action button below:`, [
        { text: '⚠️ Transactions Problem', action: 'TRANSACTIONS_PROBLEM', isPrimary: true },
        { text: '💳 Deposit to Ur Acc', action: 'DEPOSIT_TO_ACC' }
      ]);
    }
  };

  const handleSubmitTicket = async () => {
    if (!ticketDescription.trim()) return alert('Please enter issue details');
    setIsSubmittingTicket(true);
    try {
      const res = await fetch('/api/bot/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: (currentUser as { uid?: string })?.uid || 'guest',
          userName: userData?.name || 'Gamer',
          category: activeTicketCategory,
          description: ticketDescription.trim()
        })
      });
      const data = await res.json();
      setIsSubmittingTicket(false);
      setTicketDescription('');
      addBotResponse(`✅ **Support Ticket Created!**\n• Ticket ID: \`#${data.ticket.id}\`\n• Category: ${data.ticket.category}\n• Status: PENDING_REVIEW (< 15 mins)`, [
        { text: '🔙 Main Menu', action: 'MAIN_MENU', isPrimary: true }
      ]);
    } catch {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full bg-[#17212b] border-2 border-[#2481cc]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[78vh] sm:h-[82vh] font-rajdhani relative">
      <div className="bg-[#242f3d] border-b border-[#1c2733] px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2481cc] to-[#00f3ff] p-0.5">
            <div className="w-full h-full rounded-full bg-[#17212b] flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#00f3ff]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-orbitron font-bold text-sm sm:text-base text-white">Arena X Support Bot</h2>
              <span className="bg-[#2481cc]/30 text-[#00f3ff] border border-[#2481cc]/60 px-1.5 rounded text-[10px] font-bold">BOT</span>
            </div>
            <span className="text-[11px] text-[#74879b] font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2ecc71] animate-pulse"></span>
              24/7 Customer Service
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => handleAction('MAIN_MENU')} className="bg-[#17212b] hover:bg-[#2481cc]/30 border border-white/10 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>/start</span>
          </button>
          <button onClick={() => setShowConfigModal(true)} className="bg-[#2481cc]/20 border border-[#2481cc]/50 text-[#00f3ff] px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Webhook</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0e1621]">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div key={msg.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
              <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-3.5 shadow text-sm ${isBot ? 'bg-[#182533] text-[#e3ecf5] border border-[#25394d]' : 'bg-[#2b5278] text-white'}`}>
                <div className="whitespace-pre-line text-xs sm:text-sm">{msg.text}</div>

                {msg.type === 'ticket_form' && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {['Payment / Withdrawal', 'Deposit Pending', 'Room Pass Issue', 'Report Cheater'].map(cat => (
                        <button key={cat} onClick={() => setActiveTicketCategory(cat)} className={`text-[11px] px-2 py-1 rounded-lg font-bold cursor-pointer ${activeTicketCategory === cat ? 'bg-[#2481cc] text-white' : 'bg-[#0f1721] text-slate-300'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                    <textarea value={ticketDescription} onChange={(e) => setTicketDescription(e.target.value)} rows={2} placeholder="Enter transaction ID or issue details..." className="w-full bg-[#0f1721] p-2 text-xs text-white rounded-xl border border-white/10" />
                    <button onClick={handleSubmitTicket} disabled={isSubmittingTicket} className="w-full py-2 bg-[#2481cc] text-white text-xs font-bold rounded-xl font-orbitron uppercase cursor-pointer">
                      {isSubmittingTicket ? 'Submitting...' : 'Submit Official Ticket'}
                    </button>
                  </div>
                )}

                {msg.buttons && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.buttons.map((btn, idx) => (
                      <button key={idx} onClick={() => handleAction(btn.action)} className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer ${btn.isPrimary ? 'bg-[#2481cc]/30 text-[#00f3ff] border border-[#2481cc]/60' : 'bg-[#101b26] text-slate-200 border border-white/10'}`}>
                        <span>{btn.text}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#2481cc]" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#74879b]">
                  <span>{msg.timestamp}</span>
                  {!isBot && <CheckCheck className="w-3.5 h-3.5 text-[#00f3ff]" />}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="bg-[#182533] text-slate-300 text-xs px-3 py-2 rounded-2xl w-fit flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-[#00f3ff]" />
            <span>Bot is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-[#1c2733] border-t border-[#253545] px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
        <span className="text-[#74879b] text-[10px] uppercase font-mono px-1">Quick:</span>
        <button onClick={() => handleAction('TRANSACTIONS_PROBLEM')} className="bg-[#242f3d] hover:bg-[#e94560]/30 border border-white/10 hover:border-[#e94560] text-[#e94560] px-2.5 py-0.8 rounded-full whitespace-nowrap cursor-pointer">
          ⚠️ Transactions Problem
        </button>
        <button onClick={() => handleAction('DEPOSIT_TO_ACC')} className="bg-[#242f3d] hover:bg-[#2481cc]/30 border border-white/10 hover:border-[#2481cc] text-[#00f3ff] px-2.5 py-0.8 rounded-full whitespace-nowrap cursor-pointer">
          💳 Deposit to Ur Acc
        </button>
        <button onClick={() => handleAction('VIEW_TOURNAMENTS')} className="bg-[#242f3d] hover:bg-[#2481cc]/30 border border-white/10 hover:border-[#2481cc] text-[#ffd700] px-2.5 py-0.8 rounded-full whitespace-nowrap cursor-pointer">
          🎮 /tournaments
        </button>
        <button onClick={() => handleAction('OPEN_TICKET_FORM')} className="bg-[#242f3d] hover:bg-[#2ecc71]/30 border border-white/10 hover:border-[#2ecc71] text-[#2ecc71] px-2.5 py-0.8 rounded-full whitespace-nowrap cursor-pointer">
          🎫 /ticket
        </button>
      </div>

      <form onSubmit={handleSendMessage} className="bg-[#242f3d] p-3 flex items-center gap-2">
        <input ref={inputRef} type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message or command..." className="flex-1 bg-[#17212b] border border-[#2b3c4f] rounded-2xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#2481cc]" />
        <button type="submit" disabled={!inputText.trim()} className="w-10 h-10 rounded-full bg-[#2481cc] text-white flex items-center justify-center disabled:opacity-40 cursor-pointer">
          <Send className="w-4 h-4" />
        </button>
      </form>

      {showConfigModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#17212b] border border-[#2481cc] rounded-3xl p-6 max-w-md w-full">
            <h3 className="font-orbitron font-bold text-lg text-white mb-2">Telegram Webhook Setup</h3>
            <p className="text-xs text-slate-300 mb-4">Set your <code>TELEGRAM_BOT_TOKEN</code> in your environment to activate your official bot with BotFather!</p>
            <div className="bg-[#0e1621] p-3 rounded-xl text-xs font-mono text-slate-300 mb-4">
              Webhook URL: <code>/api/bot/telegram-webhook</code>
            </div>
            <button onClick={() => setShowConfigModal(false)} className="w-full py-2 bg-[#2481cc] text-white text-xs font-bold rounded-xl font-orbitron uppercase cursor-pointer">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};