import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Firebase configuration - these values should be provided as environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "test-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "ptc-voting-system"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ptc-voting-system",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "ptc-voting-system"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456789",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://ptc-voting-system-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

export default app;
