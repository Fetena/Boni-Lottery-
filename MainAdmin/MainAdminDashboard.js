// ============================================
// MAIN ADMIN DASHBOARD (PARENT COMPONENT)
// Manages: System Settings, Platform Analytics
// ============================================

class MainAdminDashboard {
    constructor() {
        // Initialize ALL child components
        this.settings = new MainAdminSettings();
        this.admins = new MainAdminAdmins();
        this.ranges = new MainAdminRanges();
        this.customers = new MainAdminCustomers();
        this.payments = new MainAdminPayments();
        this.transactions = new MainAdminTransactions();
        this.analytics = new MainAdminAnalytics();
        this.auditLog = new MainAdminAuditLog();
        this.notifications = new MainAdminNotifications();
    }

    render() {
        return `
            <div id="main-admin-dashboard" class="hidden min-h-screen bg-black flex flex-col">
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
                            <button onclick="mainAdminDashboard.switchTab('analytics')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📈 Analytics</button>
                            <button onclick="mainAdminDashboard.switchTab('admins')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🛡️ Admins</button>
                            <button onclick="mainAdminDashboard.switchTab('customers')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">👥 Customers</button>
                            <button onclick="mainAdminDashboard.switchTab('ranges')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📊 Ranges</button>
                            <button onclick="mainAdminDashboard.switchTab('payments')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">💳 Payments</button>
                            <button onclick="mainAdminDashboard.switchTab('transactions')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📋 Transactions</button>
                            <button onclick="mainAdminDashboard.switchTab('auditlog')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🔒 Audit</button>
                            <button onclick="mainAdminDashboard.switchTab('notifications')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📢 Notifications</button>
                            <button onclick="mainAdminDashboard.switchTab('settings')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">⚙️ Settings</button>
                        </div>

                        <!-- TAB CONTENTS -->
                        <div id="main-dashboard" class="tab-content active space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Admins</p>
                                    <p class="text-3xl font-bold text-yellow-400 mt-2">3</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Customers</p>
                                    <p class="text-3xl font-bold text-blue-400 mt-2">24</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Tickets</p>
                                    <p class="text-3xl font-bold text-emerald-400 mt-2">75</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Platform Revenue</p>
                                    <p class="text-3xl font-bold text-purple-400 mt-2">7,500 ETB</p>
                                </div>
                            </div>
                        </div>
                        
                        <div id="main-analytics" class="tab-content" style="display: none;"></div>
                        <div id="main-admins" class="tab-content" style="display: none;"></div>
                        <div id="main-customers" class="tab-content" style="display: none;"></div>
                        <div id="main-ranges" class="tab-content" style="display: none;"></div>
                        <div id="main-payments" class="tab-content" style="display: none;"></div>
                        <div id="main-transactions" class="tab-content" style="display: none;"></div>
                        <div id="main-auditlog" class="tab-content" style="display: none;"></div>
                        <div id="main-notifications" class="tab-content" style="display: none;"></div>
                        <div id="main-settings" class="tab-content" style="display: none;"></div>
                    </div>
                </main>
            </div>
        `;
    }

    loadTabs() {
        document.getElementById('main-analytics').innerHTML = this.analytics.render();
        document.getElementById('main-admins').innerHTML = this.admins.render();
        document.getElementById('main-customers').innerHTML = this.customers.render();
        document.getElementById('main-ranges').innerHTML = this.ranges.render();
        document.getElementById('main-payments').innerHTML = this.payments.render();
        document.getElementById('main-transactions').innerHTML = this.transactions.render();
        document.getElementById('main-auditlog').innerHTML = this.auditLog.render();
        document.getElementById('main-notifications').innerHTML = this.notifications.render();
        document.getElementById('main-settings').innerHTML = this.settings.render();
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('[id^="main-"]').forEach(el => {
            if (el.classList && el.classList.contains('tab-content')) {
                el.classList.remove('active');
                el.style.display = 'none';
            }
        });
        
        // Remove active from all buttons
        document.querySelectorAll('#main-admin-dashboard .tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.style.color = '';
        });
        
        // Show selected tab
        const tabEl = document.getElementById(`main-${tabName}`);
        if (tabEl) {
            tabEl.classList.add('active');
            tabEl.style.display = 'block';
        }
        
        // Mark button as active
        if (event && event.target) {
            event.target.classList.add('active');
            event.target.style.color = '#FCD34D';
        }
    }
}
