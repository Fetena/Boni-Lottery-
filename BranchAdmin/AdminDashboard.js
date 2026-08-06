// ============================================
// ADMIN DASHBOARD - MOBILE OPTIMIZED
// ============================================

class AdminDashboard {
    constructor(adminId) {
        // CRITICAL FIX: Use the ACTUAL admin email from currentUser or param
        this.adminId = adminId || window.currentUser?.email || localStorage.getItem('currentUserEmail') || localStorage.getItem('currentAdminEmail') || '';
        
        // IMPORTANT: Save to localStorage so AdminNotifications can access it
        if (this.adminId) {
            localStorage.setItem('currentAdminEmail', this.adminId);
            console.log(`✅ AdminDashboard - Admin Email: ${this.adminId}`);
        }
        
        window.adminLottery = new AdminLotteryDraw(this.adminId);
    }

    render() {
        return `
            <div id="admin-dashboard" class="min-h-screen bg-black flex flex-col">
                <!-- Mobile-friendly Header -->
                <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-3 sm:px-6 py-3 sm:py-4">
                    <div class="flex items-center justify-between gap-2">
                        <h1 class="font-bold text-base sm:text-xl text-gradient truncate">🛡️ ADMIN PANEL</h1>
                        <button onclick="logout()" class="px-2 sm:px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-950/50">Logout</button>
                    </div>
                </header>

                <!-- Responsive Tabs (Horizontal Scroll on Mobile) -->
                <div class="sticky top-12 sm:top-16 z-30 w-full glass-panel border-b border-yellow-400/10 px-0 py-0 overflow-x-auto scrollbar-none">
                    <div class="flex gap-1 sm:gap-2 px-3 sm:px-6 py-2 whitespace-nowrap min-w-min">
                        <button onclick="window.adminDashboard.switchTab('dashboard', event)" class="tab-button active px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-yellow-400">📊 Dashboard</button>
                        <button onclick="window.adminDashboard.switchTab('tickets', event)" class="tab-button px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">🎫 Tickets</button>
                        <button onclick="window.adminDashboard.switchTab('appointments', event)" class="tab-button px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">📅 Appointments</button>
                        <button onclick="window.adminDashboard.switchTab('notifications', event)" class="tab-button px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white relative">
                            🔔 Notify <span id="badge-admin-notifications" class="hidden absolute -top-1 -right-0 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold">0</span>
                        </button>
                        <button onclick="window.adminDashboard.switchTab('payments', event)" class="tab-button px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">💳 Payments</button>
                        <button onclick="window.adminDashboard.switchTab('settings', event)" class="tab-button px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">⚙️ Settings</button>
                    </div>
                </div>

                <!-- Main Content Area (Scrollable) -->
                <main class="flex-grow overflow-y-auto p-3 sm:p-6">
                    <div class="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                        <!-- Dashboard Tab -->
                        <div id="admin-dashboard" class="tab-content active space-y-4 sm:space-y-6">
                            <!-- Quick Stats (Mobile: 1 col, Tablet: 2 col, Desktop: 4 col) -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                                    <p class="text-xs sm:text-sm text-slate-400">Pending Approvals</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-yellow-400 mt-2" id="pending-count">0</p>
                                </div>
                                <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                                    <p class="text-xs sm:text-sm text-slate-400">Approved Tickets</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-emerald-400 mt-2" id="approved-count">0</p>
                                </div>
                                <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                                    <p class="text-xs sm:text-sm text-slate-400">Total Revenue</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-purple-400 mt-2" id="revenue-count">0 ETB</p>
                                </div>
                                <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                                    <p class="text-xs sm:text-sm text-slate-400">My Customers</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-blue-400 mt-2" id="customer-count">0</p>
                                </div>
                            </div>

                            <!-- Chart Section -->
                            ${window.adminLottery ? window.adminLottery.render() : '<p class="text-slate-400">Loading...</p>'}
                        </div>

                        <!-- Tab Contents (Hidden Initially) -->
                        <div id="admin-tickets" class="tab-content" style="display: none;"></div>
                        <div id="admin-appointments" class="tab-content" style="display: none;"></div>
                        <div id="admin-notifications" class="tab-content" style="display: none;"></div>
                        <div id="admin-payments" class="tab-content" style="display: none;"></div>
                        <div id="admin-settings" class="tab-content" style="display: none;"></div>
                    </div>
                </main>
            </div>
        `;
    }

