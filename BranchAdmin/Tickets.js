// ============================================
// ADMIN TICKETS MODULE
// ============================================

async function loadAdminTickets() {
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
            return;
        }

        content.innerHTML = snapshot.docs.map(doc => {
            const ticket = doc.data();
            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10 text-xs space-y-2">
                    <p class="text-white font-bold">Customer: ${ticket.customerName || 'N/A'} (${ticket.customerEmail || ''})</p>
                    <p class="text-slate-400">Numbers: ${ticket.numbers?.join(', ') || 'N/A'}</p>
                    <p class="text-slate-400">Cost: ${ticket.cost} ETB • Payment: ${ticket.paymentMethod || 'N/A'}</p>
                    <div class="flex justify-between items-center pt-2 border-t border-yellow-400/10">
                        <span class="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded">${ticket.status || 'Pending'}</span>
                        <div class="flex gap-2">
                            <button onclick="window.adminDashboard.approvePayment('${doc.id}')" class="px-3 py-1 bg-emerald-600 text-white font-bold rounded">Approve</button>
                            <button onclick="window.adminDashboard.rejectPayment('${doc.id}')" class="px-3 py-1 bg-red-600 text-white font-bold rounded">Reject</button>
                            <button onclick="window.adminDashboard.deleteTicket('${doc.id}')" class="px-3 py-1 bg-slate-800 hover:bg-rose-900 text-rose-400 border border-rose-500/20 font-bold rounded">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}
