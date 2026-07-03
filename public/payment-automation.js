/* ====================================================
   PAYMENT AUTOMATION SYSTEM
   Automate payment verification and tracking
   ==================================================== */

import { db } from './firebase-config.js';
import { 
  collection, 
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// Payment methods supported
const PAYMENT_METHODS = {
  TELEBIRR: 'telebirr',
  CBE_BIRR: 'cbe_birr',
  BANK_TRANSFER: 'bank_transfer'
};

// Payment status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
  EXPIRED: 'expired'
};

// ============================================
// PAYMENT PROCESSING
// ============================================

export async function createPayment(ticketId, customerId, amount, paymentMethod, transactionRef) {
  try {
    const paymentRef = await addDoc(collection(db, "payments"), {
      ticketId: ticketId,
      customerId: customerId,
      amount: amount,
      paymentMethod: paymentMethod,
      transactionRef: transactionRef,
      status: PAYMENT_STATUS.PENDING,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
      verifiedBy: null,
      verifiedAt: null
    });

    console.log("✅ Payment created:", paymentRef.id);
    return paymentRef.id;

  } catch (error) {
    console.error("❌ Error creating payment:", error);
    throw error;
  }
}

export async function verifyPayment(paymentId, adminId, adminName) {
  try {
    const paymentRef = doc(db, "payments", paymentId);
    
    await updateDoc(paymentRef, {
      status: PAYMENT_STATUS.VERIFIED,
      verifiedBy: adminId,
      verifiedByName: adminName,
      verifiedAt: serverTimestamp()
    });

    // Update corresponding ticket status
    const payment = await getPayment(paymentId);
    if (payment && payment.ticketId) {
      await updateDoc(doc(db, "tickets", payment.ticketId), {
        status: 'Active',
        paymentVerified: true,
        verifiedAt: serverTimestamp()
      });
    }

    console.log("✅ Payment verified:", paymentId);
    return true;

  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    throw error;
  }
}

export async function rejectPayment(paymentId, adminId, adminName, reason) {
  try {
    const paymentRef = doc(db, "payments", paymentId);
    
    await updateDoc(paymentRef, {
      status: PAYMENT_STATUS.FAILED,
      rejectedBy: adminId,
      rejectedByName: adminName,
      rejectionReason: reason,
      rejectedAt: serverTimestamp()
    });

    // Update ticket status
    const payment = await getPayment(paymentId);
    if (payment && payment.ticketId) {
      await updateDoc(doc(db, "tickets", payment.ticketId), {
        status: 'Payment Failed',
        paymentVerified: false
      });
    }

    console.log("✅ Payment rejected:", paymentId);
    return true;

  } catch (error) {
    console.error("❌ Error rejecting payment:", error);
    throw error;
  }
}

export async function getPayment(paymentId) {
  try {
    const paymentRef = doc(db, "payments", paymentId);
    const snapshot = await getDoc(paymentRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    };
  } catch (error) {
    console.error("❌ Error getting payment:", error);
    return null;
  }
}

export async function getPendingPayments() {
  try {
    const q = query(
      collection(db, "payments"),
      where("status", "==", PAYMENT_STATUS.PENDING)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("❌ Error loading pending payments:", error);
    return [];
  }
}

export async function getPaymentsByCustomer(customerId) {
  try {
    const q = query(
      collection(db, "payments"),
      where("customerId", "==", customerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("❌ Error loading customer payments:", error);
    return [];
  }
}

// ============================================
// AUTOMATED PAYMENT TRACKING
// ============================================

export async function getPaymentStats() {
  try {
    const payments = await getDocs(collection(db, "payments"));
    
    let stats = {
      total: 0,
      pending: 0,
      verified: 0,
      failed: 0,
      totalAmount: 0,
      verifiedAmount: 0
    };

    payments.forEach(doc => {
      const payment = doc.data();
      stats.total++;
      stats.totalAmount += payment.amount || 0;

      if (payment.status === PAYMENT_STATUS.PENDING) {
        stats.pending++;
      } else if (payment.status === PAYMENT_STATUS.VERIFIED) {
        stats.verified++;
        stats.verifiedAmount += payment.amount || 0;
      } else if (payment.status === PAYMENT_STATUS.FAILED) {
        stats.failed++;
      }
    });

    return stats;

  } catch (error) {
    console.error("❌ Error getting payment stats:", error);
    return null;
  }
}

// ============================================
// PAYMENT METHOD MANAGEMENT
// ============================================

export async function addPaymentAccount(paymentMethod, accountName, accountNumber, accountHolder) {
  try {
    await addDoc(collection(db, "payment_accounts"), {
      paymentMethod: paymentMethod,
      accountName: accountName,
      accountNumber: accountNumber,
      accountHolder: accountHolder,
      isActive: true,
      createdAt: serverTimestamp()
    });

    console.log("✅ Payment account added");
    return true;

  } catch (error) {
    console.error("❌ Error adding payment account:", error);
    return false;
  }
}

export async function getPaymentAccounts() {
  try {
    const snapshot = await getDocs(collection(db, "payment_accounts"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("❌ Error loading payment accounts:", error);
    return [];
  }
}

// ============================================
// EXPORT TO GLOBAL
// ============================================

window.paymentSystem = {
  createPayment,
  verifyPayment,
  rejectPayment,
  getPayment,
  getPendingPayments,
  getPaymentsByCustomer,
  getPaymentStats,
  addPaymentAccount,
  getPaymentAccounts,
  PAYMENT_METHODS,
  PAYMENT_STATUS
};

console.log("🚀 Payment Automation System loaded!");
