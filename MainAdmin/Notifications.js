// MAIN ADMIN - NOTIFICATIONS
// ============================================

class MainAdminNotifications {
    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📢 Send Notifications</h3>
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10 space-y-3">
                    <select id="notify-target" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <option>All Customers</option>
                        <option>All Admins</option>
                        <option>Specific User</option>
                    </select>
                    <textarea id="notify-message" placeholder="Notification message..." rows="3" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white"></textarea>
                    <button onclick="mainAdminDashboard.notifications.sendNotification()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Send</button>
                </div>
            </div>
        `;
    }

    async loadData() {
        // Placeholder
    }

    async sendNotification() {
        const target = document.getElementById('notify-target').value;
        const message = document.getElementById('notify-message').value;

        if (!message) {
            notify('error', '❌ Enter message');
            return;
        }

        try {
            await db.collection('notifications').add({
                target: target,
                message: message,
                sentBy: currentUser?.email || 'System',
                createdAt: new Date()
            });

            notify('success', `✅ Notification sent to ${target}!`);
            document.getElementById('notify-message').value = '';
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}

