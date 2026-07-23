// ============================================
// MAIN ADMIN - ADMINS MANAGEMENT (FULL EDIT & PERMISSIONS)
// ============================================

class Admins {
    constructor() {
        this.admins = [];
        this.editingAdminId = null;
    }

    render() {
        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-white">🛡️ Manage Admins</h3>
                    <button onclick="window.mainAdminDashboard.admins.showCreateModal()" class="px-4 py-2 bg-yellow-400 text-black font-bold rounded-xl">+ Create Admin</button>
                </div>
                <div id="admins-list" class="space-y-3">${this.renderAdminsList()}</div>
            </div>

            <!-- Create Admin Modal -->
            <div id="create-admin-modal" class="modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content p-6 m-auto max-w-lg w-full space-y-4">
                    <h3 class="text-xl font-bold text-white">Create New Admin</h3>
                    <div class="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Full Name</label>
                            <input type="text" id="admin-name-input" placeholder="Full Name" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Email Address</label>
                            <input type="email" id="admin-email-input" placeholder="Email" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Password</label>
                            <input type="password" id="admin-password-input" placeholder="Password" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Phone Number</label>
                            <input type="tel" id="admin-phone-input" placeholder="Phone" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                        </div>
                        
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block text-xs text-slate-400 mb-1">Ticket Range Start</label>
                                <input type="number" id="admin-range-start" value="1" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                            </div>
                            <div>
                                <label class="block text-xs text-slate-400 mb-1">Ticket Range End</label>
                                <input type="number" id="admin-range-end" value="100" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs text-slate-400 mb-2">Allowed Services & Features</label>
                            <div class="grid grid-cols-2 gap-2 bg-black/30 p-3 rounded-xl border border-yellow-400/10 text-xs text-slate-300">
                                <label class="flex items-center"><input type="checkbox" id="perm-customers" checked class="mr-2"> Customers</label>
                                <label class="flex items-center"><input type="checkbox" id="perm-tickets" checked class="mr-2"> Tickets</label>
                                <label class="flex items-center"><input type="checkbox" id="perm-payments" checked class="mr-2"> Payments</label>
                                <label class="flex items-center"><input type="checkbox" id="perm-notifications" checked class="mr-2"> Notifications</label>
                                <label class="flex items-center"><input type="checkbox" id="perm-appointments" checked class="mr-2"> Bookings & Issues</label>
                            </div>
                        </div>

                        <button onclick="window.mainAdminDashboard.admins.createAdmin()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl text-xs">Create Admin</button>
                        <button onclick="window.mainAdminDashboard.admins.closeCreateModal()" class="w-full py-2 bg-slate-700 text-white rounded-xl text-xs">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- Edit Admin Modal -->
            <div id="edit-admin-modal" class="modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content p-6 m-auto max-w-lg w-full space-y-4">
                    <h3 class="text-xl font-bold text-white">Edit Admin & Permissions</h3>
                    <div class="space-y-3 max-h-[75vh] overflow-y-auto pr-2">
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Full Name</label>
                            <input type="text" id="edit-admin-name" placeholder="Full Name" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Email Address</label>
                            <input type="email" id="edit-admin-email" placeholder="Email" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Phone Number</label>
                            <input type="tel" id="edit-admin-phone" placeholder="Phone" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                        </div>

                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block text-xs text-slate-400 mb-1">Ticket Range Start</label>
                                <input type="number" id="edit-admin-range-start" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                            </div>
                            <div>
                                <label class="block text-xs text-slate-400 mb-1">Ticket Range End</label>
                                <input type="number" id="edit-admin-range-end" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs text-slate-400 mb-2">Allowed Services & Features</label>
                            <div class="grid grid-cols-2 gap-2 bg-black/30 p-3 rounded-xl border border-yellow-400/10 text-xs text-slate-300">
                                <label class="flex items-center"><input type="checkbox" id="edit-perm-customers" class="mr-2"> Customers</label>
                                <label class="flex items-center"><input type="checkbox" id="edit-perm-tickets" class="mr-2"> Tickets</label>
                                <label class="flex items-center"><input type="checkbox" id="edit-perm-payments" class="mr-2"> Payments</label>
                                <label class="flex items-center"><input type="checkbox" id="edit-perm-notifications" class="mr-2"> Notifications</label>
                                <label class="flex items-center"><input type="checkbox" id="edit-perm-appointments" class="mr-2"> Bookings & Issues</label>
                            </div>
                        </div>

                        <button onclick="window.mainAdminDashboard.admins.updateAdmin()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl text-xs">Update Admin</button>
                        <button onclick="window.mainAdminDashboard.admins.closeEditModal()" class="w-full py-2 bg-slate-700 text-white rounded-xl text-xs">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) {
                console.error('Database not initialized');
                return;
            }
            
