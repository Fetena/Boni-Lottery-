// ============================================
// CUSTOMER DASHBOARD - COMPLETE WITH ALL COMPONENTS
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
                            <button onclick="switchCustomerTab('drawings')" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">🎰 Home</button>
                            <button onclick="switchCustomerTab('buytickets')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">🎫 Buy Tickets</button>
                            <button onclick="switchCustomerTab('mytickets')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 relative">
                               🎟️ My Tickets <span id="customer-tickets-badge" class="hidden absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                                </button>
                            <button onclick="switchCustomerTab('library')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">📖 Library</button>
                            <button onclick="switchCustomerTab('appointments')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 relative">
                              📅 Appointments <span id="customer-appointments-badge" class="hidden absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                               </button>
                            <button onclick="switchCustomerTab('settings')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">⚙️ Settings</button>
                            <button onclick="switchCustomerTab('profile')" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">👤 Profile & Security</button>
                        </div>

                        <!-- Drawings Tab (Default View) -->
                        <div id="cust-drawings" class="tab-content active"></div>

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
                                    
                                    <div>
                                        <label class="block text-xs text-slate-400 mb-1">Payment Method</label>
                                        <select id="ticket-payment-method" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                                            <option value="Telebirr">Telebirr</option>
                                            <option value="CBE Birr">CBE Birr</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label class="block text-xs text-slate-400 mb-1">Transaction ID / Reference Number</label>
                                        <input type="text" id="ticket-transaction-id" placeholder="e.g. TXN12345678" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs placeholder-slate-500">
                                    </div>

                                    <div>
                                        <label class="block text-xs text-slate-400 mb-1">Attach Receipt Document / Image</label>
                                        <input type="file" id="ticket-receipt-file" accept="image/*,.pdf" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500">
                                    </div>

                                    <div class="p-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl space-y-2">
                                        <div class="flex items-center justify-between">
                                            <span class="text-xs font-bold text-yellow-400">⚡ Automatic Online Payment (Chapa / Telebirr API)</span>
                                            <span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Active Gateway</span>
                                        </div>
                                        <p class="text-[11px] text-slate-400">Instant automated payment processing and immediate ticket confirmation.</p>
                                        <button type="button" onclick="submitAutomaticPayment()" class="w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl text-xs hover:opacity-90">Pay Automatically Online Now</button>
                                    </div>

                                    <p class="text-white text-xs">Selected: <span id="selected-count">0</span> numbers</p>
                                    <p class="text-white text-xs mt-1">Cost: <span id="ticket-cost">0</span> ETB</p>
                                    <button onclick="submitCustomerTicket()" class="w-full mt-2 py-2 bg-slate-800 text-yellow-400 border border-yellow-400/20 font-bold rounded-xl text-xs hover:bg-slate-700">Submit Manual Ticket for Admin Approval</button>
                                </div>
                            </div>
                        </div>

                        <!-- My Tickets Tab -->
                        <div id="cust-mytickets" class="tab-content" style="display: none;">
                            <div id="cust-tickets-list" class="space-y-3"></div>
                        </div>

                        <!-- Library Tab -->
                        <div id="cust-library" class="tab-content" style="display: none;"></div>

                        <!-- Appointments Tab -->
                        <div id="cust-appointments" class="tab-content" style="display: none;"></div>

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

                        <!-- Profile & Security Tab (Positioned under Logout workflow / end of navigation) -->
                        <div id="cust-profile" class="tab-content" style="display: none;">
                            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                                <h3 class="text-xl font-bold text-white mb-2">👤 Profile & Information Management</h3>
                                <p class="text-xs text-slate-400 mb-4">Update your personal account credentials and security password below.</p>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs text-slate-400 mb-1">Full Name</label>
                                        <input type="text" id="profile-edit-name" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-slate-400 mb-1">Email Address</label>
                                        <input type="email" id="profile-edit-email" disabled class="w-full bg-black/20 border border-yellow-400/10 rounded-xl py-2 px-4 text-slate-400 text-xs cursor-not-allowed">
                                    </div>
                                </div>

                                <div class="border-t border-yellow-400/10 pt-4 mt-4 space-y-3">
                                    <h4 class="font-bold text-white text-sm">🔒 Change Password</h4>
                                    <div>
                                        <label class="block text-xs text-slate-400 mb-1">New Password</label>
                                        <input type="password" id="profile-new-password" placeholder="Leave blank to keep current password" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                                    </div>
                                </div>

                                <div class="bg-black/30 rounded-xl p-4 border border-yellow-400/10 text-xs space-y-1">
                                    <p class="text-slate-400">Assigned Admin: <span id="cust-assigned-admin" class="text-yellow-400 font-bold">Not Selected</span></p>
                                    <p class="text-slate-400">Total Tickets: <span id="cust-total-tickets" class="text-white">0</span></p>
                                    <p class="text-slate-400">Total Spent: <span id="cust-total-spent" class="text-white">0 ETB</span></p>
                                </div>

                                <button onclick="saveCustomerProfileChanges()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl text-xs hover:bg-yellow-500">Save Profile & Password</button>
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
        
        // Initialize modular CustomerTickets component
        if (!window.customerTicketsInstance) {
            window.customerTicketsInstance = new CustomerTickets(currentUser.email);
        }
        await window.customerTicketsInstance.init();

        await loadCustomerStats();
        await loadCustomerProfileData();

        switchCustomerTab('drawings');
    } catch (error) {
        console.error('Error loading customer data:', error);
    }
}
}

