// ============================================
// CUSTOMER LIBRARY (CHILD COMPONENT)
// Parent: CustomerDashboard
// Shows: How to play, Rules, FAQ, Prize info
// ============================================

class CustomerLibrary {
    constructor(custId) {
        this.custId = custId;
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📖 Learn & Play</h3>
                
                <!-- HOW TO PLAY -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="text-xl font-bold text-yellow-400">How to Play</h4>
                    <ol class="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                        <li>Select 1-10 numbers from the grid (1-300)</li>
                        <li>Pay 100 ETB per number</li>
                        <li>Submit payment receipt</li>
                        <li>Admin verifies payment</li>
                        <li>Ticket becomes active</li>
                        <li>Wait for drawing (Every Sunday 8 PM)</li>
                        <li>Check if your numbers won!</li>
                    </ol>
                </div>

                <!-- RULES -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="text-xl font-bold text-yellow-400">🎯 Rules</h4>
                    <ul class="text-sm text-slate-300 space-y-2">
                        <li>✅ Minimum: 1 number, Maximum: 10 numbers per ticket</li>
                        <li>✅ Ticket price: 100 ETB per number</li>
                        <li>✅ Drawing happens: Sunday 8:00 PM</li>
                        <li>✅ Prize pool: 70% of collected tickets</li>
                        <li>✅ Winners announced on TikTok @BoniLottery</li>
                        <li>⚠️ No refunds after payment verification</li>
                        <li>⚠️ Only verified tickets eligible for drawing</li>
                    </ul>
                </div>

                <!-- PAYMENT METHODS -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="text-xl font-bold text-yellow-400">💳 Payment Methods</h4>
                    <div class="space-y-3">
                        <div class="border-l-4 border-yellow-400 pl-4">
                            <p class="font-bold text-white">Telebirr</p>
                            <p class="text-sm text-slate-300">Send to: <span class="text-yellow-400 font-mono">0945792677</span></p>
                            <p class="text-xs text-slate-400">Include ticket ID in payment note</p>
                        </div>
                        <div class="border-l-4 border-blue-400 pl-4">
                            <p class="font-bold text-white">CBE Birr</p>
                            <p class="text-sm text-slate-300">Account: <span class="text-blue-400 font-mono">0945792677</span></p>
                            <p class="text-xs text-slate-400">Transfer via CBE banking app</p>
                        </div>
                    </div>
                </div>

                <!-- PRIZE DISTRIBUTION -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="text-xl font-bold text-yellow-400">🏆 Prize Distribution</h4>
                    <div class="space-y-2 text-sm text-slate-300">
                        <p>Total Ticket Revenue: 100%</p>
                        <div class="flex justify-between text-xs mt-2">
                            <span class="text-emerald-400">✅ Prize Pool: 70%</span>
                            <span class="text-yellow-400">💼 Operation: 30%</span>
                        </div>
                        <div class="mt-4 bg-black/30 p-3 rounded">
                            <p class="font-bold text-yellow-400 mb-2">Example:</p>
                            <p>50 players × 3 numbers × 100 ETB = 15,000 ETB total</p>
                            <p class="text-emerald-400 mt-1">Prize pool: 10,500 ETB distributed to winners</p>
                        </div>
                    </div>
                </div>

                <!-- FAQ -->
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <h4 class="text-xl font-bold text-yellow-400">❓ FAQ</h4>
                    <div class="space-y-3 text-sm">
                        <div>
                            <p class="font-bold text-white">Q: Can I buy multiple tickets?</p>
                            <p class="text-slate-300">A: Yes! You can buy as many tickets as you want.</p>
                        </div>
                        <div>
                            <p class="font-bold text-white">Q: When is the drawing?</p>
                            <p class="text-slate-300">A: Every Sunday at 8:00 PM. Watch live on TikTok @BoniLottery</p>
                        </div>
                        <div>
                            <p class="font-bold text-white">Q: How do I know if I won?</p>
                            <p class="text-slate-300">A: You'll get notified via SMS, email, and Telegram. Check your account.</p>
                        </div>
                        <div>
                            <p class="font-bold text-white">Q: What if I forgot my password?</p>
                            <p class="text-slate-300">A: Contact support or click "Forgot Password" on login page.</p>
                        </div>
                        <div>
                            <p class="font-bold text-white">Q: Can I get refund?</p>
                            <p class="text-slate-300">A: No refunds after payment is verified. Verify carefully!</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
