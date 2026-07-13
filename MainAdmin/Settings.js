// ============================================
// MAIN ADMIN SETTINGS (CHILD COMPONENT)
// Parent: MainAdminDashboard
// ✅ SAVES: All system settings persist
// ============================================

class MainAdminSettings {
    constructor() {
        this.settings = db.getSettings();
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">⚙️ System Settings</h3>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    
                    <div>
                        <label class="text-sm text-slate-400">Ticket Price (ETB)</label>
                        <input type="number" id="main-ticket-price" value="${this.settings.ticketPrice}" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">Drawing Day</label>
                        <select id="main-draw-day" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                            <option value="Sunday" ${this.settings.drawDay === 'Sunday' ? 'selected' : ''}>Sunday</option>
                            <option value="Monday" ${this.settings.drawDay === 'Monday' ? 'selected' : ''}>Monday</option>
                            <option value="Wednesday" ${this.settings.drawDay === 'Wednesday' ? 'selected' : ''}>Wednesday</option>
                            <option value="Friday" ${this.settings.drawDay === 'Friday' ? 'selected' : ''}>Friday</option>
                        </select>
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">Drawing Time</label>
                        <input type="time" id="main-draw-time" value="${this.settings.drawTime}" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">Prize Pool %</label>
                        <input type="number" id="main-prize-pool" value="${this.settings.prizePool}" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>

                    <hr class="border-yellow-400/10 my-4">

                    <div>
                        <label class="text-sm text-slate-400">Platform Telebirr Account</label>
                        <input type="text" id="main-telebirr" value="${this.settings.telebirr}" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">Platform CBE Account</label>
                        <input type="text" id="main-cbe" value="${this.settings.cbe}" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">TikTok Handle</label>
                        <input type="text" id="main-tiktok" value="${this.settings.tiktok}" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>

                    <button onclick="mainAdminSettings.saveAllSettings()" 
                        class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">Save All Settings</button>
                </div>
            </div>
        `;
    }

    saveAllSettings() {
        const newSettings = {
            ticketPrice: parseInt(document.getElementById('main-ticket-price')?.value),
            drawDay: document.getElementById('main-draw-day')?.value,
            drawTime: document.getElementById('main-draw-time')?.value,
            prizePool: parseInt(document.getElementById('main-prize-pool')?.value),
            telebirr: document.getElementById('main-telebirr')?.value,
            cbe: document.getElementById('main-cbe')?.value,
            tiktok: document.getElementById('main-tiktok')?.value
        };

        if (!newSettings.ticketPrice || !newSettings.prizePool) {
            showNotification('error', '❌ Please fill all required fields');
            return;
        }

        // Save ← PERSISTS to storage
        db.updateSettings(newSettings);
        showNotification('success', '✅ All system settings saved!');
    }
}

// Global instance
let mainAdminSettings;