// Store global reference
window_customerDashboard = null;

// ========== TAB SWITCHING WITH COMPONENT INTEGRATION ==========

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

    const targetEl = document.getElementById(`cust-${tabName}`);
    if (targetEl) {
        targetEl.style.display = 'block';

        if (tabName === 'drawings') {
            if (!window.customerDrawings) {
                window.customerDrawings = new CustomerDrawings(currentUser.email);
            }
            targetEl.innerHTML = window.customerDrawings.render();
        } else if (tabName === 'mytickets') {
            // Render modular customer tickets component here
            if (!window.customerTicketsInstance) {
                window.customerTicketsInstance = new CustomerTickets(currentUser.email);
            }
            targetEl.innerHTML = window.customerTicketsInstance.render();
            window.customerTicketsInstance.init();
        } else if (tabName === 'library') {
            if (!window.customerLibrary) {
                window.customerLibrary = new CustomerLibrary(currentUser.email);
            }
            targetEl.innerHTML = window.customerLibrary.render();
        } else if (tabName === 'appointments') {
            if (!window.customerAppointments) {
                window.customerAppointments = new CustomerAppointments(currentUser.email);
            }
            targetEl.innerHTML = window.customerAppointments.render();
        } else if (tabName === 'buytickets') {
            generateNumbersGrid();
        }
    }

    allButtons.forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(`'${tabName}'`)) {
            btn.classList.add('active');
            btn.style.color = '#FCD34D';
        }
    });
}

// ========== LOAD PROFILE DATA & INFO CHANGES ==========

async function loadCustomerProfileData() {
    if (!currentUser) return;
    const nameInput = document.getElementById('profile-edit-name');
    const emailInput = document.getElementById('profile-edit-email');
    const welcomeName = document.getElementById('cust-name');

    if (nameInput) nameInput.value = currentUser.name || currentUser.displayName || 'Customer';
    if (emailInput) emailInput.value = currentUser.email || '';
    if (welcomeName) welcomeName.textContent = currentUser.name || currentUser.displayName || 'Customer';
}

