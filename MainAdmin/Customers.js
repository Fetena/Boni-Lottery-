// ============================================
// MAIN ADMIN - CUSTOMERS MANAGEMENT (DYNAMIC TICKET AGGREGATION)
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
            
            const customerMap = new Map();

            // 1. Fetch from 'users' or 'customers' collection first if they exist
            try {
                const usersSnap = await db.collection('users').get();
                usersSnap.forEach(doc => {
                    const data = doc.data();
                    if (data.role === 'admin' || data.isAdmin) return;
                    const email = (data.email || '').trim().toLowerCase();
                    if (email) {
                        customerMap.set(email, {
                            id: doc.id,
                            name: data.name || data.fullName || data.displayName || email.split('@')[0],
                            email: data.email,
                            phone: data.phone || data.phoneNumber || data.mobile || 'N/A',
                            tickets: 0,
                            spent: 0,
                            createdAt: data.createdAt?.toDate?.() || new Date()
                        });
                    }
                });
            } catch (e) {
                console.warn('Could not fetch users collection:', e);
            }

            // 2. Fetch all tickets to dynamically map and aggregate customer records & spending
            const ticketsSnap = await db.collection('customer_tickets').get();
            ticketsSnap.forEach(doc => {
                const ticket = doc.data();
                const email = (ticket.customerEmail || ticket.email || '').trim().toLowerCase();
                const name = ticket.customerName || ticket.name || email.split('@')[0] || 'Customer';
                const cost = Number(ticket.cost || ticket.amount || 0);

                if (!email) return;

                if (customerMap.has(email)) {
                    const cust = customerMap.get(email);
                    cust.tickets += 1;
                    cust.spent += cost;
                } else {
                    customerMap.set(email, {
                        id: doc.id,
                        name: name,
                        email: email,
                        phone: ticket.customerPhone || ticket.phone || 'N/A',
                        tickets: 1,
                        spent: cost,
                        createdAt: ticket.createdAt?.toDate?.() || new Date()
                    });
                }
            });

            this.customers = Array.from(customerMap.values());

            const listContainer = document.getElementById('customers-list'); 
            if (listContainer) {
                listContainer.innerHTML = this.renderCustomersList();
            }
        } catch (error) {
            console.error('Error loading customers:', error);
            const listContainer = document.getElementById('customers-list'); 
            if (listContainer) {
                listContainer.innerHTML = `<div class="glass-panel rounded-lg p-6 border border-red-500/25 text-center text-red-400 text-xs">Error loading customer records: ${error.message}</div>`;
            }
        }
    }

    async deleteCustomer(email) {
        if (!confirm('Are you sure you want to delete this customer record?')) return;
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            // Optional: delete associated tickets or user record if desired
            if (typeof AuditLog !== 'undefined' && typeof AuditLog.logAction === 'function') {
                const adminName = currentUser?.email || 'Main Admin';
                await AuditLog.logAction('Delete Customer', adminName, `Removed customer view for: ${email}`, 'DANGER');
            }

            notify('success', '🗑️ Customer record cleared successfully!');
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
                        <p class="text-slate-400 pt-0.5">Joined / First Ticket: ${cust.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button onclick="window.mainAdminDashboard.customers.deleteCustomer('${cust.email}')" class="px-3 py-1.5 bg-slate-900 hover:bg-rose-900/60 text-rose-400 border border-rose-500/25 font-bold rounded-lg transition-all">🗑️ Clear Record</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}
