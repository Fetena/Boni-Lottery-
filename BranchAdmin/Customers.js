// ============================================
// ADMIN CUSTOMERS - SEPARATE COMPONENT
// ============================================

class AdminCustomers {
    constructor(adminId) {
        this.adminId = adminId;
        this.customers = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-bold text-white">👥 My Customers</h3>
                    <button onclick="window.adminCustomersComponent.openAddModal()" class="px-4 py-2 bg-yellow-400 text-black font-bold rounded-xl text-xs">
                        + Add Customer
                    </button>
                </div>
                <div id="admin-customers-list" class="space-y-3"></div>
            </div>

            <!-- Add Customer Modal -->
            <div id="admin-add-customer-modal" class="fixed inset-0 bg-black/80 hidden flex items-center justify-center z-50 p-4">
                <div class="glass-panel rounded-2xl p-6 w-full max-w-md border border-yellow-400/10 space-y-4">
                    <h3 class="text-xl font-bold text-white">Add Customer</h3>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Customer Name</label>
                            <input type="text" id="modal-cust-name" placeholder="e.g. Mohammed Ali" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Email</label>
                            <input type="email" id="modal-cust-email" placeholder="customer@email.com" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Phone</label>
                            <input type="tel" id="modal-cust-phone" placeholder="0911223344" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button onclick="window.adminCustomersComponent.addCustomer()" class="flex-1 py-2 bg-yellow-400 text-black font-bold rounded-xl text-xs hover:bg-yellow-500">
                                ✅ Add
                            </button>
                            <button onclick="window.adminCustomersComponent.closeAddModal()" class="flex-1 py-2 bg-slate-700 text-white font-bold rounded-xl text-xs hover:bg-slate-600">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        if (!db || !currentUser) return;

        try {
            // Get ONLY THIS admin's customers
            const snapshot = await db.collection('admin_customers')
                .where('adminEmail', '==', currentUser.email)
                .get();

            this.customers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.displayCustomers();
        } catch (error) {
            console.error('Error loading customers:', error);
            notify('error', `❌ Error loading customers: ${error.message}`);
        }
    }

    displayCustomers() {
        const container = document.getElementById('admin-customers-list');
        if (!container) return;

        if (this.customers.length === 0) {
            container.innerHTML = `
                <div class="glass-panel rounded-lg p-6 border border-yellow-400/10 text-center text-slate-400">
                    <p>No customers yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.customers.map(cust => `
            <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-white">${cust.name}</p>
                        <p class="text-xs text-slate-400">${cust.email}</p>
                        <p class="text-xs text-slate-400">📱 ${cust.phone}</p>
                        <p class="text-xs text-slate-300 mt-1">🎫 Tickets: ${cust.tickets || 0} | 💰 Spent: ${cust.spent || 0} ETB</p>
                    </div>
                    <button onclick="window.adminCustomersComponent.deleteCustomer('${cust.id}')" class="px-3 py-1 bg-red-400/20 text-red-400 text-xs font-bold rounded hover:bg-red-400/30">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    openAddModal() {
        document.getElementById('admin-add-customer-modal').classList.remove('hidden');
    }

    closeAddModal() {
        document.getElementById('admin-add-customer-modal').classList.add('hidden');
        document.getElementById('modal-cust-name').value = '';
        document.getElementById('modal-cust-email').value = '';
        document.getElementById('modal-cust-phone').value = '';
    }

    async addCustomer() {
        const name = document.getElementById('modal-cust-name').value.trim();
        const email = document.getElementById('modal-cust-email').value.trim();
        const phone = document.getElementById('modal-cust-phone').value.trim();

        if (!name || !email || !phone) {
            notify('error', '❌ Fill all fields');
            return;
        }

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('admin_customers').add({
                adminEmail: currentUser.email,
                name: name,
                email: email,
                phone: phone,
                tickets: 0,
                spent: 0,
                createdAt: new Date()
            });

            notify('success', `✅ Customer ${name} added!`);
            this.closeAddModal();
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async deleteCustomer(customerId) {
        if (!confirm('Delete this customer?')) return;

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('admin_customers').doc(customerId).delete();
            notify('success', '✅ Customer deleted');
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    // ========== STATS ==========

    async getCustomerStats() {
        if (!db || !currentUser) return { total: 0, totalSpent: 0, totalTickets: 0 };

        try {
            const snapshot = await db.collection('admin_customers')
                .where('adminEmail', '==', currentUser.email)
                .get();

            let total = 0;
            let totalSpent = 0;
            let totalTickets = 0;

            snapshot.forEach(doc => {
                const cust = doc.data();
                total++;
                totalSpent += cust.spent || 0;
                totalTickets += cust.tickets || 0;
            });

            return { total, totalSpent, totalTickets };
        } catch (error) {
            console.error('Error getting customer stats:', error);
            return { total: 0, totalSpent: 0, totalTickets: 0 };
        }
    }
}
