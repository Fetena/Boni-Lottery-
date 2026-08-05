// ============================================
// ADMIN NOTIFICATIONS - FIXED V17 (SYNTAX & REFERENCE FIX)
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
                    this.showExternalPopup(message, latestApt.purpose || 'New Appointment Request');
                    if (typeof notify === 'function') {
                        notify('success', `🔔 ${message}`);
                    }
                }

                this.loadPendingApprovals();
            }, e => console.error('Admin real-time listener error:', e));
    }

    showExternalPopup(message, title) {
        const existing = document.getElementById('admin-external-popup');
        if (existing) existing.remove();

        const modalHtml = `
            <div id="admin-external-popup" style="position: fixed; top: 20px; right: 20px; z-index: 999999; max-width: 380px; width: 100%; background: #000; border: 2px solid #facc15; border-radius: 12px; padding: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.8); animation: slideInRight 0.3s ease;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <span style="font-size: 24px;">🔔</span>
                    <div style="flex: 1;">
                        <h4 style="color: #fff; font-size: 15px; font-weight: bold; margin: 0 0 4px 0;">${title}</h4>
                        <p style="color: #cbd5e1; font-size: 13px; margin: 0 0 12px 0; line-height: 1.4;">${message}</p>
                        <button onclick="window.adminNotifications.dismissExternalPopup()" 
                            style="width: 100%; padding: 8px; background: #facc15; color: #000; font-weight: bold; border-radius: 6px; border: none; cursor: pointer; font-size: 12px;">
                            Got It & View in Center
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    dismissExternalPopup() {
        const popup = document.getElementById('admin-external-popup');
        if (popup) popup.remove();
        this.loadPendingApprovals();
    }

    updateTabBadge() {
        const pendingCount = this.pendingApprovals.length;
        const isViewed = localStorage.getItem('admin_notifications_viewed_' + this.adminId) === 'true';
        const showBadge = pendingCount > 0 && !isViewed;

        document.querySelectorAll('a, button, span, li, div').forEach(el => {
            const text = el.textContent ? el.textContent.trim() : '';
            if (text === 'Notifications' || text.startsWith('Notifications')) {
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
                            <p class="text-xs text-slate-400">Manage pending approvals and review customer files here</p>
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
            this.showExternalPopup(message, `Pending Requests (${count})`);
        } else {
            this.showExternalPopup('No pending bookings found to show right now.', 'System Notification');
        }
    }

    async loadData() {
        await this.loadPendingApprovals();
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

        return this.pendingApprovals.map(apt => {
            const hasFiles = apt.fileUrl || apt.attachment || apt.fileData;
            const isFilesRead = apt.filesRead === true;

            return `
                <div class="bg-black/40 rounded-xl p-4 border border-yellow-400/20 text-sm space-y-3 relative z-10">
                    <div class="flex justify-between items-start">
                        <div class="space-y-1.5 w-full">
                            <p class="font-bold text-white text-base">👤 Customer Booking: <span class="text-yellow-400">${apt.purpose || 'Appointment'}</span></p>
                            <p class="text-slate-300">📧 Account: <span class="text-white">${apt.custId || 'N/A'}</span></p>
                            <p class="text-slate-300">📅 Schedule: <span class="text-white">${apt.date || 'N/A'} at ${apt.time || 'N/A'}</span></p>
                            <p class="text-slate-200 bg-black/60 p-3 rounded-lg border border-yellow-400/20 mt-2 font-medium">📝 Note: ${apt.description || 'None'}</p>
                        </div>
                    </div>

                    <!-- File Review & Lock Component -->
                    <div class="flex flex-col md:flex-row justify-between items-center gap-3 pt-2 border-t border-white/10">
                        <div class="w-full">
                            ${hasFiles ? `
                                <div class="p-3 bg-black/80 rounded-xl border ${isFilesRead ? 'border-emerald-500/40' : 'border-red-500/60'} space-y-2">
                                    <p class="text-xs font-bold ${isFilesRead ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-1.5">
                                        ${isFilesRead ? '📂 Files Read & Verified' : '⚠️ Action Required: Read Attached Files First'}
                                    </p>
                                    <a href="${apt.fileUrl || apt.attachment || apt.fileData || '#'}" target="_blank" onclick="window.adminNotifications.markFilesRead('${apt.id}')" class="inline-block px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition">Open & Read Customer Files</a>
                                </div>
                            ` : `
                                <span class="text-xs text-slate-400 italic">No attached files required for this booking.</span>
                            `}
                        </div>

                        <div class="flex gap-2 justify-end relative z-20 w-full md:w-auto shrink-0">
                            <button type="button" onclick="window.adminNotifications.approveBooking('${apt.id}', '${apt.custId}')" 
                                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-lg ${hasFiles && !isFilesRead ? 'opacity-40 cursor-not-allowed' : ''}"
                                ${hasFiles && !isFilesRead ? 'title="Please open and read customer files before approving"' : ''}>
                                ✅ Approve
                            </button>
                            <button type="button" onclick="window.adminNotifications.rejectBooking('${apt.id}', '${apt.custId}')" 
                                class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-lg">❌ Reject</button>
                            <button type="button" onclick="window.adminNotifications.deleteBooking('${apt.id}', '${apt.custId}')" 
                                class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-red-400 font-bold rounded-lg text-xs cursor-pointer shadow-lg">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async markFilesRead(aptId) {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        try {
            const db = firebase.firestore();
            await db.collection('customer_appointments').doc(aptId).update({ filesRead: true });
            await this.loadPendingApprovals();
            if (typeof notify === 'function') notify('success', '📂 Files marked as read. Approval unlocked!');
        } catch (e) {
            console.error('Error updating filesRead status:', e);
        }
    }

    renderApprovedBinItems() {
        if (this.approvedItems.length === 0) {
            return '<p class="text-slate-400 text-xs py-2">No approved appointments in archive</p>';
        }
        return this.approvedItems.map(apt => `
            <div class="bg-black/40 rounded-xl p-4 border border-emerald-400/30 text-sm space-y-2 relative z-10">
                <div class="flex justify-between items-start">
                    <div class="space-y-1">
                        <p class="font-bold text-emerald-400 text-base">✅ ${apt.purpose || 'Appointment'}</p>
                        <p class="text-slate-300">📧 Account: <span class="text-white">${apt.custId}</span></p>
                        <p class="text-slate-300">📅 Schedule: <span class="text-white">${apt.date} at ${apt.time}</span></p>
                        <p class="text-slate-200 bg-black/60 p-2.5 rounded-lg border border-emerald-400/20 mt-1 font-medium">📝 Note: ${apt.description || 'None'}</p>
                    </div>
                    <button type="button" onclick="window.adminNotifications.deleteBooking('${apt.id}', '${apt.custId}')" class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded cursor-pointer relative z-20">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    renderRejectedBinItems() {
        if (this.rejectedItems.length === 0) {
            return '<p class="text-slate-400 text-xs py-2">No rejected appointments in bin</p>';
        }
        return this.rejectedItems.map(apt => `
            <div class="bg-black/40 rounded-xl p-4 border border-red-400/30 text-sm space-y-2 relative z-10">
                <div class="flex justify-between items-start">
                    <div class="space-y-1">
                        <p class="font-bold text-red-400 text-base">❌ ${apt.purpose || 'Appointment'}</p>
                        <p class="text-slate-300">📧 Account: <span class="text-white">${apt.custId}</span></p>
                        <p class="text-slate-300">📅 Schedule: <span class="text-white">${apt.date} at ${apt.time}</span></p>
                        <p class="text-slate-200 bg-black/60 p-2.5 rounded-lg border border-red-400/20 mt-1 font-medium">📝 Note: ${apt.description || 'None'}</p>
                    </div>
                    <div class="flex gap-2 relative z-20">
                        <button type="button" onclick="window.adminNotifications.restoreFromBin('${apt.id}', '${apt.custId}')" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded cursor-pointer">↩️ Restore</button>
                        <button type="button" onclick="window.adminNotifications.deleteBooking('${apt.id}', '${apt.custId}')" class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded cursor-pointer">🗑️ Delete</button>
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
        const apt = this.pendingApprovals.find(a => a.id === aptId);
        const hasFiles = apt && (apt.fileUrl || apt.attachment || apt.fileData);
        if (hasFiles && apt.filesRead !== true) {
            if (typeof notify === 'function') {
                notify('error', '❌ Please read customer files before approving!');
            } else {
                alert('❌ Please read customer files before approving!');
            }
            return;
        }

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

    async deleteBooking(aptId, custId, custId) {
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
