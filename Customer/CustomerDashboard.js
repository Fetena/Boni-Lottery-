// ============================================
// CUSTOMER DASHBOARD - COMPLETE (WITH ADMIN SELECTION)
// ============================================

let selectedNumbers = [];
let window_customerDashboard = null;

class CustomerDashboard {
    constructor(custId) {
        this.custId = custId;
    }

    render() {
        return `
            <div id="customer-dashboard" class="min-h-screen bg-black flex flex-col">
                <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-6 py-4">
                    <div class="max-w-7xl mx-auto flex items-center justify-between">
                        <h1 class="font-bold text-xl text-gradient">👤 CUSTOMER DASHBOARD</h1>
                        <button onclick="logout()" class="px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-xl">Logout</button>
                    </div>
                </header>
                
                <main class="flex-grow p-6 overflow-y-auto">
                    <div class="max-w-7xl mx-auto space-y-6">
                        <h2 class="text-3xl font-bold text-white">Welcome, <span id="cust-name">Customer</span>! 👋</h2>
                        
                        <div class="flex gap-2 border-b border-yellow-400/10 pb-2 overflow-x-auto">
                            <button onclick="switchCustomerTab('profile')" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">👤 Profile</button>
                            <button onclick="switchCustomerTab('buytickets')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">🎫 Buy Tickets</button>
                            <button onclick="switchCustomerTab('mytickets')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">🎟️ My Tickets</button>
                            <button onclick="switchCustomerTab('settings')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">⚙️ Settings</button>
                        </div>

                        <!-- Profile Tab -->
                        <div id="cust-profile" class="tab-content active">
                            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-2">
                                <h3 class="text-xl font-bold text-white mb-4">Your Profile</h3>
                                <p class="text-slate-400 text-xs">Email: <span id="cust-email" class="text-white">${currentUser?.email || 'N/A'}</span></p>
                                <p class="text-slate-400 text-xs">Assigned Admin: <span id="cust-assigned-admin" class="text-yellow-400 font-bold">Not Selected</span></p>
                                <p class="text-slate-400 text-xs mt-2">Total Tickets: <span id="cust-total-tickets" class="text-white">0</span></p>
                                <p class="text-slate-400 text-xs mt-2">Total Spent: <span id="cust-total-spent" class="text-white">0 ETB</span></p>
                            </div>
                        </div>

                        <!-- Buy Tickets Tab -->
                        <div id="cust-buytickets" class="tab-content" style="display: none;">
                            <div class="space-y-4">
                                <h3 class="text-xl font-bold text-white">Select Numbers (1-300)</h3>
                                <div id="numbers-grid" class="grid grid-cols-10 gap-2"></div>
                                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10 space-y-3">
                                    <div>
                                        <label class="block text-xs text-slate-400 mb-1">Select Preferred Admin / Branch</label>
                                        <select id="ticket-admin-select" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                                            <option value="">-- Choose Admin --</option>
                                        </select>
                                    </div>
                                    <p class="text-white text-xs">Selected: <span id="selected-count">0</span> numbers</p>
                                    <p class="text-white text-xs mt-1">Cost: <span id="ticket-cost">0</span> ETB</p>
                                    <button onclick="submitCustomerTicket()" class="w-full mt-2 py-2 bg-yellow-400 text-black font-bold rounded-xl text-xs">Submit Ticket</button>
                                </div>
                            </div>
                        </div>

                        <!-- My Tickets Tab -->
                        <div id="cust-mytickets" class="tab-content" style="display: none;">
                            <div id="cust-tickets-list" class="space-y-3"></div>
                        </div>

                        <!-- Settings Tab -->
                        <div id="cust-settings" class="tab-content" style="display: none;">
                            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                                <h3 class="text-xl font-bold text-white">Settings & Preferred Admin</h3>
                                <div>
                                    <label class="block text-xs text-slate-400 mb-2">Phone Number</label>
                                    <input type="tel" id="cust-phone" placeholder="0912345678" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                                </div>
                                <div>
                                    <label class="block text-xs text-slate-400 mb-2">Preferred Admin / Branch</label>
                                    <select id="cust-admin-select" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                                        <option value="">-- Choose Admin --</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs text-slate-400 mb-2">Preferred Payment Method</label>
                                    <select id="cust-payment" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                                        <option>Telebirr</option>
                                        <option>CBE Birr</option>
                                        <option>Bank Transfer</option>
                                    </select>
                                </div>
                                <button onclick="saveCustomerSettings()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl text-xs">Save Settings</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    async loadData() {
        try {
            generateNumbersGrid();
            await loadAdminsDropdown();
            await loadCustomerSettings();
            await loadCustomerTickets();
            await loadCustomerStats();
        } catch (error) {
            console.error('Error loading customer data:', error);
        }
    }
}

// Store global reference
window_customerDashboard = null;

// ========== TAB SWITCHING ==========

function switchCustomerTab(tabName) {
    const allTabs = document.querySelectorAll('#customer-dashboard .tab-content');
    allTabs.forEach(tab => {
        tab.style.display = 'none';
    });

    const allButtons = document.querySelectorAll('#customer-dashboard .tab-button');
    allButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.color = '';
    });

    if (tabName === 'profile') {
        const el = document.getElementById('cust-profile');
        if (el) el.style.display = 'block';
    } else if (tabName === 'buytickets') {
        const el = document.getElementById('cust-buytickets');
        if (el) el.style.display = 'block';
        generateNumbersGrid();
    } else if (tabName === 'mytickets') {
        const el = document.getElementById('cust-mytickets');
        if (el) el.style.display = 'block';
    } else if (tabName === 'settings') {
        const el = document.getElementById('cust-settings');
        if (el) el.style.display = 'block';
    }

    if (event && event.target) {
        event.target.classList.add('active');
        event.target.style.color = '#FCD34D';
    }
}

// ========== LOAD ADMINS FOR SELECTION ==========

async function loadAdminsDropdown() {
    if (!db) return;

    try {
        const snapshot = await db.collection('admins').get();
        const admins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const settingsSelect = document.getElementById('cust-admin-select');
        const ticketSelect = document.getElementById('ticket-admin-select');

        const optionsHtml = '<option value="">-- Choose Admin --</option>' + 
            admins.map(admin => `<option value="${admin.email}">${admin.name || admin.email}</option>`).join('');

        if (settingsSelect) settingsSelect.innerHTML = optionsHtml;
        if (ticketSelect) ticketSelect.innerHTML = optionsHtml;

        // Load saved selection into dropdowns if available
        const doc = await db.collection('customer_settings').doc(currentUser.email).get();
        if (doc.exists && doc.data().preferredAdmin) {
            const prefAdmin = doc.data().preferredAdmin;
            if (settingsSelect) settingsSelect.value = prefAdmin;
            if (ticketSelect) ticketSelect.value = prefAdmin;
            
            const assignedEl = document.getElementById('cust-assigned-admin');
            if (assignedEl) assignedEl.textContent = prefAdmin;
        }
    } catch (error) {
        console.error('Error loading admins list:', error);
    }
}

// ========== NUMBER SELECTION ==========

function generateNumbersGrid() {
    const grid = document.getElementById('numbers-grid');
    if (!grid) return;

    grid.innerHTML = '';
    for (let i = 1; i <= 300; i++) {
        const btn = document.createElement('button');
        btn.className = selectedNumbers.includes(i) 
            ? 'p-2 bg-yellow-400 text-black font-bold rounded text-xs'
            : 'p-2 bg-black/40 border border-yellow-400/20 text-yellow-400 rounded text-xs hover:bg-yellow-400/20';
        btn.textContent = i;
        btn.onclick = () => toggleNumber(i);
        grid.appendChild(btn);
    }
    updateCost();
}

function toggleNumber(num) {
    if (selectedNumbers.includes(num)) {
        selectedNumbers = selectedNumbers.filter(n => n !== num);
    } else {
        selectedNumbers.push(num);
    }
    generateNumbersGrid();
}

function updateCost() {
    const countEl = document.getElementById('selected-count');
    const costEl = document.getElementById('ticket-cost');
    
    if (countEl) countEl.textContent = selectedNumbers.length;
    if (costEl) costEl.textContent = selectedNumbers.length * 100;
}

// ========== CUSTOMER TICKETS - FIRESTORE ==========

async function submitCustomerTicket() {
    if (selectedNumbers.length === 0) {
        notify('error', '❌ Select at least 1 number');
        return;
    }
    
    if (!db) {
        notify('error', '❌ Database not initialized');
        return;
    }
    
    if (!currentUser) {
        notify('error', '❌ User not authenticated');
        return;
    }

    const paymentMethodEl = document.getElementById('cust-payment');
    const paymentMethod = paymentMethodEl?.value || 'Telebirr';
    
    const adminSelectEl = document.getElementById('ticket-admin-select');
    const assignedAdmin = adminSelectEl?.value || '';

    if (!assignedAdmin) {
        notify('error', '❌ Please select your preferred admin/branch');
        return;
    }

    try {
        await db.collection('customer_tickets').add({
            customerEmail: currentUser.email,
            customerName: currentUser.name || 'Customer',
            assignedAdmin: assignedAdmin,
            numbers: selectedNumbers,
            cost: selectedNumbers.length * 100,
            paymentMethod: paymentMethod,
            status: 'Pending',
            createdAt: new Date()
        });

        notify('success', `✅ Ticket submitted to admin successfully!`);
        selectedNumbers = [];
        generateNumbersGrid();
        await loadCustomerTickets();
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

async function loadCustomerTickets() {
    if (!db || !currentUser) return;

    try {
        const snapshot = await db.collection('customer_tickets')
            .where('customerEmail', '==', currentUser.email)
            .orderBy('createdAt', 'desc')
            .get();

        const content = document.getElementById('cust-tickets-list');
        if (!content) return;

        if (snapshot.empty) {
            content.innerHTML = '<p class="text-slate-400 text-center py-6">No tickets yet</p>';
            return;
        }

        content.innerHTML = snapshot.docs.map((doc, i) => {
            const ticket = doc.data();
            const createdDate = ticket.createdAt?.toDate?.() || new Date();
            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10 text-xs space-y-1">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-white">Ticket #${i + 1}</p>
                            <p class="text-slate-300">Admin: <span class="text-yellow-400">${ticket.assignedAdmin || 'N/A'}</span></p>
                            <p class="text-slate-400">Numbers: ${ticket.numbers?.join(', ') || 'N/A'}</p>
                            <p class="text-slate-400">Cost: ${ticket.cost || 0} ETB</p>
                            <p class="text-slate-400">Payment: ${ticket.paymentMethod || 'N/A'}</p>
                            <p class="text-slate-400">Date: ${createdDate.toLocaleDateString()}</p>
                        </div>
                        <span class="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded">${ticket.status || 'N/A'}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

// ========== CUSTOMER SETTINGS - FIRESTORE ==========

async function saveCustomerSettings() {
    const phoneEl = document.getElementById('cust-phone');
    const paymentEl = document.getElementById('cust-payment');
    const adminSelectEl = document.getElementById('cust-admin-select');
    
    const phone = phoneEl?.value || '';
    const payment = paymentEl?.value || 'Telebirr';
    const preferredAdmin = adminSelectEl?.value || '';

    if (!phone) {
        notify('error', '❌ Enter phone number');
        return;
    }
    
    if (!db) {
        notify('error', '❌ Database not initialized');
        return;
    }
    
    if (!currentUser) {
        notify('error', '❌ User not authenticated');
        return;
    }

    try {
        await db.collection('customer_settings').doc(currentUser.email).set({
            customerEmail: currentUser.email,
            customerName: currentUser.name || 'Customer',
            phone: phone,
            preferredAdmin: preferredAdmin,
            preferredPayment: payment,
            updatedAt: new Date()
        }, { merge: true });

        const assignedEl = document.getElementById('cust-assigned-admin');
        if (assignedEl) assignedEl.textContent = preferredAdmin || 'Not Selected';

        notify('success', '✅ Settings and preferred admin saved!');
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

async function loadCustomerSettings() {
    if (!db || !currentUser) return;

    try {
        const doc = await db.collection('customer_settings').doc(currentUser.email).get();
        if (doc.exists) {
            const data = doc.data();
            const phoneEl = document.getElementById('cust-phone');
            const paymentEl = document.getElementById('cust-payment');
            const adminSelectEl = document.getElementById('cust-admin-select');
            
            if (data.phone && phoneEl) phoneEl.value = data.phone;
            if (data.preferredPayment && paymentEl) paymentEl.value = data.preferredPayment;
            if (data.preferredAdmin && adminSelectEl) adminSelectEl.value = data.preferredAdmin;

            const assignedEl = document.getElementById('cust-assigned-admin');
            if (assignedEl) assignedEl.textContent = data.preferredAdmin || 'Not Selected';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// ========== CUSTOMER STATS ==========

async function loadCustomerStats() {
    if (!db || !currentUser) return;

    try {
        const ticketSnapshot = await db.collection('customer_tickets')
            .where('customerEmail', '==', currentUser.email)
            .get();

        const ticketsEl = document.getElementById('cust-total-tickets');
        if (ticketsEl) ticketsEl.textContent = ticketSnapshot.size;

        let spent = 0;
        ticketSnapshot.forEach(doc => {
            spent += doc.data().cost || 0;
        });
        
        const spentEl = document.getElementById('cust-total-spent');
        if (spentEl) spentEl.textContent = spent.toLocaleString() + ' ETB';
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}
