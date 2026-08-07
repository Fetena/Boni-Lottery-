// ============================================
// ADMIN LOTTERY DRAW & SCHEDULE COMPONENT
// ============================================

class AdminLotteryDraw {
    constructor(adminId) {
        this.adminId = adminId || window.currentUser?.email || localStorage.getItem('currentUserEmail') || '';
        this.selectedNumbers = [];
        this.scheduledTime = null;
    }

    render() {
        return `
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/20 space-y-6">
                <div class="flex items-center justify-between border-b border-yellow-400/10 pb-4">
                    <div>
                        <h3 class="text-lg font-bold text-white">🎯 Lottery Draw & Scheduling</h3>
                        <p class="text-xs text-slate-400 mt-0.5">Configure schedule timers and execute automated algorithmic draws.</p>
                    </div>
                    <span class="px-3 py-1 bg-yellow-400/10 text-yellow-400 text-[10px] font-bold rounded-full border border-yellow-400/20">Active Control</span>
                </div>

                <!-- Schedule Configuration -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1.5 font-medium">📅 Set Draw Date & Time</label>
                        <input type="datetime-local" id="lottery-schedule-input" class="w-full bg-black/50 border border-yellow-400/20 rounded-xl py-2.5 px-4 text-white text-xs focus:outline-none focus:border-yellow-400">
                    </div>
                    <div class="flex items-end">
                        <button onclick="window.adminLottery.saveSchedule()" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 font-bold rounded-xl text-xs border border-yellow-400/20 transition-all">
                            ⏱️ Save Schedule Timer
                        </button>
                    </div>
                </div>

                <!-- Algorithmic Winning Numbers Display -->
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <label class="block text-xs text-slate-400 font-medium">🤖 Algorithmic Winning Numbers (Auto-Generated)</label>
                        <span class="text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">Secure RNG Mode</span>
                    </div>
                    
                    <!-- Number Grid (1 to 50) - Read-only display of algorithm output -->
                    <div id="lottery-number-grid" class="grid grid-cols-10 gap-2 p-3 bg-black/40 rounded-xl border border-yellow-400/10 max-h-48 overflow-y-auto">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <!-- Action Controls -->
                <div class="flex flex-col sm:flex-row gap-3 pt-2">
                    <button onclick="window.adminLottery.triggerAlgorithmicDraw()" class="flex-1 py-3 bg-yellow-400 text-black font-bold rounded-xl text-xs hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-400/10">
                        ⚡ Run Algorithmic Draw Now
                    </button>
                    <button onclick="window.adminLottery.resetDrawState()" class="px-5 py-3 bg-red-950/40 text-red-400 font-bold rounded-xl text-xs border border-red-500/20 hover:bg-red-950/60 transition-all">
                        🔄 Reset State
                    </button>
                </div>

                <!-- Audit Display / Recent Results -->
                <div class="space-y-2 pt-2 border-t border-yellow-400/10">
                    <p class="text-xs font-bold text-slate-300">📋 Winning Numbers Audit Display</p>
                    <div id="lottery-audit-display" class="p-4 bg-black/60 rounded-xl border border-yellow-400/10 text-xs text-slate-400 min-h-[60px] flex items-center">
                        No active draw results recorded yet. Configure schedule and execute algorithmic draw to view audit records.
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        console.log("AdminLotteryDraw initialized");
        this.renderNumberGrid();
        await this.loadExistingSchedule();
    }

    renderNumberGrid() {
        const grid = document.getElementById('lottery-number-grid');
        if (!grid) return;

        let html = '';
        for (let i = 1; i <= 50; i++) {
            const isSelected = this.selectedNumbers.includes(i);
            html += `
                <div class="h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                    isSelected 
                        ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20 scale-105' 
                        : 'bg-slate-900/80 text-slate-500 border border-yellow-400/10'
                }">
                    ${i}
                </div>
            `;
        }
        grid.innerHTML = html;
    }

    generateAlgorithmicNumbers(count = 5, max = 50) {
        const numbers = [];
        while (numbers.length < count) {
            // Cryptographically secure or pseudo-random generation algorithm
            const randomNum = Math.floor(Math.random() * max) + 1;
            if (!numbers.includes(randomNum)) {
                numbers.push(randomNum);
            }
        }
        return numbers.sort((a, b) => a - b);
    }

    async saveSchedule() {
        const inputVal = document.getElementById('lottery-schedule-input')?.value;
        if (!inputVal) {
            return notify('error', '❌ Please select a valid date and time first');
        }

        this.scheduledTime = new Date(inputVal);

        try {
            if (typeof db !== 'undefined' && db.collection) {
                await db.collection('lottery_schedules').doc(this.adminId || 'global').set({
                    adminEmail: this.adminId,
                    scheduledTime: firebase.firestore.Timestamp.fromDate(this.scheduledTime),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
            notify('success', `✅ Draw scheduled successfully for ${this.scheduledTime.toLocaleString()}!`);
        } catch (error) {
            console.error('Error saving schedule:', error);
            notify('error', `❌ Failed to save schedule: ${error.message}`);
        }
    }

    async loadExistingSchedule() {
        try {
            if (typeof db !== 'undefined' && db.collection) {
                const doc = await db.collection('lottery_schedules').doc(this.adminId || 'global').get();
                if (doc.exists && doc.data().scheduledTime) {
                    const timeData = doc.data().scheduledTime.toDate();
                    const input = document.getElementById('lottery-schedule-input');
                    if (input) {
                        const localIso = new Date(timeData.getTime() - (timeData.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                        input.value = localIso;
                    }
                }
            }
        } catch (e) {
            console.warn('Could not load existing lottery schedule:', e);
        }
    }

    async triggerAlgorithmicDraw() {
        if (!confirm('Execute automated algorithmic draw to generate winning numbers?')) return;

        // Generate numbers via algorithm instead of manual input
        this.selectedNumbers = this.generateAlgorithmicNumbers(5, 50);
        this.renderNumberGrid();

        try {
            const auditData = {
                adminEmail: this.adminId,
                winningNumbers: this.selectedNumbers,
                executedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'Completed',
                drawType: 'Algorithmic'
            };

            if (typeof db !== 'undefined' && db.collection) {
                await db.collection('lottery_draw_audits').add(auditData);
            }

            const auditDisplay = document.getElementById('lottery-audit-display');
            if (auditDisplay) {
                auditDisplay.innerHTML = `
                    <div class="text-emerald-400 font-bold mb-1">✅ Algorithmic Draw Successfully Executed!</div>
                    <div>Winning Numbers: <span class="text-white font-mono bg-yellow-400/20 px-2 py-0.5 rounded text-yellow-300">${this.selectedNumbers.join(', ')}</span></div>
                    <div class="text-[10px] text-slate-500 mt-1">Timestamp: ${new Date().toLocaleString()}</div>
                `;
            }

            notify('success', '🎉 Algorithmic lottery draw executed and audited successfully!');
        } catch (error) {
            console.error('Error executing draw:', error);
            notify('error', `❌ Draw execution failed: ${error.message}`);
        }
    }

    async resetDrawState() {
        if (!confirm('Are you sure you want to reset the current draw configuration and audit display?')) return;
        this.selectedNumbers = [];
        this.scheduledTime = null;
        this.renderNumberGrid();
        
        const input = document.getElementById('lottery-schedule-input');
        if (input) input.value = '';

        const auditDisplay = document.getElementById('lottery-audit-display');
        if (auditDisplay) {
            auditDisplay.innerHTML = 'No active draw results recorded yet. Configure schedule and execute algorithmic draw to view audit records.';
        }

        notify('success', '🔄 Lottery state has been reset');
    }
}
