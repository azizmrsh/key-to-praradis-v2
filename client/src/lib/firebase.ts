import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDDz5NbfNW-Z-cXCSMvLczFBb7zF5-hf68",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "keys-to-paradise"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "keys-to-paradise",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "keys-to-paradise"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:1234567890123456789012"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

export async function signInAnonymously() {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
}

export { auth, storage, app };
