// ============================================
// ADMIN TICKETS MODULE COMPONENT
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
                        <button onclick="window.adminTickets.closeReceiptModal()" class="text-slate-400 hover:text-white text-lg font-bold">&times;</button>
                    </div>
                    <div id="receipt-modal-content" class="flex justify-center items-center max-h-[70vh] overflow-auto py-2"></div>
                    <div class="flex justify-end pt-3 border-t border-yellow-400/20">
                        <button onclick="window.adminTickets.closeReceiptModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold">Close Preview</button>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        if (!db) return;

        try {
            const currentAdminEmail = this.adminId || (typeof currentUser !== 'undefined' && currentUser?.email);
            const currentAdminName = typeof currentUser !== 'undefined' && currentUser?.name;
            
            if (!currentAdminEmail) {
                console.error('Admin email/ID not found for ticket query.');
                return;
            }

            // Fetch tickets specifically matching this admin's email or name directly from Firestore
            const snapshot = await db.collection('customer_tickets')
                .where('adminEmail', '==', currentAdminEmail)
                .get();
            
            let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // If the email query returns nothing, try querying by assignedAdmin as a fallback
            if (docs.length === 0 && currentAdminName) {
                const nameSnapshot = await db.collection('customer_tickets')
                    .where('assignedAdmin', '==', currentAdminName)
                    .get();
                docs = nameSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }

            // Final strict security filter so admins never cross paths
            const filteredDocs = docs.filter(ticket => {
                const tEmail = (ticket.adminEmail || '').trim().toLowerCase();
                const tAdmin = (ticket.assignedAdmin || '').trim().toLowerCase();
                const aEmail = currentAdminEmail.trim().toLowerCase();
                const aName = (currentAdminName || '').trim().toLowerCase();

                return tEmail === aEmail || tAdmin === aEmail || (aName && tAdmin === aName);
            }).sort((a, b) => {
                const timeA = a.createdAt?.toMillis?.() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                const timeB = b.createdAt?.toMillis?.() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                return timeB - timeA;
            });

            this.tickets = filteredDocs;
            this.displayTickets();

        } catch (error) {
            console.error('Error loading tickets:', error);
            notify('error', `❌ Error loading tickets: ${error.message}`);
        }
    }

    displayTickets() {
        const content = document.getElementById('admin-tickets-list');
        if (!content) return;

        if (this.tickets.length === 0) {
            content.innerHTML = `
                <div class="glass-panel rounded-lg p-6 border border-yellow-400/10 text-center text-slate-400">
                    <p>No tickets from your customers yet</p>
                </div>
            `;
            this.updateTicketsTabBadge(0);
            return;
        }

        let pendingCount = 0;

        content.innerHTML = this.tickets.map(ticket => {
            const isApproved = ticket.status === 'Approved' || ticket.status === 'active';
            const isPending = !ticket.status || ticket.status === 'Pending';
            const isRejected = ticket.status === 'Rejected';
            const ticketId = ticket.id;

            if (isPending) {
                pendingCount++;
            }

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
                    <button onclick="window.adminTickets.viewReceipt('${safeUrl}')" class="px-3 py-1.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all">
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
                            <p class="font-bold text-white">Customer: ${ticket.customerName || ticket.customerEmail || 'N/A'}</p>
                            <p class="text-xs text-slate-400">Email: ${ticket.customerEmail || ''}</p>
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
                            <button onclick="window.adminTickets.approvePayment('${ticketId}')" class="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-500">
                                ✅ Approve
                            </button>
                            <button onclick="window.adminTickets.rejectPayment('${ticketId}')" class="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-500">
                                ❌ Reject
                            </button>
                        ` : ''}
                        <button onclick="window.adminTickets.deleteTicket('${ticketId}')" class="px-3 py-1 bg-slate-800 hover:bg-rose-900 text-rose-400 border border-rose-500/20 text-xs font-bold rounded">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.updateTicketsTabBadge(pendingCount);
    }

    viewReceipt(url) {
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
    }

    closeReceiptModal() {
        const modal = document.getElementById('receipt-modal');
        if (modal) modal.classList.add('hidden');
    }

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
                approvedByAdminEmail: currentUser?.email || this.adminId,
                approvedByAdminName: currentUser?.email ? currentUser.email.split('@')[0] : this.adminId,
                approvedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            notify('success', '✅ Payment approved successfully!');
            await this.init();
            if (typeof loadAdminStats === 'function') await loadAdminStats();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async rejectPayment(docId) {
        if (!db) return notify('error', '❌ Database not initialized');
        try {
            const reason = prompt('Reason for rejection:');
            if (reason === null) return;

            await db.collection('customer_tickets').doc(docId).update({
                status: 'Rejected',
                rejectedByAdminEmail: currentUser?.email || this.adminId,
                rejectionReason: reason || 'Not specified',
                rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            notify('error', '❌ Payment rejected');
            await this.init();
            if (typeof loadAdminStats === 'function') await loadAdminStats();
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
            if (typeof loadAdminStats === 'function') await loadAdminStats();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    async getTicketStats() {
        if (!this.tickets || this.tickets.length === 0) {
            return { pending: 0, approved: 0, rejected: 0, total: 0 };
        }

        let stats = { pending: 0, approved: 0, rejected: 0, total: this.tickets.length };
        this.tickets.forEach(ticket => {
            if (!ticket.status || ticket.status === 'Pending') {
                stats.pending++;
            } else if (ticket.status === 'Approved' || ticket.status === 'active') {
                stats.approved++;
            } else if (ticket.status === 'Rejected') {
                stats.rejected++;
            }
        });
        return stats;
    }
}
