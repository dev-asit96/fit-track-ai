import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1LT39TgS0R9don70gCLuMSIz-r3uBn-Y",
  authDomain: "fit-track-ai-b3ad8.firebaseapp.com",
  projectId: "fit-track-ai-b3ad8",
  storageBucket: "fit-track-ai-b3ad8.firebasestorage.app",
  messagingSenderId: "938858022130",
  appId: "1:938858022130:web:70997b5b5350fb60673c6b",
  measurementId: "G-N225D4MTW0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
