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

    // Inside Customer/CustomerDashboard.js
render() {
    return `
        <div id="customer-dashboard">
            <!-- Navigation -->
            <nav class="flex gap-4">
                <button onclick="switchTab('customer', 'profile')" class="tab-button active">Profile</button>
                <button onclick="switchTab('customer', 'buy')" class="tab-button">Buy</button>
                <button onclick="switchTab('customer', 'tickets')" class="tab-button">My Tickets</button>
                <button onclick="switchTab('customer', 'settings')" class="tab-button">Settings</button>
                <!-- NEW TABS -->
                <button onclick="switchTab('customer', 'library')" class="tab-button">Library</button>
                <button onclick="switchTab('customer', 'appointments')" class="tab-button">Appointments</button>
                <button onclick="switchTab('customer', 'drawings')" class="tab-button">Drawings</button>
            </nav>

            <!-- Tab Content Containers -->
            <div id="customer-profile" class="tab-content active">...</div>
            <div id="customer-buy" class="tab-content" style="display:none;">...</div>
            <div id="customer-tickets" class="tab-content" style="display:none;">...</div>
            <div id="customer-settings" class="tab-content" style="display:none;">...</div>
            <!-- NEW CONTENT DIVS -->
            <div id="customer-library" class="tab-content" style="display:none;"></div>
            <div id="customer-appointments" class="tab-content" style="display:none;"></div>
            <div id="customer-drawings" class="tab-content" style="display:none;"></div>
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
