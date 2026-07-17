// MAIN ADMIN - RANGES MANAGEMENT
// ============================================

class MainAdminRanges {
    constructor() {
        this.ranges = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">📊 Ticket Ranges</h3>
                <div id="ranges-list" class="space-y-3">${this.renderRangesList()}</div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;
            const snapshot = await db.collection('ticket_ranges').get();
            this.ranges = [];
            snapshot.forEach(doc => {
                this.ranges.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error('Error loading ranges:', error);
        }
    }

    renderRangesList() {
        if (this.ranges.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No ranges configured</p>';
        }

        return this.ranges.map(range => `
            <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                <p class="font-bold text-white">${range.name || 'Range'}</p>
                <p class="text-xs text-slate-400">Numbers: ${range.start} - ${range.end}</p>
                <p class="text-xs text-slate-400">Admin: ${range.adminId || 'N/A'}</p>
            </div>
        `).join('');
    }
}