    async loadData() {
        try {
            console.log('📥 AdminDashboard: Starting loadData...');

            // Load all components in parallel
            await Promise.all([
                this.loadTickets(),
                this.loadAppointments(),
                this.loadPayments(),
                this.loadSettings(),
                this.loadNotifications()
            ]);

            if (window.adminLottery) {
                await window.adminLottery.init();
            }

            this.loadTabs();
            this.updateDashboardStats();
            notify('info', '✅ Dashboard loaded');
        } catch (error) {
            console.error('❌ Error loading admin dashboard:', error);
        }
    }

    async loadTickets() {
        try {
            if (!window.adminTickets) {
                window.adminTickets = new AdminTickets(this.adminId);
            }
        } catch (e) {
            console.error('Error loading tickets:', e);
        }
    }

    async loadAppointments() {
        try {
            if (!window.adminAppointments) {
                window.adminAppointments = new AdminAppointments(this.adminId);
            }
        } catch (e) {
            console.error('Error loading appointments:', e);
        }
    }

    async loadPayments() {
        try {
            if (!window.adminPayments) {
                window.adminPayments = new AdminPayments(this.adminId);
            }
        } catch (e) {
            console.error('Error loading payments:', e);
        }
    }

    async loadSettings() {
        try {
            if (!window.adminSettings) {
                window.adminSettings = new AdminSettings(this.adminId);
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }

    async loadNotifications() {
        try {
            // FIXED: Always pass the CURRENT admin's email, not cached instance
            if (!window.adminNotifications || window.adminNotifications.adminId !== this.adminId) {
                window.adminNotifications = new AdminNotifications(this.adminId);
                console.log(`✅ Created AdminNotifications for: ${this.adminId}`);
            }
        } catch (e) {
            console.error('Error loading notifications:', e);
        }
    }

    loadTabs() {
        try {
            const ticketsContent = document.getElementById('admin-tickets');
            const appointmentsContent = document.getElementById('admin-appointments');
            const notificationsContent = document.getElementById('admin-notifications');
            const paymentsContent = document.getElementById('admin-payments');
            const settingsContent = document.getElementById('admin-settings');

            if (ticketsContent && window.adminTickets) {
                ticketsContent.innerHTML = window.adminTickets.render();
            }
            if (appointmentsContent && window.adminAppointments) {
                appointmentsContent.innerHTML = window.adminAppointments.render();
            }
            if (notificationsContent && window.adminNotifications) {
                notificationsContent.innerHTML = window.adminNotifications.render();
            }
            if (paymentsContent && window.adminPayments) {
                paymentsContent.innerHTML = window.adminPayments.render();
            }
            if (settingsContent && window.adminSettings) {
                settingsContent.innerHTML = window.adminSettings.render();
            }

            console.log('✅ All tabs loaded');
        } catch (error) {
            console.error('Error in loadTabs:', error);
        }
    }

    async updateDashboardStats() {
        try {
            if (!db || !this.adminId) return;

            // Get this admin's customers
            const customersSnap = await db.collection('admin_customers')
                .where('adminEmail', '==', this.adminId)
                .get();
            
            const customerEmails = customersSnap.docs.map(doc => doc.data().email);
            const customerEl = document.getElementById('customer-count');
            if (customerEl) customerEl.textContent = customerEmails.length;

            // Get tickets from this admin's customers
            let pending = 0, approved = 0, revenue = 0;
            
            for (const custEmail of customerEmails) {
                const ticketsSnap = await db.collection('customer_tickets')
                    .where('customerEmail', '==', custEmail)
                    .get();

                ticketsSnap.forEach(doc => {
                    const data = doc.data();
                    revenue += data.cost || 0;
                    if (data.status === 'pending') pending++;
                    if (data.status === 'approved') approved++;
                });
            }

            const pendingEl = document.getElementById('pending-count');
            const approvedEl = document.getElementById('approved-count');
            const revenueEl = document.getElementById('revenue-count');

            if (pendingEl) pendingEl.textContent = pending;
            if (approvedEl) approvedEl.textContent = approved;
            if (revenueEl) revenueEl.textContent = revenue.toLocaleString() + ' ETB';
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    switchTab(tabName, event) {
        console.log('🔀 Switching to tab:', tabName);
        
        // Hide all tabs
        const tabElements = document.querySelectorAll('[id^="admin-"]');
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
        const tab = document.getElementById(`admin-${tabName}`);
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
