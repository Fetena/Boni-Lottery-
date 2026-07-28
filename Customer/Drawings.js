// ============================================
// CUSTOMER DRAWINGS (CHILD COMPONENT)
// Parent: CustomerDashboard
// View drawings managed by the customer's registered admin
// ============================================

class CustomerDrawings {
    constructor(custId) {
        this.custId = custId;
        this.customerAdmin = null;
        this.draws = [];
        this.init();
    }

    async init() {
        await this.loadCustomerAndDrawings();
    }

    async loadCustomerAndDrawings() {
        try {
            // 1. Get customer profile to see which admin they are registered under
            let customerData = null;
            const doc = await db.collection('customers').doc(this.custId).get();
            if (doc.exists) {
                customerData = doc.data();
            } else {
                const localCusts = JSON.parse(localStorage.getItem('registered_customers') || '[]');
                customerData = localCusts.find(c => c.id === this.custId) || {};
            }

            this.customerAdmin = customerData.assignedAdmin || customerData.adminId || customerData.branchAdmin || customerData.preferredAdmin || 'Main Admin';

            // 2. Fetch drawings managed by this specific admin from Firestore collections
            let snapshot = await db.collection('draws')
                .where('adminId', '==', this.customerAdmin)
                .get();

            if (snapshot.empty) {
                snapshot = await db.collection('drawings')
                    .where('adminId', '==', this.customerAdmin)
                    .get();
            }

            if (snapshot.empty) {
                // Fallback: try fetching all draws / drawings if admin-specific query yields nothing
                snapshot = await db.collection('draws').get();
                if (snapshot.empty) {
                    snapshot = await db.collection('drawings').get();
                }
            }

            if (!snapshot.empty) {
                this.draws = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        adminId: data.adminId || this.customerAdmin,
                        date: data.date || data.targetDate || 'Upcoming Draw',
                        time: data.time || data.hourMinute ? `${data.hourMinute} ${data.amPm || ''}` : '20:00',
                        status: data.status || 'Upcoming',
                        winningNumber: data.winningNumber || null,
                        tickets: data.tickets || 0,
                        prizePool: data.prizePool || data.pool || 5000
                    };
                });
            } else {
                this.draws = this.defaultDraws();
            }
        } catch (e) {
            console.error('Error fetching admin drawings:', e);
            this.customerAdmin = 'Main Admin';
            this.draws = this.defaultDraws();
        }
    }

    defaultDraws() {
        return [
            {
                id: 'DRAW001',
                adminId: this.customerAdmin || 'Main Admin',
                date: 'Next Scheduled Draw',
                time: '20:00',
                status: 'Upcoming',
                winningNumber: null,
                tickets: 0,
                prizePool: 5000
            }
        ];
    }

    render() {
        const adminDraws = this.draws.filter(d => !d.adminId || d.adminId === this.customerAdmin || d.adminId === 'Main Admin');
        const activeDraws = adminDraws.length > 0 ? adminDraws : this.defaultDraws();
        const nextDraw = activeDraws.find(d => d.status === 'Upcoming') || activeDraws[0];
        const pastDraws = activeDraws.filter(d => d.id !== nextDraw.id);

        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold text-white">🎰 Home Dashboard</h3>
                    <span class="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-3 py-1 rounded-full">Managed by: ${this.customerAdmin}</span>
                </div>

                <!-- UPCOMING DRAW (DYNAMICALLY FETCHED FROM ADMIN SCHEDULE) -->
                <div class="glass-panel rounded-2xl p-8 border border-yellow-400/10 text-center space-y-4 bg-gradient-to-br from-yellow-400/10 to-transparent">
                    <h4 class="text-2xl font-bold text-yellow-400">Next Admin Drawing</h4>
                    <p class="text-3xl font-bold text-white">${nextDraw.date} • ${nextDraw.time}</p>
                    <p class="text-slate-300 font-medium">Prize Pool: <span class="text-yellow-400">${nextDraw.prizePool || 0} ETB</span></p>
                    <button onclick="customerDrawings.goToTikTok()" 
                        class="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">📱 Watch Live on TikTok</button>
                </div>

                <!-- CHECK IF WON -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white">🏆 Check Your Tickets</h4>
                    <p class="text-sm text-slate-300">Select a drawing date and enter your winning number</p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label class="text-xs text-slate-400 mb-1 block">Select Drawing Date</label>
                            <select id="check-draw-date" class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                                ${activeDraws.map(d => `<option value="${d.id}">${d.date} - Pool: ${d.prizePool || 0} ETB (${d.status})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="text-xs text-slate-400 mb-1 block">Winning Number</label>
                            <input type="number" id="check-number" placeholder="Enter number..." 
                                class="w-full bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                        </div>
                    </div>

                    <button onclick="customerDrawings.checkWinner()" 
                        class="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl mt-2">Check Winning Status</button>

                    <div id="win-result"></div>
                </div>

                <!-- PAST DRAWS -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">📜 Past Admin Drawings</h4>
                    <div class="space-y-3">
                        ${pastDraws.length > 0 ? pastDraws.map(draw => `
                            <div class="bg-black/30 rounded-lg p-4 border border-yellow-400/10">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-bold text-white">${draw.date}</p>
                                        <p class="text-sm text-yellow-400">Winning Number: ${draw.winningNumber || 'Pending'}</p>
                                        <p class="text-xs text-slate-400 mt-1">${draw.tickets || 0} tickets • ${draw.prizePool || 0} ETB pool</p>
                                    </div>
                                    <span class="text-xs bg-emerald-400/20 text-emerald-400 px-3 py-1 rounded">${draw.status}</span>
                                </div>
                            </div>
                        `).join('') : '<p class="text-slate-400 text-sm">No past drawings available.</p>'}
                    </div>
                </div>

                <!-- WINNING RULES -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">🎯 How Winning Works</h4>
                    <ul class="text-sm text-slate-300 space-y-2">
                        <li><span class="text-yellow-400">✅</span> Your numbers must match the winning number</li>
                        <li><span class="text-yellow-400">✅</span> Prize shared equally among all winners</li>
                        <li><span class="text-yellow-400">✅</span> Winners announced within 24 hours</li>
                        <li><span class="text-yellow-400">✅</span> Prizes transferred to your account</li>
                        <li><span class="text-yellow-400">✅</span> You get notified via SMS, Email, Telegram</li>
                    </ul>
                </div>
            </div>
        `;
    }

    async checkWinner() {
        const winningNumber = document.getElementById('check-number')?.value;
        if (!winningNumber) {
            this.notify('error', '❌ Enter a winning number');
            return;
        }

        let tickets = [];
        try {
            const doc = await db.collection('customers').doc(this.custId).get();
            if (doc.exists) {
                tickets = doc.data().tickets || [];
            }
        } catch (e) {
            tickets = JSON.parse(localStorage.getItem(`tickets_${this.custId}`) || '[]');
        }

        const matchingTickets = tickets.filter(t => t.numbers && t.numbers.includes(parseInt(winningNumber)));
        const resultDiv = document.getElementById('win-result');
        
        if (matchingTickets.length > 0) {
            resultDiv.innerHTML = `
                <div class="bg-emerald-400/10 border border-emerald-400 rounded-lg p-4 mt-4">
                    <p class="text-emerald-400 font-bold">🎉 YOU WON!</p>
                    <p class="text-sm text-white mt-2">${matchingTickets.length} of your ticket(s) match!</p>
                    <p class="text-xs text-slate-300 mt-1">Tickets: ${matchingTickets.map(t => t.id).join(', ')}</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="bg-red-400/10 border border-red-400 rounded-lg p-4 mt-4">
                    <p class="text-red-400 font-bold">❌ No matching tickets</p>
                    <p class="text-sm text-slate-300 mt-2">Try another number or buy more tickets</p>
                </div>
            `;
        }
    }

    goToTikTok() {
        this.notify('info', '📱 Opening TikTok @BoniLottery...');
        window.open('https://tiktok.com/@boniLottery', '_blank');
    }

    notify(type, message) {
        if (typeof showNotification === 'function') {
            showNotification(type, message);
        } else {
            alert(message);
        }
    }
}

let customerDrawings;
document.addEventListener('DOMContentLoaded', () => {
    customerDrawings = new CustomerDrawings(localStorage.getItem('currentCustId') || 'DEFAULT');
});