            const snapshot = await db.collection('admins').get();
            this.admins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const listContainer = document.getElementById('admins-list'); 
            if (listContainer) {
                listContainer.innerHTML = this.renderAdminsList();
            }
        } catch (error) {
            console.error('Error loading admins:', error);
        }
    }

    showCreateModal() {
        const modal = document.getElementById('create-admin-modal');
        if (modal) modal.style.display = 'flex';
    }

    closeCreateModal() {
        const modal = document.getElementById('create-admin-modal');
        if (modal) modal.style.display = 'none';
    }

    openEditModal(adminId) {
        const admin = this.admins.find(a => a.id === adminId);
        if (!admin) return;

        this.editingAdminId = adminId;
        document.getElementById('edit-admin-name').value = admin.name || '';
        document.getElementById('edit-admin-email').value = admin.email || '';
        document.getElementById('edit-admin-phone').value = admin.phone || '';
        document.getElementById('edit-admin-range-start').value = admin.ticketRange?.start || 1;
        document.getElementById('edit-admin-range-end').value = admin.ticketRange?.end || 100;

        const permissions = admin.permissions || {};
        document.getElementById('edit-perm-customers').checked = permissions.customers ?? true;
        document.getElementById('edit-perm-tickets').checked = permissions.tickets ?? true;
        document.getElementById('edit-perm-payments').checked = permissions.payments ?? true;
        document.getElementById('edit-perm-notifications').checked = permissions.notifications ?? true;
        document.getElementById('edit-perm-appointments').checked = permissions.appointments ?? true;

        const modal = document.getElementById('edit-admin-modal');
        if (modal) modal.style.display = 'flex';
    }

    closeEditModal() {
        this.editingAdminId = null;
        const modal = document.getElementById('edit-admin-modal');
        if (modal) modal.style.display = 'none';
    }

async createAdmin() {
    const name = document.getElementById('admin-name-input')?.value.trim() || '';
    
    // Check both potential email IDs to prevent null errors
    const emailEl = document.getElementById('admin-email') || document.getElementById('admin-email-input');
    const passwordEl = document.getElementById('admin-password') || document.getElementById('admin-password-input');
    
    const email = emailEl?.value.trim() || '';
    const password = passwordEl?.value || '';
    const phone = document.getElementById('admin-phone-input')?.value.trim() || '';
    const rangeStart = parseInt(document.getElementById('admin-range-start')?.value || 1);
    const rangeEnd = parseInt(document.getElementById('admin-range-end')?.value || 100);

    const permissions = {
        customers: document.getElementById('perm-customers')?.checked || false,
        tickets: document.getElementById('perm-tickets')?.checked || false,
        payments: document.getElementById('perm-payments')?.checked || false,
        notifications: document.getElementById('perm-notifications')?.checked || false,
        appointments: document.getElementById('perm-appointments')?.checked || false
    };

    if (!name || !email || !password || !phone) {
        notify('error', '❌ Fill all required fields');
        return;
    }

    if (!db) {
        notify('error', '❌ Database not initialized');
        return;
    }

    try {
        // 1. Create the Firebase Auth login credentials
        await firebase.auth().createUserWithEmailAndPassword(email, password);

        // 2. Save the admin info in Firestore using their email as the document ID
        await db.collection('admins').doc(email).set({
            name,
            email,
            phone,
            ticketRange: { start: rangeStart, end: rangeEnd },
            permissions,
            customers: 0,
            revenue: 0,
            createdAt: new Date()
        });

        notify('success', `✅ Admin ${name} created successfully!`);
        this.closeCreateModal();
        await this.loadData();
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

    async updateAdmin() {
        if (!this.editingAdminId) return;

        const name = document.getElementById('edit-admin-name')?.value.trim() || '';
        const email = document.getElementById('edit-admin-email')?.value.trim() || '';
        const phone = document.getElementById('edit-admin-phone')?.value.trim() || '';
        const rangeStart = parseInt(document.getElementById('edit-admin-range-start')?.value || 1);
        const rangeEnd = parseInt(document.getElementById('edit-admin-range-end')?.value || 100);

        const permissions = {
            customers: document.getElementById('edit-perm-customers')?.checked || false,
            tickets: document.getElementById('edit-perm-tickets')?.checked || false,
            payments: document.getElementById('edit-perm-payments')?.checked || false,
            notifications: document.getElementById('edit-perm-notifications')?.checked || false,
            appointments: document.getElementById('edit-perm-appointments')?.checked || false
        };

        if (!name || !email) {
            notify('error', '❌ Name and Email are required');
            return;
        }

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('admins').doc(this.editingAdminId).update({
                name,
                email,
                phone,
                ticketRange: { start: rangeStart, end: rangeEnd },
                permissions,
                updatedAt: new Date()
            });

            notify('success', '✅ Admin updated successfully!');
            this.closeEditModal();
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    renderAdminsList() {
        if (this.admins.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No admins yet</p>';
        }

        return this.admins.map(admin => {
            const p = admin.permissions || { customers: true, tickets: true, payments: true, notifications: true, appointments: true };
            const allowedServices = Object.keys(p)
                .filter(key => p[key])
                .map(key => key.charAt(0).toUpperCase() + key.slice(1))
                .join(', ');

            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                    <div class="flex justify-between items-start">
                        <div class="space-y-1">
                            <p class="font-bold text-white text-sm">${admin.name || 'N/A'}</p>
                            <p class="text-xs text-slate-400">${admin.email || 'N/A'} • ${admin.phone || 'N/A'}</p>
                            <p class="text-xs text-yellow-400/80">🎟️ Ticket Range: ${admin.ticketRange?.start || 1} - ${admin.ticketRange?.end || 100}</p>
                            <p class="text-xs text-slate-400">🛡️ Allowed Services: <span class="text-slate-200">${allowedServices || 'None'}</span></p>
                            <p class="text-xs text-slate-500">Customers: ${admin.customers || 0} • Revenue: ${admin.revenue || 0} ETB</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="window.mainAdminDashboard.admins.openEditModal('${admin.id}')" class="px-3 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded font-bold">Edit</button>
                            <button onclick="window.mainAdminDashboard.admins.deleteAdmin('${admin.id}')" class="px-3 py-1 bg-red-400/20 text-red-400 text-xs rounded font-bold">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async deleteAdmin(adminId) {
        if (!confirm('Delete this admin?')) return;

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('admins').doc(adminId).delete();
            notify('success', '✅ Admin deleted');
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}
