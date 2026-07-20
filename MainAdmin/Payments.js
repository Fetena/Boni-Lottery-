// ============================================
// MAIN ADMIN - PAYMENTS MANAGEMENT
// ============================================

class Payments {
    constructor() {
        this.payments = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-white">💳 Payment Accounts</h3>
                    <button onclick="window.mainAdminDashboard.payments.showCreateModal()" class="px-4 py-2 bg-yellow-400 text-black font-bold rounded-xl">+ Add Account</button>
                </div>
                <div id="payments-list" class="space-y-3">${this.renderPaymentsList()}</div>
            </div>

            <!-- Create Payment Modal -->
            <div id="create-payment-modal" class="modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content p-6 m-auto">
                    <h3 class="text-xl font-bold text-white mb-4">Add Payment Account</h3>
                    <div class="space-y-3">
                        <input type="text" id="payment-name-input" placeholder="Account Name" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <input type="text" id="payment-type-input" placeholder="Type (Telebirr/CBE/Bank)" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <input type="text" id="payment-account-input" placeholder="Account Number/Phone" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <button onclick="window.mainAdminDashboard.payments.createPayment()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Create</button>
                        <button onclick="window.mainAdminDashboard.payments.closeCreateModal()" class="w-full py-2 bg-slate-700 text-white rounded-xl">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;
            const snapshot = await db.collection('payments').get();
            this.payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const listContainer = document.getElementById('payments-list');
            if (listContainer) {
                listContainer.innerHTML = this.renderPaymentsList();
            }
        } catch (error) {
            console.error('Error loading payments:', error);
        }
    }

    renderPaymentsList() {
        if (this.payments.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No payment accounts yet</p>';
        }

        return this.payments.map(payment => `
            <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-white">${payment.name || 'N/A'}</p>
                        <p class="text-xs text-slate-400">Type: ${payment.type || 'N/A'}</p>
                        <p class="text-xs text-slate-400">Account: ${payment.account || 'N/A'}</p>
                    </div>
                    <button onclick="window.mainAdminDashboard.payments.deletePayment('${payment.id}')" class="px-3 py-1 bg-red-400/20 text-red-400 text-xs rounded">Delete</button>
                </div>
            </div>
        `).join('');
    }

    showCreateModal() {
        const modal = document.getElementById('create-payment-modal');
        if (modal) modal.style.display = 'flex';
    }

    closeCreateModal() {
        const modal = document.getElementById('create-payment-modal');
        if (modal) modal.style.display = 'none';
    }

    async createPayment() {
        const name = document.getElementById('payment-name-input')?.value || '';
        const type = document.getElementById('payment-type-input')?.value || '';
        const account = document.getElementById('payment-account-input')?.value || '';

        if (!name || !type || !account) {
            notify('error', '❌ Fill all fields');
            return;
        }

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('payments').add({
                name: name,
                type: type,
                account: account,
                createdAt: new Date()
            });

            notify('success', '✅ Payment account added!');
            this.closeCreateModal();
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async deletePayment(paymentId) {
        if (!confirm('Delete this payment account?')) return;

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('payments').doc(paymentId).delete();
            notify('success', '✅ Payment account deleted');
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}
