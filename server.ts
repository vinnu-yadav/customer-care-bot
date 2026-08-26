import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const supportTickets: Array<{
  id: string;
  userId: string;
  userName: string;
  category: string;
  description: string;
  status: string;
  createdAt: number;
}> = [];

app.post('/api/bot/ticket', (req, res) => {
  const { userId, userName, category, description } = req.body;
  const ticketId = `AX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const newTicket = {
    id: ticketId,
    userId: userId || 'anonymous',
    userName: userName || 'Gamer',
    category: category || 'General Support',
    description: description || 'No details provided',
    status: 'open',
    createdAt: Date.now()
  };
  supportTickets.unshift(newTicket);
  res.json({ success: true, ticket: newTicket });
});

app.post('/api/bot/chat', async (req, res) => {
  try {
    const { message, userContext, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are the official 24/7 AI Customer Service Bot for Arena X Esports Tournament platform.
Games hosted: BGMI, Free Fire, COD Mobile, PUBG Mobile.
Key Policies:
1. Welcome Bonus: ₹30 Free Cash upon Google login.
2. Room Credentials: Match Room ID & Password are published 15 minutes before the match start time in 'My Matches'.
3. Deposits: Contact admin @ArenaXSupportAdmin or Instagram @_vinnu___yadav_ with UPI screenshot to credit funds.
4. Withdrawals: Minimum withdrawal is ₹50 to UPI.
5. User Context: ${userContext ? JSON.stringify(userContext) : 'Guest user'}.`;

    if (ai) {
      const chatContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(history)) {
        for (const h of history.slice(-6)) {
          if (h.sender === 'user') chatContents.push({ role: 'user', parts: [{ text: h.text }] });
          else if (h.sender === 'bot') chatContents.push({ role: 'model', parts: [{ text: h.text }] });
        }
      }
      chatContents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: chatContents.length > 0 ? chatContents : message,
        config: { systemInstruction, temperature: 0.7 },
      });

      return res.json({ reply: response.text || 'I am here to assist you with Arena X Esports!' });
    } else {
      const lower = message.toLowerCase();
      let fallbackReply = "🎮 Welcome to Arena X Support Bot! How can I assist you today?";
      if (lower.includes('deposit') || lower.includes('add money')) {
        fallbackReply = "💳 **Deposit to Your Account:** Contact admin @ArenaXSupportAdmin or Instagram @_vinnu___yadav_ to add deposit funds directly via UPI.";
      } else if (lower.includes('transaction') || lower.includes('withdraw') || lower.includes('upi')) {
        fallbackReply = "📊 **Transactions Problem:** You can check your transaction history via the 'Transactions Problem' button or file an official support ticket.";
      }
      return res.json({ reply: fallbackReply });
    }
  } catch (err: unknown) {
    const error = err as { message?: string };
    return res.status(500).json({ error: error.message || 'Error', reply: '⚠️ Service busy. Please use the interactive buttons!' });
  }
});

app.post('/api/bot/telegram-webhook', async (req, res) => {
  const update = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!update || !update.message) return res.json({ ok: true });

  const chatId = update.message.chat?.id;
  const text = update.message.text || '';
  const fromUser = update.message.from || {};

  if (token && chatId) {
    const appUrl = process.env.APP_URL || 'https://arenax-esports.web.app';
    let replyText = '';
    let replyMarkup: unknown = null;

    if (text.startsWith('/start')) {
      replyText = `🤖 **Welcome to Arena X Esports Support Bot!**\n\nHello ${fromUser.first_name || 'Champion'}!\n\nPlease select an option:`;
      replyMarkup = {
        inline_keyboard: [
          [{ text: '🔐 Login with Google (Open WebApp)', web_app: { url: appUrl } }],
          [
            { text: '⚠️ Transactions Problem', callback_data: 'tx_problem' },
            { text: '💳 Deposit to Ur Acc', callback_data: 'deposit_acc' }
          ],
          [
            { text: '🎮 Live Tournaments', callback_data: 'tournaments' },
            { text: '🔑 Room ID & Pass', callback_data: 'room' }
          ],
          [{ text: '🎫 Create Support Ticket', callback_data: 'ticket' }]
        ]
      };
    } else if (text.toLowerCase().includes('deposit')) {
      replyText = `💳 **Deposit to Your Account:**\n\n📢 **Contact Admin:** Only the tournament admin has access to verify and add deposit funds directly to your wallet account.\n\n• 📱 **Telegram Admin**: @ArenaXSupportAdmin\n• 📸 **Instagram**: @_vinnu___yadav_\n• ⚡ **Payment Modes**: UPI (GPay, PhonePe, Paytm, QR)\n• ⏱️ **Turnaround**: < 2 minutes`;
      replyMarkup = {
        inline_keyboard: [
          [{ text: '🚀 Open Arena X WebApp', web_app: { url: appUrl } }],
          [{ text: '⚠️ Transactions Problem', callback_data: 'tx_problem' }]
        ]
      };
    } else {
      replyText = `🎮 **Arena X Support Bot**\nReceived: "${text}"\n\nPlease select an option below:`;
      replyMarkup = {
        inline_keyboard: [
          [{ text: '🚀 Open Arena X App', web_app: { url: appUrl } }],
          [
            { text: '⚠️ Transactions Problem', callback_data: 'tx_problem' },
            { text: '💳 Deposit to Ur Acc', callback_data: 'deposit_acc' }
          ]
        ]
      };
    }

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: replyText, parse_mode: 'Markdown', reply_markup: replyMarkup })
      });
    } catch (sendErr) {
      console.warn('Telegram webhook error:', sendErr);
    }
  }

  res.json({ ok: true });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();