// ============================================
// ADMIN DASHBOARD (PARENT COMPONENT)
// Manages: Payments, Notifications, Settings
// ============================================

class AdminDashboard {
    constructor(adminId) {
        this.adminId = adminId;
        this.admin = db.getAdminSettings(adminId);
        
        // Initialize ALL child components
        this.payments = new AdminPayments(adminId);
        this.notifications = new AdminNotifications(adminId);
        this.settings = new AdminSettings(adminId);
        this.customers = new AdminCustomers(adminId);
        this.draws = new AdminDraws(adminId);
        this.revenue = new AdminRevenue(adminId);
        this.logs = new AdminLogs(adminId);
        this.notify = new AdminNotify(adminId);
        this.bookAppointment = new AdminBookAppointment(adminId);
    }

    render() {
        return `
            <div id="admin-dashboard" class="hidden min-h-screen bg-black flex flex-col">
                <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-6 py-4">
                    <div class="max-w-7xl mx-auto flex items-center justify-between">
                        <h1 class="font-bold text-xl text-gradient">🛡️ BRANCH ADMIN DASHBOARD</h1>
                        <button onclick="logout()" class="px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-xl">Logout</button>
                    </div>
                </header>
                
                <main class="flex-grow p-6 overflow-y-auto">
                    <div class="max-w-7xl mx-auto space-y-6">
                        <h2 class="text-3xl font-bold text-white">Admin Control Center</h2>
                        
                        <!-- TABS -->
                        <div class="flex gap-2 border-b border-yellow-400/10 pb-2 overflow-x-auto">
                            <button onclick="adminDashboard.switchTab('dashboard')" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">📊 Dashboard</button>
                            <button onclick="adminDashboard.switchTab('customers')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">👥 Customers</button>
                            <button onclick="adminDashboard.switchTab('revenue')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">💰 Revenue</button>
                            <button onclick="adminDashboard.switchTab('draws')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🎰 Draws</button>
                            <button onclick="adminDashboard.switchTab('notify')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🔔 Notify</button>
                            <button onclick="adminDashboard.switchTab('appointments')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📅 Appointments</button>
                            <button onclick="adminDashboard.switchTab('payments')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">💳 Payments</button>
                            <button onclick="adminDashboard.switchTab('logs')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📋 Logs</button>
                            <button onclick="adminDashboard.switchTab('settings')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">⚙️ Settings</button>
                        </div>

                        <!-- TAB CONTENTS -->
                        <div id="admin-dashboard" class="tab-content active space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Customers</p>
                                    <p class="text-3xl font-bold text-blue-400 mt-2">${this.admin?.customers || 0}</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Revenue</p>
                                    <p class="text-3xl font-bold text-purple-400 mt-2">${this.admin?.revenue || 0} ETB</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Tickets</p>
                                    <p class="text-3xl font-bold text-emerald-400 mt-2">${this.admin?.tickets || 0}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div id="admin-customers" class="tab-content" style="display: none;"></div>
                        <div id="admin-revenue" class="tab-content" style="display: none;"></div>
                        <div id="admin-draws" class="tab-content" style="display: none;"></div>
                        <div id="admin-notify" class="tab-content" style="display: none;"></div>
                        <div id="admin-appointments" class="tab-content" style="display: none;"></div>
                        <div id="admin-payments" class="tab-content" style="display: none;"></div>
                        <div id="admin-logs" class="tab-content" style="display: none;"></div>
                        <div id="admin-settings" class="tab-content" style="display: none;"></div>
                    </div>
                </main>
            </div>
        `;
    }

    loadTabs() {
        document.getElementById('admin-customers').innerHTML = this.customers.render();
        document.getElementById('admin-revenue').innerHTML = this.revenue.render();
        document.getElementById('admin-draws').innerHTML = this.draws.render();
        document.getElementById('admin-notify').innerHTML = this.notify.render();
        document.getElementById('admin-appointments').innerHTML = this.bookAppointment.render();
        document.getElementById('admin-payments').innerHTML = this.payments.render();
        document.getElementById('admin-logs').innerHTML = this.logs.render();
        document.getElementById('admin-settings').innerHTML = this.settings.render();
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('#admin-dashboard + div, [id^="admin-"]').forEach(el => {
            if (el.classList && el.classList.contains('tab-content')) {
                el.classList.remove('active');
                el.style.display = 'none';
            }
        });
        
        // Remove active from all buttons
        document.querySelectorAll('#admin-dashboard .tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.style.color = '';
        });
        
        // Show selected tab
        const tabEl = document.getElementById(`admin-${tabName}`);
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
