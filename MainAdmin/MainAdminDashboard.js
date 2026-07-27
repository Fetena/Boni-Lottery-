// ============================================
// MAIN ADMIN DASHBOARD (PARENT COMPONENT) - FIXED v2
// Complete with Firestore integration
// ============================================

class MainAdminDashboard {
    constructor() {
        // Initialize ALL child components
        this.admins = new Admins();
        this.bookings = new MainAdminBookings();
        this.customers = new Customers();
        this.ranges = new Ranges();
        this.payments = new Payments();
        this.analytics = new Analytics();
        this.transactions = new Transactions();
        this.auditLog = new AuditLog();
        this.notifications = new Notifications();
        this.settings = new Settings();
    }

    render() {
        return `
            <div id="main-admin-dashboard" class="min-h-screen bg-black flex flex-col">
                <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-6 py-4">
                    <div class="max-w-7xl mx-auto flex items-center justify-between">
                        <h1 class="font-bold text-xl text-gradient">👑 MAIN ADMIN DASHBOARD</h1>
                        <button onclick="logout()" class="px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-xl">Logout</button>
                    </div>
                </header>
                
                <main class="flex-grow p-6 overflow-y-auto">
                    <div class="max-w-7xl mx-auto space-y-6">
                        <h2 class="text-3xl font-bold text-white">System Control Center</h2>
                        
                        <!-- TABS -->
                        <div class="flex gap-2 border-b border-yellow-400/10 pb-2 overflow-x-auto">
                            
                            <button onclick="window.mainAdminDashboard.switchTab('dashboard', event)" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">📊 Dashboard</button>
                            <button onclick="window.mainAdminDashboard.switchTab('admins', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🛡️ Admins</button>
                            <button onclick="window.mainAdminDashboard.switchTab('customers', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">👥 Customers</button>
                            <button onclick="window.mainAdminDashboard.switchTab('ranges', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📊 Ranges</button>
                            <button onclick="window.mainAdminDashboard.switchTab('payments', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">💳 Payments</button>
                            <button onclick="window.mainAdminDashboard.switchTab('analytics', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📈 Analytics</button>
                            <button onclick="window.mainAdminDashboard.switchTab('transactions', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📋 Transactions</button>
                            <button onclick="window.mainAdminDashboard.switchTab('auditlog', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🔒 Audit</button>                         
                            <button onclick="window.mainAdminDashboard.switchTab('bookings', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white relative">
                         📅 Bookings <span id="badge-main-bookings" class="hidden absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                                </button>
                            <button onclick="window.mainAdminDashboard.switchTab('notifications', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white relative">
                        📢 Notify <span id="badge-main-notifications" class="hidden absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                               </button>
                            <button onclick="window.mainAdminDashboard.switchTab('settings', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">⚙️ Settings</button>
                        </div>
                       

                        <!-- TAB CONTENTS -->
                        
                        <div id="main-dashboard" class="tab-content active space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Admins</p>
                                    <p class="text-3xl font-bold text-yellow-400 mt-2" id="total-admins">0</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Customers</p>
                                    <p class="text-3xl font-bold text-blue-400 mt-2" id="total-customers">0</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Total Tickets</p>
                                    <p class="text-3xl font-bold text-emerald-400 mt-2" id="total-tickets">0</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Platform Revenue</p>
                                    <p class="text-3xl font-bold text-purple-400 mt-2" id="total-revenue">0 ETB</p>
                                </div>
                            </div>
                        </div>
                        <div id="main-bookings" class="tab-content" style="display: none;"></div>
                        <div id="main-admins" class="tab-content" style="display: none;"></div>
                        <div id="main-customers" class="tab-content" style="display: none;"></div>
                        <div id="main-ranges" class="tab-content" style="display: none;"></div>
                        <div id="main-payments" class="tab-content" style="display: none;"></div>
                        <div id="main-analytics" class="tab-content" style="display: none;"></div>
                        <div id="main-transactions" class="tab-content" style="display: none;"></div>
                        <div id="main-auditlog" class="tab-content" style="display: none;"></div>
                        <div id="main-notifications" class="tab-content" style="display: none;"></div>
                        <div id="main-settings" class="tab-content" style="display: none;"></div>
                    </div>
                </main>
            </div>
        `;
    }
<!-- Dashboard Tab -->
                        <div id="admin-dashboard-tab" class="tab-content active space-y-4">
                            <!-- Compact Stat Cards -->
                            <div class="grid grid-cols-3 gap-3">
                                <div class="glass-panel rounded-xl p-3 border border-yellow-400/10">
                                    <p class="text-[10px] text-slate-400">Total Customers</p>
                                    <h3 id="admin-total-customers" class="text-xl font-bold text-blue-400 mt-0.5">0</h3>
                                </div>
                                <div class="glass-panel rounded-xl p-3 border border-yellow-400/10">
                                    <p class="text-[10px] text-slate-400">Total Tickets</p>
                                    <h3 id="admin-total-tickets" class="text-xl font-bold text-emerald-400 mt-0.5">0</h3>
                                </div>
                                <div class="glass-panel rounded-xl p-3 border border-yellow-400/10">
                                    <p class="text-[10px] text-slate-400">Total Revenue</p>
                                    <h3 id="admin-total-revenue" class="text-xl font-bold text-purple-400 mt-0.5">0 ETB</h3>
                                </div>
                            </div>

