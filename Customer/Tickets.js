// ============================================
// CUSTOMER TICKETS (CHILD COMPONENT)
// Parent: CustomerDashboard
// ============================================

class CustomerTickets {
    constructor(custId) {
        this.custId = custId;
    }

    render() {
        const customer = db.getCustomer ? db.getCustomer(this.custId) : {};
        const tickets = customer.tickets || JSON.parse(localStorage.getItem(`tickets_${this.custId}`) || '[]');
        
        let html = '<div class="space-y-4"><h3 class="text-2xl font-bold text-white">My Tickets</h3>';
        
        if (tickets.length === 0) {
            html += '<div class="glass-panel rounded-2xl p-8 border border-yellow-400/10 text-center text-slate-400">No tickets yet</div>';
        } else {
            html += '<div class="space-y-2">';
            tickets.forEach(t => {
                const isApproved = t.status === 'Approved' || t.status === 'active';
                const statusColor = isApproved ? 'text-emerald-400' : 'text-yellow-400 animate-pulse';
                const statusText = isApproved ? '✅ Approved by Admin' : '⏳ Pending Admin Approval';

                html += `
                    <div class="glass-panel rounded-lg p-4 border border-yellow-400/10 space-y-2">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="font-bold text-white">${t.id}</p>
                                <p class="text-sm text-yellow-400 mt-1">Numbers: ${t.numbers ? t.numbers.join(', ') : ''}</p>
                                <p class="text-xs text-slate-400 mt-1">${t.date || new Date().toLocaleDateString()} • Status: <span class="${statusColor} font-semibold">${statusText}</span></p>
                            </div>
                            <p class="font-bold text-purple-400">${t.cost || 0} ETB</p>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }
}

// Call this function when a customer submits/purchases a ticket to trigger the notification pop-up
function notifyTicketSubmission() {
    if (typeof notify === 'function') {
        notify('success', '✅ Ticket submitted successfully to admin for approval!');
    }
}
