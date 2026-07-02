import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBW0egtlG4JXjkoWB2Lfu5GcYhZz_oEjbI",
  authDomain: "boni-lottery-8d0e6.firebaseapp.com",
  projectId: "boni-lottery-8d0e6",
  storageBucket: "boni-lottery-8d0e6.firebasestorage.app",
  messagingSenderId: "479140405683",
  appId: "1:479140405683:web:20a2205ece9fdcdf076bc6",
  measurementId: "G-6MG08FXC7V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
