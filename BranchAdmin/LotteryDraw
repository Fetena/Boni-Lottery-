// ============================================
// INDEPENDENT LOTTERY COMPONENT
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
                            <button onclick="window.adminLottery.saveAutomatedDrawSchedule()" class="w-full py-2 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 font-bold rounded-xl text-xs transition-all">💾 Save Schedule</button>
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
                <button id="spin-draw-btn" onclick="window.adminLottery.runLotteryDraw(currentUser?.email)" disabled class="w-full py-3.5 bg-slate-800 text-slate-500 font-black rounded-xl text-sm cursor-not-allowed transition-all shadow-none">🔒 DRAW LOCKED (WAITING FOR TIMER)</button>

                <!-- Recent Winners History -->
                <div class="space-y-3 pt-4 border-t border-yellow-400/10">
                    <h4 class="text-xs font-bold text-white uppercase tracking-wider">🏆 Past Winners (Last 7 Days)</h4>
                    <div id="lottery-history-list" class="space-y-2 max-h-48 overflow-y-auto">
                        <p class="text-slate-500 text-xs italic text-center py-2">Loading recent history...</p>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        await this.loadDrawSchedule();
        await this.loadDrawHistory();
    }

    async saveAutomatedDrawSchedule() {
        if (!db || !currentUser) return notify('error', '❌ Database or user not ready');

        const dateVal = document.getElementById('draw-target-date').value;
        const timeVal = document.getElementById('draw-target-time').value;
        const ampmVal = document.getElementById('draw-target-ampm').value;

        if (!dateVal || !timeVal) {
            return notify('error', '❌ Please select both a valid date and time');
        }

        try {
            let [hours, minutes] = timeVal.split(':').map(Number);
            
            if (ampmVal === 'PM' && hours < 12) hours += 12;
            if (ampmVal === 'AM' && hours === 12) hours = 0;

            const targetDate = new Date(dateVal);
            targetDate.setHours(hours, minutes, 0, 0);

            await db.collection('admin_settings').doc(`draw_schedule_${currentUser.email}`).set({
                adminEmail: currentUser.email,
                scheduledTime: firebase.firestore.Timestamp.fromDate(targetDate),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            notify('success', `✅ Schedule successfully saved for ${targetDate.toLocaleString()}!`);
            this.loadDrawSchedule();
        } catch (error) {
            notify('error', `❌ Error saving schedule: ${error.message}`);
        }
    }

    async loadDrawSchedule() {
        if (!db || !currentUser) return;
        try {
            const doc = await db.collection('admin_settings').doc(`draw_schedule_${currentUser.email}`).get();
            const statusText = document.getElementById('schedule-status-text');
            const spinBtn = document.getElementById('spin-draw-btn');
            const timerBox = document.getElementById('draw-countdown-timer');

            if (!doc.exists) return;
            const data = doc.data();
            if (!data.scheduledTime) return;

            const scheduledDate = data.scheduledTime.toDate();
            
            const dateInput = document.getElementById('draw-target-date');
            const timeInput = document.getElementById('draw-target-time');
            const ampmInput = document.getElementById('draw-target-ampm');

            if (dateInput && !dateInput.value) {
                dateInput.value = scheduledDate.toISOString().split('T')[0];
            }
            if (timeInput && !timeInput.value) {
                let h = scheduledDate.getHours();
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                timeInput.value = `${String(h).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`;
                if (ampmInput) ampmInput.value = ampm;
            }

            if (statusText) {
                statusText.innerHTML = `📅 Target Draw Time: <span class="text-white font-bold">${scheduledDate.toLocaleString()}</span>`;
            }

            if (countdownInterval) clearInterval(countdownInterval);

            countdownInterval = setInterval(() => {
                const now = new Date();
                const diff = scheduledDate - now;

                if (diff <= 0) {
                    if (timerBox) {
                        timerBox.textContent = '🟢 DRAW UNLOCKED & READY!';
                        timerBox.className = 'text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20';
                    }
                    if (spinBtn) {
                        spinBtn.disabled = false;
                        spinBtn.className = 'w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black rounded-xl text-sm shadow-lg hover:opacity-95 transform active:scale-95 transition-all cursor-pointer';
                        spinBtn.textContent = '🎲 SPIN & DRAW WINNER NOW';
                    }
                    clearInterval(countdownInterval);
                } else {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    if (timerBox) {
                        timerBox.textContent = `⏳ UNLOCKS IN: ${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`;
                    }
                }
            }, 1000);

        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    }

    async runLotteryDraw(adminEmail = null) {
        if (!db) return notify('error', '❌ Database not initialized');

        try {
            let query = db.collection('customer_tickets').where('status', '==', 'Approved');
            const snapshot = await query.get();

            if (snapshot.empty) {
                return notify('error', '❌ No approved tickets found to draw from!');
            }

            let allAvailableNumbers = [];
            for (const doc of snapshot.docs) {
                const ticket = doc.data();
                if (!adminEmail || ticket.assignedAdmin === adminEmail) {
                    if (ticket.numbers && Array.isArray(ticket.numbers)) {
                        let phoneNum = ticket.phone || ticket.customerPhone || null;

                        if (!phoneNum && ticket.customerEmail) {
                            try {
                                const custSettingDoc = await db.collection('customer_settings').doc(ticket.customerEmail).get();
                                if (custSettingDoc.exists && custSettingDoc.data().phone) {
                                    phoneNum = custSettingDoc.data().phone;
                                } else {
                                    const manualCustSnap = await db.collection('admin_customers')
                                        .where('email', '==', ticket.customerEmail)
                                        .get();
                                    if (!manualCustSnap.empty) {
                                        phoneNum = manualCustSnap.docs[0].data().phone;
                                    }
                                }
                            } catch (err) {
                                console.error('Error fetching fallback phone:', err);
                            }
                        }

                        ticket.numbers.forEach(num => {
                            allAvailableNumbers.push({ 
                                ticketId: doc.id, 
                                number: num, 
                                customer: ticket.customerName || 'N/A', 
                                email: ticket.customerEmail || 'N/A',
                                phone: phoneNum || 'N/A' 
                            });
                        });
                    }
                }
            }

            if (allAvailableNumbers.length === 0) {
                return notify('error', '❌ No active numbers available for this draw scope.');
            }

            const spinnerBox = document.getElementById('lottery-spinner-box');
            const winnerInfoBox = document.getElementById('winner-info-display');
            if (winnerInfoBox) winnerInfoBox.textContent = '';

            let spinCount = 0;
            const maxSpins = 30;
            const spinInterval = setInterval(async () => {
                const randomNum = Math.floor(Math.random() * 300) + 1;
                if (spinnerBox) spinnerBox.textContent = `#${randomNum}`;
                spinCount++;

                if (spinCount >= maxSpins) {
                    clearInterval(spinInterval);

                    const randomIndex = Math.floor(Math.random() * allAvailableNumbers.length);
                    const winningSelection = allAvailableNumbers[randomIndex];

                    if (spinnerBox) spinnerBox.textContent = `#${winningSelection.number}`;
                    if (winnerInfoBox) {
                        winnerInfoBox.innerHTML = `🏆 Winner: <span class="text-yellow-400 font-bold">${winningSelection.customer}</span><br>📧 Email: ${winningSelection.email} • 📞 Phone: <span class="text-emerald-400 font-bold">${winningSelection.phone}</span>`;
                    }

                    await db.collection('lottery_draws').add({
                        winningNumber: winningSelection.number,
                        winningTicketId: winningSelection.ticketId,
                        winnerName: winningSelection.customer,
                        winnerEmail: winningSelection.email,
                        winnerPhone: winningSelection.phone,
                        drawnBy: currentUser?.email || 'Admin',
                        scope: adminEmail ? `Branch: ${adminEmail}` : 'Global Main Admin',
                        drawnAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    notify('success', `🎉 WINNING NUMBER DRAWN: #${winningSelection.number} (${winningSelection.customer})!`);
                    this.loadDrawHistory();
                }
            }, 60);

        } catch (error) {
            console.error('Draw error:', error);
            notify('error', `❌ Draw Error: ${error.message}`);
        }
    }

    async loadDrawHistory() {
        if (!db) return;
        try {
            const snapshot = await db.collection('lottery_draws')
                .orderBy('drawnAt', 'desc')
                .get();

            const historyList = document.getElementById('lottery-history-list');
            if (!historyList) return;

            if (snapshot.empty) {
                historyList.innerHTML = '<p class="text-slate-500 text-xs italic text-center py-2">No recent draw history</p>';
                return;
            }

            const now = new Date();
            const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
            let validHistoryHTML = '';

            for (const docSnap of snapshot.docs) {
                const record = docSnap.data();
                const drawnDate = record.drawnAt ? record.drawnAt.toDate() : new Date();
                
                if ((now - drawnDate) > oneWeekMs) {
                    await db.collection('lottery_draws').doc(docSnap.id).delete();
                    continue;
                }

                validHistoryHTML += `
                    <div class="bg-black/40 border border-yellow-400/10 rounded-xl p-3 flex justify-between items-center text-xs">
                        <div>
                            <p class="text-yellow-400 font-bold">#${record.winningNumber} — ${record.winnerName}</p>
                            <p class="text-slate-400 text-[10px]">📞 ${record.winnerPhone || 'N/A'} • 📧 ${record.winnerEmail || 'N/A'}</p>
                            <p class="text-slate-500 text-[9px]">Drawn: ${drawnDate.toLocaleString()}</p>
                        </div>
                        <span class="px-2 py-1 bg-yellow-400/10 text-yellow-300 rounded text-[10px] font-mono">${record.scope || 'Branch'}</span>
                    </div>
                `;
            }

            historyList.innerHTML = validHistoryHTML || '<p class="text-slate-500 text-xs italic text-center py-2">No active history within the last 7 days</p>';

        } catch (error) {
            console.error('Error loading draw history:', error);
        }
    }
}
