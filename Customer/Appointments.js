// ============================================
// CUSTOMER APPOINTMENTS (CHILD COMPONENT)
// Parent: CustomerDashboard
// Book & manage appointments with branch admin
// ============================================

class CustomerAppointments {
    constructor(custId) {
        this.custId = custId;
        this.appointments = db.getAppointments(custId) || [];
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📅 Appointments</h3>
                
                <!-- BOOK NEW APPOINTMENT -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">Book New Appointment</h4>
                    
                    <div>
                        <label class="text-sm text-slate-400">Date</label>
                        <input type="date" id="apt-date" 
                            class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                    </div>

                    <div>
                        <label class="text-sm text-slate-400">Time</label>
                        <select id="apt-time" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                            <option>10:00 AM</option>
                            <option>11:00 AM</option>
                            <option>2:00 PM</option>
                            <option>3:00 PM</option>
                            <option>4:00 PM</option>
                        </select>
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
                        class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">📅 Book Appointment</button>
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
        const appointments = db.getAppointments(this.custId) || [];
        
        if (appointments.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No appointments scheduled</p>';
        }

        return appointments.map(apt => `
            <div class="bg-black/30 rounded-lg p-4 border border-yellow-400/10">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-yellow-400">${apt.date} ${apt.time}</p>
                        <p class="text-sm text-white mt-1">${apt.purpose}</p>
                        <p class="text-xs text-slate-400 mt-1">${apt.description}</p>
                        <p class="text-xs text-emerald-400 mt-2">Status: ${apt.status}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="customerAppointments.cancelAppointment('${apt.id}')" 
                            class="px-3 py-1 bg-red-950/30 text-red-400 text-xs rounded hover:bg-red-950/50">Cancel</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    bookAppointment() {
        const date = document.getElementById('apt-date')?.value;
        const time = document.getElementById('apt-time')?.value;
        const purpose = document.getElementById('apt-purpose')?.value;
        const description = document.getElementById('apt-desc')?.value;

        if (!date || !time || !purpose) {
            showNotification('error', '❌ Fill all required fields');
            return;
        }

        const appointment = {
            id: 'APT' + Date.now(),
            custId: this.custId,
            date,
            time,
            purpose,
            description,
            status: 'Pending',
            bookedAt: new Date().toLocaleTimeString()
        };

        const appointments = db.getAppointments(this.custId) || [];
        appointments.push(appointment);
        localStorage.setItem(`appointments_${this.custId}`, JSON.stringify(appointments));

        showNotification('success', '✅ Appointment booked! Admin will confirm shortly.');
        
        // Clear form
        document.getElementById('apt-date').value = '';
        document.getElementById('apt-desc').value = '';
        
        // Refresh list
        document.getElementById('appointments-list').innerHTML = this.renderAppointments();
    }

    cancelAppointment(aptId) {
        if (confirm('Cancel this appointment?')) {
            let appointments = db.getAppointments(this.custId) || [];
            appointments = appointments.filter(a => a.id !== aptId);
            localStorage.setItem(`appointments_${this.custId}`, JSON.stringify(appointments));
            
            showNotification('info', '❌ Appointment cancelled');
            document.getElementById('appointments-list').innerHTML = this.renderAppointments();
        }
    }
}

// Global instance
let customerAppointments;
