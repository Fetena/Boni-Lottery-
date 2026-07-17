// ============================================
// CUSTOMER DASHBOARD - COMPLETE
// ============================================

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
                            <button onclick="switchTab('cust', 'profile')" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">👤 Profile</button>
                            <button onclick="switchTab('cust', 'buytickets')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">🎫 Buy Tickets</button>
                            <button onclick="switchTab('cust', 'mytickets')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">🎟️ My Tickets</button>
                            <button onclick="switchTab('cust', 'settings')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">⚙️ Settings</button>
                        </div>

                        <!-- Profile Tab -->
                        <div id="cust-profile" class="tab-content active">
                            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                <h3 class="text-xl font-bold text-white mb-4">Your Profile</h3>
                                <p class="text-slate-400">Email: <span id="cust-email">${currentUser?.email || 'N/A'}</span></p>
                                <p class="text-slate-400 mt-2">Total Tickets: <span id="cust-total-tickets">0</span></p>
                                <p class="text-slate-400 mt-2">Total Spent: <span id="cust-total-spent">0 ETB</span></p>
                            </div>
                        </div>

                        <!-- Buy Tickets Tab -->
                        <div id="cust-buytickets" class="tab-content" style="display: none;">
                            <div class="space-y-4">
                                <h3 class="text-xl font-bold text-white">Select Numbers (1-300)</h3>
                                <div id="numbers-grid" class="grid grid-cols-10 gap-2"></div>
                                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                                    <p class="text-white">Selected: <span id="selected-count">0</span> numbers</p>
                                    <p class="text-white mt-2">Cost: <span id="ticket-cost">0</span> ETB</p>
                                    <button onclick="submitCustomerTicket()" class="w-full mt-4 py-2 bg-yellow-400 text-black font-bold rounded-xl">Submit Ticket</button>
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
                                <h3 class="text-xl font-bold text-white">Settings</h3>
                                <div>
                                    <label class="block text-xs text-slate-400 mb-2">Phone Number</label>
                                    <input type="tel" id="cust-phone" placeholder="0912345678" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                                </div>
                                <div>
                                    <label class="block text-xs text-slate-400 mb-2">Preferred Payment Method</label>
                                    <select id="cust-payment" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                                        <option>Telebirr</option>
                                        <option>CBE Birr</option>
                                        <option>Bank Transfer</option>
                                    </select>
                                </div>
                                <button onclick="saveCustomerSettings()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Save Settings</button>
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
            await loadCustomerSettings();
            await loadCustomerTickets();
            await loadCustomerStats();
        } catch (error) {
            console.error('Error loading customer data:', error);
        }
    }
}

// ========== NUMBER SELECTION ==========

let selectedNumbers = [];

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
    document.getElementById('selected-count').textContent = selectedNumbers.length;
    document.getElementById('ticket-cost').textContent = selectedNumbers.length * 100;
}

// ========== CUSTOMER TICKETS - FIRESTORE ==========

async function submitCustomerTicket() {
    if (selectedNumbers.length === 0) return notify('error', '❌ Select at least 1 number');
    if (!db) return notify('error', '❌ Database not initialized');

    const paymentMethod = document.getElementById('cust-payment')?.value || 'Telebirr';

    try {
        await db.collection('customer_tickets').add({
            customerEmail: currentUser.email,
            customerName: currentUser.name,
            numbers: selectedNumbers,
            cost: selectedNumbers.length * 100,
            paymentMethod: paymentMethod,
            status: 'Pending',
            createdAt: new Date()
        });

        notify('success', `✅ Ticket submitted with ${selectedNumbers.length} numbers!`);
        selectedNumbers = [];
        generateNumbersGrid();
        await loadCustomerTickets();
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

async function loadCustomerTickets() {
    if (!db) return;

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
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-white">Ticket #${i + 1}</p>
                            <p class="text-xs text-slate-400">Numbers: ${ticket.numbers.join(', ')}</p>
                            <p class="text-xs text-slate-400">Cost: ${ticket.cost} ETB</p>
                            <p class="text-xs text-slate-400">Payment: ${ticket.paymentMethod}</p>
                            <p class="text-xs text-slate-400">Date: ${createdDate.toLocaleDateString()}</p>
                        </div>
                        <span class="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded">${ticket.status}</span>
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
    const phone = document.getElementById('cust-phone')?.value;
    const payment = document.getElementById('cust-payment')?.value;

    if (!phone) return notify('error', '❌ Enter phone number');
    if (!db) return notify('error', '❌ Database not initialized');

    try {
        await db.collection('customer_settings').doc(currentUser.email).set({
            customerEmail: currentUser.email,
            customerName: currentUser.name,
            phone: phone,
            preferredPayment: payment,
            updatedAt: new Date()
        }, { merge: true });

        notify('success', '✅ Settings saved!');
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

async function loadCustomerSettings() {
    if (!db) return;

    try {
        const doc = await db.collection('customer_settings').doc(currentUser.email).get();
        if (doc.exists) {
            const data = doc.data();
            if (data.phone) document.getElementById('cust-phone').value = data.phone;
            if (data.preferredPayment) document.getElementById('cust-payment').value = data.preferredPayment;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// ========== CUSTOMER STATS ==========

async function loadCustomerStats() {
    if (!db) return;

    try {
        const ticketSnapshot = await db.collection('customer_tickets')
            .where('customerEmail', '==', currentUser.email)
            .get();

        document.getElementById('cust-total-tickets').textContent = ticketSnapshot.size;

        let spent = 0;
        ticketSnapshot.forEach(doc => {
            spent += doc.data().cost || 0;
        });
        document.getElementById('cust-total-spent').textContent = spent.toLocaleString() + ' ETB';
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}
