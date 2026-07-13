// ============================================
// MAIN ADMIN ADMINS (CHILD COMPONENT)
// Parent: MainAdminDashboard
// CRUD for branch admins
// ============================================

class MainAdminAdmins {
    constructor() {
        this.admins = db.getAdmins() || {};
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">🛡️ Manage Branch Admins</h3>

                <!-- ADD NEW ADMIN -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">Add Branch Admin</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <input type="text" id="new-admin-name" placeholder="Full Name"
                            class="bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                        <input type="email" id="new-admin-email" placeholder="Email"
                            class="bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                        <input type="password" id="new-admin-pass" placeholder="Password"
                            class="bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                        <select id="new-admin-status" class="bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <button onclick="mainAdminAdmins.addAdmin()" 
                        class="w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">➕ Add Admin</button>
                </div>

                <!-- ADMINS LIST -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                    <h4 class="font-bold text-white mb-4">Total Admins: ${Object.keys(this.admins).length}</h4>
                    <div class="space-y-2 max-h-96 overflow-y-auto">
                        ${Object.values(this.admins).map(admin => `
                            <div class="bg-black/30 rounded-lg p-4 border border-yellow-400/10">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-bold text-white">${admin.name}</p>
                                        <p class="text-sm text-slate-300">${admin.email}</p>
                                        <p class="text-xs text-slate-400 mt-1">👥 ${admin.customers || 0} customers | 💰 ${admin.revenue || 0} ETB</p>
                                        <p class="text-xs ${admin.isActive ? 'text-emerald-400' : 'text-red-400'} mt-1">${admin.isActive ? '✅ Active' : '❌ Inactive'}</p>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="mainAdminAdmins.editAdmin('${admin.id}')" class="px-3 py-1 bg-blue-950/30 text-blue-400 text-xs rounded">Edit</button>
                                        <button onclick="mainAdminAdmins.toggleAdmin('${admin.id}')" class="px-3 py-1 bg-yellow-950/30 text-yellow-400 text-xs rounded">${admin.isActive ? 'Disable' : 'Enable'}</button>
                                        <button onclick="mainAdminAdmins.deleteAdmin('${admin.id}')" class="px-3 py-1 bg-red-950/30 text-red-400 text-xs rounded">Delete</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    addAdmin() {
        const name = document.getElementById('new-admin-name')?.value;
        const email = document.getElementById('new-admin-email')?.value;
        const password = document.getElementById('new-admin-pass')?.value;
        const status = document.getElementById('new-admin-status')?.value;

        if (!name || !email || !password) {
            showNotification('error', '❌ Fill all fields');
            return;
        }

        const newAdmin = {
            id: 'admin' + Date.now(),
            name, email, password, status,
            customers: 0,
            revenue: 0,
            isActive: status === 'Active'
        };

        const admins = db.getAdmins() || {};
        admins[newAdmin.id] = newAdmin;
        localStorage.setItem('admins', JSON.stringify(admins));

        showNotification('success', `✅ Admin ${name} added!`);
        document.getElementById('new-admin-name').value = '';
        document.getElementById('new-admin-email').value = '';
        document.getElementById('new-admin-pass').value = '';
    }

    editAdmin(adminId) {
        showNotification('info', 'Edit feature coming soon');
    }

    toggleAdmin(adminId) {
        const admins = db.getAdmins();
        if (admins[adminId]) {
            admins[adminId].isActive = !admins[adminId].isActive;
            localStorage.setItem('admins', JSON.stringify(admins));
            showNotification('success', '✅ Admin status updated');
        }
    }

    deleteAdmin(adminId) {
        if (confirm('Delete this admin?')) {
            const admins = db.getAdmins();
            delete admins[adminId];
            localStorage.setItem('admins', JSON.stringify(admins));
            showNotification('success', '✅ Admin deleted');
        }
    }
}

let mainAdminAdmins;
