// MAIN ADMIN TRANSACTIONS (CHILD)
class MainAdminTransactions {
    constructor() {}
    render() {
        return `<div class="space-y-4">
            <h3 class="text-2xl font-bold text-white">📋 All Transactions</h3>
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <input type="date" id="txn-from" class="bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                    <input type="date" id="txn-to" class="bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                </div>
                <button class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">📥 Export Report</button>
            </div>
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                <h4 class="font-bold text-white mb-4">Transaction History</h4>
                <div class="space-y-2 max-h-80 overflow-y-auto">
                    <div class="bg-black/30 rounded-lg p-3 text-sm border border-yellow-400/10">
                        <p class="text-white"><strong>TXN123</strong> | 500 ETB | ✅ Verified</p>
                        <p class="text-xs text-slate-400">Mohammed | Telebirr | 2:45 PM</p>
                    </div>
                </div>
            </div>
        </div>`;
    }
}
let mainAdminTransactions;
