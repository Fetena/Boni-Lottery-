// ============================================
// CUSTOMER SETTINGS (CHILD COMPONENT)
// Parent: CustomerDashboard
// ✅ SAVES: Phone number persists
// ============================================

class CustomerSettings {
    constructor(custId) {
        this.custId = custId;
    }

    render() {
        const customer = db.getCustomer(this.custId);
        
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">⚙️ Settings</h3>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    
                    <div>
                        <label class="text-sm text-slate-400">Phone Number</label>
                        <input type="text" id="cust-phone" value="${customer.phone || '0911223344'}" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">Email</label>
                        <input type="email" value="${customer.email}" disabled
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-slate-400 outline-none mt-1">
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">Current Password</label>
                        <input type="password" id="cust-current-pass" placeholder="Current password" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">New Password</label>
                        <input type="password" id="cust-new-pass" placeholder="New password (optional)" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>

                    <button onclick="customerSettings.saveSettings()" 
                        class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">Save Changes</button>
                </div>
            </div>
        `;
    }

    saveSettings() {
        const phone = document.getElementById('cust-phone')?.value;
        const newPass = document.getElementById('cust-new-pass')?.value;

        if (!phone) {
            showNotification('error', '❌ Enter phone number');
            return;
        }

        // Update customer phone ← SAVES to storage
        const updated = db.updateCustomer(this.custId, { phone });
        
        if (newPass) {
            console.log('Password would be updated in production');
        }

        showNotification('success', '✅ Settings saved successfully!');
    }
}

// Global instance
let customerSettings;
