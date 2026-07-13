// MAIN ADMIN AUDITLOG (CHILD)
class MainAdminAuditLog {
    constructor() {}
    render() {
        return `<div class="space-y-4">
            <h3 class="text-2xl font-bold text-white">🔒 System Audit Log</h3>
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                <h4 class="font-bold text-white mb-4">Filter & Export</h4>
                <div class="grid grid-cols-3 gap-4">
                    <input type="date" class="bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                    <select class="bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                        <option>All Events</option>
                        <option>Login</option>
                        <option>Admin Changes</option>
                    </select>
                    <button class="px-4 py-2 bg-yellow-400 text-black font-bold rounded-xl">📥 Export</button>
                </div>
            </div>
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                <h4 class="font-bold text-white mb-4">Recent Audit Events</h4>
                <div class="space-y-2 max-h-80 overflow-y-auto">
                    <div class="bg-black/30 rounded-lg p-3 text-sm border border-yellow-400/10">
                        <p class="text-white"><strong>Admin Added</strong> | Ahmed (admin1)</p>
                        <p class="text-xs text-slate-400">fita.regassa@gmail.com | 3:00 PM</p>
                    </div>
                    <div class="bg-black/30 rounded-lg p-3 text-sm border border-yellow-400/10">
                        <p class="text-white"><strong>Settings Changed</strong> | Ticket Price</p>
                        <p class="text-xs text-slate-400">fita.regassa@gmail.com | 2:00 PM</p>
                    </div>
                </div>
            </div>
        </div>`;
    }
}
let mainAdminAuditLog;
