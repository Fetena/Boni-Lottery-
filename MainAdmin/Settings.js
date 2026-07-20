// ============================================
// MAIN ADMIN - SETTINGS
// ============================================

class Settings {
    constructor() {
        this.settings = {};
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">⚙️ System Settings</h3>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-6">
                    
                    <div>
                        <label class="block text-sm font-bold text-white mb-2">Platform Name</label>
                        <input type="text" id="settings-platform-name" placeholder="BONI Lottery" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-white mb-2">Min Ticket Price (ETB)</label>
                        <input type="number" id="settings-min-price" placeholder="100" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-white mb-2">Max Ticket Price (ETB)</label>
                        <input type="number" id="settings-max-price" placeholder="30000" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-white mb-2">Price Per Number (ETB)</label>
                        <input type="number" id="settings-price-per-number" placeholder="100" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-white mb-2">Admin Commission (%)</label>
                        <input type="number" id="settings-admin-commission" placeholder="10" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-white mb-2">Platform Commission (%)</label>
                        <input type="number" id="settings-platform-commission" placeholder="5" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                    </div>

                    <button onclick="window.mainAdminDashboard.settings.saveSettings()" class="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl">Save Settings</button>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;

            const doc = await db.collection('system_settings').doc('main').get();
            if (doc.exists) {
                this.settings = doc.data();
                this.populateForm();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    populateForm() {
        const platformNameEl = document.getElementById('settings-platform-name');
        const minPriceEl = document.getElementById('settings-min-price');
        const maxPriceEl = document.getElementById('settings-max-price');
        const pricePerNumEl = document.getElementById('settings-price-per-number');
        const adminCommEl = document.getElementById('settings-admin-commission');
        const platformCommEl = document.getElementById('settings-platform-commission');

        if (platformNameEl) platformNameEl.value = this.settings.platformName || 'BONI Lottery';
        if (minPriceEl) minPriceEl.value = this.settings.minPrice || 100;
        if (maxPriceEl) maxPriceEl.value = this.settings.maxPrice || 30000;
        if (pricePerNumEl) pricePerNumEl.value = this.settings.pricePerNumber || 100;
        if (adminCommEl) adminCommEl.value = this.settings.adminCommission || 10;
        if (platformCommEl) platformCommEl.value = this.settings.platformCommission || 5;
    }

    async saveSettings() {
        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            const settings = {
                platformName: document.getElementById('settings-platform-name')?.value || 'BONI Lottery',
                minPrice: parseInt(document.getElementById('settings-min-price')?.value || 100),
                maxPrice: parseInt(document.getElementById('settings-max-price')?.value || 30000),
                pricePerNumber: parseInt(document.getElementById('settings-price-per-number')?.value || 100),
                adminCommission: parseInt(document.getElementById('settings-admin-commission')?.value || 10),
                platformCommission: parseInt(document.getElementById('settings-platform-commission')?.value || 5),
                updatedAt: new Date(),
                updatedBy: currentUser?.email || 'System'
            };

            await db.collection('system_settings').doc('main').set(settings, { merge: true });
            notify('success', '✅ Settings saved!');
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}
