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

            <!-- Receipt Modal Preview Container -->
            <div id="receipt-modal" class="fixed inset-0 bg-black/85 z-50 hidden flex items-center justify-center p-4">
                <div class="glass-panel rounded-2xl max-w-2xl w-full p-6 border border-yellow-400/30 space-y-4 bg-black relative">
                    <div class="flex justify-between items-center border-b border-yellow-400/20 pb-3">
                        <h4 class="text-base font-bold text-yellow-400">📄 Attached Payment Document / Receipt</h4>
                        <button onclick="window.adminTicketsComponent.closeReceiptModal()" class="text-slate-400 hover:text-white text-lg font-bold">&times;</button>
                    </div>
                    <div id="receipt-modal-content" class="flex justify-center items-center max-h-[70vh] overflow-auto py-2"></div>
                    <div class="flex justify-end pt-3 border-t border-yellow-400/20">
                        <button onclick="window.adminTicketsComponent.closeReceiptModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold">Close Preview</button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        if (!db || !currentUser) return;

        try {
            // STEP 1: Get THIS admin's customers only[cite: 23]
            const customersSnapshot = await db.collection('admin_customers')
                .where('adminEmail', '==', currentUser.email)
                .get();

            const adminCustomerEmails = customersSnapshot.docs.map(doc => doc.data().email);

            // STEP 2: Get tickets ONLY from this admin's customers[cite: 23]
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

                // Sort all tickets by date[cite: 23]
                allTickets.sort((a, b) => {
                    const timeA = a.createdAt?.toMillis?.() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                    const timeB = b.createdAt?.toMillis?.() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                    return timeB - timeA;
                });
            }

            this.tickets = allTickets;
            this.displayTickets();
        } catch (error) {
            console.error('Error loading admin tickets:', error);
            notify('error', `❌ Error loading tickets: ${error.message}`);
        }
    }

    displayTickets() {
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

            let notificationBadge = '';
            if (isPending) {
                notificationBadge = `
                    <div class="absolute -top-3 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-[11px] font-extrabold shadow-lg flex items-center gap-1.5 animate-bounce z-10 border border-yellow-300">
                        <span>🔔</span> New Ticket Requested!
                    </div>
                `;
            }

            const attachmentUrl = ticket.receiptFile || ticket.receiptUrl || ticket.attachment || ticket.fileUrl || ticket.imageUrl || null;
            let attachmentButton = '';
            if (attachmentUrl) {
                const safeUrl = attachmentUrl.replace(/'/g, "\\'");
                attachmentButton = `
                    <button onclick="window.adminTicketsComponent.viewReceipt('${ticket.id}', '${safeUrl}')" class="px-3 py-1.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all">
                        <span>📄</span> View Attached Receipt
                    </button>
                `;
            } else {
                attachmentButton = `<span class="text-[11px] text-slate-500 italic">No receipt attached</span>`;
            }

            return `
                <div class="glass-panel rounded-lg p-4 border ${isPending ? 'border-yellow-400/50 bg-yellow-500/[0.02]' : 'border-yellow-400/10'} space-y-3 relative mt-3">
                    ${notificationBadge}
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

                    <!-- Receipt Button -->
                    <div class="py-1 flex items-center justify-between">
                        ${attachmentButton}
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2 pt-2 flex-wrap border-t border-yellow-400/10">
                        ${isPending ? `
                            <button onclick="window.adminTicketsComponent.approve('${ticket.id}')" class="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-500">
                                ✅ Approve
                            </button>
                            <button onclick="window.adminTicketsComponent.reject('${ticket.id}')" class="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-500">
                                ❌ Reject
                            </button>
                        ` : ''}
                        <button onclick="window.adminTicketsComponent.delete('${ticket.id}')" class="px-3 py-1 bg-slate-800 hover:bg-rose-900 text-rose-400 border border-rose-500/20 text-xs font-bold rounded">
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
            if (window.adminDashboard) await window.adminDashboard.updateStats();
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
            if (reason === null) return;

            await db.collection('customer_tickets').doc(ticketId).update({
                status: 'Rejected',
                rejectedByAdminEmail: currentUser.email,
                rejectionReason: reason || 'Not specified',
                rejectedAt: new Date()
            });

            notify('error', '❌ Ticket rejected!');
            await this.loadData();
            if (window.adminDashboard) await window.adminDashboard.updateStats();
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
            if (window.adminDashboard) await window.adminDashboard.updateStats();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async viewReceipt(ticketId, fallbackUrl = null) {
        try {
            let url = fallbackUrl;
            if (!url) {
                const doc = await db.collection('customer_tickets').doc(ticketId).get();
                if (doc.exists) {
                    const ticket = doc.data();
                    url = ticket.receiptFile || ticket.receiptUrl || ticket.attachment || ticket.fileUrl || ticket.imageUrl || null;
                }
            }

            if (!url) {
                notify('info', 'ℹ️ No receipt attached');
                return;
            }

            const modal = document.getElementById('receipt-modal');
            const container = document.getElementById('receipt-modal-content');
            if (!modal || !container) {
                window.open(url, '_blank');
                return;
            }

            const isImage = /\.(jpeg|jpg|gif|png|webp|avif)(?=\?|#|$)/i.test(url) || url.startsWith('data:image');

            if (isImage) {
                container.innerHTML = `<img src="${url}" alt="Payment Receipt" class="max-w-full max-h-[65vh] rounded-xl border border-yellow-400/20 object-contain shadow-lg">`;
            } else {
                container.innerHTML = `
                    <div class="text-center space-y-3 py-6">
                        <p class="text-sm text-slate-300">Document ready for review.</p>
                        <a href="${url}" target="_blank" class="px-4 py-2.5 bg-yellow-400 text-black font-bold rounded-xl inline-block text-xs">🔗 Open Document in New Tab</a>
                    </div>
                `;
            }

            modal.classList.remove('hidden');
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    closeReceiptModal() {
        const modal = document.getElementById('receipt-modal');
        if (modal) modal.classList.add('hidden');
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
