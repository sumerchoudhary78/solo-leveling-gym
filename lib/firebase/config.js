import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase
// Check if apps are already initialized to prevent errors during hot reloading
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // If initialization fails, try to use default app if available
    const apps = getApps();
    if (apps.length > 0) {
      app = apps[0];
      console.log('Using existing Firebase app');
    } else {
      console.error('No Firebase app available');
    }
  }
} else {
  app = getApps()[0]; // Use the already initialized app
  console.log('Using existing Firebase app');
}

// Initialize Firebase services with error handling
let auth, db, storage, rtdb;

try {
  auth = getAuth(app);
  console.log('Firebase Auth initialized');
} catch (error) {
  console.error('Error initializing Firebase Auth:', error);
  auth = null;
}

try {
  db = getFirestore(app);
  console.log('Firestore initialized');
} catch (error) {
  console.error('Error initializing Firestore:', error);
  db = null;
}

try {
  storage = getStorage(app);
  console.log('Firebase Storage initialized');

  // Set custom Storage settings
  const storageSettings = {
    maxOperationRetryTime: 10000, // 10 seconds (default is 2 minutes)
    maxUploadRetryTime: 30000,    // 30 seconds (default is 10 minutes)
    maxDownloadRetryTime: 30000   // 30 seconds (default is 10 minutes)
  };

  // Apply settings
  storage.maxOperationRetryTime = storageSettings.maxOperationRetryTime;
  storage.maxUploadRetryTime = storageSettings.maxUploadRetryTime;
  storage.maxDownloadRetryTime = storageSettings.maxDownloadRetryTime;

  console.log('Firebase Storage settings applied');
} catch (error) {
  console.error('Error initializing Firebase Storage:', error);
  storage = null;
}

try {
  rtdb = getDatabase(app);
  console.log('Firebase Realtime Database initialized');
} catch (error) {
  console.error('Error initializing Firebase Realtime Database:', error);
  rtdb = null;
}

export { app, auth, db, storage, rtdb };