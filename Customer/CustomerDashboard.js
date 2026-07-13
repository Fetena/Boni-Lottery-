// ============================================
// CUSTOMER DASHBOARD (PARENT COMPONENT)
// Manages: Profile, Numbers, Settings, Tickets
// ============================================

class CustomerDashboard {
    constructor(custId) {
        this.custId = custId;
        this.customer = db.getCustomer(custId);
        
        // Initialize child components
        this.profile = new CustomerProfile(custId);
        this.numberGrid = new CustomerNumberGrid(custId);
        this.settings = new CustomerSettings(custId);
        this.tickets = new CustomerTickets(custId);
    }

    render() {
        return `
            <div id="customer-dashboard" class="hidden min-h-screen bg-black flex flex-col">
                <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-6 py-4">
                    <div class="max-w-7xl mx-auto flex items-center justify-between">
                        <h1 class="font-bold text-xl text-gradient">👤 CUSTOMER</h1>
                        <button onclick="logout()" class="px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-xl">Logout</button>
                    </div>
                </header>
                
                <main class="flex-grow p-6 overflow-y-auto">
                    <div class="max-w-7xl mx-auto space-y-6">
                        <h2 class="text-3xl font-bold text-white">Welcome, <span id="cust-name">${this.customer.name}</span>! 👋</h2>
                        
                        <!-- TABS -->
                        <div class="flex gap-2 border-b border-yellow-400/10 pb-2 overflow-x-auto">
                            <button onclick="switchTab('cust', 'profile')" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">Profile</button>
                            <button onclick="switchTab('cust', 'buytickets')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🎫 Buy</button>
                            <button onclick="switchTab('cust', 'mytickets')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">My Tickets</button>
                            <button onclick="switchTab('cust', 'settings')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">⚙️ Settings</button>
                        </div>

                        <!-- TAB CONTENTS -->
                        <div id="cust-profile" class="tab-content active"></div>
                        <div id="cust-buytickets" class="tab-content" style="display: none;"></div>
                        <div id="cust-mytickets" class="tab-content" style="display: none;"></div>
                        <div id="cust-settings" class="tab-content" style="display: none;"></div>
                    </div>
                </main>
            </div>
        `;
    }

    loadTabs() {
        // Load child components into tabs
        document.getElementById('cust-profile').innerHTML = this.profile.render();
        document.getElementById('cust-buytickets').innerHTML = this.numberGrid.render();
        document.getElementById('cust-mytickets').innerHTML = this.tickets.render();
        document.getElementById('cust-settings').innerHTML = this.settings.render();
    }
}
