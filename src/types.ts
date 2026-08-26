export interface Participant {
  name: string;
  inGameUid: string;
  slot: number;
  teamName?: string;
  phone?: string;
}

export interface Tournament {
  id: string;
  name: string;
  game: 'BGMI' | 'FREE FIRE' | 'COD MOBILE' | 'PUBG';
  type: 'solo' | 'squad';
  entryFee: number;
  prizePool: number;
  dateTime: string;
  map: string;
  maxPlayers: number;
  participants?: Record<string, Participant>;
  status: 'upcoming' | 'ongoing' | 'completed';
  roomUid?: string;
  roomPassword?: string;
  winner?: string;
}

export interface UserWallet {
  bonus: number;
  deposited: number;
}

export interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
  inGameName?: string;
  inGameUid?: string;
  upiId?: string;
  rank?: string;
  kills?: number;
  wins?: number;
  wallet?: UserWallet;
  joinedTournaments?: Record<string, {
    joinedAt: number;
    slot: number;
    game: string;
  }>;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'entry_fee' | 'winning' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  note?: string;
}

export type ArenaTheme = 'crimson' | 'cyberpunk' | 'toxic';