// ============================================
// MAIN ADMIN - CUSTOMERS MANAGEMENT (WITH DB SYNC & DELETE)
// ============================================

class Customers {
    constructor() {
        this.customers = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-white">👥 All Customers & Records</h3>
                </div>
                <div id="customers-list" class="space-y-3">${this.renderCustomersList()}</div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) {
                console.error('Database not initialized');
                return;
            }
            
            // Fetch from standard user collections or profiles where customer records are stored
            let snapshot = await db.collection('customers').get();
            
            if (snapshot.empty) {
                snapshot = await db.collection('users').get();
            }

            this.customers = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Avoid displaying admins if they are mixed in the users collection
                if (data.role === 'admin' || data.isAdmin) return;
                
                this.customers.push({ 
                    id: doc.id, 
                    name: data.name || data.fullName || data.displayName || 'N/A',
                    email: data.email || 'N/A',
                    phone: data.phone || data.phoneNumber || data.mobile || 'N/A',
                    tickets: data.ticketsCount || data.tickets?.length || 0,
                    spent: data.totalSpent || data.spent || 0,
                    createdAt: data.createdAt?.toDate?.() || new Date()
                });
            });

            const listContainer = document.getElementById('customers-list'); 
            if (listContainer) {
                listContainer.innerHTML = this.renderCustomersList();
            }
        } catch (error) {
            console.error('Error loading customers:', error);
            const listContainer = document.getElementById('customers-list'); 
            if (listContainer) {
                listContainer.innerHTML = `<div class="glass-panel rounded-lg p-6 border border-red-500/20 text-center text-red-400 text-xs">Error loading customer records: ${error.message}</div>`;
            }
        }
    }

    async deleteCustomer(docId) {
        if (!confirm('Are you sure you want to delete this customer record?')) return;
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            // Try deleting from 'customers' first, fallback or try 'users' if collection varies
            await db.collection('customers').doc(docId).delete().catch(() => {
                return db.collection('users').doc(docId).delete();
            });

            if (typeof AuditLog !== 'undefined' && typeof AuditLog.logAction === 'function') {
                const adminName = currentUser?.email || 'Main Admin';
                await AuditLog.logAction('Delete Customer', adminName, `Deleted customer record ID: ${docId}`, 'DANGER');
            }

            notify('success', '🗑️ Customer record deleted successfully!');
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    renderCustomersList() {
        if (this.customers.length === 0) {
            return '<div class="glass-panel rounded-2xl p-8 border border-yellow-400/10 text-center text-slate-400">No customer records found</div>';
        }

        return this.customers.map((cust, index) => `
            <div class="glass-panel rounded-xl p-5 border border-yellow-400/10 space-y-3 shadow-lg text-xs">
                <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div class="space-y-1.5">
                        <p class="font-extrabold text-white text-base">#${index + 1} - <span class="text-yellow-400">${cust.name}</span></p>
                        <p class="text-slate-300">Email: <span class="text-white font-medium">${cust.email}</span></p>
                        <p class="text-slate-300">Phone: <span class="text-slate-200 font-mono">${cust.phone}</span></p>
                        <p class="text-slate-300">Tickets Purchased: <span class="text-purple-400 font-bold">${cust.tickets}</span> • Total Spent: <span class="text-emerald-400 font-bold">${cust.spent} ETB</span></p>
                        <p class="text-slate-400 pt-0.5">Joined: ${cust.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button onclick="window.mainAdminDashboard.customers.deleteCustomer('${cust.id}')" class="px-3 py-1.5 bg-slate-900 hover:bg-rose-900/60 text-rose-400 border border-rose-500/25 font-bold rounded-lg transition-all">🗑️ Delete Record</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}
