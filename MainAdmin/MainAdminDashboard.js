// ============================================
// MAIN ADMIN DASHBOARD (PARENT COMPONENT)
// Complete with Firestore integration
// ============================================

class MainAdminDashboard {
    constructor() {
        // Initialize ALL child components
        this.admins = new Admins();
        this.customers = new Customers();
        this.ranges = new Ranges();
        this.payments = new Payments();
        this.analytics = new Analytics();
        this.transactions = new Transactions();
        this.auditLog = new AuditLog();
        this.notifications = new Notifications();
        this.settings = new Settings();
    }

    render() {
        return `
            <div id="main-admin-dashboard" class="min-h-screen bg-black flex flex-col">
                <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-6 py-4">
                    <div class="max-w-7xl mx-auto flex items-center justify-between">
                        <h1 class="font-bold text-xl text-gradient">👑 MAIN ADMIN DASHBOARD</h1>
                        <button onclick="logout()" class="px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-xl">Logout</button>
                    </div>
                </header>
                
                <main class="flex-grow p-6 overflow-y-auto">
                    <div class="max-w-7xl mx-auto space-y-6">
                        <h2 class="text-3xl font-bold text-white">System Control Center</h2>
                        
                        <!-- TABS -->
                        <div class="flex gap-2 border-b border-yellow-400/10 pb-2 overflow-x-auto">
                            <button onclick="mainAdminDashboard.switchTab('dashboard')" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">📊 Dashboard</button>
                            <button onclick="mainAdminDashboard.switchTab('admins')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🛡️ Admins</button>
                            <button onclick="mainAdminDashboard.switchTab('customers')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">👥 Customers</button>
                            <button onclick="mainAdminDashboard.switchTab('ranges')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📊 Ranges</button>
                            <button onclick="mainAdminDashboard.switchTab('payments')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">💳 Payments</button>
                            <button onclick="mainAdminDashboard.switchTab('analytics')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📈 Analytics</button>
                            <button onclick="mainAdminDashboard.switchTab('transactions')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📋 Transactions</button>
                            <button onclick="mainAdminDashboard.switchTab('auditlog')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🔒 Audit</button>
                            <button onclick="mainAdminDashboard.switchTab('notifications')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📢 Notify</button>
                            <button onclick="mainAdminDashboard.switchTab('settings')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">⚙️ Settings</button>
                        </div>

                        <!-- TAB CONTENTS -->
                        <div id="main-dashboard" class="tab-content active space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Admins</p>
                                    <p class="text-3xl font-bold text-yellow-400 mt-2" id="total-admins">0</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Customers</p>
                                    <p class="text-3xl font-bold text-blue-400 mt-2" id="total-customers">0</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Tickets</p>
                                    <p class="text-3xl font-bold text-emerald-400 mt-2" id="total-tickets">0</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Platform Revenue</p>
                                    <p class="text-3xl font-bold text-purple-400 mt-2" id="total-revenue">0 ETB</p>
                                </div>
                            </div>
                        </div>
                        
                        <div id="main-admins" class="tab-content" style="display: none;"></div>
                        <div id="main-customers" class="tab-content" style="display: none;"></div>
                        <div id="main-ranges" class="tab-content" style="display: none;"></div>
                        <div id="main-payments" class="tab-content" style="display: none;"></div>
                        <div id="main-analytics" class="tab-content" style="display: none;"></div>
                        <div id="main-transactions" class="tab-content" style="display: none;"></div>
                        <div id="main-auditlog" class="tab-content" style="display: none;"></div>
                        <div id="main-notifications" class="tab-content" style="display: none;"></div>
                        <div id="main-settings" class="tab-content" style="display: none;"></div>
                    </div>
                </main>
            </div>
        `;
    }

    async loadData() {
        try {
            // Load all child components
            await this.admins.loadData();
            await this.customers.loadData();
            await this.ranges.loadData();
            await this.payments.loadData();
            await this.analytics.loadData();
            await this.transactions.loadData();
            await this.auditLog.loadData();
            await this.notifications.loadData();
            await this.settings.loadData();

            // Render all tabs
            this.loadTabs();

            // Update dashboard stats
            await this.updateDashboardStats();
        } catch (error) {
            console.error('Error loading main admin data:', error);
            notify('error', 'Error loading dashboard data');
        }
    }

    loadTabs() {
        document.getElementById('main-admins').innerHTML = this.admins.render();
        document.getElementById('main-customers').innerHTML = this.customers.render();
        document.getElementById('main-ranges').innerHTML = this.ranges.render();
        document.getElementById('main-payments').innerHTML = this.payments.render();
        document.getElementById('main-analytics').innerHTML = this.analytics.render();
        document.getElementById('main-transactions').innerHTML = this.transactions.render();
        document.getElementById('main-auditlog').innerHTML = this.auditLog.render();
        document.getElementById('main-notifications').innerHTML = this.notifications.render();
        document.getElementById('main-settings').innerHTML = this.settings.render();
    }

    async updateDashboardStats() {
        try {
            if (!db) return;

            // Count admins
            const adminsSnap = await db.collection('admins').get();
            document.getElementById('total-admins').textContent = adminsSnap.size;

            // Count customers
            const customersSnap = await db.collection('customers').get();
            document.getElementById('total-customers').textContent = customersSnap.size;

            // Count tickets
            const ticketsSnap = await db.collection('customer_tickets').get();
            document.getElementById('total-tickets').textContent = ticketsSnap.size;

            // Calculate revenue
            let revenue = 0;
            ticketsSnap.forEach(doc => {
                revenue += doc.data().cost || 0;
            });
            document.getElementById('total-revenue').textContent = revenue.toLocaleString() + ' ETB';
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('[id^="main-"]').forEach(el => {
            if (el.classList && el.classList.contains('tab-content')) {
                el.style.display = 'none';
            }
        });

        // Deactivate all buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.style.color = '';
        });

        // Show selected tab
        const tab = document.getElementById(`main-${tabName}`);
        if (tab) {
            tab.style.display = 'block';
            tab.classList.add('active');
        }

        // Activate button
        event.target.classList.add('active');
        event.target.style.color = '#FCD34D';
    }
}

// Store global reference
//let mainAdminDashboard = null;
window.mainAdminDashboard = new MainAdminDashboard();
