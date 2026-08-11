// ============================================
// MAIN ADMIN - ANALYTICS
// ============================================

class Analytics {
    constructor() {
        this.analytics = {};
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📈 Platform Analytics</h3>
                <div id="analytics-content" class="space-y-3">
                    <div class="glass-panel rounded-lg p-6 border border-yellow-400/10">
                        <p class="text-slate-400 text-sm">Total Revenue (All Time)</p>
                        <p class="text-4xl font-bold text-yellow-400 mt-2" id="analytics-total-revenue">0 ETB</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                            <p class="text-slate-400 text-xs">This Month</p>
                            <p class="text-2xl font-bold text-blue-400 mt-2" id="analytics-month-revenue">0 ETB</p>
                        </div>
                        <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                            <p class="text-slate-400 text-xs">This Week</p>
                            <p class="text-2xl font-bold text-emerald-400 mt-2" id="analytics-week-revenue">0 ETB</p>
                        </div>
                    </div>
                    <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                        <p class="text-slate-400 text-sm">Total Transactions</p>
                        <p class="text-3xl font-bold text-purple-400 mt-2" id="analytics-total-transactions">0</p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;

            const ticketsSnapshot = await db.collection('customer_tickets').get();
            let totalRevenue = 0;
            let monthRevenue = 0;
            let weekRevenue = 0;

            const now = new Date();
            const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            ticketsSnapshot.forEach(doc => {
                const data = doc.data();
                const cost = data.cost || 0;
                totalRevenue += cost;

                const createdAt = data.createdAt?.toDate?.() || new Date();
                if (createdAt >= monthAgo) monthRevenue += cost;
                if (createdAt >= weekAgo) weekRevenue += cost;
            });

            const totalRevenueEl = document.getElementById('analytics-total-revenue');
            const monthRevenueEl = document.getElementById('analytics-month-revenue');
            const weekRevenueEl = document.getElementById('analytics-week-revenue');
            const totalTransEl = document.getElementById('analytics-total-transactions');

            if (totalRevenueEl) totalRevenueEl.textContent = totalRevenue.toLocaleString() + ' ETB';
            if (monthRevenueEl) monthRevenueEl.textContent = monthRevenue.toLocaleString() + ' ETB';
            if (weekRevenueEl) weekRevenueEl.textContent = weekRevenue.toLocaleString() + ' ETB';
            if (totalTransEl) totalTransEl.textContent = ticketsSnapshot.size;
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }
}
