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
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-white">📅 Manage Appointments</h3>
                    <button onclick="window.adminBookAppointment.openModal()" class="px-4 py-2 bg-yellow-400 text-black font-bold rounded-xl text-xs">+ Book Appointment</button>
                </div>

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
                    <div class="space-y-2">
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
                    <div class="space-y-2">
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

                <!-- Add Appointment Modal -->
                <div id="appointment-modal" class="fixed inset-0 bg-black/80 hidden flex items-center justify-center z-50">
    <div class="glass-panel rounded-2xl p-6 w-full max-w-md border border-yellow-400/10 space-y-3">
        <h3 class="text-xl font-bold text-white mb-4">Book New Appointment</h3>
        <input type="text" id="apt-name-input" placeholder="Customer Name" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
        <input type="text" id="apt-date-input" placeholder="Date (e.g., 2026-07-25)" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
        <input type="text" id="apt-time-input" placeholder="Time (e.g., 10:00 AM)" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
        <input type="text" id="apt-purpose-input" placeholder="Purpose (e.g., Ticket Consultation)" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-white text-xs">
        <button onclick="window.adminBookAppointment.saveAppointment()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl text-xs">Save Appointment</button>
        <button onclick="window.adminBookAppointment.closeModal()" class="w-full py-2 bg-slate-700 text-white rounded-xl text-xs">Cancel</button>
    </div>
</div>
            </div>
        `;
    }

    openModal() {
        document.getElementById('appointment-modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('appointment-modal').classList.add('hidden');
    }

    async saveAppointment() {
        const customerName = document.getElementById('apt-name-input')?.value.trim();
        const date = document.getElementById('apt-date-input')?.value.trim();
        const time = document.getElementById('apt-time-input')?.value.trim();
        const purpose = document.getElementById('apt-purpose-input')?.value.trim();

        if (!customerName || !date || !time) {
            notify('error', '❌ Fill out required fields');
            return;
        }

        try {
            await db.collection('appointments').add({
                customerName,
                date,
                time,
                purpose: purpose || 'General Consultation',
                status: 'Pending',
                createdAt: new Date()
            });

            notify('success', '✅ Appointment successfully booked!');
            this.closeModal();

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
