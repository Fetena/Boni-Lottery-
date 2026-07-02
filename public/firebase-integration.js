/* ====================================================
   FIREBASE INTEGRATION SCRIPT FOR BONI LOTTERY
   This file replaces your localStorage with Firestore
   ==================================================== */

// Import Firebase modules at the top of your HTML
// Add this script tag BEFORE your main page script:
// <script type="module" src="firebase-integration.js"></script>

import { db, auth } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

// ============================================
// GLOBAL STATE MANAGEMENT
// ============================================
let currentUser = null;
let userTickets = [];
let drawResults = [];

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/* Initialize auth state listener */
export function initAuthListener() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      console.log("✅ User logged in:", user.email);
      
      // Load user's tickets from Firestore
      await loadUserTickets(user.uid);
      
      // Show authenticated UI
      updateAuthUI(true);
      
      // Listen for real-time ticket updates
      listenToUserTickets(user.uid);
      
    } else {
      currentUser = null;
      console.log("❌ User logged out");
      updateAuthUI(false);
      showLoginModal();
    }
  });
}

/* User Sign Up */
export async function signUpUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      email: email,
      createdAt: serverTimestamp(),
      totalTickets: 0,
      totalSpent: 0
    });
    
    console.log("✅ User created:", email);
    return user;
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    throw error;
  }
}

/* User Login */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Login successful:", email);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Login error:", error.message);
    throw error;
  }
}

/* User Logout */
export async function logoutUser() {
  try {
    await signOut(auth);
    console.log("✅ Logged out");
  } catch (error) {
    console.error("❌ Logout error:", error);
  }
}

// ============================================
// TICKET MANAGEMENT - FIRESTORE
// ============================================

/* Save ticket to Firestore */
export async function saveTicketToFirestore(ticketData) {
  if (!currentUser) {
    console.error("❌ User not authenticated");
    return null;
  }

  try {
    const docRef = await addDoc(collection(db, "tickets"), {
      ...ticketData,
      uid: currentUser.uid,
      userEmail: currentUser.email,
      createdAt: serverTimestamp(),
      status: "Verifying"
    });
    
    console.log("✅ Ticket saved to Firestore:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error saving ticket:", error);
    throw error;
  }
}

/* Load user's tickets from Firestore */
export async function loadUserTickets(uid) {
  try {
    const q = query(collection(db, "tickets"), where("uid", "==", uid));
    const snapshot = await getDocs(q);
    
    userTickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log("✅ Loaded tickets:", userTickets.length);
    return userTickets;
  } catch (error) {
    console.error("❌ Error loading tickets:", error);
    return [];
  }
}

/* Real-time ticket listener */
export function listenToUserTickets(uid) {
  const q = query(collection(db, "tickets"), where("uid", "==", uid));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    userTickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Update UI with new data
    if (typeof updateTicketsHistoryUI === 'function') {
      updateTicketsHistoryUI();
    }
    
    console.log("🔄 Tickets updated:", userTickets.length);
  });
  
  return unsubscribe;
}

/* Update ticket status */
export async function updateTicketStatus(ticketId, newStatus) {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    console.log("✅ Ticket updated:", ticketId, "Status:", newStatus);
  } catch (error) {
    console.error("❌ Error updating ticket:", error);
  }
}

// ============================================
// DRAW RESULTS - FIRESTORE
// ============================================

/* Save draw result to Firestore */
export async function saveDraw(drawData) {
  try {
    const docRef = await addDoc(collection(db, "draws"), {
      ...drawData,
      timestamp: serverTimestamp(),
      date: new Date().toLocaleString()
    });
    
    console.log("✅ Draw saved:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error saving draw:", error);
    throw error;
  }
}

/* Get all draw results */
export async function loadDrawResults() {
  try {
    const snapshot = await getDocs(collection(db, "draws"));
    
    drawResults = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => b.timestamp - a.timestamp);
    
    console.log("✅ Loaded draws:", drawResults.length);
    return drawResults;
  } catch (error) {
    console.error("❌ Error loading draws:", error);
    return [];
  }
}

/* Real-time draw listener for live updates */
export function listenToDraws(callback) {
  const unsubscribe = onSnapshot(collection(db, "draws"), (snapshot) => {
    drawResults = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => b.timestamp - a.timestamp);
    
    if (callback) callback(drawResults);
    console.log("🔄 Draws updated:", drawResults.length);
  });
  
  return unsubscribe;
}

// ============================================
// DRAW SUBSCRIPTIONS
// ============================================

/* Save draw subscription */
export async function saveDrawSubscription(subscriptionData) {
  try {
    const docRef = await addDoc(collection(db, "subscriptions"), {
      ...subscriptionData,
      createdAt: serverTimestamp()
    });
    
    console.log("✅ Subscription saved:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error saving subscription:", error);
    throw error;
  }
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

function updateAuthUI(isLoggedIn) {
  const authElements = document.querySelectorAll('[data-auth-required]');
  const guestElements = document.querySelectorAll('[data-auth-guest]');
  
  authElements.forEach(el => {
    el.style.display = isLoggedIn ? 'block' : 'none';
  });
  
  guestElements.forEach(el => {
    el.style.display = isLoggedIn ? 'none' : 'block';
  });
  
  // Update header with user info
  const userEmailDisplay = document.getElementById('user-email-display');
  if (userEmailDisplay && currentUser) {
    userEmailDisplay.textContent = currentUser.email;
  }
}

function showLoginModal() {
  // Show login/signup modal
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

// ============================================
// EXPORT FOR GLOBAL USE
// ============================================

window.firebaseAuth = {
  signUpUser,
  loginUser,
  logoutUser,
  saveTicketToFirestore,
  loadUserTickets,
  updateTicketStatus,
  saveDraw,
  loadDrawResults,
  listenToDraws,
  saveDrawSubscription,
  getCurrentUser: () => currentUser,
  getUserTickets: () => userTickets,
  getDrawResults: () => drawResults
};

// Initialize on load
initAuthListener();
console.log("🚀 Firebase integration loaded!");
