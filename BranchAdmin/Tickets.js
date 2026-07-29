// ============================================
// ADMIN TICKETS MODULE (WITH FLOATING IN-TICKET POP-UP MODAL)
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
            const isPending = !ticket.status || ticket.status === 'Pending';
            const ticketId = doc.id;

            // Floating Pop-up Dialog Overlay directly inside the ticket card
            let floatingPopupModal = '';
            if (isPending && !ticket.dismissedPopup) {
                floatingPopupModal = `
                    <div id="popup-${ticketId}" class="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-lg z-20 flex items-center justify-center p-4 animate-fade-in">
                        <div class="glass-panel border border-yellow-400/40 rounded-xl p-4 max-w-sm w-full text-center space-y-3 shadow-2xl bg-black/95">
                            <div class="w-10 h-10 bg-yellow-400/20 text-yellow-400 rounded-full flex items-center justify-center mx-auto text-lg animate-bounce">
                                🔔
                            </div>
                            <div class="space-y-1">
                                <h4 class="font-bold text-white text-sm">New Ticket Requested!</h4>
                                <p class="text-slate-300 text-xs"><b>${ticket.customerName || 'A customer'}</b> submitted numbers: <span class="text-yellow-400">${ticket.numbers?.join(', ') || 'N/A'}</span></p>
                            </div>
                            <div class="flex gap-2 pt-2">
                                <button onclick="window.adminDashboard.approvePayment('${ticketId}')" class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs">Approve Now</button>
                                <button onclick="dismissTicketPopup('${ticketId}')" class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs">View Ticket</button>
                            </div>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10 text-xs space-y-2 relative overflow-hidden">
                    ${floatingPopupModal}
                    <p class="text-white font-bold">Customer: ${ticket.customerName || 'N/A'} (${ticket.customerEmail || ''})</p>
                    <p class="text-slate-400">Numbers: ${ticket.numbers?.join(', ') || 'N/A'}</p>
                    <p class="text-slate-400">Cost: ${ticket.cost} ETB • Payment: ${ticket.paymentMethod || 'N/A'}</p>
                    <div class="flex justify-between items-center pt-2 border-t border-yellow-400/10">
                        <span class="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded">${ticket.status || 'Pending'}</span>
                        <div class="flex gap-2">
                            <button onclick="window.adminDashboard.approvePayment('${ticketId}')" class="px-3 py-1 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-500">Approve</button>
                            <button onclick="window.adminDashboard.rejectPayment('${ticketId}')" class="px-3 py-1 bg-red-600 text-white font-bold rounded hover:bg-red-500">Reject</button>
                            <button onclick="window.adminDashboard.deleteTicket('${ticketId}')" class="px-3 py-1 bg-slate-800 hover:bg-rose-900 text-rose-400 border border-rose-500/20 font-bold rounded">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

// Helper function to dismiss/hide the pop-up modal when the admin clicks "View Ticket"
function dismissTicketPopup(ticketId) {
    const popup = document.getElementById(`popup-${ticketId}`);
    if (popup) {
        popup.style.display = 'none';
    }
}
