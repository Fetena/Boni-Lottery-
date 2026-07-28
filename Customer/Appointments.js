// ============================================
// CUSTOMER APPOINTMENTS (CHILD COMPONENT)
// Parent: CustomerDashboard
// Book & manage appointments with branch admin
// ============================================

class CustomerAppointments {
    constructor(custId) {
        this.custId = custId || 'DEFAULT';
        this.appointments = [];
        this.admins = [];
        this.init();
    }

    async init() {
        this.loadAppointments();
        await this.loadAdmins();
        this.refreshList();
    }

    async loadAdmins() {
        try {
            // Fetch admins registered in Firestore
            const snapshot = await db.collection('admins').get();
            if (!snapshot.empty) {
                this.admins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                // Fallback storage or default list if empty
                this.admins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
            }
        } catch (e) {
            this.admins = JSON.parse(localStorage.getItem('registered_admins') || '[]');
        }

        // If still empty, add a default fallback so dropdown isn't blank
        if (this.admins.length === 0) {
            this.admins = [
                { id: 'admin_main', name: 'Main Admin (Default)', role: 'Super Admin' }
            ];
        }

        // Refresh dropdown options if rendered
        const selectEl = document.getElementById('apt-admin');
        if (selectEl) {
            selectEl.innerHTML = this.admins.map(a => `
                <option value="${a.name || a.id}">${a.name || a.id} ${a.role ? '('+a.role+')' : ''}</option>
            `).join('');
        }
    }

    loadAppointments() {
        try {
            const data = localStorage.getItem(`appointments_${this.custId}`);
            this.appointments = data ? JSON.parse(data) : [];
        } catch (e) {
            this.appointments = [];
        }
    }

    refreshList() {
        const listEl = document.getElementById('appointments-list');
        if (listEl) {
            listEl.innerHTML = this.renderAppointments();
        }
    }

    render() {
        // Load latest appointments whenever the layout renders
        this.loadAppointments();

        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📅 Appointments</h3>
                
                <!-- BOOK NEW APPOINTMENT -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">Book New Appointment</h4>
                    
                    <div>
                        <label class="text-sm text-slate-400">Select Registered Admin</label>
                        <select id="apt-admin" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                            <option value="">Loading registered admins...</option>
                            ${this.admins.map(a => `<option value="${a.name || a.id}">${a.name || a.id} ${a.role ? '('+a.role+')' : ''}</option>`).join('')}
                        </select>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm text-slate-400">Date</label>
                            <input type="date" id="apt-date" 
                                class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                        </div>
                        <div>
                            <label class="text-sm text-slate-400">Time</label>
                            <input type="time" id="apt-time" 
                                class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                        </div>
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">Purpose</label>
                        <select id="apt-purpose" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                            <option>Payment Verification</option>
                            <option>Ticket Support</option>
                            <option>Prize Claim</option>
                            <option>Account Issue</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">Description</label>
                        <textarea id="apt-desc" placeholder="Tell us what you need..." rows="3"
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1"></textarea>
                    </div>

                    <button onclick="customerAppointments.bookAppointment()" 
                        class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">📅 Confirm & Book Appointment</button>
                </div>

                <!-- SCHEDULED APPOINTMENTS -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                    <h4 class="font-bold text-white mb-4">Your Appointments</h4>
                    <div id="appointments-list" class="space-y-2">
                        ${this.renderAppointments()}
                    </div>
                </div>
            </div>
        `;
    }

    renderAppointments() {
        this.loadAppointments();
        
        if (this.appointments.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No appointments scheduled</p>';
        }

        return this.appointments.map(apt => `
            <div class="bg-black/30 rounded-lg p-4 border border-yellow-400/10 space-y-1">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-yellow-400">Admin: ${apt.adminName || 'Main Admin'}</p>
                        <p class="text-sm text-white font-medium mt-1">📅 ${apt.date} at ${apt.time}</p>
                        <p class="text-xs text-slate-300 mt-1">Purpose: <span class="text-white">${apt.purpose}</span></p>
                        ${apt.description ? `<p class="text-xs text-slate-400 mt-1">Note: ${apt.description}</p>` : ''}
                        <p class="text-xs text-emerald-400 mt-2 font-semibold">Status: ${apt.status}</p>
                    </div>
                    <div>
                        <button onclick="customerAppointments.cancelAppointment('${apt.id}')" 
                            class="px-3 py-1 bg-red-950/30 text-red-400 text-xs rounded hover:bg-red-950/50">Cancel</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    bookAppointment() {
        const adminName = document.getElementById('apt-admin')?.value;
        const date = document.getElementById('apt-date')?.value;
        const time = document.getElementById('apt-time')?.value;
        const purpose = document.getElementById('apt-purpose')?.value;
        const description = document.getElementById('apt-desc')?.value;

        if (!date || !time || !purpose || !adminName) {
            notify('error', '❌ Please fill all required fields');
            return;
        }

        const appointment = {
            id: 'APT' + Date.now(),
            custId: this.custId,
            adminName,
            date,
            time,
            purpose,
            description,
            status: 'Pending Confirmation',
            bookedAt: new Date().toLocaleTimeString()
        };

        this.loadAppointments();
        this.appointments.push(appointment);
        localStorage.setItem(`appointments_${this.custId}`, JSON.stringify(this.appointments));

        // Trigger top-right notification popup immediately
        notify('success', `✅ Appointment submitted to ${adminName} for approval!`);
        
        // Clear form fields
        document.getElementById('apt-date').value = '';
        document.getElementById('apt-time').value = '';
        document.getElementById('apt-desc').value = '';
        
        // Refresh list
        this.refreshList();
    }

    cancelAppointment(aptId) {
        if (confirm('Cancel this appointment?')) {
            this.loadAppointments();
            this.appointments = this.appointments.filter(a => a.id !== aptId);
            localStorage.setItem(`appointments_${this.custId}`, JSON.stringify(this.appointments));
            
            notify('info', '❌ Appointment cancelled');
            this.refreshList();
        }
    }
}

let customerAppointments;
document.addEventListener('DOMContentLoaded', () => {
    customerAppointments = new CustomerAppointments(localStorage.getItem('currentCustId') || currentUser?.email || 'DEFAULT');
});
