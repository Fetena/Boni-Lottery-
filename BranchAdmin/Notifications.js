// ============================================
// ADMIN NOTIFICATIONS - FIXED V28 (ROBUST BADGE SCANNER & POPUPS)
// ============================================

class AdminNotifications {
    constructor(adminId) {
        this.adminId = adminId || localStorage.getItem('currentUserEmail') || localStorage.getItem('currentAdminEmail') || '';
        this.pendingApprovals = [];
        this.approvedItems = [];
        this.rejectedItems = [];
        this.adminNotificationsList = [];
        this._isLoading = false;
        
        this.loadPendingApprovals();
        this.startAdminRealtimeListener();

        setTimeout(() => this.updateTabBadge(), 300);
    }

    startAdminRealtimeListener() {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        const db = firebase.firestore();
        const currentAdminRaw = (this.adminId || localStorage.getItem('currentUserEmail') || localStorage.getItem('currentAdminEmail') || '').toString().toLowerCase().trim();

        if (this._unsubscribeAdminNotifs) this._unsubscribeAdminNotifs();
        if (this._unsubscribeBroadcasts) this._unsubscribeBroadcasts();

        // 1. Listener for customer appointments
        this._unsubscribeAdminNotifs = db.collection('customer_appointments')
            .onSnapshot(snapshot => {
                let hasNewUnnotified = false;
                let latestApt = null;

                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const docData = typeof change.doc.data === 'function' ? change.doc.data() : (change.doc.data || change.doc);
                        const apt = { id: change.doc.id, ...docData };
                        
                        const aptAdminEmail = (apt.adminEmail || '').toString().toLowerCase().trim();
                        const isMatch = currentAdminRaw ? (aptAdminEmail === currentAdminRaw || !aptAdminEmail) : true;
                        const status = (apt.status || '').toLowerCase();
                        const isPending = status.includes('pending') || status.includes('unapproved') || status === 'pending confirmation' || !apt.status;

                        if (isMatch && isPending && !apt.adminNotified) {
                            hasNewUnnotified = true;
                            latestApt = apt;
                            db.collection('customer_appointments').doc(change.doc.id).update({ adminNotified: true }).catch(() => {});
                        }
                    }
                });

                if (hasNewUnnotified && latestApt) {
                    localStorage.removeItem('admin_notifications_viewed_' + this.adminId);
                    const message = `New booking from ${latestApt.custId || 'Customer'} for ${latestApt.purpose || 'Appointment'} on ${latestApt.date || 'TBD'} at ${latestApt.time || 'TBD'}`;
                    this.showPopupModal(message, latestApt.purpose || 'New Appointment Request', latestApt.id);
                    if (typeof notify === 'function') {
                        notify('success', `🔔 ${message}`);
                    }
                }

