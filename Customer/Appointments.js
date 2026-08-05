// ============================================
// CUSTOMER APPOINTMENTS - FIXED V7 (CLICKABLE NOTIFICATIONS TRAY & MODAL)
// ============================================

class CustomerAppointments {
    constructor(custId) {
        const initialId = custId === 'DEFAULT' || !custId 
            ? (window.currentUser?.email || localStorage.getItem('currentUserEmail') || 'tt@gmail.com')
            : custId;

        this.custId = initialId;
        this.appointments = [];
        this.admins = [];
        this.notifications = [];
        this.init();
        this.startCustomerNotificationPoller();
    }

    setCustId(newCustId) {
        if (!newCustId || (newCustId === 'DEFAULT' && this.custId && this.custId !== 'DEFAULT')) {
            return;
        }

        const cleanNewId = newCustId.toString().toLowerCase().trim();
        if (cleanNewId && cleanNewId !== this.custId.toString().toLowerCase().trim()) {
            this.custId = cleanNewId;
            this.loadAppointments();
            this.loadNotifications();
            this.refreshList();
        }
    }

    // Realtime Firebase Listener targeting ONLY this customer's notifications
    startCustomerNotificationPoller() {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        const db = firebase.firestore();
        const activeEmail = (this.custId && this.custId !== 'DEFAULT' ? this.custId : (localStorage.getItem('currentUserEmail') || 'tt@gmail.com')).toString().toLowerCase().trim();

        if (this._unsubscribeNotifs) this._unsubscribeNotifs();

        this._unsubscribeNotifs = db.collection('customer_notifications')
            .onSnapshot(snapshot => {
                let hasChanges = false;
                snapshot.docChanges().forEach(change => {
                    const n = change.doc.data();
                    const nCustId = (n.custId || '').toString().toLowerCase().trim();
                    
                    if (nCustId === activeEmail) {
                        hasChanges = true;
                        if (change.type === 'added' && !n.viewed) {
                            this.showPopupModal(n.message, n.status, change.doc.id);
                            
                            const type = (n.status === 'Approved' || n.status === 'Confirmed') ? 'success' : 'error';
                            if (typeof notify === 'function') {
                                notify(type, `🔔 ${n.message}`);
                            }
                        }
                    }
                });

                if (hasChanges) {
                    this.loadAppointments();
                    this.loadNotifications();
                    this.refreshList();
                }
            }, e => console.error('Firestore notification listener error:', e));
    }

