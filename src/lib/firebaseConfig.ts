// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkdsttHflWGHXfffa5tRyXzatUV-V4vt4",
  authDomain: "mspcollage-advance-2612.firebaseapp.com",
  databaseURL: "https://mspcollage-advance-2612-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mspcollage-advance-2612",
  storageBucket: "mspcollage-advance-2612.firebasestorage.app",
  messagingSenderId: "136122393418",
  appId: "1:136122393418:web:86f774d66bd97ed13a97b3",
  measurementId: "G-0Z1Y912KLF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, firestore, storage };