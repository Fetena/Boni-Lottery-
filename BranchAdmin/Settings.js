class AdminSettings {
    constructor(adminId) {
        this.adminId = adminId;
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">⚙️ Admin Settings</h3>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <div>
                        <label class="text-sm text-slate-400">Email</label>
                        <input type="email" value="${this.adminId}" disabled
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-slate-400 outline-none mt-1">
                    </div>
                    <div>
                        <label class="text-sm text-slate-400">New Password</label>
                        <input type="password" id="admin-new-pass" placeholder="New password (optional)" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>
                    <button onclick="notify('info', 'ℹ️ Password update feature coming soon')" class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">Save Settings</button>
                </div>
            </div>
        `;
    }
}

window.adminSettings = null;
