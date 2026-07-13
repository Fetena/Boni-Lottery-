// ============================================
// CUSTOMER NUMBER GRID (CHILD COMPONENT)
// Parent: CustomerDashboard
// ✅ PERSISTS: Numbers survive refresh
// ============================================

class CustomerNumberGrid {
    constructor(custId) {
        this.custId = custId;
        this.selectedNumbers = db.getSelectedNumbers(custId);
        this.ticketPrice = 100;
    }

    render() {
        let html = `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">🎫 Buy Ticket</h3>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                    <p class="text-sm text-slate-300">Click numbers to select (max 10):</p>
                    <div id="numbers-grid" class="grid grid-cols-10 gap-2 max-h-64 overflow-y-auto p-4 bg-black/30 rounded-xl">
        `;

        for (let i = 1; i <= 300; i++) {
            const isSelected = this.selectedNumbers.includes(i);
            const btnClass = isSelected 
                ? 'w-8 h-8 bg-yellow-400 text-black text-xs font-bold rounded'
                : 'w-8 h-8 bg-slate-700 text-white text-xs rounded hover:bg-slate-600';
            
            html += `<button type="button" class="${btnClass}" onclick="customerNumberGrid.toggleNumber(${i})">${i}</button>`;
        }

        html += `
                    </div>
                    <div class="bg-black/30 p-4 rounded-xl border border-yellow-400/10">
                        <p class="text-yellow-400 font-bold text-lg">Selected: <span id="selected-count">${this.selectedNumbers.length}</span> × 100 = <span id="ticket-cost">${this.selectedNumbers.length * 100}</span> ETB</p>
                    </div>
                    <button onclick="customerNumberGrid.submitTicket()" class="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl">Submit Ticket</button>
                </div>
            </div>
        `;

        return html;
    }

    toggleNumber(num) {
        if (this.selectedNumbers.includes(num)) {
            this.selectedNumbers = this.selectedNumbers.filter(n => n !== num);
        } else {
            if (this.selectedNumbers.length < 10) {
                this.selectedNumbers.push(num);
            } else {
                db.addNotification('error', '❌ Max 10 numbers allowed');
                return;
            }
        }
        
        // SAVE to storage ← KEY: Persists across page navigation
        db.setSelectedNumbers(this.custId, this.selectedNumbers);
        this.updateCostDisplay();
        this.rerenderGrid();
    }

    updateCostDisplay() {
        const count = this.selectedNumbers.length;
        const cost = count * this.ticketPrice;
        
        if (document.getElementById('selected-count')) {
            document.getElementById('selected-count').textContent = count;
        }
        if (document.getElementById('ticket-cost')) {
            document.getElementById('ticket-cost').textContent = cost;
        }
    }

    rerenderGrid() {
        const container = document.getElementById('numbers-grid');
        if (!container) return;

        let html = '';
        for (let i = 1; i <= 300; i++) {
            const isSelected = this.selectedNumbers.includes(i);
            const btnClass = isSelected 
                ? 'w-8 h-8 bg-yellow-400 text-black text-xs font-bold rounded'
                : 'w-8 h-8 bg-slate-700 text-white text-xs rounded hover:bg-slate-600';
            
            html += `<button type="button" class="${btnClass}" onclick="customerNumberGrid.toggleNumber(${i})">${i}</button>`;
        }
        container.innerHTML = html;
    }

    submitTicket() {
        if (this.selectedNumbers.length === 0) {
            db.addNotification('error', '❌ Select at least 1 number');
            return;
        }
        
        const ticket = db.addTicket(this.custId, { numbers: this.selectedNumbers });
        if (ticket) {
            this.selectedNumbers = [];
            db.setSelectedNumbers(this.custId, []);
            this.updateCostDisplay();
            this.rerenderGrid();
            showNotification('success', `✅ Ticket submitted: ${this.selectedNumbers.length} numbers`);
        }
    }
}

// Global instance
let customerNumberGrid;
