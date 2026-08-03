// ============================================
// CUSTOMER APPOINTMENTS MODULE COMPONENT
// ============================================

class CustomerAppointments {
    constructor(custId) {
        const initialId = custId === 'DEFAULT' || !custId 
            ? (window.currentUser?.email || localStorage.getItem('currentUserEmail') || 'fete@gmail.com')
            : custId;

        this.custId = initialId;
        this.appointments = [];
        this.admins = [];
        this.init();
        this.startCustomerNotificationPoller();
    }

    setCustId(newCustId) {
        if (!newCustId || (newCustId === 'DEFAULT' && this.custId && this.custId !== 'DEFAULT')) {
            return;
        }

        if (newCustId && newCustId !== this.custId) {
            this.custId = newCustId;
            this.loadAppointments();
            this.refreshList();
        }
    }

    startCustomerNotificationPoller() {
        if (this._pollingInterval) clearInterval(this._pollingInterval);
        
        this._pollingInterval = setInterval(() => {
            try {
                const activeEmail = this.custId && this.custId !== 'DEFAULT' ? this.custId : 'fete@gmail.com';
                const key = `customer_notifications_${activeEmail}`;

                const raw = localStorage.getItem(key);
                if (!raw) return;

                const notifs = JSON.parse(raw);
                let modified = false;

                notifs.forEach(n => {
                    if (!n.viewed) {
                        this.showPopupModal(n.message, n.status);
                        
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
            } catch (e) {
                console.error('Polling error:', e);
            }
        }, 2000);
    }

    showPopupModal(message, status) {
        const existing = document.getElementById('apt-popup-modal');
        if (existing) existing.remove();

        const isApproved = status === 'Approved' || status === 'Confirmed';
        const borderColor = isApproved ? '#10b981' : '#ef4444';
        const textColor = isApproved ? 'text-emerald-400' : 'text-red-400';
        const icon = isApproved ? '🎉' : '⚠️';

        const modalHtml = `
            <div id="apt-popup-modal" style="position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.85); backdrop-filter: blur(4px); padding: 1rem;">
                <div class="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl" style="background: #000; border: 2px solid ${borderColor};">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 28px;">${icon}</span>
                        <div>
                            <h3 style="color: #fff; font-size: 18px; font-weight: bold; margin: 0;">Appointment Update</h3>
                            <p class="${textColor}" style="font-size: 12px; font-weight: 600; margin: 2px 0 0 0;">Status: ${status || 'Updated'}</p>
                        </div>
                    </div>
                    <div style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 14px; color: #e2e8f0; line-height: 1.4;">
                        ${message}
                    </div>
                    <button onclick="document.getElementById('apt-popup-modal').remove()" 
                        style="width: 100%; padding: 12px; background: #facc15; color: #000; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; font-size: 13px;">
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
            const targetId = this.custId && this.custId !== 'DEFAULT' ? this.custId : 'fete@gmail.com';
            
            const specificData = localStorage.getItem(`appointments_${targetId}`);
            if (specificData) {
                foundAppointments = JSON.parse(specificData);
            }

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
            const targetId = this.custId && this.custId !== 'DEFAULT' ? this.custId : 'fete@gmail.com';
            
            const notifs = JSON.parse(localStorage.getItem(`customer_notifications_${targetId}`) || '[]');
            totalUnread += notifs.filter(n => !n.viewed).length;

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
        } catch (e) {}
    }

    init() {
        this.loadAssignedAdminSync();
        this.loadAppointments();
        this.refreshList();
    }

    // Load available active admins cleanly for selection
    async loadAssignedAdminSync() {
        try {
            // Assuming you are using Firebase Firestore
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                const snapshot = await db.collection('admins').get();
                
                if (!snapshot.empty) {
                    this.admins = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    this.refreshList();
                    return;
                }
            }

            // Fallback if Firebase isn't initialized or collection is empty
            const allAdmins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
            this.admins = allAdmins.length > 0 ? allAdmins : [
                { id: 'admin_1', name: 'Main Admin', email: 'admin@gmail.com' }
            ];
        } catch (e) {
            console.error('Error fetching admins from Firebase:', e);
            this.admins = [{ id: 'admin_1', name: 'Main Admin', email: 'admin@gmail.com' }];
        }
    }

    render() {
        this.loadAssignedAdminSync();
        this.loadAppointments();
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📅 Appointments</h3>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">Book New Appointment</h4>
                    <div>
                        <label class="text-sm text-slate-400">Select Registered Admin</label>
                        <select id="apt-admin" class="w-full bg-black/45 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                            ${this.admins.map(a => `<option value="${a.name || a.email || a.id}">${a.name || a.email || a.id}</option>`).join('')}
                        </select>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm text-slate-400">Date</label>
                            <input type="date" id="apt-date" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                        </div>
                        <div>
                            <label class="text-sm text-slate-400">Time</label>
                            <input type="time" id="apt-time" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
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
                        <textarea id="apt-desc" placeholder="Tell us what you need..." rows="3" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1"></textarea>
                    </div>
                    <button onclick="window.customerAppointments.bookAppointment()" class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">📅 Confirm & Book Appointment</button>
                </div>
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
                            <button onclick="window.customerAppointments.cancelAppointment('${apt.id}')" class="px-3 py-1 bg-red-950/30 text-red-400 text-xs rounded hover:bg-red-950/50">Cancel</button>
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

        const targetId = this.custId !== 'DEFAULT' ? this.custId : 'fete@gmail.com';
        
        const appointment = {
            id: 'APT' + Date.now(),
            custId: targetId,
            adminName,
            date,
            time,
            purpose,
            description,
            status: 'Pending Confirmation',
            bookedAt: new Date().toLocaleTimeString()
        };

        // 1. Save strictly to the customer's personal appointment history log
        this.loadAppointments();
        this.appointments.push(appointment);
        localStorage.setItem(`appointments_${targetId}`, JSON.stringify(this.appointments));

        // 2. Save strictly to the *specific* selected admin's queue instead of broadcasting to everyone
        const adminQueueKey = `admin_appointments_${adminName.toLowerCase().replace(/\s+/g, '_')}`;
        const existingAdminApts = JSON.parse(localStorage.getItem(adminQueueKey) || '[]');
        existingAdminApts.push(appointment);
        localStorage.setItem(adminQueueKey, JSON.stringify(existingAdminApts));

        if (typeof notify === 'function') notify('success', `✅ Appointment successfully booked with ${adminName}!`);
        
        document.getElementById('apt-date').value = '';
        document.getElementById('apt-time').value = '';
        document.getElementById('apt-desc').value = '';
        this.refreshList();
    }

    cancelAppointment(aptId) {
        if (confirm('Cancel this appointment?')) {
            this.loadAppointments();
            const targetApt = this.appointments.find(a => a.id === aptId);
            
            // Remove from customer list
            this.appointments = this.appointments.filter(a => a.id !== aptId);
            const targetId = this.custId !== 'DEFAULT' ? this.custId : 'fete@gmail.com';
            localStorage.setItem(`appointments_${targetId}`, JSON.stringify(this.appointments));

            // Also remove from the specific admin's queue if it exists
            if (targetApt && targetApt.adminName) {
                const adminQueueKey = `admin_appointments_${targetApt.adminName.toLowerCase().replace(/\s+/g, '_')}`;
                let adminApts = JSON.parse(localStorage.getItem(adminQueueKey) || '[]');
                adminApts = adminApts.filter(a => a.id !== aptId);
                localStorage.setItem(adminQueueKey, JSON.stringify(adminApts));
            }

            if (typeof notify === 'function') notify('info', '❌ Appointment cancelled');
            this.refreshList();
        }
    }
}

window.customerAppointments = null;
document.addEventListener('DOMContentLoaded', () => {
    window.customerAppointments = new CustomerAppointments('fete@gmail.com');
});
