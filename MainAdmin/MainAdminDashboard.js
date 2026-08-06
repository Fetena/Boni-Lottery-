// ============================================
// MAIN ADMIN DASHBOARD - MOBILE OPTIMIZED
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
        
        window.mainAdminLottery = new MainAdminLotteryDraw();
    }

    render() {
        return `
            <div id="main-admin-dashboard" class="min-h-screen bg-black flex flex-col">
                <!-- Mobile-friendly Header -->
                <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-3 sm:px-6 py-3 sm:py-4">
                    <div class="flex items-center justify-between gap-2">
                        <h1 class="font-bold text-base sm:text-xl text-gradient truncate">👑 MAIN ADMIN</h1>
                        <button onclick="logout()" class="px-2 sm:px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-950/50">Logout</button>
                    </div>
                </header>

                <!-- Responsive Tabs (Horizontal Scroll on Mobile) -->
                <div class="sticky top-12 sm:top-16 z-30 w-full glass-panel border-b border-yellow-400/10 px-0 py-0 overflow-x-auto scrollbar-none">
                    <div class="flex gap-1 sm:gap-2 px-3 sm:px-6 py-2 whitespace-nowrap min-w-min">
                        <button onclick="window.mainAdminDashboard.switchTab('dashboard', event)" class="tab-button active px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-yellow-400">📊 Dashboard</button>
                        <button onclick="window.mainAdminDashboard.switchTab('admins', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">🛡️ Admins</button>
                        <button onclick="window.mainAdminDashboard.switchTab('customers', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">👥 Customers</button>
                        <button onclick="window.mainAdminDashboard.switchTab('ranges', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">📊 Ranges</button>
                        <button onclick="window.mainAdminDashboard.switchTab('payments', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">💳 Payments</button>
                        <button onclick="window.mainAdminDashboard.switchTab('analytics', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">📈 Analytics</button>
                        <button onclick="window.mainAdminDashboard.switchTab('transactions', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">📋 Trans</button>
                        <button onclick="window.mainAdminDashboard.switchTab('auditlog', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">🔒 Audit</button>
                        <button onclick="window.mainAdminDashboard.switchTab('bookings', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white relative">
                            📅 Bookings <span id="badge-main-bookings" class="hidden absolute -top-1 -right-0 px-1 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                        </button>
                        <button onclick="window.mainAdminDashboard.switchTab('notifications', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white relative">
                            📢 Notify <span id="badge-main-notifications" class="hidden absolute -top-1 -right-0 px-1 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                        </button>
                        <button onclick="window.mainAdminDashboard.switchTab('settings', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">⚙️ Settings</button>
                    </div>
                </div>

                <!-- Main Content Area (Scrollable) -->
                <main class="flex-grow overflow-y-auto p-3 sm:p-6">
                    <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                        <h2 class="text-xl sm:text-3xl font-bold text-white">System Control Center</h2>

                        <!-- Dashboard Tab -->
                        <div id="main-dashboard" class="tab-content active space-y-4 sm:space-y-6">
                            <!-- Quick Stats (Mobile: 1 col, Tablet: 2 col, Desktop: 4 col) -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                                    <p class="text-xs sm:text-sm text-slate-400">Total Admins</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-yellow-400 mt-2" id="total-admins">0</p>
                                </div>
                                <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                                    <p class="text-xs sm:text-sm text-slate-400">Total Customers</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-blue-400 mt-2" id="total-customers">0</p>
                                </div>
                                <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                                    <p class="text-xs sm:text-sm text-slate-400">Total Tickets</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-emerald-400 mt-2" id="total-tickets">0</p>
                                </div>
                                <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                                    <p class="text-xs sm:text-sm text-slate-400">Platform Revenue</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-purple-400 mt-2" id="total-revenue">0 ETB</p>
                                </div>
                            </div>

                            <!-- Render Independent Lottery Draw Component -->
                            ${window.mainAdminLottery ? window.mainAdminLottery.render() : ''}
                        </div>

                        <!-- Tab Contents (Hidden Initially) -->
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

    async loadData() {
        try {
            console.log('📥 MainAdminDashboard: Starting loadData...');
            
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

            if (window.mainAdminLottery) {
                await window.mainAdminLottery.init();
            }
            
            this.loadTabs(); 
            await this.updateDashboardStats();
            notify('info', '✅ Data loaded successfully');
        } catch (error) {
            console.error('Error loading data:', error);
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

    async updateDashboardStats() {
        try {
            if (!db) {
                console.error('Database not initialized');
                return;
            }

            const adminsSnap = await db.collection('admins').get();
            const adminsEl = document.getElementById('total-admins');
            if (adminsEl) adminsEl.textContent = adminsSnap.size;

            const customersSnap = await db.collection('customers').get();
            const customersEl = document.getElementById('total-customers');
            if (customersEl) customersEl.textContent = customersSnap.size;

            const ticketsSnap = await db.collection('customer_tickets').get();
            const ticketsEl = document.getElementById('total-tickets');
            if (ticketsEl) ticketsEl.textContent = ticketsSnap.size;

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

        // Remove active from all buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const tab = document.getElementById(`main-${tabName}`);
        if (tab) {
            tab.style.display = 'block';
            tab.classList.add('active');
            console.log('✅ Tab shown:', tabName);
        }

        // Highlight button
        if (event && event.target) {
            event.target.classList.add('active');
        }

        // Scroll tabs to view on mobile
        if (event && event.target) {
            event.target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
}
