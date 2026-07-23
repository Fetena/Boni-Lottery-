// ============================================
// MAIN ADMIN - NOTIFICATIONS
// ============================================

class Notifications {
    constructor() {
        this.notifications = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-white">📢 Notifications</h3>
                    <button onclick="window.mainAdminDashboard.notifications.showSendModal()" class="px-4 py-2 bg-yellow-400 text-black font-bold rounded-xl">+ Send Notification</button>
                </div>
                <div id="notifications-list" class="space-y-3">${this.renderNotificationsList()}</div>
            </div>

            <!-- Send Notification Modal -->
            <div id="send-notification-modal" class="modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content p-6 m-auto">
                    <h3 class="text-xl font-bold text-white mb-4">Send Notification</h3>
                    <div class="space-y-3">
                        <input type="text" id="notif-title-input" placeholder="Title" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <textarea id="notif-message-input" placeholder="Message" rows="4" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white resize-none"></textarea>
                        <select id="notif-recipient-input" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                            <option>All Users</option>
                            <option>Admins Only</option>
                            <option>Customers Only</option>
                        </select>
                        <button onclick="window.mainAdminDashboard.notifications.sendNotification()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Send</button>
                        <button onclick="window.mainAdminDashboard.notifications.closeSendModal()" class="w-full py-2 bg-slate-700 text-white rounded-xl">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;

            const snapshot = await db.collection('notifications')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();

            this.notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
            const badgeEl = document.getElementById('badge-main-notifications');
            if (badgeEl) {
                if (notifs.length > 0) {
                    badgeEl.textContent = notifs.length;
                    badgeEl.classList.remove('hidden');
                } else {
                    badgeEl.classList.add('hidden');
                }
            }
            const listContainer = document.getElementById('notifications-list');
            if (listContainer) {
                listContainer.innerHTML = this.renderNotificationsList();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    renderNotificationsList() {
        if (this.notifications.length === 0) {
            return `
                <div class="glass-panel rounded-lg p-6 border border-yellow-400/10 text-center">
                    <p class="text-slate-400">No notifications sent yet</p>
                </div>
            `;
        }

        return this.notifications.map(notif => {
            const createdAt = notif.createdAt?.toDate?.() || new Date();
            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-white">${notif.title || 'Notification'}</p>
                            <p class="text-xs text-slate-400 mt-1">${notif.message || 'N/A'}</p>
                            <p class="text-xs text-slate-400 mt-2">Recipient: ${notif.recipient || 'All Users'}</p>
                            <p class="text-xs text-slate-400">Sent: ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}</p>
                        </div>
                        <button onclick="window.mainAdminDashboard.notifications.deleteNotification('${notif.id}')" class="px-3 py-1 bg-red-400/20 text-red-400 text-xs rounded">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    showSendModal() {
        const modal = document.getElementById('send-notification-modal');
        if (modal) modal.style.display = 'flex';
    }

    closeSendModal() {
        const modal = document.getElementById('send-notification-modal');
        if (modal) modal.style.display = 'none';
    }

    async sendNotification() {
        const title = document.getElementById('notif-title-input')?.value || '';
        const message = document.getElementById('notif-message-input')?.value || '';
        const recipient = document.getElementById('notif-recipient-input')?.value || 'All Users';

        if (!title || !message) {
            notify('error', '❌ Fill all fields');
            return;
        }

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('notifications').add({
                title: title,
                message: message,
                recipient: recipient,
                sentBy: currentUser?.email || 'System',
                createdAt: new Date()
            });

            notify('success', '✅ Notification sent!');
            this.closeSendModal();
            
            // Clear inputs
            const titleEl = document.getElementById('notif-title-input');
            const messageEl = document.getElementById('notif-message-input');
            if (titleEl) titleEl.value = '';
            if (messageEl) messageEl.value = '';

            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async deleteNotification(notifId) {
        if (!confirm('Delete this notification?')) return;

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('notifications').doc(notifId).delete();
            notify('success', '✅ Notification deleted');
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}
