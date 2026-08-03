// ============================================
// ADMIN TICKETS - SEPARATE COMPONENT
// ============================================

class AdminTickets {
    constructor(adminId) {
        this.adminId = adminId;
        this.tickets = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-xl font-bold text-white">🎫 Recent Tickets</h3>
                <div id="admin-tickets-list" class="space-y-3"></div>
            </div>
        `;
    }

    async loadData() {
        if (!db || !currentUser) return;

        try {
            // STEP 1: Get THIS admin's customers only
            const customersSnapshot = await db.collection('admin_customers')
                .where('adminEmail', '==', currentUser.email)
                .get();

            const adminCustomerEmails = customersSnapshot.docs.map(doc => doc.data().email);

            // STEP 2: Get tickets ONLY from this admin's customers
            let allTickets = [];
            
            if (adminCustomerEmails.length > 0) {
                for (const custEmail of adminCustomerEmails) {
                    const ticketSnapshot = await db.collection('customer_tickets')
                        .where('customerEmail', '==', custEmail)
                        .orderBy('createdAt', 'desc')
                        .get();

                    allTickets = allTickets.concat(ticketSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })));
                }

                // Sort all tickets by date
                allTickets.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            }

            this.tickets = allTickets;
            this.render();
        } catch (error) {
            console.error('Error loading admin tickets:', error);
            notify('error', `❌ Error loading tickets: ${error.message}`);
        }
    }

    render() {
        const container = document.getElementById('admin-tickets-list');
        if (!container) return;

        if (this.tickets.length === 0) {
            container.innerHTML = `
                <div class="glass-panel rounded-lg p-6 border border-yellow-400/10 text-center text-slate-400">
                    <p>No tickets from your customers yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.tickets.map(ticket => {
            const isApproved = ticket.status === 'Approved' || ticket.status === 'active';
            const isPending = !ticket.status || ticket.status === 'Pending';
            const isRejected = ticket.status === 'Rejected';

            return `
                <div class="glass-panel rounded-lg p-4 border ${isPending ? 'border-yellow-400/50 bg-yellow-500/[0.02]' : 'border-yellow-400/10'} space-y-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-white">Customer: ${ticket.customerName || ticket.customerEmail}</p>
                            <p class="text-xs text-slate-400">Email: ${ticket.customerEmail}</p>
                            <p class="text-sm text-yellow-400 font-semibold">Numbers: ${ticket.numbers ? ticket.numbers.join(', ') : 'N/A'}</p>
                            <p class="text-xs text-slate-400">Cost: ${ticket.cost} ETB • Payment: ${ticket.paymentMethod || 'N/A'}</p>
                        </div>
                        <div class="text-right">
                            <span class="px-3 py-1 rounded-full text-xs font-bold ${
                                isApproved ? 'bg-emerald-400/20 text-emerald-400' : 
                                isRejected ? 'bg-red-400/20 text-red-400' :
                                'bg-yellow-400/20 text-yellow-400'
                            }">
                                ${isApproved ? '✅ Approved' : isRejected ? '❌ Rejected' : '⏳ Pending'}
                            </span>
                        </div>
                    </div>

                    <!-- Receipt & Buttons -->
                    <div class="flex gap-2 pt-2 flex-wrap">
                        <button onclick="window.adminTicketsComponent.viewReceipt('${ticket.id}')" class="px-3 py-1 bg-blue-400/20 text-blue-400 text-xs font-bold rounded hover:bg-blue-400/30">
                            📋 View Receipt
                        </button>
                        ${isPending ? `
                            <button onclick="window.adminTicketsComponent.approve('${ticket.id}')" class="px-3 py-1 bg-emerald-400/20 text-emerald-400 text-xs font-bold rounded hover:bg-emerald-400/30">
                                ✅ Approve
                            </button>
                            <button onclick="window.adminTicketsComponent.reject('${ticket.id}')" class="px-3 py-1 bg-red-400/20 text-red-400 text-xs font-bold rounded hover:bg-red-400/30">
                                ❌ Reject
                            </button>
                        ` : ''}
                        <button onclick="window.adminTicketsComponent.delete('${ticket.id}')" class="px-3 py-1 bg-red-950/20 text-red-400 text-xs font-bold rounded hover:bg-red-950/40">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========== ACTIONS ==========

    async approve(ticketId) {
        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('customer_tickets').doc(ticketId).update({
                status: 'Approved',
                approvedByAdminEmail: currentUser.email,
                approvedByAdminName: currentUser.email.split('@')[0],
                approvedAt: new Date()
            });

            notify('success', '✅ Ticket approved!');
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async reject(ticketId) {
        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            const reason = prompt('Reason for rejection:');
            if (!reason) return;

            await db.collection('customer_tickets').doc(ticketId).update({
                status: 'Rejected',
                rejectedByAdminEmail: currentUser.email,
                rejectionReason: reason,
                rejectedAt: new Date()
            });

            notify('success', '✅ Ticket rejected!');
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async delete(ticketId) {
        if (!confirm('Delete this ticket?')) return;
        
        if (!db) {
            notify('error', '❌ Database not initialized');
            return;
        }

        try {
            await db.collection('customer_tickets').doc(ticketId).delete();
            notify('success', '✅ Ticket deleted!');
            await this.loadData();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async viewReceipt(ticketId) {
        try {
            const doc = await db.collection('customer_tickets').doc(ticketId).get();
            if (doc.exists) {
                const ticket = doc.data();
                if (ticket.receiptUrl) {
                    window.open(ticket.receiptUrl, '_blank');
                } else {
                    notify('info', 'ℹ️ No receipt attached');
                }
            }
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    // ========== STATS ==========

    async getTicketStats() {
        if (!db || !currentUser) return { pending: 0, approved: 0, rejected: 0, total: 0 };

        try {
            const customersSnapshot = await db.collection('admin_customers')
                .where('adminEmail', '==', currentUser.email)
                .get();

            const adminCustomerEmails = customersSnapshot.docs.map(doc => doc.data().email);
            let stats = { pending: 0, approved: 0, rejected: 0, total: 0 };

            for (const custEmail of adminCustomerEmails) {
                const ticketSnapshot = await db.collection('customer_tickets')
                    .where('customerEmail', '==', custEmail)
                    .get();

                ticketSnapshot.forEach(doc => {
                    const ticket = doc.data();
                    stats.total++;
                    if (!ticket.status || ticket.status === 'Pending') {
                        stats.pending++;
                    } else if (ticket.status === 'Approved' || ticket.status === 'active') {
                        stats.approved++;
                    } else if (ticket.status === 'Rejected') {
                        stats.rejected++;
                    }
                });
            }

            return stats;
        } catch (error) {
            console.error('Error getting ticket stats:', error);
            return { pending: 0, approved: 0, rejected: 0, total: 0 };
        }
    }
}
