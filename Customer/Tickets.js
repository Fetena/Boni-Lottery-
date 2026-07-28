// ============================================
// CUSTOMER TICKETS (CHILD COMPONENT)
// Parent: CustomerDashboard
// ✅ Includes ticket cancellation/deletion & real-time approval popups
// ============================================

class CustomerTickets {
    constructor(custId) {
        this.custId = custId || localStorage.getItem('currentCustId') || currentUser?.email || 'DEFAULT';
        this.initNotificationPoller();
    }

    initNotificationPoller() {
        if (this._pollingInterval) clearInterval(this._pollingInterval);

        // Poll localStorage every 2 seconds for ticket status updates from admin
        this._pollingInterval = setInterval(() => {
            try {
                const storageKey = `tickets_${this.custId}`;
                const tickets = JSON.parse(localStorage.getItem(storageKey) || '[]');
                let updated = false;

                tickets.forEach(t => {
                    // Check if status changed to approved/rejected and hasn't been notified yet
                    if ((t.status === 'Approved' || t.status === 'active') && !t.notifiedApproved) {
                        t.notifiedApproved = true;
                        updated = true;
                        if (typeof notify === 'function') {
                            notify('success', `🎉 Your ${t.id} has been approved by Admin!`);
                        }
                    } else if (t.status === 'Rejected' && !t.notifiedRejected) {
                        t.notifiedRejected = true;
                        updated = true;
                        if (typeof notify === 'function') {
                            notify('error', `❌ Your ${t.id} was rejected by Admin.`);
                        }
                    }
                });

                if (updated) {
                    localStorage.setItem(storageKey, JSON.stringify(tickets));
                    this.refreshUI();
                }
            } catch (e) {
                console.error('Ticket notification polling error:', e);
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
            const statusColor = isApproved ? 'text-emerald-400' : (t.status === 'Rejected' ? 'text-red-400' : 'text-yellow-400 animate-pulse');
            const statusText = isApproved ? '✅ Approved by Admin' : (t.status === 'Rejected' ? '❌ Rejected' : '⏳ Pending Admin Approval');

            return `
                <div class="glass-panel rounded-xl p-4 border border-yellow-400/10 space-y-2">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-white text-base">${t.id}</p>
                            <p class="text-sm text-yellow-400 mt-1">Numbers: ${t.numbers ? t.numbers.join(', ') : 'N/A'}</p>
                            <p class="text-xs text-slate-400 mt-1">${t.date || new Date().toLocaleDateString()} • Status: <span class="${statusColor} font-semibold">${statusText}</span></p>
                        </div>
                        <div class="text-right space-y-2">
                            <p class="font-bold text-purple-400">${t.cost || 0} ETB</p>
                            <button onclick="customerTicketsInstance.cancelTicket('${t.id}')" 
                                class="px-3 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20">
                                🗑️ Cancel / Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('') + '</div>';
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

// Global instance handle for action calls
let customerTicketsInstance;
document.addEventListener('DOMContentLoaded', () => {
    const custId = localStorage.getItem('currentCustId') || currentUser?.email || 'DEFAULT';
    customerTicketsInstance = new CustomerTickets(custId);
});
