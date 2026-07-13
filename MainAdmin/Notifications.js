// MAIN ADMIN NOTIFICATIONS (CHILD)
class MainAdminNotifications {
    constructor() {}
    render() {
        return `<div class="space-y-4">
            <h3 class="text-2xl font-bold text-white">📢 Platform-Wide Notifications</h3>
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                <h4 class="font-bold text-white mb-4">Send Platform Alert</h4>
                <input type="text" id="alert-title" placeholder="Title" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                <textarea id="alert-msg" placeholder="Message..." rows="4" class="w-full mt-2 bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none"></textarea>
                <select class="w-full mt-2 bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                    <option>All Users</option>
                    <option>All Admins</option>
                    <option>All Customers</option>
                </select>
                <button onclick="mainAdminNotifications.send()" class="w-full mt-2 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">📤 Send Alert</button>
            </div>
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                <h4 class="font-bold text-white mb-4">Sent Alerts</h4>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                    <div class="bg-black/30 rounded-lg p-3 text-sm border border-yellow-400/10">
                        <p class="text-white font-bold">🎰 Drawing Reminder</p>
                        <p class="text-xs text-slate-400">Drawing in 1 hour | 2:00 PM</p>
                    </div>
                </div>
            </div>
        </div>`;
    }
    send() { showNotification('success', '✅ Alert sent to all users'); }
}
let mainAdminNotifications;
