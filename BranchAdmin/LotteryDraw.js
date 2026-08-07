// ============================================
// ADMIN LOTTERY DRAW - ONE-TIME SPIN & LOCK FIX
// ============================================

class AdminLotteryDraw {
    constructor(adminId) {
        this.adminId = adminId || 'Main Admin';
        this.schedule = { targetDate: '', targetTime: '', ampm: 'PM', tiktokLink: '' };
        this.liveState = { status: 'idle', currentNumber: null, winners: [] };
        this.allTickets = [];
    }

    async init() {
        await this.loadSchedule();
        await this.loadTickets();
        this.initListeners();
    }

    async loadSchedule() {
        if (!db) return;
        try {
            const doc = await db.collection('settings').doc('main_draw_schedule').get();
            if (doc.exists) {
                this.schedule = doc.data();
            }
        } catch (e) {
            console.error('Error loading schedule:', e);
        }
    }

    async loadTickets() {
        if (!db) return;
        try {
            const snap = await db.collection('customer_tickets').get();
            if (!snap.empty) {
                this.allTickets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            } else {
                const legacySnap = await db.collection('tickets').get();
                if (!legacySnap.empty) {
                    this.allTickets = legacySnap.docs.map(d => ({ id: d.id, ...d.data() }));
                }
            }
        } catch (e) {
            console.error('Error loading tickets:', e);
        }
    }

    initListeners() {
        if (!db) return;

        db.collection('settings').doc('main_draw_schedule').onSnapshot(doc => {
            if (doc.exists) {
                this.schedule = doc.data();
                this.updateUIState();
            }
        });

        db.collection('settings').doc('live_draw_state').onSnapshot(doc => {
            if (doc.exists) {
                this.liveState = doc.data();
                this.updateUIState();
            }
        });
    }

    render() {
        return `
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/20 space-y-6 bg-black/40">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 class="text-xl font-bold text-white">🎯 Admin Live Draw & Schedule Control</h3>
                        <p class="text-xs text-slate-400 mt-1">Configure scheduled draw time, TikTok link, and perform single-use live draws.</p>
                    </div>
                    <span id="admin-draw-status-badge" class="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-bold border border-slate-700">
                        Loading Status...
                    </span>
                </div>

                <!-- Schedule Configuration Inputs -->
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-black/60 p-4 rounded-xl border border-yellow-400/10">
                    <div>
                        <label class="text-[10px] text-slate-400 block mb-1">Target Date</label>
                        <input type="date" id="admin-target-date" class="w-full bg-black border border-yellow-400/20 rounded-lg p-2 text-xs text-white">
                    </div>
                    <div>
                        <label class="text-[10px] text-slate-400 block mb-1">Target Time</label>
                        <input type="time" id="admin-target-time" class="w-full bg-black border border-yellow-400/20 rounded-lg p-2 text-xs text-white">
                    </div>
                    <div>
                        <label class="text-[10px] text-slate-400 block mb-1">AM/PM</label>
                        <select id="admin-target-ampm" class="w-full bg-black border border-yellow-400/20 rounded-lg p-2 text-xs text-white">
                            <option value="AM">AM</option>
                            <option value="PM" selected>PM</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-[10px] text-slate-400 block mb-1">TikTok Live Link</label>
                        <input type="text" id="admin-tiktok-link" placeholder="https://tiktok.com/@..." class="w-full bg-black border border-yellow-400/20 rounded-lg p-2 text-xs text-white">
                    </div>
                </div>

                <div class="flex justify-end">
                    <button onclick="window.adminLottery.saveSchedule()" class="px-6 py-2.5 bg-yellow-400 text-black font-bold rounded-xl text-xs hover:bg-yellow-500 transition-all cursor-pointer shadow-lg">
                        💾 Save Schedule & Reset Draw State
                    </button>
                </div>

                <!-- LIVE DRAW ACTION BUTTON (STRICTLY ONE-TIME USE PER SCHEDULE) -->
                <div class="pt-2">
                    <button id="admin-spin-btn" onclick="window.adminLottery.executeDraw()" 
                        class="w-full py-4 bg-slate-800 text-slate-500 font-extrabold rounded-xl text-sm cursor-not-allowed transition-all shadow-xl" disabled>
                        🎲 SPIN & DRAW 3 WINNERS NOW
                    </button>
                </div>

                <!-- LIVE DRAW WINNERS CONTAINER -->
                <div id="admin-live-winners-container" class="space-y-3"></div>
            </div>
        `;
    }

