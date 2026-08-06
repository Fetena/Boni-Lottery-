// ============================================
// CUSTOMER DASHBOARD - MOBILE OPTIMIZED
// ============================================

class CustomerDashboard {
    constructor(custId) {
        const initialId = custId === 'DEFAULT' || !custId 
            ? (window.currentUser?.email || localStorage.getItem('currentUserEmail') || 'customer@email.com')
            : custId;

        this.custId = initialId;
        this.appointments = new CustomerAppointments(this.custId);
        this.tickets = new CustomerTickets(this.custId);
        this.library = new CustomerLibrary();
        this.drawings = new CustomerDrawings();
        this.profile = new CustomerProfile(this.custId);
        this.settings = new CustomerSettings(this.custId);
    }

    render() {
        return `
            <div id="customer-dashboard" class="min-h-screen bg-black flex flex-col">
                <!-- Mobile-friendly Header -->
                <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-3 sm:px-6 py-3 sm:py-4">
                    <div class="flex items-center justify-between gap-2">
                        <h1 class="font-bold text-base sm:text-xl text-gradient truncate">🎫 MY ACCOUNT</h1>
                        <button onclick="logout()" class="px-2 sm:px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-950/50">Logout</button>
                    </div>
                </header>

                <!-- Responsive Tabs (Horizontal Scroll on Mobile) -->
                <div class="sticky top-12 sm:top-16 z-30 w-full glass-panel border-b border-yellow-400/10 px-0 py-0 overflow-x-auto scrollbar-none">
                    <div class="flex gap-1 sm:gap-2 px-3 sm:px-6 py-2 whitespace-nowrap min-w-min">
                        <button onclick="window.customerDashboard.switchTab('dashboard', event)" class="tab-button active px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-yellow-400">📊 Dashboard</button>
                        <button onclick="window.customerDashboard.switchTab('tickets', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white relative">
                            🎫 Tickets <span id="customer-tickets-badge" class="hidden absolute -top-1 -right-0 px-1 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                        </button>
                        <button onclick="window.customerDashboard.switchTab('appointments', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white relative">
                            📅 Appointments <span id="customer-appointments-badge" class="hidden absolute -top-1 -right-0 px-1 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                        </button>
                        <button onclick="window.customerDashboard.switchTab('drawings', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">🎰 Drawings</button>
                        <button onclick="window.customerDashboard.switchTab('library', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">📚 Library</button>
                        <button onclick="window.customerDashboard.switchTab('profile', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">👤 Profile</button>
                        <button onclick="window.customerDashboard.switchTab('settings', event)" class="tab-button px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white">⚙️ Settings</button>
                    </div>
                </div>

                <!-- Main Content Area (Scrollable) -->
                <main class="flex-grow overflow-y-auto p-3 sm:p-6">
                    <div class="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                        <!-- Dashboard Tab -->
                        <div id="customer-dashboard" class="tab-content active space-y-4 sm:space-y-6">
                            <!-- Welcome Card -->
                            <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-6 border border-yellow-400/10 space-y-3">
                                <h2 class="text-xl sm:text-2xl font-bold text-white">Welcome, ${this.custId.split('@')[0]}! 👋</h2>
                                <p class="text-xs sm:text-sm text-slate-400">Your account is active and ready to participate in lottery draws</p>
                                <button onclick="window.customerDashboard.switchTab('tickets', event)" class="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg text-xs sm:text-sm hover:bg-yellow-500">Buy Tickets →</button>
                            </div>

                            <!-- Quick Stats (Mobile: 1 col, Tablet: 2 col, Desktop: 3 col) -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                                    <p class="text-xs sm:text-sm text-slate-400">Active Tickets</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-yellow-400 mt-2" id="active-tickets">0</p>
                                </div>
                                <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                                    <p class="text-xs sm:text-sm text-slate-400">Pending Approvals</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-blue-400 mt-2" id="pending-tickets">0</p>
                                </div>
                                <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-5 border border-yellow-400/10">
                                    <p class="text-xs sm:text-sm text-slate-400">Total Spent</p>
                                    <p class="text-2xl sm:text-3xl font-bold text-emerald-400 mt-2" id="total-spent">0 ETB</p>
                                </div>
                            </div>

                            <!-- Next Draw Info -->
                            <div class="glass-panel rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-400/10 space-y-3">
                                <h3 class="text-lg sm:text-xl font-bold text-white">🎰 Next Lottery Draw</h3>
                                <p class="text-sm text-slate-400">Check upcoming lottery draws and your chances</p>
                                <button onclick="window.customerDashboard.switchTab('drawings', event)" class="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg text-xs sm:text-sm hover:bg-purple-700">View Draws →</button>
                            </div>
                        </div>

                        <!-- Tab Contents (Hidden Initially) -->
                        <div id="customer-tickets" class="tab-content" style="display: none;"></div>
                        <div id="customer-appointments" class="tab-content" style="display: none;"></div>
                        <div id="customer-drawings" class="tab-content" style="display: none;"></div>
                        <div id="customer-library" class="tab-content" style="display: none;"></div>
                        <div id="customer-profile" class="tab-content" style="display: none;"></div>
                        <div id="customer-settings" class="tab-content" style="display: none;"></div>
                    </div>
                </main>
            </div>
        `;
    }

