class AdminNotifications {
    constructor(adminId) {
        this.adminId = adminId;
        this.pendingApprovals = [];
    }

    render() {
        return `
            <div class="space-y-6">
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h3 class="text-2xl font-bold text-white">✅ Pending Approvals</h3>
                    <div id="admin-approval-list" class="space-y-3">
                        <p class="text-slate-400 text-xs">Loading approvals from Firebase...</p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadPendingApprovals() {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('customer_appointments')
                .where('adminEmail', '==', this.adminId)
                .get();

            this.pendingApprovals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.refreshUI();
        } catch (e) {
            console.error('Error loading admin approvals from Firebase:', e);
        }
    }

    async updateBookingStatusCore(aptId, custId, newStatus) {
        if (typeof firebase === 'undefined' || !firebase.firestore) return;
        try {
            const db = firebase.firestore();
            // Update appointment status in Firestore
            await db.collection('customer_appointments').doc(aptId).update({ status: newStatus });

            // Push notification to customer collection in Firestore
            await db.collection('customer_notifications').add({
                custId: custId,
                message: `Your appointment status has been updated to ${newStatus}`,
                status: newStatus,
                timestamp: new Date().toLocaleTimeString(),
                viewed: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.error('Error updating status in Firebase:', e);
        }
    }

    async approveBooking(aptId, custId) {
        if (!confirm('Approve this booking?')) return;
        await this.updateBookingStatusCore(aptId, custId, 'Confirmed');
        if (typeof notify === 'function') notify('success', '✅ Appointment approved');
        await this.loadPendingApprovals();
    }

    async rejectBooking(aptId, custId) {
        if (!confirm('Reject this booking?')) return;
        await this.updateBookingStatusCore(aptId, custId, 'Rejected');
        if (typeof notify === 'function') notify('info', '❌ Appointment rejected');
        await this.loadPendingApprovals();
    }

    refreshUI() {
        const approvalListEl = document.getElementById('admin-approval-list');
        if (approvalListEl) {
            if (this.pendingApprovals.length === 0) {
                approvalListEl.innerHTML = '<p class="text-slate-400 text-xs py-2">No pending booking approvals found</p>';
                return;
            }
            approvalListEl.innerHTML = this.pendingApprovals.map(apt => `
                <div class="bg-black/40 rounded-xl p-4 border border-yellow-400/20 text-sm space-y-2">
                    <div>
                        <p class="font-bold text-white text-base">👤 Customer Booking: <span class="text-yellow-400">${apt.purpose}</span></p>
                        <p class="text-slate-300">📧 Account: <span class="text-white">${apt.custId}</span></p>
                        <p class="text-slate-300">📅 Schedule: <span class="text-white">${apt.date} at ${apt.time}</span></p>
                        <p class="text-xs text-yellow-400 mt-1">Status: ${apt.status}</p>
                    </div>
                    <div class="flex gap-2 pt-2 border-t border-white/5 justify-end">
                        <button onclick="window.adminNotifications.approveBooking('${apt.id}', '${apt.custId}')" class="px-3.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs">✅ Approve</button>
                        <button onclick="window.adminNotifications.rejectBooking('${apt.id}', '${apt.custId}')" class="px-3.5 py-1.5 bg-red-600 text-white font-bold rounded-lg text-xs">❌ Reject</button>
                    </div>
                </div>
            `).join('');
        }
    }
}
