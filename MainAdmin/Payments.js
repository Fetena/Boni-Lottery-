// MAIN ADMIN - PAYMENTS MANAGEMENT
// ============================================

class Payments {
    constructor() {
        this.accounts = {};
    }

    render() {
        return `
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                <h3 class="text-xl font-bold text-white">💳 Platform Payment Accounts</h3>
                <div>
                    <label class="block text-xs text-slate-400 mb-2">Telebirr Phone</label>
                    <input type="tel" id="main-telebirr" placeholder="0945792677" value="${this.accounts.telebirr || ''}" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                </div>
                <div>
                    <label class="block text-xs text-slate-400 mb-2">CBE Account</label>
                    <input type="text" id="main-cbe" placeholder="Account number" value="${this.accounts.cbe || ''}" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                </div>
                <button onclick="mainAdminDashboard.payments.savePayments()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Save Payments</button>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;
            const doc = await db.collection('system_settings').doc('payments').get();
            if (doc.exists) {
                this.accounts = doc.data();
            }
        } catch (error) {
            console.error('Error loading payment settings:', error);
        }
    }

    async savePayments() {
        const telebirr = document.getElementById('main-telebirr').value;
        const cbe = document.getElementById('main-cbe').value;

        if (!telebirr || !cbe) {
            notify('error', '❌ Fill all fields');
            return;
        }

        try {
            await db.collection('system_settings').doc('payments').set({
                telebirr: telebirr,
                cbe: cbe,
                updatedAt: new Date()
            }, { merge: true });

            notify('success', '✅ Payment accounts saved!');
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}

