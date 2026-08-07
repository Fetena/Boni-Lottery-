// ============================================
// INDEPENDENT LOTTERY COMPONENT (FIXED)
// ============================================

let countdownInterval = null;

class AdminLotteryDraw {
    constructor(adminId) {
        this.adminId = adminId;
    }

    render() {
        return `
            <div class="glass-panel rounded-2xl p-6 border-2 border-yellow-400/40 bg-gradient-to-b from-yellow-400/10 to-black space-y-6 shadow-[0_0_25px_rgba(252,211,77,0.15)]">
                <div>
                    <span class="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">⚡ Live Draw Center</span>
                    <h3 class="text-2xl font-black text-gradient mt-2">🎰 Branch Lucky Draw</h3>
                    <p class="text-xs text-slate-300 mt-1">Set your exact target date and AM/PM time below to schedule the draw and unlock the wheel.</p>
                </div>

                <!-- AM/PM Custom Schedule Selector -->
                <div class="bg-black/40 p-4 rounded-xl border border-yellow-400/20 space-y-3">
                    <h4 class="text-xs font-bold text-yellow-400 uppercase tracking-wide">⚙️ Precise Date & AM/PM Schedule</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-1">Target Date</label>
                            <input type="date" id="draw-target-date" class="w-full bg-black/60 border border-yellow-400/30 rounded-xl py-2 px-3 text-white text-xs">
                        </div>
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-1">Hour & Minute</label>
                            <input type="time" id="draw-target-time" class="w-full bg-black/60 border border-yellow-400/30 rounded-xl py-2 px-3 text-white text-xs">
                        </div>
                        <div>
                            <label class="block text-[10px] text-slate-400 mb-1">AM / PM</label>
                            <select id="draw-target-ampm" class="w-full bg-black/60 border border-yellow-400/30 rounded-xl py-2 px-3 text-white text-xs">
                                <option value="AM">AM</option>
                                <option value="PM" selected>PM</option>
                            </select>
                        </div>
                        <div class="flex items-end">
                            <button onclick="window.adminLottery.saveSchedule()" class="w-full py-2 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 font-bold rounded-xl text-xs transition-all">💾 Save Schedule</button>
                        </div>
                    </div>
                    <p id="schedule-status-text" class="text-[11px] text-slate-400 italic">No schedule active.</p>
                </div>

                <!-- Countdown & Spinner Box -->
                <div class="py-6 bg-black/60 rounded-xl border border-yellow-400/30 flex flex-col items-center justify-center relative overflow-hidden space-y-2">
                    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent pointer-events-none"></div>
                    <span id="draw-countdown-timer" class="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">⏳ LOCKED UNTIL TIMER ENDS</span>
                    <span class="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Winning Number Result</span>
                    <div id="lottery-spinner-box" class="text-5xl font-black text-yellow-400 tracking-wider drop-shadow-[0_0_15px_rgba(252,211,77,0.6)]">---</div>
                    <div id="winner-info-display" class="text-xs text-slate-300 mt-2 font-medium text-center px-4"></div>
                </div>

                <!-- Spin Action Button -->
                <button id="spin-draw-btn" onclick="window.adminLottery.runDraw()" disabled class="w-full py-3.5 bg-slate-800 text-slate-500 font-black rounded-xl text-sm cursor-not-allowed transition-all shadow-none">🔒 DRAW LOCKED (WAITING FOR TIMER)</button>

                <!-- Recent Winners History & Winning Numbers Audit -->
                <div class="space-y-3 pt-4 border-t border-yellow-400/10">
                    <h4 class="text-xs font-bold text-white uppercase tracking-wider">🏆 Winning Numbers Audit & Past Winners (Last 7 Days)</h4>
                    <div id="lottery-history-list" class="space-y-2 max-h-48 overflow-y-auto">
                        <p class="text-slate-500 text-xs italic text-center py-2">Loading recent history and audit logs...</p>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        console.log('✅ AdminLotteryDraw initialized');
        
        const dateInput = document.getElementById('draw-target-date');
        const timeInput = document.getElementById('draw-target-time');
        const ampmInput = document.getElementById('draw-target-ampm');

        const now = new Date();
        if (dateInput && !dateInput.value) {
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
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

        if (this.scheduleCheckInterval) clearInterval(this.scheduleCheckInterval);
        this.scheduleCheckInterval = setInterval(() => this.checkScheduleTiming(), 1000);
    }

    getTargetDateTime() {
        const dateStr = document.getElementById('draw-target-date')?.value;
        const timeStr = document.getElementById('draw-target-time')?.value;
        const ampmStr = document.getElementById('draw-target-ampm')?.value;

        if (!dateStr || !timeStr) return null;

        const parts = dateStr.split('-').map(Number);
        if (parts.length !== 3) return null;

        const [year, month, day] = parts;
        let [hours, minutes] = timeStr.split(':').map(Number);

        if (ampmStr === 'PM' && hours < 12) hours += 12;
        if (ampmStr === 'AM' && hours === 12) hours = 0;

        return new Date(year, month - 1, day, hours, minutes, 0, 0);
    }

    checkScheduleTiming() {
        const targetDateObj = this.getTargetDateTime();
        const drawBtn = document.getElementById('spin-draw-btn');
        const statusBadge = document.getElementById('draw-countdown-timer');
        const scheduleStatusText = document.getElementById('schedule-status-text');

        if (!targetDateObj || !drawBtn || !statusBadge) return;

        const now = new Date();
        const dateStr = document.getElementById('draw-target-date')?.value;
        const timeStr = document.getElementById('draw-target-time')?.value;
        const ampmStr = document.getElementById('draw-target-ampm')?.value;

        if (scheduleStatusText) {
            scheduleStatusText.textContent = `Active Schedule Target: ${dateStr}, ${timeStr} ${ampmStr}`;
        }

        if (now >= targetDateObj) {
            drawBtn.disabled = false;
            drawBtn.className = "w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black rounded-xl text-sm shadow-lg hover:opacity-95 transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer";
            drawBtn.innerHTML = "🎲 SPIN & DRAW WINNER NOW";

            statusBadge.className = "text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30";
            statusBadge.innerHTML = '🟢 DRAW UNLOCKED & READY!';
        } else {
            drawBtn.disabled = true;
            drawBtn.className = "w-full py-3.5 bg-slate-800 text-slate-500 font-black rounded-xl text-sm cursor-not-allowed transition-all shadow-none";
            
            const diffMs = targetDateObj - now;
            const diffMins = Math.floor(diffMs / 60000);
            const hrs = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            const secs = Math.floor((diffMs % 60000) / 1000);

            drawBtn.innerHTML = `🔒 DRAW LOCKED (OPENS IN ${hrs}h ${mins}m ${secs}s)`;

            statusBadge.className = "text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20";
            statusBadge.innerHTML = `⏳ OPENS IN: ${hrs}h ${mins}m ${secs}s`;
        }
    }

    async saveSchedule() {
        const date = document.getElementById('draw-target-date')?.value;
        const time = document.getElementById('draw-target-time')?.value;
        const ampm = document.getElementById('draw-target-ampm')?.value;

        if (!date || !time) {
            return notify('error', '❌ Please provide both date and time.');
        }

        try {
            if (db) {
                await db.collection('settings').doc('main_draw_schedule').set({
                    targetDate: date,
                    targetTime: time,
                    ampm: ampm,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
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
                const dateInput = document.getElementById('draw-target-date');
                const timeInput = document.getElementById('draw-target-time');
                const ampmInput = document.getElementById('draw-target-ampm');

                if (data.targetDate && dateInput) dateInput.value = data.targetDate;
                if (data.targetTime && timeInput) timeInput.value = data.targetTime;
                if (data.ampm && ampmInput) ampmInput.value = data.ampm;

                this.checkScheduleTiming();
            }
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    }

    async loadPastWinners() {
        const container = document.getElementById('lottery-history-list');
        if (!container) return;

        try {
            if (!db) {
                container.innerHTML = `<p class="text-xs text-slate-500 italic text-center py-2">Database not connected.</p>`;
                return;
            }

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const snapshot = await db.collection('lottery_draws')
                .orderBy('drawnAt', 'desc')
                .get();

            if (snapshot.empty) {
                container.innerHTML = `<p class="text-xs text-slate-500 italic text-center py-2">No past winning numbers audit recorded yet.</p>`;
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
                                    Winning Number: #${draw.winningNumber} — ${draw.winnerName || 'Winner'}
                                </div>
                                <div class="text-[11px] text-slate-400 flex items-center gap-2">
                                    <span>📞 ${phone}</span>
                                    <span>•</span>
                                    <span>✉️ ${email}</span>
                                </div>
                                <div class="text-[10px] text-slate-500">
                                    Audit Log Timestamp: ${formattedDate}
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
                container.innerHTML = `<p class="text-xs text-slate-500 italic text-center py-2">No winning numbers audit found within the last 7 days.</p>`;
            } else {
                container.innerHTML = html;
            }
        } catch (error) {
            console.error('Error loading past winners:', error);
            container.innerHTML = `<p class="text-xs text-red-400 italic text-center py-2">Error loading draw history audit.</p>`;
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

            const spinnerBox = document.getElementById('lottery-spinner-box');
            const winnerInfoBox = document.getElementById('winner-info-display');
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
