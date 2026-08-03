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

            // Scan every single key in localStorage to catch any customer booking
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    
                    // Check if the data is an array of items (like appointments or queues)
                    if (Array.isArray(data)) {
                        data.forEach(item => {
                            if (item && typeof item === 'object') {
                                const status = item.status ? item.status.toLowerCase() : '';
                                // Catch any status containing 'pending' or matching booking types
                                if ((status.includes('pending') || status === 'unapproved') && !seenIds.has(item.id || JSON.stringify(item))) {
                                    seenIds.add(item.id || JSON.stringify(item));
                                    this.pendingApprovals.push({
                                        id: item.id || Date.now() + Math.random(),
                                        custId: item.custId || item.customerId || 'unknown_customer',
                                        purpose: item.purpose || item.title || item.service || 'Appointment Booking',
                                        date: item.date || item.appointmentDate || 'Today',
                                        time: item.time || item.appointmentTime || 'N/A',
                                        description: item.description || item.note || item.notes || 'None',
                                        status: item.status || 'Pending'
                                    });
                                }
                            }
                        });
                    }
                } catch (err) {
                    // Ignore non-JSON keys
                }
            }
        } catch (e) {
            console.error('Error loading pending approvals universally', e);
            this.pendingApprovals = [];
        }
    }

    renderApprovalItems() {
        if (this.pendingApprovals.length === 0) {
            return '<p class="text-slate-400 text-xs py-2">No pending booking approvals found</p>';
        }

        return this.pendingApprovals.map(apt => `
            <div class="bg-black/30 rounded-lg p-4 border border-yellow-400/10 text-xs flex justify-between items-center">
                <div>
                    <p class="font-bold text-white">Customer Booking: ${apt.purpose || 'Appointment'}</p>
                    <p class="text-slate-300 mt-0.5">📅 ${apt.date || 'N/A'} at ${apt.time || 'N/A'}</p>
                    <p class="text-slate-400 mt-0.5">Note: ${apt.description || 'None'}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="window.adminNotifications.approveBooking('${apt.id}', '${apt.custId}')" 
                        class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg">✅ Approve</button>
                    <button onclick="window.adminNotifications.rejectBooking('${apt.id}', '${apt.custId}')" 
                        class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg">❌ Reject</button>
                </div>
            </div>
        `).join('');
    }

    approveBooking(aptId, custId) {
        this.updateBookingStatus(aptId, custId, 'Approved');
        notify('success', '✅ Booking approved successfully!');
    }

    rejectBooking(aptId, custId) {
        this.updateBookingStatus(aptId, custId, 'Rejected');
        notify('error', '❌ Booking request rejected');
    }

    updateBookingStatus(aptId, custId, newStatus) {
        try {
            // 1. Remove from this specific admin's active queue so it disappears from their pending view
            const cleanAdminId = (this.adminId || 'admin').toLowerCase().replace(/[@.]/g, '_').replace(/\s+/g, '_');
            const queueKey = `admin_appointments_${cleanAdminId}`;
            
            const possibleKeys = [queueKey, 'admin_appointments_admin', 'admin_appointments_admin_gmail_com'];
            possibleKeys.forEach(key => {
                let items = JSON.parse(localStorage.getItem(key) || '[]');
                items = items.filter(item => item.id !== aptId);
                localStorage.setItem(key, JSON.stringify(items));
            });

            // 2. Update the customer's personal appointment history log status
            const customerStorageKey = `appointments_${custId}`;
            const customerItems = JSON.parse(localStorage.getItem(customerStorageKey) || '[]');
            const updatedCustomerItems = customerItems.map(item => {
                if (item.id === aptId) {
                    return { ...item, status: newStatus };
                }
                return item;
            });
            localStorage.setItem(customerStorageKey, JSON.stringify(updatedCustomerItems));
            
            // 3. Push customer notification popup log for real-time customer alert modal
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

            // Reload pending list & update UI elements immediately
            this.loadPendingApprovals();
            
            const listEl = document.getElementById('admin-approval-list');
            if (listEl) {
                listEl.innerHTML = this.renderApprovalItems();
            }

            this.updateBadgeCount();
        } catch (e) {
            console.error('Error updating booking status', e);
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
