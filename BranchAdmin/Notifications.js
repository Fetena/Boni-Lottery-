// ============================================
// ADMIN NOTIFICATIONS (CHILD COMPONENT) - FIXED
// Parent: AdminDashboard
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
                        <h4 class="font-bold text-white mb-3">Recent Notifications</h4>
                        <div id="admin-notif-history" class="space-y-2 text-sm text-slate-300"></div>
                    </div>
                </div>
            </div>
        `;
    }

 loadPendingApprovals() {
        try {
            this.pendingApprovals = [];
            const seenIds = new Set();
            
            const cleanAdminId = (this.adminId || 'admin').toLowerCase().replace(/[@.]/g, '_').replace(/\s+/g, '_');
            
            // 1. Check all admin_appointments keys to properly map items regardless of strict string formatting mismatches
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('admin_appointments_')) {
                    try {
                        const items = JSON.parse(localStorage.getItem(key) || '[]');
                        items.forEach(item => {
                            if (item && item.id && !seenIds.has(item.id)) {
                                const status = (item.status || '').toLowerCase();
                                const targetAdmin = (item.adminName || '').toLowerCase().replace(/[@.]/g, '_').replace(/\s+/g, '_');
                                
                                // Show items that are pending, or fall back to show items if they belong to this admin or general queue
                                const isForThisAdmin = targetAdmin.includes(cleanAdminId) || cleanAdminId.includes(targetAdmin) || key.includes(cleanAdminId);
                                
                                if ((status.includes('pending') || status.includes('unapproved')) && isForThisAdmin) {
                                    seenIds.add(item.id);
                                    this.pendingApprovals.push(item);
                                }
                            }
                        });
                    } catch (e) {}
                }
            }
            
            console.log(`Loaded pending approvals for admin [${cleanAdminId}]:`, this.pendingApprovals);
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

    approveBooking(aptId, custId) {
        this.updateBookingStatus(aptId, custId, 'Approved');
        notify('success', '✅ Booking approved successfully!');
    }

    rejectBooking(aptId, custId) {
        try {
            const cleanAdminId = (this.adminId || 'admin').toLowerCase().replace(/[@.]/g, '_').replace(/\s+/g, '_');
            const queueKey = `admin_appointments_${cleanAdminId}`;
            
            let targetItem = null;
            
            // Find and remove from active queues, saving into rejected bin
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('admin_appointments_') && !key.includes('_bin')) {
                    let items = JSON.parse(localStorage.getItem(key) || '[]');
                    const found = items.find(item => item.id === aptId);
                    if (found) targetItem = found;
                    items = items.filter(item => item.id !== aptId);
                    localStorage.setItem(key, JSON.stringify(items));
                }
            }

            if (targetItem) {
                targetItem.status = 'Rejected';
                const binKey = `admin_appointments_bin_${cleanAdminId}`;
                const binItems = JSON.parse(localStorage.getItem(binKey) || '[]');
                binItems.push(targetItem);
                localStorage.setItem(binKey, JSON.stringify(binItems));
            }

            this.updateBookingStatusCore(aptId, custId, 'Rejected');
            notify('error', '❌ Booking request moved to reject bin');
            this.loadPendingApprovals();
            
            const listEl = document.getElementById('admin-approval-list');
            if (listEl) listEl.innerHTML = this.renderApprovalItems();
        } catch (e) {
            console.error('Error rejecting booking', e);
        }
    }

    updateBookingStatus(aptId, custId, newStatus) {
        this.updateBookingStatusCore(aptId, custId, newStatus);
        notify('success', `✅ Booking ${newStatus.toLowerCase()} successfully!`);
        this.loadPendingApprovals();
        
        const listEl = document.getElementById('admin-approval-list');
        if (listEl) listEl.innerHTML = this.renderApprovalItems();
    }

    updateBookingStatusCore(aptId, custId, newStatus) {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('admin_appointments_') && !key.includes('_bin')) {
                    let items = JSON.parse(localStorage.getItem(key) || '[]');
                    items = items.filter(item => item.id !== aptId);
                    localStorage.setItem(key, JSON.stringify(items));
                }
            }

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
deleteBooking(aptId, custId) {
        if (confirm('Permanently delete this appointment record?')) {
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('admin_appointments_')) {
                        let items = JSON.parse(localStorage.getItem(key) || '[]');
                        items = items.filter(item => item.id !== aptId);
                        localStorage.setItem(key, JSON.stringify(items));
                    }
                }
                
                if (custId) {
                    const customerStorageKey = `appointments_${custId}`;
                    let customerItems = JSON.parse(localStorage.getItem(customerStorageKey) || '[]');
                    customerItems = customerItems.filter(item => item.id !== aptId);
                    localStorage.setItem(customerStorageKey, JSON.stringify(customerItems));
                }

                notify('info', '🗑️ Appointment deleted successfully');
                this.loadPendingApprovals();
                
                const listEl = document.getElementById('admin-approval-list');
                if (listEl) listEl.innerHTML = this.renderApprovalItems();
            } catch (e) {
                console.error('Error deleting booking', e);
            }
        }
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

    sendNotification() {
        const type = document.getElementById('admin-notif-type')?.value;
        const message = document.getElementById('admin-notif-msg')?.value;
        const target = document.getElementById('admin-notif-target')?.value;

        if (!message) {
            notify('error', '❌ Enter message');
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
            const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
            notifs.push(notif);
            localStorage.setItem('notifications', JSON.stringify(notifs));
        } catch (e) {
            console.error('Error saving notification', e);
        }

        notify('success', `✅ Notification sent to ${target}!`);
        document.getElementById('admin-notif-msg').value = '';
        this.displayHistory();
    }

    displayHistory() {
        try {
            const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
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
