import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyFakeKeyForPreviewEnvironment1234567",
  authDomain: "arenax-esports.firebaseapp.com",
  projectId: "arenax-esports",
  storageBucket: "arenax-esports.appspot.com",
  messagingSenderId: "1029384756",
  appId: "1:1029384756:web:abcdef1234567"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const INITIAL_WELCOME_BONUS = 30;