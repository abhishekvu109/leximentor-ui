import Layout from "@/components/layout/Layout";
import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Search,
    Filter,
    X,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Loader2,
    History,
    RefreshCcw,
    DollarSign,
    Briefcase,
    FileText,
    Download
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import cashflowService from "../../services/cashflow.service";

const EarningsLogic = () => {
    const { user } = useAuth();
    const [earnings, setEarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLogForm, setShowLogForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form States
    const [formData, setFormData] = useState({
        amount: "",
        depositDate: new Date().toISOString().split('T')[0],
        source: "",
        notes: ""
    });

    const refreshData = useCallback(async () => {
        if (!user?.username) return;
        setLoading(true);
        try {
            // Fetch Earnings (Assuming there's a search endpoint similar to expenses)
            const res = await cashflowService.searchEarnings({
                username: user.username
            });
            if (res?.data) {
                setEarnings(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch earnings:", err);
            // If search endpoint doesn't exist yet, we'll just show empty for now or mock if needed
            // setError("Failed to load earnings history.");
        } finally {
            setLoading(false);
        }
    }, [user?.username]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.username) {
            setError("User session not found.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccess("");

        try {
            const payload = [
                {
                    amount: parseFloat(formData.amount),
                    username: user.username,
                    depositDate: formData.depositDate,
                    source: formData.source,
                    notes: formData.notes
                }
            ];

            const response = await cashflowService.createEarning(payload);

            if (response) {
                setSuccess("Earning logged successfully!");
                setFormData({
                    amount: "",
                    depositDate: new Date().toISOString().split('T')[0],
                    source: "",
                    notes: ""
                });
                setTimeout(() => setShowLogForm(false), 2000);
                refreshData();
            }
        } catch (err) {
            console.error("Failed to log earning:", err);
            setError(err.message || "Failed to submit earning. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-100 dark:shadow-none">
                            <TrendingUp size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Earnings</h1>
                    </div>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Manage and track your income streams</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshData}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-gray-400 hover:text-emerald-500 transition-all shadow-sm"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setShowLogForm(!showLogForm)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95 text-sm"
                    >
                        <Plus size={18} /> Log Income
                    </button>
                </div>
            </div>

            {/* Quick Log Form (Expandable) */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showLogForm ? 'max-h-[1000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 md:p-8 rounded-3xl border border-emerald-100 dark:border-emerald-800 shadow-inner">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-200 dark:shadow-none">
                                <Plus size={18} />
                            </div>
                            <h2 className="text-xl font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-tight">Log New Earning</h2>
                        </div>
                        <button onClick={() => setShowLogForm(false)} className="p-2 text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-rose-100 dark:border-rose-800 mb-6 animate-in slide-in-from-top-2">
                            <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 border border-emerald-200 dark:border-emerald-800 mb-6 animate-in slide-in-from-top-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Source</label>
                            <div className="relative">
                                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                                <input
                                    required
                                    name="source"
                                    value={formData.source}
                                    onChange={handleFormChange}
                                    type="text"
                                    placeholder="e.g. Salary, Freelance"
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Amount</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                                <input
                                    required
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleFormChange}
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Deposit Date</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                                <input
                                    required
                                    name="depositDate"
                                    value={formData.depositDate}
                                    onChange={handleFormChange}
                                    type="date"
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Notes</label>
                            <div className="relative">
                                <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                                <input
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleFormChange}
                                    type="text"
                                    placeholder="Any additional info..."
                                    className="w-full bg-white dark:bg-gray-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-sm dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-4 flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setShowLogForm(false)} className="px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">Cancel</button>
                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="bg-emerald-600 text-white px-10 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                {isSubmitting ? "Logging..." : "Confirm Deposit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Earnings Ledger */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center">
                            <History size={20} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">Earnings Ledger</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Source</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Notes</th>
                                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={40} className="animate-spin text-emerald-500" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Initialising Ledger...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : earnings.length > 0 ? (
                                earnings.map((earning, idx) => (
                                    <tr key={earning.uuid || earning.refId || idx} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-800 dark:text-white">
                                                    {new Date(earning.depositDate).getDate()}
                                                </span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase">
                                                    {new Date(earning.depositDate).toLocaleString('default', { month: 'short' }) + ', ' + new Date(earning.depositDate).getFullYear()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:border-emerald-200 transition-colors shrink-0">
                                                    <Briefcase size={20} />
                                                </div>
                                                <p className="font-bold text-gray-800 dark:text-white">{earning.source}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 max-w-xs truncate">{earning.notes || "No additional notes"}</p>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <div className="flex flex-col items-end">
                                                <p className="text-lg font-black text-emerald-600">+₹{(earning.amount || 0).toLocaleString()}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Processed</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-300 dark:text-gray-600">
                                            <TrendingUp size={64} strokeWidth={1} />
                                            <div className="space-y-1">
                                                <p className="text-lg font-black uppercase tracking-widest">No Earnings Logged</p>
                                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 max-w-xs mx-auto">Track your income by adding your first earning entry today.</p>
                                            </div>
                                            <button
                                                onClick={() => setShowLogForm(true)}
                                                className="mt-4 px-6 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all"
                                            >
                                                Add First Earning
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const EarningsPage = () => {
    return <Layout content={<EarningsLogic />} />;
};

export default EarningsPage;
