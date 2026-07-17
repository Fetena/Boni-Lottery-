// MAIN ADMIN - SETTINGS
// ============================================

class MainAdminSettings {
    render() {
        return `
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                <h3 class="text-xl font-bold text-white">⚙️ System Settings</h3>
                <div>
                    <label class="block text-xs text-slate-400 mb-2">Ticket Price (ETB)</label>
                    <input type="number" id="ticket-price" placeholder="100" value="100" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                </div>
                <div>
                    <label class="block text-xs text-slate-400 mb-2">Draw Time</label>
                    <input type="time" id="draw-time" placeholder="20:00" value="20:00" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                </div>
                <div>
                    <label class="block text-xs text-slate-400 mb-2">Draw Day</label>
                    <select id="draw-day" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <option>Sunday</option>
                        <option>Monday</option>
                        <option>Wednesday</option>
                        <option>Friday</option>
                    </select>
                </div>
                <button onclick="mainAdminDashboard.settings.saveSettings()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Save Settings</button>
            </div>
        `;
    }

    async loadData() {
        // Placeholder
    }

    async saveSettings() {
        const price = document.getElementById('ticket-price').value;
        const time = document.getElementById('draw-time').value;
        const day = document.getElementById('draw-day').value;

        try {
            await db.collection('system_settings').doc('general').set({
                ticketPrice: parseInt(price),
                drawTime: time,
                drawDay: day,
                updatedAt: new Date()
            }, { merge: true });

            notify('success', '✅ Settings saved!');
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}
