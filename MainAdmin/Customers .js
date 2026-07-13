// MAIN ADMIN CUSTOMERS (CHILD)
class MainAdminCustomers {
    constructor() {}
    render() {
        return `<div class="space-y-4">
            <h3 class="text-2xl font-bold text-white">👥 Global Customers</h3>
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                <div class="flex gap-2">
                    <input type="text" id="cust-search" placeholder="Search customers..." class="flex-1 bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                    <button onclick="mainAdminCustomers.search()" class="px-4 py-2 bg-yellow-400 text-black font-bold rounded-xl">🔍</button>
                </div>
                <select class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                    <option>All Admins</option>
                    <option>Admin 1</option>
                    <option>Admin 2</option>
                </select>
            </div>
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                <h4 class="font-bold text-white mb-4">Total Customers: 24</h4>
                <div class="space-y-2 max-h-80 overflow-y-auto">
                    <div class="bg-black/30 rounded-lg p-3 border border-yellow-400/10">
                        <p class="font-bold text-white text-sm">Mohammed Ali</p>
                        <p class="text-xs text-slate-400">Admin 1 | 5 tickets | 500 ETB</p>
                    </div>
                </div>
            </div>
        </div>`;
    }
    search() { showNotification('info', '🔍 Searching...'); }
}
let mainAdminCustomers;
