// ============================================
// CUSTOMER DRAWINGS (CHILD COMPONENT - WITH LIVE COUNTDOWN)
// Parent: CustomerDashboard
// View drawings managed by the customer's registered admin
// ============================================

class CustomerDrawings {
    constructor(custId) {
        this.custId = custId;
        this.customerAdmin = null;
        this.draws = [];
        this.targetDateObj = null;
        this.countdownTimer = null;
        this.autoCheckInterval = null;
        this.init();
    }

    async init() {
        await this.loadCustomerAndDrawings();
        this.initCustomerScheduleListener();
        this.initLiveDrawAutoListener(); // 👈 Automated TikTok notification listener with 30-min window & click-to-dismiss
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
                        time: data.time || (data.targetTime ? `${data.targetTime} ${data.ampm || data.amPm || ''}` : '20:00'),
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

    // Real-time listener for the admin's saved schedule updates & countdown calculation
    async initCustomerScheduleListener() {
        if (!db) return;

        db.collection('settings').doc('main_draw_schedule').onSnapshot(doc => {
            const scheduleBanner = document.getElementById('customer-active-draw-schedule');
            
            if (doc.exists) {
                const data = doc.data();
                const targetDate = data.targetDate || '';
                const targetTime = data.targetTime || '';
                const ampm = data.ampm || 'PM';

                if (scheduleBanner) {
                    scheduleBanner.innerHTML = `🎯 Next Scheduled Draw: <span class="text-yellow-400 font-bold">${targetDate} at ${targetTime} ${ampm}</span>`;
                }

                const nextDrawTitleEl = document.getElementById('next-draw-datetime-display');
                if (nextDrawTitleEl) {
                    nextDrawTitleEl.textContent = `${targetDate} • ${targetTime} ${ampm}`;
                }

                // Parse exact target date for live countdown calculation
                if (targetDate && targetTime) {
                    const parts = targetDate.split('-').map(Number);
                    if (parts.length === 3) {
                        const [year, month, day] = parts;
                        let [hours, minutes] = targetTime.split(':').map(Number);

                        if (ampm === 'PM' && hours < 12) hours += 12;
                        if (ampm === 'AM' && hours === 12) hours = 0;

                        this.targetDateObj = new Date(year, month - 1, day, hours, minutes, 0, 0);
                        
                        // Start interval ticker
                        if (this.countdownTimer) clearInterval(this.countdownTimer);
                        this.updateCountdownDisplay();
                        this.countdownTimer = setInterval(() => this.updateCountdownDisplay(), 1000);
                    }
                }
            } else {
                if (scheduleBanner) {
                    scheduleBanner.innerHTML = `🎯 Next Scheduled Draw: <span class="text-slate-400 italic">Not scheduled yet</span>`;
                }
            }
        });
    }

    // Automatic Client-Side Live Notification Trigger (Stays for 30 min, disappears on click)
    initLiveDrawAutoListener() {
        if (!db) return;

        db.collection('settings').doc('main_draw_schedule').onSnapshot(doc => {
            if (!doc.exists) return;
            const data = doc.data();
            const targetDate = data.targetDate || '';
            const targetTime = data.targetTime || '';
            const ampm = data.ampm || 'PM';
            const tiktokLink = data.tiktokLink || 'https://tiktok.com/@boniLottery';

            if (!targetDate || !targetTime) return;

            const parts = targetDate.split('-').map(Number);
            if (parts.length !== 3) return;
            const [year, month, day] = parts;
            let [hours, minutes] = targetTime.split(':').map(Number);

            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;

            const drawTimeObj = new Date(year, month - 1, day, hours, minutes, 0, 0);
            const drawTimeMs = drawTimeObj.getTime();

            if (this.autoCheckInterval) clearInterval(this.autoCheckInterval);
            
            this.autoCheckInterval = setInterval(() => {
                const now = new Date().getTime();
                const timeDiff = now - drawTimeMs;
                const windowKey = `notified_draw_${year}-${month}-${day}_${hours}-${minutes}`;
                const thirtyMinutesMs = 30 * 60 * 1000; // 30 minutes duration

                // Triggers automatically within a 30-minute window starting from target draw time
                if (timeDiff >= 0 && timeDiff <= thirtyMinutesMs && !localStorage.getItem(windowKey)) {
                    localStorage.setItem(windowKey, 'true');
                    this.showLiveDrawModal(
                        '🔴 Live Drawing is Happening Now!',
                        'The scheduled draw has started. Join the TikTok stream to see if your numbers won!',
                        tiktokLink
                    );
                }
            }, 1000);
        });
    }

    showLiveDrawModal(title, message, link) {
        if (document.getElementById('live-draw-modal')) return;

        const modalHtml = `
            <div id="live-draw-modal" class="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
                <div class="glass-panel rounded-2xl max-w-md w-full p-6 border border-yellow-400/40 space-y-4 bg-black text-center relative shadow-2xl">
                    <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-bounce border border-yellow-300">
                        🔴 LIVE NOW
                    </div>
                    <h3 class="text-xl font-bold text-yellow-400 mt-2">${title}</h3>
                    <p class="text-xs text-slate-300 leading-relaxed">${message}</p>
                    <div class="pt-2 space-y-2">
                        <a href="${link}" target="_blank" onclick="document.getElementById('live-draw-modal')?.remove()" class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-extrabold rounded-xl block text-xs shadow-lg hover:opacity-90 transition-all">
                            🚀 Join TikTok Live Stream
                        </a>
                        <button onclick="document.getElementById('live-draw-modal')?.remove()" class="w-full py-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-bold border border-slate-800">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    updateCountdownDisplay() {
        const timerBadge = document.getElementById('customer-live-countdown-badge');
        const watchBtn = document.getElementById('customer-tiktok-btn');
        if (!timerBadge || !this.targetDateObj) return;

        const now = new Date();
        const diffMs = this.targetDateObj - now;

        if (diffMs <= 0) {
            timerBadge.className = "text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30 inline-block my-1";
            timerBadge.innerHTML = '🟢 DRAW LIVE / UNLOCKED NOW!';
            
            if (watchBtn) {
                watchBtn.disabled = false;
                watchBtn.className = "px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black rounded-xl shadow-lg cursor-pointer hover:opacity-95 transition-all";
                watchBtn.innerHTML = "📱 Watch Live on TikTok (Active)";
            }
        } else {
            const diffMins = Math.floor(diffMs / 60000);
            const days = Math.floor(diffMins / (60 * 24));
            const hrs = Math.floor((diffMins % (60 * 24)) / 60);
            const mins = diffMins % 60;
            const secs = Math.floor((diffMs % 60000) / 1000);

            let timeStr = '';
            if (days > 0) timeStr += `${days}d `;
            timeStr += `${hrs}h ${mins}m ${secs}s`;

            timerBadge.className = "text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 inline-block my-1";
            timerBadge.innerHTML = `⏳ COUNTDOWN: ${timeStr}`;

            if (watchBtn) {
                watchBtn.disabled = true;
                watchBtn.className = "px-8 py-3 bg-slate-800 text-slate-500 font-bold rounded-xl cursor-not-allowed transition-all";
                watchBtn.innerHTML = `🔒 TikTok Live Opens in ${timeStr}`;
            }
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

                <!-- LIVE SCHEDULE SYNC BANNER -->
                <div id="customer-active-draw-schedule" class="bg-black/50 border border-yellow-400/30 rounded-xl px-4 py-2.5 text-xs text-slate-300 flex items-center justify-between">
                    🎯 Next Scheduled Draw: <span class="text-slate-400 italic">Loading live schedule...</span>
                </div>

                <!-- UPCOMING DRAW & LIVE COUNTDOWN -->
                <div class="glass-panel rounded-2xl p-8 border border-yellow-400/10 text-center space-y-4 bg-gradient-to-br from-yellow-400/10 to-transparent">
                    <h4 class="text-2xl font-bold text-yellow-400">Next Admin Drawing</h4>
                    <p id="next-draw-datetime-display" class="text-3xl font-bold text-white">${nextDraw.date} • ${nextDraw.time}</p>
                    
                    <!-- DYNAMIC COUNTDOWN BADGE -->
                    <div>
                        <span id="customer-live-countdown-badge" class="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 inline-block my-1">
                            ⏳ Calculating Countdown...
                        </span>
                    </div>

                    <p class="text-slate-300 font-medium">Prize Pool: <span class="text-yellow-400">${nextDraw.prizePool || 0} ETB</span></p>
                    
                    <button id="customer-tiktok-btn" onclick="customerDrawings.goToTikTok()" 
                        class="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl transition-all">📱 Watch Live on TikTok</button>
                </div>

                <!-- CHECK IF WON -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white">🏆 Check Your Tickets & Winning Numbers Audit</h4>
                    <p class="text-sm text-slate-300">Select a drawing date and enter your winning number or view recent audited winning numbers below</p>
                    
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

                <!-- PAST DRAWS & AUDITED WINNING NUMBERS -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="font-bold text-white mb-4">📜 Past Admin Drawings & Winning Numbers Audit</h4>
                    <div class="space-y-3">
                        ${pastDraws.length > 0 ? pastDraws.map(draw => `
                            <div class="bg-black/30 rounded-lg p-4 border border-yellow-400/10">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-bold text-white">${draw.date}</p>
                                        <p class="text-sm text-yellow-400">Winning Number Audit Result: #${draw.winningNumber || 'Pending'}</p>
                                        <p class="text-xs text-slate-400 mt-1">${draw.tickets || 0} tickets • ${draw.prizePool || 0} ETB pool</p>
                                    </div>
                                    <span class="text-xs bg-emerald-400/20 text-emerald-400 px-3 py-1 rounded">${draw.status}</span>
                                </div>
                            </div>
                        `).join('') : '<p class="text-slate-400 text-sm">No past drawings audit available.</p>'}
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
        // Remove any active live modals or notifications when the user clicks the link
        document.getElementById('live-draw-modal')?.remove();
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
