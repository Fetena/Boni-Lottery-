// ============================================
// MAIN ADMIN BOOKINGS (CHILD COMPONENT)
// Parent: MainAdminDashboard
// Manage and approve branch admin bookings & maintenance requests
// ============================================

class MainAdminBookings {
    constructor() {
        this.appointments = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📅 Branch Admin Bookings & Issues</h3>
                
                <!-- STATS -->
                <div class="grid grid-cols-3 gap-4">
                    <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 text-center">
                        <p class="text-xs text-slate-400">Total Requests</p>
                        <p class="text-2xl font-bold text-yellow-400 mt-2" id="ma-total-bookings">0</p>
                    </div>
                    <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 text-center">
                        <p class="text-xs text-slate-400">Pending Review</p>
                        <p class="text-2xl font-bold text-blue-400 mt-2" id="ma-pending-bookings">0</p>
                    </div>
                    <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 text-center">
                        <p class="text-xs text-slate-400">Confirmed</p>
                        <p class="text-2xl font-bold text-emerald-400 mt-2" id="ma-confirmed-bookings">0</p>
                    </div>
                </div>

                <!-- BOOKINGS LIST CONTAINER -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">📋 All Admin Requests & Maintenance</h4>
                    <div id="main-admin-bookings-list" class="space-y-3">
                        <p class="text-slate-400 text-xs">Loading requests...</p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;
            const snapshot = await db.collection('appointments').get();
            this.appointments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.renderBookingsList();
        } catch (error) {
            console.error('Error loading main admin bookings:', error);
        }
    }

    renderBookingsList() {
        const container = document.getElementById('main-admin-bookings-list');
        const totalEl = document.getElementById('ma-total-bookings');
        const pendingEl = document.getElementById('ma-pending-bookings');
        const confirmedEl = document.getElementById('ma-confirmed-bookings');

        if (!container) return;
const pendingCount = this.appointments.filter(a => a.status === 'Pending').length;
const badgeEl = document.getElementById('badge-main-bookings');
if (badgeEl) {
    if (pendingCount > 0) {
        badgeEl.textContent = pendingCount;
        badgeEl.classList.remove('hidden');
    } else {
        badgeEl.classList.add('hidden');
    }
}
        const total = this.appointments.length;
        const pending = this.appointments.filter(a => a.status === 'Pending').length;
        const confirmed = this.appointments.filter(a => a.status === 'Confirmed').length;

        if (totalEl) totalEl.textContent = total;
        if (pendingEl) pendingEl.textContent = pending;
        if (confirmedEl) confirmedEl.textContent = confirmed;

        if (this.appointments.length === 0) {
            container.innerHTML = '<p class="text-slate-400 text-xs text-center py-4">No booking or maintenance requests found</p>';
            return;
        }

        container.innerHTML = this.appointments.map(apt => `
            <div class="bg-black/30 rounded-lg p-4 border border-yellow-400/10 text-xs space-y-2">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-white font-bold">Admin Email: ${apt.adminEmail || 'Unknown Branch Admin'}</p>
                        <p class="text-yellow-400 font-semibold mt-1">📌 Category: ${apt.purpose || 'General'}</p>
                        <p class="text-slate-300 mt-1">🗓️ Date/Time: ${apt.date || 'N/A'} at ${apt.time || 'N/A'}</p>
                        <p class="text-slate-400 mt-1">💬 Details: ${apt.description || 'No description provided'}</p>
                    </div>
                    <span class="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded">${apt.status || 'Pending'}</span>
                </div>
                <div class="flex justify-end gap-2 pt-2 border-t border-yellow-400/10">
                    <button onclick="window.mainAdminDashboard.bookings.updateBookingStatus('${apt.id}', 'Confirmed')" 
                        class="px-3 py-1 bg-emerald-600 text-white font-bold rounded">✅ Approve</button>
                    <button onclick="window.mainAdminDashboard.bookings.updateBookingStatus('${apt.id}', 'Cancelled')" 
                        class="px-3 py-1 bg-red-600 text-white font-bold rounded">❌ Reject</button>
                    <button onclick="window.mainAdminDashboard.bookings.updateBookingStatus('${apt.id}')" 
                        class="px-3 py-1 bg-red-600 text-white font-bold rounded">❌ Delete</button>
                </div>
            </div>
        `).join('');
    }

    async updateBookingStatus(aptId, status) {
        if (!db) return notify('error', '❌ Database not initialized');

        try {
            await db.collection('appointments').doc(aptId).update({ status });
            notify('success', `✅ Request successfully marked as ${status}`);
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}
