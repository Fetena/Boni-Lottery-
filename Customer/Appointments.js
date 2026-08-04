class CustomerAppointments {
    constructor(custId) {
        this.custId = custId || window.currentUser?.email || 'fete@gmail.com';
        this.appointments = [];
        this.admins = [];
        this.init();
        this.listenToCustomerNotifications();
    }

    setCustId(newCustId) {
        if (newCustId && newCustId !== this.custId) {
            this.custId = newCustId;
            this.loadAppointments();
        }
    }

    // Listen to real-time notification updates from Firestore
    listenToCustomerNotifications() {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        const db = firebase.firestore();

        db.collection('customer_notifications')
          .where('custId', '==', this.custId)
          .where('viewed', '==', false)
          .onSnapshot(snapshot => {
              snapshot.docChanges().forEach(change => {
                  if (change.type === 'added') {
                      const n = change.data();
                      this.showPopupModal(n.message, n.status);
                      if (typeof notify === 'function') {
                          notify('success', `🔔 ${n.message}`);
                      }
                      // Mark as viewed
                      db.collection('customer_notifications').doc(change.doc.id).update({ viewed: true });
                  }
              });
              this.updateBadgeCount();
          });
    }

    showPopupModal(message, status) {
        const existing = document.getElementById('apt-popup-modal');
        if (existing) existing.remove();

        const isApproved = status === 'Approved' || status === 'Confirmed';
        const borderColor = isApproved ? '#10b981' : '#ef4444';
        const textColor = isApproved ? 'text-emerald-400' : 'text-red-400';
        const icon = isApproved ? '🎉' : '⚠️';

        const modalHtml = `
            <div id="apt-popup-modal" style="position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.85); backdrop-filter: blur(4px); padding: 1rem;">
                <div class="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl" style="background: #000; border: 2px solid ${borderColor};">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 28px;">${icon}</span>
                        <div>
                            <h3 style="color: #fff; font-size: 18px; font-weight: bold; margin: 0;">Appointment Update</h3>
                            <p class="${textColor}" style="font-size: 12px; font-weight: 600; margin: 2px 0 0 0;">Status: ${status || 'Updated'}</p>
                        </div>
                    </div>
                    <div style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 14px; color: #e2e8f0; line-height: 1.4;">
                        ${message}
                    </div>
                    <button onclick="document.getElementById('apt-popup-modal').remove()" 
                        style="width: 100%; padding: 12px; background: #facc15; color: #000; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; font-size: 13px;">
                        Got It, Thanks!
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    async loadAppointments() {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('customer_appointments')
                .where('custId', '==', this.custId)
                .get();

            this.appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.refreshList();
        } catch (e) {
            console.error('Error fetching appointments from Firestore:', e);
            this.appointments = [];
        }
    }

    refreshList() {
        const listEl = document.getElementById('appointments-list');
        if (listEl) {
            listEl.innerHTML = this.renderAppointmentsHtml();
        }
    }

    async updateBadgeCount() {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('customer_notifications')
                .where('custId', '==', this.custId)
                .where('viewed', '==', false)
                .get();

            const badgeEl = document.getElementById('customer-appointments-badge');
            if (badgeEl) {
                if (snapshot.size > 0) {
                    badgeEl.textContent = snapshot.size;
                    badgeEl.classList.remove('hidden');
                } else {
                    badgeEl.textContent = '0';
                    badgeEl.classList.add('hidden');
                }
            }
        } catch (e) {}
    }

    async init() {
        await this.loadAssignedAdminSync();
        await this.loadAppointments();
    }

    async loadAssignedAdminSync() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                const snapshot = await db.collection('admins').get();
                
                if (!snapshot.empty) {
                    this.admins = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            name: data.name || data.email || doc.id,
                            email: data.email || doc.id,
                            ...data
                        };
                    });
                    return;
                }
            }
        } catch (e) {
            console.error('Error fetching admins from Firebase:', e);
        }
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📅 Appointments</h3>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">Book New Appointment</h4>
                    <div>
                        <label class="text-sm text-slate-400">Select Registered Admin</label>
                        <select id="apt-admin" class="w-full bg-black/45 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                            <option value="">-- Select Admin --</option>
                            ${this.admins.map(a => `<option value="${a.email}">${a.name || a.email}</option>`).join('')}
                        </select>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm text-slate-400">Date</label>
                            <input type="date" id="apt-date" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                        </div>
                        <div>
                            <label class="text-sm text-slate-400">Time</label>
                            <input type="time" id="apt-time" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                        </div>
                    </div>
                    <div>
                        <label class="text-sm text-slate-400">Purpose</label>
                        <select id="apt-purpose" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1">
                            <option>Payment Verification</option>
                            <option>Ticket Support</option>
                            <option>Prize Claim</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-sm text-slate-400">Description</label>
                        <textarea id="apt-desc" placeholder="Tell us what you need..." rows="3" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none mt-1"></textarea>
                    </div>
                    <button onclick="window.customerAppointments.bookAppointment()" class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">📅 Confirm & Book Appointment</button>
                </div>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                    <h4 class="font-bold text-white mb-4">Your Appointments</h4>
                    <div id="appointments-list" class="space-y-2">
                        ${this.renderAppointmentsHtml()}
                    </div>
                </div>
            </div>
        `;
    }

    renderAppointmentsHtml() {
        if (this.appointments.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No appointments scheduled</p>';
        }
        return this.appointments.map(apt => `
            <div class="bg-black/30 rounded-lg p-4 border border-yellow-400/10 space-y-1">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-yellow-400">Admin: ${apt.adminName || apt.adminEmail}</p>
                        <p class="text-sm text-white font-medium mt-1">📅 ${apt.date} at ${apt.time}</p>
                        <p class="text-xs text-slate-300 mt-1">Purpose: <span class="text-white">${apt.purpose}</span></p>
                        <p class="text-xs text-yellow-400 mt-2 font-semibold">Status: ${apt.status}</p>
                    </div>
                    <div>
                        <button onclick="window.customerAppointments.cancelAppointment('${apt.id}')" class="px-3 py-1 bg-red-950/30 text-red-400 text-xs rounded">Cancel</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async bookAppointment() {
        const adminEmail = document.getElementById('apt-admin')?.value;
        const date = document.getElementById('apt-date')?.value;
        const time = document.getElementById('apt-time')?.value;
        const purpose = document.getElementById('apt-purpose')?.value;
        const description = document.getElementById('apt-desc')?.value;

        if (!date || !time || !purpose || !adminEmail) {
            if (typeof notify === 'function') notify('error', '❌ Please fill all required fields');
            return;
        }

        try {
            const db = firebase.firestore();
            const appointment = {
                custId: this.custId,
                adminEmail: adminEmail,
                adminName: adminEmail,
                date,
                time,
                purpose,
                description,
                status: 'Pending Confirmation',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('customer_appointments').add(appointment);

            if (typeof notify === 'function') notify('success', `✅ Appointment successfully booked with ${adminEmail}!`);
            
            document.getElementById('apt-date').value = '';
            document.getElementById('apt-time').value = '';
            document.getElementById('apt-desc').value = '';
            await this.loadAppointments();
        } catch (e) {
            console.error('Error booking appointment in Firebase:', e);
            if (typeof notify === 'function') notify('error', '❌ Failed to book appointment');
        }
    }

    async cancelAppointment(aptId) {
        if (!confirm('Cancel this appointment?')) return;
        try {
            const db = firebase.firestore();
            await db.collection('customer_appointments').doc(aptId).delete();
            if (typeof notify === 'function') notify('info', '❌ Appointment cancelled');
            await this.loadAppointments();
        } catch (e) {
            console.error('Error deleting appointment:', e);
        }
    }
}