    async loadData() {
        try {
            console.log('📥 CustomerDashboard: Starting loadData...');
            
            await Promise.all([
                this.tickets.init(),
                this.appointments.init(),
                this.drawings.init(),
                this.library.init(),
                this.profile.init(),
                this.settings.init()
            ]);

            this.loadTabs();
            this.updateDashboardStats();
            notify('info', '✅ Dashboard loaded');
        } catch (error) {
            console.error('❌ Error loading customer dashboard:', error);
        }
    }

    loadTabs() {
        try {
            const ticketsContent = document.getElementById('customer-tickets');
            const appointmentsContent = document.getElementById('customer-appointments');
            const drawingsContent = document.getElementById('customer-drawings');
            const libraryContent = document.getElementById('customer-library');
            const profileContent = document.getElementById('customer-profile');
            const settingsContent = document.getElementById('customer-settings');

            if (ticketsContent && this.tickets) {
                ticketsContent.innerHTML = this.tickets.render();
            }
            if (appointmentsContent && this.appointments) {
                appointmentsContent.innerHTML = this.appointments.render();
            }
            if (drawingsContent && this.drawings) {
                drawingsContent.innerHTML = this.drawings.render();
            }
            if (libraryContent && this.library) {
                libraryContent.innerHTML = this.library.render();
            }
            if (profileContent && this.profile) {
                profileContent.innerHTML = this.profile.render();
            }
            if (settingsContent && this.settings) {
                settingsContent.innerHTML = this.settings.render();
            }

            console.log('✅ All customer tabs loaded');
        } catch (error) {
            console.error('Error in loadTabs:', error);
        }
    }

    async updateDashboardStats() {
        try {
            if (!db || !this.custId) return;

            // Active tickets
            const activeSnap = await db.collection('customer_tickets')
                .where('customerEmail', '==', this.custId)
                .where('status', '==', 'approved')
                .get();
            
            const activeEl = document.getElementById('active-tickets');
            if (activeEl) activeEl.textContent = activeSnap.size;

            // Pending tickets
            const pendingSnap = await db.collection('customer_tickets')
                .where('customerEmail', '==', this.custId)
                .where('status', '==', 'pending')
                .get();
            
            const pendingEl = document.getElementById('pending-tickets');
            if (pendingEl) pendingEl.textContent = pendingSnap.size;

            // Total spent
            let totalSpent = 0;
            const allTicketsSnap = await db.collection('customer_tickets')
                .where('customerEmail', '==', this.custId)
                .get();
            
            allTicketsSnap.forEach(doc => {
                totalSpent += doc.data().cost || 0;
            });

            const spentEl = document.getElementById('total-spent');
            if (spentEl) spentEl.textContent = totalSpent.toLocaleString() + ' ETB';
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    switchTab(tabName, event) {
        console.log('🔀 Switching to tab:', tabName);
        
        // Hide all tabs
        const tabElements = document.querySelectorAll('[id^="customer-"]');
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
        const tab = document.getElementById(`customer-${tabName}`);
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
