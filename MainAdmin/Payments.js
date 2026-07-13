// MAIN ADMIN PAYMENTS (CHILD)
class MainAdminPayments {
    constructor() {}
    render() {
        return `<div class="space-y-4">
            <h3 class="text-2xl font-bold text-white">💳 Platform Payments</h3>
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                <h4 class="font-bold text-white mb-4">Pending Verifications: 3</h4>
                <div class="space-y-2">
                    <div class="bg-yellow-400/10 border border-yellow-400 rounded-lg p-4">
                        <p class="font-bold text-white">TXN456 - Mohammed</p>
                        <p class="text-sm text-slate-300">500 ETB via Telebirr</p>
                        <div class="flex gap-2 mt-2">
                            <button onclick="mainAdminPayments.approve('TXN456')" class="px-3 py-1 bg-emerald-950/30 text-emerald-400 text-xs rounded">Approve</button>
                            <button onclick="mainAdminPayments.reject('TXN456')" class="px-3 py-1 bg-red-950/30 text-red-400 text-xs rounded">Reject</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }
    approve(txnId) { showNotification('success', `✅ ${txnId} approved`); }
    reject(txnId) { showNotification('info', `❌ ${txnId} rejected`); }
}
let mainAdminPayments;
