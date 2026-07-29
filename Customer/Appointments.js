// ============================================
// CUSTOMER APPOINTMENTS (CHILD COMPONENT)
// Parent: CustomerDashboard
// ✅ Supports instant notifications & badge updates
// ============================================

class CustomerAppointments {
    constructor(custId) {
        this.custId = window.currentUser?.email || custId || localStorage.getItem('currentCustId') || localStorage.getItem('currentUserEmail') || 'DEFAULT';
        this.appointments = [];
        this.admins = [];
        this.init();
        this.startCustomerNotificationPoller();
    }

    setCustId(newCustId) {
        if (newCustId && newCustId !== this.custId) {
            this.custId = newCustId;
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
                const key = `customer_notifications_${this.custId}`;
                const raw = localStorage.getItem(key);
                if (raw) {
                    const notifs = JSON.parse(raw);
                    const unread = notifs.filter(n => !n.viewed);

                    if (unread.length > 0) {
                        unread.forEach(n => {
                            const type = n.status === 'Approved' ? 'success' : 'error';
                            
                            if (typeof notify === 'function') {
                                notify(type, `🔔 ${n.message}`);
                            } else if (window.notify) {
                                window.notify(type, `🔔 ${n.message}`);
                            }

                            n.viewed = true;
                        });

                        localStorage.setItem(key, JSON.stringify(notifs));
                        this.loadAppointments();
                        this.refreshList();
                        this.updateBadgeCount();
                    }
                }
            } catch (e) {
                console.error('Polling error:', e);
            }
        }, 2000);
    }

    loadAppointments() {
        try {
            let foundAppointments = [];
            const specificData = localStorage.getItem(`appointments_${this.custId}`);
            if (specificData) {
                foundAppointments = foundAppointments.concat(JSON.parse(specificData));
            }

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
            const key = `customer_notifications_${this.custId}`;
            const notifs = JSON.parse(localStorage.getItem(key) || '[]');
            const unreadCount = notifs.filter(n => !n.viewed).length;

            const badgeEl = document.getElementById('customer-appointments-badge');
            if (badgeEl) {
                if (unreadCount > 0) {
                    badgeEl.textContent = unreadCount;
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
        
        try {
            const key = `customer_notifications_${this.custId}`;
            const notifs = JSON.parse(localStorage.getItem(key) || '[]');
            notifs.forEach(n => n.viewed = true);
            localStorage.setItem(key, JSON.stringify(notifs));
            this.updateBadgeCount();
        } catch(e) {}

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