    showPopupModal(message, status, notifId) {
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
                    <button onclick="window.customerAppointments.dismissPopup('${notifId}')" 
                        style="width: 100%; padding: 12px; background: #facc15; color: #000; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; font-size: 13px;">
                        Got It, Thanks!
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    async dismissPopup(notifId) {
        const modal = document.getElementById('apt-popup-modal');
        if (modal) modal.remove();

        if (notifId && typeof firebase !== 'undefined' && firebase.firestore) {
            try {
                const db = firebase.firestore();
                await db.collection('customer_notifications').doc(notifId).update({ viewed: true });
                await this.loadNotifications();
                this.refreshList();
            } catch (e) {
                console.error('Error marking notification as viewed:', e);
            }
        }
    }

    async loadAppointments() {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        try {
            const db = firebase.firestore();
            const targetId = (this.custId && this.custId !== 'DEFAULT' ? this.custId : (localStorage.getItem('currentUserEmail') || 'tt@gmail.com')).toString().toLowerCase().trim();
            
            const snapshot = await db.collection('customer_appointments').get();
            this.appointments = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(apt => {
                    const aptCust = (apt.custId || '').toString().toLowerCase().trim();
                    return aptCust === targetId;
                });
        } catch (e) {
            console.error('Error loading appointments from Firebase:', e);
            this.appointments = [];
        }
    }

    async loadNotifications() {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        try {
            const db = firebase.firestore();
            const targetId = (this.custId && this.custId !== 'DEFAULT' ? this.custId : (localStorage.getItem('currentUserEmail') || 'tt@gmail.com')).toString().toLowerCase().trim();
            
            const snapshot = await db.collection('customer_notifications').get();
            this.notifications = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(n => {
                    const nCust = (n.custId || '').toString().toLowerCase().trim();
                    return nCust === targetId;
                })
                .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
            
            this.updateBadgeCount();
        } catch (e) {
            console.error('Error loading notifications:', e);
            this.notifications = [];
        }
    }

    refreshList() {
        const listEl = document.getElementById('appointments-list');
        if (listEl) {
            listEl.innerHTML = this.renderAppointmentsHtml();
        }
        this.updateBadgeCount();
    }

    async updateBadgeCount() {
        const unviewedCount = this.notifications.filter(n => n.viewed === false).length;
        const badgeEl = document.getElementById('customer-appointments-badge');
        
        if (badgeEl) {
            if (unviewedCount > 0) {
                badgeEl.textContent = unviewedCount;
                badgeEl.classList.remove('hidden');
                badgeEl.style.display = 'inline-flex';
            } else {
                badgeEl.textContent = '0';
                badgeEl.classList.add('hidden');
                badgeEl.style.display = 'none';
            }
        }
    }

    async init() {
        await this.loadAssignedAdminSync();
        await this.loadAppointments();
        await this.loadNotifications();
        this.refreshList();
    }

    async loadAssignedAdminSync() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                const snapshot = await db.collection('admins').get();
                
                if (!snapshot.empty) {
                    this.admins = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            name: data.name || data.email || doc.id,
                            email: data.email || doc.id,
                            ...data
                        };
                    });
                    this.refreshList();
                    return;
                }
            }

            const allAdmins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
            this.admins = (allAdmins.length > 0 ? allAdmins : [
                { id: 'admin_1', name: 'Admin', email: 'admin@gmail.com' }
            ]).map(admin => ({
                ...admin,
                email: admin.email || admin.id
            }));
        } catch (e) {
            console.error('Error fetching admins from Firebase:', e);
            this.admins = [{ id: 'admin_1', name: 'Admin', email: 'admin@gmail.com' }];
        }
    }

    render() {
        this.loadAssignedAdminSync();
        this.loadAppointments();
        this.loadNotifications();
        return `
            <div class="space-y-6">
                <h3 class="text-2xl font-bold text-white">📅 Appointments</h3>
                
                <!-- Notifications Tray Section -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/20 space-y-4" style="background: rgba(0,0,0,0.6);">
                    <div class="flex justify-between items-center">
                        <h4 class="font-bold text-white flex items-center gap-2">🔔 Notification Updates</h4>
                        <span class="text-xs text-slate-400">Click any notification to mark as read</span>
                    </div>
                    <div id="notifications-tray" class="space-y-2 max-h-60 overflow-y-auto pr-1">
                        ${this.renderNotificationsHtml()}
                    </div>
                </div>

                <!-- Book Appointment Form -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">Book New Appointment</h4>
                    <div>
                        <label class="text-sm text-slate-400">Select Registered Admin</label>
                        <select id="apt-admin" class="w-full bg-black/45 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                            <option value="">-- Select Admin --</option>
                            ${this.admins.map(a => {
                                const adminEmail = a.email || (a.id && a.id.includes('@') ? a.id : null) || `${a.name || 'admin'}@gmail.com`.toLowerCase().replace(/\s+/g, '');
                                const adminName = a.name || a.email || a.id;
                                return `<option value="${adminEmail}" data-email="${adminEmail}">${adminName} (${adminEmail})</option>`;
                            }).join('')}
                        </select>
                        <p class="text-xs text-slate-500 mt-1">⚠️ Selected admin email: <span id="selected-admin-email">--</span></p>
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

                <!-- Your Appointments List -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                    <h4 class="font-bold text-white mb-4">Your Appointments</h4>
                    <div id="appointments-list" class="space-y-2">
                        ${this.renderAppointmentsHtml()}
                    </div>
                </div>
            </div>
        `;
    }

    renderNotificationsHtml() {
        if (this.notifications.length === 0) {
            return '<p class="text-slate-500 text-sm text-center py-4">No notifications yet</p>';
        }
        return this.notifications.map(n => {
            const isUnviewed = n.viewed === false;
            const bgStyle = isUnviewed ? 'background: rgba(250, 204, 21, 0.1); border-color: rgba(250, 204, 21, 0.4);' : 'background: rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.05); opacity: 0.7;'
            const badgeText = isUnviewed ? '<span class="px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-bold rounded">NEW</span>' : '<span class="text-slate-500 text-[10px]">Read</span>';
            const statusColor = (n.status === 'Approved' || n.status === 'Confirmed') ? 'text-emerald-400' : 'text-red-400';

            return `
                <div onclick="window.customerAppointments.handleNotificationClick('${n.id}', '${escape(n.message || '')}', '${n.status || 'Updated'}')" 
                     class="p-3 rounded-xl border cursor-pointer transition hover:border-yellow-400 flex items-start justify-between gap-3" style="${bgStyle}">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold ${statusColor}">Status: ${n.status || 'Update'}</span>
                            ${badgeText}
                        </div>
                        <p class="text-sm text-white leading-snug">${n.message}</p>
                    </div>
                    <span class="text-xs text-slate-400 whitespace-nowrap">🔍 Read</span>
                </div>
            `;
        }).join('');
    }

    async handleNotificationClick(notifId, escapedMsg, status) {
        const message = unescape(escapedMsg);
        this.showPopupModal(message, status, notifId);
        if (notifId && typeof firebase !== 'undefined' && firebase.firestore) {
            try {
                const db = firebase.firestore();
                await db.collection('customer_notifications').doc(notifId).update({ viewed: true });
                await this.loadNotifications();
                
                // Refresh both list view and notification tray element if present
                const trayEl = document.getElementById('notifications-tray');
                if (trayEl) trayEl.innerHTML = this.renderNotificationsHtml();
            } catch (e) {
                console.error('Error updating notification status:', e);
            }
        }
    }

    renderAppointmentsHtml() {
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
                            <p class="font-bold text-yellow-400">Admin: ${apt.adminName || apt.adminEmail || 'Main Admin'}</p>
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

    async bookAppointment() {
        const adminEmail = document.getElementById('apt-admin')?.value;
        const rawDate = document.getElementById('apt-date')?.value;
        const time = document.getElementById('apt-time')?.value;
        const purpose = document.getElementById('apt-purpose')?.value;
        const description = document.getElementById('apt-desc')?.value;

        if (!rawDate || !time || !purpose || !adminEmail) {
            if (typeof notify === 'function') notify('error', '❌ Please fill all required fields');
            return;
        }

        const dateParts = rawDate.split('-');
        let formattedDate = rawDate;
        if (dateParts.length === 3) {
            const localDateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            formattedDate = localDateObj.toISOString().split('T')[0];
        }

        try {
            const db = firebase.firestore();
            const targetId = (this.custId !== 'DEFAULT' ? this.custId : (localStorage.getItem('currentUserEmail') || 'tt@gmail.com')).toString().toLowerCase().trim();
            const selectedAdmin = this.admins.find(a => (a.email || a.id) === adminEmail);
            const adminName = selectedAdmin?.name || adminEmail;

            const cleanAdminEmail = adminEmail.toLowerCase().trim();

            const appointment = {
                custId: targetId,
                adminEmail: cleanAdminEmail,
                adminName: adminName,
                date: formattedDate,
                time,
                purpose,
                description,
                status: 'Pending Confirmation',
                bookedAt: new Date().toLocaleTimeString(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('customer_appointments').add(appointment);

            if (typeof notify === 'function') notify('success', `✅ Appointment successfully booked with ${adminName}!`);
            
            document.getElementById('apt-admin').value = '';
            document.getElementById('apt-date').value = '';
            document.getElementById('apt-time').value = '';
            document.getElementById('apt-desc').value = '';
            document.getElementById('selected-admin-email').textContent = '--';
            await this.loadAppointments();
            this.refreshList();
        } catch (e) {
            console.error('Error booking appointment in Firebase:', e);
            if (typeof notify === 'function') notify('error', '❌ Failed to book appointment');
        }
    }

    async cancelAppointment(aptId) {
        if (confirm('Cancel this appointment?')) {
            try {
                const db = firebase.firestore();
                await db.collection('customer_appointments').doc(aptId).delete();

                if (typeof notify === 'function') notify('info', '❌ Appointment cancelled');
                await this.loadAppointments();
                this.refreshList();
            } catch (e) {
                console.error('Error deleting appointment from Firebase:', e);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('apt-admin')) {
        document.getElementById('apt-admin').addEventListener('change', function() {
            const emailEl = document.getElementById('selected-admin-email');
            if (emailEl) {
                emailEl.textContent = this.value || '--';
            }
        });
    }
});

window.customerAppointments = null;
document.addEventListener('DOMContentLoaded', () => {
    const activeEmail = localStorage.getItem('currentUserEmail') || 'tt@gmail.com';
    window.customerAppointments = new CustomerAppointments(activeEmail);
});
