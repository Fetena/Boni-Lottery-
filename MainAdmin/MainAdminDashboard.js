// ============================================
// MAIN ADMIN DASHBOARD (PARENT COMPONENT)
// Manages: System Settings, Platform Analytics
// ============================================

class MainAdminDashboard {
    constructor() {
        this.settings = new MainAdminSettings();
    }

    render() {
    return `
        <div id="main-admin-dashboard" class="min-h-screen bg-black text-white p-6">
            <h1 class="text-2xl font-bold mb-6">System Control Center</h1>
            
            <!-- Navigation -->
            <nav class="flex gap-4 border-b border-yellow-400/10 pb-4 mb-6 overflow-x-auto">
                <button onclick="switchTab('main', 'dashboard')" class="tab-button active text-yellow-400">Dashboard</button>
                <button onclick="switchTab('main', 'admins')" class="tab-button">Admins</button>
                <button onclick="switchTab('main', 'analytics')" class="tab-button">Analytics</button>
                <button onclick="switchTab('main', 'auditlog')" class="tab-button">Audit Log</button>
                <button onclick="switchTab('main', 'customers')" class="tab-button">Customers</button>
                <button onclick="switchTab('main', 'notifications')" class="tab-button">Notifications</button>
                <button onclick="switchTab('main', 'payments')" class="tab-button">Payments</button>
                <button onclick="switchTab('main', 'ranges')" class="tab-button">Ranges</button>
                <button onclick="switchTab('main', 'settings')" class="tab-button">Settings</button>
                <button onclick="switchTab('main', 'transactions')" class="tab-button">Transactions</button>
            </nav>

            <!-- Content Areas -->
            <div id="main-dashboard" class="tab-content active">...</div>
            <div id="main-admins" class="tab-content" style="display:none;"></div>
            <div id="main-analytics" class="tab-content" style="display:none;"></div>
            <div id="main-auditlog" class="tab-content" style="display:none;"></div>
            <div id="main-customers" class="tab-content" style="display:none;"></div>
            <div id="main-notifications" class="tab-content" style="display:none;"></div>
            <div id="main-payments" class="tab-content" style="display:none;"></div>
            <div id="main-ranges" class="tab-content" style="display:none;"></div>
            <div id="main-settings" class="tab-content" style="display:none;"></div>
            <div id="main-transactions" class="tab-content" style="display:none;"></div>
        </div>
    `;
}

    loadTabs() {
        document.getElementById('main-settings').innerHTML = this.settings.render();
    }
}
