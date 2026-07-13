// ============================================
// ADMIN BOOKAPPOINTMENT (CHILD COMPONENT)
// Parent: AdminDashboard
// Manage customer appointment bookings
// ============================================

class AdminBookAppointment {
    constructor(adminId) {
        this.adminId = adminId;
    }

    render() {
        const appointments = this.getAllAppointments();

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
                    <div class="space-y-2">
                        ${appointments.filter(a => a.status === 'Pending').map(apt => `
                            <div class="bg-black/30 rounded-lg p-4 border border-yellow-400/10">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-bold text-white">${apt.date} ${apt.time}</p>
                                        <p class="text-sm text-slate-300">${apt.customerName}</p>
                                        <p class="text-xs text-slate-400 mt-1">📌 ${apt.purpose}</p>
                                        <p class="text-xs text-slate-400">${apt.description}</p>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="adminBookAppointment.confirmAppointment('${apt.id}')" 
                                            class="px-3 py-1 bg-emerald-950/30 text-emerald-400 text-xs rounded hover:bg-emerald-950/50">✅ Confirm</button>
                                        <button onclick="adminBookAppointment.rescheduleAppointment('${apt.id}')" 
                                            class="px-3 py-1 bg-blue-950/30 text-blue-400 text-xs rounded hover:bg-blue-950/50">📅 Reschedule</button>
                                        <button onclick="adminBookAppointment.cancelAppointment('${apt.id}')" 
                                            class="px-3 py-1 bg-red-950/30 text-red-400 text-xs rounded hover:bg-red-950/50">❌ Cancel</button>
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
                        ${appointments.filter(a => a.status === 'Confirmed').map(apt => `
                            <div class="bg-black/30 rounded-lg p-4 border border-emerald-400/20">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-bold text-white">${apt.date} ${apt.time}</p>
                                        <p class="text-sm text-slate-300">${apt.customerName}</p>
                                        <p class="text-xs text-emerald-400 mt-1">✅ Confirmed</p>
                                    </div>
                                    <button onclick="adminBookAppointment.markCompleted('${apt.id}')" 
                                        class="px-3 py-1 bg-yellow-950/30 text-yellow-400 text-xs rounded hover:bg-yellow-950/50">✔️ Complete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getAllAppointments() {
        // Get all customers and their appointments
        const customers = db.getCustomers() || {};
        const allAppointments = [];

        Object.values(customers).forEach(cust => {
            const custAppointments = db.getAppointments(cust.id) || [];
            custAppointments.forEach(apt => {
                allAppointments.push({
                    ...apt,
                    customerName: cust.name
                });
            });
        });

        return allAppointments;
    }

    confirmAppointment(aptId) {
        showNotification('success', '✅ Appointment confirmed! Customer notified.');
        this.updateAppointmentStatus(aptId, 'Confirmed');
    }

    rescheduleAppointment(aptId) {
        showNotification('info', '📅 Reschedule feature coming soon');
    }

    cancelAppointment(aptId) {
        if (confirm('Cancel this appointment?')) {
            showNotification('info', '❌ Appointment cancelled');
            this.updateAppointmentStatus(aptId, 'Cancelled');
        }
    }

    markCompleted(aptId) {
        showNotification('success', '✔️ Appointment marked as completed');
        this.updateAppointmentStatus(aptId, 'Completed');
    }

    updateAppointmentStatus(aptId, status) {
        // TODO: Implement status update in storage
        console.log(`Updated appointment ${aptId} to ${status}`);
    }
}

// Global instance
let adminBookAppointment;
