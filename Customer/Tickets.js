// ============================================
// CUSTOMER TICKETS MODULE COMPONENT (FIRESTORE SYNCED)
// ============================================

class CustomerTickets {
    constructor(custId) {
        this.custId = custId || localStorage.getItem('currentCustId') || currentUser?.email || 'DEFAULT';
        this.tickets = [];
    }

    async init() {
        await this.fetchTickets();
    }

    async fetchTickets() {
        if (!db || !currentUser) return;

        try {
            // Fetch tickets belonging specifically to this customer from Firestore
            const snapshot = await db.collection('customer_tickets')
                .where('customerEmail', '==', currentUser.email)
                .orderBy('createdAt', 'desc')
                .get();

            this.tickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.refreshUI();
            this.updateCustomerTabBadge();
        } catch (error) {
            console.error('Error loading customer tickets:', error);
        }
    }

    refreshUI() {
        const container = document.getElementById('customer-tickets-container');
        if (container) {
            container.innerHTML = this.renderTicketsContent();
        }
    }

    renderTicketsContent() {
        if (this.tickets.length === 0) {
            return '<div class="glass-panel rounded-2xl p-8 border border-yellow-400/10 text-center text-slate-400">No tickets yet</div>';
        }

        let pendingCount = 0;

        const html = '<div class="space-y-3">' + this.tickets.map(t => {
            const isApproved = t.status === 'Approved' || t.status === 'active';
            const isRejected = t.status === 'Rejected';
            const isPending = !t.status || t.status === 'Pending';

            if (isPending) pendingCount++;

            // Clickable Notification badge pill on top right of the ticket card
            let notificationBadge = '';
            if (isPending) {
                notificationBadge = `
                    <div class="absolute -top-3 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-[11px] font-extrabold shadow-lg flex items-center gap-1.5 animate-bounce z-10 border border-yellow-300">
                        <span>⏳</span> Pending Admin Review
                    </div>
                `;
            } else if (isApproved && !t.viewedApproved) {
                notificationBadge = `
                    <div onclick="window.customerTicketsInstance.openTicketDetails('${t.id}')" class="absolute -top-3 right-4 bg-emerald-500 text-black px-3 py-1 rounded-full text-[11px] font-extrabold shadow-lg flex items-center gap-1.5 z-10 border border-emerald-300 cursor-pointer hover:bg-emerald-400 transition-all">
                        <span>🎉</span> Approved! (Click to read) <button onclick="event.stopPropagation(); window.customerTicketsInstance.dismissNotification('${t.id}', 'approved')" class="ml-1 text-black font-bold hover:text-white">✕</button>
                    </div>
                `;
            } else if (isRejected && !t.viewedRejected) {
                notificationBadge = `
                    <div onclick="window.customerTicketsInstance.openTicketDetails('${t.id}')" class="absolute -top-3 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-[11px] font-extrabold shadow-lg flex items-center gap-1.5 z-10 border border-red-300 cursor-pointer hover:bg-red-400 transition-all">
                        <span>❌</span> Rejected (Click to read) <button onclick="event.stopPropagation(); window.customerTicketsInstance.dismissNotification('${t.id}', 'rejected')" class="ml-1 text-white font-bold hover:text-gray-300">✕</button>
                    </div>
                `;
            }

            const statusColor = isApproved ? 'text-emerald-400' : (isRejected ? 'text-red-400' : 'text-yellow-400 animate-pulse');
            const statusText = isApproved ? '✅ Approved by Admin' : (isRejected ? '❌ Rejected' : '⏳ Pending Admin Approval');

            return `
                <div class="glass-panel rounded-lg p-4 border ${isPending ? 'border-yellow-400/50 bg-yellow-500/[0.02]' : 'border-yellow-400/10'} text-xs space-y-2 relative mt-3 cursor-pointer hover:border-yellow-400/40 transition-all" onclick="window.customerTicketsInstance.openTicketDetails('${t.id}')">
                    ${notificationBadge}
                    <div class="flex justify-between items-start">
                        <div class="space-y-1">
                            <p class="font-bold text-white text-base">Ticket ID: ${t.id}</p>
                            <p class="text-sm text-yellow-400">Numbers: ${t.numbers ? t.numbers.join(', ') : 'N/A'}</p>
                            <p class="text-xs text-slate-400">Status: <span class="${statusColor} font-semibold">${statusText}</span></p>
                        </div>
                        <div class="text-right space-y-2" onclick="event.stopPropagation()">
                            <p class="font-bold text-purple-400">${t.cost || 0} ETB</p>
                            <button onclick="window.customerTicketsInstance.cancelTicket('${t.id}')" 
                                class="px-3 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold rounded-lg border border-red-500/25">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('') + '</div>';

        return html;
    }

    async openTicketDetails(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        // Automatically mark as viewed/dismiss notification upon opening and reading
        if ((ticket.status === 'Approved' || ticket.status === 'active') && !ticket.viewedApproved) {
            await this.dismissNotification(ticketId, 'approved');
        } else if (ticket.status === 'Rejected' && !ticket.viewedRejected) {
            await this.dismissNotification(ticketId, 'rejected');
        }

        // Remove any existing modal
        const existingModal = document.getElementById('ticket-details-modal');
        if (existingModal) existingModal.remove();

        const isApproved = ticket.status === 'Approved' || ticket.status === 'active';
        const isRejected = ticket.status === 'Rejected';
        const statusColor = isApproved ? 'text-emerald-400' : (isRejected ? 'text-red-400' : 'text-yellow-400');
        const statusText = isApproved ? 'Approved by Admin' : (isRejected ? 'Rejected' : 'Pending Review');

        const modalHtml = `
            <div id="ticket-details-modal" class="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
                <div class="glass-panel rounded-2xl max-w-lg w-full p-6 border border-yellow-400/30 space-y-4 bg-black text-left relative shadow-2xl">
                    <div class="flex justify-between items-center border-b border-yellow-400/20 pb-3">
                        <h3 class="text-lg font-bold text-yellow-400">📋 Ticket Details & Status</h3>
                        <button onclick="document.getElementById('ticket-details-modal').remove()" class="text-slate-400 hover:text-white font-bold text-base px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">✕</button>
                    </div>
                    
                    <div class="space-y-3 text-xs text-slate-200">
                        <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                            <p><strong class="text-slate-400">Ticket ID:</strong> <span class="text-white font-mono">${ticket.id}</span></p>
                            <p><strong class="text-slate-400">Assigned Numbers:</strong> <span class="text-yellow-400 font-bold text-sm">${ticket.numbers ? ticket.numbers.join(', ') : 'N/A'}</span></p>
                            <p><strong class="text-slate-400">Cost / Amount:</strong> <span class="text-purple-400 font-bold">${ticket.cost || 0} ETB</span></p>
                            <p><strong class="text-slate-400">Current Status:</strong> <span class="${statusColor} font-bold">${statusText}</span></p>
                            <p><strong class="text-slate-400">Created Date:</strong> <span class="text-slate-300">${ticket.createdAt ? new Date(ticket.createdAt.seconds ? ticket.createdAt.seconds * 1000 : ticket.createdAt).toLocaleString() : 'N/A'}</span></p>
                        </div>

                        ${ticket.receiptUrl ? `
                            <div class="space-y-1">
                                <p class="font-bold text-slate-300">Attached Payment Receipt:</p>
                                <div class="bg-black/60 p-2 rounded-xl border border-slate-800 text-center">
                                    <img src="${ticket.receiptUrl}" alt="Payment Receipt" class="max-h-60 mx-auto rounded-lg object-contain border border-slate-700">
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="pt-2">
                        <button onclick="document.getElementById('ticket-details-modal').remove()" class="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold rounded-xl text-xs transition-all">
                            Done / Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    async dismissNotification(ticketId, type) {
        try {
            const updateField = type === 'approved' ? { viewedApproved: true } : { viewedRejected: true };
            await db.collection('customer_tickets').doc(ticketId).update(updateField);
            
            // Local state update
            this.tickets = this.tickets.map(t => {
                if (t.id === ticketId) {
                    if (type === 'approved') t.viewedApproved = true;
                    if (type === 'rejected') t.viewedRejected = true;
                }
                return t;
            });
            this.refreshUI();
            this.updateCustomerTabBadge();
        } catch (e) {
            console.error('Error dismissing notification:', e);
        }
    }

    async cancelTicket(ticketId) {
        if (!confirm('Are you sure you want to delete this ticket?')) return;
        if (!db) return notify('error', '❌ Database not initialized');

        try {
            await db.collection('customer_tickets').doc(ticketId).delete();
            if (typeof notify === 'function') {
                notify('success', '🗑️ Ticket deleted successfully');
            }
            await this.fetchTickets();
        } catch (error) {
            notify('error', `❌ Error: ${error.message}`);
        }
    }

    updateCustomerTabBadge() {
        // Counts tickets that are either newly approved/rejected (unviewed) or pending review
        const actionNeededCount = this.tickets.filter(t => 
            (!t.status || t.status === 'Pending') || 
            ((t.status === 'Approved' || t.status === 'active') && !t.viewedApproved) ||
            (t.status === 'Rejected' && !t.viewedRejected)
        ).length;

        const badge = document.getElementById('badge-branch-customer-tickets') || document.getElementById('customer-tickets-badge');
        if (!badge) return;

        if (actionNeededCount > 0) {
            badge.innerText = actionNeededCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">My Tickets</h3>
                <div id="customer-tickets-container">
                    ${this.renderTicketsContent()}
                </div>
            </div>
        `;
    }
}

if (!window.customerTicketsInstance) {
    const custId = localStorage.getItem('currentCustId') || currentUser?.email || 'DEFAULT';
    window.customerTicketsInstance = new CustomerTickets(custId);
}
