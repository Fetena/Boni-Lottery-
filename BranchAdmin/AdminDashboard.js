// ============================================
// ADMIN TICKETS - FIXED (ONLY ADMIN'S CUSTOMERS)
// ============================================

async function loadAdminTickets() {
    if (!db || !currentUser) return;

    try {
        // STEP 1: Get THIS admin's customers
        const customersSnapshot = await db.collection('admin_customers')
            .where('adminEmail', '==', currentUser.email)
            .get();

        const adminCustomerEmails = customersSnapshot.docs.map(doc => doc.data().email);

        // STEP 2: Get tickets ONLY from this admin's customers
        let allTickets = [];
        
        if (adminCustomerEmails.length > 0) {
            // Query tickets for each customer email
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

            // Sort all tickets by date
            allTickets.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }

        // STEP 3: Render tickets
        const container = document.getElementById('admin-tickets-list');
        if (!container) return;

        if (allTickets.length === 0) {
            container.innerHTML = `
                <div class="glass-panel rounded-lg p-6 border border-yellow-400/10 text-center text-slate-400">
                    <p>No tickets from your customers yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = allTickets.map(ticket => {
            const isApproved = ticket.status === 'Approved' || ticket.status === 'active';
            const isPending = !ticket.status || ticket.status === 'Pending';
            const isRejected = ticket.status === 'Rejected';

            return `
                <div class="glass-panel rounded-lg p-4 border ${isPending ? 'border-yellow-400/50 bg-yellow-500/[0.02]' : 'border-yellow-400/10'} space-y-3">
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

                    <!-- Receipt & Buttons -->
                    <div class="flex gap-2 pt-2">
                        <button onclick="viewTicketReceipt('${ticket.id}')" class="px-3 py-1 bg-blue-400/20 text-blue-400 text-xs font-bold rounded hover:bg-blue-400/30">
                            📋 View Receipt
                        </button>
                        ${isPending ? `
                            <button onclick="approveTicket('${ticket.id}')" class="px-3 py-1 bg-emerald-400/20 text-emerald-400 text-xs font-bold rounded hover:bg-emerald-400/30">
                                ✅ Approve
                            </button>
                            <button onclick="rejectTicket('${ticket.id}')" class="px-3 py-1 bg-red-400/20 text-red-400 text-xs font-bold rounded hover:bg-red-400/30">
                                ❌ Reject
                            </button>
                        ` : ''}
                        <button onclick="deleteTicket('${ticket.id}')" class="px-3 py-1 bg-red-950/20 text-red-400 text-xs font-bold rounded hover:bg-red-950/40">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading admin tickets:', error);
        notify('error', `❌ Error loading tickets: ${error.message}`);
    }
}

async function approveTicket(ticketId) {
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
        await loadAdminTickets();
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

async function rejectTicket(ticketId) {
    if (!db) {
        notify('error', '❌ Database not initialized');
        return;
    }

    try {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        await db.collection('customer_tickets').doc(ticketId).update({
            status: 'Rejected',
            rejectedByAdminEmail: currentUser.email,
            rejectionReason: reason,
            rejectedAt: new Date()
        });

        notify('success', '✅ Ticket rejected!');
        await loadAdminTickets();
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

async function deleteTicket(ticketId) {
    if (!confirm('Delete this ticket?')) return;
    
    if (!db) {
        notify('error', '❌ Database not initialized');
        return;
    }

    try {
        await db.collection('customer_tickets').doc(ticketId).delete();
        notify('success', '✅ Ticket deleted!');
        await loadAdminTickets();
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

async function viewTicketReceipt(ticketId) {
    try {
        const doc = await db.collection('customer_tickets').doc(ticketId).get();
        if (doc.exists) {
            const ticket = doc.data();
            if (ticket.receiptUrl) {
                window.open(ticket.receiptUrl, '_blank');
            } else {
                notify('info', 'ℹ️ No receipt attached');
            }
        }
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

// ============================================
// ADMIN CUSTOMERS - FIXED (ONLY THIS ADMIN'S)
// ============================================

async function loadAdminCustomers() {
    if (!db || !currentUser) return;

    try {
        const snapshot = await db.collection('admin_customers')
            .where('adminEmail', '==', currentUser.email)
            .get();

        const container = document.getElementById('admin-customers-list');
        if (!container) return;

        if (snapshot.empty) {
            container.innerHTML = '<p class="text-slate-400">No customers yet</p>';
            return;
        }

        container.innerHTML = snapshot.docs.map(doc => {
            const cust = doc.data();
            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                    <p class="font-bold text-white">${cust.name}</p>
                    <p class="text-xs text-slate-400">${cust.email} • ${cust.phone}</p>
                    <p class="text-xs text-slate-400">Tickets: ${cust.tickets || 0} • Spent: ${cust.spent || 0} ETB</p>
                    <button onclick="deleteAdminCustomer('${doc.id}')" class="text-xs px-2 py-1 bg-red-400/20 text-red-400 rounded mt-2 hover:bg-red-400/30">
                        Delete
                    </button>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

async function deleteAdminCustomer(docId) {
    if (!confirm('Delete customer?')) return;

    try {
        await db.collection('admin_customers').doc(docId).delete();
        notify('success', '✅ Customer deleted');
        await loadAdminCustomers();
    } catch (error) {
        notify('error', `❌ Error: ${error.message}`);
    }
}

// ============================================
// ADMIN DASHBOARD - FIXED STATS
// ============================================

async function loadAdminStats() {
    if (!db || !currentUser) return;

    try {
        // Get count of THIS admin's customers
        const custSnapshot = await db.collection('admin_customers')
            .where('adminEmail', '==', currentUser.email)
            .get();

        const totalCustomers = custSnapshot.size;

        // Get count of tickets from this admin's customers
        let totalTickets = 0;
        let totalRevenue = 0;

        for (const custDoc of custSnapshot.docs) {
            const custEmail = custDoc.data().email;
            const ticketSnapshot = await db.collection('customer_tickets')
                .where('customerEmail', '==', custEmail)
                .get();

            totalTickets += ticketSnapshot.size;
            ticketSnapshot.forEach(doc => {
                totalRevenue += doc.data().cost || 0;
            });
        }

        // Update UI
        const custCountEl = document.getElementById('admin-total-customers');
        const ticketCountEl = document.getElementById('admin-total-tickets');
        const revenueEl = document.getElementById('admin-total-revenue');

        if (custCountEl) custCountEl.textContent = totalCustomers;
        if (ticketCountEl) ticketCountEl.textContent = totalTickets;
        if (revenueEl) revenueEl.textContent = totalRevenue.toLocaleString() + ' ETB';

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}
