// ============================================
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
                <div id="auditlog-list" class="space-y-3">${this.renderAuditList()}</div>
            </div>
        `;
    }

    async loadData() {
        try {
            if (!db) return;

            const snapshot = await db.collection('audit_logs')
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();

            this.logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const listContainer = document.getElementById('auditlog-list');
            if (listContainer) {
                listContainer.innerHTML = this.renderAuditList();
            }
        } catch (error) {
            console.error('Error loading audit logs:', error);
        }
    }

    renderAuditList() {
        if (this.logs.length === 0) {
            return `
                <div class="glass-panel rounded-lg p-6 border border-yellow-400/10 text-center">
                    <p class="text-slate-400">No audit logs yet</p>
                </div>
            `;
        }

        return this.logs.map(log => {
            const timestamp = log.timestamp?.toDate?.() || new Date();
            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-white">${log.action || 'Unknown Action'}</p>
                            <p class="text-xs text-slate-400">Admin: ${log.adminName || 'System'}</p>
                            <p class="text-xs text-slate-400">Details: ${log.details || 'N/A'}</p>
                            <p class="text-xs text-slate-400">Time: ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}</p>
                        </div>
                        <span class="px-2 py-1 bg-blue-400/20 text-blue-400 text-xs rounded">${log.type || 'INFO'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Helper method to log actions
    static async logAction(action, adminName, details = '', type = 'INFO') {
        if (!db) return;

        try {
            await db.collection('audit_logs').add({
                action: action,
                adminName: adminName,
                details: details,
                type: type,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error logging action:', error);
        }
    }
}
