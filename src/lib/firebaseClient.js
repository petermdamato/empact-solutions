// lib/firebaseClient.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const firebaseAuth = getAuth();
export const firestore = getFirestore(app);
export { signInWithEmailAndPassword };
