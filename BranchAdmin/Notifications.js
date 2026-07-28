// ============================================
// ADMIN NOTIFICATIONS (CHILD COMPONENT)
// Parent: AdminDashboard
// ✅ PERSISTS: Notifications stored with timestamps & Approvals
// ============================================

class AdminNotifications {
    constructor(adminId) {
        this.adminId = adminId;
        this.pendingApprovals = [];
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
            const allKeys = Object.keys(localStorage);
            this.pendingApprovals = [];
            
            allKeys.forEach(key => {
                if (key.startsWith('appointments_')) {
                    const items = JSON.parse(localStorage.getItem(key) || '[]');
                    items.forEach(item => {
                        if (item.status === 'Pending Confirmation' || item.status === 'Pending') {
                            this.pendingApprovals.push(item);
                        }
                    });
                }
            });
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
        // Trigger popup notification for admin action
        notify('success', '✅ Booking approved successfully!');
    }

    rejectBooking(aptId, custId) {
        this.updateBookingStatus(aptId, custId, 'Rejected');
        // Trigger popup notification for admin action
        notify('error', '❌ Booking request rejected');
    }

    updateBookingStatus(aptId, custId, newStatus) {
        try {
            const storageKey = `appointments_${custId}`;
            const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const updated = items.map(item => {
                if (item.id === aptId) {
                    return { ...item, status: newStatus };
                }
                return item;
            });
            localStorage.setItem(storageKey, JSON.stringify(updated));
            
            // Refresh approval list display inside admin panel
            const listEl = document.getElementById('admin-approval-list');
            if (listEl) {
                this.loadPendingApprovals();
                listEl.innerHTML = this.renderApprovalItems();
            }
        } catch (e) {
            console.error('Error updating booking status', e);
        }
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

            const badgeEl = document.getElementById('badge-branch-notifications');
            if (badgeEl) {
                const totalPendingCount = this.pendingApprovals.length + notifs.length;
                if (totalPendingCount > 0) {
                    badgeEl.textContent = totalPendingCount;
                    badgeEl.classList.remove('hidden');
                } else {
                    badgeEl.classList.add('hidden');
                }
            }
        } catch (e) {
            console.error('Error loading notification history', e);
        }
    }
}

window.adminNotifications = null;
