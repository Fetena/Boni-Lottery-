class AdminPayments {
    constructor(adminId) {
        this.adminId = adminId;
    }

    async render() {
        let telebirr = '0945792677';
        let cbe = '0945792677';

        try {
            const doc = await db.collection('admin_settings').doc(this.adminId).get();
            if (doc.exists) {
                const data = doc.data();
                telebirr = data.telebirrPhone || telebirr;
                cbe = data.cbeAccount || cbe;
            }
        } catch (e) {
            console.error('Error fetching payments:', e);
        }

        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">💳 Manage Payments</h3>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <div>
                        <label class="text-sm text-slate-400">Telebirr Number</label>
                        <input type="text" id="admin-telebirr" value="${telebirr}" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>
                    <div>
                        <label class="text-sm text-slate-400">CBE Birr Account</label>
                        <input type="text" id="admin-cbe" value="${cbe}" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>
                    <button onclick="window.adminPayments.savePaymentAccounts()" 
                        class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">Save Payment Accounts</button>
                </div>
            </div>
        `;
    }

    async savePaymentAccounts() {
        const telebirr = document.getElementById('admin-telebirr')?.value;
        const cbe = document.getElementById('admin-cbe')?.value;

        if (!telebirr || !cbe) {
            notify('error', '❌ Fill all payment accounts');
            return;
        }

        try {
            await db.collection('admin_settings').doc(this.adminId).set({
                adminEmail: this.adminId,
                telebirrPhone: telebirr,
                cbeAccount: cbe,
                updatedAt: new Date()
            }, { merge: true });

            notify('success', '✅ Payment accounts saved!');
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}

window.adminPayments = null;