                this.loadPendingApprovals();
            }, e => console.error('Admin real-time listener error:', e));

        // 2. Real-time listener for Platform Broadcasts (`notifications` collection)
        this._unsubscribeBroadcasts = db.collection('notifications')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const broadcastData = change.doc.data();
                        const target = (broadcastData.target || '').toLowerCase();
                        const isMainAdmin = currentAdminRaw.includes('mainadmin') || currentAdminRaw === 'main@gmail.com';

                        const isTargetingMainAdminOnly = target.includes('main admin') || target.includes('main admin only');
                        const isTargetingAdminsOnly = target.includes('admins only') || target.includes('all admins');

                        if (isTargetingMainAdminOnly && !isMainAdmin) return;
                        if (isTargetingAdminsOnly && isMainAdmin) return;

                        const title = broadcastData.title || 'Broadcast Notice';
                        const message = broadcastData.message || '';
                        
                        this.showPopupModal(`📢 [NOTICE]: ${message}`, title, change.doc.id + '_broadcast');
                        if (typeof notify === 'function') {
                            notify('success', `📢 Notice: ${title}`);
                        }
                        this.loadPendingApprovals();
                    }
                });
            }, e => console.error('Broadcast listener error:', e));
    }

    showPopupModal(message, status, notifId) {
        const existing = document.getElementById('admin-popup-modal');
        if (existing) existing.remove();

        const isApproved = status === 'Approved' || status === 'Confirmed' || status === 'Platform Broadcast' || status === 'Announcement' || status.includes('New');
        const borderColor = isApproved ? '#facc15' : '#ef4444';
        const textColor = isApproved ? 'text-yellow-400' : 'text-red-400';
        const icon = isApproved ? '📢' : '⚠️';

        const modalHtml = `
            <div id="admin-popup-modal" style="position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.85); backdrop-filter: blur(4px); padding: 1rem;">
                <div class="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl" style="background: #000; border: 2px solid ${borderColor};">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 28px;">${icon}</span>
                        <div>
                            <h3 style="color: #fff; font-size: 18px; font-weight: bold; margin: 0;">Admin Notification</h3>
                            <p class="${textColor}" style="font-size: 12px; font-weight: 600; margin: 2px 0 0 0;">Type: ${status || 'Update'}</p>
                        </div>
                    </div>
                    <div style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 14px; color: #e2e8f0; line-height: 1.4;">
                        ${message}
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="window.adminNotifications.dismissPopup('${notifId}')" 
                            style="flex: 1; padding: 12px; background: #facc15; color: #000; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; font-size: 13px;">
                            Got It, Thanks!
                        </button>
                        <button onclick="window.adminNotifications.deletePopupNotification('${notifId}')" 
                            style="padding: 12px 16px; background: rgba(239, 68, 68, 0.2); color: #ef4444; font-weight: bold; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.4); cursor: pointer; font-size: 13px;">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    dismissPopup(notifId) {
        const modal = document.getElementById('admin-popup-modal');
        if (modal) modal.remove();
        this.loadPendingApprovals();
    }

    async deletePopupNotification(notifId) {
        const modal = document.getElementById('admin-popup-modal');
        if (modal) modal.remove();

        if (notifId && notifId.includes('_broadcast')) {
            const cleanId = notifId.replace('_broadcast', '');
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                try {
                    await firebase.firestore().collection('notifications').doc(cleanId).delete();
                    if (typeof notify === 'function') notify('info', '🗑️ Broadcast notice removed');
                    await this.loadPendingApprovals();
                } catch (e) {
                    console.error('Error deleting broadcast notice:', e);
                }
            }
            return;
        }

        if (notifId && typeof firebase !== 'undefined' && firebase.firestore) {
            try {
                await firebase.firestore().collection('customer_appointments').doc(notifId).delete();
                if (typeof notify === 'function') notify('info', '🗑️ Booking appointment removed');
                await this.loadPendingApprovals();
            } catch (e) {
                console.error('Error deleting appointment from popup:', e);
            }
        }
    }

    updateTabBadge() {
        const pendingCount = this.pendingApprovals.length;
        // Always display badge if pending count > 0, bypassing strict viewed checks to ensure visibility
        const showBadge = pendingCount > 0;

        document.querySelectorAll('a, button, span, li, div').forEach(el => {
            const text = el.textContent ? el.textContent.trim().toLowerCase() : '';
            // Match against common navigation keywords shown in your UI screenshot
            if (text.includes('appointment') || text.includes('ticket') || text.includes('notification')) {
                const container = el.closest('a, button, li') || el;
                if (getComputedStyle(container).position === 'static') {
                    container.style.position = 'relative';
                }
                
                let badge = container.querySelector('#nav-head-badge');
                if (showBadge) {
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.id = 'nav-head-badge';
                        container.appendChild(badge);
                    }
                    badge.style.cssText = 'position: absolute !important; top: -8px !important; right: -12px !important; background: #ef4444 !important; color: #ffffff !important; font-size: 11px !important; font-weight: 900 !important; min-width: 20px !important; height: 20px !important; padding: 0 5px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 10px !important; border: 2px solid #000000 !important; z-index: 99999 !important; pointer-events: none !important; box-shadow: 0 2px 6px rgba(0,0,0,0.8) !important;';
                    badge.textContent = pendingCount;
                } else if (badge) {
                    badge.remove();
                }
            }
        });
    }

    render() {
        const pendingCount = this.pendingApprovals.length;
        setTimeout(() => this.updateTabBadge(), 100);

        return `
            <div class="space-y-6">
                <!-- NOTIFICATIONS TRAY SECTION -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/20 space-y-4" style="background: rgba(0,0,0,0.6);">
                    <div class="flex justify-between items-center">
                        <h4 class="font-bold text-white flex items-center gap-2">🔔 Admin Notification Tray</h4>
                        <span class="text-xs text-slate-400">Click View to open popup, use Trash to delete</span>
                    </div>
                    <div id="admin-notifications-tray" class="space-y-2 max-h-60 overflow-y-auto pr-1">
                        ${this.renderNotificationsTrayHtml()}
                    </div>
                </div>

                <!-- APPROVALS SECTION -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-2xl font-bold text-white flex items-center gap-3">
                            ✅ Pending Approvals 
                            <span id="pending-count-badge" class="bg-yellow-400 text-black text-xs px-2.5 py-0.5 rounded-full font-bold" style="display: ${pendingCount > 0 ? 'inline-block' : 'none'};">${pendingCount}</span>
                        </h3>
                        <button onclick="window.adminNotifications.triggerManualPopup()" 
                            class="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl text-xs flex items-center gap-2">
                            <span>Show Popup</span>
                        </button>
                    </div>
                    <p class="text-xs text-slate-400">Manage customer booking and appointment approvals here. You must read attached files before approving.</p>
                    <div id="admin-approval-list" class="space-y-3">
                        ${pendingCount === 0 ? '<p class="text-slate-400 text-xs py-2">No pending booking approvals found</p>' : this.renderApprovalItems()}
                    </div>
                </div>

                <!-- APPROVED APPOINTMENTS ARCHIVE SECTION -->
                <div class="glass-panel rounded-2xl p-6 border border-emerald-500/10 space-y-4">
                    <h3 class="text-2xl font-bold text-white">📂 Approved Appointments Archive</h3>
                    <p class="text-xs text-slate-400">Review and manage successfully approved bookings. You can delete them anytime.</p>
                    <div id="admin-approved-list" class="space-y-3">
                        ${this.renderApprovedBinItems()}
                    </div>
                </div>

                <!-- REJECTED BIN SECTION -->
                <div class="glass-panel rounded-2xl p-6 border border-red-500/10 space-y-4">
                    <h3 class="text-2xl font-bold text-white">🗑️ Rejected Appointments Bin</h3>
                    <p class="text-xs text-slate-400">Review, restore, or permanently remove rejected booking requests.</p>
                    <div id="admin-rejected-list" class="space-y-3">
                        ${this.renderRejectedBinItems()}
                    </div>
                </div>

                <!-- SEND NOTIFICATIONS SECTION -->
                <div class="space-y-4">
                    <h3 class="text-2xl font-bold text-white">🔔 Send Notifications</h3>
                    <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                        <div>
                            <label class="text-sm text-slate-400">Notification Type</label>
                            <select id="admin-notif-type" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                                <option>Payment Reminder</option>
                                <option>Drawing Reminder</option>
                                <option>Announcement</option>
                                <option>Custom</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-sm text-slate-400">Message</label>
                            <textarea id="admin-notif-msg" placeholder="Type message..." rows="3" 
                                class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1"></textarea>
                        </div>
                        <button onclick="window.adminNotifications.sendNotification()" 
                            class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">Send</button>
                    </div>
                </div>
            </div>
        `;
    }

    triggerManualPopup() {
        if (this.pendingApprovals.length > 0) {
            const count = this.pendingApprovals.length;
            const latest = this.pendingApprovals[0];
            const message = `You have ${count} pending booking request(s). Latest: ${latest.custId || 'Customer'} - ${latest.purpose || 'Appointment'} on ${latest.date || 'TBD'} at ${latest.time || 'TBD'}`;
            this.showPopupModal(message, `Pending Requests (${count})`, latest.id);
        } else {
            this.showPopupModal('No pending bookings found to show right now.', 'System Notification', 'sys_notice');
        }
    }

    async loadPendingApprovals() {
        if (typeof firebase === 'undefined' || !firebase.firestore || this._isLoading) return;
        this._isLoading = true;
        try {
            const db = firebase.firestore();
            const currentAdminRaw = (this.adminId || localStorage.getItem('currentUserEmail') || localStorage.getItem('currentAdminEmail') || '').toString().toLowerCase().trim();

            const snapshot = await db.collection('customer_appointments').get();
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            this.pendingApprovals = [];
            this.approvedItems = [];
            this.rejectedItems = [];

            items.forEach(item => {
                const itemAdminEmail = (item.adminEmail || '').toString().toLowerCase().trim();
                const isMatch = currentAdminRaw ? (itemAdminEmail === currentAdminRaw || !itemAdminEmail) : true;

                if (isMatch) {
                    const status = (item.status || '').toLowerCase().trim();
                    const isPending = status.includes('pending') || status.includes('unapproved') || status === 'pending confirmation' || !item.status;
                    const isApproved = status.includes('confirmed') || status.includes('approved');
                    const isRejected = status.includes('rejected');

                    if (isPending) {
                        this.pendingApprovals.push(item);
                    } else if (isApproved) {
                        this.approvedItems.push(item);
                    } else if (isRejected) {
                        this.rejectedItems.push(item);
                    }
                }
            });

            const notifSnapshot = await db.collection('admin_notifications').get();
            const regularNotifs = notifSnapshot.docs.map(doc => ({ id: doc.id, collection: 'admin_notifications', ...doc.data() }));

            const broadcastSnapshot = await db.collection('notifications').get();
            const broadcastNotifs = broadcastSnapshot.docs.map(doc => {
                const data = doc.data();
                const tDate = data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now());
                return {
                    id: doc.id,
                    collection: 'notifications', 
                    type: '📢 NOTICE', 
                    isMainAdminBroadcast: true,
                    message: `[${data.title || 'Broadcast'}] ${data.message || ''}`,
                    timestamp: tDate.toLocaleTimeString(),
                    sentBy: data.sentBy || 'Admin'
                };
            });

            this.adminNotificationsList = [...broadcastNotifs, ...regularNotifs];

            this.refreshUI();
            this.updateTabBadge();
        } catch (e) {
            console.error('Error loading approvals from Firebase', e);
        } finally {
            this._isLoading = false;
        }
    }

    renderNotificationsTrayHtml() {
        if (this.pendingApprovals.length === 0 && this.adminNotificationsList.length === 0) {
            return '<p class="text-slate-500 text-sm text-center py-4">No notifications yet</p>';
        }

        const pendingTrayItems = this.pendingApprovals.map(apt => ({
            id: apt.id,
            status: 'Pending Booking',
            message: `New booking from ${apt.custId || 'Customer'} for ${apt.purpose || 'Appointment'} on ${apt.date || 'TBD'} at ${apt.time || 'TBD'}`,
            isBroadcast: false
        }));

        const broadcastTrayItems = this.adminNotificationsList.map(n => ({
            id: n.isMainAdminBroadcast ? n.id + '_broadcast' : n.id,
            status: n.type || 'Notice',
            message: n.message,
            isBroadcast: true,
            collection: n.collection || 'admin_notifications'
        }));

        return [...pendingTrayItems, ...broadcastTrayItems].map(n => {
            const safeMsg = (n.message || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            return `
                <div class="p-4 rounded-xl border border-white/5 flex items-start justify-between gap-3 bg-black/30">
                    <div class="space-y-1 flex-1">
                        <span class="text-xs font-semibold ${n.isBroadcast ? 'text-yellow-400' : 'text-emerald-400'}">${n.status}</span>
                        <p class="text-sm text-white leading-relaxed">${n.message}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="window.adminNotifications.showPopupModal('${safeMsg}', '${n.status}', '${n.id}')" class="text-xs text-yellow-400 font-medium px-2 py-1 bg-yellow-400/10 rounded hover:bg-yellow-400/20 transition">🔍 View</button>
                        <button onclick="window.adminNotifications.deletePopupNotification('${n.id}')" class="text-xs text-red-400 font-medium px-2 py-1 bg-red-500/10 rounded hover:bg-red-500/20 transition">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderApprovalItems() {
        if (this.pendingApprovals.length === 0) return '<p class="text-slate-400 text-xs py-2">No pending booking approvals found</p>';
        return this.pendingApprovals.map(apt => `
            <div class="bg-black/40 rounded-xl p-4 border border-yellow-400/20 text-sm space-y-3">
                <div class="space-y-1.5">
                    <p class="font-bold text-white text-base">👤 Customer Booking: <span class="text-yellow-400">${apt.purpose || 'Appointment'}</span></p>
                    <p class="text-slate-300">📧 Account: <span class="text-white">${apt.custId || 'N/A'}</span></p>
                    <p class="text-slate-300">📅 Schedule: <span class="text-white">${apt.date || 'N/A'} at ${apt.time || 'N/A'}</span></p>
                </div>
                <div class="flex gap-2 justify-end">
                    <button onclick="window.adminNotifications.approveBooking('${apt.id}', '${apt.custId}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs">✅ Approve</button>
                    <button onclick="window.adminNotifications.rejectBooking('${apt.id}', '${apt.custId}')" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs">❌ Reject</button>
                </div>
            </div>
        `).join('');
    }

    renderApprovedBinItems() {
        if (this.approvedItems.length === 0) return '<p class="text-slate-400 text-xs py-2">No approved appointments in archive</p>';
        return this.approvedItems.map(apt => `
            <div class="bg-black/40 rounded-xl p-4 border border-emerald-400/30 text-sm flex justify-between items-center">
                <div>
                    <p class="font-bold text-emerald-400">${apt.purpose || 'Appointment'} (${apt.custId})</p>
                    <p class="text-slate-300 text-xs">${apt.date} at ${apt.time}</p>
                </div>
                <button onclick="window.adminNotifications.deleteBooking('${apt.id}')" class="px-3 py-1 bg-red-600 text-white text-xs rounded">🗑️</button>
            </div>
        `).join('');
    }

    renderRejectedBinItems() {
        if (this.rejectedItems.length === 0) return '<p class="text-slate-400 text-xs py-2">No rejected appointments</p>';
        return this.rejectedItems.map(apt => `
            <div class="bg-black/40 rounded-xl p-4 border border-red-400/30 text-sm flex justify-between items-center">
                <div>
                    <p class="font-bold text-red-400">${apt.purpose || 'Appointment'} (${apt.custId})</p>
                    <p class="text-slate-300 text-xs">${apt.date} at ${apt.time}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="window.adminNotifications.restoreFromBin('${apt.id}', '${apt.custId}')" class="px-3 py-1 bg-blue-600 text-white text-xs rounded">↩️</button>
                    <button onclick="window.adminNotifications.deleteBooking('${apt.id}')" class="px-3 py-1 bg-red-600 text-white text-xs rounded">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    async approveBooking(aptId, custId) {
        if (!confirm('Approve this booking?')) return;
        await firebase.firestore().collection('customer_appointments').doc(aptId).update({ status: 'Approved' });
        await this.loadPendingApprovals();
    }

    async rejectBooking(aptId, custId) {
        if (!confirm('Reject this booking?')) return;
        await firebase.firestore().collection('customer_appointments').doc(aptId).update({ status: 'Rejected' });
        await this.loadPendingApprovals();
    }

    async restoreFromBin(aptId, custId) {
        await firebase.firestore().collection('customer_appointments').doc(aptId).update({ status: 'Pending Confirmation' });
        await this.loadPendingApprovals();
    }

    async deleteBooking(aptId) {
        await firebase.firestore().collection('customer_appointments').doc(aptId).delete();
        await this.loadPendingApprovals();
    }

    refreshUI() {
        const trayEl = document.getElementById('admin-notifications-tray');
        if (trayEl) trayEl.innerHTML = this.renderNotificationsTrayHtml();

        const approvalListEl = document.getElementById('admin-approval-list');
        if (approvalListEl) approvalListEl.innerHTML = this.renderApprovalItems();

        const countBadge = document.getElementById('pending-count-badge');
        if (countBadge) {
            countBadge.textContent = this.pendingApprovals.length;
            countBadge.style.display = this.pendingApprovals.length > 0 ? 'inline-block' : 'none';
        }
    }
}

if (typeof window !== 'undefined') {
    window.AdminNotifications = AdminNotifications;
}
