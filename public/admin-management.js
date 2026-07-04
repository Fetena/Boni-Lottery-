/**
 * FIXED ADMIN NAVIGATION
 * Main Admin sees ALL tabs - Sub Admins see only their permissions
 */

function buildAdminNavigation() {
    const navContainer = document.getElementById('admin-nav-tabs');
    navContainer.innerHTML = '';

    // Dashboard - Everyone sees this
    addNavTab('dashboard', 'Dashboard', 'fa-chart-line');

    // === MAIN ADMIN: Show ALL tabs ===
    if (currentAdminUser.permissionLevel === 'main_admin') {
        addNavTab('payment', 'Payments', 'fa-credit-card');
        addNavTab('ticket', 'Tickets', 'fa-ticket');
        addNavTab('customer', 'Customers', 'fa-people-group');
        addNavTab('audit', 'Audit Log', 'fa-history');
        addNavTab('draw', 'Draw Operator', 'fa-dice');
        addNavTab('manage-admins', 'Manage Admins', 'fa-users-cog');
        
        console.log('✅ MAIN ADMIN: All tabs visible');
    } 
    // === SUB ADMIN: Show only granted permissions ===
    else {
        const perms = currentAdminUser.permissions || [];
        
        if (perms.includes('payment')) {
            addNavTab('payment', 'Payments', 'fa-credit-card');
        }
        if (perms.includes('ticket')) {
            addNavTab('ticket', 'Tickets', 'fa-ticket');
        }
        if (perms.includes('customer')) {
            addNavTab('customer', 'Customers', 'fa-people-group');
        }
        if (perms.includes('audit')) {
            addNavTab('audit', 'Audit Log', 'fa-history');
        }
        if (perms.includes('draw')) {
            addNavTab('draw', 'Draw Operator', 'fa-dice');
        }
        
        console.log('✅ SUB ADMIN: Permissions =', perms);
    }
}

function addNavTab(id, label, icon) {
    const navContainer = document.getElementById('admin-nav-tabs');
    const btn = document.createElement('button');
    btn.id = `tab-${id}`;
    btn.className = "px-4 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white whitespace-nowrap transition-all";
    btn.innerHTML = `<i class="fa-solid fa-${icon} mr-1.5"></i>${label}`;
    btn.onclick = () => switchAdminTab(id);
    navContainer.appendChild(btn);
}

function switchAdminTab(tabName) {
    // Hide all views
    const views = ['dashboard', 'payment', 'ticket', 'customer', 'audit', 'draw', 'manage-admins'];
    views.forEach(v => {
        const view = document.getElementById(`admin-view-${v}`);
        if (view) view.classList.add('hidden');
        const tab = document.getElementById(`tab-${v}`);
        if (tab) tab.className = "px-4 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-white whitespace-nowrap transition-all";
    });

    // Show selected view
    const selectedView = document.getElementById(`admin-view-${tabName}`);
    if (selectedView) selectedView.classList.remove('hidden');
    
    const selectedTab = document.getElementById(`tab-${tabName}`);
    if (selectedTab) selectedTab.className = "px-4 py-2 text-xs font-bold rounded-lg bg-brand-gold text-brand-navy whitespace-nowrap";

    // Load data for specific tabs
    if (tabName === 'payment') {
        loadPayments();
    } else if (tabName === 'ticket') {
        loadTickets();
    } else if (tabName === 'customer') {
        loadCustomers();
    } else if (tabName === 'audit') {
        loadActivityLogs();
    } else if (tabName === 'manage-admins') {
        loadAdminsList();
    }
}

// ==================== PAYMENT VERIFICATION TAB ====================

