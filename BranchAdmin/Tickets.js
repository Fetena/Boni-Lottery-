// ============================================
// ADMIN TICKETS MODULE COMPONENT
// ============================================

class AdminTickets {
    constructor(adminId) {
        this.adminId = adminId;
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-xl font-bold text-white">Recent Tickets</h3>
                <div id="admin-tickets-list" class="space-y-3"></div>
            </div>
        `;
    }

    async init() {
        if (!db) return;

        try {
            const snapshot = await db.collection('customer_tickets')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            const content = document.getElementById('admin-tickets-list');
            if (!content) return;

            if (snapshot.empty) {
                content.innerHTML = '<p class="text-slate-400">No tickets yet</p>';
                this.updateTicketsTabBadge(0);
                return;
            }

            let pendingCount = 0;

            content.innerHTML = snapshot.docs.map(doc => {
                const ticket = doc.data();
                const isPending = !ticket.status || ticket.status === 'Pending';
                const ticketId = doc.id;

                if (isPending) {
                    pendingCount++;
                }

                // Ticket-level notification badge pill on top right of the pending ticket card
                let notificationBadge = '';
                if (isPending) {
                    notificationBadge = `
                        <div class="absolute -top-3 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-[11px] font-extrabold shadow-lg flex items-center gap-1.5 animate-bounce z-10 border border-yellow-300">
                            <span>🔔</span> New Ticket Requested!
                        </div>
                    `;
                }

                return `
                    <div class="glass-panel rounded-lg p-4 border ${isPending ? 'border-yellow-400/50 bg-yellow-500/[0.02]' : 'border-yellow-400/10'} text-xs space-y-2 relative mt-3">
                        ${notificationBadge}
                        <p class="text-white font-bold">Customer: ${ticket.customerName || 'N/A'} (${ticket.customerEmail || ''})</p>
                        <p class="text-slate-400">Numbers: ${ticket.numbers?.join(', ') || 'N/A'}</p>
                        <p class="text-slate-400">Cost: ${ticket.cost} ETB • Payment: ${ticket.paymentMethod || 'N/A'}</p>
                        <div class="flex justify-between items-center pt-2 border-t border-yellow-400/10">
                            <span class="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded">${ticket.status || 'Pending'}</span>
                            <div class="flex gap-2">
                                <button onclick="window.adminTickets.approvePayment('${ticketId}')" class="px-3 py-1 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-500">Approve</button>
                                <button onclick="window.adminTickets.rejectPayment('${ticketId}')" class="px-3 py-1 bg-red-600 text-white font-bold rounded hover:bg-red-500">Reject</button>
                                <button onclick="window.adminTickets.deleteTicket('${ticketId}')" class="px-3 py-1 bg-slate-800 hover:bg-rose-900 text-rose-400 border border-rose-500/20 font-bold rounded">🗑️ Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Updates the red notification counter badge directly on the Tickets navigation tab
            this.updateTicketsTabBadge(pendingCount);

        } catch (error) {
            console.error('Error loading tickets:', error);
        }
    }

    // Helper to toggle the red counter badge on the Tickets tab (syncs with ID in your nav markup)
    updateTicketsTabBadge(count) {
        const badge = document.getElementById('badge-branch-tickets');
        if (!badge) return;

        if (count > 0) {
            badge.innerText = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    async approvePayment(docId) {
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            await db.collection('customer_tickets').doc(docId).update({
                status: 'Approved',
                approvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            notify('success', '✅ Payment approved successfully!');
            await this.init();
            await loadAdminStats();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async rejectPayment(docId) {
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            await db.collection('customer_tickets').doc(docId).update({
                status: 'Rejected',
                rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            notify('error', '❌ Payment rejected');
            await this.init();
            await loadAdminStats();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async deleteTicket(docId) {
        if (!confirm('Are you sure you want to delete this ticket?')) return;
        if (!db) return notify('error', '❌ Database not initialized');

        try {
            await db.collection('customer_tickets').doc(docId).delete();
            notify('success', '🗑️ Ticket deleted successfully!');
            await this.init();
            await loadAdminStats();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }
}
