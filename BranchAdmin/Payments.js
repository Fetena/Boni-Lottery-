// ============================================
// ADMIN PAYMENTS (CHILD COMPONENT)
// Parent: AdminDashboard
// ✅ SAVES: Payment accounts persist
// ============================================

class AdminPayments {
    constructor(adminId) {
        this.adminId = adminId;
    }

    render() {
        const adminData = db.getAdminSettings(this.adminId);
        const accounts = adminData?.paymentAccounts || { telebirr: '0945792677', cbe: '0945792677' };

        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">💳 Manage Payments</h3>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    
                    <div>
                        <label class="text-sm text-slate-400">Telebirr Number</label>
                        <input type="text" id="admin-telebirr" value="${accounts.telebirr}" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">CBE Birr Account</label>
                        <input type="text" id="admin-cbe" value="${accounts.cbe}" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>

                    <button onclick="adminPayments.savePaymentAccounts()" 
                        class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">Save Payment Accounts</button>
                </div>
            </div>
        `;
    }
async approvePayment(docId) {
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            await db.collection('customer_tickets').doc(docId).update({
                status: 'Approved',
                approvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            notify('success', '✅ Payment approved successfully!');
            await loadAdminTickets(); // Refresh the branch admin ticket list
            await loadAdminStats();  // Refresh revenue/stats
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async rejectPayment(docId) {
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            await db.collection('customer_tickets').doc(docId).update({
                status: 'Rejected',
                rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            notify('error', '❌ Payment rejected');
            await loadAdminTickets(); // Refresh the branch admin ticket list
            await loadAdminStats();  // Refresh stats
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
    savePaymentAccounts() {
        const telebirr = document.getElementById('admin-telebirr')?.value;
        const cbe = document.getElementById('admin-cbe')?.value;

        if (!telebirr || !cbe) {
            showNotification('error', '❌ Fill all payment accounts');
            return;
        }

        // Save ← PERSISTS to storage
        const success = db.updateAdminPaymentAccounts(this.adminId, {
            telebirr: telebirr,
            cbe: cbe
        });

        if (success) {
            showNotification('success', '✅ Payment accounts saved!');
        }
    }
}

// Global instance
let adminPayments;
