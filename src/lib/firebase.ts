import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Import the functions you need from the SDKs you need

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAE_pGp_GXlKpXOizn4tEOYQx918pEBAOU",
  authDomain: "desafio-lince.firebaseapp.com",
  projectId: "desafio-lince",
  storageBucket: "desafio-lince.firebasestorage.app",
  messagingSenderId: "77155741673",
  appId: "1:77155741673:web:8ac4fe3397433a45d26578"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;