async function loadPayments() {
    try {
        const { getDocs, collection, query, where } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        const q = query(collection(window.db, "payments"), where("status", "==", "pending"));
        const snapshot = await getDocs(q);
        const tbody = document.getElementById('payments-table');
        tbody.innerHTML = '';

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400">No pending payments</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const payment = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-4 font-mono text-xs text-brand-gold">${payment.ticketId}</td>
                <td class="p-4 font-semibold">${payment.customerName}</td>
                <td class="p-4 text-brand-gold font-bold">${payment.amount} ETB</td>
                <td class="p-4 text-xs">${payment.paymentMethod}</td>
                <td class="p-4"><span class="px-2 py-1 rounded text-xs bg-yellow-600/20 text-yellow-400">⏳ Pending</span></td>
                <td class="p-4 space-x-2">
                    <button onclick="verifyPaymentAdmin('${doc.id}', '${payment.ticketId}')" class="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 rounded text-white">Verify</button>
                    <button onclick="rejectPaymentAdmin('${doc.id}', '${payment.ticketId}')" class="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded text-white">Reject</button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading payments:", error);
    }
}

async function verifyPaymentAdmin(docId, ticketId) {
    try {
        const { updateDoc, doc, serverTimestamp } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        // Update payment
        await updateDoc(doc(window.db, "payments", docId), {
            status: "verified",
            verifiedBy: currentAdminUser.name,
            verifiedAt: serverTimestamp()
        });

        // Update ticket
        const { getDocs, collection, query, where } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        const ticketsQuery = query(collection(window.db, "tickets"), where("ticketId", "==", ticketId));
        const snapshot = await getDocs(ticketsQuery);

        if (!snapshot.empty) {
            await updateDoc(doc(window.db, "tickets", snapshot.docs[0].id), {
                status: "Active",
                verified: true,
                verifiedBy: currentAdminUser.name,
                verifiedAt: serverTimestamp()
            });
        }

        showNotificationToast('✅ Payment verified!');
        loadPayments();
        loadDashboardData();

    } catch (error) {
        showNotificationToast(error.message, 'error');
    }
}

async function rejectPaymentAdmin(docId, ticketId) {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
        const { updateDoc, doc, serverTimestamp } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        await updateDoc(doc(window.db, "payments", docId), {
            status: "rejected",
            rejectionReason: reason,
            rejectedBy: currentAdminUser.name,
            rejectedAt: serverTimestamp()
        });

        showNotificationToast('❌ Payment rejected');
        loadPayments();

    } catch (error) {
        showNotificationToast(error.message, 'error');
    }
}

// ==================== TICKET MANAGEMENT TAB ====================

async function loadTickets() {
    try {
        const { getDocs, collection } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        const snapshot = await getDocs(collection(window.db, "tickets"));
        const tbody = document.getElementById('tickets-table');
        tbody.innerHTML = '';

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400">No tickets yet</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const ticket = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-4 font-mono text-xs text-brand-gold">${ticket.ticketId}</td>
                <td class="p-4 font-semibold">${ticket.customerName}</td>
                <td class="p-4 text-xs">${ticket.numbers.length} numbers</td>
                <td class="p-4 text-brand-gold font-bold">${ticket.totalCost} ETB</td>
                <td class="p-4"><span class="px-2 py-1 rounded text-xs ${
                    ticket.status === 'Active' 
                        ? 'bg-emerald-600/20 text-emerald-400' 
                        : ticket.status === 'Won'
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'bg-slate-600/20 text-slate-400'
                }">${ticket.status}</span></td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading tickets:", error);
    }
}

// ==================== CUSTOMER MANAGEMENT TAB ====================

async function loadCustomers() {
    try {
        const { getDocs, collection } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        const ticketsSnapshot = await getDocs(collection(window.db, "tickets"));
        
        // Group by customer
        const customers = {};
        ticketsSnapshot.forEach(doc => {
            const ticket = doc.data();
            const phone = ticket.customerPhone;
            if (!customers[phone]) {
                customers[phone] = {
                    name: ticket.customerName,
                    phone: ticket.customerPhone,
                    email: ticket.customerEmail,
                    ticketCount: 0,
                    totalSpent: 0
                };
            }
            customers[phone].ticketCount++;
            customers[phone].totalSpent += ticket.totalCost;
        });

        const tbody = document.getElementById('customers-table');
        tbody.innerHTML = '';

        if (Object.keys(customers).length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400">No customers yet</td></tr>';
            return;
        }

        Object.values(customers).forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-4 font-semibold">${customer.name}</td>
                <td class="p-4 text-xs font-mono">${customer.phone}</td>
                <td class="p-4 text-center font-bold text-blue-400">${customer.ticketCount}</td>
                <td class="p-4 text-right font-bold text-brand-gold">${customer.totalSpent} ETB</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading customers:", error);
    }
}

