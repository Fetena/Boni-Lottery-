// MAIN ADMIN ANALYTICS (CHILD)
class MainAdminAnalytics {
    constructor() {}
    render() {
        return `<div class="space-y-4">
            <h3 class="text-2xl font-bold text-white">📊 Platform Analytics</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                    <p class="text-xs text-slate-400">Total Revenue</p>
                    <p class="text-3xl font-bold text-purple-400 mt-2">7,500 ETB</p>
                </div>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                    <p class="text-xs text-slate-400">Total Tickets</p>
                    <p class="text-3xl font-bold text-blue-400 mt-2">75</p>
                </div>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                    <p class="text-xs text-slate-400">Total Customers</p>
                    <p class="text-3xl font-bold text-emerald-400 mt-2">24</p>
                </div>
                <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10">
                    <p class="text-xs text-slate-400">Active Admins</p>
                    <p class="text-3xl font-bold text-yellow-400 mt-2">3</p>
                </div>
            </div>
            <div class="glass-panel rounded-2xl p-6 border border-yellow-400/10 space-y-4">
                <h4 class="font-bold text-white">Revenue by Branch</h4>
                <div class="space-y-3">
                    <div><p class="text-sm text-slate-300">Admin 1</p><div class="w-full bg-black/40 rounded-full h-2"><div class="bg-purple-400 h-2 rounded-full" style="width: 45%"></div></div></div>
                    <div><p class="text-sm text-slate-300">Admin 2</p><div class="w-full bg-black/40 rounded-full h-2"><div class="bg-blue-400 h-2 rounded-full" style="width: 35%"></div></div></div>
                    <div><p class="text-sm text-slate-300">Admin 3</p><div class="w-full bg-black/40 rounded-full h-2"><div class="bg-emerald-400 h-2 rounded-full" style="width: 20%"></div></div></div>
                </div>
            </div>
        </div>`;
    }
}
let mainAdminAnalytics;
