// ============================================
// ADMIN DASHBOARD - COMPONENT WRAPPER
// ============================================

class AdminDashboard {
    constructor(adminId) {
        this.adminId = adminId;
        // Initialize child components[cite: 25]
        this.tickets = new AdminTickets(adminId);
        this.customers = new AdminCustomers(adminId);
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
                        
                        <!-- TABS -->
                        <div class="flex gap-2 border-b border-yellow-400/10 pb-2 overflow-x-auto">
                            <button onclick="window.adminDashboard.switchTab('dashboard', event)" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">📊 Dashboard</button>
                            <button onclick="window.adminDashboard.switchTab('customers', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">👥 Customers</button>
                            <button onclick="window.adminDashboard.switchTab('tickets', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">
                                🎫 Tickets <span id="badge-tickets" class="hidden ml-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                            </button>
                            <button onclick="window.adminDashboard.switchTab('payments', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">💳 Payments</button>
                            <button onclick="window.adminDashboard.switchTab('notifications', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">🔔 Notifications</button>
                            <button onclick="window.adminDashboard.switchTab('settings', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">⚙️ Settings</button>
                        </div>

                        <!-- DASHBOARD TAB -->
                        <div id="admin-tab-dashboard" class="tab-content active">
                            <div class="grid grid-cols-3 gap-4">
                                <div class="glass-panel rounded-xl p-4 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Customers</p>
                                    <h3 id="stat-customers" class="text-2xl font-bold text-blue-400 mt-2">0</h3>
                                </div>
                                <div class="glass-panel rounded-xl p-4 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Tickets</p>
                                    <h3 id="stat-tickets" class="text-2xl font-bold text-emerald-400 mt-2">0</h3>
                                </div>
                                <div class="glass-panel rounded-xl p-4 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Revenue</p>
                                    <h3 id="stat-revenue" class="text-2xl font-bold text-purple-400 mt-2">0 ETB</h3>
                                </div>
                            </div>
                        </div>

                        <!-- CUSTOMERS TAB -->
                        <div id="admin-tab-customers" class="tab-content hidden">
                            ${this.customers.render()}
                        </div>

                        <!-- TICKETS TAB -->
                        <div id="admin-tab-tickets" class="tab-content hidden">
                            ${this.tickets.render()}
                        </div>

                        <!-- PAYMENTS TAB -->
                        <div id="admin-tab-payments" class="tab-content hidden">
                            <p class="text-slate-400">Payments component coming soon</p>
                        </div>

                        <!-- NOTIFICATIONS TAB -->
                        <div id="admin-tab-notifications" class="tab-content hidden">
                            <p class="text-slate-400">Notifications component coming soon</p>
                        </div>

                        <!-- SETTINGS TAB -->
                        <div id="admin-tab-settings" class="tab-content hidden">
                            <p class="text-slate-400">Settings component coming soon</p>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    async loadData() {
        try {
            // Load all child components[cite: 25]
            window.adminTicketsComponent = this.tickets;
            window.adminCustomersComponent = this.customers;

            await this.customers.loadData();
            await this.tickets.loadData();
            await this.updateStats();

            console.log('✅ Admin dashboard loaded');
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
            notify('error', `❌ Error loading dashboard: ${error.message}`);
        }
    }

    async updateStats() {
        try {
            const custStats = await this.customers.getCustomerStats();
            const ticketStats = await this.tickets.getTicketStats();

            document.getElementById('stat-customers').textContent = custStats.total;
            document.getElementById('stat-tickets').textContent = ticketStats.total;
            document.getElementById('stat-revenue').textContent = custStats.totalSpent.toLocaleString() + ' ETB';

            // Update ticket badge[cite: 25]
            const badge = document.getElementById('badge-tickets');
            if (ticketStats.pending > 0) {
                badge.textContent = ticketStats.pending;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    switchTab(tabName, event) {
        // Hide all tabs[cite: 25]
        const allTabs = document.querySelectorAll('#admin-dashboard .tab-content');
        allTabs.forEach(tab => tab.classList.add('hidden'));

        // Show selected tab[cite: 25]
        const tabId = `admin-tab-${tabName}`;
        const tab = document.getElementById(tabId);
        if (tab) {
            tab.classList.remove('hidden');
        }

        // Update button style[cite: 25]
        const allButtons = document.querySelectorAll('#admin-dashboard .tab-button');
        allButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.color = '';
        });

        if (event && event.target) {
            event.target.classList.add('active');
            event.target.style.color = '#FCD34D';
        }
    }
}
