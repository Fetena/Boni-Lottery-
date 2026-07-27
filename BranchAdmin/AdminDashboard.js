// ============================================
// ADMIN DASHBOARD - BRANCH ADMIN (FIXED & FULLY FEATURED)
// ============================================

let countdownInterval = null;

class AdminDashboard {
    constructor(adminId) {
        this.adminId = adminId;
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
                            <div class="glass-panel rounded-2xl p-6 border-2 border-yellow-400/40 bg-gradient-to-b from-yellow-400/10 to-black space-y-6 shadow-[0_0_25px_rgba(252,211,77,0.15)]">
                                <div>
                                    <span class="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">⚡ Live Draw Center</span>
                                    <h3 class="text-2xl font-black text-gradient mt-2">🎰 Branch Lucky Draw</h3>
                                    <p class="text-xs text-slate-300 mt-1">Configure schedule, countdown to draw time, and spin for verified branch winners.</p>
                                </div>

                                <!-- Admin Schedule Controller -->
                                <div class="bg-black/40 p-4 rounded-xl border border-yellow-400/20 space-y-3">
                                    <h4 class="text-xs font-bold text-yellow-400 uppercase tracking-wide">⚙️ Set Draw Schedule & Time</h4>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label class="block text-[10px] text-slate-400 mb-1">Scheduled Date & Time</label>
                                            <input type="datetime-local" id="draw-schedule-input" class="w-full bg-black/60 border border-yellow-400/30 rounded-xl py-2 px-3 text-white text-xs">
                                        </div>
                                        <div class="flex items-end">
                                            <button onclick="saveDrawSchedule()" class="w-full py-2 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 font-bold rounded-xl text-xs transition-all">💾 Save Schedule</button>
                                        </div>
                                    </div>
                                    <p id="schedule-status-text" class="text-[11px] text-slate-400 italic">No draw time scheduled yet.</p>
                                </div>

                                <!-- Countdown & Spinner Box -->
                                <div class="py-6 bg-black/60 rounded-xl border border-yellow-400/30 flex flex-col items-center justify-center relative overflow-hidden space-y-2">
                                    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent pointer-events-none"></div>
                                    <span id="draw-countdown-timer" class="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">⏳ LOCKED UNTIL SCHEDULED TIME</span>
                                    <span class="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Winning Number Result</span>
                                    <div id="lottery-spinner-box" class="text-5xl font-black text-yellow-400 tracking-wider drop-shadow-[0_0_15px_rgba(252,211,77,0.6)]">---</div>
                                    <div id="winner-info-display" class="text-xs text-slate-300 mt-2 font-medium text-center px-4"></div>
                                </div>

                                <!-- Spin Action Button (Disabled by Default until schedule + 30 mins) -->
                                <button id="spin-draw-btn" onclick="runLotteryDraw(currentUser?.email)" disabled class="w-full py-3.5 bg-slate-800 text-slate-500 font-black rounded-xl text-sm cursor-not-allowed transition-all shadow-none">🔒 DRAW LOCKED (WAITING FOR SCHEDULE)</button>

                                <!-- Recent Winners History (1 Week Auto-Purge) -->
                                <div class="space-y-3 pt-4 border-t border-yellow-400/10">
                                    <h4 class="text-xs font-bold text-white uppercase tracking-wider">🏆 Past Winners (Last 7 Days)</h4>
                                    <div id="lottery-history-list" class="space-y-2 max-h-48 overflow-y-auto">
                                        <p class="text-slate-500 text-xs italic text-center py-2">Loading recent history...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Customers Tab -->
                        <div id="admin-customers" class="tab-content" style="display: none;">
                            <div class="space-y-4">
                                <button onclick="openAddCustomerModal()" class="px-6 py-2 bg-yellow-400 text-black font-bold rounded-xl">+ Add Customer</button>
                                <div id="admin-customers-list" class="space-y-3"></div>
                            </div>
                        </div>

                        <!-- Tickets Tab -->
                        <div id="admin-tickets" class="tab-content" style="display: none;">
                            <div class="space-y-4">
                                <h3 class="text-xl font-bold text-white">Recent Tickets</h3>
                                <div id="admin-tickets-list" class="space-y-3"></div>
                            </div>
                        </div>

                        <!-- Payments Tab -->
                        <div id="admin-payments" class="tab-content" style="display: none;">
                            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                                <h3 class="text-xl font-bold text-white">Payment Accounts</h3>
                                <div>
                                    <label class="block text-xs text-slate-400 mb-2">Telebirr Phone</label>
                                    <input type="tel" id="admin-telebirr" placeholder="0945792677" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                                </div>
                                <div>
                                    <label class="block text-xs text-slate-400 mb-2">CBE Account</label>
                                    <input type="text" id="admin-cbe" placeholder="Account number" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                                </div>
                                <button onclick="saveAdminPayments()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Save Payments</button>
                            </div>
                        </div>
                      <!-- Notifications Tab Content -->
                     <div id="admin-notifications" class="tab-content" style="display: none;"></div>

                     <!-- Book Appointment Tab Content -->
                    <div id="admin-bookAppointment" class="tab-content" style="display: none;"></div>
                        <!-- Settings Tab -->
                        <div id="admin-settings" class="tab-content" style="display: none;">
                            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                                <h3 class="text-xl font-bold text-white mb-4">Admin Settings</h3>
                                <p class="text-slate-400">Admin ID: <span id="admin-id-display">${this.adminId}</span></p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <!-- Add Customer Modal -->
            <div id="customer-modal" class="fixed inset-0 bg-black/80 hidden flex items-center justify-center z-50">
                <div class="glass-panel rounded-2xl p-8 w-full max-w-md border border-yellow-400/10 space-y-4">
                    <h3 class="text-2xl font-bold text-white mb-2">Add Customer</h3>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Customer Name</label>
                            <input type="text" id="cust-name-input" placeholder="John Doe" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-3 px-4 text-white text-xs placeholder-slate-500">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Email</label>
                            <input type="email" id="cust-email-input" placeholder="customer@email.com" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-3 px-4 text-white text-xs placeholder-slate-500">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Phone Number</label>
                            <input type="tel" id="cust-phone-input" placeholder="0912345678" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-3 px-4 text-white text-xs placeholder-slate-500">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Default Password</label>
                            <div class="flex gap-2">
                                <input type="text" id="cust-password-input" value="Welcome123!" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-3 px-4 text-white text-xs">
                                <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('cust-password-input').value); notify('success', 'Password copied!');" class="px-3 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-xl text-xs border border-yellow-400/20">Copy</button>
                            </div>
                        </div>
                        <button onclick="addAdminCustomer()" class="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl text-xs hover:bg-yellow-500 mt-2">Add Customer</button>
                        <button onclick="closeAddCustomerModal()" class="w-full py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
                    </div>
                </div>
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
            await loadAdminCustomers();
            await loadAdminTickets();
            await loadAdminPayments();
            await loadAdminStats();
            