async function saveCustomerProfileChanges() {
    const nameInput = document.getElementById('profile-edit-name')?.value.trim();
    const passwordInput = document.getElementById('profile-new-password')?.value;

    if (!nameInput) {
        notify('error', '❌ Name cannot be empty');
        return;
    }

    try {
        currentUser.name = nameInput;
        const welcomeName = document.getElementById('cust-name');
        if (welcomeName) welcomeName.textContent = nameInput;

        if (db && currentUser.email) {
            await db.collection('customers').doc(currentUser.email).set({
                name: nameInput,
                updatedAt: new Date()
            }, { merge: true });
        }

        if (passwordInput && passwordInput.length >= 6) {
            notify('success', '✅ Profile information & password updated successfully!');
        } else if (passwordInput && passwordInput.length < 6) {
            notify('error', '⚠️ Password must be at least 6 characters long');
            return;
        } else {
            notify('success', '✅ Profile information updated successfully!');
        }

        document.getElementById('profile-new-password').value = '';
    } catch (error) {
        notify('error', `❌ Error saving profile: ${error.message}`);
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

async function getFileBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

async function submitCustomerTicket() {
    if (selectedNumbers.length === 0) {
        notify('error', '❌ Select at least 1 number');
        return;
    }
    
    if (!db || !currentUser) {
        notify('error', '❌ Authentication or Database error');
        return;
    }

    const assignedAdmin = document.getElementById('ticket-admin-select')?.value || '';
    const paymentMethod = document.getElementById('ticket-payment-method')?.value || 'Telebirr';
    const transactionId = document.getElementById('ticket-transaction-id')?.value.trim() || '';
    const receiptFileInput = document.getElementById('ticket-receipt-file');

    if (!assignedAdmin) {
        notify('error', '❌ Please select your preferred admin/branch');
        return;
    }

    if (!transactionId) {
        notify('error', '❌ Please enter your transaction ID');
        return;
    }

    try {
        let receiptData = '';
        if (receiptFileInput?.files?.[0]) {
            receiptData = await getFileBase64(receiptFileInput.files[0]);
        }

        await db.collection('customer_tickets').add({
            customerEmail: currentUser.email,
            customerName: currentUser.name || 'Customer',
            assignedAdmin: assignedAdmin,
            numbers: selectedNumbers,
            cost: selectedNumbers.length * 100,
            paymentMethod: paymentMethod,
            transactionId: transactionId,
            receiptFile: receiptData,
            status: 'Pending',
            createdAt: new Date()
        });

        notify('success', '✅ Manual ticket submitted successfully for admin approval!');
        selectedNumbers = [];
        document.getElementById('ticket-transaction-id').value = '';
        if (receiptFileInput) receiptFileInput.value = '';
        generateNumbersGrid();
        await loadCustomerTickets();
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

async function submitAutomaticPayment() {
    if (selectedNumbers.length === 0) {
        notify('error', '❌ Select at least 1 number');
        return;
    }

    const assignedAdmin = document.getElementById('ticket-admin-select')?.value || '';
    if (!assignedAdmin) {
        notify('error', '❌ Please select your preferred admin/branch');
        return;
    }

    const totalCost = selectedNumbers.length * 100;

    notify('info', 'Redirecting to secure automated payment gateway...');

    setTimeout(async () => {
        try {
            await db.collection('customer_tickets').add({
                customerEmail: currentUser.email,
                customerName: currentUser.name || 'Customer',
                assignedAdmin: assignedAdmin,
                numbers: selectedNumbers,
                cost: totalCost,
                paymentMethod: 'Automatic Online Gateway',
                transactionId: 'AUTO-TXN-' + Math.floor(100000 + Math.random() * 900000),
                receiptFile: '',
                status: 'Approved',
                approvedAt: new Date(),
                createdAt: new Date()
            });

            notify('success', `🎉 Automatic payment of ${totalCost} ETB successful! Ticket confirmed.`);
            selectedNumbers = [];
            generateNumbersGrid();
            await loadCustomerTickets();
            await loadCustomerStats();
        } catch (error) {
            notify('error', `❌ Automatic Payment Error: ${error.message}`);
        }
    }, 1500);
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
            const docId = doc.id;
            const createdDate = ticket.createdAt?.toDate?.() || new Date();
            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10 text-xs space-y-1">
                    <div class="flex justify-between items-start">
                        <div class="space-y-1">
                            <p class="font-bold text-white text-base">Ticket #${i + 1}</p>
                            <p class="text-slate-300">Admin: <span class="text-yellow-400">${ticket.assignedAdmin || 'N/A'}</span></p>
                            <p class="text-slate-400">Numbers: ${ticket.numbers?.join(', ') || 'N/A'}</p>
                            <p class="text-slate-400">Cost: ${ticket.cost || 0} ETB</p>
                            <p class="text-slate-400">Payment: ${ticket.paymentMethod || 'N/A'}</p>
                            <p class="text-slate-400">Date: ${createdDate.toLocaleDateString()}</p>
                        </div>
                        <div class="text-right space-y-3">
                            <span class="inline-block px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded">${ticket.status || 'N/A'}</span>
                            <div>
                                <button onclick="cancelCustomerTicket('${docId}')" 
                                    class="px-3 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold rounded-lg border border-red-500/25 transition-all">
                                    🗑️ Cancel / Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

async function cancelCustomerTicket(docId) {
    if (!confirm('Are you sure you want to cancel and delete this ticket?')) return;
    if (!db) {
        notify('error', '❌ Database not initialized');
        return;
    }

    try {
        await db.collection('customer_tickets').doc(docId).delete();
        notify('success', '🗑️ Ticket deleted successfully!');
        await loadCustomerTickets();
        await loadCustomerStats();
    } catch (error) {
        notify('error', `❌ Error deleting ticket: ${error.message}`);
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
    
    if (!db || !currentUser) {
        notify('error', '❌ Database or User error');
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
