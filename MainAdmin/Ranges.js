// MAIN ADMIN RANGES (CHILD)
class MainAdminRanges {
    constructor() {}
    render() {
        return `<div class="space-y-4">
            <h3 class="text-2xl font-bold text-white">📊 Ticket Ranges</h3>
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                <h4 class="font-bold text-white">Set Number Ranges</h4>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="text-sm text-slate-400">Admin</label>
                        <select id="range-admin" class="w-full mt-1 bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                            <option>Admin 1</option>
                            <option>Admin 2</option>
                            <option>Admin 3</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-sm text-slate-400">Start Number</label>
                        <input type="number" id="range-start" value="1" class="w-full mt-1 bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                    </div>
                    <div>
                        <label class="text-sm text-slate-400">End Number</label>
                        <input type="number" id="range-end" value="300" class="w-full mt-1 bg-black/40 border border-yellow-400/20 rounded-xl py-2 px-4 text-sm text-white outline-none">
                    </div>
                </div>
                <button onclick="mainAdminRanges.setRange()" class="w-full py-2 bg-yellow-400 text-black font-bold rounded-xl">Set Range</button>
            </div>
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                <h4 class="font-bold text-white mb-4">Current Ranges</h4>
                <div class="space-y-2">
                    <div class="bg-black/30 rounded-lg p-4 border border-yellow-400/10">
                        <p class="font-bold text-white">Admin 1: 1-100 (100 numbers)</p>
                        <p class="text-xs text-slate-400">Used: 45/100</p>
                    </div>
                </div>
            </div>
        </div>`;
    }
    setRange() { showNotification('success', '✅ Range set successfully'); }
}
let mainAdminRanges;
