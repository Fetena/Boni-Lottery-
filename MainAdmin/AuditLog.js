// ============================================
// MAIN ADMIN - AUDIT LOG (UPDATED)
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

            // Fallback to avoid breaking if index is still building in Firestore
            let snapshot;
            try {
                snapshot = await db.collection('audit_logs')
                    .orderBy('timestamp', 'desc')
                    .limit(50)
                    .get();
            } catch (indexError) {
                console.warn('Index missing for timestamp desc, fetching unordered:', indexError);
                snapshot = await db.collection('audit_logs').limit(50).get();
            }

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
            const listContainer = document.getElementById('auditlog-list');
            if (listContainer) {
                listContainer.innerHTML = `<div class="glass-panel rounded-lg p-6 border border-red-500/20 text-center text-red-400 text-xs">Error loading audit logs: ${error.message}</div>`;
            }
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
            const timestamp = log.timestamp?.toDate?.() || new Date(log.timestamp) || new Date();
            return `
                <div class="glass-panel rounded-lg p-4 border border-yellow-400/10 text-xs space-y-1">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-white text-sm">${log.action || 'Unknown Action'}</p>
                            <p class="text-slate-300">Admin: <span class="text-yellow-400">${log.adminName || 'System'}</span></p>
                            <p class="text-slate-300">Details: <span class="text-slate-200">${log.details || 'N/A'}</span></p>
                            <p class="text-slate-400 pt-0.5">Time: ${timestamp.toLocaleString()}</p>
                        </div>
                        <span class="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold rounded">${log.type || 'INFO'}</span>
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
                adminName: adminName || currentUser?.email || 'Main Admin',
                details: details,
                type: type,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error logging action:', error);
        }
    }
}
