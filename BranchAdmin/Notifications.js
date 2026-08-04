// ============================================
// ADMIN NOTIFICATIONS - FIREBASE VERSION
// ============================================

class AdminNotifications {
    constructor(adminId) {
        this.adminId = adminId;
        this.pendingApprovals = [];
        this.approvedItems = [];
        this.rejectedItems = [];
        this.adminNotificationsList = [];
    }

    render() {
        this.loadPendingApprovals();

        return `
            <div class="space-y-6">
                <!-- APPROVALS SECTION -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h3 class="text-2xl font-bold text-white">✅ Pending Approvals</h3>
                    <p class="text-xs text-slate-400">Manage customer booking and appointment approvals here.</p>
                    <div id="admin-approval-list" class="space-y-3">
                        ${this.renderApprovalItems()}
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
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        try {
            const db = firebase.firestore();
            const currentAdminRaw = (this.adminId || '').toString().toLowerCase().trim();
            const adminUserPart = currentAdminRaw.split('@')[0];

            const snapshot = await db.collection('customer_appointments')
                .where('adminEmail', '==', currentAdminRaw)
                .get();

            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            this.pendingApprovals = [];
            this.approvedItems = [];
            this.rejectedItems = [];

            items.forEach(item => {
                const status = (item.status || '').toLowerCase();
                if (status.includes('pending') || status.includes('unapproved') || status === 'pending confirmation') {
                    this.pendingApprovals.push(item);
                } else if (status === 'confirmed' || status === 'approved') {
                    this.approvedItems.push(item);
                } else if (status === 'rejected') {
                    this.rejectedItems.push(item);
                }
            });

            // Also load admin notifications history
            const notifSnapshot = await db.collection('admin_notifications')
                .where('adminId', '==', this.adminId)
                .get();
            this.adminNotificationsList = notifSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            this.updateBadgeCount();
        } catch (e) {
            console.error('Error loading approvals from Firebase', e);
        }
    }

    renderApprovalItems() {
        if (this.pendingApprovals.length === 0) {
            return '<p class="text-slate-400 text-xs py-2">No pending booking approvals found</p>';
        }

        return this.pendingApprovals.map(apt => `
            <div class="bg-black/40 rounded-xl p-4 border border-yellow-400/20 text-sm space-y-2 transition-all hover:border-yellow-400/40">
                <div class="flex justify-between items-start">
                    <div class="space-y-1 cursor-pointer select-text">
                        <p class="font-bold text-white text-base">👤 Customer Booking: <span class="text-yellow-400">${apt.purpose || 'Appointment'}</span></p>
                        <p class="text-slate-300">📧 Account: <span class="text-white">${apt.custId || 'N/A'}</span></p>
                        <p class="text-slate-300">📅 Schedule: <span class="text-white">${apt.date || 'N/A'} at ${apt.time || 'N/A'}</span></p>
                        <p class="text-slate-400 bg-black/30 p-2 rounded-lg border border-white/5 mt-1">📝 Note: ${apt.description || 'None'}</p>
                    </div>
                </div>
                <div class="flex gap-2 pt-2 border-t border-white/5 justify-end">
                    <button onclick="window.adminNotifications.approveBooking('${apt.id}', '${apt.custId}')" 
                        class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors">✅ Approve</button>
                    <button onclick="window.adminNotifications.rejectBooking('${apt.id}', '${apt.custId}')" 
                        class="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-colors">❌ Reject (Bin)</button>
                    <button onclick="window.adminNotifications.deleteBooking('${apt.id}', '${apt.custId}')" 
                        class="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-red-400 font-bold rounded-lg text-xs transition-colors">🗑️ Delete</button>
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
                </div>
                <div class="flex gap-2 justify-end pt-2">
                    <button onclick="window.adminNotifications.deleteBooking('${apt.id}', '${apt.custId}')" 
                        class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded">🗑️ Delete</button>
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
                </div>
                <div class="flex gap-2 justify-end pt-2">
                    <button onclick="window.adminNotifications.restoreFromBin('${apt.id}', '${apt.custId}')" 
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded">↩️ Restore</button>
                    <button onclick="window.adminNotifications.deleteBooking('${apt.id}', '${apt.custId}')" 
                        class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    renderNotificationHistoryHtml() {
        const recent = this.adminNotificationsList.slice(-5).reverse();
        if (recent.length === 0) return '<p class="text-slate-400">No notifications yet</p>';
        return recent.map(n => `
            <p><strong>${n.type}:</strong> ${n.message ? n.message.substring(0, 50) : ''}... <span class="text-xs text-slate-500">(${n.timestamp})</span></p>
        `).join('');
    }

    async approveBooking(aptId, custId) {
        if (!confirm('Approve this booking?')) return;
        await this.updateBookingStatusCore(aptId, custId, 'Confirmed');
        if (typeof notify === 'function') notify('success', '✅ Appointment approved');
        await this.loadPendingApprovals();
        this.refreshUI();
    }

    async rejectBooking(aptId, custId) {
        if (!confirm('Reject this booking?')) return;
        await this.updateBookingStatusCore(aptId, custId, 'Rejected');
        if (typeof notify === 'function') notify('info', '❌ Appointment rejected and moved to bin');
        await this.loadPendingApprovals();
        this.refreshUI();
    }

    async restoreFromBin(aptId, custId) {
        if (!confirm('Restore this booking to pending?')) return;
        await this.updateBookingStatusCore(aptId, custId, 'Pending Confirmation');
        if (typeof notify === 'function') notify('success', '↩️ Appointment restored to pending');
        await this.loadPendingApprovals();
        this.refreshUI();
    }

    async deleteBooking(aptId, custId) {
        if (!confirm('Delete this appointment permanently?')) return;
        try {
            const db = firebase.firestore();
            await db.collection('customer_appointments').doc(aptId).delete();
            if (typeof notify === 'function') notify('info', '🗑️ Appointment deleted successfully');
            await this.loadPendingApprovals();
            this.refreshUI();
        } catch (e) {
            console.error('Error deleting booking from Firebase', e);
        }
    }

    async updateBookingStatusCore(aptId, custId, newStatus) {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        try {
            const db = firebase.firestore();
            // Update appointment status in Firestore
            await db.collection('customer_appointments').doc(aptId).update({ status: newStatus });

            // Push notification to customer collection in Firestore
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
            console.error('Error updating booking status in Firebase', e);
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

    updateBadgeCount() {
        const pendingCount = this.pendingApprovals.length;
        const possibleBadgeIds = ['badge-branch-notifications', 'notification-badge', 'notif-badge'];
        possibleBadgeIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (pendingCount > 0) {
                    el.textContent = pendingCount;
                    el.classList.remove('hidden');
                } else {
                    el.textContent = '0';
                    el.classList.add('hidden');
                }
            }
        });
    }

    async sendNotification() {
        const type = document.getElementById('admin-notif-type')?.value;
        const message = document.getElementById('admin-notif-msg')?.value;
        const target = document.getElementById('admin-notif-target')?.value;

        if (!message) {
            if (typeof notify === 'function') notify('error', '❌ Enter message');
            return;
        }

        const notif = {
            adminId: this.adminId,
            type: type,
            message: message,
            target: target,
            timestamp: new Date().toLocaleTimeString(),
            channels: {
                telegram: document.getElementById('admin-notif-telegram')?.checked || false,
                email: document.getElementById('admin-notif-email')?.checked || false,
                sms: document.getElementById('admin-notif-sms')?.checked || false
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const db = firebase.firestore();
            await db.collection('admin_notifications').add(notif);
            if (typeof notify === 'function') notify('success', `✅ Notification sent to ${target}!`);
            document.getElementById('admin-notif-msg').value = '';
            await this.loadPendingApprovals();
            this.refreshUI();
        } catch (e) {
            console.error('Error saving notification to Firebase', e);
        }
    }
}

window.adminNotifications = null;
