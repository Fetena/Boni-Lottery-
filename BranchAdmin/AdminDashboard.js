// ============================================
// ADMIN DASHBOARD - PARENT COMPONENT
// ============================================

class AdminDashboard {
    constructor(adminId) {
        this.adminId = adminId;
        window.adminLottery = new AdminLotteryDraw(adminId);
        window.adminTickets = new AdminTickets(adminId);
    }

    render() {
        return `
            <div id="admin-dashboard" class="min-h-screen bg-black flex flex-col">
                <header class="sticky top-0 z-40 w-full glass-panel border-b border-yellow-400/10 px-6 py-4">
                    <div class="max-w-7xl mx-auto flex items-center justify-between">
                        <h1 class="font-bold text-xl text-gradient">🛡️ ADMIN DASHBOARD</h1>
                        <button onclick="logout()" class="px-4 py-2 bg-red-950/30 text-red-400 text-xs font-bold rounded-xl">Logout</button>
                    </div>
                </header>
                
                <main class="flex-grow p-6 overflow-y-auto">
                    <div class="max-w-7xl mx-auto space-y-6">
                        <h2 class="text-3xl font-bold text-white">Admin Control Center</h2>
                        
                        <div class="flex gap-2 border-b border-yellow-400/10 pb-2 overflow-x-auto">
                            <button onclick="window.adminDashboard.switchTab('dashboard', event)" class="tab-button active px-4 py-2 text-xs font-bold text-yellow-400">📊 Dashboard</button>
                            <button onclick="window.adminDashboard.switchTab('customers', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">👥 Customers</button>
                            <button onclick="window.adminDashboard.switchTab('tickets', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">🎫 Tickets</button>
                            <button onclick="window.adminDashboard.switchTab('payments', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">💳 Payments</button>
                            <button onclick="window.adminDashboard.switchTab('notifications', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 relative">
                                🔔 Notifications <span id="badge-branch-notifications" class="hidden absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                            </button>
                            <button onclick="window.adminDashboard.switchTab('bookAppointment', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400 relative">
                                📅 BookAppointment <span id="badge-branch-bookings" class="hidden absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">0</span>
                            </button>
                            <button onclick="window.adminDashboard.switchTab('settings', event)" class="tab-button px-4 py-2 text-xs font-bold text-slate-400">⚙️ Settings</button>
                        </div>

                        <!-- Dashboard Tab -->
                        <div id="admin-dashboard-tab" class="tab-content active space-y-4">
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
                            ${window.adminLottery ? window.adminLottery.render() : ''}
                        </div>

                        <!-- Customers Tab -->
                        <div id="admin-customers" class="tab-content" style="display: none;">
                            <div class="space-y-4">
                                <button onclick="if(typeof openAddCustomerModal === 'function') openAddCustomerModal(); else alert('Customer modal handler loading...');" class="px-6 py-2 bg-yellow-400 text-black font-bold rounded-xl">+ Add Customer</button>
                                <div id="admin-customers-list" class="space-y-3"></div>
                            </div>
                        </div>

                        <!-- Tickets Tab -->
                        <div id="admin-tickets" class="tab-content" style="display: none;">
                            <div id="admin-tickets-wrapper">
                                ${window.adminTickets ? window.adminTickets.render() : ''}
                            </div>
                        </div>

                        <!-- Payments Tab -->
                        <div id="admin-payments" class="tab-content" style="display: none;"></div>

                        <!-- Notifications Tab Content -->
                        <div id="admin-notifications" class="tab-content" style="display: none;"></div>

                        <!-- Book Appointment Tab Content -->
                        <div id="admin-bookAppointment" class="tab-content" style="display: none;"></div>

                        <!-- Settings Tab -->
                        <div id="admin-settings" class="tab-content" style="display: none;"></div>
                    </div>
                </main>
            </div>
        `;
    }

    switchTab(tabName, event) {
        document.getElementById('admin-dashboard-tab').style.display = 'none';
        document.getElementById('admin-customers').style.display = 'none';
        document.getElementById('admin-tickets').style.display = 'none';
        document.getElementById('admin-payments').style.display = 'none';
        document.getElementById('admin-notifications').style.display = 'none';
        document.getElementById('admin-bookAppointment').style.display = 'none';
        document.getElementById('admin-settings').style.display = 'none';

        const buttons = document.querySelectorAll('#admin-dashboard .tab-button');
        buttons.forEach(btn => btn.classList.remove('active'));

        if (tabName === 'dashboard') {
            document.getElementById('admin-dashboard-tab').style.display = 'block';
        } else if (tabName === 'customers') {
            document.getElementById('admin-customers').style.display = 'block';
        } else if (tabName === 'tickets') {
            document.getElementById('admin-tickets').style.display = 'block';
        } else if (tabName === 'payments') {
            document.getElementById('admin-payments').style.display = 'block';
        } else if (tabName === 'notifications') {
            document.getElementById('admin-notifications').style.display = 'block';
        } else if (tabName === 'bookAppointment') {
            document.getElementById('admin-bookAppointment').style.display = 'block';
        } else if (tabName === 'settings') {
            document.getElementById('admin-settings').style.display = 'block';
        }

        if (event && event.target) {
            event.target.classList.add('active');
            event.target.style.color = '#FCD34D';
        }
    }

    async loadData() {
        try {
            if (typeof loadAdminCustomers === 'function') await loadAdminCustomers();
            if (window.adminTickets) await window.adminTickets.loadTicketsContent();
            if (typeof loadAdminStats === 'function') await loadAdminStats();
            
            if (window.adminLottery) {
                await window.adminLottery.init();
            }

            if (typeof AdminPayments !== 'undefined' && !window.adminPayments) window.adminPayments = new AdminPayments(this.adminId);
            if (typeof AdminNotifications !== 'undefined' && !window.adminNotifications) window.adminNotifications = new AdminNotifications(this.adminId);
            if (typeof AdminBookAppointment !== 'undefined' && !window.adminBookAppointment) window.adminBookAppointment = new AdminBookAppointment(this.adminId);
            if (typeof AdminSettings !== 'undefined' && !window.adminSettings) window.adminSettings = new AdminSettings(this.adminId);

            const paymentsTab = document.getElementById('admin-payments');
            if (paymentsTab && window.adminPayments) paymentsTab.innerHTML = await window.adminPayments.render();

            const notifTab = document.getElementById('admin-notifications');
            if (notifTab && window.adminNotifications) {
                notifTab.innerHTML = window.adminNotifications.render();
                if (typeof window.adminNotifications.displayHistory === 'function') window.adminNotifications.displayHistory();
            }

            const apptTab = document.getElementById('admin-bookAppointment');
            if (apptTab && window.adminBookAppointment) apptTab.innerHTML = await window.adminBookAppointment.render();

            const settingsTab = document.getElementById('admin-settings');
            if (settingsTab && window.adminSettings) settingsTab.innerHTML = window.adminSettings.render();

        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }
}
