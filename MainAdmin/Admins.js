// ============================================
// MAIN ADMIN - ADMINS MANAGEMENT
// ============================================

class Admins {
    constructor() {
        this.admins = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-white">🛡️ Manage Admins</h3>
                    <button onclick="mainAdminDashboard.admins.showCreateModal()" class="px-4 py-2 bg-yellow-400 text-black font-bold rounded-xl">+ Create Admin</button>
                </div>
                <div id="admins-list" class="space-y-3"></div>
            </div>

            <!-- Create Admin Modal -->
            <div id="create-admin-modal" class="modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content p-6 m-auto">
                    <h3 class="text-xl font-bold text-white mb-4">Create New Admin</h3>
                    <div class="space-y-3">
                        <input type="text" id="admin-name-input" placeholder="Full Name" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <input type="email" id="admin-email-input" placeholder="Email" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <input type="password" id="admin-password-input" placeholder="Password" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <input type="tel" id="admin-phone-input" placeholder="Phone" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <button onclick="mainAdminDashboard.admins.createAdmin()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Create</button>
                        <button onclick="mainAdminDashboard.admins.closeCreateModal()" class="w-full py-2 bg-slate-700 text-white rounded-xl">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;
            const snapshot = await db.collection('admins').get();
            this.admins = [];
            snapshot.forEach(doc => {
                this.admins.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error('Error loading admins:', error);
        }
    }

    showCreateModal() {
        document.getElementById('create-admin-modal').style.display = 'flex';
    }

    closeCreateModal() {
        document.getElementById('create-admin-modal').style.display = 'none';
    }

    async createAdmin() {
        const name = document.getElementById('admin-name-input').value;
        const email = document.getElementById('admin-email-input').value;
        const password = document.getElementById('admin-password-input').value;
        const phone = document.getElementById('admin-phone-input').value;

        if (!name || !email || !password || !phone) {
            notify('error', '❌ Fill all fields');
            return;
        }

        try {
            await db.collection('admins').add({
                name: name,
                email: email,
                password: password,
                phone: phone,
                ticketRange: { start: 1, end: 100 },
                customers: 0,
                revenue: 0,
                createdAt: new Date()
            });

            notify('success', `✅ Admin ${name} created!`);
            this.closeCreateModal();
            document.getElementById('admin-name-input').value = '';
            document.getElementById('admin-email-input').value = '';
            document.getElementById('admin-password-input').value = '';
            document.getElementById('admin-phone-input').value = '';

            await this.loadData();
            document.getElementById('admins-list').innerHTML = this.renderAdminsList();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    renderAdminsList() {
        if (this.admins.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No admins yet</p>';
        }

        return this.admins.map(admin => `
            <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-white">${admin.name}</p>
                        <p class="text-xs text-slate-400">${admin.email} • ${admin.phone}</p>
                        <p class="text-xs text-slate-400">Range: ${admin.ticketRange?.start || 1} - ${admin.ticketRange?.end || 100}</p>
                        <p class="text-xs text-slate-400">Customers: ${admin.customers || 0} • Revenue: ${admin.revenue || 0} ETB</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="mainAdminDashboard.admins.editAdmin('${admin.id}')" class="px-3 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded">Edit</button>
                        <button onclick="mainAdminDashboard.admins.deleteAdmin('${admin.id}')" class="px-3 py-1 bg-red-400/20 text-red-400 text-xs rounded">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async editAdmin(adminId) {
        // Placeholder for edit functionality
        notify('info', 'Edit functionality coming soon');
    }

    async deleteAdmin(adminId) {
        if (!confirm('Delete this admin?')) return;

        try {
            await db.collection('admins').doc(adminId).delete();
            notify('success', '✅ Admin deleted');
            await this.loadData();
            document.getElementById('admins-list').innerHTML = this.renderAdminsList();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}
