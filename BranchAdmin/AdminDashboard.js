// ============================================
// BRANCH ADMIN DASHBOARD (UNIFIED & FIXED)
// ============================================

class AdminDashboard {
    constructor(adminId) {
        this.adminId = adminId || window.currentUser?.email || localStorage.getItem('currentUserEmail') || '';
        
        if (this.adminId) {
            localStorage.setItem('currentAdminEmail', this.adminId);
            console.log(`✅ AdminDashboard - Admin Email: ${this.adminId}`);
        }

        // Initialize child components properly matching the second template's structure
        this.bookings = new AdminBookAppointment(this.adminId);
        
        if (typeof AdminCustomers === 'function') this.customers = new AdminCustomers(this.adminId);
        if (typeof AdminRanges === 'function') this.ranges = new Ranges(this.adminId);
        if (typeof AdminPayments === 'function') this.payments = new AdminPayments(this.adminId);
        if (typeof AdminAnalytics === 'function') this.analytics = new Analytics(this.adminId);
        if (typeof AdminTransactions === 'function') this.transactions = new Transactions(this.adminId);
        if (typeof AdminAuditLog === 'function') this.auditLog = new AuditLog(this.adminId);
        if (typeof AdminNotifications === 'function') this.notifications = new AdminNotifications(this.adminId);
        if (typeof AdminSettings === 'function') this.settings = new AdminSettings(this.adminId);

        window.adminLottery = new AdminLotteryDraw(this.adminId);
    }

    render() {
        return `
            <div id="branch-admin-dashboard" class="min-h-screen bg-black flex flex-col">
                <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-4 sm:px-6 py-4">
                    <div class="max-w-7xl mx-auto flex items-center justify-between">
                        <h1 class="font-bold text-base sm:text-xl text-gradient">🛡️ BRANCH ADMIN CONTROL CENTER</h1>
                        <button onclick="logout()" class="px-3 sm:px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-xl">Logout</button>
                    </div>
                </header>
                
                <main class="flex-grow p-4 sm:p-6 overflow-y-auto">
                    <div class="max-w-7xl mx-auto space-y-6">
                        <h2 class="text-2xl sm:text-3xl font-bold text-white">Branch Control Center</h2>
                        
                        <!-- WINNING NUMBERS AUDIT WIDGET -->
                        <div class="glass-panel rounded-2xl p-5 border border-yellow-400/30 bg-yellow-400/5 space-y-3">
                            <h3 class="text-sm font-bold text-yellow-400 flex items-center gap-2">
                                🎯 Live Winning Numbers Audit Feed
                            </h3>
                            <div id="branch-winning-numbers-audit-feed" class="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs text-slate-300">
                                <p class="italic text-slate-500">Loading audit feed...</p>
                            </div>
                        </div>

                        <!-- TABS NAVIGATION -->
                        <div class="flex gap-2 border-b border-yellow-400/10 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                            <button onclick="window.branchAdminDashboard.switchTab('dashboard', event)" class="tab-button active px-3 sm:px-4 py-2 text-xs font-bold text-yellow-400">📊 Dashboard</button>
                            <button onclick="window.branchAdminDashboard.switchTab('customers', event)" class="tab-button px-3 sm:px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">👥 Customers</button>
                            <button onclick="window.branchAdminDashboard.switchTab('ranges', event)" class="tab-button px-3 sm:px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📊 Ranges</button>
                            <button onclick="window.branchAdminDashboard.switchTab('payments', event)" class="tab-button px-3 sm:px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">💳 Payments</button>
                            <button onclick="window.branchAdminDashboard.switchTab('analytics', event)" class="tab-button px-3 sm:px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📈 Analytics</button>
                            <button onclick="window.branchAdminDashboard.switchTab('transactions', event)" class="tab-button px-3 sm:px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">📋 Transactions</button>
                            <button onclick="window.branchAdminDashboard.switchTab('auditlog', event)" class="tab-button px-3 sm:px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">🔒 Audit</button>                         
                            <button onclick="window.branchAdminDashboard.switchTab('bookings', event)" class="tab-button px-3 sm:px-4 py-2 text-xs font-bold text-slate-400 hover:text-white relative">
                                📅 Bookings <span id="badge-branch-bookings" class="hidden absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                            </button>
                            <button onclick="window.branchAdminDashboard.switchTab('notifications', event)" class="tab-button px-3 sm:px-4 py-2 text-xs font-bold text-slate-400 hover:text-white relative">
                                📢 Notify <span id="badge-branch-notifications" class="hidden absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                            </button>
                            <button onclick="window.branchAdminDashboard.switchTab('settings', event)" class="tab-button px-3 sm:px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">⚙️ Settings</button>
                        </div>
                       
                        <!-- TAB CONTENTS -->
                        <div id="branch-dashboard" class="tab-content active space-y-6">
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div class="glass-panel rounded-2xl p-5 sm:p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Branch Customers</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-blue-400 mt-2" id="branch-total-customers">0</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-5 sm:p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Branch Tickets</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-emerald-400 mt-2" id="branch-total-tickets">0</p>
                                </div>
                                <div class="glass-panel rounded-2xl p-5 sm:p-6 border border-yellow-400/10">
                                    <p class="text-xs text-slate-400">Branch Revenue</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-purple-400 mt-2" id="branch-total-revenue">0 ETB</p>
                                </div>
                            </div>

                            ${window.adminLottery ? window.adminLottery.render() : ''}
                        </div>

                        <div id="branch-bookings" class="tab-content" style="display: none;"></div>
                        <div id="branch-customers" class="tab-content" style="display: none;"></div>
                        <div id="branch-ranges" class="tab-content" style="display: none;"></div>
                        <div id="branch-payments" class="tab-content" style="display: none;"></div>
                        <div id="branch-analytics" class="tab-content" style="display: none;"></div>
                        <div id="branch-transactions" class="tab-content" style="display: none;"></div>
                        <div id="branch-auditlog" class="tab-content" style="display: none;"></div>
                        <div id="branch-notifications" class="tab-content" style="display: none;"></div>
                        <div id="branch-settings" class="tab-content" style="display: none;"></div>
                    </div>
                </main>
            </div>
        `;
    }