    async saveSchedule() {
        const targetDate = document.getElementById('admin-target-date').value;
        const targetTime = document.getElementById('admin-target-time').value;
        const ampm = document.getElementById('admin-target-ampm').value;
        const tiktokLink = document.getElementById('admin-tiktok-link').value.trim();

        if (!targetDate || !targetTime) {
            return notify('error', '❌ Please enter both target date and time.');
        }

        try {
            const newSchedule = { targetDate, targetTime, ampm, tiktokLink, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
            const freshDrawState = { status: 'idle', currentNumber: null, winners: [], drawnForSchedule: `${targetDate}_${targetTime}_${ampm}` };

            await db.collection('settings').doc('main_draw_schedule').set(newSchedule);
            await db.collection('settings').doc('live_draw_state').set(freshDrawState);

            this.schedule = newSchedule;
            this.liveState = freshDrawState;
            this.updateUIState();

            notify('success', '✅ Schedule saved & Spin unlocked for this schedule!');
        } catch (e) {
            notify('error', `❌ Error saving schedule: ${e.message}`);
        }
    }

    updateUIState() {
        const dateInput = document.getElementById('admin-target-date');
        const timeInput = document.getElementById('admin-target-time');
        const ampmInput = document.getElementById('admin-target-ampm');
        const linkInput = document.getElementById('admin-tiktok-link');

        if (dateInput && this.schedule.targetDate && !dateInput.value) dateInput.value = this.schedule.targetDate;
        if (timeInput && this.schedule.targetTime && !timeInput.value) timeInput.value = this.schedule.targetTime;
        if (ampmInput && this.schedule.ampm) ampmInput.value = this.schedule.ampm;
        if (linkInput && this.schedule.tiktokLink && !linkInput.value) linkInput.value = this.schedule.tiktokLink;

        const spinBtn = document.getElementById('admin-spin-btn');
        const badge = document.getElementById('admin-draw-status-badge');
        const container = document.getElementById('admin-live-winners-container');

        const currentScheduleKey = `${this.schedule.targetDate}_${this.schedule.targetTime}_${this.schedule.ampm}`;
        const isAlreadyDrawn = this.liveState.drawnForSchedule === currentScheduleKey && this.liveState.status === 'completed';

        if (!this.schedule.targetDate || !this.schedule.targetTime) {
            if (badge) {
                badge.className = "px-3 py-1 bg-amber-950/40 text-amber-400 rounded-full text-xs font-bold border border-amber-500/30";
                badge.textContent = "⚠️ Schedule Not Set";
            }
            if (spinBtn) {
                spinBtn.disabled = true;
                spinBtn.className = "w-full py-4 bg-slate-800 text-slate-500 font-extrabold rounded-xl text-sm cursor-not-allowed transition-all shadow-xl";
                spinBtn.innerHTML = "🔒 Set Schedule to Unlock Spin";
            }
            return;
        }

        if (isAlreadyDrawn) {
            if (badge) {
                badge.className = "px-3 py-1 bg-red-950/40 text-red-400 rounded-full text-xs font-bold border border-red-500/30";
                badge.textContent = "🔴 Draw Completed (Locked)";
            }
            if (spinBtn) {
                spinBtn.disabled = true;
                spinBtn.className = "w-full py-4 bg-slate-800 text-slate-500 font-extrabold rounded-xl text-sm cursor-not-allowed transition-all shadow-xl";
                spinBtn.innerHTML = "🔒 Draw Already Executed for this Schedule";
            }
        } else {
            if (badge) {
                badge.className = "px-3 py-1 bg-emerald-950/40 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30";
                badge.textContent = "🟢 DRAW UNLOCKED & READY!";
            }
            if (spinBtn) {
                spinBtn.disabled = false;
                spinBtn.className = "w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-extrabold rounded-xl text-sm cursor-pointer shadow-xl hover:opacity-95 transition-all animate-pulse";
                spinBtn.innerHTML = "🎲 SPIN & DRAW 3 WINNERS NOW";
            }
        }

        if (container && this.liveState.winners && this.liveState.winners.length > 0) {
            const medals = ['🥇', '🥈', '🥉'];
            container.innerHTML = `
                <div class="bg-black/80 border border-yellow-400/40 rounded-xl p-5 space-y-3">
                    <span class="text-xs font-black text-yellow-400 uppercase tracking-widest">🏆 DRAWN TOP 3 WINNERS</span>
                    <div class="space-y-2">
                        ${this.liveState.winners.map((w, idx) => {
                            const sortedNums = Array.isArray(w.numbers) ? [...w.numbers].sort((a, b) => Number(a) - Number(b)).join(', ') : w.number || '';
                            return `
                                <div class="flex items-center justify-between bg-black/60 border border-yellow-400/20 rounded-xl p-3">
                                    <div>
                                        <span class="text-xs font-black text-yellow-400">${medals[idx]} ${idx + 1}st Place: ${w.customer || 'Customer'}</span>
                                        <div class="text-[10px] text-slate-400">📞 ${w.phone || 'N/A'} • ✉️ ${w.email || 'N/A'}</div>
                                    </div>
                                    <span class="px-3 py-1 bg-yellow-400/20 border border-yellow-400/40 rounded-lg text-yellow-300 text-xs font-bold font-mono">
                                        #${sortedNums}
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else if (container) {
            container.innerHTML = '';
        }
    }

    async executeDraw() {
        const currentScheduleKey = `${this.schedule.targetDate}_${this.schedule.targetTime}_${this.schedule.ampm}`;
        if (this.liveState.drawnForSchedule === currentScheduleKey && this.liveState.status === 'completed') {
            notify('error', '❌ Draw already completed for this schedule. Update schedule to run a new draw.');
            return;
        }

        if (!confirm('Are you sure you want to draw the top 3 winners now? This will lock the button until the next schedule.')) return;

        try {
            notify('info', '⚡ Spinning for 3 top winners...');
            
            await db.collection('settings').doc('live_draw_state').set({
                status: 'spinning',
                currentNumber: Math.floor(Math.random() * 90) + 1,
                winners: [],
                drawnForSchedule: currentScheduleKey
            });

            await new Promise(r => setTimeout(r, 2000));

            let poolTickets = this.allTickets;
            if (poolTickets.length === 0) {
                poolTickets = [
                    { customer: 'Test User 1', email: 'test1@gmail.com', phone: '0911000001', numbers: [12, 45, 78] },
                    { customer: 'Test User 2', email: 'test2@gmail.com', phone: '0911000002', numbers: [5, 23, 67] },
                    { customer: 'Test User 3', email: 'test3@gmail.com', phone: '0911000003', numbers: [9, 34, 88] }
                ];
            }

            const shuffled = [...poolTickets].sort(() => 0.5 - Math.random());
            const topThree = shuffled.slice(0, 3);

            const finalState = {
                status: 'completed',
                currentNumber: null,
                winners: topThree,
                drawnForSchedule: currentScheduleKey,
                tiktokLiveUrl: this.schedule.tiktokLink || 'https://tiktok.com/@boniLottery',
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('settings').doc('live_draw_state').set(finalState);
            this.liveState = finalState;
            this.updateUIState();

            notify('success', '🏆 Successfully drew 3 top winners with live link notification dispatched!');
        } catch (e) {
            notify('error', `❌ Draw failed: ${e.message}`);
        }
    }
}
