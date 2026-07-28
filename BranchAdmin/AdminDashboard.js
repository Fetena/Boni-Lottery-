// ============================================
// ADMIN DASHBOARD - PARENT COMPONENT
// ============================================

class AdminDashboard {
    constructor(adminId) {
        this.adminId = adminId;
        window.adminLottery = new AdminLotteryDraw(adminId);
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
                            <button onclick="window.adminDashboard.switchTab('notifications', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 relative">
                                🔔 Notifications <span id="badge-branch-notifications" class="hidden absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                            </button>
                            <button onclick="window.adminDashboard.switchTab('bookAppointment', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 relative">
                                📅 BookAppointment <span id="badge-branch-bookings" class="hidden absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                            </button>
                            <button onclick="window.adminDashboard.switchTab('settings', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">⚙️ Settings</button>
                        </div>

                        <!-- Dashboard Tab -->
                        <div id="admin-dashboard-tab" class="tab-content active space-y-4">
                            <!-- Compact Stat Cards -->
                            <div class="grid grid-cols-3 gap-3">
                                <div class="glass-panel rounded-xl p-3 border border-yellow-400/10">
                                    <p class="text-[10px] text-slate-400">Total Customers</p>
                                    <h3 id="admin-total-customers" class="text-xl font-bold text-blue-400 mt-0.5">0</h3>
                                </div>
                                <div class="glass-panel rounded-xl p-3 border border-yellow-400/10">
                                    <p class="text-[10px] text-slate-400">Total Tickets</p>
                                    <h3 id="admin-total-tickets" class="text-xl font-bold text-emerald-400 mt-0.5">0</h3>
                                </div>
                                <div class="glass-panel rounded-xl p-3 border border-yellow-400/10">
                                    <p class="text-[10px] text-slate-400">Total Revenue</p>
                                    <h3 id="admin-total-revenue" class="text-xl font-bold text-purple-400 mt-0.5">0 ETB</h3>
                                </div>
                            </div>

                            <!-- Embedded Independent Lottery Component -->
                            ${window.adminLottery ? window.adminLottery.render() : ''}
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
                        <div id="admin-payments" class="tab-content" style="display: none;"></div>

                        <!-- Notifications Tab Content -->
                        <div id="admin-notifications" class="tab-content" style="display: none;"></div>

                        <!-- Book Appointment Tab Content -->
                        <div id="admin-bookAppointment" class="tab-content" style="display: none;"></div>

                        <!-- Settings Tab -->
                        <div id="admin-settings" class="tab-content" style="display: none;"></div>
                    </div>
                </main>
            </div>

            <!-- Add Customer Modal -->
            <div id="customer-modal" class="fixed inset-0 bg-black/80 hidden flex items-center justify-center z-50">
                <div class="glass-panel rounded-2xl p-8 w-full max-w-md border border-yellow-400/10 space-y-4">
                    <h3 class="text-2xl font-bold text-white mb-2">Add Customer</h3>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Customer Name</label>
                            <input type="text" id="cust-name-input" placeholder="John Doe" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-3 px-4 text-white text-xs placeholder-slate-500">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Email</label>
                            <input type="email" id="cust-email-input" placeholder="customer@email.com" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-3 px-4 text-white text-xs placeholder-slate-500">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Phone Number</label>
                            <input type="tel" id="cust-phone-input" placeholder="0912345678" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-3 px-4 text-white text-xs placeholder-slate-500">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Default Password</label>
                            <div class="flex gap-2">
                                <input type="text" id="cust-password-input" value="Welcome123!" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-3 px-4 text-white text-xs">
                                <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('cust-password-input').value); notify('success', 'Password copied!');" class="px-3 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-xl text-xs border border-yellow-400/20">Copy</button>
                            </div>
                        </div>
                        <button onclick="addAdminCustomer()" class="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl text-xs hover:bg-yellow-500 mt-2">Add Customer</button>
                        <button onclick="closeAddCustomerModal()" class="w-full py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }

    switchTab(tabName, event) {
        document.getElementById('admin-dashboard-tab').style.display = 'none';
        document.getElementById('admin-customers').style.display = 'none';
        document.getElementById('admin-tickets').style.display = 'none';
        document.getElementById('admin-payments').style.display = 'none';
        document.getElementById('admin-notifications').style.display = 'none';
        document.getElementById('admin-bookAppointment').style.display = 'none';
        document.getElementById('admin-settings').style.display = 'none';

        const buttons = document.querySelectorAll('#admin-dashboard .tab-button');
        buttons.forEach(btn => btn.classList.remove('active'));

        if (tabName === 'dashboard') {
            document.getElementById('admin-dashboard-tab').style.display = 'block';
        } else if (tabName === 'customers') {
            document.getElementById('admin-customers').style.display = 'block';
        } else if (tabName === 'tickets') {
            document.getElementById('admin-tickets').style.display = 'block';
        } else if (tabName === 'payments') {
            document.getElementById('admin-payments').style.display = 'block';
        } else if (tabName === 'notifications') {
            document.getElementById('admin-notifications').style.display = 'block';
        } else if (tabName === 'bookAppointment') {
            document.getElementById('admin-bookAppointment').style.display = 'block';
        } else if (tabName === 'settings') {
            document.getElementById('admin-settings').style.display = 'block';
        }

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
            await loadAdminStats();
            
            if (window.adminLottery) {
                await window.adminLottery.init();
            }

            if (!window.adminPayments) window.adminPayments = new AdminPayments(this.adminId);
            if (!window.adminNotifications) window.adminNotifications = new AdminNotifications(this.adminId);
            if (!window.adminBookAppointment) window.adminBookAppointment = new AdminBookAppointment(this.adminId);
            if (!window.adminSettings) window.adminSettings = new AdminSettings(this.adminId);

            const paymentsTab = document.getElementById('admin-payments');
            if (paymentsTab) paymentsTab.innerHTML = await window.adminPayments.render();

            const notifTab = document.getElementById('admin-notifications');
            if (notifTab) {
                notifTab.innerHTML = window.adminNotifications.render();
                if (typeof window.adminNotifications.displayHistory === 'function') window.adminNotifications.displayHistory();
            }

            const apptTab = document.getElementById('admin-bookAppointment');
            if (apptTab) apptTab.innerHTML = await window.adminBookAppointment.render();

            const settingsTab = document.getElementById('admin-settings');
            if (settingsTab) settingsTab.innerHTML = window.adminSettings.render();

        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    async approvePayment(docId) {
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            await db.collection('customer_tickets').doc(docId).update({
                status: 'Approved',
                approvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            notify('success', '✅ Payment approved successfully!');
            await loadAdminTickets();
            await loadAdminStats();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async deleteTicket(docId) {
        if (!confirm('Are you sure you want to delete this ticket?')) return;
        if (!db) return notify('error', '❌ Database not initialized');

        try {
            await db.collection('customer_tickets').doc(docId).delete();
            notify('success', '🗑️ Ticket deleted successfully!');
            await loadAdminTickets();
            await loadAdminStats();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async rejectPayment(docId) {
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            await db.collection('customer_tickets').doc(docId).update({
                status: 'Rejected',
                rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            notify('error', '❌ Payment rejected');
            await loadAdminTickets();
            await loadAdminStats();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}
