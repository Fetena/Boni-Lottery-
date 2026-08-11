// ============================================
// ADMIN TICKETS MODULE COMPONENT (EYE-FRIENDLY UI DESIGN)
// ============================================

class AdminTickets {
    constructor(adminId) {
        this.adminId = adminId;
        this.tickets = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📋 Customer Tickets & Requests</h3>
                <div id="admin-tickets-list" class="space-y-3"></div>
            </div>

            <!-- Receipt Modal Preview Container -->
            <div id="receipt-modal" class="fixed inset-0 bg-black/85 z-50 hidden flex items-center justify-center p-4">
                <div class="glass-panel rounded-2xl max-w-2xl w-full p-6 border border-yellow-400/30 space-y-4 bg-black relative shadow-2xl">
                    <div class="flex justify-between items-center border-b border-yellow-400/20 pb-3">
                        <h4 class="text-base font-bold text-yellow-400">📄 Attached Payment Document / Receipt</h4>
                        <button onclick="window.adminTickets.closeReceiptModal()" class="text-slate-400 hover:text-white text-base font-bold px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">&times;</button>
                    </div>
                    <div id="receipt-modal-content" class="flex justify-center items-center max-h-[70vh] overflow-auto py-2"></div>
                    <div class="flex justify-end pt-3 border-t border-yellow-400/20">
                        <button onclick="window.adminTickets.closeReceiptModal()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all">Close Preview</button>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        if (!db) return;

        try {
            const currentAdminEmail = (this.adminId || (typeof currentUser !== 'undefined' && currentUser?.email || '')).trim().toLowerCase();
            if (!currentAdminEmail) {
                console.error('No active admin email found.');
                return;
            }

            const snapshot = await db.collection('customer_tickets')
                .where('adminEmail', '==', currentAdminEmail)
                .get();
            
            let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (docs.length === 0) {
                const fallbackSnapshot = await db.collection('customer_tickets')
                    .where('preferredAdmin', '==', currentAdminEmail)
                    .get();
                docs = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }

            this.tickets = docs.filter(ticket => {
                const tAdmin = (ticket.adminEmail || ticket.preferredAdmin || '').trim().toLowerCase();
                return tAdmin === currentAdminEmail;
            }).sort((a, b) => {
                const timeA = a.createdAt?.toMillis?.() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                const timeB = b.createdAt?.toMillis?.() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                return timeB - timeA;
            });

            this.displayTickets();
        } catch (error) {
            console.error('Error loading tickets:', error);
        }
    }

    displayTickets() {
        const content = document.getElementById('admin-tickets-list');
        if (!content) return;

        if (this.tickets.length === 0) {
            content.innerHTML = '<div class="glass-panel rounded-2xl p-8 border border-yellow-400/10 text-center text-slate-400">No tickets from your customers yet</div>';
            this.updateTicketsTabBadge(0);
            return;
        }

        let pendingCount = 0;

        content.innerHTML = this.tickets.map(ticket => {
            const isApproved = ticket.status === 'Approved' || ticket.status === 'active';
            const isRejected = ticket.status === 'Rejected';
            const isPending = !ticket.status || ticket.status === 'Pending';
            const ticketId = ticket.id;

            if (isPending) pendingCount++;

            let notificationBadge = '';
            if (isPending) {
                notificationBadge = `
                    <div class="absolute -top-3 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-[11px] font-extrabold shadow-lg flex items-center gap-1.5 animate-bounce z-10 border border-yellow-300">
                        <span>🔔</span> New Ticket Requested!
                    </div>
                `;
            }

            const statusColor = isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                (isRejected ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 animate-pulse');
            
            const statusText = isApproved ? `Approved by ${ticket.approvedByAdminName || ticket.assignedAdmin || 'Admin'}` : (isRejected ? 'Rejected' : 'Pending Review');
            const createdAtDate = ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleString() : (ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A');

            const attachmentUrl = ticket.receiptFile || ticket.receiptUrl || ticket.attachment || ticket.fileUrl || ticket.imageUrl || null;
            let attachmentSection = attachmentUrl ? `
                <button onclick="window.adminTickets.viewReceipt('${attachmentUrl.replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all w-fit">
                    <span>📄</span> View Attached Receipt Document
                </button>
            ` : `<span class="text-[11px] text-slate-500 italic">No receipt attached</span>`;

            return `
                <div class="glass-panel rounded-xl p-5 border ${isPending ? 'border-yellow-400/50 bg-yellow-500/[0.02]' : 'border-yellow-400/10'} text-xs space-y-3 relative mt-3 shadow-lg">
                    ${notificationBadge}
                    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div class="space-y-1.5">
                            <p class="font-extrabold text-white text-base">Ticket ID: <span class="font-mono text-yellow-400">${ticketId}</span></p>
                            <p class="text-slate-300">Customer Name: <span class="text-white font-medium">${ticket.customerName || 'N/A'}</span> (${ticket.customerEmail || ''})</p>
                            <p class="text-slate-300">Selected Numbers: <span class="text-yellow-400 font-bold tracking-wide">${ticket.numbers?.join(', ') || 'N/A'}</span></p>
                            <p class="text-slate-300">Amount: <span class="text-purple-400 font-bold">${ticket.cost || 0} ETB</span></p>
                            <p class="text-slate-300">Payment Method: <span class="text-slate-200 font-medium">${ticket.paymentMethod || 'N/A'}</span></p>
                            <p class="text-slate-300">Transaction ID / Ref: <span class="text-slate-200 font-mono">${ticket.transactionId || 'N/A'}</span></p>
                            <p class="text-slate-400 pt-0.5">Date: ${createdAtDate}</p>
                            <div class="pt-1">
                                ${attachmentSection}
                            </div>
                        </div>
                        <div class="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                            <span class="px-3 py-1 rounded-md text-xs font-bold ${statusColor}">${statusText}</span>
                            <div class="flex flex-wrap gap-2 pt-1">
                                <button onclick="window.adminTickets.approvePayment('${ticketId}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all shadow-sm">Approve</button>
                                <button onclick="window.adminTickets.rejectPayment('${ticketId}')" class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-all shadow-sm">Reject</button>
                                <button onclick="window.adminTickets.deleteTicket('${ticketId}')" class="px-3 py-1.5 bg-slate-900 hover:bg-rose-900/60 text-rose-400 border border-rose-500/25 font-bold rounded-lg text-xs transition-all">🗑️ Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.updateTicketsTabBadge(pendingCount);
    }

    viewReceipt(url) {
        const modal = document.getElementById('receipt-modal');
        const container = document.getElementById('receipt-modal-content');
        if (!modal || !container) return;

        const isImage = /\.(jpeg|jpg|gif|png|webp|avif)(?=\?|#|$)/i.test(url) || url.startsWith('data:image');
        container.innerHTML = isImage ? 
            `<img src="${url}" alt="Payment Receipt" class="max-w-full max-h-[65vh] rounded-xl border border-yellow-400/20 object-contain shadow-lg">` :
            `<div class="text-center space-y-3 py-6"><p class="text-sm text-slate-300">Document ready for review.</p><a href="${url}" target="_blank" class="px-4 py-2.5 bg-yellow-400 text-black font-bold rounded-xl inline-block text-xs">🔗 Open Document in New Tab</a></div>`;

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
                approvedByAdminName: currentUser?.email || this.adminId,
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
            await db.collection('customer_tickets').doc(docId).update({
                status: 'Rejected',
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
}

if (!window.adminTickets && typeof currentUser !== 'undefined') {
    window.adminTickets = new AdminTickets(currentUser?.email);
}
