import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyBnz8AR5JJsVUNciBwdah5pGFvkAdykvWw",
  authDomain: "cogneq-19c96.firebaseapp.com",
  projectId: "cogneq-19c96",
  storageBucket: "cogneq-19c96.appspot.com",
  messagingSenderId: "338177007048",
  appId: "1:338177007048:web:67b7da8983ba3069ca74fd",
  measurementId: "G-F9BZ2CRT7B",
  databaseURL: "https://cogneq-19c96-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);