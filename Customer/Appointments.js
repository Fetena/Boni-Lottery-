// ============================================
// CUSTOMER APPOINTMENTS (CHILD COMPONENT)
// Parent: CustomerDashboard
// ✅ Includes direct visual popup alert for admin approvals
// ============================================

class CustomerAppointments {
    constructor(custId) {
        // Prevent fallback overwriting an already valid email session
        const resolvedId = custId || window.currentUser?.email || currentUser?.email || localStorage.getItem('currentCustId') || localStorage.getItem('currentUserEmail');
        this.custId = (resolvedId && resolvedId !== 'DEFAULT') ? resolvedId : 'fete@gmail.com';
        
        this.appointments = [];
        this.admins = [];
        this.init();
        this.startCustomerNotificationPoller();
    }

    setCustId(newCustId) {
        const validNewId = (newCustId && newCustId !== 'DEFAULT') ? newCustId : (window.currentUser?.email || this.custId);
        if (validNewId && validNewId !== this.custId) {
            this.custId = validNewId;
            console.log("CustomerAppointments locked custId to:", this.custId);
            this.loadAppointments();
            this.refreshList();
            this.startCustomerNotificationPoller();
        }
    }

    init() {
        this.loadAdminsSync();
        this.loadAppointments();
        this.refreshList();
        this.loadAdminsAsync();
        this.updateBadgeCount();
    }

    loadAdminsSync() {
        try {
            this.admins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
            if (this.admins.length === 0) {
                this.admins = [{ id: 'admin_main', name: 'Main Admin', role: 'Super Admin' }];
            }
            this.populateAdminDropdown();
        } catch (e) {
            this.admins = [{ id: 'admin_main', name: 'Main Admin', role: 'Super Admin' }];
            this.populateAdminDropdown();
        }
    }

    async loadAdminsAsync() {
        try {
            if (typeof db !== 'undefined' && db.collection) {
                const snapshot = await db.collection('admins').get();
                if (!snapshot.empty) {
                    this.admins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    localStorage.setItem('registered_admins', JSON.stringify(this.admins));
                    this.populateAdminDropdown();
                }
            }
        } catch (e) {}
    }

    populateAdminDropdown() {
        const selectEl = document.getElementById('apt-admin');
        if (selectEl) {
            selectEl.innerHTML = this.admins.map(a => `
                <option value="${a.name || a.id}">${a.name || a.id} ${a.role ? '('+a.role+')' : ''}</option>
            `).join('');
        }
    }

    startCustomerNotificationPoller() {
        if (this._pollingInterval) clearInterval(this._pollingInterval);
        
        this._pollingInterval = setInterval(() => {
            try {
                const currentEmail = window.currentUser?.email || currentUser?.email || this.custId;
                
                // Construct dynamic keys to look for notifications written by the admin panel
                const keysToCheck = [
                    `customer_notifications_${currentEmail}`,
                    `customer_notifications_${this.custId}`,
                    'customer_notifications_DEFAULT',
                    'customer_notifications_fete!'
                ];

                // Also sweep all localStorage keys dynamically for any unread customer notifications
                Object.keys(localStorage).forEach(k => {
                    if (k.startsWith('customer_notifications_') && !keysToCheck.includes(k)) {
                        keysToCheck.push(k);
                    }
                });

                keysToCheck.forEach(key => {
                    const raw = localStorage.getItem(key);
                    if (!raw) return;

                    const notifs = JSON.parse(raw);
                    let modified = false;

                    notifs.forEach(n => {
                        if (!n.viewed) {
                            console.log("🔔 Unread Notification Found in key [", key, "]:", n);
                            
                            // Trigger Popup Modal
                            this.showPopupModal(n.message, n.status);
                            
                            // Trigger Toast if helper exists
                            const type = (n.status === 'Approved' || n.status === 'Confirmed') ? 'success' : 'error';
                            if (typeof notify === 'function') {
                                notify(type, `🔔 ${n.message}`);
                            }
                            
                            n.viewed = true;
                            modified = true;
                        }
                    });

                    if (modified) {
                        localStorage.setItem(key, JSON.stringify(notifs));
                        this.loadAppointments();
                        this.refreshList();
                        this.updateBadgeCount();
                    }
                });
            } catch (e) {
                console.error('Polling error:', e);
            }
        }, 2000);
    }

