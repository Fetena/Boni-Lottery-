// ============================================
// MAIN ADMIN - TRANSACTIONS & TICKET APPROVALS (WITH RECEIPT POPUP & DELETE)
// ============================================

class Transactions {
    constructor() {
        this.transactions = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-white">📋 Customer Transactions & Ticket Approvals</h3>
                </div>
                <div id="transactions-list" class="space-y-3">${this.renderTransactionsList()}</div>
            </div>

            <!-- Receipt Modal Preview Container -->
            <div id="main-admin-receipt-modal" class="fixed inset-0 bg-black/85 z-50 hidden flex items-center justify-center p-4">
                <div class="glass-panel rounded-2xl max-w-2xl w-full p-6 border border-yellow-400/30 space-y-4 bg-black relative shadow-2xl">
                    <div class="flex justify-between items-center border-b border-yellow-400/20 pb-3">
                        <h4 class="text-base font-bold text-yellow-400">📄 Attached Payment Document / Receipt</h4>
                        <button onclick="window.mainAdminDashboard.transactions.closeReceiptModal()" class="text-slate-400 hover:text-white text-base font-bold px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">&times;</button>
                    </div>
                    <div id="main-admin-receipt-content" class="flex justify-center items-center max-h-[70vh] overflow-auto py-2"></div>
                    <div class="flex justify-end pt-3 border-t border-yellow-400/20">
                        <button onclick="window.mainAdminDashboard.transactions.closeReceiptModal()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all">Close Preview</button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;

            const snapshot = await db.collection('customer_tickets')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            this.transactions = snapshot.docs.map((doc, index) => ({
                id: doc.id,
                index: index + 1,
                ...doc.data()
            }));

            const listContainer = document.getElementById('transactions-list');
            if (listContainer) {
                listContainer.innerHTML = this.renderTransactionsList();
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }

    async approvePayment(docId) {
    if (!db) return notify('error', '❌ Database not initialized');
    try {
        await db.collection('customer_tickets').doc(docId).update({
            status: 'Approved',
            approvedByAdminName: currentUser?.email || 'Main Admin',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 🔒 ADD THIS LINE TO RECORD AUDIT LOG
        await AuditLog.logAction('Approve Payment', currentUser?.email, `Approved ticket/transaction ID: ${docId}`, 'SUCCESS');

        notify('success', '✅ Payment approved successfully!');
        await this.loadData();
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
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async deleteTransaction(docId) {
        if (!confirm('Are you sure you want to delete this transaction/ticket?')) return;
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            await db.collection('customer_tickets').doc(docId).delete();
            notify('success', '🗑️ Transaction deleted successfully!');
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    viewReceipt(url) {
        const modal = document.getElementById('main-admin-receipt-modal');
        const container = document.getElementById('main-admin-receipt-content');
        if (!modal || !container) return;

        const isImage = /\.(jpeg|jpg|gif|png|webp|avif)(?=\?|#|$)/i.test(url) || url.startsWith('data:image');
        container.innerHTML = isImage ? 
            `<img src="${url}" alt="Payment Receipt" class="max-w-full max-h-[65vh] rounded-xl border border-yellow-400/20 object-contain shadow-lg">` :
            `<div class="text-center space-y-3 py-6"><p class="text-sm text-slate-300">Document ready for review.</p><a href="${url}" target="_blank" class="px-4 py-2.5 bg-yellow-400 text-black font-bold rounded-xl inline-block text-xs">🔗 Open Document in New Tab</a></div>`;

        modal.classList.remove('hidden');
    }

    closeReceiptModal() {
        const modal = document.getElementById('main-admin-receipt-modal');
        if (modal) modal.classList.add('hidden');
    }

    renderTransactionsList() {
        if (this.transactions.length === 0) {
            return '<div class="glass-panel rounded-2xl p-8 border border-yellow-400/10 text-center text-slate-400">No transactions yet</div>';
        }

        return this.transactions.map(trans => {
            const createdAt = trans.createdAt?.toDate?.() || new Date();
            const statusColor = trans.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                trans.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 animate-pulse';

            const receiptUrl = trans.receiptFile || trans.receiptUrl || trans.attachment || trans.fileUrl || trans.imageUrl || null;
            let receiptButton = receiptUrl ? `
                <div class="pt-1">
                    <button onclick="window.mainAdminDashboard.transactions.viewReceipt('${receiptUrl.replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all w-fit">
                        <span>📄</span> View Attached Receipt Document
                    </button>
                </div>
            ` : `<span class="text-[11px] text-slate-500 italic">No receipt attached</span>`;

            return `
                <div class="glass-panel rounded-xl p-5 border border-yellow-400/10 space-y-3 shadow-lg">
                    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div class="space-y-1.5 text-xs">
                            <p class="font-extrabold text-white text-base">Transaction #${trans.index} <span class="text-yellow-400 font-mono">(${trans.customerEmail || trans.customerName})</span></p>
                            <p class="text-slate-300">Customer Name: <span class="text-white font-medium">${trans.customerName || 'N/A'}</span></p>
                            <p class="text-slate-300">Assigned Branch Admin: <span class="text-yellow-400 font-medium">${trans.assignedAdmin || trans.adminEmail || 'Not Assigned'}</span></p>
                            <p class="text-slate-300">Selected Numbers: <span class="text-yellow-400 font-bold tracking-wide">${trans.numbers?.join(', ') || 'N/A'}</span></p>
                            <p class="text-slate-300">Amount: <span class="text-purple-400 font-bold">${trans.cost || 0} ETB</span></p>
                            <p class="text-slate-300">Payment Method: <span class="text-slate-200 font-medium">${trans.paymentMethod || 'N/A'}</span></p>
                            <p class="text-slate-300">Transaction ID / Ref: <span class="text-slate-200 font-mono">${trans.transactionId || 'N/A'}</span></p>
                            <p class="text-slate-400 pt-0.5">Date: ${createdAt.toLocaleString()}</p>
                            ${receiptButton}
                        </div>
                        <div class="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                            <span class="px-3 py-1 rounded-md text-xs font-bold ${statusColor}">${trans.status || 'Pending'}</span>
                            <div class="flex flex-wrap gap-2 pt-1">
                                <button onclick="window.mainAdminDashboard.transactions.approvePayment('${trans.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all shadow-sm">Approve</button>
                                <button onclick="window.mainAdminDashboard.transactions.rejectPayment('${trans.id}')" class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-all shadow-sm">Reject</button>
                                <button onclick="window.mainAdminDashboard.transactions.deleteTransaction('${trans.id}')" class="px-3 py-1.5 bg-slate-900 hover:bg-rose-900/60 text-rose-400 border border-rose-500/25 font-bold rounded-lg text-xs transition-all">🗑️ Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}
