// ============================================
// MAIN ADMIN - TRANSACTIONS & TICKET APPROVALS
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
                approvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            notify('success', '✅ Payment approved successfully by Main Admin!');
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

    renderTransactionsList() {
        if (this.transactions.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No transactions yet</p>';
        }

        return this.transactions.map(trans => {
            const createdAt = trans.createdAt?.toDate?.() || new Date();
            const statusColor = trans.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 
                                trans.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-400/20 text-yellow-400';

            return `
                <div class="glass-panel rounded-xl p-4 border border-yellow-400/10 space-y-2">
                    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div class="space-y-1 text-xs">
                            <p class="font-bold text-white text-base">Transaction #${trans.index} (${trans.customerEmail || trans.customerName})</p>
                            <p class="text-slate-300">Customer Name: <span class="text-white">${trans.customerName || 'N/A'}</span></p>
                            <p class="text-slate-300">Assigned Branch Admin: <span class="text-yellow-400">${trans.assignedAdmin || trans.adminEmail || 'Not Assigned'}</span></p>
                            <p class="text-slate-300">Selected Numbers: <span class="text-yellow-400 font-bold">${trans.numbers?.join(', ') || 'N/A'}</span></p>
                            <p class="text-slate-300">Amount: <span class="text-white font-bold">${trans.cost || 0} ETB</span></p>
                            <p class="text-slate-300">Payment Method: <span class="text-slate-200">${trans.paymentMethod || 'N/A'}</span></p>
                            <p class="text-slate-300">Transaction ID / Ref: <span class="text-slate-200">${trans.transactionId || 'N/A'}</span></p>
                            <p class="text-slate-400">Date: ${createdAt.toLocaleString()}</p>
                            ${trans.receiptFile ? `<div class="mt-2"><a href="${trans.receiptFile}" target="_blank" class="text-yellow-400 underline font-bold">📄 View Uploaded Receipt Document</a></div>` : ''}
                        </div>
                        <div class="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                            <span class="px-3 py-1 rounded text-xs font-bold ${statusColor}">${trans.status || 'Pending'}</span>
                            <div class="flex gap-2 mt-2">
                                <button onclick="window.mainAdminDashboard.transactions.approvePayment('${trans.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all">Approve</button>
                                <button onclick="window.mainAdminDashboard.transactions.rejectPayment('${trans.id}')" class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-all">Reject</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}
