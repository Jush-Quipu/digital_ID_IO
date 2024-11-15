import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AfSVXjlY",
  authDomain: "inventory-management-821df.firebaseapp.com",
  projectId: "inventory-management-821df",
  storageBucket: "inventory-management-821df.appspot.com",
  messagingSenderId: "135715573117",
  appId: "1:135715573117:web:261cfa622f161a77a11014",
  measurementId: "G-YTYZBCZRPS",
  databaseURL: "https://inventory-management-821df-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const performance = getPerformance(app);
export const realtimeDb = getDatabase(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code == 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
});
