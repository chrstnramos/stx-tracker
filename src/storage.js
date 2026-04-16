// ============================================================
// STORAGE OPTIONS — Pick one and comment out the other
// ============================================================

// ─────────────────────────────────────────────────────────────
// OPTION 1: FIREBASE (Shared across all team members)
//
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (free tier is fine)
// 3. Go to Build → Realtime Database → Create Database
// 4. Choose "Start in test mode" (or add rules later)
// 5. Go to Project Settings → Your Apps → Add Web App
// 6. Copy your config and paste it below
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

// ⬇️ PASTE YOUR FIREBASE CONFIG HERE ⬇️
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "000000000000",
  appId: "YOUR_APP_ID"
};

// Set this to true once you've added your Firebase config above
const USE_FIREBASE = false;

let db = null;
if (USE_FIREBASE && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  } catch (e) {
    console.warn("Firebase init failed, falling back to localStorage:", e);
  }
}

const STORAGE_KEY = "stx-roadmap-progress";

// ─────────────────────────────────────────────────────────────
// Shared API used by the app
// ─────────────────────────────────────────────────────────────

export function saveProgress(data) {
  if (db) {
    set(ref(db, STORAGE_KEY), data);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function loadProgress() {
  if (db) {
    // Firebase uses realtime listener, so this returns null
    // The listener in subscribeToProgress handles it
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function subscribeToProgress(callback) {
  if (db) {
    // Firebase realtime listener — fires on every change from ANY user
    const dbRef = ref(db, STORAGE_KEY);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
    return unsubscribe;
  } else {
    // localStorage fallback — poll every 2 seconds for tab sync
    const initial = loadProgress();
    callback(initial);
    const interval = setInterval(() => {
      callback(loadProgress());
    }, 2000);
    return () => clearInterval(interval);
  }
}

export const isFirebase = () => !!db;
