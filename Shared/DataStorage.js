// ============================================
// SHARED DATA STORAGE
// All components use this for persistence
// ============================================

class DataStorage {
    constructor() {
        this.initializeDefaultData();
    }

    initializeDefaultData() {
        if (!localStorage.getItem('customers')) {
            localStorage.setItem('customers', JSON.stringify({
                'cust1': { 
                    id: 'cust1', name: 'Mohammed Ali', email: 'm@email.com', phone: '0911223344',
                    adminId: 'admin1', tickets: 5, spent: 500, numbers: [], joinDate: 'June 2026'
                }
            }));
        }
        
        if (!localStorage.getItem('admins')) {
            localStorage.setItem('admins', JSON.stringify({
                'admin1': {
                    id: 'admin1', name: 'Ahmed Mohamed', email: 'ahmed@company.com', 
                    range: { start: 1, end: 300 }, customers: 8, tickets: 25, revenue: 2500,
                    paymentAccounts: { telebirr: '0945792677', cbe: '0945792677' }
                }
            }));
        }

        if (!localStorage.getItem('settings')) {
            localStorage.setItem('settings', JSON.stringify({
                ticketPrice: 100,
                drawTime: '20:00',
                drawDay: 'Sunday',
                prizePool: 70,
                telebirr: '0945792677',
                cbe: '0945792677',
                tiktok: '@BoniLottery'
            }));
        }

        if (!localStorage.getItem('notifications')) {
            localStorage.setItem('notifications', JSON.stringify([]));
        }
    }

    // ========== CUSTOMERS ==========
    getCustomers() { return JSON.parse(localStorage.getItem('customers') || '{}'); }
    getCustomer(custId) { const customers = this.getCustomers(); return customers[custId] || null; }
    updateCustomer(custId, data) {
        const customers = this.getCustomers();
        if (customers[custId]) {
            customers[custId] = { ...customers[custId], ...data };
            localStorage.setItem('customers', JSON.stringify(customers));
            this.addNotification('success', `✅ ${data.name || 'Profile'} updated`);
            return true;
        }
        return false;
    }

    // ========== SETTINGS ==========
    getSettings() { return JSON.parse(localStorage.getItem('settings') || '{}'); }
    updateSettings(newSettings) {
        const current = this.getSettings();
        const updated = { ...current, ...newSettings };
        localStorage.setItem('settings', JSON.stringify(updated));
        this.addNotification('success', '✅ Settings saved!');
        return updated;
    }

    // ========== TICKETS ==========
    addTicket(custId, ticketData) {
        const customers = this.getCustomers();
        if (customers[custId]) {
            const tickets = customers[custId].tickets || [];
            const newTicket = {
                id: 'TK' + Date.now(),
                numbers: ticketData.numbers,
                cost: ticketData.numbers.length * 100,
                status: 'Pending',
                date: new Date().toLocaleDateString(),
                ...ticketData
            };
            tickets.push(newTicket);
            customers[custId].tickets = tickets;
            customers[custId].spent = (customers[custId].spent || 0) + newTicket.cost;
            localStorage.setItem('customers', JSON.stringify(customers));
            this.addNotification('success', `✅ Ticket: ${ticketData.numbers.length} numbers - ${newTicket.cost} ETB`);
            return newTicket;
        }
        return null;
    }

    // ========== NOTIFICATIONS ==========
    getNotifications() { return JSON.parse(localStorage.getItem('notifications') || '[]'); }
    addNotification(type, message) {
        const notifs = this.getNotifications();
        notifs.push({
            id: Date.now(),
            type: type,
            message: message,
            timestamp: new Date().toLocaleTimeString()
        });
        localStorage.setItem('notifications', JSON.stringify(notifs));
        return notifs;
    }

    // ========== PAYMENT ACCOUNTS ==========
    getAdminSettings(adminId) {
        const admins = JSON.parse(localStorage.getItem('admins') || '{}');
        return admins[adminId] || null;
    }
    updateAdminPaymentAccounts(adminId, accounts) {
        const admins = JSON.parse(localStorage.getItem('admins') || '{}');
        if (admins[adminId]) {
            admins[adminId].paymentAccounts = accounts;
            localStorage.setItem('admins', JSON.stringify(admins));
            this.addNotification('success', '✅ Payment accounts updated!');
            return true;
        }
        return false;
    }

    // ========== NUMBER SELECTION ==========
    getSelectedNumbers(custId) { return JSON.parse(localStorage.getItem(`selected_numbers_${custId}`) || '[]'); }
    setSelectedNumbers(custId, numbers) { localStorage.setItem(`selected_numbers_${custId}`, JSON.stringify(numbers)); }
}

// Global instance for all components
const dataStorage = new DataStorage();  // ✅ No conflict!
