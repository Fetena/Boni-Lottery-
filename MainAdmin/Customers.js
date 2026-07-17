// ============================================
// MAIN ADMIN - CUSTOMERS MANAGEMENT
// ============================================

class Customers {
    constructor() {
        this.customers = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">👥 All Customers</h3>
                <div id="customers-list" class="space-y-3">${this.renderCustomersList()}</div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;
            const snapshot = await db.collection('customers').get();
            this.customers = [];
            snapshot.forEach(doc => {
                this.customers.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    }

    renderCustomersList() {
        if (this.customers.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No customers yet</p>';
        }

        return this.customers.map(cust => `
            <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                <p class="font-bold text-white">${cust.name || 'N/A'}</p>
                <p class="text-xs text-slate-400">${cust.email || 'N/A'} • ${cust.phone || 'N/A'}</p>
                <p class="text-xs text-slate-400">Tickets: ${cust.tickets || 0} • Spent: ${cust.spent || 0} ETB</p>
            </div>
        `).join('');
    }
}
