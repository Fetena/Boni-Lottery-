// ============================================
// MAIN ADMIN - NOTIFICATIONS (ADMIN-TO-ADMIN & POPUP ALERTS)[cite: 11]
// ============================================

class Notifications {
    constructor() {
        this.notifications = [];
        this.lastSeenCount = parseInt(localStorage.getItem('admin_last_seen_notif_count') || '0', 10);
    }

    render() {
        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-white">📢 Admin Communications & Notifications</h3>
                    <button onclick="window.mainAdminDashboard.notifications.showSendModal()" class="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl text-xs transition-all shadow-md">+ Send Admin Notification</button>
                </div>
                <div id="notifications-list" class="space-y-3">${this.renderNotificationsList()}</div>
            </div>

            <!-- Send Notification Modal -->
            <div id="send-notification-modal" class="fixed inset-0 bg-black/85 z-50 hidden flex items-center justify-center p-4">
                <div class="glass-panel rounded-2xl max-w-lg w-full p-6 border border-yellow-400/30 space-y-4 bg-black relative shadow-2xl">
                    <div class="flex justify-between items-center border-b border-yellow-400/20 pb-3">
                        <h4 class="text-base font-bold text-yellow-400">📨 Broadcast to Admins Only</h4>
                        <button onclick="window.mainAdminDashboard.notifications.closeSendModal()" class="text-slate-400 hover:text-white text-base font-bold px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">&times;</button>
                    </div>
                    <div class="space-y-3 text-xs">
                        <div class="space-y-1">
                            <label class="text-slate-300 font-medium">Notification Title</label>
                            <input type="text" id="notif-title-input" placeholder="e.g., Security Update / Branch Alert" class="w-full bg-slate-900/80 border border-yellow-400/20 rounded-xl py-2.5 px-4 text-white focus:border-yellow-400 outline-none">
                        </div>
                        <div class="space-y-1">
                            <label class="text-slate-300 font-medium">Message Content</label>
                            <textarea id="notif-message-input" placeholder="Write message details for other admins..." rows="4" class="w-full bg-slate-900/80 border border-yellow-400/20 rounded-xl py-2.5 px-4 text-white resize-none focus:border-yellow-400 outline-none"></textarea>
                        </div>
                        <div class="space-y-1">
                            <label class="text-slate-300 font-medium">Target Recipient Group</label>
                            <select id="notif-recipient-input" class="w-full bg-slate-900/80 border border-yellow-400/20 rounded-xl py-2.5 px-4 text-white focus:border-yellow-400 outline-none">
                                <option value="Admins Only">Admins Only (Main Admin & Branch Admins)</option>
                                <option value="Main Admin Only">Main Admin Only</option>
                            </select>
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button onclick="window.mainAdminDashboard.notifications.sendNotification()" class="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all">Send Notification</button>
                            <button onclick="window.mainAdminDashboard.notifications.closeSendModal()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- New Incoming Notification Popup Banner -->
            <div id="incoming-notif-popup" class="fixed bottom-6 right-6 z-50 hidden max-w-sm w-full bg-slate-950 border border-yellow-400/40 rounded-2xl p-4 shadow-2xl space-y-2 animate-bounce">
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">🔔</span>
                        <h5 class="font-bold text-yellow-400 text-sm">New Admin Notification</h5>
                    </div>
                    <button onclick="window.mainAdminDashboard.notifications.dismissPopup()" class="text-slate-400 hover:text-white font-bold text-xs px-1.5 py-0.5 rounded bg-slate-900">&times;</button>
                </div>
                <p id="popup-notif-title" class="font-extrabold text-white text-xs"></p>
                <p id="popup-notif-message" class="text-slate-300 text-[11px] line-clamp-2"></p>
                <div class="flex justify-end pt-1">
                    <button onclick="window.mainAdminDashboard.notifications.dismissPopup()" class="px-3 py-1 bg-yellow-400 text-black font-bold rounded-lg text-[10px]">Got it</button>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;

            // Fetch only admin-related notifications, omitting customers entirely
            const snapshot = await db.collection('notifications')
                .where('recipient', 'in', ['Admins Only', 'Main Admin Only', 'All Admins'])
                .get();

            // Fallback or sort manually if composite index is absent
            this.notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => {
                const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                return timeB - timeA;
            });

