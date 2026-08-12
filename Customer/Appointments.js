// ============================================
// CUSTOMER APPOINTMENTS - FIXED V25 (DIRECT DOM MODAL REMOVAL)
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

    startCustomerNotificationPoller() {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        const db = firebase.firestore();
        const activeEmail = (this.custId && this.custId !== 'DEFAULT' ? this.custId : (localStorage.getItem('currentUserEmail') || 'tt@gmail.com')).toString().toLowerCase().trim();

        if (this._unsubscribeNotifs) this._unsubscribeNotifs();
        if (this._unsubscribeBroadcasts) this._unsubscribeBroadcasts();

        this._unsubscribeNotifs = db.collection('customer_notifications')
            .onSnapshot(snapshot => {
                let hasChanges = false;
                snapshot.docChanges().forEach(change => {
                    const n = change.doc.data();
                    const nCustId = (n.custId || '').toString().toLowerCase().trim();
                    if (nCustId === activeEmail) {
                        hasChanges = true;
                    }
                });

                if (hasChanges) {
                    this.loadAppointments();
                    this.loadNotifications();
                    this.refreshList();
                }
            }, e => console.error('Firestore notification listener error:', e));

        this._unsubscribeBroadcasts = db.collection('notifications')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const n = change.doc.data();
                        const target = (n.target || n.recipient || 'All Customers').toLowerCase();
                        
                        if (
                            target.includes('admin') || 
                            target.includes('main admin') || 
                            target.includes('admins only') || 
                            target.includes('branch admin') ||
                            n.isAdminOnly === true
                        ) {
                            return;
                        }
                        this.loadNotifications();
                    }
                });
            }, e => console.error('Broadcast listener error:', e));
    }

    showPopupModal(message, status, notifId) {
        // Completely remove any existing modal elements first
        this.dismissPopup();

        const isApproved = status === 'Approved' || status === 'Confirmed' || status === 'Platform Broadcast' || status === 'Announcement';
        const borderColor = isApproved ? '#facc15' : '#ef4444';
        const textColor = isApproved ? 'text-yellow-400' : 'text-red-400';
        const icon = isApproved ? '📢' : '⚠️';

        const wrapper = document.createElement('div');
        wrapper.id = 'apt-popup-modal';
        wrapper.className = 'apt-popup-modal-class';
        wrapper.style.cssText = 'position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.85); backdrop-filter: blur(4px); padding: 1rem;';
        
        wrapper.innerHTML = `
            <div class="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl" style="background: #000; border: 2px solid ${borderColor}; pointer-events: auto;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 28px;">${icon}</span>
                    <div>
                        <h3 style="color: #fff; font-size: 18px; font-weight: bold; margin: 0;">Platform Notification</h3>
                        <p class="${textColor}" style="font-size: 12px; font-weight: 600; margin: 2px 0 0 0;">Type: ${status || 'Update'}</p>
                    </div>
                </div>
                <div style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 14px; color: #e2e8f0; line-height: 1.4;">
                    ${message}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button type="button" id="apt-modal-gotit-btn" style="flex: 1; padding: 12px; background: #facc15; color: #000; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; font-size: 13px;">
                        Got It, Thanks!
                    </button>
                    <button type="button" id="apt-modal-delete-btn" style="padding: 12px 16px; background: rgba(239, 68, 68, 0.2); color: #ef4444; font-weight: bold; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.4); cursor: pointer; font-size: 13px;">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(wrapper);

        // Bind direct event listeners
        const gotItBtn = wrapper.querySelector('#apt-modal-gotit-btn');
        const deleteBtn = wrapper.querySelector('#apt-modal-delete-btn');

        if (gotItBtn) {
            gotItBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dismissPopup();
            };
        }

        if (deleteBtn) {
            deleteBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.deleteNotification(notifId);
            };
        }
    }

    dismissPopup() {
        const modals = document.querySelectorAll('#apt-popup-modal, .apt-popup-modal-class');
        modals.forEach(m => m.remove());
    }

    async deleteNotification(notifId) {
        this.dismissPopup();

        const dismissed = JSON.parse(localStorage.getItem('dismissed_notifs_' + this.custId) || '[]');
        if (!dismissed.includes(notifId)) {
            dismissed.push(notifId);
            localStorage.setItem('dismissed_notifs_' + this.custId, JSON.stringify(dismissed));
        }

        this.notifications = this.notifications.filter(n => n.id !== notifId && (n.id + '_broadcast') !== notifId);
        this.refreshList();
        if (typeof notify === 'function') notify('info', '🗑️ Notification removed from your tray');
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
                    return aptCust === targetId || !apt.custId;
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
            const dismissed = JSON.parse(localStorage.getItem('dismissed_notifs_' + this.custId) || '[]');
            
            const custNotifSnapshot = await db.collection('customer_notifications').get();
            const custNotifs = custNotifSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(n => {
                    const nCust = (n.custId || '').toString().toLowerCase().trim();
                    const matchesUser = nCust === targetId || !n.custId;
                    const isNotDismissed = !dismissed.includes(n.id);
                    return matchesUser && isNotDismissed;
                });

            const broadcastSnapshot = await db.collection('notifications').get();
            const broadcasts = [];
            
            broadcastSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const target = (data.target || data.recipient || '').toLowerCase();
                const broadcastId = doc.id + '_broadcast';
                
                if (
                    target.includes('admin') || 
                    target.includes('main admin') || 
                    target.includes('admins only') || 
                    target.includes('branch admin') ||
                    data.isAdminOnly === true ||
                    dismissed.includes(broadcastId) ||
                    dismissed.includes(doc.id)
                ) {
                    return;
                }

                broadcasts.push({
                    id: doc.id,
                    isBroadcast: true,
                    status: data.title || 'Announcement',
                    message: `[${data.title || 'Broadcast'}] ${data.message || ''}`,
                    createdAt: data.createdAt || { toMillis: () => Date.now() }
                });
            });

            this.notifications = [...custNotifs, ...broadcasts]
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
        const trayEl = document.getElementById('notifications-tray');
        if (trayEl) {
            trayEl.innerHTML = this.renderNotificationsHtml();
        }
        this.updateBadgeCount();
    }

    async updateBadgeCount() {
        const unreadCount = this.notifications.length;
        const badgeEls = document.querySelectorAll('#customer-appointments-badge, .customer-notif-badge');
        
        badgeEls.forEach(badgeEl => {
            badgeEl.textContent = unreadCount;
            if (unreadCount > 0) {
                badgeEl.style.display = 'inline-flex';
                badgeEl.classList.remove('hidden');
            } else {
                badgeEl.style.display = 'none';
                badgeEl.classList.add('hidden');
            }
        });
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

        const unreadCount = this.notifications.length;
        const badgeDisplay = unreadCount > 0 ? 'inline-flex' : 'none';

        return `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-bold text-white flex items-center gap-3">
                        <span>📅 Appointments & Tickets</span>
                        <span id="customer-appointments-badge" class="customer-notif-badge px-2.5 py-0.5 bg-rose-500 text-white font-bold text-xs rounded-full shadow-lg items-center justify-center min-w-[22px]" style="display: ${badgeDisplay};">${unreadCount}</span>
                    </h3>
                </div>
                
                <!-- Notifications Tray Section -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/20 space-y-4" style="background: rgba(0,0,0,0.6);">
                    <div class="flex justify-between items-center">
                        <h4 class="font-bold text-white flex items-center gap-2">🔔 Notification Updates</h4>
                        <span class="text-xs text-slate-400">Click View to open popup, use Trash to delete</span>
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
                    <h4 class="font-bold text-white mb-4">Your Sent Requests & Appointments</h4>
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
            const bgStyle = 'background: rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.08);';
            const isBroadcast = n.isBroadcast;
            const statusColor = isBroadcast ? 'text-yellow-400' : ((n.status === 'Approved' || n.status === 'Confirmed') ? 'text-emerald-400' : 'text-red-400');
            const statusLabel = isBroadcast ? '📢 Announcement' : `Status: ${n.status || 'Update'}`;

            const targetNotifId = isBroadcast ? n.id + '_broadcast' : n.id;
            const safeMsg = (n.message || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

            return `
                <div class="p-4 rounded-xl border border-white/5 flex items-start justify-between gap-3" style="${bgStyle}">
                    <div class="space-y-1 flex-1">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold ${statusColor}">${statusLabel}</span>
                        </div>
                        <p class="text-sm text-white leading-relaxed">${n.message}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="window.customerAppointments.handleNotificationClick('${targetNotifId}', '${safeMsg}', '${n.status || 'Updated'}')" class="text-xs text-yellow-400 whitespace-nowrap font-medium px-2 py-1 bg-yellow-400/10 rounded hover:bg-yellow-400/20 transition">🔍 View</button>
                        <button type="button" onclick="window.customerAppointments.deleteNotification('${targetNotifId}')" class="text-xs text-red-400 whitespace-nowrap font-medium px-2 py-1 bg-red-500/10 rounded hover:bg-red-500/20 transition">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    handleNotificationClick(notifId, message, status) {
        this.showPopupModal(message, status, notifId);
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
                <div class="bg-black/40 rounded-xl p-4 border border-yellow-400/20 space-y-2 hover:border-yellow-400/40 transition">
                    <div class="flex justify-between items-start">
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <span class="px-2 py-0.5 bg-yellow-400/10 text-yellow-400 text-xs font-bold rounded border border-yellow-400/20">${apt.purpose || 'Appointment'}</span>
                                <span class="text-xs ${statusColor} font-semibold">● ${apt.status}</span>
                            </div>
                            <p class="font-bold text-white text-base">To Admin: ${apt.adminName || apt.adminEmail || 'Main Admin'}</p>
                            <p class="text-sm text-slate-200">📅 Date: <span class="text-white font-medium">${apt.date}</span> at <span class="text-white font-medium">${apt.time}</span></p>
                            ${apt.description ? `
                                <div class="mt-2 p-3 bg-black/60 rounded-lg border border-white/5 text-xs text-slate-300 leading-relaxed">
                                    <strong class="text-yellow-400 block mb-1">Your Request Note:</strong>
                                    ${apt.description}
                                </div>
                            ` : ''}
                            <p class="text-[11px] text-slate-500 pt-1">Booked at: ${apt.bookedAt || 'N/A'}</p>
                        </div>
                        <div>
                            <button onclick="window.customerAppointments.cancelAppointment('${apt.id}')" class="px-3 py-1.5 bg-red-950/40 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-950/80 border border-red-500/20 transition">Cancel</button>
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
            if (typeof notify === 'function') {
                notify('error', '❌ Please fill all required fields');
            }
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

            if (typeof notify === 'function') {
                notify('success', `✅ Appointment successfully booked with ${adminName}!`);
            }
            
            document.getElementById('apt-admin').value = '';
            document.getElementById('apt-date').value = '';
            document.getElementById('apt-time').value = '';
            document.getElementById('apt-desc').value = '';
            document.getElementById('selected-admin-email').textContent = '--';
            await this.loadAppointments();
            this.refreshList();
        } catch (e) {
            console.error('Error booking appointment in Firebase:', e);
            if (typeof notify === 'function') {
                notify('error', '❌ Failed to book appointment');
            }
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