                            <!-- High-Visibility Lottery Draw Control Panel & Spinner -->
                            <div class="glass-panel rounded-2xl p-6 border-2 border-yellow-400/40 bg-gradient-to-b from-yellow-400/10 to-black space-y-4 text-center shadow-[0_0_25px_rgba(252,211,77,0.15)]">
                                <div>
                                    <span class="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">⚡ Live Draw Center</span>
                                    <h3 class="text-2xl font-black text-gradient mt-2">🎰 Branch Lucky Draw</h3>
                                    <p class="text-xs text-slate-300 mt-1">Spin the cryptographic wheel to randomly select a verified winner from your branch pool.</p>
                                </div>

                                <!-- Spinner Display Box -->
                                <div class="py-6 bg-black/60 rounded-xl border border-yellow-400/30 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent pointer-events-none"></div>
                                    <span class="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Winning Number Result</span>
                                    <div id="lottery-spinner-box" class="text-5xl font-black text-yellow-400 tracking-wider drop-shadow-[0_0_15px_rgba(252,211,77,0.6)]">---</div>
                                    <div id="winner-info-display" class="text-xs text-slate-300 mt-2 font-medium"></div>
                                </div>

                                <button onclick="runLotteryDraw(currentUser?.email)" class="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black rounded-xl text-sm shadow-lg hover:opacity-95 transform active:scale-95 transition-all">🎲 SPIN & DRAW WINNER NOW</button>
                            </div>
                        </div>
    async loadData() {
        try {
            console.log('📥 Starting loadData...');
            
            // 1. Run loadData for all child components
            await Promise.all([
                this.admins.loadData(),
                this.customers.loadData(),
                this.ranges.loadData(),
                this.payments.loadData(),
                this.analytics.loadData(),
                this.transactions.loadData(),
                this.auditLog.loadData(),
                this.notifications.loadData(),
                this.settings.loadData(),
                this.bookings.loadData()
            ]);   
            //document.getElementById('admin-list').innerHTML = this.admins.renderAdminsList();
        //document.getElementById('customers-list').innerHTML = this.customers.renderCustomersList();
        this.loadTabs(); 
        await this.updateDashboardStats();
        notify('info', '✅ Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);;
        }
    }

    loadTabs() {
        try {
            console.log('🔄 Loading tabs content...');
            const adminsContent = document.getElementById('main-admins');
            const customersContent = document.getElementById('main-customers');
            const rangesContent = document.getElementById('main-ranges');
            const paymentsContent = document.getElementById('main-payments');
            const analyticsContent = document.getElementById('main-analytics');
            const transactionsContent = document.getElementById('main-transactions');
            const auditlogContent = document.getElementById('main-auditlog');
            const notificationsContent = document.getElementById('main-notifications');
            const settingsContent = document.getElementById('main-settings');
            const bookingsContent = document.getElementById('main-bookings');
            if (bookingsContent) bookingsContent.innerHTML = this.bookings.render();
            if (bookingsContent) this.bookings.renderBookingsList();
            if (adminsContent) adminsContent.innerHTML = this.admins.render();
            if (customersContent) customersContent.innerHTML = this.customers.render();
            if (rangesContent) rangesContent.innerHTML = this.ranges.render();
            if (paymentsContent) paymentsContent.innerHTML = this.payments.render();
            if (analyticsContent) analyticsContent.innerHTML = this.analytics.render();
            if (transactionsContent) transactionsContent.innerHTML = this.transactions.render();
            if (auditlogContent) auditlogContent.innerHTML = this.auditLog.render();
            if (notificationsContent) notificationsContent.innerHTML = this.notifications.render();
            if (settingsContent) settingsContent.innerHTML = this.settings.render();
            
            console.log('✅ All tabs content loaded');
        } catch (error) {
            console.error('Error in loadTabs:', error);
        }
    }
async function runLotteryDraw(adminEmail = null) {
    if (!db) {
        return notify('error', '❌ Database not initialized');
    }

    try {
        let query = db.collection('customer_tickets').where('status', '==', 'Approved');
        const snapshot = await query.get();

        if (snapshot.empty) {
            return notify('error', '❌ No approved tickets found to draw from!');
        }

        let allAvailableNumbers = [];
        snapshot.forEach(doc => {
            const ticket = doc.data();
            if (!adminEmail || ticket.assignedAdmin === adminEmail) {
                if (ticket.numbers && Array.isArray(ticket.numbers)) {
                    ticket.numbers.forEach(num => {
                        allAvailableNumbers.push({ ticketId: doc.id, number: num, customer: ticket.customerName, email: ticket.customerEmail });
                    });
                }
            }
        });

        if (allAvailableNumbers.length === 0) {
            return notify('error', '❌ No active numbers available for this draw scope.');
        }

        const spinnerBox = document.getElementById('lottery-spinner-box');
        const winnerInfoBox = document.getElementById('winner-info-display');
        if (winnerInfoBox) winnerInfoBox.textContent = '';

        // Live Spinning Animation Loop
        let spinCount = 0;
        const maxSpins = 30;
        const spinInterval = setInterval(() => {
            const randomNum = Math.floor(Math.random() * 300) + 1;
            if (spinnerBox) spinnerBox.textContent = `#${randomNum}`;
            spinCount++;

            if (spinCount >= maxSpins) {
                clearInterval(spinInterval);

                // Select Final Winner
                const randomIndex = Math.floor(Math.random() * allAvailableNumbers.length);
                const winningSelection = allAvailableNumbers[randomIndex];

                if (spinnerBox) spinnerBox.textContent = `#${winningSelection.number}`;
                if (winnerInfoBox) {
                    winnerInfoBox.innerHTML = `🏆 Winner: <span class="text-yellow-400 font-bold">${winningSelection.customer}</span> (${winningSelection.email})`;
                }

                // Save to Firestore
                db.collection('lottery_draws').add({
                    winningNumber: winningSelection.number,
                    winningTicketId: winningSelection.ticketId,
                    winnerName: winningSelection.customer,
                    winnerEmail: winningSelection.email,
                    drawnBy: currentUser?.email || 'Admin',
                    scope: adminEmail ? `Branch: ${adminEmail}` : 'Global Main Admin',
                    drawnAt: new Date()
                });

                notify('success', `🎉 WINNING NUMBER DRAWN: #${winningSelection.number} (${winningSelection.customer})!`);
            }
        }, 60);

    } catch (error) {
        console.error('Draw error:', error);
        notify('error', `❌ Draw Error: ${error.message}`);
    }
}
    async updateDashboardStats() {
        try {
            if (!db) {
                console.error('Database not initialized');
                return;
            }

            // Count admins
            const adminsSnap = await db.collection('admins').get();
            const adminsEl = document.getElementById('total-admins');
            if (adminsEl) adminsEl.textContent = adminsSnap.size;

            // Count customers
            const customersSnap = await db.collection('customers').get();
            const customersEl = document.getElementById('total-customers');
            if (customersEl) customersEl.textContent = customersSnap.size;

            // Count tickets
            const ticketsSnap = await db.collection('customer_tickets').get();
            const ticketsEl = document.getElementById('total-tickets');
            if (ticketsEl) ticketsEl.textContent = ticketsSnap.size;

            // Calculate revenue
            let revenue = 0;
            ticketsSnap.forEach(doc => {
                revenue += doc.data().cost || 0;
            });
            const revenueEl = document.getElementById('total-revenue');
            if (revenueEl) revenueEl.textContent = revenue.toLocaleString() + ' ETB';
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    switchTab(tabName, event) {
        console.log('🔀 Switching to tab:', tabName);
        
        // Hide all tabs
        const tabElements = document.querySelectorAll('[id^="main-"]');
        tabElements.forEach(el => {
            if (el.classList && el.classList.contains('tab-content')) {
                el.style.display = 'none';
            }
        });

        // Deactivate all buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.color = '';
        });

        // Show selected tab
        const tab = document.getElementById(`main-${tabName}`);
        if (tab) {
            tab.style.display = 'block';
            tab.classList.add('active');
            console.log('✅ Tab shown:', tabName);
        } else {
            console.warn('⚠️ Tab not found:', `main-${tabName}`);
        }

        // Activate button
        if (event && event.target) {
            event.target.classList.add('active');
            event.target.style.color = '#FCD34D';
        }
    }
}
//window.mainAdminDashboard = new MainAdminDashboard();
// ⚠️ DO NOT CREATE INSTANCE HERE
// Let the HTML initialize it when needed
// window.mainAdminDashboard will be created in the login handler
