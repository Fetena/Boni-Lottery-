// ============================================
// ADMIN NOTIFICATIONS (CHILD COMPONENT) - FIXED ISOLATION
// Each admin ONLY sees their own customers' appointments
// ============================================

class AdminNotifications {
    constructor(adminId) {
        this.adminId = adminId;
        this.pendingApprovals = [];
    }

    render() {
        this.loadPendingApprovals();
        this.displayHistory();

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
                        <div id="admin-notif-history" class="space-y-2 text-sm text-slate-300"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // ========== FIXED: LOAD ONLY THIS ADMIN'S APPOINTMENTS ==========
    loadPendingApprovals() {
        try {
            this.pendingApprovals = [];
            const seenIds = new Set();
            
            // CRITICAL FIX: Use this admin's email as key, NOT random name formatting
            const adminKey = `admin_appointments_${this.adminId}`;
            
            // Load ONLY from THIS admin's key (NO fallback scan!)
            let items = JSON.parse(localStorage.getItem(adminKey) || '[]');
            
            items.forEach(item => {
                if (item && item.id && !seenIds.has(item.id)) {
                    const status = (item.status || '').toLowerCase();
                    // Include pending and unapproved items
                    if (status.includes('pending') || status.includes('unapproved') || status === 'pending confirmation') {
                        seenIds.add(item.id);
                        this.pendingApprovals.push(item);
                    }
                }
            });

            console.log(`✅ Loaded ${this.pendingApprovals.length} appointments for admin: ${this.adminId}`);
        } catch (e) {
            console.error('Error loading pending approvals', e);
            this.pendingApprovals = [];
        }
    }

    renderApprovalItems() {
        if (this.pendingApprovals.length === 0) {
            return '<p class="text-slate-400 text-xs py-2">No pending booking approvals found</p>';
        }

        return this.pendingApprovals.map(apt => `
            <div class="bg-black/40 rounded-xl p-4 border border-yellow-400/20 text-sm space-y-2 transition-all hover:border-yellow-400/40">
                <div class="flex justify-between items-start">
                    <div class="space-y-1 cursor-pointer select-text" onclick="alert('Customer: ${apt.custId || 'N/A'}\\nPurpose: ${apt.purpose}\\nDate: ${apt.date} at ${apt.time}\\nNote: ${apt.description || 'None'}')">
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
        try {
            const cleanAdminId = this.adminId.toLowerCase().replace(/[@.]/g, '_').replace(/\s+/g, '_');
            const approvedKey = `admin_appointments_approved_${cleanAdminId}`;
            const approvedItems = JSON.parse(localStorage.getItem(approvedKey) || '[]');

            if (approvedItems.length === 0) {
                return '<p class="text-slate-400 text-xs py-2">No approved appointments in archive</p>';
            }

            return approvedItems.map(apt => `
                <div class="bg-black/40 rounded-xl p-4 border border-emerald-400/30 text-sm space-y-2">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-emerald-400">✅ ${apt.purpose || 'Appointment'}</p>
                            <p class="text-slate-400">📧 ${apt.custId}</p>
                            <p class="text-slate-400">📅 ${apt.date} at ${apt.time}</p>
                        </div>
                    </div>
                    <div class="flex gap-2 justify-end pt-2">
                        <button onclick="window.adminNotifications.deleteFromApprovedArchive('${apt.id}')" 
                            class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded">🗑️ Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            console.error('Error rendering approved items', e);
            return '<p class="text-red-400 text-xs">Error loading approved items</p>';
        }
    }

    renderRejectedBinItems() {
        try {
            const cleanAdminId = this.adminId.toLowerCase().replace(/[@.]/g, '_').replace(/\s+/g, '_');
            const binKey = `admin_appointments_bin_${cleanAdminId}`;
            const binItems = JSON.parse(localStorage.getItem(binKey) || '[]');

            if (binItems.length === 0) {
                return '<p class="text-slate-400 text-xs py-2">No rejected appointments in bin</p>';
            }

            return binItems.map(apt => `
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
                        <button onclick="window.adminNotifications.deleteFromBin('${apt.id}')" 
                            class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded">🗑️ Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            console.error('Error rendering rejected items', e);
            return '<p class="text-red-400 text-xs">Error loading rejected items</p>';
        }
    }

    approveBooking(aptId, custId) {
        if (!confirm('Approve this booking?')) return;

        try {
            this.updateBookingStatusCore(aptId, custId, 'Confirmed');

            // Move from pending to approved archive
            const cleanAdminId = this.adminId.toLowerCase().replace(/[@.]/g, '_').replace(/\s+/g, '_');
            const adminKey = `admin_appointments_${this.adminId}`;
            const approvedKey = `admin_appointments_approved_${cleanAdminId}`;

            let items = JSON.parse(localStorage.getItem(adminKey) || '[]');
            const approved = items.find(i => i.id === aptId);
            
            if (approved) {
                approved.status = 'Confirmed';
                let approvedItems = JSON.parse(localStorage.getItem(approvedKey) || '[]');
                approvedItems.push(approved);
                localStorage.setItem(approvedKey, JSON.stringify(approvedItems));

                // Remove from pending
                items = items.filter(i => i.id !== aptId);
                localStorage.setItem(adminKey, JSON.stringify(items));
            }

            if (typeof notify === 'function') notify('success', '✅ Appointment approved');
            this.refreshUI();
        } catch (e) {
            console.error('Error approving booking', e);
        }
    }

    rejectBooking(aptId, custId) {
        if (!confirm('Reject this booking?')) return;

        try {
            this.updateBookingStatusCore(aptId, custId, 'Rejected');

            // Move from pending to rejected bin
            const cleanAdminId = this.adminId.toLowerCase().replace(/[@.]/g, '_').replace(/\s+/g, '_');
            const adminKey = `admin_appointments_${this.adminId}`;
            const binKey = `admin_appointments_bin_${cleanAdminId}`;

            let items = JSON.parse(localStorage.getItem(adminKey) || '[]');
            const rejected = items.find(i => i.id === aptId);

            if (rejected) {
                rejected.status = 'Rejected';
                let binItems = JSON.parse(localStorage.getItem(binKey) || '[]');
                binItems.push(rejected);
                localStorage.setItem(binKey, JSON.stringify(binItems));

                // Remove from pending
                items = items.filter(i => i.id !== aptId);
                localStorage.setItem(adminKey, JSON.stringify(items));
            }

            if (typeof notify === 'function') notify('info', '❌ Appointment rejected and moved to bin');
            this.refreshUI();
        } catch (e) {
            console.error('Error rejecting booking', e);
        }
    }

    restoreFromBin(aptId, custId) {
        if (!confirm('Restore this booking to pending?')) return;

        try {
            const cleanAdminId = this.adminId.toLowerCase().replace(/[@.]/g, '_').replace(/\s+/g, '_');
            const binKey = `admin_appointments_bin_${cleanAdminId}`;
            const adminKey = `admin_appointments_${this.adminId}`;

            let binItems = JSON.parse(localStorage.getItem(binKey) || '[]');
            const restored = binItems.find(i => i.id === aptId);

            if (restored) {
                restored.status = 'Pending Confirmation';
                let items = JSON.parse(localStorage.getItem(adminKey) || '[]');
                items.push(restored);
                localStorage.setItem(adminKey, JSON.stringify(items));

                // Remove from bin
                binItems = binItems.filter(i => i.id !== aptId);
                localStorage.setItem(binKey, JSON.stringify(binItems));
            }

            if (typeof notify === 'function') notify('success', '↩️ Appointment restored to pending');
            this.refreshUI();
        } catch (e) {
            console.error('Error restoring from bin', e);
        }
    }

    deleteBooking(aptId, custId) {
        if (!confirm('Delete this appointment permanently?')) return;

        try {
            const adminKey = `admin_appointments_${this.adminId}`;
            let items = JSON.parse(localStorage.getItem(adminKey) || '[]');
            items = items.filter(i => i.id !== aptId);
            localStorage.setItem(adminKey, JSON.stringify(items));

            if (typeof notify === 'function') notify('info', '🗑️ Appointment deleted successfully');
            this.refreshUI();
        } catch (e) {
            console.error('Error deleting booking', e);
        }
    }

    deleteFromBin(aptId) {
        if (!confirm('Permanently delete this rejected item from the bin?')) return;

        try {
            const cleanAdminId = this.adminId.toLowerCase().replace(/[@.]/g, '_').replace(/\s+/g, '_');
            const binKey = `admin_appointments_bin_${cleanAdminId}`;
            let binItems = JSON.parse(localStorage.getItem(binKey) || '[]');
            binItems = binItems.filter(item => item.id !== aptId);
            localStorage.setItem(binKey, JSON.stringify(binItems));

            if (typeof notify === 'function') notify('info', '🗑️ Item permanently deleted from bin');
            this.refreshUI();
        } catch (e) {
            console.error('Error deleting from bin', e);
        }
    }

    deleteFromApprovedArchive(aptId) {
        if (!confirm('Permanently delete this approved appointment record?')) return;

        try {
            const cleanAdminId = this.adminId.toLowerCase().replace(/[@.]/g, '_').replace(/\s+/g, '_');
            const approvedKey = `admin_appointments_approved_${cleanAdminId}`;
            let approvedItems = JSON.parse(localStorage.getItem(approvedKey) || '[]');
            approvedItems = approvedItems.filter(item => item.id !== aptId);
            localStorage.setItem(approvedKey, JSON.stringify(approvedItems));

            if (typeof notify === 'function') notify('info', '🗑️ Approved appointment deleted from archive');
            this.refreshUI();
        } catch (e) {
            console.error('Error deleting from approved archive', e);
        }
    }

    updateBookingStatusCore(aptId, custId, newStatus) {
        try {
            if (custId) {
                const customerStorageKey = `appointments_${custId}`;
                const customerItems = JSON.parse(localStorage.getItem(customerStorageKey) || '[]');
                const updatedCustomerItems = customerItems.map(item => {
                    if (item.id === aptId) {
                        return { ...item, status: newStatus };
                    }
                    return item;
                });
                localStorage.setItem(customerStorageKey, JSON.stringify(updatedCustomerItems));
                
                const custNotifKey = `customer_notifications_${custId}`;
                const custNotifs = JSON.parse(localStorage.getItem(custNotifKey) || '[]');
                custNotifs.push({
                    id: Date.now(),
                    message: `Your appointment status has been updated to ${newStatus}`,
                    status: newStatus,
                    timestamp: new Date().toLocaleTimeString(),
                    viewed: false
                });
                localStorage.setItem(custNotifKey, JSON.stringify(custNotifs));
            }

            this.updateBadgeCount();
        } catch (e) {
            console.error('Error updating booking status core', e);
        }
    }

    refreshUI() {
        this.loadPendingApprovals();
        const approvalListEl = document.getElementById('admin-approval-list');
        if (approvalListEl) approvalListEl.innerHTML = this.renderApprovalItems();

        const approvedListEl = document.getElementById('admin-approved-list');
        if (approvedListEl) approvedListEl.innerHTML = this.renderApprovedBinItems();

        const rejectedListEl = document.getElementById('admin-rejected-list');
        if (rejectedListEl) rejectedListEl.innerHTML = this.renderRejectedBinItems();
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

    // ========== FIXED: STORE NOTIFICATIONS BY ADMIN ==========
    sendNotification() {
        const type = document.getElementById('admin-notif-type')?.value;
        const message = document.getElementById('admin-notif-msg')?.value;
        const target = document.getElementById('admin-notif-target')?.value;

        if (!message) {
            if (typeof notify === 'function') notify('error', '❌ Enter message');
            return;
        }

        const notif = {
            id: Date.now(),
            adminId: this.adminId,
            type: type,
            message: message,
            target: target,
            timestamp: new Date().toLocaleTimeString(),
            channels: {
                telegram: document.getElementById('admin-notif-telegram')?.checked || false,
                email: document.getElementById('admin-notif-email')?.checked || false,
                sms: document.getElementById('admin-notif-sms')?.checked || false
            }
        };

        try {
            // Store notifications per admin, not globally!
            const adminNotifKey = `admin_notifications_${this.adminId}`;
            const notifs = JSON.parse(localStorage.getItem(adminNotifKey) || '[]');
            notifs.push(notif);
            localStorage.setItem(adminNotifKey, JSON.stringify(notifs));
        } catch (e) {
            console.error('Error saving notification', e);
        }

        if (typeof notify === 'function') notify('success', `✅ Notification sent to ${target}!`);
        document.getElementById('admin-notif-msg').value = '';
        this.displayHistory();
    }

    // ========== FIXED: DISPLAY ONLY THIS ADMIN'S NOTIFICATIONS ==========
    displayHistory() {
        try {
            // Load ONLY this admin's notifications
            const adminNotifKey = `admin_notifications_${this.adminId}`;
            const notifs = JSON.parse(localStorage.getItem(adminNotifKey) || '[]');
            const recent = notifs.slice(-5).reverse();
            const historyDiv = document.getElementById('admin-notif-history');
            
            if (historyDiv) {
                historyDiv.innerHTML = recent.length === 0 ? '<p class="text-slate-400">No notifications yet</p>' : recent.map(n => `
                    <p><strong>${n.type}:</strong> ${n.message ? n.message.substring(0, 50) : ''}... <span class="text-xs text-slate-500">(${n.timestamp})</span></p>
                `).join('');
            }

            this.updateBadgeCount();
        } catch (e) {
            console.error('Error loading notification history', e);
        }
    }
}

window.adminNotifications = null;
