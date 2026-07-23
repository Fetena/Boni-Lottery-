// ============================================
// ADMIN NOTIFICATIONS (CHILD COMPONENT)
// Parent: AdminDashboard
// ✅ PERSISTS: Notifications stored with timestamps
// ============================================

class AdminNotifications {
    constructor(adminId) {
        this.adminId = adminId;
    }

    render() {
        return `
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
        `;
    }

    sendNotification() {
        const type = document.getElementById('admin-notif-type')?.value;
        const message = document.getElementById('admin-notif-msg')?.value;
        const target = document.getElementById('admin-notif-target')?.value;

        if (!message) {
            notify('error', '❌ Enter message');
            return;
        }

        // Create notification object
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

        // Retrieve and update localStorage safely
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

            // 🔴 Badge Update Logic for Branch Admin Notifications
            const badgeEl = document.getElementById('badge-branch-notifications');
            if (badgeEl) {
                if (notifs.length > 0) {
                    badgeEl.textContent = notifs.length;
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

// Global instance
window.adminNotifications = null;
