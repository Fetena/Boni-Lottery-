// ============================================
// MAIN ADMIN - RANGES MANAGEMENT (WITH EDIT)
// ============================================

class Ranges {
    constructor() {
        this.ranges = [];
        this.editingRangeId = null;
    }

    render() {
        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-white">📊 Ticket Ranges</h3>
                    <button onclick="window.mainAdminDashboard.ranges.showCreateModal()" class="px-4 py-2 bg-yellow-400 text-black font-bold rounded-xl">+ Add Range</button>
                </div>
                <div id="ranges-list" class="space-y-3">${this.renderRangesList()}</div>
            </div>

            <!-- Create Range Modal -->
            <div id="create-range-modal" class="modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content p-6 m-auto">
                    <h3 class="text-xl font-bold text-white mb-4">Add Range</h3>
                    <div class="space-y-3">
                        <input type="number" id="range-admin-input" placeholder="Admin ID" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <input type="number" id="range-start-input" placeholder="Start Number" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <input type="number" id="range-end-input" placeholder="End Number" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <button onclick="window.mainAdminDashboard.ranges.createRange()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Create</button>
                        <button onclick="window.mainAdminDashboard.ranges.closeCreateModal()" class="w-full py-2 bg-slate-700 text-white rounded-xl">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- Edit Range Modal -->
            <div id="edit-range-modal" class="modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content p-6 m-auto">
                    <h3 class="text-xl font-bold text-white mb-4">Edit Range</h3>
                    <div class="space-y-3">
                        <input type="number" id="edit-range-admin-input" placeholder="Admin ID" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <input type="number" id="edit-range-start-input" placeholder="Start Number" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <input type="number" id="edit-range-end-input" placeholder="End Number" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white">
                        <button onclick="window.mainAdminDashboard.ranges.updateRange()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Update</button>
                        <button onclick="window.mainAdminDashboard.ranges.closeEditModal()" class="w-full py-2 bg-slate-700 text-white rounded-xl">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;
            const snapshot = await db.collection('ranges').get();
            this.ranges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const listContainer = document.getElementById('ranges-list');
            if (listContainer) {
                listContainer.innerHTML = this.renderRangesList();
            }
        } catch (error) {
            console.error('Error loading ranges:', error);
        }
    }

    renderRangesList() {
        if (this.ranges.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No ranges yet</p>';
        }

        return this.ranges.map(range => `
            <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-white">Range ${range.id}</p>
                        <p class="text-xs text-slate-400">Numbers: ${range.start} - ${range.end}</p>
                        <p class="text-xs text-slate-400">Admin: ${range.adminId || 'N/A'}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.mainAdminDashboard.ranges.openEditModal('${range.id}')" class="px-3 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded">Edit</button>
                        <button onclick="window.mainAdminDashboard.ranges.deleteRange('${range.id}')" class="px-3 py-1 bg-red-400/20 text-red-400 text-xs rounded">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showCreateModal() {
        const modal = document.getElementById('create-range-modal');
        if (modal) modal.style.display = 'flex';
    }

    closeCreateModal() {
        const modal = document.getElementById('create-range-modal');
        if (modal) modal.style.display = 'none';
    }

    openEditModal(rangeId) {
        const range = this.ranges.find(r => r.id === rangeId);
        if (!range) return;

        this.editingRangeId = rangeId;
        document.getElementById('edit-range-admin-input').value = range.adminId || '';
        document.getElementById('edit-range-start-input').value = range.start || '';
        document.getElementById('edit-range-end-input').value = range.end || '';

        const modal = document.getElementById('edit-range-modal');
        if (modal) modal.style.display = 'flex';
    }

    closeEditModal() {
        this.editingRangeId = null;
        const modal = document.getElementById('edit-range-modal');
        if (modal) modal.style.display = 'none';
    }

    async createRange() {
        const adminId = document.getElementById('range-admin-input')?.value || '';
        const start = parseInt(document.getElementById('range-start-input')?.value || 0);
        const end = parseInt(document.getElementById('range-end-input')?.value || 0);

        if (!adminId || !start || !end) {
            notify('error', '❌ Fill all fields');
            return;
        }

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('ranges').add({
                adminId: adminId,
                start: start,
                end: end,
                createdAt: new Date()
            });

            notify('success', '✅ Range created!');
            this.closeCreateModal();
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async updateRange() {
        if (!this.editingRangeId) return;

        const adminId = document.getElementById('edit-range-admin-input')?.value || '';
        const start = parseInt(document.getElementById('edit-range-start-input')?.value || 0);
        const end = parseInt(document.getElementById('edit-range-end-input')?.value || 0);

        if (!adminId || !start || !end) {
            notify('error', '❌ Fill all fields');
            return;
        }

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('ranges').doc(this.editingRangeId).update({
                adminId: adminId,
                start: start,
                end: end,
                updatedAt: new Date()
            });

            notify('success', '✅ Range updated successfully!');
            this.closeEditModal();
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async deleteRange(rangeId) {
        if (!confirm('Delete this range?')) return;

        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('ranges').doc(rangeId).delete();
            notify('success', '✅ Range deleted');
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}
