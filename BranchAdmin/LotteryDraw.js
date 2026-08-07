// ============================================
// FULLY UPDATED ADMIN LOTTERY COMPONENT (LOCK-AFTER-SPIN & PROPER USER FIELD FETCHING)
// ============================================

class AdminLotteryDraw {
    constructor(adminId) {
        this.adminId = adminId;
        this.liveListener = null;
    }

    render() {
        return `
            <div class="glass-panel rounded-2xl p-6 border-2 border-yellow-400/40 bg-gradient-to-b from-yellow-400/10 to-black space-y-6 shadow-[0_0_25px_rgba(252,211,77,0.15)]">
                <div>
                    <span class="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">⚡ Live Draw Center</span>
                    <h3 class="text-2xl font-black text-gradient mt-2">🎰 Branch Lucky Draw & TikTok Live</h3>
                    <p class="text-xs text-slate-300 mt-1">Manage your precise schedule, set your TikTok Live link, and automatically dispatch notifications to customers upon drawing 3 winners.</p>
                </div>

                <!-- TikTok Live Link Input Only -->
                <div class="bg-black/40 p-4 rounded-xl border border-yellow-400/20 space-y-3">
                    <h4 class="text-xs font-bold text-yellow-400 uppercase tracking-wide">🔴 TikTok Live Stream Link</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div class="md:col-span-2">
                            <label class="block text-[10px] text-slate-400 mb-1">TikTok Live URL</label>
                            <input type="text" id="tiktok-live-url-input" placeholder="https://www.tiktok.com/@username/live" class="w-full bg-black/60 border border-yellow-400/30 rounded-xl py-2 px-3 text-white text-xs">
                        </div>
                        <div class="flex items-end">
                            <button onclick="window.adminLottery.saveTikTokLive()" class="w-full py-2 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 font-bold rounded-xl text-xs transition-all cursor-pointer">💾 Save Link</button>
                        </div>
                    </div>
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
                            <button onclick="window.adminLottery.saveSchedule()" class="w-full py-2 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 font-bold rounded-xl text-xs transition-all cursor-pointer">💾 Save Schedule</button>
                        </div>
                    </div>
                    <p id="schedule-status-text" class="text-[11px] text-slate-400 italic">No schedule active.</p>
                </div>

                <!-- Countdown & 3 Winners Display Box -->
                <div class="py-6 bg-black/60 rounded-xl border border-yellow-400/30 flex flex-col items-center justify-center relative overflow-hidden space-y-3">
                    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent pointer-events-none"></div>
                    <span id="draw-countdown-timer" class="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">⏳ LOCKED UNTIL TIMER ENDS</span>
                    
                    <span class="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Top 3 Winners (Drawn Respectively)</span>
                    
                    <!-- 3 Winners Container Placed Exactly at the Specified Red Line Spot -->
                    <div id="lottery-spinner-box" class="w-full px-4 flex flex-col gap-2 my-2">
                        <div class="flex items-center justify-between bg-black/80 border border-yellow-400/20 rounded-xl p-3">
                            <span class="text-xs font-black text-yellow-400">🥇 1st Place: ---</span>
                            <span class="text-xs text-slate-400">Numbers: ---</span>
                        </div>
                        <div class="flex items-center justify-between bg-black/80 border border-yellow-400/20 rounded-xl p-3">
                            <span class="text-xs font-black text-yellow-400">🥈 2nd Place: ---</span>
                            <span class="text-xs text-slate-400">Numbers: ---</span>
                        </div>
                        <div class="flex items-center justify-between bg-black/80 border border-yellow-400/20 rounded-xl p-3">
                            <span class="text-xs font-black text-yellow-400">🥉 3rd Place: ---</span>
                            <span class="text-xs text-slate-400">Numbers: ---</span>
                        </div>
                    </div>

                    <div id="winner-info-display" class="text-xs text-slate-300 mt-1 font-medium text-center px-4"></div>
                </div>

                <!-- Spin & Draw Action Button -->
                <div id="spin-action-container">
                    <button id="spin-draw-btn" onclick="window.adminLottery.runDraw()" disabled class="w-full py-3.5 bg-slate-800 text-slate-500 font-black rounded-xl text-sm cursor-not-allowed transition-all shadow-none">🔒 DRAW LOCKED (WAITING FOR TIMER)</button>
                </div>

                <!-- Recent Winners History (Last 7 Days) -->
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
        console.log('✅ AdminLotteryDraw initialized (Lock-After-Spin & Correct Fields)');
        
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
        await this.loadTikTokLive();
        await this.loadPastWinners();

        if (this.scheduleCheckInterval) clearInterval(this.scheduleCheckInterval);
        this.scheduleCheckInterval = setInterval(() => this.checkScheduleTiming(), 1000);

        this.initRealtimeStateListener();
    }

    initRealtimeStateListener() {
        if (!db) return;
        if (this.liveListener) this.liveListener();

        this.liveListener = db.collection('settings').doc('live_draw_state').onSnapshot(doc => {
            if (!doc.exists) return;
            const state = doc.data();
            const spinnerBox = document.getElementById('lottery-spinner-box');
            const winnerInfoBox = document.getElementById('winner-info-display');

            if (state.status === 'spinning') {
                if (spinnerBox) {
                    spinnerBox.innerHTML = `
                        <div class="flex items-center justify-center p-4 bg-black/80 border border-yellow-400/30 rounded-xl animate-pulse">
                            <span class="text-xl font-black text-yellow-400">⚡ DRAWING 3 WINNERS RESPECTIVELY... #${state.currentNumber || '---'}</span>
                        </div>
                    `;
                }
                if (winnerInfoBox) winnerInfoBox.innerHTML = `<span class="text-amber-400 animate-pulse font-bold">⚡ SELECTING TOP 3 WINNERS...</span>`;
            } else if (state.status === 'completed' && state.winners) {
                if (spinnerBox) {
                    const medals = ['🥇', '🥈', '🥉'];
                    spinnerBox.innerHTML = state.winners.map((w, idx) => {
                        const sortedNums = [...w.numbers].sort((a, b) => Number(a) - Number(b)).join(', ');
                        const phoneVal = w.phone || w.phoneNumber || w.customerPhone || 'N/A';
                        const nameVal = w.customer || w.customerName || w.name || 'N/A';
                        return `
                            <div class="flex items-center justify-between bg-black/80 border border-yellow-400/20 rounded-xl p-3 shadow-[0_0_10px_rgba(252,211,77,0.15)]">
                                <div class="space-y-0.5">
                                    <span class="text-xs font-black text-yellow-400">${medals[idx]} ${idx + 1}st Place: ${nameVal}</span>
                                    <div class="text-[10px] text-slate-400">📞 ${phoneVal}</div>
                                </div>
                                <span class="px-2 py-1 bg-yellow-400/20 border border-yellow-400/40 rounded-lg text-yellow-300 text-xs font-bold">
                                    #${sortedNums}
                                </span>
                            </div>
                        `;
                    }).join('');
                }
                if (winnerInfoBox) {
                    winnerInfoBox.innerHTML = `🏆 Successfully drew 3 top winners with live link notification dispatched!`;
                }
            }
            // Update button lock state dynamically upon state change
            this.checkScheduleTiming();
        });
    }

    async saveTikTokLive() {
        const urlInput = document.getElementById('tiktok-live-url-input')?.value;
        if (!urlInput) {
            return notify('error', '❌ Please enter a valid TikTok Live URL.');
        }

        try {
            if (db) {
                await db.collection('settings').doc('tiktok_live_stream').set({
                    url: urlInput,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
            notify('success', '📡 TikTok Live link saved successfully!');
        } catch (error) {
            console.error('Error saving TikTok Live:', error);
            notify('error', '❌ Failed to save TikTok Live link.');
        }
    }

    async loadTikTokLive() {
        try {
            if (!db) return;
            const doc = await db.collection('settings').doc('tiktok_live_stream').get();
            if (doc.exists) {
                const data = doc.data();
                const urlInput = document.getElementById('tiktok-live-url-input');
                if (data.url && urlInput) {
                    urlInput.value = data.url;
                }
            }
        } catch (error) {
            console.error('Error loading TikTok Live:', error);
        }
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

    async checkScheduleTiming() {
        const targetDateObj = this.getTargetDateTime();
        const drawBtn = document.getElementById('spin-draw-btn');
        const statusBadge = document.getElementById('draw-countdown-timer');
        const scheduleStatusText = document.getElementById('schedule-status-text');

        if (!drawBtn || !statusBadge) return;

        const now = new Date();
        const dateStr = document.getElementById('draw-target-date')?.value;
        const timeStr = document.getElementById('draw-target-time')?.value;
        const ampmStr = document.getElementById('draw-target-ampm')?.value;

        if (scheduleStatusText) {
            scheduleStatusText.textContent = `Active Schedule Target: ${dateStr || 'None'}, ${timeStr || ''} ${ampmStr || ''}`;
        }

        // Fetch current draw state from Firestore to verify if a draw has already been executed for the current schedule / session
        let isAlreadyCompleted = false;
        try {
            if (db) {
                const stateDoc = await db.collection('settings').doc('live_draw_state').get();
                if (stateDoc.exists && stateDoc.data().status === 'completed') {
                    // Check if the draw was completed for this target schedule or if it needs to remain locked until a new schedule is saved/reached
                    const completedAt = stateDoc.data().updatedAt?.toDate ? stateDoc.data().updatedAt.toDate() : null;
                    const targetTimestamp = targetDateObj ? targetDateObj.getTime() : 0;
                    
                    // If completed after or during the current target window, keep it locked until next schedule update
                    if (targetTimestamp && completedAt && completedAt >= targetTimestamp - 86400000) {
                        isAlreadyCompleted = true;
                    } else if (!targetTimestamp && stateDoc.data().status === 'completed') {
                        // If no target time is set, keep locked once spun until new schedule is saved
                        isAlreadyCompleted = true;
                    }
                }
            }
        } catch (e) {
            console.error('Error checking completion state:', e);
        }

        if (isAlreadyCompleted) {
            drawBtn.disabled = true;
            drawBtn.className = "w-full py-3.5 bg-slate-800 text-slate-500 font-black rounded-xl text-sm cursor-not-allowed transition-all shadow-none";
            drawBtn.innerHTML = "🔒 DRAW COMPLETED (SET NEW SCHEDULE TO UNLOCK)";
            statusBadge.className = "text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20";
            statusBadge.innerHTML = '⏳ WAITING FOR NEXT SCHEDULE';
            return;
        }

        if (!targetDateObj) {
            // No schedule target set, enable button immediately if not completed
            drawBtn.disabled = false;
            drawBtn.className = "w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black rounded-xl text-sm shadow-lg hover:opacity-95 transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer";
            drawBtn.innerHTML = "🎲 SPIN & DRAW 3 WINNERS NOW";

            statusBadge.className = "text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30";
            statusBadge.innerHTML = '🟢 READY TO DRAW';
            return;
        }

        if (now >= targetDateObj) {
            drawBtn.disabled = false;
            drawBtn.className = "w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black rounded-xl text-sm shadow-lg hover:opacity-95 transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer";
            drawBtn.innerHTML = "🎲 SPIN & DRAW 3 WINNERS NOW";

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
                // Reset live_draw_state status back to pending/ready when a new schedule is saved so the button unlocks when time arrives
                await db.collection('settings').doc('live_draw_state').set({
                    status: 'pending',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                await db.collection('settings').doc('main_draw_schedule').set({
                    targetDate: date,
                    targetTime: time,
                    ampm: ampm,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
            
            this.checkScheduleTiming();
            notify('success', '💾 Schedule saved and draw unlocked for new target!');
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
                container.innerHTML = `<p class="text-xs text-slate-500 italic text-center py-2">No past winners recorded yet.</p>`;
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
                    const scopeText = draw.scope || 'Global Main Admin';
                    
                    if (draw.winners && Array.isArray(draw.winners)) {
                        const medals = ['🥇', '🥈', '🥉'];
                        draw.winners.forEach((w, idx) => {
                            const sortedNums = [...w.numbers].sort((a, b) => Number(a) - Number(b)).join(', ');
                            const phoneVal = w.phone || w.phoneNumber || w.customerPhone || 'N/A';
                            const nameVal = w.customer || w.customerName || w.name || 'N/A';
                            html += `
                                <div class="bg-black/60 border border-yellow-400/20 rounded-xl p-3 flex items-center justify-between gap-2">
                                    <div class="space-y-0.5">
                                        <div class="text-sm font-black text-yellow-400">
                                            ${medals[idx]} #${sortedNums} — ${nameVal} (${idx + 1}st/nd/rd Place)
                                        </div>
                                        <div class="text-[11px] text-slate-400 flex items-center gap-2">
                                            <span>📞 ${phoneVal}</span>
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
                        });
                    }
                }
            });

            if (count === 0) {
                container.innerHTML = `<p class="text-xs text-slate-500 italic text-center py-2">No winners found within the last 7 days.</p>`;
            } else {
                container.innerHTML = html;
            }
        } catch (error) {
            console.error('Error loading past winners:', error);
            container.innerHTML = `<p class="text-xs text-red-400 italic text-center py-2">Error loading draw history.</p>`;
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

            let allTickets = [];
            snapshot.forEach(doc => {
                const ticket = doc.data();
                if (ticket.numbers && Array.isArray(ticket.numbers) && ticket.numbers.length > 0) {
                    allTickets.push({ 
                        ticketId: doc.id, 
                        numbers: ticket.numbers, 
                        customer: ticket.customerName || ticket.name || ticket.username || 'Customer', 
                        email: ticket.customerEmail || ticket.email || 'N/A',
                        phone: ticket.phone || ticket.customerPhone || ticket.phoneNumber || ticket.mobile || 'N/A'
                    });
                }
            });

            if (allTickets.length < 3) {
                return notify('error', '❌ At least 3 tickets are required to draw 3 distinct winners.');
            }

            const liveDoc = await db.collection('settings').doc('tiktok_live_stream').get();
            const tiktokLiveUrl = liveDoc.exists ? liveDoc.data().url || '#' : '#';

            const spinnerBox = document.getElementById('lottery-spinner-box');
            const winnerInfoBox = document.getElementById('winner-info-display');
            if (winnerInfoBox) winnerInfoBox.textContent = '';

            let spinCount = 0;
            const maxSpins = 30;
            const spinInterval = setInterval(async () => {
                const randomNum = Math.floor(Math.random() * 300) + 1;
                if (spinnerBox) {
                    spinnerBox.innerHTML = `
                        <div class="flex items-center justify-center p-4 bg-black/85 border border-yellow-400/40 rounded-xl animate-pulse">
                            <span class="text-xl font-black text-yellow-400">⚡ DRAWING 3 WINNERS... #${randomNum}</span>
                        </div>
                    `;
                }
                
                await db.collection('settings').doc('live_draw_state').set({
                    status: 'spinning',
                    currentNumber: randomNum,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                spinCount++;

                if (spinCount >= maxSpins) {
                    clearInterval(spinInterval);

                    // Randomly select 3 unique winners
                    let shuffled = [...allTickets].sort(() => 0.5 - Math.random());
                    let topThree = shuffled.slice(0, 3).map(t => ({
                        ticketId: t.ticketId,
                        numbers: t.numbers,
                        customer: t.customer,
                        email: t.email,
                        phone: t.phone
                    }));

                    const medals = ['🥇', '🥈', '🥉'];
                    if (spinnerBox) {
                        spinnerBox.innerHTML = topThree.map((w, idx) => {
                            const sortedNums = [...w.numbers].sort((a, b) => Number(a) - Number(b)).join(', ');
                            const phoneVal = w.phone || 'N/A';
                            const nameVal = w.customer || 'Customer';
                            return `
                                <div class="flex items-center justify-between bg-black/80 border border-yellow-400/30 rounded-xl p-3 shadow-[0_0_10px_rgba(252,211,77,0.15)]">
                                    <div class="space-y-0.5">
                                        <span class="text-xs font-black text-yellow-400">${medals[idx]} ${idx + 1}st Place: ${nameVal}</span>
                                        <div class="text-[10px] text-slate-400">📞 ${phoneVal}</div>
                                    </div>
                                    <span class="px-2 py-1 bg-yellow-400/20 border border-yellow-400/40 rounded-lg text-yellow-300 text-xs font-bold">
                                        #${sortedNums}
                                    </span>
                                </div>
                            `;
                        }).join('');
                    }

                    if (winnerInfoBox) {
                        winnerInfoBox.innerHTML = `🏆 Top 3 Winners Drawn Successfully!`;
                    }

                    await db.collection('lottery_draws').add({
                        winners: topThree,
                        drawnBy: currentUser?.email || 'Main Admin',
                        scope: 'Global Main Admin',
                        drawnAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    await db.collection('settings').doc('live_draw_state').set({
                        status: 'completed',
                        winners: topThree,
                        tiktokLiveUrl: tiktokLiveUrl,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });

                    // Dispatch notification to customers containing the live stream link and winners list
                    await db.collection('notifications').add({
                        title: '🔴 3 WINNERS DRAWN & LIVE STREAM LINK!',
                        message: `The live draw has concluded! Top 3 Winners: 1) ${topThree[0].customer}, 2) ${topThree[1].customer}, 3) ${topThree[2].customer}. Click here to watch the TikTok Live stream!`,
                        link: tiktokLiveUrl,
                        type: 'live_draw',
                        target: 'all_customers',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    this.loadPastWinners();
                    this.checkScheduleTiming(); // immediately lock button after draw
                    notify('success', `🎉 3 WINNERS SUCCESSFULLY DRAWN & NOTIFICATIONS SENT!`);
                }
            }, 60);

        } catch (error) {
            console.error('Draw error:', error);
            notify('error', `❌ Draw Error: ${error.message}`);
        }
    }
}
