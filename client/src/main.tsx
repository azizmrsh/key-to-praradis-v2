import { createRoot } from "react-dom/client";
import "./i18n"; // Initialize i18n
import App from "./App";
import "./index.css";
import { secureStorage } from './lib/storage';
import i18n from './i18n';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// Initialize Firebase (if needed)
// import { signInAnonymously } from './lib/firebase';

// Ensure storage is working
try {
  secureStorage.setItem('app_initialized', true);
  const retrieved = secureStorage.getItem('app_initialized');
  if (!retrieved) {
    console.error('Storage initialization failed');
  }
} catch (error) {
  console.error('Storage error:', error);
}

// Initialize StatusBar for iOS
const initializeStatusBar = async () => {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
    try {
      await StatusBar.setStyle({ style: 'DEFAULT' as any });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (error) {
      console.log('StatusBar initialization error:', error);
    }
  }
};

// Initialize language and theme based on stored preferences
const initializeApp = async () => {
  // Initialize StatusBar
  await initializeStatusBar();
  
  // Initialize language
  const selectedLanguage = localStorage.getItem('selectedLanguage');
  if (selectedLanguage) {
    await i18n.changeLanguage(selectedLanguage);
    document.documentElement.dir = selectedLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = selectedLanguage;
  }
  
  // Create theme variables based on the stored theme
  document.documentElement.classList.add('light');
  
  // Render the app
  createRoot(document.getElementById("root")!).render(<App />);
};

initializeApp();
