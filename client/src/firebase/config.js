import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAOvpVqNx_Top_fQtCG_GMc1wFtFdtBYZM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "puratech-cf4c5.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "puratech-cf4c5",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "puratech-cf4c5.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID || "562804341915",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:562804341915:web:26d3ce8302224a4f345a3e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