    async loadData() {
        try {
            await Promise.all([
                this.customers?.loadData ? this.customers.loadData() : Promise.resolve(),
                this.ranges?.loadData ? this.ranges.loadData() : Promise.resolve(),
                this.payments?.loadData ? this.payments.loadData() : Promise.resolve(),
                this.analytics?.loadData ? this.analytics.loadData() : Promise.resolve(),
                this.transactions?.loadData ? this.transactions.loadData() : Promise.resolve(),
                this.auditLog?.loadData ? this.auditLog.loadData() : Promise.resolve(),
                this.notifications?.loadData ? this.notifications.loadData() : Promise.resolve(),
                this.settings?.loadData ? this.settings.loadData() : Promise.resolve(),
                this.bookings?.loadData ? this.bookings.loadData() : Promise.resolve()
            ]);   

            if (window.adminLottery) {
                await window.adminLottery.init();
            }
            
            this.loadTabs(); 
            await this.updateDashboardStats();
            this.initWinningAuditListener();
        } catch (error) {
            console.error('Error loading branch data:', error);
        }
    }

    initWinningAuditListener() {
        if (!db) return;
        db.collection('lottery_draws').orderBy('drawnAt', 'desc').limit(5).onSnapshot(snapshot => {
            const feedContainer = document.getElementById('branch-winning-numbers-audit-feed');
            if (!feedContainer) return;
            if (snapshot.empty) {
                feedContainer.innerHTML = `<p class="italic text-slate-500">No winning numbers audited yet.</p>`;
                return;
            }
            let html = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.drawnAt?.toDate ? data.drawnAt.toDate().toLocaleString() : 'Just now';
                html += `
                    <div class="bg-black/40 border border-yellow-400/20 rounded-lg p-2.5 flex justify-between items-center text-xs">
                        <div>
                            <span class="text-yellow-400 font-bold">Winning Number: #${data.winningNumber}</span> — Winner: <span class="text-white">${data.winnerName || 'N/A'}</span> (${data.winnerPhone || 'N/A'})
                        </div>
                        <span class="text-[10px] text-slate-400">${date}</span>
                    </div>
                `;
            });
            feedContainer.innerHTML = html;
        });
    }

    loadTabs() {
        try {
            const bookingsContent = document.getElementById('branch-bookings');
            const customersContent = document.getElementById('branch-customers');
            const rangesContent = document.getElementById('branch-ranges');
            const paymentsContent = document.getElementById('branch-payments');
            const analyticsContent = document.getElementById('branch-analytics');
            const transactionsContent = document.getElementById('branch-transactions');
            const auditlogContent = document.getElementById('branch-auditlog');
            const notificationsContent = document.getElementById('branch-notifications');
            const settingsContent = document.getElementById('branch-settings');
            
            if (bookingsContent) bookingsContent.innerHTML = this.bookings.render() instanceof Promise ? '' : this.bookings.render();
            if (customersContent && this.customers?.render) customersContent.innerHTML = this.customers.render();
            if (rangesContent && this.ranges?.render) rangesContent.innerHTML = this.ranges.render();
            if (paymentsContent && this.payments?.render) paymentsContent.innerHTML = this.payments.render();
            if (analyticsContent && this.analytics?.render) analyticsContent.innerHTML = this.analytics.render();
            if (transactionsContent && this.transactions?.render) transactionsContent.innerHTML = this.transactions.render();
            if (auditlogContent && this.auditLog?.render) auditlogContent.innerHTML = this.auditLog.render();
            if (notificationsContent && this.notifications?.render) notificationsContent.innerHTML = this.notifications.render();
            if (settingsContent && this.settings?.render) settingsContent.innerHTML = this.settings.render();
        } catch (error) {
            console.error('Error in branch loadTabs:', error);
        }
    }

    async updateDashboardStats() {
        try {
            if (!db) return;
            const branchId = this.adminId || currentUser?.email || 'branch_default';

            const manualSnapshot = await db.collection('admin_customers')
                .where('adminEmail', '==', branchId)
                .get();

            const selfRegisteredSnapshot = await db.collection('customer_settings')
                .where('preferredAdmin', '==', branchId)
                .get();

            const totalCustomersCount = manualSnapshot.size + selfRegisteredSnapshot.size;
            const customersEl = document.getElementById('branch-total-customers');
            if (customersEl) customersEl.textContent = totalCustomersCount;

            const ticketSnapshot = await db.collection('customer_tickets')
                .where('adminEmail', '==', branchId)
                .get();
            
            const ticketsEl = document.getElementById('branch-total-tickets');
            if (ticketsEl) ticketsEl.textContent = ticketSnapshot.size;

            let revenue = 0;
            ticketSnapshot.forEach(doc => {
                revenue += doc.data().cost || 0;
            });

            const revenueEl = document.getElementById('branch-total-revenue');
            if (revenueEl) revenueEl.textContent = revenue.toLocaleString() + ' ETB';
        } catch (error) {
            console.error('Error updating branch dashboard stats:', error);
        }
    }

    switchTab(tabName, event) {
        const tabElements = document.querySelectorAll('.tab-content');
        tabElements.forEach(el => {
            el.style.display = 'none';
        });

        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.color = '';
        });

        // Handle target tab id mapping
        let targetId = `branch-${tabName}`;
        if (tabName === 'dashboard') targetId = 'branch-dashboard';
        
        const tab = document.getElementById(targetId);
        if (tab) {
            tab.style.display = 'block';
            tab.classList.add('active');
        }

        if (event && event.target) {
            event.target.classList.add('active');
            event.target.style.color = '#FCD34D';
        }
    }
}
