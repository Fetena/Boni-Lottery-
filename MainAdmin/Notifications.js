// ============================================
// MAIN ADMIN - NOTIFICATIONS (BULK DELETE & LIVE STREAM LINK INTEGRATION)
// ============================================

class Notifications {
    constructor() {
        this.notifications = [];
        this.adminsList = [];
        this.selectedIds = new Set();
        this.lastSeenCount = parseInt(localStorage.getItem('admin_last_seen_notif_count') || '0', 10);
    }

    render() {
        return `
            <div class="space-y-4">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 class="text-2xl font-bold text-white">📢 Admin Communications & Notifications</h3>
                    <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button onclick="window.mainAdminDashboard.notifications.deleteSelected()" id="bulk-delete-btn" class="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30 font-bold rounded-xl text-xs transition-all shadow-md hidden">🗑️ Delete Selected (<span id="selected-count">0</span>)</button>
                        <button onclick="window.mainAdminDashboard.notifications.showSendModal()" class="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl text-xs transition-all shadow-md">+ Send Admin Notification</button>
                    </div>
                </div>

                <!-- Master Select All Bar -->
                <div class="glass-panel rounded-xl px-4 py-3 border border-yellow-400/10 flex items-center justify-between text-xs">
                    <label class="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                        <input type="checkbox" id="select-all-checkbox" onchange="window.mainAdminDashboard.notifications.toggleSelectAll(this)" class="w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-400 focus:ring-0 cursor-pointer">
                        <span>Select All Notifications</span>
                    </label>
                    <span class="text-slate-400">Total Loaded: <strong class="text-white">${this.notifications.length}</strong></span>
                </div>

                <div id="notifications-list" class="space-y-3">${this.renderNotificationsList()}</div>
            </div>

            <!-- Send Notification Modal -->
            <div id="send-notification-modal" class="fixed inset-0 bg-black/85 z-50 hidden flex items-center justify-center p-4">
                <div class="glass-panel rounded-2xl max-w-lg w-full p-6 border border-yellow-400/30 space-y-4 bg-black relative shadow-2xl">
                    <div class="flex justify-between items-center border-b border-yellow-400/20 pb-3">
                        <h4 class="text-base font-bold text-yellow-400">📨 Broadcast to Admins</h4>
                        <button onclick="window.mainAdminDashboard.notifications.closeSendModal()" class="text-slate-400 hover:text-white text-base font-bold px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">&times;</button>
                    </div>
                    <div class="space-y-3 text-xs">
                        <div class="space-y-1">
                            <label class="text-slate-300 font-medium">Notification Title</label>
                            <input type="text" id="notif-title-input" placeholder="e.g., Security Update / TikTok Live Stream" class="w-full bg-slate-900/80 border border-yellow-400/20 rounded-xl py-2.5 px-4 text-white focus:border-yellow-400 outline-none">
                        </div>
                        <div class="space-y-1">
                            <label class="text-slate-300 font-medium">Message Content (Include TikTok Link if applicable)</label>
                            <textarea id="notif-message-input" placeholder="Write message or paste TikTok Live link here..." rows="4" class="w-full bg-slate-900/80 border border-yellow-400/20 rounded-xl py-2.5 px-4 text-white resize-none focus:border-yellow-400 outline-none"></textarea>
                        </div>
                        <div class="space-y-1">
                            <label class="text-slate-300 font-medium">Target Recipient Group or Specific Admin</label>
                            <select id="notif-recipient-input" class="w-full bg-slate-900/80 border border-yellow-400/20 rounded-xl py-2.5 px-4 text-white focus:border-yellow-400 outline-none">
                                <optgroup label="Groups">
                                    <option value="Admins Only">Admins Only (Main Admin & Branch Admins)</option>
                                    <option value="Main Admin Only">Main Admin Only</option>
                                </optgroup>
                                <optgroup label="Specific Admins" id="specific-admins-options">
                                    <!-- Dynamically loaded admins -->
                                </optgroup>
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
                <div id="popup-action-container" class="pt-1"></div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;

            try {
                const adminSnap = await db.collection('admins').get();
                this.adminsList = adminSnap.docs.map(doc => doc.data().email || doc.data().name).filter(Boolean);
                this.updateAdminDropdown();
            } catch (e) {
                console.warn('Could not fetch admins list:', e);
            }

            const snapshot = await db.collection('notifications').get();

            this.notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).sort((a, b) => {
                const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                return timeB - timeA;
            });

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

    updateAdminDropdown() {
        const groupContainer = document.getElementById('specific-admins-options');
        if (!groupContainer || this.adminsList.length === 0) return;

        groupContainer.innerHTML = this.adminsList.map(adminEmail => 
            `<option value="Admin: ${adminEmail}">Admin: ${adminEmail}</option>`
        ).join('');
    }

    formatMessageWithLinks(text) {
        if (!text) return 'N/A';
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, (url) => {
            const isTikTok = url.includes('tiktok.com');
            const label = isTikTok ? '🎵 Watch TikTok Live Stream' : '🔗 Open Link';
            return `<a href="${url}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1 my-1 bg-yellow-400 text-black font-extrabold rounded-lg text-xs hover:bg-yellow-300 transition-all shadow">${label}</a>`;
        });
    }

    showPopup(title, message) {
        const popup = document.getElementById('incoming-notif-popup');
        const titleEl = document.getElementById('popup-notif-title');
        const msgEl = document.getElementById('popup-notif-message');
        const actionContainer = document.getElementById('popup-action-container');

        if (popup && titleEl && msgEl) {
            titleEl.textContent = title;
            msgEl.textContent = message;
            
            const urlMatch = message.match(/(https?:\/\/[^\s]+)/);
            if (actionContainer) {
                actionContainer.innerHTML = urlMatch ? 
                    `<a href="${urlMatch[0]}" target="_blank" class="block w-full text-center py-1.5 bg-yellow-400 text-black font-bold rounded-lg text-xs mt-2">🔴 Join TikTok Live Stream Now</a>` :
                    `<button onclick="window.mainAdminDashboard.notifications.dismissPopup()" class="w-full py-1.5 bg-yellow-400 text-black font-bold rounded-lg text-xs mt-2">Got it</button>`;
            }

            popup.classList.remove('hidden');
            setTimeout(() => {
                this.dismissPopup();
            }, 10000);
        }
    }

    dismissPopup() {
        const popup = document.getElementById('incoming-notif-popup');
        if (popup) popup.classList.add('hidden');
    }

    toggleSelectAll(masterCheckbox) {
        const checkboxes = document.querySelectorAll('.notif-checkbox');
        this.selectedIds.clear();

        checkboxes.forEach(cb => {
            cb.checked = masterCheckbox.checked;
            if (masterCheckbox.checked) {
                this.selectedIds.add(cb.dataset.id);
            }
        });

        this.updateBulkDeleteButton();
    }

    toggleItemCheckbox(cb, id) {
        if (cb.checked) {
            this.selectedIds.add(id);
        } else {
            this.selectedIds.delete(id);
            const master = document.getElementById('select-all-checkbox');
            if (master) master.checked = false;
        }
        this.updateBulkDeleteButton();
    }

    updateBulkDeleteButton() {
        const btn = document.getElementById('bulk-delete-btn');
        const countSpan = document.getElementById('selected-count');
        if (!btn || !countSpan) return;

        countSpan.textContent = this.selectedIds.size;
        if (this.selectedIds.size > 0) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    }

    async deleteSelected() {
        if (this.selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${this.selectedIds.size} selected notifications?`)) return;

        if (!db) return notify('error', '❌ Database not initialized');

        try {
            const batch = db.batch();
            this.selectedIds.forEach(id => {
                const ref = db.collection('notifications').doc(id);
                batch.delete(ref);
            });

            await batch.commit();
            this.selectedIds.clear();
            this.updateBulkDeleteButton();
            
            const master = document.getElementById('select-all-checkbox');
            if (master) master.checked = false;

            notify('success', '🗑️ Selected notifications deleted successfully!');
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
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
            const isChecked = this.selectedIds.has(notif.id) ? 'checked' : '';

            return `
                <div class="glass-panel rounded-xl p-5 border border-yellow-400/10 space-y-3 shadow-lg text-xs">
                    <div class="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
                        <div class="flex items-center gap-3">
                            <input type="checkbox" data-id="${notif.id}" ${isChecked} onchange="window.mainAdminDashboard.notifications.toggleItemCheckbox(this, '${notif.id}')" class="notif-checkbox w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-400 focus:ring-0 cursor-pointer">
                            <span class="px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 font-bold text-[10px]">${notif.recipient || 'Admins Only'}</span>
                        </div>
                        <button onclick="window.mainAdminDashboard.notifications.deleteNotification('${notif.id}')" class="px-3 py-1 bg-slate-900 hover:bg-rose-900/60 text-rose-400 border border-rose-500/25 font-bold rounded-lg transition-all">🗑️ Delete</button>
                    </div>

                    <div class="space-y-2 pl-7">
                        <p class="font-extrabold text-white text-base">${notif.title || 'Notification'}</p>
                        <div class="text-slate-200 font-normal leading-relaxed text-sm bg-black/50 p-4 rounded-xl border border-white/5 space-y-2">
                            ${this.formatMessageWithLinks(notif.message)}
                        </div>
                        <div class="flex flex-wrap items-center gap-3 text-slate-400 pt-1">
                            <span>Sent by: <strong class="text-yellow-400">${notif.sentBy || 'System'}</strong></span>
                            <span>•</span>
                            <span>Time: ${createdAt.toLocaleString()}</span>
                        </div>
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
                target: recipient, // Explicitly tagged for admin isolation
                isAdminOnly: true, // 🛑 Flag ensuring customers drop this message instantly
                sentBy: adminName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (typeof AuditLog !== 'undefined' && typeof AuditLog.logAction === 'function') {
                await AuditLog.logAction('Send Admin Notification', adminName, `Title: ${title} to ${recipient}`, 'INFO');
            }

            notify('success', '✅ Notification broadcasted successfully to admins!');
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