    showPopupModal(message, status) {
        // Remove any existing popup modal first
        const existing = document.getElementById('apt-popup-modal');
        if (existing) existing.remove();

        const isApproved = status === 'Approved' || status === 'Confirmed';
        const borderColor = isApproved ? 'border-emerald-500' : 'border-red-500';
        const textColor = isApproved ? 'text-emerald-400' : 'text-red-400';
        const icon = isApproved ? '🎉' : '⚠️';

        const modalHtml = `
            <div id="apt-popup-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div class="glass-panel w-full max-w-md rounded-2xl border ${borderColor} p-6 space-y-4 shadow-2xl bg-black">
                    <div class="flex items-center space-x-3">
                        <span class="text-3xl">${icon}</span>
                        <div>
                            <h3 class="text-lg font-bold text-white">Appointment Update</h3>
                            <p class="text-xs ${textColor} font-semibold">Status: ${status || 'Updated'}</p>
                        </div>
                    </div>
                    <div class="p-4 bg-black/50 rounded-xl border border-yellow-400/10 text-sm text-slate-200">
                        ${message}
                    </div>
                    <button onclick="document.getElementById('apt-popup-modal').remove()" 
                        class="w-full py-2.5 bg-yellow-400 text-black font-bold rounded-xl text-xs hover:bg-yellow-500 transition-all">
                        Got It, Thanks!
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    loadAppointments() {
        try {
            let foundAppointments = [];
            const specificData = localStorage.getItem(`appointments_${this.custId}`);
            if (specificData) {
                foundAppointments = foundAppointments.concat(JSON.parse(specificData));
            }

            // Fallback sweep of all appointment keys
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('appointments_')) {
                    const items = JSON.parse(localStorage.getItem(key) || '[]');
                    items.forEach(item => {
                        if (!foundAppointments.some(existing => existing.id === item.id)) {
                            foundAppointments.push(item);
                        }
                    });
                }
            });

            this.appointments = foundAppointments;
        } catch (e) {
            this.appointments = [];
        }
    }

    refreshList() {
        const listEl = document.getElementById('appointments-list');
        if (listEl) {
            listEl.innerHTML = this.renderAppointmentsHtml();
        }
        this.updateBadgeCount();
    }

    updateBadgeCount() {
        try {
            let totalUnread = 0;
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('customer_notifications_')) {
                    const notifs = JSON.parse(localStorage.getItem(key) || '[]');
                    totalUnread += notifs.filter(n => !n.viewed).length;
                }
            });

            const badgeEl = document.getElementById('customer-appointments-badge');
            if (badgeEl) {
                if (totalUnread > 0) {
                    badgeEl.textContent = totalUnread;
                    badgeEl.classList.remove('hidden');
                } else {
                    badgeEl.textContent = '0';
                    badgeEl.classList.add('hidden');
                }
            }
        } catch (e) {
            console.error('Error updating appointment badge', e);
        }
    }

    render() {
        this.loadAppointments();

        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📅 Appointments</h3>
                
                <!-- BOOK NEW APPOINTMENT -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">Book New Appointment</h4>
                    
                    <div>
                        <label class="text-sm text-slate-400">Select Registered Admin</label>
                        <select id="apt-admin" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                            ${this.admins.map(a => `<option value="${a.name || a.id}">${a.name || a.id}</option>`).join('')}
                        </select>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm text-slate-400">Date</label>
                            <input type="date" id="apt-date" 
                                class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                        </div>
                        <div>
                            <label class="text-sm text-slate-400">Time</label>
                            <input type="time" id="apt-time" 
                                class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                        </div>
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">Purpose</label>
                        <select id="apt-purpose" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                            <option>Payment Verification</option>
                            <option>Ticket Support</option>
                            <option>Prize Claim</option>
                            <option>Account Issue</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">Description</label>
                        <textarea id="apt-desc" placeholder="Tell us what you need..." rows="3"
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1"></textarea>
                    </div>

                    <button onclick="customerAppointments.bookAppointment()" 
                        class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">📅 Confirm & Book Appointment</button>
                </div>

                <!-- SCHEDULED APPOINTMENTS -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                    <h4 class="font-bold text-white mb-4">Your Appointments</h4>
                    <div id="appointments-list" class="space-y-2">
                        ${this.renderAppointmentsHtml()}
                    </div>
                </div>
            </div>
        `;
    }

