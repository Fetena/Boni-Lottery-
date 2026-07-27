// ============================================
// MAIN ADMIN LOTTERY DRAW COMPONENT (SCHEDULE-LOCKED WITH PHONE & HISTORY)
// ============================================

class MainAdminLotteryDraw {
    constructor() {
        this.selectedScope = 'global';
        this.scheduleCheckInterval = null;
    }

    render() {
        return `
            <div class="glass-panel rounded-2xl p-6 border-2 border-yellow-400/40 bg-gradient-to-b from-yellow-400/10 to-black space-y-6 text-center shadow-[0_0_25px_rgba(252,211,77,0.15)]">
                <div>
                    <span class="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">⚡ LIVE DRAW CENTER</span>
                    <h3 class="text-3xl font-black text-gradient mt-2">🎰 Global Lucky Draw</h3>
                    <p class="text-xs text-slate-300 mt-1">Set your exact target date and AM/PM time below to schedule the draw and unlock the wheel.</p>
                </div>

                <!-- PRECISE DATE & AM/PM SCHEDULE CONTAINER -->
                <div class="bg-black/40 p-4 rounded-xl border border-yellow-400/20 space-y-3 text-left">
                    <h4 class="text-xs font-bold text-yellow-400 flex items-center gap-2">
                        ⚙️ PRECISE DATE & AM/PM SCHEDULE
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Target Date</label>
                            <input type="date" id="main-draw-date-input" onchange="window.mainAdminLottery.checkScheduleTiming()" class="w-full bg-black/60 border border-yellow-400/30 rounded-lg py-2 px-3 text-white text-xs">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Hour & Minute</label>
                            <input type="time" id="main-draw-time-input" onchange="window.mainAdminLottery.checkScheduleTiming()" class="w-full bg-black/60 border border-yellow-400/30 rounded-lg py-2 px-3 text-white text-xs">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">AM / PM</label>
                            <select id="main-draw-ampm-input" onchange="window.mainAdminLottery.checkScheduleTiming()" class="w-full bg-black/60 border border-yellow-400/30 rounded-lg py-2 px-3 text-white text-xs">
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex items-center justify-between pt-2">
                        <span id="main-target-display-text" class="text-[11px] text-yellow-400/80 font-medium">📅 Target Draw Time: Not Set</span>
                        <button onclick="window.mainAdminLottery.saveSchedule()" class="px-4 py-2 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5">
                            💾 Save Schedule
                        </button>
                    </div>
                </div>

                <!-- Spinner Display Box -->
                <div class="py-6 bg-black/60 rounded-xl border border-yellow-400/30 flex flex-col items-center justify-center relative overflow-hidden space-y-2">
                    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div id="main-draw-status-badge" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-500/30">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> LOCKED UNTIL SCHEDULED TIME
                    </div>

                    <span class="text-[10px] uppercase tracking-widest text-slate-400">WINNING NUMBER RESULT</span>
                    <div id="main-lottery-spinner-box" class="text-5xl font-black text-yellow-400 tracking-wider drop-shadow-[0_0_15px_rgba(252,211,77,0.6)]">---</div>
                    <div id="main-winner-info-display" class="text-xs text-slate-300 font-medium"></div>
                </div>

                <button id="main-spin-draw-btn" onclick="window.mainAdminLottery.runDraw()" disabled class="w-full py-4 bg-slate-800 text-slate-500 font-black rounded-xl text-sm shadow-lg cursor-not-allowed transition-all flex items-center justify-center gap-2">
                    🔒 LOCKED (WAITING FOR SCHEDULE)
                </button>

                <!-- PAST WINNERS FEED (LAST 7 DAYS) -->
                <div class="space-y-3 text-left pt-4 border-t border-yellow-400/10">
                    <h4 class="text-xs font-bold text-yellow-400 flex items-center gap-2">
                        🏆 PAST WINNERS (LAST 7 DAYS)
                    </h4>
                    <div id="main-past-winners-list" class="space-y-2 max-h-72 overflow-y-auto pr-1">
                        <p class="text-xs text-slate-500 italic py-2">Loading past draw history...</p>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        console.log('✅ MainAdminLotteryDraw initialized');
        
        const dateInput = document.getElementById('main-draw-date-input');
        const timeInput = document.getElementById('main-draw-time-input');
        const ampmInput = document.getElementById('main-draw-ampm-input');

        const now = new Date();
        if (dateInput && !dateInput.value) {
            dateInput.value = now.toISOString().split('T')[0];
        }
        if (timeInput && !timeInput.value) {
            let hours = now.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeInput.value = `${String(hours).padStart(2, '0')}:${minutes}`;
            if (ampmInput) ampmInput.value = ampm;
        }

        await this.loadSchedule();
        await this.loadPastWinners();

        // Start real-time check loop every second
        if (this.scheduleCheckInterval) clearInterval(this.scheduleCheckInterval);
        this.scheduleCheckInterval = setInterval(() => this.checkScheduleTiming(), 1000);
    }

    getTargetDateTime() {
        const dateStr = document.getElementById('main-draw-date-input')?.value;
        const timeStr = document.getElementById('main-draw-time-input')?.value;
        const ampmStr = document.getElementById('main-draw-ampm-input')?.value;

        if (!dateStr || !timeStr) return null;

        let [hours, minutes] = timeStr.split(':').map(Number);
        if (ampmStr === 'PM' && hours < 12) hours += 12;
        if (ampmStr === 'AM' && hours === 12) hours = 0;

        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day, hours, minutes, 0);
    }

    checkScheduleTiming() {
        const targetDateObj = this.getTargetDateTime();
        const drawBtn = document.getElementById('main-spin-draw-btn');
        const statusBadge = document.getElementById('main-draw-status-badge');
        const displayText = document.getElementById('main-target-display-text');

        if (!targetDateObj || !drawBtn || !statusBadge) return;

        const now = new Date();
        const dateStr = document.getElementById('main-draw-date-input')?.value;
        const timeStr = document.getElementById('main-draw-time-input')?.value;
        const ampmStr = document.getElementById('main-draw-ampm-input')?.value;

        if (displayText) {
            displayText.textContent = `📅 Target Draw Time: ${dateStr}, ${timeStr} ${ampmStr}`;
        }

        if (now >= targetDateObj) {
            // Unlocked
            drawBtn.disabled = false;
            drawBtn.className = "w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black rounded-xl text-sm shadow-lg hover:opacity-95 transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer";
            drawBtn.innerHTML = "🎲 SPIN & DRAW WINNER NOW";

            statusBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30";
            statusBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> DRAW UNLOCKED & READY!';
        } else {
            // Locked
            drawBtn.disabled = true;
            drawBtn.className = "w-full py-4 bg-slate-800 text-slate-500 font-black rounded-xl text-sm shadow-lg cursor-not-allowed transition-all flex items-center justify-center gap-2";
            
            const diffMs = targetDateObj - now;
            const diffMins = Math.floor(diffMs / 60000);
            const hrs = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            const secs = Math.floor((diffMs % 60000) / 1000);

            drawBtn.innerHTML = `🔒 LOCKED (OPENS IN ${hrs}h ${mins}m ${secs}s)`;

            statusBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-500/30";
            statusBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> WAITING FOR TARGET TIME`;
        }
    }

    async saveSchedule() {
        const date = document.getElementById('main-draw-date-input')?.value;
        const time = document.getElementById('main-draw-time-input')?.value;
        const ampm = document.getElementById('main-draw-ampm-input')?.value;

        if (!date || !time) {
            return notify('error', '❌ Please provide both date and time.');
        }

        try {
            if (db) {
                await db.collection('settings').doc('main_draw_schedule').set({
                    targetDate: date,
                    targetTime: time,
                    ampm: ampm,
                    updatedAt: new Date()
                }, { merge: true });
            }
            
            this.checkScheduleTiming();
            notify('success', '💾 Schedule saved successfully!');
        } catch (error) {
            console.error('Error saving schedule:', error);
            notify('error', '❌ Failed to save schedule.');
        }
    }

    async loadSchedule() {
        try {
            if (!db) return;
            const doc = await db.collection('settings').doc('main_draw_schedule').get();
            if (doc.exists) {
                const data = doc.data();
                const dateInput = document.getElementById('main-draw-date-input');
                const timeInput = document.getElementById('main-draw-time-input');
                const ampmInput = document.getElementById('main-draw-ampm-input');

                if (dateInput && data.targetDate) dateInput.value = data.targetDate;
                if (timeInput && data.targetTime) timeInput.value = data.targetTime;
                if (ampmInput && data.ampm) ampmInput.value = data.ampm;

                this.checkScheduleTiming();
            }
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    }

    async loadPastWinners() {
        const container = document.getElementById('main-past-winners-list');
        if (!container) return;

        try {
            if (!db) {
                container.innerHTML = `<p class="text-xs text-slate-500 italic py-2">Database not connected.</p>`;
                return;
            }

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const snapshot = await db.collection('lottery_draws')
                .orderBy('drawnAt', 'desc')
                .get();

            if (snapshot.empty) {
                container.innerHTML = `<p class="text-xs text-slate-500 italic py-2">No past winners recorded yet.</p>`;
                return;
            }

            let html = '';
            let count = 0;

            snapshot.forEach(doc => {
                const draw = doc.data();
                const drawnDate = draw.drawnAt?.toDate ? draw.drawnAt.toDate() : new Date();

                if (drawnDate >= sevenDaysAgo) {
                    count++;
                    const formattedDate = drawnDate.toLocaleString();
                    const phone = draw.winnerPhone || draw.phone || 'N/A';
                    const email = draw.winnerEmail || 'N/A';
                    const scopeText = draw.scope || 'Global Main Admin';

                    html += `
                        <div class="bg-black/60 border border-yellow-400/20 rounded-xl p-3 flex items-center justify-between gap-2">
                            <div class="space-y-0.5">
                                <div class="text-sm font-black text-yellow-400">
                                    #${draw.winningNumber} — ${draw.winnerName || 'Winner'}
                                </div>
                                <div class="text-[11px] text-slate-400 flex items-center gap-2">
                                    <span>📞 ${phone}</span>
                                    <span>•</span>
                                    <span>✉️ ${email}</span>
                                </div>
                                <div class="text-[10px] text-slate-500">
                                    Drawn: ${formattedDate}
                                </div>
                            </div>
                            <span class="px-2.5 py-1 bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-[10px] font-bold rounded-lg whitespace-nowrap">
                                ${scopeText}
                            </span>
                        </div>
                    `;
                }
            });

            if (count === 0) {
                container.innerHTML = `<p class="text-xs text-slate-500 italic py-2">No winners found within the last 7 days.</p>`;
            } else {
                container.innerHTML = html;
            }
        } catch (error) {
            console.error('Error loading past winners:', error);
            container.innerHTML = `<p class="text-xs text-red-400 italic py-2">Error loading draw history.</p>`;
        }
    }

    async runDraw() {
        const targetDateObj = this.getTargetDateTime();
        if (targetDateObj && new Date() < targetDateObj) {
            return notify('error', '❌ Draw is locked until the scheduled target time!');
        }

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
                            customer: ticket.customerName || ticket.name || 'N/A', 
                            email: ticket.customerEmail || ticket.email || 'N/A',
                            phone: ticket.phone || ticket.customerPhone || ticket.phoneNumber || 'N/A'
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

            let spinCount = 0;
            const maxSpins = 30;
            const spinInterval = setInterval(() => {
                const randomNum = Math.floor(Math.random() * 300) + 1;
                if (spinnerBox) spinnerBox.textContent = `#${randomNum}`;
                spinCount++;

                if (spinCount >= maxSpins) {
                    clearInterval(spinInterval);

                    const randomIndex = Math.floor(Math.random() * allAvailableNumbers.length);
                    const winningSelection = allAvailableNumbers[randomIndex];

                    if (spinnerBox) spinnerBox.textContent = `#${winningSelection.number}`;
                    if (winnerInfoBox) {
                        winnerInfoBox.innerHTML = `🏆 Winner: <span class="text-yellow-400 font-bold">${winningSelection.customer}</span> (${winningSelection.phone} • ${winningSelection.email})`;
                    }

                    db.collection('lottery_draws').add({
                        winningNumber: winningSelection.number,
                        winningTicketId: winningSelection.ticketId,
                        winnerName: winningSelection.customer,
                        winnerEmail: winningSelection.email,
                        winnerPhone: winningSelection.phone,
                        drawnBy: currentUser?.email || 'Main Admin',
                        scope: 'Global Main Admin',
                        drawnAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        this.loadPastWinners();
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
