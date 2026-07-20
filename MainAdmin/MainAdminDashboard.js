// ============================================
// MAIN ADMIN DASHBOARD (PARENT COMPONENT) - FIXED
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
                            <button onclick="window.mainAdminDashboard.switchTab('dashboard', event)" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">📊 Dashboard</button>
                            <button onclick="window.mainAdminDashboard.switchTab('admins', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🛡️ Admins</button>
                            <button onclick="window.mainAdminDashboard.switchTab('customers', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">👥 Customers</button>
                            <button onclick="window.mainAdminDashboard.switchTab('ranges', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📊 Ranges</button>
                            <button onclick="window.mainAdminDashboard.switchTab('payments', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">💳 Payments</button>
                            <button onclick="window.mainAdminDashboard.switchTab('analytics', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📈 Analytics</button>
                            <button onclick="window.mainAdminDashboard.switchTab('transactions', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📋 Transactions</button>
                            <button onclick="window.mainAdminDashboard.switchTab('auditlog', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🔒 Audit</button>
                            <button onclick="window.mainAdminDashboard.switchTab('notifications', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📢 Notify</button>
                            <button onclick="window.mainAdminDashboard.switchTab('settings', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">⚙️ Settings</button>
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
            // 1. Run loadData for all child components
            await Promise.all([
                this.admins.loadData(),
                this.customers.loadData(),
                this.ranges.loadData(),
                this.payments.loadData(),
                this.analytics.loadData(),
                this.transactions.loadData(),
                this.auditLog.loadData(),
                this.notifications.loadData(),
                this.settings.loadData()
            ]);
            
            this.loadTabs();
            
            // 2. Update the total stats on the main dashboard tab
            await this.updateDashboardStats();
            
            notify('info', '✅ All dashboard data loaded');
        } catch (error) {
            console.error('Error in MainAdminDashboard loadData:', error);
            notify('error', '❌ Error loading dashboard data');
        }
    }

    loadTabs() {
        try {
            const adminsContent = document.getElementById('main-admins');
            const customersContent = document.getElementById('main-customers');
            const rangesContent = document.getElementById('main-ranges');
            const paymentsContent = document.getElementById('main-payments');
            const analyticsContent = document.getElementById('main-analytics');
            const transactionsContent = document.getElementById('main-transactions');
            const auditlogContent = document.getElementById('main-auditlog');
            const notificationsContent = document.getElementById('main-notifications');
            const settingsContent = document.getElementById('main-settings');

            if (adminsContent) adminsContent.innerHTML = this.admins.render();
            if (customersContent) customersContent.innerHTML = this.customers.render();
            if (rangesContent) rangesContent.innerHTML = this.ranges.render();
            if (paymentsContent) paymentsContent.innerHTML = this.payments.render();
            if (analyticsContent) analyticsContent.innerHTML = this.analytics.render();
            if (transactionsContent) transactionsContent.innerHTML = this.transactions.render();
            if (auditlogContent) auditlogContent.innerHTML = this.auditLog.render();
            if (notificationsContent) notificationsContent.innerHTML = this.notifications.render();
            if (settingsContent) settingsContent.innerHTML = this.settings.render();
        } catch (error) {
            console.error('Error in loadTabs:', error);
        }
    }

    async updateDashboardStats() {
        try {
            if (!db) {
                console.error('Database not initialized');
                return;
            }

            // Count admins
            const adminsSnap = await db.collection('admins').get();
            const adminsEl = document.getElementById('total-admins');
            if (adminsEl) adminsEl.textContent = adminsSnap.size;

            // Count customers
            const customersSnap = await db.collection('customers').get();
            const customersEl = document.getElementById('total-customers');
            if (customersEl) customersEl.textContent = customersSnap.size;

            // Count tickets
            const ticketsSnap = await db.collection('customer_tickets').get();
            const ticketsEl = document.getElementById('total-tickets');
            if (ticketsEl) ticketsEl.textContent = ticketsSnap.size;

            // Calculate revenue
            let revenue = 0;
            ticketsSnap.forEach(doc => {
                revenue += doc.data().cost || 0;
            });
            const revenueEl = document.getElementById('total-revenue');
            if (revenueEl) revenueEl.textContent = revenue.toLocaleString() + ' ETB';
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    switchTab(tabName, event) {
        // Hide all tabs
        const tabElements = document.querySelectorAll('#main-admin-dashboard [id^="main-"]');
        tabElements.forEach(el => {
            if (el.classList && el.classList.contains('tab-content')) {
                el.style.display = 'none';
            }
        });

        // Deactivate all buttons
        const tabButtons = document.querySelectorAll('#main-admin-dashboard .tab-button');
        tabButtons.forEach(btn => {
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
        if (event && event.target) {
            event.target.classList.add('active');
            event.target.style.color = '#FCD34D';
        }
    }
}

// Store global reference
window.mainAdminDashboard = new MainAdminDashboard();
