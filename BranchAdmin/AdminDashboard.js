class AdminPayments {
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

class AdminCustomers {
    constructor(adminId) { this.adminId = adminId; }
    render() { return `<div class="glass-panel p-6 rounded-2xl">List of Branch Customers</div>`; }
}

class AdminDraws {
    constructor(adminId) { this.adminId = adminId; }
    render() { return `<div class="glass-panel p-6 rounded-2xl">Manage Draws</div>`; }
}

class AdminRevenue {
    constructor(adminId) { this.adminId = adminId; }
    render() { return `<div class="glass-panel p-6 rounded-2xl">Revenue Report</div>`; }
}

class AdminLogs {
    constructor(adminId) { this.adminId = adminId; }
    render() { return `<div class="glass-panel p-6 rounded-2xl">Activity Logs</div>`; }
}

class AdminNotify {
    constructor(adminId) { this.adminId = adminId; }
    render() { return `<div class="glass-panel p-6 rounded-2xl">Send Notification</div>`; }
}

class AdminBookAppointment {
    constructor(adminId) { this.adminId = adminId; }
    render() { return `<div class="glass-panel p-6 rounded-2xl">Booking Scheduler</div>`; }
}
