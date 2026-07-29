// ============================================
// CUSTOMER TICKETS (CHILD COMPONENT)
// Parent: CustomerDashboard
// ============================================

class CustomerTickets {
    constructor(custId) {
        this.custId = custId || localStorage.getItem('currentCustId') || currentUser?.email || 'DEFAULT';
        this.initNotificationPoller();
    }

    initNotificationPoller() {
        if (this._pollingInterval) clearInterval(this._pollingInterval);

        this._pollingInterval = setInterval(() => {
            try {
                const storageKey = `tickets_${this.custId}`;
                let tickets = JSON.parse(localStorage.getItem(storageKey) || '[]');
                let updated = false;

                tickets.forEach(t => {
                    if ((t.status === 'Approved' || t.status === 'active') && !t.notifiedApproved) {
                        t.notifiedApproved = true;
                        updated = true;
                    } else if (t.status === 'Rejected' && !t.notifiedRejected) {
                        t.notifiedRejected = true;
                        updated = true;
                    }
                });

                if (updated) {
                    localStorage.setItem(storageKey, JSON.stringify(tickets));
                    this.refreshUI();
                }
            } catch (e) {
                console.error('Polling error:', e);
            }
        }, 2000);
    }

    refreshUI() {
        const container = document.getElementById('customer-tickets-container');
        if (container) {
            container.innerHTML = this.renderTicketsContent();
        }
    }

    renderTicketsContent() {
        const tickets = JSON.parse(localStorage.getItem(`tickets_${this.custId}`) || '[]');
        
        if (tickets.length === 0) {
            return '<div class="glass-panel rounded-2xl p-8 border border-yellow-400/10 text-center text-slate-400">No tickets yet</div>';
        }

        return '<div class="space-y-3">' + tickets.map(t => {
            const isApproved = t.status === 'Approved' || t.status === 'active';
            const isRejected = t.status === 'Rejected';
            
            // Inline status change pop-up notification banner
            let statusPopupBanner = '';
            if (isApproved && !t.viewedApproved) {
                statusPopupBanner = `
                    <div class="mb-3 p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-pulse">
                        <span>🎉 <b>Notification:</b> Your ticket ${t.id} was just approved by Admin!</span>
                        <button onclick="window.customerTicketsInstance.dismissNotification('${t.id}', 'approved')" class="text-emerald-400 font-bold ml-2 hover:text-white px-1.5 py-0.5 rounded bg-emerald-950/40">✕</button>
                    </div>
                `;
            } else if (isRejected && !t.viewedRejected) {
                statusPopupBanner = `
                    <div class="mb-3 p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center justify-between animate-pulse">
                        <span>❌ <b>Notification:</b> Your ticket ${t.id} was rejected by Admin.</span>
                        <button onclick="window.customerTicketsInstance.dismissNotification('${t.id}', 'rejected')" class="text-red-400 font-bold ml-2 hover:text-white px-1.5 py-0.5 rounded bg-red-950/40">✕</button>
                    </div>
                `;
            }

            const statusColor = isApproved ? 'text-emerald-400' : (isRejected ? 'text-red-400' : 'text-yellow-400 animate-pulse');
            const statusText = isApproved ? '✅ Approved by Admin' : (isRejected ? '❌ Rejected' : '⏳ Pending Admin Approval');

            return `
                <div class="glass-panel rounded-xl p-4 border border-yellow-400/10">
                    ${statusPopupBanner}
                    <div class="flex justify-between items-start">
                        <div class="space-y-1">
                            <p class="font-bold text-white text-base">${t.id || 'Ticket'}</p>
                            <p class="text-sm text-yellow-400">Numbers: ${t.numbers ? t.numbers.join(', ') : 'N/A'}</p>
                            <p class="text-xs text-slate-400">${t.date || new Date().toLocaleDateString()} • Status: <span class="${statusColor} font-semibold">${statusText}</span></p>
                        </div>
                        <div class="text-right space-y-2">
                            <p class="font-bold text-purple-400">${t.cost || 0} ETB</p>
                            <button onclick="window.customerTicketsInstance.cancelTicket('${t.id}')" 
                                class="px-3 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold rounded-lg border border-red-500/25">
                                🗑️ Cancel / Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('') + '</div>';
    }

    dismissNotification(ticketId, type) {
        const storageKey = `tickets_${this.custId}`;
        let tickets = JSON.parse(localStorage.getItem(storageKey) || '[]');
        tickets = tickets.map(t => {
            if (t.id === ticketId) {
                if (type === 'approved') t.viewedApproved = true;
                if (type === 'rejected') t.viewedRejected = true;
            }
            return t;
        });
        localStorage.setItem(storageKey, JSON.stringify(tickets));
        this.refreshUI();
    }

    cancelTicket(ticketId) {
        if (confirm('Are you sure you want to cancel and delete this ticket?')) {
            const storageKey = `tickets_${this.custId}`;
            let tickets = JSON.parse(localStorage.getItem(storageKey) || '[]');
            tickets = tickets.filter(t => t.id !== ticketId);
            localStorage.setItem(storageKey, JSON.stringify(tickets));

            if (typeof notify === 'function') {
                notify('info', '🗑️ Ticket deleted successfully');
            }
            this.refreshUI();
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
