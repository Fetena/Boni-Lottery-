class Transactions {
    constructor() {
        this.transactions = [];
    }

    // ... your render and loadData methods ...

    async approvePayment(docId) {
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            await db.collection('customer_tickets').doc(docId).update({
                status: 'Approved',
                approvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            notify('success', '✅ Payment approved successfully!');
            await this.loadData(); // Refresh the list
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
            await this.loadData(); // Refresh the list
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
            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-white">Transaction #${trans.index}</p>
                            <p class="text-xs text-slate-400">Customer: ${trans.customerName || 'N/A'}</p>
                            <p class="text-xs text-slate-400">Amount: ${trans.cost || 0} ETB</p>
                            <p class="text-xs text-slate-400">Date: ${createdAt.toLocaleDateString()}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded">${trans.status || 'Pending'}</span>
                            <button onclick="window.mainAdminDashboard.transactions.approvePayment('${trans.id}')" class="px-2 py-1 bg-emerald-600 text-white text-xs rounded">Approve</button>
                            <button onclick="window.mainAdminDashboard.transactions.rejectPayment('${trans.id}')" class="px-2 py-1 bg-red-600 text-white text-xs rounded">Reject</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}
