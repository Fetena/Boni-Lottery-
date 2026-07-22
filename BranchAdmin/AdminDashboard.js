// ============================================
// ADMIN DASHBOARD - BRANCH ADMIN (FIXED)
// ============================================

class AdminDashboard {
    constructor(adminId) {
        this.adminId = adminId;
    }

    render() {
        return `
            <div id="admin-dashboard" class="min-h-screen bg-black flex flex-col">
                <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-6 py-4">
                    <div class="max-w-7xl mx-auto flex items-center justify-between">
                        <h1 class="font-bold text-xl text-gradient">🛡️ ADMIN DASHBOARD</h1>
                        <button onclick="logout()" class="px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-xl">Logout</button>
                    </div>
                </header>
                
                <main class="flex-grow p-6 overflow-y-auto">
                    <div class="max-w-7xl mx-auto space-y-6">
                        <h2 class="text-3xl font-bold text-white">Admin Control Center</h2>
                        
                        <div class="flex gap-2 border-b border-yellow-400/10 pb-2 overflow-x-auto">
                            <button onclick="window.adminDashboard.switchTab('dashboard', event)" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">📊 Dashboard</button>
                            <button onclick="window.adminDashboard.switchTab('customers', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">👥 Customers</button>
                            <button onclick="window.adminDashboard.switchTab('tickets', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">🎫 Tickets</button>
                            <button onclick="window.adminDashboard.switchTab('payments', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">💳 Payments</button>
                            <button onclick="window.adminDashboard.switchTab('notifications', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">💳 Notifications</button>
                            <button onclick="window.adminDashboard.switchTab('bookAppointment', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">💳 BookAppointment</button>
                            <button onclick="window.adminDashboard.switchTab('settings', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">⚙️ Settings</button>
                        </div>

                        <!-- Dashboard Tab -->
                        <div id="admin-dashboard-tab" class="tab-content active space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Customers</p>
                                    <p class="text-3xl font-bold text-blue-400 mt-2" id="admin-total-customers">0</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Tickets</p>
                                    <p class="text-3xl font-bold text-emerald-400 mt-2" id="admin-total-tickets">0</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Revenue</p>
                                    <p class="text-3xl font-bold text-purple-400 mt-2" id="admin-total-revenue">0 ETB</p>
                                </div>
                            </div>
                        </div>

                        <!-- Customers Tab -->
                        <div id="admin-customers" class="tab-content" style="display: none;">
                            <div class="space-y-4">
                                <button onclick="openAddCustomerModal()" class="px-6 py-2 bg-yellow-400 text-black font-bold rounded-xl">+ Add Customer</button>
                                <div id="admin-customers-list" class="space-y-3"></div>
                            </div>
                        </div>

                        <!-- Tickets Tab -->
                        <div id="admin-tickets" class="tab-content" style="display: none;">
                            <div class="space-y-4">
                                <h3 class="text-xl font-bold text-white">Recent Tickets</h3>
                                <div id="admin-tickets-list" class="space-y-3"></div>
                            </div>
                        </div>

                        <!-- Payments Tab -->
                        <div id="admin-payments" class="tab-content" style="display: none;">
                            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                                <h3 class="text-xl font-bold text-white">Payment Accounts</h3>
                                <div>
                                    <label class="block text-xs text-slate-400 mb-2">Telebirr Phone</label>
                                    <input type="tel" id="admin-telebirr" placeholder="0945792677" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                                </div>
                                <div>
                                    <label class="block text-xs text-slate-400 mb-2">CBE Account</label>
                                    <input type="text" id="admin-cbe" placeholder="Account number" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                                </div>
                                <button onclick="saveAdminPayments()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Save Payments</button>
                            </div>
                        </div>

                        <!-- Settings Tab -->
                        <div id="admin-settings" class="tab-content" style="display: none;">
                            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                <h3 class="text-xl font-bold text-white mb-4">Admin Settings</h3>
                                <p class="text-slate-400">Admin ID: <span id="admin-id-display">${this.adminId}</span></p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <!-- Add Customer Modal -->
            <div id="customer-modal" class="modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content p-6 m-auto">
                    <h3 class="text-xl font-bold text-white mb-4">Add Customer</h3>
                    <div class="space-y-3">
                        <input type="text" id="cust-name-input" placeholder="Customer Name" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <input type="email" id="cust-email-input" placeholder="Email" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <input type="tel" id="cust-phone-input" placeholder="Phone" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <button onclick="addAdminCustomer()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Add</button>
                        <button onclick="closeAddCustomerModal()" class="w-full py-2 bg-slate-700 text-white rounded-xl">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }
//window.adminDashboard = new AdminDashboard();
    switchTab(tabName, event) {
        // Hide all tabs
        document.getElementById('admin-dashboard-tab').style.display = 'none';
        document.getElementById('admin-customers').style.display = 'none';
        document.getElementById('admin-tickets').style.display = 'none';
        document.getElementById('admin-payments').style.display = 'none';
        //document.getElementById('admin-notifications').style.display = 'none';
        //document.getElementById('admin-bookAppointment').style.display = 'none';
        document.getElementById('admin-settings').style.display = 'none';

        // Deactivate all buttons
        const buttons = document.querySelectorAll('#admin-dashboard .tab-button');
        buttons.forEach(btn => btn.classList.remove('active'));

        // Show selected tab
        if (tabName === 'dashboard') {
            document.getElementById('admin-dashboard-tab').style.display = 'block';
        } else if (tabName === 'customers') {
            document.getElementById('admin-customers').style.display = 'block';
        } else if (tabName === 'tickets') {
            document.getElementById('admin-tickets').style.display = 'block';
        } else if (tabName === 'payments') {
            document.getElementById('admin-payments').style.display = 'block';
        } else if (tabName === 'settings') {
            document.getElementById('admin-settings').style.display = 'block';
        }
        else if (tabName === 'notifications') {
            document.getElementById('admin-notifications').style.display = 'block';
        }else if (tabName === 'bookAppointment') {
            document.getElementById('admin-bookAppointment').style.display = 'block';
        }

        // Activate clicked button
        if (event && event.target) {
            event.target.classList.add('active');
            event.target.style.color = '#FCD34D';
        }
    }

    async loadData() {
        try {
            await loadAdminCustomers();
            await loadAdminTickets();
            await loadAdminPayments();
            await loadAdminNotifications();
            await loadAdminBookAppointment();
            await loadAdminStats();
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }
}

// ========== ADMIN CUSTOMERS ==========

async function openAddCustomerModal() {
    document.getElementById('customer-modal').style.display = 'flex';
}

function closeAddCustomerModal() {
    document.getElementById('customer-modal').style.display = 'none';
}

async function addAdminCustomer() {
    const name = document.getElementById('cust-name-input').value;
    const email = document.getElementById('cust-email-input').value;
    const phone = document.getElementById('cust-phone-input').value;

    if (!name || !email || !phone) return notify('error', '❌ Fill all fields');
    if (!db) return notify('error', '❌ Database not initialized');
    if (!currentUser) return notify('error', '❌ User not authenticated');

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
        closeAddCustomerModal();
        document.getElementById('cust-name-input').value = '';
        document.getElementById('cust-email-input').value = '';
        document.getElementById('cust-phone-input').value = '';
        
        await loadAdminCustomers();
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

async function loadAdminCustomers() {
    if (!db || !currentUser) return;

    try {
        const snapshot = await db.collection('admin_customers')
            .where('adminEmail', '==', currentUser.email)
            .get();

        const content = document.getElementById('admin-customers-list');
        if (!content) return;

        if (snapshot.empty) {
            content.innerHTML = '<p class="text-slate-400 text-center py-6">No customers yet</p>';
            return;
        }

        content.innerHTML = snapshot.docs.map(doc => {
            const cust = doc.data();
            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                    <p class="font-bold text-white">${cust.name}</p>
                    <p class="text-xs text-slate-400">${cust.email} • ${cust.phone}</p>
                    <p class="text-xs text-slate-400">Tickets: ${cust.tickets} • Spent: ${cust.spent} ETB</p>
                    <button onclick="deleteAdminCustomer('${doc.id}')" class="text-xs px-2 py-1 bg-red-400/20 text-red-400 rounded mt-2">Delete</button>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

async function deleteAdminCustomer(docId) {
    if (!confirm('Delete customer?')) return;

    try {
        await db.collection('admin_customers').doc(docId).delete();
        notify('success', '✅ Customer deleted');
        await loadAdminCustomers();
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

// ========== ADMIN TICKETS ==========

async function loadAdminTickets() {
    if (!db) return;

    try {
        const snapshot = await db.collection('customer_tickets')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const content = document.getElementById('admin-tickets-list');
        if (!content) return;

        if (snapshot.empty) {
            content.innerHTML = '<p class="text-slate-400">No tickets yet</p>';
            return;
        }

        content.innerHTML = snapshot.docs.map(doc => {
            const ticket = doc.data();
            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10 text-xs space-y-2">
                    <p class="text-white font-bold">Customer: ${ticket.customerName || 'N/A'} (${ticket.customerEmail || ''})</p>
                    <p class="text-slate-400">Numbers: ${ticket.numbers?.join(', ') || 'N/A'}</p>
                    <p class="text-slate-400">Cost: ${ticket.cost} ETB • Payment: ${ticket.paymentMethod || 'N/A'}</p>
                    <div class="flex justify-between items-center pt-2 border-t border-yellow-400/10">
                        <span class="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded">${ticket.status || 'Pending'}</span>
                        <div class="flex gap-2">
                            <button onclick="window.adminDashboard.approvePayment('${doc.id}')" class="px-3 py-1 bg-emerald-600 text-white font-bold rounded">Approve</button>
                            <button onclick="window.adminDashboard.rejectPayment('${doc.id}')" class="px-3 py-1 bg-red-600 text-white font-bold rounded">Reject</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

// ========== ADMIN PAYMENTS ==========

async function saveAdminPayments() {
    const telebirr = document.getElementById('admin-telebirr').value;
    const cbe = document.getElementById('admin-cbe').value;

    if (!telebirr || !cbe) return notify('error', '❌ Fill all fields');
    if (!db) return notify('error', '❌ Database not initialized');
    if (!currentUser) return notify('error', '❌ User not authenticated');

    try {
        await db.collection('admin_settings').doc(currentUser.email).set({
            adminEmail: currentUser.email,
            telebirrPhone: telebirr,
            cbeAccount: cbe,
            updatedAt: new Date()
        }, { merge: true });

        notify('success', '✅ Payment settings saved!');
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

async function loadAdminPayments() {
    if (!db || !currentUser) return;

    try {
        const doc = await db.collection('admin_settings').doc(currentUser.email).get();
        if (doc.exists) {
            const data = doc.data();
            if (data.telebirrPhone) document.getElementById('admin-telebirr').value = data.telebirrPhone;
            if (data.cbeAccount) document.getElementById('admin-cbe').value = data.cbeAccount;
        }
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

// ========== ADMIN STATS ==========

async function loadAdminStats() {
    if (!db || !currentUser) return;

    try {
        const custSnapshot = await db.collection('admin_customers')
            .where('adminEmail', '==', currentUser.email)
            .get();
        document.getElementById('admin-total-customers').textContent = custSnapshot.size;

        const ticketSnapshot = await db.collection('customer_tickets').get();
        document.getElementById('admin-total-tickets').textContent = ticketSnapshot.size;

        let revenue = 0;
        ticketSnapshot.forEach(doc => {
            revenue += doc.data().cost || 0;
        });
        document.getElementById('admin-total-revenue').textContent = revenue.toLocaleString() + ' ETB';
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}
