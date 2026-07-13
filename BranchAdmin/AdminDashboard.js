// ============================================
// ADMIN DASHBOARD (PARENT COMPONENT)
// Manages: Payments, Notifications, Settings
// ============================================

class AdminDashboard {
    constructor(adminId) {
        this.adminId = adminId;
        this.admin = db.getAdminSettings(adminId);
        
        // Initialize child components
        this.payments = new AdminPayments(adminId);
        this.notifications = new AdminNotifications(adminId);
        this.settings = new AdminSettings(adminId);
    }

   render() {
    return `
        <div id="admin-dashboard" class="hidden min-h-screen bg-black flex flex-col">
            <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-6 py-4">
                <div class="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 class="font-bold text-xl text-gradient">🛡️ ADMIN</h1>
                    <button onclick="logout()" class="px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-xl">Logout</button>
                </div>
            </header>
            
            <main class="flex-grow p-6 overflow-y-auto">
                <div class="max-w-7xl mx-auto space-y-6">
                    <h2 class="text-3xl font-bold text-white">Admin Control Center</h2>
                    
                    <!-- UPDATED TABS -->
                    <div class="flex gap-2 border-b border-yellow-400/10 pb-2 overflow-x-auto">
                        <button onclick="switchTab('admin', 'dashboard')" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">Dashboard</button>
                        <button onclick="switchTab('admin', 'notifications')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🔔 Notify</button>
                        <button onclick="switchTab('admin', 'payments')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">💳 Payments</button>
                        <button onclick="switchTab('admin', 'settings')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">⚙️ Settings</button>
                        <button onclick="switchTab('admin', 'customers')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">👥 Customers</button>
                        <button onclick="switchTab('admin', 'draws')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🎰 Draws</button>
                        <button onclick="switchTab('admin', 'logs')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📋 Logs</button>
                        <button onclick="switchTab('admin', 'bookappointment')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📅 Appointments</button>
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
                    
                    <div id="admin-notifications" class="tab-content" style="display: none;"></div>
                    <div id="admin-payments" class="tab-content" style="display: none;"></div>
                    <div id="admin-settings" class="tab-content" style="display: none;"></div>
                    <div id="admin-customers" class="tab-content" style="display: none;"></div>
                    <div id="admin-draws" class="tab-content" style="display: none;"></div>
                    <div id="admin-logs" class="tab-content" style="display: none;"></div>
                    <div id="admin-bookappointment" class="tab-content" style="display: none;"></div>
                </div>
            </main>
        </div>
    `;
}

    loadTabs() {
        document.getElementById('admin-notifications').innerHTML = this.notifications.render();
        document.getElementById('admin-payments').innerHTML = this.payments.render();
        document.getElementById('admin-settings').innerHTML = this.settings.render();
    }
}
