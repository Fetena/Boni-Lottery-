// ============================================
// ADMIN BOOKAPPOINTMENT (CHILD COMPONENT) - FIXED
// ============================================

class AdminBookAppointment {
    constructor(adminId) {
        this.adminId = adminId;
        this.appointments = [];
    }

    async render() {
        await this.loadAppointmentsData();
        return this.renderContent();
    }

    async loadAppointmentsData() {
        try {
            if (!db) return;
            const snapshot = await db.collection('appointments').get();
            this.appointments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    }

    renderContent() {
        const appointments = this.appointments;

        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📅 Manage Appointments</h3>

                <!-- APPOINTMENT STATS -->
                <div class="grid grid-cols-3 gap-4">
                    <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 text-center">
                        <p class="text-xs text-slate-400">Total Booked</p>
                        <p class="text-2xl font-bold text-yellow-400 mt-2">${appointments.length}</p>
                    </div>
                    <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 text-center">
                        <p class="text-xs text-slate-400">Pending</p>
                        <p class="text-2xl font-bold text-blue-400 mt-2">${appointments.filter(a => a.status === 'Pending').length}</p>
                    </div>
                    <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 text-center">
                        <p class="text-xs text-slate-400">Confirmed</p>
                        <p class="text-2xl font-bold text-emerald-400 mt-2">${appointments.filter(a => a.status === 'Confirmed').length}</p>
                    </div>
                </div>

                <!-- PENDING APPOINTMENTS -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">⏳ Pending Appointments</h4>
                    <div class="space-y-2" id="pending-appointments-list">
                        ${appointments.filter(a => a.status === 'Pending').length === 0 ? '<p class="text-slate-400 text-xs">No pending appointments</p>' : 
                          appointments.filter(a => a.status === 'Pending').map(apt => `
                            <div class="bg-black/30 rounded-lg p-4 border border-yellow-400/10 text-xs">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-bold text-white">${apt.date || ''} ${apt.time || ''}</p>
                                        <p class="text-sm text-slate-300">${apt.customerName || apt.email || 'Customer'}</p>
                                        <p class="text-xs text-slate-400 mt-1">📌 ${apt.purpose || 'General'}</p>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="window.adminBookAppointment.updateStatus('${apt.id}', 'Confirmed')" 
                                            class="px-3 py-1 bg-emerald-600 text-white font-bold rounded">✅ Confirm</button>
                                        <button onclick="window.adminBookAppointment.updateStatus('${apt.id}', 'Cancelled')" 
                                            class="px-3 py-1 bg-red-600 text-white font-bold rounded">❌ Cancel</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- CONFIRMED APPOINTMENTS -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">✅ Confirmed Appointments</h4>
                    <div class="space-y-2" id="confirmed-appointments-list">
                        ${appointments.filter(a => a.status === 'Confirmed').length === 0 ? '<p class="text-slate-400 text-xs">No confirmed appointments</p>' : 
                          appointments.filter(a => a.status === 'Confirmed').map(apt => `
                            <div class="bg-black/30 rounded-lg p-4 border border-emerald-400/20 text-xs">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-bold text-white">${apt.date || ''} ${apt.time || ''}</p>
                                        <p class="text-sm text-slate-300">${apt.customerName || apt.email || 'Customer'}</p>
                                        <p class="text-xs text-emerald-400 mt-1">✅ Confirmed</p>
                                    </div>
                                    <button onclick="window.adminBookAppointment.updateStatus('${apt.id}', 'Completed')" 
                                        class="px-3 py-1 bg-yellow-400 text-black font-bold rounded">✔️ Complete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    async updateStatus(aptId, status) {
        if (!db) return notify('error', '❌ Database not initialized');

        try {
            await db.collection('appointments').doc(aptId).update({ status });
            notify('success', `✅ Appointment marked as ${status}`);
            
            // Refresh view
            const apptTab = document.getElementById('admin-bookAppointment');
            if (apptTab) {
                apptTab.innerHTML = await this.render();
            }
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}

// Global instance mapping
window.adminBookAppointment = null;