    renderAppointmentsHtml() {
        this.loadAppointments();
        
        if (this.appointments.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No appointments scheduled</p>';
        }

        return this.appointments.map(apt => {
            let statusColor = 'text-yellow-400';
            if (apt.status === 'Approved' || apt.status === 'Confirmed') statusColor = 'text-emerald-400';
            if (apt.status === 'Rejected' || apt.status === 'Cancelled') statusColor = 'text-red-400';

            return `
                <div class="bg-black/30 rounded-lg p-4 border border-yellow-400/10 space-y-1">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-yellow-400">Admin: ${apt.adminName || 'Main Admin'}</p>
                            <p class="text-sm text-white font-medium mt-1">📅 ${apt.date} at ${apt.time}</p>
                            <p class="text-xs text-slate-300 mt-1">Purpose: <span class="text-white">${apt.purpose}</span></p>
                            ${apt.description ? `<p class="text-xs text-slate-400 mt-1">Note: ${apt.description}</p>` : ''}
                            <p class="text-xs ${statusColor} mt-2 font-semibold">Status: ${apt.status}</p>
                        </div>
                        <div>
                            <button onclick="customerAppointments.cancelAppointment('${apt.id}')" 
                                class="px-3 py-1 bg-red-950/30 text-red-400 text-xs rounded hover:bg-red-950/50">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    bookAppointment() {
        const adminName = document.getElementById('apt-admin')?.value;
        const date = document.getElementById('apt-date')?.value;
        const time = document.getElementById('apt-time')?.value;
        const purpose = document.getElementById('apt-purpose')?.value;
        const description = document.getElementById('apt-desc')?.value;

        if (!date || !time || !purpose || !adminName) {
            if (typeof notify === 'function') notify('error', '❌ Please fill all required fields');
            return;
        }

        const appointment = {
            id: 'APT' + Date.now(),
            custId: this.custId,
            adminName,
            date,
            time,
            purpose,
            description,
            status: 'Pending Confirmation',
            bookedAt: new Date().toLocaleTimeString()
        };

        this.loadAppointments();
        this.appointments.push(appointment);
        localStorage.setItem(`appointments_${this.custId}`, JSON.stringify(this.appointments));

        if (typeof notify === 'function') {
            notify('success', `✅ Appointment successfully booked with ${adminName} for approval!`);
        }
        
        document.getElementById('apt-date').value = '';
        document.getElementById('apt-time').value = '';
        document.getElementById('apt-desc').value = '';
        
        this.refreshList();
    }

    cancelAppointment(aptId) {
        if (confirm('Cancel this appointment?')) {
            this.loadAppointments();
            this.appointments = this.appointments.filter(a => a.id !== aptId);
            localStorage.setItem(`appointments_${this.custId}`, JSON.stringify(this.appointments));
            
            if (typeof notify === 'function') notify('info', '❌ Appointment cancelled');
            this.refreshList();
        }
    }
}

let customerAppointments;
document.addEventListener('DOMContentLoaded', () => {
    const activeCustId = window.currentUser?.email || localStorage.getItem('currentCustId') || 'DEFAULT';
    customerAppointments = new CustomerAppointments(activeCustId);
});
