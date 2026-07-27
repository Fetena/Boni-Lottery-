// ============================================
// MAIN ADMIN LOTTERY DRAW COMPONENT
// ============================================

class MainAdminLotteryDraw {
    constructor() {
        this.selectedScope = 'global';
    }

    render() {
        return `
            <div class="glass-panel rounded-2xl p-6 border-2 border-yellow-400/40 bg-gradient-to-b from-yellow-400/10 to-black space-y-4 text-center shadow-[0_0_25px_rgba(252,211,77,0.15)]">
                <div>
                    <span class="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">⚡ Live Draw Center</span>
                    <h3 class="text-2xl font-black text-gradient mt-2">🎰 Global Lucky Draw</h3>
                    <p class="text-xs text-slate-300 mt-1">Spin the cryptographic wheel to randomly select a verified winner from all approved platform pools.</p>
                </div>

                <!-- Spinner Display Box -->
                <div class="py-6 bg-black/60 rounded-xl border border-yellow-400/30 flex flex-col items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent pointer-events-none"></div>
                    <span class="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Winning Number Result</span>
                    <div id="main-lottery-spinner-box" class="text-5xl font-black text-yellow-400 tracking-wider drop-shadow-[0_0_15px_rgba(252,211,77,0.6)]">---</div>
                    <div id="main-winner-info-display" class="text-xs text-slate-300 mt-2 font-medium"></div>
                </div>

                <button onclick="window.mainAdminLottery.runDraw()" class="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black rounded-xl text-sm shadow-lg hover:opacity-95 transform active:scale-95 transition-all">🎲 SPIN & DRAW WINNER NOW</button>
            </div>
        `;
    }

    async init() {
        console.log('✅ MainAdminLotteryDraw initialized');
    }

    async runDraw() {
        if (!db) {
            return notify('error', '❌ Database not initialized');
        }

        try {
            let query = db.collection('customer_tickets').where('status', '==', 'Approved');
            const snapshot = await query.get();

            if (snapshot.empty) {
                return notify('error', '❌ No approved tickets found to draw from!');
            }

            let allAvailableNumbers = [];
            snapshot.forEach(doc => {
                const ticket = doc.data();
                if (ticket.numbers && Array.isArray(ticket.numbers)) {
                    ticket.numbers.forEach(num => {
                        allAvailableNumbers.push({ 
                            ticketId: doc.id, 
                            number: num, 
                            customer: ticket.customerName, 
                            email: ticket.customerEmail 
                        });
                    });
                }
            });

            if (allAvailableNumbers.length === 0) {
                return notify('error', '❌ No active numbers available for this draw scope.');
            }

            const spinnerBox = document.getElementById('main-lottery-spinner-box');
            const winnerInfoBox = document.getElementById('main-winner-info-display');
            if (winnerInfoBox) winnerInfoBox.textContent = '';

            // Live Spinning Animation Loop
            let spinCount = 0;
            const maxSpins = 30;
            const spinInterval = setInterval(() => {
                const randomNum = Math.floor(Math.random() * 300) + 1;
                if (spinnerBox) spinnerBox.textContent = `#${randomNum}`;
                spinCount++;

                if (spinCount >= maxSpins) {
                    clearInterval(spinInterval);

                    // Select Final Winner
                    const randomIndex = Math.floor(Math.random() * allAvailableNumbers.length);
                    const winningSelection = allAvailableNumbers[randomIndex];

                    if (spinnerBox) spinnerBox.textContent = `#${winningSelection.number}`;
                    if (winnerInfoBox) {
                        winnerInfoBox.innerHTML = `🏆 Winner: <span class="text-yellow-400 font-bold">${winningSelection.customer}</span> (${winningSelection.email})`;
                    }

                    // Save to Firestore
                    db.collection('lottery_draws').add({
                        winningNumber: winningSelection.number,
                        winningTicketId: winningSelection.ticketId,
                        winnerName: winningSelection.customer,
                        winnerEmail: winningSelection.email,
                        drawnBy: currentUser?.email || 'Main Admin',
                        scope: 'Global Main Admin',
                        drawnAt: new Date()
                    });

                    notify('success', `🎉 WINNING NUMBER DRAWN: #${winningSelection.number} (${winningSelection.customer})!`);
                }
            }, 60);

        } catch (error) {
            console.error('Draw error:', error);
            notify('error', `❌ Draw Error: ${error.message}`);
        }
    }
}