            // Check for brand new notifications to trigger popup alert
            if (this.notifications.length > this.lastSeenCount && this.lastSeenCount > 0) {
                const latest = this.notifications[0];
                this.showPopup(latest.title, latest.message);
            }
            this.lastSeenCount = this.notifications.length;
            localStorage.setItem('admin_last_seen_notif_count', this.lastSeenCount);

            const listContainer = document.getElementById('notifications-list');
            if (listContainer) {
                listContainer.innerHTML = this.renderNotificationsList();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    showPopup(title, message) {
        const popup = document.getElementById('incoming-notif-popup');
        const titleEl = document.getElementById('popup-notif-title');
        const msgEl = document.getElementById('popup-notif-message');
        if (popup && titleEl && msgEl) {
            titleEl.textContent = title;
            msgEl.textContent = message;
            popup.classList.remove('hidden');
            setTimeout(() => {
                this.dismissPopup();
            }, 8000);
        }
    }

    dismissPopup() {
        const popup = document.getElementById('incoming-notif-popup');
        if (popup) popup.classList.add('hidden');
    }

    renderNotificationsList() {
        if (this.notifications.length === 0) {
            return `
                <div class="glass-panel rounded-2xl p-8 border border-yellow-400/10 text-center text-slate-400">
                    <p class="text-sm">No admin notifications yet</p>
                </div>
            `;
        }

        return this.notifications.map(notif => {
            const createdAt = notif.createdAt?.toDate?.() || new Date(notif.createdAt || Date.now());
            return `
                <div class="glass-panel rounded-xl p-5 border border-yellow-400/10 space-y-2 shadow-lg text-xs">
                    <div class="flex justify-between items-start gap-4">
                        <div class="space-y-1.5 flex-1">
                            <div class="flex items-center gap-2">
                                <span class="px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 font-bold text-[10px]">${notif.recipient || 'Admins Only'}</span>
                                <p class="font-extrabold text-white text-base">${notif.title || 'Notification'}</p>
                            </div>
                            <p class="text-slate-200 font-normal leading-relaxed text-sm bg-black/40 p-3 rounded-xl border border-white/5">${notif.message || 'N/A'}</p>
                            <div class="flex flex-wrap items-center gap-3 text-slate-400 pt-1">
                                <span>Sent by: <strong class="text-yellow-400">${notif.sentBy || 'System'}</strong></span>
                                <span>•</span>
                                <span>Time: ${createdAt.toLocaleString()}</span>
                            </div>
                        </div>
                        <button onclick="window.mainAdminDashboard.notifications.deleteNotification('${notif.id}')" class="px-3 py-1.5 bg-slate-900 hover:bg-rose-900/60 text-rose-400 border border-rose-500/25 font-bold rounded-lg transition-all">🗑️ Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    showSendModal() {
        const modal = document.getElementById('send-notification-modal');
        if (modal) modal.classList.remove('hidden');
    }

    closeSendModal() {
        const modal = document.getElementById('send-notification-modal');
        if (modal) modal.classList.add('hidden');
    }

    async sendNotification() {
        const title = document.getElementById('notif-title-input')?.value || '';
        const message = document.getElementById('notif-message-input')?.value || '';
        const recipient = document.getElementById('notif-recipient-input')?.value || 'Admins Only';

        if (!title || !message) {
            notify('error', '❌ Please fill in all fields');
            return;
        }

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            const adminName = currentUser?.email || 'Main Admin';
            
            await db.collection('notifications').add({
                title: title,
                message: message,
                recipient: recipient,
                sentBy: adminName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (typeof AuditLog !== 'undefined' && typeof AuditLog.logAction === 'function') {
                await AuditLog.logAction('Send Admin Notification', adminName, `Title: ${title}`, 'INFO');
            }

            notify('success', '✅ Notification sent successfully to admins!');
            this.closeSendModal();
            
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
        if (!confirm('Are you sure you want to delete this notification?')) return;

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('notifications').doc(notifId).delete();
            notify('success', '🗑️ Notification deleted');
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}
```[cite: 11]