// ==================== AUDIT LOG TAB ====================

async function loadActivityLogs() {
    try {
        const { getDocs, collection, query, orderBy, limit } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        const q = query(
            collection(window.db, "activity_logs"),
            orderBy("timestamp", "desc"),
            limit(50)
        );
        const snapshot = await getDocs(q);
        const tbody = document.getElementById('audit-table');
        tbody.innerHTML = '';

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400">No activity yet</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const activity = doc.data();
            const row = document.createElement('tr');
            const timestamp = activity.timestamp ? new Date(activity.timestamp.toDate()).toLocaleString() : 'N/A';
            row.innerHTML = `
                <td class="p-4 font-semibold">${activity.adminName || 'System'}</td>
                <td class="p-4 text-brand-gold font-bold text-sm">${activity.action}</td>
                <td class="p-4 text-xs text-slate-300">${activity.details}</td>
                <td class="p-4 text-xs text-slate-500">${timestamp}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading activity logs:", error);
    }
}

// ==================== MANAGE ADMINS TAB (Main Admin Only) ====================

async function loadAdminsList() {
    try {
        const { getDocs, collection } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        const snapshot = await getDocs(collection(window.db, "admins"));
        const tbody = document.getElementById('admins-table');
        tbody.innerHTML = '';

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400">No admins found</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const admin = doc.data();
            const perms = (admin.permissions || [])
                .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                .join(', ');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-4 font-semibold">${admin.name}</td>
                <td class="p-4 text-xs">${admin.email}</td>
                <td class="p-4 text-xs">${
                    admin.permissionLevel === 'main_admin' 
                        ? '🔴 ALL ACCESS (Main Admin)' 
                        : perms || 'No permissions'
                }</td>
                <td class="p-4">${admin.isActive ? '<span class="text-emerald-400">✓ Active</span>' : '<span class="text-red-400">✗ Inactive</span>'}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading admins:", error);
    }
}

function showCreateAdminForm() {
    document.getElementById('create-admin-form').classList.remove('hidden');
}

function hideCreateAdminForm() {
    document.getElementById('create-admin-form').classList.add('hidden');
}

async function createNewAdmin() {
    const name = document.getElementById('new-admin-name').value;
    const email = document.getElementById('new-admin-email').value;
    const password = document.getElementById('new-admin-password').value;

    if (!name || !email || !password) {
        showNotificationToast("Fill all fields", "error");
        return;
    }

    const permissions = [];
    if (document.getElementById('perm-payment').checked) permissions.push('payment');
    if (document.getElementById('perm-ticket').checked) permissions.push('ticket');
    if (document.getElementById('perm-customer').checked) permissions.push('customer');
    if (document.getElementById('perm-audit').checked) permissions.push('audit');
    if (document.getElementById('perm-draw').checked) permissions.push('draw');

    try {
        const { addDoc, collection, serverTimestamp } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        await addDoc(collection(window.db, "admins"), {
            name: name,
            email: email,
            password: password,
            permissionLevel: 'sub_admin',
            permissions: permissions,
            isActive: true,
            createdAt: serverTimestamp(),
            createdBy: currentAdminUser.name
        });

        showNotificationToast(`✅ Admin "${name}" created!`);
        hideCreateAdminForm();
        loadAdminsList();
        
        // Clear form
        document.getElementById('new-admin-name').value = '';
        document.getElementById('new-admin-email').value = '';
        document.getElementById('new-admin-password').value = '';
        document.querySelectorAll('input[id^="perm-"]').forEach(el => el.checked = false);

    } catch (error) {
        showNotificationToast(error.message, "error");
    }
}

// ==================== DASHBOARD ====================

async function loadDashboardData() {
    try {
        const { getDocs, collection, query, where } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        // Active Tickets
        const activeTicketsQuery = query(collection(window.db, "tickets"), where("status", "==", "Active"));
        const activeTicketsSnapshot = await getDocs(activeTicketsQuery);
        document.getElementById('stat-active-tickets').textContent = activeTicketsSnapshot.size;

        // Pending Payments
        const pendingPaymentsQuery = query(collection(window.db, "payments"), where("status", "==", "pending"));
        const pendingPaymentsSnapshot = await getDocs(pendingPaymentsQuery);
        document.getElementById('stat-pending-payments').textContent = pendingPaymentsSnapshot.size;

        // Total Customers
        const allTickets = await getDocs(collection(window.db, "tickets"));
        const uniqueCustomers = new Set();
        allTickets.forEach(doc => uniqueCustomers.add(doc.data().customerPhone));
        document.getElementById('stat-total-customers').textContent = uniqueCustomers.size;

        // Total Revenue
        let totalRevenue = 0;
        allTickets.forEach(doc => totalRevenue += doc.data().totalCost || 0);
        document.getElementById('stat-total-revenue').textContent = totalRevenue.toLocaleString() + ' ETB';

        // Total Admins
        const adminsSnapshot = await getDocs(collection(window.db, "admins"));
        document.getElementById('stat-total-admins').textContent = adminsSnapshot.size;

        // Activity Feed
        const { query: fbQuery, orderBy, limit } = await import(
            "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        );

        const activityQuery = fbQuery(
            collection(window.db, "activity_logs"),
            orderBy("timestamp", "desc"),
            limit(20)
        );
        const activitySnapshot = await getDocs(activityQuery);
        const feedContainer = document.getElementById('activity-feed');
        feedContainer.innerHTML = '';

        if (activitySnapshot.empty) {
            feedContainer.innerHTML = '<div class="p-4 text-center text-slate-400">No activity yet</div>';
        } else {
            activitySnapshot.forEach(doc => {
                const activity = doc.data();
                const time = activity.timestamp ? new Date(activity.timestamp.toDate()).toLocaleTimeString() : 'N/A';
                const div = document.createElement('div');
                div.className = "p-4 hover:bg-brand-navy/20 transition-colors";
                div.innerHTML = `
                    <div class="flex items-start justify-between">
                        <div>
                            <p class="text-sm font-semibold text-brand-gold">${activity.action}</p>
                            <p class="text-xs text-slate-400 mt-1">${activity.details}</p>
                        </div>
                        <span class="text-xs text-slate-500 flex-shrink-0">${time}</span>
                    </div>
                `;
                feedContainer.appendChild(div);
            });
        }

    } catch (error) {
        console.error("Error loading dashboard:", error);
    }
}

// ==================== UTILITIES ====================

function showNotificationToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `flex items-center space-x-3 p-4 rounded-xl shadow-lg border text-xs font-semibold tracking-wide transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto ${
        type === 'success' 
            ? 'bg-brand-navy border-brand-gold/30 text-brand-goldlight' 
            : 'bg-red-950/90 border-red-900/30 text-red-300'
    }`;
    
    toast.innerHTML = `
        <i class="${type === 'success' ? 'fa-solid fa-circle-check text-brand-gold' : 'fa-solid fa-circle-xmark text-red-400'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Start real-time updates
function startRealtimeUpdates() {
    setInterval(loadDashboardData, 5000); // Refresh every 5 seconds
}

export {
    buildAdminNavigation,
    switchAdminTab,
    loadDashboardData,
    loadPayments,
    loadTickets,
    loadCustomers,
    loadActivityLogs,
    loadAdminsList,
    createNewAdmin,
    verifyPaymentAdmin,
    rejectPaymentAdmin
};

window.buildAdminNavigation = buildAdminNavigation;
window.switchAdminTab = switchAdminTab;
window.loadDashboardData = loadDashboardData;
window.loadPayments = loadPayments;
window.loadTickets = loadTickets;
window.loadCustomers = loadCustomers;
window.loadActivityLogs = loadActivityLogs;
window.loadAdminsList = loadAdminsList;
window.createNewAdmin = createNewAdmin;
window.verifyPaymentAdmin = verifyPaymentAdmin;
window.rejectPaymentAdmin = rejectPaymentAdmin;
window.showCreateAdminForm = showCreateAdminForm;
window.hideCreateAdminForm = hideCreateAdminForm;
window.startRealtimeUpdates = startRealtimeUpdates;
