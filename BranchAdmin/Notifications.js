// ============================================
// ADMIN NOTIFICATIONS - FIXED V10 (ACCURATE TOP NAVIGATION BADGE PLACEMENT)
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

        // Check and inject badge precisely over the "Notifications" top menu head
        setTimeout(() => this.updateTabBadge(), 300);
    }

    // Realtime listener for incoming customer bookings/appointments
    startAdminRealtimeListener() {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        const db = firebase.firestore();
        const currentAdminRaw = (this.adminId || localStorage.getItem('currentUserEmail') || localStorage.getItem('currentAdminEmail') || '').toString().toLowerCase().trim();

        if (this._unsubscribeAdminNotifs) this._unsubscribeAdminNotifs();

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

                            // Mark as notified immediately in firestore
                            db.collection('customer_appointments').doc(change.doc.id).update({ adminNotified: true }).catch(() => {});
                        }
                    }
                });

                if (hasNewUnnotified && latestApt) {
                    // New item arrived, reset viewed flag so badge shows up on the top navigation header
                    localStorage.removeItem('admin_notifications_viewed_' + this.adminId);
                    
                    const message = `New booking from ${latestApt.custId || 'Customer'} for ${latestApt.purpose || 'Appointment'} on ${latestApt.date || 'TBD'} at ${latestApt.time || 'TBD'}`;
                    this.showAdminPopupModal(message, latestApt.purpose || 'New Appointment Request');
                    if (typeof notify === 'function') {
                        notify('success', `🔔 ${message}`);
                    }
                }

                this.loadPendingApprovals();
            }, e => console.error('Admin real-time listener error:', e));
    }

    showAdminPopupModal(message, title) {
        const existing = document.getElementById('admin-popup-modal');
        if (existing) existing.remove();

        const modalHtml = `
            <div id="admin-popup-modal" style="position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.85); backdrop-filter: blur(4px); padding: 1rem;">
                <div class="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl" style="background: #000; border: 2px solid #facc15;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 28px;">🔔</span>
                        <div>
                            <h3 style="color: #fff; font-size: 18px; font-weight: bold; margin: 0;">${title}</h3>
                            <p style="color: #facc15; font-size: 12px; font-weight: 600; margin: 2px 0 0 0;">New Request Received</p>
                        </div>
                    </div>
                    <div style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 14px; color: #e2e8f0; line-height: 1.4;">
                        ${message}
                    </div>
                    <button onclick="document.getElementById('admin-popup-modal').remove(); window.adminNotifications?.loadPendingApprovals();" 
                        style="width: 100%; padding: 12px; background: #facc15; color: #000; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; font-size: 13px;">
                        View in Control Center
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    updateTabBadge() {
        const pendingCount = this.pendingApprovals.length;
        const isViewed = localStorage.getItem('admin_notifications_viewed_' + this.adminId) === 'true';
        const showBadge = pendingCount > 0 && !isViewed;

        // Precisely find the top navigation element containing "Notifications" (as shown in your red line image arrow pointing to the top menu)
        document.querySelectorAll('a, button, span, li').forEach(el => {
            const text = el.textContent ? el.textContent.trim() : '';
            // Ensure we match the top header nav item specifically and avoid container elements
            if (text === 'Notifications' || (text.includes('Notifications') && el.children.length <= 2)) {
                let badge = el.querySelector('#nav-head-badge');
                
                if (showBadge) {
                    if (getComputedStyle(el).position === 'static') {
                        el.style.position = 'relative';
                    }
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.id = 'nav-head-badge';
                        // Styled exactly like your red-circled badge on the top menu head
                        badge.style.cssText = 'position: absolute; top: -12px; right: -16px; background: #dc2626; color: #fff; font-size: 11px; font-weight: bold; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid #000; z-index: 50; pointer-events: none; box-shadow: 0 2px 4px rgba(0,0,0,0.5);';
                        el.appendChild(badge);
                    }
                    badge.textContent = pendingCount;
                    badge.style.display = 'flex';
                } else if (badge) {
                    badge.remove();
                }
            }
        });
    }

    render() {
        const pendingCount = this.pendingApprovals.length;

        // When the admin opens/views this Notifications panel, clear the badge count as requested ("when admin check it then it can disappear")
        localStorage.setItem('admin_notifications_viewed_' + this.adminId, 'true');
        setTimeout(() => this.updateTabBadge(), 100);

        return `
            <div class="space-y-6">
                <!-- TOP NOTIFICATION BANNER -->
                <div class="flex justify-between items-center bg-black/40 border border-yellow-400/20 p-4 rounded-2xl">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">🔔</span>
                        <div>
                            <h4 class="font-bold text-white text-sm">Notifications Control Center</h4>
                            <p class="text-xs text-slate-400">Manage pending approvals and system updates here</p>
                        </div>
                    </div>
                    <button onclick="window.adminNotifications.triggerManualPopup()" 
                        class="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl text-xs flex items-center gap-2">
                        <span>Show Popup</span>
                    </button>
                </div>

                <!-- APPROVALS SECTION -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-2xl font-bold text-white flex items-center gap-3">
                            ✅ Pending Approvals 
                            ${pendingCount > 0 ? `<span class="bg-yellow-400 text-black text-xs px-2.5 py-0.5 rounded-full font-bold">${pendingCount}</span>` : ''}
                        </h3>
                    </div>
                    <p class="text-xs text-slate-400">Manage customer booking and appointment approvals here.</p>
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

                        <div>
                            <label class="text-sm text-slate-400">Send Via</label>
                            <div class="flex gap-3 mt-2">
                                <label class="flex items-center text-sm text-slate-300">
                                    <input type="checkbox" id="admin-notif-telegram" checked class="mr-2"> Telegram
                                </label>
                                <label class="flex items-center text-sm text-slate-300">
                                    <input type="checkbox" id="admin-notif-email" class="mr-2"> Email
                                </label>
                                <label class="flex items-center text-sm text-slate-300">
                                    <input type="checkbox" id="admin-notif-sms" class="mr-2"> SMS
                                </label>
                            </div>
                        </div>

                        <div>
                            <label class="text-sm text-slate-400">Target</label>
                            <select id="admin-notif-target" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                                <option>All Customers</option>
                                <option>Unpaid</option>
                                <option>Active</option>
                            </select>
                        </div>

                        <button onclick="window.adminNotifications.sendNotification()" 
                            class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">Send</button>
                    </div>

                    <!-- NOTIFICATION HISTORY -->
                    <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                        <h4 class="font-bold text-white mb-3">Recent Notifications (This Admin Only)</h4>
                        <div id="admin-notif-history" class="space-y-2 text-sm text-slate-300">
                            ${this.renderNotificationHistoryHtml()}
                        </div>
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
            this.showAdminPopupModal(message, `Pending Requests (${count})`);
        } else {
            this.showAdminPopupModal('No pending bookings found to show right now.', 'System Notification');
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
                    const status = (item.status || '').toLowerCase();
                    if (status.includes('pending') || status.includes('unapproved') || status === 'pending confirmation' || !item.status) {
                        this.pendingApprovals.push(item);
                    } else if (status === 'confirmed' || status === 'approved') {
                        this.approvedItems.push(item);
                    } else if (status === 'rejected') {
                        this.rejectedItems.push(item);
                    }
                }
            });

            const notifSnapshot = await db.collection('admin_notifications').get();
            this.adminNotificationsList = notifSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(n => {
                    const nAdmin = (n.adminId || n.adminEmail || '').toString().toLowerCase().trim();
                    return currentAdminRaw ? (nAdmin === currentAdminRaw || !nAdmin) : true;
                });

            this.refreshUI();
            this.updateTabBadge();
        } catch (e) {
            console.error('Error loading approvals from Firebase', e);
        } finally {
            this._isLoading = false;
        }
    }

    renderApprovalItems() {
        if (this.pendingApprovals.length === 0) {
            return '<p class="text-slate-400 text-xs py-2">No pending booking approvals found</p>';
        }

        return this.pendingApprovals.map(apt => `
            <div class="bg-black/40 rounded-xl p-4 border border-yellow-400/20 text-sm space-y-2">
                <div class="flex justify-between items-start">
                    <div class="space-y-1">
                        <p class="font-bold text-white text-base">👤 Customer Booking: <span class="text-yellow-400">${apt.purpose || 'Appointment'}</span></p>
                        <p class="text-slate-300">📧 Account: <span class="text-white">${apt.custId || 'N/A'}</span></p>
                        <p class="text-slate-300">📅 Schedule: <span class="text-white">${apt.date || 'N/A'} at ${apt.time || 'N/A'}</span></p>
                        <p class="text-slate-400 bg-black/30 p-2 rounded-lg border border-white/5 mt-1">📝 Note: ${apt.description || 'None'}</p>
                    </div>
                </div>
                <div class="flex gap-2 pt-2 border-t border-white/5 justify-end">
                    <button onclick="window.adminNotifications.approveBooking('${apt.id}', '${apt.custId}')" 
                        class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs">✅ Approve</button>
                    <button onclick="window.adminNotifications.rejectBooking('${apt.id}', '${apt.custId}')" 
                        class="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs">❌ Reject</button>
                    <button onclick="window.adminNotifications.deleteBooking('${apt.id}', '${apt.custId}')" 
                        class="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-red-400 font-bold rounded-lg text-xs">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    renderApprovedBinItems() {
        if (this.approvedItems.length === 0) {
            return '<p class="text-slate-400 text-xs py-2">No approved appointments in archive</p>';
        }
        return this.approvedItems.map(apt => `
            <div class="bg-black/40 rounded-xl p-4 border border-emerald-400/30 text-sm space-y-2">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-emerald-400">✅ ${apt.purpose || 'Appointment'}</p>
                        <p class="text-slate-400">📧 ${apt.custId}</p>
                        <p class="text-slate-400">📅 ${apt.date} at ${apt.time}</p>
                    </div>
                    <button onclick="window.adminNotifications.deleteBooking('${apt.id}', '${apt.custId}')" class="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    renderRejectedBinItems() {
        if (this.rejectedItems.length === 0) {
            return '<p class="text-slate-400 text-xs py-2">No rejected appointments in bin</p>';
        }
        return this.rejectedItems.map(apt => `
            <div class="bg-black/40 rounded-xl p-4 border border-red-400/30 text-sm space-y-2">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-red-400">❌ ${apt.purpose || 'Appointment'}</p>
                        <p class="text-slate-400">📧 ${apt.custId}</p>
                        <p class="text-slate-400">📅 ${apt.date} at ${apt.time}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.adminNotifications.restoreFromBin('${apt.id}', '${apt.custId}')" class="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded">↩️ Restore</button>
                        <button onclick="window.adminNotifications.deleteBooking('${apt.id}', '${apt.custId}')" class="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">🗑️ Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderNotificationHistoryHtml() {
        const recent = this.adminNotificationsList.slice(-5).reverse();
        if (recent.length === 0) return '<p class="text-slate-400 text-xs">No notifications sent yet</p>';
        return recent.map(n => `
            <div class="bg-black/30 p-3 rounded-lg border border-yellow-400/10 space-y-1">
                <p class="font-bold text-yellow-400 text-xs">${n.type || 'Notification'}</p>
                <p class="text-white text-sm">${n.message}</p>
                <p class="text-[10px] text-slate-500">${n.timestamp || ''}</p>
            </div>
        `).join('');
    }

    async approveBooking(aptId, custId) {
        if (!confirm('Approve this booking?')) return;
        await this.updateBookingStatusCore(aptId, custId, 'Approved');
        if (typeof notify === 'function') {
            notify('success', '✅ Appointment approved');
        } else {
            alert('✅ Appointment approved');
        }
        await this.loadPendingApprovals();
    }

    async rejectBooking(aptId, custId) {
        if (!confirm('Reject this booking?')) return;
        await this.updateBookingStatusCore(aptId, custId, 'Rejected');
        if (typeof notify === 'function') {
            notify('info', '❌ Appointment rejected and moved to bin');
        } else {
            alert('❌ Appointment rejected and moved to bin');
        }
        await this.loadPendingApprovals();
    }

    async restoreFromBin(aptId, custId) {
        if (!confirm('Restore this booking to pending?')) return;
        await this.updateBookingStatusCore(aptId, custId, 'Pending Confirmation');
        if (typeof notify === 'function') {
            notify('success', '↩️ Appointment restored to pending');
        } else {
            alert('↩️ Appointment restored to pending');
        }
        await this.loadPendingApprovals();
    }

    async deleteBooking(aptId, custId) {
        if (!confirm('Delete this appointment permanently?')) return;
        try {
            const db = firebase.firestore();
            await db.collection('customer_appointments').doc(aptId).delete();
            if (typeof notify === 'function') {
                notify('info', '🗑️ Appointment deleted successfully');
            } else {
                alert('🗑️ Appointment deleted successfully');
            }
            await this.loadPendingApprovals();
        } catch (e) {
            console.error('Error deleting booking', e);
        }
    }

    async updateBookingStatusCore(aptId, custId, newStatus) {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        try {
            const db = firebase.firestore();
            await db.collection('customer_appointments').doc(aptId).update({ status: newStatus });

            if (custId) {
                await db.collection('customer_notifications').add({
                    custId: custId,
                    message: `Your appointment status has been updated to ${newStatus}`,
                    status: newStatus,
                    timestamp: new Date().toLocaleTimeString(),
                    viewed: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (e) {
            console.error('Error updating booking status', e);
        }
    }

    refreshUI() {
        const approvalListEl = document.getElementById('admin-approval-list');
        if (approvalListEl) approvalListEl.innerHTML = this.renderApprovalItems();

        const approvedListEl = document.getElementById('admin-approved-list');
        if (approvedListEl) approvedListEl.innerHTML = this.renderApprovedBinItems();

        const rejectedListEl = document.getElementById('admin-rejected-list');
        if (rejectedListEl) rejectedListEl.innerHTML = this.renderRejectedBinItems();

        const historyDiv = document.getElementById('admin-notif-history');
        if (historyDiv) historyDiv.innerHTML = this.renderNotificationHistoryHtml();
    }

    async sendNotification() {
        const type = document.getElementById('admin-notif-type')?.value;
        const message = document.getElementById('admin-notif-msg')?.value;
        const target = document.getElementById('admin-notif-target')?.value;

        if (!message) {
            if (typeof notify === 'function') {
                notify('error', '❌ Please enter a notification message');
            } else {
                alert('❌ Please enter a notification message');
            }
            return;
        }

        const currentAdminRaw = (this.adminId || localStorage.getItem('currentUserEmail') || 'admin').toString().toLowerCase().trim();

        const notif = {
            adminId: currentAdminRaw,
            adminEmail: currentAdminRaw,
            type,
            message,
            target,
            timestamp: new Date().toLocaleTimeString(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const db = firebase.firestore();
            await db.collection('admin_notifications').add(notif);
            
            if (typeof notify === 'function') {
                notify('success', `✅ Notification sent to ${target}!`);
            } else {
                alert(`✅ Notification sent to ${target}!`);
            }
            
            const msgInput = document.getElementById('admin-notif-msg');
            if (msgInput) msgInput.value = '';

            await this.loadPendingApprovals();
        } catch (e) {
            console.error('Error sending notification', e);
            if (typeof notify === 'function') {
                notify('error', '❌ Failed to send notification');
            } else {
                alert('❌ Failed to send notification');
            }
        }
    }
}