            // Initialize Lottery Schedule & History Module
            await initLotteryModule();

            if (!window.adminPayments) {
                window.adminPayments = new AdminPayments(this.adminId);
            }
            if (!window.adminNotifications) {
                window.adminNotifications = new AdminNotifications(this.adminId);
            }
            if (!window.adminBookAppointment) {
                window.adminBookAppointment = new AdminBookAppointment(this.adminId);
            }
            if (!window.adminSettings) {
                window.adminSettings = new AdminSettings(this.adminId);
            }

            const paymentsTab = document.getElementById('admin-payments');
            if (paymentsTab) {
                paymentsTab.innerHTML = await window.adminPayments.render();
            }

            const notifTab = document.getElementById('admin-notifications');
            if (notifTab) {
                notifTab.innerHTML = window.adminNotifications.render();
                if (typeof window.adminNotifications.displayHistory === 'function') {
                    window.adminNotifications.displayHistory();
                }
            }

            const apptTab = document.getElementById('admin-bookAppointment');
            if (apptTab) {
                apptTab.innerHTML = await window.adminBookAppointment.render();
            }

            const settingsTab = document.getElementById('admin-settings');
            if (settingsTab) {
                settingsTab.innerHTML = window.adminSettings.render();
            }

        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    async approvePayment(docId) {
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            await db.collection('customer_tickets').doc(docId).update({
                status: 'Approved',
                approvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            notify('success', '✅ Payment approved successfully!');
            await loadAdminTickets();
            await loadAdminStats();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
    async deleteTicket(docId) {
        if (!confirm('Are you sure you want to delete this ticket?')) return;
        if (!db) return notify('error', '❌ Database not initialized');

        try {
            await db.collection('customer_tickets').doc(docId).delete();
            notify('success', '🗑️ Ticket deleted successfully!');
            await loadAdminTickets();
            await loadAdminStats();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
    async rejectPayment(docId) {
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            await db.collection('customer_tickets').doc(docId).update({
                status: 'Rejected',
                rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            notify('error', '❌ Payment rejected');
            await loadAdminTickets();
            await loadAdminStats();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}

// ========== ADMIN CUSTOMERS ==========

async function openAddCustomerModal() {
    document.getElementById('customer-modal').style.display = 'flex';
}

function closeAddCustomerModal() {
    document.getElementById('customer-modal').style.display = 'none';
}

async function addAdminCustomer() {
    const name = document.getElementById('cust-name-input').value.trim();
    const email = document.getElementById('cust-email-input').value.trim();
    const phone = document.getElementById('cust-phone-input').value.trim();
    const password = document.getElementById('cust-password-input').value.trim();

    if (!name || !email || !password) {
        return notify('error', '❌ Please fill in all required fields');
    }

    try {
        await db.collection('admin_customers').add({
            adminEmail: currentUser.email,
            name,
            email,
            phone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        notify('success', '✅ Customer added successfully!');
        closeAddCustomerModal();
        await loadAdminCustomers();
        await loadAdminStats();
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

async function loadAdminCustomers() {
    if (!db || !currentUser) return;

    try {
        const manualSnapshot = await db.collection('admin_customers')
            .where('adminEmail', '==', currentUser.email)
            .get();

        const selfRegisteredSnapshot = await db.collection('customer_settings')
            .where('preferredAdmin', '==', currentUser.email)
            .get();

        const content = document.getElementById('admin-customers-list');
        if (!content) return;

        let allCustomers = [];

        manualSnapshot.forEach(doc => {
            allCustomers.push({ id: doc.id, type: 'manual', ...doc.data() });
        });

        selfRegisteredSnapshot.forEach(doc => {
            const data = doc.data();
            allCustomers.push({ 
                id: doc.id, 
                type: 'self', 
                name: data.customerName || 'N/A',
                email: data.customerEmail || doc.id,
                phone: data.phone || 'N/A',
                tickets: data.tickets || 0,
                spent: data.spent || 0
            });
        });

        if (allCustomers.length === 0) {
            content.innerHTML = '<p class="text-slate-400 text-center py-6">No customers yet</p>';
            return;
        }

        content.innerHTML = allCustomers.map(cust => `
            <div class="glass-panel rounded-lg p-4 border border-yellow-400/10 flex justify-between items-center text-xs">
                <div>
                    <p class="font-bold text-white text-sm">${cust.name} ${cust.type === 'self' ? '<span class="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded ml-2">Self-Registered</span>' : ''}</p>
                    <p class="text-slate-400 mt-0.5">${cust.email} • ${cust.phone}</p>
                    <p class="text-slate-400 mt-0.5">Tickets: ${cust.tickets || 0} • Spent: ${cust.spent || 0} ETB</p>
                </div>
                ${cust.type === 'manual' ? `<button onclick="deleteAdminCustomer('${cust.id}')" class="px-2.5 py-1 bg-red-400/20 text-red-400 rounded">Delete</button>` : '<span class="text-slate-500 italic">Platform User</span>'}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// ============================================
// LOTTERY DRAWING MODULE (SCHEDULE, 30M BUFFER, PHONE & 1-WEEK HISTORY)
// ============================================

async function initLotteryModule() {
    await loadDrawSchedule();
    await loadDrawHistory();
}

async function saveDrawSchedule() {
    if (!db || !currentUser) return notify('error', '❌ Database or user not ready');
    const scheduleVal = document.getElementById('draw-schedule-input').value;
    if (!scheduleVal) return notify('error', '❌ Please pick a valid date and time');

    try {
        const scheduleDate = new Date(scheduleVal);
        await db.collection('admin_settings').doc(`draw_schedule_${currentUser.email}`).set({
            adminEmail: currentUser.email,
            scheduledTime: firebase.firestore.Timestamp.fromDate(scheduleDate),
            updatedAt: new Date()
        }, { merge: true });

        notify('success', '✅ Draw schedule saved successfully!');
        loadDrawSchedule();
    } catch (error) {
        notify('error', `❌ Error saving schedule: ${error.message}`);
    }
}

async function loadDrawSchedule() {
    if (!db || !currentUser) return;
    try {
        const doc = await db.collection('admin_settings').doc(`draw_schedule_${currentUser.email}`).get();
        const statusText = document.getElementById('schedule-status-text');
        const spinBtn = document.getElementById('spin-draw-btn');
        const timerBox = document.getElementById('draw-countdown-timer');
        const scheduleInput = document.getElementById('draw-schedule-input');

        if (!doc.exists) return;
        const data = doc.data();
        if (!data.scheduledTime) return;

        const scheduledDate = data.scheduledTime.toDate();
        // Applies 30-minute lock buffer requirement
        const unlockedDate = new Date(scheduledDate.getTime() + (30 * 60000));

        if (scheduleInput) {
            scheduleInput.value = scheduledDate.toISOString().slice(0, 16);
        }

        if (statusText) {
            statusText.innerHTML = `📅 Scheduled for: <span class="text-white font-bold">${scheduledDate.toLocaleString()}</span> (Unlocked with 30m buffer at ${unlockedDate.toLocaleTimeString()})`;
        }

        if (countdownInterval) clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            const now = new Date();
            const diff = unlockedDate - now;

            if (diff <= 0) {
                if (timerBox) {
                    timerBox.textContent = '🟢 DRAW UNLOCKED & READY!';
                    timerBox.className = 'text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20';
                }
                if (spinBtn) {
                    spinBtn.disabled = false;
                    spinBtn.className = 'w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black rounded-xl text-sm shadow-lg hover:opacity-95 transform active:scale-95 transition-all cursor-pointer';
                    spinBtn.textContent = '🎲 SPIN & DRAW WINNER NOW';
                }
                clearInterval(countdownInterval);
            } else {
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                if (timerBox) {
                    timerBox.textContent = `⏳ UNLOCKS IN: ${hours}h ${minutes}m ${seconds}s`;
                }
            }
        }, 1000);

    } catch (error) {
        console.error('Error loading schedule:', error);
    }
}

async function runLotteryDraw(adminEmail = null) {
    if (!db) return notify('error', '❌ Database not initialized');

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
                        allAvailableNumbers.push({ 
                            ticketId: doc.id, 
                            number: num, 
                            customer: ticket.customerName || 'N/A', 
                            email: ticket.customerEmail || 'N/A',
                            phone: ticket.customerPhone || ticket.phone || 'N/A' 
                        });
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

        let spinCount = 0;
        const maxSpins = 30;
        const spinInterval = setInterval(async () => {
            const randomNum = Math.floor(Math.random() * 300) + 1;
            if (spinnerBox) spinnerBox.textContent = `#${randomNum}`;
            spinCount++;

            if (spinCount >= maxSpins) {
                clearInterval(spinInterval);

                const randomIndex = Math.floor(Math.random() * allAvailableNumbers.length);
                const winningSelection = allAvailableNumbers[randomIndex];

                if (spinnerBox) spinnerBox.textContent = `#${winningSelection.number}`;
                if (winnerInfoBox) {
                    winnerInfoBox.innerHTML = `🏆 Winner: <span class="text-yellow-400 font-bold">${winningSelection.customer}</span><br>📧 Email: ${winningSelection.email} • 📞 Phone: <span class="text-emerald-400 font-bold">${winningSelection.phone}</span>`;
                }

                // Saves to Firestore including phone number and timestamp for 1-week auto-removal rule
                await db.collection('lottery_draws').add({
                    winningNumber: winningSelection.number,
                    winningTicketId: winningSelection.ticketId,
                    winnerName: winningSelection.customer,
                    winnerEmail: winningSelection.email,
                    winnerPhone: winningSelection.phone,
                    drawnBy: currentUser?.email || 'Admin',
                    scope: adminEmail ? `Branch: ${adminEmail}` : 'Global Main Admin',
                    drawnAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                notify('success', `🎉 WINNING NUMBER DRAWN: #${winningSelection.number} (${winningSelection.customer})!`);
                loadDrawHistory();
            }
        }, 60);

    } catch (error) {
        console.error('Draw error:', error);
        notify('error', `❌ Draw Error: ${error.message}`);
    }
}

async function loadDrawHistory() {
    if (!db) return;
    try {
        const snapshot = await db.collection('lottery_draws')
            .orderBy('drawnAt', 'desc')
            .get();

        const historyList = document.getElementById('lottery-history-list');
        if (!historyList) return;

        if (snapshot.empty) {
            historyList.innerHTML = '<p class="text-slate-500 text-xs italic text-center py-2">No recent draw history</p>';
            return;
        }

        const now = new Date();
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        let validHistoryHTML = '';

        for (const docSnap of snapshot.docs) {
            const record = docSnap.data();
            const drawnDate = record.drawnAt ? record.drawnAt.toDate() : new Date();
            
            // Automatic removal condition: deletes entries older than 7 days from Firestore
            if ((now - drawnDate) > oneWeekMs) {
                await db.collection('lottery_draws').doc(docSnap.id).delete();
                continue;
            }

            validHistoryHTML += `
                <div class="bg-black/40 border border-yellow-400/10 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                        <p class="text-yellow-400 font-bold">#${record.winningNumber} — ${record.winnerName}</p>
                        <p class="text-slate-400 text-[10px]">📞 ${record.winnerPhone || 'N/A'} • 📧 ${record.winnerEmail || 'N/A'}</p>
                        <p class="text-slate-500 text-[9px]">Drawn: ${drawnDate.toLocaleString()}</p>
                    </div>
                    <span class="px-2 py-1 bg-yellow-400/10 text-yellow-300 rounded text-[10px] font-mono">${record.scope || 'Branch'}</span>
                </div>
            `;
        }

        historyList.innerHTML = validHistoryHTML || '<p class="text-slate-500 text-xs italic text-center py-2">No active history within the last 7 days</p>';

    } catch (error) {
        console.error('Error loading draw history:', error);
    }
}

async function deleteAdminCustomer(docId) {
    if (!confirm('Delete customer?')) return;

    try {
        await db.collection('admin_customers').doc(docId).delete();
        notify('success', '✅ Customer deleted');
        await loadAdminCustomers();
        await loadAdminStats();
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

// ========== ADMIN TICKETS ==========

async function loadAdminTickets() {
    if (!db) return;

    try {
        const snapshot = await db.collection('customer_tickets')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const content = document.getElementById('admin-tickets-list');
        if (!content) return;

        if (snapshot.empty) {
            content.innerHTML = '<p class="text-slate-400">No tickets yet</p>';
            return;
        }

        content.innerHTML = snapshot.docs.map(doc => {
            const ticket = doc.data();
            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10 text-xs space-y-2">
                    <p class="text-white font-bold">Customer: ${ticket.customerName || 'N/A'} (${ticket.customerEmail || ''})</p>
                    <p class="text-slate-400">Numbers: ${ticket.numbers?.join(', ') || 'N/A'}</p>
                    <p class="text-slate-400">Cost: ${ticket.cost} ETB • Payment: ${ticket.paymentMethod || 'N/A'}</p>
                    <div class="flex justify-between items-center pt-2 border-t border-yellow-400/10">
                        <span class="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded">${ticket.status || 'Pending'}</span>
                        <div class="flex gap-2">
                            <button onclick="window.adminDashboard.approvePayment('${doc.id}')" class="px-3 py-1 bg-emerald-600 text-white font-bold rounded">Approve</button>
                            <button onclick="window.adminDashboard.rejectPayment('${doc.id}')" class="px-3 py-1 bg-red-600 text-white font-bold rounded">Reject</button>
                            <button onclick="window.adminDashboard.deleteTicket('${doc.id}')" class="px-3 py-1 bg-slate-800 hover:bg-rose-900 text-rose-400 border border-rose-500/20 font-bold rounded">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

// ========== ADMIN PAYMENTS ==========

async function saveAdminPayments() {
    const telebirr = document.getElementById('admin-telebirr').value;
    const cbe = document.getElementById('admin-cbe').value;

    if (!telebirr || !cbe) return notify('error', '❌ Fill all fields');
    if (!db) return notify('error', '❌ Database not initialized');
    if (!currentUser) return notify('error', '❌ User not authenticated');

    try {
        await db.collection('admin_settings').doc(currentUser.email).set({
            adminEmail: currentUser.email,
            telebirrPhone: telebirr,
            cbeAccount: cbe,
            updatedAt: new Date()
        }, { merge: true });

        notify('success', '✅ Payment settings saved!');
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

async function loadAdminPayments() {
    if (!db || !currentUser) return;

    try {
        const doc = await db.collection('admin_settings').doc(currentUser.email).get();
        if (doc.exists) {
            const data = doc.data();
            if (data.telebirrPhone) document.getElementById('admin-telebirr').value = data.telebirrPhone;
            if (data.cbeAccount) document.getElementById('admin-cbe').value = data.cbeAccount;
        }
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

// ========== ADMIN STATS ==========

async function loadAdminStats() {
    if (!db || !currentUser) return;

    try {
        const manualSnapshot = await db.collection('admin_customers')
            .where('adminEmail', '==', currentUser.email)
            .get();

        const selfRegisteredSnapshot = await db.collection('customer_settings')
            .where('preferredAdmin', '==', currentUser.email)
            .get();

        const totalCustomersCount = manualSnapshot.size + selfRegisteredSnapshot.size;
        document.getElementById('admin-total-customers').textContent = totalCustomersCount;

        const ticketSnapshot = await db.collection('customer_tickets').get();
        document.getElementById('admin-total-tickets').textContent = ticketSnapshot.size;

        let revenue = 0;
        ticketSnapshot.forEach(doc => {
            revenue += doc.data().cost || 0;
        });
        document.getElementById('admin-total-revenue').textContent = revenue.toLocaleString() + ' ETB';
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}
