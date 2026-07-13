// ============================================
// CUSTOMER PROFILE (CHILD COMPONENT)
// Parent: CustomerDashboard
// ============================================

class CustomerProfile {
    constructor(custId) {
        this.custId = custId;
        this.data = db.getCustomer(custId);
    }

    render() {
        if (!this.data) return '<p>No customer data</p>';
        
        return `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                        <p class="text-xs text-slate-400">Admin</p>
                        <p class="text-xl font-bold text-yellow-400 mt-2">${this.data.adminId}</p>
                    </div>
                    <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                        <p class="text-xs text-slate-400">Range</p>
                        <p class="text-xl font-bold text-blue-400 mt-2">1 - 300</p>
                    </div>
                    <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                        <p class="text-xs text-slate-400">Tickets</p>
                        <p class="text-xl font-bold text-emerald-400 mt-2" id="profile-ticket-count">${this.data.tickets || 0}</p>
                    </div>
                    <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                        <p class="text-xs text-slate-400">Spent</p>
                        <p class="text-xl font-bold text-purple-400 mt-2" id="profile-spent">${this.data.spent || 0} ETB</p>
                    </div>
                </div>

                <div class="glass-panel rounded-2xl p-8 border border-yellow-400/10 text-center space-y-4">
                    <h4 class="text-2xl font-bold text-white">Next Drawing</h4>
                    <p class="text-yellow-400 font-bold text-xl">Sunday, 8:00 PM</p>
                    <button onclick="showNotification('info', '📱 Opening TikTok @BoniLottery')" class="px-6 py-2 bg-yellow-400 text-black font-bold rounded-xl">📱 Watch Live</button>
                </div>
            </div>
        `;
    }
}
