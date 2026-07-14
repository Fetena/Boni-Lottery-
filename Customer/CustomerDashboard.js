// ============================================
// CUSTOMER DASHBOARD (PARENT COMPONENT)
// Manages: Profile, Numbers, Settings, Tickets
// ============================================

class CustomerDashboard {
    constructor(custId) {
        this.custId = custId;
        this.customer = db.getCustomer(custId);
        
        // Initialize ALL child components
        this.profile = new CustomerProfile(custId);
        this.numberGrid = new CustomerNumberGrid(custId);
        this.settings = new CustomerSettings(custId);
        this.tickets = new CustomerTickets(custId);
        this.library = new CustomerLibrary(custId);
        this.appointments = new CustomerAppointments(custId);
        this.drawings = new CustomerDrawings(custId);
    }

    render() {
        return `
            <div id="customer-dashboard" class="hidden min-h-screen bg-black flex flex-col">
                <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-6 py-4">
                    <div class="max-w-7xl mx-auto flex items-center justify-between">
                        <h1 class="font-bold text-xl text-gradient">👤 CUSTOMER DASHBOARD</h1>
                        <button onclick="logout()" class="px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-xl">Logout</button>
                    </div>
                </header>
                
                <main class="flex-grow p-6 overflow-y-auto">
                    <div class="max-w-7xl mx-auto space-y-6">
                        <h2 class="text-3xl font-bold text-white">Welcome, <span id="cust-name">${this.customer.name}</span>! 👋</h2>
                        
                        <!-- TABS -->
                        <div class="flex gap-2 border-b border-yellow-400/10 pb-2 overflow-x-auto">
                            <button onclick="customerDashboard.switchTab('profile')" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">👤 Profile</button>
                            <button onclick="customerDashboard.switchTab('library')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📖 Learn</button>
                            <button onclick="customerDashboard.switchTab('buytickets')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🎫 Buy Tickets</button>
                            <button onclick="customerDashboard.switchTab('mytickets')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🎟️ My Tickets</button>
                            <button onclick="customerDashboard.switchTab('drawings')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🎰 Drawings</button>
                            <button onclick="customerDashboard.switchTab('appointments')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📅 Appointments</button>
                            <button onclick="customerDashboard.switchTab('settings')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">⚙️ Settings</button>
                        </div>

                        <!-- TAB CONTENTS -->
                        <div id="cust-profile" class="tab-content active"></div>
                        <div id="cust-library" class="tab-content" style="display: none;"></div>
                        <div id="cust-buytickets" class="tab-content" style="display: none;"></div>
                        <div id="cust-mytickets" class="tab-content" style="display: none;"></div>
                        <div id="cust-drawings" class="tab-content" style="display: none;"></div>
                        <div id="cust-appointments" class="tab-content" style="display: none;"></div>
                        <div id="cust-settings" class="tab-content" style="display: none;"></div>
                    </div>
                </main>
            </div>
        `;
    }

    loadTabs() {
        // Load ALL child components into tabs
        document.getElementById('cust-profile').innerHTML = this.profile.render();
        document.getElementById('cust-library').innerHTML = this.library.render();
        document.getElementById('cust-buytickets').innerHTML = this.numberGrid.render();
        document.getElementById('cust-mytickets').innerHTML = this.tickets.render();
        document.getElementById('cust-drawings').innerHTML = this.drawings.render();
        document.getElementById('cust-appointments').innerHTML = this.appointments.render();
        document.getElementById('cust-settings').innerHTML = this.settings.render();
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('[id^="cust-"]').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });
        
        // Remove active from all buttons
        document.querySelectorAll('#customer-dashboard .tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.style.color = '';
        });
        
        // Show selected tab
        const tabEl = document.getElementById(`cust-${tabName}`);
        if (tabEl) {
            tabEl.classList.add('active');
            tabEl.style.display = 'block';
        }
        
        // Mark button as active
        event.target.classList.add('active');
        event.target.style.color = '#FCD34D';
    }
}
