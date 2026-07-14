// ============================================
// MAIN ADMIN DASHBOARD (PARENT COMPONENT)
// Manages: System Settings, Platform Analytics
// ============================================
    

class MainAdminDashboard {
    constructor(adminId) { this.adminId = adminId; }
    render() {
        return `
            <div class="glass-panel p-6 rounded-2xl">
                <h3 class="text-xl font-bold mb-4">Payments Management</h3>
                <input class="w-full bg-slate-900 p-3 rounded-lg mb-4" placeholder="Update Telebirr Number">
                <button class="bg-yellow-600 px-4 py-2 rounded-lg text-black font-bold">Save</button>
            </div>
        `;
    }
}
            
           class MainAdminAdmins { render() { return `<div class="glass-panel p-6 rounded-2xl">Manage Branches</div>`; } }
class MainAdminCustomers { render() { return `<div class="glass-panel p-6 rounded-2xl">All Customers</div>`; } }
class MainAdminPayments { render() { return `<div class="glass-panel p-6 rounded-2xl">Financial Audit</div>`; } }
class MainAdminTransactions { render() { return `<div class="glass-panel p-6 rounded-2xl">Transaction History</div>`; } }
class MainAdminAnalytics { render() { return `<div class="glass-panel p-6 rounded-2xl">Platform Analytics</div>`; } }
class MainAdminAuditLog { render() { return `<div class="glass-panel p-6 rounded-2xl">Global System Logs</div>`; } }
class MainAdminNotifications { render() { return `<div class="glass-panel p-6 rounded-2xl">System Alerts</div>`; } }
