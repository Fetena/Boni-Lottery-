/* ====================================================
   SIMPLIFIED FIREBASE - NO AUTH, GUEST TICKETING
   Stores tickets with customer contact info
   ==================================================== */

import { db } from './firebase-config.js';
import { 
  collection, 
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ============================================
// GLOBAL VARIABLES
// ============================================
let allTickets = [];
let currentCustomerInfo = null;

// ============================================
// CUSTOMER CONTACT FORM (REPLACES LOGIN)
// ============================================

export function showCustomerFormModal() {
  const modal = document.getElementById('customer-info-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

export function hideCustomerFormModal() {
  const modal = document.getElementById('customer-info-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

export async function handleCustomerSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  
  if (!name || !phone) {
    showNotificationToast("Name and phone are required!", "error");
    return;
  }

  // Store in session/temp variable (not Firebase yet)
  currentCustomerInfo = {
    name: name,
    phone: phone,
    email: email || "not-provided"
  };

  console.log("✅ Customer info saved:", currentCustomerInfo);
  showNotificationToast(`Welcome ${name}! Select your lucky numbers.`);
  hideCustomerFormModal();
  
  // Clear form
  document.getElementById('customer-form').reset();
}

// ============================================
// SAVE TICKET TO FIRESTORE
// ============================================

export async function saveTicketToFirestore(ticketData) {
  if (!currentCustomerInfo) {
    showNotificationToast("Please submit your contact info first!", "error");
    return null;
  }

  try {
    // Combine ticket data with customer info
    const completeTicketData = {
      ...ticketData,
      // Customer details (instead of Firebase auth)
      customerName: currentCustomerInfo.name,
      customerPhone: currentCustomerInfo.phone,
      customerEmail: currentCustomerInfo.email,
      
      // Metadata
      createdAt: serverTimestamp(),
      status: "Verifying",
      transactionVerified: false
    };

    const docRef = await addDoc(collection(db, "tickets"), completeTicketData);
    
    console.log("✅ Ticket saved to Firestore:", docRef.id);
    
    // Send Telegram notification
    await sendTelegramNotification(docRef.id, completeTicketData);
    
    return docRef.id;
  } catch (error) {
    console.error("❌ Error saving ticket:", error);
    showNotificationToast("Failed to save ticket: " + error.message, "error");
    throw error;
  }
}

// ============================================
// TELEGRAM NOTIFICATIONS
// ============================================

const TELEGRAM_BOT_TOKEN = "8867724899:AAGBqei23Rrqj47uumDLJKcOyINa4k-5F70";
const TELEGRAM_CHAT_ID = "-1005120162870";

export async function sendTelegramNotification(ticketId, ticketData) {
  try {
    const numbersString = ticketData.numbers.map(n => String(n).padStart(3, '0')).join(', ');
    
    const message = `🎫 *NEW BONI LOTTERY TICKET* 🎫\n\n` +
                    `*Ticket ID:* \`${ticketId}\`\n` +
                    `*Customer Name:* ${ticketData.customerName}\n` +
                    `*Phone:* ${ticketData.customerPhone}\n` +
                    `*Email:* ${ticketData.customerEmail}\n\n` +
                    `*Numbers Selected:* \`${numbersString}\`\n` +
                    `*Transaction Ref:* \`${ticketData.transactionId || 'Pending'}\`\n` +
                    `*Total Cost:* \`${ticketData.totalCost} ETB\`\n` +
                    `*Status:* Awaiting verification\n` +
                    `*Date:* ${new Date().toLocaleString()}\n\n` +
                    `➡️ Admin: Verify transaction receipt and confirm payment`;

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      throw new Error("Telegram API error");
    }

    console.log("✅ Telegram notification sent");
    return true;

  } catch (error) {
    console.error("❌ Telegram error:", error);
    // Don't throw - allow ticket to save even if notification fails
    return false;
  }
}

// ============================================
// LOAD ALL TICKETS (PUBLIC VIEW)
// ============================================

export async function loadAllTickets() {
  try {
    const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    allTickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("✅ Loaded all tickets:", allTickets.length);
    return allTickets;
  } catch (error) {
    console.error("❌ Error loading tickets:", error);
    return [];
  }
}

// ============================================
// UPDATE TICKET STATUS (ADMIN VERIFICATION)
// ============================================

export async function updateTicketStatus(ticketId, newStatus) {
  try {
    const ticketRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketRef, {
      status: newStatus,
      transactionVerified: newStatus === 'Active',
      updatedAt: serverTimestamp()
    });

    console.log("✅ Ticket updated:", ticketId, "→", newStatus);
    return true;
  } catch (error) {
    console.error("❌ Error updating ticket:", error);
    return false;
  }
}

// ============================================
// SAVE DRAW RESULT
// ============================================

export async function saveDraw(winningNumber) {
  try {
    const drawRef = await addDoc(collection(db, "draws"), {
      winningNumber: winningNumber,
      timestamp: serverTimestamp(),
      date: new Date().toLocaleString()
    });

    console.log("✅ Draw result saved:", winningNumber);
    
    // Send Telegram notification
    const message = `🎰 *LOTTERY DRAW RESULT* 🎰\n\n` +
                    `*Winning Number:* \`${String(winningNumber).padStart(3, '0')}\`\n` +
                    `*Date:* ${new Date().toLocaleString()}\n\n` +
                    `Check your tickets! Winners will be notified shortly.`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    return drawRef.id;
  } catch (error) {
    console.error("❌ Error saving draw:", error);
    throw error;
  }
}

// ============================================
// EXPORT FOR GLOBAL USE
// ============================================

window.guestTicketing = {
  showCustomerFormModal,
  hideCustomerFormModal,
  handleCustomerSubmit,
  saveTicketToFirestore,
  loadAllTickets,
  updateTicketStatus,
  saveDraw,
  sendTelegramNotification,
  getCurrentCustomerInfo: () => currentCustomerInfo,
  getAllTickets: () => allTickets
};

console.log("🚀 Guest Ticketing System loaded!");
