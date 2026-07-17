// MAIN ADMIN - AUDIT LOG
// ============================================

class AuditLog {
    constructor() {
        this.logs = [];
    }

    render() {
        return `
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white">🔒 Audit Log</h3>
                <div id="audit-list" class="space-y-2">${this.renderAuditList()}</div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;
            const snapshot = await db.collection('audit_logs').orderBy('createdAt', 'desc').limit(50).get();
            this.logs = [];
            snapshot.forEach(doc => {
                this.logs.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error('Error loading audit logs:', error);
        }
    }

    renderAuditList() {
        if (this.logs.length === 0) {
            return '<p class="text-slate-400 text-center py-6">No audit logs</p>';
        }

        return this.logs.map(log => `
            <div class="glass-panel rounded-lg p-3 border border-yellow-400/10 text-xs">
                <p class="text-white">${log.action || 'Action'}</p>
                <p class="text-slate-400">${log.user || 'Unknown user'} • ${log.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}</p>
            </div>
        `).join('');
    }
}
