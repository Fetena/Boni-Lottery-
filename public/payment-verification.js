/**
 * PAYMENT VERIFICATION SYSTEM
 * Handles customer payment submissions and Firestore integration
 */

const TICKET_PRICE = 100; // ETB per number
const TELEGRAM_BOT_TOKEN = "8867724899:AAGBqei23Rrqj47uumDLJKcOyINa4k-5F70";
const TELEGRAM_CHAT_ID = "-1005120162870";

// Generate unique ticket ID
function generateTicketId() {
    return 'TK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Submit payment and create ticket
async function submitPayment(formData) {
    try {
        const { addDoc, collection, serverTimestamp } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        const ticketId = generateTicketId();
        const totalCost = formData.selectedNumbers.length * TICKET_PRICE;

        // Save ticket to Firestore
        const ticketRef = await addDoc(collection(window.db, "tickets"), {
            ticketId: ticketId,
            customerName: formData.name,
            customerPhone: formData.phone,
            customerEmail: formData.email,
            numbers: formData.selectedNumbers,
            totalCost: totalCost,
            paymentMethod: formData.paymentMethod,
            transactionId: formData.transactionId,
            receiptUrl: formData.receiptUrl || null,
            status: "Pending Verification",
            createdAt: serverTimestamp(),
            verified: false,
            verifiedBy: null,
            verifiedAt: null
        });

        // Create payment record
        const paymentRef = await addDoc(collection(window.db, "payments"), {
            ticketId: ticketId,
            customerName: formData.name,
            customerPhone: formData.phone,
            amount: totalCost,
            paymentMethod: formData.paymentMethod,
            transactionRef: formData.transactionId,
            receiptUrl: formData.receiptUrl || null,
            status: "pending",
            verifiedBy: null,
            verifiedAt: null,
            createdAt: serverTimestamp()
        });

        // Send notification to admin via Telegram
        await notifyAdminTelegram({
            ticketId: ticketId,
            customerName: formData.name,
            customerPhone: formData.phone,
            amount: totalCost,
            paymentMethod: formData.paymentMethod,
            transactionId: formData.transactionId,
            numbersCount: formData.selectedNumbers.length
        });

        // Log activity
        await logActivity({
            action: "Ticket Submitted",
            details: `Customer ${formData.name} submitted ticket ${ticketId} for ${totalCost} ETB`,
            adminName: "System"
        });

        return {
            success: true,
            ticketId: ticketId,
            message: "Payment submitted successfully! Waiting for admin verification."
        };

    } catch (error) {
        console.error("Error submitting payment:", error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Notify admin via Telegram
async function notifyAdminTelegram(paymentData) {
    const message = `
🎫 **NEW PAYMENT RECEIVED**

📋 Ticket ID: ${paymentData.ticketId}
👤 Customer: ${paymentData.customerName}
📱 Phone: ${paymentData.customerPhone}
💰 Amount: ${paymentData.amount} ETB
🔢 Numbers: ${paymentData.numbersCount}
💳 Method: ${paymentData.paymentMethod}
🆔 Transaction ID: ${paymentData.transactionId}

⏳ Status: **PENDING VERIFICATION**

👉 Click "Verify Payment" in admin dashboard
    `;

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
    } catch (error) {
        console.error("Telegram notification failed:", error);
    }
}

// Log admin activity
async function logActivity(data) {
    try {
        const { addDoc, collection, serverTimestamp } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        await addDoc(collection(window.db, "activity_logs"), {
            action: data.action,
            details: data.details,
            adminName: data.adminName,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error logging activity:", error);
    }
}

// Get payment status for customer
async function getPaymentStatus(ticketId) {
    try {
        const { getDocs, collection, query, where } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        const q = query(collection(window.db, "tickets"), where("ticketId", "==", ticketId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].data();
    } catch (error) {
        console.error("Error getting payment status:", error);
        return null;
    }
}

// Verify payment (Admin function)
async function verifyPayment(ticketId, adminName) {
    try {
        const { getDocs, collection, query, where, updateDoc, doc, serverTimestamp } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        // Update ticket
        const ticketQuery = query(collection(window.db, "tickets"), where("ticketId", "==", ticketId));
        const ticketSnapshot = await getDocs(ticketQuery);

        if (ticketSnapshot.empty) {
            return { success: false, message: "Ticket not found" };
        }

        const ticketDocId = ticketSnapshot.docs[0].id;
        const ticketData = ticketSnapshot.docs[0].data();

        await updateDoc(doc(window.db, "tickets", ticketDocId), {
            status: "Active",
            verified: true,
            verifiedBy: adminName,
            verifiedAt: serverTimestamp()
        });

        // Update payment
        const paymentQuery = query(collection(window.db, "payments"), where("ticketId", "==", ticketId));
        const paymentSnapshot = await getDocs(paymentQuery);

        if (!paymentSnapshot.empty) {
            const paymentDocId = paymentSnapshot.docs[0].id;
            await updateDoc(doc(window.db, "payments", paymentDocId), {
                status: "verified",
                verifiedBy: adminName,
                verifiedAt: serverTimestamp()
            });
        }

        // Log activity
        await logActivity({
            action: "Payment Verified",
            details: `Verified ticket ${ticketId}. Customer: ${ticketData.customerName}`,
            adminName: adminName
        });

        // Notify customer
        await notifyCustomerTelegram({
            customerName: ticketData.customerName,
            ticketId: ticketId,
            numbers: ticketData.numbers.join(", ")
        });

        return { success: true, message: "Payment verified successfully!" };

    } catch (error) {
        console.error("Error verifying payment:", error);
        return { success: false, message: error.message };
    }
}

// Reject payment (Admin function)
async function rejectPayment(ticketId, reason, adminName) {
    try {
        const { getDocs, collection, query, where, updateDoc, doc, serverTimestamp, deleteDoc } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        // Get ticket data before deletion
        const ticketQuery = query(collection(window.db, "tickets"), where("ticketId", "==", ticketId));
        const ticketSnapshot = await getDocs(ticketQuery);

        if (ticketSnapshot.empty) {
            return { success: false, message: "Ticket not found" };
        }

        const ticketData = ticketSnapshot.docs[0].data();
        const ticketDocId = ticketSnapshot.docs[0].id;

        // Delete ticket
        await deleteDoc(doc(window.db, "tickets", ticketDocId));

        // Update payment
        const paymentQuery = query(collection(window.db, "payments"), where("ticketId", "==", ticketId));
        const paymentSnapshot = await getDocs(paymentQuery);

        if (!paymentSnapshot.empty) {
            const paymentDocId = paymentSnapshot.docs[0].id;
            await updateDoc(doc(window.db, "payments", paymentDocId), {
                status: "rejected",
                rejectionReason: reason,
                rejectedBy: adminName,
                rejectedAt: serverTimestamp()
            });
        }

        // Log activity
        await logActivity({
            action: "Payment Rejected",
            details: `Rejected ticket ${ticketId}. Reason: ${reason}`,
            adminName: adminName
        });

        return { success: true, message: "Payment rejected successfully!" };

    } catch (error) {
        console.error("Error rejecting payment:", error);
        return { success: false, message: error.message };
    }
}

// Notify customer via Telegram
async function notifyCustomerTelegram(data) {
    const message = `
✅ **YOUR TICKET IS ACTIVE!**

🎫 Ticket ID: ${data.ticketId}
🎰 Numbers: ${data.numbers}

📺 Watch live draw at 8:00 PM today on TikTok!
Link: https://www.tiktok.com/@bonilottery

Good luck! 🍀
    `;

    try {
        // This would need customer's Telegram ID in real implementation
        // For now, just log it
        console.log("Customer notification:", message);
    } catch (error) {
        console.error("Customer notification failed:", error);
    }
}

export {
    generateTicketId,
    submitPayment,
    getPaymentStatus,
    verifyPayment,
    rejectPayment,
    notifyAdminTelegram,
    logActivity
};

window.submitPayment = submitPayment;
window.getPaymentStatus = getPaymentStatus;
window.verifyPayment = verifyPayment;
window.rejectPayment = rejectPayment;
