// MAIN ADMIN - TRANSACTIONS
// ============================================

class Transactions {
    constructor() {
        this.transactions = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📋 Transactions</h3>
                <div id="transactions-list" class="space-y-3">${this.renderTransactionsList()}</div>
            </div>
        `;
    }

    async loadData() {
    try {
        const snapshot = await db.collection('transactions').orderBy('createdAt', 'desc').get();
        this.transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const listContainer = document.getElementById('transactions-list'); 
        if (listContainer) {
            listContainer.innerHTML = this.renderTransactionsList();
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

    renderTransactionsList() {
        if (this.transactions.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No transactions</p>';
        }

        return this.transactions.map(trans => `
            <div class="glass-panel rounded-lg p-3 border border-yellow-400/10 text-xs">
                <p class="text-white">${trans.description || 'Transaction'}</p>
                <p class="text-slate-400">${trans.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}</p>
            </div>
        `).join('');
    }
}
