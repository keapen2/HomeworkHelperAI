// config/firebase.js
// Firebase configuration for Expo
// Replace these values with your Firebase project configuration

import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
// You'll need to add these values from your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyDZ8m4ZxssTrRzdGRlLUoUBtUdAOyypS4k",
  authDomain: "homeworkhelperai.firebaseapp.com",
  projectId: "homeworkhelperai",
  storageBucket: "homeworkhelperai.firebasestorage.app",
  messagingSenderId: "434057302869",
  appId: "1:434057302869:web:5b71aa2e6f18c2fefe15dc"
};

// Initialize Firebase
// Check if Firebase app is already initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Authentication with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  // Auth might already be initialized, get the existing instance
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    console.error('Firebase Auth initialization error:', error);
    // Fallback to getAuth if initializeAuth fails
    auth = getAuth(app);
  }
}

export { auth };
export default app;

