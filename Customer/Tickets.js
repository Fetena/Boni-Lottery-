// ============================================
// CUSTOMER TICKETS (CHILD COMPONENT)
// Parent: CustomerDashboard
// ============================================

class CustomerTickets {
    constructor(custId) {
        this.custId = custId;
    }

    render() {
        const customer = db.getCustomer(this.custId);
        const tickets = customer.tickets || [];
        
        let html = '<div class="space-y-4"><h3 class="text-2xl font-bold text-white">My Tickets</h3>';
        
        if (tickets.length === 0) {
            html += '<div class="glass-panel rounded-2xl p-8 border border-yellow-400/10 text-center text-slate-400">No tickets yet</div>';
        } else {
            html += '<div class="space-y-2">';
            tickets.forEach(t => {
                html += `
                    <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="font-bold text-white">${t.id}</p>
                                <p class="text-sm text-yellow-400 mt-1">Numbers: ${t.numbers.join(', ')}</p>
                                <p class="text-xs text-slate-400 mt-1">${t.date} • Status: <span class="text-emerald-400">${t.status}</span></p>
                            </div>
                            <p class="font-bold text-purple-400">${t.cost} ETB</p>
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
