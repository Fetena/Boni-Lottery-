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
                        <p class="text-xs text-slate-400 mt-0.5">Configure winning numbers, set schedule timers, and run live draws.</p>
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

                <!-- Winning Numbers Selection -->
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <label class="block text-xs text-slate-400 font-medium">🔢 Select Winning Numbers (Click to toggle)</label>
                        <button onclick="window.adminLottery.clearSelection()" class="text-[10px] text-red-400 hover:underline">Clear Selection</button>
                    </div>
                    
                    <!-- Number Grid (1 to 50) -->
                    <div id="lottery-number-grid" class="grid grid-cols-10 gap-2 p-3 bg-black/40 rounded-xl border border-yellow-400/10 max-h-48 overflow-y-auto">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <!-- Action Controls -->
                <div class="flex flex-col sm:flex-row gap-3 pt-2">
                    <button onclick="window.adminLottery.triggerManualDraw()" class="flex-1 py-3 bg-yellow-400 text-black font-bold rounded-xl text-xs hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-400/10">
                        ⚡ Execute Draw Now
                    </button>
                    <button onclick="window.adminLottery.resetDrawState()" class="px-5 py-3 bg-red-950/40 text-red-400 font-bold rounded-xl text-xs border border-red-500/20 hover:bg-red-950/60 transition-all">
                        🔄 Reset State
                    </button>
                </div>

                <!-- Audit Display / Recent Results -->
                <div class="space-y-2 pt-2 border-t border-yellow-400/10">
                    <p class="text-xs font-bold text-slate-300">📋 Winning Numbers Audit Display</p>
                    <div id="lottery-audit-display" class="p-4 bg-black/60 rounded-xl border border-yellow-400/10 text-xs text-slate-400 min-h-[60px] flex items-center">
                        No active draw results recorded yet. Configure and execute a draw to view audit records.
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
                <button type="button" onclick="window.adminLottery.toggleNumber(${i})" 
                    id="lottery-num-${i}" 
                    class="h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                        isSelected 
                            ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20 scale-105' 
                            : 'bg-slate-900/80 text-slate-300 border border-yellow-400/10 hover:border-yellow-400/40'
                    }">
                    ${i}
                </button>
            `;
        }
        grid.innerHTML = html;
    }

    toggleNumber(num) {
        const index = this.selectedNumbers.indexOf(num);
        if (index > -1) {
            this.selectedNumbers.splice(index, 1);
        } else {
            if (this.selectedNumbers.length >= 5) {
                return notify('error', '⚠️ You can select a maximum of 5 winning numbers');
            }
            this.selectedNumbers.push(num);
        }
        this.selectedNumbers.sort((a, b) => a - b);
        this.renderNumberGrid();
    }

    clearSelection() {
        this.selectedNumbers = [];
        this.renderNumberGrid();
        notify('success', 'Selection cleared');
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
                        // Format to yyyy-MM-ddTHH:mm for datetime-local input
                        const localIso = new Date(timeData.getTime() - (timeData.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                        input.value = localIso;
                    }
                }
            }
        } catch (e) {
            console.warn('Could not load existing lottery schedule:', e);
        }
    }

    async triggerManualDraw() {
        if (this.selectedNumbers.length === 0) {
            return notify('error', '❌ Please select at least one winning number before executing the draw');
        }

        if (!confirm(`Execute manual draw with numbers: [${this.selectedNumbers.join(', ')}]?`)) return;

        try {
            const auditData = {
                adminEmail: this.adminId,
                winningNumbers: this.selectedNumbers,
                executedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'Completed'
            };

            if (typeof db !== 'undefined' && db.collection) {
                await db.collection('lottery_draw_audits').add(auditData);
            }

            const auditDisplay = document.getElementById('lottery-audit-display');
            if (auditDisplay) {
                auditDisplay.innerHTML = `
                    <div class="text-emerald-400 font-bold mb-1">✅ Draw Successfully Executed!</div>
                    <div>Winning Numbers: <span class="text-white font-mono bg-yellow-400/20 px-2 py-0.5 rounded text-yellow-300">${this.selectedNumbers.join(', ')}</span></div>
                    <div class="text-[10px] text-slate-500 mt-1">Timestamp: ${new Date().toLocaleString()}</div>
                `;
            }

            notify('success', '🎉 Lottery draw executed and audited successfully!');
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
            auditDisplay.innerHTML = 'No active draw results recorded yet. Configure and execute a draw to view audit records.';
        }

        notify('success', '🔄 Lottery state has been reset');
    }
}
