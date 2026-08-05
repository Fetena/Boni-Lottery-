// ============================================
// ADMIN NOTIFICATIONS - COMPLETE CLEAN CLASS
// ============================================

class AdminNotifications {
    constructor(adminId) {
        // Fallback robustly to localStorage if adminId parameter wasn't passed directly
        this.adminId = adminId || localStorage.getItem('currentUserEmail') || localStorage.getItem('currentAdminEmail') || '';
        this.pendingApprovals = [];
        this.approvedItems = [];
        this.rejectedItems = [];
        this.adminNotificationsList = [];
        this._isLoading = false;
        
        this.loadPendingApprovals();
    }

    render() {
        return `
            <div class="space-y-6">
                <!-- APPROVALS SECTION -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h3 class="text-2xl font-bold text-white">✅ Pending Approvals</h3>
                    <p class="text-xs text-slate-400">Manage customer booking and appointment approvals here.</p>
                    <div id="admin-approval-list" class="space-y-3">
                        ${this.pendingApprovals.length === 0 ? '<p class="text-slate-400 text-xs py-2">Loading approvals from Firebase...</p>' : this.renderApprovalItems()}
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

    async loadPendingApprovals() {
        if (typeof firebase === 'undefined' || !firebase.firestore || this._isLoading) return;
        this._isLoading = true;
        try {
            const db = firebase.firestore();
            
            // Get clean lowercase identifier
            const currentAdminRaw = (this.adminId || localStorage.getItem('currentUserEmail') || localStorage.getItem('currentAdminEmail') || '').toString().toLowerCase().trim();
            
            // DEBUG: Log which admin is loading
            console.log(`🔍 Admin Loading Appointments - Email: ${currentAdminRaw || '(empty)'}`);

            const snapshot = await db.collection('customer_appointments').get();
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            this.pendingApprovals = [];
            this.approvedItems = [];
            this.rejectedItems = [];

            items.forEach(item => {
                const itemAdminEmail = (item.adminEmail || '').toString().toLowerCase().trim();
                const itemAdminName = (item.adminName || '').toString().toLowerCase().trim();

                // FIXED: STRICT ISOLATION - Only match if adminEmail exactly matches THIS admin's email
                // REMOVED fallback (!itemAdminEmail) that was causing all admins to see all appointments
                const isMatch = currentAdminRaw && itemAdminEmail === currentAdminRaw;
                
                // DEBUG: Log matching details
                if (itemAdminEmail) {
                    console.log(`  Appointment Admin: ${itemAdminEmail} | Match: ${isMatch}`);
                }

                if (isMatch) {
                    const status = (item.status || '').toLowerCase();
                    if (status.includes('pending') || status.includes('unapproved') || status === 'pending confirmation') {
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
                    const nAdmin = (n.adminId || '').toString().toLowerCase().trim();
                    // FIXED: STRICT ISOLATION - Only include notifications from THIS admin
                    // REMOVED || !nAdmin fallback that was showing all admins' notifications
                    const matches = currentAdminRaw && nAdmin === currentAdminRaw;
                    if (nAdmin) console.log(`  Notification from: ${nAdmin} | Match: ${matches}`);
                    return matches;
                });

            this.refreshUI();
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
        if (typeof notify === 'function') notify('success', '✅ Appointment approved');
        await this.loadPendingApprovals();
    }

    async rejectBooking(aptId, custId) {
        if (!confirm('Reject this booking?')) return;
        await this.updateBookingStatusCore(aptId, custId, 'Rejected');
        if (typeof notify === 'function') notify('info', '❌ Appointment rejected and moved to bin');
        await this.loadPendingApprovals();
    }

    async restoreFromBin(aptId, custId) {
        if (!confirm('Restore this booking to pending?')) return;
        await this.updateBookingStatusCore(aptId, custId, 'Pending Confirmation');
        if (typeof notify === 'function') notify('success', '↩️ Appointment restored to pending');
        await this.loadPendingApprovals();
    }

    async deleteBooking(aptId, custId) {
        if (!confirm('Delete this appointment permanently?')) return;
        try {
            const db = firebase.firestore();
            await db.collection('customer_appointments').doc(aptId).delete();
            if (typeof notify === 'function') notify('info', '🗑️ Appointment deleted successfully');
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
            if (typeof notify === 'function') notify('error', '❌ Please enter a notification message');
            return;
        }

        const currentAdminRaw = (this.adminId || localStorage.getItem('currentUserEmail') || 'admin').toString().toLowerCase().trim();

        const notif = {
            adminId: currentAdminRaw,
            type,
            message,
            target,
            timestamp: new Date().toLocaleTimeString(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const db = firebase.firestore();
            await db.collection('admin_notifications').add(notif);
            
            if (typeof notify === 'function') notify('success', `✅ Notification sent to ${target}!`);
            
            const msgInput = document.getElementById('admin-notif-msg');
            if (msgInput) msgInput.value = '';

            await this.loadPendingApprovals();
        } catch (e) {
            console.error('Error sending notification', e);
            if (typeof notify === 'function') notify('error', '❌ Failed to send notification');
        }
    }
}
