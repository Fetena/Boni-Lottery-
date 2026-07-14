class CustomerProfile {
    constructor(custId) { this.custId = custId; }
    render() {
        const c = db.getCustomer(this.custId);
        return `
            <div class="glass-panel p-6 rounded-2xl">
                <h3 class="text-xl font-bold mb-4">Profile</h3>
                <div class="space-y-4">
                    <p class="text-slate-400 text-sm">Name: <span class="text-white">${c.name}</span></p>
                    <p class="text-slate-400 text-sm">Email: <span class="text-white">${c.email}</span></p>
                    <p class="text-slate-400 text-sm">Spent: <span class="text-yellow-400">${c.spent} ETB</span></p>
                </div>
            </div>
        `;
    }
}

class CustomerSettings {
    constructor(custId) { this.custId = custId; }
    render() {
        return `
            <div class="glass-panel p-6 rounded-2xl">
                <h3 class="text-xl font-bold mb-4">Settings</h3>
                <button class="bg-yellow-600 px-4 py-2 rounded-xl font-bold text-black">Update Password</button>
            </div>
        `;
    }
}

class CustomerTickets {
    constructor(custId) { this.custId = custId; }
    render() {
        const c = db.getCustomer(this.custId);
        return `
            <div class="glass-panel p-6 rounded-2xl">
                <h3 class="text-xl font-bold mb-4">My Tickets</h3>
                <div class="space-y-2">${(c.tickets || []).map(t => `<div class="p-3 bg-black/40 rounded-lg">${t.id} - ${t.status}</div>`).join('')}</div>
            </div>
        `;
    }
}

class CustomerLibrary {
    constructor(custId) { this.custId = custId; }
    render() { return `<div class="glass-panel p-6 rounded-2xl">Library: Coming Soon</div>`; }
}
class CustomerAppointments {
    constructor(custId) { this.custId = custId; }
    render() { return `<div class="glass-panel p-6 rounded-2xl">Appointments Interface</div>`; }
}
class CustomerDrawings {
    constructor(custId) { this.custId = custId; }
    render() { return `<div class="glass-panel p-6 rounded-2xl">Drawings History</div>`; }
}
